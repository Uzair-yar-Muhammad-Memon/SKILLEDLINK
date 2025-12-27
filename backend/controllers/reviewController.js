const Review = require('../models/Review');
const Notification = require('../models/Notification');

// @desc    Add a review
// @route   POST /reviews/add
exports.addReview = async (req, res) => {
  try {
    const { workerId, rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const review = await Review.create({
      userId: req.user._id,
      workerId,
      rating,
      comment
    });
    
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name')
      .populate('workerId', 'name');
    
    // Create notification for worker
    await Notification.create({
      workerId,
      message: `You received a new ${rating}-star review`,
      type: 'new_review'
    });
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: populatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reviews for a worker
// @route   GET /reviews/worker/:id
exports.getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ workerId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
