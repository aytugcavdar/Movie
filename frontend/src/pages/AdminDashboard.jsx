import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiFilm, FiUsers, FiBarChart2, FiPlusCircle,FiArrowRight,FiLock   } from 'react-icons/fi';
import { toast } from 'react-toastify';


const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin, loading } = useSelector((state) => state.auth);
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
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  if (loading) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

          {/* User Management Card (Placeholder for future) */}
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

          {/* Statistics Card (Placeholder for future) */}
          <div className="card bg-base-100 shadow-xl image-full group">
            <figure>
              <img src="https://images.unsplash.com/photo-1506509930472-a052ff37c0f1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Statistics" className="object-cover w-full h-full"/>
            </figure>
            <div className="card-body justify-center items-center relative z-10 bg-black bg-opacity-60 group-hover:bg-opacity-75 transition-all duration-300">
              <FiBarChart2 className="text-warning mb-4" size={48} />
              <h2 className="card-title text-white text-3xl font-bold">İstatistikler</h2>
              <p className="text-white text-opacity-80 text-center mb-6">Platform kullanım istatistiklerini görüntüleyin.</p>
              <div className="card-actions justify-end">
                <button disabled className="btn btn-warning btn-outline text-lg opacity-50 cursor-not-allowed">
                  <FiLock /> Çok Yakında
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
      </div>
    </div>
  );
};

export default AdminDashboard;