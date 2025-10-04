import Car from '../models/Car.js';

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
    driverIncluded: body.driverIncluded !== undefined ? Boolean(body.driverIncluded) : true,
    image: file ? `/uploads/cars/${file.filename}` : (body.image || ''),
    highlight: normalizeHighlight(body.highlight),
    description: body.description || ''
  };
}

export async function getCars(req, res) {
  const cars = await Car.findAll({ order: [['createdAt', 'DESC']] });
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

  const payload = buildPayload(req.body, req.file);

  // Jika tidak ada file upload, pertahankan image lama
  if (!req.file && !req.body.image) {
    payload.image = car.image;
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

  await car.destroy();
  return res.json({ success: true, data: { id } });
}
