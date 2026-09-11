import api from "./api";

export default {
  getAll: () => api.get("/projects").then((r) => r.data),
  getById: (id) => api.get(`/projects/${id}`).then((r) => r.data),
  create: (data) => api.post("/projects", data).then((r) => r.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
  addMember: (projectId, data) =>
    api.post(`/projects/${projectId}/members`, data).then((r) => r.data),
  removeMember: (projectId, userId) =>
    api.delete(`/projects/${projectId}/members/${userId}`).then((r) => r.data),
};
