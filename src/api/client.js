import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export const roadmapApi = {
  getRoadmap: () => api.get('/roadmaps/default'),
  saveRoadmap: (payload) => api.put('/roadmaps/default', payload),
  resetRoadmap: () => api.post('/roadmaps/default/reset'),
  uploadImage: (nodeId, formData) =>
    api.post(`/roadmaps/default/nodes/${nodeId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteImage: (nodeId, imageName) =>
    api.delete(`/roadmaps/default/nodes/${nodeId}/images/${encodeURIComponent(imageName)}`)
};

export default api;
