import axios from "axios";

const API_BASE_URL = "http://localhost:8000/users"; 

export const signup = async (formData) => {
  return await axios.post(`${API_BASE_URL}/register/`, formData);
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
export const getUserbyId = async (userId) => {
  return await axios.get(`${API_BASE_URL}/${userId}`);
};

export const deleteUser = async (userId) => {
  return await axios.delete(`${API_BASE_URL}/${userId}`);
};

export const getUsersPaginated = async (page = 1, limit = 7, nom = "", matricule_vehicule = "") => {
  return await axios.get(`${API_BASE_URL}/paginated`, {
    params: {
      page,
      limit,
      nom: nom || undefined,
      matricule_vehicule: matricule_vehicule || undefined
    }
  });
};

