import { Router } from 'express';
import { getPosters, createPoster, updatePoster, deletePoster } from '../controllers/posterController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);
router.get('/', asyncHandler(getPosters));
router.post('/', upload.single('image'), asyncHandler(createPoster));
router.put('/:id', upload.single('image'), asyncHandler(updatePoster));
router.delete('/:id', asyncHandler(deletePoster));

export default router;
