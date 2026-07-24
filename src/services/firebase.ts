import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query,
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  push,
  remove,
  child,
  Database,
} from 'firebase/database';
import rawFirebaseConfig from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const rtdbUrl = metaEnv.VITE_FIREBASE_DATABASE_URL || (rawFirebaseConfig as any).databaseURL || 'https://tiffin-split-default-rtdb.asia-southeast1.firebasedatabase.app/';

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || rawFirebaseConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || rawFirebaseConfig.authDomain,
  databaseURL: rtdbUrl,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || rawFirebaseConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || rawFirebaseConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || rawFirebaseConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || rawFirebaseConfig.appId,
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || rawFirebaseConfig.measurementId,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let rtdb: Database;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  const dbId = (rawFirebaseConfig as any).firestoreDatabaseId || '(default)';
  db = getFirestore(app, dbId);
  rtdb = getDatabase(app, rtdbUrl);
} catch (error) {
  console.error("Failed to initialize Firebase app:", error);
}

export async function sendFirebaseInviteEmail(email: string, name?: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: 'Email address is required' };
  }

  let accountCreated = false;
  let tempApp: FirebaseApp | null = null;

  // 1. Attempt to create the user in Firebase Auth if they don't already exist
  try {
    const tempAppName = `invite-${Date.now()}`;
    tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    const tempPass = Math.random().toString(36).slice(-8) + 'A1!' + Math.random().toString(36).slice(-4);
    const userCred = await createUserWithEmailAndPassword(tempAuth, cleanEmail, tempPass);

    if (name && userCred.user) {
      await updateProfile(userCred.user, { displayName: name });
    }

    await tempAuth.signOut();
    await deleteApp(tempApp);
    tempApp = null;
    accountCreated = true;
  } catch (createErr: any) {
    if (tempApp) {
      try { await deleteApp(tempApp); } catch (_) {}
    }
    console.log('Firebase Auth user creation info:', createErr?.code || createErr);
    if (createErr?.code === 'auth/email-already-in-use') {
      accountCreated = true;
    } else if (createErr?.code === 'auth/operation-not-allowed') {
      return {
        success: false,
        message: 'Email/Password authentication is disabled in Firebase Console. Please enable it in Auth > Sign-in method.',
      };
    }
  }

  // 2. Send password setup email to the user
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return {
      success: true,
      message: accountCreated
        ? `Account created in Firebase Auth & password invite sent to ${cleanEmail}! (Check inbox/spam)`
        : `Firebase password setup link sent to ${cleanEmail}! (Check inbox/spam)`,
    };
  } catch (resetErr: any) {
    console.log('Firebase Auth password reset info:', resetErr?.code || resetErr);
    if (accountCreated) {
      return {
        success: true,
        message: `Account created for ${cleanEmail} in Firebase! Share the app URL so they can log in or reset password.`,
      };
    }
    return {
      success: false,
      message: resetErr?.message || 'Failed to send Firebase invite email.',
    };
  }
}

export {
  app,
  auth,
  db,
  rtdb,
  ref,
  set,
  get,
  onValue,
  push,
  remove,
  child,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
};
export type { FirebaseUser };


