import api from '../api/api';

export const loginPatient = async (email: string, password: string) => {
  return await api.post('/auth/login/patient', { email, password });
};

export const loginDoctor = async (email: string, password: string) => {
  return await api.post('/auth/login/doctor', { email, password });
};

export const loginAdmin = async (email: string, password: string) => {
  return await api.post('/auth/login/admin', { email, password });
};

export const getCurrentUser = async () => {
  return await api.get('/auth/me');
};
