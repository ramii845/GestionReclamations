import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";
import Navbar from "../Navbar/Navbar";
import { markAllNotificationsAsRead,getAllNotifications } from "../../services/notificationService";

const AdminPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

 useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await getAllNotifications();
      const unreadNotifications = res.data.filter(n => !n.is_read);
      setNotifications(res.data);

      if (unreadNotifications.length > 0) {
        setShowAlert(true);
      }
    } catch (err) {
      console.error("Erreur de chargement des notifications");
    }
  };

  fetchNotifications();
}, []);

const closeAlert = async () => {
  setShowAlert(false);
  try {
    await markAllNotificationsAsRead();  
    
    const res = await getAllNotifications();
    setNotifications(res.data);
  } catch (err) {
    console.error("Erreur lors de la mise à jour des notifications", err);
  }
};
  return (
    <>
      <Navbar />
      
      {showAlert && notifications.length > 0 && (
        <div name="ct" className="admin-notifications alert-box">
          <h4 name="nt">Notifications récentes :</h4>
          <ul name="ut">
            {notifications.slice(0, 3).map((n) => (
              <li name="ui" key={n.id}>📢 {n.message}</li>
            ))}
          </ul>
          <button name="btn-notif" className="close-btn" onClick={closeAlert}>❌</button>
        </div>
      )}

      <div className="admin-wrapper">
        <div className="admin-container">
          <h1 className="admin-title">Espace Administrateur</h1>
          <p className="admin-subtitle">
            Accédez à tous les outils nécessaires à la gestion efficace de votre plateforme.
          </p>

          <div className="admin-buttons">
            <button onClick={() => navigate("/admin/reclamations")}>
              Traitement des réclamations
            </button>
            <button onClick={() => navigate("/admin/services")}>
              Gérer les services
            </button>
            <button onClick={() => navigate("/admin/utilisateurs")}>
              Gérer les utilisateurs
            </button>
            <button onClick={() => navigate("/admin/avis")}>
              Consulter les avis
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
