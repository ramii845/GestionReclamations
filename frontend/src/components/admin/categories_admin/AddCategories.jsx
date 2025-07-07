import React, { useState } from "react";
import { createCategorie } from "../../../services/categorieService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Navbar/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddCategories.css"; // Import du fichier CSS

// ... (imports inchangés)
import "./AddCategories.css"; // Import CSS

const AddCategories = () => {
  const [nomCategorie, setNomCategorie] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleUploadImage = async () => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "iit2024G4");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/ditzf19gl/image/upload",
      formData
    );
    return res.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrl = await handleUploadImage();
      await createCategorie({ nomCategorie, imageCategorie: imageUrl });
      toast.success("Catégorie ajoutée avec succès !");
      setTimeout(() => navigate("/admin/services"), 2000);
    } catch (err) {
      console.error("Erreur ajout catégorie:", err,{ autoClose: 2000 });
      toast.error("Erreur lors de l'ajout de la catégorie.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    navigate("/admin/services");
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="add-container">
        <div className="add-card">
          <h2 className="add-title">Ajouter une service</h2>
          <form onSubmit={handleSubmit}>
            <label className="form-label">📝 Nom du service </label>
            <input
              type="text"
              placeholder="Nom catégorie"
              value={nomCategorie}
              onChange={(e) => setNomCategorie(e.target.value)}
              required
              className="form-input"
            />

            <label className="form-label">🖼️ Image du service </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="form-file"
            />

            {preview && (
              <div className="preview-container">
                <img src={preview} alt="preview" className="preview-image" />
              </div>
            )}

            <div className="btn-group">
              <button type="submit"  name="c1" className="submit-btn2">Ajouter</button>
              <button type="button" name="c2" onClick={handleCancel} className="cancel-btn2">Annuler</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddCategories;
