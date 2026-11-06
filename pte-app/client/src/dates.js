const pad = (n) => String(n).padStart(2, "0");
export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
export const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return toKey(d); };
export const diffDays = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);
export const fmt = (k, o) => fromKey(k).toLocaleDateString("en-GB", o);
export const short = (k) => fmt(k, { day: "numeric", month: "short" });
export const hrs = (m) => (m / 60).toFixed(1);
export const clamp = (k, a, b) => (k < a ? a : k > b ? b : k);
