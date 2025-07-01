import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
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

  const modelesParMarque = {
    Peugeot: ['LANDTREK', 'EXPERT', 'Boxer', 'Traveller', '208', '301', '2008', '308', '3008', '508', '5008', 'Rifter', 'Partner'],
    Citroen: ['C3 POPULAIRE', 'JUMPY FOURGON', 'Berlingo', 'BERLINGO VAN', 'C4 X', 'Jumper'],
    Opel: ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'COMBO CARGO']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'numero_telephone' && (!/^\d*$/.test(value) || value.length > 8)) return;
    setForm({ ...form, [name]: value, ...(name === 'marque' ? { modele: '' } : {}) });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm({ ...form, photoFile: file });
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'ProjetRL');  // Ton upload preset Cloudinary
    data.append('cloud_name', 'dxc5curxy');

    setUploading(true);
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dxc5curxy/image/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      setUploading(false);
      if (json.secure_url) {
        return json.secure_url;
      } else {
        throw new Error('Upload Cloudinary a échoué');
      }
    } catch (error) {
      setUploading(false);
      toast.error("Erreur lors de l'upload de l'image");
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

    let photoUrl = "";

    if (form.photoFile) {
      try {
        photoUrl = await uploadToCloudinary(form.photoFile);
      } catch {
        return; // Stop si upload échoue
      }
    }

    // Préparer FormData pour envoyer au backend
    const backendForm = new FormData();
    backendForm.append('nom', form.nom);
    backendForm.append('matricule_vehicule', form.matricule_vehicule);
    backendForm.append('numero_telephone', form.numero_telephone);
    backendForm.append('motdepasse', form.motdepasse);
    backendForm.append('marque', form.marque);
    backendForm.append('modele', form.modele);
    backendForm.append('role', 'user');
    backendForm.append('photo_url', photoUrl);

    try {
      const res = await fetch('http://localhost:8000/users/register/', {
        method: 'POST',
        body: backendForm,
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.detail || 'Erreur lors de l’inscription');
        return;
      }

      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (error) {
      toast.error("Erreur lors de la communication avec le serveur");
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <form onSubmit={handleSubmit} className="register-form" encType="multipart/form-data">
          <div className="photo-upload-container">
            <label htmlFor="photo-input" className="camera-icon-label">
              <img
                src={form.photoFile ? URL.createObjectURL(form.photoFile) : 'images/camera.jpg'}
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
            <input type="text" name="matricule_vehicule" value={form.matricule_vehicule} onChange={handleChange} placeholder="0000TU000" required />
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
            <input type="text" name="numero_telephone" value={form.numero_telephone} onChange={handleChange} placeholder="ex: 20600800" required />
          </div>

          <div className="input-group">
            <p className="text-sm font-semibold">Mot de passe</p>
            <input type="password" name="motdepasse" value={form.motdepasse} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <p className="text-sm font-semibold">Confirmer le mot de passe</p>
            <input type="password" name="motdepasse2" value={form.motdepasse2} onChange={handleChange} required />
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
