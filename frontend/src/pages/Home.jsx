import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMovies } from '../redux/movieSlice';
import { FiStar, FiCalendar, FiClock, FiPlay, FiTrendingUp, FiPlus } from 'react-icons/fi';
import MovieCard from '../components/MovieCard';

const Home = () => {
  const dispatch = useDispatch();
  const { movies, status, error } = useSelector((state) => state.movie);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  const formatRuntime = (minutes) => {
    if (!minutes) return 'Bilinmiyor';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'Bilinmiyor';
    return new Date(date).getFullYear();
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  const getGenreNames = (genres) => {
    if (!genres || !Array.isArray(genres)) return '';
    return genres.map(genre => genre.name || genre).join(', ');
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/70">Filmler yükleniyor...</p>
      </div>
    </div>
  );

  const ErrorMessage = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="alert alert-error max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold">Hata!</h3>
          <div className="text-xs">{error}</div>
        </div>
      </div>
    </div>
  );

  const HeroSection = () => {
    const featuredMovie = movies?.[0];
    if (!featuredMovie) return null;

    return (
      <div className="hero min-h-96 relative overflow-hidden rounded-lg mb-8">
        <div 
          className="hero-overlay bg-gradient-to-r from-black/80 to-black/40"
          style={{
            backgroundImage: featuredMovie.backdropPath 
              ? `url(https://image.tmdb.org/t/p/w1280${featuredMovie.backdropPath})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-2xl">
            <h1 className="mb-5 text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {featuredMovie.title}
            </h1>
            {featuredMovie.tagline && (
              <p className="mb-3 text-lg font-medium text-gray-200">
                {featuredMovie.tagline}
              </p>
            )}
            {featuredMovie.overview && (
              <p className="mb-5 text-base text-gray-300 max-w-xl mx-auto">
                {featuredMovie.overview.length > 200 
                  ? `${featuredMovie.overview.substring(0, 200)}...`
                  : featuredMovie.overview
                }
              </p>
            )}
            <div className="flex justify-center items-center gap-4 mb-5 text-sm">
              <div className="flex items-center gap-1">
                <FiStar className="text-yellow-400" />
                <span>{featuredMovie.voteAverage?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiCalendar />
                <span>{formatDate(featuredMovie.releaseDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock />
                <span>{formatRuntime(featuredMovie.runtime)}</span>
              </div>
            </div>
            <button 
              className="btn btn-primary btn-lg gap-2"
              onClick={() => navigate(`/movies/${featuredMovie._id}`)}
            >
              <FiPlay />
              Detayları Gör
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🎬</div>
      <h3 className="text-2xl font-bold text-base-content mb-2">Henüz Film Yok</h3>
      <p className="text-base-content/70 mb-4 max-w-md mx-auto">
        Veritabanında henüz film bulunmuyor. Yönetici panelinden film ekleyebilirsiniz.
      </p>
      {isAuthenticated && (
        <button 
          className="btn btn-primary gap-2"
          onClick={() => navigate('/admin/movies')}
        >
          <FiPlus />
          Film Ekle
        </button>
      )}
    </div>
  );

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'failed') return <ErrorMessage />;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-base-content mb-2">
            {isAuthenticated ? 'Hoş Geldiniz!' : 'Movie App\'e Hoş Geldiniz!'}
          </h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            En popüler filmleri keşfedin, incelemeler okuyun ve kendi izleme listelerinizi oluşturun.
          </p>
        </div>

        {/* Stats */}
        {movies && movies.length > 0 && (
          <div className="stats shadow mb-8 w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <FiTrendingUp className="text-3xl" />
              </div>
              <div className="stat-title">Toplam Film</div>
              <div className="stat-value text-primary">{movies.length}</div>
              <div className="stat-desc">Veritabanında kayıtlı</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-secondary">
                <FiStar className="text-3xl" />
              </div>
              <div className="stat-title">Ortalama Puan</div>
              <div className="stat-value text-secondary">
                {(movies.reduce((acc, movie) => acc + (movie.voteAverage || 0), 0) / movies.length).toFixed(1)}
              </div>
              <div className="stat-desc">TMDB puanı</div>
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {movies && movies.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-base-content flex items-center gap-2">
                <FiTrendingUp className="text-primary" />
                Popüler Filmler
              </h3>
              <button 
                className="btn btn-outline btn-sm gap-1"
                onClick={() => navigate('/movies')}
              >
                Tümünü Gör
                <span className="hidden sm:inline">({movies.length})</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.slice(0, 10).map((movie) => (
                <MovieCard 
                  key={movie._id} 
                  movie={movie} 
                  onMovieClick={handleMovieClick}
                  formatDate={formatDate}
                  formatRuntime={formatRuntime}
                  getGenreNames={getGenreNames}
                />
              ))}
            </div>

            {movies.length > 10 && (
              <div className="text-center mt-8">
                <button 
                  className="btn btn-primary btn-wide gap-2"
                  onClick={() => navigate('/movies')}
                >
                  <FiPlus />
                  Daha Fazla Film Gör ({movies.length - 10} tane daha)
                </button>
              </div>
            )}
          </section>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default Home;