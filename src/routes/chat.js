import express from 'express';
import { chat } from '../controllers/chatController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

// Public endpoint - no authentication required for chat
router.post('/', asyncHandler(chat));

export default router;
