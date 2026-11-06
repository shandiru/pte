import { useEffect, useState } from "react";
import { api } from "./api.js";
import { addDays, fmt, hrs, short } from "./dates.js";
import { dayScore } from "./coach.js";

export default function DayView({ date, setDate, ov, dayMap, today, refresh }) {
  const [tasks, setTasks] = useState(null);
  const [title, setTitle] = useState("");
  const [min, setMin] = useState(30);
  const [err, setErr] = useState("");
  const week = ov.weeks.find((w) => date >= w.start && date <= w.end);

  const reload = () => api(`/tasks?date=${date}`).then(setTasks).catch((e) => setErr(e.message));
  useEffect(() => {
    let live = true;
    setTasks(null); setErr("");
    api(`/tasks?date=${date}`).then((t) => live && setTasks(t)).catch((e) => live && setErr(e.message));
    return () => { live = false; };
  }, [date]);

  const patch = async (t, body) => {
    setTasks((ts) => ts.map((x) => (x._id === t._id ? { ...x, ...body } : x)));
    try {
      const u = await api(`/tasks/${t._id}`, { method: "PATCH", body });
      setTasks((ts) => ts.map((x) => (x._id === u._id ? u : x)));
      refresh();
    } catch (e) { setErr(e.message); reload(); }
  };
  const toggle = (t) => patch(t, t.done ? { done: false } : { done: true, actualMin: t.actualMin || t.plannedMin });
  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try { const t = await api("/tasks", { method: "POST", body: { date, title, plannedMin: min } }); setTasks((ts) => [...ts, t]); setTitle(""); refresh(); }
    catch (e2) { setErr(e2.message); }
  };
  const remove = async (t) => { await api(`/tasks/${t._id}`, { method: "DELETE" }); setTasks((ts) => ts.filter((x) => x._id !== t._id)); refresh(); };
  const moveToToday = async () => {
    await api("/tasks/move", { method: "POST", body: { from: date, to: today } });
    await refresh(); setDate(today);
  };

  const done = tasks ? tasks.filter((t) => t.done) : [];
  const doneMin = done.reduce((s, t) => s + t.actualMin, 0);
  const planned = tasks ? tasks.reduce((s, t) => s + t.plannedMin, 0) : 0;
  const score = tasks ? dayScore({ total: tasks.length, done: done.length, plannedMin: planned, doneMin }) : 0;
  const pending = tasks ? tasks.length - done.length : 0;
  const d = new Date(date + "T00:00:00");
  const status = date === today ? "Today" : date < today ? "Past" : "Upcoming";

  return (
    <section>
      <div className="stamp">
        <div className="big">{d.getDate()}</div>
        <div className="stampinfo">
          <h2>{fmt(date, { weekday: "long" })}</h2>
          <p>{fmt(date, { month: "long", year: "numeric" })}</p>
          <p className="tag">{status}</p>
        </div>
        <div className="stampnav">
          <button className="btn out" onClick={() => setDate(addDays(date, -1))} disabled={date <= ov.start}>Previous day</button>
          <button className="btn out" onClick={() => setDate(addDays(date, 1))} disabled={date >= ov.end}>Next day</button>
          {date !== today && today >= ov.start && today <= ov.end && <button className="btn" onClick={() => setDate(today)}>Go to today</button>}
        </div>
      </div>

      {week && (
        <div className="weekline">
          <b>Week {week.n} of {ov.weeks.length}, {week.phase}</b>
          <span>{week.focus}</span>
        </div>
      )}

      <div className="strip" role="group" aria-label="Days of this week">
        {week && Array.from({ length: 7 }, (_, i) => {
          const k = addDays(week.start, i), s = dayMap[k];
          return (
            <button key={k} className={`${k === date ? "sel" : ""}${k === today ? " today" : ""}`} onClick={() => setDate(k)}>
              <span>{fmt(k, { weekday: "short" })}</span>
              <b>{Number(k.slice(8))}</b>
              <em>{s ? `${s.done}/${s.total}` : "-"}</em>
            </button>
          );
        })}
      </div>

      {err && <p className="err">{err}</p>}

      <div className="summary">
        <b>{done.length} of {tasks ? tasks.length : "-"} tasks done</b>
        <span>{hrs(doneMin)} of {hrs(planned)} hours</span>
        <span>Day score {score}/100</span>
      </div>

      {date < today && pending > 0 && (
        <p className="moveline">{pending} {pending === 1 ? "task was" : "tasks were"} not finished. <button className="link" onClick={moveToToday}>Move unfinished to today</button></p>
      )}

      {!tasks ? <p className="muted">Loading tasks</p> : (
        <ul className="tasks">
          {tasks.map((t) => <Task key={t._id} t={t} onToggle={() => toggle(t)} onSave={(b) => patch(t, b)} onRemove={() => remove(t)} />)}
        </ul>
      )}

      <form className="add" onSubmit={add}>
        <label className="field grow">Add your own task<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: Watch one TED talk with subtitles" maxLength={200} /></label>
        <label className="field">Minutes<input type="number" min="5" step="5" value={min} onChange={(e) => setMin(e.target.value)} /></label>
        <button className="btn">Add task</button>
      </form>
    </section>
  );
}

