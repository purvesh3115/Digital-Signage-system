import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                marginLeft: 'var(--sidebar-width)',
                flex: 1,
                padding: '2rem',
                backgroundColor: 'var(--bg-primary)',
                overflowY: 'auto'
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
