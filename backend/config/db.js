const { DataAPIClient } = require('@datastax/astra-db-ts');

let dbInstance = null;

const connectDB = () => {
  if (dbInstance) return dbInstance;
  
  if (!process.env.ASTRA_DB_APPLICATION_TOKEN || !process.env.ASTRA_DB_API_ENDPOINT) {
    console.warn("Astra DB credentials are not set in .env variables!");
    return null;
  }

  try {
    const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
    dbInstance = client.db(process.env.ASTRA_DB_API_ENDPOINT);
    console.log("Astra DB client initialized successfully.");
    return dbInstance;
  } catch (error) {
    console.error("Error setting up Astra DB client:", error.message);
    return null;
  }
};

module.exports = connectDB;
