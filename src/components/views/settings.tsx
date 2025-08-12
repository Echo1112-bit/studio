
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/context/app-provider';
import { coachList, coaches } from '@/lib/coaches';
import { cn } from '@/lib/utils';
import { ArrowLeft, Trash2, Sun, Moon, Clock, Bell } from 'lucide-react';
import { TimePickerSheet } from '@/components/time-picker-sheet';

export default function Settings() {
  const { data, coach: currentCoach, toggleDarkMode, setCoach, resetApp, updateSetting, exitSettings } = useAppContext();
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const coachForDisplay = currentCoach || (data.coachId ? coaches[data.coachId] : coachList[0]);

  return (
    <>
    <div className="flex flex-1 flex-col bg-muted">
      <header className="p-4 border-b flex items-center justify-between gap-2 bg-background sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={exitSettings}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Settings</h1>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleDarkMode}>
            {data.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-4">
            <h3 className="font-semibold text-foreground px-1">Switch Coach</h3>
            <div className="grid grid-cols-2 gap-2">
              {coachList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCoach(c.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-2 text-left transition-all bg-background',
                    data.coachId === c.id
                      ? 'border-primary ring-2 ring-primary shadow-lg'
                      : 'hover:bg-secondary'
                  )}
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2 rounded-lg border p-3 bg-background">
             <div className="flex items-center justify-between">
                <Label className="font-normal flex items-center gap-2 text-foreground">
                    <Bell className="h-4 w-4" /> Daily Reminder: {data.settings.reminderTime}
                </Label>
                <Button variant="link" className="text-xs h-auto p-0" onClick={() => setIsTimePickerOpen(true)}>
                  Change
                </Button>
             </div>
          </div>
          
          <div className="space-y-2 rounded-lg border p-3 bg-background">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-timer" className="font-normal flex items-center gap-2 text-foreground">
                <Clock className="h-4 w-4" />
                <div>
                  <p>Show Timer</p>
                  <p className="text-xs text-muted-foreground">Display timer during focus sessions.</p>
                </div>
              </Label>
              <Switch
                id="show-timer"
                checked={data.settings.showTimer}
                onCheckedChange={(value) => updateSetting('showTimer', value)}
              />
            </div>
          </div>
        
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start bg-background">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will clear temporary app data. Your goals will not be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    resetApp();
                }}>
                  Yes, clear cache
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    </div>
    <TimePickerSheet 
      open={isTimePickerOpen} 
      onOpenChange={setIsTimePickerOpen} 
      value={data.settings.reminderTime} 
      onConfirm={(newTime) => {
        updateSetting('reminderTime', newTime);
      }}
    />
    </>
  );
}
