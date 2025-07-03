// backend/routes/userRoute.js
const express = require('express');
const { getUserProfile, followUser, getFollowingFeed } = require('../controllers/userController'); 
const { protect } = require('../middlewares/authMiddeleware');

const router = express.Router();


router.get('/feed', protect, getFollowingFeed); 


router.get('/:username', getUserProfile);

router.put('/:id/follow', protect, followUser);



module.exports = router;