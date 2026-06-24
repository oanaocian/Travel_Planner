import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { tripsService } from "../services/api";

const categoryLabels = {
    hotel: 'Hotel', museum: 'Museum', restaurant: 'Food',
    park: 'Park', beach: 'Beach', transport: 'Move', other: 'Other'
};

const SharedItineraries = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copyingId, setCopyingId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const fetchPublicTrips = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/trips/public');
                const data = await response.json();
                setTrips(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchPublicTrips();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatTime = (time) => {
        if (!time) return '';
        return time.slice(0, 5);
    };

    const getDayCount = (start, end) => {
        if (!start || !end) return null;
        const diff = Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
        return diff + 1;
    };

    const handleCopy = async (tripId) => {
        if (!user) { navigate('/register'); return; }
        setCopyingId(tripId);
        try {
            const data = await tripsService.copyTrip(tripId);
            if (data.id) {
                setCopiedId(tripId);
                setTimeout(() => {
                    navigate(`/trips/${data.id}`);
                }, 800);
            }
        } catch (err) {
            setError('Could not copy trip');
        } finally {
            setCopyingId(null);
        }
    };

    const filteredTrips = trips.filter(t =>
        t.destination_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination_country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="loading-screen">
            <p className="loading-text">Loading itineraries...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-dots" />
                <div className="page-header-inner">
                    <span className="eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Travel inspiration
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <h1>Shared Itineraries</h1>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(255,255,255,0.07)',
                            border: '0.5px solid rgba(247,244,238,0.15)',
                            borderRadius: '5px',
                            padding: '0 0.6rem',
                            width: '170px',
                            marginBottom: '3px',
                        }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(247,244,238,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search destination..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'var(--parchment)',
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: '0.72rem',
                                    padding: '0.42rem 0',
                                    width: '100%',
                                }}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    padding: 0, color: 'rgba(247,244,238,0.35)',
                                    fontSize: '0.75rem', lineHeight: 1,
                                }}>✕</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2.5rem' }}>

                {error && <div className="error-msg">{error}</div>}

                {/* Not logged in banner */}
                {!user && (
                    <div style={{
                        background: 'var(--emerald-light)',
                        border: '1px solid rgba(26,107,71,0.15)',
                        borderLeft: '3px solid var(--emerald)',
                        padding: '1.25rem 1.5rem',
                        marginBottom: '2.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap',
                    }}>
                        <p style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: '0.85rem',
                            color: 'var(--hero)',
                            fontWeight: 400,
                        }}>
                            Create an account to plan your own trips and share them with the community.
                        </p>
                        <button onClick={() => navigate('/register')} className="btn-forest"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                            Create Account
                        </button>
                    </div>
                )}

                {filteredTrips.length === 0 ? (
                    <p style={{ color: 'var(--ink-muted)', fontWeight: 300 }}>
                        {searchQuery ? `No itineraries found for "${searchQuery}".` : 'No public itineraries yet.'}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {filteredTrips.map(trip => (
                            <div key={trip.id} style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                            }}>
                                {/* Trip Header */}
                                <div style={{
                                    background: 'var(--hero)',
                                    padding: '1.25rem 1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                }}>
                                    <div>
                                        <h3 style={{
                                            fontFamily: "'Cormorant Garant', serif",
                                            fontStyle: 'italic',
                                            fontWeight: 700,
                                            fontSize: '1.3rem',
                                            color: 'var(--parchment)',
                                            marginBottom: '0.4rem',
                                        }}>{trip.title}</h3>
                                        <div style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            flexWrap: 'wrap',
                                            fontFamily: "'Syne', sans-serif",
                                            fontSize: '0.72rem',
                                            color: 'rgba(247,244,238,0.5)',
                                        }}>
                                            <span>📍 {trip.destination_name}, {trip.destination_country}</span>
                                            <span>{formatDate(trip.start_date)} → {formatDate(trip.end_date)}</span>
                                            {getDayCount(trip.start_date, trip.end_date) && (
                                                <span>{getDayCount(trip.start_date, trip.end_date)} days</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Copy button — only for logged in users */}
                                    {user && (
                                        <button
                                            onClick={() => handleCopy(trip.id)}
                                            disabled={copyingId === trip.id || copiedId === trip.id}
                                            className="btn-gold"
                                            style={{
                                                padding: '0.4rem 1rem',
                                                fontSize: '0.72rem',
                                                flexShrink: 0,
                                                opacity: copyingId === trip.id ? 0.6 : 1,
                                            }}>
                                            {copiedId === trip.id ? '✓ Copied!' : copyingId === trip.id ? '...' : '+ Copy Trip'}
                                        </button>
                                    )}
                                </div>

                                {/* Description */}
                                {trip.description && (
                                    <div style={{
                                        padding: '1rem 1.5rem 0',
                                        fontFamily: "'Syne', sans-serif",
                                        fontSize: '0.82rem',
                                        fontWeight: 300,
                                        color: 'var(--ink-muted)',
                                        fontStyle: 'italic',
                                        lineHeight: 1.6,
                                    }}>
                                        "{trip.description}"
                                    </div>
                                )}

                                {/* Activities by day */}
                                <div style={{ padding: '1.25rem 1.5rem' }}>
                                    {trip.days && Object.keys(trip.days).length > 0 ? (
                                        Object.entries(trip.days).map(([dayNumber, activities]) => (
                                            <div key={dayNumber} style={{ marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <span style={{
                                                        background: 'var(--hero)',
                                                        color: 'var(--parchment)',
                                                        fontFamily: "'Syne', sans-serif",
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                        letterSpacing: '0.1em',
                                                        textTransform: 'uppercase',
                                                        padding: '2px 8px',
                                                        borderRadius: '3px',
                                                    }}>Day {dayNumber}</span>
                                                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    {activities.map(activity => (
                                                        <div key={activity.id} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            padding: '0.5rem 0.75rem',
                                                            background: 'var(--parchment)',
                                                            borderLeft: '2px solid var(--emerald)',
                                                        }}>
                                                            <span style={{
                                                                fontFamily: "'Syne', sans-serif",
                                                                fontSize: '0.6rem',
                                                                fontWeight: 800,
                                                                letterSpacing: '0.06em',
                                                                textTransform: 'uppercase',
                                                                color: 'var(--emerald)',
                                                                width: '75px',
                                                                flexShrink: 0,
                                                            }}>
                                                                {categoryLabels[activity.category] || 'Other'}
                                                            </span>
                                                            <span style={{
                                                                fontFamily: "'Syne', sans-serif",
                                                                fontSize: '0.82rem',
                                                                color: 'var(--ink)',
                                                                flex: 1,
                                                            }}>{activity.name}</span>
                                                            {activity.start_time && (
                                                                <span style={{
                                                                    fontFamily: "'Syne', sans-serif",
                                                                    fontSize: '0.72rem',
                                                                    color: 'var(--ink-faint)',
                                                                }}>{formatTime(activity.start_time)}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: 'var(--ink-faint)', fontSize: '0.82rem', fontWeight: 300 }}>
                                            No activities added yet.
                                        </p>
                                    )}
                                </div>

                                {/* Footer */}
                                <div style={{
                                    padding: '0.85rem 1.5rem',
                                    borderTop: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                }}>
                                    <div style={{
                                        width: '28px', height: '28px',
                                        borderRadius: '50%',
                                        background: 'var(--hero)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: "'Syne', sans-serif",
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: 'var(--parchment)',
                                        flexShrink: 0,
                                        textTransform: 'uppercase',
                                    }}>
                                        {trip.username ? trip.username.slice(0, 2) : '?'}
                                    </div>
                                    <span style={{
                                        fontFamily: "'Syne', sans-serif",
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: 'var(--ink)',
                                    }}>{trip.username}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedItineraries;