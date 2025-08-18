'use server';

/**
 * @fileoverview This file exports server-side AI actions to be used safely in client components.
 */

import {
  generateActionPlan,
  type ActionPlanInput,
  type ActionPlanOutput,
} from './flows/personalized-action-plan-generation';

export async function generateActionPlanAction(
  input: ActionPlanInput
): Promise<ActionPlanOutput> {
  return await generateActionPlan(input);
}
