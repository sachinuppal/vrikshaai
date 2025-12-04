import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cofounderSchema, type Cofounder } from '@/lib/validations/applicationSchema';
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
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserPlus } from 'lucide-react';

interface AddCofounderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (cofounder: Cofounder) => void;
  editingCofounder?: Cofounder | null;
  editingIndex?: number | null;
}

export function AddCofounderModal({ open, onOpenChange, onAdd, editingCofounder, editingIndex }: AddCofounderModalProps) {
  const form = useForm<Cofounder>({
    resolver: zodResolver(cofounderSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      linkedin: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (editingCofounder) {
      form.reset(editingCofounder);
    } else {
      form.reset({
        name: '',
        email: '',
        role: '',
        linkedin: '',
        phone: '',
      });
    }
  }, [editingCofounder, form]);

  const onSubmit = (data: Cofounder) => {
    onAdd(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            {editingCofounder ? 'Edit Co-founder' : 'Add Co-founder'}
          </DialogTitle>
          <DialogDescription>
            Enter the details of your co-founder
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
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
                  <FormLabel>Role *</FormLabel>
                  <FormControl>
                    <Input placeholder="CTO, CMO, COO, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCofounder ? 'Save Changes' : 'Add Co-founder'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
