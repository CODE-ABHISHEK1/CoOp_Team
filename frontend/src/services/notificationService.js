import api from "./api";

export default {
  getAll: () => api.get("/notifications").then((r) => r.data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data),
  delete: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),
};
