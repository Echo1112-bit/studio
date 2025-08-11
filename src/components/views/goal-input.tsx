'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Settings } from 'lucide-react';
import { useAppContext } from '@/context/app-provider';
import { SettingsModal } from '@/components/settings-modal';

export default function GoalInput() {
  const { coach, setGoal } = useAppContext();
  const [goalText, setGoalText] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!coach) return null;

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
            <div className="text-4xl bg-secondary p-2 rounded-full">{coach.emoji}</div>
            <div>
              <p className="font-bold text-lg">
                Coach {coach.name} at your service {coach.serviceEmoji}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-6 w-6" />
          </Button>
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
              {coach.examples.map((ex, i) => (
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
            style={{ backgroundColor: coach.colors.primary }}
          >
            Generate Action Plan
          </Button>
        </footer>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
