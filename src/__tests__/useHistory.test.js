/**
 * useHistory — enhetstester
 * Kör med: vitest (eller jest med jsdom)
 */
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../hooks/useHistory';

const INITIAL = [{ id: '1', text: 'Aktivitet A' }];

describe('useHistory', () => {
  test('returnerar initialt tillstånd', () => {
    const { result } = renderHook(() => useHistory(INITIAL));
    expect(result.current.current).toEqual(INITIAL);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  test('push lägger till i historiken och möjliggör undo', () => {
    const { result } = renderHook(() => useHistory(INITIAL));
    const next = [{ id: '1', text: 'Uppdaterad' }];
    act(() => result.current.push(next));
    expect(result.current.current).toEqual(next);
    expect(result.current.canUndo).toBe(true);
  });

  test('undo återgår ett steg', () => {
    const { result } = renderHook(() => useHistory(INITIAL));
    act(() => result.current.push([{ id: '1', text: 'Steg 2' }]));
    act(() => result.current.undo());
    expect(result.current.current).toEqual(INITIAL);
    expect(result.current.canRedo).toBe(true);
  });

  test('redo går framåt igen', () => {
    const { result } = renderHook(() => useHistory(INITIAL));
    const steg2 = [{ id: '1', text: 'Steg 2' }];
    act(() => result.current.push(steg2));
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.current).toEqual(steg2);
    expect(result.current.canRedo).toBe(false);
  });

  test('push efter undo raderar redo-framtiden', () => {
    const { result } = renderHook(() => useHistory(INITIAL));
    act(() => result.current.push([{ id: '1', text: 'Steg 2' }]));
    act(() => result.current.undo());
    act(() => result.current.push([{ id: '1', text: 'Ny gren' }]));
    expect(result.current.canRedo).toBe(false);
  });

  test('MAX_HISTORY begränsar stacken', () => {
    const { result } = renderHook(() => useHistory(INITIAL));
    // Pusha 60 steg (mer än MAX_HISTORY = 50)
    for (let i = 0; i < 60; i++) {
      act(() => result.current.push([{ id: String(i), text: `Steg ${i}` }]));
    }
    // Stacken får inte vara obegränsad — undo ska ta slut
    let steps = 0;
    while (result.current.canUndo && steps < 100) {
      act(() => result.current.undo());
      steps++;
    }
    expect(steps).toBeLessThanOrEqual(50);
  });

  test('reset tömmer historiken', () => {
    const { result } = renderHook(() => useHistory(INITIAL));
    act(() => result.current.push([{ id: '1', text: 'Steg 2' }]));
    act(() => result.current.reset(INITIAL));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.current).toEqual(INITIAL);
  });
});
