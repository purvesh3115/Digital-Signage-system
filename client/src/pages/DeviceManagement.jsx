import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { Search, Plus, Monitor, AlertTriangle, MoreVertical, Trash2 } from 'lucide-react';

const DeviceManagement = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', location: '', ip_address: '', group_name: '' });
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [activeTab, setActiveTab] = useState('devices'); // 'devices' or 'groups'
    const [filterGroup, setFilterGroup] = useState('all');

    useEffect(() => {
        fetchDevices();
        const interval = setInterval(fetchDevices, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await apiClient.get('/devices');
            setDevices(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAddDevice = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/devices', {
                name: newDevice.name,
                location: newDevice.location,
                ip_address: newDevice.ip_address,
                groupName: newDevice.group_name  // send as groupName so server reads it correctly
            });
            setNewDevice({ name: '', location: '', ip_address: '', group_name: '' });
            setShowAddModal(false);
            fetchDevices();
        } catch (err) {
            console.error('Add device error:', err);
            // Show the actual server error, not the generic axios message
            const msg = err?.response?.data?.error || err.message || 'Error adding device';
            alert('Failed to add device: ' + msg);
        }
    };

    const handleDeleteDevice = async (id) => {
        if (!window.confirm('Are you sure you want to remove this device? This action cannot be undone.')) {
            return;
        }

        try {
            await apiClient.delete('/devices/' + id);
            fetchDevices();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Error deleting device');
        }
    };

    const handleSelectDevice = (id) => {
        setSelectedDevices(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedDevices(devices.map(d => d.id));
        } else {
            setSelectedDevices([]);
        }
    };

    const handleBatchGroup = async () => {
        const groupName = window.prompt('Enter group name for selected devices:');
        if (!groupName) return;

        try {
            await apiClient.put('/devices/batch-group', { deviceIds: selectedDevices, groupName });
            setSelectedDevices([]);
            fetchDevices();
            alert(`Updated ${selectedDevices.length} devices.`);
        } catch (err) {
            console.error(err);
            alert('Failed to update group: ' + err.message);
        }
    };

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem' }}>Device Management</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search devices..."
                            className="input"
                            style={{ paddingLeft: '2.5rem', width: '300px' }}
                        />
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" onClick={async () => {
                            try {
                                await apiClient.post('/devices', {
                                    name: `Test Device ${Math.floor(Math.random() * 1000)}`,
                                    location: 'Test Lab',
                                    ip_address: '127.0.0.1',
                                    status: 'online'
                                });
                                fetchDevices();
                            } catch (err) { alert('Failed to add test device'); }
                        }}>
                            + Test Device
                        </button>
                        <button className="btn" onClick={() => setShowAddModal(true)}>
                            <Plus size={18} style={{ marginRight: '0.5rem' }} />
                            Register New Device
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('devices')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: activeTab === 'devices' ? 'var(--accent-primary)' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        padding: '0.5rem 0',
                        borderBottom: activeTab === 'devices' ? '2px solid var(--accent-primary)' : 'none',
                        marginBottom: '-0.6rem',
                        transition: 'all 0.2s'
                    }}
                >
                    All Devices
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: activeTab === 'groups' ? 'var(--accent-primary)' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        padding: '0.5rem 0',
                        borderBottom: activeTab === 'groups' ? '2px solid var(--accent-primary)' : 'none',
                        marginBottom: '-0.6rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Device Groups
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Devices</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{devices.length}</div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Online Now</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--status-online)' }}>
                        {devices.filter(d => d.status === 'online').length}
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Offline</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--status-offline)' }}>
                        {devices.filter(d => d.status === 'offline').length}
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Groups</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--accent-light)' }}>
                        {[...new Set(devices.map(d => d.group_name).filter(Boolean))].length}
                    </div>
                </div>
            </div>

            {activeTab === 'devices' ? (
                <>
                    {/* Device Table Filter & Batch Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Filter by Group:</span>
                            <select
                                className="input"
                                style={{ width: '180px', padding: '0.4rem' }}
                                value={filterGroup}
                                onChange={(e) => setFilterGroup(e.target.value)}
                            >
                                <option value="all">All Groups</option>
                                {[...new Set(devices.map(d => d.group_name).filter(Boolean))].sort().map(g => (
                                    <option key={g} value={g}>{g.toUpperCase()}</option>
                                ))}
                                <option value="none">No Group</option>
                            </select>
                        </div>
                        {selectedDevices.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-light)' }}>{selectedDevices.length} items selected</span>
                                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={handleBatchGroup}>
                                    Set Group
                                </button>
                                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--status-offline)' }} onClick={() => setSelectedDevices([])}>
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Device Table */}
                    <div className="card" style={{ padding: '0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem', width: '50px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedDevices.length === devices.length && devices.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th style={{ padding: '1rem' }}>DEVICE NAME</th>
                                    <th style={{ padding: '1rem' }}>LOCATION</th>
                                    <th style={{ padding: '1rem' }}>GROUP</th>
                                    <th style={{ padding: '1rem' }}>STATUS</th>
                                    <th style={{ padding: '1rem' }}>IP ADDRESS</th>
                                    <th style={{ padding: '1rem' }}>LAST HEARTBEAT</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.filter(d => {
                                    if (filterGroup === 'all') return true;
                                    if (filterGroup === 'none') return !d.group_name;
                                    return d.group_name === filterGroup;
                                }).map(device => (
                                    <tr key={device.id} style={{ borderBottom: '1px solid var(--divider-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedDevices.includes(device.id)}
                                                onChange={() => handleSelectDevice(device.id)}
                                            />
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    padding: '0.5rem',
                                                    backgroundColor: 'var(--bg-secondary)',
                                                    borderRadius: '6px',
                                                    color: 'var(--accent-primary)'
                                                }}>
                                                    <Monitor size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{device.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {device.id?.substring(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{device.location}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {device.group_name ? (
                                                <span style={{
                                                    padding: '0.25rem 0.6rem',
                                                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                                    color: 'var(--accent-light)',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    {device.group_name.toUpperCase()}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`badge ${device.status === 'online' ? 'badge-online' : 'badge-offline'}`}>
                                                <span style={{ marginRight: '5px' }}>●</span> {device.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{device.ip_address}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {device.last_ping ? new Date(device.last_ping).toLocaleString() : 'Never'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                                onClick={async () => {
                                                    try {
                                                        const newStatus = device.status === 'online' ? 'offline' : 'online';
                                                        await apiClient.put(`/devices/${device.id}/status-manual`, { status: newStatus });
                                                        fetchDevices();
                                                    } catch (err) { alert('Failed to update status'); }
                                                }}
                                            >
                                                {device.status === 'online' ? 'Go Offline' : 'Go Online'}
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    fontSize: '0.75rem',
                                                    color: 'var(--status-offline)',
                                                    marginRight: '0.5rem'
                                                }}
                                                onClick={() => handleDeleteDevice(device.id)}
                                                title="Remove Device"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {devices.length === 0 && !loading && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No devices found.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Groups Tab View */
                <div className="grid grid-cols-3 gap-6">
                    {[...new Set(devices.map(d => d.group_name).filter(Boolean))].sort().map(group => {
                        const groupDevices = devices.filter(d => d.group_name === group);
                        const onlineCount = groupDevices.filter(d => d.status === 'online').length;
                        return (
                            <div key={group} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--accent-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Device Group</div>
                                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{group.toUpperCase()}</h2>
                                    </div>
                                    <div style={{
                                        padding: '0.5rem',
                                        background: onlineCount === groupDevices.length ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        borderRadius: '8px',
                                        color: onlineCount === groupDevices.length ? 'var(--status-online)' : 'var(--status-warning)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {onlineCount}/{groupDevices.length} ONLINE
                                    </div>
                                </div>
                                <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(onlineCount / groupDevices.length) * 100}%`,
                                        background: onlineCount === groupDevices.length ? 'var(--status-online)' : 'var(--accent-primary)'
                                    }}></div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        className="btn btn-secondary w-full"
                                        style={{ fontSize: '0.875rem' }}
                                        onClick={() => {
                                            setFilterGroup(group);
                                            setActiveTab('devices');
                                        }}
                                    >
                                        View Devices
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {devices.filter(d => !d.group_name).length > 0 && (
                        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderStyle: 'dashed', background: 'transparent' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Ungrouped</div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>UNASSIGNED</h2>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {devices.filter(d => !d.group_name).length} devices are not part of any group.
                            </p>
                            <button
                                className="btn btn-secondary w-full"
                                onClick={() => {
                                    setFilterGroup('none');
                                    setActiveTab('devices');
                                }}
                            >
                                Assign Groups
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Add Device Modal Overlay */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '400px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Register New Device</h2>
                        <form onSubmit={handleAddDevice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="label">Device Name</label>
                                <input
                                    className="input"
                                    value={newDevice.name}
                                    onChange={e => setNewDevice({ ...newDevice, name: e.target.value })}
                                    required
                                    placeholder="e.g. Lobby Display 01"
                                />
                            </div>
                            <div>
                                <label className="label">Location</label>
                                <input
                                    className="input"
                                    value={newDevice.location}
                                    onChange={e => setNewDevice({ ...newDevice, location: e.target.value })}
                                    required
                                    placeholder="e.g. Main Entrance"
                                />
                            </div>
                            <div>
                                <label className="label">IP Address</label>
                                <input
                                    className="input"
                                    value={newDevice.ip_address}
                                    onChange={e => setNewDevice({ ...newDevice, ip_address: e.target.value })}
                                    required
                                    placeholder="e.g. 192.168.1.10"
                                />
                            </div>
                            <div>
                                <label className="label">Group (Optional)</label>
                                <input
                                    className="input"
                                    value={newDevice.group_name}
                                    onChange={e => setNewDevice({ ...newDevice, group_name: e.target.value })}
                                    placeholder="e.g. Lobby, Sales"
                                    list="group-suggestions"
                                />
                                <datalist id="group-suggestions">
                                    {[...new Set(devices.map(d => d.group_name).filter(Boolean))].map(g => (
                                        <option key={g} value={g} />
                                    ))}
                                </datalist>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-secondary w-full" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn w-full">Register Device</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceManagement;
