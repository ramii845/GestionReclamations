import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../../services/authService';
import { toast } from 'react-toastify';  // Import toastify
import './registerForm.css';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: '',
    matricule_vehicule: '',
    numero_telephone: '',
    motdepasse: '',
    motdepasse2: '',
    marque: '',
    modele: '',
  });

  const modelesParMarque = {
    Peugeot: ['208', '308', '508'],
    Citroen: ['C3', 'C4', 'C5'],
    Opel: ['Corsa', 'Astra', 'Mokka'],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      (name === 'numero_telephone' || name === 'matricule_vehicule') &&
      !/^\d*$/.test(value)
    ) {
      return; // n'accepte que les chiffres
    }

    setForm({ ...form, [name]: value, ...(name === 'marque' ? { modele: '' } : {}) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.motdepasse !== form.motdepasse2) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    const userData = {
      nom: form.nom,
      matricule_vehicule: form.matricule_vehicule,
      numero_telephone: form.numero_telephone,
      motdepasse: form.motdepasse,
      marque: form.marque,
      modele: form.modele,
      role: 'user',
    };

    try {
      const res = await signup(userData);
      if (res && res.data) {
        toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        navigate('/login');
      } else {
        toast.error('Erreur lors de l’inscription');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de l’inscription');
      console.error(err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <form onSubmit={handleSubmit} className="register-form">
          <p className="text-xl font-bold mb-6">Créer un compte</p>

          <div className="input-group">
            <p className="text-sm font-semibold">Nom</p>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <p className="text-sm font-semibold">Matricule véhicule</p>
            <input
              type="text"
              name="matricule_vehicule"
              value={form.matricule_vehicule}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <p className="text-sm font-semibold">Marque</p>
            <select
              name="marque"
              value={form.marque}
              onChange={handleChange}
              required
            >
              <option value="">-- Sélectionnez une marque --</option>
              <option value="Peugeot">Peugeot</option>
              <option value="Citroen">Citroën</option>
              <option value="Opel">Opel</option>
            </select>
          </div>

          {form.marque && (
            <div className="input-group">
              <p className="text-sm font-semibold">Modèle</p>
              <select
                name="modele"
                value={form.modele}
                onChange={handleChange}
                required
              >
                <option value="">-- Sélectionnez un modèle --</option>
                {modelesParMarque[form.marque].map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="input-group">
            <p className="text-sm font-semibold">Numéro de téléphone</p>
            <input
              type="text"
              name="numero_telephone"
              value={form.numero_telephone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <p className="text-sm font-semibold">Mot de passe</p>
            <input
              type="password"
              name="motdepasse"
              value={form.motdepasse}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <p className="text-sm font-semibold">Confirmer le mot de passe</p>
            <input
              type="password"
              name="motdepasse2"
              value={form.motdepasse2}
              onChange={handleChange}
              required
            />
          </div>

          <button className="buttonRegister" type="submit">
            Créer un compte
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
