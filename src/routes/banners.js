import { Router } from 'express';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public endpoint - no authentication required
router.get('/', asyncHandler(getBanners));

// Protected endpoints - authentication required
router.post('/', authenticate, upload.single('image'), asyncHandler(createBanner));
router.put('/:id', authenticate, upload.single('image'), asyncHandler(updateBanner));
router.delete('/:id', authenticate, asyncHandler(deleteBanner));

export default router;
