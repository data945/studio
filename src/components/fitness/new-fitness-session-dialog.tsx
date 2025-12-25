'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2 } from 'lucide-react';

const exerciseSchema = z.object({
  exercise: z.string().min(1, 'Exercise name is required'),
  sets: z.coerce.number().min(1, 'Sets must be at least 1'),
  reps: z.coerce.number().min(1, 'Reps must be at least 1'),
  weight: z.coerce.number().optional(),
  rpe: z.coerce.number().optional(),
  formNotes: z.string().optional(),
});

const fitnessSessionSchema = z.object({
  routineName: z.string().min(1, 'Routine name is required'),
  exerciseDetails: z.array(exerciseSchema).min(1, 'Add at least one exercise'),
});

interface NewFitnessSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewFitnessSessionDialog({ open, onOpenChange }: NewFitnessSessionDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { control, handleSubmit, reset } = useForm<z.infer<typeof fitnessSessionSchema>>({
    resolver: zodResolver(fitnessSessionSchema),
    defaultValues: {
      routineName: '',
      exerciseDetails: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exerciseDetails',
  });

  const onSubmit = (data: z.infer<typeof fitnessSessionSchema>) => {
    if (!firestore || !user) return;

    const collectionRef = collection(firestore, `users/${user.uid}/exerciseSessions`);

    addDocumentNonBlocking(collectionRef, { ...data, userId: user.uid, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: 'Workout logged!' });
        reset();
        onOpenChange(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log a New Workout</DialogTitle>
          <DialogDescription>Record your training session details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="routineName"
              control={control}
              render={({ field }) => <Input placeholder="Routine Name" {...field} />}
            />
            
            <div>
              <h3 className="text-lg font-medium">Exercises</h3>
              {fields.map((item, index) => (
                <div key={item.id} className="space-y-2 p-2 border-b">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Exercise {index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <Controller name={`exerciseDetails.${index}.exercise`} control={control} render={({ field }) => <Input placeholder="Exercise" {...field} />} />
                  <div className="grid grid-cols-2 gap-2">
                    <Controller name={`exerciseDetails.${index}.sets`} control={control} render={({ field }) => <Input type="number" placeholder="Sets" {...field} />} />
                    <Controller name={`exerciseDetails.${index}.reps`} control={control} render={({ field }) => <Input type="number" placeholder="Reps" {...field} />} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Controller name={`exerciseDetails.${index}.weight`} control={control} render={({ field }) => <Input type="number" placeholder="Weight (kg)" {...field} />} />
                    <Controller name={`exerciseDetails.${index}.rpe`} control={control} render={({ field }) => <Input type="number" placeholder="RPE" {...field} />} />
                  </div>
                  <Controller name={`exerciseDetails.${index}.formNotes`} control={control} render={({ field }) => <Textarea placeholder="Form Notes" {...field} />} />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ exercise: '', sets: 0, reps: 0, weight: 0, rpe: 0, formNotes: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
              </Button>
            </div>

          <DialogFooter>
            <Button type="submit">Log Workout</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
