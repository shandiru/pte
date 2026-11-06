import { useState } from "react";
import { api } from "./api.js";
import { short } from "./dates.js";

export default function MocksView({ ov, today, refresh }) {
  const blank = { date: today, total: "", speaking: "", listening: "", reading: "", writing: "" };
  const m = ov.mocks;
  const [f, setF] = useState(blank);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setErr("");
    const body = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "").map(([k, v]) => [k, k === "date" ? v : Number(v)]));
    try { await api("/mocks", { method: "POST", body }); setF(blank); refresh(); } catch (e2) { setErr(e2.message); }
  };
  const del = async (id) => { await api(`/mocks/${id}`, { method: "DELETE" }); refresh(); };

  const W = 640, H = 220, P = 36;
  const yv = (v) => H - P - ((v - 20) / 70) * (H - 2 * P);
  const xv = (i) => (m.length < 2 ? W / 2 : P + (i * (W - 2 * P)) / (m.length - 1));
  const last = m[m.length - 1];

  return (
    <section>
      <h2>Mock test scores</h2>
      <p className="muted">Planned mocks: 4 Jan, 31 Jan, 22 Feb, 7 Mar, 14 Mar. 65 or more means book the March exam. Below 50 at mock #3 means move to April.</p>
      <form className="mockform" onSubmit={save}>
        <label className="field">Date<input type="date" value={f.date} onChange={set("date")} required /></label>
        <label className="field">Overall<input type="number" min="10" max="90" value={f.total} onChange={set("total")} required /></label>
        <label className="field">Speaking<input type="number" min="10" max="90" value={f.speaking} onChange={set("speaking")} /></label>
        <label className="field">Listening<input type="number" min="10" max="90" value={f.listening} onChange={set("listening")} /></label>
        <label className="field">Reading<input type="number" min="10" max="90" value={f.reading} onChange={set("reading")} /></label>
        <label className="field">Writing<input type="number" min="10" max="90" value={f.writing} onChange={set("writing")} /></label>
        <button className="btn">Save score</button>
      </form>
      {err && <p className="err">{err}</p>}

      {m.length === 0 ? <p className="empty">No mock scores yet. Add the first one after the diagnostic test on 4 Jan.</p> : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Mock score trend">
            {[65, 70].map((v) => (
              <g key={v}><line x1={P} x2={W - P} y1={yv(v)} y2={yv(v)} className={v === 70 ? "l70" : "l65"} /><text x={W - P + 4} y={yv(v) + 4}>{v}</text></g>
            ))}
            <polyline className="ln" points={m.map((x, i) => `${xv(i)},${yv(x.total)}`).join(" ")} />
            {m.map((x, i) => (
              <g key={x._id}><circle cx={xv(i)} cy={yv(x.total)} r="5" className="dot" /><text x={xv(i)} y={yv(x.total) - 12} textAnchor="middle" className="val">{x.total}</text></g>
            ))}
          </svg>
          <p className="muted">Latest {last.total}. {last.total >= 70 ? "You are at the target." : `${70 - last.total} points to reach 70.`} Thick line is 70, dashed line is 65.</p>
          <div className="scroll">
            <table>
              <thead><tr><th>Date</th><th>Overall</th><th>Speaking</th><th>Listening</th><th>Reading</th><th>Writing</th><th /></tr></thead>
              <tbody>{m.map((x) => (
                <tr key={x._id}><td>{short(x.date)}</td><td><b>{x.total}</b></td><td>{x.speaking ?? "-"}</td><td>{x.listening ?? "-"}</td><td>{x.reading ?? "-"}</td><td>{x.writing ?? "-"}</td><td><button className="link" onClick={() => del(x._id)}>Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
