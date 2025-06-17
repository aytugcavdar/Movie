// controllers/movieController.js
const axios = require('axios');
const Movie = require('../models/Movie');
const Person = require('../models/Person');
const Cast = require('../models/Cast');
const Crew = require('../models/Crew');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// @desc    Tüm filmleri getir (pagination ve filtreleme ile)
// @route   GET /api/v1/movies
// @access  Public
exports.getMovies = asyncHandler(async (req, res, next) => {
  // advancedResults middleware kullanılacak
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
    });

  if (!movie) {
    return next(new ErrorResponse('Film bulunamadı', 404));
  }

  // Görüntülenme sayısını artır (anonim kullanıcılar için de)
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

  // Önce film veritabanında var mı kontrol et
  let movie = await Movie.findOne({ tmdbId });

  if (movie) {
    return res.status(200).json({
      success: true,
      data: movie,
      message: 'Film zaten veritabanında mevcut'
    });
  }

  try {
    // TMDB'den film detaylarını çek
    const movieResponse = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'tr-TR',
        append_to_response: 'credits,videos,images'
      }
    });

    const tmdbMovie = movieResponse.data;

    // Film verisini veritabanına kaydet
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
        platformStats: {
            viewCount: 0,
            likeCount: 0,
            dislikeCount: 0
        }
    });

    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('TMDB API hatası:', error);
    return next(new ErrorResponse('TMDB API hatası', 500));
  }
});
// @desc    TMDB'den film arama
// @route   GET /api/v1/movies/search
// @access  Public