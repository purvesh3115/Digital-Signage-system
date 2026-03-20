const axios = require('axios');

async function testDelete() {
    try {
        console.log('Fetching media list...');
        const res = await axios.get('http://localhost:5000/api/media');
        const media = res.data;
        if (media.length === 0) {
            console.log('No media to delete.');
            return;
        }
        
        const first = media[0];
        console.log(`Deleting media ${first.id} (${first.filename})...`);
        const delRes = await axios.delete(`http://localhost:5000/api/media/${first.id}`);
        console.log('Response:', delRes.data);
    } catch (err) {
        console.error('Delete error:', err.response ? err.response.data : err.message);
    }
}

testDelete();
