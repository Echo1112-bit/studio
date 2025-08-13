
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Settings, BookOpen, User } from 'lucide-react';
import { useAppContext } from '@/context/app-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { coachList, coaches } from '@/lib/coaches';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"

export default function GoalInput() {
  const { data, setGoal, viewArchive, viewPersonalCenter, coach, viewSettings, setCoach } = useAppContext();
  const [goalText, setGoalText] = useState('');
  const [api, setApi] = useState<CarouselApi>()

  const displayCoach = coach || (data.coachId ? coaches[data.coachId] : coachList[0]);

  const handleGenerate = () => {
    if (goalText.trim()) {
      setGoal(goalText.trim());
    }
  };

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
                             <div className="text-center mb-4 h-48 flex flex-col justify-end items-center">
                                {c.isCharacter ? (
                                    <Image 
                                      data-ai-hint="person talking"
                                      src={c.emoji} 
                                      alt={c.name} 
                                      width={160} 
                                      height={160} 
                                      className="object-contain"
                                    />
                                ) : (
                                    <div className="text-6xl bg-background p-2 rounded-full shadow-sm inline-block mb-2">{c.emoji}</div>
                                )}
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
                    <CardTitle className="text-xl">What are you procrastinating on?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={goalText}
                        onChange={(e) => setGoalText(e.target.value)}
                        placeholder="I need to..."
                        className="text-base resize-none"
                        rows={3}
                    />
                    <Button
                        onClick={handleGenerate}
                        disabled={!goalText.trim()}
                        className="w-full text-lg h-12 font-bold"
                        style={{ backgroundColor: displayCoach.colors.primary }}
                    >
                        Create Plan
                    </Button>
                </CardContent>
            </Card>

            <Card className="mt-4">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Some ideas from {displayCoach.name}:</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {displayCoach.examples.map((ex, i) => (
                        <li key={i}>{ex}</li>
                    ))}
                    </ul>
                </CardContent>
            </Card>
        </main>
      </div>
    </>
  );
}
