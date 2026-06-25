import { Router } from 'express';
import * as bookingsController from '../controllers/bookings.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

router.use(requireAuth); // All booking routes require auth

router.get('/my-bookings', requireRole('ATTENDEE'), bookingsController.myBookings);
router.post('/', requireRole('ATTENDEE'), bookingsController.createBooking);
router.post('/:id/confirm', requireRole('ATTENDEE'), bookingsController.confirmBooking);

router.post('/checkin', requireRole('ORGANIZER'), bookingsController.checkIn);

export default router;
