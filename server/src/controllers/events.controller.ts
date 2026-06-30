import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Validation middleware for event creation
export const createEventValidation = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title must be under 100 characters'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('startTime').isISO8601().withMessage('Start time must be a valid date'),
  body('endTime').isISO8601().withMessage('End time must be a valid date'),
];

export async function listPublicEvents(req: Request, res: Response) {
  try {
    const { search, category, dateFilter } = req.query;
    
    let whereClause: any = { status: 'PUBLISHED', visibility: 'PUBLIC' };
    
    if (search) {
      whereClause.title = { contains: String(search) };
    }
    if (category && category !== 'ALL') {
      whereClause.category = String(category);
    }
    
    if (dateFilter) {
      const now = new Date();
      if (dateFilter === 'TODAY') {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.startTime = { gte: now, lte: endOfDay };
      } else if (dateFilter === 'WEEK') {
        const endOfWeek = new Date();
        endOfWeek.setDate(now.getDate() + 7);
        whereClause.startTime = { gte: now, lte: endOfWeek };
      } else if (dateFilter === 'MONTH') {
        const endOfMonth = new Date();
        endOfMonth.setMonth(now.getMonth() + 1);
        whereClause.startTime = { gte: now, lte: endOfMonth };
      }
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        organizer: { include: { user: { select: { name: true } } } },
        ticketTypes: true
      },
      orderBy: { startTime: 'asc' }
    });
    
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getEventDetails(req: Request, res: Response) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        organizer: { include: { user: { select: { name: true } } } },
        ticketTypes: true
      }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createEvent(req: AuthRequest, res: Response) {
  try {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
    }

    const { title, description, category, venue, startTime, endTime, capacity } = req.body;
    
    const organizer = await prisma.organizer.findUnique({ where: { userId: req.user.id } });
    if (!organizer) return res.status(403).json({ error: 'Organizer profile required' });

    let bannerImage = null;
    if (req.file) {
      // In production you would upload to S3/Cloudinary. For now, local path
      bannerImage = `/uploads/${req.file.filename}`;
    }

    const event = await prisma.event.create({
      data: {
        title, description, category, venue, capacity: Number(capacity),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        organizerId: organizer.id,
        bannerImage
      }
    });
    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateEvent(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Event not found' });
    
    if (existing.startTime <= new Date()) {
      return res.status(400).json({ error: 'Cannot edit an event that has already started or ended.' });
    }

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function myEvents(req: AuthRequest, res: Response) {
  try {
    const organizer = await prisma.organizer.findUnique({ where: { userId: req.user.id } });
    if (!organizer) return res.status(403).json({ error: 'Organizer profile required' });

    const events = await prisma.event.findMany({
      where: { organizerId: organizer.id },
      include: { ticketTypes: true, _count: { select: { bookings: true } } }
    });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createTicketType(req: AuthRequest, res: Response) {
  try {
    const { name, price, qtyTotal, saleStart, saleEnd } = req.body;
    const ticket = await prisma.ticketType.create({
      data: {
        eventId: req.params.id,
        name,
        price: Number(price),
        qtyTotal: Number(qtyTotal),
        qtyRemaining: Number(qtyTotal),
        saleStart: new Date(saleStart),
        saleEnd: new Date(saleEnd)
      }
    });
    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getEventStats(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const totalBookings = await prisma.booking.count({
      where: { eventId: id, status: 'CONFIRMED' }
    });

    const checkedInCount = await prisma.booking.count({
      where: { eventId: id, status: 'CONFIRMED', checkedIn: true }
    });

    res.json({ totalBookings, checkedInCount, capacity: event.capacity });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function cloneEvent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const organizer = await prisma.organizer.findUnique({ where: { userId: req.user.id } });
    if (!organizer) return res.status(403).json({ error: 'Organizer profile required' });

    const existingEvent = await prisma.event.findUnique({ 
      where: { id },
      include: { ticketTypes: true }
    });

    if (!existingEvent) return res.status(404).json({ error: 'Event not found' });
    if (existingEvent.organizerId !== organizer.id) return res.status(403).json({ error: 'Not authorized' });

    const newEvent = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        title: `(Copy) ${existingEvent.title}`,
        description: existingEvent.description,
        venue: existingEvent.venue,
        capacity: existingEvent.capacity,
        category: existingEvent.category,
        visibility: existingEvent.visibility,
        bannerImage: existingEvent.bannerImage,
        startTime: existingEvent.startTime,
        endTime: existingEvent.endTime,
        status: 'DRAFT',
        ticketTypes: {
          create: existingEvent.ticketTypes.map(tt => ({
            name: tt.name,
            price: tt.price,
            qtyTotal: tt.qtyTotal,
            qtyRemaining: tt.qtyTotal,
            saleStart: tt.saleStart,
            saleEnd: tt.saleEnd
          }))
        }
      },
      include: { ticketTypes: true }
    });

    res.status(201).json(newEvent);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function cancelEvent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const organizer = await prisma.organizer.findUnique({ where: { userId: req.user.id } });
    if (!organizer) return res.status(403).json({ error: 'Organizer profile required' });

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) return res.status(404).json({ error: 'Event not found' });
    if (existingEvent.organizerId !== organizer.id) return res.status(403).json({ error: 'Not authorized' });

    // 1. Update Event Status
    const event = await prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // 2. Fetch all confirmed bookings
    const confirmedBookings = await prisma.booking.findMany({
      where: { eventId: id, status: 'CONFIRMED' },
      include: { attendee: true }
    });

    if (confirmedBookings.length > 0) {
      await prisma.$transaction(async (tx) => {
        // 3. Update Bookings to CANCELLED
        await tx.booking.updateMany({
          where: { eventId: id, status: 'CONFIRMED' },
          data: { status: 'CANCELLED' }
        });

        // 4. Update Payments to REFUNDED
        await tx.payment.updateMany({
          where: { bookingId: { in: confirmedBookings.map(b => b.id) }, status: 'SUCCESS' },
          data: { status: 'REFUNDED' }
        });

        // 5. Create Notifications for Attendees
        await tx.notification.createMany({
          data: confirmedBookings.map(b => ({
            userId: b.attendee.userId,
            eventId: id,
            type: 'CANCELLATION',
            channel: 'EMAIL',
            message: `Event "${existingEvent.title}" has been cancelled. A full refund has been issued.`,
            status: 'SENT'
          }))
        });
      });
    }

    res.json({ message: 'Event cancelled successfully, refunds issued.', event });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
