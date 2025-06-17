// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'İnceleme bir kullanıcıya ait olmalıdır']
  },
  movie: {
    type: mongoose.Schema.ObjectId,
    ref: 'Movie',
    required: [true, 'İnceleme bir filme ait olmalıdır']
  },
  rating: {
    type: Number,
    required: [true, 'Puan gereklidir'],
    min: [0.5, 'Puan en az 0.5 olmalıdır'],
    max: [5, 'Puan en fazla 5 olabilir'],
    validate: {
      validator: function(v) {
        
        return (v * 2) % 1 === 0;
      },
      message: 'Puan 0.5\'in katları şeklinde olmalıdır'
    }
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'İnceleme başlığı en fazla 100 karakter olabilir']
  },
  content: {
    type: String,
    required: [true, 'İnceleme içeriği gereklidir'],
    trim: true,
    minlength: [10, 'İnceleme en az 10 karakter olmalıdır'],
    maxlength: [2000, 'İnceleme en fazla 2000 karakter olabilir']
  },
  // Spoiler uyarısı
  containsSpoilers: {
    type: Boolean,
    default: false
  },
  // İnceleme durumu
  isPublished: {
    type: Boolean,
    default: true
  },
  // Beğeni sistemi
  likes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likesCount: {
    type: Number,
    default: 0,
    min: [0, 'Beğeni sayısı negatif olamaz']
  },
  // Yorumlar
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Yorum en fazla 500 karakter olabilir']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  commentsCount: {
    type: Number,
    default: 0,
    min: [0, 'Yorum sayısı negatif olamaz']
  },
  // İnceleme türü (Letterboxd benzeri)
  watchedDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v <= new Date();
      },
      message: 'İzleme tarihi gelecek bir tarih olamaz'
    }
  },
  // Yeniden izleme
  isRewatch: {
    type: Boolean,
    default: false
  },
  rewatchCount: {
    type: Number,
    default: 0,
    min: [0, 'Yeniden izleme sayısı negatif olamaz']
  },
  // İnceleme etiketleri
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Etiket en fazla 30 karakter olabilir']
  }],
  // Moderasyon
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0,
    min: [0, 'Şikayet sayısı negatif olamaz']
  },
  moderationStatus: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  },
  // İstatistikler
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'Görüntülenme sayısı negatif olamaz']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// İndeksler
ReviewSchema.index({ user: 1, movie: 1 }, { unique: true }); // Bir kullanıcı bir film için sadece bir inceleme yazabilir
ReviewSchema.index({ movie: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ likesCount: -1 });
ReviewSchema.index({ isPublished: 1, moderationStatus: 1 });
ReviewSchema.index({ tags: 1 });

// Virtual alanlar
ReviewSchema.virtual('isLiked').get(function() {
  // Bu virtual alan frontend'de kullanıcının bu incelemeyi beğenip beğenmediğini kontrol etmek için kullanılacak
  // Populate edilmiş kullanıcı bilgisi gerekli
  return false; // Bu değer controller'da dinamik olarak set edilecek
});

// İnceleme özetini döndür (ilk 150 karakter)
ReviewSchema.virtual('excerpt').get(function() {
  if (this.content.length <= 150) {
    return this.content;
  }
  return this.content.substring(0, 150) + '...';
});

// Puan yıldız formatında
ReviewSchema.virtual('starRating').get(function() {
  const fullStars = Math.floor(this.rating);
  const hasHalfStar = this.rating % 1 !== 0;
  
  return {
    full: fullStars,
    half: hasHalfStar ? 1 : 0,
    empty: 5 - fullStars - (hasHalfStar ? 1 : 0)
  };
});

// Beğeni ekleme metodu
ReviewSchema.methods.addLike = async function(userId) {
  // Zaten beğenmişse çıkar
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
    this.likesCount = Math.max(0, this.likesCount - 1);
  } else {
    this.likes.push({ user: userId });
    this.likesCount += 1;
  }
  
  await this.save();
  return !existingLike; // Beğeni eklendiyse true, kaldırıldıysa false döndür
};

// Yorum ekleme metodu
ReviewSchema.methods.addComment = async function(userId, content) {
  this.comments.push({
    user: userId,
    content: content.trim()
  });
  this.commentsCount += 1;
  
  await this.save();
  
  // Son eklenen yorumu döndür
  return this.comments[this.comments.length - 1];
};

// Yorum silme metodu
ReviewSchema.methods.removeComment = async function(commentId, userId) {
  const comment = this.comments.id(commentId);
  
  if (!comment) {
    throw new Error('Yorum bulunamadı');
  }
  
  if (comment.user.toString() !== userId.toString()) {
    throw new Error('Bu yorumu silme yetkiniz yok');
  }
  
  comment.remove();
  this.commentsCount = Math.max(0, this.commentsCount - 1);
  
  await this.save();
};

// İnceleme güncellendikten sonra film istatistiklerini güncelle
ReviewSchema.post('save', async function() {
  await this.constructor.updateMovieStats(this.movie);
});

// İnceleme silindikten sonra film istatistiklerini güncelle
ReviewSchema.post('remove', async function() {
  await this.constructor.updateMovieStats(this.movie);
});

// Statik metod: Film istatistiklerini güncelle
ReviewSchema.statics.updateMovieStats = async function(movieId) {
  const stats = await this.aggregate([
    {
      $match: { 
        movie: movieId,
        isPublished: true,
        moderationStatus: 'approved'
      }
    },
    {
      $group: {
        _id: '$movie',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  
  const Movie = mongoose.model('Movie');
  
  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      'platformStats.averageRating': Math.round(stats[0].averageRating * 10) / 10,
      'platformStats.reviewCount': stats[0].reviewCount
    });
  } else {
    await Movie.findByIdAndUpdate(movieId, {
      'platformStats.averageRating': 0,
      'platformStats.reviewCount': 0
    });
  }
};

// Kullanıcının inceleme istatistikleri için statik metod
ReviewSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: { 
        user: mongoose.Types.ObjectId(userId),
        isPublished: true,
        moderationStatus: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        totalLikes: { $sum: '$likesCount' },
        totalComments: { $sum: '$commentsCount' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalReviews: 0,
    averageRating: 0,
    totalLikes: 0,
    totalComments: 0
  };
};

module.exports = mongoose.model('Review', ReviewSchema);