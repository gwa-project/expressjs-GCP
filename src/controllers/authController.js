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
