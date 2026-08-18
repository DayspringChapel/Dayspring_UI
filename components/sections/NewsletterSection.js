'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/apiClient';

export default function NewsletterSection() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await apiClient.subscribeToNewsletter(email.trim());
            setStatus({ type: 'success', message: response?.message || 'You are subscribed to the newsletter.' });
            setEmail('');
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Subscription failed. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F58634] mb-8 uppercase tracking-wide">
                SUBSCRIBE TO OUR NEWSLETTER
            </h2>
            <form
                onSubmit={handleSubmit}
                className="relative w-full md:w-[50%] px-4 max-w-2xl"
            >
                <Input
                    aria-label="Email address"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pr-36 py-4 bg-gray-50 border-gray-200 rounded-full focus:ring-[#F58634] focus:border-[#F58634]"
                />
                <Button
                    type="submit"
                    disabled={submitting}
                    variant="primary"
                    className="absolute top-1 right-5 h-[calc(100%-8px)] px-8 rounded-full bg-[#F58634] hover:bg-[#d9752c] font-bold text-sm"
                >
                    {submitting ? 'SUBSCRIBING…' : 'SUBSCRIBE'}
                </Button>
            </form>
            {status.message && (
                <p
                    className={`mt-4 px-4 text-sm ${status.type === 'error' ? 'text-red-700' : 'text-green-700'}`}
                    role={status.type === 'error' ? 'alert' : 'status'}
                    aria-live="polite"
                >
                    {status.message}
                </p>
            )}
        </div>
    );
}
