const BASE = import.meta.env.VITE_API_URL || "/api";

export async function api(path, opts = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method: opts.method || "GET",
      headers: { "Content-Type": "application/json" },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is it running?");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}
