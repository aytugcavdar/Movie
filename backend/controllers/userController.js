// backend/controllers/userController.js
const User = require('../models/User');
const Review = require('../models/Review');
const Watchlist = require('../models/Watchlist');
const List = require('../models/List'); // List modelini ekledik
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

  res.status(200).json({
    success: true,
    data: {
      user,
      reviews: reviews || [], 
      watchlists: watchlists || [] 
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
    .limit(10) // Son 10 incelemeyi al
    .lean();

    
    const recentLists = await List.find({
        user: { $in: followingIds },
        isPublic: true
    })
    .populate('user', 'username avatar')
    .sort('-createdAt')
    .limit(10) 
    .lean();

    
    const feedItems = [...recentReviews.map(item => ({ ...item, type: 'review' })),
                       ...recentLists.map(item => ({ ...item, type: 'list' }))]
                       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                       .slice(0, 20); 

    res.status(200).json({
        success: true,
        count: feedItems.length,
        data: feedItems
    });
});