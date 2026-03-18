import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const DeviceHealth = ({ stats }) => {
    // Mock stats if not provided
    const health = stats || {
        healthy: 121,
        warning: 6,
        critical: 3
    };

    return (
        <div className="card" style={{ height: '100%', position: 'relative' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', letterSpacing: '-0.01em' }}>Device Health</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <CheckCircle size={18} color="var(--status-online)" />
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Healthy</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{health.healthy}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(245, 158, 11, 0.1)' }}>
                            <AlertTriangle size={18} color="var(--status-warning)" />
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Warning</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{health.warning}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)' }}>
                            <XCircle size={18} color="var(--status-offline)" />
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Critical</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{health.critical}</span>
                </div>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Feed</h3>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-online)', boxShadow: '0 0 10px var(--status-online)', animation: 'pulse 2s infinite' }}></div>
                </div>
                <ul style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <li style={{ display: 'flex', gap: '1rem', padding: '0.5rem', borderRadius: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: '2px', backgroundColor: 'var(--accent-light)', borderRadius: '1px' }}></div>
                        <div>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>Terminal_4_West Reconnected</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>2 minutes ago</div>
                        </div>
                    </li>
                    <li style={{ display: 'flex', gap: '1rem', padding: '0.5rem', borderRadius: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: '2px', backgroundColor: 'var(--status-warning)', borderRadius: '1px' }}></div>
                        <div>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>Lobby_Display_2 High Temp</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>14 minutes ago</div>
                        </div>
                    </li>
                </ul>
            </div>
            <style>{`
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default DeviceHealth;
