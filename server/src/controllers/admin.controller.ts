import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getPendingEvents(req: AuthRequest, res: Response) {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'DRAFT' },
      include: {
        organizer: { include: { user: { select: { name: true, email: true } } } },
        ticketTypes: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function approveEvent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: { organizer: true }
    });
    
    // Create a notification for the organizer
    await prisma.notification.create({
      data: {
        userId: event.organizer.userId,
        eventId: event.id,
        type: 'REMINDER', // Fallback type, as custom might fail enum if restricted
        channel: 'SYSTEM',
        message: `Your event "${event.title}" has been approved and is now live.`,
        status: 'SENT'
      }
    });

    res.json({ message: 'Event approved successfully', event });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getTelemetry(req: AuthRequest, res: Response) {
  try {
    const totalUsers = await prisma.user.count();
    const totalEvents = await prisma.event.count();
    const totalRevenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' }
    });

    const allEvents = await prisma.event.findMany({
      include: {
        organizer: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      totalUsers,
      totalEvents,
      revenue: totalRevenueResult._sum.amount || 0,
      allEvents
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
