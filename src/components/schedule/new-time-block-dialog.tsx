
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirebase } from '@/firebase';
import { collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const domains = [
  'Deep Work', 'Projects', 'Fitness', 'Vocal', 'Photography', 'YouTube',
  'Sleep', 'Nutrition', 'Expenses', 'Other'
];

interface NewTimeBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTimeBlockDialog({ open, onOpenChange }: NewTimeBlockDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !firestore || !description || !domain || !date || !startTime || !endTime) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill out all the fields to create a time block.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        if (endDateTime <= startDateTime) {
            toast({
                variant: 'destructive',
                title: 'Invalid time range',
                description: 'End time must be after start time.',
            });
            setIsSubmitting(false);
            return;
        }

      const newTimeBlock = {
        userId: user.uid,
        description,
        domain,
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime),
        completed: false,
        createdAt: serverTimestamp(),
      };

      const timeBlocksCollection = collection(firestore, `users/${user.uid}/timeBlocks`);
      await addDocumentNonBlocking(timeBlocksCollection, newTimeBlock);

      toast({
        title: 'Time block created!',
        description: `Scheduled "${description}" for ${date}.`,
      });
      
      onOpenChange(false); // Close dialog on success
      // Reset form
      setDescription('');
      setDomain('');

    } catch (error) {
      console.error("Error creating time block: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the time block. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Time Block</DialogTitle>
          <DialogDescription>
            Add a new activity to your schedule. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Work on project presentation"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="domain" className="text-right">
              Domain
            </Label>
            <Select onValueChange={setDomain} value={domain}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                    {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
