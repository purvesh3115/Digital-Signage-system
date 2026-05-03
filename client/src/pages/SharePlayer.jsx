import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient, { BASE_URL } from '../apiClient';
import { AlertOctagon, Loader2 } from 'lucide-react';

const SharePlayer = () => {
    const { token } = useParams();
    const [media, setMedia] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateLink = async () => {
            try {
                const response = await apiClient.get(`/share/${token}`);
                setMedia(response.data.media);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || err.message || 'Failed to load content');
                setLoading(false);
            }
        };

        if (token) validateLink();
    }, [token]);

    if (loading) return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#0f111a', color: '#fff', gap: '1.5rem',
            background: 'radial-gradient(circle at center, #1a1d2d 0%, #0f111a 100%)'
        }}>
            <div className="share-loader" style={{
                width: '50px', height: '50px', border: '2px solid rgba(79, 70, 229, 0.1)',
                borderTopColor: 'var(--accent-primary)', borderRadius: '50%',
                animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}></div>
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--accent-light)', fontWeight: 500, letterSpacing: '0.05em', fontSize: '0.75rem', textTransform: 'uppercase' }}>Secure Stream</p>
                <p style={{ color: '#a0a0b0', marginTop: '0.25rem' }}>Authenticating access token...</p>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );

    if (error) return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#0f111a', color: '#ff4444', padding: '2rem', textAlign: 'center'
        }}>
            <div style={{
                padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '1rem',
                border: '1px solid rgba(239, 68, 68, 0.1)', marginBottom: '2rem'
            }}>
                <AlertOctagon size={48} />
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700, color: '#fff' }}>Access Denied</h1>
            <p style={{ color: '#a0a0b0', maxWidth: '400px', lineHeight: 1.6 }}>{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary"
                style={{ marginTop: '2rem', padding: '0.75rem 2rem' }}
            >
                Try Again
            </button>
        </div>
    );

    if (!media) return null;

    return (
        <div style={{
            width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative'
        }}>
            {/* Ambient Background Glow */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '70%', height: '70%', background: 'var(--accent-primary)',
                filter: 'blur(120px)', opacity: 0.1, zIndex: 0
            }}></div>

            {media.type === 'image' ? (
                <img
                    src={`${BASE_URL.replace('/api', '/uploads')}/${media.filename}`}
                    alt="Shared Content"
                    style={{
                        maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                        position: 'relative', zIndex: 1,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        animation: 'reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                />
            ) : (
                <video
                    src={`${BASE_URL.replace('/api', '/uploads')}/${media.filename}`}
                    autoPlay
                    loop
                    controls
                    style={{
                        maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                        position: 'relative', zIndex: 1,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        animation: 'reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                />
            )}

            <style>{`
                @keyframes reveal { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>

            <div style={{
                position: 'absolute', top: '2rem', left: '2rem', zJoin: 2,
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 1rem', background: 'rgba(15, 17, 26, 0.4)',
                backdropFilter: 'blur(10px)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-online)', boxShadow: '0 0 10px var(--status-online)' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>SECURE STREAM</span>
            </div>
        </div>
    );
};

export default SharePlayer;
