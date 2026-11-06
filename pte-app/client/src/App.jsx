import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import { toKey, clamp, diffDays, short, hrs } from "./dates.js";
import { coach } from "./coach.js";
import DayView from "./DayView.jsx";
import PlanView from "./PlanView.jsx";
import ReportView from "./ReportView.jsx";
import MocksView from "./MocksView.jsx";

const TABS = [["day", "Day"], ["plan", "Plan"], ["report", "Report"], ["mocks", "Mock scores"]];

export default function App() {
  const today = toKey(new Date());
  const [ov, setOv] = useState(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("day");
  const [date, setDate] = useState(null);

  const load = useCallback(async () => {
    try {
      const o = await api(`/overview?today=${today}`);
      setOv(o); setErr("");
      setDate((d) => d || clamp(today, o.start, o.end));
    } catch (e) { setErr(e.message); }
  }, [today]);
  useEffect(() => { load(); }, [load]);

  const dayMap = useMemo(() => Object.fromEntries((ov?.days || []).map((d) => [d.date, d])), [ov]);
  const c = useMemo(() => (ov ? coach(ov, today) : null), [ov, today]);

  if (err) return <div className="gate"><h1>Cannot load</h1><p>{err}</p><button className="btn" onClick={load}>Try again</button></div>;
  if (!ov || !date) return <div className="gate"><p>Loading plan</p></div>;

  const open = (k) => { setDate(k); setTab("day"); window.scrollTo(0, 0); };
  const left = Math.max(0, diffDays(today, "2027-03-14"));
  const totalMin = ov.days.reduce((s, d) => s + d.doneMin, 0);

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <h1>PTE 70+</h1>
          <p>
            {short(ov.start)} to {short(ov.end)}. {hrs(totalMin)} hours logged.
            {c.started ? ` Performance ${c.score}/100, ${c.status.toLowerCase()}.` : " Starts on " + short(ov.start) + "."}
            {" "}{left} days to the last mock on 14 Mar.
          </p>
        </div>
        <nav>
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? "on" : ""} aria-current={tab === id} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
      </header>
      <main>
        {tab === "day" && <DayView date={date} setDate={setDate} ov={ov} dayMap={dayMap} today={today} refresh={load} />}
        {tab === "plan" && <PlanView ov={ov} dayMap={dayMap} today={today} onOpen={open} />}
        {tab === "report" && <ReportView ov={ov} c={c} dayMap={dayMap} today={today} onOpen={open} />}
        {tab === "mocks" && <MocksView ov={ov} today={today} refresh={load} />}
      </main>
    </div>
  );
}
