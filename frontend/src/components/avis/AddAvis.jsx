import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createAvis } from "../../services/avisServices"; // adapte le chemin si besoin
import './Avis.css';
import Navbar from "../Navbar/Navbar";

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

const AddAvis = () => {
  const { reclamation_id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("CC_Token");
  const decoded = token ? decodeJWT(token) : null;
  const user_id = decoded?.user_id;

  const [nbetoiles, setNbetoiles] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user_id) return toast.error("Utilisateur non authentifié");
    if (!reclamation_id) return toast.error("ID réclamation manquant");
    if (nbetoiles < 1 || nbetoiles > 5)
      return toast.error("Veuillez sélectionner une note entre 1 et 5 étoiles");
    if (commentaire.trim() === "")
      return toast.error("Le commentaire ne peut pas être vide");

    setLoading(true);
    try {
      const avis = { user_id, reclamation_id, nbetoiles, commentaire };
      const response = await createAvis(avis);

      toast.success(response.data.message || "Avis ajouté avec succès");
      navigate("/mes-reclamations");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l’envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div name="t1" className="page-container5">
        <Navbar/>
      <h2 name="titre11" className="avis-title">Donner votre avis</h2>
      <form name="s1" onSubmit={handleSubmit} className="add-avis-form">
        <fieldset name="t10">
          <label name="t4" htmlFor="nbetoiles">Votre note :</label>
          <div name="nbetoiles" className="stars-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${nbetoiles >= star ? 'selected' : ''}`}
                onClick={() => setNbetoiles(star)}
              >
                ★
              </span>
            ))}
          </div>

          <label name="t4" htmlFor="commentaire">Commentaire :</label>
          <textarea
            id="commentaire"
            name="t11"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={4}
            required
          />
        </fieldset>

        <button name="t18" type="submit" disabled={loading}>
          {loading ? "Envoi en cours..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
};

export default AddAvis;
