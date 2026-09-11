import api from "./api";

export default {
  getByProject: (projectId) =>
    api.get(`/tasks/project/${projectId}`).then((r) => r.data),
  create: (data) => api.post("/tasks", data).then((r) => r.data),
  update: (id, data) => api.put(`/tasks/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
};
