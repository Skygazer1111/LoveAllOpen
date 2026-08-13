/**
 * Match Card Component
 */

import { store, formatMatchTime, getParticipantDisplayName } from '../../data/store.js';

export function renderMatchMeta(match) {
  const bits = [];
  if (match.scheduledTime) bits.push(formatMatchTime(match.scheduledTime));
  if (match.court) bits.push(`Court ${match.court}`);
  return bits.join(' · ');
}

export function renderMatchCard(categoryId, match, options = {}) {
  const {
    showGroup = false,
    groupName = '',
    isAdmin = false,
    groupId = '',
    stage = 'group',
    roundIndex = null,
    label = ''
  } = options;

  const p1 = store.getParticipantById(categoryId, match.player1Id);
  const p2 = store.getParticipantById(categoryId, match.player2Id);
  const name1 = getParticipantDisplayName(p1);
  const name2 = getParticipantDisplayName(p2);
  const stageLabel = label || groupName;
  const when = renderMatchMeta(match);

  const statusBadge = {
    upcoming: '<span class="badge badge-upcoming">Upcoming</span>',
    live: '<span class="badge badge-live">● Live</span>',
    completed: '<span class="badge badge-completed">Completed</span>'
  }[match.status] || '';

  const isCompleted = match.status === 'completed';
  const p1Winner = isCompleted && match.winner === match.player1Id;
  const p2Winner = isCompleted && match.winner === match.player2Id;
  const isDraw = isCompleted && !match.winner;
  const ready = Boolean(match.player1Id && match.player2Id);
  const ref = stage === 'knockout'
    ? `'${categoryId}', 'knockout', ${roundIndex}, '${match.id}'`
    : `'${categoryId}', 'group', '${groupId}', '${match.id}'`;

  return `
    <div class="match-card ${match.status === 'live' ? 'is-live' : ''}" id="match-${match.id}">
      <div class="match-card-header">
        <span class="match-card-meta">${stageLabel ? `${stageLabel} · ` : ''}Match ${match.matchNumber}</span>
        ${statusBadge}
      </div>
      ${when ? `<p class="match-card-when">${when}</p>` : ''}
      <div class="match-card-players">
        <div class="match-player ${p1Winner ? 'winner' : ''}">
          <span class="match-player-name">${name1}</span>
          <span class="match-player-score">${match.score1 !== null ? match.score1 : '-'}</span>
        </div>
        <div class="match-vs">${isDraw ? 'DRAW' : 'VS'}</div>
        <div class="match-player ${p2Winner ? 'winner' : ''}">
          <span class="match-player-name">${name2}</span>
          <span class="match-player-score">${match.score2 !== null ? match.score2 : '-'}</span>
        </div>
      </div>
      ${isAdmin && ready ? `
        <div class="match-card-actions">
          ${match.status === 'upcoming' ? `
            <button class="btn btn-sm btn-outline" onclick="window.setFixtureLive(${ref})">Set live</button>
          ` : ''}
          ${match.status !== 'completed' ? `
            <button class="btn btn-sm btn-outline" onclick="window.openScheduleModal(${ref})">Time</button>
            <button class="btn btn-sm btn-accent" onclick="window.openResultModal(${ref})">Pick winner</button>
          ` : `
            <button class="btn btn-sm btn-outline" onclick="window.resetFixture(${ref})">Reset</button>
          `}
        </div>
      ` : ''}
    </div>
  `;
}
