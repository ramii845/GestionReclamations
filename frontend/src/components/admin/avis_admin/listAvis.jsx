import React, { useEffect, useState } from "react";
import {
  getPaginatedAvis,
  deleteAvis,
} from "../../../services/avisServices";
import { getUserbyId } from "../../../services/authService";
import { getReclamationById } from "../../../services/reclamationService";
import "./Avis.css";
import Navbar from "../../Navbar/Navbar";
import StarRating from "./StarRating";
import Swal from "sweetalert2";


export default function ListAvis() {
  const [avisList, setAvisList] = useState([]);
  const [filteredAvis, setFilteredAvis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStars, setSelectedStars] = useState(0);

  useEffect(() => {
    fetchAvis();
  }, [page, selectedStars]);

  const fetchAvis = async () => {
    setLoading(true);
    setError(null);
    try {
      // On passe le filtre nbetoiles au backend si sélectionné
      const response = await getPaginatedAvis(page, 7, selectedStars > 0 ? selectedStars : null);
      const { avis, total_pages } = response.data;

      const avisWithDetails = await Promise.all(
        avis.map(async (a) => {
          let userName = "Utilisateur inconnu";
          try {
            const userResp = await getUserbyId(a.user_id);
            userName = userResp.data.nom || userResp.data.name || userName;
          } catch {}

          let dateCreation = "Date inconnue";
          try {
            const recResp = await getReclamationById(a.reclamation_id);
            if (recResp.data.date_creation) {
              const date = new Date(recResp.data.date_creation);
              dateCreation = date.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            }
          } catch {}

          return { ...a, userName, dateCreation };
        })
      );

      setAvisList(avisWithDetails);
      setFilteredAvis(avisWithDetails); // Mettre à jour filteredAvis avec les données reçues
      setTotalPages(total_pages);
    } catch (err) {
      setError("Erreur lors du chargement des avis");
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Êtes-vous sûr ?",
    text: "Cette action supprimera définitivement l'avis.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Oui, supprimer",
    cancelButtonText: "Annuler",
  });

  if (result.isConfirmed) {
    try {
      await deleteAvis(id);
      await fetchAvis();
      Swal.fire("Supprimé !", "L'avis a été supprimé avec succès.", "success");
    } catch {
      Swal.fire("Erreur", "Impossible de supprimer l'avis.", "error");
    }
  }
};


  return (
    <div className="avis-container">
      <Navbar />
      <h3 className="avis-title">Avis des client</h3>

      <div className="avis-filters">
        <div className="avis-filter-stars">
          <StarRating rate={selectedStars} handleRating={setSelectedStars} />
          {selectedStars > 0 && (
            <button className="clear-filter-btn" onClick={() => setSelectedStars(0)}>
              ❌ Réinitialiser
            </button>
          )}
        </div>
      </div>

      {loading && <p className="avis-loading">Chargement des avis...</p>}
      {error && <p className="avis-error">{error}</p>}
      {!loading && filteredAvis.length === 0 && (
        <p className="avis-empty">Aucun avis trouvé pour cette note.</p>
      )}

      <ul className="avis-list">
        {filteredAvis.map((avis) => (
          <li key={avis.id || avis._id} className="avis-item">
            <p><strong>Nom utilisateur :</strong> {avis.userName}</p>
            <p><strong>Date création réclamation :</strong> {avis.dateCreation}</p>
            <p><strong>Étoiles :</strong> <span className="avis-stars">{"⭐".repeat(avis.nbetoiles)}</span></p>
            <p><strong>Commentaire :</strong> {avis.commentaire}</p>
            <button
              onClick={() => handleDelete(avis.id || avis._id)}
              className="avis-delete-btn"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          ⬅️ Précédent
        </button>
        <span className="pagination-page">Page {page} / {totalPages}</span>
        <button
          className="pagination-btn"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Suivant ➡️
        </button>
      </div>
    </div>
  );
}
