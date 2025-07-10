import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createReclamation } from "../../../services/reclamationService";
import { getAllCategories } from "../../../services/categorieService";
import { Form, Button, Container, Card, InputGroup } from 'react-bootstrap';
import { getUsersPaginated } from "../../../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../../Navbar/Navbar";

const AddReclamationAdmin = () => {
  const navigate = useNavigate();

  const [descriptionProbleme, setDescriptionProbleme] = useState("");
  const [imageVehicule, setImageVehicule] = useState(null);
  const [facturation, setFacturation] = useState(null);
  const [autre, setAutre] = useState("");
  const [userId, setUserId] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  const autresProblemes = [
    "Accueil client à l’arrivée au concessionnaire",
    "Crédibilité du service commercial",
    "Service de livraison du véhicule",
    "État du véhicule à la livraison",
    "Problèmes liés à la pose d’accessoires",
    "Autre problème lié au service commerciale",
    "Accueil du conseiller service",
    "Qualité de l’intervention demandée",
    "Respect des délais donnés",
    "Facturation / Devis",
    "Traitement du dossier de garantie",
    "Autre problème lié au service service Après-Vente",
    "Autre"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUsers = await getUsersPaginated(1, 100);
        const resCategories = await getAllCategories();
        setUsers(resUsers.data.users || []);
        setCategories(resCategories.data.categories || []);
      } catch {
        toast.error("Erreur lors du chargement des utilisateurs ou des catégories.");
      }
    };
    fetchData();
  }, []);

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
    if (!result.secure_url) throw new Error("Échec d’upload");
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !categorieId || !descriptionProbleme) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
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
      toast.error("Erreur lors de l'upload.");
      setUploading(false);
      return;
    }

    const reclamationData = {
      user_id: userId,
      categorie_id: categorieId,
      description_probleme:
        descriptionProbleme === "Autre" ? autre : descriptionProbleme,
      autre,
      image_vehicule: imageVehiculeUrl ? [imageVehiculeUrl] : [],
facturation: facturationUrl ? [facturationUrl] : [],

    };

    try {
      await createReclamation(reclamationData);
      toast.success("Réclamation créée avec succès !",{ autoClose: 2000 });
      navigate("/admin/reclamations");
    } catch {
      toast.error("Erreur lors de la création.",{ autoClose: 2000 });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="add-reclamation-container" style={{ paddingTop: "80px" }}>
        <h2>Nouvelle Réclamation (Admin)</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label>Utilisateur *</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            >
              <option value="">-- Sélectionner un utilisateur --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Catégorie *</label>
            <select
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value)}
              required
            >
              <option value="">-- Sélectionner une catégorie --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nomCategorie}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Description du problème *</label>
            <select
              value={descriptionProbleme}
              onChange={(e) => setDescriptionProbleme(e.target.value)}
              required
            >
              <option value="">-- Sélectionner une description --</option>
              {autresProblemes.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {descriptionProbleme === "Autre" && (
            <div>
              <label>Veuillez préciser</label>
              <input
                type="text"
                value={autre}
                onChange={(e) => setAutre(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label>Image du véhicule</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageVehicule(e.target.files[0])}
            />
          </div>

          <div>
            <label>Document (image)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFacturation(e.target.files[0])}
            />
          </div>

           <div className="d-flex justify-content-end mt-4">
                   
                      <Button variant="primary" type="submit">
                        Enregistrer
                      </Button>
                         <Button variant="secondary" className="me-2" onClick={() => navigate("/admin/utilisateurs")}>
                        Annuler
                      </Button>
                    </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddReclamationAdmin;
