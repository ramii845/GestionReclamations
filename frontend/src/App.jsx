import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "use-shopping-cart";

import HomePage from "./components/home/HomePage";
import Register from "./components/authentification/register";
import Login from "./components/authentification/login";
import AdminPage from "./components/admin/AdminPage";
import UserPage from "./components/user/userPage";
import ResetPasswordPage from "./components/authentification/ResetPasswordPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CategorieList from "./components/categories/CategorieList";

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/adminPage" element={<AdminPage />} />
          <Route path="/userPage" element={<UserPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/categories" element={<CategorieList/>} />
        </Routes>
      </Router>

      {/* Container toast notifications - s’affiche partout */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </CartProvider>
  );
}

export default App;
