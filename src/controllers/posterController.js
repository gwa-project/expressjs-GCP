import Poster from '../models/Poster.js';

function buildPayload(body = {}, allowPartial = false) {
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

  return payload;
}

export async function getPosters(req, res) {
  const posters = await Poster.findAll({ order: [['updatedAt', 'DESC']] });
  return res.json({ success: true, data: posters });
}

export async function createPoster(req, res) {
  const payload = buildPayload(req.body);
  if (!payload.title) {
    return res.status(400).json({ success: false, error: 'Judul poster wajib diisi' });
  }
  const poster = await Poster.create(payload);
  return res.status(201).json({ success: true, data: poster });
}

export async function updatePoster(req, res) {
  const { id } = req.params;
  const payload = buildPayload(req.body, true);

  const poster = await Poster.findByPk(id);
  if (!poster) {
    return res.status(404).json({ success: false, error: 'Poster tidak ditemukan' });
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
