// controllers/movieController.js
const axios = require('axios');
const Movie = require('../models/Movie');
const Person = require('../models/Person'); // Yorum satırı, eğer kullanılıyorsa aktif edin
const Cast = require('../models/Cast'); // Yorum satırı, eğer kullanılıyorsa aktif edin
const Crew = require('../models/Crew'); // Yorum satırı, eğer kullanılıyorsa aktif edin
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
        append_to_response: 'credits,videos,images' // credits datasını çekiyoruz
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

    // Process Cast
    if (tmdbMovie.credits && tmdbMovie.credits.cast) {
      for (const castMember of tmdbMovie.credits.cast) {
        // Find or create Person
        let person = await Person.findOneAndUpdate(
          { tmdbId: castMember.id },
          {
            name: castMember.name,
            profilePath: castMember.profile_path,
            popularity: castMember.popularity,
            gender: castMember.gender,
            knownForDepartment: castMember.known_for_department || 'Acting', // Varsayılan olarak 'Acting'
            // Diğer person detaylarını buraya ekleyebilirsiniz (örn: biography, birthday)
            // Bunun için ayrı bir TMDB Person detail API çağrısı gerekebilir.
            // Şimdilik sadece temel bilgileri kaydediyoruz.
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Create Cast entry
        await Cast.findOneAndUpdate(
          { movie: movie._id, person: person._id },
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

    // Process Crew
    if (tmdbMovie.credits && tmdbMovie.credits.crew) {
      for (const crewMember of tmdbMovie.credits.crew) {
        // Find or create Person
        let person = await Person.findOneAndUpdate(
          { tmdbId: crewMember.id },
          {
            name: crewMember.name,
            profilePath: crewMember.profile_path,
            popularity: crewMember.popularity,
            gender: crewMember.gender,
            knownForDepartment: crewMember.known_for_department || 'Crew', // Varsayılan olarak 'Crew'
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Create Crew entry
        await Crew.findOneAndUpdate(
          { movie: movie._id, person: person._id, job: crewMember.job }, // movie, person ve job birleşimi unique olmalı
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
    // Hata durumunda, eğer film kaydedilmiş ancak cast/crew kaydı başarısız olduysa, filmi de temizlemek isteyebiliriz.
    // Ancak bu, idempotency için daha karmaşık bir mantık gerektirebilir. Şimdilik sadece hata döndürüyoruz.
    return next(new ErrorResponse(`Film eklenirken bir hata oluştu: ${error.message}`, 500));
  }
});

// @desc    Filmi güncelle (Admin)
// @route   PUT /api/v1/movies/:id
// @access  Private (Admin)
exports.updateMovie = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    originalTitle,
    overview,
    tagline,
    releaseDate,
    runtime,
    posterPath,
    backdropPath,
    genres,
    originalLanguage,
    spokenLanguages,
    productionCompanies,
    productionCountries,
    budget,
    revenue,
    status,
    adult,
    extraInfo
  } = req.body;

  let movie = await Movie.findById(id);

  if (!movie) {
    return next(new ErrorResponse(`ID'si ${id} olan film bulunamadı`, 404));
  }

  // Güncellenecek alanları belirle
  const fieldsToUpdate = {
    title,
    originalTitle,
    overview,
    tagline,
    releaseDate: releaseDate ? new Date(releaseDate) : undefined, 
    runtime,
    posterPath,
    backdropPath,
    genres,
    originalLanguage,
    spokenLanguages,
    productionCompanies,
    productionCountries,
    budget,
    revenue,
    status,
    adult,
    extraInfo
  };

  
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined || fieldsToUpdate[key] === '') {
      delete fieldsToUpdate[key];
    }
  });

  movie = await Movie.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true, 
    runValidators: true
  });

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
  const { id } = req.params;

  const movie = await Movie.findById(id);

  if (!movie) {
    return next(new ErrorResponse(`ID'si ${id} olan film bulunamadı`, 404));
  }


  await movie.deleteOne(); 

  res.status(200).json({
    success: true,
    data: {},
    message: 'Film başarıyla silindi'
  });
});