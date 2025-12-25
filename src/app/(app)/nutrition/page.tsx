'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, CookingPot } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import type { NutritionLog } from "@/lib/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function NutritionPage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();

    const nutritionQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/nutritionDiets`);
    }, [firestore, user]);

    const { data: nutritionLogs, isLoading: logsLoading, error } = useCollection<NutritionLog>(nutritionQuery);

    const handleNewLog = () => {
        if (!firestore || !user) return;

        const newLog: Omit<NutritionLog, 'id' | 'createdAt'> = {
            userId: user.uid,
            mealName: "Chicken and Rice",
            calories: 450,
            protein: 40,
            carbs: 50,
            fat: 10,
        };
        
        const nutritionCollectionRef = collection(firestore, `users/${user.uid}/nutritionDiets`);

        addDocumentNonBlocking(nutritionCollectionRef, { ...newLog, createdAt: serverTimestamp() })
            .then(() => {
                toast({ title: "Meal logged!" });
            });
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Nutrition</h1>
          <p className="text-muted-foreground">Track your meals and macronutrients from Firestore.</p>
        </div>
        <Button onClick={handleNewLog} disabled={isUserLoading || logsLoading}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Log Meal
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Meal History</CardTitle>
            <CardDescription>Your recent meal and nutrition logs.</CardDescription>
        </CardHeader>
        <CardContent>
            {(isUserLoading || logsLoading) && <Loader2 className="h-8 w-8 animate-spin mx-auto my-8" />}
            
            {!isUserLoading && !logsLoading && nutritionLogs && nutritionLogs.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Meal</TableHead>
                            <TableHead>Calories</TableHead>
                            <TableHead>Protein (g)</TableHead>
                            <TableHead>Carbs (g)</TableHead>
                            <TableHead>Fat (g)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {nutritionLogs.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{log.createdAt ? format(log.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                                <TableCell className="font-medium">{log.mealName}</TableCell>
                                <TableCell>{log.calories}</TableCell>
                                <TableCell>{log.protein}</TableCell>
                                <TableCell>{log.carbs}</TableCell>
                                <TableCell>{log.fat}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {!isUserLoading && !logsLoading && (!nutritionLogs || nutritionLogs.length === 0) && (
                <div className="text-center py-12">
                    <CookingPot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No meals logged yet.</p>
                    <p className="text-muted-foreground">Click "Log Meal" to get started.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
