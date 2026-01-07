import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../hooks/useAuth';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast.success('Login berhasil!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login gagal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #00ACC1 0%, #006064 100%)',
            padding: '16px'
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    padding: '40px'
                }} className="animate-fadeIn">
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <img
                            src="/logo.png"
                            alt="IQ.es"
                            style={{
                                width: '200px',
                                height: 'auto',
                                margin: '0 auto'
                            }}
                        />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label className="label">Email</label>
                            <div style={{ position: 'relative' }}>
                                <FiMail style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF'
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="email@iq.es"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <FiLock style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF'
                                }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{
                                padding: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '16px',
                                marginTop: '8px'
                            }}
                        >
                            {isLoading ? (
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid white',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%'
                                }} className="animate-spin" />
                            ) : (
                                <>
                                    <FiLogIn />
                                    <span>Masuk</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '12px',
                        fontSize: '14px'
                    }}>
                        <p style={{ color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>Demo Login:</p>
                        <div style={{ color: '#6B7280', lineHeight: '1.6' }}>
                            <p style={{ margin: '4px 0' }}><strong>Owner:</strong> owner@iq.es</p>
                            <p style={{ margin: '4px 0' }}><strong>Admin:</strong> admin@iq.es</p>
                            <p style={{ margin: '4px 0' }}><strong>Kasir:</strong> kasir@iq.es</p>
                            <p style={{ margin: '4px 0' }}><strong>Supplier:</strong> supplier@iq.es</p>
                            <p style={{ margin: '8px 0 0 0' }}><strong>Password:</strong> password123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
