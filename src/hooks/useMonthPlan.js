import { useMemo, useState } from 'react';
import { getDaysForMonth } from '../lib/dateUtils';

export function useMonthPlan() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [activeWeekdays, setActiveWeekdays] = useState([3, 4, 5]);
  const [headerTitle, setHeaderTitle] = useState('Gårdens namn');
  const [footerText, setFooterText] = useState('Följ oss på Instagram');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [selectedFormat, setSelectedFormat] = useState('a4-landscape');
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyAY-6W4eHZPRqBlinIuivVJMVUkHyULHxo');
  const [activities, setActivities] = useState({});

  const days = useMemo(
    () => getDaysForMonth(selectedYear, selectedMonth, activeWeekdays).map((day) => ({
      ...day,
      text: activities[day.dateKey]?.text || '',
      ageGroup: activities[day.dateKey]?.ageGroup || 'Ingen',
      image: activities[day.dateKey]?.image || null,
    })),
    [selectedYear, selectedMonth, activeWeekdays, activities]
  );

  const updateActivity = (dateKey, patch) => {
    setActivities((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        ...patch,
      },
    }));
  };

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    activeWeekdays,
    setActiveWeekdays,
    headerTitle,
    setHeaderTitle,
    footerText,
    setFooterText,
    selectedTemplate,
    setSelectedTemplate,
    selectedFormat,
    setSelectedFormat,
    geminiApiKey,
    setGeminiApiKey,
    activities,
    setActivities,
    updateActivity,
    days,
  };
}
