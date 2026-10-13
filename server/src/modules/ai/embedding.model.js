import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const Embedding = sequelize.define(
  'Embedding',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sourceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'source_type',
    },
    sourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'source_id',
    },
    chunkText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'chunk_text',
    },
    chunkIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'chunk_index',
    },
    vector: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: 'embeddings',
    timestamps: true,
    underscored: true,
  }
);

export default Embedding;
