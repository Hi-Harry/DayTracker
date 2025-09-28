import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

let pool: mysql.Pool;

export async function connectToDatabase() {
  if (pool) {
    return pool;
  }

  const config = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "daystatus",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  try {
    pool = mysql.createPool(config);
    return pool;
  } catch (error) {
    throw error;
  }
}

export async function getDatabase() {
  return await connectToDatabase();
}

export default { connectToDatabase, getDatabase };
