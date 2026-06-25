import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Event } from '../types';

export function useEvents(filters?: any) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const { data } = await api.get<Event[]>('/events', { params: filters });
      return data;
    }
  });
}

export function useEventDetail(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get<Event>(`/events/${id}`);
      return data;
    },
    enabled: !!id
  });
}
