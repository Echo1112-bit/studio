
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/app-provider';
import { coaches } from '@/lib/coaches';
import type { Goal } from '@/lib/types';
import { formatDistanceToNow, isSameDay } from 'date-fns';
import { ArrowLeft, BookCheck, Clock, Trash2, Plus, View, Flame, Target, CheckSquare, Calendar, Zap } from 'lucide-react';
import { GoalDetailsModal } from '@/components/goal-details-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type FilterStatus = 'all' | 'in-progress' | 'completed';

export default function Archive() {
  const { data, exitArchive, continueGoal, deleteGoal, setNewGoal, coach } = useAppContext();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const sortedGoals = [...data.goals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredGoals = sortedGoals.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

  const {
    inProgressCount,
    completedCount,
  } = useMemo(() => {
    return {
        inProgressCount: data.goals.filter(g => g.status === 'in-progress').length,
        completedCount: data.goals.filter(g => g.status === 'completed').length,
    }
  }, [data.goals]);

  if (data.goals.length === 0) {
    return (
      <div className="flex flex-1 flex-col bg-muted">
        <header className="p-4 border-b flex items-center gap-2 bg-background sticky top-0 z-10">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={exitArchive}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-center absolute left-1/2 -translate-x-1/2">My Goal 🎯</h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center pb-24">
            <BookCheck className="h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Goals Yet!</h2>
            <p className="text-muted-foreground mb-6">Your goal history will appear here once you start one.</p>
            <Button onClick={exitArchive}>
              <Plus className="mr-2 h-4 w-4" /> Create First Goal
            </Button>
        </div>
      </div>
    );
  }

  const currentCoach = coach || coaches[data.coachId || 'luna'];

  return (
    <>
    <div className="flex flex-1 flex-col bg-muted">
      <header className="p-4 border-b flex items-center gap-2 bg-background sticky top-0 z-10 shrink-0">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={exitArchive}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-center absolute left-1/2 -translate-x-1/2">My Goal 🎯</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
            <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({data.goals.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressCount})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            </TabsList>
        </Tabs>

        <div className="space-y-4">
            {filteredGoals.map(goal => {
            const goalCoach = coaches[goal.coachId];
            const progress = goal.status === 'completed' ? 100 : Math.round(((goal.currentStepIndex) / goal.actionPlan.steps.length) * 100);
            const timeAgo = formatDistanceToNow(new Date(goal.status === 'completed' ? goal.completedAt! : goal.createdAt), { addSuffix: true });
            const totalTimeMinutes = Math.floor(goal.totalTimeSpent / 60);

            return (
                <Card key={goal.id} className="overflow-hidden bg-background">
                <CardHeader className="p-3 relative">
                    <Badge variant="outline" className={cn(
                        "absolute top-3 right-3 text-xs font-bold",
                        goal.status === 'completed' ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    )}>
                        {goal.status === 'completed' ? '✅ COMPLETED' : '🔄 IN PROGRESS'}
                    </Badge>
                    <h3 className="font-bold text-lg flex items-center gap-2 pr-24">
                        <span>{goalCoach.emoji}</span>
                        {goal.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="flex justify-between items-center text-sm mb-3">
                        {goal.status === 'in-progress' ? (
                            <p className="text-muted-foreground">{goal.currentStepIndex < 0 ? 0 : goal.currentStepIndex}/{goal.actionPlan.steps.length} steps</p>
                        ) : (
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {totalTimeMinutes} min focus
                            </div>
                        )}
                    </div>
                    {goal.status === 'in-progress' && <Progress value={progress} />}
                    
                    <div className="flex gap-2 mt-4">
                    {goal.status === 'in-progress' && (
                        <>
                            <Button onClick={() => setSelectedGoal(goal)} variant="outline" className="flex-1">
                                <View className="mr-2 h-4 w-4" />
                                View
                            </Button>
                            <Button onClick={() => continueGoal(goal.id)} className="flex-1">Continue</Button>
                        </>
                    )}
                    {goal.status === 'completed' && (
                        <Button onClick={() => setSelectedGoal(goal)} variant="secondary" className="flex-1">
                            <View className="mr-2 h-4 w-4" />
                            View Details
                        </Button>
                    )}
                    <Button onClick={() => setGoalToDelete(goal)} variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    </div>
                </CardContent>
                </Card>
            )
            })}
        </div>
      </main>
      
      <footer className="p-4 border-t bg-background sticky bottom-0 shrink-0">
        <Button onClick={setNewGoal} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> New Goal
        </Button>
      </footer>
      
      {selectedGoal && (
        <GoalDetailsModal 
          goal={selectedGoal} 
          onClose={() => setSelectedGoal(null)}
        />
      )}

      {goalToDelete && (
        <AlertDialog open={!!goalToDelete} onOpenChange={() => setGoalToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Delete '{goalToDelete.title}'? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                deleteGoal(goalToDelete.id);
                setGoalToDelete(null);
              }} variant="destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </div>
    </>
  );
}
