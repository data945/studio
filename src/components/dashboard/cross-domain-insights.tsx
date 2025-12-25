'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { crossDomainInsights, type CrossDomainInsightsOutput } from '@/ai/flows/cross-domain-insights';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { DeepWorkSession, SleepLog, NutritionLog, FitnessSession } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function calculateAverage(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return parseFloat((sum / arr.length).toFixed(1));
}


export default function CrossDomainInsights() {
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

  const dataIsLoading = isUserLoading || deepWorkLoading || sleepLoading || nutritionLoading || fitnessLoading;

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

  return (
    <div className="space-y-6">
      <Button onClick={handleAnalysis} disabled={isLoading || dataIsLoading} className="w-full">
        {isLoading || dataIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
        Generate Insights
      </Button>

      {insights && (
        <div className="space-y-4 pt-4 border-t">
          <div>
            <h4 className="font-semibold mb-2">Insights:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {insights.insights.map((insight, index) => <li key={index}>{insight}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Recommendations:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {insights.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
            </ul>
          </div>
        </div>
      )}

      {!insights && !isLoading && (
        <Alert>
            <AlertTitle>Get Your Insights</AlertTitle>
            <AlertDescription>
                Click the button to analyze your latest data. Make sure you have logged data in all tracking modules for the best results.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
