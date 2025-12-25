'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, PlusCircle } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import type { VocalPracticeSession } from "@/lib/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function VocalPracticePage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();

    const vocalQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/vocalPracticeSessions`);
    }, [firestore, user]);

    const { data: sessions, isLoading: sessionsLoading, error } = useCollection<VocalPracticeSession>(vocalQuery);

    const handleNewSession = () => {
        if (!firestore || !user) return;

        const newSession: Omit<VocalPracticeSession, 'id' | 'createdAt'> = {
            userId: user.uid,
            curriculum: "New Age Voice",
            subCurriculum: "The Diaphragm",
            exercise: "Lip Rolls",
            performanceScore: 8,
            strugglePointTag: "High G#4",
        };
        
        const sessionsCollectionRef = collection(firestore, `users/${user.uid}/vocalPracticeSessions`);

        addDocumentNonBlocking(sessionsCollectionRef, { ...newSession, createdAt: serverTimestamp() })
            .then(() => {
                toast({ title: "Vocal session logged!" });
            });
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Vocal Practice</h1>
          <p className="text-muted-foreground">Track your singing sessions and performance scores from Firestore.</p>
        </div>
        <Button onClick={handleNewSession} disabled={isUserLoading || sessionsLoading}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Log Session
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Practice History</CardTitle>
            <CardDescription>Your recent vocal practice sessions.</CardDescription>
        </CardHeader>
        <CardContent>
            {(isUserLoading || sessionsLoading) && <Loader2 className="h-8 w-8 animate-spin mx-auto my-8" />}
            
            {!isUserLoading && !sessionsLoading && sessions && sessions.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Curriculum</TableHead>
                            <TableHead>Exercise</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Struggle Point</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((session) => (
                            <TableRow key={session.id}>
                                <TableCell>{session.createdAt ? format(session.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                                <TableCell className="font-medium">{session.curriculum} - {session.subCurriculum}</TableCell>
                                <TableCell>{session.exercise}</TableCell>
                                <TableCell>
                                    <Badge variant={session.performanceScore > 7 ? 'default' : session.performanceScore > 4 ? 'secondary' : 'destructive'} className="bg-primary/20 text-primary hover:bg-primary/30">
                                        {session.performanceScore}/10
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{session.strugglePointTag || 'None'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {!isUserLoading && !sessionsLoading && (!sessions || sessions.length === 0) && (
                <div className="text-center py-12">
                    <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No vocal sessions logged yet.</p>
                    <p className="text-muted-foreground">Click "Log Session" to get started.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
