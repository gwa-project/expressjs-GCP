import { Router } from 'express';
import { getCars, createCar, updateCar, deleteCar } from '../controllers/carController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public endpoint - no authentication required
router.get('/', asyncHandler(getCars));

// Protected endpoints - authentication required
router.post('/', authenticate, upload.single('image'), asyncHandler(createCar));
router.put('/:id', authenticate, upload.single('image'), asyncHandler(updateCar));
router.delete('/:id', authenticate, asyncHandler(deleteCar));

export default router;
