import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserbyId } from "../../services/authService"; // adapte ce chemin si besoin
import "./Navbar.css";

const decodeJWT = (token) => {
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
  } catch (e) {
    console.error("Erreur décodage JWT :", e);
    return null;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [photo, setPhoto] = useState("");


  useEffect(() => {
    const token = localStorage.getItem("CC_Token");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.user_id) {
        getUserbyId(decoded.user_id)
  .then((res) => {
    setNom(res.data.nom);
    setPhoto(res.data.photo);  // <-- ajoute ça
  })
  .catch((err) => console.error("Erreur récupération nom :", err));
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("CC_Token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div
        className="navbar-accueil"
        onClick={() => {
          localStorage.removeItem("CC_Token");
          navigate("/");
        }}
        style={{ cursor: "pointer" }}
      >
        Accueil
      </div>

      <div
        className="navbar-user"
        ref={menuRef}
        style={{ display: "flex", alignItems: "center", marginRight: "50px" }}
      >
        <span
          className="user-name"
          style={{
            color: "white",
            fontWeight: "600",
            marginRight: "10px",
            fontSize: "1rem",
            userSelect: "none",
          }}
        >
          {nom}
        </span>

      <img
  src={photo ? photo : "/images/logo3.png"}
  alt="Profil utilisateur"
  className="user-image"
  onClick={() => setMenuOpen(!menuOpen)}
  style={{ cursor: "pointer" }}
/>


        {menuOpen && (
          <div className="user-menu">
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/profil");
              }}
            >
              Gérer mon compte
            </button>
            <button onClick={handleLogout}>Déconnexion</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
