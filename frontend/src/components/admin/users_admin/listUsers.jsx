import React, { useEffect, useState } from 'react';
import {
  getUsersPaginated,
  deleteUser,
} from '../../../services/authService';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await getUsersPaginated(page);
      setUsers(res.data.users);
      setTotalPages(res.data.total_pages);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement utilisateurs', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

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
      toast.success(`Utilisateur supprimé : ${userToDelete.nom}`);
      fetchUsers(); // refresh
    } catch (error) {
      toast.error("Erreur suppression !");
    }
    setShowConfirm(false);
    setUserToDelete(null);
  };

  if (loading) return <div className="loading">Chargement des utilisateurs...</div>;

  return (
    <>
      <Navbar />
      <div className="list-wrapper">
        <div className="list-container">
          <div className="header-actions">
            <h2 className="title">Liste des Utilisateurs</h2>
            <button className="btn-add" onClick={() => navigate('/users/add')}>
              <PlusCircle className="me-2" size={18} />
              Ajouter
            </button>
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
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.nom}</td>
                  <td>{user.matricule_vehicule}</td>
                  <td>{user.marque}</td>
                  <td>{user.modele}</td>
                  <td>{user.numero_telephone}</td>
                  <td>
                    <button
                      className="btn-edit"
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

          {/* Pagination */}
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

      {/* Modal confirmation */}
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