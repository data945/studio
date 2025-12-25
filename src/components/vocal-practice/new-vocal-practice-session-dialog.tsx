'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const vocalPracticeSessionSchema = z.object({
  curriculum: z.string().min(1, 'Curriculum is required'),
  subCurriculum: z.string().min(1, 'Sub-curriculum is required'),
  exercise: z.string().min(1, 'Exercise is required'),
  performanceScore: z.coerce.number().min(0).max(10),
  strugglePointTag: z.string().optional(),
});

interface NewVocalPracticeSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewVocalPracticeSessionDialog({ open, onOpenChange }: NewVocalPracticeSessionDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(vocalPracticeSessionSchema),
    defaultValues: {
      curriculum: '',
      subCurriculum: '',
      exercise: '',
      performanceScore: 5,
      strugglePointTag: '',
    },
  });

  const onSubmit = (data: z.infer<typeof vocalPracticeSessionSchema>) => {
    if (!firestore || !user) return;

    const collectionRef = collection(firestore, `users/${user.uid}/vocalPracticeSessions`);

    addDocumentNonBlocking(collectionRef, { ...data, userId: user.uid, createdAt: serverTimestamp(), timeBlockId: 'temp-id' })
      .then(() => {
        toast({ title: 'Vocal session logged!' });
        reset();
        onOpenChange(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a New Vocal Session</DialogTitle>
          <DialogDescription>Record your practice details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="curriculum"
              control={control}
              render={({ field }) => <Input placeholder="Curriculum" {...field} />}
            />
            <Controller
              name="subCurriculum"
              control={control}
              render={({ field }) => <Input placeholder="Sub-Curriculum" {...field} />}
            />
            <Controller
              name="exercise"
              control={control}
              render={({ field }) => <Input placeholder="Exercise" {...field} />}
            />
            <Controller
                name="performanceScore"
                control={control}
                render={({ field }) => (
                    <div>
                        <label>Performance Score: {field.value}/10</label>
                        <Input type="range" min="0" max="10" {...field} />
                    </div>
                )}
            />
            <Controller
              name="strugglePointTag"
              control={control}
              render={({ field }) => <Input placeholder="Struggle Point (optional)" {...field} />}
            />
          <DialogFooter>
            <Button type="submit">Log Session</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
