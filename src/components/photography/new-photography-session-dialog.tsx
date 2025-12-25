'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const photographySessionSchema = z.object({
  shotCounter: z.coerce.number().min(1, 'Shot counter is required'),
  qualityAssessment: z.coerce.number().min(1).max(5),
  editingPipeline: z.string().min(1, 'Editing pipeline is required'),
  skillGapAnalysis: z.string().optional(),
});

interface NewPhotographySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewPhotographySessionDialog({ open, onOpenChange }: NewPhotographySessionDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(photographySessionSchema),
    defaultValues: {
      shotCounter: 0,
      qualityAssessment: 3,
      editingPipeline: '',
      skillGapAnalysis: '',
    },
  });

  const onSubmit = (data: z.infer<typeof photographySessionSchema>) => {
    if (!firestore || !user) return;

    const collectionRef = collection(firestore, `users/${user.uid}/photographySessions`);

    addDocumentNonBlocking(collectionRef, { ...data, userId: user.uid, createdAt: serverTimestamp(), timeBlockId: 'temp-id' })
      .then(() => {
        toast({ title: 'Photography session logged!' });
        reset();
        onOpenChange(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a New Photography Session</DialogTitle>
          <DialogDescription>Record your session details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="shotCounter"
              control={control}
              render={({ field }) => <Input type="number" placeholder="Shots Taken" {...field} />}
            />
             <Controller
                name="qualityAssessment"
                control={control}
                render={({ field }) => (
                    <div>
                        <label>Quality Assessment: {field.value}/5</label>
                        <Input type="range" min="1" max="5" {...field} />
                    </div>
                )}
            />
            <Controller
              name="editingPipeline"
              control={control}
              render={({ field }) => <Input placeholder="Editing Pipeline" {...field} />}
            />
            <Controller
              name="skillGapAnalysis"
              control={control}
              render={({ field }) => <Textarea placeholder="Skill Gap Analysis (optional)" {...field} />}
            />
          <DialogFooter>
            <Button type="submit">Log Session</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
