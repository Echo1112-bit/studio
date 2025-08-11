'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-provider';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StepCompletion() {
  const { activeGoal, coach, nextStep } = useAppContext();
  const [celebration, setCelebration] = useState('🎉 Nice!');

  useEffect(() => {
    if (coach) {
      const msgs = coach.celebrations.step;
      setCelebration(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  }, [coach]);
  
  if (!coach || !activeGoal) return null;

  const completedStepIndex = activeGoal.currentStepIndex;
  const completedStep = activeGoal.actionPlan.steps[completedStepIndex];
  const nextStepItem = activeGoal.actionPlan.steps[completedStepIndex + 1];
  const totalSteps = activeGoal.actionPlan.steps.length;
  const progress = completedStepIndex + 1;

  const getProgressText = () => {
    const percentage = (progress / totalSteps) * 100;
    if (percentage === 100) return "All done!";
    if (percentage >= 50) return "Almost there!";
    if (percentage > 0) return "Great start!";
    return "";
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: `${coach.colors.primary}1A` }}>
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold mb-4">{celebration}</h1>
        <div className="text-5xl bg-background p-3 rounded-full mb-4 shadow-lg">{coach.emoji}</div>
        <p className="text-lg font-semibold mb-6" style={{color: coach.colors.primary}}>You're doing great!</p>
        
        <Card className="w-full mb-4 text-left shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-500"/>
              <p>Completed:</p>
            </div>
            <CardTitle className="text-lg">{completedStep.actionTitle}</CardTitle>
          </CardHeader>
        </Card>

        {nextStepItem && (
          <Card className="w-full text-left bg-background/70">
            <CardHeader>
              <p className="text-sm text-muted-foreground">Up next:</p>
              <CardTitle className="text-lg">{nextStepItem.actionTitle}</CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="w-full mt-auto">
        <div className="flex justify-center items-center gap-2 mb-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={cn("h-2.5 w-2.5 rounded-full transition-colors", 
                    i < progress ? 'bg-primary' : 'bg-primary/30'
                )} />
            ))}
        </div>
        <p className="text-sm font-semibold mb-6" style={{color: coach.colors.primary}}>{getProgressText()}</p>
        <Button 
          onClick={nextStep} 
          className="w-full h-12 text-lg font-bold"
          style={{ backgroundColor: coach.colors.primary }}
        >
          {nextStepItem ? 'Continue →' : 'Finish Goal!'}
        </Button>
      </div>
    </div>
  );
}
