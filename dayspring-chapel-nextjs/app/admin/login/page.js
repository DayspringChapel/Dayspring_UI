'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from './login.module.css';
import BrandedSplash from '@/components/BrandedSplash';

export default function AdminLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
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
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <BrandedSplash visible={loading} mode="login" />
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <h1>Dayspring Admin</h1>
                    <p>Sign in to manage your church content</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
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

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        Sign In
                    </button>
                </form>

                <div className={styles.footer}>
                    <a href="/">← Back to website</a>
                </div>
            </div>
        </div>
        </>
    );
}
