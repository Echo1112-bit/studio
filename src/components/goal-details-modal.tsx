
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { Goal } from '@/lib/types';
import { coaches } from '@/lib/coaches';
import { format } from 'date-fns';
import { Clock, Calendar, CheckCircle2, Circle, MoreHorizontal, Trash2, Check, ExternalLink } from 'lucide-react';
import { useAppContext } from '@/context/app-provider';
import { cn } from '@/lib/utils';
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


interface GoalDetailsModalProps {
  goal: Goal;
  onClose: () => void;
}

export function GoalDetailsModal({ goal: initialGoal, onClose }: GoalDetailsModalProps) {
    const { data, deleteGoal, toggleStepCompletion, continueGoal, setNewGoal, markGoalAsComplete } = useAppContext();
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    
    // Always get the latest version of the goal from the context
    const goal = data.goals.find(g => g.id === initialGoal.id);

    if (!goal) {
        // The goal might have been deleted, so close the modal.
        if (typeof onClose === 'function') {
            onClose();
        }
        return null;
    }

    const coach = coaches[goal.coachId];
    const totalTimeMinutes = Math.floor(goal.totalTimeSpent / 60);
    const isCompleted = goal.status === 'completed';

    const handleDeleteClick = () => {
        setIsDeleteAlertOpen(true);
    };
    
    const handleContinue = () => {
        continueGoal(goal.id);
        onClose();
    }

    const handleStartAnother = () => {
        setNewGoal();
        onClose();
    }

    const handleMarkComplete = () => {
        markGoalAsComplete(goal.id);
    }
    
    const celebrationMessages: {[key: string]: string} = {
        'dr-chen': "📊 Excellent execution! Data shows success! 📊",
        'luna': "🎉 You've completed this beautifully! 🎉",
        'marcus': "⚡ Amazing work! You crushed it! ⚡",
        'zoe': "🌈 Fantastic job! You're incredible! 🌈"
    };

  return (
    <>
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[370px] rounded-2xl flex flex-col h-[90vh] p-0">
        <DialogHeader className="text-left p-6 pb-4">
          <DialogTitle className="text-2xl pr-8">{coach.emoji} {goal.title}</DialogTitle>
          <DialogDescription>
            Coached by {coach.name} • {isCompleted ? 'Completed' : 'In Progress'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm px-6 pb-4">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-semibold">{format(new Date(goal.createdAt), 'MMM d, yyyy')}</p>
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
        
        <div className="relative flex-1">
            <ScrollArea className="h-full px-6">
                 {isCompleted && (
                    <div className="mb-4 text-center p-2 rounded-lg bg-green-100 border border-green-200">
                        <p className="font-semibold text-green-800">{celebrationMessages[coach.id]}</p>
                    </div>
                )}
                <div className="space-y-2 py-4">
                    <h3 className="font-semibold">Action Plan Steps</h3>
                    {goal.actionPlan.steps.map((step) => {
                        const isStepCompleted = goal.completedSteps.includes(step.stepNumber);
                        return (
                            <div
                                key={step.stepNumber}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                                    !isCompleted && "cursor-pointer hover:bg-secondary"
                                )}
                                onClick={() => toggleStepCompletion(goal.id, step.stepNumber)}
                            >
                                <div>
                                    {isStepCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground/50 mt-0.5" />
                                    )}
                                </div>
                                <div className={cn('transition-all', isStepCompleted && 'text-muted-foreground line-through opacity-70')}>
                                    <p className="font-semibold">{step.emoji} {step.actionTitle}</p>
                                    <p className="text-sm italic">"{step.coachGuidance}"</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
             {isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-red-500 rounded-lg p-4 -rotate-[15deg] opacity-80 bg-red-500/10">
                        <div className="border-2 border-red-500 rounded-lg py-2 px-8">
                            <p className="text-3xl font-extrabold text-red-500 text-center">COMPLETED</p>
                            <p className="text-center text-xs font-bold text-red-400">{format(new Date(goal.completedAt!), 'HH:mm - MMM d, yyyy')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-3 gap-3 p-4 border-t mt-auto">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="col-span-1">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {!isCompleted && (
                         <DropdownMenuItem onClick={handleMarkComplete}>
                            <Check className="mr-2 h-4 w-4" />
                            <span>Mark as Complete</span>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Goal</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {isCompleted ? (
                 <Button onClick={handleStartAnother} className="col-span-2">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Start Another
                </Button>
            ) : (
                <Button onClick={handleContinue} className="col-span-2">Continue</Button>
            )}
        </div>
        
      </DialogContent>
    </Dialog>

    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This will permanently delete the goal "{goal.title}". This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                deleteGoal(goal.id);
                onClose();
            }} variant="destructive">
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
