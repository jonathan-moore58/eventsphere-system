import cron from 'node-cron';
import prisma from '../lib/prisma';
import { addHours, format, startOfMinute } from 'date-fns';

export function initCronJobs() {
  console.log('[CRON] Initializing background workers...');

  // Job 1: 24hr Event Reminders
  // Runs at minute 0 past every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running 24hr Reminder Job...');
    try {
      const targetTimeStart = startOfMinute(addHours(new Date(), 24));
      const targetTimeEnd = addHours(targetTimeStart, 1);

      const upcomingEvents = await prisma.event.findMany({
        where: {
          startTime: {
            gte: targetTimeStart,
            lt: targetTimeEnd
          },
          status: 'PUBLISHED'
        },
        include: {
          bookings: {
            where: { status: 'CONFIRMED' },
            include: { attendee: true }
          }
        }
      });

      for (const event of upcomingEvents) {
        for (const booking of event.bookings) {
          // Check if reminder already exists
          const existing = await prisma.notification.findFirst({
            where: {
              userId: booking.attendee.userId,
              eventId: event.id,
              type: 'REMINDER'
            }
          });

          if (!existing) {
            await prisma.notification.create({
              data: {
                userId: booking.attendee.userId,
                eventId: event.id,
                type: 'REMINDER',
                channel: 'SYSTEM',
                message: `Reminder: Your event "${event.title}" is starting tomorrow at ${format(event.startTime, 'HH:mm')}.`,
                status: 'PENDING'
              }
            });
          }
        }
      }
      console.log(`[CRON] Processed ${upcomingEvents.length} events for reminders.`);
    } catch (err) {
      console.error('[CRON] Failed running reminder job', err);
    }
  });

  // Job 2: Notification Retries
  // Runs every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('[CRON] Running Notification Retry Job...');
    try {
      const failedNotifs = await prisma.notification.findMany({
        where: { status: 'FAILED' }
      });

      for (const notif of failedNotifs) {
        // Attempt to "send" by changing status
        await prisma.notification.update({
          where: { id: notif.id },
          data: { status: 'PENDING' } // Resets it so next sweep (or whatever system process) handles it
        });
      }
      console.log(`[CRON] Retried ${failedNotifs.length} failed notifications.`);
    } catch (err) {
      console.error('[CRON] Failed running retry job', err);
    }
  });
}
