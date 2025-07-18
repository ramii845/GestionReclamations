import React, { useState } from "react";
import "./AvisPopup.css";
import { useNavigate } from "react-router-dom";
import { toast,ToastContainer  } from "react-toastify";

const AvisPopup = ({ onClose, onSubmit }) => {
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.removeItem("CC_Token");
    toast.success("Votre avis a bien été reçu. Merci pour votre retour précieux !", { autoClose: 2000 });
   setTimeout(() =>  navigate("/login",2000));
    if (note < 1 || note > 5) return alert("Merci de choisir une note entre 1 et 5.");

    setLoading(true);
    await onSubmit({ note, commentaire });
    setLoading(false);
  };

  return (
    <div name="v10" className="avis-popup-alert">
      <div name="f1">
        <div className="popup-header">
          <h3 name="c4">Votre réclamation a été traitée avec succès !</h3>
          {/* Bouton croix supprimé ici */}
        </div>

        <form name="v11" onSubmit={handleSubmit}>
          <label name="v12">Votre note :</label>
          <div name="v13" className="star-container">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                name="v14"
                key={n}
                className={`star ${note >= n ? "selected" : ""}`}
                onClick={() => setNote(n)}
              >
                ★
              </span>
            ))}
          </div>

          <label name="v15">Commentaire :</label>
          <textarea
            name="v16"
            placeholder="Ajoutez un commentaire..."
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />

          <button name="v17" type="submit" disabled={loading}>
            {loading ? "Envoi en cours..." : "Envoyer"}
          </button>

          <button
            name="v18"
            type="button"
            onClick={onClose}
            style={{ marginTop: "10px", background: "#eee", color: "#333" }}
          >
            Pas maintenant
          </button>
        </form>
      </div>
          <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AvisPopup;