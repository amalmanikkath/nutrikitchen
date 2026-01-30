const PDFDocument = require('pdfkit');

/**
 * Generates a shipping label PDF (Half A4 size - 210mm x 148.5mm)
 * From Address: Top Left
 * To Address: Bottom Right
 * @param {Object} order - Order object with shipping details
 * @returns {Promise<Buffer>} - PDF as a Buffer
 */
async function generateShippingLabel(order) {
    return new Promise((resolve, reject) => {
        try {
            // Half A4 size in points (1mm = 2.83465 points)
            // A4 = 210mm x 297mm, Half = 210mm x 148.5mm
            const doc = new PDFDocument({ 
                size: [595.28, 421.89], // 210mm x 148.5mm in points
                margin: 0
            });
            
            // Store PDF in memory
            const chunks = [];
            
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                console.log(`✅ Shipping label generated in memory, size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
                resolve(pdfBuffer);
            });
            doc.on('error', (err) => {
                console.error('❌ Shipping label generation error:', err);
                reject(err);
            });

            const primaryColor = '#2b6555';
            const borderColor = '#cccccc';

            // Add border around the entire label
            doc.rect(10, 10, 575.28, 401.89)
               .lineWidth(2)
               .stroke(borderColor);

            // FROM ADDRESS - Top Left
            doc.rect(20, 20, 270, 150)
               .lineWidth(1)
               .stroke(borderColor);

            doc.fillColor(primaryColor)
               .fontSize(12)
               .font('Helvetica-Bold')
               .text('FROM:', 30, 30);

            doc.fillColor('#000000')
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('SMS AGRO', 30, 50);

            doc.fontSize(11)
               .font('Helvetica')
               .text('8/639, Parakulam, P O', 30, 72)
               .text('Kunissery', 30, 88)
               .text('Palakkad, Kerala - 678681', 30, 104);

            doc.fontSize(10)
               .text('Phone: +91 7760268422', 30, 130)
               .text('Email: info@nutrikitchen.in', 30, 145);

            // TO ADDRESS - Bottom Right
            doc.rect(305, 251.89, 270, 150)
               .lineWidth(1)
               .stroke(borderColor);

            doc.fillColor(primaryColor)
               .fontSize(12)
               .font('Helvetica-Bold')
               .text('TO:', 315, 261.89);

            doc.fillColor('#000000')
               .fontSize(14)
               .font('Helvetica-Bold')
               .text(order.customerName || order.user?.name || 'Customer', 315, 281.89, { width: 250 });

            doc.fontSize(11)
               .font('Helvetica')
               .text(order.shippingAddress || '', 315, 303.89, { width: 250 });

            const cityStatePin = `${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}`;
            doc.text(cityStatePin, 315, 335.89, { width: 250 });

            doc.fontSize(10)
               .font('Helvetica-Bold')
               .text(`Phone: ${order.customerPhone || order.user?.phone || 'N/A'}`, 315, 365.89);

            if (order.customerEmail || order.user?.email) {
                doc.fontSize(9)
                   .font('Helvetica')
                   .text(`Email: ${order.customerEmail || order.user?.email}`, 315, 382.89, { width: 250 });
            }

            // Order Information - Center
            doc.rect(20, 190, 555.28, 50)
               .lineWidth(1)
               .stroke(borderColor);

            doc.fillColor(primaryColor)
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('ORDER DETAILS', 30, 200);

            doc.fillColor('#000000')
               .fontSize(10)
               .font('Helvetica')
               .text(`Order ID: ${order.razorpayOrderId || order.id}`, 30, 218)
               .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 200, 218)
               .text(`Amount: ₹${order.totalAmount.toFixed(2)}`, 380, 218);

            // Barcode/QR placeholder area (optional)
            doc.fontSize(8)
               .fillColor('#999999')
               .text('Nutri Kitchen - Natural Health Products', 30, 405, { align: 'center', width: 535.28 });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { generateShippingLabel };
