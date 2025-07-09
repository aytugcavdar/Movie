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
    fullBackdropUrl,
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
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <div
        className="hero min-h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${fullBackdropUrl})` }}
      >
        <div className="hero-overlay bg-opacity-70 bg-gradient-to-t from-base-200 via-base-200/80 to-transparent"></div>
        <div className="hero-content text-neutral-content w-full max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 w-full items-center">
            <img
              src={fullPosterUrl}
              alt={title}
              className="w-64 max-w-sm rounded-lg shadow-2xl"
            />
            <div className="flex-1">
              <h1 className="text-5xl font-bold">{title}</h1>
              <div className="flex flex-wrap gap-2 my-4">
                {genres?.map((g) => (
                  <div key={g.id} className="badge badge-primary">
                    {g.name}
                  </div>
                ))}
              </div>
              <p className="py-6 text-lg">{overview}</p>
              
              <div className="flex flex-wrap gap-4 items-center">
                  <AddToWatchlistButton movieId={id} />

                  {isAuthenticated && (
                    <div className="dropdown dropdown-end">
                      <button tabIndex={0} className="btn btn-info gap-2">
                        <FiPlus /> Listeye Ekle
                      </button>
                      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
                        {listStatus === 'loading' ? (
                          <li><span className="loading loading-spinner"></span></li>
                        ) : lists?.length > 0 ? (
                          lists.map(list => (
                            <li key={list._id}>
                              <a onClick={() => handleAddMovieToList(list._id, id)}>
                                <FiList /> {list.title}
                              </a>
                            </li>
                          ))
                        ) : (
                          <li><a>Önce liste oluşturun</a></li>
                        )}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={handleLike}
                    className={`btn gap-2 ${isLikedByUser ? 'btn-error' : 'btn-outline btn-error'}`}
                    disabled={!isAuthenticated || status === 'loading'}
                  >
                    <FiHeart className={`${isLikedByUser ? 'fill-current' : ''}`} /> {platformStats?.likeCount || 0}
                  </button>
                  
                  {isAuthenticated && (
                      <button
                          onClick={handleMarkAsWatched}
                          className={`btn gap-2 ${isWatchedByUser ? 'btn-success' : 'btn-outline btn-success'}`}
                          disabled={status === 'loading'}
                      >
                          <FiCheckCircle /> {isWatchedByUser ? 'İzlendi' : 'İzlendi İşaretle'}
                      </button>
                  )}
              </div>
              <div className="mt-4">
                <SocialShareButtons shareUrl={shareUrl} title={title} />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Details, Cast, Crew, Reviews Section */}
      <div className="container mx-auto p-4 -mt-16 relative z-10">
          <div className="grid grid-cols-12 gap-8">
              {/* Left Side */}
              <div className="col-span-12 lg:col-span-8 space-y-8">
                  {/* Trailers */}
                  {videos?.length > 0 && (
                      <div className="card bg-base-100 shadow-xl">
                          <div className="card-body">
                              <h2 className="card-title text-2xl mb-4"><FiPlay className="text-primary"/> Fragmanlar</h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {videos.filter(v => v.type === 'Trailer' && v.site === 'YouTube').slice(0, 2).map(video => (
                                    <div key={video.key} className="aspect-video">
                                        <iframe
                                            className="w-full h-full rounded-lg"
                                            src={`https://www.youtube.com/embed/${video.key}`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title={video.name}
                                        ></iframe>
                                    </div>
                                ))}
                              </div>
                          </div>
                      </div>
                  )}
                  {/* Reviews */}
                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">💭 Yorumlar</h2>
                        <ReviewForm movieId={id} />
                        <div className="divider"></div>
                        <ReviewList reviews={selectedMovie?.reviews ?? []} />
                    </div>
                  </div>
              </div>

              {/* Right Side */}
              <div className="col-span-12 lg:col-span-4 space-y-8">
                  {/* Details */}
                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">Detaylar</h2>
                        <ul className="space-y-2">
                            <li className="flex justify-between"><span><FiStar className="inline mr-2"/> Puan:</span> <strong>{voteAverage?.toFixed(1)} / 10</strong></li>
                            <li className="flex justify-between"><span><FiCalendar className="inline mr-2"/> Çıkış Tarihi:</span> <strong>{new Date(releaseDate).toLocaleDateString('tr-TR')}</strong></li>
                            <li className="flex justify-between"><span><FiClock className="inline mr-2"/> Süre:</span> <strong>{formatRuntime(runtime)}</strong></li>
                            {crew && crew.length > 0 && (
                                <li className="flex justify-between items-start">
                                    <span><FiUser className="inline mr-2"/> Yönetmen:</span>
                                    <div className="text-right">
                                        {crew.map(member => (
                                            <Link key={member.person._id} to={`/persons/${member.person._id}`} className="link link-hover block">
                                                <strong>{member.person.name}</strong>
                                            </Link>
                                        ))}
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                  </div>

                  {/* Cast */}
                  {cast && cast.length > 0 && (
                      <div className="card bg-base-100 shadow-xl">
                          <div className="card-body">
                              <h2 className="card-title text-2xl mb-4"><FiUsers className="text-secondary"/> Oyuncular</h2>
                              <div className="space-y-4">
                                {cast.slice(0, 8).map(member => (
                                    <Link to={`/persons/${member.person._id}`} key={member.person._id} className="flex items-center gap-4 hover:bg-base-200 p-2 rounded-lg">
                                        <div className="avatar">
                                            <div className="w-16 rounded-full">
                                                <img src={`https://image.tmdb.org/t/p/w200${member.person.profilePath}`} alt={member.person.name} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{member.person.name}</div>
                                            <div className="text-sm opacity-50">{member.character}</div>
                                        </div>
                                    </Link>
                                ))}
                                {cast.length > 8 && (
                                    <Link to="#" className="btn btn-primary btn-block mt-4">Tüm Kadroyu Gör <FiChevronRight/></Link>
                                )}
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default MovieDetail;