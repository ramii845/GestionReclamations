import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createReclamation, getAllReclamationsByUser } from "../../services/reclamationService";
import { getCategorieById } from "../../services/categorieService";
import { toast } from "react-toastify";
import "./AddReclamationUser.css";
import "../Navbar/Navbar.css";
import Navbar from "../Navbar/Navbar";

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
  } catch {
    return null;
  }
}

const uploadToCloudinary = async (file, type = "image") => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "iit2024G4");
  data.append("cloud_name", "ditzf19gl");

  const url =
    type === "image"
      ? "https://api.cloudinary.com/v1_1/ditzf19gl/image/upload"
      : "https://api.cloudinary.com/v1_1/ditzf19gl/raw/upload";

  const res = await fetch(url, { method: "POST", body: data });
  const result = await res.json();
  if (!result.secure_url) throw new Error("Échec d’upload Cloudinary");
  return result.secure_url;
};

const AddReclamationUser = () => {
  const { categorie_id } = useParams();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [descriptionProbleme, setDescriptionProbleme] = useState("");
  const [imageVehicule, setImageVehicule] = useState([]);
  const [facturation, setFacturation] = useState([]);
  const [autre, setAutre] = useState("");
  const [nomCategorie, setNomCategorie] = useState("");
  const [listeDescriptions, setListeDescriptions] = useState([]);

  const token = localStorage.getItem("CC_Token");
  const decoded = token ? decodeJWT(token) : null;
  const user_id = decoded?.user_id;

  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        const res = await getCategorieById(categorie_id);
        const nom = res.data.nomCategorie;
        setNomCategorie(nom);

        if (nom === "Service commerciale") {
          setListeDescriptions([
            "Accueil client à l’arrivée au concessionnaire",
            "Crédibilité du service commercial",
            "Service de livraison du véhicule",
            "État du véhicule à la livraison",
            "Problèmes liés à la pose d’accessoires",
            "Autre problème lié au service commerciale",
          ]);
        } else if (nom === "Service Après-Vente") {
          setListeDescriptions([
            "Accueil du conseiller service",
            "Qualité de l’intervention demandée",
            "Respect des délais donnés",
            "Facturation / Devis",
            "Traitement du dossier de garantie",
            "Service SAV succrsale sfax",
            "Autre problème lié au service service Après-Vente",
          ]);
        } else if (nom === "service Administratif") {
          setListeDescriptions([
            "Erreur documents administratifs",
            "Rejet injustifié de dossier",
            "Erreur Client de coordoneeés",
            "Recouvrement / Relevé compte",
            "Autre problème lié au service Administratif",
          ]);
        } else {
          setListeDescriptions([]);
        }
      } catch {
        toast.error("Erreur de chargement de la catégorie.");
      }
    };

    fetchCategorie();
  }, [categorie_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user_id) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    // Vérifier s'il existe déjà une réclamation en cours
    try {
      const res = await getAllReclamationsByUser(user_id);
      const reclamations = res.data || [];
      const enCours = reclamations.find(
        r => r.statut === "En attente" || r.statut === "Prise en charge"
      );
      if (enCours) {
        toast.error("Vous avez déjà une réclamation en cours de traitement.");
        return;
      }
    } catch (err) {
      toast.error("Erreur lors de la vérification des réclamations.");
      return;
    }

    let imageVehiculeUrls = [];
    let facturationUrls = [];

    try {
      if (imageVehicule.length > 0) {
        const uploads = Array.from(imageVehicule).map(file => uploadToCloudinary(file, "image"));
        imageVehiculeUrls = await Promise.all(uploads);
      }

      if (facturation.length > 0) {
        const uploads = Array.from(facturation).map(file => uploadToCloudinary(file, "image"));
        facturationUrls = await Promise.all(uploads);
      }
    } catch {
      toast.error("Échec d’upload vers Cloudinary.");
      return;
    }

    const reclamationData = {
      user_id,
      categorie_id,
      description_probleme: descriptionProbleme,
      autre,
      image_vehicule: imageVehiculeUrls,
      facturation: facturationUrls,
    };

    try {
      await createReclamation(reclamationData);
      toast.success("Réclamation créée avec succès !", { autoClose: 2000 });
      navigate("/confirmation");
    } catch {
      toast.error("Erreur lors de la création de la réclamation.", { autoClose: 2000 });
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="add-reclamation-container" style={{ paddingTop: "80px" }}>
        <h2>Nouvelle Réclamation</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label>Description du problème *</label>
            <select
              value={descriptionProbleme}
              onChange={(e) => setDescriptionProbleme(e.target.value)}
              required
            >
              <option value="">-- Sélectionner un problème --</option>
              {listeDescriptions.map((item, idx) => (
                <option key={idx} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Détails du problème</label>
            <input
              type="text"
              value={autre}
              placeholder="Informations complémentaires"
              onChange={(e) => setAutre(e.target.value)}
            />
          </div>

          <div>
            <label>Images du véhicule (vous pouvez en sélectionner plusieurs)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageVehicule(prev => [...prev, ...Array.from(e.target.files)])}
            />
          </div>

          <div>
            <label>Documents / Facturation (vous pouvez en sélectionner plusieurs)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFacturation(prev => [...prev, ...Array.from(e.target.files)])}
            />
          </div>

          <button type="submit">
            Envoyer
          </button>
        </form>

        <div style={{ marginTop: "15px", marginLeft: "-30px" }}>
          <Link to="/categories" style={{ color: '#0c6b84', fontWeight: '500', textDecoration: 'none' }}>
            Retour à la liste des catégories
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddReclamationUser;
