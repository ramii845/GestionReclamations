import axios from "axios";
import { useEffect, useState } from "react";
import { Form, Card, Button } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { getCategorieById, updateCategorie } from "../../../services/categorieService";
import Navbar from '../../Navbar/Navbar';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const EditCategories = () => {
  const [categorie, setCategorie] = useState({});
  const [files, setFiles] = useState([]);
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
    try {
      await updateCategorie(id, categorie);
      navigate("/categories");
    } catch (error) {
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
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "iit2025S1");
      data.append("cloud_name", "ditzf19gl");
      axios
        .post("https://api.cloudinary.com/v1_1/ditzf19gl/image/upload", data)
        .then((res) => {
          setCategorie({ ...categorie, imageCategorie: res.data.secure_url });
          load(res.data.secure_url);
        })
        .catch((err) => {
          console.error("Erreur Cloudinary :", err);
          error("Upload failed");
          abort();
        });
    },
  });

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "calc(100vh - 60px)",
          paddingTop: "60px",
          backgroundColor: "#f7f9fc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: "15px",
          paddingRight: "15px",
        }}
      >
        <Card
          className="shadow-sm"
          style={{
            width: "100%",
            maxWidth: "520px",
            borderRadius: "14px",
            padding: "30px",
            boxSizing: "border-box",
            backgroundColor: "white",
          }}
        >
          {/* Titre centré, avec un margin bottom pour bien espacer */}
          <h2
            style={{
              color: "#0c847e",
              fontWeight: "700",
              fontSize: "2rem",
              textAlign: "center",
              marginBottom: "30px",
              userSelect: "none",
            }}
          >
            Modifier la catégorie
          </h2>

          <Form onSubmit={handleSave}>
            <Form.Group className="mb-4" controlId="nomCategorie">
              <Form.Label style={{ fontWeight: "600" }}>Nom de la catégorie</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le nom"
                value={categorie.nomCategorie || ""}
                onChange={(e) => setCategorie({ ...categorie, nomCategorie: e.target.value })}
                required
                style={{ fontSize: "1rem", padding: "12px" }}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="imageCategorie">
              <Form.Label style={{ fontWeight: "600" }}>Image de la catégorie</Form.Label>

              <div style={{ maxWidth: "320px", margin: "auto" }}>
                <FilePond
                  files={files}
                  acceptedFileTypes={["image/*"]}
                  onupdatefiles={setFiles}
                  allowMultiple={false}
                  server={serverOptions()}
                  name="file"
                  labelIdle=' <span class="filepond--label-action"> choisir une image </span>'
                  stylePanelLayout="compact circle"
                  stylePanelAspectRatio="1:1"
                />
              </div>
            </Form.Group>

            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="success"
                type="submit"
                style={{ fontWeight: "600", fontSize: "1rem", minWidth: "130px" }}
              >
                <i className="fa-solid fa-floppy-disk me-2"></i> Enregistrer
              </Button>

              <Link
                to="/categories"
                className="btn btn-outline-danger"
                style={{ fontWeight: "600", fontSize: "1rem", minWidth: "130px", textAlign: "center" }}
              >
                <i className="fa-solid fa-arrow-left me-2"></i> Annuler
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default EditCategories;
