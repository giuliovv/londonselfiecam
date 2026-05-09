import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export async function uploadSnap(snap, blob, user) {
  const snapId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const storageRef = ref(storage, `snaps/${user.uid}/${snapId}.jpg`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  const imageUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, 'snaps'), {
    uid: user.uid,
    displayName: user.displayName || null,
    isAnonymous: user.isAnonymous,
    camId: snap.cam.id,
    camName: snap.cam.displayName,
    shortId: snap.cam.shortId,
    road: snap.cam.road || snap.cam.view || 'TFL',
    filter: snap.filter || 'normal',
    time: snap.time instanceof Date ? snap.time : new Date(snap.time),
    imageUrl,
    createdAt: serverTimestamp(),
  });

  return imageUrl;
}

export function subscribeFeed(onUpdate) {
  const q = query(
    collection(db, 'snaps'),
    orderBy('createdAt', 'desc'),
    limit(30),
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    onUpdate(items);
  });
}
