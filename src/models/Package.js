import { DataTypes } from 'sequelize';
import { getSequelize } from '../lib/db.js';

const Package = getSequelize().define(
  'Package',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    duration: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: ''
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    price: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    image: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    }
  },
  {
    tableName: 'packages',
    timestamps: true,
    underscored: true
  }
);

export default Package;
