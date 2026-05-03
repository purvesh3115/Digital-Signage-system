const { admin } = require('./firebase');

async function debugStorage() {
  try {
    console.log('--- Firebase Storage Debug ---');
    console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('Bucket in .env:', process.env.FIREBASE_STORAGE_BUCKET);
    
    const [buckets] = await admin.storage().bucket().storage.getBuckets();
    console.log('Total buckets found:', buckets.length);
    
    if (buckets.length > 0) {
      console.log('Available buckets:');
      buckets.forEach(b => console.log(' - ', b.name));
    } else {
      console.log('❌ No buckets found for this service account.');
    }

  } catch (err) {
    console.error('❌ Error testing bucket:', err.message);
  }
}

debugStorage();
