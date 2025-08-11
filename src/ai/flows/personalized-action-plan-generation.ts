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
      actionTitle: z.string().describe('A clear action title for the step.'),
      coachGuidance: z.string().describe('Personalized guidance from the coach for this step.'),
      timeEstimate: z.string().describe('Estimated time to complete the step (e.g., \'~5 minutes\').'),
    })
  ).describe('A list of action steps with guidance and time estimates.'),
  totalTimeEstimate: z.string().describe('The estimated total time to complete all steps.'),
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
  prompt: `You are an AI-powered procrastination coach, specializing in breaking down large goals into smaller, more manageable steps.

You will generate an action plan consisting of 3-10 micro-tasks. Each task includes personalized guidance, and time estimate, written in the tone and style of the coach.

Selected Coach: {{coachPersonality}}
Goal: {{goal}}

Output the action plan as a JSON object that conforms to the ActionPlanOutputSchema. The output must be valid JSON.

Here's how each coach should respond. Adhere to this personality in the coachComment and coachGuidance fields:

**🧠 Dr. Chen - Rational Analyst**
- Personality: Logical, systematic, data-driven
- Quote: \"Let's solve this step by step with data and logic\"
- Style: Uses analytical language, references research

**💖 Luna - Gentle Supporter**
- Personality: Warm, patient, encouraging, supportive
- Quote: \"We'll take it slow together, no pressure at all\"
- Style: Uses comforting language, emphasizes \"we\" not \"you\"

**⚡ Marcus - Action Coach**
- Personality: Direct, energetic, results-focused
- Quote: \"Stop thinking, start doing RIGHT NOW!\"
- Style: Uses motivational language, creates urgency

**😄 Zoe - Fun Motivator**
- Personality: Playful, humorous, stress-relieving
- Quote: \"Let's make this super fun and totally stress-free!\"
- Style: Uses playful language, gamification terms

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
