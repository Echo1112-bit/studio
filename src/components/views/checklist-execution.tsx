
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/context/app-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Clock, Settings, CheckCircle2, Circle, Pause, Play } from 'lucide-react';
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
import { cn } from '@/lib/utils';


export default function ChecklistExecution() {
  const { data, activeGoal, coach, backToGoalInput, viewSettings, toggleStepInChecklist, addTimeToGoal } = useAppContext();
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
        return;
    }
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
        clearInterval(interval);
        addTimeToGoal(seconds);
        setSeconds(0);
    };
  }, [isPaused]);
  
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!coach || !activeGoal || !activeGoal.actionPlan) return null;

  return (
    <>
      <div className="flex flex-1 flex-col">
        <header className="p-4 border-b flex items-center justify-between gap-2 bg-background sticky top-0 z-10">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsLeaveAlertOpen(true)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-center truncate px-2">{activeGoal.title}</h1>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={viewSettings}>
              <Settings className="h-5 w-5" />
          </Button>
        </header>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div className="space-y-2 rounded-lg bg-secondary p-3 h-auto">
              <div className="flex items-start gap-3">
                  <span className="text-2xl mt-1">{coach.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{coach.name} says:</p>
                    <p className="text-sm text-muted-foreground italic">"{activeGoal.actionPlan.coachComment}"</p>
                  </div>
              </div>
            </div>
            
             <Card>
                <CardContent className="p-3">
                    <p className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" /> {activeGoal.actionPlan.totalTimeEstimate}
                    </p>
                </CardContent>
            </Card>

            {data.settings.showTimer && (
                <div className="flex items-center justify-center gap-4 p-2 bg-card rounded-md border">
                    <div className="text-center font-mono text-sm flex-1">
                        ⏱️ Focused for {formatTime(seconds)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)}>
                        {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    </Button>
                </div>
            )}

            <div className="space-y-2">
              {activeGoal.actionPlan.steps.map((step) => {
                  const isStepCompleted = activeGoal.completedSteps.includes(step.stepNumber);
                  return (
                    <div
                        key={step.stepNumber}
                        className={cn(
                            "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-card/80 bg-card",
                        )}
                        onClick={() => {
                            if (!isStepCompleted) {
                                addTimeToGoal(seconds);
                                setSeconds(0);
                            }
                            toggleStepInChecklist(activeGoal.id, step.stepNumber)
                        }}
                    >
                        <div>
                            {isStepCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                                <Circle className="h-5 w-5 text-muted-foreground/50 mt-0.5" />
                            )}
                        </div>
                        <div className={cn('flex-1 transition-all', isStepCompleted && 'text-muted-foreground line-through opacity-70')}>
                            <p className="font-semibold">{step.emoji} {step.actionTitle}</p>
                            <p className="text-sm italic">"{step.coachGuidance}"</p>
                        </div>
                    </div>
                )
              })}
            </div>

          </div>
        </ScrollArea>
      </div>

      <AlertDialog open={isLeaveAlertOpen} onOpenChange={setIsLeaveAlertOpen}>
          <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Leave Current Goal?</AlertDialogTitle>
              <AlertDialogDescription>
                You can continue this goal later from your Archives. Your focus time on this screen will be saved.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel>Stay Here</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                  addTimeToGoal(seconds);
                  backToGoalInput();
              }}>
                Go to Home
              </AlertDialogAction>
          </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
