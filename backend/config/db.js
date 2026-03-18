import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  }
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to Neon PostgreSQL using Sequelize");
  } catch (error) {
    console.error("❌ Unable to connect:", error);
  }
}

export { sequelize, connectDB };
export default connectDB;
