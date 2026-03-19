/**
 * A/B Testing API Test Script
 * Run with: node test-ab.js
 * Make sure the server is running on port 5000 first.
 */

const http = require('http');

const BASE = 'http://localhost:5000/api';

// ─── tiny http helper ───────────────────────────────────────
function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const url = new URL(BASE + path);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => (data += chunk));
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

function pass(msg) { console.log(`  ✅ PASS — ${msg}`); }
function fail(msg) { console.log(`  ❌ FAIL — ${msg}`); process.exitCode = 1; }
function assert(cond, msg) { cond ? pass(msg) : fail(msg); }

// ─── tests ──────────────────────────────────────────────────
async function run() {
    console.log('\n🔬  A/B Testing API Tests\n' + '─'.repeat(45));

    // ── 0. Get media IDs to use as variants ──────────────────
    console.log('\n[0] Fetching existing media for variant IDs…');
    const mediaRes = await request('GET', '/media');
    assert(mediaRes.status === 200, `GET /media → 200`);

    if (!mediaRes.body || mediaRes.body.length < 2) {
        console.log('  ⚠️  Need at least 2 media items in the system to run variant tests.');
        console.log('     Upload 2 images/videos first, then re-run this script.');
        return;
    }

    const [mediaA, mediaB] = mediaRes.body;
    console.log(`  Using: "${mediaA.filename}" (A)  vs  "${mediaB.filename}" (B)`);

    // ── 1. Validation guard — missing fields ──────────────────
    console.log('\n[1] Validation — missing required fields…');
    const badRes = await request('POST', '/ab-tests', { name: 'Incomplete' });
    assert(badRes.status === 400, `POST /ab-tests with missing fields → 400`);

    // ── 2. Validation guard — bad time range ─────────────────
    console.log('\n[2] Validation — end time before start time…');
    const badTime = await request('POST', '/ab-tests', {
        name: 'Bad Times',
        variantAMediaId: mediaA.id,
        variantBMediaId: mediaB.id,
        targetType: 'device',
        targetId: 'dummy-device',
        startTime: new Date(Date.now() + 10000).toISOString(),
        endTime: new Date(Date.now() + 1000).toISOString(),
    });
    assert(badTime.status === 400, `POST /ab-tests with end < start → 400`);

    // ── 3. Create a valid test ────────────────────────────────
    console.log('\n[3] Create A/B test…');
    const createRes = await request('POST', '/ab-tests', {
        name: 'Test Script — Automated',
        variantAMediaId: mediaA.id,
        variantBMediaId: mediaB.id,
        targetType: 'device',
        targetId: 'test-device-001',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
    assert(createRes.status === 200, `POST /ab-tests → 200`);
    assert(createRes.body.id, `Response has an id`);
    assert(createRes.body.impressionsA === 0, `impressionsA starts at 0`);
    assert(createRes.body.impressionsB === 0, `impressionsB starts at 0`);
    assert(createRes.body.status === 'active', `status is "active"`);
    const testId = createRes.body.id;

    // ── 4. List tests ─────────────────────────────────────────
    console.log('\n[4] List A/B tests…');
    const listRes = await request('GET', '/ab-tests');
    assert(listRes.status === 200, `GET /ab-tests → 200`);
    assert(Array.isArray(listRes.body), `Response is an array`);
    const found = listRes.body.find(t => t.id === testId);
    assert(!!found, `Newly created test is present in list`);
    assert(found.variantAMedia !== undefined, `variantAMedia is populated`);
    assert(found.variantBMedia !== undefined, `variantBMedia is populated`);

    // ── 5. Get single test ────────────────────────────────────
    console.log('\n[5] Get single A/B test…');
    const getRes = await request('GET', `/ab-tests/${testId}`);
    assert(getRes.status === 200, `GET /ab-tests/:id → 200`);
    assert(getRes.body.name === 'Test Script — Automated', `name matches`);

    // ── 6. Record impressions ─────────────────────────────────
    console.log('\n[6] Record impressions…');
    await request('POST', `/ab-tests/${testId}/impression`, { variant: 'A' });
    await request('POST', `/ab-tests/${testId}/impression`, { variant: 'A' });
    await request('POST', `/ab-tests/${testId}/impression`, { variant: 'B' });

    const afterImp = await request('GET', `/ab-tests/${testId}`);
    assert(afterImp.body.impressionsA === 2, `impressionsA = 2 after 2 views`);
    assert(afterImp.body.impressionsB === 1, `impressionsB = 1 after 1 view`);

    // ── 7. Invalid variant guard ──────────────────────────────
    console.log('\n[7] Invalid variant guard…');
    const badVariant = await request('POST', `/ab-tests/${testId}/impression`, { variant: 'C' });
    assert(badVariant.status === 400, `variant "C" → 400`);

    // ── 8. Not-found guard ────────────────────────────────────
    console.log('\n[8] Not-found guard…');
    const notFound = await request('GET', '/ab-tests/nonexistent-id-xyz');
    assert(notFound.status === 404, `GET /ab-tests/nonexistent → 404`);

    // ── 9. Delete ─────────────────────────────────────────────
    console.log('\n[9] Delete A/B test…');
    const delRes = await request('DELETE', `/ab-tests/${testId}`);
    assert(delRes.status === 200, `DELETE /ab-tests/:id → 200`);

    const afterDel = await request('GET', `/ab-tests/${testId}`);
    assert(afterDel.status === 404, `Deleted test returns 404`);

    // ── Summary ───────────────────────────────────────────────
    console.log('\n' + '─'.repeat(45));
    if (process.exitCode === 1) {
        console.log('❌  Some tests failed. Check output above.\n');
    } else {
        console.log('✅  All A/B tests passed!\n');
    }
}

run().catch(err => {
    console.error('\n💥 Unexpected error:', err.message);
    process.exit(1);
});
