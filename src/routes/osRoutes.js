import express from 'express';
import {
  getTodasOS,
  getOSById,
  criarOS,
  atualizarOS,
  deletarOS,
  patchStatus
} from '../controllers/osController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',    authMiddleware, getTodasOS);
router.get('/:id', authMiddleware, getOSById);
router.post('/',   authMiddleware, criarOS);
router.put('/:id', authMiddleware, atualizarOS);
router.delete('/:id', authMiddleware, deletarOS);
router.patch('/:id/status', authMiddleware, patchStatus);

export default router;
