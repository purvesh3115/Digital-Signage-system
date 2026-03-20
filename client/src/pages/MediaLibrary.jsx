import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { Search, Upload, Filter, MoreVertical, Play, Image as ImageIcon, Link as LinkIcon, X, Trash2 } from 'lucide-react';

const MediaLibrary = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState('all');

    // Share Modal State
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedShareMedia, setSelectedShareMedia] = useState(null);
    const [maxDevices, setMaxDevices] = useState(1);
    const [totalDevices, setTotalDevices] = useState(0);
    const [generatedLink, setGeneratedLink] = useState('');

    useEffect(() => {
        fetchMedia();
        fetchDeviceCount();
    }, []);

    const fetchMedia = async () => {
        try {
            const response = await apiClient.get('/media');
            setMedia(response.data || []);
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };

    const fetchDeviceCount = async () => {
        try {
            const response = await apiClient.get('/stats');
            setTotalDevices(response.data.totalDevices || 0);
        } catch (err) { console.error(err); }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Do NOT set Content-Type manually — axios will automatically set
            // 'multipart/form-data' WITH the correct boundary when given FormData.
            await apiClient.post('/upload', formData);

            await fetchMedia();
            setUploading(false);
        } catch (err) {
            console.error('Upload error:', err);
            const msg = err?.response?.data?.error || err.message || 'Upload failed';
            alert('Upload failed: ' + msg);
            setUploading(false);
        }
    };

    const handleDeleteMedia = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.filename}"? This will also remove it from storage.`)) return;

        try {
            await apiClient.delete('/media/' + item.id);
            await fetchMedia();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Failed to delete media');
        }
    };

    const handleGenerateLink = async () => {
        try {
            const response = await apiClient.post('/generate-share-link', {
                mediaId: selectedShareMedia.id,
                maxDevices: parseInt(maxDevices)
            });

            setGeneratedLink(response.data.link);
        } catch (err) {
            alert(err.message || 'Failed to generate link');
        }
    };

    const filteredMedia = media.filter(item => {
        if (filter === 'all') return true;
        return item.type === filter;
    });

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem' }}>Media Library</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search assets..."
                            className="input"
                            style={{ paddingLeft: '2.5rem', width: '300px' }}
                        />
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                    <label className="btn" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
                        <Upload size={18} style={{ marginRight: '0.5rem' }} />
                        {uploading ? 'Uploading...' : 'Upload Media'}
                        <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={`btn ${filter !== 'all' ? 'btn-secondary' : ''}`} onClick={() => setFilter('all')}>All Assets</button>
                    <button className={`btn ${filter !== 'image' ? 'btn-secondary' : ''}`} onClick={() => setFilter('image')}>Images</button>
                    <button className={`btn ${filter !== 'video' ? 'btn-secondary' : ''}`} onClick={() => setFilter('video')}>Videos</button>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Showing {filteredMedia.length} of {media.length} assets
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-6">
                {filteredMedia.map(item => (
                    <div key={item.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', height: '180px', backgroundColor: '#000' }}>
                            {item.type === 'image' ? (
                                <img src={`http://localhost:5000/uploads/${item.filename}`} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <video src={`http://localhost:5000/uploads/${item.filename}`} preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}

                            <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                                <span className="badge badge-online" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}>
                                    READY
                                </span>
                            </div>
                        </div>

                        <div style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                                    {item.filename}
                                </h3>
                                <button
                                    onClick={() => {
                                        setSelectedShareMedia(item);
                                        setShowShareModal(true);
                                        setGeneratedLink('');
                                        setMaxDevices(1);
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', marginRight: '0.5rem' }}
                                    title="Generate Share Link"
                                >
                                    <LinkIcon size={14} />
                                </button>
                                <button
                                    onClick={() => handleDeleteMedia(item)}
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--status-offline)' }}
                                    title="Delete Media"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <span>{item.uploadDate?.seconds 
                                    ? new Date(item.uploadDate.seconds * 1000).toLocaleDateString()
                                    : new Date(item.uploadDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '450px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>Generate Share Link</h2>
                            <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                Generate a public link for <strong>{selectedShareMedia?.filename}</strong>.
                            </p>

                            <label className="label">Max Viewers / Devices</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    className="input"
                                    value={maxDevices}
                                    min="1"
                                    onChange={e => setMaxDevices(e.target.value)}
                                    style={{ width: '100px' }}
                                />
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {totalDevices} devices registered (Reference)
                                </span>
                            </div>
                        </div>

                        {generatedLink ? (
                            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', wordBreak: 'break-all' }}>
                                <label className="label" style={{ marginBottom: '0.5rem' }}>Generic Link</label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <code style={{ fontSize: '0.875rem', color: 'var(--accent-light)', flex: 1 }}>{generatedLink}</code>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => navigator.clipboard.writeText(generatedLink)}
                                        style={{ padding: '0.25rem 0.5rem' }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                className="btn w-full"
                                onClick={handleGenerateLink}
                            >
                                Generate Link
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
