import React, { useEffect, useState } from 'react';
import { getPaginatedReclamations, deleteReclamation } from '../../../services/reclamationService';
import { getUserbyId } from '../../../services/authService';
import { getCategorieById } from '../../../services/categorieService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Navbar/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusCircle } from 'react-bootstrap-icons';

const ReclamationsAdmin = () => {
  const [reclamations, setReclamations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reclamationToDelete, setReclamationToDelete] = useState(null);
  const navigate = useNavigate();

  const [usersCache, setUsersCache] = useState({});
  const [categoriesCache, setCategoriesCache] = useState({});

  const fetchReclamations = async () => {
    setLoading(true);
    try {
      const res = await getPaginatedReclamations(page);
      const recs = res.data.reclamations;

      const userIdsToFetch = [...new Set(recs.map(r => r.user_id))].filter(id => !usersCache[id]);
      const catIdsToFetch = [...new Set(recs.map(r => r.categorie_id))].filter(id => !categoriesCache[id]);

      const usersPromises = userIdsToFetch.map(id =>
        getUserbyId(id).then(r => ({ id, nom: r.data.nom })).catch(() => ({ id, nom: "Utilisateur inconnu" }))
      );
      const catsPromises = catIdsToFetch.map(id =>
        getCategorieById(id).then(r => ({ id, nomCategorie: r.data.nomCategorie })).catch(() => ({ id, nomCategorie: "Catégorie inconnue" }))
      );

      const usersFetched = await Promise.all(usersPromises);
      const catsFetched = await Promise.all(catsPromises);

      setUsersCache(prev => {
        const copy = { ...prev };
        usersFetched.forEach(u => { copy[u.id] = u.nom; });
        return copy;
      });
      setCategoriesCache(prev => {
        const copy = { ...prev };
        catsFetched.forEach(c => { copy[c.id] = c.nomCategorie; });
        return copy;
      });

      const recsWithNames = recs.map(r => ({
        ...r,
        userName: usersCache[r.user_id] || usersFetched.find(u => u.id === r.user_id)?.nom || "Utilisateur inconnu",
        categorieName: categoriesCache[r.categorie_id] || catsFetched.find(c => c.id === r.categorie_id)?.nomCategorie || "Catégorie inconnue"
      }));

      setReclamations(recsWithNames);
      setTotalPages(res.data.total_pages);

    } catch (error) {
      console.error('Erreur chargement réclamations', error);
      toast.error("Erreur chargement réclamations");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReclamations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openConfirm = (rec) => {
    setReclamationToDelete(rec);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setReclamationToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await deleteReclamation(reclamationToDelete.id);
      toast.success(`Réclamation supprimée`);
      fetchReclamations();
    } catch (error) {
      toast.error("Erreur suppression !");
    }
    setShowConfirm(false);
    setReclamationToDelete(null);
  };

  if (loading) return <div className="loading">Chargement des réclamations...</div>;

  return (
    <>
      <Navbar />
      <div className="list-wrapper">
        <div className="list-container">
          <div className="header-actions">
            <h2 className="title">Liste des Réclamations</h2>
            <button className="btn-add" onClick={() => navigate('/admin/addReclamation')}>
              <PlusCircle className="me-2" size={18} />
              Ajouter
            </button>
          </div>

          <table className="reclamation-table">
            <thead>
              <tr>
                <th>Date création</th>
                <th>Nom utilisateur</th>
                <th>Nom catégorie</th>
                <th>Description</th>
                <th>Détails</th>
                <th>Incident</th>
                <th>Document</th>
                <th>Avancement</th>
                <th>Action</th>
                <th>Statut</th>
                <th>Modifier</th>
                <th>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {reclamations.map((rec, index) => (
                <tr key={index}>
                  <td>{rec.date_creation ? new Date(rec.date_creation).toLocaleDateString('fr-FR') : "-"}</td>
                  <td>{rec.userName}</td>
                  <td>{rec.categorieName}</td>
                  <td>{rec.description_probleme || "-"}</td>
                  <td>{rec.autre || "-"}</td>
                  <td>
                    {rec.image_vehicule
                      ? <img src={rec.image_vehicule} alt="Véhicule" style={{ width: '80px', height: 'auto' }} />
                      : "-"
                    }
                  </td>
                  <td>
                    {rec.facturation
                      ? <img src={rec.facturation} alt="Facturation" style={{ width: '80px', height: 'auto' }} />
                      : "-"
                    }
                  </td>
                  <td>{rec.retour_client || "-"}</td>
                  <td>{rec.action || "-"}</td>
                  <td>{rec.statut || "-"}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/admin/editReclamation/${rec.id}`)}
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Modifier
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => openConfirm(rec)}
                    >
                      <i className="fa-solid fa-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="pagination-btn"
            >
              ⬅ Précédent
            </button>
            <span className="page-info">Page {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="pagination-btn"
            >
              Suivant ➡
            </button>
          </div>
        </div>
      </div>

      {/* Modal confirmation */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer cette réclamation ?</p>
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

export default ReclamationsAdmin;