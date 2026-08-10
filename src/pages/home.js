/**
 * Home Page — LoveAll Open Tournament
 */

import { store } from '../store.js';
import { initMotion } from '../motion.js';
import { renderFooter } from '../components/footer.js';

function mapsEmbedUrl(query) {
  const q = encodeURIComponent(query || 'Toneup Badminton Thoraipakkam Chennai');
  return `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
}

function mapsLinkUrl(query) {
  const q = encodeURIComponent(query || 'Toneup Badminton Thoraipakkam Chennai');
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function renderHomePage() {
  const settings = store.getSettings();
  const categories = store.getCategories();
  const cats = Object.values(categories);
  const totalRegistered = cats.reduce((n, c) => n + c.participants.length, 0);

  let liveCount = 0;
  let upcomingCount = 0;
  for (const cat of cats) {
    for (const group of cat.groups || []) {
      for (const m of group.matches || []) {
        if (m.status === 'live') liveCount++;
        if (m.status === 'upcoming') upcomingCount++;
      }
    }
  }

  return `
    <div class="page" id="home-page">
      <section class="hero">
        <div class="hero-media" data-parallax aria-hidden="true">
          <img src="/images/poster.png" alt="" class="hero-img" />
          <div class="hero-veil"></div>
        </div>
        <div class="hero-content">
          <img src="/images/icon.png" alt="LoveAll Club" class="hero-mark" />
          <p class="hero-brand">LoveAll Club</p>
          <h1 class="hero-title">LoveAll Open</h1>
          <p class="hero-lede">Badminton tournament — ${settings.tournamentDate}</p>
          <div class="hero-cta">
            <a href="#/schedule" class="btn btn-accent btn-lg">View fixtures</a>
            <button type="button" class="btn btn-ghost-light btn-lg" id="btn-scroll-venue">Find the venue</button>
          </div>
        </div>
        <div class="hero-scroll" aria-hidden="true">
          <span></span>
        </div>
      </section>

      <div class="page-content">
        <section class="section event-strip" data-reveal>
          <div class="event-strip-grid">
            <div>
              <p class="eyebrow">When</p>
              <h2 class="event-strip-value">${settings.tournamentDate}</h2>
              <p class="muted">${settings.tournamentTime}</p>
            </div>
            <div>
              <p class="eyebrow">Where</p>
              <h2 class="event-strip-value">${settings.venueShort || 'Toneup Badminton'}</h2>
              <p class="muted">${settings.courts} courts · ${settings.shuttles}</p>
            </div>
            <div>
              <p class="eyebrow">Level</p>
              <h2 class="event-strip-value">${settings.level || 'Beginner'}</h2>
              <p class="muted">${totalRegistered} registered · ${upcomingCount + liveCount} fixtures</p>
            </div>
          </div>
        </section>

        <section class="section" id="details" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Event details</p>
            <h2 class="section-heading">Everything you need for match day</h2>
            <p class="section-copy">Date, timing, shuttle, and court setup — updated by the organisers.</p>
          </div>
          <div class="detail-rail" data-stagger>
            <article class="detail-block">
              <span class="detail-label">Date</span>
              <strong>${settings.tournamentDate}</strong>
            </article>
            <article class="detail-block">
              <span class="detail-label">Time</span>
              <strong>${settings.tournamentTime}</strong>
            </article>
            <article class="detail-block">
              <span class="detail-label">Shuttles</span>
              <strong>${settings.shuttles}</strong>
            </article>
            <article class="detail-block">
              <span class="detail-label">Courts</span>
              <strong>${settings.courts} courts</strong>
            </article>
          </div>
        </section>

        <section class="section venue-section" id="venue" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Venue</p>
            <h2 class="section-heading">Find us on the map</h2>
            <p class="section-copy">${settings.venue}</p>
          </div>
          <div class="venue-layout">
            <div class="venue-map-wrap">
              <iframe
                class="venue-map"
                title="Venue map — ${settings.venueShort || 'Toneup Badminton'}"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                src="${mapsEmbedUrl(settings.mapsQuery)}"
              ></iframe>
            </div>
            <div class="venue-aside">
              <h3>${settings.venueShort || 'Toneup Badminton'}</h3>
              <p>${settings.venue}</p>
              <a class="btn btn-outline" href="${mapsLinkUrl(settings.mapsQuery)}" target="_blank" rel="noopener">
                Open in Google Maps
              </a>
            </div>
          </div>
        </section>

        <section class="section" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Categories</p>
            <h2 class="section-heading">Three ways to play</h2>
            <p class="section-copy">Pick your event — fees listed below.</p>
          </div>
          <div class="category-list" data-stagger>
            ${cats.map(cat => `
              <div class="category-row">
                <div>
                  <h3>${cat.name}</h3>
                  <p class="muted">${cat.participants.length} registered · ${cat.feeLabel}</p>
                </div>
                <div class="category-fee">₹${cat.fee}</div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="section fixtures-teaser" data-reveal>
          <div class="fixtures-teaser-inner">
            <div>
              <p class="eyebrow">Fixtures</p>
              <h2 class="section-heading">Match schedule goes live here</h2>
              <p class="section-copy">
                ${liveCount > 0
                  ? `${liveCount} match${liveCount === 1 ? '' : 'es'} live right now — scores update as play happens.`
                  : upcomingCount > 0
                    ? `${upcomingCount} fixtures scheduled. Check the full board for groups and knockouts.`
                    : 'Once the admin publishes the draw, every group match and knockout fixture appears on the schedule.'}
              </p>
            </div>
            <a href="#/schedule" class="btn btn-accent btn-lg">Open schedule</a>
          </div>
        </section>

        <section class="section" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Format</p>
            <h2 class="section-heading">Group stage, then knockout</h2>
          </div>
          <ol class="format-timeline">
            <li>
              <span class="format-num">01</span>
              <div>
                <h3>Group stage</h3>
                <p>Round-robin within each group — every player meets every other player.</p>
              </div>
            </li>
            <li>
              <span class="format-num">02</span>
              <div>
                <h3>Knockout</h3>
                <p>Top finishers advance. Win and stay in — lose and you're out.</p>
              </div>
            </li>
            <li>
              <span class="format-num">03</span>
              <div>
                <h3>Finals</h3>
                <p>Championship cups for 1st, 2nd &amp; 3rd across all categories.</p>
              </div>
            </li>
          </ol>
        </section>

        <section class="section" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Rewards</p>
            <h2 class="section-heading">Medals, certificates &amp; cups</h2>
          </div>
          <ul class="reward-list">
            <li>Participation medal for every player</li>
            <li>Certificates for all participants</li>
            <li>Championship cups — 1st, 2nd &amp; 3rd in each category</li>
            <li>Refreshments on the day</li>
          </ul>
        </section>

        <section class="section" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Contact</p>
            <h2 class="section-heading">Talk to the organiser</h2>
            <p class="section-copy">Message Priyan on WhatsApp — your number stays private on this site.</p>
          </div>
          <div class="contact-list contact-list-single">
            <a href="/api/wa/priyan" target="_blank" rel="noopener noreferrer" class="contact-link">
              <span class="contact-name">Priyan</span>
              <span class="contact-phone">Chat on WhatsApp</span>
            </a>
          </div>
        </section>

        ${renderFooter()}
      </div>
    </div>
  `;
}

export function initHomePage() {
  initMotion(document.getElementById('home-page') || document);
  document.getElementById('btn-scroll-venue')?.addEventListener('click', () => {
    document.getElementById('venue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
