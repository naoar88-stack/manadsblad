import { useEffect, useMemo, useState } from 'react';
import { db, appId, doc, setDoc, onSnapshot } from '../lib/firebase';
import { compressImage } from '../lib/imageUtils';

export function useAssetLibrary(sync, state) {
  const [assetLibrary, setAssetLibrary] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  useEffect(() => {
    if (!db || !sync.user) return undefined;

    const libraryRef = doc(db, 'artifacts', appId, 'users', sync.user.uid, 'assets', 'library');
    const unsubscribe = onSnapshot(libraryRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      if (Array.isArray(data.items)) setAssetLibrary(data.items);
    });

    return () => unsubscribe();
  }, [sync.user]);

  const persistLibrary = async (items) => {
    if (!db || !sync.user) {
      setAssetLibrary(items);
      return;
    }

    const libraryRef = doc(db, 'artifacts', appId, 'users', sync.user.uid, 'assets', 'library');
    await setDoc(libraryRef, { items }, { merge: true });
  };

  const addImage = async (file) => {
    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      const item = {
        id: crypto.randomUUID(),
        url: compressed,
        createdAt: new Date().toISOString(),
        type: 'upload',
        name: file.name,
      };
      const next = [item, ...assetLibrary].slice(0, 40);
      setAssetLibrary(next);
      await persistLibrary(next);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (id) => {
    const next = assetLibrary.filter((item) => item.id !== id);
    setAssetLibrary(next);
    await persistLibrary(next);
  };

  const assignImageToDay = (dateKey, imageUrl) => {
    state.updateActivity(dateKey, {
      image: imageUrl,
      imageFit: 'cover',
    });
    setSelectedDateKey(null);
  };

  const selectedDay = useMemo(
    () => state.days.find((day) => day.dateKey === selectedDateKey) || null,
    [state.days, selectedDateKey]
  );

  return {
    assetLibrary,
    isUploading,
    selectedDateKey,
    setSelectedDateKey,
    selectedDay,
    addImage,
    removeImage,
    assignImageToDay,
  };
}
