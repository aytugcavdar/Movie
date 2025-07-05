

const Review = require('../models/Review');
const Movie = require('../models/Movie');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Bir filme ait tüm incelemeleri getir
// @route   GET /api/v1/movies/:movieId/reviews
// @access  Public
exports.getReviewsForMovie = asyncHandler(async (req, res, next) => {
    const reviews = await Review.find({ movie: req.params.movieId }).populate({
        path: 'user',
        select: 'username avatar'
    });

    res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
    });
});

// @desc    Yeni bir inceleme ekle
// @route   POST /api/v1/movies/:movieId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.movie = req.params.movieId;
    req.body.user = req.user.id;

    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
        return next(new ErrorResponse(`ID'si ${req.params.movieId} olan film bulunamadı`, 404));
    }
    
    // Kullanıcının bu filme zaten bir yorum yapıp yapmadığını kontrol et
    const existingReview = await Review.findOne({ movie: req.params.movieId, user: req.user.id });
    if(existingReview) {
        return next(new ErrorResponse('Bu filme zaten bir yorum yapmışsınız.', 400));
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    });
});

// @desc    Bir incelemeyi güncelle
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan inceleme bulunamadı`, 404));
    }

    // İncelemenin kullanıcıya ait olup olmadığını kontrol et
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Bu incelemeyi güncelleme yetkiniz yok`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    });
});


// @desc    Bir incelemeyi sil
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan inceleme bulunamadı`, 404));
    }

    // İncelemenin kullanıcıya ait olup olmadığını kontrol et
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Bu incelemeyi silme yetkiniz yok`, 401));
    }

    await review.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

exports.likeReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan inceleme bulunamadı`, 404));
    }

    
    const isLiked = await review.addLike(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            likesCount: review.likesCount,
            isLiked: isLiked
        }
    });
});


// @desc    Bir incelemeye yorum ekle
// @route   POST /api/v1/reviews/:id/comments
// @access  Private
exports.addCommentToReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate('user', 'username avatar'); 

    if (!review) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan inceleme bulunamadı`, 404));
    }

    const { content } = req.body;
    if (!content) {
        return next(new ErrorResponse(`Yorum içeriği boş olamaz`, 400));
    }

    
    const newComment = await review.addComment(req.user.id, content); 

  
    if (review.user._id.toString() !== req.user.id.toString()) {
        const notification = await Notification.create({
            user: review.user._id, 
            sender: req.user.id, 
            type: 'comment_on_review',
            message: `${req.user.username} yorumunuza yanıt verdi: "${content.substring(0, 50)}..."`,
            link: `/movies/${review.movie._id}` 
        });

        // Socket.IO ile bildirim gönder
        const io = req.app.get('socketio');
        io.to(review.user._id.toString()).emit('newNotification', notification);
    }

    res.status(201).json({
        success: true,
        data: newComment
    });
});

// @desc    Bir incelemeyi raporla
// @route   POST /api/v1/reviews/:id/report
// @access  Private
exports.reportReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan inceleme bulunamadı`, 404));
    }

    // Kullanıcının kendi yorumunu raporlamasını engelle
    if (review.user.toString() === req.user.id.toString()) {
        return next(new ErrorResponse('Kendi yorumunuzu raporlayamazsınız', 400));
    }

    // Zaten raporlanmışsa ve moderasyon bekliyorsa tekrar raporlamayı engelle
    if (review.isReported && review.moderationStatus === 'pending') {
        return next(new ErrorResponse('Bu yorum zaten raporlanmış ve moderasyon bekliyor', 400));
    }

    review.isReported = true;
    review.reportCount = (review.reportCount || 0) + 1;
    review.moderationStatus = 'pending'; // Raporlandığında durumu 'pending' yap

    await review.save({ validateBeforeSave: false }); // Sadece bu alanları güncellediğimiz için validasyonu atlayabiliriz

    res.status(200).json({
        success: true,
        message: 'Yorum başarıyla raporlandı ve moderasyon için gönderildi.'
    });
});
