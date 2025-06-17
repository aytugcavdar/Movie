const express = require('express');
const {
    getMovies,
    getMovie,
    fetchMovieFromTMDB,
} = require('../controllers/movieController');

const Movie = require('../models/Movie');
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/authMiddeleware');

const router = express.Router();

// Public routes
router.get('/', advancedResults(Movie, {
    path: 'reviews',
    match: { isPublished: true, moderationStatus: 'approved' },
    populate: {
        path: 'user',
        select: 'username firstName lastName avatar'
    },
    options: { limit: 10, sort: { createdAt: -1 } }
}), getMovies);

router.get('/:id', getMovie);

// Protected & Admin only routes
router.post('/tmdb/:tmdbId', protect, authorize('admin'), fetchMovieFromTMDB);

module.exports = router;
