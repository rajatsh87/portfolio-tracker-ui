import axios from 'axios';

// This acts just like a WebClient or RestTemplate configuration in Spring
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // Your future Spring Boot URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;