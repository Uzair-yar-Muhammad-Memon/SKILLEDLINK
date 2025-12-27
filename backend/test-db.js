const mongoose = require('mongoose');
const User = require('./models/User');
const Worker = require('./models/Worker');
const ServiceRequest = require('./models/ServiceRequest');

mongoose.connect('mongodb://localhost:27017/skilllink')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const userCount = await User.countDocuments();
    const workerCount = await Worker.countDocuments();
    const requestCount = await ServiceRequest.countDocuments();
    
    console.log(`\n📊 Database Status:`);
    console.log(`  Users: ${userCount}`);
    console.log(`  Workers: ${workerCount}`);
    console.log(`  Requests: ${requestCount}`);
    
    if (requestCount > 0) {
      console.log(`\n📋 Request Statuses:`);
      const requests = await ServiceRequest.find().select('status title');
      requests.forEach(r => {
        console.log(`  - ${r.title}: ${r.status}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
