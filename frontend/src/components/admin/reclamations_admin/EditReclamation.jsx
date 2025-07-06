import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReclamationById, updateReclamation } from '../../../services/reclamationService';
import Navbar from '../../Navbar/Navbar';
import { Form, Button, Container, Card, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditReclamation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reclamation, setReclamation] = useState(null);
  const [formData, setFormData] = useState({
    retour_client: '',
    action: '',
    statut: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getReclamationById(id);
        setReclamation(res.data);
        setFormData({
          retour_client: res.data.retour_client || '',
          action: res.data.action || '',
          statut: res.data.statut || ''
        });
      } catch (error) {
        toast.error("Erreur chargement réclamation");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...reclamation,
        retour_client: formData.retour_client,
        action: formData.action,
        statut: formData.statut
      };
      delete dataToSend.id;

      await updateReclamation(id, dataToSend);
      toast.success("Réclamation mise à jour !");
      setTimeout(() => navigate('/admin/reclamations'), 2000);
    } catch (error) {
      console.error("Erreur mise à jour:", error.response?.data || error.message || error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <Spinner animation="border" />
        <span className="ms-2">Chargement...</span>
      </div>
    );
  }

  if (!reclamation) {
    return <div>Réclamation introuvable</div>;
  }

  return (
    <>
      <Navbar />
      <Container className="edit-user-containerr" style={{ maxWidth: 600, marginTop: 30 }}>
        <Card className="edit-user-card">
          <Card.Body>
            <Card.Title className="mb-4">Modifier Réclamation</Card.Title>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formRetourClient">
                <Form.Label>Retour Client</Form.Label>
                <Form.Control
                  type="text"
                  name="retour_client"
                  value={formData.retour_client}
                  onChange={handleChange}
                  placeholder="Retour client"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formAction">
                <Form.Label>Action</Form.Label>
                <Form.Control
                  type="text"
                  name="action"
                  value={formData.action}
                  onChange={handleChange}
                  placeholder="Action effectuée"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formStatut">
                <Form.Label>Statut</Form.Label>
                <Form.Control
                  type="text"
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  placeholder="Statut (ex: ouverte, en cours, fermée)"
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" className="me-2">
                  Enregistrer
                </Button>
                <Button variant="secondary" onClick={() => navigate('/admin/reclamations')}>
                  Annuler
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default EditReclamation;
