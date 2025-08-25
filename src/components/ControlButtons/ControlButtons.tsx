import React from "react";
import type { TimerStatus } from "../../shared/types";

interface ControlButtonsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
}) => {
  return (
    <div className="button-group">
      {status === "stopped" && (
        <button onClick={onStart} type="button">
          Start
        </button>
      )}
      {status === "running" && (
        <>
          <button id="pauseBtn" onClick={onPause} type="button">
            Pause
          </button>
          <button id="stopBtn" onClick={onStop} type="button">
            Stop
          </button>
        </>
      )}
      {status === "paused" && (
        <>
          <button id="resumeBtn" onClick={onResume} type="button">
            Resume
          </button>
          <button id="stopBtn" onClick={onStop} type="button">
            Stop
          </button>
        </>
      )}
    </div>
  );
};
