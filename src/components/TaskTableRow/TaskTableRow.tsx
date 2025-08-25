import React from "react";
import type { CompletedTask, Session } from "../../shared/types";
import {
  formatDuration,
  formatDateTime,
  formatDateTimeForInput,
} from "../../shared/utils";

interface TaskTableRowProps {
  task: CompletedTask;
  index: number;
  isEditing: boolean;
  onEdit: (index: number) => void;
  onSave: (idx: number, name: string, start: string, end: string) => void;
  onCancel: () => void;
  onDelete: (index: number) => void;
  onViewSessions: (index: number) => void;
}

export const TaskTableRow: React.FC<TaskTableRowProps> = ({
  task,
  index,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onViewSessions,
}) => {
  if (isEditing) {
    return (
      <tr className="editing">
        <td>
          <input
            type="text"
            className="edit-input"
            defaultValue={task.taskName || ""}
            id={`editName${index}`}
            placeholder="Task name"
          />
        </td>
        <td>
          <span id={`duration-${index}`} className="duration-display">
            {formatDuration(task.totalWorkTime)}
          </span>
        </td>
        <td>
          {task.sessions.length} total (
          {task.sessions.filter((s: Session) => s.status === "running").length}
          R/
          {task.sessions.filter((s: Session) => s.status === "paused").length}P)
        </td>
        <td className="timestamp">
          <input
            type="datetime-local"
            className="edit-input"
            defaultValue={formatDateTimeForInput(task.overallStartTime)}
            id={`editStart${index}`}
            step="1"
          />
        </td>
        <td className="timestamp">
          <input
            type="datetime-local"
            className="edit-input"
            defaultValue={formatDateTimeForInput(task.overallEndTime)}
            id={`editEnd${index}`}
            step="1"
          />
        </td>
        <td className="actions">
          <button
            className="small-btn save-btn"
            onClick={() => {
              const nameInput = document.getElementById(
                `editName${index}`
              ) as HTMLInputElement;
              const startInput = document.getElementById(
                `editStart${index}`
              ) as HTMLInputElement;
              const endInput = document.getElementById(
                `editEnd${index}`
              ) as HTMLInputElement;
              onSave(index, nameInput.value, startInput.value, endInput.value);
            }}
            title="Save"
            type="button"
          >
            ✓
          </button>
          <button
            className="small-btn cancel-btn"
            onClick={onCancel}
            title="Cancel"
            type="button"
          >
            ✕
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className={task.taskName ? "task-name" : "task-name no-name"}>
        {task.taskName || "Unnamed Task"}
      </td>
      <td className="time-taken">{formatDuration(task.totalWorkTime)}</td>
      <td>
        {task.sessions.length} total (
        {task.sessions.filter((s: Session) => s.status === "running").length}R/
        {task.sessions.filter((s: Session) => s.status === "paused").length}P)
      </td>
      <td className="timestamp">{formatDateTime(task.overallStartTime)}</td>
      <td className="timestamp">{formatDateTime(task.overallEndTime)}</td>
      <td className="actions">
        <button
          className="small-btn view-btn"
          onClick={() => onViewSessions(index)}
          title="View Sessions"
          type="button"
        >
          👁
        </button>
        <button
          className="small-btn edit-btn"
          onClick={() => onEdit(index)}
          title="Edit"
          type="button"
        >
          ✎
        </button>
        <button
          className="small-btn delete-btn"
          onClick={() => onDelete(index)}
          title="Delete"
          type="button"
        >
          🗑
        </button>
      </td>
    </tr>
  );
};
