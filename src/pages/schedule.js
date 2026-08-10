/**
 * Schedule Page — Public fixture and results view (Neon theme)
 */

import { store } from '../store.js';
import { renderGroupStandings } from '../components/groupTable.js';
import { renderMatchCard } from '../components/matchCard.js';
import { renderBracket } from '../components/bracket.js';

let currentCategory = 'mens-singles';

export function renderSchedulePage() {
  const categories = store.getCategories();

  return `
    <div class="page" id="schedule-page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title"><i class='bx bx-list-ul'></i> Fixtures & Schedule</h1>
          <p class="page-subtitle">View all match fixtures, group standings, and knockout brackets</p>
        </div>

        <!-- Category Tabs -->
        <div class="tabs" id="schedule-tabs">
          ${Object.values(categories).map(c => `
            <button class="tab ${c.id === currentCategory ? 'active' : ''}" 
                    data-category="${c.id}"
                    id="schedule-tab-${c.id}">
              ${c.name}
            </button>
          `).join('')}
        </div>

        <!-- Content -->
        <div id="schedule-content">
          ${renderScheduleContent(currentCategory)}
        </div>

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

function renderScheduleContent(categoryId) {
  const cat = store.getCategory(categoryId);
  if (!cat) return '';

  const groups = store.getGroups(categoryId);
  const knockout = store.getKnockout(categoryId);
  const hasGroups = groups.length > 0;
  const hasKnockout = knockout.rounds && knockout.rounds.length > 0;

  if (!hasGroups && !hasKnockout) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon"><i class='bx bx-calendar-event'></i></div>
        <div class="empty-state-title">Fixtures Coming Soon</div>
        <div class="empty-state-text">The schedule for ${cat.name} will be published here once it's ready. Stay tuned!</div>
      </div>
    `;
  }

  let html = '';

  // Group Stage
  if (hasGroups) {
    html += `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title"><i class='bx bx-grid-alt'></i> Group Stage</h2>
          <div class="section-line"></div>
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

    // All Matches
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

      html += '<section class="section">';
      html += '<div class="section-header"><h2 class="section-title"><i class=\'bx bx-play-circle\'></i> Matches</h2><div class="section-line"></div></div>';

      if (liveMatches.length > 0) {
        html += `<h3 style="color: var(--color-live); margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);"><i class='bx bx-broadcast' style="filter: drop-shadow(0 0 6px rgba(255,64,129,0.5));"></i> Live Now</h3>`;
        html += '<div class="match-grid" style="margin-bottom: var(--space-xl);">';
        html += liveMatches.map(m => renderMatchCard(categoryId, m.match, { showGroup: true, groupName: m.groupName })).join('');
        html += '</div>';
      }

      if (upcomingMatches.length > 0) {
        html += `<h3 style="color: var(--text-secondary); margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);"><i class='bx bx-time-five'></i> Upcoming</h3>`;
        html += '<div class="match-grid" style="margin-bottom: var(--space-xl);">';
        html += upcomingMatches.map(m => renderMatchCard(categoryId, m.match, { showGroup: true, groupName: m.groupName })).join('');
        html += '</div>';
      }

      if (completedMatches.length > 0) {
        html += `<h3 style="color: var(--color-success); margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);"><i class='bx bx-check-circle'></i> Completed</h3>`;
        html += '<div class="match-grid">';
        html += completedMatches.map(m => renderMatchCard(categoryId, m.match, { showGroup: true, groupName: m.groupName })).join('');
        html += '</div>';
      }

      html += '</section>';
    }
  }

  // Knockout Stage
  if (hasKnockout) {
    html += `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title"><i class='bx bx-trophy'></i> Knockout Stage</h2>
          <div class="section-line"></div>
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
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById('schedule-content');
      if (content) {
        content.innerHTML = renderScheduleContent(currentCategory);
      }
    });
  });
}

export function getScheduleCurrentCategory() {
  return currentCategory;
}

export function setScheduleCategory(cat) {
  currentCategory = cat;
}
