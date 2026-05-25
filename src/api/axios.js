import axios from 'axios';
const baseURL = import.meta.env.VITE_BASEURL;

const api = axios.create({
    baseURL: baseURL,
});

export default api;