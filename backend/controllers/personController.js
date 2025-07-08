
const Person = require('../models/Person');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Tek bir kişiyi ve filmografisini getir
// @route   GET /api/v1/persons/:id
// @access  Public
exports.getPerson = asyncHandler(async (req, res, next) => {
  const person = await Person.findById(req.params.id)
    .populate({
      path: 'filmography', 
      populate: {
        path: 'movie',
        select: 'title fullPosterUrl releaseDate voteAverage'
      }
    });

  if (!person) {
    return next(
      new ErrorResponse(`ID'si ${req.params.id} olan kişi bulunamadı`, 404)
    );
  }


  const filmographyByDepartment = {};
  
  const castAndCrew = await Promise.all([
      Cast.find({ person: person._id }).populate('movie', 'title fullPosterUrl releaseDate voteAverage'),
      Crew.find({ person: person._id }).populate('movie', 'title fullPosterUrl releaseDate voteAverage')
  ]);
  
  const allCredits = [...castAndCrew[0], ...castAndCrew[1]];

  allCredits.forEach(credit => {
      const department = credit.department || 'Acting'; 
      if (!filmographyByDepartment[department]) {
          filmographyByDepartment[department] = [];
      }
      filmographyByDepartment[department].push(credit);
  });


  res.status(200).json({
    success: true,
    data: {
        ...person.toObject(),
        filmographyByDepartment
    }
  });
});