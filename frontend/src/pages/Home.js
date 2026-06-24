import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div>
            {/* Hero */}
            <div style={{
                background: 'var(--hero)',
                minHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '4rem 2rem',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Dot grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                    pointerEvents: 'none',
                }} />
                {/* Radial glow */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 50% 60%, rgba(42,82,64,0.5) 0%, transparent 65%)',
                    pointerEvents: 'none',
                }} />

                <p className="hero-eyebrow eyebrow" style={{
                    color: 'var(--gold-light)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                }}>
                    <span style={{ width: '2rem', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
                    Your Personal Travel Companion
                    <span style={{ width: '2rem', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
                </p>

                <h1 className="hero-title" style={{
                    fontFamily: "'Cormorant Garant', serif",
                    fontWeight: 900,
                    fontSize: 'clamp(3.5rem, 9vw, 7rem)',
                    color: 'white',
                    lineHeight: 0.95,
                    letterSpacing: '-0.03em',
                    maxWidth: '800px',
                    position: 'relative',
                }}>
                    The World Is Waiting.<br />
                    <em style={{
                        fontStyle: 'italic',
                        color: 'var(--gold-light)',
                    }}>Start Planning.</em>
                </h1>

                <p className="hero-sub" style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 300,
                    fontSize: '1.05rem',
                    color: 'rgba(255,255,255,0.55)',
                    maxWidth: '480px',
                    lineHeight: 1.8,
                    marginTop: '1.75rem',
                    position: 'relative',
                }}>
                    Discover destinations, build itineraries day by day, track your budget and get recommendations tailored to your taste.
                </p>

                <div className="hero-cta" style={{ marginTop: '2.5rem', position: 'relative' }}>
                    <Link to="/destinations">
                        <button className="btn-gold" style={{ fontSize: '1rem', padding: '0.875rem 2.5rem' }}>
                            Explore Destinations
                        </button>
                    </Link>
                </div>
            </div>

            {/* Features */}
            <div style={{
                background: 'var(--parchment-dark)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1px',
                backgroundColor: 'var(--border)',
            }}>
                {[
                    { num: '01', title: 'Discover', body: 'Curated destinations with real photos, budget breakdowns and interactive maps.' },
                    { num: '02', title: 'Plan', body: 'Build day-by-day itineraries with times, categories, notes and live cost tracking.' },
                    { num: '03', title: 'Recommend', body: 'Smart suggestions based on what travellers with similar taste loved most.' },
                ].map((f, i) => (
                    <div key={i} className={`animate-fade-up delay-${i + 1}`} style={{
                        background: 'var(--parchment-dark)',
                        padding: '2.25rem 2.5rem',
                    }}>
                        <p style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontWeight: 900,
                            fontSize: '2.5rem',
                            color: 'var(--gold)',
                            opacity: 0.4,
                            lineHeight: 1,
                        }}>{f.num}</p>
                        <h3 style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontWeight: 700,
                            fontSize: '1.35rem',
                            color: 'var(--hero)',
                            marginTop: '0.75rem',
                        }}>{f.title}</h3>
                        <p style={{
                            fontSize: '0.82rem',
                            fontWeight: 300,
                            color: 'var(--ink-muted)',
                            lineHeight: 1.75,
                            marginTop: '0.5rem',
                        }}>{f.body}</p>
                    </div>
                ))}
            </div>

            {/* CTA */}
            {!user && (
                <div style={{
                    background: 'var(--parchment)',
                    padding: '5rem 2rem',
                    textAlign: 'center',
                    borderTop: '1px solid var(--border)',
                }}>
                    <p className="eyebrow animate-fade-up" style={{ marginBottom: '1rem' }}>
                        Ready to explore?
                    </p>
                    <h2 className="animate-fade-up delay-1" style={{
                        fontFamily: "'Cormorant Garant', serif",
                        fontStyle: 'italic',
                        fontWeight: 800,
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        color: 'var(--hero)',
                        letterSpacing: '-0.02em',
                        marginBottom: '2rem',
                    }}>
                        Your next adventure starts here.
                    </h2>
                    <Link to="/register">
                        <button className="btn-gold animate-fade-up delay-2" style={{ fontSize: '1rem', padding: '0.875rem 2.5rem' }}>
                            Create Free Account
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default Home;