'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, Bed, AlertCircle, Loader2 } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import type { SleepLog } from "@/lib/types";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function SleepPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const sleepQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/sleepOptimizations`);
  }, [firestore, user]);

  const { data: sleepLogs, isLoading: logsLoading, error } = useCollection<SleepLog>(sleepQuery);

  const handleNewLog = () => {
    if (!firestore || !user) return;
    
    const newLog: Omit<SleepLog, 'id' | 'createdAt'> = {
        userId: user.uid,
        plannedBedtime: '22:00',
        actualBedtime: '22:30',
        quality: 7,
        obstacles: ['Late snack'],
    };

    const sleepCollectionRef = collection(firestore, `users/${user.uid}/sleepOptimizations`);

    addDocumentNonBlocking(sleepCollectionRef, { ...newLog, createdAt: serverTimestamp() })
        .then(() => {
            toast({ title: "Sleep log added!" });
        });
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Sleep Optimization</h1>
          <p className="text-muted-foreground">Track actual vs. planned sleep, quality, and obstacles from Firestore.</p>
        </div>
        <Button onClick={handleNewLog} disabled={isUserLoading || logsLoading}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Log Sleep
        </Button>
      </div>
      
      {(isUserLoading || logsLoading) && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader><Loader2 className="h-8 w-8 animate-spin" /></CardHeader></Card>
          <Card><CardHeader><Loader2 className="h-8 w-8 animate-spin" /></CardHeader></Card>
          <Card><CardHeader><Loader2 className="h-8 w-8 animate-spin" /></CardHeader></Card>
        </div>
      )}
      
      {!isUserLoading && !logsLoading && sleepLogs && sleepLogs.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sleepLogs.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map(log => (
              <Card key={log.id}>
                  <CardHeader>
                      <CardTitle>{log.createdAt ? format(log.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</CardTitle>
                      <CardDescription>
                          Quality: <Badge variant={log.quality > 7 ? 'default' : log.quality > 4 ? 'secondary' : 'destructive'} className="bg-accent/20 text-accent-foreground hover:bg-accent/30">{log.quality}/10</Badge>
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Planned: {log.plannedBedtime}</span>
                      </div>
                      <div className="flex items-center text-sm">
                          <Bed className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Actual: {log.actualBedtime}</span>
                      </div>
                      {log.obstacles && log.obstacles.length > 0 && (
                          <div className="flex items-start text-sm">
                              <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                              <div>
                                  <span className="font-medium">Obstacles:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                      {log.obstacles.map(obs => <Badge key={obs} variant="outline">{obs}</Badge>)}
                                  </div>
                              </div>
                          </div>
                      )}
                  </CardContent>
              </Card>
          ))}
        </div>
      )}

      {!isUserLoading && !logsLoading && (!sleepLogs || sleepLogs.length === 0) && (
        <Card className="text-center py-12">
            <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>No sleep logs yet</CardTitle>
            <CardDescription>Click "Log Sleep" to add your first entry.</CardDescription>
        </Card>
      )}
    </div>
  );
}
