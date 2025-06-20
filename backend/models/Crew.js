
const mongoose = require('mongoose');

const CrewSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.ObjectId,
    ref: 'Movie',
    required: true
  },
  person: {
    type: mongoose.Schema.ObjectId,
    ref: 'Person',
    required: true
  },
  job: {
    type: String,
    required: [true, 'İş tanımı gereklidir'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Departman gereklidir'],
    enum: ['Directing', 'Production', 'Writing', 'Camera', 'Art', 'Sound', 'Editing', 'Costume & Make-Up', 'Visual Effects', 'Crew', 'Acting']
  },
  // TMDB crew ID'si
  creditId: {
    type: String
  }
}, {
  timestamps: true
});

// İndeksler
CrewSchema.index({ movie: 1, department: 1 });
CrewSchema.index({ person: 1 });
CrewSchema.index({ movie: 1, person: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Crew', CrewSchema);