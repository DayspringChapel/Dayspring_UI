'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import styles from './login.module.css';
import BrandedSplash from '@/components/BrandedSplash';

export default function AdminLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiClient.login(formData.email, formData.password);

            if (response.token || response.success) {
                const actualToken = response.token?.result || response.token;

                if (actualToken) {
                    apiClient.setToken(actualToken);
                }

                if (response.user || response.data) {
                    apiClient.setUserData(response.user || response.data);
                }

                router.replace('/admin/dashboard');
            } else {
                setError('Login failed. Please check your credentials.');
                setLoading(false);
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <>
            <BrandedSplash visible={loading} mode="login" />
            <div className={styles.page}>
                <Image
                    src="/hero.png"
                    alt=""
                    fill
                    priority
                    className={styles.bgImage}
                />
                <div className={styles.bgOverlay} />

                <div className={styles.container}>
                    <div className={styles.loginCard}>
                        <div className={styles.brandRow}>
                            <Image src="/logo.png" alt="DaySpring Chapel" width={48} height={26} className={styles.brandLogo} />
                            <span className={styles.brandName}>DaySpring Chapel</span>
                        </div>

                        <div className={styles.header}>
                            <h1>Welcome Back</h1>
                            <p>Sign in to manage your church content</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && (
                                <div className={styles.error}>
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <div className={styles.inputGroup}>
                                <label htmlFor="email">Email</label>
                                <div className={styles.inputWrap}>
                                    <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="admin@dayspring.com"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="password">Password</label>
                                <div className={styles.inputWrap}>
                                    <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <rect x="5" y="11" width="14" height="9" rx="2" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 018 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A9.77 9.77 0 0112 5c5 0 9 4 10 7-.4 1.24-1.13 2.53-2.13 3.68M6.1 6.1C4.14 7.37 2.68 9.37 2 12c1 3 5 7 10 7a9.9 9.9 0 004.5-1.06" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.optionsRow}>
                                <label className={styles.rememberMe}>
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span>Remember me</span>
                                </label>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'Signing in…' : 'Login'}
                            </button>
                        </form>

                        <div className={styles.footer}>
                            <Link href="/">← Back to website</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
