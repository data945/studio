import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deepWorkSessions } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function DeepWorkPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Deep Work</h1>
          <p className="text-muted-foreground">Track study sessions, confidence, and blockages.</p>
        </div>
        <Button>
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
                    {deepWorkSessions.map((session) => (
                        <TableRow key={session.id}>
                            <TableCell>{session.date}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
