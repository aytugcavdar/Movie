import { useState, useEffect } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import VerifyEmail from './components/VerifyEmail';
import Navbar from './layout/Navbar';
import { getMe } from './redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import AdminDashboard from './pages/AdminDashboard';
import MovieManagement from './pages/admin/MovieManagement';
import AddMovie from './pages/admin/AddMovie';
import Profile from './pages/Profile';
import MovieDetail from './pages/MovieDetail';
import EditMovie from './pages/admin/EditMovie';
import PersonDetail from './pages/PersonDetail';
import WatchlistPage from './pages/WatchlistPage';
import UserProfile from './pages/UserProfile';
import ListsPage from './pages/ListsPage';
import ListDetail from './pages/ListDetail';
import MoviesPage from './pages/MoviesPage';
import UserManagement from './pages/admin/UserManagement';
import { io } from 'socket.io-client';
import { fetchNotifications } from './redux/notificationSlice';
import ContentModeration from './pages/admin/ContentModeration';


function App() {
  const dispatch = useDispatch();
  const { loading: authLoading, isAuthenticated, user } = useSelector((state) => state.auth);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    dispatch(getMe());
    document.title = 'FilmBox - Film ve Dizi İzleme Platformu';
    document.documentElement.lang = 'tr';
    document.documentElement.dir = 'ltr';
  }, [dispatch]);


  useEffect(() => {
    // Kullanıcı doğrulandıysa ve user objesi ve ID'si mevcutsa
    if (isAuthenticated && user && user.id) {
      // Eğer socket henüz oluşturulmadıysa veya bağlantısı kesilmişse yeni bir socket oluştur
      if (!socket || !socket.connected) {
        console.log('Frontend: Socket oluşturuluyor veya yeniden bağlanılıyor...');
        const newSocket = io('http://localhost:5173', {
          withCredentials: true // Cookie'lerin gönderilmesini sağlar
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
          console.log('Frontend: Socket.IO bağlı, ID:', newSocket.id);
          console.log('Frontend: Joining room with user ID:', user.id);
          newSocket.emit('joinRoom', user.id);
        });

        newSocket.on('newNotification', (newNotif) => {
          console.log('Frontend: Yeni bildirim alındı:', newNotif);
          toast.info(newNotif.message, {
            onClick: () => window.location.href = newNotif.link,
            autoClose: 5000
          });
          dispatch(fetchNotifications()); // Bildirimleri yenilemek için
        });

        newSocket.on('disconnect', () => {
          console.log('Frontend: Socket.IO bağlantısı kesildi');
        });

        // Cleanup fonksiyonu: Component unmount edildiğinde veya bağımlılıklar değiştiğinde socket'i kapat
        return () => {
          console.log('Frontend: Socket cleanup - disconnecting old socket.');
          newSocket.disconnect();
          setSocket(null); // Socket state'ini temizle
        };
      } else {
        // Eğer socket zaten bağlıysa, kullanıcının odasına tekrar katılmayı denemek bir güvenlik önlemidir.
        // Bu genellikle 'connect' olayında zaten yapılır, ancak emin olmak için buraya eklenebilir.
        // Ancak bu durum 'socket' state'i değişmediği sürece bu 'useEffect'i tetiklemez.
        // Anahtar nokta, socket'in bağımlılık dizisinde olmamasıdır.
        if (socket.connected) {
            console.log('Frontend: Socket already connected, ensuring correct room for user ID:', user.id);
            socket.emit('joinRoom', user.id);
        }
      }
    } else if (socket && socket.connected) {
      // Kullanıcı çıkış yaparsa veya kimliği doğrulanmazsa mevcut socket bağlantısını kes
      console.log('Frontend: User logged out or unauthorized, disconnecting socket.');
      socket.disconnect();
      setSocket(null);
    }
  }, [isAuthenticated, user, dispatch]); // BAĞIMLILIK DİZİSİNDE 'socket' YOK!


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

        {/* Catch-all route for 404 */}
        <Route path="*" element={<div className="text-center p-10">404 - Sayfa Bulunamadı</div>} />
      </Routes>
    </>
  );
}

export default App;