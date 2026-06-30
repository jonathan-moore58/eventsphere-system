import { Router } from 'express';
import * as eventsController from '../controllers/events.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.get('/', eventsController.listPublicEvents);
router.get('/my-events', requireAuth, requireRole('ORGANIZER'), eventsController.myEvents);
router.get('/:id', eventsController.getEventDetails);
router.get('/:id/stats', requireAuth, requireRole('ORGANIZER'), eventsController.getEventStats);

router.post('/', requireAuth, requireRole('ORGANIZER'), upload.single('bannerImage'), eventsController.createEventValidation, eventsController.createEvent);
router.post('/:id/clone', requireAuth, requireRole('ORGANIZER'), eventsController.cloneEvent);
router.post('/:id/cancel', requireAuth, requireRole('ORGANIZER'), eventsController.cancelEvent);
router.put('/:id', requireAuth, requireRole('ORGANIZER'), eventsController.updateEvent);

router.post('/:id/tickets', requireAuth, requireRole('ORGANIZER'), eventsController.createTicketType);

export default router;
