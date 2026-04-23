import axios from 'axios';

const API_URL = '/api';

export const departmentApi = {
  getAll: () => axios.get(`${API_URL}/departments`),
  create: (data: any) => axios.post(`${API_URL}/departments`, data),
  delete: (id: string) => axios.delete(`${API_URL}/departments/${id}`),
};

export const staffApi = {
  getAll: (departmentId: string) => axios.get(`${API_URL}/staff`, { params: { departmentId } }),
  create: (data: any) => axios.post(`${API_URL}/staff`, data),
  update: (id: string, data: any) => axios.put(`${API_URL}/staff/${id}`, data),
  delete: (id: string) => axios.delete(`${API_URL}/staff/${id}`),
};

export const subjectApi = {
  getAll: (departmentId: string) => axios.get(`${API_URL}/subjects`, { params: { departmentId } }),
  create: (data: any) => axios.post(`${API_URL}/subjects`, data),
  update: (id: string, data: any) => axios.put(`${API_URL}/subjects/${id}`, data),
  delete: (id: string) => axios.delete(`${API_URL}/subjects/${id}`),
};

export const classApi = {
  getAll: (departmentId: string) => axios.get(`${API_URL}/classes`, { params: { departmentId } }),
  create: (data: any) => axios.post(`${API_URL}/classes`, data),
  update: (id: string, data: any) => axios.put(`${API_URL}/classes/${id}`, data),
  delete: (id: string) => axios.delete(`${API_URL}/classes/${id}`),
};

export const rulesApi = {
  get: (departmentId: string) => axios.get(`${API_URL}/rules`, { params: { departmentId } }),
  update: (data: any) => axios.post(`${API_URL}/rules`, data),
};

export const timetableApi = {
  generate: (departmentId: string) => axios.post(`${API_URL}/generate-timetable`, { departmentId }),
  getAll: (departmentId: string) => axios.get(`${API_URL}/timetable`, { params: { departmentId } }),
  update: (id: string, data: any) => axios.put(`${API_URL}/timetable/${id}`, data),
};

export const seedApi = {
  seed: (departmentId: string) => axios.post(`${API_URL}/seed`, { departmentId }),
};
