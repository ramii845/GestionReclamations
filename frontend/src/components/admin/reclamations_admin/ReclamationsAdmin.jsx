import React, { useEffect, useState } from 'react';
import {
  getPaginatedReclamations,
  deleteReclamation,getAllReclamations
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

const fixedStatuts = ["En attente", "Prise en charge", "Terminée"];

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
  const [totalCount, setTotalCount] = useState(0);


  const [usersCache, setUsersCache] = useState({});
  const [categoriesCache, setCategoriesCache] = useState({});
  
  const navigate = useNavigate();

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
            .then(r => ({ id, nom: r.data.nom ,
              numero_telephone: r.data.numero_telephone,
              matricule_vehicule:r.data.matricule_vehicule

            }))
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
    copy[u.id] = {
      nom: u.nom,
      numero_telephone: u.numero_telephone,
      matricule_vehicule:u.matricule_vehicule
    };
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

 const recsWithNames = recs.map(r => {
  const user = usersCache[r.user_id] || usersFetched.find(u => u.id === r.user_id);
  const cat = categoriesCache[r.categorie_id] || catsFetched.find(c => c.id === r.categorie_id);

  return {
    ...r,
    userName: user?.nom || 'Utilisateur inconnu',
    userPhone: user?.numero_telephone || '-',
    matricule: user?.matricule_vehicule || '-',
    categorieName: cat?.nomCategorie || 'Catégorie inconnue'
  };
});

      // Ne plus mettre à jour availableStatuts ici
      // setAvailableStatuts([...new Set(recs.map(r => r.statut).filter(Boolean))]);

      setReclamations(recsWithNames);
      setTotalPages(res.data.total_pages);
    } catch (error) {
      console.error('Erreur chargement réclamations', error);
      toast.error('Erreur chargement réclamations', { autoClose: 2000 });
    }
    setLoading(false);
  };
 const fetchTotalCount = async () => {
  try {
    const res = await getAllReclamations();
    setTotalCount(res.data.length);
  } catch (err) {
    console.error("Erreur total réclamations", err);
  }
};

useEffect(() => {
  fetchTotalCount();
}, []);



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
      toast.success(`Réclamation Archivée`);
       fetchTotalCount();
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
    <Navbar name="navbar" />
    <div className="list-wrapper" name="wrapperr_reclamations">
      <div className="list-container" name="containerr_reclamations">
        <div className="header-actions" name="actions_headerr">
          <h2 className="titlee" name="titre_reclamations">Liste des Réclamations</h2>
          <button
            className="btn-add1"
            name="btn_ajouterr_reclamation"
            onClick={() => navigate('/admin/addReclamation')}
          >
            <PlusCircle className="me-2" size={18} />
            Ajouter
          </button>
        </div>

        <div className="filters" name="zone_filtres">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="filter-input"
            name="filtre_date"
          />
          <select
            value={categorieFilter}
            onChange={e => setCategorieFilter(e.target.value)}
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
            onChange={e => setDescriptionFilter(e.target.value)}
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
            onChange={e => setStatutFilter(e.target.value)}
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

        <table className="reclamation-table" name="table_reclamations">
          <thead name="thead_reclamations">
            <tr name="ligne_entete">
              <th name="col">Date création</th>
              <th name="col">Cleint</th>
              <th name="col">Téléphone</th>
              <th name="col">Matricule</th>
              <th name="col">Service</th>
              <th name="col">Description</th>
              <th name="col">Réclamataion</th>
              <th name="col">Incident</th>
              <th name="col">Document</th>
              <th name="col">Reponse</th>
              <th name="col">Avancement</th>
              <th name="col">Action</th>
              <th name="col">Statut</th>
              <th name="col_modifier">Modifier</th>
              <th name="col_supprimer">Supprimer</th>
            </tr>
          </thead>
          <tbody name="tbody_reclamations">
            {reclamations.map((rec, index) => (
              <tr key={rec.id} name={`ligne_reclamation_${index}`}>
                <td name="col_date_creation">
                  {rec.date_creation
                    ? new Date(rec.date_creation).toLocaleDateString('fr-FR')
                    : '-'}
                </td>
                <td name="col1">{rec.userName}</td>
                <td name="col1">{rec.userPhone}</td>
                <td name="col1">{rec.matricule}</td>
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
                 <td name="col_1">{rec.retour_admin || '-'}</td>
                <td name="col_1">{rec.retour_client || '-'}</td>
                <td name="col_1">{rec.action || '-'}</td>
                <td name="col_1">{rec.statut || '-'}</td>
              
                <td name="col_modifier">
                  <button
                    className="btn-editt"
                    onClick={() => navigate(`/admin/editReclamation/${rec.id}`)}
                    name={`btn_modifier_${index}`}
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Modifier
                  </button>
                </td>
                <td name="col_supprimert">
                  <button
                    className="btn-delete"
                    onClick={() => openConfirm(rec)}
                    name={`btn_supprimer_${index}`}
                  >
                    <i className="fa-solid fa-trash"></i> Archiver
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
                          <div style={{ textAlign: "right", padding: "10px 20px", fontWeight: "bold", color: "#555" }}>
  Total : {totalCount} réclamations
</div>
      </div>
    </div>

    {showConfirm && (
      <div className="modal-overlay" name="overlay_modal">
        <div className="modal-content" name="contenu_modal">
          <h3 name="titre_modal">Confirmer la suppression</h3>
          <p name="texte_modal">Voulez-vous vraiment Archiver cette réclamation ?</p>
          <div className="modal-actions" name="actions_modal">
            <button onClick={cancelDelete} name="btn_annuler_modal">Annuler</button>
            <button onClick={handleDelete} className="confirm-delete" name="btn_confirmer_modal">
              Archiver
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
export default ReclamationsAdmin
