import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with real event data...');
  
  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.event.deleteMany();
  await prisma.attendee.deleteMany();
  await prisma.organizer.deleteMany();
  await prisma.user.deleteMany();

  // ─── 1. CREATE USERS ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@ems.com', passwordHash: adminPassword, role: 'ADMIN', isVerified: true }
  });

  const orgPassword = await bcrypt.hash('Organizer123!', 12);
  const orgUser = await prisma.user.create({
    data: { name: 'EventSphere Productions', email: 'organizer@ems.com', passwordHash: orgPassword, role: 'ORGANIZER', isVerified: true }
  });
  const organizer = await prisma.organizer.create({
    data: { userId: orgUser.id, organizationName: 'EventSphere Productions', bio: 'Premium event curation across Pakistan' }
  });

  const attPassword = await bcrypt.hash('Attendee123!', 12);
  const attUser = await prisma.user.create({
    data: { name: 'Ali Ahmed', email: 'attendee@ems.com', passwordHash: attPassword, role: 'ATTENDEE', isVerified: true }
  });
  const attendee = await prisma.attendee.create({ data: { userId: attUser.id } });

  const guestPassword = await bcrypt.hash('Guest123!', 12);
  await prisma.user.create({
    data: { name: 'Guest User', email: 'guest@ems.com', passwordHash: guestPassword, role: 'GUEST', isVerified: true }
  });

  // ─── 2. CREATE EVENTS (Real Data) ────────────────────────────────

  const eventsData = [
    {
      title: 'Attock Safari Tourist Train',
      description: `Experience the scenic Attock Safari Tourist Train journey from Rawalpindi to Attock Khurd! This heritage rail adventure includes breakfast onboard, a visit to two galleries at the Golra Sharif Railway Museum, lunch at Attock Khurd station, and exciting recreational activities including horse riding and camel riding.\n\nSchedule:\n• Departure from Rawalpindi: 08:30 AM\n• Golra Sharif Museum Visit: 08:50 AM – 09:10 AM\n• Arrival at Attock Khurd: 11:05 AM\n• Lunch: 12:00 PM – 12:30 PM\n• Recreational Activities: 12:45 PM – 01:45 PM\n• Return to Rawalpindi: 04:05 PM`,
      category: 'Travel',
      venue: 'Rawalpindi Railway Station, Rawalpindi',
      startTime: new Date('2026-07-12T08:30:00'),
      endTime: new Date('2026-07-12T16:05:00'),
      capacity: 200,
      bannerImage: '/uploads/safari-tourist-train-1775196247-5447.png',
      tickets: [
        { name: 'Standard Class', price: 2500, qty: 150 },
        { name: 'Premium Class', price: 4500, qty: 50 },
      ]
    },
    {
      title: 'Humpday Comedy Night — Open Mic',
      description: `The climb to the weekend just got a lot shorter! Join us every Wednesday for Humpday Comedy Night — the open mic where the jokes are fresh, the vibes are immaculate, and the laughs are guaranteed.\n\nWhether you're a comedy fan or looking for a spot to test your own sets, the mic is waiting.\n\n• Indoor seated event\n• Food & drinks available\n• Parking available\n• Open for all ages`,
      category: 'Comedy',
      venue: 'Black Honey, Bukhari Commercial, Karachi',
      startTime: new Date('2026-07-16T21:00:00'),
      endTime: new Date('2026-07-16T22:30:00'),
      capacity: 120,
      bannerImage: '/uploads/humpday-comedy-night-every-wed-1780473907-6016.png',
      tickets: [
        { name: 'General Admission', price: 1000, qty: 100 },
        { name: 'Front Row', price: 2000, qty: 20 },
      ]
    },
    {
      title: 'Summer Camp: Art Monster — A Journey of Creativity',
      description: `This summer, give your children a space where their imagination can run wild! Our Summer Camp is designed to be more than just an art class — it's a vibrant, immersive experience where kids explore new mediums, build confidence, and make lasting memories.\n\nActivities include:\n• Creative Construction: 3D sculptures, clay modeling, furniture painting\n• Unique Art Forms: Mosaic art, canvas painting, textured techniques\n• Culinary Art: Bento cake decoration\n• Storytelling & Expression: Connecting visual art with narrative\n\nBenefits:\n✓ Boosts confidence & independence\n✓ Enhances fine motor skills\n✓ Encourages critical thinking\n✓ Social & emotional growth\n✓ A screen-free escape`,
      category: 'Workshop',
      venue: 'Art Monster Studio, Lahore',
      startTime: new Date('2026-08-01T10:00:00'),
      endTime: new Date('2026-08-01T14:00:00'),
      capacity: 40,
      bannerImage: '/uploads/summer-camp-art-monster-1778763324-5827.jpeg',
      tickets: [
        { name: 'Single Day Pass', price: 3500, qty: 30 },
        { name: 'Full Week Pass', price: 15000, qty: 10 },
      ]
    },
    {
      title: 'Murtaza Qizilbash Live — The Hum Tum Tour (Faisalabad)',
      description: `Get ready for an unforgettable night of music, nostalgia, and storytelling as Murtaza Qizilbash brings The Hum Tum Tour to Faisalabad! Known for his soulful voice and emotionally rich compositions, Murtaza has captured hearts nationwide, with his hit track "Hum" reaching #1 on Spotify Pakistan's Top Songs chart.\n\nThis tour promises an intimate live experience with his signature blend of modern pop, indie soul, and heartfelt lyrics. Expect sing-along moments, powerful vocals, and pure magic.\n\n• Gates Open: 7:00 PM\n• Show Starts: 8:00 PM Sharp\n• No Stags Allowed\n• Indoor seated event with valet parking\n• Limited tickets available — early purchase recommended`,
      category: 'Concert',
      venue: 'Exclusive Venue, Faisalabad',
      startTime: new Date('2026-09-05T19:00:00'),
      endTime: new Date('2026-09-05T23:00:00'),
      capacity: 500,
      bannerImage: '/uploads/murtaza-qizilbash-live-exclusive-faisalabad-1775055687-5436.jpeg',
      tickets: [
        { name: 'Standard', price: 3000, qty: 350 },
        { name: 'VIP', price: 5000, qty: 150 },
      ]
    },
    {
      title: 'Pyaar Mai — An Intimate Night with Murtaza Qizilbash',
      description: `An intimate night. A limited audience. One sensational experience with Murtaza Qizilbash and Aisha Ijlal.\n\nStep into an exclusive evening of soulful music and unforgettable performances. This is not just a concert — it's a curated, intimate experience designed for true music lovers.\n\n• Dress Code: All white traditional attire\n• Food & drinks available\n• Valet parking available\n• Seated event\n• Wheelchair accessible\n• Open for all ages — all attendees need tickets`,
      category: 'Concert',
      venue: 'Private Venue, Islamabad',
      startTime: new Date('2026-10-18T20:00:00'),
      endTime: new Date('2026-10-19T00:00:00'),
      capacity: 150,
      bannerImage: '/uploads/pyaar-mai-1778672208-5802.jpeg',
      tickets: [
        { name: 'General Admission', price: 4000, qty: 100 },
        { name: 'VIP Lounge', price: 8000, qty: 50 },
      ]
    },
    {
      title: 'Murder Mystery Experience — Trovert Space',
      description: `Step into a world of secrets, suspense, and hidden motives where nothing is as it seems and everyone is a suspect. This isn't just an event — it's a complete interactive experience where you become the detective.\n\nThe Twist:\n• Every teammate will be a complete stranger\n• Everyone wears a mask to keep identities hidden\n• No names, no clues about each other — just instincts, teamwork, and sharp observation\n\nEvent Flow:\n🔍 3:00 PM – 5:00 PM: Solve the Murder Mystery\nWork with your team, study evidence, analyze witness statements, and uncover secrets hidden within the case file.\n\n🎭 5:00 PM – 6:00 PM: Play Mafia Game\nEnd the evening with a thrilling social deduction game full of lies, strategy, and unexpected twists.\n\n• Teams of 4 detectives (randomly grouped)\n• Only 3-4 teams — extremely limited seats\n• 1 complimentary drink included\n• Hosted by Trovert Space`,
      category: 'Experience',
      venue: 'DOT, DHA Phase 5, Lahore',
      startTime: new Date('2026-11-22T15:00:00'),
      endTime: new Date('2026-11-22T18:00:00'),
      capacity: 16,
      bannerImage: '/uploads/murder-mystery-experience-1781098054-6114.jpg',
      tickets: [
        { name: 'Detective Pass', price: 2500, qty: 16 },
      ]
    },
  ];

  const events = [];

  for (const eventData of eventsData) {
    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        venue: eventData.venue,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        capacity: eventData.capacity,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        bannerImage: eventData.bannerImage,
        organizerId: organizer.id,
      }
    });

    for (const ticket of eventData.tickets) {
      await prisma.ticketType.create({
        data: {
          eventId: event.id,
          name: ticket.name,
          price: ticket.price,
          qtyTotal: ticket.qty,
          qtyRemaining: ticket.qty,
          saleStart: new Date(),
          saleEnd: eventData.startTime,
        }
      });
    }

    events.push(event);
    console.log(`  ✅ Created: ${event.title}`);
  }

  // ─── 3. CREATE SAMPLE BOOKINGS ────────────────────────────────────
  // Create 3 sample bookings for the attendee
  for (let i = 0; i < 3; i++) {
    const ev = events[i];
    const ticketTypes = await prisma.ticketType.findMany({ where: { eventId: ev.id } });
    const ticket = ticketTypes[0];

    const booking = await prisma.booking.create({
      data: {
        attendeeId: attendee.id,
        eventId: ev.id,
        totalAmount: ticket.price * 2,
        status: 'CONFIRMED',
        qrCode: `data:image/png;base64,mockqr_${ev.id}_${i}`,
        items: {
          create: [{
            ticketTypeId: ticket.id,
            quantity: 2,
            unitPrice: ticket.price
          }]
        }
      }
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: ticket.price * 2,
        status: 'SUCCESS',
        processedAt: new Date()
      }
    });

    await prisma.ticketType.update({
      where: { id: ticket.id },
      data: { qtyRemaining: { decrement: 2 } }
    });
  }

  console.log('\n✅ Seed complete:');
  console.log('   4 users (admin, organizer, attendee, guest)');
  console.log('   6 real events with images');
  console.log('   3 sample bookings');
  console.log('\n   Login credentials:');
  console.log('   Admin:     admin@ems.com / Admin123!');
  console.log('   Organizer: organizer@ems.com / Organizer123!');
  console.log('   Attendee:  attendee@ems.com / Attendee123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
