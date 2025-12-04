import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Clock, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Invite {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  status: string;
  expires_at: string;
  created_at: string;
}

interface PendingInvitesProps {
  applicationId: string;
  refreshTrigger: number;
}

export function PendingInvites({ applicationId, refreshTrigger }: PendingInvitesProps) {
  const { toast } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvites = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cofounder_invites')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch invites:', error);
      } else {
        setInvites(data || []);
      }
      setIsLoading(false);
    };

    if (applicationId) {
      fetchInvites();
    }
  }, [applicationId, refreshTrigger]);

  const deleteInvite = async (inviteId: string) => {
    setDeletingId(inviteId);
    try {
      const { error } = await supabase
        .from('cofounder_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      setInvites(prev => prev.filter(i => i.id !== inviteId));
      toast({
        title: 'Invite Cancelled',
        description: 'The invitation has been cancelled.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Cancel',
        description: error.message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invites.length === 0) {
    return null;
  }

  const pendingInvites = invites.filter(i => i.status === 'pending');

  if (pendingInvites.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Pending Invitations ({pendingInvites.length})
      </h4>
      <div className="space-y-2">
        {pendingInvites.map((invite) => (
          <Card key={invite.id} className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">
                        {invite.name || invite.email}
                      </span>
                      {invite.role && (
                        <Badge variant="outline" className="text-xs">{invite.role}</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{invite.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                  onClick={() => deleteInvite(invite.id)}
                  disabled={deletingId === invite.id}
                >
                  {deletingId === invite.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
