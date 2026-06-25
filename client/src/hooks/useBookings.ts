import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Booking } from '../types';

export function useMyBookings() {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const { data } = await api.get<Booking[]>('/bookings/my-bookings');
      return data;
    }
  });
}
