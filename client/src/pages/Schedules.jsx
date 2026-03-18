import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { Calendar, Monitor, Image as ImageIcon, Play, Clock, Check, ChevronRight, Link as LinkIcon, Trash2 } from 'lucide-react';

const Schedules = () => {
    const [step, setStep] = useState(1);
    const [media, setMedia] = useState([]);
    const [devices, setDevices] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [targetType, setTargetType] = useState('device'); // 'device' or 'group'
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [timeRange, setTimeRange] = useState({ start: '', end: '' });
    const [generatedLink, setGeneratedLink] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [mediaRes, devicesRes, schedulesRes] = await Promise.all([
                apiClient.get('/media'),
                apiClient.get('/devices'),
                apiClient.get('/schedules')
            ]);
            setMedia(mediaRes.data || []);
            setDevices(devicesRes.data || []);
            setSchedules(schedulesRes.data || []);
        } catch (err) { console.error(err); }
    };

    const handleCreateSchedule = async () => {
        const targetId = targetType === 'device' ? selectedDevice : selectedGroup;
        if (!selectedMedia || !targetId || !timeRange.start || !timeRange.end) return;

        const payload = {
            mediaId: selectedMedia,
            targetType: targetType,
            targetId: targetId,
            startTime: new Date(timeRange.start).toISOString(),
            endTime: new Date(timeRange.end).toISOString(),
            active: true
        };

        try {
            await apiClient.post('/schedules', payload);

            alert('Schedule Created Successfully');
            setStep(1);
            setSelectedMedia(null);
            setSelectedDevice(null);
            setSelectedGroup(null);
            setTargetType('device');
            setTimeRange({ start: '', end: '' });
            fetchData(); // Refresh list
        } catch (err) { alert(err.message || 'Error creating schedule'); }
    };

    const generateLink = async (deviceId, scheduleId) => {
        try {
            const response = await apiClient.post('/generate-link', { deviceId, scheduleId });
            setGeneratedLink(response.data.link);
        } catch (err) { alert(err.message || 'Link generation failed'); }
    };

    const handleDeleteSchedule = async (id) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;

        try {
            await apiClient.delete('/schedules/' + id);
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Failed to delete schedule');
        }
    };

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.875rem', marginBottom: '2rem' }}>Schedule New Content</h1>

            {/* Stepper Wizard */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', fontSize: '1.125rem', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', color: step >= 1 ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem'
                        }}>1</div>
                        Content
                    </div>
                    <div style={{ width: '50px', height: '2px', backgroundColor: 'var(--border-color)', margin: '0 1rem' }} />
                    <div style={{ display: 'flex', alignItems: 'center', color: step >= 2 ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem'
                        }}>2</div>
                        Target
                    </div>
                    <div style={{ width: '50px', height: '2px', backgroundColor: 'var(--border-color)', margin: '0 1rem' }} />
                    <div style={{ display: 'flex', alignItems: 'center', color: step >= 3 ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem'
                        }}>3</div>
                        Schedule
                    </div>
                </div>

                {/* Step Content */}
                {step === 1 && (
                    <div>
                        <h2 style={{ marginBottom: '1rem' }}>Select Content</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {media.map(item => (
                                <div
                                    key={item._id}
                                    onClick={() => setSelectedMedia(item._id)}
                                    style={{
                                        border: selectedMedia === item._id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    {item.type === 'image' ? (
                                        <img src={`http://localhost:5000/uploads/${item.filename}`} alt={item.filename} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                    ) : (
                                        <video src={`http://localhost:5000/uploads/${item.filename}`} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                    )}
                                    <div style={{ padding: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.filename}</div>
                                    {selectedMedia === item._id && (
                                        <div style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'var(--accent-primary)', borderRadius: '50%', padding: '2px' }}>
                                            <Check size={16} color="white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button className="btn" disabled={!selectedMedia} onClick={() => setStep(2)}>
                                Next Step <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Select Target</h2>
                            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '8px' }}>
                                <button
                                    className={`btn ${targetType === 'device' ? '' : 'btn-secondary'}`}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    onClick={() => setTargetType('device')}
                                >
                                    Devices
                                </button>
                                <button
                                    className={`btn ${targetType === 'group' ? '' : 'btn-secondary'}`}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    onClick={() => setTargetType('group')}
                                >
                                    Groups
                                </button>
                            </div>
                        </div>

                        {targetType === 'device' ? (
                            <div className="grid grid-cols-3 gap-4">
                                {devices.map(device => (
                                    <div
                                        key={device._id}
                                        onClick={() => setSelectedDevice(device._id)}
                                        style={{
                                            padding: '1rem',
                                            border: selectedDevice === device._id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            backgroundColor: 'var(--bg-secondary)'
                                        }}
                                    >
                                        <Monitor size={24} color={device.status === 'online' ? 'var(--status-online)' : 'var(--text-muted)'} />
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{device.name}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{device.location}</div>
                                        </div>
                                    </div>
                                ))}
                                {devices.length === 0 && <p style={{ gridColumn: 'span 3', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No devices registered yet.</p>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {[...new Set(devices.map(d => d.group_name).filter(Boolean))].map(group => (
                                    <div
                                        key={group}
                                        onClick={() => setSelectedGroup(group)}
                                        style={{
                                            padding: '1.5rem',
                                            border: selectedGroup === group ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            backgroundColor: 'var(--bg-secondary)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-light)' }}>{group.toUpperCase()}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {devices.filter(d => d.group_name === group).length} Devices
                                        </div>
                                    </div>
                                ))}
                                {[...new Set(devices.map(d => d.group_name).filter(Boolean))].length === 0 && (
                                    <p style={{ gridColumn: 'span 3', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                                        No groups found. Assign groups in Device Management first.
                                    </p>
                                )}
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button
                                className="btn"
                                disabled={targetType === 'device' ? !selectedDevice : !selectedGroup}
                                onClick={() => setStep(3)}
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 style={{ marginBottom: '1rem' }}>Set Schedule Duration</h2>
                        <div style={{ display: 'flex', gap: '2rem', maxWidth: '600px' }}>
                            <div className="w-full">
                                <label className="label">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="input"
                                    style={{ colorScheme: 'dark', cursor: 'pointer' }}
                                    value={timeRange.start}
                                    onChange={e => setTimeRange({ ...timeRange, start: e.target.value })}
                                />
                            </div>
                            <div className="w-full">
                                <label className="label">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="input"
                                    style={{ colorScheme: 'dark', cursor: 'pointer' }}
                                    value={timeRange.end}
                                    onChange={e => setTimeRange({ ...timeRange, end: e.target.value })}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                            <button className="btn" onClick={handleCreateSchedule} disabled={!timeRange.start || !timeRange.end}>
                                Confirm & Deploy
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Active Schedules List */}
            <h2 style={{ marginBottom: '1rem' }}>Active Schedules</h2>
            <div className="card" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem' }}>MEDIA</th>
                            <th style={{ padding: '1rem' }}>TARGET</th>
                            <th style={{ padding: '1rem' }}>DURATION</th>
                            <th style={{ padding: '1rem' }}>STATUS</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map(sch => (
                            <tr key={sch._id} style={{ borderBottom: '1px solid var(--divider-color)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{sch.mediaId?.filename || 'Unknown Media'}</td>
                                <td style={{ padding: '1rem' }}>{sch.targetId}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} />
                                        {new Date(sch.startTime).toLocaleString()} - {new Date(sch.endTime).toLocaleString()}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span className="badge badge-online">Scheduled</span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem' }}
                                        onClick={() => {
                                            if (sch.targetType === 'group' && !selectedDevice) {
                                                alert('Please select a device in Step 2 first to generate a link for this group schedule.');
                                                return;
                                            }
                                            generateLink(sch.targetType === 'device' ? sch.targetId : selectedDevice, sch._id);
                                        }}
                                    >
                                        <LinkIcon size={14} style={{ marginRight: '4px' }} /> Copy Link
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--status-offline)' }}
                                        onClick={() => handleDeleteSchedule(sch._id)}
                                        title="Delete Schedule"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {generatedLink && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    backgroundColor: 'var(--bg-card)', border: '1px solid var(--accent-primary)',
                    padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                    <Check size={20} color="var(--status-online)" />
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Link Generated</div>
                        <a href={generatedLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent-light)' }}>
                            {generatedLink}
                        </a>
                    </div>
                    <button onClick={() => setGeneratedLink('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Schedules;
