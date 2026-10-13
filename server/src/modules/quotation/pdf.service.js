import PDFDocument from 'pdfkit';

/**
 * Generate a professional B2B export quotation PDF
 * @param {Object} quotation - Quotation document
 * @returns {Promise<Buffer>} - Generated PDF buffer
 */
export const generateQuotationPdf = (quotation) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#0f291e'; // Deep Forest Green
      const accentColor = '#b48a3c';  // Rich Gold
      const darkColor = '#1a1a1a';
      const grayColor = '#555555';
      const lightBg = '#f7f8f6';

      // Header Banner
      doc.rect(40, 40, 515, 60).fill(primaryColor);

      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(20)
        .text('EXPORT COMMERCIAL QUOTATION', 60, 55, { characterSpacing: 1 });

      doc
        .fillColor(accentColor)
        .font('Helvetica')
        .fontSize(10)
        .text('OFFICIAL PROFORMA / PRICE COMMITMENT DOSSIER', 60, 80);

      // Quotation Metadata box (Right side)
      doc
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(`Quote Ref: ${quotation.quotationNumber}`, 370, 115)
        .font('Helvetica')
        .fontSize(9)
        .fillColor(grayColor)
        .text(`Date Issued: ${new Date(quotation.createdAt || Date.now()).toLocaleDateString()}`, 370, 130)
        .text(`Valid Until: ${new Date(quotation.validityDate).toLocaleDateString()}`, 370, 145)
        .text(`Incoterm: ${quotation.incoterm || 'CIF'}`, 370, 160);

      // Buyer Info Box (Left side)
      doc
        .rect(40, 110, 310, 85)
        .fillAndStroke(lightBg, '#e2e8f0');

      doc
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('PREPARED FOR (CONSIGNEE):', 50, 120);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(darkColor)
        .text(quotation.buyer.company || 'Consignee Company', 50, 135)
        .font('Helvetica')
        .fontSize(9)
        .fillColor(grayColor)
        .text(`Attn: ${quotation.buyer.name}`, 50, 150)
        .text(`Email: ${quotation.buyer.email}`, 50, 163)
        .text(`Destination: ${quotation.buyer.country} (Port: ${quotation.portOfDischarge || 'As Agreed'})`, 50, 176);

      // Shipping & Maritime Terms Box
      let y = 205;
      doc
        .rect(40, y, 515, 45)
        .fillAndStroke('#ffffff', '#cbd5e1');

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(primaryColor)
        .text('PORT OF LOADING', 50, y + 8)
        .text('DISCHARGE PORT', 180, y + 8)
        .text('PAYMENT TERMS', 310, y + 8)
        .text('DELIVERY LEAD TIME', 430, y + 8);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(darkColor)
        .text(quotation.portOfLoading || 'Hazira / Mundra, Gujarat', 50, y + 23, { width: 120 })
        .text(quotation.portOfDischarge || 'Destination Port', 180, y + 23, { width: 120 })
        .text(quotation.paymentTerms || 'TT / LC', 310, y + 23, { width: 110 })
        .text(quotation.deliveryTime || '15-20 Days', 430, y + 23, { width: 110 });

      // Table Header
      y = 265;
      doc.rect(40, y, 515, 24).fill(primaryColor);

      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('#', 50, y + 7)
        .text('COMMODITY / SPECIFICATION', 75, y + 7)
        .text('QUANTITY', 280, y + 7)
        .text(`UNIT PRICE (${quotation.currency})`, 365, y + 7)
        .text(`TOTAL (${quotation.currency})`, 460, y + 7);

      // Table Rows
      y += 24;
      quotation.items.forEach((item, index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : lightBg;
        doc.rect(40, y, 515, 30).fill(rowBg);

        doc
          .fillColor(darkColor)
          .font('Helvetica')
          .fontSize(9)
          .text(String(index + 1), 50, y + 8)
          .font('Helvetica-Bold')
          .text(item.productName, 75, y + 6)
          .font('Helvetica')
          .fontSize(8)
          .fillColor(grayColor)
          .text(item.specification || 'Export Grade Standard Packaging', 75, y + 17)
          .fillColor(darkColor)
          .fontSize(9)
          .text(`${item.quantity} ${item.unit}`, 280, y + 10)
          .text(item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }), 365, y + 10)
          .font('Helvetica-Bold')
          .text(item.total.toLocaleString('en-US', { minimumFractionDigits: 2 }), 460, y + 10);

        y += 30;
      });

      // Price Summary Table
      y += 10;
      const summaryLeft = 320;
      const summaryRight = 555;

      const formatCurr = (val) => `${quotation.currency} ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(grayColor)
        .text('Commodity Subtotal:', summaryLeft, y)
        .text(formatCurr(quotation.subtotal), summaryLeft + 120, y, { align: 'right', width: 115 });

      y += 18;
      if (quotation.shippingCharges > 0) {
        doc
          .text(`Ocean Freight (${quotation.incoterm}):`, summaryLeft, y)
          .text(formatCurr(quotation.shippingCharges), summaryLeft + 120, y, { align: 'right', width: 115 });
        y += 18;
      }

      if (quotation.insuranceCharges > 0) {
        doc
          .text('Marine Cargo Insurance:', summaryLeft, y)
          .text(formatCurr(quotation.insuranceCharges), summaryLeft + 120, y, { align: 'right', width: 115 });
        y += 18;
      }

      if (quotation.otherCharges > 0) {
        doc
          .text('Inspection / Doc Charges:', summaryLeft, y)
          .text(formatCurr(quotation.otherCharges), summaryLeft + 120, y, { align: 'right', width: 115 });
        y += 18;
      }

      // Grand Total Box
      doc.rect(summaryLeft, y, 235, 26).fill(primaryColor);
      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(`TOTAL AMOUNT (${quotation.incoterm}):`, summaryLeft + 10, y + 8)
        .text(formatCurr(quotation.totalAmount), summaryLeft + 100, y + 8, { align: 'right', width: 120 });

      // Notes & Terms Footer
      y += 45;
      doc
        .rect(40, y, 515, 65)
        .fillAndStroke(lightBg, '#e2e8f0');

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text('TERMS & CONDITIONS:', 50, y + 8)
        .font('Helvetica')
        .fontSize(8)
        .fillColor(grayColor)
        .text('1. Rates quoted are subject to confirmation within the validity date noted above.', 50, y + 22)
        .text('2. All specifications comply with international APEDA / FSSAI export safety guidelines.', 50, y + 34)
        .text('3. Container stuffing, Phytosanitary, and Certificate of Origin documents provided upon clearance.', 50, y + 46);

      // Sign-off Footer
      y += 85;
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(darkColor)
        .text('Authorized Signatory', 400, y)
        .font('Helvetica')
        .fontSize(8)
        .fillColor(grayColor)
        .text('Commercial Export Division', 400, y + 14)
        .text('JHS GLOBAL', 400, y + 26)
        .text('Surat, Gujarat, India', 400, y + 38);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
