const { admin, db } = require('./firebase');

async function listMedia() {
    try {
        const snapshot = await db.collection('media').get();
        console.log(`Found ${snapshot.docs.length} media records.`);
        snapshot.docs.forEach(doc => {
            console.log(`ID: ${doc.id}, data:`, doc.data());
        });
        process.exit(0);
    } catch (err) {
        console.error('Error fetching media:', err);
        process.exit(1);
    }
}

listMedia();
