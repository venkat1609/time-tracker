import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { Task, CompletedTask, Session, TimerStatus } from "../shared/types";
import { useLocalStorage } from "./useLocalStorage";

interface UseTimerReturn {
  tasks: CompletedTask[];
  setTasks: React.Dispatch<React.SetStateAction<CompletedTask[]>>;
  currentTask: Task | null;
  getCurrentStatus: (task: Task | null) => TimerStatus;
  totalWorkTime: (task: Task) => number;
  currentSessionTime: (task: Task) => number;
  totalPauseTime: (task: Task) => number;
  startTask: () => void;
  pauseTask: () => void;
  resumeTask: () => void;
  stopTask: () => void;
  updateTaskName: (value: string) => void;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
  dummyTick: number;
}

const STORAGE_KEYS = {
  CURRENT_TASK: 'timer_current_task',
  COMPLETED_TASKS: 'timer_completed_tasks',
  LAST_TICK: 'timer_last_tick'
};

export const useTimer = (): UseTimerReturn => {
  // Use localStorage for persistence
  const [storedCurrentTask, setStoredCurrentTask] = useLocalStorage<Task | null>(
    STORAGE_KEYS.CURRENT_TASK, 
    null
  );
  const [storedTasks, setStoredTasks] = useLocalStorage<CompletedTask[]>(
    STORAGE_KEYS.COMPLETED_TASKS, 
    []
  );
  
  // Local state
  const [currentTask, setCurrentTask] = useState<Task | null>(storedCurrentTask);
  const [tasks, setTasks] = useState<CompletedTask[]>(storedTasks);
  const [dummyTick, setDummyTick] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTaskRef = useRef<CompletedTask | null>(null);

  // Sync localStorage with state
  useEffect(() => {
    setStoredCurrentTask(currentTask);
  }, [currentTask, setStoredCurrentTask]);

  useEffect(() => {
    setStoredTasks(tasks);
  }, [tasks, setStoredTasks]);

  // Initialize state from localStorage on mount
  useEffect(() => {
    const initializeFromStorage = () => {
      try {
        // Restore tasks
        if (storedTasks.length > 0) {
          setTasks(storedTasks);
        }

        // Restore current task and adjust timer if running
        if (storedCurrentTask) {
          const restoredTask = adjustTaskForTimeGap(storedCurrentTask);
          setCurrentTask(restoredTask);
        }
      } catch (error) {
        console.warn('Error initializing from localStorage:', error);
        setError('Failed to restore previous session');
      }
    };

    initializeFromStorage();
  }, []);

  // Adjust task for time gap when restoring from localStorage
  const adjustTaskForTimeGap = (task: Task): Task => {
    if (!task.sessions || task.sessions.length === 0) return task;
    
    const lastSession = task.sessions[task.sessions.length - 1];
    const now = new Date().toISOString();
    
    // If the last session was running but browser was closed/refreshed
    if (lastSession.status === 'running' && !lastSession.endTime) {
      const startTime = new Date(lastSession.startTime).getTime();
      const currentTime = Date.now();
      const timeDiff = currentTime - startTime;
      
      // If more than 30 minutes passed, consider it abandoned and pause
      const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 minutes
      
      if (timeDiff > MAX_IDLE_TIME) {
        // Auto-pause the abandoned session
        const updatedSessions = [...task.sessions];
        updatedSessions[updatedSessions.length - 1] = {
          ...lastSession,
          endTime: now
        };
        
        updatedSessions.push({
          status: 'paused',
          startTime: now,
          endTime: null
        });

        return {
          ...task,
          sessions: updatedSessions
        };
      }
    }
    
    return task;
  };

  // Clear any existing interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCurrentStatus = useCallback((task: Task | null): TimerStatus => {
    if (!task || !task.sessions || task.sessions.length === 0) return "stopped";
    return task.sessions[task.sessions.length - 1].status;
  }, []);

  // Memoized status to prevent unnecessary re-renders
  const currentStatus = useMemo(() => {
    return getCurrentStatus(currentTask);
  }, [currentTask, getCurrentStatus]);

  // Timer display updates with proper cleanup
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (currentStatus === "running") {
      intervalRef.current = setInterval(() => {
        setDummyTick((v) => v + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentStatus]);

  const totalWorkTime = useCallback((task: Task): number => {
    if (!task || !task.sessions) return 0;
    try {
      return task.sessions
        .filter((s: Session) => s.status === "running" && s.endTime)
        .reduce((sum: number, s: Session) => {
          const start = new Date(s.startTime).getTime();
          const end = new Date(s.endTime!).getTime();
          if (isNaN(start) || isNaN(end)) return sum;
          return sum + (end - start);
        }, 0);
    } catch {
      setError("Error calculating work time");
      return 0;
    }
  }, []);

  const currentSessionTime = useCallback((task: Task): number => {
    if (!task || !task.sessions || task.sessions.length === 0) return 0;
    
    try {
      const lastSession = task.sessions[task.sessions.length - 1];
      if (lastSession?.status === "running" && !lastSession.endTime) {
        const start = new Date(lastSession.startTime).getTime();
        if (isNaN(start)) return 0;
        return Date.now() - start;
      }
      return 0;
    } catch {
      setError("Error calculating current session time");
      return 0;
    }
  }, []);

  const totalPauseTime = useCallback((task: Task): number => {
    if (!task || !task.sessions) return 0;
    try {
      return task.sessions
        .filter((s: Session) => s.status === "paused" && s.endTime)
        .reduce((sum: number, s: Session) => {
          const start = new Date(s.startTime).getTime();
          const end = new Date(s.endTime!).getTime();
          if (isNaN(start) || isNaN(end)) return sum;
          return sum + (end - start);
        }, 0);
    } catch {
      setError("Error calculating pause time");
      return 0;
    }
  }, []);

  const startTask = useCallback((): void => {
    if (isProcessing) return;
    
    try {
      clearError();
      setIsProcessing(true);
      
      const now = new Date().toISOString();
      const newTask: Task = {
        taskName: "",
        overallStartTime: now,
        overallEndTime: null,
        sessions: [
          {
            status: "running",
            startTime: now,
            endTime: null,
          },
        ],
      };
      
      setCurrentTask(newTask);
      setDummyTick(0);
    } catch {
      setError("Failed to start task");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, clearError]);

  const pauseTask = useCallback((): void => {
    if (isProcessing || !currentTask) return;

    try {
      clearError();
      setIsProcessing(true);

      setCurrentTask((task) => {
        if (!task) return null;
        
        const sessions = [...task.sessions];
        const lastSession = sessions[sessions.length - 1];
        
        if (lastSession.status === "running" && !lastSession.endTime) {
          lastSession.endTime = new Date().toISOString();
        }
        
        sessions.push({
          status: "paused",
          startTime: new Date().toISOString(),
          endTime: null,
        });
        
        return { ...task, sessions };
      });
    } catch {
      setError("Failed to pause task");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, currentTask, clearError]);

  const resumeTask = useCallback((): void => {
    if (isProcessing || !currentTask) return;

    try {
      clearError();
      setIsProcessing(true);

      setCurrentTask((task) => {
        if (!task) return null;
        
        const sessions = [...task.sessions];
        const lastSession = sessions[sessions.length - 1];
        
        if (lastSession.status === "paused" && !lastSession.endTime) {
          lastSession.endTime = new Date().toISOString();
        }
        
        sessions.push({
          status: "running",
          startTime: new Date().toISOString(),
          endTime: null,
        });
        
        return { ...task, sessions };
      });
    } catch {
      setError("Failed to resume task");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, currentTask, clearError]);

  const stopTask = useCallback((): void => {
    if (isProcessing || !currentTask) return;

    try {
      clearError();
      setIsProcessing(true);

      setCurrentTask((task) => {
        if (!task) {
          setIsProcessing(false);
          return null;
        }

        // Finalize the current session
        const newSessions = [...task.sessions];
        const lastSession = newSessions[newSessions.length - 1];
        
        if (!lastSession.endTime) {
          lastSession.endTime = new Date().toISOString();
        }

        const now = new Date().toISOString();
        const taskWithEndedSessions = { ...task, sessions: newSessions };
        
        // Calculate times
        const workTimeMs = totalWorkTime(taskWithEndedSessions) + currentSessionTime(taskWithEndedSessions);
        const pauseTimeMs = totalPauseTime(taskWithEndedSessions);

        const completedTask: CompletedTask = {
          ...task,
          overallEndTime: now,
          taskName: task.taskName?.trim() || null,
          sessions: newSessions,
          totalWorkTime: Math.floor(workTimeMs / 1000),
          totalPauseTime: Math.floor(pauseTimeMs / 1000),
          originalDuration: Math.floor(workTimeMs / 1000),
        };

        // Prevent duplicate tasks
        if (lastTaskRef.current && 
            lastTaskRef.current.overallStartTime === completedTask.overallStartTime &&
            lastTaskRef.current.overallEndTime === completedTask.overallEndTime) {
          setIsProcessing(false);
          return null;
        }

        lastTaskRef.current = completedTask;
        
        // Add task to list
        setTasks((prev) => [...prev, completedTask]);
        setDummyTick(0);
        setIsProcessing(false);
        
        // Clear current task from localStorage
        setStoredCurrentTask(null);
        
        return null;
      });
    } catch {
      setError("Failed to stop task");
      setIsProcessing(false);
    }
  }, [isProcessing, currentTask, totalWorkTime, currentSessionTime, totalPauseTime, clearError, setStoredCurrentTask]);

  const updateTaskName = useCallback((value: string): void => {
    if (isProcessing) return;
    
    try {
      setCurrentTask((task) => {
        if (!task) return null;
        return { ...task, taskName: value };
      });
    } catch {
      setError("Failed to update task name");
    }
  }, [isProcessing]);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Custom setTasks that also updates localStorage
  const setTasksWithStorage = useCallback((action: React.SetStateAction<CompletedTask[]>) => {
    setTasks(action);
  }, []);

  return {
    tasks,
    setTasks: setTasksWithStorage,
    currentTask,
    getCurrentStatus,
    totalWorkTime,
    currentSessionTime,
    totalPauseTime,
    startTask,
    pauseTask,
    resumeTask,
    stopTask,
    updateTaskName,
    isProcessing,
    error,
    clearError,
    dummyTick,
  };
};
