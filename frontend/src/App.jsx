import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "use-shopping-cart";
import 'react-toastify/dist/ReactToastify.css';

import HomePage from "./components/home/HomePage";
import Register from "./components/authentification/register";
import Login from "./components/authentification/login";
import AdminPage from "./components/admin/AdminPage";
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
import EditUserAdmin from "./components/admin/users_admin/EditUserAdmin";
import AddUserAdmin from "./components/admin/users_admin/AddUserAdmin";
import ListAvis from "./components/admin/avis_admin/listAvis";
import PrivateRouteAdmin from "./components/utils/PrivateRouteAdmin";
import NotFoundPage from "./components/utils/NotFoundPage";
import EditCompte from "./components/admin/users_admin/EditCompte";
import ReclamationsAdmin from "./components/admin/reclamations_admin/ReclamationsAdmin";
import EditReclamation from "./components/admin/reclamations_admin/EditReclamation";
import AddReclamationAdmin from "./components/admin/reclamations_admin/AddReaclamationAdmin.jsx";
import ConsultRec from "./components/reclamations/ConsultRec.jsx";
import AddAvis from "./components/avis/AddAvis.jsx";
import ArchiveReclamation from "./components/admin/reclamations_admin/ReclamationArchive.jsx";
import Logout from "./components/authentification/logout.jsx";


function App() {
  return (
    <CartProvider>
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
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
 <Route path="/logout" element={<Logout/>} />


          {/* user */}
     
          <Route path="/categories" element={<PrivateRoute element={<CategorieList />} />} />
          <Route path="/categories/:categorie_id" element={<PrivateRoute element={<AddReclamationUser />} />} />
          <Route path="/profil" element={<PrivateRoute element={<EditUser />} />} />
             <Route path="/confirmation" element={<PrivateRoute element={<Confirmation/>} />} />
             
               <Route path="/consulterEtat" element={<PrivateRoute element={<ConsultRec/>} />} />
               <Route path="/donner-avis/:reclamation_id" element={<PrivateRoute element={<AddAvis />} /> } />




{/* Admin */}
<Route path="/adminPage" element={<PrivateRouteAdmin element={<AdminPage />} />} />
<Route path="/admin/services" element={<PrivateRouteAdmin element={<ListCategories />} />} />
<Route path="/categories/add" element={<PrivateRouteAdmin element={<AddCategories />} />} />
<Route path="/categories/edit/:id" element={<PrivateRouteAdmin element={<EditCategories />} />} />
<Route path="/admin/addUser" element={<PrivateRouteAdmin element={<AddUserAdmin />} />} />
<Route path="/admin/utilisateurs" element={<PrivateRouteAdmin element={<ListUsers />} />} />
<Route path="/admin/edit/:user_id" element={<PrivateRouteAdmin element={<EditUserAdmin />} />} /> 
<Route path="/admin/avis" element={<PrivateRouteAdmin element={<ListAvis />} />} />


<Route path="/admin/profil" element={<PrivateRouteAdmin element={<EditCompte />} />} />
   <Route path="admin/reclamations"    element={<PrivateRouteAdmin element={<ReclamationsAdmin />} />} />
<Route path="/admin/editReclamation/:id"    element={<PrivateRouteAdmin element={<EditReclamation/>} /> } />
  <Route path="/admin/addReclamation"    element={<PrivateRouteAdmin  element={<AddReclamationAdmin/>} /> } />
  
 <Route path="/admin/archive"          element={<PrivateRouteAdmin  element={<ArchiveReclamation/>} /> } />
<Route path="*" element={<NotFoundPage />} />

        </Routes>
      </Router>

 
    </CartProvider>
  );
}

export default App;
