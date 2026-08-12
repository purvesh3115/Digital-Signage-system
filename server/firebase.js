const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const hasFirebaseConfig = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

const serviceAccount = hasFirebaseConfig ? {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
} : null;

if (hasFirebaseConfig && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('✅ Firebase Admin Initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.stack);
  }
} else if (!hasFirebaseConfig) {
  console.warn('⚠️ Firebase credentials missing. Frontend will still load, but API routes will be unavailable until .env is configured.');
}

const db = hasFirebaseConfig && admin.apps.length ? admin.firestore() : null;
const storage = hasFirebaseConfig && admin.apps.length ? admin.storage() : null;

module.exports = { admin, db, storage, isFirebaseConfigured: hasFirebaseConfig && !!admin.apps.length };
