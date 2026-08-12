const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const { db, admin } = require('../firebase');

// Firestore Collections
const devicesCol = db ? db.collection('devices') : null;
const mediaCol = db ? db.collection('media') : null;
const schedulesCol = db ? db.collection('schedules') : null;
const tokensCol = db ? db.collection('tokens') : null;
const shareLinksCol = db ? db.collection('share_links') : null;
const settingsCol = db ? db.collection('settings') : null;

// Helper: convert Firestore doc to plain object with id
const docToObj = (doc) => ({ id: doc.id, ...doc.data() });

const noFirebaseStats = () => ({
    totalDevices: 0,
    onlineDevices: 0,
    activePlaylists: 0,
    storageUsed: 0,
    totalStorage: 1024,
    criticalAlerts: 0,
    health: { healthy: 0, warning: 0, critical: 0 },
    recentMedia: []
});

const noFirebaseAnalytics = () => ({
    statusDistribution: [
        { label: 'Online', value: 0, color: 'var(--status-online)' },
        { label: 'Offline', value: 0, color: 'var(--status-offline)' }
    ],
    mediaUsage: [],
    systemLoad: [
        { time: '12:00', load: 0 },
        { time: '13:00', load: 0 },
        { time: '14:00', load: 0 },
        { time: '15:00', load: 0 },
        { time: '16:00', load: 0 }
    ]
});

const localMetadataPath = path.join(__dirname, '..', 'uploads', 'media-metadata.json');

const readLocalMediaMetadata = () => {
    try {
        if (!fs.existsSync(localMetadataPath)) return [];
        const raw = fs.readFileSync(localMetadataPath, 'utf8');
        return JSON.parse(raw) || [];
    } catch (err) {
        console.error('Failed to read local media metadata:', err.message);
        return [];
    }
};

const writeLocalMediaMetadata = (items) => {
    try {
        fs.writeFileSync(localMetadataPath, JSON.stringify(items, null, 2));
    } catch (err) {
        console.error('Failed to write local media metadata:', err.message);
    }
};

// Configure Multer for Local Storage (Disk Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + path.extname(file.originalname);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// ============================================================
// --- Device Management ---
// ============================================================

