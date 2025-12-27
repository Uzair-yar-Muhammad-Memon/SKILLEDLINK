const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Trying to connect to local MongoDB...');
    
    // Try local MongoDB as fallback
    try {
      const localConn = await mongoose.connect('mongodb://localhost:27017/skilllink', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ Connected to local MongoDB: ${localConn.connection.host}`);
    } catch (localError) {
      console.error('❌ Local MongoDB also failed:', localError.message);
      console.log('💡 Solutions:');
      console.log('   1. Whitelist your IP in MongoDB Atlas: https://cloud.mongodb.com');
      console.log('   2. Install MongoDB locally: https://www.mongodb.com/try/download/community');
      console.log('⚠️  Server running without database - authentication will not work!');
    }
  }
};

module.exports = connectDB;
