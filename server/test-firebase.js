const { db } = require('./firebase');

async function testConnection() {
    try {
        console.log('Testing Firestore connection...');
        const collections = await db.listCollections();
        console.log('Successfully connected to Firestore!');
        console.log('Collections:', collections.map(c => c.id));
    } catch (err) {
        console.error('❌ Firestore connection test failed:', err.message);
        if (err.message.includes('NOT_FOUND')) {
            console.log('Hint: This often means the "(default)" database was not found. Check if you created the database in the Firebase console.');
        }
    }
}

testConnection();
