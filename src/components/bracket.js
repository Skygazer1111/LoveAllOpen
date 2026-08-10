/**
 * Knockout Bracket Component
 */

import { store } from '../store.js';

export function renderBracket(categoryId, isAdmin = false) {
  const knockout = store.getKnockout(categoryId);

  if (!knockout.rounds || knockout.rounds.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon"><i class='bx bx-trophy'></i></div>
        <div class="empty-state-title">No Knockout Stage Yet</div>
        <div class="empty-state-text">The knockout bracket will appear here once generated from group stage results.</div>
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
              const name1 = p1 ? (p1.teamName || p1.name) : 'TBD';
              const name2 = p2 ? (p2.teamName || p2.name) : 'TBD';
              const p1Winner = match.status === 'completed' && match.winner === match.player1Id;
              const p2Winner = match.status === 'completed' && match.winner === match.player2Id;

              return `
                <div class="bracket-match" id="ko-match-${match.id}">
                  <div class="bracket-player ${p1Winner ? 'winner' : ''}">
                    <span class="bracket-player-name ${!p1 ? 'tbd' : ''}">${name1}</span>
                    <span class="bracket-player-score">${match.score1 !== null ? match.score1 : ''}</span>
                  </div>
                  <div class="bracket-player ${p2Winner ? 'winner' : ''}">
                    <span class="bracket-player-name ${!p2 ? 'tbd' : ''}">${name2}</span>
                    <span class="bracket-player-score">${match.score2 !== null ? match.score2 : ''}</span>
                  </div>
                  ${isAdmin && match.player1Id && match.player2Id && match.status !== 'completed' ? `
                    <div style="padding: 6px 10px; border-top: 1px solid var(--border-subtle);">
                      <button class="btn btn-sm btn-primary w-full" 
                              onclick="window.openKnockoutScoreModal('${categoryId}', ${roundIdx}, '${match.id}')">
                        Enter Score
                      </button>
                    </div>
                  ` : ''}
                  ${isAdmin && match.status === 'completed' ? `
                    <div style="padding: 6px 10px; border-top: 1px solid var(--border-subtle); text-align: center;">
                      <span class="badge badge-completed">✓ Complete</span>
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
