import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";
import Navbar from "../Navbar/Navbar";
import { markAllNotificationsAsRead,getAllNotifications,deleteUnreadNotifications } from "../../services/notificationService"; 

const AdminPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await getAllNotifications();
      const allNotifications = res.data || [];

      setNotifications(allNotifications);
      const unread = allNotifications.some(n => !n.is_read);
      setShowAlert(unread);

      // ✅ Supprimer les notifications non lues du backend (en base)
      if (unread) {
        await deleteUnreadNotifications();
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
    await deleteUnreadNotifications();  // ✅ Supprime aussi
    const res = await getAllNotifications();
    setNotifications(res.data);
  } catch (err) {
    console.error("Erreur lors de la suppression des notifications", err);
  }
};

  return (
    <div>
       <Navbar />
      {showAlert && (
        <div name="ct" className="admin-notifications alert-box">
          <h4 name="nt">Notifications récentes :</h4>
          <ul name="ut">
            {notifications
              .filter(n => !n.is_read)
              .map(n => (
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
              Gérer les clients
            </button>
            <button onClick={() => navigate("/admin/avis")}>
              Consulter les avis
            </button>
          </div>
        </div>
      </div>
    </div> 
  );
};

export default AdminPage;
