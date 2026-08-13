/**
 * Live fixture sync — admin publishes, public pages pull.
 * Dev: Vite writes data/tournament.json
 * Prod: Vercel KV (if configured) via /api/tournament
 *
 * Admin is always the source of truth: never pull remote over an admin session.
 */

import { store, ADMIN_PASSWORD } from './store.js';

const POLL_MS = 8000;
let pollTimer = null;
let publishing = false;
let publishAgain = false;
let pausePullUntil = 0;

function isAdminSession() {
  return sessionStorage.getItem('loveall_admin') === '1';
}

export async function fetchRemoteTournament() {
  try {
    const res = await fetch('/api/tournament', { cache: 'no-store' });
    if (!res.ok) return null;
    const payload = await res.json();
    if (!payload?.data?.categories) return null;
    return payload.data;
  } catch {
    return null;
  }
}

export async function publishTournament(data = store.getData()) {
  // Always send the latest store snapshot; queue a follow-up if a publish is in flight
  if (publishing) {
    publishAgain = true;
    return false;
  }

  publishing = true;
  pausePullUntil = Date.now() + 15000;
  let ok = false;

  try {
    const res = await fetch('/api/tournament', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_PASSWORD
      },
      body: JSON.stringify({ data: data || store.getData() })
    });
    ok = res.ok;
  } catch {
    ok = false;
  } finally {
    publishing = false;
  }

  if (publishAgain) {
    publishAgain = false;
    return publishTournament(store.getData());
  }

  return ok;
}

/**
 * Apply remote board only when it is strictly newer than local,
 * and never while an admin is logged in (admin writes win).
 */
export async function pullRemoteTournament({ force = false } = {}) {
  if (!force && isAdminSession()) return false;
  if (!force && Date.now() < pausePullUntil) return false;

  const remote = await fetchRemoteTournament();
  if (!remote) return false;

  const localAt = Number(store.getData()?.updatedAt) || 0;
  const remoteAt = Number(remote.updatedAt) || 0;

  // Prefer local when timestamps are equal / missing — never clobber a fresh admin save
  if (remoteAt <= localAt) return false;

  return store.replaceData(remote);
}

export function startLiveSync({ isAdmin = false } = {}) {
  stopLiveSync();

  // Admin only publishes; public pages poll for updates
  if (isAdmin) return;

  pullRemoteTournament();
  pollTimer = setInterval(() => {
    pullRemoteTournament();
  }, POLL_MS);
}

export function stopLiveSync() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
