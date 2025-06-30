
const express = require('express');
const { getUserStatistics } = require('../controllers/statisticsController');

const router = express.Router();

// Bu endpoint herkese açık olacak, çünkü kullanıcı profilleri herkese açık.
router.route('/:userId').get(getUserStatistics);

module.exports = router;