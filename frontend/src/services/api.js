
const BASE_URL = 'http://localhost:5000/api';

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

const request = async (url, method = 'GET', body = null) => {
    const options = {
        method,
        headers: getHeaders()
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`${BASE_URL}${url}`, options);

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return null;
    }

    return response.json();
}

const authService = {
    register: async (username, email, password) =>
        request('/auth/register', 'POST', { username, email, password }),

    login: async (email, password) =>
        request('/auth/login', 'POST', { email, password }),
};

const destinationsService = {
    getAll: () => request('/destinations'),
    getOne: (id) => request(`/destinations/${id}`),
    create: (data) => request('/destinations', 'POST', data),
    remove: (id) => request(`/destinations/${id}`, 'DELETE'),
};

const tripsService = {
    getAll: () => request('/trips'),
    getOne: (id) => request(`/trips/${id}`),
    create: (data) => request('/trips', 'POST', data),
    update: (id, data) => request(`/trips/${id}`, 'PUT', data),
    remove: (id) => request(`/trips/${id}`, 'DELETE'),
    getCost: (id) => request(`/trips/${id}/cost`),
    togglePublic: (id) => request(`/trips/${id}/toggle-public`, 'PATCH'),
    copyTrip: (id) => request(`/trips/${id}/copy`, 'POST'),
};

const activitiesService = {
    create: (tripId, data) => request(`/trips/${tripId}/activities`, 'POST', data),
    update: (id, data) => request(`/activities/${id}`, 'PUT', data),
    remove: (id) => request(`/activities/${id}`, 'DELETE'),
};

const favouritesService = {
    getAll: () => request('/favourites'),
    add: (destination_id) => request('/favourites', 'POST', { destination_id }),
    remove: (id) => request(`/favourites/${id}`, 'DELETE'),
};

const reviewsService = {
    getAll: (destination_id) => request(`/reviews/${destination_id}`),
    add: (destination_id, data) => request(`/reviews/${destination_id}`, 'POST', data),
    remove: (id) => request(`/reviews/${id}`, 'DELETE'),
};

const profileService = {
    getProfile: () => request('/profile'),
    updateUsername: (username) => request('/profile', 'PUT', { username }),
};

const recommendationsService = {
    getAll: () => request('/recommendations'),
};

export { authService, destinationsService, tripsService, activitiesService, favouritesService, reviewsService, profileService, recommendationsService };