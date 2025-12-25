'use server';

/**
 * @fileOverview This file defines the adaptive progression flow, which automatically adjusts the difficulty of tasks based on user performance.
 *
 * The flow takes performance data as input and suggests the next challenge level.
 * It exports:
 *   - `adaptiveProgression` - The main function to trigger the flow.
 *   - `AdaptiveProgressionInput` - The input type for the adaptiveProgression function.
 *   - `AdaptiveProgressionOutput` - The output type for the adaptiveProgression function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveProgressionInputSchema = z.object({
  domain: z.string().describe('The domain (e.g., math, fitness, singing) for which to adjust the challenge.'),
  performanceData: z.string().describe('A summary of the user\'s recent performance in the specified domain.'),
  currentLevel: z.string().describe('The user\'s current challenge level in the specified domain.'),
});
export type AdaptiveProgressionInput = z.infer<typeof AdaptiveProgressionInputSchema>;

const AdaptiveProgressionOutputSchema = z.object({
  suggestedLevel: z.string().describe('The suggested next challenge level for the user.'),
  reasoning: z.string().describe('The AI\'s reasoning for suggesting the new level.'),
});
export type AdaptiveProgressionOutput = z.infer<typeof AdaptiveProgressionOutputSchema>;

export async function adaptiveProgression(input: AdaptiveProgressionInput): Promise<AdaptiveProgressionOutput> {
  return adaptiveProgressionFlow(input);
}

const adaptiveProgressionPrompt = ai.definePrompt({
  name: 'adaptiveProgressionPrompt',
  input: {schema: AdaptiveProgressionInputSchema},
  output: {schema: AdaptiveProgressionOutputSchema},
  prompt: `You are an AI personal coach specializing in life optimization and challenge progression.

  Based on the user's performance data in the {{domain}} domain, suggest the next appropriate challenge level.
  Explain your reasoning for the suggested level.

  Domain: {{domain}}
  Performance Data: {{performanceData}}
  Current Level: {{currentLevel}}

  Consider these principles when determining the new level:
  - Continuous Improvement: Always aim for incremental progress.
  - Personalized Approach: Adapt to the user's individual capabilities and learning style.
  - Proactive System: Intelligently push the user toward their optimal self.

  Respond in the following format:
  {
    "suggestedLevel": "[Suggested next challenge level]",
    "reasoning": "[Explanation of why this level is appropriate]"
  }`,
});

const adaptiveProgressionFlow = ai.defineFlow(
  {
    name: 'adaptiveProgressionFlow',
    inputSchema: AdaptiveProgressionInputSchema,
    outputSchema: AdaptiveProgressionOutputSchema,
  },
  async input => {
    const {output} = await adaptiveProgressionPrompt(input);
    return output!;
  }
);
