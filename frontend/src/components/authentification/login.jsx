import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signin } from '../../services/authService';
import { toast } from 'react-toastify';  // <-- Import react-toastify
import './AuthForm.css';

const Login = () => {
  const navigate = useNavigate();
  const [matricule_vehicule, setMatriculeVehicule] = useState('');
  const [motdepasse, setMotdepasse] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userData = {
      matricule_vehicule,
      motdepasse,
    };

    try {
      const res = await signin(userData);
      const result = res.data;

      if (result.token) {
        localStorage.setItem("CC_Token", result.token);
        localStorage.setItem("user", JSON.stringify(result));

        toast.success("Connexion réussie !", { autoClose: 2000 });

        if (result.role === "admin") navigate("/adminPage");
        else navigate("/userPage");
      } else {
        toast.error("Identifiants invalides.");
      }
    } catch (err) {
      toast.error("Erreur de connexion : " + (err.response?.data?.detail || "Veuillez réessayer."));
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form-container">
        <h2 className="auth-title">Connexion</h2>

        <div className="input-group">
          <label className="text-sm font-semibold">Matricule véhicule</label>
          <div className="input-wrapper">
            <i className="fas fa-id-card"></i>
            <input
              type="text"
              value={matricule_vehicule}
              onChange={(e) => setMatriculeVehicule(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="text-sm font-semibold">Mot de passe</label>
          <div className="input-wrapper">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              value={motdepasse}
              onChange={(e) => setMotdepasse(e.target.value)}
              required
            />
          </div>
        </div>

        <button className="button" type="submit">Se connecter</button>

        <div className="below-button-links">
          <Link className="forgot-link" to="/reset-password">
            Mot de passe oublié ?
          </Link>
        </div>

        <Link className="pt-4 text-slate-500 text-sm block text-center" to="/register">
          Vous n’avez pas de compte ? S’inscrire
        </Link>
      </form>
    </div>
  );
};

export default Login;
