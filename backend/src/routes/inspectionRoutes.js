import express from 'express';
import { getInspections, createInspection, updateInspection } from '../controllers/inspectionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
const router = express.Router();
router.use(authenticate);
router.get('/', getInspections);
router.post('/', authorize('ADMIN', 'DEPOT_MANAGER', 'TECHNICIAN'), createInspection);
router.put('/:id', authorize('ADMIN', 'DEPOT_MANAGER', 'TECHNICIAN'), updateInspection);
export default router;
