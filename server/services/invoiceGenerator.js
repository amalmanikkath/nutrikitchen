const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates an ultra-professional, branded Tax Invoice PDF for an order
 * @param {Object} order - Full order object from Prisma
 * @returns {Promise<string>} - Path to the generated PDF
 */
async function generateInvoicePDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ 
                margin: 0, // Set to 0 to handle custom margins/accents
                size: 'A4',
                bufferPages: true 
            });
            const fileName = `Invoice_${order.id}_${Date.now()}.pdf`;
            const filePath = path.join(__dirname, '../temp', fileName);
            
            if (!fs.existsSync(path.join(__dirname, '../temp'))) {
                fs.mkdirSync(path.join(__dirname, '../temp'));
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // --- PREMIUM BRANDING ELEMENTS ---
            const primaryColor = '#2b6555'; // Nutri Kitchen Green
            const secondaryColor = '#f9f2ea'; // Cream Background
            const textColor = '#333333';
            const lightTextColor = '#666666';

            // 1. Left Side Accent Bar (Full Height)
            doc.rect(0, 0, 30, 841.89).fill(primaryColor);

            // 2. Header Background Box
            doc.rect(30, 0, 565.27, 120).fill(secondaryColor);

            // --- HEADER CONTENT ---
            const logoPath = path.join(__dirname, '../../images/nutrikitchenLogo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 20, { height: 80 });
            }

            doc.fillColor(primaryColor)
               .fontSize(28)
               .font('Helvetica-Bold')
               .text('TAX INVOICE', 300, 40, { align: 'right', width: 250 });

            doc.fillColor(lightTextColor)
               .fontSize(9)
               .font('Helvetica')
               .text(`Date of Issue: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 300, 75, { align: 'right', width: 250 })
               .text(`Invoice Number: INV-${order.id}`, 300, 90, { align: 'right', width: 250 });

            // --- INFORMATION GRID ---
            const infoY = 150;
            
            // From Section (Seller)
            doc.fillColor(primaryColor)
               .fontSize(11)
               .font('Helvetica-Bold')
               .text('INVOICE FROM', 60, infoY);
            
            doc.fillColor(textColor)
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('SMS AGRO', 60, infoY + 20);
            
            doc.font('Helvetica')
               .fillColor(lightTextColor)
               .text('GSTIN: 32AFKFS2051L1ZX', 60, infoY + 35)
               .text('Parakulam, P O, Kunissery', 60, infoY + 50)
               .text('Palakkad, Kerala - 678681', 60, infoY + 65);

            // To Section (Buyer)
            doc.fillColor(primaryColor)
               .font('Helvetica-Bold')
               .text('INVOICE TO', 320, infoY);
            
            doc.fillColor(textColor)
               .font('Helvetica-Bold')
               .text(order.customerName || order.user.name, 320, infoY + 20);
            
            doc.font('Helvetica')
               .fillColor(lightTextColor)
               .text(`Phone: ${order.customerPhone || order.user.phone || 'N/A'}`, 320, infoY + 35)
               .text(order.shippingAddress || '', 320, infoY + 50, { width: 230 })
               .text(`${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}`, 320, doc.y);

            // --- TRANSACTION DETAILS ---
            const transY = infoY + 110;
            doc.rect(60, transY, 500, 1).fill('#eeeeee');
            
            doc.fillColor(lightTextColor).fontSize(9).font('Helvetica');
            doc.text('Order ID:', 60, transY + 15);
            doc.fillColor(textColor).font('Helvetica-Bold').text(order.razorpayOrderId || 'N/A', 110, transY + 15);
            
            doc.fillColor(lightTextColor).font('Helvetica').text('Payment ID:', 320, transY + 15);
            doc.fillColor(textColor).font('Helvetica-Bold').text(order.razorpayPaymentId || 'N/A', 380, transY + 15);

            // --- TABLE SECTION ---
            const tableTop = transY + 50;
            
            // Table Header
            doc.rect(60, tableTop, 500, 30).fill(primaryColor);
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
            
            doc.text('DESCRIPTION', 70, tableTop + 10);
            doc.text('QTY', 280, tableTop + 10, { width: 40, align: 'center' });
            doc.text('UNIT PRICE', 330, tableTop + 10, { width: 70, align: 'right' });
            doc.text('GST (5%)', 410, tableTop + 10, { width: 60, align: 'right' });
            doc.text('TOTAL', 480, tableTop + 10, { width: 70, align: 'right' });

            // Table Rows
            let itemY = tableTop + 40;
            doc.font('Helvetica').fontSize(9);

            order.orderItems.forEach((item, index) => {
                const basePrice = item.price / 1.05;
                const gstAmountPerItem = item.price - basePrice;
                const totalGST = gstAmountPerItem * item.quantity;
                const totalItemAmount = item.price * item.quantity;

                // Row background
                if (index % 2 === 1) {
                    doc.rect(60, itemY - 5, 500, 25).fill('#fbfbfb');
                }
                
                doc.fillColor(textColor);
                doc.text(item.productName, 70, itemY, { width: 200 });
                doc.text(item.quantity.toString(), 280, itemY, { width: 40, align: 'center' });
                doc.text(`Rs. ${basePrice.toFixed(2)}`, 330, itemY, { width: 70, align: 'right' });
                doc.text(`Rs. ${totalGST.toFixed(2)}`, 410, itemY, { width: 60, align: 'right' });
                doc.text(`Rs. ${totalItemAmount.toFixed(2)}`, 480, itemY, { width: 70, align: 'right' });

                itemY += 25;
                
                // Row line
                doc.rect(60, itemY - 5, 500, 0.5).fill('#eeeeee');
            });

            // --- TOTALS AREA ---
            const totalsY = itemY + 20;

            // Totals labels
            doc.fillColor(lightTextColor).fontSize(10);
            doc.text('Subtotal', 350, totalsY);
            doc.text('GST (5%)', 350, totalsY + 20);

            // Totals values
            doc.fillColor(textColor).font('Helvetica-Bold');
            doc.text(`Rs. ${(order.totalAmount / 1.05).toFixed(2)}`, 470, totalsY, { width: 80, align: 'right' });
            doc.text(`Rs. ${(order.totalAmount - (order.totalAmount / 1.05)).toFixed(2)}`, 470, totalsY + 20, { width: 80, align: 'right' });

            // Grand Total Highlight
            doc.rect(340, totalsY + 45, 230, 40).fill(primaryColor);
            doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold');
            doc.text('GRAND TOTAL', 350, totalsY + 58);
            doc.text(`Rs. ${order.totalAmount.toFixed(2)}`, 460, totalsY + 58, { width: 100, align: 'right' });

            // --- LEGAL & FOOTER ---
            const footerY = 680;
            
            // Signatory area
            doc.rect(380, footerY + 40, 160, 0.5).fill(textColor);
            doc.fillColor(textColor).fontSize(9).font('Helvetica').text('Authorised Signatory', 380, footerY + 45, { align: 'center', width: 160 });

            // Terms
            doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('Terms & Conditions', 60, footerY);
            doc.fillColor(lightTextColor).fontSize(8.5).font('Helvetica')
               .text('1. This is a computer-generated invoice, signature not required.', 60, footerY + 15)
               .text('2. All disputes are subject to Palakkad jurisdiction.', 60, footerY + 30)
               .text('3. Goods once sold cannot be returned or exchanged.', 60, footerY + 45);

            // Bottom Ribbon
            doc.rect(30, 780, 565.27, 61.89).fill(secondaryColor);
            doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Thank you for your business!', 60, 800, { align: 'center', width: 500 });
            doc.fillColor(lightTextColor).fontSize(9).font('Helvetica').text('www.nutrikitchen.in', 60, 815, { align: 'center', width: 500, link: 'https://nutrikitchen.in' });

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { generateInvoicePDF };
