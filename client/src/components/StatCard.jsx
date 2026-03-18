import React from 'react';

const StatCard = ({ title, value, subtext, trend, icon: Icon, color }) => {
    return (
        <div className="card" style={{
            display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem',
            position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(35, 39, 58, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
            cursor: 'default'
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--accent-light)';
                e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(79, 70, 229, 0.3)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                <div>
                    <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.6rem', letterSpacing: '0.025em', textTransform: 'uppercase' }}>{title}</h3>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1, color: '#fff', letterSpacing: '-0.02em' }}>{value}</div>
                </div>
                {Icon && (
                    <div style={{
                        padding: '0.85rem',
                        borderRadius: '1rem',
                        backgroundColor: `rgba(${color}, 0.1)`,
                        color: `rgb(${color})`,
                        boxShadow: `0 0 20px rgba(${color}, 0.15)`,
                        border: `1px solid rgba(${color}, 0.1)`
                    }}>
                        <Icon size={24} />
                    </div>
                )}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem', position: 'relative', zIndex: 1 }}>
                {trend !== undefined && (
                    <span style={{
                        color: trend >= 0 ? 'var(--status-online)' : 'var(--status-offline)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: trend >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.4rem'
                    }}>
                        {trend >= 0 ? '+' : ''}{trend}%
                    </span>
                )}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{subtext}</span>
            </div>

            {/* Subtle decorative glow */}
            <div style={{
                position: 'absolute', top: '-20%', right: '-10%', width: '100px', height: '100px',
                background: `rgb(${color})`, filter: 'blur(50px)', opacity: 0.05, borderRadius: '50%'
            }}></div>
        </div>
    );
};

export default StatCard;
