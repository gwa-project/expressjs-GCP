import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Poster from '../models/Poster.js';

const defaultCars = [
  {
    name: 'Mercedes-Benz E300 AMG',
    category: 'Executive Sedan',
    seats: 4,
    luggage: 3,
    price: '1.400K',
    driverIncluded: true,
    image: '/assets/rent-a-car-banner.jpg',
    highlight: ['Ambient lighting', 'Panoramic roof', 'Premium sound'],
    description: 'Pilihan ideal untuk eksekutif dengan kenyamanan maksimum dan privasi tinggi.'
  },
  {
    name: 'Toyota Alphard Facelift',
    category: 'Premium MPV',
    seats: 6,
    luggage: 5,
    price: '1.800K',
    driverIncluded: true,
    image: '/assets/paket-wisata.jpg',
    highlight: ['Captain seat', 'Rear entertainment', 'Full leather interior'],
    description: 'Armada keluarga dan corporate yang menghadirkan ruang lega dan pengalaman eksklusif.'
  },
  {
    name: 'Toyota Fortuner GR Sport',
    category: 'SUV Adventure',
    seats: 6,
    luggage: 4,
    price: '1.250K',
    driverIncluded: true,
    image: '/assets/rent-a-car-banner.jpg',
    highlight: ['4x4 capability', 'Premium safety', 'Wireless charger'],
    description: 'Siap menemani perjalanan luar kota dengan performa bertenaga dan fitur lengkap.'
  }
];

const defaultPosters = [
  {
    title: 'Rent A Car Banner',
    channel: 'Homepage Hero',
    format: '1920 x 1080',
    url: '/assets/rent-a-car-banner.jpg',
    tone: 'Luxury & Professional'
  },
  {
    title: 'Tour Package Highlight',
    channel: 'Social Campaign',
    format: '1080 x 1350',
    url: '/assets/paket-wisata.jpg',
    tone: 'Warm & Experiential'
  }
];

/**
 * Ensure default admin user exists
 * Admin credentials hardcoded - tidak pakai env vars
 */
export async function ensureDefaultAdmin() {
  // Hardcoded admin credentials
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin';
  const ADMIN_EMAIL = 'admin@sena-rencar.com';

  // Check if admin user exists (by username or email)
  const existingAdmin = await User.findOne({
    where: {
      role: 'admin'
    }
  });

  if (!existingAdmin) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hash,
      name: 'Administrator',
      role: 'admin'
    });

    console.log('[seed] Default admin user created');
    console.log(`[seed] Username: ${ADMIN_USERNAME}`);
    console.log(`[seed] Password: ${ADMIN_PASSWORD}`);
  } else {
    console.log('[seed] Admin user already exists');
  }
}

export async function ensureDefaultContent() {
  const carCount = await Car.count();
  if (carCount === 0) {
    await Car.bulkCreate(defaultCars);
    console.log('[seed] Default car data added');
  }

  const posterCount = await Poster.count();
  if (posterCount === 0) {
    await Poster.bulkCreate(defaultPosters);
    console.log('[seed] Default poster data added');
  }
}
