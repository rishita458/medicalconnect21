const mongoose = require('mongoose');

async function connectDB() {
  // Prefer environment variable, but fall back to IPv4 loopback to avoid ::1/IPv6 ECONNREFUSED issues
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medconnect';
  try {
    await mongoose.connect(uri, {
      dbName: 'medconnect',
      // Force IPv4 (family: 4) to avoid attempts to connect to ::1 on systems where MongoDB isn't listening on IPv6.
      family: 4,
      // Fail fast if server is unreachable
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB connected to ${uri}`);
  } catch (err) {
    console.error(`Failed to connect to MongoDB at ${uri}`, err);
    // Re-throw so caller (server startup) can handle exit if desired
    throw err;
  }
}

module.exports = connectDB;
