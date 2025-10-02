import { Router } from 'express';
import { getCars, createCar, updateCar, deleteCar } from '../controllers/carController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/', asyncHandler(getCars));
router.post('/', asyncHandler(createCar));
router.put('/:id', asyncHandler(updateCar));
router.delete('/:id', asyncHandler(deleteCar));

export default router;
