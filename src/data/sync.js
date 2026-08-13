/**
 * Live fixture sync — admin publishes, public pages pull.
 * Dev: Vite writes data/tournament.json
 * Prod: Vercel KV (if configured) via /api/tournament
 */

import { store, ADMIN_PASSWORD } from './store.js';

const POLL_MS = 8000;
let pollTimer = null;
let publishing = false;

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
  if (publishing) return false;
  publishing = true;
  try {
    const res = await fetch('/api/tournament', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_PASSWORD
      },
      body: JSON.stringify({ data })
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    publishing = false;
  }
}

export async function pullRemoteTournament() {
  const remote = await fetchRemoteTournament();
  if (!remote) return false;
  const localAt = store.getData()?.updatedAt || 0;
  const remoteAt = remote.updatedAt || 0;
  if (remoteAt <= localAt) return false;
  return store.replaceData(remote);
}

export function startLiveSync({ isAdmin = false } = {}) {
  stopLiveSync();
  pullRemoteTournament();
  pollTimer = setInterval(() => {
    pullRemoteTournament();
  }, isAdmin ? 20000 : POLL_MS);
}

export function stopLiveSync() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
