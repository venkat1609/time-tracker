export interface Session {
  status: "running" | "paused";
  startTime: string;
  endTime: string | null;
}

export interface Task {
  taskName: string | null;
  overallStartTime: string;
  overallEndTime: string | null;
  sessions: Session[];
  totalWorkTime?: number;
  totalPauseTime?: number;
  originalDuration?: number;
}

export interface CompletedTask extends Task {
  overallEndTime: string;
  totalWorkTime: number;
  totalPauseTime: number;
  originalDuration: number;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  duration: number;
}

export type TimerStatus = "stopped" | "running" | "paused";
