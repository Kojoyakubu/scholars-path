// server/config/db.js
const mongoose = require('mongoose');
const colors = require('colors');

/**
 * Establishes a connection to the MongoDB database using the URI from environment variables.
 * The application will exit with an error code if the connection fails.
 */
const connectDB = async () => {
  // Use a try...catch block to handle any potential connection errors.
  try {
    // Connect to the database.
    // The `autoIndex` option is a performance optimization:
    // - In development (`NODE_ENV` is not 'production'), it's enabled for convenience.
    // - In production, it's disabled to prevent potential performance hits from automatic index creation.
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`.red.bold);

    // Exit the entire process with a "failure" code (1).
    // This is crucial because the application is non-functional without a database.
    process.exit(1);
  }
};

module.exports = connectDB;