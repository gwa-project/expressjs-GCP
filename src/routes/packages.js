import { Router } from 'express';
import { getPackages, createPackage, updatePackage, deletePackage } from '../controllers/packageController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public endpoint - no authentication required
router.get('/', asyncHandler(getPackages));

// Protected endpoints - authentication required
router.post('/', authenticate, upload.single('image'), asyncHandler(createPackage));
router.put('/:id', authenticate, upload.single('image'), asyncHandler(updatePackage));
router.delete('/:id', authenticate, asyncHandler(deletePackage));

export default router;
