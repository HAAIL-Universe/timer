import { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [timerId, setTimerId] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const localTimerRef = useRef(null);
  const syncTimerRef = useRef(null);
  const lastSyncRef = useRef(0);

  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    const saved = localStorage.getItem('timerId');
    if (saved) {
      setTimerId(saved);
      syncWithServer(saved);
    }
  }, []);

  const syncWithServer = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/timers/${id}`);
      if (!res.ok) throw new Error('Failed to sync');
      const data = await res.json();
      setElapsedSeconds(data.elapsed_seconds);
      setIsRunning(data.is_running);
      setError(null);
    } catch (err) {
      setError('Sync failed');
    }
  };

  useEffect(() => {
    if (!timerId) return;

    const syncInterval = setInterval(() => {
      syncWithServer(timerId);
      lastSyncRef.current = Date.now();
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [timerId]);

  useEffect(() => {
    if (!isRunning) {
      if (localTimerRef.current) clearInterval(localTimerRef.current);
      return;
    }

    localTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(localTimerRef.current);
  }, [isRunning]);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let id = timerId;
      if (!id) {
        const createRes = await fetch(`${API_BASE}/timers`, { method: 'POST' });
        if (!createRes.ok) throw new Error('Failed to create timer');
        const created = await createRes.json();
        id = created.id;
        setTimerId(id);
        localStorage.setItem('timerId', id);
      }

      const startRes = await fetch(`${API_BASE}/timers/${id}/start`, { method: 'POST' });
      if (!startRes.ok) throw new Error('Failed to start');
      
      const data = await startRes.json();
      setElapsedSeconds(data.elapsed_seconds);
      setIsRunning(true);
    } catch (err) {
      setError(err.message || 'Failed to start timer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!timerId) return;
    setIsLoading(true);
    setError(null);

    try {
      const stopRes = await fetch(`${API_BASE}/timers/${timerId}/stop`, { method: 'POST' });
      if (!stopRes.ok) throw new Error('Failed to stop');
      
      const data = await stopRes.json();
      setElapsedSeconds(data.elapsed_seconds);
      setIsRunning(false);
    } catch (err) {
      setError(err.message || 'Failed to stop timer');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="app">
      <div className="timer-container">
        <h1 className="timer-display">{formatTime(elapsedSeconds)}</h1>
        <button
          className="control-button"
          onClick={isRunning ? handleStop : handleStart}
          disabled={isLoading}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
