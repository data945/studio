'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Clapperboard } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import type { YoutubeLectureProduction } from "@/lib/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const workflowStageColors: Record<YoutubeLectureProduction['workflowStage'], string> = {
    'Learning': 'bg-blue-500',
    'Scripting': 'bg-purple-500',
    'Recording': 'bg-red-500',
    'Audio Enhancement': 'bg-yellow-500',
    'Visual Enhancement': 'bg-orange-500',
    'Publishing': 'bg-green-500',
    'Analytics Review': 'bg-indigo-500',
}

export default function YoutubePage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();

    const youtubeQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/youtubeLectureProductions`);
    }, [firestore, user]);

    const { data: productions, isLoading: productionsLoading, error } = useCollection<YoutubeLectureProduction>(youtubeQuery);

    const handleNewProduction = () => {
        if (!firestore || !user) return;

        const newProduction: Omit<YoutubeLectureProduction, 'id' | 'createdAt' | 'timeBlockId'> = {
            userId: user.uid,
            workflowStage: 'Learning',
            syllabusAlignment: 'New Video Topic',
            qualityFeedbackLoop: 'N/A'
        };
        
        const productionsCollectionRef = collection(firestore, `users/${user.uid}/youtubeLectureProductions`);

        addDocumentNonBlocking(productionsCollectionRef, { ...newProduction, timeBlockId: 'temp-id', createdAt: serverTimestamp() })
            .then(() => {
                toast({ title: "YouTube production logged!" });
            });
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">YouTube Production</h1>
          <p className="text-muted-foreground">Track your video creation workflow from Firestore.</p>
        </div>
        <Button onClick={handleNewProduction} disabled={isUserLoading || productionsLoading}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Log Production Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Production History</CardTitle>
            <CardDescription>Your recent YouTube lecture production entries.</CardDescription>
        </CardHeader>
        <CardContent>
            {(isUserLoading || productionsLoading) && <Loader2 className="h-8 w-8 animate-spin mx-auto my-8" />}
            
            {!isUserLoading && !productionsLoading && productions && productions.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Syllabus Alignment</TableHead>
                            <TableHead>Workflow Stage</TableHead>
                            <TableHead>Quality Feedback</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productions.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((production) => (
                            <TableRow key={production.id}>
                                <TableCell>{production.createdAt ? format(production.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                                <TableCell className="font-medium">{production.syllabusAlignment}</TableCell>
                                <TableCell>
                                    <Badge>
                                        <span className={`mr-2 h-2 w-2 rounded-full ${workflowStageColors[production.workflowStage]}`}></span>
                                        {production.workflowStage}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-xs truncate">{production.qualityFeedbackLoop || 'None'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {!isUserLoading && !productionsLoading && (!productions || productions.length === 0) && (
                <div className="text-center py-12">
                    <Clapperboard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No production entries logged yet.</p>
                    <p className="text-muted-foreground">Click "Log Production Entry" to get started.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
