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

// Signup functions
export const registerPatient = async (name: string, email: string, password: string) => {
  return await api.post('/auth/register/patient', { name, email, password });
};

export const registerDoctor = async (name: string, email: string, password: string) => {
  return await api.post('/auth/register/doctor', { name, email, password });
};

// Profile creation functions
interface PatientProfileData {
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions?: string[];
}

export const createPatientProfile = async (profileData: PatientProfileData) => {
  return await api.post('/patients/create', profileData);
};

export const getPatientProfile = async () => {
  return await api.get('/patients/me');
};

interface DoctorProfileData {
  fullName: string;
  specialization: string;
  degrees: string;
  phone: string;
  hospitalName: string;
  experienceYears: number;
  availableSlots: string[];
}

export const createDoctorProfile = async (profileData: DoctorProfileData) => {
  return await api.post('/doctors/create', profileData);
};
