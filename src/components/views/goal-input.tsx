'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Settings, BookOpen } from 'lucide-react';
import { useAppContext } from '@/context/app-provider';
import { SettingsModal } from '@/components/settings-modal';

export default function GoalInput() {
  const { coach, setGoal, viewArchive } = useAppContext();
  const [goalText, setGoalText] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // This component can be rendered without a coach if we come from the archive page
  const displayCoach = coach || {
    id: 'luna', name: 'ProCoach', emoji: '🎯', serviceEmoji: '✨', examples: ['Plan my week', 'Write a blog post'],
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
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl bg-secondary p-2 rounded-full">{displayCoach.emoji}</div>
            <div>
              <p className="font-bold text-lg">
                Coach {displayCoach.name} at your service {displayCoach.serviceEmoji}
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

        <main className="flex flex-1 flex-col">
          <h1 className="text-xl font-semibold mb-4">What would you like to accomplish today?</h1>
          <Textarea
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="Describe your goal..."
            className="flex-1 text-base resize-none mb-4"
            rows={6}
          />
          <div className="mb-6 text-sm text-muted-foreground">
            <p className="font-semibold mb-1">Some ideas from your coach:</p>
            <ul className="list-disc list-inside">
              {displayCoach.examples.map((ex, i) => (
                <li key={i} className="whitespace-pre-wrap">{ex}</li>
              ))}
            </ul>
          </div>
        </main>
        
        <footer className="mt-auto">
          <Button
            onClick={handleGenerate}
            disabled={!goalText.trim()}
            className="w-full text-lg h-12 font-bold"
            style={{ backgroundColor: displayCoach.colors.primary }}
          >
            Generate Action Plan
          </Button>
        </footer>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
