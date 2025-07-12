import React, { useEffect, useState } from "react";
import { getReclamationsByUser, updateReclamation } from "../../services/reclamationService";
import { createAvis } from "../../services/avisServices";
import Navbar from "../Navbar/Navbar";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./ConsultRec.css";
import AvisPopup from "./AvisPopup";

function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "iit2024G4");
  data.append("cloud_name", "ditzf19gl");

  const res = await fetch("https://api.cloudinary.com/v1_1/ditzf19gl/image/upload", {
    method: "POST",
    body: data,
  });

  const result = await res.json();
  if (!result.secure_url) throw new Error("Échec de l’upload Cloudinary");
  return result.secure_url;
};

const ConsultRec = () => {
  const [lastReclamation, setLastReclamation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showAvisPopup, setShowAvisPopup] = useState(false);
  const [reponseUtilite, setReponseUtilite] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("CC_Token");
  const decoded = token ? decodeJWT(token) : null;
  const user_id = decoded?.user_id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getReclamationsByUser(user_id);
        if (res.data) {
          setLastReclamation(res.data);
          if (res.data.statut === "Terminée") {
            setShowAvisPopup(true);
          }
        } else {
          setLastReclamation(null);
        }
      } catch (err) {
        console.error("Erreur récupération réclamations :", err);
        setLastReclamation(null);
      } finally {
        setLoading(false);
      }
    };

    if (user_id) fetchData();
  }, [user_id]);

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    const reclamationId = lastReclamation?.id;
    if (!reclamationId) return toast.error("Aucune réclamation trouvée.");

    if (reponseUtilite === null)
      return toast.error("Veuillez choisir Oui ou Non.");

    try {
      setUploading(true);
      let imageUrl = null;

      if (image) {
        imageUrl = await uploadToCloudinary(image);
      }

      const updatedData = {
        ...lastReclamation,
        retour_admin: reponseUtilite ? "confirmé" : "non confirmé",
      };

      if (imageUrl) {
        updatedData.image_vehicule = [
          ...(lastReclamation.image_vehicule || []),
          imageUrl,
        ];
      }

      await updateReclamation(reclamationId, updatedData);
      toast.success("Votre retour a bien été pris en compte. Merci pour votre réponse.");
      setImage(null);
      setReponseUtilite(null);
      setTimeout(() => {
        navigate("/logout");
      }, 2200);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setUploading(false);
    }
  };

  const handleAvisSubmit = async ({ note, commentaire }) => {
    try {
      const avis = {
        user_id,
        reclamation_id: lastReclamation.id,
        nbetoiles: note,
        commentaire,
      };
      await createAvis(avis);
      toast.success("Merci ! Votre avis a été envoyé avec succès");
      setShowAvisPopup(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erreur lors de l’ajout de l’avis");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="consult-rec-container">
        <h2>Ma Réclamation</h2>

        {loading ? (
          <p>Chargement...</p>
        ) : !lastReclamation ? (
          <p>Aucune réclamation trouvée.</p>
        ) : (
          <form onSubmit={handleSubmitAll}>
            <div className="rec-details">
              <div><strong>Date :</strong> {new Date(lastReclamation.date_creation).toLocaleDateString("fr-FR")}</div>
              <div><strong>Description :</strong> {lastReclamation.description_probleme || "-"}</div>
              <div><strong>Détails :</strong> {lastReclamation.autre || "-"}</div>
              <div><strong>Statut :</strong> {lastReclamation.statut || "-"}</div>

              {lastReclamation.statut === "En attente" ? null : (
                <>
                  <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <strong>Cette information vous a-t-elle été utile ?</strong>
                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "40px" }}>
                      <label>
                        <input
                          type="radio"
                          name="utilite"
                          value="oui"
                          checked={reponseUtilite === true}
                          onChange={() => setReponseUtilite(true)}
                        />
                        Oui
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="utilite"
                          value="non"
                          checked={reponseUtilite === false}
                          onChange={() => setReponseUtilite(false)}
                        />
                        Non
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: "20px", textAlign: "left" }}>
                    <strong>Ajouter une image :</strong>
                  </div>

                  <div className="add-image-section" style={{ marginTop: "15px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="image-upload-button"
                    style={{ marginTop: "10px" }}
                  >
                    {uploading ? "Envoyer" : "Envoyer"}
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>

      {!loading && lastReclamation?.statut === "Terminée" && showAvisPopup && (
        <AvisPopup
          onClose={() => setShowAvisPopup(false)}
          onSubmit={handleAvisSubmit}
        />
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ConsultRec;
