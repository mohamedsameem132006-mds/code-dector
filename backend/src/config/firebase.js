const admin = require('firebase-admin');
const config = require('../config/env');
const fs = require('fs');

let initialized = false;

function initFirebase() {
  if (initialized) return;

  if (config.firebase.serviceAccountPath && fs.existsSync(config.firebase.serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(config.firebase.serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.firebase.projectId
      });
      initialized = true;
      console.log('[FIREBASE ADMIN] Initialized with Service Account');
    } catch (e) {
      console.warn('[FIREBASE ADMIN] Service account init failed, using default app credentials:', e.message);
    }
  } else {
    try {
      admin.initializeApp({
        projectId: config.firebase.projectId
      });
      initialized = true;
      console.log('[FIREBASE ADMIN] Initialized with Project ID:', config.firebase.projectId);
    } catch (e) {
      console.warn('[FIREBASE ADMIN] App initialization fallback:', e.message);
    }
  }
}

initFirebase();

module.exports = admin;
