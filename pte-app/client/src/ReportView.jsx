import { addDays, fmt, hrs, short } from "./dates.js";
import { LABEL } from "./coach.js";

const TARGET = 300;

export default function ReportView({ ov, c, dayMap, today, onOpen }) {
  const days = ov.days;
  const totalMin = days.reduce((s, d) => s + d.doneMin, 0);
  const tasksDone = days.reduce((s, d) => s + d.done, 0);
  const tasksAll = days.reduce((s, d) => s + d.total, 0);
  const past = days.filter((d) => d.date <= today);
  const complete = past.filter((d) => d.total > 0 && d.done === d.total).length;
  const missed = days.filter((d) => d.date < today && d.done < d.total).reverse();

  const last = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13)).filter((k) => dayMap[k]);
  const max = Math.max(TARGET, ...last.map((k) => dayMap[k].doneMin));
  const hasLast = last.some((k) => dayMap[k].doneMin > 0);

  return (
    <section>
      {!c.started ? (
        <div className="empty">Your performance report starts after your first full day. Open the Day tab on {short(ov.start)} and complete your tasks.</div>
      ) : (
        <>
          <div className="coach">
            <div className="score"><b>{c.score}</b><span>out of 100</span></div>
            <div>
              <h2>{c.status}</h2>
              <p className="muted">Score = 60% tasks completed + 40% planned time studied, averaged over every past day. A skipped day counts as 0.</p>
            </div>
          </div>
          <ul className="advice">
            {c.advice.map((a, i) => <li key={i}><b>{a.title}</b> {a.text}</li>)}
          </ul>
        </>
      )}

      <div className="facts">
        <Fact v={hrs(totalMin)} l="hours logged" />
        <Fact v={`${tasksDone}/${tasksAll}`} l="tasks done" />
        <Fact v={complete} l="days fully done" />
        <Fact v={c.started ? c.streak : 0} l="day streak (1 h or more)" />
      </div>

      {ov.items.length > 0 && (
        <p className="items"><b>Output so far:</b> {ov.items.filter((x) => x.count > 0).map((x) => `${x.count} ${x.unit}`).join(", ")}</p>
      )}

      <h2>Last 14 days, hours per day</h2>
      {!hasLast ? <p className="muted">No study hours logged yet.</p> : (
        <div className="bars" role="img" aria-label="Hours per day for the last 14 days">
          <div className="goal" style={{ bottom: `calc(22px + (100% - 22px) * ${TARGET / max})` }}><span>5 h</span></div>
          {last.map((k) => (
            <div className="bar" key={k}>
              <i style={{ height: `${(dayMap[k].doneMin / max) * 100}%` }} title={`${short(k)}: ${hrs(dayMap[k].doneMin)} h`} />
              <span>{Number(k.slice(8))}</span>
            </div>
          ))}
        </div>
      )}

      <h2>Skill by skill</h2>
      {!c.started || c.skills.length === 0 ? <p className="muted">Appears after you complete and log tasks.</p> : (
        <div className="scroll">
          <table>
            <thead><tr><th>Skill</th><th>Tasks done</th><th>Hours</th><th>Felt (1 hard, 5 easy)</th></tr></thead>
            <tbody>
              {c.skills.filter((s) => s.total > 0 || s.minutes > 0).sort((a, b) => b.minutes - a.minutes).map((s) => (
                <tr key={s.category}>
                  <td>{LABEL[s.category] || s.category}</td>
                  <td>{s.done}/{s.total}{s.total ? ` (${Math.round((s.done / s.total) * 100)}%)` : ""}</td>
                  <td>{hrs(s.minutes)}</td>
                  <td>{s.avgRating ? s.avgRating.toFixed(1) : "not rated"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Week by week</h2>
      <div className="scroll">
        <table>
          <thead><tr><th>Week</th><th>Dates</th><th>Tasks</th><th>Hours</th><th>Of plan</th></tr></thead>
          <tbody>
            {ov.weeks.filter((w) => w.start <= today).map((w) => {
              let t = 0, d = 0, m = 0, p = 0;
              for (let i = 0; i < 7; i++) { const s = dayMap[addDays(w.start, i)]; if (s) { t += s.total; d += s.done; m += s.doneMin; p += s.plannedMin; } }
              return <tr key={w.n}><td>{w.n}</td><td>{short(w.start)} to {short(w.end)}</td><td>{d}/{t}</td><td>{hrs(m)}</td><td>{p ? Math.round((m / p) * 100) : 0}%</td></tr>;
            })}
            {ov.weeks.every((w) => w.start > today) && <tr><td colSpan="5" className="muted">Week 1 starts on {short(ov.start)}.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2>Days with unfinished tasks</h2>
      {missed.length === 0 ? <p className="muted">Nothing pending from past days.</p> : (
        <ul className="missed">
          {missed.slice(0, 12).map((d) => (
            <li key={d.date}><button onClick={() => onOpen(d.date)}><span>{fmt(d.date, { weekday: "short", day: "numeric", month: "short" })}</span><span>{d.total - d.done} {d.total - d.done === 1 ? "task" : "tasks"} left</span></button></li>
          ))}
        </ul>
      )}

      <h2>Recent log notes</h2>
      {ov.notes.length === 0 ? <p className="muted">Notes you write while logging a task show up here.</p> : ov.notes.map((n, i) => (
        <p className="note" key={i}><b>{short(n.date)}, {n.title}</b><br />{n.note}</p>
      ))}
    </section>
  );
}
const Fact = ({ v, l }) => <div className="fact"><b>{v}</b><span>{l}</span></div>;
