import React from 'react';
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
    const { user, setUser, setToken } = useContext(AuthContext);

    function handleLogout() {
        setUser(null);
        setToken(null);
        localStorage.clear();
    }

    return (
        <nav style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '0 2.5rem',
            height: '64px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 40,
        }}>
            <Link to="/" style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                fontWeight: 800,
                fontSize: '1.5rem',
                color: 'var(--hero)',
                textDecoration: 'none',
                letterSpacing: '-0.02em',
                flexShrink: 0,
            }}>
                Travel<span style={{ color: 'var(--gold)' }}>.</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'nowrap' }}>
                <Link to="/destinations" className="nav-link">Destinations</Link>
                <Link to="/shared-itineraries" className="nav-link">Shared Itineraries</Link>

                {user ? (
                    <>
                        <Link to="/trips" className="nav-link">My Trips</Link>
                        <Link to="/favourites" className="nav-link">Favourites</Link>
                        <Link to="/profile" style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--surface)',
                            background: 'var(--hero)',
                            padding: '0.3rem 0.875rem',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            letterSpacing: '0.01em',
                            whiteSpace: 'nowrap',
                        }}>
                            Hi, {user.username}
                        </Link>
                        <button onClick={handleLogout} className="btn-forest"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Sign In</Link>
                        <Link to="/register">
                            <button className="btn-gold" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>
                                Get Started
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;