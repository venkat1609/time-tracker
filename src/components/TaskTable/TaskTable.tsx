import React from "react";
import type { CompletedTask } from "../../shared/types";
import { TaskTableRow } from "../TaskTableRow/TaskTableRow";

interface TaskTableProps {
  tasks: CompletedTask[];
  editIndex: number;
  onEdit: (index: number) => void;
  onSave: (idx: number, name: string, start: string, end: string) => void;
  onCancel: () => void;
  onDelete: (index: number) => void;
  onViewSessions: (index: number) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  editIndex,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onViewSessions,
}) => {
  if (tasks.length === 0) return null;

  return (
    <div className={`tasks${tasks.length ? " show" : ""}`}>
      <h2>Recorded Tasks</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Work Time</th>
              <th>Sessions</th>
              <th className="timestamp">Start Time</th>
              <th className="timestamp">End Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task: CompletedTask, idx: number) => (
              <TaskTableRow
                key={idx}
                task={task}
                index={idx}
                isEditing={editIndex === idx}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
                onDelete={onDelete}
                onViewSessions={onViewSessions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
