
'use client';

import { useState, useMemo } from 'react';
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
          <h1 className="text-xl font-bold text-center absolute left-1/2 -translate-x-1/2">Your Goal Archive 📚</h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
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
    <div className="flex flex-1 flex-col bg-muted">
      <header className="p-4 border-b flex items-center gap-2 bg-background sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={exitArchive}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-center absolute left-1/2 -translate-x-1/2">Your Goal Archive 📚</h1>
      </header>
      
      <div className="p-4 space-y-4">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
            <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({data.goals.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressCount})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            </TabsList>
        </Tabs>
      </div>


      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {filteredGoals.map(goal => {
          const goalCoach = coaches[goal.coachId];
          const progress = goal.status === 'completed' ? 100 : Math.round(((goal.currentStepIndex) / goal.actionPlan.steps.length) * 100);
          const timeAgo = formatDistanceToNow(new Date(goal.status === 'completed' ? goal.completedAt! : goal.createdAt), { addSuffix: true });
          const totalTimeMinutes = Math.floor(goal.totalTimeSpent / 60);

          return (
            <Card key={goal.id} className="overflow-hidden bg-background">
              <CardHeader className="p-3" style={{ backgroundColor: `${goalCoach.colors.primary}1A`}}>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold" style={{color: goalCoach.colors.primary}}>
                    {goal.status === 'completed' ? '✅ COMPLETED' : '🔄 IN PROGRESS'}
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                </div>
                <h3 className="font-bold text-lg">{goalCoach.emoji} {goal.title}</h3>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex justify-between items-center text-sm mb-3">
                  <p>{goalCoach.name}</p>
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
                    <Button onClick={() => continueGoal(goal.id)} className="flex-1" style={{backgroundColor: goalCoach.colors.primary}}>Continue</Button>
                  )}
                  {goal.status === 'completed' && (
                    <Button onClick={() => setSelectedGoal(goal)} variant="secondary" className="flex-1">
                        <View className="mr-2 h-4 w-4" />
                        View Details
                    </Button>
                  )}
                  {goal.status === 'in-progress' && (
                    <Button onClick={() => setSelectedGoal(goal)} variant="outline" className="flex-1">
                      <View className="mr-2 h-4 w-4" />
                      View
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
      
      <footer className="p-4 border-t bg-background sticky bottom-0">
        <Button onClick={exitArchive} className="w-full">
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
  );
}
