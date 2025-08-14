
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-provider';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Settings, Pause, Play } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Execution() {
  const { data, activeGoal, coach, completeStep, backToGoalInput, viewSettings } = useAppContext();
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = useState(false);


  useEffect(() => {
    if (isPaused) {
        return;
    }
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeGoal?.currentStepIndex, isPaused]);

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
    <>
    <div className="flex flex-1 flex-col bg-muted">
       <header className="p-4 border-b flex items-center justify-between gap-2 bg-background sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsLeaveAlertOpen(true)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-center truncate flex-1 min-w-0 px-2">{activeGoal.title}</h1>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={viewSettings}>
            <Settings className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        <Card className="flex-grow flex flex-col border-2 border-primary shadow-2xl">
          <CardHeader>
            <p className="text-sm font-bold text-primary">✨ CURRENT TASK (Step {activeGoal.currentStepIndex + 1} of {totalSteps})</p>
            <CardTitle className="text-xl">
              {currentStep.actionTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3 rounded-lg bg-secondary p-3">
              <span className="text-3xl mt-1">{coach.emoji}</span>
              <p className="text-muted-foreground italic">"{currentStep.coachGuidance}"</p>
            </div>
            {data.settings.showTimer && (
                <div className="flex items-center justify-center gap-4 p-2 bg-secondary rounded-md">
                    <div className="text-center font-mono text-lg flex-1">
                        ⏱️ Focused for {formatTime(seconds)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)}>
                        {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                    </Button>
                </div>
            )}
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
                                {step.emoji} {step.actionTitle}
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
    <AlertDialog open={isLeaveAlertOpen} onOpenChange={setIsLeaveAlertOpen}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Leave Current Goal?</AlertDialogTitle>
            <AlertDialogDescription>
            You can continue this goal later from your Archives.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Stay Here</AlertDialogCancel>
            <AlertDialogAction onClick={backToGoalInput}>
            Go to Home
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
