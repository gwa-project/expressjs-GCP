// CORS allowed origins - sama seperti Go backend config/cors.go
export const allowedOrigins = [
  'https://gilarya.my.id',
  'https://www.gilarya.my.id',
  'https://dashboard.gilarya.my.id',
  'https://gwa-project.vercel.app',
  'https://www.gwa-project.vercel.app',
  'https://rentalcar.gilarya.my.id',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:8080',
  'https://rentalcar.gilarya.my.id',
];

// CORS options untuk Express
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin tidak diizinkan oleh CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Login', 'Hashed'],
};
