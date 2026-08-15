/**
 * Tournament data store — localStorage persistence + domain operations
 */

import { STORAGE_KEY, ADMIN_PASSWORD, DEFAULT_DATA, DEFAULT_COURTS } from './defaults.js';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/** Display name for singles (name) or doubles (player1 & player2). */
export function getParticipantDisplayName(participant, fallback = 'TBD') {
  if (!participant) return fallback;
  if (participant.player1 || participant.player2) {
    const a = (participant.player1 || '').trim();
    const b = (participant.player2 || '').trim();
    if (a && b) return `${a} & ${b}`;
    return a || b || fallback;
  }
  if (participant.name) return participant.name;
  // Legacy entries that still have a team name
  if (participant.teamName) return participant.teamName;
  return fallback;
}

function createMatch(matchNumber, player1Id, player2Id) {
  return {
    id: generateId(),
    matchNumber,
    player1Id,
    player2Id,
    score1: null,
    score2: null,
    winner: null,
    status: 'upcoming',
    scheduledTime: '',
    court: null
  };
}

function parseOptionalScore(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

export function formatMatchTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = String(hhmm).split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function addMinutesToTime(hhmm, mins) {
  const [h, m] = String(hhmm || '09:00').split(':').map(Number);
  const total = ((h || 0) * 60 + (m || 0) + mins + 24 * 60) % (24 * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function applyMatchResult(match, { winnerId, score1, score2, allowDraw = false } = {}) {
  const s1 = parseOptionalScore(score1);
  const s2 = parseOptionalScore(score2);
  let winner = undefined;

  if (winnerId === null && allowDraw) {
    winner = null;
  } else if (winnerId) {
    winner = winnerId;
  } else if (s1 != null && s2 != null) {
    if (s1 > s2) winner = match.player1Id;
    else if (s2 > s1) winner = match.player2Id;
    else if (allowDraw) winner = null;
  }

  if (winner === undefined) return false;

  match.score1 = s1;
  match.score2 = s2;
  match.winner = winner;
  match.status = 'completed';
  return true;
}

function resetMatchResult(match) {
  match.score1 = null;
  match.score2 = null;
  match.winner = null;
  match.status = 'upcoming';
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
        let shouldSave = false;
        if (this._data.settings.courts === 2) {
          this._data.settings.courts = DEFAULT_COURTS;
          shouldSave = true;
        }
        for (const catId of Object.keys(this._data.categories || {})) {
          shouldSave = this._syncKnockoutSeeds(catId) || shouldSave;
        }
        if (shouldSave) this.save();
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
      this._data.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    } catch (e) {
      console.error('Failed to save store data:', e);
    }
  }

  getData() {
    return this._data;
  }

  replaceData(data, { silent = false } = {}) {
    if (!data?.categories || !data?.settings) return false;
    // Keep settings numbers typed correctly after JSON round-trips
    if (data.settings.courts != null) {
      data.settings.courts = parseInt(data.settings.courts, 10) || data.settings.courts;
    }
    if (data.settings.courts === 2) {
      data.settings.courts = DEFAULT_COURTS;
    }

    const remoteAt = Number(data.updatedAt) || 0;
    const localAt = Number(this._data?.updatedAt) || 0;
    if (remoteAt && localAt && remoteAt === localAt) {
      return false;
    }

    this._data = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    } catch (e) {
      console.error('Failed to save store data:', e);
    }
    if (!silent) this.emit('change');
    return true;
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
    const next = { ...updates };
    if (next.courts !== undefined) {
      const n = parseInt(next.courts, 10);
      next.courts = Number.isFinite(n) && n > 0 ? n : DEFAULT_COURTS;
    }
    Object.assign(this._data.settings, next);
    this.save();
    this.emit('change');
  }

  isSchedulePublished() {
    return Boolean(this._data.settings?.schedulePublished);
  }

  publishSchedule() {
    this._data.settings.schedulePublished = true;
    this._data.settings.publishedAt = Date.now();
    this.save();
    this.emit('change');
  }

  unpublishSchedule() {
    this._data.settings.schedulePublished = false;
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

  updateParticipant(categoryId, participantId, updates) {
    const cat = this._data.categories[categoryId];
    if (!cat) return false;
    const participant = cat.participants.find(p => p.id === participantId);
    if (!participant) return false;

    if (updates.name !== undefined) {
      const name = String(updates.name || '').trim();
      if (!name) return false;
      participant.name = name;
      delete participant.player1;
      delete participant.player2;
      delete participant.teamName;
    } else {
      const player1 = String(updates.player1 || '').trim();
      const player2 = String(updates.player2 || '').trim();
      if (!player1 || !player2) return false;
      participant.player1 = player1;
      participant.player2 = player2;
      delete participant.name;
      delete participant.teamName;
    }

    this.save();
    this.emit('change');
    return true;
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
          matches.push(createMatch(matchNum++, pIds[i], pIds[j]));
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

  _findGroupMatch(categoryId, groupId, matchId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return null;
    const group = cat.groups.find(g => g.id === groupId);
    if (!group) return null;
    const match = group.matches.find(m => m.id === matchId);
    return match ? { cat, group, match } : null;
  }

  updateMatchScore(categoryId, groupId, matchId, score1, score2) {
    this.completeGroupMatch(categoryId, groupId, matchId, { score1, score2 });
  }

  completeGroupMatch(categoryId, groupId, matchId, { winnerId, score1, score2 } = {}) {
    const found = this._findGroupMatch(categoryId, groupId, matchId);
    if (!found) return false;
    const { match } = found;
    applyMatchResult(match, { winnerId, score1, score2, allowDraw: true });
    this._syncKnockoutSeeds(categoryId);
    this.save();
    this.emit('change');
    return true;
  }

  setMatchLive(categoryId, groupId, matchId) {
    const found = this._findGroupMatch(categoryId, groupId, matchId);
    if (!found || found.match.status === 'completed') return;
    found.match.status = 'live';
    this.save();
    this.emit('change');
  }

  updateMatchSchedule(categoryId, groupId, matchId, { scheduledTime, court } = {}) {
    const found = this._findGroupMatch(categoryId, groupId, matchId);
    if (!found) return;
    if (scheduledTime !== undefined) found.match.scheduledTime = scheduledTime || '';
    if (court !== undefined) found.match.court = court === '' || court == null ? null : parseInt(court, 10);
    this.save();
    this.emit('change');
  }

  resetMatch(categoryId, groupId, matchId) {
    const found = this._findGroupMatch(categoryId, groupId, matchId);
    if (!found) return;
    resetMatchResult(found.match);
    this._syncKnockoutSeeds(categoryId);
    this.save();
    this.emit('change');
  }

  updateGroupMatchPlayers(categoryId, groupId, matchId, player1Id, player2Id) {
    const found = this._findGroupMatch(categoryId, groupId, matchId);
    if (!found || found.match.status === 'completed') return false;
    if (!player1Id || !player2Id || player1Id === player2Id) return false;
    const allowed = new Set(found.group.participantIds);
    if (!allowed.has(player1Id) || !allowed.has(player2Id)) return false;
    found.match.player1Id = player1Id;
    found.match.player2Id = player2Id;
    found.match.scheduledTime = '';
    found.match.court = null;
    this.save();
    this.emit('change');
    return true;
  }

  updateKnockoutMatchPlayers(categoryId, roundIndex, matchId, player1Id, player2Id) {
    const found = this._findKnockoutMatch(categoryId, roundIndex, matchId);
    if (!found || found.match.status === 'completed') return false;
    if (player1Id && player2Id && player1Id === player2Id) return false;
    const participants = new Set(this.getParticipants(categoryId).map(p => p.id));
    if (player1Id && !participants.has(player1Id)) return false;
    if (player2Id && !participants.has(player2Id)) return false;
    found.match.player1Id = player1Id || null;
    found.match.player2Id = player2Id || null;
    found.match.scheduledTime = '';
    found.match.court = null;
    this.save();
    this.emit('change');
    return true;
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
      currentMatches.push(createMatch(
        currentMatches.length + 1,
        seeded[i]?.participantId || null,
        seeded[i + 1]?.participantId || null
      ));
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
        roundMatches.push(createMatch(i + 1, null, null));
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

    currentMatches.forEach((match, matchIdx) => {
      if (match.winner) {
        this._placeWinnerInNextRound(cat, 0, matchIdx, match.winner);
      }
    });

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

  _findKnockoutMatch(categoryId, roundIndex, matchId) {
    const cat = this._data.categories[categoryId];
    if (!cat?.knockout?.rounds) return null;
    const round = cat.knockout.rounds[roundIndex];
    if (!round) return null;
    const match = round.matches.find(m => m.id === matchId);
    return match ? { cat, round, match, matchIdx: round.matches.indexOf(match) } : null;
  }

  _placeWinnerInNextRound(cat, roundIndex, matchIdx, winnerId) {
    const nextRound = cat.knockout.rounds[roundIndex + 1];
    if (!nextRound) return;
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const next = nextRound.matches[nextMatchIdx];
    if (!next) return;
    const isFirst = matchIdx % 2 === 0;
    const prevId = isFirst ? next.player1Id : next.player2Id;
    if (isFirst) next.player1Id = winnerId;
    else next.player2Id = winnerId;
    if (prevId && prevId !== winnerId && next.status === 'completed') {
      resetMatchResult(next);
      this._cascadeClearFrom(cat, roundIndex + 1, nextMatchIdx);
    }
  }

  _cascadeClearFrom(cat, roundIndex, matchIdx) {
    const nextRound = cat.knockout.rounds[roundIndex + 1];
    if (!nextRound) return;
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const next = nextRound.matches[nextMatchIdx];
    if (!next) return;
    if (matchIdx % 2 === 0) next.player1Id = null;
    else next.player2Id = null;
    resetMatchResult(next);
    this._cascadeClearFrom(cat, roundIndex + 1, nextMatchIdx);
  }

  updateKnockoutMatch(categoryId, roundIndex, matchId, score1, score2) {
    this.completeKnockoutMatch(categoryId, roundIndex, matchId, { score1, score2 });
  }

  completeKnockoutMatch(categoryId, roundIndex, matchId, { winnerId, score1, score2 } = {}) {
    const found = this._findKnockoutMatch(categoryId, roundIndex, matchId);
    if (!found) return false;
    const { cat, match, matchIdx } = found;
    const ok = applyMatchResult(match, { winnerId, score1, score2, allowDraw: false });
    if (!ok || !match.winner) return false;
    this._placeWinnerInNextRound(cat, roundIndex, matchIdx, match.winner);
    this._syncKnockoutSeeds(categoryId);
    this.save();
    this.emit('change');
    return true;
  }

  setKnockoutLive(categoryId, roundIndex, matchId) {
    const found = this._findKnockoutMatch(categoryId, roundIndex, matchId);
    if (!found || found.match.status === 'completed') return;
    found.match.status = 'live';
    this.save();
    this.emit('change');
  }

  updateKnockoutSchedule(categoryId, roundIndex, matchId, { scheduledTime, court } = {}) {
    const found = this._findKnockoutMatch(categoryId, roundIndex, matchId);
    if (!found) return;
    if (scheduledTime !== undefined) found.match.scheduledTime = scheduledTime || '';
    if (court !== undefined) found.match.court = court === '' || court == null ? null : parseInt(court, 10);
    this.save();
    this.emit('change');
  }

  resetKnockoutMatch(categoryId, roundIndex, matchId) {
    const found = this._findKnockoutMatch(categoryId, roundIndex, matchId);
    if (!found) return;
    resetMatchResult(found.match);
    this._cascadeClearFrom(found.cat, roundIndex, found.matchIdx);
    this._syncKnockoutSeeds(categoryId);
    this.save();
    this.emit('change');
  }

  _groupToken(name) {
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/^group\s+/, '');
  }

  _slotToken(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  _sortedGroups(cat) {
    return [...(cat.groups || [])].sort((a, b) =>
      this._groupToken(a.name).localeCompare(this._groupToken(b.name), undefined, { numeric: true })
    );
  }

  _groupLabel(group) {
    return String(group?.name || '').replace(/^group\s+/i, '').trim() || this._groupToken(group?.name);
  }

  _makeGroupSeed(group, rank) {
    if (!group || !rank) return null;
    const label = group.name || `Group ${this._groupLabel(group)}`;
    return {
      type: 'group',
      group: this._groupLabel(group),
      rank,
      label: `${label} #${rank}`
    };
  }

  _makeWinnerSeed(slotLabel) {
    if (!slotLabel) return null;
    return {
      type: 'winner',
      slot: slotLabel,
      label: `Winner ${slotLabel}`
    };
  }

  _firstRoundSeeds(groups, matchCount, matchIdx) {
    if (groups.length >= 2 && matchCount === 2) {
      const [g0, g1] = groups;
      return matchIdx === 0
        ? [this._makeGroupSeed(g0, 1), this._makeGroupSeed(g1, 2)]
        : [this._makeGroupSeed(g1, 1), this._makeGroupSeed(g0, 2)];
    }
    if (groups.length >= 4 && matchCount === 4) {
      const pairs = [
        [this._makeGroupSeed(groups[0], 1), this._makeGroupSeed(groups[1], 2)],
        [this._makeGroupSeed(groups[1], 1), this._makeGroupSeed(groups[0], 2)],
        [this._makeGroupSeed(groups[2], 1), this._makeGroupSeed(groups[3], 2)],
        [this._makeGroupSeed(groups[3], 1), this._makeGroupSeed(groups[2], 2)]
      ];
      return pairs[matchIdx] || null;
    }
    return null;
  }

  _ensureKnockoutSeeds(cat, categoryId) {
    const rounds = cat.knockout?.rounds || [];
    if (!rounds.length) return false;
    const groups = this._sortedGroups(cat);
    const prefix = categoryId === 'mens-singles' ? 'MS' : categoryId === 'mens-doubles' ? 'MD' : 'MX';
    let changed = false;

    rounds.forEach((round, roundIdx) => {
      const matches = round.matches || [];
      matches.forEach((match, matchIdx) => {
        if (!match.slotLabel) {
          const n = matchIdx + 1;
          if (/final/i.test(round.name) && matches.length === 1) match.slotLabel = `${prefix} Final`;
          else if (/semi/i.test(round.name)) match.slotLabel = `${prefix} SF ${n}`;
          else if (/quarter/i.test(round.name)) match.slotLabel = `${prefix} QF ${n}`;
          else match.slotLabel = `${prefix} R${roundIdx + 1}-${n}`;
          changed = true;
        }

        if (match.player1Seed && match.player2Seed) return;

        if (roundIdx === 0) {
          const pairing = this._firstRoundSeeds(groups, matches.length, matchIdx);
          if (pairing) {
            if (!match.player1Seed) { match.player1Seed = pairing[0]; changed = true; }
            if (!match.player2Seed) { match.player2Seed = pairing[1]; changed = true; }
          }
        } else {
          const prev = rounds[roundIdx - 1]?.matches || [];
          const left = prev[matchIdx * 2];
          const right = prev[matchIdx * 2 + 1];
          if (!match.player1Seed) { match.player1Seed = this._makeWinnerSeed(left?.slotLabel); changed = true; }
          if (!match.player2Seed) { match.player2Seed = this._makeWinnerSeed(right?.slotLabel); changed = true; }
        }
      });
    });
    return changed;
  }

  _findGroupBySeed(cat, groupToken) {
    const wanted = this._groupToken(groupToken);
    return (cat.groups || []).find((g) => this._groupToken(g.name) === wanted) || null;
  }

  _findKnockoutBySlot(cat, slot) {
    const wanted = this._slotToken(slot);
    if (!wanted) return null;
    for (const round of cat.knockout?.rounds || []) {
      for (const match of round.matches || []) {
        if (this._slotToken(match.slotLabel) === wanted) return match;
      }
    }
    return null;
  }

  _isGroupComplete(group) {
    if (!group?.matches?.length) return false;
    return group.matches.every((m) => m.status === 'completed' || Boolean(m.winner));
  }

  _resolveSeed(categoryId, cat, seed) {
    if (!seed) return null;
    if (seed.type === 'group') {
      const group = this._findGroupBySeed(cat, seed.group);
      if (!group || !this._isGroupComplete(group)) return null;
      const standings = this.getGroupStandings(categoryId, group.id);
      return standings[seed.rank - 1]?.participantId || null;
    }
    if (seed.type === 'winner') {
      const source = this._findKnockoutBySlot(cat, seed.slot);
      if (!source || source.status !== 'completed') return null;
      return source.winner || null;
    }
    return null;
  }

  _syncKnockoutSeeds(categoryId) {
    const cat = this.getCategory(categoryId);
    if (!cat?.knockout?.rounds) return false;
    let changed = this._ensureKnockoutSeeds(cat, categoryId);
    for (const round of cat.knockout.rounds) {
      for (const match of round.matches || []) {
        if (!match.player1Seed && !match.player2Seed) continue;
        if (match.status === 'completed') continue;
        const p1 = this._resolveSeed(categoryId, cat, match.player1Seed);
        const p2 = this._resolveSeed(categoryId, cat, match.player2Seed);
        if (match.player1Id !== p1 || match.player2Id !== p2) {
          match.player1Id = p1;
          match.player2Id = p2;
          changed = true;
        }
      }
    }
    return changed;
  }

  refreshKnockout(categoryId) {
    const changed = this._syncKnockoutSeeds(categoryId);
    if (changed) this.save();
    return changed;
  }

  scheduleCategoryMatches(categoryId, { startTime = '09:00', intervalMins = 15, courts = DEFAULT_COURTS, leagueGapSlots = 1 } = {}) {
    const cat = this._data.categories[categoryId];
    if (!cat) return;

    const leagueMatches = [];
    for (const group of cat.groups || []) {
      for (const match of group.matches || []) {
        if (match.player1Id && match.player2Id) leagueMatches.push(match);
      }
    }

    const knockoutMatches = [];
    for (const round of cat.knockout?.rounds || []) {
      for (const match of round.matches) {
        if (match.player1Id && match.player2Id && match.status !== 'completed') {
          knockoutMatches.push(match);
        }
      }
    }

    const courtCount = Math.max(1, parseInt(courts, 10) || DEFAULT_COURTS);
    const step = Math.max(5, parseInt(intervalMins, 10) || 15);
    const gap = Math.max(1, parseInt(leagueGapSlots, 10) || 1);

    const leagueSlots = this._buildLeagueSlotsWithGap(leagueMatches, courtCount, gap);
    let slotIndex = 0;
    for (const slot of leagueSlots) {
      slot.forEach((match, courtIdx) => {
        match.court = courtIdx + 1;
        match.scheduledTime = addMinutesToTime(startTime, slotIndex * step);
      });
      slotIndex++;
    }

    knockoutMatches.forEach((match, idx) => {
      const koSlot = slotIndex + Math.floor(idx / courtCount);
      match.court = (idx % courtCount) + 1;
      match.scheduledTime = addMinutesToTime(startTime, koSlot * step);
    });

    this.save();
    this.emit('change');
  }

  /**
   * Order league matches into time slots so no player/team plays in consecutive slots.
   */
  _buildLeagueSlotsWithGap(matches, courts, gapSlots) {
    const pending = [...matches];
    const slots = [];
    const lastSlot = new Map();

    const canPlay = (participantId, slotIndex) => {
      const last = lastSlot.get(participantId);
      return last === undefined || slotIndex - last > gapSlots;
    };

    while (pending.length > 0) {
      const slot = [];
      const slotIndex = slots.length;

      for (let i = pending.length - 1; i >= 0 && slot.length < courts; i--) {
        const match = pending[i];
        if (canPlay(match.player1Id, slotIndex) && canPlay(match.player2Id, slotIndex)) {
          slot.push(match);
          pending.splice(i, 1);
          lastSlot.set(match.player1Id, slotIndex);
          lastSlot.set(match.player2Id, slotIndex);
        }
      }

      if (slot.length === 0) {
        const match = pending.shift();
        slot.push(match);
        lastSlot.set(match.player1Id, slotIndex);
        lastSlot.set(match.player2Id, slotIndex);
      }

      slots.push(slot);
    }

    return slots;
  }

  listBoardMatches(categoryId) {
    const cat = this._data.categories[categoryId];
    if (!cat) return [];
    const items = [];
    for (const group of cat.groups || []) {
      for (const match of group.matches || []) {
        items.push({
          match,
          categoryId,
          stage: 'group',
          label: group.name,
          groupId: group.id,
          roundIndex: null
        });
      }
    }
    (cat.knockout?.rounds || []).forEach((round, roundIndex) => {
      for (const match of round.matches) {
        items.push({
          match,
          categoryId,
          stage: 'knockout',
          label: round.name,
          groupId: '',
          roundIndex
        });
      }
    });
    return items;
  }

  countMatchStatuses() {
    let live = 0;
    let upcoming = 0;
    let completed = 0;
    for (const cat of Object.values(this._data.categories || {})) {
      for (const group of cat.groups || []) {
        for (const match of group.matches || []) {
          if (match.status === 'live') live++;
          else if (match.status === 'completed') completed++;
          else upcoming++;
        }
      }
      for (const round of cat.knockout?.rounds || []) {
        for (const match of round.matches) {
          if (!match.player1Id && !match.player2Id) continue;
          if (match.status === 'live') live++;
          else if (match.status === 'completed') completed++;
          else upcoming++;
        }
      }
    }
    return { live, upcoming, completed };
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

  /**
   * Replace participants, groups, and fixtures from a parsed Excel draw.
   * Keeps event settings; marks the schedule as draft until re-published.
   */
  importExcelDraw(payload) {
    if (!payload?.categories) return { ok: false, unmatched: [] };

    const unmatched = [];
    const roundOrder = [
      { stage: 'qf', name: 'Quarter Finals' },
      { stage: 'sf', name: 'Semi Finals' },
      { stage: 'final', name: 'Final' }
    ];

    const keyOf = (member) => {
      if (!member) return '';
      const norm = (s) => String(s || '')
        .toLowerCase()
        .replace(/[’']/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      if (member.name) return `s:${norm(member.name)}`;
      return `d:${[norm(member.player1), norm(member.player2)].sort().join('|')}`;
    };

    for (const catId of Object.keys(this._data.categories)) {
      const cat = this._data.categories[catId];
      const incoming = payload.categories[catId];
      cat.participants = [];
      cat.groups = [];
      cat.knockout = { rounds: [] };
      if (!incoming) continue;

      const idByKey = new Map();
      const addMember = (member) => {
        const key = keyOf(member);
        if (!key) return null;
        if (idByKey.has(key)) return idByKey.get(key);
        const participant = member.name
          ? { id: generateId(), name: member.name }
          : { id: generateId(), player1: member.player1, player2: member.player2 };
        cat.participants.push(participant);
        idByKey.set(key, participant.id);
        return participant.id;
      };

      for (const group of incoming.groups || []) {
        const participantIds = [];
        for (const member of group.members || []) {
          const id = addMember(member);
          if (id && !participantIds.includes(id)) participantIds.push(id);
        }
        cat.groups.push({
          id: generateId(),
          name: group.name,
          participantIds,
          matches: []
        });
      }

      const groupByParticipant = new Map();
      for (const group of cat.groups) {
        for (const id of group.participantIds) groupByParticipant.set(id, group);
      }

      let matchNumByGroup = new Map();
      for (const row of incoming.groupMatches || []) {
        const id1 = idByKey.get(keyOf(row.side1));
        const id2 = idByKey.get(keyOf(row.side2));
        if (!id1 || !id2) {
          unmatched.push(row.label || 'Unnamed group match');
          continue;
        }

        const wanted = String(row.groupName || '').trim().toLowerCase().replace(/^group\s+/, '');
        let group = wanted
          ? cat.groups.find((g) => g.name.trim().toLowerCase().replace(/^group\s+/, '') === wanted)
          : null;
        if (!group) {
          const g1 = groupByParticipant.get(id1);
          const g2 = groupByParticipant.get(id2);
          group = g1 && g1 === g2 ? g1 : null;
        }
        if (!group || !group.participantIds.includes(id1) || !group.participantIds.includes(id2)) {
          unmatched.push(row.label || 'Group match with mixed groups');
          continue;
        }
        const n = (matchNumByGroup.get(group.id) || 0) + 1;
        matchNumByGroup.set(group.id, n);
        const match = createMatch(n, id1, id2);
        match.scheduledTime = row.scheduledTime || '';
        match.court = row.court ?? null;
        group.matches.push(match);
      }

      const rounds = [];
      for (const roundDef of roundOrder) {
        const rows = (incoming.knockoutMatches || []).filter((m) => m.stage === roundDef.stage);
        if (rows.length === 0) continue;
        rows.sort((a, b) => {
          const t = String(a.scheduledTime || '').localeCompare(String(b.scheduledTime || ''));
          if (t !== 0) return t;
          return (a.court || 0) - (b.court || 0);
        });
        rounds.push({
          name: roundDef.name,
          matches: rows.map((row, idx) => {
            const match = createMatch(
              idx + 1,
              row.placeholder ? null : (idByKey.get(keyOf(row.side1)) || null),
              row.placeholder ? null : (idByKey.get(keyOf(row.side2)) || null)
            );
            match.scheduledTime = row.scheduledTime || '';
            match.court = row.court ?? null;
            match.slotLabel = row.slotLabel || '';
            match.player1Seed = row.seed1 || null;
            match.player2Seed = row.seed2 || null;
            return match;
          })
        });
      }
      cat.knockout = { rounds };
      this._syncKnockoutSeeds(catId);
    }

    const maxCourts = parseInt(payload.maxCourts, 10);
    if (Number.isFinite(maxCourts) && maxCourts > (this._data.settings.courts || 0)) {
      this._data.settings.courts = maxCourts;
    }

    this._data.settings.schedulePublished = false;
    this.save();
    this.emit('change');
    return { ok: true, unmatched };
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

export function getMatchSideName(categoryId, match, side, fallback = 'TBD') {
  const id = side === 1 ? match.player1Id : match.player2Id;
  if (id) {
    const participant = store.getParticipantById(categoryId, id);
    if (participant) return getParticipantDisplayName(participant, fallback);
  }
  const seed = side === 1 ? match.player1Seed : match.player2Seed;
  return seed?.label || fallback;
}
