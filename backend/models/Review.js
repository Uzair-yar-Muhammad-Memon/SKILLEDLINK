const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Update worker rating after saving review
reviewSchema.post('save', async function() {
  const Worker = mongoose.model('Worker');
  const reviews = await mongoose.model('Review').find({ workerId: this.workerId });
  
  const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  await Worker.findByIdAndUpdate(this.workerId, {
    ratingAverage: avgRating.toFixed(1),
    reviewsCount: reviews.length
  });
});

module.exports = mongoose.model('Review', reviewSchema);
