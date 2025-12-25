'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { adaptiveProgression, type AdaptiveProgressionOutput } from '@/ai/flows/adaptive-progression';
import type { FitnessSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface AdaptiveProgressionProps {
  performanceData: FitnessSession;
}

export default function AdaptiveProgression({ performanceData }: AdaptiveProgressionProps) {
  const [suggestion, setSuggestion] = useState<AdaptiveProgressionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);

    const performanceSummary = performanceData.logs.map(
      (log) => `${log.exercise}: ${log.sets}x${log.reps} at ${log.weight}kg (RPE ${log.rpe})`
    ).join('; ');

    const currentLevel = `${performanceData.name} - ${performanceData.createdAt ? format(performanceData.createdAt.toDate(), 'yyyy-MM-dd') : 'Recent'}`;

    try {
      const result = await adaptiveProgression({
        domain: 'Fitness - Strength Training',
        performanceData: performanceSummary,
        currentLevel: currentLevel,
      });
      setSuggestion(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error getting suggestion',
        description: 'An unexpected error occurred. Please try again.',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Analyze your last workout to get recommendations for your next session.
      </p>
      <Button onClick={handleSuggestion} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
        Suggest Next Challenge
      </Button>

      {suggestion && (
        <Card className="mt-4 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">{suggestion.suggestedLevel}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
