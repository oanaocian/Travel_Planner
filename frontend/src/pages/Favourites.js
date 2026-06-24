import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { favouritesService } from "../services/api";

const Favourites = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [favourites, setFavourites] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await favouritesService.getAll();
                setFavourites(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRemove = async (id) => {
        await favouritesService.remove(id);
        setFavourites(favourites.filter(f => f.id !== id));
    }

    if (loading) return (
        <div className="loading-screen">
            <p className="loading-text">Loading your favourites...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-dots" />
                <div className="page-header-inner">
                    <span className="eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Your wishlist
                    </span>
                    <h1>Favourites</h1>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2.5rem' }}>

                {error && <div className="error-msg">{error}</div>}

                {favourites.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <p style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontSize: '1.5rem',
                            color: 'var(--ink-muted)',
                            marginBottom: '1.5rem',
                        }}>
                            No favourites yet. Save destinations you love!
                        </p>
                        <button onClick={() => navigate('/destinations')} className="btn-gold"
                            style={{ padding: '0.75rem 2rem' }}>
                            Browse Destinations
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        {favourites.map((favourite, i) => (
                            <div key={favourite.id}
                                className={`animate-fade-up delay-${Math.min(i + 1, 6)}`}
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    overflow: 'hidden',
                                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(30,61,43,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}>

                                {/* Image */}
                                <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                                    <img
                                        src={favourite.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop'}
                                        alt={favourite.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0.6rem', left: '0.6rem',
                                        background: 'var(--hero)',
                                        color: 'white',
                                        fontSize: '0.58rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        padding: '0.25rem 0.6rem',
                                    }}>
                                        {favourite.country}
                                    </div>
                                </div>

                                {/* Body */}
                                <div style={{ padding: '1.25rem' }}>
                                    <h3 style={{
                                        fontFamily: "'Cormorant Garant', serif",
                                        fontStyle: 'italic',
                                        fontWeight: 800,
                                        fontSize: '1.5rem',
                                        color: 'var(--ink)',
                                        letterSpacing: '-0.01em',
                                        lineHeight: 1.1,
                                        marginBottom: '1rem',
                                    }}>{favourite.name}</h3>

                                    <button
                                        onClick={() => handleRemove(favourite.id)}
                                        className="btn-danger"
                                        style={{ width: '100%', padding: '0.6rem', fontSize: '0.78rem' }}>
                                        Remove from Favourites
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Favourites;