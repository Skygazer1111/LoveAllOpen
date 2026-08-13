/**
 * Admin Page — Tournament Management Dashboard
 */

import { store } from '../../data/store.js';
import { publishTournament, startLiveSync } from '../../data/sync.js';
import { showModal, closeModal, showConfirm, showToast } from '../../ui/feedback/modal.js';
import { renderGroupStandings } from '../../ui/tournament/group-table.js';
import { renderMatchCard } from '../../ui/tournament/match-card.js';
import { renderBracket } from '../../ui/tournament/bracket.js';
import { renderFooter } from '../../ui/layout/footer.js';

let isAuthenticated = sessionStorage.getItem('loveall_admin') === '1';
let currentCategory = 'mens-singles';

export function renderAdminPage() {
  if (!isAuthenticated) {
    return renderLoginScreen();
  }

  const categories = store.getCategories();

  return `
    <div class="page" id="admin-page">
      <header class="page-hero page-hero-compact">
        <div class="page-hero-inner">
          <p class="eyebrow">Admin</p>
          <h1 class="page-title">Tournament control</h1>
          <p class="page-subtitle">Add players, set match times, pick winners, and publish live to the fixtures page</p>
        </div>
      </header>

      <div class="page-content">
        <div class="admin-toolbar">
          <div class="admin-toolbar-actions">
            <button class="btn btn-outline btn-sm" id="btn-export-data">Export</button>
            <button class="btn btn-outline btn-sm" id="btn-import-data">Import</button>
            <button class="btn btn-danger btn-sm" id="btn-reset-data">Reset all</button>
          </div>
          <p class="live-sync-status" id="live-sync-status">Publishing live board…</p>
          <button class="btn btn-outline btn-sm" id="btn-logout">Logout</button>
        </div>

        ${renderEventDetailsSection()}

        <div class="tabs" id="admin-tabs">
          ${Object.values(categories).map(c => `
            <button class="tab ${c.id === currentCategory ? 'active' : ''}"
                    data-category="${c.id}"
                    id="admin-tab-${c.id}">
              ${c.name}
            </button>
          `).join('')}
        </div>

        <div id="admin-content">
          ${renderAdminContent(currentCategory)}
        </div>

        ${renderFooter()}
      </div>
    </div>
  `;
}

function renderEventDetailsSection() {
  const s = store.getSettings();
  return `
    <div class="admin-section" id="section-event-details">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">0</span>
          <span>Event details &amp; venue</span>
        </div>
        <button class="btn btn-accent btn-sm" id="btn-save-settings">Save details</button>
      </div>
      <p class="admin-hint">Only visible to the public after you save. Fixtures are managed per category below.</p>
      <div class="settings-grid">
        <div class="input-group">
          <label class="input-label" for="setting-name">Tournament name</label>
          <input type="text" class="input" id="setting-name" value="${escapeAttr(s.tournamentName)}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-level">Level</label>
          <input type="text" class="input" id="setting-level" value="${escapeAttr(s.level || '')}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-date">Date</label>
          <input type="text" class="input" id="setting-date" value="${escapeAttr(s.tournamentDate)}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-time">Time</label>
          <input type="text" class="input" id="setting-time" value="${escapeAttr(s.tournamentTime)}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-venue-short">Venue short name</label>
          <input type="text" class="input" id="setting-venue-short" value="${escapeAttr(s.venueShort || '')}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-shuttles">Shuttles</label>
          <input type="text" class="input" id="setting-shuttles" value="${escapeAttr(s.shuttles)}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-courts">Courts</label>
          <input type="number" class="input" id="setting-courts" min="1" value="${s.courts ?? 2}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-maps">Maps search query</label>
          <input type="text" class="input" id="setting-maps" value="${escapeAttr(s.mapsQuery || '')}" placeholder="Toneup Badminton Thoraipakkam" />
        </div>
        <div class="input-group settings-full">
          <label class="input-label" for="setting-venue">Full venue address</label>
          <textarea class="input input-textarea" id="setting-venue" rows="2">${escapeHtml(s.venue)}</textarea>
        </div>
      </div>
    </div>
  `;
}

function escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderLoginScreen() {
  return `
    <div class="page">
      <div class="password-screen">
        <div class="password-card">
          <img src="/images/icon.png" alt="LoveAll Club" class="password-logo" />
          <h2>Admin access</h2>
          <p>Only organisers can edit event details and publish fixtures.</p>
          <div class="input-group">
            <input type="password" class="input w-full" id="admin-password-input"
                   placeholder="Password" autocomplete="current-password" />
          </div>
          <div id="password-error" class="password-error hidden"></div>
          <button class="btn btn-accent w-full mt-md" id="btn-admin-login">
            Login
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderAdminContent(categoryId) {
  const cat = store.getCategory(categoryId);
  if (!cat) return '';

  let html = '';

  // Step 1: Manage Participants
  html += renderParticipantsSection(categoryId, cat);

  // Step 2: Groups
  html += renderGroupsSection(categoryId, cat);

  // Step 3: Matches & Scores
  html += renderMatchesSection(categoryId, cat);

  // Step 4: Knockout
  html += renderKnockoutSection(categoryId, cat);

  return html;
}

function renderParticipantsSection(categoryId, cat) {
  const participants = store.getParticipants(categoryId);
  const isSingles = cat.type === 'singles';

  return `
    <div class="admin-section" id="section-participants">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">1</span>
          <span>Manage Participants (${participants.length})</span>
        </div>
        <div class="admin-actions">
          <button class="btn btn-accent btn-sm" id="btn-add-participant">
            <i class='bx bx-plus'></i> Add ${isSingles ? 'Player' : 'Team'}
          </button>
        </div>
      </div>

      ${participants.length === 0 ? `
        <div class="empty-state" style="padding: var(--space-xl);">
          <div class="empty-state-icon"><i class='bx ${isSingles ? 'bx-user' : 'bx-group'}'></i></div>
          <div class="empty-state-title">No ${isSingles ? 'Players' : 'Teams'} Yet</div>
          <div class="empty-state-text">Click the button above to add ${isSingles ? 'players' : 'teams'} to ${cat.name}.</div>
        </div>
      ` : `
        <div class="participant-list">
          ${participants.map((p, idx) => `
            <div class="participant-item">
              <div class="participant-info">
                <span class="participant-number">${idx + 1}.</span>
                <div>
                  <div class="participant-name">${p.teamName || p.name}</div>
                  ${!isSingles && p.player1 ? `
                    <div class="participant-detail">${p.player1} & ${p.player2 || '?'}</div>
                  ` : ''}
                </div>
              </div>
              <button class="btn btn-icon btn-danger" onclick="window.removeParticipant('${categoryId}', '${p.id}')" title="Remove">
                <i class='bx bx-x'></i>
              </button>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function renderGroupsSection(categoryId, cat) {
  const groups = store.getGroups(categoryId);
  const participants = store.getParticipants(categoryId);
  const hasEnoughParticipants = participants.length >= 3;

  return `
    <div class="admin-section" id="section-groups">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">2</span>
          <span>Groups (${groups.length})</span>
        </div>
        <div class="admin-actions">
          ${groups.length === 0 ? `
            <div class="input-row" style="align-items: center;">
              <div class="input-group" style="min-width: 120px;">
                <label class="input-label">Group Size</label>
                <select class="select" id="group-size-select">
                  <option value="3">3 per group</option>
                  <option value="4" selected>4 per group</option>
                  <option value="5">5 per group</option>
                </select>
              </div>
              <button class="btn btn-accent btn-sm" id="btn-generate-groups" ${!hasEnoughParticipants ? 'disabled' : ''}>
                <i class='bx bx-shuffle'></i> Generate Groups
              </button>
            </div>
          ` : `
            <button class="btn btn-danger btn-sm" id="btn-clear-groups">
              <i class='bx bx-trash'></i> Clear Groups
            </button>
          `}
        </div>
      </div>

      ${!hasEnoughParticipants && groups.length === 0 ? `
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Add at least 3 participants first to generate groups.
        </p>
      ` : ''}

      ${groups.length > 0 ? `
        <div class="groups-grid">
          ${groups.map(group => {
            const groupParticipants = group.participantIds.map(id => store.getParticipantById(categoryId, id)).filter(Boolean);
            return `
              <div class="group-card">
                <div class="group-card-header">
                  <span class="group-name">${group.name}</span>
                  <span class="group-count">${groupParticipants.length} players</span>
                </div>
                ${renderGroupStandings(categoryId, group.id)}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderMatchesSection(categoryId, cat) {
  const groups = store.getGroups(categoryId);

  if (groups.length === 0) {
    return `
      <div class="admin-section" id="section-matches">
        <div class="admin-section-header">
          <div class="admin-section-title">
            <span class="step-number">3</span>
            <span>Group Matches</span>
          </div>
        </div>
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Generate groups first to see matches.
        </p>
      </div>
    `;
  }

  let totalMatches = 0;
  let completedMatches = 0;
  for (const group of groups) {
    totalMatches += group.matches.length;
    completedMatches += group.matches.filter(m => m.status === 'completed').length;
  }

  let html = `
    <div class="admin-section" id="section-matches">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">3</span>
          <span>Group Matches (${completedMatches}/${totalMatches} completed)</span>
        </div>
        <div class="admin-actions">
          <button class="btn btn-outline btn-sm" id="btn-schedule-matches">Set times &amp; courts</button>
        </div>
      </div>
      <p class="admin-hint">Set a match live when it starts. Pick a winner to complete it — scores are optional. Knockout winners move on automatically.</p>
  `;

  for (const group of groups) {
    html += `
      <div style="margin-bottom: var(--space-xl);">
        <h3 style="margin-bottom: var(--space-md); color: var(--neon);">${group.name}</h3>
        <div class="match-grid">
          ${group.matches.map(match => 
            renderMatchCard(categoryId, match, { isAdmin: true, groupId: group.id })
          ).join('')}
        </div>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

function renderKnockoutSection(categoryId, cat) {
  const groups = store.getGroups(categoryId);
  const knockout = store.getKnockout(categoryId);
  const hasKnockout = knockout.rounds && knockout.rounds.length > 0;

  // Check if all group matches are completed
  let allGroupsDone = groups.length > 0;
  for (const group of groups) {
    if (group.matches.some(m => m.status !== 'completed')) {
      allGroupsDone = false;
      break;
    }
  }

  return `
    <div class="admin-section" id="section-knockout">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">4</span>
          <span>Knockout Stage</span>
        </div>
        <div class="admin-actions">
          ${!hasKnockout && groups.length > 0 ? `
            <div class="input-row" style="align-items: center;">
              <div class="input-group" style="min-width: 140px;">
                <label class="input-label">Qualifiers/Group</label>
                <select class="select" id="qualify-count-select">
                  <option value="1">Top 1</option>
                  <option value="2" selected>Top 2</option>
                  <option value="3">Top 3</option>
                </select>
              </div>
              <button class="btn btn-accent btn-sm" id="btn-generate-knockout" ${!allGroupsDone ? 'disabled title="Complete all group matches first"' : ''}>
                <i class='bx bx-trophy'></i> Generate Bracket
              </button>
            </div>
          ` : ''}
          ${hasKnockout ? `
            <button class="btn btn-danger btn-sm" id="btn-clear-knockout">
              <i class='bx bx-trash'></i> Clear Bracket
            </button>
          ` : ''}
        </div>
      </div>

      ${!allGroupsDone && !hasKnockout && groups.length > 0 ? `
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Complete all group stage matches to generate the knockout bracket.
        </p>
      ` : ''}

      ${groups.length === 0 && !hasKnockout ? `
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Set up groups and complete group matches first.
        </p>
      ` : ''}

      ${hasKnockout ? renderBracket(categoryId, true) : ''}
    </div>
  `;
}

// --- Re-render helper ---
function refreshAdminContent() {
  const content = document.getElementById('admin-content');
  if (content) {
    content.innerHTML = renderAdminContent(currentCategory);
    bindAdminContentEvents();
  }
}

function bindSettingsEvents() {
  const saveBtn = document.getElementById('btn-save-settings');
  if (!saveBtn) return;
  saveBtn.addEventListener('click', () => {
    store.updateSettings({
      tournamentName: document.getElementById('setting-name')?.value?.trim() || '',
      level: document.getElementById('setting-level')?.value?.trim() || '',
      tournamentDate: document.getElementById('setting-date')?.value?.trim() || '',
      tournamentTime: document.getElementById('setting-time')?.value?.trim() || '',
      venueShort: document.getElementById('setting-venue-short')?.value?.trim() || '',
      venue: document.getElementById('setting-venue')?.value?.trim() || '',
      shuttles: document.getElementById('setting-shuttles')?.value?.trim() || '',
      courts: parseInt(document.getElementById('setting-courts')?.value || '2', 10) || 2,
      mapsQuery: document.getElementById('setting-maps')?.value?.trim() || ''
    });
    showToast('Event details saved', 'success');
  });
}

function bindAdminContentEvents() {
  const addBtn = document.getElementById('btn-add-participant');
  if (addBtn) {
    addBtn.addEventListener('click', () => openAddParticipantModal(currentCategory));
  }

  // Generate groups button
  const genGroupsBtn = document.getElementById('btn-generate-groups');
  if (genGroupsBtn) {
    genGroupsBtn.addEventListener('click', () => {
      const sizeSelect = document.getElementById('group-size-select');
      const groupSize = parseInt(sizeSelect?.value || '4');
      store.generateGroups(currentCategory, groupSize);
      showToast('Groups generated successfully!', 'success');
      refreshAdminContent();
    });
  }

  // Clear groups button
  const clearGroupsBtn = document.getElementById('btn-clear-groups');
  if (clearGroupsBtn) {
    clearGroupsBtn.addEventListener('click', () => {
      showConfirm({
        title: 'Clear Groups',
        message: 'This will delete all groups, matches, scores, and the knockout bracket for this category. Are you sure?',
        onConfirm: () => {
          store.clearGroups(currentCategory);
          showToast('Groups cleared', 'info');
          refreshAdminContent();
        },
        danger: true,
        confirmLabel: 'Clear All'
      });
    });
  }

  // Generate knockout button
  const genKoBtn = document.getElementById('btn-generate-knockout');
  if (genKoBtn) {
    genKoBtn.addEventListener('click', () => {
      const qualSelect = document.getElementById('qualify-count-select');
      const qualifyCount = parseInt(qualSelect?.value || '2');
      store.generateKnockout(currentCategory, qualifyCount);
      showToast('Knockout bracket generated!', 'success');
      refreshAdminContent();
    });
  }

  const scheduleBtn = document.getElementById('btn-schedule-matches');
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', () => openBulkScheduleModal(currentCategory));
  }

  // Clear knockout button
  const clearKoBtn = document.getElementById('btn-clear-knockout');
  if (clearKoBtn) {
    clearKoBtn.addEventListener('click', () => {
      showConfirm({
        title: 'Clear Knockout',
        message: 'This will remove the entire knockout bracket. Are you sure?',
        onConfirm: () => {
          store.clearKnockout(currentCategory);
          showToast('Knockout bracket cleared', 'info');
          refreshAdminContent();
        },
        danger: true,
        confirmLabel: 'Clear Bracket'
      });
    });
  }
}

function openAddParticipantModal(categoryId) {
  const cat = store.getCategory(categoryId);
  const isSingles = cat.type === 'singles';

  let content;
  if (isSingles) {
    content = `
      <div class="input-group">
        <label class="input-label">Player Name</label>
        <input type="text" class="input" id="input-player-name" placeholder="Enter player name" />
      </div>
    `;
  } else {
    content = `
      <div class="input-group">
        <label class="input-label">Team Name</label>
        <input type="text" class="input" id="input-team-name" placeholder="Enter team name" />
      </div>
      <div class="input-group">
        <label class="input-label">Player 1</label>
        <input type="text" class="input" id="input-player1" placeholder="Enter player 1 name" />
      </div>
      <div class="input-group">
        <label class="input-label">Player 2</label>
        <input type="text" class="input" id="input-player2" placeholder="Enter player 2 name" />
      </div>
    `;
  }

  showModal({
    title: `Add ${isSingles ? 'Player' : 'Team'} — ${cat.name}`,
    content,
    submitLabel: `Add ${isSingles ? 'Player' : 'Team'}`,
    onSubmit: () => {
      if (isSingles) {
        const name = document.getElementById('input-player-name')?.value?.trim();
        if (!name) {
          showToast('Please enter a player name', 'error');
          return;
        }
        store.addParticipant(categoryId, { name });
        showToast(`${name} added!`, 'success');
      } else {
        const teamName = document.getElementById('input-team-name')?.value?.trim();
        const player1 = document.getElementById('input-player1')?.value?.trim();
        const player2 = document.getElementById('input-player2')?.value?.trim();
        if (!teamName) {
          showToast('Please enter a team name', 'error');
          return;
        }
        store.addParticipant(categoryId, { teamName, player1, player2 });
        showToast(`${teamName} added!`, 'success');
      }
      closeModal();
      refreshAdminContent();
    }
  });
}

function getFixture(categoryId, stage, loc, matchId) {
  if (stage === 'knockout') {
    const round = store.getKnockout(categoryId).rounds[loc];
    return { match: round?.matches.find(m => m.id === matchId), roundName: round?.name || 'Knockout' };
  }
  const group = store.getGroups(categoryId).find(g => g.id === loc);
  return { match: group?.matches.find(m => m.id === matchId), roundName: group?.name || 'Group' };
}

function playerName(categoryId, participantId, fallback) {
  const p = store.getParticipantById(categoryId, participantId);
  return p ? (p.teamName || p.name) : fallback;
}

function openBulkScheduleModal(categoryId) {
  const settings = store.getSettings();
  showModal({
    title: 'Set times & courts',
    content: `
      <p class="admin-hint" style="margin-top:0">Fills every ready match in this category, court by court.</p>
      <div class="input-group">
        <label class="input-label">First match</label>
        <input type="time" class="input" id="bulk-start-time" value="09:00" />
      </div>
      <div class="input-group">
        <label class="input-label">Minutes between slots</label>
        <input type="number" class="input" id="bulk-interval" min="5" max="60" value="15" />
      </div>
      <div class="input-group">
        <label class="input-label">Courts in use</label>
        <input type="number" class="input" id="bulk-courts" min="1" max="8" value="${settings.courts || 2}" />
      </div>
    `,
    submitLabel: 'Assign times',
    onSubmit: () => {
      store.scheduleCategoryMatches(categoryId, {
        startTime: document.getElementById('bulk-start-time')?.value || '09:00',
        intervalMins: parseInt(document.getElementById('bulk-interval')?.value || '15', 10),
        courts: parseInt(document.getElementById('bulk-courts')?.value || '2', 10)
      });
      closeModal();
      showToast('Match times assigned', 'success');
      refreshAdminContent();
    }
  });
}

// --- Global handlers (called from match card onclick) ---

window.removeParticipant = function(categoryId, participantId) {
  const p = store.getParticipantById(categoryId, participantId);
  const name = p ? (p.teamName || p.name) : 'this participant';
  showConfirm({
    title: 'Remove Participant',
    message: `Are you sure you want to remove <strong>${name}</strong>?`,
    onConfirm: () => {
      store.removeParticipant(categoryId, participantId);
      showToast(`${name} removed`, 'info');
      refreshAdminContent();
    },
    danger: true,
    confirmLabel: 'Remove'
  });
};

window.setFixtureLive = function(categoryId, stage, loc, matchId) {
  if (stage === 'knockout') store.setKnockoutLive(categoryId, loc, matchId);
  else store.setMatchLive(categoryId, loc, matchId);
  showToast('Match is live', 'success');
  refreshAdminContent();
};

window.openScheduleModal = function(categoryId, stage, loc, matchId) {
  const { match } = getFixture(categoryId, stage, loc, matchId);
  if (!match) return;
  const courts = store.getSettings().courts || 2;

  showModal({
    title: 'Match time & court',
    content: `
      <div class="input-group">
        <label class="input-label">Start time</label>
        <input type="time" class="input" id="fixture-time" value="${match.scheduledTime || ''}" />
      </div>
      <div class="input-group">
        <label class="input-label">Court</label>
        <select class="select" id="fixture-court">
          <option value="">Not set</option>
          ${Array.from({ length: courts }, (_, i) => `
            <option value="${i + 1}" ${String(match.court) === String(i + 1) ? 'selected' : ''}>Court ${i + 1}</option>
          `).join('')}
        </select>
      </div>
    `,
    submitLabel: 'Save',
    onSubmit: () => {
      const payload = {
        scheduledTime: document.getElementById('fixture-time')?.value || '',
        court: document.getElementById('fixture-court')?.value || ''
      };
      if (stage === 'knockout') store.updateKnockoutSchedule(categoryId, loc, matchId, payload);
      else store.updateMatchSchedule(categoryId, loc, matchId, payload);
      closeModal();
      showToast('Schedule updated', 'success');
      refreshAdminContent();
    }
  });
};

window.openResultModal = function(categoryId, stage, loc, matchId) {
  const { match, roundName } = getFixture(categoryId, stage, loc, matchId);
  if (!match) return;

  const name1 = playerName(categoryId, match.player1Id, 'Player 1');
  const name2 = playerName(categoryId, match.player2Id, 'Player 2');
  const knockout = stage === 'knockout';

  showModal({
    title: `${roundName} — pick winner`,
    content: `
      <p class="result-modal-hint">Tap the winner. Scores are optional.</p>
      <div class="winner-pick" id="winner-pick">
        <button type="button" class="winner-pick-btn" data-winner="${match.player1Id}">${name1}</button>
        <button type="button" class="winner-pick-btn" data-winner="${match.player2Id}">${name2}</button>
      </div>
      <div class="score-input-group result-scores">
        <div>
          <label class="input-label">${name1}</label>
          <input type="number" class="score-input" id="result-score-1" min="0" max="99" value="${match.score1 ?? ''}" />
        </div>
        <span class="score-vs">–</span>
        <div>
          <label class="input-label">${name2}</label>
          <input type="number" class="score-input" id="result-score-2" min="0" max="99" value="${match.score2 ?? ''}" />
        </div>
      </div>
      ${knockout ? '<p class="text-muted result-modal-note">No draws in knockout — the winner moves on.</p>' : `
        <button type="button" class="btn btn-outline w-full" id="btn-record-draw">Record draw</button>
      `}
    `,
    submitLabel: 'Save result',
    onSubmit: () => {
      const selected = document.querySelector('.winner-pick-btn.is-selected')?.dataset.winner;
      const s1 = document.getElementById('result-score-1')?.value;
      const s2 = document.getElementById('result-score-2')?.value;
      if (!selected && (s1 === '' || s2 === '')) {
        showToast('Pick a winner or enter both scores', 'error');
        return;
      }
      if (knockout && s1 !== '' && s2 !== '' && s1 === s2 && !selected) {
        showToast('Knockout matches cannot be a draw', 'error');
        return;
      }
      const payload = { winnerId: selected || undefined, score1: s1, score2: s2 };
      const ok = knockout
        ? store.completeKnockoutMatch(categoryId, loc, matchId, payload)
        : store.completeGroupMatch(categoryId, loc, matchId, payload);
      if (!ok) {
        showToast('Could not save that result', 'error');
        return;
      }
      closeModal();
      showToast(knockout ? 'Winner advances' : 'Result saved', 'success');
      refreshAdminContent();
    }
  });

  const pick = document.getElementById('winner-pick');
  pick?.addEventListener('click', (e) => {
    const btn = e.target.closest('.winner-pick-btn');
    if (!btn) return;
    pick.querySelectorAll('.winner-pick-btn').forEach(b => b.classList.toggle('is-selected', b === btn));
  });

  document.getElementById('btn-record-draw')?.addEventListener('click', () => {
    store.completeGroupMatch(categoryId, loc, matchId, {
      winnerId: null,
      score1: document.getElementById('result-score-1')?.value,
      score2: document.getElementById('result-score-2')?.value
    });
    closeModal();
    showToast('Draw recorded', 'success');
    refreshAdminContent();
  });
};

window.resetFixture = function(categoryId, stage, loc, matchId) {
  showConfirm({
    title: 'Reset match',
    message: stage === 'knockout'
      ? 'Clear this result and remove the winner from later rounds?'
      : 'Clear this result and set the match back to upcoming?',
    onConfirm: () => {
      if (stage === 'knockout') store.resetKnockoutMatch(categoryId, loc, matchId);
      else store.resetMatch(categoryId, loc, matchId);
      showToast('Match reset', 'info');
      refreshAdminContent();
    },
    confirmLabel: 'Reset'
  });
};

window.setMatchLive = (categoryId, groupId, matchId) => window.setFixtureLive(categoryId, 'group', groupId, matchId);
window.openScoreModal = (categoryId, groupId, matchId) => window.openResultModal(categoryId, 'group', groupId, matchId);
window.resetMatchScore = (categoryId, groupId, matchId) => window.resetFixture(categoryId, 'group', groupId, matchId);
window.openKnockoutScoreModal = (categoryId, roundIndex, matchId) => window.openResultModal(categoryId, 'knockout', roundIndex, matchId);

export function initAdminPage() {
  if (!isAuthenticated) {
    // Login handler
    const loginBtn = document.getElementById('btn-admin-login');
    const passwordInput = document.getElementById('admin-password-input');
    const errorDiv = document.getElementById('password-error');

    const doLogin = () => {
      const pwd = passwordInput?.value || '';
      if (store.checkPassword(pwd)) {
        isAuthenticated = true;
        sessionStorage.setItem('loveall_admin', '1');
        const app = document.getElementById('app');
        if (app) {
          const { renderNavbar, initNavbar } = require_navbar();
          app.innerHTML = renderNavbar('/admin') + renderAdminPage();
          initNavbar();
          initAdminPage();
        }
      } else {
        if (errorDiv) {
          errorDiv.textContent = 'Incorrect password. Try again.';
          errorDiv.classList.remove('hidden');
        }
        passwordInput?.classList.add('shake');
        setTimeout(() => passwordInput?.classList.remove('shake'), 500);
      }
    };

    if (loginBtn) loginBtn.addEventListener('click', doLogin);
    if (passwordInput) {
      passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLogin();
      });
    }
    return;
  }

  // Tab switching
  const tabs = document.querySelectorAll('#admin-tabs .tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentCategory = tab.dataset.category;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      refreshAdminContent();
    });
  });

  // Toolbar buttons
  const exportBtn = document.getElementById('btn-export-data');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const data = store.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loveall_tournament_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported!', 'success');
    });
  }

  const importBtn = document.getElementById('btn-import-data');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const success = store.importData(ev.target.result);
          if (success) {
            showToast('Data imported successfully!', 'success');
            const app = document.getElementById('app');
            if (app) {
              const { renderNavbar, initNavbar } = require_navbar();
              app.innerHTML = renderNavbar('/admin') + renderAdminPage();
              initNavbar();
              initAdminPage();
            }
          } else {
            showToast('Invalid data file', 'error');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  const resetBtn = document.getElementById('btn-reset-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      showConfirm({
        title: 'Reset All Data',
        message: 'This will permanently delete ALL tournament data including participants, groups, matches, and scores. This cannot be undone!',
        onConfirm: () => {
          store.reset();
          showToast('All data has been reset', 'info');
          const app = document.getElementById('app');
          if (app) {
            const { renderNavbar, initNavbar } = require_navbar();
            app.innerHTML = renderNavbar('/admin') + renderAdminPage();
            initNavbar();
            initAdminPage();
          }
        },
        danger: true,
        confirmLabel: 'Reset Everything'
      });
    });
  }

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      isAuthenticated = false;
      sessionStorage.removeItem('loveall_admin');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
  }

  bindSettingsEvents();
  bindAdminContentEvents();
  bindAdminSync();
}

let onAdminChange = null;
let publishTimer = null;

function bindAdminSync() {
  if (onAdminChange) store.off('change', onAdminChange);
  onAdminChange = () => {
    clearTimeout(publishTimer);
    publishTimer = setTimeout(async () => {
      const ok = await publishTournament();
      const status = document.getElementById('live-sync-status');
      if (status) {
        status.textContent = ok ? 'Live board published' : 'Saved on this device — live board not connected';
        status.classList.toggle('is-live', ok);
      }
    }, 350);
  };
  store.on('change', onAdminChange);
  startLiveSync({ isAdmin: true });
  onAdminChange();
}

// Helper to lazily import navbar (avoid circular deps)
function require_navbar() {
  // This is a workaround; main.js handles the actual rendering
  return {
    renderNavbar: (path) => {
      const { renderNavbar } = window.__navbarModule || {};
      return renderNavbar ? renderNavbar(path) : '';
    },
    initNavbar: () => {
      const { initNavbar } = window.__navbarModule || {};
      if (initNavbar) initNavbar();
    }
  };
}

export function isAdminAuthenticated() {
  return isAuthenticated;
}
