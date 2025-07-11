import axios from "axios";

const api = axios.create( {
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
} );

export const login = async (data) => {
  return await api.post("/user/login", data, { withCredentials: true })
    .then((response) => {
      console.log("Login successful: ", response.data);
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return response.data;
    })
    .catch((error) => {
      console.error("Login failed: ", error.response ? error.response.data : error.message);
      return error.response ? error.response.data : error.message;
    });
}

export const register = async (data) => {
  return await api.post("/user/register", data, { withCredentials: true })
    .then((response) => {
      // console.log("Registration successful: ", response.data);
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return response.data.data;
    })
    .catch((error) => {
      console.error("Registration failed: ", error.response ? error.response.data : error.message);
    });
}

export const logout = async () => {
  return await api.get("/user/logout", { withCredentials: true })
    .then((response) => {
      // console.log("Logout successful: ", response.data);
      localStorage.removeItem("user");
      return response.data;
    })
    .catch((error) => {
      console.error("Logout failed: ", error.response ? error.response.data : error.message);
    });
}

export const getAllTasks = async () => {
  // return await api.get("/tasks/getAllTasks", { withCredentials: true })
  return await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/getAllTasks`, { withCredentials: true })
    .then((response) => {
      // console.log("Tasks fetched successfully: ", response.data);
      return response.data.data.tasks;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to fetch tasks: ", error.response ? error.response.data : error.message);
    });
}

export const getTaskById = async (userId) => {
  return await api.get(`/user/getTaskById/${userId}`, { withCredentials: true })
    .then((response) => {
      // console.log("Task fetched successfully: ", response.data);
      return response.data.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to fetch task: ", error.response ? error.response.data : error.message);
    });
}

export const getAllTrainers = async () => {
  return await api.get("/user/getAllTrainers", { withCredentials: true })
    .then((response) => {
      // console.log("Trainers fetched successfully: ", response.data);
      return response.data.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to fetch trainers: ", error.response ? error.response.data : error.message);
    });
}

export const createTask = async (data) => {
  console.log("Creating task with data: ", data);
  return await api.post("/tasks/createTask", data, { withCredentials: true })
    .then((response) => {
      console.log("Task created successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to create task: ", error.response ? error.response.data : error.message);
      return error.response ? error.response.data : error.message;
    });
}

export const createSession = async (data) => {
  return await api.post("/session/createSession", data, { withCredentials: true })
    .then((response) => {
      console.log("Session created successfully: ", response);
      return response.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to create session: ", error.response ? error.response.data : error.message);
    });
}

export const getAllSessions = async () => {
  return await api.get("/session/getAllSessions", { withCredentials: true })
    .then((response) => {
      // console.log("Sessions fetched successfully: ", response.data);
      return response.data.data.sessions;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to fetch sessions: ", error.response ? error.response.data : error.message);
    });
}

export const updateSessionById = async (sessionId, data) => {
  return await api.post(`/session/updateSession/${sessionId}`, data, { withCredentials: true })
    .then((response) => {
      // console.log("Session updated successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to update session: ", error.response ? error.response.data : error.message);
    });
}

export const getSessionById = async (taskId) => {
  return await api.get(`/session/getSessionById/${taskId}`, { withCredentials: true })
    .then((response) => {
      // console.log("Session fetched successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to fetch session: ", error.response ? error.response.data : error.message);
    });
}

export const updateTask = async (tasksId, data) => {
  return await api.post(`/tasks/updateTask/${tasksId}`, data, { withCredentials: true })
    .then((response) => {
      // console.log("Task updated successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to update task: ", error.response ? error.response.data : error.message);
    });
}

export const deleteTask = async (taskId) => {
  return await api.delete(`/tasks/deleteTask/${taskId}`, { withCredentials: true })
    .then((response) => {
      // console.log("Task deleted successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to delete task: ", error.response ? error.response.data : error.message);
    });
}

export const deleteTaskGroup = async (repeatGroupId) => {
  return await api.delete(`/tasks/deleteTaskGroup/${repeatGroupId}`, { withCredentials: true })
    .then((response) => {
      // console.log("Task group deleted successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to delete task group: ", error.response ? error.response.data : error.message);
    });
}

export const sendEmail = async (task) => {
  return await api.post("/tasks/sendEmail", {task}, { withCredentials: true })
    .then((response) => {
      // console.log("Email sent successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to send email: ", error.response ? error.response.data : error.message);
    });
}

export const sendEmailForPasswordReset = async (email) => {
  return await api.post("/user/reset-password-request", { email }, { withCredentials: true })
    .then((response) => {
      // console.log("Password reset email sent successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Failed to send password reset email: ", error.response ? error.response.data : error.message);
    });
}

export const resetPassword = async (token, newPassword) => {
  return await api.post("/user/reset-password", { token, newPassword }, { withCredentials: true })
    .then((response) => {
      // console.log("Password reset successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Failed to reset password: ", error.response ? error.response.data : error.message);
    });
}

export const addBatch = async (data) => {
  return await api.post("/batch/addBatch", data, { withCredentials: true })
    .then((response) => {
      // console.log("Batch added successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Failed to add batch: ", error.response ? error.response.data : error.message);
      return error.response ? error.response.data : error.message;
    });
}

export const deleteBatch = async (batchCode) => {
  return await api.delete(`/batch/deleteBatch/${batchCode}`, { withCredentials: true })
    .then((response) => {
      // console.log("Batch deleted successfully: ", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Failed to delete batch: ", error.response ? error.response.data : error.message);
      return error.response ? error.response.data : error.message;
    });
}

export const getAllBatches = async () => {
  return await api.get("/batch/getAllBatches", { withCredentials: true })
    .then((response) => {
      // console.log("Batches fetched successfully: ", response);
      return response.data;
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = "/login";
        localStorage.clear();
        return;
      }
      console.error("Failed to fetch batches: ", error.response ? error.response.data : error.message);
    });
}
