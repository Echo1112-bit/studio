'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppData, AppStatus, Coach, CoachId, ActionPlan } from '@/lib/types';
import { coaches } from '@/lib/coaches';
import { generateActionPlan } from '@/ai/flows/personalized-action-plan-generation';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'pro-coach-ai-data';

const defaultAppData: AppData = {
  appStatus: 'loading',
  darkMode: false,
};

interface AppContextType {
  data: AppData;
  coach?: Coach;
  appStatus: AppStatus;
  setCoach: (coachId: CoachId) => void;
  setGoal: (goal: string) => Promise<void>;
  startPlan: () => void;
  completeStep: (timeSpent: number) => void;
  nextStep: () => void;
  setNewGoal: () => void;
  regeneratePlan: () => void;
  toggleDarkMode: () => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(defaultAppData);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData: AppData = JSON.parse(storedData);
        // Ensure status isn't stuck on loading/generating states on reload
        if (parsedData.appStatus === 'loading' || parsedData.appStatus === 'generating_plan') {
            if (!parsedData.coachId) {
                parsedData.appStatus = 'coach_selection';
            } else if (!parsedData.goal || !parsedData.actionPlan) {
                parsedData.appStatus = 'goal_input';
            } else {
                parsedData.appStatus = 'action_plan';
            }
        }
        setData(parsedData);
      } else {
        setData({ ...defaultAppData, appStatus: 'coach_selection' });
      }
    } catch (error) {
      console.error('Failed to load data from local storage', error);
      setData({ ...defaultAppData, appStatus: 'coach_selection' });
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isInitialized]);

  const coach = data.coachId ? coaches[data.coachId] : undefined;

  useEffect(() => {
    const root = document.documentElement;
    if (data.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (coach) {
      root.style.setProperty('--primary', coach.colors.primaryHsl);
    }
  }, [data.darkMode, coach]);

  const updateData = useCallback((newData: Partial<AppData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  }, []);

  const setCoach = useCallback((coachId: CoachId) => {
    updateData({ coachId, appStatus: 'goal_input' });
  }, [updateData]);

  const setGoal = useCallback(async (goal: string) => {
    if (!data.coachId) return;
    updateData({ goal, appStatus: 'generating_plan' });
    try {
      const plan = await generateActionPlan({ goal, coachPersonality: coaches[data.coachId].name as any });
      updateData({ actionPlan: plan, appStatus: 'action_plan' });
    } catch (error) {
      console.error('Failed to generate action plan', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate an action plan. Please try again.',
      });
      updateData({ appStatus: 'goal_input' });
    }
  }, [data.coachId, updateData, toast]);

  const startPlan = useCallback(() => {
    updateData({ appStatus: 'execution', currentStepIndex: 0, totalTimeSpent: 0 });
  }, [updateData]);
  
  const completeStep = useCallback((timeSpent: number) => {
    updateData({ 
        appStatus: 'step_completion',
        totalTimeSpent: (data.totalTimeSpent || 0) + timeSpent,
    });
  }, [updateData, data.totalTimeSpent]);

  const nextStep = useCallback(() => {
    const nextIndex = (data.currentStepIndex ?? -1) + 1;
    if (data.actionPlan && nextIndex < data.actionPlan.steps.length) {
      updateData({ appStatus: 'execution', currentStepIndex: nextIndex });
    } else {
      updateData({ appStatus: 'final_celebration' });
    }
  }, [data.currentStepIndex, data.actionPlan, updateData]);

  const setNewGoal = useCallback(() => {
    updateData({
      appStatus: 'goal_input',
      goal: undefined,
      actionPlan: undefined,
      currentStepIndex: undefined,
      totalTimeSpent: undefined,
    });
  }, [updateData]);
  
  const regeneratePlan = useCallback(() => {
    if (!data.goal) return;
    setGoal(data.goal);
  }, [data.goal, setGoal]);

  const toggleDarkMode = useCallback(() => {
    updateData({ darkMode: !data.darkMode });
  }, [data.darkMode, updateData]);
  
  const resetApp = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setData({ ...defaultAppData, appStatus: 'coach_selection' });
  }, []);

  const value: AppContextType = {
    data,
    coach,
    appStatus: data.appStatus,
    setCoach,
    setGoal,
    startPlan,
    completeStep,
    nextStep,
    setNewGoal,
    regeneratePlan,
    toggleDarkMode,
    resetApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
