import React from 'react';

const SystemStatusChart = () => {
    // Mock data for 24h activity
    const bars = [40, 60, 30, 80, 50, 90, 70, 40, 60, 80, 50, 30, 40, 60, 30, 80, 50, 90, 70, 40, 60, 80, 50, 30];

    return (
        <div className="card" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>System Activity</h2>
                <select style={{
                    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-secondary)', borderRadius: '0.5rem', padding: '0.4rem 0.8rem', outline: 'none',
                    fontSize: '0.85rem'
                }}>
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                </select>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '180px',
                gap: '6px',
                padding: '0 0.5rem'
            }}>
                {bars.map((height, i) => (
                    <div key={i} style={{
                        flex: 1,
                        height: `${height}%`,
                        background: i === bars.length - 1
                            ? 'linear-gradient(to top, var(--accent-primary), var(--accent-light))'
                            : 'var(--accent-light)',
                        opacity: i === bars.length - 1 ? 1 : 0.2,
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        boxShadow: i === bars.length - 1 ? '0 0 15px rgba(79, 70, 229, 0.4)' : 'none'
                    }} />
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
            </div>

            <div style={{ position: 'absolute', top: '4.5rem', left: '1.5rem', right: '1.5rem', bottom: '3rem', zIndex: -1, pointerEvents: 'none' }}>
                {[0, 25, 50, 75].map(v => (
                    <div key={v} style={{ position: 'absolute', bottom: `${v}%`, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.03)' }}></div>
                ))}
            </div>
        </div>
    );
};

export default SystemStatusChart;
