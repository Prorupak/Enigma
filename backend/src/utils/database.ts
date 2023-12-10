import mongoose from "mongoose";
import { logger } from "../utils/logger";

/**
 * Helper function to initialize the MongoDB connection.
 *
 * @param {Object} options - The options for database initialization.
 * @param {string} options.mongoURL - The MongoDB connection URL.
 * @returns {Promise<mongoose.Connection>} A promise that resolves to the Mongoose connection.
 */
const initDatabaseHelper = async ({ mongoURL }) => {
  try {
     mongoose.set("strictQuery", false)
    await mongoose.connect(mongoURL);

    // Allow empty strings to pass the required validator
    mongoose.Schema.Types.String.checkRequired(v => typeof v === "string");

    logger.info("Database connection established");
  } catch (err) {
    logger.error(err, "Unable to establish database connection");
  }

  return mongoose.connection;
};

/**
 * Helper function to close the MongoDB connection.
 *
 * @returns {Promise<string>} A promise that resolves to a message indicating the status of the database closure.
 */
const closeDatabaseHelper = async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    return "Database connection closed";
  } else {
    return "Database connection already closed";
  }
};

/**
 * DatabaseService class provides methods to initialize and close the MongoDB connection.
 */
class DatabaseService {
  /**
   * Initializes the MongoDB connection.
   *
   * @param {string} MONGO_URL - The MongoDB connection URL.
   * @returns {Promise<mongoose.Connection>} A promise that resolves to the Mongoose connection.
   */
  static async initDatabase(MONGO_URL: string) {
    return await initDatabaseHelper({
      mongoURL: MONGO_URL,
    });
  }

  /**
   * Closes the MongoDB connection.
   *
   * @returns {Promise<string>} A promise that resolves to a message indicating the status of the database closure.
   */
  static async closeDatabase() {
    return await closeDatabaseHelper();
  }
}

export default DatabaseService;
