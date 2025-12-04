import axios from 'axios';

// Usa a variável de ambiente se existir, senão usa localhost para desenvolvimento
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;