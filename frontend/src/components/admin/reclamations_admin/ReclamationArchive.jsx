import React, { useEffect, useState } from 'react';
import { getPaginatedArchives, deleteArchive } from '../../../services/archiveService';
import { getUserbyId } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Navbar/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ArchiveReclamation = () => {
  const [archives, setArchives] = useState([]);
  const [usersCache, setUsersCache] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState(null);

  const navigate = useNavigate();

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const res = await getPaginatedArchives(page);
      const data = res.data.archives || [];
      const userIds = [...new Set(data.map((a) => a.user_id))];
      const newUsers = { ...usersCache };

      for (const id of userIds) {
        if (!newUsers[id]) {
          try {
            const userRes = await getUserbyId(id);
            newUsers[id] = userRes.data.nom || "Utilisateur inconnu";
          } catch {
            newUsers[id] = "Utilisateur inconnu";
          }
        }
      }

      const archivesWithNames = data.map((a) => ({
        ...a,
        userName: newUsers[a.user_id] || "Utilisateur inconnu",
      }));

      setUsersCache(newUsers);
      setArchives(archivesWithNames);
      setTotalPages(res.data.total_pages || 1);
    } catch (error) {
      console.error('Erreur chargement archives', error);
      toast.error("Erreur lors du chargement des archives");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArchives();
    setShowConfirm(false);
    setArchiveToDelete(null);
  }, [page]);

  const openConfirm = (archive) => {
    setArchiveToDelete(archive);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setArchiveToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await deleteArchive(archiveToDelete.id);
      toast.success("Archive supprimée avec succès");
      fetchArchives();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
    setShowConfirm(false);
    setArchiveToDelete(null);
  };

  const getFileName = (url) => {
    if (!url) return null;
    try {
      return decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
    } catch {
      return "fichier";
    }
  };

  if (loading) return <div className="loading">Chargement des archives...</div>;

  return (
    <>
      <Navbar />
      <div className="list-wrapper">
        <div className="list-container">
          <h2 className="title">Liste des Réclamations Archivées</h2>

          <table className="reclamation-table">
            <thead>
              <tr>
                <th>Date création</th>
                <th>Utilisateur</th>
                <th>Description</th>
                <th>Autre</th>
                <th>Image Véhicule</th>
                <th>Facturation</th>
                <th>Retour Client</th>
                <th>Action</th>
                <th>Statut</th>
                <th>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {archives.map((arc, index) => (
                <tr key={index}>
                  <td>{arc.date_creation ? new Date(arc.date_creation).toLocaleDateString('fr-FR') : "-"}</td>
                  <td>{arc.userName}</td>
                  <td>{arc.description_probleme || "-"}</td>
                  <td>{arc.autre || "-"}</td>
                  <td>
                    {arc.image_vehicule?.length > 0
                      ? arc.image_vehicule.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="doc-link">
                            Voir_image_{idx + 1}
                          </a>
                        ))
                      : "-"}
                  </td>
                  <td>
                    {arc.facturation?.length > 0
                      ? arc.facturation.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="doc-link">
                            Voir_facture_{idx + 1}
                          </a>
                        ))
                      : "-"}
                  </td>
                  <td>{arc.retour_client || "-"}</td>
                  <td>{arc.action || "-"}</td>
                  <td>{arc.statut || "-"}</td>
                  <td>
                    <button className="btn-delete" onClick={() => openConfirm(arc)}>
                      <i className="fa-solid fa-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage(prev => prev - 1)}
              className="pagination-btn"
            >
              ⬅ Précédent
            </button>
            <span className="page-info">Page {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="pagination-btn"
            >
              Suivant ➡
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer cette archive ?</p>
            <div className="modal-actions">
              <button onClick={cancelDelete}>Annuler</button>
              <button onClick={handleDelete} className="confirm-delete">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
};

export default ArchiveReclamation;
