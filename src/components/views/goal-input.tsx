
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Settings, BookOpen } from 'lucide-react';
import { useAppContext } from '@/context/app-provider';
import { SettingsModal } from '@/components/settings-modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function GoalInput() {
  const { coach, setGoal, viewArchive } = useAppContext();
  const [goalText, setGoalText] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // This component can be rendered without a coach if we come from the archive page
  const displayCoach = coach || {
    id: 'luna', name: 'ProCoach', emoji: '🎯', title: 'Your Coach', serviceEmoji: '✨', examples: ['Plan my week', 'Write a blog post'],
    colors: { primary: '#1e3a8a' }
  };

  const handleGenerate = () => {
    if (goalText.trim()) {
      setGoal(goalText.trim());
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col p-4">
        <header className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl bg-background p-2 rounded-full shadow-sm">{displayCoach.emoji}</div>
            <div>
              <p className="font-bold text-xl">
                {displayCoach.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={viewArchive}>
              <BookOpen className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-6 w-6" />
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center">
            <p className="text-muted-foreground text-center text-sm mb-2">{displayCoach.title}</p>
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
                        <li key={i} className="whitespace-pre-wrap">{ex}</li>
                    ))}
                    </ul>
                </CardContent>
            </Card>

        </main>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
