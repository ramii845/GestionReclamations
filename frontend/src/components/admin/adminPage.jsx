import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";
import Navbar from "../Navbar/Navbar";

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
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
