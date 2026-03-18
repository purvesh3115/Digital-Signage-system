import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- TOKEN DIAGNOSTICS ---');
    const results = {
        tokens: [],
        share_links: [],
        devices: [],
        errors: []
    };

    try {
        const { data: tokens, error: tokensError } = await supabase.from('tokens').select('*');
        if (tokensError) results.errors.push({ table: 'tokens', error: tokensError });
        else results.tokens = tokens;

        const { data: shares, error: sharesError } = await supabase.from('share_links').select('*');
        if (sharesError) results.errors.push({ table: 'share_links', error: sharesError });
        else results.share_links = shares;

        const { data: devices, error: devicesError } = await supabase.from('devices').select('id, name');
        if (devicesError) results.errors.push({ table: 'devices', error: devicesError });
        else results.devices = devices;

    } catch (err) {
        results.errors.push({ table: 'global', error: err.message });
    }

    const outPath = path.join(__dirname, 'diag_result.json');
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
    console.log(`✅ Diagnostics written to ${outPath}`);
}

diagnose();
