const Notification = require('../models/Notification');

// @desc    Get notifications for user
// @route   GET /notifications
exports.getNotifications = async (req, res) => {
  try {
    let filter = {};
    
    if (req.user) {
      filter.userId = req.user._id;
    } else if (req.worker) {
      filter.workerId = req.worker._id;
    }
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
