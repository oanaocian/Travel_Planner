import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { tripsService, destinationsService } from "../services/api";
import { useNavigate } from "react-router-dom";

const Trips = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [destinations, setDestinations] = useState([]);
    const [editingTrip, setEditingTrip] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [formData, setFormData] = useState({
        title: '', destination_id: '', start_date: '', end_date: '', currency: 'EUR', description: ''
    });

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tripsData, destinationsData] = await Promise.all([
                    tripsService.getAll(),
                    destinationsService.getAll()
                ]);
                setTrips(Array.isArray(tripsData) ? tripsData : []);
                setDestinations(Array.isArray(destinationsData) ? destinationsData : []);
            } catch (err) {
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await tripsService.create(formData);
        if (data.id) {
            const destination = destinations.find(d => d.id === parseInt(formData.destination_id));
            setTrips([...trips, {
                ...formData, id: data.id,
                destination_name: destination?.name,
                destination_country: destination?.country
            }]);
            setShowForm(false);
        } else {
            setError(data.message);
        }
    }

    const handleDeleteTrip = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this trip?')) {
            await tripsService.remove(id);
            setTrips(trips.filter(t => t.id !== id));
        }
    }

    const handleEditTrip = (e, trip) => {
        e.stopPropagation();
        setEditingTrip(trip.id);
        setEditForm({
            title: trip.title,
            start_date: trip.start_date ? trip.start_date.slice(0, 10) : '',
            end_date: trip.end_date ? trip.end_date.slice(0, 10) : '',
            currency: trip.currency || 'EUR',
            description: trip.description || '',
        });
    }

    const handleUpdateTrip = async (e) => {
        e.preventDefault();
        const data = await tripsService.update(editingTrip, editForm);
        if (data.message === 'Trip updated') {
            setTrips(trips.map(t => t.id === editingTrip ? { ...t, ...editForm } : t));
            setEditingTrip(null);
        } else {
            setError(data.message);
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    }

    if (loading) return (
        <div className="loading-screen">
            <p className="loading-text">Loading your trips...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-dots" />
                <div className="page-header-inner">
                    <span className="eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Your itineraries
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <h1>My Trips</h1>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className={showForm ? 'btn-ghost' : 'btn-gold'}
                            style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>
                            {showForm ? 'Cancel' : '+ New Trip'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2.5rem' }}>

                {error && <div className="error-msg">{error}</div>}

                {/* Create Trip Form */}
                {showForm && (
                    <div className="animate-fade-up" style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        padding: '2rem',
                        marginBottom: '2.5rem',
                    }}>
                        <h2 style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontWeight: 700,
                            fontSize: '1.75rem',
                            color: 'var(--hero)',
                            marginBottom: '1.5rem',
                        }}>New Trip</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-field form-grid-full">
                                    <label className="field-label">Trip Title</label>
                                    <input type="text" name="title" required value={formData.title}
                                        onChange={handleChange} className="input-field" placeholder="e.g. Paris Adventure" />
                                </div>
                                <div className="form-field form-grid-full">
                                    <label className="field-label">Destination</label>
                                    <select name="destination_id" required value={formData.destination_id}
                                        onChange={handleChange} className="input-field">
                                        <option value="">Select a destination...</option>
                                        {destinations.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Start Date</label>
                                    <input type="date" name="start_date" value={formData.start_date}
                                        onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">End Date</label>
                                    <input type="date" name="end_date" value={formData.end_date}
                                        onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Currency</label>
                                    <select name="currency" value={formData.currency}
                                        onChange={handleChange} className="input-field">
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                        <option value="RON">RON</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                                <div className="form-field form-grid-full">
                                    <label className="field-label">Description</label>
                                    <textarea name="description" value={formData.description}
                                        onChange={handleChange} rows="2" className="input-field" />
                                </div>
                                <div className="form-grid-full">
                                    <button type="submit" className="btn-forest"
                                        style={{ padding: '0.75rem 2rem' }}>
                                        Save Trip
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Trips List */}
                {trips.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <p style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontSize: '1.5rem',
                            color: 'var(--ink-muted)',
                            marginBottom: '1.5rem',
                        }}>No trips yet. Start planning your first adventure!</p>
                        <button onClick={() => setShowForm(true)} className="btn-gold"
                            style={{ padding: '0.75rem 2rem' }}>
                            + Create First Trip
                        </button>
                    </div>
                ) : (
                    <div>
                        {trips.map((trip, i) => (
                            <div key={trip.id}
                                onClick={() => navigate(`/trips/${trip.id}`)}
                                className={`trip-row animate-fade-up delay-${Math.min(i + 1, 6)}`}>
                                <div className="trip-row-num">
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="trip-row-name">{trip.title}</div>
                                    <div className="trip-row-meta">
                                        <b>📍 {trip.destination_name}, {trip.destination_country}</b>
                                        {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
                                    </div>
                                    {trip.description && (
                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 300,
                                            color: 'var(--ink-faint)',
                                            marginTop: '0.25rem',
                                        }}>{trip.description}</div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => handleEditTrip(e, trip)}
                                    className="btn-outline"
                                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => handleDeleteTrip(e, trip.id)}
                                    className="btn-danger"
                                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                                    Delete
                                </button>
                                <div style={{ color: 'var(--ink-faint)', fontSize: '1.25rem' }}>›</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Trip Modal */}
            {editingTrip && (
                <div className="modal-overlay" onClick={() => setEditingTrip(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Edit Trip</div>
                            <button className="modal-close" onClick={() => setEditingTrip(null)}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateTrip}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-field">
                                    <label className="field-label">Trip Title</label>
                                    <input type="text" required value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="input-field" />
                                </div>
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label className="field-label">Start Date</label>
                                        <input type="date" value={editForm.start_date}
                                            onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                                            className="input-field" />
                                    </div>
                                    <div className="form-field">
                                        <label className="field-label">End Date</label>
                                        <input type="date" value={editForm.end_date}
                                            onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                                            className="input-field" />
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Currency</label>
                                    <select value={editForm.currency}
                                        onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                                        className="input-field">
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                        <option value="RON">RON</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Description</label>
                                    <textarea rows="2" value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="input-field" />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                                    <button type="submit" className="btn-forest"
                                        style={{ flex: 1, padding: '0.75rem' }}>
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={() => setEditingTrip(null)}
                                        className="btn-outline"
                                        style={{ flex: 1, padding: '0.75rem' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Trips;