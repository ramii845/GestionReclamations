import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signup } from '../../services/authService'; // adapte si besoin
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
    photoFile: null,
  });

  const [uploading, setUploading] = useState(false);

  // États pour afficher/masquer les mots de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const modelesParMarque = {
    Peugeot: ['LANDTREK', 'EXPERT', 'Boxer', 'Traveller', '208', '301', '2008', '308', '3008', '508', '5008', 'Rifter', 'Partner'],
    Citroen: ['C3 POPULAIRE', 'JUMPY FOURGON', 'Berlingo', 'BERLINGO VAN', 'C4 X', 'Jumper'],
    Opel: ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'COMBO CARGO']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'numero_telephone' && (!/^\d*$/.test(value) || value.length > 8)) return;
    if (name === 'matricule_vehicule' && value.length > 9) return;
    setForm({ ...form, [name]: value, ...(name === 'marque' ? { modele: '' } : {}) });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm({ ...form, photoFile: file });
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'iit2024G4');
    data.append('cloud_name', 'ditzf19gl');

    setUploading(true);
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/ditzf19gl/image/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      setUploading(false);
      if (json.secure_url) {
        return json.secure_url;
      } else {
        throw new Error('Échec de l’upload');
      }
    } catch (error) {
      setUploading(false);
      toast.error("Erreur lors de l’upload de la photo");
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.motdepasse !== form.motdepasse2) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (form.numero_telephone.length !== 8) {
      toast.error('Le numéro de téléphone doit contenir exactement 8 chiffres');
      return;
    }
    if (form.matricule_vehicule.length !== 9) {
  toast.error('Le matricule du véhicule doit contenir exactement 9 caractères');
  return;
}


    let photoUrl = '';
    if (form.photoFile) {
      try {
        photoUrl = await uploadToCloudinary(form.photoFile);
      } catch {
        return;
      }
    }

    const formData = new FormData();
    formData.append('nom', form.nom);
    formData.append('matricule_vehicule', form.matricule_vehicule);
    formData.append('numero_telephone', form.numero_telephone);
    formData.append('motdepasse', form.motdepasse);
    formData.append('marque', form.marque);
    formData.append('modele', form.modele);
    formData.append('role', 'user');
    formData.append('photo', photoUrl);

    try {
      await signup(formData);
      toast.success('Inscription réussie ! Vous pouvez vous connecter.',{ autoClose: 2000 });
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l’inscription',{ autoClose: 2000 });
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <form onSubmit={handleSubmit} className="register-form" encType="multipart/form-data">

          <div className="photo-upload-container">
            <label htmlFor="photo-input" className="camera-icon-label">
              <img
                src={form.photoFile ? URL.createObjectURL(form.photoFile) : '/images/camera.jpg'}
                alt="photo"
                className="camera-icon"
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

          <p className="text-xl font-bold mb-6">Créer un compte</p>

          <div className="input-group">
            <p className="text-sm font-semibold">Nom et Prénom</p>
            <input type="text" name="nom" value={form.nom} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <p className="text-sm font-semibold">Matricule véhicule</p>
            <input type="text" name="matricule_vehicule" placeholder="Exemple: 0000TU000" value={form.matricule_vehicule} onChange={handleChange}minLength={9}
  maxLength={9} required />
          </div>

          <div className="input-group">
            <p className="text-sm font-semibold">Marque</p>
            <select name="marque" value={form.marque} onChange={handleChange} required>
              <option value="">-- Sélectionnez une marque --</option>
              {Object.keys(modelesParMarque).map((marque) => (
                <option key={marque} value={marque}>{marque}</option>
              ))}
            </select>
          </div>

          {form.marque && (
            <div className="input-group">
              <p className="text-sm font-semibold">Modèle</p>
              <select name="modele" value={form.modele} onChange={handleChange} required>
                <option value="">-- Sélectionnez un modèle --</option>
                {modelesParMarque[form.marque].map((mod) => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            </div>
          )}

          <div className="input-group">
            <p className="text-sm font-semibold">Numéro de téléphone</p>
            <input type="text" name="numero_telephone" value={form.numero_telephone} onChange={handleChange} placeholder="Exemple: 20600800" required />
          </div>

          {/* Champ Mot de passe avec toggle */}
          <div className="input-group">
            <p className="text-sm font-semibold">Mot de passe</p>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="motdepasse"
                value={form.motdepasse}
                onChange={handleChange}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <i
                className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                onClick={() => setShowPassword(!showPassword)}
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
                aria-label={showPassword ? "Masquer mot de passe" : "Afficher mot de passe"}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword); }}
              />
            </div>
          </div>

          {/* Champ Confirmer mot de passe avec toggle */}
          <div className="input-group">
            <p className="text-sm font-semibold">Confirmer le mot de passe</p>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="motdepasse2"
                value={form.motdepasse2}
                onChange={handleChange}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <i
                className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                aria-label={showConfirmPassword ? "Masquer mot de passe" : "Afficher mot de passe"}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(!showConfirmPassword); }}
              />
            </div>
          </div>

          <button className="buttonRegister" type="submit" disabled={uploading}>
            {uploading ? 'Créer un compte' : 'Créer un compte'}
          </button>

          <div className="redirect-login">
            <span>Vous avez déjà un compte ? </span>
            <Link to="/login">Se connecter</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
