import React, { useEffect, useState } from 'react';
import {
  getPaginatedReclamations,
  deleteReclamation
} from '../../../services/reclamationService';
import { getUserbyId } from '../../../services/authService';
import {
  getCategorieById,
  getAllCategories
} from '../../../services/categorieService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Navbar/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusCircle } from 'react-bootstrap-icons';
import './Reclamation.css';

const ReclamationsAdmin = () => {
  const [reclamations, setReclamations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reclamationToDelete, setReclamationToDelete] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('');
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableDescriptions, setAvailableDescriptions] = useState([]);
  const [availableStatuts, setAvailableStatuts] = useState([]);

  const navigate = useNavigate();
  const [usersCache, setUsersCache] = useState({});
  const [categoriesCache, setCategoriesCache] = useState({});

  // Fonction pour retourner les descriptions selon le nom de catégorie
  const getDescriptionsByCategorie = (nomCategorie) => {
    if (nomCategorie === "Service commerciale") {
      return [
        "Accueil client à l’arrivée au concessionnaire",
        "Crédibilité du service commercial",
        "Service de livraison du véhicule",
        "État du véhicule à la livraison",
        "Problèmes liés à la pose d’accessoires",
        "Autre problème lié au service commerciale",
      ];
    } else if (nomCategorie === "Service Après-Vente") {
      return [
        "Accueil du conseiller service",
        "Qualité de l’intervention demandée",
        "Respect des délais donnés",
        "Facturation / Devis",
        "Traitement du dossier de garantie",
        "Service SAV succrsale sfax",
        "Autre problème lié au service service Après-Vente",
      ];
    } else if (nomCategorie === "service Administratif") {
      return [
        "Erreur documents administratifs",
        "Rejet injustifié de dossier",
        "Erreur Client de coordoneeés",
        "Recouvrement / Relevé compte",
        "Autre problème lié au service Administratif",
      ];
    } else {
      return [];
    }
  };

  // Chargement des catégories au démarrage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        const raw = res.data.categories || res.data || [];
        const cats = raw.map(c => ({
          id: c.id || c._id,
          nomCategorie: c.nomCategorie
        }));
        const idToName = {};
        cats.forEach(c => {
          idToName[c.id] = c.nomCategorie;
        });
        setCategoriesCache(idToName);
        setAvailableCategories(cats);
      } catch (err) {
        console.error('Erreur chargement catégories', err);
        toast.error('Erreur chargement catégories');
      }
    };
    fetchCategories();
  }, []);

  // Mise à jour des descriptions quand la catégorie change
  useEffect(() => {
    const nomCategorie = availableCategories.find(c => c.id === categorieFilter)?.nomCategorie;
    if (nomCategorie) {
      const descriptions = getDescriptionsByCategorie(nomCategorie);
      setAvailableDescriptions(descriptions);
    } else {
      setAvailableDescriptions([]);
    }
    setDescriptionFilter(''); // reset description filter à chaque changement de catégorie
  }, [categorieFilter, availableCategories]);

  const fetchReclamations = async () => {
    setLoading(true);
    try {
      const res = await getPaginatedReclamations({
        page,
        date_creation: dateFilter || undefined,
        categorie_id: categorieFilter || undefined,
        description_probleme: descriptionFilter || undefined,
        statut: statutFilter || undefined
      });

      const recs = res.data.reclamations;

      const userIdsToFetch = [...new Set(recs.map(r => r.user_id))].filter(
        id => !usersCache[id]
      );
      const catIdsToFetch = [...new Set(recs.map(r => r.categorie_id))].filter(
        id => !categoriesCache[id]
      );

      const usersFetched = await Promise.all(
        userIdsToFetch.map(id =>
          getUserbyId(id)
            .then(r => ({ id, nom: r.data.nom }))
            .catch(() => ({ id, nom: 'Utilisateur inconnu' }))
        )
      );

      const catsFetched = await Promise.all(
        catIdsToFetch.map(id =>
          getCategorieById(id)
            .then(r => ({
              id,
              nomCategorie: r.data.nomCategorie
            }))
            .catch(() => ({ id, nomCategorie: 'Catégorie inconnue' }))
        )
      );

      setUsersCache(prev => {
        const copy = { ...prev };
        usersFetched.forEach(u => {
          copy[u.id] = u.nom;
        });
        return copy;
      });

      setCategoriesCache(prev => {
        const copy = { ...prev };
        catsFetched.forEach(c => {
          copy[c.id] = c.nomCategorie;
        });
        return copy;
      });

      const recsWithNames = recs.map(r => ({
        ...r,
        userName:
          usersCache[r.user_id] ||
          usersFetched.find(u => u.id === r.user_id)?.nom ||
          'Utilisateur inconnu',
        categorieName:
          categoriesCache[r.categorie_id] ||
          catsFetched.find(c => c.id === r.categorie_id)?.nomCategorie ||
          'Catégorie inconnue'
      }));

      // On ne remplit plus availableDescriptions ici (car elles dépendent de la catégorie)
      setAvailableStatuts([
        ...new Set(recs.map(r => r.statut).filter(Boolean))
      ]);

      setReclamations(recsWithNames);
      setTotalPages(res.data.total_pages);
    } catch (error) {
      console.error('Erreur chargement réclamations', error);
      toast.error('Erreur chargement réclamations', { autoClose: 2000 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReclamations();
  }, [page, dateFilter, categorieFilter, descriptionFilter, statutFilter]);

  const openConfirm = rec => {
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
      if (reclamations.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchReclamations();
      }
    } catch (error) {
      toast.error('Erreur suppression !');
    }
    setShowConfirm(false);
    setReclamationToDelete(null);
  };

  if (loading)
    return <div className="loading">Chargement des réclamations...</div>;

  const getFileName = url => {
    if (!url) return null;
    try {
      return decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
    } catch {
      return 'fichier';
    }
  };

  return (
    <>
      <Navbar />
      <div className="list-wrapper">
        <div className="list-container">
          <div className="header-actions">
            <h2 className="title">Liste des Réclamations</h2>
            <button
              className="btn-add"
              onClick={() => navigate('/admin/addReclamation')}
            >
              <PlusCircle className="me-2" size={18} />
              Ajouter
            </button>
          </div>

          <div className="filters">
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="filter-input"
            />
            <select
              value={categorieFilter}
              onChange={e => setCategorieFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Toutes les catégories</option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nomCategorie}
                </option>
              ))}
            </select>
            <select
              value={descriptionFilter}
              onChange={e => setDescriptionFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Toutes les descriptions</option>
              {availableDescriptions.map((desc, idx) => (
                <option key={idx} value={desc}>
                  {desc}
                </option>
              ))}
            </select>
            <select
              value={statutFilter}
              onChange={e => setStatutFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous les statuts</option>
              {availableStatuts.map((stat, idx) => (
                <option key={idx} value={stat}>
                  {stat}
                </option>
              ))}
            </select>
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
                  <td>
                    {rec.date_creation
                      ? new Date(rec.date_creation).toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                  <td>{rec.userName}</td>
                  <td>{rec.categorieName}</td>
                  <td>{rec.description_probleme || '-'}</td>
                  <td>{rec.autre || '-'}</td>
                  <td>
                    {rec.image_vehicule?.length > 0
                      ? rec.image_vehicule.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={getFileName(url)}
                            className="doc-link"
                          >
                            Voir_image_{idx + 1}
                          </a>
                        ))
                      : '-'}
                  </td>
                  <td>
                    {rec.facturation?.length > 0
                      ? rec.facturation.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={getFileName(url)}
                            className="doc-link"
                          >
                            Voir_image_{idx + 1}
                          </a>
                        ))
                      : '-'}
                  </td>
                  <td>{rec.retour_client || '-'}</td>
                  <td>{rec.action || '-'}</td>
                  <td>{rec.statut || '-'}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() =>
                        navigate(`/admin/editReclamation/${rec.id}`)
                      }
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

          <div className="pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="pagination-btn"
            >
              ⬅ Précédent
            </button>
            <span className="page-info">
              Page {page} / {totalPages}
            </span>
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

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer cette réclamation ?</p>
            <div className="modal-actions">
              <button onClick={cancelDelete}>Annuler</button>
              <button onClick={handleDelete} className="confirm-delete">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </>
  );
};

export default ReclamationsAdmin;
