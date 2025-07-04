// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiFilm, FiUsers, FiBarChart2, FiPlusCircle, FiArrowRight, FiStar, FiMessageSquare, FiShield } from 'react-icons/fi'; 
import { toast } from 'react-toastify';
import { fetchDashboardStats } from '../redux/adminSlice'; 

const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin, loading } = useSelector((state) => state.auth);
  const { dashboardStats, status: adminStatus } = useSelector((state) => state.admin); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toast.error('Bu sayfaya erişmek için giriş yapmalısınız.');
        navigate('/auth');
      } else if (!isAdmin) {
        toast.error('Bu sayfaya erişim yetkiniz yok.');
        navigate('/');
      } else {
        dispatch(fetchDashboardStats()); 
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate, dispatch]);

  if (loading || (adminStatus === 'loading' && !dashboardStats)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-base-content mb-10">
          Admin Paneli <span className="text-primary">{user?.username}</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Statistics Card (Aktifleştirildi) */}
          <div className="card bg-base-100 shadow-xl image-full group">
            <figure>
              <img src="https://images.unsplash.com/photo-1506509930472-a052ff37c0f1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Statistics" className="object-cover w-full h-full"/>
            </figure>
            <div className="card-body justify-center items-center relative z-10 bg-black bg-opacity-60 group-hover:bg-opacity-75 transition-all duration-300">
              <FiBarChart2 className="text-warning mb-4" size={48} />
              <h2 className="card-title text-white text-3xl font-bold">Platform İstatistikleri</h2>
              <p className="text-white text-opacity-80 text-center mb-6">Genel platform kullanım verilerini görüntüleyin.</p>
              <div className="card-actions justify-end">
                {dashboardStats ? (
                    <div className="text-white text-lg text-left w-full space-y-2">
                        <p><FiUsers className="inline mr-2" />Toplam Kullanıcı: <span className="font-bold">{dashboardStats.totalUsers}</span></p>
                        <p><FiFilm className="inline mr-2" />Toplam Film: <span className="font-bold">{dashboardStats.totalMovies}</span></p>
                        <p><FiMessageSquare className="inline mr-2" />Toplam Yorum: <span className="font-bold">{dashboardStats.totalReviews}</span></p>
                        <p><FiList className="inline mr-2" />Toplam Liste: <span className="font-bold">{dashboardStats.totalLists}</span></p>
                    </div>
                ) : (
                    <p className="text-white text-opacity-80">İstatistikler yüklenemedi.</p>
                )}
              </div>
            </div>
          </div>
          {/* ... (Diğer mevcut kartlar: Film Yönetimi, Kullanıcı Yönetimi, Yeni Film Ekle) ... */}

          {/* Movie Management Card */}
          <div className="card bg-base-100 shadow-xl image-full group">
            <figure>
              <img src="https://images.unsplash.com/photo-1485846497240-a1bd3b45a9ba?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Movies" className="object-cover w-full h-full"/>
            </figure>
            <div className="card-body justify-center items-center relative z-10 bg-black bg-opacity-60 group-hover:bg-opacity-75 transition-all duration-300">
              <FiFilm className="text-primary mb-4" size={48} />
              <h2 className="card-title text-white text-3xl font-bold">Filmler</h2>
              <p className="text-white text-opacity-80 text-center mb-6">Filmleri ekle, düzenle veya kaldır.</p>
              <div className="card-actions justify-end">
                <button onClick={() => navigate('/admin/movies')} className="btn btn-primary btn-outline text-lg group-hover:btn-primary transition-all duration-300">
                  <FiArrowRight /> Filmleri Yönet
                </button>
              </div>
            </div>
          </div>

          {/* User Management Card */}
          <div className="card bg-base-100 shadow-xl image-full group">
            <figure>
              <img src="https://images.unsplash.com/photo-1559136502-d9e03d9050d2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Users" className="object-cover w-full h-full"/>
            </figure>
            <div className="card-body justify-center items-center relative z-10 bg-black bg-opacity-60 group-hover:bg-opacity-75 transition-all duration-300">
              <FiUsers className="text-info mb-4" size={48} />
              <h2 className="card-title text-white text-3xl font-bold">Kullanıcılar</h2>
              <p className="text-white text-opacity-80 text-center mb-6">Kullanıcıları yönetin ve rollerini atayın.</p>
              <div className="card-actions justify-end">
                <button onClick={() => navigate('/admin/users')} className="btn btn-info btn-outline text-lg group-hover:btn-info transition-all duration-300">
      <FiUsers /> Kullanıcıları Yönet
    </button>
              </div>
            </div>
          </div>

          {/* Add New Movie Card */}
          <div className="card bg-base-100 shadow-xl image-full group">
            <figure>
              <img src="https://images.unsplash.com/photo-1542204620-ce9070c7977b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Add Movie" className="object-cover w-full h-full"/>
            </figure>
            <div className="card-body justify-center items-center relative z-10 bg-black bg-opacity-60 group-hover:bg-opacity-75 transition-all duration-300">
              <FiPlusCircle className="text-accent mb-4" size={48} />
              <h2 className="card-title text-white text-3xl font-bold">Yeni Film Ekle</h2>
              <p className="text-white text-opacity-80 text-center mb-6">TMDB ID kullanarak hızlıca film ekleyin.</p>
              <div className="card-actions justify-end">
                <button onClick={() => navigate('/admin/movies/add')} className="btn btn-accent btn-outline text-lg group-hover:btn-accent transition-all duration-300">
                  <FiPlusCircle /> Film Ekle
                </button>
              </div>
            </div>
          </div>

        </div>

        {dashboardStats && (
            <>
                {/* En Çok Beğenilen Filmler */}
                <h2 className="text-3xl font-bold text-base-content mb-6 mt-12 text-center">En Popüler Filmler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {dashboardStats.topMoviesByLikes.map(movie => (
                        <div key={movie._id} className="card bg-base-100 shadow-lg compact">
                            <div className="card-body flex-row items-center">
                                <img src={movie.posterPath ? `https://image.tmdb.org/t/p/w92${movie.posterPath}` : 'https://via.placeholder.com/92x138?text=No+Poster'} alt={movie.title} className="w-16 h-24 rounded-lg object-cover mr-4"/>
                                <div>
                                    <h3 className="card-title text-lg">{movie.title}</h3>
                                    <p className="text-sm opacity-70"><FiHeart className="inline mr-1 text-red-500"/> {movie.platformStats.likeCount} Beğeni</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* En Çok Yorum Yapılan Filmler */}
                <h2 className="text-3xl font-bold text-base-content mb-6 mt-12 text-center">En Çok Yorum Yapılan Filmler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {dashboardStats.topMoviesByReviews.map(movie => (
                        <div key={movie._id} className="card bg-base-100 shadow-lg compact">
                            <div className="card-body flex-row items-center">
                                <img src={movie.posterPath ? `https://image.tmdb.org/t/p/w92${movie.posterPath}` : 'https://via.placeholder.com/92x138?text=No+Poster'} alt={movie.title} className="w-16 h-24 rounded-lg object-cover mr-4"/>
                                <div>
                                    <h3 className="card-title text-lg">{movie.title}</h3>
                                    <p className="text-sm opacity-70"><FiMessageSquare className="inline mr-1 text-blue-500"/> {movie.platformStats.reviewCount} Yorum</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* En Aktif Kullanıcılar */}
                <h2 className="text-3xl font-bold text-base-content mb-6 mt-12 text-center">En Aktif Kullanıcılar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardStats.mostActiveUsers.map(user => (
                        <div key={user._id} className="card bg-base-100 shadow-lg compact">
                            <div className="card-body flex-row items-center">
                                <div className="avatar">
                                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                                        <img src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.username}`} alt={user.username} className="object-cover w-full h-full"/>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="card-title text-lg">@{user.username}</h3>
                                    <p className="text-sm opacity-70"><FiMessageSquare className="inline mr-1 text-blue-500"/> {user.reviewCount} Yorum</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
        {/* Yeni İçerik Moderasyon Kartı */}
                <div className="card bg-base-100 shadow-xl image-full group">
                    <figure>
                        <img src="https://images.unsplash.com/photo-1582213782179-e0d53f67cecd?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Content Moderation" className="object-cover w-full h-full"/>
                    </figure>
                    <div className="card-body justify-center items-center relative z-10 bg-black bg-opacity-60 group-hover:bg-opacity-75 transition-all duration-300">
                        <FiShield className="text-secondary mb-4" size={48} />
                        <h2 className="card-title text-white text-3xl font-bold">İçerik Moderasyonu</h2>
                        <p className="text-white text-opacity-80 text-center mb-6">Yorumları ve listeleri denetleyin.</p>
                        <div className="card-actions justify-end">
                            <button onClick={() => navigate('/admin/content-moderation')} className="btn btn-secondary btn-outline text-lg group-hover:btn-secondary transition-all duration-300">
                                <FiShield /> Moderasyon Paneli
                            </button>
                        </div>
                    </div>
                </div>
      </div>
    </div>
  );
};

export default AdminDashboard;