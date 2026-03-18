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
console.log('Using URL:', supabaseUrl);
console.log('Using Key:', supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('--- TESTING INSERT ---');
    try {
        const payload = {
            name: `Test Device ${Math.floor(Math.random() * 1000)}`,
            location: 'Test Lab',
            ip_address: '127.0.0.1',
            group_name: ''
        };
        console.log('Inserting payload:', payload);
        const { data, error } = await supabase.from('devices').insert([payload]).select();

        if (error) {
            console.error('INSERT ERROR:', error);
        } else {
            console.log('INSERT SUCCESS:', data);
        }
    } catch (e) {
        console.error('EXCEPTION:', e);
    }
}

testInsert();
