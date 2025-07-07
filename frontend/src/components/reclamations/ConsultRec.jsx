import React, { useEffect, useState } from "react";
import { getReclamationsByUser, addImagesToReclamation } from "../../services/reclamationService";
import Navbar from "../Navbar/Navbar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./ConsultRec.css";

function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
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

  const token = localStorage.getItem("CC_Token");
  const decoded = token ? decodeJWT(token) : null;
  const user_id = decoded?.user_id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getReclamationsByUser(user_id);
        if (res.data.length > 0) {
          const sorted = res.data.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
          setLastReclamation(sorted[0]);
        }
      } catch (err) {
        console.error("Erreur récupération réclamations :", err);
      } finally {
        setLoading(false);
      }
    };

    if (user_id) fetchData();
  }, [user_id]);

  const navigate = useNavigate(); // 🔴 déclare ici, en haut du composant

const handleSubmit = async (e) => {
  e.preventDefault();
  const reclamationId = lastReclamation?.id;
  if (!reclamationId) return toast.error("Aucune réclamation à mettre à jour.");
  if (!image) return toast.error("Veuillez sélectionner une image.");

  try {
    setUploading(true);
    const imageUrl = await uploadToCloudinary(image);

    await addImagesToReclamation(reclamationId, {
      image_vehicule: [imageUrl],
      facturation: [],
    });

    toast.success("Image ajoutée avec succès !", {
      position: "top-right",
      autoClose: 3000,
      pauseOnHover: true,
      draggable: true,
    });

    setImage(null);
 // ✔️ adapte cette route
    

  } catch (error) {
    toast.error("Erreur lors de l’ajout.", { autoClose: 2000 });
  } finally {
    setUploading(false);
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
          <form onSubmit={handleSubmit}>
            <div className="rec-details">
              <div><strong>Date :</strong> {new Date(lastReclamation.date_creation).toLocaleDateString("fr-FR")}</div>
              <div><strong>Description :</strong> {lastReclamation.description_probleme || "-"}</div>
              <div><strong>Détails :</strong> {lastReclamation.autre || "-"}</div>
              <div><strong>Avancement :</strong> {lastReclamation.retour_client || "-"}</div>
              <div><strong>Statut :</strong> {lastReclamation.statut || "-"}</div>

              <div className="add-image-section" style={{ marginTop: "15px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <button
                  type="submit"
                  disabled={uploading}
                  className="image-upload-button"
                  style={{ marginLeft: "10px" }}
                >
                  {uploading ? "Ajout..." : "Ajouter l’image"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConsultRec;