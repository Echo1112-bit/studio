
'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/context/app-provider';
import { coaches } from '@/lib/coaches';
import { ArrowLeft, BookCheck, Flame, Target, Zap, Calendar, Award, User as UserIcon, Clock, Star } from 'lucide-react';

const achievementLevels = [
    { name: 'Productivity Rookie', minGoals: 0 },
    { name: 'Goal Achiever', minGoals: 25 },
    { name: 'Focus Master', minGoals: 50 },
    { name: 'Habit Builder', minGoals: 100 },
    { name: 'Procrastination Slayer', minGoals: 200 },
];

export default function PersonalCenter() {
  const { data, exitPersonalCenter, viewArchive, setNewGoal, coach, stats } = useAppContext();

  const currentCoach = coach || coaches[data.coachId || 'luna'];

  const {
      level,
      nextLevel,
      goalsToNextLevel,
      levelProgress,
  } = useMemo(() => {
    const completedCount = stats.completedCount;
    const currentLevelIndex = achievementLevels.slice().reverse().findIndex(l => completedCount >= l.minGoals);
    const level = achievementLevels[achievementLevels.length - 1 - currentLevelIndex];
    const nextLevel = achievementLevels[achievementLevels.length - currentLevelIndex];
    
    let goalsToNext = 0;
    let progress = 100;

    if (nextLevel) {
        goalsToNext = nextLevel.minGoals - completedCount;
        const totalGoalsForLevel = nextLevel.minGoals - level.minGoals;
        progress = ((totalGoalsForLevel - goalsToNext) / totalGoalsForLevel) * 100;
    }

    return {
        level,
        nextLevel,
        goalsToNextLevel: goalsToNext,
        levelProgress: progress
    };
  }, [stats.completedCount]);
  
  const totalFocusTime = useMemo(() => {
    const hours = Math.floor(stats.totalFocusTime / 3600);
    const minutes = Math.floor((stats.totalFocusTime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }, [stats.totalFocusTime]);


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
        
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><UserIcon className="h-5 w-5"/> Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Flame className="h-5 w-5 text-primary" /><p><strong>{stats.streak}</strong> days streak</p></div>
                    <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /><p><strong>{stats.thisWeekCompleted}</strong> this week</p></div>
                    <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><p><strong>{totalFocusTime}</strong> focus</p></div>
                    <div className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /><p><strong>{stats.completedCount}</strong> goals done</p></div>
                </div>
                 <div>
                    <div className="flex justify-between items-end mb-1">
                        <p className="font-bold flex items-center gap-1"><Award className="h-4 w-4 text-primary" /> {level.name}</p>
                        {nextLevel && <p className="text-xs text-muted-foreground">{goalsToNextLevel} to {nextLevel.name}</p>}
                    </div>
                    <Progress value={levelProgress} />
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5"/> Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
                <Button onClick={setNewGoal}>Set New Goal</Button>
                <Button onClick={viewArchive} variant="secondary">View Archive</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Star className="h-5 w-5"/> This Week's Wins</CardTitle>
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground">No data for this week yet. Go complete a goal!</p>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}

