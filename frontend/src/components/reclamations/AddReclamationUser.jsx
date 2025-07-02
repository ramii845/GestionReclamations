import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createReclamation } from "../../services/reclamationService";
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

  const res = await fetch(url, {
    method: "POST",
    body: data,
  });

  const result = await res.json();
  if (!result.secure_url) throw new Error("Échec de l’upload Cloudinary");
  return result.secure_url;
};

const AddReclamationUser = () => {
  const { categorie_id } = useParams();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [descriptionProbleme, setDescriptionProbleme] = useState("");
  const [imageVehicule, setImageVehicule] = useState(null);
  const [facturation, setFacturation] = useState(null);
  const [autre, setAutre] = useState("");
  const [nomCategorie, setNomCategorie] = useState("");
  const [listeDescriptions, setListeDescriptions] = useState([]);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("CC_Token");
  const decoded = token ? decodeJWT(token) : null;
  const user_id = decoded?.user_id;

  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        const res = await getCategorieById(categorie_id);
        const nom = res.data.nomCategorie;
        setNomCategorie(nom);

        if (nom === "Service Véhicules Neufs") {
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
            "Autre problème lié au service commerciale"
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

    setUploading(true);
    let imageVehiculeUrl = "";
    let facturationUrl = "";

    try {
      if (imageVehicule) {
        imageVehiculeUrl = await uploadToCloudinary(imageVehicule, "image");
      }
      if (facturation) {
        facturationUrl = await uploadToCloudinary(facturation, "image");
      }
    } catch {
      toast.error("Échec d’upload vers Cloudinary.");
      setUploading(false);
      return;
    }

    const reclamationData = {
      user_id,
      categorie_id,
      description_probleme: descriptionProbleme,
      autre,
      image_vehicule: imageVehiculeUrl,
      facturation: facturationUrl,
    };

    try {
      await createReclamation(reclamationData);
      toast.success("Réclamation créée avec succès !");
      navigate("/confirmation");
    } catch {
      toast.error("Erreur lors de la création de la réclamation.");
    } finally {
      setUploading(false);
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
            <label>Détails du problème</label>
            <input
              type="text"
              value={autre}
              placeholder="Informations complémentaires"
              onChange={(e) => setAutre(e.target.value)}
            />
          </div>

          <div>
            <label>
              Image du véhicule <span style={{ fontWeight: "normal", fontSize: "0.85rem", color: "#666" }}>
                (si possible)
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
              Image Document  <span style={{ fontWeight: "normal", fontSize: "0.85rem", color: "#666" }}>
                (si possible)
              </span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFacturation(e.target.files[0])}
            />
          </div>

        

          <button type="submit" disabled={uploading}>
            {uploading ? "Envoyer" : "Envoyer"}
          </button>
        </form>

        <div style={{ marginTop: "-30px", textAlign: "center" }}>
          <Link
            to="/categories"
            style={{ color: "#0c6b84", fontWeight: "500", textDecoration: "none" }}
          >
            Retour à la liste des catégories
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddReclamationUser;
