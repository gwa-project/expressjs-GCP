import { Router } from 'express';
import { getPosters, createPoster, updatePoster, deletePoster } from '../controllers/posterController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public endpoint - no authentication required
router.get('/', asyncHandler(getPosters));

// Protected endpoints - authentication required
router.post('/', authenticate, upload.single('image'), asyncHandler(createPoster));
router.put('/:id', authenticate, upload.single('image'), asyncHandler(updatePoster));
router.delete('/:id', authenticate, asyncHandler(deletePoster));

export default router;
