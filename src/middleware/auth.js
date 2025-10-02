import { verifyPasetoToken } from '../lib/paseto.js';

/**
 * Authentication middleware using PASETO
 * Verifies PASETO token from Authorization header
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header missing or invalid format'
    });
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  try {
    // Verify PASETO token
    const payload = await verifyPasetoToken(token);

    // Attach user info to request
    req.user = payload;

    next();
  } catch (err) {
    console.error('[auth-middleware] Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

/**
 * Check if user has admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
}

/**
 * Optional authentication
 * Doesn't fail if token is missing, but verifies if present
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return next(); // No token, continue without user
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyPasetoToken(token);
    req.user = payload;
  } catch (err) {
    // Token present but invalid - log but don't block
    console.warn('[auth-middleware] Optional auth failed:', err.message);
  }

  next();
}
