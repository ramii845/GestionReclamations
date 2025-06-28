import React from 'react';
import { Button } from 'react-bootstrap';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="main">
      <div className="intro-box">
        <h1 className="title">Bienvenue</h1>
        <p className="subtitle">Un seul endroit sûr pour toutes vos notes.</p>
        <div className="buttonContainer">
          <a href="/login" className="btn-link">
            <Button size="lg" className="landingbutton btn-login">Se connecter</Button>
          </a>
          <a href="/register" className="btn-link">
            <Button size="lg" variant="outline-primary" className="landingbutton btn-signup">S’inscrire</Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;