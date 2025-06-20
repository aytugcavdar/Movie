import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMovieFromTMDB } from '../../redux/movieSlice';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiPlusCircle, FiDatabase, FiCheckCircle, FiInfo, FiExternalLink } from 'react-icons/fi';

const AddMovie = () => {
  const [tmdbId, setTmdbId] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: movieLoading, error: movieError, status: movieStatus } = useSelector((state) => state.movie);
  const { isAuthenticated, isAdmin, loading: authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error('Bu sayfaya erişmek için giriş yapmalısınız.');
        navigate('/auth');
      } else if (!isAdmin) {
        toast.error('Bu sayfaya erişim yetkiniz yok.');
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, navigate, authLoading]);

  useEffect(() => {
    if (movieStatus === 'succeeded' && !movieLoading && !movieError) {
      toast.success('Film başarıyla eklendi!');
      setTmdbId('');
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (movieStatus === 'failed' && movieError) {
      toast.error(`Film eklenemedi: ${movieError}`);
      setShowSuccessMessage(false);
    }
  }, [movieStatus, movieLoading, movieError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tmdbId) {
      toast.error('Lütfen bir TMDB ID girin.');
      return;
    }
    setShowSuccessMessage(false);
    dispatch(fetchMovieFromTMDB(tmdbId));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="breadcrumbs text-sm mb-4 justify-center">
            <ul>
              <li>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="btn btn-ghost btn-sm text-base-content/70 hover:text-primary"
                >
                  <FiArrowLeft className="w-4 h-4 mr-1" />
                  Admin Panel
                </button>
              </li>
              <li className="text-primary font-medium">Film Ekle</li>
            </ul>
          </div>
          
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="avatar placeholder mb-4">
                <div className="bg-primary text-primary-content rounded-full w-16">
                  <FiPlusCircle className="w-8 h-8" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-base-content mb-2">
                Yeni Film Ekle
              </h1>
              <p className="text-base-content/60 text-lg">
                TMDB veritabanından film bilgilerini otomatik olarak çekin
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="card bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body p-8">
            {/* Info Alert */}
            <div className="alert alert-info mb-6">
              <FiInfo className="w-5 h-5" />
              <div>
                <h3 className="font-bold">TMDB ID Nasıl Bulunur?</h3>
                <div className="text-sm mt-1">
                  Film sayfasının URL'sindeki sayısal değer TMDB ID'sidir. 
                  Örnek: themoviedb.org/movie/<span className="font-mono bg-info-content/10 px-1 rounded">550</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <FiDatabase className="w-4 h-4" />
                    TMDB Film ID
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Örn: 550 (Fight Club için)"
                    className="input input-bordered input-lg w-full pl-12 focus:input-primary"
                    value={tmdbId}
                    onChange={(e) => setTmdbId(e.target.value)}
                    required
                    min="1"
                  />
                  <FiDatabase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5" />
                </div>
                <label className="label">
                  <span className="label-text-alt flex items-center gap-1">
                    <a 
                      href="https://www.themoviedb.org/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="link link-primary hover:link-secondary flex items-center gap-1"
                    >
                      TMDB'yi ziyaret edin
                      <FiExternalLink className="w-3 h-3" />
                    </a>
                    ve film ID'sini bulun
                  </span>
                </label>
              </div>

              {/* Success Message */}
              {showSuccessMessage && (
                <div className="alert alert-success shadow-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold">Başarılı!</h3>
                      <div className="text-sm">Film başarıyla eklendi. Yeni bir film ekleyebilirsiniz.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {movieError && (
                <div className="alert alert-error shadow-lg">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 w-6 h-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-bold">Hata!</h3>
                      <div className="text-sm">{movieError}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={movieLoading}
                className="btn btn-primary btn-lg w-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {movieLoading ? (
                  <>
                    <span className="loading loading-spinner loading-md"></span>
                    Film Ekleniyor...
                  </>
                ) : (
                  <>
                    <FiPlusCircle className="w-5 h-5" />
                    Filmi Ekle
                  </>
                )}
              </button>
            </form>

            {/* Additional Actions */}
            <div className="divider">veya</div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => navigate('/admin/movies')}
                className="btn btn-outline btn-sm"
              >
                Film Listesini Görüntüle
              </button>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="btn btn-ghost btn-sm"
              >
                Admin Paneline Dön
              </button>
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="card bg-base-100/50 backdrop-blur-sm mt-6">
          <div className="card-body p-6">
            <h3 className="card-title text-base">💡 İpuçları</h3>
            <ul className="text-sm text-base-content/70 space-y-1">
              <li>• Popüler filmler için ID'ler genellikle düşük sayılardır (örn: 550, 680, 155)</li>
              <li>• Yeni filmler için daha yüksek ID'ler kullanılır</li>
              <li>• Film bulunamadıysa, TMDB'de doğru sayfada olduğunuzdan emin olun</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMovie;