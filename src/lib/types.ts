
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
  emoji: string;
}

export interface ActionPlan {
  steps: ActionStep[];
  totalTimeEstimate: string;
  coachComment: string;
}

export type GoalStatus = 'in-progress' | 'completed';

export interface StepHistory {
  stepIndex: number;
  timeSpent: number;
  completedAt: string;
}

export interface Goal {
    id: string;
    title: string;
    coachId: CoachId;
    actionPlan: ActionPlan;
    status: GoalStatus;
    createdAt: string;
    completedAt?: string;
    currentStepIndex: number;
    totalTimeSpent: number;
    stepHistory: StepHistory[];
}

export type AppStatus =
  | 'loading'
  | 'login'
  | 'coach_selection'
  | 'goal_input'
  | 'generating_plan'
  | 'action_plan'
  | 'execution'
  | 'step_completion'
  | 'final_celebration'
  | 'archive'
  | 'personal_center'
  | 'settings';

export interface AppSettings {
    showTimer: boolean;
    reminderTime: string;
}

export interface AppData {
  appStatus: AppStatus;
  coachId?: CoachId;
  activeGoalId?: string;
  goals: Goal[];
  darkMode: boolean;
  settings: AppSettings;
  bestStreak: number;
}
