
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/context/app-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Clock, Settings, CheckCircle2, Circle } from 'lucide-react';
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
  const { activeGoal, coach, backToGoalInput, viewSettings, toggleStepInChecklist } = useAppContext();
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = useState(false);

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

            <div className="space-y-2">
              {activeGoal.actionPlan.steps.map((step) => {
                  const isStepCompleted = activeGoal.completedSteps.includes(step.stepNumber);
                  return (
                    <div
                        key={step.stepNumber}
                        className={cn(
                            "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-card/80 bg-card",
                        )}
                        onClick={() => toggleStepInChecklist(activeGoal.id, step.stepNumber)}
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
                This will cancel the current plan and you'll lose progress. You can always generate a new one.
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
