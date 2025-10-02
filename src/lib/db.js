import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the project root
dotenv.config({ path: join(__dirname, '../../.env') });

// Create sequelize instance immediately (lazy connection)
function createSequelizeInstance() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    // Fallback to individual environment variables
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT || 5432;
    const database = process.env.DB_NAME;
    const username = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;

    if (!host || !database || !username || !password) {
      throw new Error('Environment variable DATABASE_URL atau (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD) wajib diisi');
    }

    return new Sequelize(database, username, password, {
      host,
      port,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'production' ? false : console.log,
      pool: {
        max: Number(process.env.DB_POOL_MAX) || 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    });
  } else {
    // Use DATABASE_URL connection string
    return new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'production' ? false : console.log,
      pool: {
        max: Number(process.env.DB_POOL_MAX) || 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    });
  }
}

const sequelize = createSequelizeInstance();
let connectionPromise = null;

export async function connectDB() {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = sequelize
    .authenticate()
    .then(() => {
      console.log('[postgres] terhubung ke database');
      return sequelize;
    })
    .catch((err) => {
      connectionPromise = null;
      console.error('[postgres] gagal konek', err);
      throw err;
    });

  return connectionPromise;
}

export function getSequelize() {
  return sequelize;
}

export async function syncDatabase(options = {}) {
  const seq = getSequelize();
  return seq.sync(options);
}
