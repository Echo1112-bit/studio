'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-provider';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ActionPlan() {
  const { activeGoal, coach, startPlan, regeneratePlan } = useAppContext();

  if (!coach || !activeGoal || !activeGoal.actionPlan) return null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold text-center">Your Action Plan 📋</h1>
        <p className="text-center text-muted-foreground mt-1 text-sm">
          <strong>Today's Goal:</strong> {activeGoal.title}
        </p>
      </header>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-secondary p-3">
            <span className="text-3xl mt-1">{coach.emoji}</span>
            <div>
              <p className="font-semibold">{coach.name} says:</p>
              <p className="text-muted-foreground italic">"{activeGoal.actionPlan.coachComment}"</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {activeGoal.actionPlan.steps.map((step) => (
              <Card key={step.stepNumber}>
                <CardHeader className="p-3">
                  <CardTitle className="text-base flex items-start gap-3">
                    <span className="text-primary font-bold text-lg leading-tight mt-0.5">{step.stepNumber}.</span>
                    <span>{step.actionTitle}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-sm text-muted-foreground italic mb-2">"{step.coachGuidance}"</p>
                  <p className="text-xs font-semibold text-right text-primary">{step.timeEstimate}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center font-bold text-lg mt-4">
            Total Estimated Time: {activeGoal.actionPlan.totalTimeEstimate}
          </p>
        </div>
      </ScrollArea>
      
      <footer className="p-4 border-t grid grid-cols-2 gap-3 mt-auto">
        <Button variant="outline" onClick={regeneratePlan}>Regenerate Plan</Button>
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
