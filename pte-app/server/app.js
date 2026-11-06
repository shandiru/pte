import "dotenv/config";
import express from "express";
import cors from "cors";
import Task from "./models/Task.js";
import Mock from "./models/Mock.js";
import { connect } from "./db.js";
import { weeks, START, END } from "./data/roadmap.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api", wrap(async (req, res, next) => { await connect(); next(); }));

app.get("/api/overview", wrap(async (req, res) => {
  const today = isDate(req.query.today) ? req.query.today : START;
  const [days, byCategory, items, notes, mocks] = await Promise.all([
    Task.aggregate([
      { $group: { _id: "$date", total: { $sum: 1 }, done: { $sum: { $cond: ["$done", 1, 0] } }, plannedMin: { $sum: "$plannedMin" }, doneMin: { $sum: { $cond: ["$done", "$actualMin", 0] } } } },
      { $project: { _id: 0, date: "$_id", total: 1, done: 1, plannedMin: 1, doneMin: 1 } },
      { $sort: { date: 1 } },
    ]),
    Task.aggregate([
      { $group: {
        _id: "$category",
        total: { $sum: { $cond: [{ $lt: ["$date", today] }, 1, 0] } },
        done: { $sum: { $cond: [{ $and: [{ $lt: ["$date", today] }, "$done"] }, 1, 0] } },
        minutes: { $sum: { $cond: ["$done", "$actualMin", 0] } },
        ratingSum: { $sum: "$rating" },
        rated: { $sum: { $cond: [{ $gt: ["$rating", 0] }, 1, 0] } },
      } },
      { $project: { _id: 0, category: "$_id", total: 1, done: 1, minutes: 1, ratingSum: 1, rated: 1 } },
    ]),
    Task.aggregate([
      { $match: { done: true, unit: { $ne: "" } } },
      { $group: { _id: "$unit", count: { $sum: "$count" } } },
      { $project: { _id: 0, unit: "$_id", count: 1 } },
    ]),
    Task.find({ note: { $ne: "" } }).sort({ date: -1 }).limit(8).select("date title note").lean(),
    Mock.find().sort({ date: 1 }).lean(),
  ]);
  res.json({ start: START, end: END, weeks, days, byCategory, items, notes, mocks });
}));

app.get("/api/tasks", wrap(async (req, res) => {
  if (!isDate(req.query.date)) return res.status(400).json({ error: "date=YYYY-MM-DD required" });
  res.json(await Task.find({ date: req.query.date }).sort({ order: 1, _id: 1 }));
}));

app.post("/api/tasks", wrap(async (req, res) => {
  const { date, title, plannedMin } = req.body;
  if (!isDate(date) || !title?.trim()) return res.status(400).json({ error: "date and title required" });
  const order = 50 + (await Task.countDocuments({ date }));
  res.status(201).json(await Task.create({ date, title, plannedMin: Number(plannedMin) || 30, category: "other", order, custom: true }));
}));

app.post("/api/tasks/move", wrap(async (req, res) => {
  const { from, to } = req.body;
  if (!isDate(from) || !isDate(to) || from === to) return res.status(400).json({ error: "from and to dates required" });
  const r = await Task.updateMany({ date: from, done: false }, [{ $set: { date: to, movedFrom: from, order: { $add: ["$order", 100] } } }]);
  res.json({ moved: r.modifiedCount });
}));

app.patch("/api/tasks/:id", wrap(async (req, res) => {
  const { done, actualMin, note, count, rating } = req.body;
  const u = {};
  if (typeof done === "boolean") { u.done = done; u.completedAt = done ? new Date() : null; }
  if (actualMin !== undefined) u.actualMin = Math.min(1440, Math.max(0, Number(actualMin) || 0));
  if (count !== undefined) u.count = Math.min(10000, Math.max(0, Number(count) || 0));
  if (rating !== undefined) u.rating = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
  if (note !== undefined) u.note = String(note).slice(0, 2000);
  const t = await Task.findByIdAndUpdate(req.params.id, u, { new: true });
  t ? res.json(t) : res.status(404).json({ error: "Not found" });
}));

app.delete("/api/tasks/:id", wrap(async (req, res) => {
  const t = await Task.findOneAndDelete({ _id: req.params.id, custom: true });
  t ? res.json({ ok: true }) : res.status(400).json({ error: "Only your own tasks can be removed" });
}));

app.post("/api/mocks", wrap(async (req, res) => {
  if (!isDate(req.body.date)) return res.status(400).json({ error: "date required" });
  res.status(201).json(await Mock.create(req.body));
}));
app.delete("/api/mocks/:id", wrap(async (req, res) => { await Mock.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.name === "ValidationError" || err.name === "CastError" ? 400 : 500).json({ error: err.message });
});

export default app;
