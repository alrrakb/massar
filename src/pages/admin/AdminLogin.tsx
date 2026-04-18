import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth';
import { supabase } from '../../services/supabase';
import styles from './AdminLogin.module.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Shield, Lock, Mail, AlertCircle, ChevronRight } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // 2FA State
    const [showMFA, setShowMFA] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [mfaFactorId, setMfaFactorId] = useState('');

    const loginSuccessRef = useRef(false);

    // Redirect if already logged in as admin
    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        } else if (user && (user.role === 'teacher' || user.role === 'student')) {
            // Non-admin users shouldn't be on admin login
            setError('Access denied. Admin credentials required.');
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        loginSuccessRef.current = false;

        try {
            const performLogin = async () => {
                const { user: authUser } = await authService.signIn(email, password);

                if (authUser && !loginSuccessRef.current) {
                    // Check for 2FA
                    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

                    if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
                        const { data: factors } = await supabase.auth.mfa.listFactors();
                        const totpFactor = factors?.totp?.[0];
                        if (totpFactor) {
                            setMfaFactorId(totpFactor.id);
                            setShowMFA(true);
                            setLoading(false);
                            return;
                        }
                    }

                    // Check if user is admin
                    const profile = await authService.getCurrentProfile();
                    if (profile?.role !== 'admin') {
                        await supabase.auth.signOut();
                        throw new Error('Access denied. Admin credentials required.');
                    }

                    loginSuccessRef.current = true;
                    setLoading(false);
                    navigate('/admin/dashboard', { replace: true });
                }
            };

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timed out. Please check your connection.')), 10000)
            );

            await Promise.race([performLogin(), timeoutPromise]);
        } catch (err: any) {
            if (loginSuccessRef.current || showMFA) return;

            let message = err.message || 'Failed to login';
            if (message === 'Invalid login credentials') {
                message = 'Incorrect email or password. Please try again.';
            }
            setError(message);
        } finally {
            if (!loginSuccessRef.current && !showMFA) {
                setLoading(false);
            }
        }
    };

    const handleMFA = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Get challenge first
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: mfaFactorId,
            });
            if (challengeError) throw challengeError;

            const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: challengeData.id,
                code: otpCode,
            });

            if (verifyError) throw verifyError;

            if (verifyData) {
                // Verify admin role after MFA
                const profile = await authService.getCurrentProfile();
                if (profile?.role !== 'admin') {
                    await supabase.auth.signOut();
                    throw new Error('Access denied. Admin credentials required.');
                }

                loginSuccessRef.current = true;
                navigate('/admin/dashboard', { replace: true });
            }
        } catch (err: any) {
            setError(err.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className={styles.container}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Logo */}
                <div className={styles.logo}>
                    <Shield size={48} className={styles.logoIcon} />
                    <h1 className={styles.title}>Admin Portal</h1>
                    <p className={styles.subtitle}>System Management Access</p>
                </div>

                {/* MFA Form */}
                {showMFA ? (
                    <form onSubmit={handleMFA} className={styles.form}>
                        <div className={styles.mfaHeader}>
                            <Lock size={24} className={styles.mfaIcon} />
                            <h2>Two-Factor Authentication</h2>
                            <p>Enter the 6-digit code from your authenticator app</p>
                        </div>

                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                className={styles.input}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className={styles.error}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className={styles.button}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setShowMFA(false); setOtpCode(''); setError(''); }}
                            className={styles.backButton}
                        >
                            Back to Login
                        </button>
                    </form>
                ) : (
                    /* Login Form */
                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                <Mail size={16} />
                                Admin Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@exam.local"
                                className={styles.input}
                                required
                                autoFocus
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                <Lock size={16} />
                                Password
                            </label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className={styles.input}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.togglePassword}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className={styles.error}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className={styles.button}
                        >
                            {loading ? (
                                <span className={styles.spinner}></span>
                            ) : (
                                <>
                                    Sign In as Admin
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>

                        <div className={styles.footer}>
                            <Link to="/login" className={styles.link}>
                                Student/Teacher Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>

            {/* Security Notice */}
            <div className={styles.securityNotice}>
                <Shield size={14} />
                <span>Secure Admin Access - Authorized Personnel Only</span>
            </div>
        </div>
    );
};

export default AdminLogin;
