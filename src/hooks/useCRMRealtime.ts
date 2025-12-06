import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type CRMTable = 'crm_contacts' | 'crm_interactions' | 'crm_tasks';

interface UseCRMRealtimeOptions {
  tables: CRMTable[];
  onContactChange?: (payload: any) => void;
  onInteractionChange?: (payload: any) => void;
  onTaskChange?: (payload: any) => void;
  showToasts?: boolean;
}

export function useCRMRealtime({
  tables,
  onContactChange,
  onInteractionChange,
  onTaskChange,
  showToasts = true,
}: UseCRMRealtimeOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel('crm-realtime');

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload) => {
          console.log(`[CRM Realtime] ${table}:`, payload);

          // Invalidate relevant queries
          if (table === 'crm_contacts') {
            queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
            queryClient.invalidateQueries({ queryKey: ['crm-contact'] });
            queryClient.invalidateQueries({ queryKey: ['crm-dashboard'] });
            onContactChange?.(payload);
            
            if (showToasts && payload.eventType === 'INSERT') {
              const newContact = payload.new as { full_name?: string; phone?: string };
              toast.info('New Contact', {
                description: `${newContact.full_name || newContact.phone || 'Unknown'} added`,
              });
            }
          }

          if (table === 'crm_interactions') {
            queryClient.invalidateQueries({ queryKey: ['crm-interactions'] });
            queryClient.invalidateQueries({ queryKey: ['crm-contact'] });
            queryClient.invalidateQueries({ queryKey: ['crm-dashboard'] });
            onInteractionChange?.(payload);
            
            if (showToasts && payload.eventType === 'INSERT') {
              const interaction = payload.new as { channel?: string };
              toast.info('New Interaction', {
                description: `${interaction.channel || 'Unknown'} interaction recorded`,
              });
            }
          }

          if (table === 'crm_tasks') {
            queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['crm-contact'] });
            onTaskChange?.(payload);
            
            if (showToasts && payload.eventType === 'INSERT') {
              const task = payload.new as { title?: string };
              toast.info('New Task', {
                description: task.title || 'New task created',
              });
            }
          }
        }
      );
    });

    channel.subscribe((status) => {
      console.log('[CRM Realtime] Subscription status:', status);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tables, queryClient, onContactChange, onInteractionChange, onTaskChange, showToasts]);
}
