const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Liste bir kullanıcıya ait olmalıdır']
  },
  title: {
    type: String,
    required: [true, 'Liste başlığı gereklidir'],
    trim: true,
    maxlength: [100, 'Liste başlığı en fazla 100 karakter olabilir']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Liste açıklaması en fazla 1000 karakter olabilir']
  },
  movies: [{
    movie: {
      type: mongoose.Schema.ObjectId,
      ref: 'Movie',
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: [1, 'Sıralama 1\'den küçük olamaz']
    },
    notes: {
      type: String,
      maxlength: [500, 'Not en fazla 500 karakter olabilir']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isRanked: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Etiket en fazla 30 karakter olabilir']
  }],
  // İstatistikler
  movieCount: {
    type: Number,
    default: 0,
    min: [0, 'Film sayısı negatif olamaz']
  },
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
ListSchema.index({ user: 1 });
ListSchema.index({ isPublic: 1 });
ListSchema.index({ tags: 1 });
ListSchema.index({ likesCount: -1 });
ListSchema.index({ createdAt: -1 });

// Film ekleme metodu
ListSchema.methods.addMovie = async function(movieId, order, notes = '') {
  const existingMovie = this.movies.find(item => item.movie.toString() === movieId.toString());
  
  if (existingMovie) {
    throw new Error('Bu film zaten listede mevcut');
  }
  
  this.movies.push({
    movie: movieId,
    order: order,
    notes: notes.trim()
  });
  
  this.movieCount = this.movies.length;
  
  // Sıralamalı listeyse, sıralamayı düzenle
  if (this.isRanked) {
    this.movies.sort((a, b) => a.order - b.order);
  }
  
  await this.save();
};

// Film çıkarma metodu
ListSchema.methods.removeMovie = async function(movieId) {
  this.movies = this.movies.filter(item => item.movie.toString() !== movieId.toString());
  
  this.movieCount = this.movies.length;
  
  // Sıralamalı listeyse, sıralamayı yeniden düzenle
  if (this.isRanked) {
    this.movies.forEach((item, index) => {
      item.order = index + 1;
    });
  }
  
  await this.save();
};

// Beğeni ekleme/çıkarma metodu
ListSchema.methods.toggleLike = async function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
    this.likesCount = Math.max(0, this.likesCount - 1);
  } else {
    this.likes.push({ user: userId });
    this.likesCount += 1;
  }
  
  await this.save();
  return !existingLike;
};

module.exports = mongoose.model('List', ListSchema);