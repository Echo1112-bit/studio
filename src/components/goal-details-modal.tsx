
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Goal } from '@/lib/types';
import { coaches } from '@/lib/coaches';
import { formatDistanceToNow } from 'date-fns';
import { X, Clock, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { useAppContext } from '@/context/app-provider';

interface GoalDetailsModalProps {
  goal: Goal;
  onClose: () => void;
}

export function GoalDetailsModal({ goal, onClose }: GoalDetailsModalProps) {
    const { deleteGoal } = useAppContext();
    const coach = coaches[goal.coachId];
    const totalTimeMinutes = Math.floor(goal.totalTimeSpent / 60);

    const handleDelete = () => {
        deleteGoal(goal.id);
        onClose();
    }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[370px] rounded-2xl flex flex-col h-[90vh]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl pr-8">{coach.emoji} {goal.title}</DialogTitle>
          <DialogDescription>
            Coached by {coach.name} • {goal.status === 'completed' ? 'Completed' : 'In Progress'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-semibold">{formatDistanceToNow(new Date(goal.createdAt), { addSuffix: true })}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                    <p className="text-muted-foreground">Focus Time</p>
                    <p className="font-semibold">{totalTimeMinutes} minute{totalTimeMinutes !== 1 && 's'}</p>
                </div>
            </div>
        </div>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 py-4">
                <h3 className="font-semibold">Action Plan Steps</h3>
                {goal.actionPlan.steps.map((step, index) => {
                    const isCompleted = goal.status === 'completed' || index < goal.currentStepIndex;
                    return (
                        <div key={step.stepNumber} className="flex items-start gap-3">
                            <div>
                                {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground/50 mt-0.5" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">{step.actionTitle}</p>
                                <p className="text-sm text-muted-foreground italic">"{step.coachGuidance}"</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
        
        <div className="grid grid-cols-2 gap-3 pt-4 border-t -mx-6 px-6">
            <Button variant="destructive" onClick={handleDelete}>Delete Goal</Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
