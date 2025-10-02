import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createPasetoToken } from '../lib/paseto.js';
import { verifyGoogleToken } from '../lib/google-auth.js';

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
 * Google OAuth login
 * Client sends ID token from Google Sign-In
 */
export async function googleLogin(req, res) {
  const { idToken, credential } = req.body || {};

  // Support both field names (idToken or credential)
  const token = idToken || credential;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Google ID token (idToken or credential) is required'
    });
  }

  try {
    // Verify token with Google
    const googleUser = await verifyGoogleToken(token);

    if (!googleUser.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email belum diverifikasi oleh Google'
      });
    }

    // Find or create user
    let user = await User.findOne({
      where: { email: googleUser.email }
    });

    if (!user) {
      // Create new user
      user = await User.create({
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        googleId: googleUser.googleId,
        role: 'user' // Default role
      });

      console.log(`[google-auth] New user created: ${user.email}`);
    } else {
      // Update existing user info
      await user.update({
        name: googleUser.name,
        picture: googleUser.picture,
        googleId: googleUser.googleId,
        lastLoginAt: new Date()
      });

      console.log(`[google-auth] User logged in: ${user.email}`);
    }

    // Generate PASETO token
    const pasetoToken = await createPasetoToken(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
        googleId: user.googleId
      },
      PASETO_EXPIRES
    );

    return res.json({
      success: true,
      data: {
        token: pasetoToken,
        profile: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role
        }
      }
    });
  } catch (err) {
    console.error('[google-auth] Error:', err);
    return res.status(401).json({
      success: false,
      error: `Google authentication failed: ${err.message}`
    });
  }
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
      picture: user.picture,
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
