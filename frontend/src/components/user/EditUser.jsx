import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateUser } from "../../services/authService";
import './EditUser.css';
import "../Navbar/Navbar.css";

function decodeJWT(token) {
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
}

const EditUser = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const token = localStorage.getItem("CC_Token");
  const decodedUser = token ? decodeJWT(token) : null;

  const [nom, setNom] = useState("");
  const [numero_telephone, setNumeroTelephone] = useState("");
  const [matricule_vehicule, setMatriculeVehicule] = useState("");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [role, setRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!decodedUser) {
      toast.error("Utilisateur non authentifié");
      navigate("/login");
      return;
    }

    setNom(decodedUser.nom || "");
    setNumeroTelephone(decodedUser.numero_telephone || "");
    setMatriculeVehicule(decodedUser.matricule_vehicule || "");
    setMarque(decodedUser.marque || "");
    setModele(decodedUser.modele || "");
    setMotdepasse(decodedUser.motdepasse || "");
    setRole(decodedUser.role || "user");
  }, [decodedUser, navigate]);

  // Fermer menu si clic en dehors
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!decodedUser) {
      toast.error("Utilisateur non authentifié");
      return;
    }

    const updatedUser = {
      nom,
      numero_telephone,
      matricule_vehicule,
      marque,
      modele,
      motdepasse,
      role,
    };

    try {
      await updateUser(decodedUser.user_id, updatedUser);
      toast.success("Profil mis à jour avec succès !");
      navigate("/categories");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour du profil.");
    }
  };

  return (
    <div className="page-wrapper">
      {/* NAVBAR */}
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
            src="/images/logo3.png"
            alt="Profil utilisateur"
            className="user-image"
            onClick={() => setMenuOpen(!menuOpen)}
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

      {/* FORMULAIRE EDIT USER */}
      <div className="edit-user-container" style={{ paddingTop: "80px" }}>
        <h2>Modifier mon profil</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nom :</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Numéro de téléphone :</label>
            <input
              type="tel"
              value={numero_telephone}
              onChange={(e) => setNumeroTelephone(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Matricule du véhicule :</label>
            <input type="text" value={matricule_vehicule} disabled />
          </div>

          <div>
            <label>Marque :</label>
            <input type="text" value={marque} disabled />
          </div>

          <div>
            <label>Modèle :</label>
            <input type="text" value={modele} disabled />
          </div>

          <button type="submit">Enregistrer</button>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
