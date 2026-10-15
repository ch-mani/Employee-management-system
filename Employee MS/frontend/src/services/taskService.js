import api from "./api";

export const taskService = {
  submitTasks: async (completedTasks, totalTasks) => {
    const response = await api.post("/tasks/submit", {
      completedTasks,
      totalTasks,
    });
    return response.data;
  },

  getTodaySubmission: async () => {
    const response = await api.get("/tasks/today");
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get("/tasks/history");
    return response.data;
  },
};

export default taskService;
