import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCLh6Dof8lBBHRFIQelifa0bYNtFQvgX8U',
  authDomain: 'londonselfiecam.firebaseapp.com',
  projectId: 'londonselfiecam',
  storageBucket: 'londonselfiecam.firebasestorage.app',
  messagingSenderId: '505783173045',
  appId: '1:505783173045:web:e14a9b16bc8bd29374a3fc',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
