import Banner from '../models/Banner.js';
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

function buildPayload(body = {}, file = null, allowPartial = false) {
  const payload = {};

  if (!allowPartial || body.title !== undefined) {
    payload.title = body.title ? String(body.title).trim() : '';
  }
  if (!allowPartial || body.channel !== undefined) {
    payload.channel = body.channel ? String(body.channel).trim() : '';
  }
  if (!allowPartial || body.format !== undefined) {
    payload.format = body.format ? String(body.format).trim() : '';
  }
  if (!allowPartial || body.url !== undefined) {
    payload.url = body.url ? String(body.url).trim() : '';
  }
  if (!allowPartial || body.tone !== undefined) {
    payload.tone = body.tone ? String(body.tone).trim() : '';
  }
  if (!allowPartial || body.description !== undefined) {
    payload.description = body.description ? String(body.description).trim() : '';
  }

  // Handle image upload
  if (file) {
    payload.image = file.path;
  } else if (!allowPartial && body.image) {
    payload.image = body.image;
  }

  return payload;
}

export async function getBanners(req, res) {
  const banners = await Banner.findAll({ order: [['updatedAt', 'DESC']] });
  return res.json({ success: true, data: banners });
}

export async function createBanner(req, res) {
  const payload = buildPayload(req.body, req.file, false);
  if (!payload.title) {
    return res.status(400).json({ success: false, error: 'Judul banner wajib diisi' });
  }
  const banner = await Banner.create(payload);
  return res.status(201).json({ success: true, data: banner });
}

export async function updateBanner(req, res) {
  const { id } = req.params;
  const banner = await Banner.findByPk(id);
  if (!banner) {
    return res.status(404).json({ success: false, error: 'Banner tidak ditemukan' });
  }

  const oldImage = banner.image;
  const payload = buildPayload(req.body, req.file, true);

  // Jika tidak ada file upload, pertahankan image lama
  if (!req.file && !req.body.image) {
    payload.image = banner.image;
  }

  // Jika ada gambar baru, hapus gambar lama dari Cloudinary
  if (req.file && oldImage) {
    await deleteCloudinaryImage(oldImage);
  }

  await banner.update(payload);
  return res.json({ success: true, data: banner });
}

export async function deleteBanner(req, res) {
  const { id } = req.params;
  const banner = await Banner.findByPk(id);
  if (!banner) {
    return res.status(404).json({ success: false, error: 'Banner tidak ditemukan' });
  }

  // Hapus gambar dari Cloudinary sebelum hapus data
  if (banner.image) {
    await deleteCloudinaryImage(banner.image);
  }

  await banner.destroy();
  return res.json({ success: true, data: { id } });
}
