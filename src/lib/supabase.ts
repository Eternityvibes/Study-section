/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  // Verify it is a valid HTTP/HTTPS URL to avoid crashing the application
  const isValidUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');
  if (!isValidUrl) {
    console.warn('VITE_SUPABASE_URL is not a valid HTTP or HTTPS URL.');
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      return null;
    }
  }
  return supabaseClient;
}

export interface SyncData {
  sync_code: string;
  state: any;
  updated_at: string;
}

/**
 * Generate a random human-friendly sync code (e.g. E-4821-X)
 */
export function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SYNC-${part1}-${part2}`;
}

/**
 * Upload state to Supabase tracker_sync table
 */
export async function uploadStateToSupabase(
  client: SupabaseClient,
  syncCode: string,
  state: any
): Promise<void> {
  const { error } = await client
    .from('tracker_sync')
    .upsert({
      sync_code: syncCode,
      state: state,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'sync_code'
    });

  if (error) {
    throw new Error(`Supabase Upsert Error: ${error.message}`);
  }
}

/**
 * Download state from Supabase tracker_sync table
 */
export async function downloadStateFromSupabase(
  client: SupabaseClient,
  syncCode: string
): Promise<any | null> {
  const { data, error } = await client
    .from('tracker_sync')
    .select('state')
    .eq('sync_code', syncCode)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase Query Error: ${error.message}`);
  }

  if (data && data.state) {
    let parsedState = data.state;
    if (typeof parsedState === 'string') {
      try {
        parsedState = JSON.parse(parsedState);
      } catch (e) {
        console.error('Failed to parse downloaded state JSON:', e);
      }
    }
    return parsedState;
  }

  return null;
}

/**
 * Subscribe to real-time changes for a sync code with connection status monitoring
 */
export function subscribeToSyncChanges(
  client: SupabaseClient,
  syncCode: string,
  onUpdate: (newState: any) => void,
  onStatusChange?: (status: string, err?: any) => void
) {
  const channel = client
    .channel(`realtime_tracker_sync_${syncCode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tracker_sync',
        filter: `sync_code=eq.${syncCode}`,
      },
      (payload: any) => {
        if (payload.new && payload.new.state) {
          let parsedState = payload.new.state;
          if (typeof parsedState === 'string') {
            try {
              parsedState = JSON.parse(parsedState);
            } catch (e) {
              console.error('Failed to parse realtime state JSON:', e);
              return;
            }
          }
          onUpdate(parsedState);
        }
      }
    );

  channel.subscribe((status, err) => {
    if (onStatusChange) {
      onStatusChange(status, err);
    }
  });

  return channel;
}
