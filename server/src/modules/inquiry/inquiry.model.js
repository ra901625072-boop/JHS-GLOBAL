import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { INQUIRY_STATUSES, INQUIRY_PRIORITIES } from '../../config/constants.js';

export const Inquiry = sequelize.define(
  'Inquiry',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    referenceNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'reference_no',
    },
    customerId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'customer_id',
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    buyer: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    items: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    destinationPort: {
      type: DataTypes.STRING(150),
      defaultValue: '',
      field: 'destination_port',
    },
    incoterm: {
      type: DataTypes.STRING(20),
      defaultValue: 'CIF',
    },
    targetShipmentMonth: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      field: 'target_shipment_month',
    },
    paymentTerm: {
      type: DataTypes.STRING(50),
      defaultValue: 'TT',
      field: 'payment_term',
    },
    needsPrivateLabel: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'needs_private_label',
    },
    needsSample: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'needs_sample',
    },
    message: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'new',
    },
    priority: {
      type: DataTypes.STRING(20),
      defaultValue: 'warm',
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'assigned_to',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    notes: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    ai: {
      type: DataTypes.JSONB,
      defaultValue: {
        summary: '',
        language: 'en',
        translatedMessage: '',
        extracted: {},
        leadScore: 50,
        scoreReason: '',
        urgency: 'warm',
        isSpam: false,
        spamReason: '',
        suggestedAction: '',
        suggestedReply: '',
        replySubject: '',
        model: '',
        generatedAt: null,
        approvedBy: null,
        approvedAt: null,
      },
    },
    source: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    meta: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    emailSent: {
      type: DataTypes.JSONB,
      defaultValue: { buyer: false, team: false },
      field: 'email_sent',
    },
    slaDeadline: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'sla_deadline',
    },
    isSpam: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_spam',
    },
    spamFlaggedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'spam_flagged_at',
    },
    spamFlaggedBy: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'spam_flagged_by',
    },
  },
  {
    tableName: 'inquiries',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (inquiry) => {
        if (!inquiry.slaDeadline) {
          const created = inquiry.createdAt ? new Date(inquiry.createdAt) : new Date();
          inquiry.slaDeadline = new Date(created.getTime() + 48 * 3600 * 1000);
        }
      },
      beforeValidate: async (inquiry) => {
        if (!inquiry.referenceNo) {
          const year = new Date().getFullYear();
          const prefix = `RFQ-${year}-`;
          const candidates = await Inquiry.findAll({
            where: {
              referenceNo: {
                [Op.like]: `${prefix}%`,
              },
            },
            attributes: ['referenceNo'],
            order: [['referenceNo', 'DESC']],
            limit: 10,
          });
          let seq = 1;
          for (const cand of candidates) {
            const parts = cand.referenceNo.split('-');
            if (parts.length === 3 && !isNaN(parseInt(parts[2], 10))) {
              seq = parseInt(parts[2], 10) + 1;
              break;
            }
          }
          inquiry.referenceNo = `${prefix}${String(seq).padStart(6, '0')}`;
        }
      },
    },
    indexes: [
      {
        fields: ['reference_no'],
        unique: true,
      },
      {
        name: 'idx_inquiries_status',
        fields: ['status'],
      },
      {
        name: 'idx_inquiries_priority',
        fields: ['priority'],
      },
      {
        name: 'idx_inquiries_created_at',
        fields: ['created_at'],
      },
    ],
  }
);

export default Inquiry;
