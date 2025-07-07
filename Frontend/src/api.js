/* eslint-disable no-unused-vars */
import axios from "axios";

const api = axios.create( {
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
} );

export const login = async (data) => {
  return await api.post("/user/login", data, { withCredentials: true })
    .then((response) => {
      // console.log("Login successful: ", response.data);
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return response.data.data;
    })
    .catch((error) => {
      console.error("Login failed: ", error.response ? error.response.data : error.message);
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
  return await api.get("/tasks/getAllTasks", { withCredentials: true })
    .then((response) => {
      // console.log("Tasks fetched successfully: ", response.data);
      return response.data.data.tasks;
    })
    .catch((error) => {
      console.error("Failed to fetch tasks: ", error.response ? error.response.data : error.message);
    });
}