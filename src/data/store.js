/**
 * Tournament data store — localStorage persistence + domain operations
 */

import { STORAGE_KEY, ADMIN_PASSWORD, DEFAULT_DATA } from './defaults.js';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

class Store {
  constructor() {
    this._listeners = {};
    this._data = null;
    this.load();
  }

  // --- Persistence ---
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this._data = JSON.parse(raw);
        // Ensure all category fields exist (in case of schema updates)
        for (const catId of Object.keys(DEFAULT_DATA.categories)) {
          if (!this._data.categories[catId]) {
            this._data.categories[catId] = JSON.parse(JSON.stringify(DEFAULT_DATA.categories[catId]));
          } else {
            // Merge missing fields
            const defaults = DEFAULT_DATA.categories[catId];
            const cat = this._data.categories[catId];
            if (!cat.knockout) cat.knockout = { rounds: [] };
            if (!cat.groups) cat.groups = [];
            if (!cat.participants) cat.participants = [];
            if (!cat.icon) cat.icon = defaults.icon;
          }
        }
        if (!this._data.settings) {
          this._data.settings = JSON.parse(JSON.stringify(DEFAULT_DATA.settings));
        } else {
          const defaults = DEFAULT_DATA.settings;
          for (const key of Object.keys(defaults)) {
            if (this._data.settings[key] === undefined || this._data.settings[key] === null) {
              this._data.settings[key] = defaults[key];
            }
          }
        }
      } else {
        this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      }
    } catch (e) {
      console.error('Failed to load store data:', e);
      this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    } catch (e) {
      console.error('Failed to save store data:', e);
    }
  }

  reset() {
    this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.save();
    this.emit('change');
  }

  // --- Auth ---
  checkPassword(password) {
    return password === ADMIN_PASSWORD;
  }

  // --- Settings ---
  getSettings() {
    return this._data.settings;
  }

  updateSettings(updates) {
    Object.assign(this._data.settings, updates);
    this.save();
    this.emit('change');
  }

  // --- Categories ---
  getCategories() {
    return this._data.categories;
  }

  getCategory(categoryId) {
    return this._data.categories[categoryId];
  }

  getCategoryIds() {
    return Object.keys(this._data.categories);
  }

  // --- Participants ---
  getParticipants(categoryId) {
    return this._data.categories[categoryId]?.participants || [];
  }

  addParticipant(categoryId, participant) {
    const cat = this._data.categories[categoryId];
    if (!cat) return null;
    const newP = {
      id: generateId(),
      ...participant
    };
    cat.participants.push(newP);
    this.save();
    this.emit('change');
    return newP;
  }

  removeParticipant(categoryId, participantId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return;
    cat.participants = cat.participants.filter(p => p.id !== participantId);
    this.save();
    this.emit('change');
  }

  getParticipantById(categoryId, participantId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return null;
    return cat.participants.find(p => p.id === participantId) || null;
  }

  // --- Groups ---
  getGroups(categoryId) {
    return this._data.categories[categoryId]?.groups || [];
  }

  generateGroups(categoryId, groupSize = 4) {
    const cat = this._data.categories[categoryId];
    if (!cat || cat.participants.length < 2) return;

    // Shuffle participants
    const shuffled = [...cat.participants].sort(() => Math.random() - 0.5);
    const numGroups = Math.ceil(shuffled.length / groupSize);
    const groups = [];

    for (let i = 0; i < numGroups; i++) {
      groups.push({
        id: generateId(),
        name: `Group ${String.fromCharCode(65 + i)}`,
        participantIds: [],
        matches: []
      });
    }

    // Distribute participants evenly (snake draft)
    shuffled.forEach((p, idx) => {
      const groupIdx = idx % numGroups;
      groups[groupIdx].participantIds.push(p.id);
    });

    cat.groups = groups;

    // Auto-generate round-robin matches for each group
    this._generateRoundRobinMatches(categoryId);

    this.save();
    this.emit('change');
  }

  clearGroups(categoryId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return;
    cat.groups = [];
    cat.knockout = { rounds: [] };
    this.save();
    this.emit('change');
  }

  // --- Round Robin Matches ---
  _generateRoundRobinMatches(categoryId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return;

    for (const group of cat.groups) {
      const pIds = group.participantIds;
      const matches = [];
      let matchNum = 1;

      for (let i = 0; i < pIds.length; i++) {
        for (let j = i + 1; j < pIds.length; j++) {
          matches.push({
            id: generateId(),
            matchNumber: matchNum++,
            player1Id: pIds[i],
            player2Id: pIds[j],
            score1: null,
            score2: null,
            winner: null,
            status: 'upcoming' // 'upcoming' | 'live' | 'completed'
          });
        }
      }

      group.matches = matches;
    }
  }

  getGroupMatches(categoryId, groupId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return [];
    const group = cat.groups.find(g => g.id === groupId);
    return group ? group.matches : [];
  }

  updateMatchScore(categoryId, groupId, matchId, score1, score2) {
    const cat = this._data.categories[categoryId];
    if (!cat) return;
    const group = cat.groups.find(g => g.id === groupId);
    if (!group) return;
    const match = group.matches.find(m => m.id === matchId);
    if (!match) return;

    match.score1 = parseInt(score1);
    match.score2 = parseInt(score2);
    match.status = 'completed';

    if (match.score1 > match.score2) {
      match.winner = match.player1Id;
    } else if (match.score2 > match.score1) {
      match.winner = match.player2Id;
    } else {
      match.winner = null; // draw
    }

    this.save();
    this.emit('change');
  }

  setMatchLive(categoryId, groupId, matchId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return;
    const group = cat.groups.find(g => g.id === groupId);
    if (!group) return;
    const match = group.matches.find(m => m.id === matchId);
    if (!match) return;
    match.status = 'live';
    this.save();
    this.emit('change');
  }

  resetMatch(categoryId, groupId, matchId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return;
    const group = cat.groups.find(g => g.id === groupId);
    if (!group) return;
    const match = group.matches.find(m => m.id === matchId);
    if (!match) return;
    match.score1 = null;
    match.score2 = null;
    match.winner = null;
    match.status = 'upcoming';
    this.save();
    this.emit('change');
  }

  // --- Standings ---
  getGroupStandings(categoryId, groupId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return [];
    const group = cat.groups.find(g => g.id === groupId);
    if (!group) return [];

    const stats = {};
    for (const pId of group.participantIds) {
      stats[pId] = {
        participantId: pId,
        played: 0,
        won: 0,
        lost: 0,
        drawn: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        points: 0 // 2 for win, 1 for draw, 0 for loss
      };
    }

    for (const match of group.matches) {
      if (match.status !== 'completed') continue;

      const s1 = stats[match.player1Id];
      const s2 = stats[match.player2Id];
      if (!s1 || !s2) continue;

      s1.played++;
      s2.played++;
      s1.pointsFor += match.score1 || 0;
      s1.pointsAgainst += match.score2 || 0;
      s2.pointsFor += match.score2 || 0;
      s2.pointsAgainst += match.score1 || 0;

      if (match.winner === match.player1Id) {
        s1.won++;
        s1.points += 2;
        s2.lost++;
      } else if (match.winner === match.player2Id) {
        s2.won++;
        s2.points += 2;
        s1.lost++;
      } else {
        s1.drawn++;
        s2.drawn++;
        s1.points += 1;
        s2.points += 1;
      }
    }

    return Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aDiff = a.pointsFor - a.pointsAgainst;
      const bDiff = b.pointsFor - b.pointsAgainst;
      if (bDiff !== aDiff) return bDiff - aDiff;
      return b.pointsFor - a.pointsFor;
    });
  }

  // --- Knockout ---
  getKnockout(categoryId) {
    return this._data.categories[categoryId]?.knockout || { rounds: [] };
  }

  generateKnockout(categoryId, qualifyCount = 2) {
    const cat = this._data.categories[categoryId];
    if (!cat || cat.groups.length === 0) return;

    // Get qualifiers from each group
    const qualifiers = [];
    for (const group of cat.groups) {
      const standings = this.getGroupStandings(categoryId, group.id);
      const top = standings.slice(0, qualifyCount);
      for (const s of top) {
        qualifiers.push({
          participantId: s.participantId,
          groupName: group.name,
          seed: qualifiers.length + 1
        });
      }
    }

    if (qualifiers.length < 2) return;

    // Seed the bracket: group winners vs runners-up from other groups
    const seeded = this._seedBracket(qualifiers, cat.groups.length, qualifyCount);

    // Create bracket rounds
    const rounds = [];
    let currentMatches = [];

    // First round
    for (let i = 0; i < seeded.length; i += 2) {
      currentMatches.push({
        id: generateId(),
        matchNumber: currentMatches.length + 1,
        player1Id: seeded[i]?.participantId || null,
        player2Id: seeded[i + 1]?.participantId || null,
        score1: null,
        score2: null,
        winner: null,
        status: 'upcoming'
      });
    }

    // Handle byes
    for (const match of currentMatches) {
      if (match.player1Id && !match.player2Id) {
        match.winner = match.player1Id;
        match.status = 'completed';
        match.score1 = 0;
        match.score2 = 0;
      } else if (!match.player1Id && match.player2Id) {
        match.winner = match.player2Id;
        match.status = 'completed';
        match.score1 = 0;
        match.score2 = 0;
      }
    }

    const roundNames = this._getRoundNames(currentMatches.length);
    rounds.push({
      name: roundNames[0] || 'Round 1',
      matches: currentMatches
    });

    // Subsequent rounds (empty until previous round completes)
    let numMatches = Math.ceil(currentMatches.length / 2);
    let roundIdx = 1;
    while (numMatches >= 1) {
      const roundMatches = [];
      for (let i = 0; i < numMatches; i++) {
        roundMatches.push({
          id: generateId(),
          matchNumber: i + 1,
          player1Id: null,
          player2Id: null,
          score1: null,
          score2: null,
          winner: null,
          status: 'upcoming'
        });
      }
      rounds.push({
        name: roundNames[roundIdx] || `Round ${roundIdx + 1}`,
        matches: roundMatches
      });
      numMatches = Math.ceil(numMatches / 2);
      roundIdx++;
      if (numMatches < 1) break;
    }

    cat.knockout = { rounds };
    this.save();
    this.emit('change');
  }

  _seedBracket(qualifiers, numGroups, qualifyCount) {
    if (qualifiers.length <= 1) return qualifiers;

    // Simple seeding: alternate group winners and runners-up
    // so same-group players meet as late as possible
    const seeded = [...qualifiers];

    // Pad to next power of 2
    const nextPow2 = Math.pow(2, Math.ceil(Math.log2(seeded.length)));
    while (seeded.length < nextPow2) {
      seeded.push({ participantId: null, groupName: 'BYE', seed: seeded.length + 1 });
    }

    return seeded;
  }

  _getRoundNames(numFirstRoundMatches) {
    const totalRounds = Math.ceil(Math.log2(numFirstRoundMatches)) + 1;
    const names = [];
    for (let i = totalRounds; i >= 1; i--) {
      if (i === 1) names.unshift('Final');
      else if (i === 2) names.unshift('Semi Finals');
      else if (i === 3) names.unshift('Quarter Finals');
      else names.unshift(`Round of ${Math.pow(2, i)}`);
    }
    // Reverse to match round order
    return names;
  }

  updateKnockoutMatch(categoryId, roundIndex, matchId, score1, score2) {
    const cat = this._data.categories[categoryId];
    if (!cat) return;
    const round = cat.knockout.rounds[roundIndex];
    if (!round) return;
    const match = round.matches.find(m => m.id === matchId);
    if (!match) return;

    match.score1 = parseInt(score1);
    match.score2 = parseInt(score2);
    match.status = 'completed';

    if (match.score1 > match.score2) {
      match.winner = match.player1Id;
    } else if (match.score2 > match.score1) {
      match.winner = match.player2Id;
    }

    // Advance winner to next round
    if (match.winner && roundIndex + 1 < cat.knockout.rounds.length) {
      const nextRound = cat.knockout.rounds[roundIndex + 1];
      const matchIdx = round.matches.indexOf(match);
      const nextMatchIdx = Math.floor(matchIdx / 2);
      const isFirstPlayer = matchIdx % 2 === 0;

      if (nextRound.matches[nextMatchIdx]) {
        if (isFirstPlayer) {
          nextRound.matches[nextMatchIdx].player1Id = match.winner;
        } else {
          nextRound.matches[nextMatchIdx].player2Id = match.winner;
        }
      }
    }

    this.save();
    this.emit('change');
  }

  clearKnockout(categoryId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return;
    cat.knockout = { rounds: [] };
    this.save();
    this.emit('change');
  }

  // --- Export / Import ---
  exportData() {
    return JSON.stringify(this._data, null, 2);
  }

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.categories && data.settings) {
        this._data = data;
        this.save();
        this.emit('change');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  // --- Events ---
  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(cb => cb(data));
  }
}

// Singleton
export const store = new Store();
export { ADMIN_PASSWORD };
