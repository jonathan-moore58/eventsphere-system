import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { processPayment } from '../services/payment.service';
import { generateQRCode } from '../services/qrcode.service';

export async function createBooking(req: AuthRequest, res: Response) {
  try {
    const { eventId, items } = req.body; // items: [{ ticketTypeId, quantity }]
    
    const attendee = await prisma.attendee.findUnique({ where: { userId: req.user.id } });
    if (!attendee) return res.status(403).json({ error: 'Attendee profile required' });

    let totalAmount = 0;
    const bookingItemsData = [];

    // Simple validation (In a real app, this should be a transaction to reserve tickets)
    for (const item of items) {
      const ticket = await prisma.ticketType.findUnique({ where: { id: item.ticketTypeId } });
      if (!ticket) throw new Error(`Ticket type not found`);
      if (ticket.qtyRemaining < item.quantity) throw new Error(`Not enough tickets available for ${ticket.name}`);
      
      totalAmount += ticket.price * item.quantity;
      bookingItemsData.push({
        ticketTypeId: ticket.id,
        quantity: item.quantity,
        unitPrice: ticket.price
      });
    }

    const booking = await prisma.booking.create({
      data: {
        attendeeId: attendee.id,
        eventId,
        totalAmount,
        status: 'PENDING',
        items: { create: bookingItemsData }
      },
      include: { items: true }
    });

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function confirmBooking(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { cardDetails } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id }, include: { items: true, attendee: true } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'PENDING') return res.status(400).json({ error: 'Booking already processed' });

    // Process Mock Payment
    const paymentResult = await processPayment(booking.totalAmount, cardDetails);

    // Generate QR Code containing booking ref
    const qrCodeDataUrl = await generateQRCode(booking.id);

    // Update DB in transaction
    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED', qrCode: qrCodeDataUrl }
      }),
      prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          gatewayTransactionId: paymentResult.transactionId,
          status: 'SUCCESS',
          processedAt: new Date()
        }
      }),
      // Decrement ticket quantities
      ...booking.items.map(item => 
        prisma.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { qtyRemaining: { decrement: item.quantity } }
        })
      ),
      prisma.notification.create({
        data: {
          userId: booking.attendee.userId,
          eventId: booking.eventId,
          type: 'BOOKING_CONFIRM',
          channel: 'EMAIL',
          message: 'Your booking has been confirmed and pass generated.',
          status: 'SENT'
        }
      })
    ]);

    res.json({ message: 'Booking confirmed', booking: updatedBooking });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function myBookings(req: AuthRequest, res: Response) {
  try {
    const attendee = await prisma.attendee.findUnique({ where: { userId: req.user.id } });
    if (!attendee) return res.status(403).json({ error: 'Attendee profile required' });

    const bookings = await prisma.booking.findMany({
      where: { attendeeId: attendee.id },
      include: { event: true, items: { include: { ticketType: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

  export async function checkIn(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.body;
      
      const booking = await prisma.booking.findUnique({ 
        where: { id: bookingId },
        include: { 
          event: true, 
          attendee: { include: { user: true } },
          items: { include: { ticketType: true } }
        }
      });
      
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (booking.status !== 'CONFIRMED') return res.status(400).json({ error: 'Booking is not confirmed' });
      if (booking.checkedIn) return res.status(400).json({ error: 'Attendee already checked in' });
  
      await prisma.booking.update({
        where: { id: bookingId },
        data: { checkedIn: true }
      });
  
      const ticketNames = booking.items.map(i => i.ticketType.name).join(', ');
  
      res.json({ 
        message: 'Checked in successfully', 
        attendee: booking.attendee.user.name,
        ticketType: ticketNames
      });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function cancelBooking(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const attendee = await prisma.attendee.findUnique({ where: { userId: req.user.id } });
    if (!attendee) return res.status(403).json({ error: 'Attendee profile required' });

    const booking = await prisma.booking.findUnique({ 
      where: { id },
      include: { items: true, event: true }
    });
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.attendeeId !== attendee.id) return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    if (booking.status !== 'CONFIRMED') return res.status(400).json({ error: 'Only confirmed bookings can be cancelled' });

    // Update DB in transaction
    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' }
      }),
      // Restore ticket quantities
      ...booking.items.map(item => 
        prisma.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { qtyRemaining: { increment: item.quantity } }
        })
      ),
      // Create notification
      prisma.notification.create({
        data: {
          userId: req.user.id,
          eventId: booking.eventId,
          type: 'CANCELLATION',
          channel: 'EMAIL',
          message: `Your booking for ${booking.event.title} has been cancelled.`,
          status: 'SENT'
        }
      })
    ]);

    // Mock Email
    const { sendEmail } = require('../services/email.service');
    await sendEmail(req.user.email, 'Booking Cancelled', `Your booking for ${booking.event.title} has been cancelled.`);

    res.json({ message: 'Booking cancelled successfully', booking: updatedBooking });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

