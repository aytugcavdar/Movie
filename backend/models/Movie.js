// models/Movie.js
const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  // TMDB'den gelen veriler
  tmdbId: {
    type: Number,
    required: true,
    
  },
  imdbId: {
    type: String,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Film başlığı gereklidir'],
    trim: true
  },
  originalTitle: {
    type: String,
    trim: true
  },
  overview: {
    type: String,
    maxlength: [2000, 'Özet en fazla 2000 karakter olabilir']
  },
  tagline: {
    type: String,
    maxlength: [500, 'Slogan en fazla 500 karakter olabilir']
  },
  releaseDate: {
    type: Date
  },
  runtime: {
    type: Number, // dakika cinsinden
    min: [1, 'Süre en az 1 dakika olmalıdır']
  },
  // Poster ve backdrop görselleri
  posterPath: {
    type: String
  },
  backdropPath: {
    type: String
  },
  // TMDB'den gelen türler
  genres: [{
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }],
  // Diller
  originalLanguage: {
    type: String,
    maxlength: [5, 'Dil kodu en fazla 5 karakter olabilir']
  },
  spokenLanguages: [{
    iso_639_1: String,
    name: String
  }],
  // Üretim bilgileri
  productionCompanies: [{
    id: Number,
    name: String,
    logoPath: String,
    originCountry: String
  }],
  productionCountries: [{
    iso_3166_1: String,
    name: String
  }],
  budget: {
    type: Number,
    min: [0, 'Bütçe negatif olamaz']
  },
  revenue: {
    type: Number,
    min: [0, 'Hasılat negatif olamaz']
  },
  // TMDB puanı
  voteAverage: {
    type: Number,
    min: [0, 'Puan 0\'dan küçük olamaz'],
    max: [10, 'Puan 10\'dan büyük olamaz']
  },
  voteCount: {
    type: Number,
    min: [0, 'Oy sayısı negatif olamaz']
  },
  popularity: {
    type: Number,
    min: [0, 'Popülerlik negatif olamaz']
  },
  // Durum bilgileri
  status: {
    type: String,
    enum: ['Rumored', 'Planned', 'In Production', 'Post Production', 'Released', 'Canceled'],
    default: 'Released'
  },
  adult: {
    type: Boolean,
    default: false
  },
  // Bizim platformumuzdaki veriler
  isActive: {
    type: Boolean,
    default: true
  },
  // Platform içi istatistikler
  platformStats: {
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Ortalama puan 0\'dan küçük olamaz'],
      max: [5, 'Ortalama puan 5\'ten büyük olamaz']
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'İnceleme sayısı negatif olamaz']
    },
    watchlistCount: {
      type: Number,
      default: 0,
      min: [0, 'İzleme listesi sayısı negatif olamaz']
    },
    watchedCount: {
      type: Number,
      default: 0,
      min: [0, 'İzlendi sayısı negatif olamaz']
    },
    likeCount: {
      type: Number,
      default: 0,
      min: [0, 'Beğeni sayısı negatif olamaz']
    }
  },
  videos: [{
    key: { type: String, unique: true, sparse: true }, // YouTube video ID'si gibi
    site: { type: String, enum: ['YouTube', 'Vimeo'], default: 'YouTube' },
    type: { type: String, enum: ['Trailer', 'Teaser', 'Clip', 'Behind the Scenes', 'Featurette', 'Opening Credits', 'Scene', 'Bloopers'], default: 'Trailer' }
}],
  // TMDB'den son güncelleme tarihi
  lastTmdbUpdate: {
    type: Date,
    default: Date.now
  },
  // Manuel olarak eklenen ekstra bilgiler
  extraInfo: {
    trivia: [String],
    goofs: [String],
    awards: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// İndeksler
MovieSchema.index({ tmdbId: 1 }, { unique: true });
MovieSchema.index({ title: 'text', originalTitle: 'text', overview: 'text' });
MovieSchema.index({ 'genres.name': 1 });
MovieSchema.index({ releaseDate: -1 });
MovieSchema.index({ 'platformStats.averageRating': -1 });
MovieSchema.index({ 'platformStats.reviewCount': -1 });
MovieSchema.index({ createdAt: -1 });

// Virtual alanlar
MovieSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'movie',
  justOne: false
});

MovieSchema.virtual('cast', {
  ref: 'Cast',
  localField: '_id',
  foreignField: 'movie',
  justOne: false
});

MovieSchema.virtual('crew', {
  ref: 'Crew',
  localField: '_id',
  foreignField: 'movie',
  justOne: false
});

// Tam poster URL'i
MovieSchema.virtual('fullPosterUrl').get(function() {
  if (this.posterPath) {
    return `https://image.tmdb.org/t/p/w500${this.posterPath}`;
  }
  return 'https://via.placeholder.com/500x750?text=No+Poster';
});

// Tam backdrop URL'i
MovieSchema.virtual('fullBackdropUrl').get(function() {
  if (this.backdropPath) {
    return `https://image.tmdb.org/t/p/w1280${this.backdropPath}`;
  }
  return 'https://via.placeholder.com/1280x720?text=No+Backdrop';
});

// Film süresi formatı (2h 30m şeklinde)
MovieSchema.virtual('formattedRuntime').get(function() {
  if (!this.runtime) return 'Bilinmiyor';
  
  const hours = Math.floor(this.runtime / 60);
  const minutes = this.runtime % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
});

// Yıl bilgisi
MovieSchema.virtual('year').get(function() {
  if (this.releaseDate) {
    return new Date(this.releaseDate).getFullYear();
  }
  return null;
});

// Tür isimlerini array olarak döndür
MovieSchema.virtual('genreNames').get(function() {
  return this.genres.map(genre => genre.name);
});

// Ortalama puanı güncelleme metodu
MovieSchema.methods.updateAverageRating = async function() {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    {
      $match: { movie: this._id }
    },
    {
      $group: {
        _id: '$movie',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.platformStats.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    this.platformStats.reviewCount = stats[0].reviewCount;
  } else {
    this.platformStats.averageRating = 0;
    this.platformStats.reviewCount = 0;
  }
  
  await this.save();
};

// İzleme listesi sayısını güncelleme
MovieSchema.methods.updateWatchlistCount = async function() {
  const Watchlist = mongoose.model('Watchlist');
  
  const count = await Watchlist.countDocuments({ 
    movies: this._id 
  });
  
  this.platformStats.watchlistCount = count;
  await this.save();
};

module.exports = mongoose.model('Movie', MovieSchema);