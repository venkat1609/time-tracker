import React from "react";
import type { CompletedTask, Session } from "../../shared/types";
import { formatDuration, formatDateTime } from "../../shared/utils";

interface SessionModalProps {
  task: CompletedTask | null;
  onClose: () => void;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  task,
  onClose,
}) => {
  if (!task) return null;

  return (
    <div className="session-modal" style={{ display: "flex" }}>
      <div className="modal-content">
        <div className="modal-header">
          Session Timeline
          <button
            className="close-modal"
            style={{ float: "right" }}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div>
          <strong>Task:</strong> {task.taskName || "Unnamed Task"}
          <br />
          <strong>Total Work Time:</strong> {formatDuration(task.totalWorkTime)}
          <br />
          <strong>Total Pause Time:</strong>{" "}
          {formatDuration(task.totalPauseTime)}
          <br />
          <strong>Overall:</strong> {formatDateTime(task.overallStartTime)} -{" "}
          {formatDateTime(task.overallEndTime)}
        </div>
        <div
          style={{ borderTop: "1px solid var(--table-border)", paddingTop: 16 }}
        >
          <strong>Sessions:</strong>
          {task.sessions.map((session: Session, i: number) => {
            const duration = session.endTime
              ? Math.floor(
                  (new Date(session.endTime).getTime() -
                    new Date(session.startTime).getTime()) /
                    1000
                )
              : 0;
            return (
              <div
                key={i}
                className={`session-entry session-${session.status}`}
                style={{ margin: "8px 0" }}
              >
                <strong>
                  {i + 1}. {session.status.toUpperCase()}
                </strong>
                <br />
                Duration: {formatDuration(duration)}
                <br />
                {formatDateTime(session.startTime)} →{" "}
                {session.endTime
                  ? formatDateTime(session.endTime)
                  : "Incomplete"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
