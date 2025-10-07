import { DataTypes } from 'sequelize';
import { getSequelize } from '../lib/db.js';

const Banner = getSequelize().define(
  'Banner',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    channel: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    format: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    url: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    tone: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    image: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    }
  },
  {
    tableName: 'banners',
    timestamps: true,
    underscored: true
  }
);

export default Banner;
