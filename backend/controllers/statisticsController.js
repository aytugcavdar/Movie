
const mongoose = require('mongoose');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Kullanıcıya ait film ve inceleme istatistiklerini getir
// @route   GET /api/v1/statistics/:userId
// @access  Public
exports.getUserStatistics = asyncHandler(async (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    // Temel İnceleme İstatistikleri
    const baseStats = await Review.aggregate([
        { $match: { user: userId, isPublished: true } },
        {
            $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' },
                totalLikesReceived: { $sum: '$likesCount' }
            }
        }
    ]);

    // Türlere Göre Dağılım
    const genresBreakdown = await Review.aggregate([
        { $match: { user: userId, isPublished: true } },
        {
            $lookup: {
                from: 'movies', // 'movies' koleksiyonu
                localField: 'movie',
                foreignField: '_id',
                as: 'movieDetails'
            }
        },
        { $unwind: '$movieDetails' },
        { $unwind: '$movieDetails.genres' },
        {
            $group: {
                _id: '$movieDetails.genres.name',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // Yıllara Göre Dağılım
    const decadesBreakdown = await Review.aggregate([
        { $match: { user: userId, isPublished: true } },
        {
            $lookup: {
                from: 'movies',
                localField: 'movie',
                foreignField: '_id',
                as: 'movieDetails'
            }
        },
        { $unwind: '$movieDetails' },
        {
            $project: {
                releaseYear: { $year: '$movieDetails.releaseDate' }
            }
        },
        {
            $group: {
                _id: {
                    $let: {
                        vars: {
                            year: '$releaseYear'
                        },
                        in: {
                             $concat: [
                                { $toString: { $subtract: ['$$year', { $mod: ['$$year', 10] }] } },
                                's'
                            ]
                        }
                    }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            stats: baseStats[0] || { totalReviews: 0, averageRating: 0, totalLikesReceived: 0 },
            genres: genresBreakdown,
            decades: decadesBreakdown
        }
    });
});