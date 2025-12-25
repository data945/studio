'use client';

import { useState } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { crossDomainInsights, type CrossDomainInsightsOutput } from '@/ai/flows/cross-domain-insights';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

export default function CrossDomainInsights() {
  const [sleepQuality, setSleepQuality] = useState(7);
  const [deepWorkPerformance, setDeepWorkPerformance] = useState(8);
  const [nutritionScore, setNutritionScore] = useState(6);
  const [exerciseConsistency, setExerciseConsistency] = useState(9);
  const [insights, setInsights] = useState<CrossDomainInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setIsLoading(true);
    setInsights(null);
    try {
      const result = await crossDomainInsights({
        sleepQuality,
        deepWorkPerformance,
        nutritionScore,
        exerciseConsistency,
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
      <div className="space-y-4">
        <div>
          <Label htmlFor="sleep-quality" className="flex justify-between"><span>Sleep Quality</span><span>{sleepQuality}</span></Label>
          <Slider id="sleep-quality" value={[sleepQuality]} onValueChange={([v]) => setSleepQuality(v)} max={10} step={1} />
        </div>
        <div>
          <Label htmlFor="deep-work" className="flex justify-between"><span>Deep Work Performance</span><span>{deepWorkPerformance}</span></Label>
          <Slider id="deep-work" value={[deepWorkPerformance]} onValueChange={([v]) => setDeepWorkPerformance(v)} max={10} step={1} />
        </div>
        <div>
          <Label htmlFor="nutrition" className="flex justify-between"><span>Nutrition Score</span><span>{nutritionScore}</span></Label>
          <Slider id="nutrition" value={[nutritionScore]} onValueChange={([v]) => setNutritionScore(v)} max={10} step={1} />
        </div>
        <div>
          <Label htmlFor="exercise" className="flex justify-between"><span>Exercise Consistency</span><span>{exerciseConsistency}</span></Label>
          <Slider id="exercise" value={[exerciseConsistency]} onValueChange={([v]) => setExerciseConsistency(v)} max={10} step={1} />
        </div>
      </div>
      <Button onClick={handleAnalysis} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
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
    </div>
  );
}
