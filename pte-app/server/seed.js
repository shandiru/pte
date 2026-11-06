// npm run seed             fills the DB if empty
// npm run seed -- --force  wipes ALL tasks and logs, then regenerates the plan
import "dotenv/config";
import mongoose from "mongoose";
import { seed } from "./db.js";
await mongoose.connect(process.env.MONGODB_URI);
await seed(process.argv.includes("--force"));
await mongoose.disconnect();
