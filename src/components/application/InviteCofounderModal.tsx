import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteSchema, type InviteData } from '@/lib/validations/applicationSchema';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, Send } from 'lucide-react';

interface InviteCofounderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  userId: string;
  onInviteSent: () => void;
}

export function InviteCofounderModal({ open, onOpenChange, applicationId, userId, onInviteSent }: InviteCofounderModalProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  
  const form = useForm<InviteData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      name: '',
      role: '',
    },
  });

  const onSubmit = async (data: InviteData) => {
    setIsSending(true);
    try {
      // Create invite record
      const { data: invite, error: insertError } = await supabase
        .from('cofounder_invites')
        .insert({
          application_id: applicationId,
          email: data.email,
          name: data.name || null,
          role: data.role || null,
          invited_by: userId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send invite email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-cofounder-invite', {
        body: {
          email: data.email,
          name: data.name,
          role: data.role,
          token: invite.token,
        },
      });

      if (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't throw - invite was created, email just failed
        toast({
          title: 'Invite Created',
          description: 'Invite was saved but email failed to send. They can still join using the invite link.',
        });
      } else {
        toast({
          title: 'Invitation Sent!',
          description: `An invitation has been sent to ${data.email}`,
        });
      }

      form.reset();
      onOpenChange(false);
      onInviteSent();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Invite',
        description: error.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Invite Co-founder
          </DialogTitle>
          <DialogDescription>
            Send an email invitation to your co-founder. They'll be able to join and edit the application.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cofounder@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="CTO, CMO, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
