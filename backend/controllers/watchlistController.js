// backend/controllers/watchlistController.js

const Watchlist = require('../models/Watchlist');
const Movie = require('../models/Movie');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Kullanıcının tüm izleme listelerini getir
// @route   GET /api/v1/watchlists
// @access  Private
exports.getMyWatchlists = asyncHandler(async (req, res, next) => {
    const watchlists = await Watchlist.find({ user: req.user.id }).populate({
        path: 'movies.movie',
        
        select: 'title posterPath voteAverage releaseDate runtime voteCount genres overview'
    });

    res.status(200).json({
        success: true,
        count: watchlists.length,
        data: watchlists
    });
});

// @desc    Yeni bir izleme listesi oluştur
// @route   POST /api/v1/watchlists
// @access  Private
exports.createWatchlist = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;
    const watchlist = await Watchlist.create(req.body);
    res.status(201).json({ success: true, data: watchlist });
});

// @desc    İzleme listesine film ekle
// @route   POST /api/v1/watchlists/:id/movies
// @access  Private
exports.addMovieToWatchlist = asyncHandler(async (req, res, next) => {
    const watchlist = await Watchlist.findById(req.params.id);
    if (!watchlist) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan liste bulunamadı`, 404));
    }
    if (watchlist.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu listeye film ekleme yetkiniz yok`, 403));
    }
    await watchlist.addMovie(req.body.movieId);
    res.status(200).json({ success: true, data: watchlist });
});

// @desc    İzleme listesinden film sil
// @route   DELETE /api/v1/watchlists/:id/movies/:movieId
// @access  Private
exports.removeMovieFromWatchlist = asyncHandler(async (req, res, next) => {
    const watchlist = await Watchlist.findById(req.params.id);
    if (!watchlist) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan liste bulunamadı`, 404));
    }
    if (watchlist.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu listeden film silme yetkiniz yok`, 403));
    }
    await watchlist.removeMovie(req.params.movieId);
    res.status(200).json({ success: true, data: watchlist });
});