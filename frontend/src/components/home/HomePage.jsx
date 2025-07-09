import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="main">
      <div className="intro-box">

        <div className="header-logo-title">
          <img src="https://res.cloudinary.com/ditzf19gl/image/upload/v1752070418/v1ordmxctzkidfaqmykx.jpg" alt="Logo voiture" className="logo" />
          <h1 className="app-title">MyClaim</h1>
        </div>

        <div className="text-group">
          <p className="welcome-text">Bienvenue sur MyClaim</p>
          <p className="description">
            Centralisez toutes vos réclamations automobiles en un seul endroit. Rapide, efficace et sécurisé.
          </p>
        </div>

        <img src="https://res.cloudinary.com/ditzf19gl/image/upload/v1752070247/nfg6onmhxjwoaxmvzkhd.png" alt="Illustration" className="illustration" />

        <div className="buttonContainer">
          <Link to="/login" className="btn-link">
            <button className="btn primary">Se connecter</button>
          </Link>
          <Link to="/register" className="btn-link">
            <button className="btn outline">S’inscrire</button>
          </Link>
        </div>

        <footer className="footer">
          <p>© 2025 MyClaim — Tous droits réservés</p>
          <div className="footer-infos">
            <p>Mentions légales</p>
            <p>Politique de confidentialité</p>
            <p>Support technique</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
