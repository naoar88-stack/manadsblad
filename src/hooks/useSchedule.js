import { useState } from 'react';

export function useSchedule() {
  const [schedule, setSchedule] = useState({});
  const [templates, setTemplates] = useState([
    { id: 't1', title: 'Pysselkväll', color: 'bg-pink-100 text-pink-700', icon: '🎨' },
    { id: 't2', title: 'Spelturnering', color: 'bg-blue-100 text-blue-700', icon: '🎮' },
    { id: 't3', title: 'Tjejkväll', color: 'bg-purple-100 text-purple-700', icon: '✨' },
    { id: 't4', title: 'Öppen Musikstudio', color: 'bg-green-100 text-green-700', icon: '🎧' },
    { id: 't5', title: 'Filmvisning', color: 'bg-yellow-100 text-yellow-700', icon: '🍿' },
  ]);

  const addActivityToDay = (day, activity) => {
    setSchedule(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { ...activity, uniqueId: crypto.randomUUID() }]
    }));
  };

  const removeActivityFromDay = (day, uniqueId) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter(a => a.uniqueId !== uniqueId)
    }));
  };

  const addTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: crypto.randomUUID(),
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  return { schedule, templates, addActivityToDay, removeActivityFromDay, addTemplate };
}
