import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Card, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { getUserbyId, updateUser } from '../../../services/authService';
import './EditUser.css';
import Navbar from '../../Navbar/Navbar';

const EditUserAdmin = () => {
  const { user_id } = useParams(); // récupère l'ID depuis l'URL
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nom: '',
    matricule_vehicule: '',
    marque: '',
    modele: '',
    numero_telephone: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserbyId(user_id);
        setUser(res.data);
      } catch (error) {
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user_id]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(user_id, user);
      toast.success("Profil mis à jour !");
      setTimeout(() => navigate("/admin/utilisateurs"), 2000);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <Spinner animation="border" /> <span className="ms-2">Chargement...</span>
      </div>
    );
  }

  return (
    <Container className="edit-user-container">
      <Navbar/>
      <Card className="edit-user-card">
        <Card.Body>
          <Card.Title className="mb-4">Modifier Profil</Card.Title>
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
              <Form.Label>Matricule</Form.Label>
              <Form.Control
                type="text"
                name="matricule_vehicule"
                value={user.matricule_vehicule}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTelephone">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="text"
                name="numero_telephone"
                value={user.numero_telephone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMarque">
              <Form.Label>Marque</Form.Label>
              <Form.Control
                type="text"
                name="marque"
                value={user.marque}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formModele">
              <Form.Label>Modèle</Form.Label>
              <Form.Control
                type="text"
                name="modele"
                value={user.modele}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRole">
              <Form.Label>Rôle</Form.Label>
              <Form.Select name="role" value={user.role} onChange={handleChange} required>
                <option value="admin">Manager</option>

                <option value="user">Client</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => navigate("/admin/utilisateurs")}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Enregistrer
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default EditUserAdmin;
