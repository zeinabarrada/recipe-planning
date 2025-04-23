// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: 'AIzaSyB3bIsN3VGy9SB8-PxayRp1rF9GaZVP5P0',
  authDomain: 'recipe-planning-5da49.firebaseapp.com',
  projectId: 'recipe-planning-5da49',
  storageBucket: 'recipe-planning-5da49.firebasestorage.app',
  messagingSenderId: '1089005350580',
  appId: '1:1089005350580:web:0d43cf3ae601f23f85f1e1',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
