import { Router } from 'express';
import * as eventsController from '../controllers/events.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', eventsController.listPublicEvents);
router.get('/my-events', requireAuth, requireRole('ORGANIZER'), eventsController.myEvents);
router.get('/:id', eventsController.getEventDetails);

router.post('/', requireAuth, requireRole('ORGANIZER'), eventsController.createEvent);
router.put('/:id', requireAuth, requireRole('ORGANIZER'), eventsController.updateEvent);

router.post('/:id/tickets', requireAuth, requireRole('ORGANIZER'), eventsController.createTicketType);

export default router;
