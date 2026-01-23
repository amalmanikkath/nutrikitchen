const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_FILE = 'NutriKitchen_Supermarket_Newsletter.pdf';
// Images are in the website/images directory
const IMAGES_DIR = path.join(__dirname, '..', '..', 'website', 'images');

const PRODUCTS_DATA = [
  {
    name: 'Baby Mix',
    mrp: 289,
    description: 'Nutritious blend specially formulated for infants. Rich in essential vitamins, minerals, and protein from premium millets and grains.',
    image: 'BabyMixPouch.png',
    weight: '250gm',
    features: ['100% Natural Ingredients', 'Rich in Iron & Calcium', 'Easy to Digest', 'No Added Sugar or Salt']
  },
  {
    name: 'Health Mix',
    mrp: 299,
    description: 'Complete health supplement packed with multi-grains, nuts, and seeds. Perfect for all age groups looking for natural nutrition.',
    image: 'healthMixpouch02.png',
    weight: '400gm',
    features: ['Multi-Grain Formula', 'High in Protein & Fiber', 'Boosts Immunity', 'Natural Energy Source']
  },
  {
    name: 'Protein Mix',
    mrp: 295,
    description: 'High-protein blend combining millets, pulses, and nuts. Ideal for fitness enthusiasts and those seeking plant-based protein.',
    image: 'nutriprotienMixPouch.png',
    weight: '400gm',
    features: ['25g Protein per Serving', '100% Vegan Friendly', 'Supports Muscle Growth', 'Gluten-Free Options']
  },
  {
    name: 'Vanilla Health Mix',
    mrp: 379,
    description: 'A delicious twist on our classic health mix with natural vanilla flavor. Kids love the taste, moms love the nutrition.',
    image: 'vanillachocolateHealth Mix.png',
    weight: '400gm',
    features: ['Kid-Friendly Flavor', 'Multi-Grain Goodness', 'Rich in Protein', 'No Artificial Colors']
  },
  {
    name: 'Chocolate Health Mix',
    mrp: 389,
    description: 'Rich chocolate flavor combined with the goodness of multi-grains. A perfect healthy treat for chocolate lovers.',
    image: 'chocolateHealthMix.png',
    weight: '400gm',
    features: ['Rich Chocolate Taste', 'Multi-Grain Benefits', 'High Protein', 'No Preservatives']
  }
];

function createNewsletter() {
    // Delete existing file if it exists to ensure no stale content
    const fullOutputPath = path.join(__dirname, OUTPUT_FILE);
    if (fs.existsSync(fullOutputPath)) {
        try { fs.unlinkSync(fullOutputPath); } catch(e) {}
    }

    const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4', 
        autoFirstPage: false,
        bufferPages: true 
    });
    
    const stream = fs.createWriteStream(fullOutputPath);
    doc.pipe(stream);

    const drawHeader = (isFirstPage) => {
        doc.rect(0, 0, doc.page.width, 100).fill('#f9fbf8');
        const logoPath = path.join(IMAGES_DIR, 'nutrikitchenLogo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, 20, { width: 45 });
        }
        doc.fillColor('#2d5a27').font('Helvetica-Bold').fontSize(20).text('Nutri Kitchen', 100, 30);
        doc.fontSize(9).font('Helvetica').fillColor('#666666').text('Direct Wholesale Price List for Supermarkets', 100, 52);
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#2d5a27').text('www.nutrikitchen.in', 440, 30, { align: 'right', width: 110 });
        if (isFirstPage) {
            doc.rect(40, 85, 515, 1).fill('#2d5a27');
        }
    };

    // PAGE 1
    doc.addPage();
    drawHeader(true);
    doc.y = 120;
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#333333').text('Premium Millet & Natural Products Range', 50, doc.y, { align: 'center', width: 495 });
    doc.moveDown(1.5);

    PRODUCTS_DATA.forEach((product, index) => {
        const mrp = product.mrp;
        const weight = product.weight;
        const sellingPrice = Math.ceil((mrp * 0.75) * 1.05);

        // Move to Page 2 if we are below 600 units (Card is ~170 units)
        // This prevents triggering an accidental 3rd page at the very bottom
        if (doc.y > 600) {
            doc.addPage();
            drawHeader(false);
            doc.y = 100;
        }

        const cardStartY = doc.y;
        doc.roundedRect(40, cardStartY, 515, 170, 8).lineWidth(0.5).strokeColor('#e2e8e0').stroke();
        
        const imagePath = path.join(IMAGES_DIR, product.image);
        if (fs.existsSync(imagePath)) {
            try { doc.image(imagePath, 55, cardStartY + 15, { fit: [130, 130] }); } catch (e) {}
        }

        const infoX = 200;
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#2d5a27').text(product.name, infoX, cardStartY + 20);
        doc.font('Helvetica').fontSize(9).fillColor('#888888').text(`Net Weight: ${weight}`, infoX, cardStartY + 40);
        doc.font('Helvetica').fontSize(10).fillColor('#444444').text(product.description, infoX, cardStartY + 55, { width: 340, lineGap: 2 });
        
        const priceY = cardStartY + 125;
        doc.font('Helvetica').fontSize(11).fillColor('#999999').text(`MRP: `, infoX, priceY, { continued: true });
        doc.font('Helvetica').fontSize(11).text(`Rs. ${mrp}`, { continued: true });
        doc.font('Helvetica-Bold').fontSize(15).fillColor('#2d5a27').text(`    Selling Price: Rs. ${sellingPrice}`, { continued: true });
        doc.font('Helvetica').fontSize(9).fillColor('#888888').text(' (Incl. 5% GST)', { baseline: 'bottom' });

        doc.y = cardStartY + 185;
    });

    // Finalize Pages with Footers
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.rect(0, 800, doc.page.width, 42).fill('#2d5a27');
        doc.fillColor('#ffffff').fontSize(8.5).text('Nutri Kitchen | SMS Agro, Parakulam, Kunissery, Palakkad, Kerala | info@nutrikitchen.in', 50, 810, { align: 'center' });
        doc.text('Contact for Bulk Orders: +91 7760268422 | www.nutrikitchen.in', 50, 822, { align: 'center' });
    }

    doc.end();
    stream.on('finish', () => {
        console.log(`Newsletter PDF creation complete. File: ${OUTPUT_FILE} | Total Pages: ${range.count}`);
    });
}

createNewsletter();
