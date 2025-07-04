
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Tüm kullanıcıları getir (Admin)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    // Gelişmiş sonuçlar middleware'ini burada doğrudan kullanmak yerine
    // basit bir listeleme yapıyoruz. İstenirse daha sonra eklenebilir.
    const users = await User.find({});
    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

// @desc    Tek bir kullanıcıyı ID ile getir (Admin)
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan kullanıcı bulunamadı`, 404));
    }
    res.status(200).json({ success: true, data: user });
});

// @desc    Bir kullanıcının bilgilerini güncelle (Admin)
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    // Adminin değiştirebileceği alanları belirliyoruz
    const { role, isActive } = req.body;
    const fieldsToUpdate = {};
    if (role) fieldsToUpdate.role = role;
    if (typeof isActive === 'boolean') fieldsToUpdate.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan kullanıcı bulunamadı`, 404));
    }

    res.status(200).json({ success: true, data: user, message: "Kullanıcı bilgileri güncellendi." });
});
// @desc    Admin panel istatistiklerini getir
// @route   GET /api/v1/admin/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalLists = await List.countDocuments();

    // En popüler filmler (örn: platformStats.likeCount'a göre)
    const topMoviesByLikes = await Movie.find({})
        .sort({ 'platformStats.likeCount': -1 })
        .limit(5)
        .select('title posterPath platformStats.likeCount');

    // En çok yorum yapılan filmler
    const topMoviesByReviews = await Movie.find({})
        .sort({ 'platformStats.reviewCount': -1 })
        .limit(5)
        .select('title posterPath platformStats.reviewCount');

    // En aktif kullanıcılar (örn: reviewCount'a göre)
    const mostActiveUsers = await User.aggregate([
        {
            $lookup: {
                from: 'reviews', // reviews koleksiyonu
                localField: '_id',
                foreignField: 'user',
                as: 'userReviews'
            }
        },
        {
            $project: {
                username: 1,
                avatar: 1,
                reviewCount: { $size: '$userReviews' }
            }
        },
        { $sort: { reviewCount: -1 } },
        { $limit: 5 }
    ]);


    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalMovies,
            totalReviews,
            totalLists,
            topMoviesByLikes,
            topMoviesByReviews,
            mostActiveUsers
        }
    });
});
exports.getAllReviewsForModeration = asyncHandler(async (req, res, next) => {
    const reviews = await Review.find({
        $or: [{ moderationStatus: 'pending' }, { isReported: true }]
    }).populate('user', 'username avatar')
      .populate('movie', 'title posterPath')
      .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
    });
});

// @desc    Yorumun moderasyon durumunu güncelle (Admin)
// @route   PUT /api/v1/admin/reviews/:id/moderation
// @access  Private/Admin
exports.updateReviewModerationStatus = asyncHandler(async (req, res, next) => {
    const { moderationStatus } = req.body; // 'approved', 'rejected'
    if (!['approved', 'rejected'].includes(moderationStatus)) {
        return next(new ErrorResponse('Geçersiz moderasyon durumu', 400));
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan yorum bulunamadı`, 404));
    }

    review.moderationStatus = moderationStatus;
    review.isReported = false; // Moderasyon yapıldıktan sonra raporlanma durumu sıfırlanabilir
    review.reportCount = 0; // Rapor sayısı sıfırlanabilir

    await review.save();

    res.status(200).json({
        success: true,
        data: review,
        message: `Yorum başarıyla ${moderationStatus === 'approved' ? 'onaylandı' : 'reddedildi'}.`
    });
});

exports.getAllListsForModeration = asyncHandler(async (req, res, next) => {
    const lists = await List.find({
        $or: [{ moderationStatus: 'pending' }, { isReported: true }]
    }).populate('user', 'username avatar')
      .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: lists.length,
        data: lists
    });
});

// @desc    Listenin moderasyon durumunu güncelle (Admin)
// @route   PUT /api/v1/admin/lists/:id/moderation
// @access  Private/Admin
exports.updateListModerationStatus = asyncHandler(async (req, res, next) => {
    const { moderationStatus } = req.body; // 'approved', 'rejected'
    if (!['approved', 'rejected'].includes(moderationStatus)) {
        return next(new ErrorResponse('Geçersiz moderasyon durumu', 400));
    }

    const list = await List.findById(req.params.id);
    if (!list) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan liste bulunamadı`, 404));
    }

    list.moderationStatus = moderationStatus;
    list.isReported = false;
    list.reportCount = 0;

    await list.save();

    res.status(200).json({
        success: true,
        data: list,
        message: `Liste başarıyla ${moderationStatus === 'approved' ? 'onaylandı' : 'reddedildi'}.`
    });
});
