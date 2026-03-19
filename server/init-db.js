/**
 * init-db.js
 * Run once to initialize Firestore collections for the Digital Signage System.
 * Usage: node init-db.js
 */

require('dotenv').config();
const { db, admin } = require('./firebase');

async function initDB() {
    console.log('\n🚀 Initializing Firestore Database...\n');

    try {
        // ── 1. Test basic connectivity ──────────────────────────────────────
        console.log('📡 Testing Firebase connection...');
        await db.collection('_ping').doc('test').set({ ok: true, ts: admin.firestore.FieldValue.serverTimestamp() });
        await db.collection('_ping').doc('test').delete();
        console.log('✅ Firebase connection OK\n');

        // ── 2. Create collections with seed documents ───────────────────────
        const collections = [
            {
                name: 'devices',
                seed: {
                    name: 'Sample Screen 01',
                    location: 'Main Entrance',
                    ip_address: '192.168.1.10',
                    groupName: 'lobby',
                    status: 'offline',
                    lastPing: admin.firestore.FieldValue.serverTimestamp(),
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                }
            },
            {
                name: 'media',
                seed: null   // skip seeding - will be populated by uploads
            },
            {
                name: 'schedules',
                seed: null
            },
            {
                name: 'tokens',
                seed: null
            },
            {
                name: 'share_links',
                seed: null
            },
            {
                name: 'settings',
                seed: {
                    config: {
                        systemName: 'Digital Signage System',
                        defaultPlaybackDuration: 30,
                        timezone: 'Asia/Kolkata'
                    },
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }
            },
            {
                name: 'ab_tests',
                seed: null
            }
        ];

        for (const col of collections) {
            if (col.seed) {
                // Check if already has docs
                const snap = await db.collection(col.name).limit(1).get();
                if (snap.empty) {
                    await db.collection(col.name).add(col.seed);
                    console.log(`✅ Created collection: '${col.name}' with seed document`);
                } else {
                    console.log(`⏭️  Collection '${col.name}' already has data — skipped`);
                }
            } else {
                // Just verify connectivity for empty collections
                await db.collection(col.name).limit(1).get();
                console.log(`✅ Collection '${col.name}' is accessible`);
            }
        }

        console.log('\n🎉 Database initialization complete!');
        console.log('   You can now start the server: npm run server\n');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ Initialization FAILED:', err.message);
        console.error('\n📋 Error details:', err.code || err);
        console.error('\n💡 Common fixes:');
        console.error('   1. Go to https://console.firebase.google.com/project/digital-signage-system-262fe/firestore');
        console.error('   2. Click "Create database" → choose "Native mode" → select a region → Done');
        console.error('   3. Then run this script again.\n');
        process.exit(1);
    }
}

initDB();
