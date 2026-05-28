import { useState } from 'react';
import { generateActivityImage, improveActivityText } from '../lib/aiUtils';

export function useAiActions(state) {
  const [improvingMap,  setImprovingMap]  = useState({});
  const [generatingMap, setGeneratingMap] = useState({});
  const [lastError,     setLastError]     = useState('');

  const improveTextForDay = async (day) => {
    setImprovingMap((prev) => ({ ...prev, [day.dateKey]: true }));
    setLastError('');
    try {
      const improved = await improveActivityText(day.text || '');
      state.updateActivity(day.dateKey, { text: improved });
    } catch (error) {
      console.error(error);
      setLastError('Text-AI kunde inte köras. Kontrollera modell, nyckel eller kvot.');
    } finally {
      setImprovingMap((prev) => ({ ...prev, [day.dateKey]: false }));
    }
  };

  /**
   * Bug 15-fix: sparade tidigare Pollinations-URL direkt → broken image.
   * Nu anropas generateActivityImage som POSTar till /api/generate-image
   * (server-side Pollinations → Cloudinary) och returnerar en stabil Cloudinary-URL.
   */
  const generateImageForDay = async (day) => {
    setGeneratingMap((prev) => ({ ...prev, [day.dateKey]: true }));
    setLastError('');
    try {
      const imageResult = await generateActivityImage(day.text || day.weekdayLabel || day.dateKey);
      if (imageResult?.url) {
        state.updateActivity(day.dateKey, { image: imageResult.url });
      }
    } catch (error) {
      console.error(error);
      setLastError('Bild-AI kunde inte köras. Kontrollera att CLOUDINARY_* och bildgeneratorn är konfigurerade.');
    } finally {
      setGeneratingMap((prev) => ({ ...prev, [day.dateKey]: false }));
    }
  };

  return {
    improvingMap,
    generatingMap,
    lastError,
    improveTextForDay,
    generateImageForDay,
  };
}
