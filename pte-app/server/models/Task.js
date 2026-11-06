import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    category: { type: String, default: "other" },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    detail: { type: String, default: "" },
    plannedMin: { type: Number, default: 30 },
    order: { type: Number, default: 0 },
    target: { type: Number, default: 0 },   // e.g. 10
    unit: { type: String, default: "" },    // e.g. "sentences"
    done: { type: Boolean, default: false },
    actualMin: { type: Number, default: 0 },
    count: { type: Number, default: 0 },    // how many items you actually did
    rating: { type: Number, default: 0, min: 0, max: 5 }, // 1 hard .. 5 easy
    note: { type: String, default: "" },
    completedAt: { type: Date, default: null },
    custom: { type: Boolean, default: false },
    movedFrom: { type: String, default: "" },
    seedKey: { type: String, index: { unique: true, sparse: true } },
  },
  { timestamps: true }
);
export default mongoose.models.Task || mongoose.model("Task", schema);
