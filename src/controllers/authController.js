import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createPasetoToken } from '../lib/paseto.js';

const PASETO_EXPIRES = process.env.PASETO_EXPIRES_IN || '8h';

/**
 * Regular username/password login
 * Backward compatibility dengan admin login
 */
export async function login(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username dan password wajib diisi' });
  }

  // Find user by username
  const user = await User.findOne({ where: { username } });
  if (!user || !user.password) {
    return res.status(401).json({ success: false, error: 'Kredensial tidak valid' });
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ success: false, error: 'Kredensial tidak valid' });
  }

  // Update last login
  await user.update({ lastLoginAt: new Date() });

  // Generate PASETO token
  const token = await createPasetoToken(
    {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    PASETO_EXPIRES
  );

  return res.json({
    success: true,
    data: {
      token,
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  });
}

/**
 * Get current user profile
 * Requires authentication
 */
export async function getProfile(req, res) {
  // req.user is set by auth middleware
  const userId = req.user?.sub;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      username: user.username,
      lastLoginAt: user.lastLoginAt
    }
  });
}

/**
 * Refresh token
 * Generate new token from existing valid token
 */
export async function refreshToken(req, res) {
  const userId = req.user?.sub;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Generate new token
  const token = await createPasetoToken(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      username: user.username
    },
    PASETO_EXPIRES
  );

  return res.json({
    success: true,
    data: { token }
  });
}

/**
 * Register new admin user
 * Public endpoint untuk registrasi admin baru
 */
export async function register(req, res) {
  const { username, email, name, password, role } = req.body || {};

  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, dan password wajib diisi'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password minimal 6 karakter'
    });
  }

  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Sequelize.Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username atau email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      name: name || username,
      password: hashedPassword,
      role: role || 'admin'
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi'
    });
  }
}
