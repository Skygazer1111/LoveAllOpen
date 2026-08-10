/**
 * Group Standings Table Component
 */

import { store } from '../store.js';

export function renderGroupStandings(categoryId, groupId, qualifyCount = 2) {
  const standings = store.getGroupStandings(categoryId, groupId);

  if (standings.length === 0) {
    return '<p class="text-muted" style="padding: var(--space-md);">No matches played yet</p>';
  }

  return `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="rank-cell">#</th>
            <th>Player / Team</th>
            <th class="score-cell">P</th>
            <th class="score-cell">W</th>
            <th class="score-cell">L</th>
            <th class="score-cell">D</th>
            <th class="score-cell">PF</th>
            <th class="score-cell">PA</th>
            <th class="score-cell">PTS</th>
          </tr>
        </thead>
        <tbody>
          ${standings.map((s, idx) => {
            const p = store.getParticipantById(categoryId, s.participantId);
            const name = p ? (p.teamName || p.name) : 'Unknown';
            const isQualified = idx < qualifyCount;

            return `
              <tr>
                <td class="rank-cell ${isQualified ? 'top' : ''}">${idx + 1}</td>
                <td class="player-cell">${name}${isQualified ? ' <span style="color: var(--color-accent); font-size: 0.75rem;">▲</span>' : ''}</td>
                <td class="score-cell">${s.played}</td>
                <td class="score-cell">${s.won}</td>
                <td class="score-cell">${s.lost}</td>
                <td class="score-cell">${s.drawn}</td>
                <td class="score-cell">${s.pointsFor}</td>
                <td class="score-cell">${s.pointsAgainst}</td>
                <td class="score-cell" style="color: var(--color-accent); font-weight: 800;">${s.points}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}
