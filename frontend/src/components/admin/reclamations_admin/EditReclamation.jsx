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
  const [formData, setFormData] = useState({
    user_id: '',
    categorie_id: '',
    description_probleme: '',
    date_creation: '',
    image_vehicule: [],
    facturation: [],
    autre: '',
    retour_client: '',
    action: '',
    statut: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getReclamationById(id);
        // Mettre à jour tout formData pour avoir un objet complet
        setFormData({
          user_id: res.data.user_id || '',
          categorie_id: res.data.categorie_id || '',
          description_probleme: res.data.description_probleme || '',
          date_creation: res.data.date_creation || '',
          image_vehicule: res.data.image_vehicule || [],
          facturation: res.data.facturation || [],
          autre: res.data.autre || '',
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Envoyer tout formData complet
      await updateReclamation(id, formData);
      toast.success("Réclamation mise à jour !");
      setTimeout(() => navigate('/admin/reclamations'), 2000);
    } catch (error) {
      console.error("Erreur mise à jour:", error.response?.data || error.message || error);
      toast.error("Erreur lors de la mise à jour", { autoClose: 2000 });
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <Spinner animation="border" />
        <span className="ms-2">Chargement...</span>
      </div>
    );
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
    as="select"
    name="statut"
    value={formData.statut || ""}
    onChange={handleChange}
  >
    {/* Option actuelle sélectionnée */}
    {formData.statut && (
      <option value={formData.statut}>{formData.statut}</option>
    )}

    {/* Options fixes sans la valeur actuelle */}
    {["En attente", "Prise en charge", "Terminée"]
      .filter(option => option !== formData.statut)
      .map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
  </Form.Control>
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
