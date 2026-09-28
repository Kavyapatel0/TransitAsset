import express from 'express';
import { getTransfers, createTransfer, updateTransfer } from '../controllers/transferController.js';
import { authenticate, authorize } from '../middleware/auth.js';
const router = express.Router();
router.use(authenticate);
router.get('/', getTransfers);
router.post('/', authorize('ADMIN', 'DEPOT_MANAGER'), createTransfer);
router.put('/:id', authorize('ADMIN', 'DEPOT_MANAGER'), updateTransfer);
export default router;
