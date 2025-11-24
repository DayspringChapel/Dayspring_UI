'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function NewsletterSection() {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Handle newsletter subscription when backend is ready
        console.log('Subscribe:', email);
        setEmail('');
    };

    return (
        <div className="flex flex-col items-center justify-center text-center py-16">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                SUBSCRIBE TO OUR NEWSLETTER
            </h2>
            <form
                onSubmit={handleSubmit}
                className="relative w-full md:w-[40%] px-4"
            >
                <Input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pr-32 bg-bg-light border-gray"
                />
                <Button
                    type="submit"
                    variant="primary"
                    className="absolute top-0 right-4 h-full px-6"
                >
                    SUBSCRIBE
                </Button>
            </form>
        </div>
    );
}
