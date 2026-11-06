import mongoose from "mongoose";
const n = { type: Number, min: 10, max: 90 };
const schema = new mongoose.Schema(
  { date: { type: String, required: true }, total: { ...n, required: true }, speaking: n, listening: n, reading: n, writing: n },
  { timestamps: true }
);
export default mongoose.models.Mock || mongoose.model("Mock", schema);
