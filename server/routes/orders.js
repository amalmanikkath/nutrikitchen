const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { generateInvoicePDF } = require('../services/invoiceGenerator');

const router = express.Router();
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = String(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create Razorpay Order
router.post('/create', authenticate, async (req, res) => {
  try {
    const { amount, items, shippingDetails } = req.body;
    
    // 1. Create Order in Razorpay
    let rpOrder;
    try {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay keys are not configured on the server');
      }

      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      };

      rpOrder = await razorpay.orders.create(options);
    } catch (rpError) {
      console.error('Razorpay Error:', rpError);
      return res.status(500).json({
        message: 'Error creating Razorpay order',
        error: rpError.message || rpError
      });
    }
    
    // 2. Save order in DB as PENDING
    try {
      const dbOrder = await prisma.order.create({
        data: {
          userId: String(req.userId),
          razorpayOrderId: rpOrder.id,
          totalAmount: amount,
          status: 'PENDING',
          customerName: shippingDetails?.fullName,
          customerEmail: shippingDetails?.email,
          customerPhone: shippingDetails?.phone,
          shippingAddress: shippingDetails?.address,
          city: shippingDetails?.city,
          state: shippingDetails?.state,
          pincode: shippingDetails?.pincode,
          orderItems: {
            create: items.map(item => ({
              productId: String(item.id),
              productName: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      res.json({ orderId: rpOrder.id, amount: rpOrder.amount, currency: rpOrder.currency });
    } catch (dbError) {
      console.error('Database Error (Order Creation):', dbError);
      res.status(500).json({
        message: 'Order created with payment gateway but failed to save in database',
        error: dbError.message || dbError
      });
    }
  } catch (error) {
    console.error('General Order Creation Error:', error);
    res.status(500).json({ message: 'Internal server error during checkout', error: error.message || error });
  }
});

// Verify Payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");
      
    if (razorpay_signature === expectedSign) {
      // Payment verified
      const order = await prisma.order.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          status: 'PAID',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        }
      });

      // Clear the user's persistent cart in the database
      await prisma.cartItem.deleteMany({
        where: { userId: order.userId }
      });

      // Fetch full order data with user details for email
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          user: true,
          orderItems: true
        }
      });

      // 3. Generate PDF Invoice First (in memory for Vercel compatibility)
      let pdfBuffer = null;
      try {
        console.log(`[PROCESS] Generating PDF Invoice for order #${fullOrder.id}...`);
        console.log(`[PROCESS] Order data:`, JSON.stringify({
          id: fullOrder.id,
          customerName: fullOrder.customerName,
          totalAmount: fullOrder.totalAmount,
          itemsCount: fullOrder.orderItems?.length
        }));
        
        pdfBuffer = await generateInvoicePDF(fullOrder);
        
        if (pdfBuffer && pdfBuffer.length > 0) {
          console.log(`✅ PDF Invoice generated successfully in memory`);
          console.log(`✅ PDF buffer size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
        } else {
          console.error('❌ PDF buffer is empty or invalid');
          pdfBuffer = null;
        }
      } catch (pdfError) {
        console.error('❌ PDF Generation FAILED:', pdfError);
        console.error('PDF Error Stack:', pdfError.stack);
        pdfBuffer = null;
      }

      // 4. Send Confirmation Email to Customer
      if (fullOrder && (fullOrder.customerEmail || (fullOrder.user && fullOrder.user.email))) {
        const customerEmail = fullOrder.customerEmail || fullOrder.user.email;
        console.log(`[EMAIL] Preparing customer confirmation email to: ${customerEmail}`);
        
        const mailOptions = {
          from: `"Nutri Kitchen" <${process.env.EMAIL_USER}>`,
          to: customerEmail,
          subject: `Tax Invoice - #${fullOrder.razorpayOrderId}`,
          attachments: [
            {
              filename: 'logo.png',
              path: path.join(__dirname, '../../images/nutrikitchenLogo.png'),
              cid: 'nutrilogo' 
            }
          ],
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 30px; color: #333;">
              <div style="margin-bottom: 25px; border-bottom: 2px solid #4CAF50; padding-bottom: 15px;">
                <div style="text-align: left; margin-bottom: 15px;">
                  <img src="cid:nutrilogo" alt="Nutri Kitchen" style="max-height: 100px; display: block; margin-left: -5px;">
                </div>
                <div style="text-align: left; margin-top: 20px;">
                  <h2 style="color: #4CAF50; margin: 0; font-size: 20px;">TAX INVOICE / BILL OF SUPPLY</h2>
                  <p style="margin: 5px 0;"><strong>Invoice No:</strong> NUT${String(fullOrder.id).padStart(4, '0')}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(fullOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px;">
                <div style="flex: 1; min-width: 250px; background: #f9f9f9; padding: 15px; border-radius: 5px;">
                  <h4 style="margin-top: 0; color: #4CAF50; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Sold By (From):</h4>
                  <p style="margin: 5px 0;"><strong>SMS AGRO</strong></p>
                  <p style="margin: 5px 0;">GSTIN: 32AFKFS2051L1ZX</p>
                  <p style="margin: 5px 0;">Parakulam, P O, Kunissery,</p>
                  <p style="margin: 5px 0;">Palakkad, Kerala - 678681</p>
                </div>
                <div style="flex: 1; min-width: 250px; background: #f9f9f9; padding: 15px; border-radius: 5px;">
                  <h4 style="margin-top: 0; color: #4CAF50; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Billed To (To):</h4>
                  <p style="margin: 5px 0;"><strong>${fullOrder.customerName || fullOrder.user?.name || ''}</strong></p>
                  <p style="margin: 5px 0;">${fullOrder.customerPhone || fullOrder.user?.phone || ''}</p>
                  <p style="margin: 5px 0;">${fullOrder.shippingAddress || ''}</p>
                  <p style="margin: 5px 0;">${fullOrder.city || ''}, ${fullOrder.state || ''} - ${fullOrder.pincode || ''}</p>
                </div>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="background-color: #4CAF50; color: white;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #44a048;">Description</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #44a048;">Qty</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #44a048;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #44a048;">GST (5%)</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #44a048;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${fullOrder.orderItems.map(item => {
                    const basePrice = item.price / 1.05; 
                    const gstAmount = item.price - basePrice;
                    return `
                      <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${item.productName}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${basePrice.toFixed(2)}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${(gstAmount * item.quantity).toFixed(2)}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₹${(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr style="background: #f2f2f2; font-weight: bold;">
                    <td colspan="4" style="padding: 12px; text-align: right; border: 1px solid #ddd;">Grand Total:</td>
                    <td style="padding: 12px; text-align: right; border: 1px solid #ddd; color: #4CAF50; font-size: 18px;">₹${fullOrder.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <div style="background: #fff8e1; border-left: 5px solid #ffc107; padding: 15px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px;"><strong>Note:</strong> This is a computer-generated invoice and does not require a signature. The amount is inclusive of GST where applicable.</p>
              </div>

              <div style="text-align: center; color: #888; font-size: 12px;">
                <p>Thank you for choosing Nutri Kitchen!</p>
                <p>Visit us at <a href="https://nutrikitchen.in" style="color: #4CAF50; text-decoration: none;">www.nutrikitchen.in</a></p>
              </div>
            </div>
          `
        };

        // Attach PDF to email if it was successfully generated
        if (pdfBuffer && pdfBuffer.length > 0) {
          console.log(`[EMAIL] Attaching PDF invoice from memory buffer`);
          try {
            console.log(`[EMAIL] PDF buffer verified - Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
            
            mailOptions.attachments.push({
              filename: `Invoice_NUT${String(fullOrder.id).padStart(4, '0')}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            });
            console.log(`[EMAIL] PDF attachment added to email`);
          } catch (attachError) {
            console.error(`[EMAIL] Error attaching PDF:`, attachError);
          }
        } else {
          console.warn(`[EMAIL] No PDF to attach - PDF generation may have failed or buffer is empty`);
        }

        try {
          console.log(`[EMAIL] Sending customer confirmation email with ${mailOptions.attachments.length} attachments...`);
          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Confirmation email sent to ${customerEmail}: ${info.messageId}`);
          console.log(`✅ Email accepted by: ${info.accepted?.join(', ')}`);
        } catch (emailError) {
          console.error('❌ Error sending confirmation email:', emailError);
          console.error('Email Error Details:', emailError.message);
          console.error('Email Error Stack:', emailError.stack);
          if (emailError.response) {
            console.error('Email Server Response:', emailError.response);
          }
        }
      } else {
        console.warn(`[EMAIL] No customer email found for order #${fullOrder.id}`);
      }

      // 5. Send Admin Notification Email
      const adminMailOptions = {
        from: `"Nutri Kitchen Orders" <${process.env.EMAIL_USER}>`,
        to: 'info@nutrikitchen.in',
        subject: `NEW ORDER ALERT: #${fullOrder.razorpayOrderId} - ₹${fullOrder.totalAmount}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #4CAF50; text-align: center;">New Order Received!</h2>
            <p>You have received a new order on Nutri Kitchen.</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Customer Details</h3>
              <p><strong>Name:</strong> ${fullOrder.customerName || fullOrder.user.name}</p>
              <p><strong>Email:</strong> ${fullOrder.customerEmail || fullOrder.user.email}</p>
              <p><strong>Phone:</strong> ${fullOrder.customerPhone || fullOrder.user.phone}</p>
            </div>

            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Shipping Address</h3>
              <p>${fullOrder.shippingAddress}</p>
              <p>${fullOrder.city}, ${fullOrder.state} - ${fullOrder.pincode}</p>
            </div>

            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Summary</h3>
              <p><strong>Invoice No:</strong> NUT${String(fullOrder.id).padStart(4, '0')}</p>
              <p><strong>Order ID:</strong> ${fullOrder.razorpayOrderId}</p>
              <p><strong>Payment ID:</strong> ${fullOrder.razorpayPaymentId}</p>
              <p><strong>Total Amount:</strong> ₹${fullOrder.totalAmount}</p>
            </div>

            <h3>Items Ordered:</h3>
            <ul style="list-style: none; padding: 0;">
              ${fullOrder.orderItems.map(item => `<li>${item.productName} - ${item.quantity} x ₹${item.price}</li>`).join('')}
            </ul>

            <div style="margin-top: 30px; text-align: center;">
              <a href="https://nutrikitchen.in/admin/orders.html?view=order&id=${fullOrder.id}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Manage Order in Dashboard</a>
            </div>

            <p style="font-size: 11px; color: #999; margin-top: 40px; text-align: center;">
              This is an automated operational notification. Please do not reply to this email.
            </p>
          </div>
        `
      };

      try {
        console.log(`[MAIL] Dispatching Admin Alert for Order #${fullOrder.id} to info@nutrikitchen.in...`);
        const info = await transporter.sendMail(adminMailOptions);
        console.log(`✅ Admin alert DISPATCHED. ID: ${info.messageId}`);
      } catch (adminEmailError) {
        console.error('❌ Admin Alert FAILED:', adminEmailError);
        console.error('Admin Email Error Details:', adminEmailError.message);
        console.error('Admin Email Error Stack:', adminEmailError.stack);
      }

      return res.json({ message: "Verification complete. Notifications sent." });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get User's Past Orders
router.get('/past-orders', authenticate, async (req, res) => {
  try {
    console.log(`[ORDERS] Fetching past orders for user: ${req.userId}`);
    
    const orders = await prisma.order.findMany({
      where: { 
        userId: String(req.userId), 
        status: 'PAID' 
      },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`[ORDERS] Found ${orders.length} orders for user ${req.userId}`);
    res.json(orders);
  } catch (error) {
    console.error('[ORDERS] Error fetching past orders:', error);
    res.status(500).json({ message: 'Error fetching past orders', error: error.message });
  }
});

module.exports = router;
