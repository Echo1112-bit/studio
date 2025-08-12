'use server';

/**
 * @fileOverview Generates a personalized action plan for a given goal, broken down into smaller steps,
 * tailored to the user's selected coach personality.
 *
 * - generateActionPlan - A function that generates the action plan.
 * - ActionPlanInput - The input type for the generateActionPlan function.
 * - ActionPlanOutput - The return type for the generateActionPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActionPlanInputSchema = z.object({
  goal: z.string().describe('The user-defined goal to be broken down.'),
  coachPersonality: z
    .enum(['Dr. Chen', 'Luna', 'Marcus', 'Zoe'])
    .describe('The selected coach personality.'),
});
export type ActionPlanInput = z.infer<typeof ActionPlanInputSchema>;

const ActionPlanOutputSchema = z.object({
  steps: z.array(
    z.object({
      stepNumber: z.number().describe('The step number in the action plan.'),
      actionTitle: z.string().describe('A clear, concise, and action-oriented instruction for the step, between 6-10 words. It should include a specific action verb and a clear completion standard. Example: "Open email app and type simple subject"'),
      coachGuidance: z.string().describe('Personalized, encouraging emotional support guidance from the coach for this step, between 12-20 words. This should reduce anxiety and reflect the coach\'s personality. Example: "Something like \'Project Update\' works perfectly - no need to craft the perfect headline!"'),
      timeEstimate: z.string().describe('An approachable, encouraging time estimate (e.g., \'Just 2-3 min\', \'Quick 5-8 min\', \'About 15-20 min\'). The first step should be max 5 minutes.'),
    })
  ).describe('A list of action steps with guidance and time estimates.'),
  totalTimeEstimate: z.string().describe('The estimated total time to complete all steps, phrased encouragingly (e.g., "Around 30 minutes").'),
  coachComment: z.string().describe('An introductory comment from the coach regarding the generated plan.'),
});
export type ActionPlanOutput = z.infer<typeof ActionPlanOutputSchema>;

export async function generateActionPlan(input: ActionPlanInput): Promise<ActionPlanOutput> {
  return generateActionPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'actionPlanPrompt',
  input: {schema: ActionPlanInputSchema},
  output: {schema: ActionPlanOutputSchema},
  prompt: `You are an AI-powered procrastination coach, specializing in breaking down large goals into smaller, more manageable steps. Your primary goal is to reduce cognitive load and make tasks feel easy and approachable.

You will generate an action plan consisting of 3-10 micro-tasks. Each task has two distinct layers:
1.  **actionTitle**: A concise action instruction (6-10 words).
2.  **coachGuidance**: Emotional support and encouragement (12-20 words).

The plan must also include approachable time estimates and reflect the selected coach's unique personality. The first step must be extremely simple and take a maximum of 5 minutes.

Selected Coach: {{coachPersonality}}
Goal: {{goal}}

Output the action plan as a JSON object that conforms to the ActionPlanOutputSchema. The output must be valid JSON.

Here's how each coach should communicate. Adhere to this personality in the coachComment, coachGuidance, and timeEstimate fields:

**🧠 Dr. Chen - Rational Analyst**
- Style: Logical, systematic, data-driven. Uses analytical language.
- **actionTitle**: Concise, systematic instructions (e.g., "Gather Q3 sales data files").
- **coachGuidance**: Rational encouragement, referencing data or logic (e.g., "Start with what you have - research shows incomplete data beats delayed analysis.").

**💖 Luna - Gentle Supporter**
- Style: Warm, patient, encouraging, supportive. Uses "we" language.
- **actionTitle**: Gentle, progressive actions (e.g., "Write one simple opening sentence").
- **coachGuidance**: Emotional comfort, pressure relief (e.g., "Just say hello in your own words - there's no wrong way to start, we can always refine it together.").

**⚡ Marcus - Action Coach**
- Style: Direct, energetic, results-focused. Creates urgency.
- **actionTitle**: Direct, powerful commands (e.g., "Open that document RIGHT NOW").
- **coachGuidance**: Motivation catalyst, confidence building (e.g., "Stop overthinking and click it - action beats perfection every single time!").

**😄 Zoe - Fun Motivator**
- Style: Playful, humorous, stress-relieving. Uses gamification terms.
- **actionTitle**: Light, fun, adventurous tasks (e.g., "Pick your favorite writing app").
- **coachGuidance**: Gamification, stress reduction (e.g., "Choose your weapon for this writing adventure - even napkins work if that's what you've got!").

ActionPlanOutputSchema description: {{{output.schema.description}}}
`,
});

const generateActionPlanFlow = ai.defineFlow(
  {
    name: 'generateActionPlanFlow',
    inputSchema: ActionPlanInputSchema,
    outputSchema: ActionPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
