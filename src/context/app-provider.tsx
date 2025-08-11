'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppData, AppStatus, Coach, CoachId, Goal } from '@/lib/types';
import { coaches } from '@/lib/coaches';
import { generateActionPlan } from '@/ai/flows/personalized-action-plan-generation';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'pro-coach-ai-data-v2';

const defaultAppData: AppData = {
  appStatus: 'loading',
  goals: [],
  darkMode: false,
};

interface AppContextType {
  data: AppData;
  coach?: Coach;
  activeGoal?: Goal;
  appStatus: AppStatus;
  setCoach: (coachId: CoachId) => void;
  setGoal: (goal: string) => Promise<void>;
  startPlan: () => void;
  continueGoal: (goalId: string) => void;
  completeStep: (timeSpent: number) => void;
  nextStep: () => void;
  setNewGoal: () => void;
  regeneratePlan: () => void;
  toggleDarkMode: () => void;
  resetApp: () => void;
  viewArchive: () => void;
  exitArchive: () => void;
  deleteGoal: (goalId: string) => void;
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
        if (['loading', 'generating_plan'].includes(parsedData.appStatus)) {
            parsedData.appStatus = parsedData.coachId ? 'goal_input' : 'coach_selection';
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
  
  const activeGoal = data.goals.find(g => g.id === data.activeGoalId);
  const coach = activeGoal ? coaches[activeGoal.coachId] : (data.coachId ? coaches[data.coachId] : undefined);

  useEffect(() => {
    const root = document.documentElement;
    if (data.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const currentCoach = data.activeGoalId ? coaches[data.goals.find(g => g.id === data.activeGoalId)!.coachId] : data.coachId ? coaches[data.coachId] : undefined;
    if (currentCoach) {
      root.style.setProperty('--primary', currentCoach.colors.primaryHsl);
    }
  }, [data.darkMode, data.coachId, data.activeGoalId, data.goals]);

  const updateData = useCallback((newData: Partial<AppData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  }, []);

  const setCoach = useCallback((coachId: CoachId) => {
    updateData({ coachId, appStatus: 'goal_input' });
  }, [updateData]);

  const setGoal = useCallback(async (title: string) => {
    if (!data.coachId) return;
    updateData({ appStatus: 'generating_plan' });
    try {
      const plan = await generateActionPlan({ goal: title, coachPersonality: coaches[data.coachId].name as any });
      const newGoal: Goal = {
        id: new Date().toISOString(),
        title,
        coachId: data.coachId,
        actionPlan: plan,
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        currentStepIndex: -1, // -1 means not started
        totalTimeSpent: 0,
        stepHistory: [],
      };
      updateData({ 
        goals: [...data.goals, newGoal],
        activeGoalId: newGoal.id,
        appStatus: 'action_plan'
      });
    } catch (error) {
      console.error('Failed to generate action plan', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate an action plan. Please try again.',
      });
      updateData({ appStatus: 'goal_input' });
    }
  }, [data.coachId, data.goals, updateData, toast]);

  const startPlan = useCallback(() => {
    if (!data.activeGoalId) return;
    const newGoals = data.goals.map(g => 
        g.id === data.activeGoalId ? {...g, currentStepIndex: 0} : g
    );
    updateData({ appStatus: 'execution', goals: newGoals });
  }, [updateData, data.activeGoalId, data.goals]);

  const continueGoal = useCallback((goalId: string) => {
    updateData({ activeGoalId: goalId, appStatus: 'execution' });
  }, [updateData]);
  
  const completeStep = useCallback((timeSpent: number) => {
    if (!activeGoal) return;
    const newGoals = data.goals.map(g => {
        if (g.id === data.activeGoalId) {
            return {
                ...g,
                totalTimeSpent: g.totalTimeSpent + timeSpent,
                stepHistory: [...g.stepHistory, {
                    stepIndex: g.currentStepIndex,
                    timeSpent,
                    completedAt: new Date().toISOString()
                }]
            }
        }
        return g;
    });
    updateData({ appStatus: 'step_completion', goals: newGoals });
  }, [updateData, activeGoal, data.goals, data.activeGoalId]);

  const nextStep = useCallback(() => {
    if (!activeGoal) return;
    const nextIndex = activeGoal.currentStepIndex + 1;
    
    if (nextIndex < activeGoal.actionPlan.steps.length) {
      const newGoals = data.goals.map(g => 
        g.id === data.activeGoalId ? {...g, currentStepIndex: nextIndex} : g
      );
      updateData({ appStatus: 'execution', goals: newGoals });
    } else {
       const newGoals = data.goals.map(g => 
        g.id === data.activeGoalId ? {
            ...g, 
            status: 'completed' as 'completed', 
            completedAt: new Date().toISOString()
        } : g
      );
      updateData({ appStatus: 'final_celebration', goals: newGoals });
    }
  }, [activeGoal, data.goals, data.activeGoalId, updateData]);

  const setNewGoal = useCallback(() => {
    updateData({
      appStatus: 'goal_input',
      activeGoalId: undefined,
    });
  }, [updateData]);
  
  const regeneratePlan = useCallback(async () => {
    if (!activeGoal) return;
    const { title, coachId } = activeGoal;
    updateData({ appStatus: 'generating_plan' });
    try {
      const plan = await generateActionPlan({ goal: title, coachPersonality: coaches[coachId].name as any });
      const newGoals = data.goals.map(g => 
        g.id === data.activeGoalId ? {...g, actionPlan: plan} : g
      );
      updateData({ goals: newGoals, appStatus: 'action_plan' });
    } catch (error) {
      console.error('Failed to regenerate action plan', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not regenerate the plan. Please try again.',
      });
      updateData({ appStatus: 'action_plan' });
    }
  }, [activeGoal, data.activeGoalId, data.goals, updateData, toast]);

  const toggleDarkMode = useCallback(() => {
    updateData({ darkMode: !data.darkMode });
  }, [data.darkMode, updateData]);
  
  const resetApp = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setData({ ...defaultAppData, appStatus: 'coach_selection' });
  }, []);

  const viewArchive = useCallback(() => {
    updateData({ appStatus: 'archive' });
  }, [updateData]);

  const exitArchive = useCallback(() => {
    updateData({ appStatus: 'goal_input' });
  }, [updateData]);

  const deleteGoal = useCallback((goalId: string) => {
    const newGoals = data.goals.filter(g => g.id !== goalId);
    let newActiveGoalId = data.activeGoalId;
    if (data.activeGoalId === goalId) {
      newActiveGoalId = undefined;
    }
    updateData({ goals: newGoals, activeGoalId: newActiveGoalId });
  }, [data.goals, data.activeGoalId, updateData]);

  const value: AppContextType = {
    data,
    coach,
    activeGoal,
    appStatus: data.appStatus,
    setCoach,
    setGoal,
    startPlan,
    continueGoal,
    completeStep,
    nextStep,
    setNewGoal,
    regeneratePlan,
    toggleDarkMode,
    resetApp,
    viewArchive,
    exitArchive,
    deleteGoal,
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
