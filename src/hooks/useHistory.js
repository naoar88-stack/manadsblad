import { useState, useCallback } from 'react';

export function useHistory(current, setCurrent) {
  const [past,   setPast]   = useState([]);
  const [future, setFuture] = useState([]);

  const pushHistory = useCallback((next) => {
    setPast(p => [...p, current]);
    setFuture([]);
    setCurrent(next);
  }, [current, setCurrent]);

  const undo = useCallback(() => {
    if (!past.length) return;
    const previous = past[past.length - 1];
    setPast(p => p.slice(0, -1));
    setFuture(f => [current, ...f]);
    setCurrent(previous);
  }, [past, current, setCurrent]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const next = future[0];
    setFuture(f => f.slice(1));
    setPast(p => [...p, current]);
    setCurrent(next);
  }, [future, current, setCurrent]);

  return {
    pushHistory,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historySize: past.length,
    futureSize: future.length,
  };
}
