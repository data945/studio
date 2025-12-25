import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fitnessLogs } from "@/lib/data";
import { Dumbbell } from "lucide-react";
import AdaptiveProgression from "@/components/fitness/adaptive-progression";

export default function FitnessPage() {
  const latestWorkout = fitnessLogs.filter(log => log.date === '2024-07-21');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Fitness Tracking</h1>
        <p className="text-muted-foreground">Log workouts, track progress, and get intelligent progression.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Push Day</CardTitle>
                    <CardDescription>Date: 2024-07-21</CardDescription>
                </CardHeader>
                <CardContent>
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
                            {latestWorkout.map((log) => (
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
              <AdaptiveProgression performanceData={latestWorkout} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
