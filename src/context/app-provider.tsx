
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { AppData, AppSettings, AppStatus, Coach, CoachId, Goal } from '@/lib/types';
import { coaches, coachList } from '@/lib/coaches';
import { generateActionPlanAction } from '@/ai/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-provider';
import { isSameDay, startOfWeek, differenceInCalendarDays, startOfToday } from 'date-fns';

const LOCAL_STORAGE_KEY_PREFIX = 'pro-coach-ai-data-v4';

const defaultSettings: AppSettings = {
    showTimer: true,
    reminderTime: '9:00 AM',
};

const defaultAppData: AppData = {
  appStatus: 'loading',
  goals: [],
  darkMode: false,
  settings: defaultSettings,
  bestStreak: 0,
};

interface AppContextType {
  data: AppData;
  coach?: Coach;
  activeGoal?: Goal;
  appStatus: AppStatus;
  stats: {
      streak: number;
      bestStreak: number;
      todayCompletedCount: number;
      thisWeekCompleted: number;
      completedCount: number;
      totalFocusTime: number;
      todayFocusTime: number;
      totalStepsForInProgressGoals: number;
      totalStepsCompletedForInProgressGoals: number;
      quickStats: {
        totalGoals: number;
        totalSteps: number;
        avgStepsPerGoal: number;
      }
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
  toggleStepCompletion: (goalId: string, stepNumber: number) => void;
  markGoalAsComplete: (goalId: string) => void;
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

    if (isInitialized && user) return;

    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        const parsedData: AppData = JSON.parse(storedData);
        // Always start at goal input page after login
        parsedData.appStatus = parsedData.coachId ? 'goal_input' : 'coach_selection';
        parsedData.activeGoalId = undefined; // Clear any active goal from previous session
        
        parsedData.goals.forEach(g => {
            if(!g.completedSteps) {
                g.completedSteps = g.stepHistory.map(h => h.stepIndex + 1);
            }
        });

        parsedData.settings = { ...defaultSettings, ...parsedData.settings };
        parsedData.bestStreak = parsedData.bestStreak || 0;
        setData(parsedData);
      } else {
        const initialStatus = coachList.length > 0 ? 'coach_selection' : 'loading';
        setData({ ...defaultAppData, appStatus: initialStatus });
      }
    } catch (error) {
      console.error('Failed to load data from local storage', error);
      setData({ ...defaultAppData, appStatus: 'coach_selection' });
    }
    if (user) {
        setIsInitialized(true);
    }
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
    const allGoals = data.goals;
    const completedGoals = allGoals.filter(g => g.status === 'completed');
    const inProgressGoals = allGoals.filter(g => g.status === 'in-progress');
    const today = new Date();
    const todayStart = startOfToday();

    let currentStreak = 0;
    const activityDates = allGoals.flatMap(g => 
        [...g.stepHistory.map(h => new Date(h.completedAt)), g.completedAt ? new Date(g.completedAt) : null]
    ).filter((d): d is Date => d !== null);

    if (activityDates.length > 0) {
        const uniqueDays = [...new Set(activityDates.map(d => d.toISOString().split('T')[0]))]
            .map(ds => new Date(ds))
            .sort((a, b) => b.getTime() - a.getTime());

        if (uniqueDays.length > 0) {
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
    
    const bestStreak = Math.max(data.bestStreak || 0, currentStreak);

    const todayCompletedCount = completedGoals.filter(g => new Date(g.completedAt!) >= todayStart).length;
    
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const thisWeekCompleted = completedGoals.filter(g => new Date(g.completedAt!) >= weekStart).length;

    const totalFocusTime = allGoals.reduce((acc, goal) => acc + goal.totalTimeSpent, 0);
    const todayFocusTime = allGoals.reduce((acc, goal) => {
        const todayStepsTime = goal.stepHistory
            .filter(h => new Date(h.completedAt) >= todayStart)
            .reduce((sum, h) => sum + h.timeSpent, 0);
        return acc + todayStepsTime;
    }, 0);

    const totalStepsForInProgressGoals = inProgressGoals.reduce((acc, goal) => acc + goal.actionPlan.steps.length, 0);
    const totalStepsCompletedForInProgressGoals = inProgressGoals.reduce((acc, goal) => acc + (goal.currentStepIndex > 0 ? goal.currentStepIndex : 0), 0);
    
    const totalGoals = allGoals.length;
    const totalSteps = allGoals.reduce((sum, goal) => sum + goal.actionPlan.steps.length, 0);
    const avgStepsPerGoal = totalGoals > 0 ? totalSteps / totalGoals : 0;

    return {
        streak: currentStreak,
        bestStreak,
        todayCompletedCount,
        thisWeekCompleted,
        completedCount: completedGoals.length,
        totalFocusTime,
        todayFocusTime,
        totalStepsForInProgressGoals,
        totalStepsCompletedForInProgressGoals,
        quickStats: {
            totalGoals,
            totalSteps,
            avgStepsPerGoal,
        }
    }
  }, [data.goals, data.bestStreak]);


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
      const plan = await generateActionPlanAction({ goal: title, coachPersonality: coaches[data.coachId].name as any });
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
        completedSteps: [],
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
      let goalUpdate = { ...goalToContinue };

      let firstUncompletedIndex = -1;
      for (let i = 0; i < goalUpdate.actionPlan.steps.length; i++) {
        if (!goalUpdate.completedSteps.includes(goalUpdate.actionPlan.steps[i].stepNumber)) {
          firstUncompletedIndex = i;
          break;
        }
      }

      // If all steps are somehow complete but status is 'in-progress', or no uncompleted step found
      if (firstUncompletedIndex === -1) {
         goalUpdate.status = 'completed';
         goalUpdate.completedAt = new Date().toISOString();
         goalUpdate.currentStepIndex = -1;
      } else {
        goalUpdate.currentStepIndex = firstUncompletedIndex;
      }
      
      const newGoals = data.goals.map(g => g.id === goalId ? goalUpdate : g);
      updateData({ goals: newGoals, activeGoalId: goalId, appStatus: 'execution', coachId: goalToContinue.coachId });
    }
  }, [data.goals, updateData]);
  
  const completeStep = useCallback((timeSpent: number) => {
    if (!activeGoal) return;
    const newGoals = data.goals.map(g => {
        if (g.id === data.activeGoalId) {
            const completedStepNumber = g.actionPlan.steps[g.currentStepIndex].stepNumber;
            const updatedCompletedSteps = [...g.completedSteps, completedStepNumber];
            return {
                ...g,
                totalTimeSpent: g.totalTimeSpent + timeSpent,
                stepHistory: [...g.stepHistory, {
                    stepIndex: g.currentStepIndex,
                    timeSpent,
                    completedAt: new Date().toISOString()
                }],
                completedSteps: updatedCompletedSteps,
            }
        }
        return g;
    });
    updateData({ appStatus: 'step_completion', goals: newGoals });
  }, [updateData, activeGoal, data.goals, data.activeGoalId]);

  const nextStep = useCallback(() => {
    if (!activeGoal) return;
    
    // Find the next uncompleted step
    let nextUncompletedIndex = -1;
    for(let i = 0; i < activeGoal.actionPlan.steps.length; i++) {
        const step = activeGoal.actionPlan.steps[i];
        if(!activeGoal.completedSteps.includes(step.stepNumber)) {
            nextUncompletedIndex = i;
            break;
        }
    }

    if (nextUncompletedIndex !== -1) {
      const newGoals = data.goals.map(g => 
        g.id === data.activeGoalId ? {...g, currentStepIndex: nextUncompletedIndex} : g
      );
      updateData({ appStatus: 'execution', goals: newGoals });
    } else {
       const newGoals = data.goals.map(g => 
        g.id === data.activeGoalId ? {
            ...g, 
            status: 'completed' as 'completed', 
            completedAt: new Date().toISOString(),
            currentStepIndex: -1 // No active step
        } : g
      );
      updateData({ 
          appStatus: 'final_celebration', 
          goals: newGoals,
          bestStreak: Math.max(data.bestStreak || 0, stats.streak)
      });
    }
  }, [activeGoal, data.goals, data.activeGoalId, updateData, data.bestStreak, stats.streak]);

  const setNewGoal = useCallback(() => {
    updateData({
      appStatus: 'goal_input',
      activeGoalId: undefined,
    });
  }, [updateData]);
  
  const backToGoalInput = useCallback(() => {
    const currentCoachId = data.coachId || coachList[0].id;
    updateData({ 
        appStatus: 'goal_input', 
        activeGoalId: undefined, 
        coachId: currentCoachId,
        bestStreak: Math.max(data.bestStreak || 0, stats.streak)
    });
  }, [updateData, data.coachId, data.bestStreak, stats.streak]);

  const toggleDarkMode = useCallback(() => {
    updateData({ darkMode: !data.darkMode });
  }, [data.darkMode, updateData]);
  
  const resetApp = useCallback(() => {
    const key = getLocalStorageKey();
    if(key) {
        localStorage.removeItem(key);
    }
    setData(defaultAppData);
    setIsInitialized(false);
    toast({ title: "Cache Cleared", description: "Application data has been reset." });
  }, [toast, getLocalStorageKey]);

  const viewArchive = useCallback(() => {
    updateData({ 
        appStatus: 'archive',
        bestStreak: Math.max(data.bestStreak || 0, stats.streak)
    });
  }, [updateData, data.bestStreak, stats.streak]);

  const exitArchive = useCallback(() => {
    const currentCoachId = data.coachId || coachList[0].id;
    updateData({ appStatus: 'goal_input', activeGoalId: undefined, coachId: currentCoachId });
  }, [updateData, data.coachId]);

  const viewPersonalCenter = useCallback(() => {
    updateData({ 
        appStatus: 'personal_center',
        bestStreak: Math.max(data.bestStreak || 0, stats.streak)
    });
  }, [updateData, data.bestStreak, stats.streak]);

  const exitPersonalCenter = useCallback(() => {
    updateData({ appStatus: 'goal_input' });
  }, [updateData]);

  const viewSettings = useCallback(() => {
    updateData({ appStatus: 'settings' });
  }, [updateData]);

  const exitSettings = useCallback(() => {
    if (data.activeGoalId) {
      const activeGoal = data.goals.find((g) => g.id === data.activeGoalId);
      if (activeGoal?.status === 'in-progress' && activeGoal.currentStepIndex > -1) {
        updateData({appStatus: 'execution'});
        return;
      }
      if (activeGoal?.status === 'in-progress' && activeGoal.currentStepIndex === -1) {
        updateData({appStatus: 'action_plan'});
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
  
  const toggleStepCompletion = useCallback((goalId: string, stepNumber: number) => {
    const newGoals = data.goals.map(g => {
        if (g.id === goalId) {
            const completedSteps = g.completedSteps || [];
            const isCompleted = completedSteps.includes(stepNumber);
            const newCompletedSteps = isCompleted 
                ? completedSteps.filter(sn => sn !== stepNumber) 
                : [...completedSteps, stepNumber];
            
            const allStepsCompleted = g.actionPlan.steps.every(step => newCompletedSteps.includes(step.stepNumber));
            
            let status: Goal['status'] = g.status;
            let completedAt = g.completedAt;

            if (allStepsCompleted) {
                status = 'completed';
                completedAt = new Date().toISOString();
            } else {
                status = 'in-progress';
                completedAt = undefined;
            }

            return {
                ...g,
                completedSteps: newCompletedSteps,
                status,
                completedAt,
            };
        }
        return g;
    });
    updateData({ goals: newGoals });
  }, [data.goals, updateData]);

  const markGoalAsComplete = useCallback((goalId: string) => {
      const newGoals = data.goals.map(g => {
          if(g.id === goalId) {
              const allStepNumbers = g.actionPlan.steps.map(s => s.stepNumber);
              return {
                  ...g,
                  status: 'completed' as const,
                  completedAt: new Date().toISOString(),
                  completedSteps: allStepNumbers,
              }
          }
          return g;
      });
      updateData({ goals: newGoals });
  }, [data.goals, updateData]);

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
    toggleStepCompletion,
    markGoalAsComplete,
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
