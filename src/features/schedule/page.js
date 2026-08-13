/**
 * Schedule Page — Public fixtures & results
 */

import { store, getParticipantDisplayName } from '../../data/store.js';
import { startLiveSync } from '../../data/sync.js';
import { renderGroupStandings } from '../../ui/tournament/group-table.js';
import { renderMatchCard } from '../../ui/tournament/match-card.js';
import { renderBracket } from '../../ui/tournament/bracket.js';
import { initMotion } from '../../ui/motion.js';
import { renderFooter } from '../../ui/layout/footer.js';

let currentCategory = 'mens-singles';
let onStoreChange = null;

function timeSort(item) {
  const t = item.match.scheduledTime || '99:99';
  const court = item.match.court || 9;
  return `${t}-${court}-${item.match.matchNumber}`;
}

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
          <p class="live-board-status" id="live-board-status">
            <span class="live-dot"></span>
            Live board — results update as matches finish
          </p>
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

        ${renderFooter()}
      </div>
    </div>
  `;
}

function renderMatchBand(title, items, categoryId, extraClass = '') {
  if (items.length === 0) return '';
  return `
    <h3 class="match-band-title ${extraClass}">
      ${extraClass === 'live' ? '<span class="live-dot"></span>' : ''}
      ${title}
    </h3>
    <div class="match-grid ${extraClass === 'live' ? 'match-grid-live' : ''}">
      ${items.map(item => renderMatchCard(categoryId, item.match, {
        showGroup: true,
        groupName: item.label,
        label: item.label,
        stage: item.stage,
        groupId: item.groupId,
        roundIndex: item.roundIndex
      })).join('')}
    </div>
  `;
}

function renderScheduleContent(categoryId) {
  const cat = store.getCategory(categoryId);
  if (!cat) return '';

  const groups = store.getGroups(categoryId);
  const knockout = store.getKnockout(categoryId);
  const board = store.listBoardMatches(categoryId);
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

  const playable = board.filter(item => item.match.player1Id || item.match.player2Id);
  const live = playable.filter(item => item.match.status === 'live');
  const upcoming = playable
    .filter(item => item.match.status === 'upcoming')
    .sort((a, b) => timeSort(a).localeCompare(timeSort(b)));
  const completed = playable.filter(item => item.match.status === 'completed');

  const finalRound = hasKnockout ? knockout.rounds[knockout.rounds.length - 1] : null;
  const championId = finalRound?.matches?.[0]?.status === 'completed' ? finalRound.matches[0].winner : null;
  const champion = championId ? store.getParticipantById(categoryId, championId) : null;

  let html = '';

  if (champion) {
    html += `
      <section class="section champion-banner" data-reveal>
        <p class="eyebrow">Champion</p>
        <h2 class="section-heading">${getParticipantDisplayName(champion)}</h2>
        <p class="section-copy">${cat.name} winner</p>
      </section>
    `;
  }

  html += `
    <section class="section" data-reveal>
      <div class="section-intro">
        <p class="eyebrow">Board</p>
        <h2 class="section-heading">All matches</h2>
        <p class="section-copy">Times, courts, and results — updated live from the referee desk.</p>
      </div>
      ${renderMatchBand('Live now', live, categoryId, 'live')}
      ${renderMatchBand('Upcoming', upcoming, categoryId)}
      ${renderMatchBand('Completed', completed, categoryId)}
      ${playable.length === 0 ? '<p class="text-muted">No matches listed yet.</p>' : ''}
    </section>
  `;

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

function refreshScheduleContent() {
  const content = document.getElementById('schedule-content');
  if (!content) return;
  content.innerHTML = renderScheduleContent(currentCategory);
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
      refreshScheduleContent();
      initMotion(document.getElementById('schedule-content'));
    });
  });

  if (onStoreChange) store.off('change', onStoreChange);
  onStoreChange = () => {
    if (document.getElementById('schedule-page')) refreshScheduleContent();
  };
  store.on('change', onStoreChange);
  startLiveSync();
  initMotion(document.getElementById('schedule-page') || document);
}

export function getScheduleCurrentCategory() {
  return currentCategory;
}

export function setScheduleCategory(cat) {
  currentCategory = cat;
}
