// API Client utility for admin backend calls
const API_BASE_URL = '/api/proxy'; // Use Next.js proxy to avoid CORS

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.backendUrl = 'https://dayspring-backend-4ar8.onrender.com';
    }

    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('admin_token');
        }
        return null;
    }

    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('admin_token', token);
        }
    }

    removeToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
        }
    }

    getUserData() {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('admin_user');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    }

    setUserData(user) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('admin_user', JSON.stringify(user));
        }
    }

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const method = options.method || 'GET';

        try {
            let response;

            if (method === 'GET' || method === 'DELETE') {
                // For GET and DELETE, use query params
                const url = `${this.baseUrl}?endpoint=${encodeURIComponent(endpoint)}`;
                response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                });
            } else {
                // For POST, PUT, PATCH, send data in body
                response = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint,
                        method,
                        data: options.body ? JSON.parse(options.body) : undefined,
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    }),
                });
            }

            // Handle 401 Unauthorized
            if (response.status === 401) {
                this.removeToken();
                if (typeof window !== 'undefined') {
                    window.location.href = '/admin/login';
                }
                throw new Error('Unauthorized');
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            // Return the actual data from the proxy response
            return result.data || result;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(userNameOrEmail, password) {
        return this.request('/api/Users/login', {
            method: 'POST',
            body: JSON.stringify({ userNameOrEmail, password }),
        });
    }

    async logout() {
        this.removeToken();
    }

    // Albums
    async getAlbums() {
        return this.request('/api/Albums');
    }

    async createAlbum(albumData) {
        return this.request('/api/Albums/create-album', {
            method: 'POST',
            body: JSON.stringify(albumData),
        });
    }

    async deleteAlbum(albumId) {
        return this.request(`/api/Albums/${albumId}/delete`, {
            method: 'DELETE',
        });
    }

    // Appointments
    async getAppointments() {
        return this.request('/api/Appointment/get-all');
    }

    async scheduleAppointment(appointmentData) {
        return this.request('/api/Appointment/schedule-appointment', {
            method: 'POST',
            body: JSON.stringify(appointmentData),
        });
    }

    async confirmAppointment(confirmData) {
        return this.request('/api/Appointment/confirm-appointment', {
            method: 'POST',
            body: JSON.stringify(confirmData),
        });
    }

    async cancelAppointment(appointmentId, reason) {
        return this.request(`/api/Appointment/cancel/${appointmentId}`, {
            method: 'PATCH',
            body: JSON.stringify({ reason }),
        });
    }

    // Books
    async getBooks() {
        return this.request('/api/Book');
    }

    async createBook(formData) {
        const token = this.getToken();
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Target-Endpoint': '/api/Book',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async updateBook(bookData) {
        return this.request('/api/Book/update', {
            method: 'PATCH',
            body: JSON.stringify(bookData),
        });
    }

    async deleteBook(bookId) {
        return this.request(`/api/Book/${bookId}/delete`, {
            method: 'DELETE',
        });
    }

    // Events
    async getEvents() {
        return this.request('/api/Events');
    }

    async createEvent(formData) {
        const token = this.getToken();
        // Use proxy route for CORS
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Target-Endpoint': '/api/Events/add-event',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async updateEvent(eventId, formData) {
        const token = this.getToken();
        if (formData instanceof FormData) {
            const response = await fetch('/api/upload', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Endpoint': `/api/Events/${eventId}/update`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
        } else {
            return this.request(`/api/Events/${eventId}/update`, {
                method: 'PATCH',
                body: JSON.stringify(formData),
            });
        }
    }

    async deleteEvent(eventId) {
        return this.request(`/api/Events/${eventId}/delete`, {
            method: 'DELETE',
        });
    }

    // Sermons
    async getSermons() {
        return this.request('/api/Sermon');
    }

    async createSermon(sermonData) {
        return this.request('/api/Sermon/create', {
            method: 'POST',
            body: JSON.stringify(sermonData),
        });
    }

    async updateSermon(sermonId, sermonData) {
        return this.request(`/api/Sermon/${sermonId}/update`, {
            method: 'PUT',
            body: JSON.stringify(sermonData),
        });
    }

    async deleteSermon(sermonId) {
        return this.request(`/api/Sermon/${sermonId}/delete`, {
            method: 'DELETE',
        });
    }

    // Series
    async getSeries() {
        return this.request('/api/Series/series');
    }

    async createSeries(seriesData) {
        return this.request('/api/Series/create', {
            method: 'POST',
            body: JSON.stringify(seriesData),
        });
    }

    async updateSeries(id, seriesData) {
        return this.request(`/api/Series/${id}/update`, {
            method: 'PUT',
            body: JSON.stringify(seriesData),
        });
    }

    async deleteSeries(id) {
        return this.request(`/api/Series/${id}/delete`, {
            method: 'DELETE',
        });
    }

    // Images
    async getImages() {
        return this.request('/api/Image/get-all');
    }

    async uploadImage(formData) {
        const token = this.getToken();
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Target-Endpoint': '/api/Image/upload',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async deleteImage(imageId) {
        return this.request(`/api/Image/${imageId}/delete`, {
            method: 'DELETE',
        });
    }

    // Requisitions
    async getRequisitions() {
        return this.request('/api/Requisition/requisition');
    }

    async createRequisition(requisitionData) {
        return this.request('/api/Requisition/create-requisition', {
            method: 'POST',
            body: JSON.stringify(requisitionData),
        });
    }

    async updateRequisition(id, requisitionData) {
        return this.request(`/api/Requisition/${id}/requisition`, {
            method: 'PUT',
            body: JSON.stringify(requisitionData),
        });
    }

    async approveRequisition(id) {
        return this.request(`/api/Requisition/${id}/approve`, {
            method: 'PATCH',
        });
    }

    // Giving
    async getGivings() {
        return this.request('/api/Giving/givings');
    }
    async deleteGiving(givingId) {
        return this.request(`/api/Giving/${givingId}/delete-giving`, {
            method: 'DELETE',
        });
    }

    // BioData
    async getBioData() {
        return this.request('/api/BioData');
    }

    async getBioDataById(id) {
        return this.request(`/api/BioData/${id}`);
    }

    async createBioData(bioData) {
        return this.request('/api/BioData/create-biodata', {
            method: 'POST',
            body: JSON.stringify(bioData),
        });
    }

    async updateBioData(bioData) {
        return this.request('/api/BioData/update-biodata', {
            method: 'PUT',
            body: JSON.stringify(bioData),
        });
    }

    async deleteBioData(id) {
        return this.request(`/api/BioData/${id}/delete`, {
            method: 'DELETE',
        });
    }

    // Appointments
    async getAppointments() {
        return this.request('/api/Appointment/get-all');
    }

    async scheduleAppointment(appointmentData) {
        return this.request('/api/Appointment/schedule-appointment', {
            method: 'POST',
            body: JSON.stringify(appointmentData),
        });
    }

    async confirmAppointment(confirmData) {
        return this.request('/api/Appointment/confirm-appointment', {
            method: 'POST',
            body: JSON.stringify(confirmData),
        });
    }

    async cancelAppointment(appointmentId, reason) {
        return this.request(`/api/Appointment/cancel/${appointmentId}`, {
            method: 'PATCH',
            body: JSON.stringify({ reason }),
        });
    }

    // Roles
    async getRoles() {
        return this.request('/api/Role/get-all');
    }

    async assignRole(userEmail, roleName) {
        return this.request('/api/Role/assign-role', {
            method: 'POST',
            body: JSON.stringify({ userEmail, roleName }),
        });
    }
}

const apiClient = new ApiClient();
export default apiClient;
