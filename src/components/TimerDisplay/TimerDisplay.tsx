import React from "react";
import { formatTimeHMS } from "../../shared/utils";
import type { Task, TimerStatus } from "../../shared/types";

interface TimerDisplayProps {
  currentTask: Task | null;
  status: TimerStatus;
  totalWorkTime: number;
  currentSessionTime: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  currentTask,
  status,
  totalWorkTime,
  currentSessionTime,
}) => {
  // Check if session was restored (has previous sessions)
  const isRestoredSession = currentTask?.sessions && currentTask.sessions.length > 1;
  
  return (
    <>
      <h1>Time Tracker</h1>
      <div
        className={`timer ${
          status === "running" ? "running" : status === "paused" ? "paused" : ""
        }`}
      >
        {currentTask
          ? formatTimeHMS(totalWorkTime + currentSessionTime)
          : "00:00:00"}
      </div>
      
      {isRestoredSession && status !== "stopped" && (
        <div className="restored-indicator">
          📱 Session restored from previous browser session
        </div>
      )}
      
      <div
        className={`status-indicator ${
          status === "running"
            ? "status-running"
            : status === "paused"
            ? "status-paused"
            : ""
        }`}
        style={{
          display:
            status === "running" || status === "paused" ? "block" : "none",
        }}
      >
        {status === "running" ? "Running" : status === "paused" ? "Paused" : ""}
      </div>
    </>
  );
};
