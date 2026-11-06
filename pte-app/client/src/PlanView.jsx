import { fmt, hrs, addDays } from "./dates.js";
import { dayScore } from "./coach.js";

export default function PlanView({ ov, dayMap, today, onOpen }) {
  let lastPhase = "";
  return (
    <section>
      {ov.weeks.map((w) => {
        const head = w.phase !== lastPhase; lastPhase = w.phase;
        return (
          <div key={w.n}>
            {head && <h2 className="phase">{w.phase}</h2>}
            <div className="wk">
              <div className="wkhead">
                <b>Week {w.n}</b>
                <span>{fmt(w.start, { day: "numeric", month: "short" })} to {fmt(w.end, { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <p className="wkfocus">{w.focus}</p>
              <ul className="days">
                {Array.from({ length: 7 }, (_, i) => {
                  const k = addDays(w.start, i), s = dayMap[k] || { total: 0, done: 0, doneMin: 0, plannedMin: 0 };
                  const all = s.total > 0 && s.done === s.total;
                  const status = all ? "Complete" : k === today ? "Today" : k > today ? "Upcoming" : s.done > 0 ? "Partly done" : "Missed";
                  return (
                    <li key={k}>
                      <button onClick={() => onOpen(k)} className={k === today ? "today" : ""}>
                        <span className="dt">{fmt(k, { weekday: "short", day: "numeric", month: "short" })}</span>
                        <span className="cnt">{s.done}/{s.total} tasks, {hrs(s.doneMin)} h</span>
                        <span className="hr">{k < today ? `Score ${dayScore(s)}` : ""}</span>
                        <span className={`st ${status.replace(" ", "").toLowerCase()}`}>{status}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </section>
  );
}
