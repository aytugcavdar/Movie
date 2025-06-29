
const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUser
} = require('../controllers/adminController');

const { protect, authorize } = require('../middlewares/authMiddeleware');

const router = express.Router();

// Bu dosyadaki tüm route'lar hem korumalı (giriş yapmış) hem de admin yetkili olmalı
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
    .get(getAllUsers);

router.route('/users/:id')
    .get(getUserById)
    .put(updateUser);

module.exports = router;