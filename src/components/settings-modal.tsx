
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppContext } from '@/context/app-provider';
import { coachList, coaches } from '@/lib/coaches';
import { cn } from '@/lib/utils';
import { X, Bell, Clock, Trash2, Timer } from 'lucide-react';
import type { CoachId } from '@/lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data, coach: currentCoach, toggleDarkMode, setCoach, resetApp, updateSetting } = useAppContext();

  const handleSetCoach = (coachId: CoachId) => {
    setCoach(coachId);
    onClose();
  };

  const coachForDisplay = currentCoach || (data.coachId ? coaches[data.coachId] : coachList[0]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[370px] rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            {coachForDisplay.emoji} {coachForDisplay.name} says: "Adjust things as you see fit."
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Switch Coach</h3>
            <div className="grid grid-cols-2 gap-2">
              {coachList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSetCoach(c.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-2 text-left transition-all',
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

          <div className="space-y-4 rounded-lg border p-3">
             <h3 className="font-semibold flex items-center gap-2"><Bell className="h-4 w-4" /> Daily Reminders</h3>
             <div>
                <Label className="font-normal text-muted-foreground">How much support do you need?</Label>
                <RadioGroup 
                    value={data.settings.reminderLevel} 
                    onValueChange={(value) => updateSetting('reminderLevel', value as 'light' | 'standard')}
                    className="mt-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="font-normal">Light (Once daily)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="font-normal">Standard (2-3 times)</Label>
                    </div>
                </RadioGroup>
             </div>
             <div className="flex items-center justify-between">
                <Label className="font-normal flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" /> Morning time: {data.settings.reminderTime}
                </Label>
                <Button variant="link" disabled className="text-xs h-auto p-0">Change</Button>
             </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="pause-reminders" className="font-normal flex items-center gap-2 text-muted-foreground">
                    Pause when I'm working
                </Label>
                <Switch
                    id="pause-reminders"
                    checked={data.settings.pauseRemindersWhileWorking}
                    onCheckedChange={(checked) => updateSetting('pauseRemindersWhileWorking', checked)}
                />
             </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="dark-mode" className="font-semibold flex items-center gap-2">
              Dark Mode
            </Label>
            <Switch
              id="dark-mode"
              checked={data.darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-1">
                <Label htmlFor="show-timer" className="font-semibold flex items-center gap-2">
                    <Timer className="h-4 w-4" /> Show Timer
                </Label>
                <p className="text-xs text-muted-foreground">Display timer during focus sessions.</p>
            </div>
            <Switch
              id="show-timer"
              checked={data.settings.showTimer}
              onCheckedChange={(checked) => updateSetting('showTimer', checked)}
            />
          </div>
          <div className="space-y-2 rounded-lg border p-3">
            <h3 className="font-semibold flex items-center gap-2"><Trash2 className="h-4 w-4" /> Clear Cache</h3>
            <p className="text-sm text-muted-foreground">This will clear temporary data but preserve goals and settings.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">Clear Cache</Button>
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
                      resetApp(); // This function is now used for cache clearing
                      onClose();
                  }}>
                    Yes, clear cache
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
