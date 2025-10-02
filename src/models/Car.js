import { DataTypes } from 'sequelize';
import { getSequelize } from '../lib/db.js';

const Car = getSequelize().define(
  'Car',
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
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    seats: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    luggage: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    price: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    driverIncluded: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'driver_included'
    },
    image: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    highlight: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    }
  },
  {
    tableName: 'cars',
    timestamps: true,
    underscored: true
  }
);

export default Car;
