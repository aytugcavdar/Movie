
const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUser,
    getDashboardStats,
    getAllReviewsForModeration,
    updateReviewModerationStatus,
    getAllListsForModeration, 
    updateListModerationStatus
} = require('../controllers/adminController');

const { protect, authorize } = require('../middlewares/authMiddeleware');

const router = express.Router();


router.use(protect);
router.use(authorize('admin'));

router.route('/users')
    .get(getAllUsers);

router.route('/users/:id')
    .get(getUserById)
    .put(updateUser);
router.route('/dashboard-stats')
    .get(getDashboardStats);
router.route('/reviews/moderation')
    .get(getAllReviewsForModeration);

router.route('/reviews/:id/moderation')
    .put(updateReviewModerationStatus);

router.route('/lists/moderation')
    .get(getAllListsForModeration);

router.route('/lists/:id/moderation')
    .put(updateListModerationStatus);

module.exports = router;