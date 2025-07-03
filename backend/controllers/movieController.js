// backend/controllers/movieController.js
const axios = require('axios');
const Movie = require('../models/Movie');
const Person = require('../models/Person');
const Cast = require('../models/Cast');
const Crew = require('../models/Crew');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification'); // Notification modeli eklendi

// TMDB API yapılandırması
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

/**
 
 * @param {number} personId 
 * @returns {Promise<Object|null>} 
 */
const getFullPersonDetails = async (personId) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/person/${personId}`, {
      params: { api_key: TMDB_API_KEY, language: 'tr-TR' }
    });
    return response.data;
  } catch (error) {
    // Tek bir kişi çekme hatası tüm işlemi durdurmasın.
    console.error(`TMDB'den ${personId} ID'li kişi detayları çekilemedi:`, error.message);
    return null;
  }
};


// @desc    Tüm filmleri getir (pagination ve filtreleme ile)
// @route   GET /api/v1/movies
// @access  Public
exports.getMovies = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Tek film getir
// @route   GET /api/v1/movies/:id
// @access  Public
exports.getMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id)
    .populate({
      path: 'reviews',
      match: { isPublished: true, moderationStatus: 'approved' },
      populate: {
        path: 'user',
        select: 'username firstName lastName avatar'
      },
      options: { limit: 10, sort: { createdAt: -1 } }
    })
    .populate({
        path: 'cast',
        populate: {
            path: 'person',
            select: 'name profilePath tmdbId'
        },
        options: { sort: { order: 1 } } // Oyuncuları sıralamasına göre getir
    })
    .populate({
        path: 'crew',
        match: { department: 'Directing', job: 'Director' }, // Sadece yönetmenleri çek
        populate: {
            path: 'person',
            select: 'name profilePath tmdbId'
        }
    });

  if (!movie) {
    return next(new ErrorResponse('Film bulunamadı', 404));
  }

  // Görüntülenme sayısını artır
  movie.platformStats.viewCount = (movie.platformStats.viewCount || 0) + 1;
  await movie.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: movie
  });
});

// @desc    TMDB'den film getir ve veritabanına kaydet
// @route   POST /api/v1/movies/tmdb/:tmdbId
// @access  Private (Admin)
exports.fetchMovieFromTMDB = asyncHandler(async (req, res, next) => {
  const { tmdbId } = req.params;

  let movie = await Movie.findOne({ tmdbId });

  if (movie) {
    return res.status(200).json({
      success: true,
      data: movie,
      message: 'Film zaten veritabanında mevcut'
    });
  }

  try {
    const movieResponse = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'tr-TR',
        append_to_response: 'credits,videos,images'
      }
    });

    const tmdbMovie = movieResponse.data;
    const movieVideos = tmdbMovie.videos?.results
      .filter(video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')) // Sadece YouTube fragmanları veya teaser'ları alıyoruz
      .map(video => ({
        key: video.key,
        site: video.site,
        type: video.type
      }));



    movie = await Movie.create({
      tmdbId: tmdbMovie.id,
      imdbId: tmdbMovie.imdb_id,
      title: tmdbMovie.title,
      originalTitle: tmdbMovie.original_title,
      overview: tmdbMovie.overview,
      tagline: tmdbMovie.tagline,
      releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
      runtime: tmdbMovie.runtime,
      posterPath: tmdbMovie.poster_path,
      backdropPath: tmdbMovie.backdrop_path,
      genres: tmdbMovie.genres,
      originalLanguage: tmdbMovie.original_language,
      spokenLanguages: tmdbMovie.spoken_languages,
      productionCompanies: tmdbMovie.production_companies,
      productionCountries: tmdbMovie.production_countries,
      budget: tmdbMovie.budget,
      revenue: tmdbMovie.revenue,
      voteAverage: tmdbMovie.vote_average,
      voteCount: tmdbMovie.vote_count,
      popularity: tmdbMovie.popularity,
      status: tmdbMovie.status,
      adult: tmdbMovie.adult,
      videos: movieVideos,
      platformStats: {
        viewCount: 0,
        likeCount: 0, // Bu başlangıçta 0 olacak
        watchlistCount: 0,
        reviewCount: 0
      }
    });

    
    if (tmdbMovie.credits && tmdbMovie.credits.cast) {
      for (const castMember of tmdbMovie.credits.cast) {
        
        const personDetails = await getFullPersonDetails(castMember.id);
        
        const personData = {
          tmdbId: castMember.id,
          name: castMember.name,
          profilePath: castMember.profile_path,
          popularity: castMember.popularity,
          gender: castMember.gender,
          knownForDepartment: castMember.known_for_department || 'Acting',
          ...(personDetails && { // Eğer detaylar geldiyse ekle
            imdbId: personDetails.imdb_id,
            biography: personDetails.biography,
            birthday: personDetails.birthday ? new Date(personDetails.birthday) : null,
            deathday: personDetails.deathday ? new Date(personDetails.deathday) : null,
            placeOfBirth: personDetails.place_of_birth,
            adult: personDetails.adult,
            alsoKnownAs: personDetails.also_known_as
          }),
          lastTmdbUpdate: new Date()
        };

        const person = await Person.findOneAndUpdate(
          { tmdbId: castMember.id },
          personData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await Cast.findOneAndUpdate(
          { movie: movie._id, person: person._id, creditId: castMember.credit_id },
          {
            movie: movie._id,
            person: person._id,
            character: castMember.character,
            order: castMember.order,
            castId: castMember.cast_id,
            creditId: castMember.credit_id,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    
    if (tmdbMovie.credits && tmdbMovie.credits.crew) {
      for (const crewMember of tmdbMovie.credits.crew) {
        const personDetails = await getFullPersonDetails(crewMember.id);

        const personData = {
            tmdbId: crewMember.id,
            name: crewMember.name,
            profilePath: crewMember.profile_path,
            popularity: crewMember.popularity,
            gender: crewMember.gender,
            knownForDepartment: crewMember.known_for_department || 'Crew',
            ...(personDetails && {
              imdbId: personDetails.imdb_id,
              biography: personDetails.biography,
              birthday: personDetails.birthday ? new Date(personDetails.birthday) : null,
              deathday: personDetails.deathday ? new Date(personDetails.deathday) : null,
              placeOfBirth: personDetails.place_of_birth,
              adult: personDetails.adult,
              alsoKnownAs: personDetails.also_known_as
            }),
            lastTmdbUpdate: new Date()
        };

        const person = await Person.findOneAndUpdate(
          { tmdbId: crewMember.id },
          personData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await Crew.findOneAndUpdate(
          { movie: movie._id, person: person._id, creditId: crewMember.credit_id },
          {
            movie: movie._id,
            person: person._id,
            job: crewMember.job,
            department: crewMember.department,
            creditId: crewMember.credit_id,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    res.status(201).json({
      success: true,
      data: movie,
      message: 'Film, oyuncu ve ekip bilgileri başarıyla eklendi.'
    });

  } catch (error) {
    console.error('TMDB API veya veritabanı kaydetme hatası:', error.message, error.stack);
    if (movie && movie._id) {
        await Movie.findByIdAndDelete(movie._id); 
    }
    return next(new ErrorResponse(`Film eklenirken bir hata oluştu: ${error.message}`, 500));
  }
});

// @desc    Filmi güncelle (Admin)
// @route   PUT /api/v1/movies/:id
// @access  Private (Admin)
exports.updateMovie = asyncHandler(async (req, res, next) => {
  let movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!movie) {
    return next(new ErrorResponse(`ID'si ${req.params.id} olan film bulunamadı`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: movie,
    message: 'Film başarıyla güncellendi'
  });
});

// @desc    Filmi sil (Admin)
// @route   DELETE /api/v1/movies/:id
// @access  Private (Admin)
exports.deleteMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    return next(new ErrorResponse(`ID'si ${req.params.id} olan film bulunamadı`, 404));
  }
  
  // İlişkili Cast ve Crew kayıtlarını sil
  await Cast.deleteMany({ movie: movie._id });
  await Crew.deleteMany({ movie: movie._id });
  // İlişkili Review, List vs. kayıtları da silmek isteyebilirsiniz.

  await movie.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Film ve ilişkili tüm kayıtlar başarıyla silindi'
  });
});

// @desc    Bir filmi beğen/beğenmekten vazgeç
// @route   PUT /api/v1/movies/:id/like
// @access  Private
exports.likeMovie = asyncHandler(async (req, res, next) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan film bulunamadı`, 404));
    }

    const isLiked = await movie.toggleLike(req.user.id);
    
 
    
    const message = isLiked ? 'Film beğenildi.' : 'Film beğenmekten vazgeçildi.';

    res.status(200).json({
        success: true,
        data: {
            likesCount: movie.platformStats.likeCount,
            isLikedByUser: isLiked 
        },
        message
    });
});