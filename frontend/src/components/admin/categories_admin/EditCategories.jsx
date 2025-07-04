// ✅ EditCategories.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategorieById, updateCategorie } from "../../../services/categorieService";
import axios from "axios";
import "./EditCategories.css";

const EditCategories = () => {
  const { id } = useParams();
  const [nomCategorie, setNomCategorie] = useState("");
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        const res = await getCategorieById(id);
        setNomCategorie(res.data.nomCategorie);
        setCurrentImage(res.data.imageCategorie);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategorie();
  }, [id]);

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = currentImage;
      if (image) {
        imageUrl = await handleUploadImage();
      }
      await updateCategorie(id, { nomCategorie, imageCategorie: imageUrl });
      navigate("/admin/services");
    } catch (err) {
      console.error("Erreur mise à jour :", err);
    }
  };

  return (
    <div className="edit-cat-container">
      <h2>Modifier la catégorie</h2>
      <form onSubmit={handleUpdate} className="form-cat">
        <input
          type="text"
          value={nomCategorie}
          onChange={(e) => setNomCategorie(e.target.value)}
          required
        />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        {currentImage && <img src={currentImage} alt="actuelle" width={120} />}
        <button type="submit">Mettre à jour</button>
      </form>
    </div>
  );
};

export default EditCategories;
