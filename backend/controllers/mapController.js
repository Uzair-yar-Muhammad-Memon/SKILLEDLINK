const Worker = require('../models/Worker');

// @desc    Get worker locations for map
// @route   GET /map/worker-locations
exports.getWorkerLocations = async (req, res) => {
  try {
    const { city, skillCategory } = req.query;
    
    const filter = { availabilityStatus: 'available' };
    if (city) filter.city = city;
    if (skillCategory) filter.skillCategory = skillCategory;
    
    const workers = await Worker.find(filter)
      .populate('skillCategory', 'name')
      .select('name skillCategory city location ratingAverage reviewsCount phone');
    
    const locations = workers.map(worker => ({
      id: worker._id,
      name: worker.name,
      category: worker.skillCategory.name,
      city: worker.city,
      latitude: worker.location.latitude,
      longitude: worker.location.longitude,
      rating: worker.ratingAverage,
      reviewsCount: worker.reviewsCount,
      phone: worker.phone
    }));
    
    res.status(200).json({
      success: true,
      message: 'Worker locations retrieved successfully',
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
