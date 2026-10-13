import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const Task = sequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    taskType: {
      type: DataTypes.STRING(50),
      defaultValue: 'call',
      field: 'task_type',
    },
    inquiryId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'inquiry_id',
      references: {
        model: 'inquiries',
        key: 'id',
      },
    },
    inquiryReference: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      field: 'inquiry_reference',
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
    customerName: {
      type: DataTypes.STRING(150),
      defaultValue: '',
      field: 'customer_name',
    },
    company: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'due_date',
    },
    dueTime: {
      type: DataTypes.STRING(20),
      defaultValue: '10:00 AM',
      field: 'due_time',
    },
    priority: {
      type: DataTypes.STRING(20),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: 'pending',
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
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'completed_at',
    },
  },
  {
    tableName: 'tasks',
    timestamps: true,
    underscored: true,
  }
);

export default Task;
