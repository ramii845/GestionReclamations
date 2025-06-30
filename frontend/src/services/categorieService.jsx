// src/services/categorieService.jsx
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/categories";

export const createCategorie = async (categorie) => {
  return await axios.post(`${API_BASE_URL}/`, categorie);
};

export const getAllCategories = async () => {
  return await axios.get(`${API_BASE_URL}/`);
};

export const getCategorieById = async (id) => {
  return await axios.get(`${API_BASE_URL}/${id}`);
};

export const updateCategorie = async (id, updatedData) => {
  return await axios.put(`${API_BASE_URL}/${id}`, updatedData);
};

export const deleteCategorie = async (id) => {
  return await axios.delete(`${API_BASE_URL}/${id}`);
};
