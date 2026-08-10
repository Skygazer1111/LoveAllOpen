/**
 * Match Card Component
 */

import { store } from '../../data/store.js';

export function renderMatchCard(categoryId, match, options = {}) {
  const { showGroup = false, groupName = '', isAdmin = false, groupId = '' } = options;
  const p1 = store.getParticipantById(categoryId, match.player1Id);
  const p2 = store.getParticipantById(categoryId, match.player2Id);

  const name1 = p1 ? (p1.teamName || p1.name) : 'TBD';
  const name2 = p2 ? (p2.teamName || p2.name) : 'TBD';

  const statusBadge = {
    upcoming: '<span class="badge badge-upcoming">Upcoming</span>',
    live: '<span class="badge badge-live">● Live</span>',
    completed: '<span class="badge badge-completed">Completed</span>'
  }[match.status] || '';

  const isCompleted = match.status === 'completed';
  const p1Winner = isCompleted && match.winner === match.player1Id;
  const p2Winner = isCompleted && match.winner === match.player2Id;

  return `
    <div class="match-card" id="match-${match.id}">
      <div class="match-card-header">
        <span class="match-card-meta">${showGroup && groupName ? groupName + ' · ' : ''}Match ${match.matchNumber}</span>
        ${statusBadge}
      </div>
      <div class="match-card-players">
        <div class="match-player ${p1Winner ? 'winner' : ''}">
          <span class="match-player-name">${name1}</span>
          <span class="match-player-score">${match.score1 !== null ? match.score1 : '-'}</span>
        </div>
        <div class="match-vs">VS</div>
        <div class="match-player ${p2Winner ? 'winner' : ''}">
          <span class="match-player-name">${name2}</span>
          <span class="match-player-score">${match.score2 !== null ? match.score2 : '-'}</span>
        </div>
      </div>
      ${isAdmin && match.player1Id && match.player2Id ? `
        <div style="margin-top: var(--space-md); display: flex; gap: var(--space-sm); justify-content: flex-end;">
          ${match.status === 'upcoming' ? `
            <button class="btn btn-sm btn-outline" onclick="window.setMatchLive('${categoryId}', '${groupId}', '${match.id}')">Set Live</button>
          ` : ''}
          ${match.status !== 'completed' ? `
            <button class="btn btn-sm btn-primary" onclick="window.openScoreModal('${categoryId}', '${groupId}', '${match.id}')">Enter Score</button>
          ` : `
            <button class="btn btn-sm btn-outline" onclick="window.resetMatchScore('${categoryId}', '${groupId}', '${match.id}')">Reset</button>
          `}
        </div>
      ` : ''}
    </div>
  `;
}
