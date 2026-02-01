import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: String,
  category: String,
  level: String,

  // REQUIRED BY FRONTEND (DO NOT REMOVE)
  lessons: String,
  price: Number,

  students: String,
  rating: Number,
  image: String,
  categoryColor: String,
});

export default mongoose.model("Course", CourseSchema);
