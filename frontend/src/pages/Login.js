import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { authService } from "../services/api";

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const[error, setError] = useState(null);
    const { user, setUser, token, setToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await authService.login(formData.email, formData.password);
        if(data.token) {
            setToken(data.token);
            setUser(data.user);
            navigate('/');
        } else {
            setError(data.message)
        }
    }

     return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--parchment)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
        }}>
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '3rem',
                width: '100%',
                maxWidth: '420px',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{
                        fontFamily: "'Cormorant Garant', serif",
                        fontStyle: 'italic',
                        fontWeight: 700,
                        fontSize: '2.5rem',
                        color: 'var(--hero)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1,
                    }}>Sign In</h1>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-field" style={{ marginBottom: '1.25rem' }}>
                        <label className="field-label">Email</label>
                        <input
                            type="email" name="email" required
                            value={formData.email} onChange={handleChange}
                            className="input-field" placeholder="your@email.com" />
                    </div>
                    <div className="form-field" style={{ marginBottom: '2rem' }}>
                        <label className="field-label">Password</label>
                        <input
                            type="password" name="password" required
                            value={formData.password} onChange={handleChange}
                            className="input-field" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="btn-forest" style={{ width: '100%', padding: '0.875rem' }}>
                        Sign In
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    marginTop: '1.5rem',
                    fontSize: '0.82rem',
                    color: 'var(--ink-muted)',
                    fontWeight: 300,
                }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--emerald)', fontWeight: 600, textDecoration: 'none' }}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;