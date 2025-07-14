import React, { useState } from "react";
import { createCategorie } from "../../../services/categorieService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Navbar/Navbar";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddCategories.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const AddCategories = () => {
  const [nomCategorie, setNomCategorie] = useState("");
  const [imageCategorie, setImageCategorie] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const serverOptions = () => ({
    load: (source, load) => {
      fetch(source)
        .then((res) => res.blob())
        .then((blob) => load(blob));
    },
    process: (fieldName, file, metadata, load, error, progress, abort) => {
      setIsUploading(true);
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "iit2024G4");
      data.append("cloud_name", "ditzf19gl");

      axios
        .post("https://api.cloudinary.com/v1_1/ditzf19gl/image/upload", data)
        .then((res) => {
          setImageCategorie(res.data.secure_url); // enregistrer l'URL de l'image
          load(res.data.secure_url); // informer FilePond
        })
        .catch(() => {
          error("Erreur upload image");
          abort();
        })
        .finally(() => {
          setIsUploading(false);
        });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageCategorie) return toast.error("Veuillez ajouter une image.");
    try {
      await createCategorie({ nomCategorie, imageCategorie });
      toast.success("Catégorie ajoutée avec succès !");
      setTimeout(() => navigate("/admin/services"), 2000);
    } catch (err) {
      console.error("Erreur ajout catégorie:", err);
      toast.error("Erreur lors de l'ajout de la catégorie.");
    }
  };

  const handleCancel = () => {
    navigate("/admin/services");
  };

  return (
    <>
      <Navbar />
      <div className="add-container">
        <div className="add-card">
          <h2 className="add-title">Ajouter un service</h2>
          <form onSubmit={handleSubmit}>
            <label className="form-label">📝 Nom du service</label>
            <input
              type="text"
              placeholder="Nom catégorie"
              value={nomCategorie}
              onChange={(e) => setNomCategorie(e.target.value)}
              required
              className="form-input"
            />

            <label className="form-label">🖼️ Image du service</label>
            <FilePond
              allowMultiple={false}
              acceptedFileTypes={["image/*"]}
              server={serverOptions()}
              name="file"
              labelIdle='Glissez-déposez ou <span class="filepond--label-action">Parcourir</span>'
            />

            <div className="btn-group">
              <button
                type="submit"
                name="c1"
                className="submit-btn2"
                disabled={isUploading}
              >
                {isUploading ? "Envoi en cours..." : "Ajouter"}
              </button>
              <button
                type="button"
                name="c2"
                onClick={handleCancel}
                className="cancel-btn2"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
};

export default AddCategories;
