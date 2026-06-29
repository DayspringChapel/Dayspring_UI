const DEFAULT_BACKEND_API_URL = 'https://dayspring-backend-4ar8.onrender.com';
const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_API_URL || DEFAULT_BACKEND_API_URL).replace(/\/$/, '');
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.apiVersion = API_VERSION;
        this.maxRetries = 3;
        this.inFlightGetRequests = new Map();
    }

    normalizeEndpoint(endpoint) {
        if (!endpoint || typeof endpoint !== 'string') {
            throw new Error('Missing or invalid API endpoint');
        }

        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        // Swap the hardcoded version segment for whatever NEXT_PUBLIC_API_VERSION is set to
        return path.replace(/^\/api\/v\d+\//, `/api/${this.apiVersion}/`);
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

    forceHttps(url) {
        if (!url || typeof url !== 'string') return url;
        return url.replace(/^http:\/\//i, 'https://');
    }

    normalizeImage(image) {
        if (!image) return null;
        if (typeof image === 'string') {
            const url = this.forceHttps(image);
            return { id: url, url, imageUrlLink: url };
        }

        const url = this.forceHttps(image.imageUrlLink || image.ImageUrlLink || image.url || image.Url || null);

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
        const eventImage = this.forceHttps(event.eventImage || event.EventImage || event.eventImageUrl || event.EventImageUrl || null);

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

        const imageUrl = this.forceHttps(book.imageUrl || book.ImageUrl || book.bookImage || book.BookImage || null);

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

        const albumImage = this.forceHttps(album.albumImageUrlLink || album.AlbumImageUrlLink || null);
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

        const imageUrl = this.forceHttps(sermon.imageUrl || sermon.ImageUrl || sermon.imageLink || sermon.ImageLink || sermon.image || sermon.Image || null);
        const audioLink = this.forceHttps(sermon.audioFile || sermon.AudioFile || sermon.audioLink || sermon.AudioLink || sermon.link || null);

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

        const appointmentDate = appointment.appointmentDate || appointment.AppointmentDate || appointment.dateOfAppointment || appointment.DateOfAppointment || null;
        const appointmentTime = appointment.appointmentTime || appointment.AppointmentTime || (
            appointmentDate && appointmentDate.includes('T') ? appointmentDate.split('T')[1]?.slice(0, 5) : null
        );

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
            dateOfAppointment: appointmentDate,
            appointmentDate,
            appointmentTime,
            attendedToBy: appointment.attendedToBy || appointment.AttendedToBy || null,
            attendingPersonnelId: appointment.attendingPersonnelId || appointment.AttendingPersonnelId || appointment.attendedToBy || appointment.AttendedToBy || null,
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
        const nextOfKinPhoneNumber = member.nextOfKinPhonenumber || member.NextOfKinPhonenumber;

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
            alternativePhoneNumberObject: altPhoneNumber || null,
            dateOfBirth: member.dateOfBirth || member.DateOfBirth || '',
            address: formatAddress(address),
            addressObject: address || null,
            occupation: member.occupation || member.Occupation || '',
            apellation: member.apellation ?? member.Apellation ?? 0,
            maritalStatus: member.maritalStatus ?? member.MaritalStatus ?? 0,
            gender: member.gender ?? member.Gender ?? 1,
            fullNameOfNextOfKin: member.fUllNameOfNextOfKin || member.FUllNameOfNextOfKin || '',
            nextOfKinPhoneNumber: formatPhone(nextOfKinPhoneNumber),
            nextOfKinPhoneNumberObject: nextOfKinPhoneNumber || null,
            role: member.role || member.Role || 'Member',
        };
    }

    normalizeUser(user) {
        if (!user) return null;

        return {
            ...user,
            id: user.id || user.Id,
            userName: user.userName || user.UserName || '',
            email: user.email || user.Email || '',
            role: user.role || user.Role || '',
        };
    }

    normalizeMember(member) {
        if (!member) return null;

        return {
            ...member,
            id: member.memberId || member.MemberId || member.id || member.Id,
            memberId: member.memberId || member.MemberId || member.id || member.Id,
            userId: member.userId || member.UserId,
            smallGroupId: member.smallGroupId || member.SmallGroupId || null,
            unitId: member.unitId || member.UnitId || null,
        };
    }

    normalizeUnit(unit) {
        if (!unit) return null;

        return {
            ...unit,
            id: unit.id || unit.Id,
            unitName: unit.unitName || unit.UnitName || '',
            description: unit.description || unit.Description || '',
            unitHeadId: unit.unitHeadId || unit.UnitHeadId || '',
            unitHeadPhoneNumber: unit.unitHeadPhoneNumber || unit.UnitHeadPhoneNumber || null,
            isContentUnit: unit.isContentUnit ?? unit.IsContentUnit ?? false,
        };
    }

    normalizeSmallGroup(group) {
        if (!group) return null;

        return {
            ...group,
            id: group.id || group.Id,
            smallGroupName: group.smallGroupName || group.SmallGroupName || '',
            description: group.description || group.Description || '',
            smallGroupHeadMemberId: group.smallGroupHeadMemberId || group.SmallGroupHeadMemberId || '',
            smallGroupHeadPhoneNumber: group.smallGroupHeadPhoneNumber || group.SmallGroupHeadPhoneNumber || null,
        };
    }

    normalizeChurchOfficial(official) {
        if (!official) return null;

        const userId = official.userId || official.UserId;
        const pastorId = official.pastorId || official.PastorId || null;
        const ministerId = official.ministerId || official.MinisterId || null;
        const firstName = official.firstName || official.FirstName || '';
        const lastName = official.lastName || official.LastName || '';
        const officialType = pastorId ? 'Pastor' : 'Minister';

        return {
            ...official,
            id: userId,
            userId,
            pastorId,
            ministerId,
            firstName,
            lastName,
            name: [firstName, lastName].filter(Boolean).join(' ').trim() || userId,
            officialType,
        };
    }

    normalizeChurchOfficials(data) {
        const officials = this.normalizeArray(data, this.normalizeChurchOfficial);
        const uniqueOfficials = new Map();

        officials.forEach((official) => {
            if (!official.userId || uniqueOfficials.has(official.userId)) return;
            uniqueOfficials.set(official.userId, official);
        });

        return Array.from(uniqueOfficials.values()).sort((a, b) => {
            if (a.officialType !== b.officialType) {
                return a.officialType.localeCompare(b.officialType);
            }

            return a.name.localeCompare(b.name);
        });
    }

    normalizeArray(data, normalizer) {
        return Array.isArray(data) ? data.map((item) => normalizer.call(this, item)).filter(Boolean) : [];
    }

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const method = options.method || 'GET';
        const requestKey = method === 'GET' ? `${method}:${endpoint}` : null;
        const normalizedEndpoint = this.normalizeEndpoint(endpoint);

        const execute = async () => {
            const headers = {
                ...(token && { Authorization: `Bearer ${token}` }),
            };

            if (options.body !== undefined) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await this.fetchWith429Retry(`${this.baseUrl}${normalizedEndpoint}`, {
                method,
                headers,
                ...(options.body !== undefined ? { body: options.body } : {}),
            });

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
        const normalizedEndpoint = this.normalizeEndpoint(endpoint);
        const response = await this.fetchWith429Retry(`${this.baseUrl}${normalizedEndpoint}`, {
            method,
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        });

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
    }

    async login(userNameOrEmail, password) {
        return this.request('/api/v1/Users/login', {
            method: 'POST',
            body: JSON.stringify({ userNameOrEmail, password }),
        });
    }

    async logout() {
        this.removeToken();
    }

    async getAlbums() {
        const data = await this.request('/api/v1/Albums');
        return this.normalizeArray(data, this.normalizeAlbum);
    }

    async createAlbum(formData) {
        return this.upload('/api/v1/Albums/create-album', formData, 'POST');
    }

    async deleteAlbum(albumId) {
        return this.request(`/api/v1/Albums/${albumId}/delete`, {
            method: 'DELETE',
        });
    }

    async getAppointments() {
        const data = await this.request('/api/v1/Appointments/get-all');
        return this.normalizeArray(data, this.normalizeAppointment);
    }

    async scheduleAppointment(appointmentData) {
        return this.request('/api/v1/Appointments/schedule-appointment', {
            method: 'POST',
            body: JSON.stringify(appointmentData),
        });
    }

    async confirmAppointment(formData) {
        return this.upload('/api/v1/Appointments/confirm-appointment', formData, 'POST');
    }

    async cancelAppointment(appointmentId, reason) {
        return this.request('/api/v1/Appointments/cancel', {
            method: 'PATCH',
            body: JSON.stringify({
                appointmentId,
                reason,
            }),
        });
    }

    async updateAppointmentVenue(appointmentId, appointmentVenue) {
        return this.request(`/api/v1/Appointments/${appointmentId}/venue`, {
            method: 'PATCH',
            body: JSON.stringify({ appointmentVenue }),
        });
    }

    async getBooks() {
        const data = await this.request('/api/v1/Books');
        return this.normalizeArray(data, this.normalizeBook);
    }

    async createBook(formData) {
        return this.upload('/api/v1/Books/create', formData, 'POST');
    }

    async updateBook(bookId, formData) {
        return this.upload(`/api/v1/Books/${bookId}/update`, formData, 'PATCH');
    }

    async deleteBook(bookId) {
        return this.request(`/api/v1/Books/${bookId}/delete`, {
            method: 'DELETE',
        });
    }

    async getEvents() {
        const data = await this.request('/api/v1/Events');
        return this.normalizeArray(data, this.normalizeEvent);
    }

    async createEvent(formData) {
        return this.upload('/api/v1/Events/add-event', formData, 'POST');
    }

    async updateEvent(eventId, formData) {
        if (formData instanceof FormData) {
            return this.upload(`/api/v1/Events/${eventId}/update`, formData, 'PATCH');
        }

        return this.request(`/api/v1/Events/${eventId}/update`, {
            method: 'PATCH',
            body: JSON.stringify(formData),
        });
    }

    async deleteEvent(eventId) {
        return this.request(`/api/v1/Events/${eventId}/delete`, {
            method: 'DELETE',
        });
    }

    async getSermons() {
        const data = await this.request('/api/v1/Sermons');
        return this.normalizeArray(data, this.normalizeSermon);
    }

    async createSermon(formData) {
        return this.upload('/api/v1/Sermons/create', formData, 'POST');
    }

    async updateSermon(sermonId, sermonData) {
        return this.request(`/api/v1/Sermons/${sermonId}/update`, {
            method: 'PUT',
            body: JSON.stringify(sermonData),
        });
    }

    async deleteSermon(sermonId) {
        return this.request(`/api/v1/Sermons/${sermonId}/delete`, {
            method: 'DELETE',
        });
    }

    async getSeries() {
        const data = await this.request('/api/v1/Series/series');
        return Array.isArray(data) ? data : [];
    }

    async createSeries(seriesData) {
        return this.request('/api/v1/Series/create', {
            method: 'POST',
            body: JSON.stringify(seriesData),
        });
    }

    async updateSeries(id, seriesData) {
        return this.request(`/api/v1/Series/${id}/update`, {
            method: 'PUT',
            body: JSON.stringify(seriesData),
        });
    }

    async deleteSeries(id) {
        return this.request(`/api/v1/Series/${id}/delete`, {
            method: 'DELETE',
        });
    }

    async getImages() {
        const data = await this.request('/api/v1/Images/get-all');
        return this.normalizeArray(data, this.normalizeImage);
    }

    async uploadImage(formData) {
        return this.upload('/api/v1/Images/upload', formData, 'POST');
    }

    async deleteImage(imageId) {
        return this.request(`/api/v1/Images/${imageId}/delete`, {
            method: 'DELETE',
        });
    }

    async getRequisitions() {
        const data = await this.request('/api/v1/Requisitions/requisition');
        return this.normalizeArray(data, this.normalizeRequisition);
    }

    async createRequisition(requisitionData) {
        return this.request('/api/v1/Requisitions/create-requisition', {
            method: 'POST',
            body: JSON.stringify(requisitionData),
        });
    }

    async updateRequisition(id, requisitionData) {
        return this.request(`/api/v1/Requisitions/${id}/requisition`, {
            method: 'PUT',
            body: JSON.stringify(requisitionData),
        });
    }

    async approveRequisition(id) {
        return this.request(`/api/v1/Requisitions/${id}/approve`, {
            method: 'PATCH',
        });
    }

    normalizeGiving(giving) {
        if (!giving) return null;
        return {
            ...giving,
            id:               giving.id               || giving.Id,
            name:             giving.name             || giving.Name             || '',
            purposeOfGiving:  giving.purposeOfGiving  || giving.PurposeOfGiving  || '',
            accountNumber:    giving.accountNumber    || giving.AccountNumber    || '',
            bankName:         giving.bankName         || giving.BankName         || '',
            createdDate:      giving.createdDate      || giving.CreatedDate      || '',
        };
    }

    async getGivings() {
        const data = await this.request('/api/v1/Givings');
        return this.normalizeArray(data, this.normalizeGiving);
    }

    async createGiving(givingData) {
        return this.request('/api/v1/Givings/give', {
            method: 'POST',
            body: JSON.stringify(givingData),
        });
    }

    async deleteGiving(givingId) {
        return this.request(`/api/v1/Givings/${givingId}/delete-giving`, {
            method: 'DELETE',
        });
    }

    async getOccupations() {
        try {
            const data = await this.request('/api/v1/Occupation');
            const list = data?.data || data;
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    }

    async getBioData() {
        const data = await this.request('/api/v1/BioData/all');
        return this.normalizeArray(data, this.normalizeBioData);
    }

    async getMembers() {
        const data = await this.request('/api/v1/Member');
        return this.normalizeArray(data, this.normalizeMember);
    }

    async getUnits() {
        const data = await this.request('/api/v1/Units');
        return this.normalizeArray(data, this.normalizeUnit);
    }

    async createUnit(unitData) {
        return this.request('/api/v1/Units/create', {
            method: 'POST',
            body: JSON.stringify(unitData),
        });
    }

    async updateUnit(unitId, unitData) {
        return this.request(`/api/v1/Units/${unitId}`, {
            method: 'PUT',
            body: JSON.stringify(unitData),
        });
    }

    async deleteUnit(unitId) {
        return this.request(`/api/v1/Units/${unitId}`, {
            method: 'DELETE',
        });
    }

    async getSmallGroups() {
        const data = await this.request('/api/v1/SmallGroups/all');
        return this.normalizeArray(data, this.normalizeSmallGroup);
    }

    async createSmallGroup(groupData) {
        return this.request('/api/v1/SmallGroups/create', {
            method: 'POST',
            body: JSON.stringify(groupData),
        });
    }

    async updateSmallGroup(groupId, groupData) {
        return this.request(`/api/v1/SmallGroups/update/${groupId}`, {
            method: 'PUT',
            body: JSON.stringify(groupData),
        });
    }

    async assignSmallGroupLeader(groupId, leaderMemberId, phoneNumber) {
        return this.request(`/api/v1/SmallGroups/assign-leader/${leaderMemberId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                smallGroupId: groupId,
                leaderMemberId,
                phoneNumber,
            }),
        });
    }

    async deleteSmallGroup(groupId) {
        return this.request(`/api/v1/SmallGroups/${groupId}`, {
            method: 'DELETE',
        });
    }

    async getChurchOfficials() {
        const data = await this.request('/api/v1/ChurchsOfficial');
        return this.normalizeChurchOfficials(data);
    }

    async createChurchOfficial(payload) {
        return this.request('/api/v1/ChurchsOfficial/create', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async assignMemberGroups(memberId, { unitId, smallGroupId }) {
        return this.request(`/api/v1/Member/${memberId}/assign`, {
            method: 'PATCH',
            body: JSON.stringify({ unitId: unitId ?? null, smallGroupId: smallGroupId ?? null }),
        });
    }

    async getBioDataById(id) {
        const data = await this.request(`/api/v1/BioData/${id}`);
        return this.normalizeBioData(data);
    }

    async createBioData(bioData) {
        return this.request('/api/v1/BioData/create-biodata', {
            method: 'POST',
            body: JSON.stringify(bioData),
        });
    }

    async getUsers() {
        const data = await this.request('/api/v1/Users/get-all');
        return this.normalizeArray(data, this.normalizeUser);
    }

    async createMember(memberData) {
        return this.request('/api/v1/Member/create', {
            method: 'POST',
            body: JSON.stringify(memberData),
        });
    }

    async createMemberWithUser(data) {
        return this.request('/api/v1/Member/create-with-user', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateBioData(bioData) {
        return this.request('/api/v1/BioData/update-biodata', {
            method: 'PUT',
            body: JSON.stringify(bioData),
        });
    }

    async deleteBioData(id) {
        return this.request(`/api/v1/BioData/${id}/delete`, {
            method: 'DELETE',
        });
    }

    async getRoles() {
        return this.request('/api/v1/Roles/get-all');
    }

    async assignRole(userEmail, roleName) {
        return this.request('/api/v1/Roles/assign-role', {
            method: 'POST',
            body: JSON.stringify({ UserEmail: userEmail, RoleName: roleName }),
        });
    }

    // ── Auth ─────────────────────────────────────────────────────────────────

    async refreshToken(token, refreshToken) {
        return this.request('/api/v1/Users/refresh-token', {
            method: 'POST',
            body: JSON.stringify({ token, refreshToken }),
        });
    }

    async revokeToken(token) {
        return this.request('/api/v1/Users/revoke-token', {
            method: 'POST',
            body: JSON.stringify(token),
        });
    }

    // ── Media Content ─────────────────────────────────────────────────────────

    normalizeMediaContent(item) {
        if (!item) return null;
        return {
            ...item,
            id: item.id || item.Id,
            title: item.title || item.Title || '',
            description: item.description || item.Description || '',
            contentType: item.contentType ?? item.ContentType ?? 0,
            contentTypeName: item.contentTypeName || item.ContentTypeName || '',
            cloudinaryUrl: item.cloudinaryUrl || item.CloudinaryUrl || '',
            thumbnailUrl: item.thumbnailUrl || item.ThumbnailUrl || null,
            ownerId: item.ownerId || item.OwnerId || '',
            ownerName: item.ownerName || item.OwnerName || '',
            category: item.category || item.Category || '',
            tags: item.tags || item.Tags || '',
            workflowStatus: item.workflowStatus ?? item.WorkflowStatus ?? 0,
            workflowStatusName: item.workflowStatusName || item.WorkflowStatusName || '',
            createdBy: item.createdBy || item.CreatedBy || '',
            createdDate: item.createdDate || item.CreatedDate || '',
        };
    }

    async getMediaContents() {
        const data = await this.request('/api/v1/MediaContent');
        return this.normalizeArray(data, this.normalizeMediaContent);
    }

    async getMediaContentById(id) {
        const data = await this.request(`/api/v1/MediaContent/${id}`);
        return this.normalizeMediaContent(data);
    }

    async getMediaContentsByStatus(status) {
        const data = await this.request(`/api/v1/MediaContent/status/${status}`);
        return this.normalizeArray(data, this.normalizeMediaContent);
    }

    async getMyMediaContents(ownerId) {
        const data = await this.request(`/api/v1/MediaContent/owner/${ownerId}`);
        return this.normalizeArray(data, this.normalizeMediaContent);
    }

    async uploadMediaContent(formData) {
        return this.upload('/api/v1/MediaContent/upload', formData, 'POST');
    }

    async updateMediaContent(id, formData) {
        return this.upload(`/api/v1/MediaContent/${id}/update`, formData, 'PATCH');
    }

    async deleteMediaContent(id) {
        return this.request(`/api/v1/MediaContent/${id}/delete`, { method: 'DELETE' });
    }

    // ── Workflow ──────────────────────────────────────────────────────────────

    normalizeWorkflow(item) {
        if (!item) return null;
        return {
            ...item,
            id: item.id || item.Id,
            contentId: item.contentId || item.ContentId || '',
            contentTitle: item.contentTitle || item.ContentTitle || '',
            currentStatus: item.currentStatus ?? item.CurrentStatus ?? 0,
            currentStatusName: item.currentStatusName || item.CurrentStatusName || '',
            initiatedBy: item.initiatedBy || item.InitiatedBy || '',
            lastTransitionAt: item.lastTransitionAt || item.LastTransitionAt || '',
            history: Array.isArray(item.history || item.History)
                ? (item.history || item.History)
                : [],
        };
    }

    async getWorkflow(contentId) {
        const data = await this.request(`/api/v1/Workflow/${contentId}`);
        return this.normalizeWorkflow(data);
    }

    async getWorkflowHistory(contentId) {
        const data = await this.request(`/api/v1/Workflow/${contentId}/history`);
        return Array.isArray(data) ? data : [];
    }

    async submitForReview(contentId, comment) {
        return this.request('/api/v1/Workflow/submit', {
            method: 'POST',
            body: JSON.stringify({ contentId, comment }),
        });
    }

    async sendBackToDraft(contentId, comment) {
        return this.request('/api/v1/Workflow/send-back', {
            method: 'POST',
            body: JSON.stringify({ contentId, comment }),
        });
    }

    async forwardForApproval(contentId, comment) {
        return this.request('/api/v1/Workflow/forward-for-approval', {
            method: 'POST',
            body: JSON.stringify({ contentId, comment }),
        });
    }

    // ── Approvals ─────────────────────────────────────────────────────────────

    normalizeApproval(item) {
        if (!item) return null;
        return {
            ...item,
            id: item.id || item.Id,
            contentId: item.contentId || item.ContentId || '',
            contentTitle: item.contentTitle || item.ContentTitle || '',
            level: item.level ?? item.Level ?? 0,
            levelName: item.levelName || item.LevelName || '',
            approverName: item.approverName || item.ApproverName || '',
            status: item.status ?? item.Status ?? 0,
            statusName: item.statusName || item.StatusName || '',
            comment: item.comment || item.Comment || null,
            decidedAt: item.decidedAt || item.DecidedAt || null,
        };
    }

    async getAdminApprovalQueue() {
        const data = await this.request('/api/v1/Approvals/queue/admin');
        return this.normalizeArray(data, this.normalizeApproval);
    }

    async getSuperAdminApprovalQueue() {
        const data = await this.request('/api/v1/Approvals/queue/super-admin');
        return this.normalizeArray(data, this.normalizeApproval);
    }

    async getApprovalsByContent(contentId) {
        const data = await this.request(`/api/v1/Approvals/content/${contentId}`);
        return this.normalizeArray(data, this.normalizeApproval);
    }

    async approveContent(contentId, comment) {
        return this.request('/api/v1/Approvals/approve', {
            method: 'POST',
            body: JSON.stringify({ contentId, approved: true, comment }),
        });
    }

    async rejectContent(contentId, comment) {
        return this.request('/api/v1/Approvals/reject', {
            method: 'POST',
            body: JSON.stringify({ contentId, approved: false, comment }),
        });
    }

    async addReviewComment(contentId, body, parentCommentId = null) {
        return this.request('/api/v1/Approvals/comments', {
            method: 'POST',
            body: JSON.stringify({ contentId, body, parentCommentId }),
        });
    }

    async getReviewComments(contentId) {
        const data = await this.request(`/api/v1/Approvals/${contentId}/comments`);
        return Array.isArray(data) ? data : [];
    }

    // ── Publishing ────────────────────────────────────────────────────────────

    normalizeScheduledPost(item) {
        if (!item) return null;
        return {
            ...item,
            id: item.id || item.Id,
            contentId: item.contentId || item.ContentId || '',
            contentTitle: item.contentTitle || item.ContentTitle || '',
            platform: item.platform ?? item.Platform ?? 0,
            platformName: item.platformName || item.PlatformName || '',
            scheduledAt: item.scheduledAt || item.ScheduledAt || '',
            status: item.status ?? item.Status ?? 0,
            statusName: item.statusName || item.StatusName || '',
            scheduledByName: item.scheduledByName || item.ScheduledByName || '',
            caption: item.caption || item.Caption || null,
            retryCount: item.retryCount ?? item.RetryCount ?? 0,
            errorMessage: item.errorMessage || item.ErrorMessage || null,
        };
    }

    normalizePublishedPost(item) {
        if (!item) return null;
        return {
            ...item,
            id: item.id || item.Id,
            contentId: item.contentId || item.ContentId || '',
            contentTitle: item.contentTitle || item.ContentTitle || '',
            platform: item.platform ?? item.Platform ?? 0,
            platformName: item.platformName || item.PlatformName || '',
            platformPostUrl: item.platformPostUrl || item.PlatformPostUrl || null,
            publishedAt: item.publishedAt || item.PublishedAt || '',
            publishedByName: item.publishedByName || item.PublishedByName || '',
            status: item.status ?? item.Status ?? 0,
            errorMessage: item.errorMessage || item.ErrorMessage || null,
        };
    }

    async schedulePublish(contentId, platforms, scheduledAt, caption) {
        return this.request('/api/v1/Publishing/schedule', {
            method: 'POST',
            body: JSON.stringify({ contentId, platforms, scheduledAt, caption }),
        });
    }

    async getAllScheduledPosts() {
        const data = await this.request('/api/v1/Publishing/scheduled');
        return this.normalizeArray(data, this.normalizeScheduledPost);
    }

    async getScheduledPostsByContent(contentId) {
        const data = await this.request(`/api/v1/Publishing/scheduled/content/${contentId}`);
        return this.normalizeArray(data, this.normalizeScheduledPost);
    }

    async cancelScheduledPost(scheduledPostId) {
        return this.request(`/api/v1/Publishing/scheduled/${scheduledPostId}/cancel`, { method: 'DELETE' });
    }

    async publishNow(contentId, platforms, caption) {
        return this.request('/api/v1/Publishing/publish-now', {
            method: 'POST',
            body: JSON.stringify({ contentId, platforms, caption }),
        });
    }

    async getAllPublishedPosts() {
        const data = await this.request('/api/v1/Publishing/published');
        return this.normalizeArray(data, this.normalizePublishedPost);
    }

    async getPublishedPostsByContent(contentId) {
        const data = await this.request(`/api/v1/Publishing/published/content/${contentId}`);
        return this.normalizeArray(data, this.normalizePublishedPost);
    }

    async retryPublish(scheduledPostId) {
        return this.request('/api/v1/Publishing/retry', {
            method: 'POST',
            body: JSON.stringify({ scheduledPostId }),
        });
    }

    // ── Content Personnel ─────────────────────────────────────────────────────
    // Role values: 1 = Media, 2 = Graphics, 3 = SocialMedia

    normalizeContentPersonnel(item) {
        if (!item) return null;
        return {
            ...item,
            id: item.id || item.Id,
            contentId: item.contentId || item.ContentId || '',
            contentTitle: item.contentTitle || item.ContentTitle || '',
            userId: item.userId || item.UserId || '',
            userName: item.userName || item.UserName || '',
            fullName: item.fullName || item.FullName || '',
            role: item.role ?? item.Role ?? 0,
            roleName: item.roleName || item.RoleName || '',
            assignedBy: item.assignedBy || item.AssignedBy || '',
            assignedAt: item.assignedAt || item.AssignedAt || '',
        };
    }

    async assignContentPersonnel(contentId, userId, role) {
        return this.request('/api/v1/ContentPersonnel/assign', {
            method: 'POST',
            body: JSON.stringify({ contentId, userId, role }),
        });
    }

    async getContentPersonnel(contentId) {
        const data = await this.request(`/api/v1/ContentPersonnel/${contentId}`);
        return this.normalizeArray(data, this.normalizeContentPersonnel);
    }

    async getContentPersonnelByRole(contentId, role) {
        const data = await this.request(`/api/v1/ContentPersonnel/${contentId}/role/${role}`);
        return this.normalizeArray(data, this.normalizeContentPersonnel);
    }

    async getMyPersonnelAssignments() {
        const data = await this.request('/api/v1/ContentPersonnel/my-assignments');
        return this.normalizeArray(data, this.normalizeContentPersonnel);
    }

    async updateContentPersonnelRole(id, role) {
        return this.request(`/api/v1/ContentPersonnel/${id}/update`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        });
    }

    async removeContentPersonnel(id) {
        return this.request(`/api/v1/ContentPersonnel/${id}/remove`, {
            method: 'DELETE',
        });
    }
}

const apiClient = new ApiClient();

export default apiClient;
