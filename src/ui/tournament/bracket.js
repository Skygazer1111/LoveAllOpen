/**
 * Knockout Bracket Component
 */

import { store, getParticipantDisplayName } from '../../data/store.js';
import { renderMatchMeta } from './match-card.js';

export function renderBracket(categoryId, isAdmin = false) {
  const knockout = store.getKnockout(categoryId);

  if (!knockout.rounds || knockout.rounds.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-title">No knockout stage yet</div>
        <div class="empty-state-text">The bracket appears here once group winners are through.</div>
      </div>
    `;
  }

  return `
    <div class="bracket-container">
      <div class="bracket">
        ${knockout.rounds.map((round, roundIdx) => `
          <div class="bracket-round">
            <div class="bracket-round-title">${round.name}</div>
            ${round.matches.map(match => {
              const p1 = match.player1Id ? store.getParticipantById(categoryId, match.player1Id) : null;
              const p2 = match.player2Id ? store.getParticipantById(categoryId, match.player2Id) : null;
              const name1 = getParticipantDisplayName(p1);
              const name2 = getParticipantDisplayName(p2);
              const p1Winner = match.status === 'completed' && match.winner === match.player1Id;
              const p2Winner = match.status === 'completed' && match.winner === match.player2Id;
              const when = renderMatchMeta(match);
              const ready = match.player1Id && match.player2Id;
              const ref = `'${categoryId}', 'knockout', ${roundIdx}, '${match.id}'`;

              return `
                <div class="bracket-match ${match.status === 'live' ? 'is-live' : ''}" id="ko-match-${match.id}">
                  ${when ? `<div class="bracket-match-when">${when}</div>` : ''}
                  <div class="bracket-player ${p1Winner ? 'winner' : ''}">
                    <span class="bracket-player-name ${!p1 ? 'tbd' : ''}">${name1}</span>
                    <span class="bracket-player-score">${match.score1 !== null ? match.score1 : ''}</span>
                  </div>
                  <div class="bracket-player ${p2Winner ? 'winner' : ''}">
                    <span class="bracket-player-name ${!p2 ? 'tbd' : ''}">${name2}</span>
                    <span class="bracket-player-score">${match.score2 !== null ? match.score2 : ''}</span>
                  </div>
                  ${isAdmin && ready && match.status !== 'completed' ? `
                    <div class="bracket-match-actions">
                      ${match.status === 'upcoming' ? `
                        <button class="btn btn-sm btn-outline" onclick="window.setFixtureLive(${ref})">Live</button>
                      ` : ''}
                      <button class="btn btn-sm btn-outline" onclick="window.openScheduleModal(${ref})">Time</button>
                      <button class="btn btn-sm btn-accent" onclick="window.openResultModal(${ref})">Winner</button>
                    </div>
                  ` : ''}
                  ${isAdmin && match.status === 'completed' ? `
                    <div class="bracket-match-actions">
                      <button class="btn btn-sm btn-outline" onclick="window.resetFixture(${ref})">Reset</button>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
