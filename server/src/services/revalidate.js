// Tells the Next.js site to refresh its cached pages after a catalogue change,
// so a product added in the dashboard is online within seconds instead of
// waiting for the ISR timer (see docs/ARCHITECTURE.md, ADR-2).
//
// Fire-and-forget: the admin's save must succeed even if the site is down;
// the ISR timer is the safety net.

export function revalidateSite(paths = []) {
  const url = process.env.SITE_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
    body: JSON.stringify({ tags: ["catalogue"], paths }),
    signal: AbortSignal.timeout(8000),
  })
    .then((r) => {
      if (!r.ok) console.warn(`[revalidate] site answered ${r.status}`);
    })
    .catch((err) => console.warn(`[revalidate] failed: ${err.message}`));
}
