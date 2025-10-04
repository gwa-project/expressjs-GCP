import { Router } from 'express';
import { getCars, createCar, updateCar, deleteCar } from '../controllers/carController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);
router.get('/', asyncHandler(getCars));
router.post('/', upload.single('image'), asyncHandler(createCar));
router.put('/:id', upload.single('image'), asyncHandler(updateCar));
router.delete('/:id', asyncHandler(deleteCar));

export default router;
