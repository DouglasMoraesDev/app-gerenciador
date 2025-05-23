import express from 'express';
import { getAudit } from '../controllers/auditoriaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/', getAudit);
export default router;
