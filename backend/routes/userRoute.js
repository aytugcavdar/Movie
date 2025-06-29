
const express = require('express');
const { getUserProfile, followUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddeleware');

const router = express.Router();

// Herkese açık profil
router.get('/:username', getUserProfile);

// Takip etme
router.put('/:id/follow', protect, followUser);

module.exports = router;