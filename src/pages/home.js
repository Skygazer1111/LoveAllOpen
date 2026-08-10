/**
 * Home Page — Tournament Landing Page (Neon Dark Theme)
 */

import { store } from '../store.js';

export function renderHomePage() {
  const settings = store.getSettings();
  const categories = store.getCategories();

  return `
    <div class="page" id="home-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-badge">
            <i class='bx bx-star neon-icon'></i>
            Beginner Level Tournament
          </div>
          <img src="/images/icon.png" alt="LoveAll Club" class="hero-logo" />
          <h1 class="hero-title">LoveAll Open</h1>
          <p class="hero-subtitle">Badminton Tournament 2026</p>
          <div class="hero-date">
            <span class="hero-date-item">
              <i class='bx bx-calendar'></i> ${settings.tournamentDate}
            </span>
            <span class="hero-date-item">
              <i class='bx bx-time-five'></i> ${settings.tournamentTime}
            </span>
          </div>
          <div class="hero-cta">
            <a href="#/schedule" class="btn btn-accent btn-lg">
              <i class='bx bx-list-ul'></i> View Schedule
            </a>
            <a href="#/schedule" class="btn btn-outline btn-lg" style="border-color: var(--border-neon); color: var(--neon);">
              <i class='bx bx-trophy'></i> View Fixtures
            </a>
          </div>
        </div>
      </section>

      <div class="page-content">
        <!-- Tournament Info -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title"><i class='bx bx-info-circle'></i> Event Details</h2>
            <div class="section-line"></div>
          </div>
          <div class="info-bar">
            <div class="info-item">
              <div class="neon-icon-box">
                <i class='bx bx-calendar'></i>
              </div>
              <div class="info-item-content">
                <span class="info-item-label">Date</span>
                <span class="info-item-value">${settings.tournamentDate}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="neon-icon-box">
                <i class='bx bx-time-five'></i>
              </div>
              <div class="info-item-content">
                <span class="info-item-label">Time</span>
                <span class="info-item-value">${settings.tournamentTime}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="neon-icon-box">
                <i class='bx bx-map'></i>
              </div>
              <div class="info-item-content">
                <span class="info-item-label">Venue</span>
                <span class="info-item-value">${settings.venue}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="neon-icon-box">
                <i class='bx bx-target-lock'></i>
              </div>
              <div class="info-item-content">
                <span class="info-item-label">Shuttles</span>
                <span class="info-item-value">${settings.shuttles}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Categories -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title"><i class='bx bx-category'></i> Three Categories</h2>
            <div class="section-line"></div>
          </div>
          <div class="category-grid">
            ${Object.values(categories).map(cat => `
              <div class="category-card">
                <div class="category-icon">
                  <i class='bx ${cat.type === 'singles' ? 'bx-user' : cat.id === 'mixed-doubles' ? 'bx-group' : 'bx-group'}'></i>
                </div>
                <h3 class="category-name">${cat.name}</h3>
                <div class="category-fee">₹${cat.fee}</div>
                <div class="category-fee-label">${cat.feeLabel}</div>
                <div style="margin-top: var(--space-md);">
                  <span class="badge badge-neon">
                    ${cat.participants.length} Registered
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- League Tournament Format -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title"><i class='bx bx-git-branch'></i> League Tournament Format</h2>
            <div class="section-line"></div>
          </div>
          <div class="card neon-border" style="max-width: 720px;">
            <div class="format-steps">
              <div class="format-step">
                <div class="format-step-icon">
                  <i class='bx bx-grid-alt'></i>
                </div>
                <div class="format-step-content">
                  <h4>Group Stage</h4>
                  <p>Players are divided into groups. Everyone in a group plays against each other in a round-robin format.</p>
                </div>
              </div>
              <div class="format-step">
                <div class="format-step-icon">
                  <i class='bx bx-trending-up'></i>
                </div>
                <div class="format-step-content">
                  <h4>Knockout Stage</h4>
                  <p>Top players from each group advance to the knockout bracket. Win or go home!</p>
                </div>
              </div>
              <div class="format-step">
                <div class="format-step-icon">
                  <i class='bx bx-trophy'></i>
                </div>
                <div class="format-step-content">
                  <h4>Finals</h4>
                  <p>The best players compete head-to-head for the championship cups!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Prizes -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title"><i class='bx bx-trophy'></i> Prizes & Rewards</h2>
            <div class="section-line"></div>
          </div>
          <div class="prizes-grid">
            <div class="prize-card">
              <div class="prize-icon-box">
                <i class='bx bx-medal'></i>
              </div>
              <div class="prize-text">
                <span class="prize-title">Participation Medal</span>
                <span class="prize-desc">For every participant</span>
              </div>
            </div>
            <div class="prize-card">
              <div class="prize-icon-box">
                <i class='bx bx-certification'></i>
              </div>
              <div class="prize-text">
                <span class="prize-title">Certificates</span>
                <span class="prize-desc">For every participant</span>
              </div>
            </div>
            <div class="prize-card">
              <div class="prize-icon-box">
                <i class='bx bx-trophy'></i>
              </div>
              <div class="prize-text">
                <span class="prize-title">Championship Cups</span>
                <span class="prize-desc">1st, 2nd & 3rd in all categories</span>
              </div>
            </div>
            <div class="prize-card">
              <div class="prize-icon-box">
                <i class='bx bx-drink'></i>
              </div>
              <div class="prize-text">
                <span class="prize-title">Refreshments</span>
                <span class="prize-desc">Will be provided!</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Contact -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title"><i class='bx bx-phone'></i> Contact</h2>
            <div class="section-line"></div>
          </div>
          <div class="contact-grid">
            <a href="https://wa.me/916380243702" target="_blank" class="contact-card" style="text-decoration: none;">
              <div class="contact-icon-box">
                <i class='bx bxl-whatsapp'></i>
              </div>
              <div>
                <div class="contact-name">Priyan</div>
                <div class="contact-phone">6380243702</div>
              </div>
            </a>
            <a href="https://wa.me/919962131645" target="_blank" class="contact-card" style="text-decoration: none;">
              <div class="contact-icon-box">
                <i class='bx bxl-whatsapp'></i>
              </div>
              <div>
                <div class="contact-name">Hithesh</div>
                <div class="contact-phone">9962131645</div>
              </div>
            </a>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <img src="/images/icon.png" alt="LoveAll Club" class="footer-logo" />
          <p class="footer-text">
            Organized with <span style="color: var(--color-error);">♥</span> by <span class="footer-brand">LoveAll Club</span>
          </p>
          <p class="footer-copyright">
            © ${new Date().getFullYear()} LoveAll Club. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  `;
}

export function initHomePage() {
  // No special initialization needed
}
