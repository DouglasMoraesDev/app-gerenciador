import express from 'express';
import {
  getAllOS,
  getOSById,
  createOS,
  updateOS,
  deleteOS,
  patchStatus
} from '../controllers/osController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getAllOS);
router.get('/:id', getOSById);
router.post('/', createOS);
router.put('/:id', updateOS);
router.delete('/:id', deleteOS);
router.patch('/:id/status', patchStatus);

export default router;
