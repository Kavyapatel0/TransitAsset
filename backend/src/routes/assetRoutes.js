import express from 'express';
import { getAssets, getAsset, createAsset, updateAsset, deleteAsset, changeAssetStatus, retireAsset, getAssetLifecycle } from '../controllers/assetController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getAssets);
router.get('/:id', getAsset);
router.post('/', authorize('ADMIN', 'DEPOT_MANAGER'), createAsset);
router.put('/:id', authorize('ADMIN', 'DEPOT_MANAGER'), updateAsset);
router.delete('/:id', authorize('ADMIN'), deleteAsset);
router.post('/:id/status', authorize('ADMIN', 'DEPOT_MANAGER'), changeAssetStatus);
router.post('/:id/retire', authorize('ADMIN'), retireAsset);
router.get('/:id/lifecycle', getAssetLifecycle);

export default router;
