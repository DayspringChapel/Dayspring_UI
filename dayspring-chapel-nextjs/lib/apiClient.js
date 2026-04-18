const API_BASE_URL = '/api/proxy';
const UPLOAD_PROXY_URL = '/api/upload';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.maxRetries = 3;
        this.inFlightGetRequests = new Map();
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    getRetryDelay(response, attempt) {
        const retryAfter = response.headers.get('retry-after');
        if (retryAfter) {
            const asNumber = Number(retryAfter);
            if (Number.isFinite(asNumber)) {
                return asNumber * 1000;
            }
        }

        const jitter = Math.floor(Math.random() * 250);
        return Math.min(1000 * 2 ** attempt + jitter, 10000);
    }

    async parseResponseJson(response) {
        const text = await response.text();
        if (!text) return {};

        try {
            return JSON.parse(text);
        } catch {
            return { error: text };
        }
    }

    async fetchWith429Retry(url, fetchOptions, attempt = 0) {
        const response = await fetch(url, fetchOptions);
        if (response.status === 429 && attempt < this.maxRetries) {
            const delay = this.getRetryDelay(response, attempt);
            await this.sleep(delay);
            return this.fetchWith429Retry(url, fetchOptions, attempt + 1);
        }

        return response;
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

    unwrapPayload(result) {
        let payload = result?.data ?? result;

        while (
            payload &&
            typeof payload === 'object' &&
            !Array.isArray(payload) &&
            'data' in payload &&
            (
                'status' in payload ||
                'Status' in payload ||
                'message' in payload ||
                'Message' in payload
            )
        ) {
            payload = payload.data;
        }

        return payload;
    }

    normalizeImage(image) {
        if (!image) return null;
        if (typeof image === 'string') {
            return { id: image, url: image, imageUrlLink: image };
        }

        const url = image.imageUrlLink || image.ImageUrlLink || image.url || image.Url || null;

        return {
            ...image,
            id: image.id || image.Id,
            url,
            imageUrlLink: url,
        };
    }

    normalizeEvent(event) {
        if (!event) return null;

        const eventDate = event.eventDate || event.EventDate || event.datetime || event.DateTime || null;
        const eventImage = event.eventImage || event.EventImage || event.eventImageUrl || event.EventImageUrl || null;

        return {
            ...event,
            id: event.id || event.Id,
            heading: event.heading || event.Heading,
            description: event.description || event.Description,
            eventDate,
            datetime: eventDate,
            eventImage,
        };
    }

    normalizeBook(book) {
        if (!book) return null;

        const imageUrl = book.imageUrl || book.ImageUrl || book.bookImage || book.BookImage || null;

        return {
            ...book,
            id: book.id || book.Id,
            title: book.title || book.Title,
            author: book.author || book.Author || '',
            description: book.description || book.Description || '',
            publisher: book.publisher || book.Publisher || '',
            isbn: book.isbn || book.ISBN || '',
            imageUrl,
            bookImage: imageUrl,
            bookUrlLink: book.bookUrlLink || book.BookUrlLink || '',
        };
    }

    normalizeAlbum(album) {
        if (!album) return null;

        const images = Array.isArray(album.images || album.Images)
            ? (album.images || album.Images).map((image) => this.normalizeImage(image)).filter(Boolean)
            : [];

        const albumImage = album.albumImageUrlLink || album.AlbumImageUrlLink || null;
        const albumYear = album.albumYear || album.AlbumYear || null;

        return {
            ...album,
            id: album.id || album.Id,
            title: album.title || album.Title || album.albumName || album.AlbumName,
            albumName: album.albumName || album.AlbumName,
            description: album.description || album.Description || '',
            albumYear: albumYear ? String(albumYear) : '',
            albumImageUrlLink: albumImage,
            albumImage: albumImage,
            images,
        };
    }

    normalizeSermon(sermon) {
        if (!sermon) return null;

        const imageUrl = sermon.imageUrl || sermon.ImageUrl || sermon.imageLink || sermon.ImageLink || sermon.image || sermon.Image || null;
        const audioLink = sermon.audioFile || sermon.AudioFile || sermon.audioLink || sermon.AudioLink || sermon.link || null;

        return {
            ...sermon,
            id: sermon.id || sermon.Id || sermon.sermonId || sermon.SermonId,
            sermonId: sermon.sermonId || sermon.SermonId || sermon.id || sermon.Id,
            title: sermon.title || sermon.Title,
            imageUrl,
            image: imageUrl,
            preacherName: sermon.preacherName || sermon.PreacherName || sermon.preacher || sermon.Preacher || '',
            seriesTitle: sermon.seriesTitle || sermon.SeriesTitle || '',
            sermonDate: sermon.sermonDate || sermon.SermonDate || '',
            audioFile: audioLink,
            audioLink,
            link: audioLink,
        };
    }

    normalizeAppointment(appointment) {
        if (!appointment) return null;

        return {
            ...appointment,
            id: appointment.id || appointment.Id,
            surname: appointment.surname || appointment.Surname || '',
            firstname: appointment.firstname || appointment.Firstname || '',
            email: appointment.email || appointment.Email || '',
            purposeOfAppointment: appointment.purposeOfAppointment || appointment.PurposeOfAppointment || '',
            phoneNumber: appointment.phoneNumber || appointment.PhoneNumber || null,
            venueOfMeeting: appointment.venueOfMeeting ?? appointment.VenueOfMeeting ?? 0,
            status: appointment.status ?? appointment.Status ?? 0,
            dateOfAppointment: appointment.dateOfAppointment || appointment.DateOfAppointment || appointment.appointmentDate || appointment.AppointmentDate || null,
            appointmentDate: appointment.appointmentDate || appointment.AppointmentDate || appointment.dateOfAppointment || appointment.DateOfAppointment || null,
        };
    }

    normalizeRequisition(requisition) {
        if (!requisition) return null;

        return {
            ...requisition,
            id: requisition.id || requisition.Id,
            requestorName: requisition.requestorName || requisition.RequestorName || '',
            description: requisition.description || requisition.Description || '',
            department: requisition.department || requisition.Department || requisition.unit || requisition.Unit || '',
            unit: requisition.unit || requisition.Unit || requisition.department || requisition.Department || '',
            items: requisition.items || requisition.Items || [],
            itemTotal: requisition.itemTotal ?? requisition.ItemTotal ?? 0,
            status: requisition.status ?? requisition.Status ?? 0,
            requestDate: requisition.requestDate || requisition.RequestDate || '',
        };
    }

    normalizeBioData(member) {
        if (!member) return null;

        const address = member.address || member.Address;
        const phoneNumber = member.phoneNumber || member.PhoneNumber;
        const altPhoneNumber = member.alernativePhoneNumber || member.AlernativePhoneNumber;

        const formatPhone = (value) => {
            if (!value) return '';
            if (typeof value === 'string') return value;
            return [value.countryCode, value.number].filter(Boolean).join(' ').trim();
        };

        const formatAddress = (value) => {
            if (!value) return '';
            if (typeof value === 'string') return value;
            return [value.street, value.city, value.state, value.country].filter(Boolean).join(', ');
        };

        return {
            ...member,
            id: member.id || member.Id,
            userId: member.userId || member.UserId,
            firstName: member.firstName || member.FirstName || '',
            lastName: member.lastName || member.LastName || '',
            email: member.email || member.Email || '',
            phoneNumber: formatPhone(phoneNumber),
            phoneNumberObject: phoneNumber || null,
            alternativePhoneNumber: formatPhone(altPhoneNumber),
            dateOfBirth: member.dateOfBirth || member.DateOfBirth || '',
            address: formatAddress(address),
            addressObject: address || null,
            occupation: member.occupation || member.Occupation || '',
            role: member.role || member.Role || 'Member',
        };
    }

    normalizeArray(data, normalizer) {
        return Array.isArray(data) ? data.map((item) => normalizer.call(this, item)).filter(Boolean) : [];
    }

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const method = options.method || 'GET';
        const requestKey = method === 'GET' ? `${method}:${endpoint}` : null;

        const execute = async () => {
            let response;

            if (method === 'GET' || method === 'DELETE') {
                const url = `${this.baseUrl}?endpoint=${encodeURIComponent(endpoint)}`;
                response = await this.fetchWith429Retry(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                });
            } else {
                response = await this.fetchWith429Retry(this.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint,
                        method,
                        data: options.body ? JSON.parse(options.body) : undefined,
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }),
                });
            }

            if (response.status === 401) {
                this.removeToken();
                if (typeof window !== 'undefined') {
                    window.location.href = '/admin/login';
                }
                throw new Error('Unauthorized');
            }

            const result = await this.parseResponseJson(response);

            if (!response.ok) {
                throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`);
            }

            return this.unwrapPayload(result);
        };

        if (requestKey) {
            if (this.inFlightGetRequests.has(requestKey)) {
                return this.inFlightGetRequests.get(requestKey);
            }

            const requestPromise = execute().finally(() => {
                this.inFlightGetRequests.delete(requestKey);
            });
            this.inFlightGetRequests.set(requestKey, requestPromise);
            return requestPromise;
        }

        try {
            return await execute();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async upload(endpoint, formData, method = 'POST') {
        const token = this.getToken();
        const response = await this.fetchWith429Retry(UPLOAD_PROXY_URL, {
            method,
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                'X-Target-Endpoint': endpoint,
            },
            body: formData,
        });

        const result = await this.parseResponseJson(response);

        if (!response.ok) {
            throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`);
        }

        return this.unwrapPayload(result);
    }

    async login(userNameOrEmail, password) {
        return this.request('/api/Users/login', {
            method: 'POST',
            body: JSON.stringify({ userNameOrEmail, password }),
        });
    }

    async logout() {
        this.removeToken();
    }

    async getAlbums() {
        const data = await this.request('/api/Albums');
        return this.normalizeArray(data, this.normalizeAlbum);
    }

    async createAlbum(formData) {
        return this.upload('/api/Albums/create-album', formData, 'POST');
    }

    async deleteAlbum(albumId) {
        return this.request(`/api/Albums/${albumId}/delete`, {
            method: 'DELETE',
        });
    }

    async getAppointments() {
        const data = await this.request('/api/Appointments/get-all');
        return this.normalizeArray(data, this.normalizeAppointment);
    }

    async scheduleAppointment(appointmentData) {
        return this.request('/api/Appointments/schedule-appointment', {
            method: 'POST',
            body: JSON.stringify(appointmentData),
        });
    }

    async confirmAppointment(formData) {
        return this.upload('/api/Appointments/confirm-appointment', formData, 'POST');
    }

    async cancelAppointment(appointmentId) {
        return this.request(`/api/Appointments/cancel/${appointmentId}`, {
            method: 'PATCH',
            body: JSON.stringify({}),
        });
    }

    async getBooks() {
        const data = await this.request('/api/Books');
        return this.normalizeArray(data, this.normalizeBook);
    }

    async createBook(formData) {
        return this.upload('/api/Books/create', formData, 'POST');
    }

    async updateBook(bookId, formData) {
        return this.upload(`/api/Books/${bookId}/update`, formData, 'PATCH');
    }

    async deleteBook(bookId) {
        return this.request(`/api/Books/${bookId}/delete`, {
            method: 'DELETE',
        });
    }

    async getEvents() {
        const data = await this.request('/api/Events');
        return this.normalizeArray(data, this.normalizeEvent);
    }

    async createEvent(formData) {
        return this.upload('/api/Events/add-event', formData, 'POST');
    }

    async updateEvent(eventId, formData) {
        if (formData instanceof FormData) {
            return this.upload(`/api/Events/${eventId}/update`, formData, 'PATCH');
        }

        return this.request(`/api/Events/${eventId}/update`, {
            method: 'PATCH',
            body: JSON.stringify(formData),
        });
    }

    async deleteEvent(eventId) {
        return this.request(`/api/Events/${eventId}/delete`, {
            method: 'DELETE',
        });
    }

    async getSermons() {
        const data = await this.request('/api/Sermons');
        return this.normalizeArray(data, this.normalizeSermon);
    }

    async createSermon(formData) {
        return this.upload('/api/Sermons/create', formData, 'POST');
    }

    async updateSermon(sermonId, sermonData) {
        return this.request(`/api/Sermons/${sermonId}/update`, {
            method: 'PUT',
            body: JSON.stringify(sermonData),
        });
    }

    async deleteSermon(sermonId) {
        return this.request(`/api/Sermons/${sermonId}/delete`, {
            method: 'DELETE',
        });
    }

    async getSeries() {
        const data = await this.request('/api/Series/series');
        return Array.isArray(data) ? data : [];
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

    async getImages() {
        const data = await this.request('/api/Images/get-all');
        return this.normalizeArray(data, this.normalizeImage);
    }

    async uploadImage(formData) {
        return this.upload('/api/Images/upload', formData, 'POST');
    }

    async deleteImage(imageId) {
        return this.request(`/api/Images/${imageId}/delete`, {
            method: 'DELETE',
        });
    }

    async getRequisitions() {
        const data = await this.request('/api/Requisitions/requisition');
        return this.normalizeArray(data, this.normalizeRequisition);
    }

    async createRequisition(requisitionData) {
        return this.request('/create-requisition', {
            method: 'POST',
            body: JSON.stringify(requisitionData),
        });
    }

    async updateRequisition(id, requisitionData) {
        return this.request(`/api/Requisitions/${id}/requisition`, {
            method: 'PUT',
            body: JSON.stringify(requisitionData),
        });
    }

    async approveRequisition(id) {
        return this.request(`/api/Requisitions/${id}/approve`, {
            method: 'PATCH',
        });
    }

    async getGivings() {
        return this.request('/api/Givings');
    }

    async deleteGiving(givingId) {
        return this.request(`/api/Givings/${givingId}/delete-giving`, {
            method: 'DELETE',
        });
    }

    async getBioData() {
        const data = await this.request('/api/BioData/all');
        return this.normalizeArray(data, this.normalizeBioData);
    }

    async getBioDataById(id) {
        const data = await this.request(`/api/BioData/${id}`);
        return this.normalizeBioData(data);
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

    async getRoles() {
        return this.request('/api/Roles/get-all');
    }

    async assignRole(userEmail, roleName) {
        return this.request('/api/Roles/assign-role', {
            method: 'POST',
            body: JSON.stringify({ userEmail, roleName }),
        });
    }
}

const apiClient = new ApiClient();

export default apiClient;
