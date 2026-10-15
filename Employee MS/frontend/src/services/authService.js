import api from "./api";

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getRoleRequests: async () => {
    const response = await api.get("/auth/role-requests");
    return response.data;
  },

  approveRoleRequest: async (userId) => {
    const response = await api.post(`/auth/role-requests/${userId}/approve`);
    return response.data;
  },

  rejectRoleRequest: async (userId) => {
    const response = await api.post(`/auth/role-requests/${userId}/reject`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/employees/me/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
