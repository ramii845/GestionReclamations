// src/pages/categories/CategorieList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../../services/categorieService";
import "./CategorieList.css";

const CategorieList = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllCategories();
        // Maintenant on récupère res.data.categories selon ta nouvelle réponse backend
        setCategories(res.data.categories);
        console.log("Catégories reçues :", res.data.categories); // debug
      } catch (err) {
        console.error("Erreur lors du chargement des catégories :", err);
      }
    };
    fetchData();
  }, []);

  const handleRedirect = (id) => {
    if (!id) {
      console.warn("ID catégorie manquant !");
      return;
    }
    navigate(`/categories/${id}`);
  };

  return (
    <div className="categorie-container">
      <h2 className="title">Liste des catégories</h2>

      <div className="categorie-grid">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="categorie-card"
            onClick={() => handleRedirect(cat.id)}
          >
            <img src={cat.imageCategorie} alt={cat.nomCategorie} />
            <button className="categorie-btn">{cat.nomCategorie}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorieList;
