
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { AppData, AppSettings, AppStatus, Coach, CoachId, Goal } from '@/lib/types';
import { coaches, coachList } from '@/lib/coaches';
import { generateActionPlan } from '@/ai/flows/personalized-action-plan-generation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-provider';
import { isSameDay, startOfWeek, differenceInCalendarDays } from 'date-fns';

const LOCAL_STORAGE_KEY_PREFIX = 'pro-coach-ai-data-v3';

const defaultSettings: AppSettings = {
    showTimer: true,
    reminderTime: '9:00 AM',
};

const defaultAppData: AppData = {
  appStatus: 'loading',
  goals: [],
  darkMode: false,
  settings: defaultSettings,
};

interface AppContextType {
  data: AppData;
  coach?: Coach;
  activeGoal?: Goal;
  appStatus: AppStatus;
  stats: {
      inProgressCount: number;
      completedCount: number;
      streak: number;
      totalStepsFinished: number;
      thisWeekCompleted: number;
      totalFocusTime: number;
  };
  setCoach: (coachId: CoachId) => void;
  setGoal: (goal: string) => Promise<void>;
  startPlan: () => void;
  continueGoal: (goalId: string) => void;
  completeStep: (timeSpent: number) => void;
  nextStep: () => void;
  setNewGoal: () => void;
  backToGoalInput: () => void;
  toggleDarkMode: () => void;
  resetApp: () => void;
  viewArchive: () => void;
  exitArchive: () => void;
  viewPersonalCenter: () => void;
  exitPersonalCenter: () => void;
  viewSettings: () => void;
  exitSettings: () => void;
  deleteGoal: (goalId: string) => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(defaultAppData);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const getLocalStorageKey = useCallback(() => {
    if (!user) return null;
    return `${LOCAL_STORAGE_KEY_PREFIX}-${user.uid}`;
  }, [user]);

