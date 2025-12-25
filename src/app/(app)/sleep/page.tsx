import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { sleepLogs } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, Bed, AlertCircle } from "lucide-react";

export default function SleepPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Sleep Optimization</h1>
          <p className="text-muted-foreground">Track actual vs. planned sleep, quality, and obstacles.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Log Sleep
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sleepLogs.map(log => (
            <Card key={log.id}>
                <CardHeader>
                    <CardTitle>{log.date}</CardTitle>
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
                    {log.obstacles.length > 0 && (
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
    </div>
  );
}
