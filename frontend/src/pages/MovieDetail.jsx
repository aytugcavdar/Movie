import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMovieById, likeMovie } from "../redux/movieSlice";
import { markMovieAsWatched } from "../redux/userSlice"; // markMovieAsWatched import edildi
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import AddToWatchlistButton from '../components/AddToWatchlistButton';
import { Link } from "react-router-dom";
import SocialShareButtons from "../components/SocialShareButtons";
import { FiHeart, FiCalendar, FiClock, FiStar, FiChevronRight, FiPlus, FiList, FiPlay, FiUsers, FiUser, FiCheckCircle } from 'react-icons/fi'; // FiCheckCircle eklendi
import { toast } from 'react-toastify';
import { fetchLists, addMovieToList } from '../redux/listSlice'; 

const MovieDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedMovie, status, error } = useSelector((state) => state.movie);
  const { isAuthenticated, user: currentUser } = useSelector((state) => state.auth);
  const { lists, status: listStatus } = useSelector(state => state.list);
  const { profiles } = useSelector(state => state.user); // userSlice'tan profilleri al

  // Mevcut kullanıcının bu filmi izleyip izlemediğini kontrol et
  const currentUserProfile = profiles[currentUser?.username];
  const isWatchedByUser = currentUserProfile?.watchedMovies?.some(
    (item) => item.movie?._id === id
  );


  useEffect(() => {
    if (id) {
      dispatch(fetchMovieById(id));
    }
    if (isAuthenticated && listStatus === 'idle') {
        dispatch(fetchLists());
    }
  }, [id, dispatch, isAuthenticated, listStatus]);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error("Filmi beğenmek için giriş yapmalısınız.");
      return;
    }
    dispatch(likeMovie(id));
  };

  const handleAddMovieToList = async (listId, movieId) => {
      try {
          await dispatch(addMovieToList({ listId, movieId })).unwrap();
      } catch (err) {
          toast.error(err || "Film listeye eklenirken bir hata oluştu!");
      }
  };

  const handleMarkAsWatched = async () => {
    if (!isAuthenticated) {
        toast.error("Filmi izlendi olarak işaretlemek için giriş yapmalısınız.");
        return;
    }
    // İzlendi olarak işaretlerken puan verme opsiyonu da eklenebilir
    dispatch(markMovieAsWatched({ movieId: id }));
  };

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral to-base-300">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
          <p className="text-lg text-base-content/70">Film yükleniyor...</p>
        </div>
      </div>
    );
  
  if (error) 
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral to-base-300">
        <div className="alert alert-error max-w-md shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Hata: {error}</span>
        </div>
      </div>
    );
  
  if (!selectedMovie)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral to-base-300">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-xl text-base-content/70">Film bulunamadı.</p>
        </div>
      </div>
    );

  const {
    title,
    fullPosterUrl,
    overview,
    releaseDate,
    runtime,
    genres,
    voteAverage,
    cast,
    crew,
    videos,
    platformStats,
    isLikedByUser
  } = selectedMovie;

  const shareUrl = window.location.href;

  const formatRuntime = (minutes) => {
    if (!minutes) return 'Bilinmiyor';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}s ${mins}d` : `${mins}d`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-base-300 to-base-200">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-300/50 to-base-300"></div>
        <div className="container mx-auto px-4 pt-8 pb-16 relative z-10">
          
          {/* Main Movie Card */}
          <div className="card lg:card-side bg-base-100/95 backdrop-blur-sm shadow-2xl border border-base-300/50 rounded-2xl overflow-hidden">
            
            {/* Poster Section */}
            <figure className="lg:w-1/3 p-6 bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
              <div className="relative group">
                <img
                  src={fullPosterUrl}
                  alt={title}
                  className="w-full h-full object-cover rounded-xl shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </figure>

            {/* Content Section */}
            <div className="card-body lg:w-2/3 p-8 lg:p-12">
              
              {/* Title */}
              <div className="mb-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-base-content mb-4 leading-tight">
                  {title}
                </h1>
                
                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {genres?.map((g) => (
                    <div key={g.id} className="badge badge-primary badge-lg px-4 py-2 font-medium">
                      {g.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Overview */}
              <div className="mb-8">
                <p className="text-base-content/80 text-lg leading-relaxed line-clamp-4">
                  {overview}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="stat bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="stat-figure text-primary">
                    <FiStar className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">TMDB Puanı</div>
                  <div className="stat-value text-primary text-3xl">{voteAverage?.toFixed(1)}</div>
                  <div className="stat-desc">10 üzerinden</div>
                </div>

                <div className="stat bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 border border-secondary/20">
                  <div className="stat-figure text-secondary">
                    <FiCalendar className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">Çıkış Yılı</div>
                  <div className="stat-value text-secondary text-3xl">
                    {new Date(releaseDate).getFullYear()}
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/20">
                  <div className="stat-figure text-accent">
                    <FiClock className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">Süre</div>
                  <div className="stat-value text-accent text-3xl">{formatRuntime(runtime)}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                <AddToWatchlistButton movieId={id} />

                {isAuthenticated && (
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-info gap-2">
                      <FiPlus className="w-4 h-4" />
                      Listeye Ekle
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 z-50 border border-base-300">
                      {listStatus === 'loading' ? (
                        <li><span className="loading loading-spinner loading-sm"></span></li>
                      ) : lists && lists.length > 0 ? (
                        lists.map(list => (
                          <li key={list._id}>
                            <a onClick={() => handleAddMovieToList(list._id, id)} className="gap-2">
                              <FiList className="w-4 h-4" />
                              {list.title}
                            </a>
                          </li>
                        ))
                      ) : (
                        <li><span className="text-base-content/50 p-2">Henüz liste yok</span></li>
                      )}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleLike}
                  className={`btn gap-2 ${isLikedByUser ? 'btn-error' : 'btn-outline btn-error'}`}
                  disabled={!isAuthenticated || status === 'loading'}
                >
                  <FiHeart className={`w-4 h-4 ${isLikedByUser ? 'fill-current' : ''}`} />
                  {platformStats?.likeCount || 0}
                </button>

                {/* YENİ EKLENDİ: İzlenenler Butonu */}
                {isAuthenticated && (
                    <button
                        onClick={handleMarkAsWatched}
                        className={`btn gap-2 ${isWatchedByUser ? 'btn-success' : 'btn-outline btn-success'}`}
                        disabled={status === 'loading'}
                    >
                        <FiCheckCircle className={`w-4 h-4 ${isWatchedByUser ? 'fill-current' : ''}`} />
                        {isWatchedByUser ? 'İzlendi' : 'İzlendi Olarak İşaretle'}
                    </button>
                )}

                <SocialShareButtons shareUrl={shareUrl} title={title} />
              </div>

              {/* Director */}
              {crew && crew.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FiUser className="w-5 h-5" />
                    Yönetmen
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {crew.map(member => (
                      <Link 
                        key={member.person._id} 
                        to={`/persons/${member.person._id}`} 
                        className="btn btn-ghost btn-sm gap-1"
                      >
                        {member.person.name}
                        <FiChevronRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 pb-16">
        
        {/* Trailers */}
        {videos && videos.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <FiPlay className="w-8 h-8 text-primary" />
              Fragmanlar
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {videos.filter(v => v.type === 'Trailer' && v.site === 'YouTube').slice(0,2).map((video) => (
                <div key={video.key} className="card bg-base-100 shadow-xl border border-base-300">
                  <figure className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${video.key}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${title} Fragman`}
                    ></iframe>
                  </figure>
                  <div className="card-body p-4">
                    <h3 className="card-title text-lg">{video.name || 'Fragman'}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cast */}
        {cast && cast.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <FiUsers className="w-8 h-8 text-secondary" />
              Oyuncular
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {cast.slice(0, 16).map(member => (
                <Link 
                  to={`/persons/${member.person._id}`} 
                  key={member.person._id} 
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <figure className="px-4 pt-4">
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img 
                          src={`https://image.tmdb.org/t/p/w200${member.person.profilePath}`} 
                          alt={member.person.name}
                        />
                      </div>
                    </div>
                  </figure>
                  <div className="card-body p-4 text-center">
                    <h3 className="font-semibold text-sm leading-tight">{member.person.name}</h3>
                    <p className="text-xs text-base-content/60 mt-1">{member.character}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8">
            <h2 className="card-title text-3xl mb-8">💭 Yorumlar</h2>
            <ReviewForm movieId={id} />
            <div className="divider my-8"></div>
            <ReviewList reviews={selectedMovie?.reviews ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
