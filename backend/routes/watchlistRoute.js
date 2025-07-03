
const express = require('express');
const {
    getMyWatchlists,
    createWatchlist,
    addMovieToWatchlist,
    removeMovieFromWatchlist,
    updateWatchlist,
    deleteWatchlist
} = require('../controllers/watchlistController');
const { protect } = require('../middlewares/authMiddeleware');

const router = express.Router();

router.use(protect); 

router.route('/')
    .get(getMyWatchlists)
    .post(createWatchlist)

router.route('/:id')
    .put(updateWatchlist)
    .delete(deleteWatchlist); 

router.route('/:id/movies')
    .post(addMovieToWatchlist);

router.route('/:id/movies/:movieId')
    .delete(removeMovieFromWatchlist);

module.exports = router;