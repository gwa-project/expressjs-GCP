import Package from '../models/Package.js';
import cloudinary from '../config/cloudinary.js';

// Helper function to extract public_id from Cloudinary URL
function getPublicIdFromUrl(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
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

function normalizeFeatures(input) {
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
    duration: body.duration || '',
    description: body.description || '',
    price: body.price,
    category: body.category || '',
    image: file ? file.path : (body.image || ''),
    features: normalizeFeatures(body.features)
  };
}

export async function getPackages(req, res) {
  const packages = await Package.findAll({ order: [['createdAt', 'DESC']] });
  return res.json({ success: true, data: packages });
}

export async function createPackage(req, res) {
  const payload = buildPayload(req.body, req.file);
  if (!payload.name || !payload.price) {
    return res.status(400).json({ success: false, error: 'Nama dan harga paket wajib diisi' });
  }
  const pkg = await Package.create(payload);
  return res.status(201).json({ success: true, data: pkg });
}

export async function updatePackage(req, res) {
  const { id } = req.params;
  const pkg = await Package.findByPk(id);
  if (!pkg) {
    return res.status(404).json({ success: false, error: 'Paket tidak ditemukan' });
  }

  const oldImage = pkg.image;
  const payload = buildPayload(req.body, req.file);

  // Jika tidak ada file upload, pertahankan image lama
  if (!req.file && !req.body.image) {
    payload.image = pkg.image;
  }

  // Jika ada gambar baru, hapus gambar lama dari Cloudinary
  if (req.file && oldImage) {
    await deleteCloudinaryImage(oldImage);
  }

  await pkg.update(payload);
  return res.json({ success: true, data: pkg });
}

export async function deletePackage(req, res) {
  const { id } = req.params;
  const pkg = await Package.findByPk(id);
  if (!pkg) {
    return res.status(404).json({ success: false, error: 'Paket tidak ditemukan' });
  }

  // Hapus gambar dari Cloudinary sebelum hapus data
  if (pkg.image) {
    await deleteCloudinaryImage(pkg.image);
  }

  await pkg.destroy();
  return res.json({ success: true, data: { id } });
}
