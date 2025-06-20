import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home'
import Auth from './pages/Auth'
import VerifyEmail from './components/VerifyEmail'
import Navbar from './layout/Navbar'
import { useEffect } from 'react'
import { getMe } from './redux/authSlice'
import { useDispatch } from 'react-redux'
import { FiFilm } from 'react-icons/fi'
import AdminDashboard from './pages/AdminDashboard' // Import new component
import MovieManagement from './pages/admin/MovieManagement' // Import new component
import AddMovie from './pages/admin/AddMovie' // Import new component


function App() {
 const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getMe());
    document.title = 'FilmBox - Film ve Dizi İzleme Platformu';
    document.documentElement.lang = 'tr'; // Sayfa dilini Türkçe olarak ayarla
    document.documentElement.dir = 'ltr'; // Sayfa yönünü soldan sağa olarak
  }, [dispatch]);

  return (
    <>
      <Navbar />
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
        theme="colored"
      />
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path='/verify-email/:verifytoken' element={<VerifyEmail />} />
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* New Admin Dashboard */}
        <Route path="/admin/movies" element={<MovieManagement />} /> {/* New Movie Management */}
        <Route path="/admin/movies/add" element={<AddMovie />} /> {/* New Add Movie */}
        {/* Potentially add an edit route later: <Route path="/admin/movies/edit/:id" element={<EditMovie />} /> */}

      </Routes>
    </>
  )
}

export default App