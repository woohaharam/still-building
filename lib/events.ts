import { supabaseClient } from './supabase';
import { CalendarEvent } from './types';

export async function getEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabaseClient
    .from('events')
    .select('*')
    .order('start_date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: true });

  if (error) {
    console.error('Failed to fetch events:', error.message);
    return [];
  }

  return data as CalendarEvent[];
}
