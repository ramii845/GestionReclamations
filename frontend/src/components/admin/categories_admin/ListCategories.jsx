import React, { useEffect, useState } from 'react';
import { getAllCategories, deleteCategorie } from '../../../services/categorieService';
import { Link,useNavigate } from 'react-router-dom';

import './ListCategories.css';
import Navbar from '../../Navbar/Navbar';


const ListCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data.categories);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous supprimer cette catégorie ?")) {
      try {
        await deleteCategorie(id);
        setCategories(categories.filter(cat => cat.id !== id));
      } catch (error) {
        console.error("Erreur suppression :", error);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) return <div className="loading">Chargement des catégories...</div>;

  return (
  <>
    <Navbar />
    <div className="list-wrapper">
      <div className="list-categories-container">
        <h2>Liste des Catégories</h2>
        <Link to="/categories/add">
          <button className="add-button"><i className="fa-solid fa-plus"></i> Ajouter</button>
        </Link>
        <table className="table-categories">
          <thead>
            <tr>
              <th>Nom Catégorie</th>
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
                  <button className="btn-delete" onClick={() => handleDelete(cat.id)}>
                    <i className="fa-solid fa-trash"></i> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

};

export default ListCategories;
