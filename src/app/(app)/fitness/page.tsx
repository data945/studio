'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dumbbell, Loader2, PlusCircle } from 'lucide-react';
import AdaptiveProgression from '@/components/fitness/adaptive-progression';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { FitnessSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { DataTable, type ColumnDef } from '@/components/data/data-table';
import { NewFitnessSessionDialog } from '@/components/fitness/new-fitness-session-dialog';

const exerciseColumns: ColumnDef<FitnessSession['exerciseDetails'][0]>[] = [
    { accessorKey: 'exercise', header: 'Exercise' },
    { accessorKey: 'sets', header: 'Sets' },
    { accessorKey: 'reps', header: 'Reps' },
    { accessorKey: 'weight', header: 'Weight (kg)'},
    { accessorKey: 'rpe', header: 'RPE' },
    { accessorKey: 'formNotes', header: 'Form Notes', cell: ({row}) => row.original.formNotes || 'N/A' },
];

export default function FitnessPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fitnessQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/exerciseSessions`), orderBy('createdAt', 'desc'), limit(1));
  }, [firestore, user]);

  const { data: sessions, isLoading: sessionsLoading, error } = useCollection<FitnessSession>(fitnessQuery);

  const latestSession = sessions?.[0];

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Fitness Optimization</h1>
          <p className="text-muted-foreground">Log workouts, track progress, and get intelligent progression from Firestore.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} disabled={isUserLoading || sessionsLoading} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Log Workout
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Workout</CardTitle>
                    {(isUserLoading || sessionsLoading) && <Loader2 className="h-6 w-6 animate-spin" />}
                    {latestSession && (
                      <CardDescription>
                        {latestSession.routineName} - {latestSession.createdAt ? format(latestSession.createdAt.toDate(), 'yyyy-MM-dd') : ''}
                      </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    {!isUserLoading && !sessionsLoading && !latestSession && (
                      <div className="text-center py-12">
                          <p className="text-muted-foreground">No workouts logged yet.</p>
                          <p className="text-muted-foreground">Click "Log Workout" to get started.</p>
                      </div>
                    )}
                    {latestSession && (
                      <DataTable columns={exerciseColumns} data={latestSession.exerciseDetails} />
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Adaptive Progression
              </CardTitle>
              <CardDescription>Let AI suggest your next challenge based on your performance.</CardDescription>
            </CardHeader>
            <CardContent>
              {latestSession ? <AdaptiveProgression performanceData={latestSession} /> : <p className="text-sm text-muted-foreground">Log a workout to get a suggestion.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
      <NewFitnessSessionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
