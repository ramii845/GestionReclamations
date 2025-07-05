import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "use-shopping-cart";

import HomePage from "./components/home/HomePage";
import Register from "./components/authentification/register";
import Login from "./components/authentification/login";
import AdminPage from "./components/admin/AdminPage";
import UserPage from "./components/user/userPage";
import ResetPasswordPage from "./components/authentification/ResetPasswordPage";
import CategorieList from "./components/categories/CategorieList";
import AddReclamationUser from "./components/reclamations/AddReclamationUser";
import EditUser from "./components/user/EditUser";

import PrivateRoute from "./components/utils/PrivateRoute"; // ✅ import

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Confirmation from "./components/reclamations/Confirmation";
import ListCategories from "./components/admin/categories_admin/ListCategories";
import AddCategories from "./components/admin/categories_admin/AddCategories";
import EditCategories from "./components/admin/categories_admin/EditCategories";
import ListUsers from "./components/admin/users_admin/listUsers";


function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Routes sécurisées pour utilisateur */}
          <Route path="/userPage" element={<PrivateRoute element={<UserPage />} />} />
          <Route path="/categories" element={<PrivateRoute element={<CategorieList />} />} />
          <Route path="/categories/:categorie_id" element={<PrivateRoute element={<AddReclamationUser />} />} />
          <Route path="/profil" element={<PrivateRoute element={<EditUser />} />} />
             <Route path="/confirmation" element={<PrivateRoute element={<Confirmation/>} />} />

          {/* Admin (à sécuriser plus tard) */}
          <Route path="/adminPage" element={<AdminPage />} />
         <Route path="/admin/services" element={<ListCategories/>} />
          <Route path="/categories/add" element={<AddCategories/>} />
          <Route path="/categories/edit/:id" element={<EditCategories/>} />
          
            <Route path="/admin/utilisateurs" element={<ListUsers/>} />

        </Routes>
      </Router>

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
