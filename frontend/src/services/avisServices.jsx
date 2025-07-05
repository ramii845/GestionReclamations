import axios from "axios";

const API_BASE_URL = "http://localhost:8000/avis";

export const createAvis = async (avis) => {
  return await axios.post(`${API_BASE_URL}/`, avis);
};

export const getAllAvis = async () => {
  return await axios.get(`${API_BASE_URL}/`);
};

export const getAvisByReclamation = async (reclamationId) => {
  return await axios.get(`${API_BASE_URL}/reclamation/${reclamationId}`);
};

export const deleteAvis = async (avisId) => {
  return await axios.delete(`${API_BASE_URL}/${avisId}`);
};

export const getPaginatedAvis = async (page = 1, limit = 7) => {
  return await axios.get(`${API_BASE_URL}/paginated?page=${page}&limit=${limit}`);
};
