import axios from "axios";

const API_BASE_URL = "http://localhost:8000/archives";

// 🔹 Créer une archive
export const createArchive = async (archive) => {
  return await axios.post(`${API_BASE_URL}/`, archive, {
    headers: { "Content-Type": "application/json" }
  });
};

// 🔹 Obtenir toutes les archives
export const getAllArchives = async () => {
  return await axios.get(`${API_BASE_URL}/`);
};

// 🔹 Obtenir une archive par ID
export const getArchiveById = async (id) => {
  return await axios.get(`${API_BASE_URL}/${id}`);
};

// 🔹 Supprimer une archive
export const deleteArchive = async (id) => {
  return await axios.delete(`${API_BASE_URL}/${id}`);
};

// 🔹 Obtenir les archives paginées
export const getPaginatedArchives = async (params = {}) => {
  return await axios.get(`${API_BASE_URL}/paginated`, { params });
};