// Add Device
router.post('/devices', async (req, res) => {
    try {
        if (!db || !devicesCol) {
            const obj = {
                id: `local-device-${Date.now()}`,
                name: req.body.name || 'Local Device',
                location: req.body.location || '',
                ip_address: req.body.ip_address || '',
                groupName: req.body.groupName || req.body.group_name || '',
                group_name: req.body.groupName || req.body.group_name || '',
                status: 'offline',
                lastPing: null,
                createdAt: new Date().toISOString(),
                last_ping: null
            };
            return res.json(obj);
        }

        const data = {
            name: req.body.name,
            location: req.body.location,
            ip_address: req.body.ip_address || '',
            // Accept both group_name (from client form) and groupName
            groupName: req.body.groupName || req.body.group_name || '',
            status: 'offline',
            lastPing: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const ref = await devicesCol.add(data);
        const saved = await ref.get();
        const obj = docToObj(saved);
        // Always expose group_name for client compatibility
        obj.group_name = obj.groupName;
        res.json(obj);
    } catch (err) {
        console.error('❌ Add device error:', err.message, err.code || '');
        res.status(500).json({ error: err.message });
    }
});


// List Devices
router.get('/devices', async (req, res) => {
    try {
        if (!db || !devicesCol) {
            return res.json([]);
        }

        const snapshot = await devicesCol.get();
        // Normalize: expose group_name for client and last_ping for heartbeat display
        const devices = snapshot.docs.map(doc => {
            const obj = docToObj(doc);
            obj.group_name = obj.groupName || '';
            obj.last_ping = obj.lastPing?.toDate ? obj.lastPing.toDate().toISOString() : null;
            return obj;
        });
        res.json(devices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Device
router.delete('/devices/:id', async (req, res) => {
    try {
        if (!db || !devicesCol) {
            return res.json({ message: 'Device deleted' });
        }
        await devicesCol.doc(req.params.id).delete();
        res.json({ message: 'Device deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Batch Update Device Groups
router.put('/devices/batch-group', async (req, res) => {
    try {
        if (!db || !devicesCol) {
            return res.json({ message: 'Devices updated' });
        }
        const { deviceIds, groupName } = req.body;
        const batch = db.batch();
        deviceIds.forEach(id => {
            batch.update(devicesCol.doc(id), { groupName });
        });
        await batch.commit();
        res.json({ message: 'Devices updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Device Status (Heartbeat)
router.put('/devices/:id/status', async (req, res) => {
    try {
        if (!db || !devicesCol) {
            return res.json({ id: req.params.id, status: 'online', lastPing: new Date().toISOString() });
        }
        const ref = devicesCol.doc(req.params.id);
        await ref.update({
            status: 'online',
            lastPing: admin.firestore.FieldValue.serverTimestamp()
        });
        const updated = await ref.get();
        res.json(docToObj(updated));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manual Status Toggle
router.put('/devices/:id/status-manual', async (req, res) => {
    try {
        if (!db || !devicesCol) {
            return res.json({ id: req.params.id, status: req.body.status || 'offline', lastPing: new Date().toISOString() });
        }
        const { status } = req.body;
        const ref = devicesCol.doc(req.params.id);
        await ref.update({ status });
        const updated = await ref.get();
        res.json(docToObj(updated));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// --- Media Upload System ---
// ============================================================

// Serving Media via Proxy (Local Storage Only)
router.get('/uploads/:filename', async (req, res) => {
    try {
        const localFile = path.resolve(__dirname, '..', 'uploads', req.params.filename);
        
        if (!fs.existsSync(localFile)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Serve from local storage
        res.sendFile(localFile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Media (saves to local storage, stores metadata in Firestore if available)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const filename = req.file.filename;
        console.log(`✅ Saved file locally via DiskStorage: ${filename}`);

        const data = {
            filename,
            originalname: req.file.originalname,
            type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
            size: req.file.size,
            uploadDate: db ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
            isCloud: false
        };

        if (db && mediaCol) {
            const docRef = await mediaCol.add(data);
            const saved = await docRef.get();
            return res.status(201).json(docToObj(saved));
        }

        const items = readLocalMediaMetadata();
        const savedItem = {
            id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            ...data,
            uploadDate: { seconds: Math.floor(Date.now() / 1000) }
        };
        items.unshift(savedItem);
        writeLocalMediaMetadata(items);
        return res.status(201).json(savedItem);

    } catch (err) {
        console.error('❌ Upload error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// List Media
router.get('/media', async (req, res) => {
    try {
        if (!db || !mediaCol) {
            const media = readLocalMediaMetadata()
                .sort((a, b) => (b.uploadDate?.seconds || 0) - (a.uploadDate?.seconds || 0));
            return res.json(media);
        }

        const snapshot = await mediaCol.get();
        const media = snapshot.docs.map(docToObj)
            .sort((a, b) => (b.uploadDate?.seconds || 0) - (a.uploadDate?.seconds || 0));
        return res.json(media);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Media
router.delete('/media/:id', async (req, res) => {
    try {
        if (!db || !mediaCol) {
            const items = readLocalMediaMetadata().filter(item => item.id !== req.params.id);
            writeLocalMediaMetadata(items);
            const filePath = path.join(__dirname, '..', 'uploads', req.params.id.replace(/^local-[0-9]+-[a-z0-9]+-/, '') || '');
            if (req.params.id && filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return res.json({ message: 'Media deleted' });
        }

        const doc = await mediaCol.doc(req.params.id).get();
        if (doc.exists) {
            const filePath = path.join(__dirname, '..', 'uploads', doc.data().filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        await mediaCol.doc(req.params.id).delete();
        res.json({ message: 'Media deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// --- Schedules ---
// ============================================================

// Create Schedule (with conflict detection)
router.post('/schedules', async (req, res) => {
    try {
        if (!db || !schedulesCol) {
            const schedule = {
                id: `local-schedule-${Date.now()}`,
                ...req.body,
                active: true,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                createdAt: new Date().toISOString()
            };
            return res.json(schedule);
        }

        const { targetId, startTime, endTime } = req.body;

        // Conflict Detection
        const existing = await schedulesCol.where('targetId', '==', targetId).get();
        const st = new Date(startTime);
        const et = new Date(endTime);
        let conflict = false;
        existing.docs.forEach(doc => {
            const d = doc.data();
            const dStart = d.startTime?.toDate ? d.startTime.toDate() : new Date(d.startTime);
            const dEnd = d.endTime?.toDate ? d.endTime.toDate() : new Date(d.endTime);
            if (st < dEnd && et > dStart) conflict = true;
        });

        if (conflict) {
            return res.status(409).json({ error: 'Device is already booked for this time range.' });
        }

        const data = {
            ...req.body,
            startTime: admin.firestore.Timestamp.fromDate(st),
            endTime: admin.firestore.Timestamp.fromDate(et),
            active: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const ref = await schedulesCol.add(data);
        const saved = await ref.get();
        res.json(docToObj(saved));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Schedules (with populated media)
router.get('/schedules', async (req, res) => {
    try {
        if (!db || !schedulesCol || !mediaCol) {
            return res.json([]);
        }

        const snapshot = await schedulesCol.get();
        const schedules = await Promise.all(snapshot.docs.map(async doc => {
            const data = docToObj(doc);
            if (data.mediaId) {
                const mediaDoc = await mediaCol.doc(data.mediaId).get();
                data.mediaId = mediaDoc.exists ? docToObj(mediaDoc) : null;
            }
            return data;
        }));
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Schedule
router.delete('/schedules/:id', async (req, res) => {
    try {
        if (!db || !schedulesCol) {
            return res.json({ message: 'Schedule deleted' });
        }
        await schedulesCol.doc(req.params.id).delete();
        res.json({ message: 'Schedule deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// --- Playback Token Generation ---
// ============================================================

// Generate Token for Registered Devices
router.post('/generate-link', async (req, res) => {
    try {
        if (!db || !devicesCol || !schedulesCol || !tokensCol) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const tokenString = crypto.randomBytes(16).toString('hex');
            return res.json({ link: `${frontendUrl}/play?token=${tokenString}` });
        }

        const { deviceId, scheduleId } = req.body;

        const deviceDoc = await devicesCol.doc(deviceId).get();
        if (!deviceDoc.exists) return res.status(404).json({ error: 'Device not found' });

        const scheduleDoc = await schedulesCol.doc(scheduleId).get();
        if (!scheduleDoc.exists) return res.status(404).json({ error: 'Schedule not found' });

        const scheduleData = scheduleDoc.data();
        const tokenString = crypto.randomBytes(16).toString('hex');

        await tokensCol.add({
            token: tokenString,
            deviceId: deviceId,
            expiresAt: scheduleData.endTime,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Generate frontend URL (default to localhost:5173 for development)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.json({ link: `${frontendUrl}/play?token=${tokenString}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Validate Token & Get Content for Playback
router.get('/play', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token required' });

        if (!db || !tokensCol || !devicesCol || !schedulesCol || !mediaCol) {
            return res.json({
                message: 'No content scheduled',
                device: { id: 'demo-device', name: 'Demo Device' }
            });
        }

        const tokenSnap = await tokensCol.where('token', '==', token).limit(1).get();
        if (tokenSnap.empty) return res.status(403).json({ error: 'Invalid token' });

        const tokenDoc = tokenSnap.docs[0];
        const tokenData = tokenDoc.data();
        const expiresAt = tokenData.expiresAt?.toDate ? tokenData.expiresAt.toDate() : new Date(tokenData.expiresAt);
        if (new Date() > expiresAt) return res.status(403).json({ error: 'Token expired' });

        const deviceDoc = await devicesCol.doc(tokenData.deviceId).get();
        if (!deviceDoc.exists) return res.status(404).json({ error: 'Device not found' });

        const device = docToObj(deviceDoc);
        const now = new Date();
        const schedulesSnap = await schedulesCol
            .where('active', '==', true)
            .get();

        const activeSchedule = schedulesSnap.docs.map(d => ({ id: d.id, ...d.data() })).find(s => {
            const st = s.startTime?.toDate ? s.startTime.toDate() : new Date(s.startTime);
            const et = s.endTime?.toDate ? s.endTime.toDate() : new Date(s.endTime);
            const matchesDevice = (s.targetType === 'device' && s.targetId === device.id) ||
                                  (s.targetType === 'group' && s.targetId === device.groupName);
            return now >= st && now <= et && matchesDevice;
        });

        if (!activeSchedule) return res.json({ message: 'No content scheduled', device });

        const mediaDoc = await mediaCol.doc(activeSchedule.mediaId).get();
        const media = mediaDoc.exists ? docToObj(mediaDoc) : null;

        // Update device status async
        devicesCol.doc(tokenData.deviceId).update({ status: 'online', lastPing: admin.firestore.FieldValue.serverTimestamp() });

        res.json({ media, scheduleId: activeSchedule.id, device });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// --- Share Links (Media Library) ---
// ============================================================

// Generate Public Share Link
router.post('/generate-share-link', async (req, res) => {
    try {
        if (!db || !shareLinksCol) {
            const tokenString = crypto.randomBytes(16).toString('hex');
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.json({ link: `${frontendUrl}/share/${tokenString}`, limit: req.body.maxDevices || 1 });
        }

        const { mediaId, maxDevices } = req.body;
        const tokenString = crypto.randomBytes(16).toString('hex');

        await shareLinksCol.add({
            token: tokenString,
            mediaId: mediaId,
            maxStatus: maxDevices,
            currentUses: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Use frontend URL (default to localhost:5173 for development)
        // Generate frontend URL (default to localhost:5173 for development)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.json({ link: `${frontendUrl}/share/${tokenString}`, limit: maxDevices });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Validate Share Token & Check Limit
router.get('/share/validate/:token', async (req, res) => {
    try {
        if (!db || !shareLinksCol || !mediaCol) {
            return res.json({ media: null, message: 'Share link unavailable in demo mode' });
        }

        const { token } = req.params;
        const snap = await shareLinksCol.where('token', '==', token).limit(1).get();

        if (snap.empty) return res.status(404).json({ error: 'Invalid Link' });

        const shareDoc = snap.docs[0];
        const shareData = shareDoc.data();

        if (shareData.currentUses >= shareData.maxStatus) {
            return res.status(403).json({ error: 'Connection Limit Reached for this Link' });
        }

        // Increment use count
        await shareDoc.ref.update({ currentUses: admin.firestore.FieldValue.increment(1) });

        const mediaDoc = await mediaCol.doc(shareData.mediaId).get();
        const media = mediaDoc.exists ? docToObj(mediaDoc) : null;

        res.json({ media });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Alternative endpoint - direct share/:token access for flexibility
router.get('/share/:token', async (req, res) => {
    try {
        if (!db || !shareLinksCol || !mediaCol) {
            return res.json({ media: null, message: 'Share link unavailable in demo mode' });
        }

        const { token } = req.params;
        const snap = await shareLinksCol.where('token', '==', token).limit(1).get();

        if (snap.empty) return res.status(404).json({ error: 'Invalid Link' });

        const shareDoc = snap.docs[0];
        const shareData = shareDoc.data();

        if (shareData.currentUses >= shareData.maxStatus) {
            return res.status(403).json({ error: 'Connection Limit Reached for this Link' });
        }

        // Increment use count
        await shareDoc.ref.update({ currentUses: admin.firestore.FieldValue.increment(1) });

        const mediaDoc = await mediaCol.doc(shareData.mediaId).get();
        const media = mediaDoc.exists ? docToObj(mediaDoc) : null;

        res.json({ media });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// --- Dashboard Statistics ---
// ============================================================

router.get('/stats', async (req, res) => {
    console.log('GET /api/stats hit');
    try {
        if (!db) {
            return res.json(noFirebaseStats());
        }

        const [devSnap, mediaSnap, schedSnap] = await Promise.all([
            devicesCol.get(),
            mediaCol.get(),
            schedulesCol.get()
        ]);

        const devices = devSnap.docs.map(docToObj);
        const totalDevices = devices.length;
        const onlineDevices = devices.filter(d => d.status === 'online').length;

        const allMedia = mediaSnap.docs.map(docToObj);
        const totalMedia = allMedia.length;
        // Sort in-memory (no Firestore index needed)
        const recentMedia = allMedia
            .sort((a, b) => (b.uploadDate?.seconds || 0) - (a.uploadDate?.seconds || 0))
            .slice(0, 5);

        const activeSchedules = schedSnap.docs.filter(d => d.data().active === true).length;

        const health = {
            healthy: onlineDevices,
            warning: 0,
            critical: totalDevices - onlineDevices
        };

        res.json({
            totalDevices,
            onlineDevices,
            activePlaylists: activeSchedules,
            storageUsed: totalMedia * 5.2,
            totalStorage: 1024,
            criticalAlerts: health.critical,
            health,
            recentMedia
        });
    } catch (err) {
        console.error('Stats error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// --- Analytics ---
// ============================================================

router.get('/analytics', async (req, res) => {
    try {
        if (!db) {
            return res.json(noFirebaseAnalytics());
        }

        const devSnap = await devicesCol.get();
        const devices = devSnap.docs.map(docToObj);
        const totalDevices = devices.length;
        const onlineDevices = devices.filter(d => d.status === 'online').length;

        const statusDistribution = [
            { label: 'Online', value: onlineDevices, color: 'var(--status-online)' },
            { label: 'Offline', value: totalDevices - onlineDevices, color: 'var(--status-offline)' }
        ];

        // Sort in-memory (no Firestore index needed)
        const shareSnap = await shareLinksCol.get();
        const sortedShares = shareSnap.docs
            .map(doc => ({ ref: doc.ref, ...doc.data() }))
            .sort((a, b) => (b.currentUses || 0) - (a.currentUses || 0))
            .slice(0, 5);

        const mediaUsage = await Promise.all(sortedShares.map(async s => {
            const mediaDoc = await mediaCol.doc(s.mediaId).get();
            return {
                name: mediaDoc.exists ? mediaDoc.data().filename : 'Unknown',
                views: s.currentUses
            };
        }));

        const systemLoad = [
            { time: '12:00', load: 45 },
            { time: '13:00', load: 52 },
            { time: '14:00', load: 48 },
            { time: '15:00', load: 60 },
            { time: '16:00', load: 55 }
        ];

        res.json({ statusDistribution, mediaUsage, systemLoad });
    } catch (err) {
        console.error('Analytics error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// --- Settings ---
// ============================================================

router.get('/settings', async (req, res) => {
    try {
        if (!db || !settingsCol) {
            return res.json({ id: 'local-settings', config: {} });
        }

        const snap = await settingsCol.limit(1).get();
        if (snap.empty) {
            const ref = await settingsCol.add({ config: {}, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
            const doc = await ref.get();
            return res.json(docToObj(doc));
        }
        res.json(docToObj(snap.docs[0]));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/settings', async (req, res) => {
    try {
        if (!db || !settingsCol) {
            return res.json({ id: 'local-settings', config: req.body });
        }

        const snap = await settingsCol.limit(1).get();
        let ref;
        if (snap.empty) {
            ref = await settingsCol.add({ config: req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        } else {
            ref = snap.docs[0].ref;
            await ref.update({ config: req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        }
        const doc = await ref.get();
        res.json(docToObj(doc));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
