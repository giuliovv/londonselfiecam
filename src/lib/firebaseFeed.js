import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export async function uploadSnap(snap, blob, user, ai = {}) {
  const snapId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const storageRef = ref(storage, `snaps/${user.uid}/${snapId}.jpg`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  const imageUrl = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(db, 'snaps'), {
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
    // AI metadata (any of these may be empty when the user skipped the AI step)
    caption: ai.caption || '',
    persona: ai.persona || '',
    voice: ai.voice || '',
    landmark: ai.landmark || '',
    trivia: ai.trivia || '',
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, imageUrl };
}

// Read-once fetch for SharedView. Returns null if the doc doesn't exist.
export async function getSnap(id) {
  const snapshot = await getDoc(doc(db, 'snaps', id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

// Patch AI metadata onto an existing snap doc (after the user runs ✨ CAPTION
// post-upload). Silent best-effort — failures are logged, not thrown.
export async function updateSnapAi(id, ai) {
  if (!id) return;
  try {
    await updateDoc(doc(db, 'snaps', id), {
      caption: ai.caption || '',
      persona: ai.persona || '',
      voice: ai.voice || '',
      landmark: ai.landmark || '',
      trivia: ai.trivia || '',
    });
  } catch (e) {
    console.warn('updateSnapAi failed:', e);
  }
}

// Replace the snap's polaroid JPEG (uploaded auto on first generate) with a
// fresh one that has the AI caption baked in, and patch metadata in one go.
// Used after ✨ CAPTION so the share view shows a polaroid that matches what
// the sender just saw.
export async function replaceSnapImage(id, blob, user, ai = {}) {
  if (!id || !blob || !user) return;
  try {
    const snapId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-ai`;
    const storageRef = ref(storage, `snaps/${user.uid}/${snapId}.jpg`);
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    const imageUrl = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'snaps', id), {
      imageUrl,
      caption: ai.caption || '',
      persona: ai.persona || '',
      voice: ai.voice || '',
      landmark: ai.landmark || '',
      trivia: ai.trivia || '',
    });
  } catch (e) {
    console.warn('replaceSnapImage failed:', e);
  }
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
