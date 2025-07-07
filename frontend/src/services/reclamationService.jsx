import axios from "axios";

const API_BASE_URL = "http://localhost:8000/reclamations";

// Créer une réclamation (envoi JSON simple)
export const createReclamation = async (reclamation) => {
  return await axios.post(`${API_BASE_URL}/`, reclamation, {
    headers: {
      "Content-Type": "application/json"
    }
  });
};

// Obtenir une réclamation par ID
export const getReclamationById = async (id) => {
  return await axios.get(`${API_BASE_URL}/${id}`);
};

// Obtenir toutes les réclamations d’un utilisateur

// Mettre à jour une réclamation
export const updateReclamation = async (id, reclamation) => {
  return await axios.put(`${API_BASE_URL}/${id}`, reclamation, {
    headers: {
      "Content-Type": "application/json"
    }
  });
};

// Supprimer une réclamation
export const deleteReclamation = async (id) => {
  return await axios.delete(`${API_BASE_URL}/${id}`);
};

// Obtenir toutes les réclamations
export const getAllReclamations = async () => {
  return await axios.get(`${API_BASE_URL}/`);
};

// Obtenir les réclamations paginées
export const getPaginatedReclamations = async (page = 1, limit = 7) => {
  return await axios.get(`${API_BASE_URL}/paginated`, {
    params: { page, limit }
  });
};

export const getReclamationsByUser = async (user_id) => {
  return await axios.get(`${API_BASE_URL}/user/${user_id}`);
};

export const addImagesToReclamation = async (reclamation_id, data) => {
  return await axios.put(`${API_BASE_URL}/add-images/${reclamation_id}`, data, {
    headers: { "Content-Type": "application/json" }
  });
};