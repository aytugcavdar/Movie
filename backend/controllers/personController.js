
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

  res.status(200).json({
    success: true,
    data: person
  });
});