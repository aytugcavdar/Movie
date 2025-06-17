const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'İzleme listesi bir kullanıcıya ait olmalıdır']
  },
  name: {
    type: String,
    required: [true, 'Liste adı gereklidir'],
    trim: true,
    maxlength: [100, 'Liste adı en fazla 100 karakter olabilir']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Liste açıklaması en fazla 500 karakter olabilir']
  },
  movies: [{
    movie: {
      type: mongoose.Schema.ObjectId,
      ref: 'Movie',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [200, 'Not en fazla 200 karakter olabilir']
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // İstatistikler
  movieCount: {
    type: Number,
    default: 0,
    min: [0, 'Film sayısı negatif olamaz']
  },
  totalRuntime: {
    type: Number,
    default: 0,
    min: [0, 'Toplam süre negatif olamaz']
  },
  followers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  followersCount: {
    type: Number,
    default: 0,
    min: [0, 'Takipçi sayısı negatif olamaz']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// İndeksler
WatchlistSchema.index({ user: 1 });
WatchlistSchema.index({ user: 1, name: 1 }, { unique: true });
WatchlistSchema.index({ isPublic: 1 });
WatchlistSchema.index({ tags: 1 });

// Film ekleme metodu
WatchlistSchema.methods.addMovie = async function(movieId, notes = '') {
  const existingMovie = this.movies.find(item => item.movie.toString() === movieId.toString());
  
  if (existingMovie) {
    throw new Error('Bu film zaten listede mevcut');
  }
  
  this.movies.push({
    movie: movieId,
    notes: notes.trim()
  });
  
  await this.updateStats();
  await this.save();
};

// Film çıkarma metodu
WatchlistSchema.methods.removeMovie = async function(movieId) {
  this.movies = this.movies.filter(item => item.movie.toString() !== movieId.toString());
  
  await this.updateStats();
  await this.save();
};

// İstatistikleri güncelleme
WatchlistSchema.methods.updateStats = async function() {
  this.movieCount = this.movies.length;
  
  // Toplam süreyi hesapla
  if (this.movies.length > 0) {
    const Movie = mongoose.model('Movie');
    const movieIds = this.movies.map(item => item.movie);
    const movies = await Movie.find({ _id: { $in: movieIds } }, 'runtime');

    this.totalRuntime = movies.reduce((acc, movie) => acc + movie.runtime, 0);
  }
};

module.exports = mongoose.model('Watchlist', WatchlistSchema);