
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Settings, BookOpen, User, ListTodo, Zap, CheckSquare } from 'lucide-react';
import { useAppContext } from '@/context/app-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { coachList, coaches } from '@/lib/coaches';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ExecutionMode } from '@/lib/types';


export default function GoalInput() {
  const { data, setGoal, viewArchive, viewPersonalCenter, coach, viewSettings, setCoach, continueGoal, todayGoals, markGoalAsComplete, updateSetting } = useAppContext();
  const [goalText, setGoalText] = useState('');
  const [api, setApi] = useState<CarouselApi>();
  const { toast } = useToast();

  const displayCoach = coach || (data.coachId ? coaches[data.coachId] : coachList[0]);

  const handleGenerate = () => {
    if (goalText.trim()) {
      setGoal(goalText.trim());
      setGoalText('');
    }
  };

  const handleCheck = (goalId: string, goalTitle: string) => {
    markGoalAsComplete(goalId);
    toast({
        title: "🎉 Goal Completed!",
        description: `You've successfully completed "${goalTitle}".`
    });
  }

  useEffect(() => {
    if (!api) {
      return
    }

    const currentCoachIndex = coachList.findIndex(c => c.id === displayCoach.id);
    if (api.selectedScrollSnap() !== currentCoachIndex) {
        api.scrollTo(currentCoachIndex);
    }
 
    const onSelect = () => {
      const selectedCoach = coachList[api.selectedScrollSnap()];
      if (selectedCoach.id !== displayCoach.id) {
          setCoach(selectedCoach.id)
      }
    }

    api.on("select", onSelect)
 
    return () => {
      api.off("select", onSelect)
    }
  }, [api, displayCoach, setCoach])
  
  if (!displayCoach) {
    return null; 
  }

  return (
    <>
      <div className="flex flex-1 flex-col p-4">
        <header className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={viewSettings}>
              <Settings className="h-6 w-6" />
            </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={viewArchive}>
              <BookOpen className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={viewPersonalCenter}>
              <User className="h-6 w-6" />
            </Button>
          </div>
        </header>

        <main className="flex-1 flex flex-col pt-2">
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {coachList.map(c => (
                        <CarouselItem key={c.id}>
                             <div className="text-center mb-4 h-40 flex flex-col justify-end items-center">
                                <div className="text-6xl bg-background p-2 rounded-full shadow-sm inline-block mb-2">{c.emoji}</div>
                                <p className="font-bold text-2xl">
                                    {c.name}
                                </p>
                                <p className="text-muted-foreground text-sm">{c.title}</p>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-xl">What's on your mind?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={goalText}
                        onChange={(e) => setGoalText(e.target.value)}
                        placeholder="I need to..."
                        className="text-base resize-none"
                        rows={3}
                    />
                    <div className="flex justify-end items-center">
                        <Button
                            onClick={handleGenerate}
                            disabled={!goalText.trim()}
                            className="font-bold"
                            style={{ backgroundColor: displayCoach.colors.primary }}
                        >
                            Create Plan
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs 
                value={data.settings.executionMode} 
                onValueChange={(value) => updateSetting('executionMode', value as ExecutionMode)}
                className="w-full max-w-xs mx-auto pt-4"
            >
                <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="focus">
                        <Zap className="h-4 w-4 mr-1"/> Focus
                    </TabsTrigger>
                    <TabsTrigger value="checklist">
                        <CheckSquare className="h-4 w-4 mr-1"/> Checklist
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {todayGoals.length > 0 && (
                 <Card className="mt-4 flex-1 flex flex-col min-h-0">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ListTodo className="h-5 w-5" />
                                Today's List
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Here are the tasks for today. Let's get them done!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden px-3 pb-3">
                        <ScrollArea className="h-full">
                            <div className="space-y-2 pr-3">
                                {todayGoals.map(goal => (
                                    <div
                                        key={goal.id}
                                        className="w-full text-left p-2 rounded-lg border bg-background flex items-center justify-between"
                                    >
                                        <div 
                                            className="flex items-center gap-3 flex-1 cursor-pointer"
                                            onClick={() => continueGoal(goal.id)}
                                        >
                                            <span className="text-xl">{coaches[goal.coachId].emoji}</span>
                                            <p className="font-semibold">{goal.title}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground ml-2">
                                           {goal.actionPlan.recommendedMode === 'focus' 
                                                ? <Zap className="h-4 w-4" title="Recommended: Focus Mode" />
                                                : <CheckSquare className="h-4 w-4" title="Recommended: Checklist Mode" />
                                            }
                                             <Checkbox 
                                                id={`goal-${goal.id}`}
                                                className="ml-2 h-5 w-5"
                                                onCheckedChange={() => handleCheck(goal.id, goal.title)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </main>
      </div>
    </>
  );
}
