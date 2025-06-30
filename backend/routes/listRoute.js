
const express = require('express');
const {
    getLists,
    getList,
    createList,
    addMovieToList,
    removeMovieFromList,
    deleteList,
    likeList
} = require('../controllers/listController');

const { protect } = require('../middlewares/authMiddeleware');

const router = express.Router();

// Tüm listeler için olan route'lar korumalı olmalı
router.route('/')
    .get(protect, getLists)
    .post(protect, createList);

// Tekil liste işlemleri
router.route('/:id')
    .get(getList) // Herkese açık olabilir, controller içinde kontrol ediliyor
    .delete(protect, deleteList);

// Liste içindeki film işlemleri
router.route('/:id/movies')
    .post(protect, addMovieToList);

router.route('/:id/movies/:movieId')
    .delete(protect, removeMovieFromList);

router.route('/:id/like')
    .put(protect, likeList);

module.exports = router;