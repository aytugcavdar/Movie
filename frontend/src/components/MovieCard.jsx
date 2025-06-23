import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiCalendar, FiClock, FiPlay } from 'react-icons/fi';

const MovieCard = ({ movie, className = "" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movies/${movie._id}`);
  };

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

  const getGenreNames = (genres) => {
    if (!genres || genres.length === 0) return 'Tür belirtilmemiş';
    return genres.slice(0, 3).map(genre => genre.name).join(', ');
  };

  const getPosterUrl = () => {
    return movie.posterPath 
      ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';
  };

  const getRating = () => {
    return movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A';
  };

  return (
    <div 
      className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      {/* Poster Image */}
      <figure className="aspect-[2/3] overflow-hidden relative">
        <img
          src={getPosterUrl()}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-white text-center">
            <FiPlay className="text-4xl mx-auto mb-2" />
            <span className="text-sm font-medium">Detayları Gör</span>
          </div>
        </div>

        {/* Rating Badge */}
        {movie.voteAverage && (
          <div className="absolute top-2 right-2 badge badge-warning gap-1 text-xs font-bold">
            <FiStar className="text-xs" />
            {getRating()}
          </div>
        )}
      </figure>
      
      {/* Card Content */}
      <div className="card-body p-4">
        {/* Title */}
        <h2 className="card-title text-base font-bold line-clamp-2 mb-2 min-h-[2.5rem]">
          {movie.title}
        </h2>
        
        {/* Movie Info */}
        <div className="space-y-2 mb-3">
          {/* Release Year */}
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <FiCalendar className="text-primary flex-shrink-0" />
            <span>{formatDate(movie.releaseDate)}</span>
          </div>
          
          {/* Runtime */}
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <FiClock className="text-primary flex-shrink-0" />
            <span>{formatRuntime(movie.runtime)}</span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <FiStar className="text-yellow-500 flex-shrink-0" />
            <span>{getRating()}</span>
            {movie.voteCount && (
              <span className="text-xs opacity-60">({movie.voteCount})</span>
            )}
          </div>
        </div>
        
        {/* Genres */}
        <div className="mb-3">
          <p className="text-xs text-base-content/60 line-clamp-1">
            {getGenreNames(movie.genres)}
          </p>
        </div>
        
        {/* Overview */}
        {movie.overview && (
          <p className="text-sm text-base-content/80 line-clamp-3 leading-relaxed">
            {movie.overview}
          </p>
        )}

        {/* Action Button */}
        <div className="card-actions justify-end mt-4">
          <button 
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <FiPlay className="text-xs" />
            İzle
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;