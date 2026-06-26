import { useState, useEffect, useContext, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { destinationsService, favouritesService, reviewsService, recommendationsService } from "../services/api";
import Map from '../components/Map';

const Destinations = () => {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [destinations, setDestinations] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', country: '', description: '',
        budget_accommodation: '', budget_food: '',
        budget_transport: '', budget_activities: '', currency: 'EUR'
    });
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [recommendationType, setRecommendationType] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedId, setHighlightedId] = useState(null);
    const cardRefs = useRef({});

    const filteredDestinations = destinations.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const data = await destinationsService.getAll();
                setDestinations(Array.isArray(data) ? data : []);
                if (user) {
                    const recData = await recommendationsService.getAll();
                    if (recData.recommendations) {
                        setRecommendations(recData.recommendations);
                        setRecommendationType(recData.type);
                    }
                }
            } catch (err) {
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchDestinations();
    }, []);

    // Scroll to and highlight a destination when arriving with ?highlight=ID
    useEffect(() => {
        const highlightId = searchParams.get('highlight');
        if (!highlightId || destinations.length === 0) return;

        const id = parseInt(highlightId);
        let attempts = 0;

        const tryScroll = () => {
            const el = cardRefs.current[id];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setHighlightedId(id);
                setTimeout(() => setHighlightedId(null), 2400);
                searchParams.delete('highlight');
                setSearchParams(searchParams, { replace: true });
            } else if (attempts < 20) {
                attempts++;
                setTimeout(tryScroll, 150);
            }
        };

        tryScroll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinations]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await destinationsService.create(formData);
        if (data.id) {
            setDestinations([...destinations, { ...formData, id: data.id }]);
            setShowForm(false);
            setFormData({ name: '', country: '', description: '', budget_accommodation: '', budget_food: '', budget_transport: '', budget_activities: '', currency: 'EUR' });
        } else {
            setError(data.message);
        }
    }

    const handleAddFavourite = async (e, destination_id) => {
        e.stopPropagation();
        await favouritesService.add(destination_id);
    }

    const fetchReviews = async (destination_id) => {
        const data = await reviewsService.getAll(destination_id);
        setReviews(Array.isArray(data) ? data : []);
    }

    const handleCardClick = async (destination) => {
        if (selectedDestination?.id === destination.id) {
            setSelectedDestination(null);
        } else {
            setSelectedDestination(destination);
            await fetchReviews(destination.id);
        }
    }

    const handleAddReview = async (e) => {
        e.preventDefault();
        const data = await reviewsService.add(selectedDestination.id, reviewForm);
        if (data.id) {
            fetchReviews(selectedDestination.id);
            setReviewForm({ rating: 5, comment: '' });
        }
    }

    const handleDeleteReview = async (reviewId) => {
        await reviewsService.remove(reviewId);
        fetchReviews(selectedDestination.id);
    }

    const handleDeleteDestination = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this destination?')) {
            await destinationsService.remove(id);
            setDestinations(destinations.filter(d => d.id !== id));
        }
    }

    if (loading) return (
        <div className="loading-screen">
            <p className="loading-text">Discovering destinations...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-dots" />
                <div className="page-header-inner">
                    <span className="eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Explore the world
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <h1>Destinations</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(255,255,255,0.07)',
                                border: '0.5px solid rgba(247,244,238,0.15)',
                                borderRadius: '5px',
                                padding: '0 0.6rem',
                                width: '160px',
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(247,244,238,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search..."
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
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(247,244,238,0.35)', fontSize: '0.75rem', lineHeight: 1 }}>
                                        ✕
                                    </button>
                                )}
                            </div>
                            {user && (
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className={showForm ? 'btn-ghost' : 'btn-gold'}
                                    style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>
                                    {showForm ? 'Cancel' : '+ Add Destination'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2.5rem' }}>

                {error && <div className="error-msg">{error}</div>}

                {/* Add Destination Form */}
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
                        }}>New Destination</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="field-label">Name</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Country</label>
                                    <input type="text" name="country" value={formData.country} onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-field form-grid-full">
                                    <label className="field-label">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Accommodation / night</label>
                                    <input type="number" name="budget_accommodation" value={formData.budget_accommodation} onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Food / day</label>
                                    <input type="number" name="budget_food" value={formData.budget_food} onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Transport / day</label>
                                    <input type="number" name="budget_transport" value={formData.budget_transport} onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Activities / day</label>
                                    <input type="number" name="budget_activities" value={formData.budget_activities} onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Currency</label>
                                    <select name="currency" value={formData.currency} onChange={handleChange} className="input-field">
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                        <option value="RON">RON</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                                <div className="form-grid-full">
                                    <button type="submit" className="btn-forest" style={{ padding: '0.75rem 2rem' }}>
                                        Save Destination
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Map */}
                {!searchQuery && destinations.some(d => d.latitude && d.longitude) && (
                    <div style={{ marginBottom: '3rem' }}>
                        <p className="eyebrow-green" style={{ marginBottom: '0.75rem' }}>World Map</p>
                        <div style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
                            <Map locations={destinations} center={[20, 10]} zoom={2} />
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {!searchQuery && user && recommendations.length > 0 && (
                    <div style={{
                        background: 'var(--emerald-light)',
                        border: '1px solid rgba(26,107,71,0.15)',
                        padding: '2rem',
                        marginBottom: '3rem',
                    }}>
                        <p className="eyebrow-green" style={{ marginBottom: '0.4rem' }}>
                            {recommendationType === 'collaborative' ? 'Recommended for you' : 'Most popular'}
                        </p>
                        <h2 style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            color: 'var(--hero)',
                            marginBottom: '1.5rem',
                        }}>
                            {recommendationType === 'collaborative' ? 'Based on your taste' : 'Trending destinations'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {recommendations.map(dest => (
                                <div key={dest.id} className="reco-card">
                                    <div className="reco-card-img">
                                        <img src={dest.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&h=200&fit=crop'} alt={dest.name} />
                                    </div>
                                    <div className="reco-card-body">
                                        <div className="reco-card-name">{dest.name}</div>
                                        <div className="reco-card-country">{dest.country}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Destinations */}
                <p className="eyebrow-green" style={{ marginBottom: '0.75rem' }}>All destinations</p>
                <h2 style={{
                    fontFamily: "'Cormorant Garant', serif",
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    color: 'var(--ink)',
                    marginBottom: '2rem',
                }}>Browse & Discover</h2>

                {filteredDestinations.length === 0 ? (
                    <p style={{ color: 'var(--ink-muted)', fontWeight: 300 }}>
                        {searchQuery ? `No destinations found for "${searchQuery}".` : 'No destinations yet.'}
                    </p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {filteredDestinations.map((destination, i) => (
                            <div key={destination.id}
                                ref={(el) => (cardRefs.current[destination.id] = el)}
                                onClick={() => handleCardClick(destination)}
                                className={`dest-card animate-fade-up delay-${Math.min(i + 1, 6)}`}
                                style={highlightedId === destination.id ? {
                                    outline: '2px solid var(--gold)',
                                    outlineOffset: '3px',
                                    boxShadow: '0 12px 32px rgba(201,152,58,0.25)',
                                } : {}}>
                                <div className="dest-card-img">
                                    <img
                                        src={destination.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop'}
                                        alt={destination.name} />
                                    <div className="dest-card-badge">{destination.country}</div>
                                </div>

                                <div className="dest-card-body">
                                    <div className="dest-card-name">{destination.name}</div>
                                    <div className="dest-card-desc">{destination.description}</div>
                                    {destination.avg_rating && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            marginBottom: '0.75rem',
                                        }}>
                                            <span style={{
                                                color: 'var(--gold)',
                                                fontSize: '0.85rem',
                                                letterSpacing: '0.05em',
                                            }}>
                                                {'★'.repeat(Math.round(destination.avg_rating))}{'☆'.repeat(5 - Math.round(destination.avg_rating))}
                                            </span>
                                            <span style={{
                                                fontFamily: "'Syne', sans-serif",
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: 'var(--ink-muted)',
                                            }}>
                                                {destination.avg_rating} ({destination.review_count} {destination.review_count === 1 ? 'review' : 'reviews'})
                                            </span>
                                        </div>
                                    )}
                                    <div className="dest-card-stats">
                                        <div className="dest-card-stat"><span>{destination.budget_accommodation} {destination.currency}</span>Hotel/night</div>
                                        <div className="dest-card-stat"><span>{destination.budget_food} {destination.currency}</span>Food/day</div>
                                        <div className="dest-card-stat"><span>{destination.budget_activities} {destination.currency}</span>Activities</div>
                                    </div>

                                    {user && (
                                        <div>
                                            <div className="dest-card-actions">
                                                <button onClick={(e) => handleAddFavourite(e, destination.id)}
                                                    className="btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}>
                                                    ♡ Favourite
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedDestination(destination);
                                                        fetchReviews(destination.id);
                                                        setShowReviewsModal(true);
                                                    }}
                                                    className="btn-forest" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}>
                                                    ★ Reviews
                                                </button>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                <a href={`https://www.booking.com/search.html?ss=${encodeURIComponent(destination.name)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                                                    <button className="btn-outline" style={{ width: '100%', padding: '0.45rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                                                        Find Hotels
                                                    </button>
                                                </a>
                                                <a href={`https://www.google.com/search?q=flights+to+${encodeURIComponent(destination.name)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                                                    <button className="btn-outline" style={{ width: '100%', padding: '0.45rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                                                        Find Flights
                                                    </button>
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Write Review Modal */}
            {showReviewModal && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Write a Review</div>
                            <button className="modal-close" onClick={() => setShowReviewModal(false)}>✕</button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 600, marginBottom: '1.5rem' }}>
                            📍 {selectedDestination?.name}
                        </p>
                        <form onSubmit={async (e) => { await handleAddReview(e); setShowReviewModal(false); }}>
                            <div className="form-field" style={{ marginBottom: '1.25rem' }}>
                                <label className="field-label">Rating</label>
                                <select value={reviewForm.rating}
                                    onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                                    className="input-field">
                                    <option value="5">★★★★★ — Excellent</option>
                                    <option value="4">★★★★ — Good</option>
                                    <option value="3">★★★ — Average</option>
                                    <option value="2">★★ — Poor</option>
                                    <option value="1">★ — Terrible</option>
                                </select>
                            </div>
                            <div className="form-field" style={{ marginBottom: '1.5rem' }}>
                                <label className="field-label">Comment</label>
                                <textarea value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    rows="4" className="input-field" placeholder="Share your experience..." />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn-forest" style={{ flex: 1, padding: '0.75rem' }}>
                                    Submit Review
                                </button>
                                <button type="button" onClick={() => setShowReviewModal(false)}
                                    className="btn-outline" style={{ flex: 1, padding: '0.75rem' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Reviews Modal */}
            {showReviewsModal && (
                <div className="modal-overlay" onClick={() => setShowReviewsModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Reviews</div>
                            <button className="modal-close" onClick={() => setShowReviewsModal(false)}>✕</button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 600, marginBottom: '1.5rem' }}>
                            📍 {selectedDestination?.name}
                        </p>
                        {reviews.length === 0 ? (
                            <p style={{ color: 'var(--ink-muted)', fontWeight: 300, fontSize: '0.875rem' }}>
                                No reviews yet. Be the first to write one!
                            </p>
                        ) : (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {reviews.map(review => (
                                    <div key={review.id} style={{
                                        borderBottom: '1px solid var(--border)',
                                        paddingBottom: '1rem',
                                        marginBottom: '1rem',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{review.username}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span className="stars">{'★'.repeat(review.rating)}</span>
                                                {user && review.username === user.username && (
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="btn-danger"
                                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}>
                                                         🗑
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.82rem', fontWeight: 300, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button onClick={() => { setShowReviewsModal(false); setShowReviewModal(true); }}
                                className="btn-forest" style={{ flex: 1, padding: '0.75rem' }}>
                                Write a Review
                            </button>
                            <button onClick={() => setShowReviewsModal(false)}
                                className="btn-outline" style={{ flex: 1, padding: '0.75rem' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Destinations;