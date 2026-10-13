import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    if (env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      logger.info(`SMTP Transporter configured for ${env.SMTP_HOST}`);
    } else {
      logger.info('SMTP credentials not configured. Email service will run in simulated log mode.');
    }
  }

  /**
   * Send buyer acknowledgment email for RFQ
   */
  async sendRfqBuyerAcknowledgment(inquiry) {
    const subject = `Quotation Request Received [Ref: ${inquiry.referenceNo}] — ${env.SMTP_FROM.split('<')[0].trim()}`;
    const itemsListHtml = inquiry.items
      ?.map(
        (item) =>
          `<li><strong>${item.productName}</strong>: ${item.quantity} ${item.unit} (${item.packing || 'Standard export packaging'})</li>`
      )
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937; line-height: 1.6;">
        <div style="background-color: #0D2818; padding: 24px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 22px;">Formal Request for Quotation Acknowledged</h2>
          <p style="margin: 6px 0 0 0; color: #C5A059; font-size: 14px;">Reference: ${inquiry.referenceNo}</p>
        </div>
        <div style="padding: 24px; border: 1px solid #E5E7EB; background-color: #FFFFFF;">
          <p>Dear ${inquiry.buyer.name},</p>
          <p>Thank you for submitting your commercial inquiry to our international export desk on behalf of <strong>${inquiry.buyer.company}</strong> (${inquiry.buyer.country}).</p>
          
          <h4 style="color: #0D2818; margin-bottom: 8px;">Requested Commodities:</h4>
          <ul style="padding-left: 20px;">
            ${itemsListHtml || '<li>Detailed in custom procurement specifications.</li>'}
          </ul>

          <div style="background-color: #FBFBF9; padding: 12px 16px; border-left: 4px solid #C5A059; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px;"><strong>Destination Port:</strong> ${inquiry.destinationPort || 'To be specified'}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Incoterms 2020:</strong> ${inquiry.incoterm || 'FOB / CIF'}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Target Shipment:</strong> ${inquiry.targetShipmentMonth || 'Immediate / Next Vessel'}</p>
          </div>

          <p>Our sales and logistics directors are reviewing your container load specifications. You will receive a binding proforma quotation and full Certificate of Analysis (COA) pack within <strong>48 business hours</strong>.</p>
          
          <p style="margin-top: 24px; font-size: 13px; color: #6B7280;">For urgent maritime inquiries, reach our export director directly via WhatsApp at ${env.CLIENT_URL}.</p>
        </div>
      </div>
    `;

    return this.sendMail({
      to: inquiry.buyer.email,
      subject,
      html,
    });
  }

  /**
   * Send internal sales desk lead alert
   */
  async sendRfqSalesDeskAlert(inquiry) {
    const subject = `[NEW RFQ] ${inquiry.priority?.toUpperCase() || 'NEW'} — ${inquiry.buyer.company} (${inquiry.buyer.country}) [Ref: ${inquiry.referenceNo}]`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937;">
        <h3 style="color: #0D2818;">New International B2B Lead Received</h3>
        <p><strong>Reference:</strong> ${inquiry.referenceNo}</p>
        <p><strong>Buyer:</strong> ${inquiry.buyer.name} (${inquiry.buyer.designation || 'Buyer'})</p>
        <p><strong>Company:</strong> ${inquiry.buyer.company} (${inquiry.buyer.buyerType || 'Importer'})</p>
        <p><strong>Country / City:</strong> ${inquiry.buyer.country} / ${inquiry.buyer.city || 'N/A'}</p>
        <p><strong>Email:</strong> ${inquiry.buyer.email}</p>
        <p><strong>Phone / WhatsApp:</strong> ${inquiry.buyer.phone || inquiry.buyer.whatsapp || 'N/A'}</p>
        <p><strong>Port:</strong> ${inquiry.destinationPort} | <strong>Incoterm:</strong> ${inquiry.incoterm}</p>
        <p><strong>Items Count:</strong> ${inquiry.items?.length || 0}</p>
        <p><strong>Buyer Message:</strong> ${inquiry.message || 'No additional message.'}</p>
      </div>
    `;

    return this.sendMail({
      to: env.SMTP_FROM,
      subject,
      html,
    });
  }

  /**
   * Send approved commercial sales reply directly to the overseas buyer
   */
  async sendBuyerReply({ to, subject, message, referenceNo, senderName = 'International Trade Desk' }) {
    const formattedParagraphs = (message || '')
      .split('\n\n')
      .map((p) => `<p style="margin: 0 0 14px 0; line-height: 1.6;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1F2937; line-height: 1.6;">
        <div style="background-color: #0D2818; padding: 24px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">Commercial Quotation & Export Response</h2>
          <p style="margin: 6px 0 0 0; color: #C5A059; font-size: 13px;">Reference: ${referenceNo || 'RFQ'}</p>
        </div>
        <div style="padding: 28px 24px; border: 1px solid #E5E7EB; background-color: #FFFFFF;">
          ${formattedParagraphs}
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280;">
            <p style="margin: 0;"><strong>Jhs Global Exports — ${senderName}</strong></p>
            <p style="margin: 4px 0 0 0;">Government of India Recognized Export House • APEDA • FSSAI • Spices Board Certified</p>
          </div>
        </div>
      </div>
    `;

    return this.sendMail({
      to,
      subject,
      html,
    });
  }

  /**
   * Core sendMail with safe fallback
   */
  async sendMail({ to, subject, html }) {
    if (!this.transporter) {
      logger.info(`[SIMULATED EMAIL] To: ${to} | Subject: "${subject}"`);
      return { success: true, simulated: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      logger.error(`Failed to send email to ${to}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
