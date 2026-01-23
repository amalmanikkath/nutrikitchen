const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { PRODUCTS: ALL_PRODUCTS } = require('../js/data.js');

// Configuration
const OUTPUT_FILE = 'NutriKitchen_Product_Catalogue.pdf';
const IMAGES_DIR = path.join(__dirname, '..', 'images');

// Specified MRPs from user
const USER_PRICES = {
    'Health Mix': 299,
    'Baby Mix': 289,
    'Protein Mix': 295,
    'Vanilla Health Mix': 379,
    'Chocolate Health Mix': 389
};

// Filter and prepare products
// 1. Include only products specified in USER_PRICES (this naturally excludes Jaggery)
// 2. Use those specific MRPs
// 3. Calculate Selling Price (30% off MRP)
const PRODUCTS = ALL_PRODUCTS
    .filter(p => USER_PRICES[p.name])
    .map(p => {
        const mrp = USER_PRICES[p.name];
        return {
            name: p.name.toUpperCase(),
            image: path.basename(p.image),
            qty: p.name === 'Baby Mix' ? '250gm' : p.weight, // Use user specified 250gm for Baby Mix
            description: p.description,
            features: p.features,
            mrp: mrp,
            sellingPrice: Math.round(mrp * 0.7)
        };
    });

// Sort to ensure a consistent order (optional, but good for quality)
PRODUCTS.sort((a, b) => {
    const order = ['HEALTH MIX', 'BABY MIX', 'PROTEIN MIX', 'VANILLA HEALTH MIX', 'CHOCOLATE HEALTH MIX'];
    return order.indexOf(a.name) - order.indexOf(b.name);
});

function createPDF() {
    console.log('Starting PDF generation for', PRODUCTS.length, 'products...');
    
    const doc = new PDFDocument({ 
        margin: 40, 
        size: 'A4', 
        autoFirstPage: false,
        bufferPages: true 
    });
    const stream = fs.createWriteStream(OUTPUT_FILE);
    doc.pipe(stream);

    PRODUCTS.forEach((product) => {
        doc.addPage();

        // Logo and Header - Left Top Corner
        const logoPath = path.join(IMAGES_DIR, 'nutrikitchenLogo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, 20, { width: 60 });
        }

        doc.y = 45; 
        doc.fillColor('#2d5a27')
           .fontSize(22)
           .text(product.name, { align: 'center' });
        doc.moveDown(1);

        // Product Image (Centered)
        const imagePath = path.join(IMAGES_DIR, product.image);
        if (fs.existsSync(imagePath)) {
            try {
                doc.image(imagePath, 85, 100, { 
                    fit: [425, 280],
                    align: 'center',
                    valign: 'center'
                });
            } catch (err) {
                console.error(`Error loading image ${product.image}:`, err.message);
                doc.fillColor('red').fontSize(12).text('Image Error', { align: 'center' });
            }
        }
        
        doc.y = 400;

        // Qty / Weight
        doc.fontSize(13)
           .fillColor('#777777')
           .text(`Net Weight: ${product.qty}`, { align: 'center' })
           .moveDown(0.3);

        // Pricing Info
        // MRP as provided, Selling Price = MRP - 30% + (including GST)
        doc.fontSize(14)
           .fillColor('#333333')
           .text(`MRP: ₹${product.mrp}    Selling Price: ₹${product.sellingPrice} (including GST)`, { align: 'center' })
           .moveDown(0.5);

        doc.moveDown(0.5);

        // Description Section
        doc.rect(50, doc.y, 495, 1).fill('#dddddd');
        doc.moveDown(0.8);

        doc.fillColor('#333333')
           .fontSize(13)
           .text('Product Description', { underline: false })
           .moveDown(0.4);
        
        doc.fillColor('#555555')
           .fontSize(10.5)
           .text(product.description, { align: 'left', lineGap: 1 });

        doc.moveDown(1);

        // Features Section
        doc.fillColor('#333333')
           .fontSize(13)
           .text('Key Features', { underline: false })
           .moveDown(0.4);

        if (product.features && product.features.length > 0) {
            product.features.forEach(feature => {
                doc.fillColor('#555555')
                   .fontSize(10.5)
                   .text(`• ${feature.trim()}`, { indent: 15, lineGap: 1 });
            });
        }

        // Footer
        doc.fontSize(8.5)
           .fillColor('#aaaaaa')
           .text(`© 2026 Nutri Kitchen | Quality Natural Superfoods`, 40, 780, { align: 'center' });
    });

    doc.end();

    stream.on('finish', () => {
        console.log(`PDF created successfully: ${OUTPUT_FILE}`);
    });
}

createPDF();

