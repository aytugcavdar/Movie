
const express = require('express');
const { getNotifications, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddeleware');

const router = express.Router();

router.use(protect); // Bu route'daki tüm işlemler için giriş yapmış olmak gerekir.

router.route('/')
    .get(getNotifications);

router.route('/mark-all-read')
    .put(markAllAsRead);

module.exports = router;