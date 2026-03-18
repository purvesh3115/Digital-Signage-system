import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
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

async function run() {
    const tokens = await supabase.from('tokens').select('*');
    const schedules = await supabase.from('schedules').select('*');
    const devices = await supabase.from('devices').select('*');

    fs.writeFileSync(path.join(__dirname, 'db-output.json'), JSON.stringify({
        tokens: tokens.data,
        schedules: schedules.data,
        devices: devices.data
    }, null, 2), 'utf8');

    console.log('Done!');
    process.exit(0);
}

run();
