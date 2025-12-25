'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import type { DeepWorkSession } from "@/lib/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";


export default function DeepWorkPage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();

    const deepWorkQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/deepWorkSessions`);
    }, [firestore, user]);

    const { data: sessions, isLoading: sessionsLoading, error } = useCollection<DeepWorkSession>(deepWorkQuery);

    const handleNewSession = () => {
        if (!firestore || !user) return;

        const newSession: Omit<DeepWorkSession, 'id' | 'createdAt'> = {
            userId: user.uid,
            topic: "New Session Topic",
            duration: 60,
            confidence: 5,
            blockages: 'None',
        };
        
        const sessionsCollectionRef = collection(firestore, `users/${user.uid}/deepWorkSessions`);

        addDocumentNonBlocking(sessionsCollectionRef, { ...newSession, createdAt: serverTimestamp() })
            .then(() => {
                toast({ title: "Session logged!" });
            });
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Deep Work</h1>
          <p className="text-muted-foreground">Track study sessions, confidence, and blockages from Firestore.</p>
        </div>
        <Button onClick={handleNewSession} disabled={isUserLoading || sessionsLoading}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Log Session
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>Your recent deep work and study sessions.</CardDescription>
        </CardHeader>
        <CardContent>
            {(isUserLoading || sessionsLoading) && <Loader2 className="h-8 w-8 animate-spin mx-auto my-8" />}
            
            {!isUserLoading && !sessionsLoading && sessions && sessions.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead>Blockages</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((session) => (
                            <TableRow key={session.id}>
                                <TableCell>{session.createdAt ? format(session.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                                <TableCell className="font-medium">{session.topic}</TableCell>
                                <TableCell>{session.duration} min</TableCell>
                                <TableCell>
                                    <Badge variant={session.confidence > 7 ? 'default' : session.confidence > 4 ? 'secondary' : 'destructive'} className="bg-primary/20 text-primary hover:bg-primary/30">
                                        {session.confidence}/10
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-xs truncate">{session.blockages || 'None'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {!isUserLoading && !sessionsLoading && (!sessions || sessions.length === 0) && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No deep work sessions logged yet.</p>
                    <p className="text-muted-foreground">Click "Log Session" to get started.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
