/**
 * Home Page — LoveAll Open Tournament
 */

import { store } from '../../data/store.js';
import { initMotion } from '../../ui/motion.js';
import { renderFooter } from '../../ui/layout/footer.js';
import { mapsEmbedUrl, mapsLinkUrl } from './maps.js';
import { renderCountdownSection, initCountdown } from './countdown.js';
import { heroPhotos } from './hero-photos.js';
import { initHeroSlideshow } from './hero-slideshow.js';

export function renderHomePage() {
  const settings = store.getSettings();
  const categories = store.getCategories();
  const cats = Object.values(categories);

  const published = store.isSchedulePublished();
  const { live: liveCount, upcoming: upcomingCount } = published
    ? store.countMatchStatuses()
    : { live: 0, upcoming: 0 };

  return `
    <div class="page" id="home-page">
      <section class="hero">
        <div class="hero-media" data-parallax aria-hidden="true">
          <div class="hero-slideshow">
            ${heroPhotos.map((src, i) => `
              <div class="hero-slide${i === 0 ? ' is-active' : ''}">
                <img
                  class="hero-slide-fill"
                  src="${src}"
                  alt=""
                  aria-hidden="true"
                  loading="${i === 0 ? 'eager' : 'lazy'}"
                  decoding="async"
                />
                <img
                  class="hero-slide-photo"
                  src="${src}"
                  alt=""
                  loading="${i === 0 ? 'eager' : 'lazy'}"
                  decoding="async"
                />
              </div>
            `).join('')}
          </div>
          <div class="hero-veil"></div>
        </div>
        <div class="hero-content">
          <img src="/images/icon.png" alt="LoveAll Club" class="hero-mark" />
          <p class="hero-brand">LoveAll Club</p>
          <h1 class="hero-title">LoveAll Open</h1>
          <p class="hero-lede">Badminton tournament — ${settings.tournamentDate}</p>
          <div class="hero-cta">
            <a href="#/schedule" class="btn btn-accent btn-lg">View fixtures</a>
            <a href="#/rules" class="btn btn-ghost-light btn-lg">Tournament rules</a>
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
              <p class="muted">${published
                ? (upcomingCount + liveCount > 0
                  ? `${upcomingCount + liveCount} fixtures listed`
                  : 'See Fixtures for the schedule')
                : 'Schedule publishes soon'}</p>
            </div>
          </div>
        </section>

        ${renderCountdownSection()}

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
            <p class="section-copy">Men's singles, men's doubles, and mixed doubles.</p>
          </div>
          <div class="category-list" data-stagger>
            ${cats.map(cat => `
              <div class="category-row">
                <h3>${cat.name}</h3>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="section fx-banner-section" data-reveal>
          <div class="fx-banner ${liveCount > 0 ? 'is-live' : ''}">
            <div class="fx-banner-grid" aria-hidden="true"></div>
            <div class="fx-banner-board" aria-hidden="true">
              <div class="fx-tile fx-tile-a">
                <span class="fx-tile-meta">Court 1</span>
                <span class="fx-tile-vs">VS</span>
                <span class="fx-tile-meta">${liveCount > 0 ? 'Live' : 'Next'}</span>
              </div>
              <div class="fx-tile fx-tile-b">
                <span class="fx-tile-meta">Group A</span>
                <span class="fx-tile-vs">VS</span>
                <span class="fx-tile-meta">Q1</span>
              </div>
              <div class="fx-tile fx-tile-c">
                <span class="fx-tile-meta">Semi</span>
                <span class="fx-tile-vs">VS</span>
                <span class="fx-tile-meta">Final</span>
              </div>
            </div>
            <div class="fx-banner-body">
              <div class="fx-banner-copy">
                <p class="fx-banner-eyebrow">
                  ${liveCount > 0
                    ? `<span class="fx-live-dot" aria-hidden="true"></span> Live board`
                    : `<span class="fx-mark" aria-hidden="true"></span> Fixtures`}
                </p>
                <h2 class="fx-banner-title">
                  ${!published
                    ? 'Match schedule goes live here'
                    : liveCount > 0
                      ? 'Matches are live — follow every score'
                      : upcomingCount > 0
                        ? 'The draw is up — check your matches'
                        : 'Match schedule goes live here'}
                </h2>
                <p class="fx-banner-text">
                  ${!published
                    ? 'Once the organiser publishes the draw, every group match and knockout fixture appears here.'
                    : liveCount > 0
                      ? `${liveCount} match${liveCount === 1 ? '' : 'es'} live right now — times, courts, and results update as play happens.`
                      : upcomingCount > 0
                        ? `${upcomingCount} fixtures scheduled. Open the board for groups, times, and knockouts.`
                        : 'Once the admin publishes the draw, every group match and knockout fixture appears on the schedule.'}
                </p>
              </div>
              <a href="#/schedule" class="fx-banner-cta">
                <span class="fx-banner-cta-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="4" width="18" height="16" rx="3"></rect>
                    <path d="M3 9h18M8 4v4M16 4v4"></path>
                  </svg>
                </span>
                Open schedule
              </a>
            </div>
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
            <p class="section-copy">Message on WhatsApp for any queries.</p>
          </div>
          <div class="contact-list contact-list-single">
            <a href="/api/wa/priyan" target="_blank" rel="noopener noreferrer" class="contact-link">
              <span class="contact-name">Priyan</span>
              <span class="contact-phone">Chat on WhatsApp</span>
            </a>
          </div>
        </section>

        <section class="section ig-banner-section" data-reveal>
          <div class="ig-banner">
            <div class="ig-banner-grid" aria-hidden="true"></div>
            <div class="ig-banner-film" aria-hidden="true">
              <div class="ig-frame ig-frame-a">
                <span class="ig-frame-glyph">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                    <circle cx="12" cy="12" r="4"></circle>
                    <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none"></circle>
                  </svg>
                </span>
              </div>
              <div class="ig-frame ig-frame-b">
                <span class="ig-frame-label">Stories</span>
                <span class="ig-frame-ring"></span>
              </div>
              <div class="ig-frame ig-frame-c">
                <span class="ig-frame-glyph ig-frame-glyph-light">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7">
                    <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                    <circle cx="12" cy="12" r="4"></circle>
                    <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none"></circle>
                  </svg>
                </span>
                <span class="ig-frame-handle">@loveall</span>
              </div>
            </div>
            <div class="ig-banner-body">
              <div class="ig-banner-copy">
                <p class="ig-banner-eyebrow">
                  <span class="ig-mark" aria-hidden="true"></span>
                  Stories from the court
                </p>
                <h2 class="ig-banner-title">Follow LoveAll on Instagram</h2>
                <p class="ig-banner-text">
                  Match-day clips, pairings, and behind-the-scenes from
                  <strong>@loveall_badminton</strong>.
                </p>
              </div>
              <a
                class="ig-banner-cta"
                href="https://www.instagram.com/loveall_badminton?utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="ig-banner-cta-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                    <circle cx="12" cy="12" r="4"></circle>
                    <circle cx="17.4" cy="6.6" r="0.85" fill="currentColor" stroke="none"></circle>
                  </svg>
                </span>
                Follow @loveall_badminton
              </a>
            </div>
          </div>
        </section>

        ${renderFooter()}
      </div>
    </div>
  `;
}

export function initHomePage() {
  const root = document.getElementById('home-page') || document;
  initMotion(root);
  initHeroSlideshow(root);
  initCountdown();
  document.getElementById('btn-scroll-venue')?.addEventListener('click', () => {
    document.getElementById('venue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
