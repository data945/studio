'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Loader2, BarChart } from 'lucide-react';
import { crossDomainInsights, type CrossDomainInsightsOutput } from '@/ai/flows/cross-domain-insights';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { DeepWorkSession, SleepLog, NutritionLog, FitnessSession } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function calculateAverage(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return parseFloat((sum / arr.length).toFixed(1));
}

export default function InsightsPage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();

    const [insights, setInsights] = useState<CrossDomainInsightsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [averageScores, setAverageScores] = useState({
        sleepQuality: 0,
        deepWorkPerformance: 0,
        nutritionScore: 0,
        exerciseConsistency: 0,
    });

    const deepWorkQuery = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/deepWorkSessions`) : null, [firestore, user]);
    const sleepQuery = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/sleepOptimizations`) : null, [firestore, user]);
    const nutritionQuery = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/nutritionDiets`) : null, [firestore, user]);
    const fitnessQuery = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/fitness-sessions`) : null, [firestore, user]);

    const { data: deepWorkSessions, isLoading: deepWorkLoading } = useCollection<DeepWorkSession>(deepWorkQuery);
    const { data: sleepLogs, isLoading: sleepLoading } = useCollection<SleepLog>(sleepQuery);
    const { data: nutritionLogs, isLoading: nutritionLoading } = useCollection<NutritionLog>(nutritionQuery);
    const { data: fitnessSessions, isLoading: fitnessLoading } = useCollection<FitnessSession>(fitnessQuery);

    useEffect(() => {
        const scores = {
            sleepQuality: calculateAverage(sleepLogs?.map(log => log.quality) ?? []),
            deepWorkPerformance: calculateAverage(deepWorkSessions?.map(s => s.confidence) ?? []),
            // Simple nutrition score: average protein intake, capped at 10 for simplicity.
            nutritionScore: Math.min(10, calculateAverage(nutritionLogs?.map(log => log.protein / 15) ?? [])),
            // Simple exercise score: based on RPE
            exerciseConsistency: calculateAverage(fitnessSessions?.flatMap(s => s.logs).map(l => l.rpe) ?? []),
        };
        setAverageScores(scores);
    }, [deepWorkSessions, sleepLogs, nutritionLogs, fitnessSessions]);

    const handleAnalysis = async () => {
        setIsLoading(true);
        setInsights(null);
        try {
            const result = await crossDomainInsights({
                sleepQuality: averageScores.sleepQuality,
                deepWorkPerformance: averageScores.deepWorkPerformance,
                nutritionScore: averageScores.nutritionScore,
                exerciseConsistency: averageScores.exerciseConsistency,
            });
            setInsights(result);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error generating insights',
                description: 'An unexpected error occurred. Please try again.',
            });
        }
        setIsLoading(false);
    };
    
    const dataIsLoading = isUserLoading || deepWorkLoading || sleepLoading || nutritionLoading || fitnessLoading;

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Cross-Domain Insights</h1>
                <p className="text-muted-foreground">AI-powered analysis of your life domains based on your logged data.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Data Analysis</CardTitle>
                        <CardDescription>Click the button to generate insights based on your recent activity.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Average Scores</CardTitle>
                                <CardDescription>These scores are calculated from your logged data and will be fed to the AI.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dataIsLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : (
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="font-medium">Sleep Quality: <span className="font-bold text-primary">{averageScores.sleepQuality.toFixed(1)}/10</span></div>
                                        <div className="font-medium">Deep Work Performance: <span className="font-bold text-primary">{averageScores.deepWorkPerformance.toFixed(1)}/10</span></div>
                                        <div className="font-medium">Nutrition Score: <span className="font-bold text-primary">{averageScores.nutritionScore.toFixed(1)}/10</span></div>
                                        <div className="font-medium">Exercise Performance: <span className="font-bold text-primary">{averageScores.exerciseConsistency.toFixed(1)}/10</span></div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Button onClick={handleAnalysis} disabled={isLoading || dataIsLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                            Generate Insights
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" /> AI Generated Insights</CardTitle>
                        <CardDescription>Correlations and recommendations from the AI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!insights && !isLoading && (
                            <div className="text-center text-muted-foreground py-8">
                                <Lightbulb className="h-8 w-8 mx-auto mb-2" />
                                <p>Your insights will appear here.</p>
                            </div>
                        )}
                        {isLoading && <Loader2 className="h-8 w-8 animate-spin mx-auto my-8" />}
                        {insights && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-2 text-base">Insights:</h4>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                        {insights.insights.map((insight, index) => <li key={index}>{insight}</li>)}
                                    </ul>
                                </div>
                                <div className="border-t pt-6">
                                    <h4 className="font-semibold mb-2 text-base">Recommendations:</h4>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                        {insights.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                         {!insights && !isLoading && (
                            <Alert>
                                <AlertTitle>No data yet?</AlertTitle>
                                <AlertDescription>
                                    Make sure you have logged data in the Deep Work, Sleep, Nutrition, and Fitness modules to generate insights.
                                </AlertDescription>
                            </Alert>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
