import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../apiClient';
import { useSearchParams } from 'react-router-dom';

const Player = () => {
    const [searchParams] = useSearchParams();
    const tokenStr = searchParams.get('token');
    const [media, setMedia] = useState(null);
    const [error, setError] = useState(null);
    const [errorType, setErrorType] = useState(null); // 'standby' or 'alert'
    const [lastScheduleId, setLastScheduleId] = useState(null);
    const [device, setDevice] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        if (!tokenStr) {
            setError('No token provided');
            return;
        }

        const fetchContent = async () => {
            try {
                const response = await apiClient.get('/play', { params: { token: tokenStr } });

                if (response.data.message) {
                    setError('No content is currently scheduled for this time');
                    setErrorType('standby');
                    if (response.data.device) setDevice(response.data.device);
                    if (media) setMedia(null);
                } else if (response.data.media) {
                    setError(null);
                    setErrorType(null);
                    if (response.data.device) setDevice(response.data.device);
                    if (response.data.scheduleId !== lastScheduleId) {
                        setMedia(response.data.media);
                        setLastScheduleId(response.data.scheduleId);
                    }
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || err.message || 'Connection Error');
                setErrorType('alert');
            }
        };

        fetchContent();
        const interval = setInterval(fetchContent, 10000); // Poll every 10s

        return () => clearInterval(interval);
    }, [tokenStr, lastScheduleId, media]);

    // Auto-play video when media changes
    useEffect(() => {
        if (media?.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }, [media]);

    if (error) {
        if (errorType === 'standby') {
            return (
                <div style={{
                    height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    background: 'radial-gradient(circle at center, #1a1d2d 0%, #0f111a 100%)',
                    color: '#fff', textAlign: 'center', padding: '2rem', gap: '2rem'
                }}>
                    <div style={{ position: 'relative' }}>
                        <div className="standby-pulsar" style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'var(--accent-primary)', opacity: 0.2,
                            animation: 'pulse 3s ease-in-out infinite'
                        }}></div>
                        <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-light)' }}>Standby</h1>
                        <p style={{ fontSize: '1.125rem', color: '#a0a0b0', maxWidth: '500px', fontWeight: 400 }}>{error}</p>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem', letterSpacing: '0.05em' }}>
                        SECURE PLAYER • ID: {device?.id?.substring(0, 8)}
                    </div>
                    <style>{`
                        @keyframes pulse { 
                            0% { transform: scale(0.8); opacity: 0.1; }
                            50% { transform: scale(1.2); opacity: 0.3; }
                            100% { transform: scale(0.8); opacity: 0.1; }
                        }
                    `}</style>
                </div>
            );
        }

        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                background: 'radial-gradient(circle at center, #1a1d2d 0%, #0f111a 100%)',
                color: '#fff', textAlign: 'center', padding: '2rem', gap: '1.5rem'
            }}>
                <div style={{
                    padding: '2rem', background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '50%', border: '1px solid rgba(239, 68, 68, 0.2)',
                    boxShadow: '0 0 40px rgba(239, 68, 68, 0.1)'
                }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>System Alert</h1>
                    <p style={{ fontSize: '1.25rem', color: '#a0a0b0', maxWidth: '500px' }}>{error}</p>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '2rem' }}>
                    Token: <code style={{ color: 'var(--accent-light)' }}>{tokenStr?.substring(0, 8)}...</code>
                </div>
            </div>
        );
    }

    if (!media) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                background: 'radial-gradient(circle at center, #1a1d2d 0%, #0f111a 100%)', color: '#fff', gap: '1.5rem'
            }}>
                <div className="loading-spinner" style={{
                    width: '60px', height: '60px', border: '3px solid rgba(79, 70, 229, 0.1)',
                    borderTopColor: 'var(--accent-primary)', borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Synchronizing Content</h2>
                    <p style={{ color: '#a0a0b0' }}>Establishing secure connection to media stream...</p>
                </div>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            height: '100vh', width: '100vw', background: '#000', overflow: 'hidden',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            position: 'relative'
        }}>
            {/* Background Ambient Glow */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '80%', height: '80%', background: 'var(--accent-primary)',
                filter: 'blur(150px)', opacity: 0.15, zIndex: 0
            }}></div>

            {media.type === 'image' ? (
                <img
                    src={`http://localhost:5000/uploads/${media.filename}`}
                    alt="Signage Content"
                    style={{
                        maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                        position: 'relative', zIndex: 1,
                        boxShadow: '0 0 100px rgba(0,0,0,0.5)',
                        animation: 'fadeIn 1.5s ease-out'
                    }}
                />
            ) : (
                <video
                    ref={videoRef}
                    src={`http://localhost:5000/uploads/${media.filename}`}
                    style={{
                        maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                        position: 'relative', zIndex: 1,
                        boxShadow: '0 0 100px rgba(0,0,0,0.5)',
                        animation: 'fadeIn 1.5s ease-out'
                    }}
                    loop
                    muted
                    autoPlay
                    playsInline
                />
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
            `}</style>

            {/* Subtle Overlay Info (Optional, can be toggled) */}
            <div style={{
                position: 'absolute', bottom: '2rem', right: '2rem',
                background: 'rgba(15, 17, 26, 0.6)', backdropFilter: 'blur(10px)',
                padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 2
            }}>
                Live Stream • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
};

export default Player;
