import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createReclamationWithFiles } from "../../services/reclamationService";
import { getCategorieById } from "../../services/categorieService";
import { toast } from "react-toastify";
import "./AddReclamationUser.css";
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

const AddReclamationUser = () => {
  const { categorie_id } = useParams();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // États formulaire
  const [descriptionProbleme, setDescriptionProbleme] = useState("");
  const [imageVehicule, setImageVehicule] = useState(null);
  const [facturation, setFacturation] = useState(null);
  const [autre, setAutre] = useState("");
  const [nomCategorie, setNomCategorie] = useState("");
  const [listeDescriptions, setListeDescriptions] = useState([]);

  // États menu utilisateur
  const [menuOpen, setMenuOpen] = useState(false);

  // Récupération user_id depuis token JWT
  const token = localStorage.getItem("CC_Token");
  let user_id = null;
  if (token) {
    const decoded = decodeJWT(token);
    if (decoded) {
      user_id = decoded.user_id;
    }
  }

  useEffect(() => {
    // Fermer menu si clic en dehors
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        const res = await getCategorieById(categorie_id);
        setNomCategorie(res.data.nomCategorie);

        if (res.data.nomCategorie === "Service Véhicules Neufs") {
          setListeDescriptions([
            "Accueil client à l’arrivée au concessionnaire",
            "Crédibilité du service commercial",
            "Service de livraison du véhicule",
            "État du véhicule à la livraison",
            "Problèmes liés à la pose d’accessoires",
          ]);
        } else if (res.data.nomCategorie === "Service Après-Vente") {
          setListeDescriptions([
            "Accueil du conseiller service",
            "Qualité de l’intervention demandée",
            "Respect des délais donnés",
            "Facturation / Devis",
            "Traitement du dossier de garantie",
          ]);
        } else {
          setListeDescriptions([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la catégorie", error);
        toast.error("Erreur de chargement de la catégorie.");
      }
    };

    fetchCategorie();
  }, [categorie_id]);

  const handleLogout = () => {
    localStorage.removeItem("CC_Token");
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user_id) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("categorie_id", categorie_id);
    formData.append("description_probleme", descriptionProbleme);
    formData.append("autre", autre);
    if (imageVehicule) formData.append("image_vehicule", imageVehicule);
    if (facturation) formData.append("facturation", facturation);

    try {
      await createReclamationWithFiles(formData);
      toast.success("Réclamation créée avec succès !");
      navigate("/categories");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création de la réclamation.");
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
              <button onClick={() => { setMenuOpen(false); navigate("/profil"); }}>
                Gérer mon compte
              </button>
              <button onClick={handleLogout}>Déconnexion</button>
            </div>
          )}
        </div>
      </nav>

      {/* Contenu formulaire */}
      <div className="add-reclamation-container" style={{ paddingTop: "80px" }}>
        <h2>Nouvelle Réclamation</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label>Description du problème *</label>
            {listeDescriptions.length > 0 ? (
              <select
                value={descriptionProbleme}
                onChange={(e) => setDescriptionProbleme(e.target.value)}
                required
              >
                <option value="">-- Sélectionner un problème --</option>
                {listeDescriptions.map((item, idx) => (
                  <option key={idx} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            ) : (
              <textarea
                value={descriptionProbleme}
                onChange={(e) => setDescriptionProbleme(e.target.value)}
                placeholder="Décrivez le problème"
                required
              />
            )}
          </div>

          <div>
            <label>
              Image du véhicule <span style={{ fontWeight: "normal", fontSize: "0.85rem", color: "#666" }}>
                (si disponible)
              </span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageVehicule(e.target.files[0])}
            />
          </div>

          <div>
            <label>
              Facturation (PDF) <span style={{ fontWeight: "normal", fontSize: "0.85rem", color: "#666" }}>
                (si disponible)
              </span>
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFacturation(e.target.files[0])}
            />
          </div>

          <div>
            <label>Autre information</label>
            <input
              type="text"
              value={autre}
              placeholder="Informations complémentaires (facultatif)"
              onChange={(e) => setAutre(e.target.value)}
            />
          </div>

          <button type="submit">Envoyer</button>
        </form>
      </div>
    </div>
  );
};

export default AddReclamationUser;
