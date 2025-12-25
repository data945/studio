'use server';

/**
 * @fileOverview A Genkit flow for identifying correlations between different life domains to optimize user schedules and habits.
 *
 * - crossDomainInsights - A function that analyzes user data across domains and provides insights.
 * - CrossDomainInsightsInput - The input type for the crossDomainInsights function.
 * - CrossDomainInsightsOutput - The return type for the crossDomainInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrossDomainInsightsInputSchema = z.object({
  sleepQuality: z
    .number()
    .describe('Sleep quality score from 1 to 10'),
  deepWorkPerformance: z
    .number()
    .describe('Deep work performance score from 1 to 10'),
  nutritionScore: z
    .number()
    .describe('Nutrition score from 1 to 10 based on diet tracking'),
  exerciseConsistency: z
    .number()
    .describe('Exercise consistency score from 1 to 10'),
});

export type CrossDomainInsightsInput = z.infer<typeof CrossDomainInsightsInputSchema>;

const CrossDomainInsightsOutputSchema = z.object({
  insights: z.array(z.string()).describe('List of insights derived from cross-domain analysis'),
  recommendations: z
    .array(z.string())
    .describe('List of recommendations to improve overall effectiveness'),
});

export type CrossDomainInsightsOutput = z.infer<typeof CrossDomainInsightsOutputSchema>;

export async function crossDomainInsights(input: CrossDomainInsightsInput): Promise<CrossDomainInsightsOutput> {
  return crossDomainInsightsFlow(input);
}

const crossDomainInsightsPrompt = ai.definePrompt({
  name: 'crossDomainInsightsPrompt',
  input: {schema: CrossDomainInsightsInputSchema},
  output: {schema: CrossDomainInsightsOutputSchema},
  prompt: `You are an AI-powered life coach, analyzing data across various life domains to provide personalized insights and recommendations.

  Analyze the following data to identify correlations and provide actionable advice:

  Sleep Quality: {{sleepQuality}}/10
  Deep Work Performance: {{deepWorkPerformance}}/10
  Nutrition Score: {{nutritionScore}}/10
  Exercise Consistency: {{exerciseConsistency}}/10

  Based on these metrics, identify potential correlations (e.g., "Poor sleep is negatively impacting deep work performance") and provide specific, actionable recommendations to improve overall effectiveness.

  Format your response as a list of insights and a list of recommendations.
  Insights should be short, clear statements about identified correlations.
  Recommendations should be practical steps the user can take to optimize their schedule and habits.
  Keep the insights and recommendations to a maximum of three each.
  `,
});

const crossDomainInsightsFlow = ai.defineFlow(
  {
    name: 'crossDomainInsightsFlow',
    inputSchema: CrossDomainInsightsInputSchema,
    outputSchema: CrossDomainInsightsOutputSchema,
  },
  async input => {
    const {output} = await crossDomainInsightsPrompt(input);
    return output!;
  }
);
