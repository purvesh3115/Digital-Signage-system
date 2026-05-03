const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testFirebaseUpload() {
    try {
        console.log('🚀 Starting Local-to-Firebase Upload Test...');
        const formData = new FormData();
        const dummyPath = path.join(__dirname, 'test-file.png');
        fs.writeFileSync(dummyPath, 'This is a test image for Firebase Upload');
        
        formData.append('file', fs.createReadStream(dummyPath));

        const res = await axios.post('http://localhost:5000/api/upload', formData, {
            headers: formData.getHeaders()
        });

        console.log('✅ Upload Success!');
        console.log('🔗 File in Firebase:', res.data.filename);
        // Clean up
        fs.unlinkSync(dummyPath);
        process.exit(0);
    } catch (err) {
        console.error('❌ Upload Failed:', err.response ? err.response.data : err.message);
        process.exit(1);
    }
}

testFirebaseUpload();
