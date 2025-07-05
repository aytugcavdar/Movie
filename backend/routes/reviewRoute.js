const express = require('express');
const {
    getReviewsForMovie,
    addReview,
    updateReview,
    deleteReview,
    likeReview,
    addCommentToReview,
    reportReview // reportReview fonksiyonunu import ettik
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

router.route('/:id/like').put(protect, likeReview);
router.route('/:id/comments').post(protect, addCommentToReview);
router.route('/:id/report').post(protect, reportReview); // Yeni raporlama rotası

module.exports = router;
