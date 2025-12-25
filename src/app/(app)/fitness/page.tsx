'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dumbbell, Loader2, PlusCircle } from "lucide-react";
import AdaptiveProgression from "@/components/fitness/adaptive-progression";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import type { FitnessSession } from "@/lib/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function FitnessPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const fitnessQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/fitness-sessions`);
  }, [firestore, user]);

  const { data: sessions, isLoading: sessionsLoading, error } = useCollection<FitnessSession>(fitnessQuery);

  const latestSession = sessions ? sessions.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0] : null;

  const handleNewSession = () => {
    if (!firestore || !user) return;

    const newSession: Omit<FitnessSession, 'id' | 'createdAt'> = {
      userId: user.uid,
      name: "New Push Day",
      logs: [
        { id: '1', exercise: 'Bench Press', sets: 3, reps: 8, weight: 80, rpe: 8 },
        { id: '2', exercise: 'Overhead Press', sets: 3, reps: 10, weight: 50, rpe: 7 },
        { id: '3', exercise: 'Tricep Pushdown', sets: 3, reps: 12, weight: 25, rpe: 8 },
      ]
    };
    
    const sessionsCollectionRef = collection(firestore, `users/${user.uid}/fitness-sessions`);

    addDocumentNonBlocking(sessionsCollectionRef, { ...newSession, createdAt: serverTimestamp() })
        .then(() => {
            toast({ title: "Workout logged!" });
        });
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Fitness Tracking</h1>
          <p className="text-muted-foreground">Log workouts, track progress, and get intelligent progression from Firestore.</p>
        </div>
        <Button onClick={handleNewSession} disabled={isUserLoading || sessionsLoading}>
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
                        {latestSession.name} - {latestSession.createdAt ? format(latestSession.createdAt.toDate(), 'yyyy-MM-dd') : ''}
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
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Exercise</TableHead>
                                  <TableHead>Sets</TableHead>
                                  <TableHead>Reps</TableHead>
                                  <TableHead>Weight (kg)</TableHead>
                                  <TableHead>RPE</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {latestSession.logs.map((log) => (
                                  <TableRow key={log.id}>
                                      <TableCell className="font-medium">{log.exercise}</TableCell>
                                      <TableCell>{log.sets}</TableCell>
                                      <TableCell>{log.reps}</TableCell>
                                      <TableCell>{log.weight}</TableCell>
                                      <TableCell>{log.rpe}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
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
    </div>
  );
}
