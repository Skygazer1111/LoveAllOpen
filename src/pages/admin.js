/**
 * Admin Page — Tournament Management Dashboard
 */

import { store } from '../store.js';
import { showModal, closeModal, showConfirm, showToast } from '../components/modal.js';
import { renderGroupStandings } from '../components/groupTable.js';
import { renderMatchCard } from '../components/matchCard.js';
import { renderBracket } from '../components/bracket.js';

let isAuthenticated = false;
let currentCategory = 'mens-singles';

export function renderAdminPage() {
  if (!isAuthenticated) {
    return renderLoginScreen();
  }

  const categories = store.getCategories();
  const cat = categories[currentCategory];

  return `
    <div class="page" id="admin-page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">⚙️ Admin Dashboard</h1>
          <p class="page-subtitle">Manage participants, fixtures, and scores</p>
        </div>

        <!-- Toolbar -->
        <div class="admin-toolbar">
          <div class="admin-toolbar-actions">
            <button class="btn btn-outline btn-sm" id="btn-export-data">📥 Export Data</button>
            <button class="btn btn-outline btn-sm" id="btn-import-data">📤 Import Data</button>
            <button class="btn btn-danger btn-sm" id="btn-reset-data">🗑️ Reset All</button>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-logout">🚪 Logout</button>
        </div>

        <!-- Category Tabs -->
        <div class="tabs" id="admin-tabs">
          ${Object.values(categories).map(c => `
            <button class="tab ${c.id === currentCategory ? 'active' : ''}" 
                    data-category="${c.id}"
                    id="admin-tab-${c.id}">
              ${c.name}
            </button>
          `).join('')}
        </div>

        <!-- Admin Content -->
        <div id="admin-content">
          ${renderAdminContent(currentCategory)}
        </div>
      </div>
    </div>
  `;
}

function renderLoginScreen() {
  return `
    <div class="page">
      <div class="password-screen">
        <div class="password-card">
          <img src="/images/icon.png" alt="LoveAll Club" class="hero-logo" />
          <h2>Admin Access</h2>
          <p>Enter the admin password to manage the tournament</p>
          <div class="input-group">
            <input type="password" class="input w-full" id="admin-password-input" 
                   placeholder="Enter password" autocomplete="off" />
          </div>
          <div id="password-error" class="password-error hidden"></div>
          <button class="btn btn-accent w-full mt-lg" id="btn-admin-login" style="margin-top: var(--space-md);">
            🔓 Login
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
            + Add ${isSingles ? 'Player' : 'Team'}
          </button>
        </div>
      </div>

      ${participants.length === 0 ? `
        <div class="empty-state" style="padding: var(--space-xl);">
          <div class="empty-state-icon">${isSingles ? '🧑' : '👥'}</div>
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
                ✕
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
                ✨ Generate Groups
              </button>
            </div>
          ` : `
            <button class="btn btn-danger btn-sm" id="btn-clear-groups">
              🗑️ Clear Groups
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
      </div>
  `;

  for (const group of groups) {
    html += `
      <div style="margin-bottom: var(--space-xl);">
        <h3 style="margin-bottom: var(--space-md); color: var(--color-accent);">${group.name}</h3>
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
                🏆 Generate Bracket
              </button>
            </div>
          ` : ''}
          ${hasKnockout ? `
            <button class="btn btn-danger btn-sm" id="btn-clear-knockout">
              🗑️ Clear Bracket
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

function bindAdminContentEvents() {
  // Add participant button
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

window.setMatchLive = function(categoryId, groupId, matchId) {
  store.setMatchLive(categoryId, groupId, matchId);
  showToast('Match set to live!', 'success');
  refreshAdminContent();
};

window.openScoreModal = function(categoryId, groupId, matchId) {
  const group = store.getGroups(categoryId).find(g => g.id === groupId);
  const match = group?.matches.find(m => m.id === matchId);
  if (!match) return;

  const p1 = store.getParticipantById(categoryId, match.player1Id);
  const p2 = store.getParticipantById(categoryId, match.player2Id);
  const name1 = p1 ? (p1.teamName || p1.name) : 'Player 1';
  const name2 = p2 ? (p2.teamName || p2.name) : 'Player 2';

  showModal({
    title: 'Enter Score',
    content: `
      <div class="score-input-group" style="justify-content: center; padding: var(--space-md) 0;">
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.9rem;">${name1}</div>
          <input type="number" class="score-input" id="score-input-1" min="0" max="99" value="${match.score1 !== null ? match.score1 : ''}" />
        </div>
        <span class="score-vs">VS</span>
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.9rem;">${name2}</div>
          <input type="number" class="score-input" id="score-input-2" min="0" max="99" value="${match.score2 !== null ? match.score2 : ''}" />
        </div>
      </div>
    `,
    submitLabel: 'Save Score',
    onSubmit: () => {
      const s1 = document.getElementById('score-input-1')?.value;
      const s2 = document.getElementById('score-input-2')?.value;
      if (s1 === '' || s2 === '') {
        showToast('Please enter both scores', 'error');
        return;
      }
      store.updateMatchScore(categoryId, groupId, matchId, s1, s2);
      closeModal();
      showToast('Score saved!', 'success');
      refreshAdminContent();
    }
  });
};

window.resetMatchScore = function(categoryId, groupId, matchId) {
  showConfirm({
    title: 'Reset Match',
    message: 'Reset this match score and status?',
    onConfirm: () => {
      store.resetMatch(categoryId, groupId, matchId);
      showToast('Match reset', 'info');
      refreshAdminContent();
    },
    confirmLabel: 'Reset'
  });
};

window.openKnockoutScoreModal = function(categoryId, roundIndex, matchId) {
  const knockout = store.getKnockout(categoryId);
  const round = knockout.rounds[roundIndex];
  const match = round?.matches.find(m => m.id === matchId);
  if (!match) return;

  const p1 = store.getParticipantById(categoryId, match.player1Id);
  const p2 = store.getParticipantById(categoryId, match.player2Id);
  const name1 = p1 ? (p1.teamName || p1.name) : 'Player 1';
  const name2 = p2 ? (p2.teamName || p2.name) : 'Player 2';

  showModal({
    title: `${round.name} — Enter Score`,
    content: `
      <div class="score-input-group" style="justify-content: center; padding: var(--space-md) 0;">
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.9rem;">${name1}</div>
          <input type="number" class="score-input" id="ko-score-1" min="0" max="99" value="" />
        </div>
        <span class="score-vs">VS</span>
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.9rem;">${name2}</div>
          <input type="number" class="score-input" id="ko-score-2" min="0" max="99" value="" />
        </div>
      </div>
      <p class="text-muted" style="text-align: center; font-size: 0.8rem;">Scores cannot be tied in knockout. Winner advances.</p>
    `,
    submitLabel: 'Save Score',
    onSubmit: () => {
      const s1 = document.getElementById('ko-score-1')?.value;
      const s2 = document.getElementById('ko-score-2')?.value;
      if (s1 === '' || s2 === '') {
        showToast('Please enter both scores', 'error');
        return;
      }
      if (s1 === s2) {
        showToast('Knockout matches cannot be a draw!', 'error');
        return;
      }
      store.updateKnockoutMatch(categoryId, roundIndex, matchId, s1, s2);
      closeModal();
      showToast('Score saved! Winner advances.', 'success');
      refreshAdminContent();
    }
  });
};

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
        // Re-render the whole admin page
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
            refreshAdminContent();
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
          refreshAdminContent();
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
      // Trigger re-render via hash change trick
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
  }

  // Bind content-specific events
  bindAdminContentEvents();
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
