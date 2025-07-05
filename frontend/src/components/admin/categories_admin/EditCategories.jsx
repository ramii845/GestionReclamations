import axios from "axios";
import { useEffect, useState } from "react";
import { Form, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { getCategorieById, updateCategorie } from "../../../services/categorieService";
import Navbar from "../../Navbar/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "./EditCategories.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const EditCategories = () => {
  const [categorie, setCategorie] = useState({});
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    loadCategorie();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (isUploading) return;
    try {
      await updateCategorie(id, categorie);
      toast.success("Catégorie modifiée avec succès !");
      navigate("/admin/services");
    } catch (error) {
      toast.error("Erreur lors de la modification.");
      console.error("Erreur update :", error);
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
          console.error("Erreur Cloudinary :", err);
          error("Upload failed");
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
      <div className="edit-container">
        <Card className="edit-card">
          <h2 className="edit-title">✨ Modifier la catégorie</h2>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-4" controlId="nomCategorie">
              <Form.Label className="form-label">📝 Nom de la catégorie</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le nom de la catégorie..."
                value={categorie.nomCategorie || ""}
                onChange={(e) =>
                  setCategorie({ ...categorie, nomCategorie: e.target.value })
                }
                required
                className="form-input"
              />
            </Form.Group>

            <Form.Group className="mb-5" controlId="imageCategorie">
              <Form.Label className="form-label">🖼️ Image de la catégorie</Form.Label>
              <div className="upload-box">
                <FilePond
                  files={files}
                  acceptedFileTypes={["image/*"]}
                  onupdatefiles={setFiles}
                  allowMultiple={false}
                  server={serverOptions()}
                  name="file"
                  labelIdle='<span class="filepond--label-action">📸 Choisir une image</span>'
                  stylePanelLayout="compact circle"
                  stylePanelAspectRatio="1:1"
                />
              </div>
            </Form.Group>

            <div className="form-buttons">
              <Button
                variant="success"
                type="submit"
                className="save-btn"
                disabled={isUploading}
              >
                Enregistrer
              </Button>

              <Button
                variant="outline-secondary"
                onClick={() => navigate("/admin/services")}
                className="cancel-btn"
              >
                Annuler
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default EditCategories;
