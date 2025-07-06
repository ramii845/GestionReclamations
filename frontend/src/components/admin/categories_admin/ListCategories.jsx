import React, { useEffect, useState } from 'react';
import { getAllCategories, deleteCategorie } from '../../../services/categorieService';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../Navbar/Navbar';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './ListCategories.css';

const ListCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data.categories);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openConfirm = (cat) => {
    setCatToDelete(cat);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setCatToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await deleteCategorie(catToDelete.id);
      setCategories(categories.filter(cat => cat.id !== catToDelete.id));
      toast.success(`Catégorie "${catToDelete.nomCategorie}" supprimée avec succès !`);
    } catch (error) {
      console.error("Erreur suppression :", error);
      toast.error("Erreur lors de la suppression !");
    }
    setShowConfirm(false);
    setCatToDelete(null);
  };

  if (loading) return <div className="loading">Chargement des services...</div>;

  return (
    <>
      <Navbar />
      <div className="list-wrapper4">
        <div className="list-categories-container4">
          <h2>Liste des Services</h2>
          <Link to="/categories/add">
            <button className="add-button"><i className="fa-solid fa-plus"></i> Ajouter</button>
          </Link>
          <table className="table-categories">
            <thead>
              <tr>
                <th>Nom Service</th>
                <th>Image</th>
                <th>Modifier</th>
                <th>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={index}>
                  <td>{cat.nomCategorie}</td>
                  <td>
                    <img src={cat.imageCategorie} alt="img" width={100} height={100} />
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => navigate(`/categories/edit/${cat.id}`)}>
                      <i className="fa-solid fa-pen-to-square"></i> Modifier
                    </button>
                  </td>
                  <td>
                    <button className="btn-delete" onClick={() => openConfirm(cat)}>
                      <i className="fa-solid fa-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal confirmation suppression */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 30,
              borderRadius: 12,
              width: "90%",
              maxWidth: 400,
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer ce service <strong>{catToDelete.nomCategorie}</strong> ?</p>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-around" }}>
              <button
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                    backgroundColor: "#fff",       // fond blanc
    color: "#dc2626", 
                  cursor: "pointer",
                  minWidth: 100,
                }}
                onClick={cancelDelete}
              >
                Annuler
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "white",
                  cursor: "pointer",
                  minWidth: 100,
                }}
                onClick={handleDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Container Toast */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
};

export default ListCategories;
