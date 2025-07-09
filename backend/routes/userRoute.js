// backend/routes/userRoute.js
const express = require('express');
const { getUserProfile, followUser, getFollowingFeed, markMovieAsWatched,searchUsers } = require('../controllers/userController'); 
const { protect } = require('../middlewares/authMiddeleware');

const router = express.Router();



router.get('/search', protect, searchUsers);

router.get('/feed', protect, getFollowingFeed);

router.get('/:username', getUserProfile);

router.put('/:id/follow', protect, followUser);

router.put('/watched/:movieId', protect, markMovieAsWatched);


module.exports = router;
