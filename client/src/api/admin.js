import api from './axios.js';

export const getUsers = () => api.get('/admin/users');
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
