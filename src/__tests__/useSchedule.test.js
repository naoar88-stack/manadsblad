/**
 * useSchedule — enhetstester
 * Testar att hook:en initierar dagar korrekt och att aktiviteter kan läggas till/uppdateras/tas bort.
 */
import { renderHook, act } from '@testing-library/react';
import { useSchedule } from '../hooks/useSchedule';

const YEAR  = 2026;
const MONTH = 4; // maj (0-indexerat)

describe('useSchedule', () => {
  test('initierar rätt antal dagar för månaden', () => {
    const { result } = renderHook(() => useSchedule(YEAR, MONTH));
    // Maj 2026 har 31 dagar
    expect(result.current.days).toHaveLength(31);
  });

  test('varje dag har dateKey på formatet YYYY-MM-DD', () => {
    const { result } = renderHook(() => useSchedule(YEAR, MONTH));
    result.current.days.forEach(day => {
      expect(day.dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  test('setActivity lägger till en aktivitet på rätt dag', () => {
    const { result } = renderHook(() => useSchedule(YEAR, MONTH));
    act(() => {
      result.current.setActivity('2026-05-15', { title: 'Basketträning', ageGroup: '13–17 år' });
    });
    const day = result.current.days.find(d => d.dateKey === '2026-05-15');
    expect(day).toBeDefined();
    expect(day.activities?.length).toBeGreaterThan(0);
  });

  test('removeActivity tar bort aktiviteten', () => {
    const { result } = renderHook(() => useSchedule(YEAR, MONTH));
    let actId;
    act(() => {
      result.current.setActivity('2026-05-15', { title: 'Dans', ageGroup: '10–13 år' });
    });
    act(() => {
      const day = result.current.days.find(d => d.dateKey === '2026-05-15');
      actId = day.activities[0].id;
      result.current.removeActivity('2026-05-15', actId);
    });
    const day = result.current.days.find(d => d.dateKey === '2026-05-15');
    expect(day.activities?.find(a => a.id === actId)).toBeUndefined();
  });

  test('byter månad ger ny tom dag-lista', () => {
    const { result, rerender } = renderHook(
      ({ y, m }) => useSchedule(y, m),
      { initialProps: { y: 2026, m: 4 } }
    );
    expect(result.current.days).toHaveLength(31); // maj
    rerender({ y: 2026, m: 3 }); // april
    expect(result.current.days).toHaveLength(30);
  });
});
