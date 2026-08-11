/**
 * Flip-clock countdown — targets 16 Aug 2026, 9:00 AM IST
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

function flipCardHTML(id) {
  return `
    <div class="flip-card" id="${id}">
      <div class="flip-card-inner">
        <div class="flip-card-face flip-card-top">
          <span class="flip-card-num" data-top>00</span>
        </div>
        <div class="flip-card-face flip-card-bottom">
          <span class="flip-card-num" data-bottom>00</span>
        </div>
        <div class="flip-card-flap flip-card-flap-top" data-flap-top>
          <span class="flip-card-num">00</span>
        </div>
        <div class="flip-card-flap flip-card-flap-bottom" data-flap-bottom>
          <span class="flip-card-num">00</span>
        </div>
      </div>
    </div>
  `;
}

function setFlipCard(el, value) {
  if (!el) return;
  const top = el.querySelector('[data-top]');
  const bottom = el.querySelector('[data-bottom]');
  const flapTop = el.querySelector('[data-flap-top]');
  const flapBottom = el.querySelector('[data-flap-bottom]');
  if (!top || !bottom || !flapTop || !flapBottom) return;

  const current = top.textContent;
  if (current === value) return;

  // Set flap faces: flap-top shows old value, flap-bottom shows new
  flapTop.querySelector('.flip-card-num').textContent = current;
  flapBottom.querySelector('.flip-card-num').textContent = value;

  // Remove old anim
  flapTop.classList.remove('flipping');
  flapBottom.classList.remove('flipping');
  void flapTop.offsetWidth; // reflow

  // Start flip
  flapTop.classList.add('flipping');
  flapBottom.classList.add('flipping');

  // Update static faces
  bottom.textContent = value; // visible behind flap during flip
  setTimeout(() => {
    top.textContent = value;
    flapTop.classList.remove('flipping');
    flapBottom.classList.remove('flipping');
  }, 600);
}

function renderCountdownTick() {
  const parts = getCountdownParts();
  const title = document.getElementById('countdown-title');
  const sub = document.getElementById('countdown-sub');
  const panel = document.getElementById('countdown-panel');
  const grid = document.getElementById('countdown-grid');

  if (!grid) return false;

  if (parts.done) {
    setFlipCard(document.getElementById('fc-days'), '00');
    setFlipCard(document.getElementById('fc-hours'), '00');
    setFlipCard(document.getElementById('fc-mins'), '00');
    setFlipCard(document.getElementById('fc-secs'), '00');
    if (title) title.textContent = "It's match day";
    if (sub) sub.textContent = 'See you on court — play well.';
    panel?.classList.add('countdown-live');
    return false;
  }

  setFlipCard(document.getElementById('fc-days'), pad2(parts.days));
  setFlipCard(document.getElementById('fc-hours'), pad2(parts.hours));
  setFlipCard(document.getElementById('fc-mins'), pad2(parts.mins));
  setFlipCard(document.getElementById('fc-secs'), pad2(parts.secs));
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
            ${flipCardHTML('fc-days')}
            <span class="countdown-label">Days</span>
          </div>
          <div class="countdown-unit">
            ${flipCardHTML('fc-hours')}
            <span class="countdown-label">Hours</span>
          </div>
          <div class="countdown-unit">
            ${flipCardHTML('fc-mins')}
            <span class="countdown-label">Mins</span>
          </div>
          <div class="countdown-unit">
            ${flipCardHTML('fc-secs')}
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
