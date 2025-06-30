import axios from "axios";

const API_BASE_URL = "http://localhost:8000/reclamations";

// 🔹 Créer une réclamation avec fichier (image/PDF)
export const createReclamationWithFiles = async (formData) => {
  return await axios.post(`${API_BASE_URL}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 🔹 Obtenir une réclamation par ID
export const getReclamationById = async (id) => {
  return await axios.get(`${API_BASE_URL}/${id}`);
};

// 🔹 Obtenir toutes les réclamations d’un utilisateur
export const getReclamationsByUser = async (user_id) => {
  return await axios.get(`${API_BASE_URL}/user/${user_id}`);
};

// 🔹 Mettre à jour une réclamation
export const updateReclamation = async (id, reclamation) => {
  return await axios.put(`${API_BASE_URL}/${id}`, reclamation);
};

// 🔹 Supprimer une réclamation
export const deleteReclamation = async (id) => {
  return await axios.delete(`${API_BASE_URL}/${id}`);
};

// 🔹 Obtenir toutes les réclamations
export const getAllReclamations = async () => {
  return await axios.get(`${API_BASE_URL}/`);
};
