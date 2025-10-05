import OpenAI from 'openai';
import Car from '../models/Car.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt dengan context tentang Sena Rencar
const SYSTEM_PROMPT = `Kamu adalah asisten virtual untuk Sena Rencar, layanan rental mobil premium di Indonesia.

INFORMASI PERUSAHAAN:
- Nama: Sena Rencar
- Layanan: Rental mobil untuk berbagai kebutuhan (wisata, bisnis, acara khusus)
- Keunggulan: Armada terawat, driver profesional (opsional), harga kompetitif
- Area layanan: Indonesia (fokus utama)

TUGAS KAMU:
1. Bantu customer mencari mobil yang sesuai kebutuhan
2. Jelaskan harga dan layanan dengan ramah dan profesional
3. Jawab pertanyaan umum tentang rental mobil
4. Arahkan customer untuk booking/kontak jika tertarik

CARA MENJAWAB:
- Gunakan bahasa Indonesia yang sopan dan ramah
- Berikan informasi yang akurat berdasarkan data armada yang tersedia
- Jika ditanya tentang mobil tertentu, sebutkan detail lengkapnya (harga, kapasitas, fitur)
- Jika customer tertarik booking, sarankan mereka untuk menghubungi admin atau isi form kontak
- Jangan berikan informasi yang tidak kamu ketahui - lebih baik bilang "untuk informasi lebih lanjut silakan hubungi admin"

Selalu ramah, membantu, dan profesional!`;

export async function chat(req, res) {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Pesan tidak boleh kosong'
      });
    }

    // Ambil data mobil untuk context
    const cars = await Car.findAll({
      attributes: ['name', 'category', 'price', 'seats', 'luggage', 'driverIncluded', 'highlight', 'description']
    });

    // Format data mobil untuk context
    const carsContext = cars.map(car => {
      const highlights = Array.isArray(car.highlight) ? car.highlight.join(', ') : '';
      return `- ${car.name} (${car.category}): Rp ${car.price}/hari, ${car.seats} kursi, ${car.luggage} bagasi${car.driverIncluded ? ', dengan driver' : ''}${highlights ? `, Fitur: ${highlights}` : ''}${car.description ? `. ${car.description}` : ''}`;
    }).join('\n');

    const contextMessage = `ARMADA TERSEDIA:\n${carsContext}\n\nGunakan informasi di atas untuk menjawab pertanyaan customer tentang mobil yang tersedia.`;

    // Build messages array untuk OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: contextMessage },
      ...conversationHistory.slice(-10), // Ambil 10 pesan terakhir untuk context
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Atau gpt-3.5-turbo untuk lebih murah
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    const reply = completion.choices[0].message.content;

    return res.json({
      success: true,
      data: {
        reply: reply,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in chat controller:', error);

    // Handle OpenAI specific errors
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        success: false,
        error: 'Layanan chat sedang tidak tersedia. Silakan coba lagi nanti.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat memproses pesan. Silakan coba lagi.'
    });
  }
}
