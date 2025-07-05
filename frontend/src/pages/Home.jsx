import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchMovies } from '../redux/movieSlice';
import { fetchFollowingFeed } from '../redux/feedSlice';
import { FiStar, FiCalendar, FiClock, FiPlay, FiTrendingUp, FiPlus, FiUser, FiFilm, FiList, FiEye, FiHeart, FiUsers, FiActivity } from 'react-icons/fi';
import MovieCard from '../components/MovieCard';

const Home = () => {
  const dispatch = useDispatch();
  const { movies, status, error } = useSelector((state) => state.movie);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { feedItems, status: feedStatus } = useSelector((state) => state.feed);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMovies());
    if (isAuthenticated) {
        dispatch(fetchFollowingFeed());
    }
  }, [dispatch, isAuthenticated]);

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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-neutral via-base-300 to-base-200">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <div className="absolute inset-0 loading loading-spinner loading-lg text-primary/30 animate-pulse"></div>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-base-content mb-2">Filmler Yükleniyor...</p>
          <p className="text-base-content/60">En iyi içerikler size geliyor</p>
        </div>
      </div>
    </div>
  );

  const ErrorMessage = () => (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-neutral via-base-300 to-base-200">
      <div className="card bg-base-100 shadow-2xl border border-error/20">
        <div className="card-body items-center text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="card-title text-error text-2xl">Bir Hata Oluştu!</h3>
          <p className="text-base-content/70 mb-4">{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    </div>
  );

  const HeroSection = () => {
    const featuredMovie = movies?.[0];
    if (!featuredMovie) return null;

    return (
      <div className="relative overflow-hidden rounded-3xl mb-12 shadow-2xl">
        <div className="hero min-h-[70vh] relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: featuredMovie.backdropPath 
                ? `url(https://image.tmdb.org/t/p/w1280${featuredMovie.backdropPath})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
          
          <div className="hero-content text-left text-white z-10 w-full max-w-none">
            <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
              
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="w-64 h-96 bg-base-300 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 group">
                  <img 
                    src={featuredMovie.fullPosterUrl} 
                    alt={featuredMovie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 max-w-3xl">
                <div className="badge badge-primary badge-lg mb-4">
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                  Öne Çıkan Film
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                  {featuredMovie.title}
                </h1>
                
                {featuredMovie.tagline && (
                  <p className="text-xl text-yellow-300 font-medium mb-4 italic">
                    "{featuredMovie.tagline}"
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <FiStar className="text-yellow-400" />
                    <span className="font-semibold">{featuredMovie.voteAverage?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <FiCalendar />
                    <span>{formatDate(featuredMovie.releaseDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <FiClock />
                    <span>{formatRuntime(featuredMovie.runtime)}</span>
                  </div>
                </div>

                {featuredMovie.overview && (
                  <p className="text-lg text-gray-200 leading-relaxed mb-8 max-w-2xl">
                    {featuredMovie.overview.length > 250 
                      ? `${featuredMovie.overview.substring(0, 250)}...`
                      : featuredMovie.overview
                    }
                  </p>
                )}

                <div className="flex flex-wrap gap-4">
                  <button 
                    className="btn btn-primary btn-lg gap-3 px-8"
                    onClick={() => navigate(`/movies/${featuredMovie._id}`)}
                  >
                    <FiPlay className="w-5 h-5" />
                    Filmi İncele
                  </button>
                  <button 
                    className="btn btn-outline btn-lg gap-3 px-8 text-white border-white/50 hover:bg-white hover:text-black"
                  >
                    <FiEye className="w-5 h-5" />
                    Fragmanı İzle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const WelcomeSection = () => (
    <div className="text-center mb-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-bold text-base-content mb-4">
          {isAuthenticated ? (
            <>
              Hoş Geldiniz, <span className="text-primary">{user?.username}</span>! 🎬
            </>
          ) : (
            <>
              Movie App&apos;e <span className="text-primary">Hoş Geldiniz</span>! 🍿
            </>
          )}
        </h2>
        <p className="text-xl text-base-content/70 leading-relaxed">
          En popüler filmleri keşfedin, derinlemesine incelemeler okuyun ve kendi özel izleme listelerinizi oluşturun.
        </p>
        {!isAuthenticated && (
          <div className="mt-8 flex justify-center gap-4">
            <button 
              className="btn btn-primary btn-lg gap-2"
              onClick={() => navigate('/auth')} // Auth sayfasına yönlendir
            >
              <FiUser />
              Giriş Yap / Kayıt Ol
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const FeedSection = () => {
    if (!isAuthenticated) return null;

    return (
      <section className="mb-12">
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <FiActivity className="text-primary w-8 h-8" />
                Takip Edilenlerin Akışı
              </h3>
              <div className="badge badge-primary badge-lg">
                <FiUsers className="w-4 h-4 mr-1" />
                Sosyal
              </div>
            </div>

            {feedStatus === 'loading' && (
              <div className="text-center py-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-4 text-base-content/70">Akış yükleniyor...</p>
              </div>
            )}

            {feedStatus === 'failed' && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Akış yüklenirken bir hata oluştu.</span>
              </div>
            )}

            {feedStatus === 'succeeded' && feedItems.length > 0 ? (
              <div className="space-y-4">
                {feedItems.slice(0, 5).map(item => (
                  <div key={item._id} className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="card-body p-6">
                      <div className="flex items-start gap-4">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img 
                              src={item.user?.avatar?.url || `https://ui-avatars.com/api/?name=${item.user?.username}&background=random`} 
                              alt="User Avatar" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Link 
                              to={`/users/${item.user?.username}`} 
                              className="font-bold text-lg link link-hover text-primary"
                            >
                              {item.user?.username}
                            </Link>
                            <span className="text-sm text-base-content/60">
                              {item.type === 'review' ? (
                                <>
                                  <FiFilm className="inline w-4 h-4 mr-1" />
                                  film incelemesi yaptı
                                </>
                              ) : item.type === 'list' ? ( // List tipi için
                                <>
                                  <FiList className="inline w-4 h-4 mr-1" />
                                  yeni liste oluşturdu
                                </>
                              ) : item.type === 'watched' ? ( // Watched tipi için
                                <>
                                  <FiEye className="inline w-4 h-4 mr-1" />
                                  film izledi
                                </>
                              ) : null}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            {item.type === 'review' ? (
                              <div>
                                <p className="font-semibold text-base-content mb-1">
                                  "{item.movie?.title}" filmi hakkında:
                                </p>
                                {/* Yorumun puanını burada gösteriyoruz */}
                                {item.rating && (
                                    <div className="flex items-center gap-1 text-sm text-yellow-500 mb-1">
                                        <FiStar className="inline w-4 h-4" />
                                        <span>{item.rating} / 5</span>
                                    </div>
                                )}
                                <p className="text-base-content/80 italic">
                                  "{item.content?.substring(0, 120)}{item.content?.length > 120 ? '...' : ''}"
                                </p>
                              </div>
                            ) : item.type === 'list' ? ( // List tipi içeriği
                              <div>
                                <p className="font-semibold text-base-content mb-1">
                                  📋 {item.title}
                                </p>
                                <p className="text-base-content/80">
                                  {item.description || 'Açıklama bulunmuyor.'}
                                </p>
                              </div>
                            ) : item.type === 'watched' ? ( // Watched tipi içeriği
                                <div>
                                    <p className="font-semibold text-base-content mb-1">
                                        🎬 "{item.movie?.title}" filmini izledi
                                    </p>
                                    {item.rating && (
                                        <div className="flex items-center gap-1 text-sm text-yellow-500 mb-1">
                                            <FiStar className="inline w-4 h-4" />
                                            <span>{item.rating} / 5</span>
                                        </div>
                                    )}
                                    <p className="text-xs text-base-content/60">
                                        İzlenme Tarihi: {new Date(item.watchedAt).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-base-content/50">
                              {new Date(item.createdAt || item.watchedAt).toLocaleString('tr-TR')}
                            </div>
                            <div className="flex gap-2">
                              {item.type === 'review' && (
                                <Link 
                                  to={`/movies/${item.movie._id}`} 
                                  className="btn btn-sm btn-primary btn-outline gap-1"
                                >
                                  <FiEye className="w-3 h-3" />
                                  İncele
                                </Link>
                              )}
                              {item.type === 'list' && (
                                <Link 
                                  to={`/lists/${item._id}`} 
                                  className="btn btn-sm btn-secondary btn-outline gap-1"
                                >
                                  <FiList className="w-3 h-3" />
                                  Listeyi Gör
                                </Link>
                              )}
                              {item.type === 'watched' && (
                                <Link 
                                  to={`/movies/${item.movie._id}`} 
                                  className="btn btn-sm btn-info btn-outline gap-1"
                                >
                                  <FiFilm className="w-3 h-3" />
                                  Filmi Gör
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              feedStatus === 'succeeded' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h4 className="text-2xl font-bold text-base-content mb-2">Henüz Aktivite Yok</h4>
                  <p className="text-base-content/70 max-w-md mx-auto mb-6">
                    Takip ettiğiniz kişilerin yeni bir aktivitesi bulunmuyor. Daha fazla kullanıcıyı takip ederek sosyal deneyiminizi geliştirebilirsiniz.
                  </p>
                  <button 
                    className="btn btn-primary gap-2"
                    onClick={() => navigate('/users')}
                  >
                    <FiUsers />
                    Kullanıcıları Keşfet
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    );
  };

  const StatsSection = () => {
    if (!movies || movies.length === 0) return null;

    const avgRating = (movies.reduce((acc, movie) => acc + (movie.voteAverage || 0), 0) / movies.length).toFixed(1);
    const totalLikes = movies.reduce((acc, movie) => acc + (movie.platformStats?.likeCount || 0), 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="stat bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 shadow-lg border border-primary/20">
          <div className="stat-figure text-primary">
            <FiFilm className="w-10 h-10" />
          </div>
          <div className="stat-title text-base-content/70">Toplam Film</div>
          <div className="stat-value text-primary text-4xl">{movies.length}</div>
          <div className="stat-desc text-base-content/60">Koleksiyonda</div>
        </div>
        
        <div className="stat bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-6 shadow-lg border border-secondary/20">
          <div className="stat-figure text-secondary">
            <FiStar className="w-10 h-10" />
          </div>
          <div className="stat-title text-base-content/70">Ortalama Puan</div>
          <div className="stat-value text-secondary text-4xl">{avgRating}</div>
          <div className="stat-desc text-base-content/60">/ 10 TMDB</div>
        </div>

        <div className="stat bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-6 shadow-lg border border-accent/20">
          <div className="stat-figure text-accent">
            <FiHeart className="w-10 h-10" />
          </div>
          <div className="stat-title text-base-content/70">Toplam Beğeni</div>
          <div className="stat-value text-accent text-4xl">{totalLikes}</div>
          <div className="stat-desc text-base-content/60">Kullanıcılardan</div>
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="text-8xl mb-6">🎬</div>
      <h3 className="text-3xl font-bold text-base-content mb-4">Henüz Film Yok</h3>
      <p className="text-lg text-base-content/70 mb-8 max-w-2xl mx-auto">
        Veritabanımız henüz filmlerle dolmamış. Harika içerikler için biraz daha bekleyin veya yönetici panelinden film ekleyin.
      </p>
      {isAuthenticated && (
        <button 
          className="btn btn-primary btn-lg gap-3"
          onClick={() => navigate('/admin/movies')}
        >
          <FiPlus className="w-5 h-5" />
          İlk Filmi Ekle
        </button>
      )}
    </div>
  );

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'failed') return <ErrorMessage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-base-300 to-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Welcome Section */}
        <WelcomeSection />

        {/* Stats Section */}
        <StatsSection />

        {/* Feed Section */}
        <FeedSection />

        {/* Movies Section */}
        {movies && movies.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-base-content flex items-center gap-3">
                <FiTrendingUp className="text-primary w-8 h-8" />
                Popüler Filmler
              </h3>
              <button 
                className="btn btn-outline gap-2"
                onClick={() => navigate('/movies')}
              >
                <FiEye />
                Tümünü Gör
                <div className="badge badge-primary ml-2">{movies.length}</div>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {movies.slice(0, 12).map((movie) => (
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

            {movies.length > 12 && (
              <div className="text-center mt-12">
                <button 
                  className="btn btn-primary btn-lg gap-3 px-8"
                  onClick={() => navigate('/movies')}
                >
                  <FiPlus className="w-5 h-5" />
                  Daha Fazla Film Keşfet
                  <div className="badge badge-accent ml-2">
                    +{movies.length - 12}
                  </div>
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
