
'use client';

import { useAppContext } from '@/context/app-provider';
import { useAuth } from '@/context/auth-provider';
import CoachSelection from '@/components/views/coach-selection';
import GoalInput from '@/components/views/goal-input';
import ActionPlan from '@/components/views/action-plan';
import Execution from '@/components/views/execution';
import StepCompletion from '@/components/views/step-completion';
import FinalCelebration from '@/components/views/final-celebration';
import Archive from '@/components/views/archive';
import PersonalCenter from '@/components/views/personal-center';
import Settings from '@/components/views/settings';
import Login from '@/components/views/login';
import ChecklistExecution from '@/components/views/checklist-execution';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { appStatus, coach } = useAppContext();

  if (authLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (appStatus) {
      case 'coach_selection':
        return <CoachSelection />;
      case 'goal_input':
        return <GoalInput />;
      case 'generating_plan':
        return (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
            <Card className="w-full max-w-sm">
                <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">{coach?.emoji}</div>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="font-semibold text-lg mt-4">{coach?.name} is building the perfect plan...</p>
                    <p className="text-muted-foreground mt-1">This should only take a moment.</p>
                </CardContent>
            </Card>
          </div>
        );
      case 'action_plan':
        return <ActionPlan />;
      case 'checklist_execution':
        return <ChecklistExecution />;
      case 'execution':
        return <Execution />;
      case 'step_completion':
        return <StepCompletion />;
      case 'final_celebration':
        return <FinalCelebration />;
      case 'archive':
        return <Archive />;
      case 'personal_center':
        return <PersonalCenter />;
      case 'settings':
        return <Settings />;
      default:
        return (
           <div className="flex flex-1 flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
    }
  };

  return (
    <main className={cn(
        "flex flex-1 flex-col",
        (appStatus === 'goal_input' || appStatus === 'generating_plan' || appStatus === 'checklist_execution') && 'bg-muted'
    )}>
      {appStatus === 'loading' ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : renderContent()}
    </main>
  );
}
