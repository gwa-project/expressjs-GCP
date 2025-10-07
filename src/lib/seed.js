import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Banner from '../models/Banner.js';
import Package from '../models/Package.js';

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
  },
  {
    name: 'Toyota Avanza',
    category: 'Economy MPV',
    seats: 7,
    luggage: 3,
    price: '350K',
    driverIncluded: false,
    image: '/assets/rent-a-car-banner.jpg',
    highlight: ['Fuel efficient', 'Easy to drive', 'Spacious cabin'],
    description: 'Pilihan ekonomis untuk perjalanan keluarga dengan sistem lepas kunci.'
  },
  {
    name: 'Honda Brio',
    category: 'City Car',
    seats: 4,
    luggage: 2,
    price: '250K',
    driverIncluded: false,
    image: '/assets/rent-a-car-banner.jpg',
    highlight: ['Compact', 'Low fuel consumption', 'Easy parking'],
    description: 'Mobil city car ideal untuk mobilitas dalam kota dengan lepas kunci.'
  }
];

const defaultBanners = [
  {
    title: 'Rent A Car Banner',
    channel: 'Homepage Hero',
    format: '1920 x 1080',
    url: '/assets/rent-a-car-banner.jpg',
    image: '/assets/Rent-A-Car-Banner.jpg',
    tone: 'Luxury & Professional',
    description: 'Banner utama rental mobil premium'
  },
  {
    title: 'Tour Package Highlight',
    channel: 'Social Campaign',
    format: '1080 x 1350',
    url: '/assets/paket-wisata.jpg',
    image: '/assets/paket-wisata.jpg',
    tone: 'Warm & Experiential',
    description: 'Paket wisata kurasi untuk perjalanan tak terlupakan'
  }
];

const defaultPackages = [
  {
    name: 'Bandung Luxury Escape',
    duration: '3 Hari 2 Malam',
    description: 'Eksplorasi Bandung dengan pengalaman kuliner premium dan hidden gems eksklusif.',
    price: '5.9 Juta',
    category: 'City Tour',
    image: '/assets/paket-wisata.jpg',
    features: ['Hotel 5★', 'Private guide', 'Culinary journey']
  },
  {
    name: 'Bali Honeymoon Signature',
    duration: '4 Hari 3 Malam',
    description: 'Paket bulan madu intim dengan itinerary personal dan dokumentasi profesional.',
    price: '12.5 Juta',
    category: 'Honeymoon',
    image: '/assets/paket-wisata.jpg',
    features: ['Sunset cruise', 'Couple spa', 'Fine dining']
  },
  {
    name: 'Yogyakarta Heritage Journey',
    duration: '2 Hari 1 Malam',
    description: 'Meresapi kekayaan budaya klasik dengan akses eksklusif dan storyteller lokal.',
    price: '4.2 Juta',
    category: 'Cultural',
    image: '/assets/paket-wisata.jpg',
    features: ['Sunrise Borobudur', 'Royal lunch', 'Cultural workshop']
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

  const bannerCount = await Banner.count();
  if (bannerCount === 0) {
    await Banner.bulkCreate(defaultBanners);
    console.log('[seed] Default banner data added');
  }

  const packageCount = await Package.count();
  if (packageCount === 0) {
    await Package.bulkCreate(defaultPackages);
    console.log('[seed] Default package data added');
  }
}
