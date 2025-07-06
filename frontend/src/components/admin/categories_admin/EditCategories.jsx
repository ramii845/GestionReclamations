import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { getCategorieById, updateCategorie } from "../../../services/categorieService";
import Navbar from "../../Navbar/Navbar";
import "./EditCategories.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const EditCategories = () => {
  const [categorie, setCategorie] = useState({});
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategorie = async () => {
      try {
        const res = await getCategorieById(id);
        setCategorie(res.data);
        setFiles([
          {
            source: res.data.imageCategorie,
            options: { type: "local" },
          },
        ]);
      } catch (error) {
        console.error("Erreur chargement catégorie :", error);
      }
    };
    loadCategorie();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return;
    try {
      await updateCategorie(id, categorie);
      toast.success("Catégorie modifiée !");
      navigate("/admin/services");
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

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
          setCategorie((prev) => ({
            ...prev,
            imageCategorie: res.data.secure_url,
          }));
          load(res.data.secure_url);
        })
        .catch((err) => {
          error("Erreur upload image");
          abort();
        })
        .finally(() => {
          setIsUploading(false);
        });
    },
  });

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="simple-edit-container">
        <h2>Modifier la catégorie</h2>
        <form onSubmit={handleSubmit} className="simple-form">
          <label>Nom de la catégorie :</label>
          <input
            type="text"
            name="a1"
            value={categorie.nomCategorie || ""}
            onChange={(e) =>
              setCategorie({ ...categorie, nomCategorie: e.target.value })
            }
            required
          />

          <label name="a5">Image de la catégorie :</label>
          <FilePond
            files={files}
            onupdatefiles={setFiles}
            allowMultiple={false}
            server={serverOptions()}
            name="file"
            labelIdle="📸 Choisir une image"
            acceptedFileTypes={["image/*"]}
          />

          <div className="simple-buttons">
            <button type="submit" name="a2" disabled={isUploading}>
              Enregistrer
            </button>
            <button type="button" onClick={() => navigate("/admin/services")}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditCategories;
