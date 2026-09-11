import api from "./api";

export default {
  getAll: () => api.get("/users").then((r) => r.data),
  getById: (id) => api.get(`/users/${id}`).then((r) => r.data),
};
