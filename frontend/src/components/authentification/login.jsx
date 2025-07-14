import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signin } from '../../services/authService';
import { getReclamationsByUser } from '../../services/reclamationService';
import { toast, ToastContainer } from 'react-toastify';
import './AuthForm.css';

const Login = () => {
  const navigate = useNavigate();
  const [matricule_vehicule, setMatriculeVehicule] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userData = { matricule_vehicule, motdepasse };

    try {
      const res = await signin(userData);
      const result = res.data;

      localStorage.setItem('CC_Token', result.token);

      const tokenPayload = JSON.parse(atob(result.token.split('.')[1]));
      const role = tokenPayload.role;
      const user_id = tokenPayload.user_id;

      toast.success('Connexion réussie !', { autoClose: 2000 });

      if (role === 'admin') {
        setTimeout(() => navigate('/adminPage'), 1500);
      } else {
        try {
          const rec = await getReclamationsByUser(user_id);
          if (rec?.data?.id) {
            setTimeout(() => navigate('/consulterEtat'), 1500);
          } else {
            setTimeout(() => navigate('/categories'), 1500);
          }
        } catch (err) {
          setTimeout(() => navigate('/categories'), 1500);
        }
      }

    } catch (err) {
      console.error("Erreur dans catch :", err);
      toast.error("Connexion échouée : veuillez vérifier vos identifiants.", { autoClose: 2000 });
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
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <i className="fas fa-lock"></i>
            <input
              type={showPassword ? 'text' : 'password'}
              value={motdepasse}
              onChange={(e) => setMotdepasse(e.target.value)}
              required
              style={{ paddingRight: '2.5rem' }}
            />
            <i
              onClick={() => setShowPassword(!showPassword)}
              className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#888',
                fontSize: '1.1rem',
                userSelect: 'none',
              }}
              aria-label={showPassword ? 'Masquer mot de passe' : 'Afficher mot de passe'}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword);
              }}
            />
          </div>
        </div>

        <button className="button" type="submit">
          Se connecter
        </button>

        <div className="below-button-links">
          <Link className="custom-link" to="/reset-password">
            Mot de passe oublié ?
          </Link>
        </div>

        <p className="text-center text-sm pt-4" style={{ color: '#555', fontWeight: 'normal' }}>
          Vous n’avez pas de compte ?{' '}
          <Link to="/register" style={{ color: '#0c6b84', fontWeight: '500', textDecoration: 'none' }}>
            S’inscrire
          </Link>
        </p>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
