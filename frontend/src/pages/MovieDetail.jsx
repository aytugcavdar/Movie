// frontend/src/pages/MovieDetail.jsx

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMovieById } from "../redux/movieSlice";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import AddToWatchlistButton from '../components/AddToWatchlistButton';
import { Link } from "react-router-dom";
import SocialShareButtons from "../components/SocialShareButtons";



const MovieDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedMovie, status, error } = useSelector((state) => state.movie);

  useEffect(() => {
    
    if (id) {
      dispatch(fetchMovieById(id));
    }
  }, [id, dispatch]);

  if (status === "loading")
    return (
      <div className="text-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  if (error) return <div className="alert alert-error">Hata: {error}</div>;
  if (!selectedMovie)
    return <div className="text-center p-10">Film bulunamadı.</div>;

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
  } = selectedMovie;

    const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="card lg:card-side bg-base-100 shadow-xl max-w-6xl mx-auto">
        <figure className="lg:w-1/3">
          <img
            src={fullPosterUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </figure>
        <div className="card-body lg:w-2/3">
          <h1 className="card-title text-3xl md:text-5xl font-bold">{title}</h1>
          <div className="flex flex-wrap gap-2 my-2">
            {genres?.map((g) => (
              <div key={g.id} className="badge badge-primary">
                {g.name}
              </div>
            ))}
          </div>
          <p className="my-4">{overview}</p>
          <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-200">
            <div className="stat">
              <div className="stat-title">Puan</div>
              <div className="stat-value">{voteAverage?.toFixed(1)} / 10</div>
              <div className="stat-desc">TMDB</div>
            </div>
            <div className="stat">
              <div className="stat-title">Yayın Yılı</div>
              <div className="stat-value">
                {new Date(releaseDate).getFullYear()}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Süre</div>
              <div className="stat-value">{runtime} dk</div>
            </div>
          </div>
          {/* İzleme Listesine Ekleme ve Sosyal Paylaşım Butonları */}
          <div className="flex flex-wrap gap-4 items-center justify-start mt-6">
            <AddToWatchlistButton movieId={id} />
            <SocialShareButtons shareUrl={shareUrl} title={title} />
          </div>
          
         {/* Yönetmen(ler) */}
          {crew && crew.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold">Yönetmen</h3>
              <div className="flex flex-wrap gap-2">
                {crew.map(member => (
                  <Link key={member.person._id} to={`/persons/${member.person._id}`} className="link link-hover">
                    {member.person.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Oyuncular */}
          {cast && cast.length > 0 && (
              <div className="mt-6">
                  <h3 className="text-xl font-bold mb-3">Oyuncular</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {cast.slice(0, 8).map(member => ( // İlk 8 oyuncuyu göster
                          <Link to={`/persons/${member.person._id}`} key={member.person._id} className="text-center group">
                              <div className="avatar">
                                  <div className="w-24 rounded-full ring ring-primary group-hover:ring-secondary transition-all">
                                      <img src={`https://image.tmdb.org/t/p/w200${member.person.profilePath}`} alt={member.person.name} />
                                  </div>
                              </div>
                              <p className="mt-2 font-semibold group-hover:text-primary transition-colors">{member.person.name}</p>
                              <p className="text-sm opacity-60">{member.character}</p>
                          </Link>
                      ))}
                  </div>
              </div>
          )}

          {/* Yorumlar Bölümü */}
          <div className="mt-10 p-4 md:p-8 bg-base-100 rounded-lg shadow-xl">
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
