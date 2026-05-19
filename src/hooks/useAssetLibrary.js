import { useEffect, useMemo, useState } from 'react';
import { db, storage, appId, doc, setDoc, onSnapshot, ref, uploadBytes, getDownloadURL, deleteObject } from '../lib/firebase';
import { compressImageToBlob } from '../lib/imageUtils';

/**
 * Varje item i biblioteket:
 * { id, url, storagePath?, createdAt, type, name }
 *
 * storagePath sätts om bilden lagras i Firebase Storage.
 * Saknas storagePath är det ett äldre base64-item – behandlas som förut.
 */
export function useAssetLibrary(sync, state) {
  const [assetLibrary, setAssetLibrary] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  // Lyssna på Firestore-metadata (bara URL + id, INTE base64)
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

  // Spara uppdaterad lista till Firestore (ingen base64 här)
  const persistLibrary = async (items) => {
    if (!db || !sync.user) {
      setAssetLibrary(items);
      return;
    }
    // Rensa bort base64-data innan vi sparar – lagra bara metadata
    const safe = items.map(({ id, url, storagePath, createdAt, type, name }) => ({
      id,
      // Gamla base64-items: behåll URL:en tills de ersätts
      url: storagePath ? url : url,
      ...(storagePath ? { storagePath } : {}),
      createdAt,
      type,
      name,
    }));
    const libraryRef = doc(db, 'artifacts', appId, 'users', sync.user.uid, 'assets', 'library');
    await setDoc(libraryRef, { items: safe }, { merge: true });
  };

  const addImage = async (file) => {
    setIsUploading(true);
    try {
      const { blob, dataUrl } = await compressImageToBlob(file);
      const id = crypto.randomUUID();

      // Optimistisk uppdatering med lokal DataURL som preview
      const optimistic = {
        id,
        url: dataUrl,
        createdAt: new Date().toISOString(),
        type: 'upload',
        name: file.name,
      };
      setAssetLibrary((prev) => [optimistic, ...prev].slice(0, 40));

      if (storage && sync.user) {
        // Ladda upp till Firebase Storage
        const storagePath = `artifacts/${appId}/users/${sync.user.uid}/assets/${id}.jpg`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
        const downloadUrl = await getDownloadURL(storageRef);

        // Ersätt optimistisk DataURL med riktig Storage-URL
        const finalItem = { ...optimistic, url: downloadUrl, storagePath };
        setAssetLibrary((prev) => {
          const next = prev.map((item) => (item.id === id ? finalItem : item));
          persistLibrary(next);
          return next;
        });
      } else {
        // Lokalt läge: behåll DataURL
        setAssetLibrary((prev) => {
          persistLibrary(prev);
          return prev;
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (id) => {
    const item = assetLibrary.find((i) => i.id === id);
    const next = assetLibrary.filter((i) => i.id !== id);
    setAssetLibrary(next);
    await persistLibrary(next);

    // Ta bort filen från Storage om den finns där
    if (item?.storagePath && storage) {
      try {
        await deleteObject(ref(storage, item.storagePath));
      } catch (err) {
        console.warn('Kunde inte ta bort Storage-fil:', err);
      }
    }
  };

  const assignImageToDay = (dateKey, imageUrl) => {
    state.updateActivity(dateKey, { image: imageUrl, imageFit: 'cover' });
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
