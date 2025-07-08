// backend/controllers/userController.js
const User = require('../models/User');
const Review = require('../models/Review');
const Watchlist = require('../models/Watchlist');
const List = require('../models/List'); // List modelini ekledik
const Movie = require('../models/Movie'); // Movie modelini ekledik
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

// @desc    Bir kullanıcının herkese açık profilini getir
// @route   GET /api/v1/users/:username
// @access  Public
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });

  if (!user) {
    return next(new ErrorResponse(`Kullanıcı bulunamadı: ${req.params.username}`, 404));
  }

  const reviews = await Review.find({ user: user._id, isPublished: true, moderationStatus: 'approved' })
    .populate('movie', 'title posterPath releaseDate') 
    .sort({ createdAt: -1 })
    .limit(10)
    .lean(); 

  const watchlists = await Watchlist.find({ user: user._id, isPublic: true })
    .populate({
        path: 'movies.movie',
        select: 'title posterPath'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean(); // .lean() kullanıyoruz

  // YENİ EKLENDİ: Kullanıcının izlediği filmleri çek
  const watchedMovies = await User.findById(user._id)
    .select('watchedMovies')
    .populate({
        path: 'watchedMovies.movie',
        select: 'title posterPath releaseDate runtime voteAverage'
    })
    .lean();

  res.status(200).json({
    success: true,
    data: {
      user,
      reviews: reviews || [], 
      watchlists: watchlists || [],
      watchedMovies: watchedMovies ? watchedMovies.watchedMovies : [] // İzlenen filmleri ekledik
    }
  });
});

// @desc    Bir kullanıcıyı takip et/takipten çık
// @route   PUT /api/v1/users/:id/follow
// @access  Private
exports.followUser = asyncHandler(async (req, res, next) => {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
        return next(new ErrorResponse('Kullanıcı bulunamadı', 404));
    }

    if (userToFollow.id.toString() === currentUser.id.toString()) {
        return next(new ErrorResponse('Kendinizi takip edemezsiniz', 400));
    }

    const isFollowing = currentUser.following.some(id => id.toString() === userToFollow.id.toString());

    if (isFollowing) {
       
        currentUser.following.pull(userToFollow.id);
        userToFollow.followers.pull(currentUser.id);

    } else {
       
        currentUser.following.push(userToFollow.id);
        userToFollow.followers.push(currentUser.id);
        
        const notification = await Notification.create({
            user: userToFollow._id,
            sender: currentUser._id,
            type: 'new_follower',
            message: `${currentUser.username} sizi takip etmeye başladı.`,
            link: `/users/${currentUser.username}`

        });
        console.log('Bildirim gönderiliyor:', notification)
        const io = req.app.get('socketio');
        io.to(userToFollow._id.toString()).emit('newNotification', notification); 
    }
    
    currentUser.followingCount = currentUser.following.length;
    userToFollow.followersCount = userToFollow.followers.length;


    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ 
        success: true, 
        data: { 
            isFollowing: !isFollowing,
            followersCount: userToFollow.followersCount
        }, 
        message: isFollowing ? 'Takipten çıkıldı.' : 'Takip edildi.'
    });
});

// @desc    Takip edilen kullanıcıların son aktivitelerini getir
// @route   GET /api/v1/users/feed
// @access  Private
exports.getFollowingFeed = asyncHandler(async (req, res, next) => {
    const currentUser = await User.findById(req.user.id).select('following');

    if (!currentUser) {
        return next(new ErrorResponse('Kullanıcı bulunamadı', 404));
    }

    const followingIds = currentUser.following;

    // Takip edilen kullanıcıların son incelemelerini çek
    const recentReviews = await Review.find({
        user: { $in: followingIds },
        isPublished: true,
        moderationStatus: 'approved'
    })
    .populate('user', 'username avatar')
    .populate('movie', 'title posterPath releaseDate')
    .sort('-createdAt')
    .limit(10)
    .lean();

    
    const recentLists = await List.find({
        user: { $in: followingIds },
        isPublic: true
    })
    .populate('user', 'username avatar')
    .sort('-createdAt')
    .limit(10) 
    .lean();

    // YENİ EKLENDİ: Takip edilen kullanıcıların izlediği filmleri çek
    const recentWatchedMovies = await User.find({ _id: { $in: followingIds } })
        .select('username avatar watchedMovies')
        .populate({
            path: 'watchedMovies.movie',
            select: 'title posterPath releaseDate'
        })
        .lean()
        .then(users => {
            let allWatched = [];
            // `users` array'i her zaman dolu olmasa da, boş bir array üzerinde forEach yapmak sorun çıkarmaz.
            // Ancak `user.watchedMovies` undefined olabilir, bu yüzden kontrol ekliyoruz.
            users.forEach(user => {
                // `watchedMovies` alanının tanımlı ve bir dizi olup olmadığını kontrol edin
                if (user.watchedMovies && Array.isArray(user.watchedMovies)) {
                    user.watchedMovies.forEach(watchedItem => {
                        if (watchedItem.movie) { // Movie bilgisi varsa ekle
                            allWatched.push({
                                _id: watchedItem._id, // İzlenen öğenin kendi ID'si
                                type: 'watched',
                                user: { _id: user._id, username: user.username, avatar: user.avatar },
                                movie: watchedItem.movie,
                                watchedAt: watchedItem.watchedAt,
                                rating: watchedItem.rating // Eğer puan varsa
                            });
                        }
                    });
                }
            });
            // Tarihe göre sırala ve en yenileri al
            return allWatched.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)).slice(0, 10);
        });

    
    const feedItems = [
        ...recentReviews.map(item => ({ ...item, type: 'review' })),
        ...recentLists.map(item => ({ ...item, type: 'list' })),
        ...recentWatchedMovies.map(item => ({ ...item, type: 'watched' })) 
    ]
    .sort((a, b) => {
        
        const dateA = a.createdAt || a.watchedAt;
        const dateB = b.createdAt || b.watchedAt;
        return new Date(dateB) - new Date(dateA);
    })
    .slice(0, 20); 

    res.status(200).json({
        success: true,
        count: feedItems.length,
        data: feedItems
    });
});

// @desc    Bir filmi izlendi olarak işaretle/işaretini kaldır
// @route   PUT /api/v1/users/watched/:movieId
// @access  Private
exports.markMovieAsWatched = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const movieId = req.params.movieId;
    const { rating } = req.body; 

    const user = await User.findById(userId);
    const movie = await Movie.findById(movieId);

    if (!user || !movie) {
        return next(new ErrorResponse('Kullanıcı veya film bulunamadı', 404));
    }

    const isWatched = user.watchedMovies.some(
        (item) => item.movie.toString() === movieId
    );

    let message;
    if (isWatched) {
        
        user.watchedMovies = user.watchedMovies.filter(
            (item) => item.movie.toString() !== movieId
        );
        message = 'Film izlenenler listesinden çıkarıldı.';
        
        await movie.toggleWatched(false);
    } else {
        
        user.watchedMovies.push({ movie: movieId, watchedAt: new Date(), rating: rating || null });
        message = 'Film izlenenler listesine eklendi.';
        
        await movie.toggleWatched(true);
    }

    await user.save({ validateBeforeSave: false }); 

    res.status(200).json({
        success: true,
        data: {
            isWatched: !isWatched,
            watchedMoviesCount: user.watchedMovies.length,
            movieWatchedCount: movie.platformStats.watchedCount 
        },
        message,
    });
});
