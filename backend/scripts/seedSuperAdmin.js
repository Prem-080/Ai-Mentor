// backend/scripts/seedSuperAdmin.js
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const email = "superadmin@example.com";
    const adminExists = await Admin.findOne({ where: { email } });

    if (adminExists) {
      console.log("SuperAdmin already exists.");
    } else {
      await Admin.create({
        name: "Super Admin",
        email: email,
        password: "superpassword123",
        role: "superAdmin",
      });
      console.log("SuperAdmin created successfully!");
    }
    process.exit();
  } catch (error) {
    console.error("Error seeding SuperAdmin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
