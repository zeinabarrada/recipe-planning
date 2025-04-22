import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
    // Your Firebase config object will go here
    // You'll need to get this from your Firebase console
    apiKey: "AIzaSyC0paxXGMHO-gsy7phpXKka9QgKTusAyV8",
    authDomain: "recipe-planning-bde4f.firebaseapp.com",
    projectId: "recipe-planning-bde4f",
    storageBucket: "recipe-planning-bde4f.firebasestorage.app",
    messagingSenderId: "612165115126",
    appId: "1:612165115126:web:8870d805f3e2fced0fa0d7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 
