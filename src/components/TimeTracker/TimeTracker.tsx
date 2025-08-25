import React, { useState } from "react";
import { TimerDisplay } from "../TimerDisplay/TimerDisplay";
import { ControlButtons } from "../ControlButtons/ControlButtons";
import { CurrentTaskPanel } from "../CurrentTaskPanel/CurrentTaskPanel";
import { TaskTable } from "../TaskTable/TaskTable";
import { SessionModal } from "../SessionModal/SessionModal";
import { useTimer } from "../../hooks/useTimer";
import { parseInputDateTime, validateTimeRange } from "../../shared/utils";
import "./TimeTracker.css";

const TimeTracker: React.FC = () => {
  const {
    tasks,
    setTasks,
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
  } = useTimer();

  const [editIndex, setEditIndex] = useState<number>(-1);
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  const status = getCurrentStatus(currentTask);

  // Task management functions
  const saveTaskEdit = (
    idx: number,
    name: string,
    startInput: string,
    endInput: string
  ): void => {
    const newTasks = [...tasks];
    const start = parseInputDateTime(startInput);
    const end = parseInputDateTime(endInput);
    const orig = newTasks[idx].originalDuration || newTasks[idx].totalWorkTime;
    const validation = validateTimeRange(start, end, orig);

    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    newTasks[idx] = {
      ...newTasks[idx],
      taskName: name.trim() || null,
      overallStartTime: start.toISOString(),
      overallEndTime: end.toISOString(),
      totalWorkTime: validation.duration,
    };

    setTasks(newTasks);
    setEditIndex(-1);
  };

  const deleteTask = (idx: number): void => {
    if (window.confirm("Delete this task?")) {
      setTasks((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  return (
    <div>
      <link
        href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      {currentTask && (
        <TimerDisplay
          currentTask={currentTask}
          status={status}
          totalWorkTime={totalWorkTime(currentTask)}
          currentSessionTime={currentSessionTime(currentTask)}
        />
      )}

      <ControlButtons
        status={status}
        onStart={startTask}
        onPause={pauseTask}
        onResume={resumeTask}
        onStop={stopTask}
      />

      {currentTask && (
        <CurrentTaskPanel
          currentTask={currentTask}
          status={status}
          totalWorkTimeMs={
            totalWorkTime(currentTask) + currentSessionTime(currentTask)
          }
          totalPauseTimeMs={totalPauseTime(currentTask)}
          onTaskNameChange={updateTaskName}
        />
      )}

      <TaskTable
        tasks={tasks}
        editIndex={editIndex}
        onEdit={setEditIndex}
        onSave={saveTaskEdit}
        onCancel={() => setEditIndex(-1)}
        onDelete={deleteTask}
        onViewSessions={setModalIdx}
      />

      {modalIdx !== null && (
        <SessionModal
          task={tasks[modalIdx]}
          onClose={() => setModalIdx(null)}
        />
      )}
    </div>
  );
};

export default TimeTracker;
