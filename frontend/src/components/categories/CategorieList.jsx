import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../../services/categorieService";
import "./CategorieList.css";
import "../Navbar/Navbar.css";
import Navbar from "../Navbar/Navbar";

function decodeToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur décodage token:', error);
    return null;
  }
}

const CategorieList = () => {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const menuRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("CC_Token");
    const decoded = decodeToken(token);
    if (decoded && decoded.nom) {
      setUserName(decoded.nom);
    }
  }, []);

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
  <Navbar/>
     <h2 className="title">Liste des Services</h2>
      <div className="categorie-container">
   
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
