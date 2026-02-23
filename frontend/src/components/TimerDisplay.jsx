import React from 'react';
import { formatTime } from '../utils/formatTime';

export default function TimerDisplay({ elapsedSeconds, isRunning }) {
  return (
    <div className="timer-display">
      <div
        className={`timer-time ${isRunning ? 'running' : 'stopped'}`}
        aria-live="polite"
        aria-label={`Elapsed time: ${formatTime(elapsedSeconds)}`}
      >
        {formatTime(elapsedSeconds)}
      </div>
    </div>
  );
}
