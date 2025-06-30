import axios from "axios";

const API_BASE_URL = "http://localhost:8000/users"; 

export const signup = async (user) => {
  return await axios.post(`${API_BASE_URL}/register/`, user); 
};

export const signin = async (user) => {
  return await axios.post(`${API_BASE_URL}/login/`, user);
};

export const logout = async () => {
 
  return await axios.post(`${API_BASE_URL}/logout/`);
};
export const resetPassword = async (data) => {
  return await axios.post(`${API_BASE_URL}/reset-password/`, data);
};
export const updateUser = async (userId, updatedUserData) => {
  return await axios.put(`${API_BASE_URL}/${userId}`, updatedUserData);
};