  useEffect(() => {
    const key = getLocalStorageKey();
    if (!key) {
      if(user === null) { // User is logged out
        setData(defaultAppData);
        setIsInitialized(false);
      }
      return;
    };

    if (isInitialized) return;

    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        const parsedData: AppData = JSON.parse(storedData);
        if (['loading', 'generating_plan', 'execution', 'step_completion'].includes(parsedData.appStatus)) {
            parsedData.appStatus = parsedData.coachId ? 'goal_input' : 'coach_selection';
        }
        parsedData.settings = { ...defaultSettings, ...parsedData.settings };
        setData(parsedData);
      } else {
        const initialStatus = coachList.length > 0 ? 'coach_selection' : 'loading';
        setData({ ...defaultAppData, appStatus: initialStatus });
      }
    } catch (error) {
      console.error('Failed to load data from local storage', error);
      setData({ ...defaultAppData, appStatus: 'coach_selection' });
    }
    setIsInitialized(true);
  }, [user, getLocalStorageKey, isInitialized]);

  useEffect(() => {
    const key = getLocalStorageKey();
    if (isInitialized && key) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, [data, isInitialized, getLocalStorageKey]);
  
  const activeGoal = data.goals.find(g => g.id === data.activeGoalId);
  const coach = data.coachId ? coaches[data.coachId] : (activeGoal ? coaches[activeGoal.coachId] : undefined);


  useEffect(() => {
    const root = document.documentElement;
    if (data.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const currentCoach = data.coachId ? coaches[data.coachId] : undefined;
    if (currentCoach) {
      root.style.setProperty('--primary', currentCoach.colors.primaryHsl);
    }
  }, [data.darkMode, data.coachId]);

  const stats = useMemo(() => {
    const completedGoals = data.goals.filter(g => g.status === 'completed');
    
    let currentStreak = 0;
    if (completedGoals.length > 0) {
        const sortedCompletions = completedGoals
            .map(g => new Date(g.completedAt!))
            .sort((a, b) => b.getTime() - a.getTime());
        
        const uniqueDays = sortedCompletions.filter((date, i, self) => 
            i === 0 || !isSameDay(date, self[i-1])
        );

        if (uniqueDays.length > 0) {
            const today = new Date();
            const differenceFromToday = differenceInCalendarDays(today, uniqueDays[0]);

            if (differenceFromToday <= 1) {
                currentStreak = 1;
                for (let i = 0; i < uniqueDays.length - 1; i++) {
                    const diff = differenceInCalendarDays(uniqueDays[i], uniqueDays[i+1]);
                    if (diff === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }
    }

    const stepsFinished = data.goals.reduce((acc, goal) => acc + (goal.status === 'completed' ? goal.actionPlan.steps.length : goal.currentStepIndex), 0);
    
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekCompleted = completedGoals.filter(g => new Date(g.completedAt!) >= weekStart).length;
    
    const totalFocusTime = data.goals.reduce((acc, goal) => acc + goal.totalTimeSpent, 0);

    return {
        inProgressCount: data.goals.filter(g => g.status === 'in-progress').length,
        completedCount: completedGoals.length,
        streak: currentStreak,
        totalStepsFinished: stepsFinished,
        thisWeekCompleted: weekCompleted,
        totalFocusTime: totalFocusTime,
    }
  }, [data.goals]);

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
        currentStepIndex: -1,
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
    const goalToContinue = data.goals.find(g => g.id === goalId);
    if(goalToContinue){
      updateData({ activeGoalId: goalId, appStatus: 'execution', coachId: goalToContinue.coachId });
    }
  }, [data.goals, updateData]);
  
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
  
  const backToGoalInput = useCallback(() => {
    const currentCoachId = data.coachId || coaches[0].id;
    updateData({ appStatus: 'goal_input', activeGoalId: undefined, coachId: currentCoachId });
  }, [updateData, data.coachId]);

  const toggleDarkMode = useCallback(() => {
    updateData({ darkMode: !data.darkMode });
  }, [data.darkMode, updateData]);
  
  const resetApp = useCallback(() => {
    const key = getLocalStorageKey();
    if(key) {
        localStorage.removeItem(key);
    }
    setData(defaultAppData);
    toast({ title: "Cache Cleared", description: "Application data has been reset." });
  }, [toast, getLocalStorageKey]);

  const viewArchive = useCallback(() => {
    updateData({ appStatus: 'archive' });
  }, [updateData]);

  const exitArchive = useCallback(() => {
    const currentCoachId = data.coachId || coachList[0].id;
    updateData({ appStatus: 'goal_input', activeGoalId: undefined, coachId: currentCoachId });
  }, [updateData, data.coachId]);

  const viewPersonalCenter = useCallback(() => {
    updateData({ appStatus: 'personal_center' });
  }, [updateData]);

  const exitPersonalCenter = useCallback(() => {
    updateData({ appStatus: 'goal_input' });
  }, [updateData]);

  const viewSettings = useCallback(() => {
    updateData({ appStatus: 'settings' });
  }, [updateData]);

  const exitSettings = useCallback(() => {
    if(data.activeGoalId){
        const activeGoal = data.goals.find(g => g.id === data.activeGoalId);
        if(activeGoal?.status === 'in-progress'){
            updateData({ appStatus: 'execution' });
            return;
        }
    }
    updateData({ appStatus: 'goal_input' });
  }, [updateData, data.activeGoalId, data.goals]);

  const deleteGoal = useCallback((goalId: string) => {
    const newGoals = data.goals.filter(g => g.id !== goalId);
    let newActiveGoalId = data.activeGoalId;
    if (data.activeGoalId === goalId) {
      newActiveGoalId = undefined;
    }
    updateData({ goals: newGoals, activeGoalId: newActiveGoalId });
  }, [data.goals, data.activeGoalId, updateData]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    updateData({
      settings: {
        ...data.settings,
        [key]: value,
      },
    });
  }, [data.settings, updateData]);

  const value: AppContextType = {
    data,
    coach,
    activeGoal,
    stats,
    appStatus: data.appStatus,
    setCoach,
    setGoal,
    startPlan,
    continueGoal,
    completeStep,
    nextStep,
    setNewGoal,
    backToGoalInput,
    toggleDarkMode,
    resetApp,
    viewArchive,
    exitArchive,
    viewPersonalCenter,
    exitPersonalCenter,
    viewSettings,
    exitSettings,
    deleteGoal,
    updateSetting,
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
