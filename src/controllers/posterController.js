import Poster from '../models/Poster.js';

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
    payload.image = `/uploads/posters/${file.filename}`;
  } else if (!allowPartial && body.image) {
    payload.image = body.image;
  }

  return payload;
}

export async function getPosters(req, res) {
  const posters = await Poster.findAll({ order: [['updatedAt', 'DESC']] });
  return res.json({ success: true, data: posters });
}

export async function createPoster(req, res) {
  const payload = buildPayload(req.body, req.file, false);
  if (!payload.title) {
    return res.status(400).json({ success: false, error: 'Judul poster wajib diisi' });
  }
  const poster = await Poster.create(payload);
  return res.status(201).json({ success: true, data: poster });
}

export async function updatePoster(req, res) {
  const { id } = req.params;
  const poster = await Poster.findByPk(id);
  if (!poster) {
    return res.status(404).json({ success: false, error: 'Poster tidak ditemukan' });
  }

  const payload = buildPayload(req.body, req.file, true);

  // Jika tidak ada file upload, pertahankan image lama
  if (!req.file && !req.body.image) {
    payload.image = poster.image;
  }

  await poster.update(payload);
  return res.json({ success: true, data: poster });
}

export async function deletePoster(req, res) {
  const { id } = req.params;
  const poster = await Poster.findByPk(id);
  if (!poster) {
    return res.status(404).json({ success: false, error: 'Poster tidak ditemukan' });
  }

  await poster.destroy();
  return res.json({ success: true, data: { id } });
}
