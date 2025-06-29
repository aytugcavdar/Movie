
const express = require('express');
const { getPerson } = require('../controllers/personController');

const router = express.Router();

router.route('/:id').get(getPerson);

module.exports = router;