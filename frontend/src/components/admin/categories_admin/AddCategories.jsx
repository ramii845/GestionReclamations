// ✅ AddCategories.jsx
import React, { useState } from "react";
import { createCategorie } from "../../../services/categorieService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import'./AddCategories.css';

const AddCategories = () => {
  const [nomCategorie, setNomCategorie] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleUploadImage = async () => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "iit2024G4"); // 🔁 ton preset Cloudinary

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
      navigate("/admin/services");
    } catch (err) {
      console.error("Erreur ajout catégorie:", err);
    }
  };

  return (
    <div className="add-cat-container">
      <h2>Ajouter une catégorie</h2>
      <form onSubmit={handleSubmit} className="form-cat">
        <input
          type="text"
          placeholder="Nom catégorie"
          value={nomCategorie}
          onChange={(e) => setNomCategorie(e.target.value)}
          required
        />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};
export default AddCategories;