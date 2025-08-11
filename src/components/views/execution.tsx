'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-provider';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Execution() {
  const { activeGoal, coach, completeStep } = useAppContext();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeGoal?.currentStepIndex]);

  if (!coach || !activeGoal || activeGoal.currentStepIndex === -1) return null;

  const currentStep = activeGoal.actionPlan.steps[activeGoal.currentStepIndex];
  const upcomingSteps = activeGoal.actionPlan.steps.slice(activeGoal.currentStepIndex + 1);
  const totalSteps = activeGoal.actionPlan.steps.length;

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="flex flex-1 flex-col bg-muted">
      <header className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Today's Goal</p>
        <h1 className="font-bold text-lg truncate">{activeGoal.title}</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        <Card className="flex-grow flex flex-col border-2 border-primary shadow-2xl">
          <CardHeader>
            <p className="text-sm font-bold text-primary">✨ CURRENT TASK</p>
            <CardTitle className="text-xl">
              <span className="text-primary">{currentStep.stepNumber}/{totalSteps}</span> {currentStep.actionTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3 rounded-lg bg-secondary p-3">
              <span className="text-3xl mt-1">{coach.emoji}</span>
              <p className="text-muted-foreground italic">"{currentStep.coachGuidance}"</p>
            </div>
            <div className="text-center font-mono text-lg p-2 bg-secondary rounded-md">
              ⏱️ Focused for {formatTime(seconds)}
            </div>
            <Button 
                onClick={() => completeStep(seconds)} 
                className="w-full h-14 text-xl font-bold"
                style={{ backgroundColor: coach.colors.primary }}
            >
              Complete Step
            </Button>
          </CardContent>
        </Card>

        {upcomingSteps.length > 0 && (
          <Card className="h-1/3 flex flex-col">
            <CardHeader className="p-3">
              <CardTitle className="text-base">📋 Coming up next:</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-1">
                <ScrollArea className="h-full">
                    <ul className="space-y-1 pr-4">
                        {upcomingSteps.map(step => (
                            <li key={step.stepNumber} className="text-muted-foreground text-sm truncate">
                                {step.stepNumber}. {step.actionTitle}
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="p-4 text-center">
        <div className="flex justify-center items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={cn("h-2.5 w-2.5 rounded-full transition-colors", 
                    i < activeGoal.currentStepIndex! ? 'bg-primary' : 
                    i === activeGoal.currentStepIndex! ? 'bg-primary/50 scale-125' : 
                    'bg-muted-foreground/30'
                )} />
            ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">Step {activeGoal.currentStepIndex + 1} of {totalSteps}</p>
      </footer>
    </div>
  );
}
