import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Get PASETO symmetric key from environment
 * PRKEY should be a 32-byte hex string
 */
export function getPasetoKey() {
  const keyHex = process.env.PRKEY;

  if (!keyHex) {
    throw new Error('PRKEY environment variable is required for PASETO authentication');
  }

  try {
    const keyBuffer = Buffer.from(keyHex, 'hex');

    if (keyBuffer.length !== 32) {
      throw new Error(`PASETO key must be exactly 32 bytes, got ${keyBuffer.length} bytes`);
    }

    return keyBuffer;
  } catch (err) {
    throw new Error(`Invalid PRKEY format: ${err.message}`);
  }
}

/**
 * Generate a new random PASETO key (32 bytes)
 * Use this for initial setup
 */
export function generatePasetoKey() {
  const keyBytes = crypto.randomBytes(32);
  return keyBytes.toString('hex');
}

/**
 * Generate PASETO key from passphrase
 * Pads or truncates to 32 bytes
 */
export function generatePasetoKeyFromPassphrase(passphrase) {
  const buffer = Buffer.alloc(32);
  Buffer.from(passphrase).copy(buffer);
  return buffer.toString('hex');
}

/**
 * Create a JWT token with claims (fallback dari PASETO)
 * @param {Object} payload - Token claims (sub, email, role, etc.)
 * @param {string} expiresIn - Expiration time (e.g., '8h', '1d')
 */
export async function createPasetoToken(payload, expiresIn = '8h') {
  const secret = process.env.PRKEY || 'fallback-secret-key';

  const token = jwt.sign(
    {
      ...payload,
      iss: 'sena-rencar-api',
    },
    secret,
    { expiresIn }
  );

  return token;
}

/**
 * Verify and decode a JWT token (fallback dari PASETO)
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 */
export async function verifyPasetoToken(token) {
  const secret = process.env.PRKEY || 'fallback-secret-key';

  try {
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (err) {
    throw new Error(`Token verification failed: ${err.message}`);
  }
}

/**
 * Parse expiration time string to milliseconds
 * Supports: '30s', '5m', '8h', '7d'
 */
function parseExpirationTime(expiresIn) {
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error(`Invalid expiration format: ${expiresIn}. Use format like '8h', '30m', '7d'`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    s: 1000,              // seconds
    m: 60 * 1000,         // minutes
    h: 60 * 60 * 1000,    // hours
    d: 24 * 60 * 60 * 1000 // days
  };

  return value * multipliers[unit];
}

/**
 * Validate PASETO key format
 */
export function validatePasetoKey(keyHex) {
  try {
    const keyBuffer = Buffer.from(keyHex, 'hex');

    if (keyBuffer.length !== 32) {
      return {
        valid: false,
        error: `Key must be exactly 32 bytes, got ${keyBuffer.length} bytes`
      };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid hex format: ${err.message}`
    };
  }
}

/**
 * Print PASETO key generation guide
 */
export function printPasetoKeyGuide() {
  console.log('=== PASETO Key Generation Guide ===');
  console.log();
  console.log('PASETO v4 requires a 32-byte (256-bit) symmetric key.');
  console.log();
  console.log('Option 1: Generate a random key');
  const randomKey = generatePasetoKey();
  console.log(`Random Key: ${randomKey}`);
  console.log();
  console.log('Option 2: Generate from passphrase');
  const passphraseKey = generatePasetoKeyFromPassphrase('gwa-project-secure-key-2024');
  console.log(`Passphrase Key: ${passphraseKey}`);
  console.log();
  console.log('Add to your .env or GitHub Secrets:');
  console.log(`PRKEY=${randomKey}`);
  console.log();
  console.log('=== End Guide ===');
}
