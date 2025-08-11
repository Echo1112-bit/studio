'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/context/app-provider';
import { Check, Clock, Goal as GoalIcon } from 'lucide-react';

export default function FinalCelebration() {
  const { activeGoal, coach, setNewGoal, viewArchive } = useAppContext();

  if (!coach || !activeGoal) return null;

  const totalSteps = activeGoal.actionPlan.steps.length;
  const totalTimeMinutes = Math.floor(activeGoal.totalTimeSpent / 60);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: `${coach.colors.primary}26`}}>
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
          🎉 You Did It! 🎉
        </h1>
        <div className="text-7xl bg-background p-4 rounded-full mb-4 shadow-lg animate-bounce">{coach.emoji}</div>
        <p className="text-lg italic text-foreground/80 max-w-md">"{coach.celebrations.final}"</p>
      </main>

      <footer className="w-full space-y-6">
        <Card className="text-left shadow-lg">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <GoalIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Achievement</p>
                <p className="font-semibold">{activeGoal.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total focus time</p>
                <p className="font-semibold">{totalTimeMinutes} minute{totalTimeMinutes !== 1 && 's'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Steps completed</p>
                <p className="font-semibold">{totalSteps}/{totalSteps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={setNewGoal} 
            className="w-full h-12 text-lg font-bold"
            style={{ backgroundColor: coach.colors.primary }}
          >
            Set New Goal
          </Button>
          <Button 
            onClick={viewArchive}
            variant="ghost"
            className="text-muted-foreground"
          >
            View Archives
          </Button>
        </div>
      </footer>
    </div>
  );
}
