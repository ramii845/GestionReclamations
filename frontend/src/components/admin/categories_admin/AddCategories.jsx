import React, { useState } from "react";
import { createCategorie } from "../../../services/categorieService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Navbar/Navbar";
import { toast, ToastContainer } from "react-toastify";  // Import toastify
import "react-toastify/dist/ReactToastify.css";          // Import styles toastify

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

setTimeout(() => {
  navigate("/admin/services");
}, 2000);   // navigation immédiate OK
  } catch (err) {
    console.error("Erreur ajout catégorie:", err);

    toast.error("Erreur lors de l'ajout de la catégorie.");
  }
};


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <>
      <Navbar />
      <ToastContainer /> {/* Conteneur toast */}
      <div
        style={{
          minHeight: "calc(100vh - 60px)",
          paddingTop: "60px",
          background:"#F0FFF4",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: "100px",
          paddingRight: "100px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
       
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: "750px",
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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "800",
              fontSize: "2.2rem",
              textAlign: "center",
              marginBottom: "35px",
              userSelect: "none",
              letterSpacing: "-0.02em",
            }}
          >
             Ajouter une catégorie
          </h2>

          <form onSubmit={handleSubmit}>
            <label
              style={{
                fontWeight: "700",
                color: "#374151",
                fontSize: "1.1rem",
                marginBottom: "12px",
                display: "block",
              }}
            >
              📝 Nom de la catégorie
            </label>
            <input
              type="text"
              placeholder="Nom catégorie"
              value={nomCategorie}
              onChange={(e) => setNomCategorie(e.target.value)}
              required
              style={{
                fontSize: "1.1rem",
                padding: "16px 20px",
                borderRadius: "16px",
                border: "2px solid #e5e7eb",
                backgroundColor: "#fafafa",
                transition: "all 0.3s ease",
                fontWeight: "500",
                width: "100%",
                marginBottom: "25px",
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

            <label
              style={{
                fontWeight: "700",
                color: "#374151",
                fontSize: "1.1rem",
                marginBottom: "12px",
                display: "block",
              }}
            >
              🖼️ Image de la catégorie
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              style={{
                fontSize: "1.05rem",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "2px dashed #cbd5e1",
                backgroundColor: "#f8fafc",
                marginBottom: "20px",
              }}
            />

            {preview && (
              <div style={{ textAlign: "center", marginBottom: "25px" }}>
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "16px",
                    objectFit: "cover",
                    border: "2px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              </div>
            )}

        <button
  type="submit"
  style={{
    fontWeight: "700",
    fontSize: "1.1rem",
    minWidth: "160px",
    padding: "14px 24px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = "0 15px 35px -5px rgba(16, 185, 129, 0.5)";
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow = "0 10px 25px -5px rgba(16, 185, 129, 0.4)";
  }}
>
  Ajouter 
</button>

          </form>
        </div>
      </div>
    </>
  );
};

export default AddCategories;
