import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import apiClient from '../apiClient';
import { LayoutDashboard, Image, Monitor, Calendar, Settings, BarChart3, LogOut, FlaskConical } from 'lucide-react';

const Sidebar = () => {
    const [systemName, setSystemName] = useState('SignageAdmin');

    const fetchSettings = async () => {
        try {
            const response = await apiClient.get('/settings');
            if (response.data && response.data.config && response.data.config.systemName) {
                setSystemName(response.data.config.systemName);
            }
        } catch (err) {
            console.error('Sidebar: Failed to fetch settings', err);
        }
    };

    useEffect(() => {
        fetchSettings();
        window.addEventListener('settingsUpdated', fetchSettings);
        return () => window.removeEventListener('settingsUpdated', fetchSettings);
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Image, label: 'Media Library', path: '/media' },
        { icon: Monitor, label: 'Devices', path: '/devices' },
        { icon: Calendar, label: 'Schedules', path: '/schedules' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: FlaskConical, label: 'A/B Testing', path: '/ab-testing' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            backgroundColor: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h1 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-light)' }}>
                    <Monitor size={24} />
                    {systemName}
                </h1>
            </div>

            <nav style={{ padding: '1.5rem 1rem', flex: 1 }}>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    isActive ? 'nav-link active' : 'nav-link'
                                }
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                                    transition: 'all 0.2s',
                                    textDecoration: 'none',
                                    fontWeight: isActive ? 500 : 400
                                })}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    borderRadius: '0.5rem'
                }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
