import mongoose from "mongoose";
import Task from "./models/Task.js";
import { buildTasks } from "./data/roadmap.js";

const isDup = (e) => e?.code === 11000 || (e?.writeErrors?.length && e.writeErrors.every((w) => (w.code ?? w.err?.code) === 11000));

export async function seed(force = false) {
  if (force) await Task.deleteMany({});
  await Task.init();
  // Tasks from the first version (no seedKey) are replaced, but only if you logged nothing on them
  const old = { custom: false, seedKey: { $exists: false } };
  if (await Task.countDocuments(old)) {
    const touched = await Task.countDocuments({ ...old, $or: [{ done: true }, { note: { $ne: "" } }] });
    if (!touched) await Task.deleteMany(old);
  }
  if ((await Task.countDocuments({ custom: false })) === 0) {
    try {
      await Task.insertMany(buildTasks(), { ordered: false });
      console.log("Seeded the plan");
    } catch (e) { if (!isDup(e)) throw e; } // two cold starts at once: the unique key stops duplicates
  }
}

const cache = globalThis._mongo || (globalThis._mongo = { promise: null });
export function connect() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set. Add it to the .env file (or Vercel environment variables).");
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .then(() => seed())
      .catch((e) => { cache.promise = null; throw e; });
  }
  return cache.promise;
}
