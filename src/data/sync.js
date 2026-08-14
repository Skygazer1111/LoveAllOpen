/**
 * Live fixture sync — admin publishes, public pages pull.
 * Dev: Vite writes data/tournament.json + public/live-board.json
 * Prod: Vercel KV / Upstash Redis via /api/tournament
 *
 * Admin is always the source of truth: never pull remote over an admin session.
 */

import { store, ADMIN_PASSWORD } from './store.js';

const POLL_MS = 8000;
let pollTimer = null;
let publishing = false;
let publishAgain = false;
let pausePullUntil = 0;
let autoPublishTimer = null;

function isAdminSession() {
  return sessionStorage.getItem('loveall_admin') === '1';
}

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Prefer the shared API. Fall back to a static live-board.json
 * (written by local Vite publish / included in deploy).
 */
export async function fetchRemoteTournament() {
  try {
    const res = await fetch('/api/tournament', { cache: 'no-store' });
    if (res.ok) {
      const payload = await readJson(res);
      if (payload?.data?.categories) return payload.data;
    }
  } catch {
    // try static fallback
  }

  try {
    const res = await fetch(`/live-board.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const payload = await readJson(res);
    if (payload?.categories) return payload;
    if (payload?.data?.categories) return payload.data;
  } catch {
    return null;
  }

  return null;
}

/**
 * @returns {Promise<{ ok: boolean, error?: string, status?: number }>}
 */
export async function publishTournament(data = store.getData()) {
  if (publishing) {
    publishAgain = true;
    return { ok: false, error: 'Publish already in progress' };
  }

  publishing = true;
  pausePullUntil = Date.now() + 15000;
  let result = { ok: false, error: 'Could not reach live board' };

  try {
    const res = await fetch('/api/tournament', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_PASSWORD
      },
      body: JSON.stringify({ data: data || store.getData() })
    });
    const body = await readJson(res);
    if (res.ok) {
      result = { ok: true, status: res.status };
    } else {
      result = {
        ok: false,
        status: res.status,
        error: body?.error || `Live board error (${res.status})`
      };
    }
  } catch (err) {
    result = { ok: false, error: err?.message || 'Network error while publishing' };
  } finally {
    publishing = false;
  }

  if (publishAgain) {
    publishAgain = false;
    return publishTournament(store.getData());
  }

  return result;
}

/**
 * Public pages: always take the published live board.
 * Never let a visitor’s empty/stale localStorage block the shared schedule.
 */
export async function pullRemoteTournament({ force = false } = {}) {
  if (!force && isAdminSession()) return false;
  if (!force && Date.now() < pausePullUntil) return false;

  const remote = await fetchRemoteTournament();
  if (!remote?.categories || !remote?.settings) return false;
  if (!remote.settings.schedulePublished) return false;

  return store.replaceData(remote);
}

function queueAutoPublish() {
  if (!isAdminSession() || !store.isSchedulePublished()) return;
  clearTimeout(autoPublishTimer);
  autoPublishTimer = setTimeout(() => {
    publishTournament(store.getData());
  }, 600);
}

export function startLiveSync({ isAdmin = false } = {}) {
  stopLiveSync();

  if (isAdmin) {
    store.on('change', queueAutoPublish);
    return;
  }

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
  clearTimeout(autoPublishTimer);
  autoPublishTimer = null;
  store.off('change', queueAutoPublish);
}
