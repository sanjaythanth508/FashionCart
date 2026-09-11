const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fashioncart';
  
  try {
    console.log(`[Database] Connecting to MongoDB... (Target: ${mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas Cloud' : 'Local MongoDB'})`);
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000, // Timeout after 8 seconds instead of hanging
    });

    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[Database Warning] Primary MongoDB connection failed: ${err.message}`);
    
    // If Atlas connection fails (e.g. invalid credentials or network restriction), attempt local fallback
    if (mongoURI.includes('mongodb+srv')) {
      console.log('[Database] Attempting fallback to local MongoDB instance...');
      try {
        const localConn = await mongoose.connect('mongodb://localhost:27017/fashioncart', {
          serverSelectionTimeoutMS: 4000
        });
        console.log(`[Database] Connected to Local Fallback MongoDB: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.warn('[Database] Local fallback unavailable. The application will continue in resilient offline mode.');
      }
    } else {
      console.warn('[Database] Running in resilient offline mode. Ensure MongoDB or MongoDB Atlas is running.');
    }
  }
};

module.exports = connectDB;
