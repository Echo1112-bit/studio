export type CoachId = 'dr-chen' | 'luna' | 'marcus' | 'zoe';

export interface Coach {
  id: CoachId;
  name: string;
  title: string;
  emoji: string;
  quote: string;
  perfectFor: string;
  colors: {
    primary: string;
    primaryHsl: string;
  };
  serviceEmoji: string;
  examples: string[];
  celebrations: {
    step: string[];
    final: string;
  };
}

export interface ActionStep {
  stepNumber: number;
  actionTitle: string;
  coachGuidance: string;
  timeEstimate: string;
}

export interface ActionPlan {
  steps: ActionStep[];
  totalTimeEstimate: string;
  coachComment: string;
}

export type AppStatus =
  | 'loading'
  | 'coach_selection'
  | 'goal_input'
  | 'generating_plan'
  | 'action_plan'
  | 'execution'
  | 'step_completion'
  | 'final_celebration';

export interface AppData {
  appStatus: AppStatus;
  coachId?: CoachId;
  goal?: string;
  actionPlan?: ActionPlan;
  currentStepIndex?: number;
  totalTimeSpent?: number;
  darkMode: boolean;
}
