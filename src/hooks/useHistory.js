import { useState, useCallback, useRef, useEffect } from 'react';

const MAX_HISTORY = 50;

export function useHistory(current, setCurrent) {
  const [past,   setPast]   = useState([]);
  const [future, setFuture] = useState([]);

  // Ref håller alltid senaste värde → inga stale closures
  const latestCurrent = useRef(current);
  useEffect(() => { latestCurrent.current = current; }, [current]);

  const pushHistory = useCallback((next) => {
    setPast(p => {
      const trimmed = p.length >= MAX_HISTORY ? p.slice(1) : p;
      return [...trimmed, latestCurrent.current];
    });
    setFuture([]);
    setCurrent(next);
  }, [setCurrent]);

  const undo = useCallback(() => {
    setPast(p => {
      if (!p.length) return p;
      const previous = p[p.length - 1];
      setFuture(f => [latestCurrent.current, ...f]);
      setCurrent(previous);
      return p.slice(0, -1);
    });
  }, [setCurrent]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (!f.length) return f;
      const next = f[0];
      setPast(p => [...p, latestCurrent.current]);
      setCurrent(next);
      return f.slice(1);
    });
  }, [setCurrent]);

  // Rensar hela historiken – anropas vid månadsbyten så att
  // undo/redo aldrig kan applicera aktiviteter från fel månad.
  const resetHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    pushHistory,
    undo,
    redo,
    resetHistory,
    canUndo:     past.length > 0,
    canRedo:     future.length > 0,
    historySize: past.length,
    futureSize:  future.length,
  };
}
