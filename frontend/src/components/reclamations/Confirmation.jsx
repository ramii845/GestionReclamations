import React from "react";
import { useNavigate } from "react-router-dom";

const Confirmation = () => {
  const navigate = useNavigate();

  const handleQuitter = () => {
    localStorage.removeItem("CC_Token");
    navigate("/login");
  };

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f0f4f8",
      padding: "40px"
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        maxWidth: "500px",
        textAlign: "center"
      }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="#4BB543"
          style={{ width: "64px", height: "64px", marginBottom: "20px" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>

        <h1 style={{ color: "#333", marginBottom: "16px" }}>
          Merci pour votre réclamation.
        </h1>
        <p style={{ color: "#555", fontSize: "18px", marginBottom: "24px" }}>
          L’agence <strong>Auto Lion</strong> vous remercie pour votre confiance<br />
          et s'engage à traiter votre demande dans les plus brefs délais.
        </p>

        <button
          onClick={handleQuitter}
          style={{
            padding: "12px 28px",
            backgroundColor: "#0c6b84",
            color: "white",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(12,107,132,0.4)",
            cursor: "pointer",
            transition: "background-color 0.3s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#09505a"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0c6b84"}
        >
          Quitter
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
