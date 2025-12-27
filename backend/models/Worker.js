const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  skillCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Skill category is required']
  },
  // Multiple skills with experience
  skills: [{
    skillName: {
      type: String,
      required: true,
      trim: true
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0
    },
    description: {
      type: String,
      maxlength: 300
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  city: {
    type: String,
    required: [true, 'City is required']
  },
  ratingAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    maxlength: 500
  },
  profileImage: {
    type: String,
    default: 'default-profile.png'
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  location: {
    latitude: {
      type: Number,
      default: 0
    },
    longitude: {
      type: Number,
      default: 0
    }
  },
  services: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    skill: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    budgetMin: {
      type: Number,
      default: 0
    },
    budgetMax: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
workerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
workerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Worker', workerSchema);
