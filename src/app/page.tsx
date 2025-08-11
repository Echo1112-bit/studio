'use client';

import { useAppContext } from '@/context/app-provider';
import CoachSelection from '@/components/views/coach-selection';
import GoalInput from '@/components/views/goal-input';
import ActionPlan from '@/components/views/action-plan';
import Execution from '@/components/views/execution';
import StepCompletion from '@/components/views/step-completion';
import FinalCelebration from '@/components/views/final-celebration';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { appStatus } = useAppContext();

  const renderContent = () => {
    switch (appStatus) {
      case 'coach_selection':
        return <CoachSelection />;
      case 'goal_input':
        return <GoalInput />;
      case 'generating_plan':
        return (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-semibold text-lg">Your coach is building the perfect plan...</p>
            <p className="text-muted-foreground">This should only take a moment.</p>
          </div>
        );
      case 'action_plan':
        return <ActionPlan />;
      case 'execution':
        return <Execution />;
      case 'step_completion':
        return <StepCompletion />;
      case 'final_celebration':
        return <FinalCelebration />;
      default:
        return (
           <div className="flex flex-1 flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
    }
  };

  return (
    <main className="flex flex-1 flex-col">
      {appStatus === 'loading' ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : renderContent()}
    </main>
  );
}
