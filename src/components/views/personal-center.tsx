
'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/context/app-provider';
import { coaches } from '@/lib/coaches';
import { ArrowLeft, BookCheck, Flame, Target, Zap, Calendar, Award, User as UserIcon, Clock, Star, Trophy, ChevronDown, ChevronUp, CheckSquare } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';


const achievementLevels = [
    { name: 'Productivity Rookie', level: 1, minGoals: 0 },
    { name: 'Goal Achiever', level: 2, minGoals: 25 },
    { name: 'Focus Master', level: 3, minGoals: 50 },
    { name: 'Habit Builder', level: 4, minGoals: 100 },
    { name: 'Procrastination Slayer', level: 5, minGoals: 200 },
];

const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    progress,
    progressText
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle?: string;
    progress?: number;
    progressText?: string;
}) => (
    <Card>
        <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground truncate">
                {icon} <span className="truncate">{title}</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
            <p className="text-xl font-bold truncate">{value}</p>
             {subtitle && <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>}
            {progress !== undefined && (
                <div className="mt-2 space-y-1">
                    <Progress value={progress} className="h-2" />
                    {progressText && <p className="text-xs text-muted-foreground">{progressText}</p>}
                </div>
            )}
        </CardContent>
    </Card>
);

export default function PersonalCenter() {
  const { data, exitPersonalCenter, viewArchive, setNewGoal, coach, stats } = useAppContext();
  const [isQuickStatsOpen, setIsQuickStatsOpen] = useState(false);

  const currentCoach = coach || coaches[data.coachId || 'luna'];

  const {
      level,
      nextLevel,
      levelProgress,
  } = useMemo(() => {
    const completedCount = stats.completedCount;
    const currentLevelIndex = achievementLevels.slice().reverse().findIndex(l => completedCount >= l.minGoals);
    const level = achievementLevels[achievementLevels.length - 1 - currentLevelIndex];
    const nextLevel = achievementLevels[achievementLevels.length - currentLevelIndex];
    
    let progress = 100;

    if (nextLevel) {
        const goalsForThisLevel = completedCount - level.minGoals;
        const totalGoalsForLevel = nextLevel.minGoals - level.minGoals;
        progress = (goalsForThisLevel / totalGoalsForLevel) * 100;
    }

    return {
        level,
        nextLevel,
        levelProgress: progress
    };
  }, [stats.completedCount]);
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const dailyGoalTarget = 3;
  const goalsCompletedProgress = Math.min((stats.todayCompletedCount / dailyGoalTarget) * 100, 100);
  const stepsCompletedProgress = stats.totalStepsForInProgressGoals > 0 ? (stats.totalStepsCompletedForInProgressGoals / stats.totalStepsForInProgressGoals) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col bg-muted">
      <header className="p-4 border-b flex items-center gap-2 bg-background sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={exitPersonalCenter}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-center absolute left-1/2 -translate-x-1/2">Personal Center</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <div className="text-5xl bg-background p-2 rounded-full shadow-sm">{currentCoach.emoji}</div>
                <div>
                    <p className="font-semibold text-lg">Hi there!</p>
                    <p className="text-sm text-muted-foreground italic">"You're building such great habits. Keep it up!"</p>
                </div>
            </CardContent>
        </Card>
        
        <div className="space-y-2">
            <h2 className="text-lg font-bold">🔥 Your Progress</h2>
            <p className="text-sm text-muted-foreground -mt-1">
                Total: {stats.quickStats.totalGoals} goals &bull; {stats.quickStats.totalSteps} steps &bull; Avg: {stats.quickStats.avgStepsPerGoal.toFixed(1)} steps/goal
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
                <StatCard 
                    icon={<Flame size={16} />}
                    title="Current Streak"
                    value={`${stats.streak} days`}
                    subtitle={`Best: ${stats.bestStreak} days`}
                />
                 <StatCard 
                    icon={<Zap size={16} />}
                    title="Focus Time"
                    value={`${formatTime(stats.todayFocusTime)} today`}
                    subtitle={`Total: ${formatTime(stats.totalFocusTime)}`}
                />
                 <StatCard 
                    icon={<Target size={16} />}
                    title="Goals Completed"
                    value={`${stats.todayCompletedCount}/${dailyGoalTarget}`}
                    progress={goalsCompletedProgress}
                />
                 <StatCard 
                    icon={<CheckSquare size={16} />}
                    title="Steps Completed"
                    value={`${stats.totalStepsCompletedForInProgressGoals}/${stats.totalStepsForInProgressGoals}`}
                    progress={stepsCompletedProgress}
                    subtitle="In Progress Goals"
                />
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Trophy className="h-5 w-5"/> Achievement Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="font-bold">{level.name} (Level {level.level})</p>
                <Progress value={levelProgress} />
                {nextLevel ? (
                    <p className="text-sm text-muted-foreground">
                        {stats.completedCount}/{nextLevel.minGoals} goals to {nextLevel.name}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">You've reached the highest level!</p>
                )}
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-3">
            <Button onClick={viewArchive}>View All Goals</Button>
            <Button onClick={setNewGoal} variant="outline">Set New Goal</Button>
        </div>

      </div>
    </div>
  );
}

