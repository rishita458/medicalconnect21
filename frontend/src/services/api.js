import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to handle auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getDoctors = () => api.get('/users', { params: { role: 'doctor' } });
export const createAppointment = (data) => api.post('/appointments', data);
export const getAppointments = () => api.get('/appointments');
export const approveAppointment = (id) => api.patch(`/appointments/${id}`, { action: 'approve' });
export const completeAppointment = (id) => api.patch(`/appointments/${id}`, { action: 'complete' });
export const getPatientPrescriptions = (patientId) => api.get(`/prescriptions/${patientId}`);
export const getPrescriptions = () => api.get('/prescriptions');
export const createPrescription = (data) => api.post('/prescriptions', data);
export const getPharmacyPrescriptions = () => api.get('/pharmacy/prescriptions');
export const updatePrescriptionStatus = (id, status) => api.patch(`/pharmacy/prescriptions/${id}/status`, { status });
export const getMedicalRecords = (patientId) => api.get(`/records/${patientId}`);
export const createMedicalRecord = (patientId, data) => api.post(`/records/${patientId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const setToken = (token, role, user) => {
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    if (user) {
      localStorage.setItem('userId', user.id || user._id || '');
      localStorage.setItem('userName', user.name || '');
    }
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  }
};

export default api;
