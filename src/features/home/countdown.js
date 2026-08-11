/**
 * Match-day countdown — targets 16 Aug 2026, 9:00 AM IST
 */

const TOURNAMENT_START = Date.parse('2026-08-16T09:00:00+05:30');
let countdownTimer = null;

function pad2(n) {
  return String(Math.max(0, n)).padStart(2, '0');
}

function getCountdownParts(now = Date.now()) {
  const diff = Math.max(0, TOURNAMENT_START - now);
  const totalSec = Math.floor(diff / 1000);
  return {
    done: diff <= 0,
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    mins: Math.floor((totalSec % 3600) / 60),
    secs: totalSec % 60
  };
}

function renderCountdownTick() {
  const parts = getCountdownParts();
  const days = document.getElementById('cd-days');
  const hours = document.getElementById('cd-hours');
  const mins = document.getElementById('cd-mins');
  const secs = document.getElementById('cd-secs');
  const title = document.getElementById('countdown-title');
  const sub = document.getElementById('countdown-sub');
  const panel = document.getElementById('countdown-panel');
  const grid = document.getElementById('countdown-grid');

  if (!days || !hours || !mins || !secs) return false;

  if (parts.done) {
    days.textContent = '00';
    hours.textContent = '00';
    mins.textContent = '00';
    secs.textContent = '00';
    if (title) title.textContent = "It's match day";
    if (sub) sub.textContent = 'See you on court — play well.';
    panel?.classList.add('countdown-live');
    grid?.setAttribute('aria-hidden', 'true');
    return false;
  }

  days.textContent = pad2(parts.days);
  hours.textContent = pad2(parts.hours);
  mins.textContent = pad2(parts.mins);
  secs.textContent = pad2(parts.secs);
  return true;
}

export function renderCountdownSection() {
  return `
    <section class="section countdown-section" data-reveal aria-live="polite">
      <div class="countdown-panel" id="countdown-panel">
        <div class="countdown-copy">
          <p class="eyebrow">Countdown</p>
          <h2 class="countdown-title" id="countdown-title">See you soon</h2>
          <p class="countdown-sub" id="countdown-sub">Courts open 16 August · 9:00 AM</p>
        </div>
        <div class="countdown-grid" id="countdown-grid">
          <div class="countdown-unit">
            <span class="countdown-value" id="cd-days">00</span>
            <span class="countdown-label">Days</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-value" id="cd-hours">00</span>
            <span class="countdown-label">Hours</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-value" id="cd-mins">00</span>
            <span class="countdown-label">Mins</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-value" id="cd-secs">00</span>
            <span class="countdown-label">Secs</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function initCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  const keepGoing = renderCountdownTick();
  if (!keepGoing) return;

  countdownTimer = setInterval(() => {
    if (!renderCountdownTick()) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}
