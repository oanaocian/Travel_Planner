import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { profileService } from "../services/api";

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [updateMessage, setUpdateMessage] = useState(null);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await profileService.getProfile();
                setProfile(data);
                setNewUsername(data.username);
            } catch (err) {
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        const data = await profileService.updateUsername(newUsername);
        if (data.message === 'Username updated successfully') {
            setProfile({ ...profile, username: newUsername });
            setUser({ ...user, username: newUsername });
            setUpdateMessage('Username updated successfully!');
            setShowEdit(false);
            setTimeout(() => setUpdateMessage(null), 3000);
        } else {
            setError(data.message);
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    if (loading) return (
        <div className="loading-screen">
            <p className="loading-text">Loading profile...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-dots" />
                <div className="page-header-inner" style={{ textAlign: 'center' }}>
                    <span className="eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Your account
                    </span>
                    <h1>{profile?.username}</h1>
                    <p style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: '0.8rem',
                        fontWeight: 300,
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: '0.5rem',
                    }}>
                        Member since {formatDate(profile?.created_at)}
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 2.5rem' }}>

                {error && <div className="error-msg">{error}</div>}
                {updateMessage && <div className="success-msg">{updateMessage}</div>}

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1px',
                    background: 'var(--border)',
                    marginBottom: '2.5rem',
                }}>
                    <div style={{
                        background: 'var(--surface)',
                        padding: '2rem',
                        textAlign: 'center',
                    }}>
                        <p style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontWeight: 900,
                            fontSize: '3.5rem',
                            color: 'var(--hero)',
                            lineHeight: 1,
                        }}>{profile?.trips_count}</p>
                        <p style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: 'var(--ink-muted)',
                            marginTop: '0.5rem',
                        }}>Trips Created</p>
                    </div>
                    <div style={{
                        background: 'var(--surface)',
                        padding: '2rem',
                        textAlign: 'center',
                    }}>
                        <p style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontWeight: 900,
                            fontSize: '3.5rem',
                            color: 'var(--hero)',
                            lineHeight: 1,
                        }}>{profile?.reviews_count}</p>
                        <p style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: 'var(--ink-muted)',
                            marginTop: '0.5rem',
                        }}>Reviews Written</p>
                    </div>
                </div>

                {/* Account Info */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{
                        padding: '1.25rem 1.75rem',
                        borderBottom: '1px solid var(--border)',
                    }}>
                        <h2 style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontWeight: 700,
                            fontSize: '1.35rem',
                            color: 'var(--hero)',
                        }}>Account Info</h2>
                    </div>

                    {[
                        { label: 'Username', value: profile?.username },
                        { label: 'Email', value: profile?.email },
                        { label: 'Member Since', value: formatDate(profile?.created_at) },
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem 1.75rem',
                            borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                        }}>
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'var(--ink-muted)',
                            }}>{item.label}</span>
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                color: 'var(--ink)',
                            }}>{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* Edit Username Button */}
                <button
                    onClick={() => setShowEdit(!showEdit)}
                    className={showEdit ? 'btn-outline' : 'btn-forest'}
                    style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem' }}>
                    {showEdit ? 'Cancel' : 'Edit Username'}
                </button>

                {/* Edit Username Form */}
                {showEdit && (
                    <div className="animate-fade-up" style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        padding: '2rem',
                    }}>
                        <h2 style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontStyle: 'italic',
                            fontWeight: 700,
                            fontSize: '1.35rem',
                            color: 'var(--hero)',
                            marginBottom: '1.5rem',
                        }}>Change Username</h2>
                        <form onSubmit={handleUpdateUsername}>
                            <div className="form-field" style={{ marginBottom: '1.25rem' }}>
                                <label className="field-label">New Username</label>
                                <input
                                    type="text" required
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="input-field" />
                            </div>
                            <button type="submit" className="btn-gold"
                                style={{ width: '100%', padding: '0.75rem' }}>
                                Save Username
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;