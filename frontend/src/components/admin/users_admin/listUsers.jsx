import React, { useEffect, useState } from 'react';
import {
  getUsersPaginated,
  deleteUser
} from '../../../services/authService';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../Navbar/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        <div className="list-categories-container">
          <h2>Liste des Utilisateurs</h2>
          <table className="table-categories">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Matricule</th>
                <th>Marque</th>
                <th>Modèle</th>
                <th>Téléphone</th>
                <th>Photo</th>
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
                    <img src={user.photo} alt="img" width={80} height={80} />
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/users/edit/${user.id}`)}
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

          {/* 🔁 Pagination simple */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              ⬅ Précédent
            </button>
            <span style={{ margin: "0 15px" }}>Page {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Suivant ➡
            </button>
          </div>
        </div>
      </div>

      {/* Modal confirmation suppression */}
      {showConfirm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "white", padding: 30, borderRadius: 12, width: "90%",
            maxWidth: 400, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}>
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer <strong>{userToDelete.nom}</strong> ?</p>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-around" }}>
              <button onClick={cancelDelete}>Annuler</button>
              <button style={{ backgroundColor: "#dc2626", color: "white" }} onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
};

export default ListUsers;
