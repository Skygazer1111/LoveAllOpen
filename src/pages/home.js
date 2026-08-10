/**
 * Home Page — Tournament Landing Page
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
          <div class="hero-badge">🏸 Beginner Level Tournament</div>
          <img src="/images/icon.png" alt="LoveAll Club" class="hero-logo" />
          <h1 class="hero-title">LoveAll Open</h1>
          <p class="hero-subtitle">Badminton Tournament 2026</p>
          <div class="hero-date">
            <span style="margin-right: var(--space-md);">📅 ${settings.tournamentDate}</span>
            <span>⏰ ${settings.tournamentTime}</span>
          </div>
          <div style="margin-top: var(--space-xl); display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
            <a href="#/schedule" class="btn btn-accent btn-lg">📋 View Schedule</a>
            <a href="#/schedule" class="btn btn-outline btn-lg">🏆 View Fixtures</a>
          </div>
        </div>
      </section>

      <div class="page-content">
        <!-- Tournament Info -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">📌 Event Details</h2>
            <div class="section-line"></div>
          </div>
          <div class="info-bar">
            <div class="info-item">
              <div class="info-item-icon">📅</div>
              <div class="info-item-content">
                <span class="info-item-label">Date</span>
                <span class="info-item-value">${settings.tournamentDate}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-item-icon">⏰</div>
              <div class="info-item-content">
                <span class="info-item-label">Time</span>
                <span class="info-item-value">${settings.tournamentTime}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-item-icon">📍</div>
              <div class="info-item-content">
                <span class="info-item-label">Venue</span>
                <span class="info-item-value">${settings.venue}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-item-icon">🏸</div>
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
            <h2 class="section-title">🏸 Three Categories</h2>
            <div class="section-line"></div>
          </div>
          <div class="category-grid">
            ${Object.values(categories).map(cat => `
              <div class="category-card card-glow">
                <div class="category-icon">${cat.type === 'singles' ? '🧑' : cat.id === 'mixed-doubles' ? '👫' : '👬'}</div>
                <h3 class="category-name">${cat.name}</h3>
                <div class="category-fee">₹${cat.fee}</div>
                <div class="category-fee-label">${cat.feeLabel}</div>
                <div style="margin-top: var(--space-md);">
                  <span class="badge badge-upcoming" style="font-size: 0.8rem; padding: 5px 12px;">
                    ${cat.participants.length} Registered
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- League Tournament -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">🎯 League Tournament Format</h2>
            <div class="section-line"></div>
          </div>
          <div class="card" style="max-width: 700px;">
            <div style="display: flex; flex-direction: column; gap: var(--space-md);">
              <div style="display: flex; align-items: flex-start; gap: var(--space-md);">
                <span style="font-size: 1.5rem;">1️⃣</span>
                <div>
                  <h4 style="margin-bottom: 4px;">Group Stage</h4>
                  <p class="text-secondary" style="font-size: 0.9rem;">Players are divided into groups. Everyone in a group plays against each other (round-robin).</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: var(--space-md);">
                <span style="font-size: 1.5rem;">2️⃣</span>
                <div>
                  <h4 style="margin-bottom: 4px;">Knockout Stage</h4>
                  <p class="text-secondary" style="font-size: 0.9rem;">Top players from each group advance to the knockout bracket. Win or go home!</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: var(--space-md);">
                <span style="font-size: 1.5rem;">🏆</span>
                <div>
                  <h4 style="margin-bottom: 4px;">Finals</h4>
                  <p class="text-secondary" style="font-size: 0.9rem;">The best players compete for the championship cups!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Prizes -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">🏆 Prizes & Rewards</h2>
            <div class="section-line"></div>
          </div>
          <div class="prizes-grid">
            <div class="prize-card card-glow">
              <div class="prize-icon">🏅</div>
              <div class="prize-text">
                <span class="prize-title">Participation Medal</span>
                <span class="prize-desc">For every participant</span>
              </div>
            </div>
            <div class="prize-card card-glow">
              <div class="prize-icon">📜</div>
              <div class="prize-text">
                <span class="prize-title">Certificates</span>
                <span class="prize-desc">For every participant</span>
              </div>
            </div>
            <div class="prize-card card-glow">
              <div class="prize-icon">🏆</div>
              <div class="prize-text">
                <span class="prize-title">Championship Cups</span>
                <span class="prize-desc">1st, 2nd & 3rd in all categories</span>
              </div>
            </div>
            <div class="prize-card card-glow">
              <div class="prize-icon">🧃</div>
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
            <h2 class="section-title">📞 Contact</h2>
            <div class="section-line"></div>
          </div>
          <div class="contact-grid">
            <div class="contact-card">
              <div class="contact-icon">📱</div>
              <div>
                <div class="contact-name">Priyan</div>
                <div class="contact-phone">6380243702</div>
              </div>
            </div>
            <div class="contact-card">
              <div class="contact-icon">📱</div>
              <div>
                <div class="contact-name">Hithesh</div>
                <div class="contact-phone">9962131645</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <p class="footer-text">
            Organized by <span class="footer-brand">LoveAll Club</span> · 
            Badminton Tournament 2026 · 
            All rights reserved
          </p>
        </footer>
      </div>
    </div>
  `;
}

export function initHomePage() {
  // No special initialization needed for home page
}
