import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchPersonById } from "../redux/personSlice";
import MovieCard from "../components/MovieCard"; // MovieCard'ı kullanacağız
import { FiCalendar, FiMapPin, FiFilm, FiUser, FiAward, FiInfo } from 'react-icons/fi'; // Yeni ikonlar

const PersonDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedPerson, status, error } = useSelector((state) => state.person);

  useEffect(() => {
    if (id) {
      dispatch(fetchPersonById(id));
    }
  }, [id, dispatch]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral to-base-300">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
          <p className="text-lg text-base-content/70">Kişi bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
  }

  if (!selectedPerson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral to-base-300">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-xl text-base-content/70">Kişi bulunamadı.</p>
        </div>
      </div>
    );
  }

  const {
    name,
    fullProfileUrl,
    biography,
    birthday,
    deathday,
    placeOfBirth,
    knownForDepartment,
    genderText,
    age,
    filmography = [], // Filmografi boş olabilir
  } = selectedPerson;

  // Filmografiyi rollere göre grupla
  const filmographyByRole = filmography.reduce((acc, item) => {
    // Oyuncu ise 'Actor' olarak ekle
    if (item.character) {
        if (!acc.Actor) acc.Actor = [];
        acc.Actor.push(item);
    } 
    // Ekip üyesi ise departmanına göre ekle
    else if (item.department) {
        if (!acc[item.department]) acc[item.department] = [];
        acc[item.department].push(item);
    }
    return acc;
  }, {});

  // Filmografiyi yıllara göre sırala
  const sortFilmography = (items) => {
    return items.sort((a, b) => {
      const yearA = a.movie?.releaseDate ? new Date(a.movie.releaseDate).getFullYear() : 0;
      const yearB = b.movie?.releaseDate ? new Date(b.movie.releaseDate).getFullYear() : 0;
      return yearB - yearA; // Yeni filmler önce gelsin
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-base-300 to-base-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="card lg:card-side bg-base-100 shadow-xl border border-base-300 rounded-2xl overflow-hidden">
          {/* Kişi Fotoğrafı */}
          <figure className="lg:w-1/3 p-6 bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
            <img
              src={fullProfileUrl}
              alt={name}
              className="w-full h-auto object-cover rounded-xl shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            />
          </figure>

          {/* Kişi Bilgileri */}
          <div className="card-body lg:w-2/3 p-8 lg:p-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-base-content mb-4 leading-tight">
              {name}
            </h1>

            {knownForDepartment && (
              <div className="badge badge-primary badge-lg px-4 py-2 font-medium mb-4">
                {knownForDepartment === 'Acting' ? 'Oyuncu' : knownForDepartment === 'Directing' ? 'Yönetmen' : knownForDepartment}
              </div>
            )}

            {/* Biyografi */}
            {biography && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <FiInfo className="w-5 h-5 text-primary" />
                  Biyografi
                </h3>
                <p className="text-base-content/80 text-lg leading-relaxed">
                  {biography || "Biyografi bulunamadı."}
                </p>
              </div>
            )}

            {/* Kişisel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {birthday && (
                <div className="stat bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 border border-secondary/20">
                  <div className="stat-figure text-secondary">
                    <FiCalendar className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">Doğum Tarihi</div>
                  <div className="stat-value text-secondary text-2xl">
                    {new Date(birthday).toLocaleDateString('tr-TR')}
                  </div>
                  {age && <div className="stat-desc">({age} yaşında)</div>}
                </div>
              )}
              {deathday && (
                <div className="stat bg-gradient-to-br from-error/10 to-error/5 rounded-xl p-4 border border-error/20">
                  <div className="stat-figure text-error">
                    <FiCalendar className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">Ölüm Tarihi</div>
                  <div className="stat-value text-error text-2xl">
                    {new Date(deathday).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              )}
              {placeOfBirth && (
                <div className="stat bg-gradient-to-br from-info/10 to-info/5 rounded-xl p-4 border border-info/20">
                  <div className="stat-figure text-info">
                    <FiMapPin className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">Doğum Yeri</div>
                  <div className="stat-value text-info text-2xl line-clamp-1">
                    {placeOfBirth}
                  </div>
                </div>
              )}
              {genderText && (
                <div className="stat bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/20">
                  <div className="stat-figure text-accent">
                    <FiUser className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">Cinsiyet</div>
                  <div className="stat-value text-accent text-2xl">
                    {genderText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filmografi Bölümü */}
        {Object.keys(filmographyByRole).length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-base-content mb-8 flex items-center gap-3">
              <FiFilm className="w-8 h-8 text-primary" />
              Filmografi
            </h2>
            {Object.entries(filmographyByRole).map(([role, movies]) => (
              <div key={role} className="mb-10">
                <h3 className="text-2xl font-bold text-base-content mb-6 flex items-center gap-2">
                  {role === 'Actor' ? <FiUser className="w-6 h-6" /> : <FiAward className="w-6 h-6" />}
                  {role === 'Actor' ? 'Oyuncu Olarak' : role} ({movies.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {sortFilmography(movies).map(item => (
                    <MovieCard key={item.movie._id} movie={item.movie} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetail;
