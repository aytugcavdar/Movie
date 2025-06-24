// backend/routes/reviewRoute.js

const express = require('express');
const {
    getReviewsForMovie,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

const { protect, authorize } = require('../middlewares/authMiddeleware');

// mergeParams: true, diğer router'lardan gelen parametreleri (örn: movieId) bu router içinde kullanabilmeyi sağlar.
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(getReviewsForMovie)
    .post(protect, addReview);

router.route('/:id')
    .put(protect, updateReview)
    .delete(protect, deleteReview);

module.exports = router;