export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE' | 'GUEST';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  qtyTotal: number;
  qtyRemaining: number;
  saleStart: string;
  saleEnd: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  latitude?: number;
  longitude?: number;
  startTime: string;
  endTime: string;
  capacity: number;
  status: string;
  visibility: string;
  bannerImage?: string;
  organizer?: { user: { name: string } };
  ticketTypes?: TicketType[];
}

export interface BookingItem {
  id: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  ticketType?: TicketType;
}

export interface Booking {
  id: string;
  attendeeId: string;
  eventId: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  qrCode?: string;
  createdAt: string;
  event?: Event;
  items?: BookingItem[];
}
