import React from "react";
import type { Task, Session, TimerStatus } from "../../shared/types";
import { formatDuration, formatDateTime } from "../../shared/utils";

interface CurrentTaskPanelProps {
  currentTask: Task;
  status: TimerStatus;
  totalWorkTimeMs: number;
  totalPauseTimeMs: number;
  onTaskNameChange: (value: string) => void;
}

export const CurrentTaskPanel: React.FC<CurrentTaskPanelProps> = ({
  currentTask,
  status,
  totalWorkTimeMs,
  totalPauseTimeMs,
  onTaskNameChange,
}) => {
  return (
    <div id="taskInput" className="show">
      <input
        type="text"
        className="main-input"
        placeholder="Enter task name (optional)"
        value={currentTask.taskName || ""}
        onChange={(e) => onTaskNameChange(e.target.value)}
      />
      <div className="session-info" style={{ display: "block" }}>
        <div>Active sessions: {currentTask.sessions.length}</div>
        <div>
          Total work time: {formatDuration(Math.floor(totalWorkTimeMs / 1000))}
        </div>
        <div>
          Total pause time:{" "}
          {formatDuration(Math.floor(totalPauseTimeMs / 1000))}
        </div>
      </div>
      <div className="session-details" style={{ display: "block" }}>
        <strong>Session Timeline:</strong>
        <br />
        {currentTask.sessions.map((session: Session, index: number) => {
          const duration = session.endTime
            ? Math.floor(
                (new Date(session.endTime).getTime() -
                  new Date(session.startTime).getTime()) /
                  1000
              )
            : status === session.status
            ? Math.floor(
                (Date.now() - new Date(session.startTime).getTime()) / 1000
              )
            : 0;

          return (
            <div
              key={index}
              className={`session-entry session-${session.status}`}
            >
              {index + 1}. {session.status.toUpperCase()}:{" "}
              {formatDuration(duration)} ({formatDateTime(session.startTime)}{" "}
              {session.endTime
                ? " - " + formatDateTime(session.endTime)
                : status === session.status
                ? " - In progress..."
                : ""}
              )
            </div>
          );
        })}
      </div>
    </div>
  );
};
