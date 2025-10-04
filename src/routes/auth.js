import { Router } from 'express';
import { login, register, getProfile, refreshToken } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));

// Protected routes
router.get('/profile', authenticate, asyncHandler(getProfile));
router.post('/refresh', authenticate, asyncHandler(refreshToken));

export default router;
