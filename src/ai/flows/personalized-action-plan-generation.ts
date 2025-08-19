
'use server';

/**
 * @fileOverview Generates a personalized action plan for a given goal, broken down into smaller steps,
 * tailored to the user's selected coach personality. It also determines the appropriate date for the task
 * and recommends an execution mode.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActionPlanInputSchema = z.object({
  goal: z.string().describe('The user-defined goal to be broken down.'),
  coachPersonality: z
    .enum(['Dr. Chen', 'Luna', 'Marcus', 'Zoe'])
    .describe('The selected coach personality.'),
  currentDate: z.string().describe('The current date in ISO format (e.g., 2024-08-21). This is used as a reference for scheduling.')
});
export type ActionPlanInput = z.infer<typeof ActionPlanInputSchema>;

const ActionPlanOutputSchema = z.object({
  steps: z.array(
    z.object({
      stepNumber: z.number().describe('The step number in the action plan.'),
      emoji: z.string().describe("A single emoji that reflects the coach's personality for this specific step."),
      actionTitle: z.string().describe('A clear, concise, and action-oriented instruction for the step, between 6-10 words. It should include a specific action verb and a clear completion standard. Example: "Open email app and type simple subject"'),
      coachGuidance: z.string().describe('Personalized, encouraging emotional support guidance from the coach for this step, between 12-20 words. This should reduce anxiety and reflect the coach\'s personality. Example: "Something like \'Project Update\' works perfectly - no need to craft the perfect headline!"'),
      timeEstimate: z.string().describe('An approachable, encouraging time estimate (e.g., \'Just 2-3 min\', \'Quick 5-8 min\', \'About 15-20 min\'). The first step should be max 5 minutes.'),
    })
  ).describe('A list of action steps with guidance and time estimates.'),
  totalTimeEstimate: z.string().describe('The estimated total time to complete all steps, phrased as "Takes about X minutes of focused work" (e.g., "Takes about 45 minutes of focused work").'),
  coachComment: z.string().describe('A very concise introductory comment (10-20 words) from the coach that provides both emotional value and an actionable tip related to the user\'s goal.'),
  targetDate: z.string().describe("The most appropriate date for this goal to be accomplished, in 'YYYY-MM-DD' format. If the goal mentions a specific future date (e.g., 'next Friday', 'tomorrow'), use that date. If it's a general task without a date, assume it's for the current day."),
  recommendedMode: z.enum(['focus', 'checklist']).describe("The recommended execution mode. Use 'focus' for short, simple, or single-session tasks. Use 'checklist' for longer, multi-step projects or tasks that benefit from seeing the full plan."),
});
export type ActionPlanOutput = z.infer<typeof ActionPlanOutputSchema>;

export async function generateActionPlan(input: ActionPlanInput): Promise<ActionPlanOutput> {
  return generateActionPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'actionPlanPrompt',
  input: {schema: ActionPlanInputSchema},
  output: {schema: ActionPlanOutputSchema},
  prompt: `You are an AI-powered procrastination coach and expert project planner. Your goal is to:
1.  Analyze the user's goal and the current date ({{currentDate}}).
2.  Determine the most appropriate target date for this goal. If the user mentions a specific day (e.g., "this Friday", "tomorrow"), calculate that date. Otherwise, assume today.
3.  Decide the best execution mode: 'focus' for quick, single-session tasks, and 'checklist' for larger projects.
4.  Break down the goal into 5-20 manageable steps following the "Difficulty Rhythm Curve" (easy -> hard -> easy).
5.  Embody the selected coach's personality in all generated text.

**Execution Rules:**

*   **Target Date & Mode**: First, determine the 'targetDate' and 'recommendedMode'.
*   **Difficulty Rhythm Curve**: The difficulty of tasks should generally start easy, ramp up to the hardest tasks in the middle, and then cool down with easier tasks at the end. The number of steps can vary based on the complexity of the goal.
    1.  **Warm-up (Easy)**: The first couple of steps should be very quick and simple (e.g., under 5 minutes) to build momentum.
    2.  **Peak (Hardest)**: The most challenging or time-consuming steps should be in the middle of the plan.
    3.  **Cool-down (Easy)**: The final steps should be easy to complete, providing a sense of accomplishment.
*   **Output Fields**: Each step must have an 'emoji', 'actionTitle' (6-10 words), and 'coachGuidance' (12-20 words). The 'coachComment' must be 10-20 words.

**Coach Personalities:**

*   **🧠 Dr. Chen - Rational Analyst**: Logical, systematic. Emojis: 📊📈📋🔍. Guidance is data-driven.
*   **💖 Luna - Gentle Supporter**: Warm, patient, uses "we". Emojis: 💝🌸✨🤗. Guidance is comforting.
*   **⚡ Marcus - Action Coach**: Direct, energetic. Emojis: 🔥🚀💪🎯. Guidance is a motivational catalyst.
*   **😄 Zoe - Fun Motivator**: Playful, humorous. Emojis: 🎮🌟🎈🎁. Guidance uses gamification.

**User Input:**

*   **Current Date**: {{currentDate}}
*   **Selected Coach**: {{coachPersonality}}
*   **Goal**: {{goal}}

Output a valid JSON object conforming to the ActionPlanOutputSchema.
ActionPlanOutputSchema description: {{{output.schema.description}}}
`,
});

const generateActionPlanFlow = ai.defineFlow(
  {
    name: 'generateActionPlanFlow',
    inputSchema: ActionPlanInputSchema,
    outputSchema: ActionPlanOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a valid action plan. The model returned null.');
    }
    return output;
  }
);
