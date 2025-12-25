'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['On Track', 'At Risk', 'Completed']),
});

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'On Track' as const,
    },
  });

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    if (!firestore || !user) return;

    const collectionRef = collection(firestore, `users/${user.uid}/projects`);

    addDocumentNonBlocking(collectionRef, { ...data, userId: user.uid, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: 'Project logged!' });
        reset();
        onOpenChange(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a New Project</DialogTitle>
          <DialogDescription>Track a new personal or professional project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input placeholder="Project Name" {...field} />}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Textarea placeholder="Project Description (optional)" {...field} />}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="On Track">On Track</SelectItem>
                        <SelectItem value="At Risk">At Risk</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
              )}
            />
          <DialogFooter>
            <Button type="submit">Log Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
