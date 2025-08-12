
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/context/app-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Clock, Settings } from 'lucide-react';
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

export default function ActionPlan() {
  const { activeGoal, coach, startPlan, backToGoalInput, viewSettings } = useAppContext();
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = useState(false);

  if (!coach || !activeGoal || !activeGoal.actionPlan) return null;

  return (
    <>
      <div className="flex flex-1 flex-col">
        <header className="p-4 border-b flex items-center justify-between gap-2 bg-background sticky top-0 z-10">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsLeaveAlertOpen(true)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-center">Your Action Plan</h1>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={viewSettings}>
              <Settings className="h-5 w-5" />
          </Button>
        </header>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div className="space-y-2 rounded-lg bg-secondary p-3 h-auto max-h-[120px]">
              <div className="flex items-start gap-3">
                  <span className="text-2xl mt-1">{coach.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{coach.name} says:</p>
                    <p className="text-sm text-muted-foreground italic line-clamp-3">"{activeGoal.actionPlan.coachComment}"</p>
                  </div>
              </div>
               <p className="text-sm font-semibold flex items-center gap-2 pt-2">
                  <Clock className="h-4 w-4" /> {activeGoal.actionPlan.totalTimeEstimate}
              </p>
            </div>
            
            <div className="space-y-2">
              {activeGoal.actionPlan.steps.map((step) => (
                <Card key={step.stepNumber} className="bg-background/70">
                  <CardContent className="p-3">
                     <div className="flex flex-col">
                       <div className="flex items-start gap-3">
                         <span className="text-lg font-bold text-primary mt-0.5">{step.emoji}</span>
                         <div className="flex-1">
                          <p className="font-semibold text-base">{step.actionTitle}</p>
                          <p className="text-xs text-muted-foreground italic mt-1">"{step.coachGuidance}"</p>
                         </div>
                       </div>
                       <p className="text-xs font-semibold text-primary/80 whitespace-nowrap self-end mt-2">{step.timeEstimate}</p>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </ScrollArea>
        
        <footer className="p-4 border-t grid grid-cols-2 gap-3 mt-auto">
          <Button variant="outline" onClick={backToGoalInput}>Regenerate Plan</Button>
          <Button 
            className="font-bold" 
            onClick={startPlan}
            style={{ backgroundColor: coach.colors.primary }}
          >
            Let's Get Started!
          </Button>
        </footer>
      </div>

      <AlertDialog open={isLeaveAlertOpen} onOpenChange={setIsLeaveAlertOpen}>
          <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Leave Current Goal?</AlertDialogTitle>
              <AlertDialogDescription>
              This will cancel the current plan. You can always generate a new one.
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
