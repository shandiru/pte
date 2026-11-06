# PTE 70+ Tracker (MERN, one project, no login)

MongoDB + Express + React + Node. Open the link and use it. No login.

- Every date from 9 Nov 2026 to 18 Apr 2027 has its own task list (775 tasks).
- Tick a task, or press Log to save minutes, items done, a 1 to 5 rating and a note. Everything is saved in MongoDB.
- Report tab = your performance: score out of 100, on track or behind, hours behind plan, weakest skill, mock trend.

## 1. Free database (5 minutes)
1. Create a free cluster at https://www.mongodb.com/atlas
2. Database Access: add a user and password.
3. Network Access: Add IP address, 0.0.0.0/0 (needed for Vercel).
4. Connect, Drivers, copy the connection string. Put `/pte-tracker` before the `?`.

## 2. Run on your computer
```
npm run setup
cp .env.example .env      # open .env and paste your MONGODB_URI
npm run dev
```
Open http://localhost:5173. The plan is created automatically on first start.

## 3. Put it online (Vercel, one project)
1. Push this folder to GitHub.
2. Vercel: Add New Project, pick the repo. Leave Root Directory as the repo root.
3. Open **Settings → Environment Variables** and add `MONGODB_URI` with the full MongoDB connection string. Select Production (and Preview too if you will use preview deployments).
4. Deploy. Open the link.

The local `.env` file is intentionally excluded from Git so the database password is not published in the repository. Vercel does not read that local file when building from Git; add the value once in the Vercel project settings instead. The API reads it on the server, so do not name it `VITE_MONGODB_URI` or put it in `client/`.

Settings are already in `vercel.json`. Test the API at `https://YOUR-APP.vercel.app/api/health`.

## Change things
- Plan and daily tasks: `server/data/roadmap.js` (START date must be a Monday).
- After editing the plan: `npm run seed -- --force` (this wipes all tasks and your logs).
- Score: 60% tasks completed + 40% planned time studied, per day, averaged over all past days.
