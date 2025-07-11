import React, { useEffect, useState } from 'react';
import { getPaginatedArchives, deleteArchive } from '../../../services/archiveService';
import { getUserbyId } from '../../../services/authService';
import { getCategorieById, getAllCategories } from '../../../services/categorieService';
import Navbar from '../../Navbar/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './Reclamation.css';

const ArchiveReclamation = () => {
  const [archives, setArchives] = useState([]);
  const [usersCache, setUsersCache] = useState({});
  const [categoriesCache, setCategoriesCache] = useState({});
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableDescriptions, setAvailableDescriptions] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('');
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [reclamationToDelete, setReclamationToDelete] = useState(null);
  const navigate = useNavigate();

  const fixedStatuts = ["En attente", "Prise en charge", "Terminée"];

  const getDescriptionsByCategorie = (nomCategorie) => {
    if (nomCategorie === "Service commerciale") {
      return [
        "Accueil client à l’arrivée au concessionnaire",
        "Crédibilité du service commercial",
        "Service de livraison du véhicule",
        "État du véhicule à la livraison",
        "Problèmes liés à la pose d’accessoires",
        "Autre problème lié au service commerciale"
      ];
    } else if (nomCategorie === "Service Après-Vente") {
      return [
        "Accueil du conseiller service",
        "Qualité de l’intervention demandée",
        "Respect des délais donnés",
        "Facturation / Devis",
        "Traitement du dossier de garantie",
        "Service SAV succrsale sfax",
        "Autre problème lié au service service Après-Vente"
      ];
    } else if (nomCategorie === "service Administratif") {
      return [
        "Erreur documents administratifs",
        "Rejet injustifié de dossier",
        "Erreur Client de coordoneeés",
        "Recouvrement / Relevé compte",
        "Autre problème lié au service Administratif"
      ];
    } else return [];
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        const raw = res.data.categories || res.data || [];
        const cats = raw.map(c => ({ id: c.id || c._id, nomCategorie: c.nomCategorie }));
        const idToName = {};
        cats.forEach(c => { idToName[c.id] = c.nomCategorie; });
        setAvailableCategories(cats);
        setCategoriesCache(idToName);
      } catch (err) {
        toast.error('Erreur chargement catégories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const nomCategorie = availableCategories.find(c => c.id === categorieFilter)?.nomCategorie;
    setAvailableDescriptions(nomCategorie ? getDescriptionsByCategorie(nomCategorie) : []);
    setDescriptionFilter('');
  }, [categorieFilter, availableCategories]);

  const fetchArchives = async () => {
    setLoading(true);
    try {
const res = await getPaginatedArchives({
  page,
  limit: 7,
  date_creation: dateFilter || undefined,
  categorie_id: categorieFilter || undefined,
  description_probleme: descriptionFilter || undefined,
  statut: statutFilter || undefined
});
      const data = res.data.reclamations || [];

      const userIds = [...new Set(data.map((a) => a.user_id))];
      const catIds = [...new Set(data.map((a) => a.categorie_id))];

      const newUsers = { ...usersCache };
      const newCategories = { ...categoriesCache };

      for (const id of userIds) {
        if (!newUsers[id]) {
          try {
            const userRes = await getUserbyId(id);
            newUsers[id] = {
              nom: userRes.data.nom || "Utilisateur inconnu",
              numero_telephone: userRes.data.numero_telephone || "-"
            };
          } catch {
            newUsers[id] = { nom: "Utilisateur inconnu", numero_telephone: "-" };
          }
        }
      }

      for (const id of catIds) {
        if (!newCategories[id]) {
          try {
            const catRes = await getCategorieById(id);
            newCategories[id] = catRes.data.nomCategorie || "Catégorie inconnue";
          } catch {
            newCategories[id] = "Catégorie inconnue";
          }
        }
      }

      const archivesWithNames = data.map((a) => ({
        ...a,
        userName: newUsers[a.user_id]?.nom || "Utilisateur inconnu",
        userPhone: newUsers[a.user_id]?.numero_telephone || "-",
        categorieName: newCategories[a.categorie_id] || "Catégorie inconnue",
      }));

      setUsersCache(newUsers);
      setCategoriesCache(newCategories);
      setArchives(archivesWithNames);
      setTotalPages(res.data.total_pages || 1);
    } catch (error) {
      toast.error("Erreur chargement des archives");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArchives();
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
      await deleteArchive(reclamationToDelete.id);
      toast.success(`Réclamation supprimée`);
      if (archives.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchArchives();
      }
    } catch (error) {
      toast.error('Erreur suppression !');
    }
    setShowConfirm(false);
    setReclamationToDelete(null);
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
    <Navbar name="navbar" />
    <div className="list-wrapper" name="wrapperr_reclamations">
      <div className="list-container" name="containerr_reclamations">
        <div className="header-actions" name="actions_headerr">
          <h2 className="titlee" name="titre_reclamations">Liste des réclamations archivées</h2>
  
        </div>

        <div className="filters" name="zone_filtres">
          <input
            type="date"
            value={dateFilter}
            onChange={e => {
  setDateFilter(e.target.value);
  setPage(1);
}}
            className="filter-input"
            name="filtre_date"
          />
          <select
            value={categorieFilter}
           onChange={e => {
  setCategorieFilter(e.target.value);
  setPage(1);
}}
            className="filter-select"
            name="filtre_categorie"
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
            onChange={e => {
  setDescriptionFilter(e.target.value);
  setPage(1);
}}
            className="filter-select"
            name="filtre_description"
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
         onChange={e => {
  setStatutFilter(e.target.value);
  setPage(1);
}}
            className="filter-select"
            name="filtre_statut"
          >
            <option value="">Tous les statuts</option>
            {fixedStatuts.map((stat, idx) => (
              <option key={idx} value={stat}>
                {stat}
              </option>
            ))}
          </select>
        </div>

        <table className="reclamationA-table" name="tableA_reclamations">
          <thead name="theadA_reclamations">
            <tr name="ligne_entete">
              <th name="col">Date création</th>
              <th name="col">Nom utilisateur</th>
              <th name="col">Téléphone</th>
              <th name="col">Nom catégorie</th>
              <th name="col">Description</th>
              <th name="col">Détails</th>
              <th name="col">Incident</th>
              <th name="col">Document</th>
              <th name="col">Avancement</th>
              <th name="col">Action</th>
              <th name="col">Statut</th>
              <th name="col_supprimer">Supprimer</th>
            </tr>
          </thead>
          <tbody name="tbody_reclamations">
            {archives.map((rec, index) => (
              <tr key={rec.id} name={`ligne_reclamation_${index}`}>
                <td name="col_date_creation">
                  {rec.date_creation
                    ? new Date(rec.date_creation).toLocaleDateString('fr-FR')
                    : '-'}
                </td>
                <td name="col1">{rec.userName}</td>
                <td name="col1">{rec.userPhone}</td>
                <td name="col1">{rec.categorieName}</td>
                <td name="col1">{rec.description_probleme || '-'}</td>
                <td name="col1">{rec.autre || '-'}</td>
                <td name="col1">
                  {rec.image_vehicule?.length > 0
                    ? rec.image_vehicule.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={getFileName(url)}
                          className="doc-link"
                          name={`lien_incident_${index}_${idx}`}
                        >
                          Voir_image_{idx + 1}
                        </a>
                      ))
                    : '-'}
                </td>
                <td name="col_1">
                  {rec.facturation?.length > 0
                    ? rec.facturation.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={getFileName(url)}
                          className="doc-link"
                          name={`lien_document_${index}_${idx}`}
                        >
                          Voir_image_{idx + 1}
                        </a>
                      ))
                    : '-'}
                </td>
                <td name="col_1">{rec.retour_client || '-'}</td>
                <td name="col_1">{rec.action || '-'}</td>
                <td name="col_1">{rec.statut || '-'}</td>
          
                <td name="col_supprimert">
                  <button
                    className="btn-delete"
                    onClick={() => openConfirm(rec)}
                    name={`btn_supprimerr_${index}`}
                  >
                    <i className="fa-solid fa-trash"></i> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination" name="pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="pagination-btn"
            name="btn_precedent"
          >
            ⬅ Précédent
          </button>
          <span className="page-info" name="info_page">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="pagination-btn"
            name="btn_suivant"
          >
            Suivant ➡
          </button>
        </div>
      </div>
    </div>

    {showConfirm && (
      <div className="modal-overlay" name="overlay_modal">
        <div className="modal-content" name="contenu_modal">
          <h3 name="titre_modal">Confirmer la suppression</h3>
          <p name="texte_modal">Voulez-vous vraiment supprimer cette réclamation ?</p>
          <div className="modal-actions" name="actions_modal">
            <button onClick={cancelDelete} name="btn_annuler_modal">Annuler</button>
            <button onClick={handleDelete} className="confirm-delete" name="btn_confirmer_modal">
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
      name="toast_container"
    />
  </>
  );
};

export default ArchiveReclamation;
