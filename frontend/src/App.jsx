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
import PersonDetail from './pages/PersonDetail'
import WatchlistPage from './pages/WatchlistPage'
import UserProfile from './pages/UserProfile';
import ListsPage from './pages/ListsPage'
import ListDetail from './pages/ListDetail'
import MoviesPage from './pages/MoviesPage'
import UserManagement from './pages/admin/UserManagement'

function App() {
 const dispatch = useDispatch();
  const { loading: authLoading } = useSelector((state) => state.auth); 

  useEffect(() => {
    dispatch(getMe());
    document.title = 'FilmBox - Film ve Dizi İzleme Platformu';
    document.documentElement.lang = 'tr'; 
    document.documentElement.dir = 'ltr'; 
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
        <Route path="/movies" element={<MoviesPage />} />
         <Route path="/movies/:id" element={<MovieDetail />} /> 
        <Route path="/persons/:id" element={<PersonDetail />} />
        <Route path="/users/:username" element={<UserProfile />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<div className="text-center p-10">404 - Sayfa Bulunamadı</div>} />
        <Route path="/watchlists" element={<WatchlistPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/lists/:id" element={<ListDetail />} />
        {/* Admin Routes */}
        <Route path="/admin/users" element={<UserManagement />} />
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