export const getMonthName = (month) => ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'][month];

export const getDaysForMonth = (year, month, activeWeekdays) => {
  const last = new Date(year, month + 1, 0);
  const items = [];
  for (let day = 1; day <= last.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const jsDay = date.getDay();
    const weekday = jsDay === 0 ? 7 : jsDay;
    if (!activeWeekdays.includes(weekday)) continue;
    items.push({
      dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      dayNum: day,
      weekday,
      weekdayLabel: ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'][weekday - 1],
    });
  }
  return items;
};
