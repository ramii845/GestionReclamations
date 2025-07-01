import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
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

        // Ne remplir l'état qu'une seule fois
        if (!initialized) {
          setNom(data.nom || "");
          setNumeroTelephone(data.numero_telephone || "");
          setMatriculeVehicule(data.matricule_vehicule || "");
          setMarque(data.marque || "");
          setModele(data.modele || "");
          setMotdepasse(data.motdepasse || "");
          setRole(data.role || "user");
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

  if (loading) {
    return <div style={{ paddingTop: "80px", textAlign: "center" }}>Chargement...</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!decodedUser) {
      toast.error("Utilisateur non authentifié");
      return;
    }

    const updatedUser = {
      nom,
      numero_telephone,
      matricule_vehicule,
      marque,
      modele,
      motdepasse,
      role,
    };

    try {
      await updateUser(decodedUser.user_id, updatedUser);
      toast.success("Profil mis à jour avec succès !");
      navigate("/categories");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour du profil.");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="edit-user-container" style={{ paddingTop: "80px" }}>
        <h2>Modifier mon profil</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nom :</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Numéro de téléphone :</label>
            <input
              type="tel"
              value={numero_telephone}
              onChange={(e) => setNumeroTelephone(e.target.value)}
              required
            />
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
          <Link
            to="/categories"
            style={{ color: '#0c6b84', fontWeight: '500', textDecoration: 'none' }}
          >
            Retour à la liste des catégories
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
