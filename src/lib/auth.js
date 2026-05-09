import {
  signInAnonymously,
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';

export function initAuth(onUser) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onUser(user);
    } else {
      signInAnonymously(auth).catch(console.error);
    }
  });
}

export async function upgradeToGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await linkWithPopup(auth.currentUser, provider);
    return result.user;
  } catch (err) {
    // Already linked to a Google account — sign in directly
    if (err.code === 'auth/credential-already-in-use') {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    }
    throw err;
  }
}

export function getDisplayName(user) {
  if (!user) return null;
  if (user.displayName) return user.displayName;
  return `ANON_${user.uid.slice(0, 4).toUpperCase()}`;
}
