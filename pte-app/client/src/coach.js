import { addDays } from "./dates.js";

const sum = (a) => a.reduce((s, x) => s + x, 0);
const avg = (a) => (a.length ? sum(a) / a.length : 0);

// 60% tasks completed + 40% planned time studied
export const dayScore = (d) =>
  d && d.total ? Math.round(100 * (0.6 * (d.done / d.total) + 0.4 * Math.min(1, d.plannedMin ? d.doneMin / d.plannedMin : 0))) : 0;

export const LABEL = { grammar: "Grammar", listening: "Listening", vocabulary: "Vocabulary", speaking: "Speaking", writing: "Writing", reading: "Reading", revision: "Revision", mock: "Mock tests", pte: "PTE intro", other: "Your own tasks" };
const h = (m) => (m / 60).toFixed(1);

export function coach(ov, today) {
  const past = ov.days.filter((d) => d.date < today);
  if (!past.length) return { started: false };

  const planned = sum(past.map((d) => d.plannedMin));
  const done = sum(past.map((d) => d.doneMin));
  const pace = planned ? done / planned : 0;
  const score = Math.round(avg(past.map(dayScore)));
  const status = pace >= 0.9 ? "On track" : pace >= 0.7 ? "Slightly behind" : "Behind";
  const last7 = past.slice(-7), prev7 = past.slice(-14, -7);
  const s7 = Math.round(avg(last7.map(dayScore)));
  const sPrev = prev7.length ? Math.round(avg(prev7.map(dayScore))) : null;

  const map = Object.fromEntries(ov.days.map((d) => [d.date, d]));
  let streak = 0, k = today;
  if (!(map[k]?.doneMin >= 60)) k = addDays(k, -1);
  while (map[k]?.doneMin >= 60) { streak++; k = addDays(k, -1); }
  const active14 = past.slice(-14).filter((d) => d.doneMin >= 60).length;
  const n14 = Math.min(14, past.length);

  const skills = ov.byCategory
    .filter((c) => c.category !== "other")
    .map((c) => ({ ...c, completion: c.total ? c.done / c.total : null, avgRating: c.rated ? c.ratingSum / c.rated : null }));

  const advice = [];
  const behind = planned - done;
  if (behind > 60) {
    const days = Math.ceil(behind / 45);
    advice.push({ title: `You are ${h(behind)} hours behind the plan.`, text: `You studied ${h(done)} of ${h(planned)} planned hours (${Math.round(pace * 100)}%). Adding 45 minutes a day clears it in about ${days} days. Use "Move unfinished to today" on a missed day only for tasks that matter.` });
  } else {
    advice.push({ title: "You are on pace.", text: `You studied ${h(done)} of ${h(planned)} planned hours (${Math.round(pace * 100)}%). Keep the same routine.` });
  }
  advice.push({ title: `${active14} of the last ${n14} days had 1 hour or more.`, text: active14 >= n14 - 1 ? "Your consistency is strong." : "Consistency matters more than long days. Aim for every day, even 2 hours on a bad day." });
  if (sPrev !== null) advice.push({ title: `Last 7 days: ${s7}. Before that: ${sPrev}.`, text: s7 > sPrev + 3 ? "You are improving." : s7 < sPrev - 3 ? "Your score is dropping. Look at what changed this week." : "Your level is steady." });

  const byDone = skills.filter((s) => s.total >= 3 && s.completion !== null).sort((a, b) => a.completion - b.completion)[0];
  if (byDone && byDone.completion < 0.8) advice.push({ title: `${LABEL[byDone.category] || byDone.category} is skipped the most.`, text: `You finished ${byDone.done} of ${byDone.total} tasks. Do it first in the day, before the tasks you like.` });
  const byRate = skills.filter((s) => s.rated >= 3).sort((a, b) => a.avgRating - b.avgRating)[0];
  if (byRate && byRate.avgRating < 3.5) advice.push({ title: `${LABEL[byRate.category] || byRate.category} feels hardest (${byRate.avgRating.toFixed(1)} out of 5).`, text: "Add 15 minutes there each day and repeat the items you got wrong." });

  const mocks = ov.mocks || [];
  const latest = mocks[mocks.length - 1];
  if (latest) {
    const g = 70 - latest.total;
    let t = g <= 0 ? "You are at the target. Keep the routine." : latest.total >= 65 ? "Book the March exam if the next mock stays at 65 or more." : `${g} points to reach 70.`;
    if (mocks.length >= 3 && mocks[2].total < 50) t += " Mock #3 was below 50, so the plan says move the exam to April.";
    if (mocks.length >= 2) { const d = latest.total - mocks[mocks.length - 2].total; t += d > 0 ? ` Up ${d} from the last mock.` : d < 0 ? ` Down ${-d} from the last mock.` : " Same as the last mock."; }
    advice.push({ title: `Latest mock: ${latest.total}.`, text: t });
  }

  return { started: true, score, status, pace, s7, sPrev, streak, planned, done, skills, advice };
}
