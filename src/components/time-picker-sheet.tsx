
'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TimePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string; // e.g., "09:00 AM"
  onConfirm: (newTime: string) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export function TimePickerSheet({ open, onOpenChange, value, onConfirm }: TimePickerSheetProps) {
  const [selectedHour, setSelectedHour] = React.useState('09');
  const [selectedMinute, setSelectedMinute] = React.useState('00');
  
  const hourRef = React.useRef<HTMLDivElement>(null);
  const minuteRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      const [hour, minuteWithPeriod] = value.split(':');
      const minute = minuteWithPeriod.split(' ')[0];
      let h = parseInt(hour, 10);
      const isPM = minuteWithPeriod.includes('PM');

      if (isPM && h !== 12) {
        h += 12;
      }
      if (!isPM && h === 12) {
        h = 0;
      }
      
      const newSelectedHour = h.toString().padStart(2, '0');
      const newSelectedMinute = minute;

      setSelectedHour(newSelectedHour);
      setSelectedMinute(newSelectedMinute);

      setTimeout(() => {
          if (hourRef.current) {
            const el = hourRef.current.querySelector(`[data-hour="${newSelectedHour}"]`);
            el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
          if (minuteRef.current) {
            const el = minuteRef.current.querySelector(`[data-minute="${newSelectedMinute}"]`);
            el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
      }, 100);
    }
  }, [open, value]);

  const handleConfirm = () => {
    let hour = parseInt(selectedHour, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }
    const formattedTime = `${hour.toString()}:${selectedMinute} ${period}`;
    onConfirm(formattedTime);
    onOpenChange(false);
  };
  
  const TimeColumn = ({
    values,
    selectedValue,
    onSelect,
    type,
    scrollRef
   }: { 
    values: string[], 
    selectedValue: string, 
    onSelect: (value: string) => void,
    type: 'hour' | 'minute',
    scrollRef: React.RefObject<HTMLDivElement>
  }) => (
    <ScrollArea ref={scrollRef} className="h-48 flex-1">
        <div className="flex flex-col items-center">
            {values.map(val => (
                <button
                    key={val}
                    data-testid={`${type}-${val}`}
                    data-hour={type === 'hour' ? val : undefined}
                    data-minute={type === 'minute' ? val : undefined}
                    onClick={() => onSelect(val)}
                    className={cn(
                        "w-full text-center py-2 text-2xl font-mono",
                        selectedValue === val
                            ? "font-bold text-primary"
                            : "text-muted-foreground/50"
                    )}
                >
                    {val}
                </button>
            ))}
        </div>
    </ScrollArea>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-w-[390px] mx-auto rounded-t-2xl">
        <SheetHeader className="text-center">
          <SheetTitle>Set Reminder Time</SheetTitle>
          <SheetDescription>Choose your daily reminder time.</SheetDescription>
        </SheetHeader>
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-12 w-full bg-secondary rounded-lg border-y-2 border-primary/50" />
            </div>
            <div className="flex items-center justify-center relative z-10">
                <TimeColumn values={hours} selectedValue={selectedHour} onSelect={setSelectedHour} type="hour" scrollRef={hourRef}/>
                <span className="text-3xl font-bold text-primary pb-1">:</span>
                <TimeColumn values={minutes} selectedValue={selectedMinute} onSelect={setSelectedMinute} type="minute" scrollRef={minuteRef} />
            </div>
        </div>
        <SheetFooter className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>Confirm</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
