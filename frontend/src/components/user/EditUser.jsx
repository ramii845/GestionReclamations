import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast,ToastContainer } from "react-toastify";
import { updateUser, getUserbyId } from "../../services/authService";
import Navbar from "../Navbar/Navbar";
import './EditUser.css';

function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erreur décodage JWT :", e);
    return null;
  }
}

const EditUser = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("CC_Token");
  const decodedUser = token ? decodeJWT(token) : null;

  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const [nom, setNom] = useState("");
  const [numero_telephone, setNumeroTelephone] = useState("");
  const [matricule_vehicule, setMatriculeVehicule] = useState("");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [role, setRole] = useState("");

  const [photo, setPhoto] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    if (!decodedUser) {
      toast.error("Utilisateur non authentifié");
      navigate("/login");
      return;
    }

    const fetchUserFromDB = async () => {
      try {
        const res = await getUserbyId(decodedUser.user_id);
        const data = res.data;

        if (!initialized) {
          setNom(data.nom || "");
          setNumeroTelephone(data.numero_telephone || "");
          setMatriculeVehicule(data.matricule_vehicule || "");
          setMarque(data.marque || "");
          setModele(data.modele || "");
          setMotdepasse(data.motdepasse || "");
          setRole(data.role || "user");
          setPhoto(data.photo || "");
          setInitialized(true);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement données utilisateur :", error);
        toast.error("Impossible de récupérer les données utilisateur");
        setLoading(false);
      }
    };

    fetchUserFromDB();
  }, [decodedUser, navigate, initialized]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoFile(file);
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
data.append('upload_preset', 'iit2024G4');
    data.append('cloud_name', 'ditzf19gl');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/ditzf19gl/image/upload', {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.secure_url) return json.secure_url;
      else throw new Error("Échec de l’upload");
    } catch (error) {
      toast.error("Erreur d’upload de la photo");
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!decodedUser) {
      toast.error("Utilisateur non authentifié");
      return;
    }

    let photoUrl = photo;
    if (photoFile) {
      try {
        photoUrl = await uploadToCloudinary(photoFile);
      } catch {
        return;
      }
    }

    const updatedUser = {
      nom,
      numero_telephone,
      matricule_vehicule,
      marque,
      modele,
      motdepasse,
      role,
      photo: photoUrl,
    };

    try {
      await updateUser(decodedUser.user_id, updatedUser);
      toast.success("Profil mis à jour avec succès !",{ autoClose: 2000 });
     setTimeout(() => navigate("/categories"),1500);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour du profil.",{ autoClose: 2000 });
    }
  };

  if (loading) {
    return <div style={{ paddingTop: "80px", textAlign: "center" }}>Chargement...</div>;
  }

  return (
    <div className="">
      <Navbar />

      <div className="edit-user-container" style={{ paddingTop: "80px" }}>
        {/* PHOTO */}
        <div className="photo-upload-container" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <label htmlFor="photo-input" className="camera-icon-label" style={{ cursor: 'pointer' }}>
            <img
              src={photoFile ? URL.createObjectURL(photoFile) : (photo || "https://res.cloudinary.com/ditzf19gl/image/upload/v1752069934/fokroapqqpmvxpzoydow.jpg")}
              alt="photo"
              className="camera-icon"
              style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
            />
          </label>
          <input
            type="file"
            id="photo-input"
            name="photo"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
        </div>

        <h2>Modifier mon profil</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nom :</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>

          <div>
            <label>Numéro de téléphone :</label>
            <input type="tel" value={numero_telephone} onChange={(e) => setNumeroTelephone(e.target.value)} required />
          </div>

          <div>
            <label>Matricule du véhicule :</label>
            <input type="text" value={matricule_vehicule} disabled />
          </div>

          <div>
            <label>Marque :</label>
            <input type="text" value={marque} disabled />
          </div>

          <div>
            <label>Modèle :</label>
            <input type="text" value={modele} disabled />
          </div>

          <button type="submit">Enregistrer</button>
        </form>

        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <Link to="/categories" style={{ color: '#0c6b84', fontWeight: '500', textDecoration: 'none' }}>
            Retour à la liste des catégories
          </Link>
        </div>
      </div>
          <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EditUser;
