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
import { io } from 'socket.io-client'
import { fetchNotifications } from './redux/notificationSlice'
import ContentModeration from './pages/admin/ContentModeration'


function App() {
 const dispatch = useDispatch();
  const { loading: authLoading, isAuthenticated, user } = useSelector((state) => state.auth); 
  const { items: notifications } = useSelector((state) => state.notifications); 


  const [socket, setSocket] = useState(null);

  useEffect(() => {
    dispatch(getMe());
    document.title = 'FilmBox - Film ve Dizi İzleme Platformu';
    document.documentElement.lang = 'tr';
    document.documentElement.dir = 'ltr';
  }, [dispatch]);


  useEffect(() => {
      if (isAuthenticated && user) {
         
          if (!socket) {
              const newSocket = io('http://localhost:4000', {
                  withCredentials: true 
              });
              setSocket(newSocket);

              newSocket.on('connect', () => {
                  console.log('Socket.IO bağlı, ID:', newSocket.id);
                  newSocket.emit('joinRoom', user.id); 
              });

              newSocket.on('newNotification', (newNotif) => {
                  console.log('Yeni bildirim alındı:', newNotif);
                  toast.info(newNotif.message, { 
                    onClick: () => window.location.href = newNotif.link, 
                    autoClose: 5000
                  });
                  dispatch(fetchNotifications()); 
              });

              newSocket.on('disconnect', () => {
                  console.log('Socket.IO bağlantısı kesildi');
              });

              // Cleanup function
              return () => {
                  newSocket.disconnect();
              };
          } else {
              // Eğer socket zaten bağlıysa ve kullanıcı değiştiyse odayı tekrar kat
              if (socket.connected) {
                  socket.emit('joinRoom', user.id);
              }
          }
      } else if (socket) {
          // Kullanıcı çıkış yaparsa bağlantıyı kes
          socket.disconnect();
          setSocket(null);
      }
  }, [isAuthenticated, user, socket, dispatch]); // socket bağımlılığını ekledik

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
         <Route path="/admin/content-moderation" element={<ContentModeration />} />
         
        {/* Potentially add an edit route later: <Route path="/admin/movies/edit/:id" element={<EditMovie />} /> */}

      </Routes>
    </>
  )
}

export default App