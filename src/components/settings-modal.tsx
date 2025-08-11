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
import { useAppContext } from '@/context/app-provider';
import { coachList, coaches } from '@/lib/coaches';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data, coach, toggleDarkMode, setCoach, resetApp } = useAppContext();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[370px] rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            {coach?.emoji} {coach?.name} says: "Adjust things as you see fit."
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Switch Coach</h3>
            <div className="grid grid-cols-2 gap-2">
              {coachList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCoach(c.id)}
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
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="dark-mode" className="font-semibold">
              Dark Mode
            </Label>
            <Switch
              id="dark-mode"
              checked={data.darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
          <div className="space-y-2 rounded-lg border border-destructive/50 p-3">
            <h3 className="font-semibold text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">This will permanently delete all your data.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">Reset Everything</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your selected coach, goal, and all progress.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                      resetApp();
                      onClose();
                  }}>
                    Yes, reset everything
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
