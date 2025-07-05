import React, { useState } from 'react';
import { Form, Button, Container, Card, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { signup } from '../../../services/authService';
import './AddUserAdmin.css';
import Navbar from '../../Navbar/Navbar';

const modelesParMarque = {
  Peugeot: ['LANDTREK', 'EXPERT', 'Boxer', 'Traveller', '208', '301', '2008', '308', '3008', '508', '5008', 'Rifter', 'Partner'],
  Citroen: ['C3 POPULAIRE', 'JUMPY FOURGON', 'Berlingo', 'BERLINGO VAN', 'C4 X', 'Jumper'],
  Opel: ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'COMBO CARGO']
};

const AddUserAdmin = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    nom: '',
    matricule_vehicule: '',
    marque: '',
    modele: '',
    numero_telephone: '',
    role: '',
    motdepasse: '',
    confirmMotdepasse: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'marque') {
      setUser(prev => ({
        ...prev,
        marque: value,
        modele: '',
      }));
    } else {
      setUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validate = () => {
    // Téléphone = nombre de 8 chiffres
    if (!/^\d{8}$/.test(user.numero_telephone)) {
      toast.error("Le numéro de téléphone doit contenir exactement 8 chiffres.");
      return false;
    }

    // Matricule = exactement 9 caractères (lettres/chiffres)
    if (!/^[A-Za-z0-9]{9}$/.test(user.matricule_vehicule)) {
      toast.error("Le matricule doit contenir exactement 9 caractères alphanumériques.");
      return false;
    }

    // Mot de passe & confirmation identiques
    if (user.motdepasse !== user.confirmMotdepasse) {
      toast.error("Le mot de passe et la confirmation ne correspondent pas.");
      return false;
    }

    if (user.motdepasse.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Ne pas envoyer confirmMotdepasse au backend
    const { confirmMotdepasse, ...userToSend } = user;

    try {
      await signup(userToSend);
      toast.success("Utilisateur ajouté avec succès !");
      setTimeout(() => navigate('/admin/utilisateurs'), 2000);
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'utilisateur");
    }
  };

  return (
    <Container className="add-user-container">
      <Navbar />
      <Card className="add-user-card">
        <Card.Body>
          <Card.Title className="mb-4">Ajouter un utilisateur</Card.Title>
          <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-3" controlId="formNom">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={user.nom}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMatricule">
              <Form.Label>Matricule (9 caractères)</Form.Label>
              <Form.Control
                type="text"
                name="matricule_vehicule"
                value={user.matricule_vehicule}
                onChange={handleChange}
                required
                maxLength={9}
                minLength={9}
                pattern="[A-Za-z0-9]{9}"
                title="Le matricule doit contenir exactement 9 caractères alphanumériques"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTelephone">
              <Form.Label>Téléphone (8 chiffres)</Form.Label>
              <Form.Control
                type="number"
                name="numero_telephone"
                value={user.numero_telephone}
                onChange={handleChange}
                required
                min="10000000"
                max="99999999"
                placeholder="Ex: 12345678"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMarque">
              <Form.Label>Marque</Form.Label>
              <Form.Select
                name="marque"
                value={user.marque}
                onChange={handleChange}
                required
              >
                <option value="">-- Sélectionner une marque --</option>
                {Object.keys(modelesParMarque).map(marque => (
                  <option key={marque} value={marque}>{marque}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formModele">
              <Form.Label>Modèle</Form.Label>
              <Form.Select
                name="modele"
                value={user.modele}
                onChange={handleChange}
                required
                disabled={!user.marque}
              >
                <option value="">-- Sélectionner un modèle --</option>
                {user.marque && modelesParMarque[user.marque].map(modele => (
                  <option key={modele} value={modele}>{modele}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRole">
              <Form.Label>Rôle</Form.Label>
              <Form.Select
                name="role"
                value={user.role}
                onChange={handleChange}
                required
              >
                <option value="">-- Sélectionner un rôle --</option>
                <option value="admin">Manager</option>
                <option value="user">Client</option>
              </Form.Select>
            </Form.Group>
<Form.Group className="mb-3" controlId="formMotdepasse">
  <Form.Label>Mot de passe</Form.Label>
  <div style={{ position: 'relative' }}>
    <Form.Control
      type={showPassword ? 'text' : 'password'}
      name="motdepasse"
      value={user.motdepasse}
      onChange={handleChange}
      required
      minLength={6}
      style={{ paddingRight: '2.5rem' }}
      placeholder="Entrez un mot de passe sécurisé"
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
</Form.Group>

<Form.Group className="mb-3" controlId="formConfirmMotdepasse">
  <Form.Label>Confirmer le mot de passe</Form.Label>
  <div style={{ position: 'relative' }}>
    <Form.Control
      type={showConfirmPassword ? 'text' : 'password'}
      name="confirmMotdepasse"
      value={user.confirmMotdepasse}
      onChange={handleChange}
      required
      minLength={6}
      style={{ paddingRight: '2.5rem' }}
      placeholder="Confirmez le mot de passe"
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
</Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => navigate('/admin/utilisateurs')}
              >
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Ajouter
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default AddUserAdmin;
