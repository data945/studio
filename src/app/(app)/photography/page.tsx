'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Camera } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import type { PhotographySession } from "@/lib/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function PhotographyPage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();

    const photographyQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/photographySessions`);
    }, [firestore, user]);

    const { data: sessions, isLoading: sessionsLoading, error } = useCollection<PhotographySession>(photographyQuery);

    const handleNewSession = () => {
        if (!firestore || !user) return;

        const newSession: Omit<PhotographySession, 'id' | 'createdAt'> = {
            userId: user.uid,
            shotCounter: 50,
            qualityAssessment: 3,
            editingPipeline: 'Raw',
            skillGapAnalysis: 'Struggled with low light focus.'
        };
        
        const sessionsCollectionRef = collection(firestore, `users/${user.uid}/photographySessions`);

        addDocumentNonBlocking(sessionsCollectionRef, { ...newSession, createdAt: serverTimestamp() })
            .then(() => {
                toast({ title: "Photography session logged!" });
            });
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Photography</h1>
          <p className="text-muted-foreground">Track your photo sessions, ratings, and workflow from Firestore.</p>
        </div>
        <Button onClick={handleNewSession} disabled={isUserLoading || sessionsLoading}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Log Session
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>Your recent photography workflow tracking.</CardDescription>
        </CardHeader>
        <CardContent>
            {(isUserLoading || sessionsLoading) && <Loader2 className="h-8 w-8 animate-spin mx-auto my-8" />}
            
            {!isUserLoading && !sessionsLoading && sessions && sessions.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Shots Taken</TableHead>
                            <TableHead>Quality</TableHead>
                            <TableHead>Pipeline</TableHead>
                            <TableHead>Skill Gaps</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((session) => (
                            <TableRow key={session.id}>
                                <TableCell>{session.createdAt ? format(session.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                                <TableCell className="font-medium">{session.shotCounter}</TableCell>
                                <TableCell>
                                    <Badge variant={session.qualityAssessment > 3 ? 'default' : session.qualityAssessment > 1 ? 'secondary' : 'destructive'} className="bg-primary/20 text-primary hover:bg-primary/30">
                                        {session.qualityAssessment}/5
                                    </Badge>
                                </TableCell>
                                <TableCell>{session.editingPipeline}</TableCell>
                                <TableCell className="text-muted-foreground max-w-xs truncate">{session.skillGapAnalysis || 'None'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {!isUserLoading && !sessionsLoading && (!sessions || sessions.length === 0) && (
                <div className="text-center py-12">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No photography sessions logged yet.</p>
                    <p className="text-muted-foreground">Click "Log Session" to get started.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
