import Car from '../models/Car.js';
import cloudinary from '../config/cloudinary.js';

// Helper function to extract public_id from Cloudinary URL
function getPublicIdFromUrl(url) {
  if (!url || !url.includes('cloudinary.com')) return null;

  // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return matches ? matches[1] : null;
}

// Delete image from Cloudinary
async function deleteCloudinaryImage(imageUrl) {
  try {
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
}

function normalizeHighlight(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(input)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPayload(body = {}, file = null) {
  return {
    name: body.name,
    category: body.category,
    seats: Number(body.seats) || 0,
    luggage: Number(body.luggage) || 0,
    price: body.price,
    driverIncluded: body.driverIncluded !== undefined
      ? (body.driverIncluded === 'true' || body.driverIncluded === true)
      : true,
    image: file ? file.path : (body.image || ''),
    highlight: normalizeHighlight(body.highlight),
    description: body.description || ''
  };
}

export async function getCars(req, res) {
  const { driverIncluded } = req.query;

  // Build where clause
  const where = {};
  if (driverIncluded !== undefined) {
    where.driverIncluded = driverIncluded === 'true' || driverIncluded === true;
  }

  const cars = await Car.findAll({
    where,
    order: [['createdAt', 'DESC']]
  });
  return res.json({ success: true, data: cars });
}

export async function createCar(req, res) {
  const payload = buildPayload(req.body, req.file);
  if (!payload.name || !payload.category || !payload.price) {
    return res.status(400).json({ success: false, error: 'Nama, kategori, dan harga wajib diisi' });
  }
  const car = await Car.create(payload);
  return res.status(201).json({ success: true, data: car });
}

export async function updateCar(req, res) {
  const { id } = req.params;
  const car = await Car.findByPk(id);
  if (!car) {
    return res.status(404).json({ success: false, error: 'Armada tidak ditemukan' });
  }

  const oldImage = car.image;
  const payload = buildPayload(req.body, req.file);

  // Jika tidak ada file upload, pertahankan image lama
  if (!req.file && !req.body.image) {
    payload.image = car.image;
  }

  // Jika ada gambar baru, hapus gambar lama dari Cloudinary
  if (req.file && oldImage) {
    await deleteCloudinaryImage(oldImage);
  }

  await car.update(payload);
  return res.json({ success: true, data: car });
}

export async function deleteCar(req, res) {
  const { id } = req.params;
  const car = await Car.findByPk(id);
  if (!car) {
    return res.status(404).json({ success: false, error: 'Armada tidak ditemukan' });
  }

  // Hapus gambar dari Cloudinary sebelum hapus data
  if (car.image) {
    await deleteCloudinaryImage(car.image);
  }

  await car.destroy();
  return res.json({ success: true, data: { id } });
}
