
'use client';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { coachList } from '@/lib/coaches';
import { useAppContext } from '@/context/app-provider';
import type { Coach } from '@/lib/types';

export default function CoachSelection() {
  const { setCoach } = useAppContext();

  return (
    <div className="flex flex-1 flex-col justify-center bg-muted p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to Your Coach Team! 🎯</h1>
        <p className="text-muted-foreground">Choose the coach that suits you best:</p>
      </div>
      <div className="space-y-3">
        {coachList.map((coach: Coach) => (
          <Card
            key={coach.id}
            onClick={() => setCoach(coach.id)}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary"
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="text-6xl">{coach.emoji}</div>
                <div>
                  <CardTitle>{coach.name}</CardTitle>
                  <CardDescription className="font-semibold">{coach.title}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="italic text-muted-foreground mb-2">"{coach.quote}"</p>
              <p className="text-sm">
                <span className="font-bold">Perfect for:</span> {coach.perfectFor}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
