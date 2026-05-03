const { db } = require('./firebase');

async function test() {
    console.log('Testing Firestore connection...');
    try {
        const snapshot = await db.collection('devices').limit(1).get();
        console.log('✅ Firestore connection successful! Documents found:', snapshot.size);
        process.exit(0);
    } catch (error) {
        console.error('❌ Firestore connection failed:', error.message);
        process.exit(1);
    }
}

test();
