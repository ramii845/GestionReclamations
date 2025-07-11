// src/services/notificationService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/notifications";

export const getAllNotifications = async () => {
  return await axios.get(API_BASE_URL);
};

export const deleteNotification = async (id) => {
  return await axios.delete(`${API_BASE_URL}/${id}`);
};

export const markAllNotificationsAsRead = async () => {
  return await axios.put(`${API_BASE_URL}/mark-read`);
};

export const deleteUnreadNotifications = async () => {
  return await axios.delete(`${API_BASE_URL}/delete-unread`);
};


