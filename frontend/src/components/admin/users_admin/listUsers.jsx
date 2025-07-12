import React, { useEffect, useState } from 'react';
import { getUsersPaginated, deleteUser } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Navbar/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './users.css';
import { PlusCircle } from 'react-bootstrap-icons';

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [searchNom, setSearchNom] = useState('');
  const [searchMatricule, setSearchMatricule] = useState('');

  // États pour debounce
  const [debouncedNom, setDebouncedNom] = useState('');
  const [debouncedMatricule, setDebouncedMatricule] = useState('');

  const navigate = useNavigate();

  // On change des inputs: on met la page à 1 ici (une seule fois par modification)
  const handleNomChange = (e) => {
    setSearchNom(e.target.value);
    setPage(1);
  };

  const handleMatriculeChange = (e) => {
    setSearchMatricule(e.target.value);
    setPage(1);
  };

  // Debounce sur les filtres pour appliquer la recherche sans bloquer la saisie
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNom(searchNom);
      setDebouncedMatricule(searchMatricule);
    }, 600);

    return () => clearTimeout(handler);
  }, [searchNom, searchMatricule]);

  // Fetch users quand page ou filtres debounced changent
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await getUsersPaginated(page, 7, debouncedNom, debouncedMatricule);
        setUsers(res.data.users);
        setTotalPages(res.data.total_pages);
      } catch (error) {
        toast.error('Erreur chargement utilisateurs');
      }
      setLoading(false);
    };
    fetchUsers();
  }, [page, debouncedNom, debouncedMatricule]);

  const openConfirm = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setUserToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await deleteUser(userToDelete.id);
      toast.success(`Utilisateur supprimé : ${userToDelete.nom}`, { autoClose: 2000 });
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setPage(page); // reload même page
      }
    } catch {
      toast.error("Erreur suppression !");
    }
    setShowConfirm(false);
    setUserToDelete(null);
  };

  if (loading) return <div className="loading">Chargement des clients...</div>;

  return (
    <>
      <Navbar />
      <div className="list-wrapperr">
        <div className="list-container1">
          <div className="header-actions">
            <h2 className="titlec">Liste des Clients</h2>
            <button className="btn-add1" onClick={() => navigate('/admin/addUser')}>
              <PlusCircle className="me-2" size={18} />
              Ajouter
            </button>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchNom}
              onChange={handleNomChange}
              className="search-input"
            />
            <input
              type="text"
              placeholder="Rechercher par matricule..."
              value={searchMatricule}
              onChange={handleMatriculeChange}
              className="search-input"
            />
          </div>

          <table className="user-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Matricule</th>
                <th>Marque</th>
                <th>Modèle</th>
                <th>Téléphone</th>
                <th>Modifier</th>
                <th>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.nom}</td>
                  <td>{user.matricule_vehicule}</td>
                  <td>{user.marque}</td>
                  <td>{user.modele}</td>
                  <td>{user.numero_telephone}</td>
                  <td>
                    <button
                      className="btn-edit1"
                      onClick={() => navigate(`/admin/edit/${user.id}`)}
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Modifier
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => openConfirm(user)}
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
              onClick={() => setPage((prev) => prev - 1)}
              className="pagination-btn"
            >
              ⬅ Précédent
            </button>
            <span className="page-info">Page {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
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
            <p>Voulez-vous vraiment supprimer <strong>{userToDelete.nom}</strong> ?</p>
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

export default ListUsers;
