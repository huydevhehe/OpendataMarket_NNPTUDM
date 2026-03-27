// lib/axios.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001', // đổi thành base URL backend của bạn
    withCredentials: true,
});

export default api;
