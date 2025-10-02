import { Router } from 'express';
import { login, googleLogin, getProfile, refreshToken } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Regular username/password login
router.post('/login', asyncHandler(login));

// Google OAuth login
router.post('/google-login', asyncHandler(googleLogin));

// Get current user profile (protected)
router.get('/profile', authenticate, asyncHandler(getProfile));

// Refresh token (protected)
router.post('/refresh', authenticate, asyncHandler(refreshToken));

export default router;
