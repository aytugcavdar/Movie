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
import AdminDashboard from './pages/AdminDashboard'
import MovieManagement from './pages/admin/MovieManagement' 
import AddMovie from './pages/admin/AddMovie' 
import { useSelector } from 'react-redux'
import Profile from './pages/Profile'
import MovieDetail from './pages/MovieDetail'
import EditMovie from './pages/admin/EditMovie'


function App() {
 const dispatch = useDispatch();
  const { loading: authLoading } = useSelector((state) => state.auth); // Kimlik doğrulama yükleme durumunu alın // cite: 47

  useEffect(() => {
    dispatch(getMe());
    document.title = 'FilmBox - Film ve Dizi İzleme Platformu';
    document.documentElement.lang = 'tr'; // Sayfa dilini Türkçe olarak ayarla
    document.documentElement.dir = 'ltr'; // Sayfa yönünü soldan sağa olarak
  }, [dispatch]);


    if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

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
        <Route path="/profile" element={<Profile />} />
         <Route path="/movies/:id" element={<MovieDetail />} /> 
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/movies" element={<MovieManagement />} /> 
        <Route path="/admin/movies/add" element={<AddMovie />} />
         <Route path="/admin/movies/edit/:id" element={<EditMovie />} />
        {/* Potentially add an edit route later: <Route path="/admin/movies/edit/:id" element={<EditMovie />} /> */}

      </Routes>
    </>
  )
}

export default App