import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export async function listPublicEvents(req: Request, res: Response) {
  try {
    const { search, category } = req.query;
    
    let whereClause: any = { status: 'PUBLISHED', visibility: 'PUBLIC' };
    
    if (search) {
      whereClause.title = { contains: String(search) };
    }
    if (category) {
      whereClause.category = String(category);
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
    const { title, description, category, venue, startTime, endTime, capacity } = req.body;
    
    const organizer = await prisma.organizer.findUnique({ where: { userId: req.user.id } });
    if (!organizer) return res.status(403).json({ error: 'Organizer profile required' });

    const event = await prisma.event.create({
      data: {
        title, description, category, venue, capacity: Number(capacity),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        organizerId: organizer.id
      }
    });
    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateEvent(req: AuthRequest, res: Response) {
  try {
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
