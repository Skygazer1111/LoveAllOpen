/**
 * Schedule Page — Public fixtures & results
 */

import { store } from '../store.js';
import { renderGroupStandings } from '../components/groupTable.js';
import { renderMatchCard } from '../components/matchCard.js';
import { renderBracket } from '../components/bracket.js';
import { initMotion } from '../motion.js';

let currentCategory = 'mens-singles';

export function renderSchedulePage() {
  const settings = store.getSettings();
  const categories = store.getCategories();

  return `
    <div class="page" id="schedule-page">
      <header class="page-hero">
        <div class="page-hero-inner">
          <p class="eyebrow">Fixtures</p>
          <h1 class="page-title">Match schedule</h1>
          <p class="page-subtitle">${settings.tournamentDate} · ${settings.venueShort || 'Toneup Badminton'}</p>
        </div>
      </header>

      <div class="page-content">
        <div class="tabs" id="schedule-tabs" role="tablist">
          ${Object.values(categories).map(c => `
            <button class="tab ${c.id === currentCategory ? 'active' : ''}"
                    data-category="${c.id}"
                    role="tab"
                    aria-selected="${c.id === currentCategory}"
                    id="schedule-tab-${c.id}">
              ${c.name}
            </button>
          `).join('')}
        </div>

        <div id="schedule-content">
          ${renderScheduleContent(currentCategory)}
        </div>

        <footer class="footer">
          <img src="/images/icon.png" alt="LoveAll Club" class="footer-logo" />
          <p class="footer-text">Organised by <span class="footer-brand">LoveAll Club</span></p>
          <p class="footer-copyright">© ${new Date().getFullYear()} LoveAll Club</p>
        </footer>
      </div>
    </div>
  `;
}

function renderScheduleContent(categoryId) {
  const cat = store.getCategory(categoryId);
  if (!cat) return '';

  const groups = store.getGroups(categoryId);
  const knockout = store.getKnockout(categoryId);
  const hasGroups = groups.length > 0;
  const hasKnockout = knockout.rounds && knockout.rounds.length > 0;

  if (!hasGroups && !hasKnockout) {
    return `
      <div class="empty-state" data-reveal>
        <div class="empty-state-title">Fixtures coming soon</div>
        <div class="empty-state-text">
          The ${cat.name} draw hasn’t been published yet. Check back once the admin releases the schedule.
        </div>
      </div>
    `;
  }

  let html = '';

  if (hasGroups) {
    html += `
      <section class="section" data-reveal>
        <div class="section-intro">
          <p class="eyebrow">Standings</p>
          <h2 class="section-heading">Group stage</h2>
        </div>
        <div class="groups-grid">
          ${groups.map(group => `
            <div class="group-card">
              <div class="group-card-header">
                <span class="group-name">${group.name}</span>
                <span class="group-count">${group.participantIds.length} players</span>
              </div>
              ${renderGroupStandings(categoryId, group.id)}
            </div>
          `).join('')}
        </div>
      </section>
    `;

    const allMatches = [];
    for (const group of groups) {
      for (const match of group.matches) {
        allMatches.push({ match, groupName: group.name, groupId: group.id });
      }
    }

    if (allMatches.length > 0) {
      const liveMatches = allMatches.filter(m => m.match.status === 'live');
      const upcomingMatches = allMatches.filter(m => m.match.status === 'upcoming');
      const completedMatches = allMatches.filter(m => m.match.status === 'completed');

      html += `
        <section class="section" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Fixtures</p>
            <h2 class="section-heading">Matches</h2>
          </div>
      `;

      if (liveMatches.length > 0) {
        html += `
          <h3 class="match-band-title live">
            <span class="live-dot"></span> Live now
          </h3>
          <div class="match-grid match-grid-live">
            ${liveMatches.map(m => renderMatchCard(categoryId, m.match, { showGroup: true, groupName: m.groupName })).join('')}
          </div>
        `;
      }

      if (upcomingMatches.length > 0) {
        html += `
          <h3 class="match-band-title">Upcoming</h3>
          <div class="match-grid">
            ${upcomingMatches.map(m => renderMatchCard(categoryId, m.match, { showGroup: true, groupName: m.groupName })).join('')}
          </div>
        `;
      }

      if (completedMatches.length > 0) {
        html += `
          <h3 class="match-band-title">Completed</h3>
          <div class="match-grid">
            ${completedMatches.map(m => renderMatchCard(categoryId, m.match, { showGroup: true, groupName: m.groupName })).join('')}
          </div>
        `;
      }

      html += '</section>';
    }
  }

  if (hasKnockout) {
    html += `
      <section class="section" data-reveal>
        <div class="section-intro">
          <p class="eyebrow">Knockout</p>
          <h2 class="section-heading">Bracket</h2>
        </div>
        ${renderBracket(categoryId, false)}
      </section>
    `;
  }

  return html;
}

export function initSchedulePage() {
  const tabs = document.querySelectorAll('#schedule-tabs .tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentCategory = tab.dataset.category;
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const content = document.getElementById('schedule-content');
      if (content) {
        content.innerHTML = renderScheduleContent(currentCategory);
        initMotion(content);
      }
    });
  });
  initMotion(document.getElementById('schedule-page') || document);
}

export function getScheduleCurrentCategory() {
  return currentCategory;
}

export function setScheduleCategory(cat) {
  currentCategory = cat;
}
