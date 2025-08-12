
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/context/app-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';

export default function ActionPlan() {
  const { activeGoal, coach, startPlan, backToGoalInput } = useAppContext();

  if (!coach || !activeGoal || !activeGoal.actionPlan) return null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="p-4 border-b flex items-center">
        <h1 className="text-xl font-bold text-center w-full">Your Action Plan</h1>
      </header>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-secondary p-3">
            <span className="text-2xl mt-1">{coach.emoji}</span>
            <div>
              <p className="font-semibold text-sm">{coach.name} says:</p>
              <p className="text-sm text-muted-foreground italic line-clamp-3">"{activeGoal.actionPlan.coachComment}"</p>
            </div>
          </div>

          <p className="text-center font-bold">
            {activeGoal.actionPlan.totalTimeEstimate}
          </p>
          
          <div className="space-y-2">
            {activeGoal.actionPlan.steps.map((step) => (
              <Card key={step.stepNumber} className="bg-background/70">
                <CardContent className="p-3">
                   <div className="flex items-start gap-3">
                     <span className="text-lg font-bold text-primary mt-0.5">{step.emoji}</span>
                     <div className="flex-1">
                      <p className="font-semibold">{step.stepNumber}. {step.actionTitle}</p>
                      <p className="text-xs text-muted-foreground italic mt-1">"{step.coachGuidance}"</p>
                     </div>
                     <p className="text-xs font-semibold text-primary/80 whitespace-nowrap">{step.timeEstimate}</p>
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
  );
}
