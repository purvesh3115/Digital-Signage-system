import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import {
    FlaskConical, Plus, Trash2, Trophy, Eye, Play,
    ChevronRight, Check, Monitor, Image as ImageIcon,
    Clock, RefreshCw, X, Beaker
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Tiny helpers
───────────────────────────────────────────── */
const fmtDate = (v) => {
    if (!v) return '—';
    const d = v?.toDate ? v.toDate() : new Date(v?.seconds ? v.seconds * 1000 : v);
    return d.toLocaleString();
};

const pct = (a, b) => {
    const total = (a || 0) + (b || 0);
    if (!total) return { a: 50, b: 50 };
    return { a: Math.round(((a || 0) / total) * 100), b: Math.round(((b || 0) / total) * 100) };
};

const StatusBadge = ({ status }) => {
    const colors = {
        active: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Active' },
        completed: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', label: 'Completed' },
        draft: { bg: 'rgba(234,179,8,0.15)', color: '#eab308', label: 'Draft' },
    };
    const s = colors[status] || colors.draft;
    return (
        <span style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
            padding: '0.2rem 0.6rem', borderRadius: '999px',
            backgroundColor: s.bg, color: s.color, textTransform: 'uppercase'
        }}>
            {s.label}
        </span>
    );
};

/* ─────────────────────────────────────────────
   Create-test modal
───────────────────────────────────────────── */
const CreateTestModal = ({ media, devices, onClose, onCreated }) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: '',
        variantAMedia: null,
        variantBMedia: null,
        targetType: 'device',
        targetId: '',
        startTime: '',
        endTime: '',
    });
    const [loading, setLoading] = useState(false);

    const groups = [...new Set(devices.map(d => d.groupName).filter(Boolean))];

    const handleSubmit = async () => {
        if (!form.name || !form.variantAMedia || !form.variantBMedia || !form.targetId || !form.startTime || !form.endTime) return;
        setLoading(true);
        try {
            await apiClient.post('/ab-tests', {
                name: form.name,
                variantAMediaId: form.variantAMedia,
                variantBMediaId: form.variantBMedia,
                targetType: form.targetType,
                targetId: form.targetId,
                startTime: new Date(form.startTime).toISOString(),
                endTime: new Date(form.endTime).toISOString(),
            });
            onCreated();
            onClose();
        } catch (err) {
            alert(err.response?.data?.error || err.message || 'Failed to create test');
        }
        setLoading(false);
    };

    const overlay = {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)'
    };
    const modal = {
        backgroundColor: 'var(--bg-card)', borderRadius: '16px',
        border: '1px solid var(--border-color)', padding: '2rem',
        width: '90%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
    };

    return (
        <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={modal}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Beaker size={24} color="var(--accent-light)" />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Create A/B Test</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
                    {['Name', 'Variants', 'Target', 'Schedule'].map((label, i) => (
                        <React.Fragment key={i}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                                    backgroundColor: step > i + 1 ? 'var(--status-online)' : step === i + 1 ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                    color: step >= i + 1 ? 'white' : 'var(--text-muted)',
                                    border: step === i + 1 ? '2px solid var(--accent-light)' : 'none',
                                    transition: 'all 0.3s'
                                }}>
                                    {step > i + 1 ? <Check size={14} /> : i + 1}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: step >= i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 600 : 400 }}>{label}</span>
                            </div>
                            {i < 3 && <div style={{ flex: 1, height: '2px', backgroundColor: step > i + 1 ? 'var(--status-online)' : 'var(--border-color)', transition: 'all 0.3s' }} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Name */}
                {step === 1 && (
                    <div>
                        <label className="label">Test Name</label>
                        <input
                            className="input"
                            placeholder="e.g. Summer Campaign — Banner vs Video"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn" disabled={!form.name.trim()} onClick={() => setStep(2)}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Variants */}
                {step === 2 && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {['A', 'B'].map(variant => (
                                <div key={variant}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <span style={{
                                            width: '28px', height: '28px', borderRadius: '8px',
                                            backgroundColor: variant === 'A' ? 'rgba(99,102,241,0.2)' : 'rgba(236,72,153,0.2)',
                                            color: variant === 'A' ? '#818cf8' : '#ec4899',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem'
                                        }}>{variant}</span>
                                        <h3 style={{ margin: 0 }}>Variant {variant}</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '260px', overflowY: 'auto' }}>
                                        {media.map(item => {
                                            const selected = variant === 'A' ? form.variantAMedia === item.id : form.variantBMedia === item.id;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setForm({ ...form, [`variant${variant}Media`]: item.id })}
                                                    style={{
                                                        padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                                                        border: selected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                                        backgroundColor: selected ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {item.type === 'image'
                                                        ? <img src={`http://localhost:5000/uploads/${item.filename}`} alt="" style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                                                        : <div style={{ width: '48px', height: '36px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={16} color="var(--accent-light)" /></div>
                                                    }
                                                    <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.originalname || item.filename}</span>
                                                    {selected && <Check size={16} color="var(--accent-light)" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                                                </div>
                                            );
                                        })}
                                        {media.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No media uploaded yet.</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button className="btn" disabled={!form.variantAMedia || !form.variantBMedia || form.variantAMedia === form.variantBMedia} onClick={() => setStep(3)}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Target */}
                {step === 3 && (
                    <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {['device', 'group'].map(t => (
                                <button
                                    key={t}
                                    className={`btn ${form.targetType === t ? '' : 'btn-secondary'}`}
                                    onClick={() => setForm({ ...form, targetType: t, targetId: '' })}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                            {form.targetType === 'device'
                                ? devices.map(d => (
                                    <div
                                        key={d.id}
                                        onClick={() => setForm({ ...form, targetId: d.id })}
                                        style={{
                                            padding: '1rem', borderRadius: '8px', cursor: 'pointer',
                                            border: form.targetId === d.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            backgroundColor: form.targetId === d.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                                            display: 'flex', flexDirection: 'column', gap: '0.35rem'
                                        }}
                                    >
                                        <Monitor size={18} color={d.status === 'online' ? 'var(--status-online)' : 'var(--text-muted)'} />
                                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{d.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.location}</div>
                                    </div>
                                ))
                                : groups.map(g => (
                                    <div
                                        key={g}
                                        onClick={() => setForm({ ...form, targetId: g })}
                                        style={{
                                            padding: '1rem', borderRadius: '8px', cursor: 'pointer',
                                            border: form.targetId === g ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            backgroundColor: form.targetId === g ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                                        }}
                                    >
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-light)' }}>{g}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            {devices.filter(d => d.groupName === g).length} device(s)
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        {(form.targetType === 'device' ? devices : groups).length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                                No {form.targetType === 'device' ? 'devices' : 'groups'} available.
                            </p>
                        )}
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                            <button className="btn" disabled={!form.targetId} onClick={() => setStep(4)}>Next <ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}

                {/* Step 4: Schedule */}
                {step === 4 && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label className="label">Start Date &amp; Time</label>
                                <input type="datetime-local" className="input" style={{ colorScheme: 'dark' }}
                                    value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">End Date &amp; Time</label>
                                <input type="datetime-local" className="input" style={{ colorScheme: 'dark' }}
                                    value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
                            <button className="btn" disabled={!form.startTime || !form.endTime || loading} onClick={handleSubmit}>
                                {loading ? 'Creating…' : '🚀 Launch Test'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Impression-Recorder modal (simulates a view)
───────────────────────────────────────────── */
const RecordImpressionModal = ({ test, onClose, onRecorded }) => {
    const [loading, setLoading] = useState(false);

    const record = async (variant) => {
        setLoading(true);
        try {
            await apiClient.post(`/ab-tests/${test.id}/impression`, { variant });
            onRecorded();
            onClose();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to record impression');
        }
        setLoading(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '2rem', width: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Record Impression</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Simulate a content view for <strong>{test.name}</strong>. In production, impressions are recorded automatically when content is displayed on a device.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {['A', 'B'].map(v => (
                        <button key={v} className="btn" disabled={loading} onClick={() => record(v)}
                            style={{ background: v === 'A' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #ec4899, #f43f5e)', border: 'none', padding: '1rem', flexDirection: 'column', gap: '0.5rem', height: '80px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{v}</span>
                            <span style={{ fontSize: '0.75rem' }}>Variant {v}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Result Card
───────────────────────────────────────────── */
const ResultCard = ({ test, onDelete, onRecord }) => {
    const { a: pctA, b: pctB } = pct(test.impressionsA, test.impressionsB);
    const totalImpressions = (test.impressionsA || 0) + (test.impressionsB || 0);
    const winner = (test.impressionsA || 0) > (test.impressionsB || 0) ? 'A'
        : (test.impressionsB || 0) > (test.impressionsA || 0) ? 'B' : null;

    return (
        <div style={{
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s'
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            {/* Glow accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #6366f1, #ec4899)' }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <FlaskConical size={18} color="var(--accent-light)" />
                        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{test.name}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <StatusBadge status={test.status || 'active'} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {test.targetType === 'device' ? <Monitor size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> : null}
                            {test.targetId}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button title="Record impression" onClick={onRecord}
                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: 'var(--accent-light)' }}>
                        <Eye size={16} />
                    </button>
                    <button title="Delete test" onClick={onDelete}
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: 'var(--status-offline)' }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Variants */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                {['A', 'B'].map(v => {
                    const impressions = v === 'A' ? (test.impressionsA || 0) : (test.impressionsB || 0);
                    const p = v === 'A' ? pctA : pctB;
                    const isWinner = winner === v;
                    const mediaInfo = v === 'A' ? test.variantAMedia : test.variantBMedia;
                    const color = v === 'A' ? '#818cf8' : '#ec4899';
                    const bgColor = v === 'A' ? 'rgba(99,102,241,0.08)' : 'rgba(236,72,153,0.08)';
                    const borderColor = v === 'A' ? 'rgba(99,102,241,0.25)' : 'rgba(236,72,153,0.25)';

                    return (
                        <div key={v} style={{
                            borderRadius: '12px', padding: '1rem',
                            backgroundColor: bgColor, border: `1px solid ${borderColor}`,
                            position: 'relative'
                        }}>
                            {isWinner && totalImpressions > 0 && (
                                <div style={{ position: 'absolute', top: '-8px', right: '12px', backgroundColor: '#eab308', borderRadius: '999px', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#000', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Trophy size={10} /> WINNING
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <span style={{
                                    width: '26px', height: '26px', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem',
                                    backgroundColor: color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>{v}</span>
                                <span style={{ fontSize: '0.8rem', color, fontWeight: 600 }}>Variant {v}</span>
                            </div>
                            {mediaInfo && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <ImageIcon size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                    {mediaInfo.originalname || mediaInfo.filename || '—'}
                                </div>
                            )}
                            <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{p}%</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{impressions} views</div>
                            {/* Progress bar */}
                            <div style={{ marginTop: '0.75rem', height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '999px' }}>
                                <div style={{ height: '100%', width: `${p}%`, backgroundColor: color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <span><Clock size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{fmtDate(test.startTime)} → {fmtDate(test.endTime)}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{totalImpressions} total impressions</span>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
const ABTesting = () => {
    const [tests, setTests] = useState([]);
    const [media, setMedia] = useState([]);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [recordTest, setRecordTest] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [testsRes, mediaRes, devicesRes] = await Promise.all([
                apiClient.get('/ab-tests'),
                apiClient.get('/media'),
                apiClient.get('/devices'),
            ]);
            setTests(testsRes.data || []);
            setMedia(mediaRes.data || []);
            setDevices(devicesRes.data || []);
        } catch (err) {
            console.error('Failed to fetch A/B test data', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this A/B test? This action cannot be undone.')) return;
        try {
            await apiClient.delete(`/ab-tests/${id}`);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete test');
        }
    };

    const totalTests = tests.length;
    const activeTests = tests.filter(t => t.status === 'active').length;
    const totalImpressions = tests.reduce((sum, t) => sum + (t.impressionsA || 0) + (t.impressionsB || 0), 0);

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FlaskConical size={30} color="var(--accent-light)" />
                        A/B Testing
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                        Compare two content variants and discover what performs best on your displays
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={fetchAll} title="Refresh">
                        <RefreshCw size={16} />
                    </button>
                    <button className="btn" id="create-abtest-btn" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> New Test
                    </button>
                </div>
            </div>

            {/* KPI Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Tests', value: totalTests, icon: FlaskConical, color: '#818cf8' },
                    { label: 'Active Tests', value: activeTests, icon: Play, color: '#22c55e' },
                    { label: 'Total Impressions', value: totalImpressions, icon: Eye, color: '#f59e0b' },
                ].map(kpi => (
                    <div key={kpi.label} style={{
                        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        borderRadius: '12px', padding: '1.25rem',
                        display: 'flex', alignItems: 'center', gap: '1rem'
                    }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${kpi.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <kpi.icon size={22} color={kpi.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{kpi.value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{kpi.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tests Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <FlaskConical size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>Loading tests…</p>
                </div>
            ) : tests.length === 0 ? (
                <div style={{
                    backgroundColor: 'var(--bg-card)', border: '2px dashed var(--border-color)',
                    borderRadius: '16px', padding: '4rem', textAlign: 'center'
                }}>
                    <Beaker size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No A/B Tests Yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Create your first test to compare two media variants and see which one wins!
                    </p>
                    <button className="btn" onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Create First Test
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.5rem' }}>
                    {tests.map(test => (
                        <ResultCard
                            key={test.id}
                            test={test}
                            onDelete={() => handleDelete(test.id)}
                            onRecord={() => setRecordTest(test)}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showCreate && (
                <CreateTestModal
                    media={media}
                    devices={devices}
                    onClose={() => setShowCreate(false)}
                    onCreated={fetchAll}
                />
            )}
            {recordTest && (
                <RecordImpressionModal
                    test={recordTest}
                    onClose={() => setRecordTest(null)}
                    onRecorded={fetchAll}
                />
            )}
        </div>
    );
};

export default ABTesting;
