import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/pending-events', adminController.getPendingEvents);
router.post('/events/:id/approve', adminController.approveEvent);
router.get('/telemetry', adminController.getTelemetry);

export default router;
