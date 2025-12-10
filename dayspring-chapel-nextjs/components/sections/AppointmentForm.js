'use client';

import { useState } from 'react';
import apiClient from '@/lib/apiClient';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';

export default function AppointmentForm() {
    const [formData, setFormData] = useState({
        firstname: '',
        surname: '',
        email: '',
        countryCode: '+234',
        phone: '',
        venue: '0', // 0 = Online, 1 = Office, 2 = Home
        purpose: '',
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstname.trim()) {
            newErrors.firstname = 'First name is required';
        }

        if (!formData.surname.trim()) {
            newErrors.surname = 'Surname is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Purpose of appointment is required';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            try {
                // Build the payload matching the backend API structure
                const appointmentData = {
                    firstname: formData.firstname,
                    surname: formData.surname,
                    email: formData.email,
                    phoneNumber: {
                        countryCode: formData.countryCode,
                        number: formData.phone,
                    },
                    venueOfMeeting: parseInt(formData.venue),
                    purposeOfAppointment: formData.purpose,
                };

                await apiClient.scheduleAppointment(appointmentData);
                setSubmitted(true);

                // Reset form after 5 seconds
                setTimeout(() => {
                    setFormData({
                        firstname: '',
                        surname: '',
                        email: '',
                        countryCode: '+234',
                        phone: '',
                        venue: '0',
                        purpose: '',
                    });
                    setSubmitted(false);
                }, 5000);
            } catch (error) {
                console.error('Failed to schedule appointment:', error);
                setApiError('Failed to submit appointment. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 uppercase">
                        Request an Appointment
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        We would love to meet with you. Please fill out the form below and we will get back to you as soon as possible.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    {submitted ? (
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                            <p className="text-gray-600">Your appointment request has been submitted. We will contact you soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* API Error */}
                            {apiError && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                    {apiError}
                                </div>
                            )}

                            {/* Name Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstname" className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstname"
                                        name="firstname"
                                        value={formData.firstname}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-500 font-medium ${errors.firstname ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="John"
                                    />
                                    {errors.firstname && <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>}
                                </div>
                                <div>
                                    <label htmlFor="surname" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Surname *
                                    </label>
                                    <input
                                        type="text"
                                        id="surname"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-500 font-medium ${errors.surname ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Doe"
                                    />
                                    {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-500 font-medium ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="john@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <PhoneNumberInput
                                    value={{
                                        countryCode: formData.countryCode,
                                        number: formData.phone
                                    }}
                                    onChange={(newPhone) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            countryCode: newPhone.countryCode,
                                            phone: newPhone.number
                                        }));
                                        // Clear error on change
                                        if (errors.phone) {
                                            setErrors(prev => ({ ...prev, phone: '' }));
                                        }
                                    }}
                                    error={errors.phone}
                                />
                            </div>

                            {/* Venue */}
                            <div>
                                <label htmlFor="venue" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Preferred Meeting Venue
                                </label>
                                <select
                                    id="venue"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black font-medium bg-white"
                                >
                                    <option value="0">Online (Virtual)</option>
                                    <option value="1">Church Office</option>
                                    <option value="2">Home Visit</option>
                                </select>
                            </div>

                            {/* Purpose */}
                            <div>
                                <label htmlFor="purpose" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Purpose of Appointment *
                                </label>
                                <textarea
                                    id="purpose"
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    rows="4"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-500 font-medium ${errors.purpose ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Please briefly describe the purpose of your appointment..."
                                />
                                {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold text-lg shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
