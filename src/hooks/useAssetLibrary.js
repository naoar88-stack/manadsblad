import { useEffect, useMemo, useState } from 'react';
import { db, appId, doc, setDoc, onSnapshot } from '../lib/firebase';
import { compressImageToBlob } from '../lib/imageUtils';
import { uploadToCloudinary } from '../lib/cloudinary';

export function useAssetLibrary(sync, state) {
  const [assetLibrary, setAssetLibrary] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  // Lyssna på Firestore – sparar nu bara metadata (url + publicId), INTE base64
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
    // Spara bara metadata – aldrig base64
    const safe = items.map(({ id, url, publicId, createdAt, type, name }) => ({
      id,
      url,
      ...(publicId ? { publicId } : {}),
      createdAt,
      type,
      name,
    }));
    const libraryRef = doc(db, 'artifacts', appId, 'users', sync.user.uid, 'assets', 'library');
    await setDoc(libraryRef, { items: safe }, { merge: true });
  };

  const addImage = async (file) => {
    setUploadError('');
    setIsUploading(true);
    try {
      const { blob, dataUrl } = await compressImageToBlob(file);
      const id = crypto.randomUUID();

      // Optimistisk preview med lokal DataURL
      const optimistic = {
        id,
        url: dataUrl,
        createdAt: new Date().toISOString(),
        type: 'upload',
        name: file.name,
      };
      setAssetLibrary((prev) => [optimistic, ...prev]);

      // Ladda upp till Cloudinary
      const { url, publicId } = await uploadToCloudinary(blob, file.name);

      // Ersätt preview med riktig Cloudinary-URL
      setAssetLibrary((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, url, publicId } : item
        );
        persistLibrary(next);
        return next;
      });
    } catch (err) {
      // Ta bort den optimistiska posten vid fel
      setAssetLibrary((prev) => prev.filter((item) => item.url.startsWith('data:')
        ? false : true
      ));
      setUploadError(err.message || 'Kunde inte ladda upp bilden. Försök igen.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (id) => {
    const next = assetLibrary.filter((item) => item.id !== id);
    setAssetLibrary(next);
    await persistLibrary(next);
    // Cloudinary-borttagning kräver server-side signering – bilden
    // lever kvar på Cloudinary men syns inte i appen.
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
    uploadError,
    selectedDateKey,
    setSelectedDateKey,
    selectedDay,
    addImage,
    removeImage,
    assignImageToDay,
  };
}
