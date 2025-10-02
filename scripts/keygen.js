#!/usr/bin/env node

/**
 * PASETO Key Generator for Sena Rencar Express API
 * Similar to contoh-deploy-gcp/helper/keygen.go
 *
 * Usage:
 *   node scripts/keygen.js
 *   npm run keygen
 */

import crypto from 'crypto';

/**
 * Generate a random PASETO symmetric key (32 bytes)
 * @returns {string} 64-character hex string
 */
function generatePasetoKey() {
  const keyBytes = crypto.randomBytes(32);
  return keyBytes.toString('hex');
}

/**
 * Generate PASETO key from a passphrase
 * @param {string} passphrase - Input passphrase
 * @returns {string} 64-character hex string
 */
function generatePasetoKeyFromPassphrase(passphrase) {
  // Create 32-byte buffer
  const keyBuffer = Buffer.alloc(32);

  // Copy passphrase bytes (truncate if longer, pad with zeros if shorter)
  const passphraseBuffer = Buffer.from(passphrase, 'utf-8');
  passphraseBuffer.copy(keyBuffer, 0, 0, Math.min(32, passphraseBuffer.length));

  return keyBuffer.toString('hex');
}

/**
 * Validate if a hex key is valid for PASETO v4
 * @param {string} keyHex - Hex-encoded key
 * @returns {{valid: boolean, error?: string}}
 */
function validatePasetoKey(keyHex) {
  try {
    // Check if string is valid hex
    if (!/^[0-9a-fA-F]+$/.test(keyHex)) {
      return {
        valid: false,
        error: 'Key must contain only hexadecimal characters (0-9, a-f)'
      };
    }

    // Decode hex string
    const keyBuffer = Buffer.from(keyHex, 'hex');

    // Check key length
    if (keyBuffer.length !== 32) {
      return {
        valid: false,
        error: `Key must be exactly 32 bytes (64 hex chars), got ${keyBuffer.length} bytes (${keyHex.length} hex chars)`
      };
    }

    // Basic validation: key should not be all zeros
    const allZeros = keyBuffer.every((byte) => byte === 0);
    if (allZeros) {
      return {
        valid: false,
        error: 'Key must not be all zeros (use a random or passphrase-based key)'
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Print PASETO key generation guide
 */
function printPasetoKeyInfo() {
  console.log('=== PASETO Key Generation Guide ===');
  console.log();
  console.log('PASETO v4 requires a 32-byte (256-bit) symmetric key for encryption.');
  console.log();

  // Option 1: Random key
  console.log('Option 1: Generate a random key (RECOMMENDED)');
  const randomKey = generatePasetoKey();
  console.log(`Random Key: ${randomKey}`);
  console.log();

  // Validate random key
  const randomValidation = validatePasetoKey(randomKey);
  if (randomValidation.valid) {
    console.log('✓ Random key validated successfully');
  } else {
    console.log(`✗ Random key validation failed: ${randomValidation.error}`);
  }
  console.log();

  // Option 2: Passphrase key
  console.log('Option 2: Use a passphrase (will be padded/truncated to 32 bytes)');
  const passphraseExample = 'gwa-project-secure-key-2024';
  const passphraseKey = generatePasetoKeyFromPassphrase(passphraseExample);
  console.log(`Passphrase: "${passphraseExample}"`);
  console.log(`Passphrase Key: ${passphraseKey}`);
  console.log();

  // Validate passphrase key
  const passphraseValidation = validatePasetoKey(passphraseKey);
  if (passphraseValidation.valid) {
    console.log('✓ Passphrase key validated successfully');
  } else {
    console.log(`✗ Passphrase key validation failed: ${passphraseValidation.error}`);
  }
  console.log();

  // Instructions
  console.log('=== How to Use ===');
  console.log();
  console.log('1. For local development (.env file):');
  console.log(`   PRKEY=${randomKey}`);
  console.log();
  console.log('2. For GitHub Actions (Secrets):');
  console.log('   - Go to: https://github.com/YOUR_USERNAME/sena-rencar/settings/secrets/actions');
  console.log('   - Click "New repository secret"');
  console.log('   - Name: PRKEY');
  console.log(`   - Value: ${randomKey}`);
  console.log();
  console.log('3. For Google Cloud Run (Environment variables):');
  console.log(`   gcloud run services update sena-express-api \\`);
  console.log(`     --region=asia-southeast2 \\`);
  console.log(`     --update-env-vars="PRKEY=${randomKey}"`);
  console.log();
  console.log('=== Key Format Requirements ===');
  console.log();
  console.log('✓ Must be exactly 64 hexadecimal characters (32 bytes)');
  console.log('✓ Valid characters: 0-9, a-f');
  console.log('✓ Example: a1b2c3d4e5f6...c9d0e1f2 (64 chars total)');
  console.log();
  console.log('=== End Guide ===');
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // No arguments - print full guide
    printPasetoKeyInfo();
  } else if (args[0] === 'random') {
    // Generate random key only
    const key = generatePasetoKey();
    console.log(key);
  } else if (args[0] === 'passphrase' && args[1]) {
    // Generate key from passphrase
    const key = generatePasetoKeyFromPassphrase(args[1]);
    console.log(key);
  } else if (args[0] === 'validate' && args[1]) {
    // Validate a key
    const validation = validatePasetoKey(args[1]);
    if (validation.valid) {
      console.log('✓ Key is valid');
      process.exit(0);
    } else {
      console.error(`✗ Key is invalid: ${validation.error}`);
      process.exit(1);
    }
  } else {
    // Show usage
    console.log('Usage:');
    console.log('  node scripts/keygen.js                    # Show full guide');
    console.log('  node scripts/keygen.js random             # Generate random key');
    console.log('  node scripts/keygen.js passphrase "text"  # Generate from passphrase');
    console.log('  node scripts/keygen.js validate "hexkey"  # Validate a key');
    console.log();
    console.log('Or use npm script:');
    console.log('  npm run keygen');
    process.exit(1);
  }
}

// Run if called directly
try {
  main();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
