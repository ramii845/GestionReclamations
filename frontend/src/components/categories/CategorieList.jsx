import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../../services/categorieService";
import "./CategorieList.css";
import "../Navbar/Navbar.css";

const CategorieList = () => {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllCategories();
        setCategories(res.data.categories);
      } catch (err) {
        console.error("Erreur lors du chargement des catégories :", err);
      }
    };
    fetchData();
  }, []);

  const handleRedirect = (id) => {
    if (!id) return;
    navigate(`/categories/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("CC_Token");
    navigate("/login");
  };

  // Fermer menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      {/* ✅ NAVBAR */}
      <nav className="navbar">
        <div
          className="navbar-accueil"
          onClick={() => {
            localStorage.removeItem("CC_Token");
            navigate("/");
          }}
        >
          Accueil
        </div>

        <div className="navbar-user" ref={menuRef}>
          <img
            src="/images/logo3.png" // Remplace par le chemin réel de ton image utilisateur
            alt="Profil utilisateur"
            className="user-image"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div className="user-menu">
              <button onClick={() => navigate("/profil")}>Gérer mon compte</button>
              <button onClick={handleLogout}>Déconnexion</button>
            </div>
          )}
        </div>
      </nav>

      {/* ✅ CONTENU PRINCIPAL */}
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
    </div>
  );
};

export default CategorieList;
