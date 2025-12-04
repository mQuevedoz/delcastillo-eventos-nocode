import axios from "axios";
const base = import.meta.env.VITE_API_URL || "/api";

export const listProviders  = (q)        => axios.get(`${base}/providers`, { params: { q } });
export const getProvider    = (id)       => axios.get(`${base}/providers/${id}`);
export const createProvider = (data)     => axios.post(`${base}/providers`, data);
export const updateProvider = (id, data) => axios.put(`${base}/providers/${id}`, data);
export const deleteProvider = (id)       => axios.delete(`${base}/providers/${id}`);

