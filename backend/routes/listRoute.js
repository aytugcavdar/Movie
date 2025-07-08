const express = require('express');
const {
    getLists,
    getList,
    createList,
    addMovieToList,
    removeMovieFromList,
    deleteList,
    updateList,
    likeList,
    reportList,
    addCommentToList
} = require('../controllers/listController');

const { protect } = require('../middlewares/authMiddeleware');

const router = express.Router();


router.route('/')
    .get(protect, getLists)
    .post(protect, createList);


router.route('/:id')
    .get(getList) 
    .delete(protect, deleteList)
    .put(protect, updateList);


router.route('/:id/movies')
    .post(protect, addMovieToList);

router.route('/:id/movies/:movieId')
    .delete(protect, removeMovieFromList);

router.route('/:id/like')
    .put(protect, likeList);

router.route('/:id/report').post(protect, reportList);

router.route('/:id/comments').post(protect, addCommentToList);

module.exports = router;