function Task({ t, onToggle, onSave, onRemove }) {
  const [open, setOpen] = useState(false);
  const [m, setM] = useState(t.actualMin || t.plannedMin);
  const [cnt, setCnt] = useState(t.count || "");
  const [rating, setRating] = useState(t.rating || 0);
  const [note, setNote] = useState(t.note || "");
  const time = t.completedAt ? new Date(t.completedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
  const result = [t.actualMin ? `${t.actualMin} min` : "", t.target && t.count ? `${t.count} of ${t.target} ${t.unit}` : "", t.rating ? `felt ${t.rating} out of 5` : ""].filter(Boolean).join(", ");

  return (
    <li className={t.done ? "task done" : "task"}>
      <button className="box" role="checkbox" aria-checked={t.done} aria-label={`Mark ${t.title} ${t.done ? "not done" : "done"}`} onClick={onToggle}>
        {t.done && <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.5" /></svg>}
      </button>
      <div className="tmain">
        <div className="ttitle">{t.title}</div>
        {t.detail && <div className="tdetail">{t.detail}</div>}
        {t.target > 0 && <div className="tdetail">Target: {t.target} {t.unit}</div>}
        {t.movedFrom && <div className="tdetail">Moved from {short(t.movedFrom)}</div>}
        {t.done && <div className="tdetail result">Done at {time}. {result}{t.note ? ". Note saved." : ""}</div>}
      </div>
      <div className="tside">
        <span>{t.done ? t.actualMin : t.plannedMin} min</span>
        <button className="link" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Close" : "Log"}</button>
      </div>
      {open && (
        <div className="log">
          <label className="field">Minutes spent<input type="number" min="0" step="5" value={m} onChange={(e) => setM(e.target.value)} /></label>
          {t.target > 0 && <label className="field">{t.unit} done (target {t.target})<input type="number" min="0" value={cnt} onChange={(e) => setCnt(e.target.value)} /></label>}
          <div className="field">How did it go? 1 hard, 5 easy
            <div className="rate" role="group" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} aria-pressed={rating === n} className={rating === n ? "on" : ""} onClick={() => setRating(n)}>{n}</button>)}
            </div>
          </div>
          <label className="field grow wide">What did you do? What was hard?<textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <div className="logbtns">
            <button className="btn" onClick={() => { onSave({ actualMin: Number(m) || 0, count: Number(cnt) || 0, rating, note, ...(t.done ? {} : { done: true }) }); setOpen(false); }}>{t.done ? "Save log" : "Save and mark done"}</button>
            {t.custom && <button className="btn out" onClick={onRemove}>Remove task</button>}
          </div>
        </div>
      )}
    </li>
  );
}
