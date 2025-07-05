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
      <div
        style={{
          minHeight: "calc(100vh - 60px)",
          paddingTop: "80px",
          background:
            "linear-gradient(135deg,rgb(174, 245, 240) 0%,rgb(170, 245, 245) 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: "20px",
          paddingRight: "20px",
          position: "relative",
        }}
      >
        {/* Effet de particules en arrière-plan */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
            `,
            pointerEvents: "none",
          }}
        />

        <Card
          className="shadow-lg"
          style={{
            width: "100%",
            maxWidth: "580px",
            borderRadius: "24px",
            padding: "40px",
            boxSizing: "border-box",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Effet de brillance en haut */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)",
            }}
          />

          <h2
            style={{
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: "800",
              fontSize: "2.2rem",
              textAlign: "center",
              marginBottom: "35px",
              userSelect: "none",
              letterSpacing: "-0.02em",
            }}
          >
            ✨ Modifier la catégorie
          </h2>

          <Form onSubmit={handleSave}>
            <Form.Group className="mb-4" controlId="nomCategorie">
              <Form.Label
                style={{
                  fontWeight: "700",
                  color: "#374151",
                  fontSize: "1.1rem",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                📝 Nom de la catégorie
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le nom de la catégorie..."
                value={categorie.nomCategorie || ""}
                onChange={(e) =>
                  setCategorie({ ...categorie, nomCategorie: e.target.value })
                }
                required
                style={{
                  fontSize: "1.1rem",
                  padding: "16px 20px",
                  borderRadius: "16px",
                  border: "2px solid #e5e7eb",
                  backgroundColor: "#fafafa",
                  transition: "all 0.3s ease",
                  fontWeight: "500",
                }}
                onFocus={(e) => {
                  e.target.style.border = "2px solid #667eea";
                  e.target.style.backgroundColor = "#ffffff";
                  e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "2px solid #e5e7eb";
                  e.target.style.backgroundColor = "#fafafa";
                  e.target.style.boxShadow = "none";
                }}
              />
            </Form.Group>

            <Form.Group className="mb-5" controlId="imageCategorie">
              <Form.Label
                style={{
                  fontWeight: "700",
                  color: "#374151",
                  fontSize: "1.1rem",
                  marginBottom: "16px",
                  display: "block",
                }}
              >
                🖼️ Image de la catégorie
              </Form.Label>
              <div
                style={{
                  maxWidth: "360px",
                  margin: "auto",
                  padding: "20px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "20px",
                  border: "2px dashed #cbd5e1",
                  transition: "all 0.3s ease",
                }}
              >
                <FilePond
                  files={files}
                  acceptedFileTypes={["image/*"]}
                  onupdatefiles={setFiles}
                  allowMultiple={false}
                  server={serverOptions()}
                  name="file"
                  labelIdle='<span class="filepond--label-action" style="color: #667eea; font-weight: 600;">📸 Choisir une image</span>'
                  stylePanelLayout="compact circle"
                  stylePanelAspectRatio="1:1"
                />
              </div>
            </Form.Group>

            <div
              className="d-flex justify-content-between mt-5"
              style={{ gap: "16px" }}
            >
              <Button
                onClick={(e) => handleSave(e)}
                variant="success"
                type="submit"
                style={{
                  fontWeight: "700",
                  fontSize: "1.1rem",
                  minWidth: "160px",
                  padding: "14px 24px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 15px 35px -5px rgba(16, 185, 129, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 10px 25px -5px rgba(16, 185, 129, 0.4)";
                }}
                disabled={isUploading}
              >
                <i className="fa-solid fa-floppy-disk me-2"></i> Enregistrer
              </Button>
            </div>
          </Form>
        </Card>
      </div>

      {/* Styles CSS personnalisés pour FilePond */}
      <style jsx>{`
        .filepond--root {
          font-family: inherit;
        }

        .filepond--panel-root {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .filepond--panel-root:hover {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .filepond--drop-label {
          color: #64748b;
          font-weight: 600;
        }

        .filepond--label-action {
          text-decoration: none;
          border-radius: 8px;
          padding: 4px 8px;
          background: rgba(102, 126, 234, 0.1);
          transition: all 0.2s ease;
        }

        .filepond--label-action:hover {
          background: rgba(102, 126, 234, 0.2);
        }

        .filepond--item {
          border-radius: 12px;
          overflow: hidden;
        }

        .filepond--item-panel {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
        }

        .filepond--image-preview {
          border-radius: 8px;
        }
      `}</style>
    </>
  );
};

export default EditCategories;
