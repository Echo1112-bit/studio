
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "procoach-ai",
  "appId": "1:859310459891:web:693ea00fb89b53836b2086",
  "storageBucket": "procoach-ai.firebasestorage.app",
  "apiKey": "AIzaSyD3KtMZUEGaK2c8vwFdLJ-SEabSa8AGwWs",
  "authDomain": "procoach-ai.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "859310459891"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
