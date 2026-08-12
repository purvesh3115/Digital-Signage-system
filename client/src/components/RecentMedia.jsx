import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Image as ImageIcon } from 'lucide-react';

const RecentMedia = ({ items }) => {
    // Media items from props
    const mediaItems = items || [];

    return (
        <div className="card" style={{ width: '100%', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Recently Added Media</h2>
                <Link to="/media" style={{ color: 'var(--accent-light)', fontSize: '0.875rem', textDecoration: 'none' }}>View Library</Link>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 0' }}>PREVIEW</th>
                        <th style={{ padding: '0.75rem 0' }}>FILE NAME</th>
                        <th style={{ padding: '0.75rem 0' }}>TYPE</th>
                        <th style={{ padding: '0.75rem 0' }}>SIZE</th>
                        <th style={{ padding: '0.75rem 0' }}>UPLOADED AT</th>
                        <th style={{ padding: '0.75rem 0' }}>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    {mediaItems.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--divider-color)' }}>
                            <td style={{ padding: '1rem 0' }}>
                                <div style={{
                                    width: '48px',
                                    height: '32px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.type === 'video' ? <Play size={16} /> : <ImageIcon size={16} />}
                                </div>
                            </td>
                            <td style={{ padding: '1rem 0', fontWeight: 500 }}>{item.filename}</td>
                            <td style={{ padding: '1rem 0' }}>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#2e2e48',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    color: item.type === 'video' ? '#818cf8' : '#fbbf24'
                                }}>{item.type}</span>
                            </td>
                            <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{item.size || 'N/A'}</td>
                            <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>
                                {item.uploadDate?.seconds 
                                    ? new Date(item.uploadDate.seconds * 1000).toLocaleDateString()
                                    : new Date(item.uploadDate).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '1rem 0' }}>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    color: 'var(--status-online)'
                                }}>
                                    <span style={{ fontSize: '1.5em', lineHeight: 0 }}>•</span> Ready
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentMedia;
