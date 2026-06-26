import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { tripsService, activitiesService } from "../services/api";
import Map from '../components/Map';
import jsPDF from 'jspdf';

const categoryLabels = {
    hotel: 'Hotel', museum: 'Museum', restaurant: 'Food',
    park: 'Park', beach: 'Beach', transport: 'Move', other: 'Other'
};

const TripDetail = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [cost, setCost] = useState(null);
    const [showCost, setShowCost] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [togglingPublic, setTogglingPublic] = useState(false);
    const [formData, setFormData] = useState({
        name: '', category: 'other', day_number: '',
        start_time: '', price: '', notes: ''
    });

    const fetchTrip = async () => {
        try {
            const data = await tripsService.getOne(id);
            setTrip(data);
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrip(); }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await activitiesService.create(id, formData);
        if (data) {
            fetchTrip();
            setShowForm(false);
            setFormData({ name: '', category: 'other', day_number: '', start_time: '', price: '', notes: '' });
        }
    }

    const handleShowCost = async () => {
        const data = await tripsService.getCost(id);
        setCost(data);
        setShowCost(!showCost);
    }

    const handleEditActivity = (activity) => {
        setEditingActivity(activity.id);
        setEditForm({
            name: activity.name,
            category: activity.category,
            day_number: activity.day_number,
            start_time: activity.start_time || '',
            price: activity.price || '',
            notes: activity.notes || ''
        });
    }

    const handleUpdateActivity = async (e) => {
        e.preventDefault();
        await activitiesService.update(editingActivity, editForm);
        setEditingActivity(null);
        fetchTrip();
    }

    const handleDeleteActivity = async (activityId) => {
        if (window.confirm('Delete this activity?')) {
            await activitiesService.remove(activityId);
            fetchTrip();
        }
    }

    const handleTogglePublic = async () => {
        setTogglingPublic(true);
        try {
            const data = await tripsService.togglePublic(id);
            setTrip(prev => ({ ...prev, is_public: data.is_public }));
        } catch (err) {
            setError('Could not update visibility');
        } finally {
            setTogglingPublic(false);
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    }

    const formatTime = (time) => {
        if (!time) return '';
        return time.slice(0, 5);
    }

    const handleSendEmail = async () => {
        console.log('Trip ID:', id);
        try {
            const response = await fetch(`http://localhost:5000/api/trips/${id}/send-email`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert('Email trimis cu succes! Verifică inbox-ul.');
            } else {
                alert('Eroare: ' + data.message);
            }
        } catch (error) {
            alert('Eroare la trimiterea emailului.');
        }
    };

    const handleExportPDF = async () => {
        const doc = new jsPDF();
        let y = 20;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(30, 61, 43);
        doc.text(trip.title, 20, y); y += 9;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(100, 100, 100);
        doc.text(`${trip.destination_name}, ${trip.destination_country}`, 20, y); y += 9;

        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.text(`Dates:  ${formatDate(trip.start_date)}  -  ${formatDate(trip.end_date)}`, 20, y); y += 6;
        doc.text(`Currency:  ${trip.currency}`, 20, y); y += 6;
        if (trip.description) {
            const descLines = doc.splitTextToSize(`Description:  ${trip.description}`, 170);
            doc.text(descLines, 20, y);
            y += descLines.length * 6;
        }
        y += 4;
        doc.setDrawColor(30, 61, 43);
        doc.line(20, y, 190, y); y += 10;
        if (trip.days) {
            Object.entries(trip.days).forEach(([dayNumber, activities]) => {
                if (y > 260) { doc.addPage(); y = 20; }
                doc.setFontSize(14);
                doc.setTextColor(30, 61, 43);
                doc.text(`Day ${dayNumber}`, 20, y); y += 8;
                activities.forEach(activity => {
                    if (y > 260) { doc.addPage(); y = 20; }
                    doc.setFontSize(11);
                    doc.setTextColor(50, 50, 50);
                    const time = activity.start_time ? `${formatTime(activity.start_time)} - ` : '';
                    const price = activity.price > 0 ? ` (${activity.price} ${trip.currency})` : '';
                    doc.text(`- ${time}${activity.name}${price}`, 25, y); y += 7;
                    if (activity.notes) {
                        doc.setFontSize(10);
                        doc.setTextColor(120, 120, 120);
                        doc.text(`  Notes: ${activity.notes}`, 25, y); y += 6;
                    }
                });
                y += 4;
            });
        }
        if (cost) {
            if (y > 240) { doc.addPage(); y = 20; }
            y += 4;
            doc.setDrawColor(30, 61, 43);
            doc.line(20, y, 190, y); y += 10;
            doc.setFontSize(14);
            doc.setTextColor(30, 61, 43);
            doc.text('Cost Breakdown', 20, y); y += 8;
            cost.breakdown.forEach(item => {
                doc.setFontSize(11);
                doc.setTextColor(50, 50, 50);
                doc.text(`${item.category}: ${item.total} ${trip.currency}`, 25, y); y += 7;
            });
            y += 4;
            doc.setFontSize(13);
            doc.setTextColor(30, 61, 43);
            doc.text(`Total: ${cost.grand_total} ${trip.currency}`, 20, y);
        }
        doc.save(`${trip.title}.pdf`);
    };

    if (loading) return (
        <div className="loading-screen">
            <p className="loading-text">Loading trip...</p>
        </div>
    );

    if (!trip) return (
        <div className="loading-screen">
            <p className="loading-text" style={{ color: '#c0392b' }}>Trip not found.</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-dots" />
                <div className="page-header-inner">
                    <button onClick={() => navigate('/trips')} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem',
                        fontFamily: "'Syne', sans-serif", fontWeight: 600,
                        marginBottom: '1rem', display: 'block', padding: 0,
                        letterSpacing: '0.04em',
                    }}>← Back to My Trips</button>
                    <span className="eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        {trip.destination_name}, {trip.destination_country}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h1>{trip.title}</h1>
                        {/* Public / Private toggle */}
                        <button
                            onClick={handleTogglePublic}
                            disabled={togglingPublic}
                            style={{
                                background: trip.is_public ? 'rgba(201,152,58,0.15)' : 'rgba(255,255,255,0.07)',
                                border: trip.is_public ? '1px solid rgba(201,152,58,0.5)' : '1px solid rgba(247,244,238,0.2)',
                                borderRadius: '5px',
                                color: trip.is_public ? '#EDD07A' : 'rgba(247,244,238,0.5)',
                                fontFamily: "'Syne', sans-serif",
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                padding: '0.45rem 1rem',
                                cursor: togglingPublic ? 'wait' : 'pointer',
                                flexShrink: 0,
                                marginLeft: '1rem',
                                marginTop: '0.25rem',
                                textTransform: 'uppercase',
                            }}>
                            {togglingPublic ? '...' : trip.is_public ? '🌍 Public' : '🔒 Private'}
                        </button>
                    </div>
                    <p style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: '0.8rem',
                        fontWeight: 300,
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: '0.5rem',
                    }}>
                        {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
                    </p>

                    {/* Map */}
                    {trip.destination_latitude && trip.destination_longitude && (
                        <div style={{ marginTop: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                            <Map
                                locations={[
                                    {
                                        name: trip.destination_name,
                                        country: trip.destination_country,
                                        latitude: trip.destination_latitude,
                                        longitude: trip.destination_longitude
                                    },
                                    ...(trip.days
                                        ? Object.values(trip.days).flat()
                                            .filter(a => a.latitude && a.longitude)
                                            .map(a => ({
                                                name: a.name,
                                                country: `Day ${a.day_number}`,
                                                latitude: a.latitude,
                                                longitude: a.longitude
                                            }))
                                        : []
                                    )
                                ]}
                                center={[parseFloat(trip.destination_latitude), parseFloat(trip.destination_longitude)]}
                                zoom={12}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2.5rem' }}>

                {error && <div className="error-msg">{error}</div>}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowForm(!showForm)}
                        className={showForm ? 'btn-outline' : 'btn-forest'}
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>
                        {showForm ? 'Cancel' : '+ Add Activity'}
                    </button>
                    <button onClick={handleShowCost}
                        className="btn-outline"
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>
                        {showCost ? 'Hide Cost' : 'Cost Breakdown'}
                    </button>
                    <button onClick={handleExportPDF}
                        className="btn-gold"
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>
                        Export PDF
                    </button>
                    <button onClick={handleSendEmail}
                        className="btn-gold"
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>
                        Send by Email
                    </button>
                </div>

                {/* Cost Breakdown */}
                {showCost && cost && (
                    <div className="animate-fade-up" style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderLeft: '3px solid var(--gold)',
                        padding: '1.75rem',
                        marginBottom: '2.5rem',
                    }}>
                        <h2 style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            color: 'var(--hero)',
                            marginBottom: '1.25rem',
                        }}>Cost Breakdown</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1.25rem',
                        }}>
                            {cost.breakdown.map(item => (
                                <div key={item.category} style={{
                                    background: 'var(--parchment)',
                                    padding: '1rem',
                                    borderTop: '2px solid var(--gold)',
                                }}>
                                    <p style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        color: 'var(--ink-muted)',
                                    }}>
                                        {categoryLabels[item.category] || item.category}
                                    </p>
                                    <p style={{
                                        fontFamily: "'Cormorant Garant', serif",
                                        fontWeight: 800,
                                        fontSize: '1.25rem',
                                        color: 'var(--emerald)',
                                        marginTop: '0.25rem',
                                    }}>
                                        {item.total} {trip.currency}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div style={{
                            borderTop: '1px solid var(--border)',
                            paddingTop: '1rem',
                            textAlign: 'right',
                        }}>
                            <p style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'var(--ink-muted)',
                            }}>Total estimated cost</p>
                            <p style={{
                                fontFamily: "'Cormorant Garant', serif",
                                fontWeight: 900,
                                fontSize: '2.5rem',
                                color: 'var(--hero)',
                                lineHeight: 1,
                            }}>
                                {cost.grand_total} {trip.currency}
                            </p>
                        </div>
                    </div>
                )}

                {/* Add Activity Form */}
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
                            fontSize: '1.5rem',
                            color: 'var(--hero)',
                            marginBottom: '1.5rem',
                        }}>Add Activity</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-field form-grid-full">
                                    <label className="field-label">Activity Name</label>
                                    <input type="text" name="name" required value={formData.name}
                                        onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Category</label>
                                    <select name="category" value={formData.category}
                                        onChange={handleChange} className="input-field">
                                        <option value="hotel">Hotel</option>
                                        <option value="museum">Museum</option>
                                        <option value="restaurant">Restaurant</option>
                                        <option value="park">Park</option>
                                        <option value="beach">Beach</option>
                                        <option value="transport">Transport</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Day Number</label>
                                    <input type="number" name="day_number" required min="1"
                                        value={formData.day_number} onChange={handleChange}
                                        className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Start Time</label>
                                    <input type="time" name="start_time" value={formData.start_time}
                                        onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Price ({trip.currency})</label>
                                    <input type="number" name="price" min="0" step="0.01"
                                        value={formData.price} onChange={handleChange}
                                        className="input-field" />
                                </div>
                                <div className="form-field form-grid-full">
                                    <label className="field-label">Notes</label>
                                    <textarea name="notes" rows="2" value={formData.notes}
                                        onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-grid-full">
                                    <button type="submit" className="btn-forest"
                                        style={{ padding: '0.75rem 2rem' }}>
                                        Save Activity
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Days & Activities */}
                {trip.days && Object.keys(trip.days).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <p style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontSize: '1.25rem',
                            color: 'var(--ink-muted)',
                        }}>No activities yet. Add your first one!</p>
                    </div>
                ) : (
                    trip.days && Object.entries(trip.days).map(([dayNumber, activities]) => (
                        <div key={dayNumber}>
                            <div className="day-heading">
                                <div className="day-badge">Day {dayNumber}</div>
                                <div className="day-line" />
                            </div>
                            {activities.map(activity => (
                                <div key={activity.id} className="activity-card">
                                    <div style={{
                                        width: '72px',
                                        flexShrink: 0,
                                        background: 'var(--emerald-light)',
                                        border: '1px solid rgba(26,107,71,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0.35rem 0.4rem',
                                        fontSize: '0.6rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                        color: 'var(--emerald)',
                                        textAlign: 'center',
                                        lineHeight: 1.3,
                                    }}>
                                        {categoryLabels[activity.category] || 'Other'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="activity-name">{activity.name}</div>
                                        <div className="activity-meta">
                                            {activity.start_time && `${formatTime(activity.start_time)}`}
                                            {activity.start_time && activity.notes && ' · '}
                                            {activity.notes}
                                        </div>
                                    </div>
                                    {activity.price > 0 && (
                                        <div className="activity-price">
                                            {activity.price} {trip.currency}
                                        </div>
                                    )}
                                    <div className="activity-actions">
                                        <button onClick={() => handleEditActivity(activity)}
                                            className="btn-outline"
                                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteActivity(activity.id)}
                                            className="btn-danger"
                                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* Edit Activity Modal */}
            {editingActivity && (
                <div className="modal-overlay" onClick={() => setEditingActivity(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Edit Activity</div>
                            <button className="modal-close" onClick={() => setEditingActivity(null)}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateActivity}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-field">
                                    <label className="field-label">Name</label>
                                    <input type="text" required value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Category</label>
                                    <select value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                        className="input-field">
                                        <option value="hotel">Hotel</option>
                                        <option value="museum">Museum</option>
                                        <option value="restaurant">Restaurant</option>
                                        <option value="park">Park</option>
                                        <option value="beach">Beach</option>
                                        <option value="transport">Transport</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label className="field-label">Day Number</label>
                                        <input type="number" min="1" required value={editForm.day_number}
                                            onChange={(e) => setEditForm({ ...editForm, day_number: e.target.value })}
                                            className="input-field" />
                                    </div>
                                    <div className="form-field">
                                        <label className="field-label">Start Time</label>
                                        <input type="time" value={editForm.start_time}
                                            onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                                            className="input-field" />
                                    </div>
                                    <div className="form-field">
                                        <label className="field-label">Price ({trip.currency})</label>
                                        <input type="number" min="0" step="0.01" value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                            className="input-field" />
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Notes</label>
                                    <textarea rows="2" value={editForm.notes}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        className="input-field" />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                                    <button type="submit" className="btn-forest"
                                        style={{ flex: 1, padding: '0.75rem' }}>
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={() => setEditingActivity(null)}
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

export default TripDetail;