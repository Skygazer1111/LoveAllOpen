/**
 * Parse the LoveAll tournament Excel workbook into a draw payload.
 * Supports:
 *  - Final Schedule grid (Time × Court 1–4) + Groups table
 *  - Legacy Schedule list (Time / Court / Event / Match)
 */

import * as XLSX from 'xlsx';

const CATEGORY_IDS = ['mens-singles', 'mens-doubles', 'mixed-doubles'];

function cellText(value) {
  if (value == null) return '';
  if (value instanceof Date) return '';
  return String(value).replace(/\u00a0/g, ' ').trim();
}

export function normalizeName(value) {
  return cellText(value)
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function memberKey(member) {
  if (!member) return '';
  if (member.name) return `s:${normalizeName(member.name)}`;
  const a = normalizeName(member.player1);
  const b = normalizeName(member.player2);
  return `d:${[a, b].sort().join('|')}`;
}

function detectCategory(text) {
  const t = normalizeName(text);
  if (!t) return null;
  if (t.includes('mixed')) return 'mixed-doubles';
  if (t.includes('double')) return 'mens-doubles';
  if (t.includes('single')) return 'mens-singles';
  return null;
}

function detectStage(text) {
  const t = normalizeName(text);
  if (!t) return null;
  if (/\bqf\b/.test(t) || t.includes('quarter')) return 'qf';
  if (/\bsf\b/.test(t) || t.includes('semi')) return 'sf';
  if (t.includes('final')) return 'final';
  if (t.includes('group')) return 'group';
  return null;
}

function formatGroupName(raw) {
  const t = cellText(raw).replace(/\s+/g, ' ');
  if (!t) return '';
  if (/^group\s+/i.test(t)) return `Group ${t.replace(/^group\s+/i, '')}`;
  return `Group ${t}`;
}

function parseTime(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value < 1.5) {
    const totalMins = Math.round(value * 24 * 60) % (24 * 60);
    const hours = Math.floor(totalMins / 60);
    const minutes = totalMins % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }
  const raw = cellText(value);
  if (!raw) return '';
  const start = raw.split(/\s*[–—−-]\s*/)[0];
  const compact = start.replace(/\s+/g, '').toUpperCase();
  const match = compact.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/);
  if (!match) return '';
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];
  if (ampm === 'AM') {
    if (hours === 12) hours = 0;
  } else if (ampm === 'PM') {
    if (hours !== 12) hours += 12;
  } else if (hours >= 1 && hours <= 7) {
    hours += 12;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function parseCourt(value) {
  const raw = cellText(value);
  if (!raw && typeof value === 'number') return value;
  const match = raw.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
}

function parseTeam(text) {
  const raw = cellText(text).replace(/[’']/g, "'");
  if (!raw) return null;
  if (raw.includes('/')) {
    const idx = raw.indexOf('/');
    const player1 = raw.slice(0, idx).trim();
    const player2 = raw.slice(idx + 1).trim();
    if (!player1 || !player2) return null;
    return { player1, player2 };
  }
  return { name: raw };
}

function isSeedPlaceholder(text) {
  const t = normalizeName(text);
  if (!t) return true;
  return /^(group\s+\S+\s*#\s*\d+|winner\b)/.test(t) || /\b#\s*\d+\s*$/.test(t);
}

function parseSeed(text) {
  const raw = cellText(text);
  if (!raw) return null;
  const groupRank = raw.match(/^group\s+(\S+)\s*#\s*(\d+)$/i);
  if (groupRank) {
    const rank = parseInt(groupRank[2], 10);
    return {
      type: 'group',
      group: groupRank[1],
      rank,
      label: `Group ${groupRank[1]} #${rank}`
    };
  }
  const winner = raw.match(/^winner\s+(.+)$/i);
  if (winner) {
    return {
      type: 'winner',
      slot: winner[1].trim(),
      label: `Winner ${winner[1].trim()}`
    };
  }
  return { type: 'tbd', label: raw };
}

function parseMatchSides(text) {
  const raw = cellText(text);
  if (!raw) return { side1: null, side2: null, placeholder: true, seed1: null, seed2: null };
  const split = raw.split(/\s+v(?:s\.?)?\s+/i);
  if (split.length < 2) {
    return { side1: null, side2: null, placeholder: true, label: raw, seed1: null, seed2: null };
  }
  const left = split[0];
  const right = split.slice(1).join(' vs ');
  if (isSeedPlaceholder(left) || isSeedPlaceholder(right)) {
    return {
      side1: null,
      side2: null,
      placeholder: true,
      label: raw,
      seed1: parseSeed(left),
      seed2: parseSeed(right)
    };
  }
  return {
    side1: parseTeam(left),
    side2: parseTeam(right),
    placeholder: false,
    label: raw,
    seed1: null,
    seed2: null
  };
}

function parseFixtureCell(text) {
  const raw = cellText(text);
  if (!raw) return null;
  const parts = raw.split('|').map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  return {
    categoryText: parts[0],
    stageLabel: parts[1],
    matchText: parts.slice(2).join(' | ')
  };
}

function emptyCategory() {
  return {
    groups: [],
    groupMatches: [],
    knockoutMatches: []
  };
}

function findSheet(wb, needles) {
  const list = Array.isArray(needles) ? needles : [needles];
  for (const needle of list) {
    const name = wb.SheetNames.find((n) => n.toLowerCase().includes(needle));
    if (name) return wb.Sheets[name];
  }
  return null;
}

function sheetRows(sheet) {
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });
}

function headerLabels(row) {
  return (row || []).map((c) => normalizeName(c));
}

function parseTabularGroups(rows, payload, warnings) {
  const header = headerLabels(rows[0]);
  const catIdx = header.findIndex((v) => v.includes('category') || v.includes('event'));
  const groupIdx = header.findIndex((v) => v === 'group' || v.startsWith('group'));
  const memberIdx = header.findIndex((v) =>
    v.includes('participant') || v.includes('team') || v.includes('player') || v.includes('name')
  );
  if (catIdx < 0 || groupIdx < 0 || memberIdx < 0) return false;

  const groupsByKey = new Map();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const categoryId = detectCategory(row[catIdx]);
    const groupName = formatGroupName(row[groupIdx]);
    const memberText = cellText(row[memberIdx]);
    if (!categoryId || !groupName || !memberText) continue;

    const member = categoryId === 'mens-singles' ? { name: memberText } : parseTeam(memberText);
    if (!member || (categoryId !== 'mens-singles' && !member.player1)) {
      warnings.push(`Could not read ${groupName} entry "${memberText}"`);
      continue;
    }

    const key = `${categoryId}::${normalizeName(groupName)}`;
    if (!groupsByKey.has(key)) {
      const group = { name: groupName, members: [] };
      groupsByKey.set(key, group);
      payload.categories[categoryId].groups.push(group);
    }
    groupsByKey.get(key).members.push(member);
  }

  return payload.categories['mens-singles'].groups.length
    + payload.categories['mens-doubles'].groups.length
    + payload.categories['mixed-doubles'].groups.length > 0;
}

function parseLegacyGroups(rows, payload, warnings) {
  let currentCategory = null;

  for (const row of rows) {
    const a = cellText(row?.[0]);
    const b = cellText(row?.[1]);
    if (!a && !b) continue;

    const headingCat = detectCategory(a);
    if (headingCat && !b) {
      currentCategory = headingCat;
      continue;
    }

    if (!currentCategory || !a || !b) continue;
    if (/^group/i.test(a) && /assignment/i.test(a)) continue;
    if (normalizeName(a) === 'category') continue;

    const cat = payload.categories[currentCategory];
    const isSingles = currentCategory === 'mens-singles';
    const members = [];

    if (isSingles) {
      for (const name of b.split(',').map((s) => s.trim()).filter(Boolean)) {
        members.push({ name });
      }
    } else {
      const chunks = b.includes(';') ? b.split(';') : b.split(',');
      for (const chunk of chunks) {
        const team = parseTeam(chunk);
        if (team?.player1 && team?.player2) members.push(team);
        else if (team?.name) warnings.push(`Could not read pair "${chunk.trim()}" in ${a}`);
      }
    }

    if (members.length === 0) {
      warnings.push(`No players found for group ${a}`);
      continue;
    }

    cat.groups.push({ name: formatGroupName(a.replace(/^s-|^d-|^m-/i, '')), members });
  }
}

function pushMatch(payload, warnings, { categoryId, stage, scheduledTime, court, matchText, groupName, slotLabel, rowLabel }) {
  if (!categoryId || !stage) {
    warnings.push(`Skipped ${rowLabel}: could not read event`);
    return;
  }

  const sides = parseMatchSides(matchText);
  const entry = {
    scheduledTime,
    court,
    side1: sides.side1,
    side2: sides.side2,
    placeholder: sides.placeholder,
    label: sides.label || matchText,
    stage,
    groupName: groupName || null,
    slotLabel: slotLabel || null,
    seed1: sides.seed1 || null,
    seed2: sides.seed2 || null
  };

  if (stage === 'group') {
    if (!sides.side1 || !sides.side2) {
      warnings.push(`Group match missing players: "${matchText}"`);
      return;
    }
    payload.categories[categoryId].groupMatches.push(entry);
  } else {
    payload.categories[categoryId].knockoutMatches.push(entry);
  }

  if (court) payload.maxCourts = Math.max(payload.maxCourts, court);
}

function parseGridSchedule(rows, headerIdx, payload, warnings) {
  const labels = headerLabels(rows[headerIdx]);
  const timeIdx = labels.findIndex((v) => v.includes('time'));
  const courtCols = [];
  labels.forEach((label, idx) => {
    if (idx === timeIdx) return;
    const court = parseCourt(label) || parseCourt(rows[headerIdx][idx]);
    if (court) courtCols.push({ idx, court });
  });
  if (timeIdx < 0 || courtCols.length < 2) return false;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const timeRaw = row[timeIdx];
    const scheduledTime = parseTime(timeRaw);
    const cells = courtCols.map((c) => cellText(row[c.idx])).filter(Boolean);

    if (!scheduledTime) {
      if (cells.length === 0) continue;
      continue;
    }

    for (const col of courtCols) {
      const parsed = parseFixtureCell(row[col.idx]);
      if (!parsed) continue;
      const categoryId = detectCategory(parsed.categoryText);
      const stage = detectStage(parsed.stageLabel) || detectStage(parsed.matchText);
      const groupName = /^group\s+/i.test(parsed.stageLabel) ? formatGroupName(parsed.stageLabel) : null;
      pushMatch(payload, warnings, {
        categoryId,
        stage,
        scheduledTime,
        court: col.court,
        matchText: parsed.matchText,
        groupName,
        slotLabel: stage === 'group' ? null : parsed.stageLabel,
        rowLabel: `row ${i + 1} court ${col.court}`
      });
    }
  }

  return true;
}

function parseColumnSchedule(rows, payload, warnings) {
  let headerIdx = -1;
  let col = { time: 0, court: 1, event: 2, match: 3 };

  for (let i = 0; i < rows.length; i++) {
    const labels = headerLabels(rows[i]);
    const timeIdx = labels.findIndex((v) => v === 'time');
    const courtIdx = labels.findIndex((v) => v.includes('court'));
    const eventIdx = labels.findIndex((v) => v.includes('event') || v.includes('round'));
    const matchIdx = labels.findIndex((v) => v === 'match' || v.includes('fixture'));
    if (timeIdx >= 0 && matchIdx >= 0) {
      headerIdx = i;
      col = {
        time: timeIdx,
        court: courtIdx >= 0 ? courtIdx : 1,
        event: eventIdx >= 0 ? eventIdx : 2,
        match: matchIdx
      };
      break;
    }
  }

  if (headerIdx < 0) return false;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const event = cellText(row[col.event]);
    const matchText = cellText(row[col.match]);
    if (!event && !matchText) continue;

    pushMatch(payload, warnings, {
      categoryId: detectCategory(event) || detectCategory(matchText),
      stage: detectStage(event) || detectStage(matchText),
      scheduledTime: parseTime(row[col.time]),
      court: parseCourt(row[col.court]),
      matchText,
      groupName: null,
      rowLabel: `row ${i + 1}`
    });
  }

  return true;
}

function parseGroupsSheet(rows, payload, warnings) {
  if (!rows.length) return;
  if (parseTabularGroups(rows, payload, warnings)) return;
  parseLegacyGroups(rows, payload, warnings);
}

function parseScheduleSheet(rows, payload, warnings) {
  if (!rows.length) {
    warnings.push('No schedule sheet found.');
    return;
  }

  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const labels = headerLabels(rows[i]);
    const courtHeaders = labels.filter((v) => /court\s*\d+/.test(v));
    if (labels.some((v) => v.includes('time')) && courtHeaders.length >= 2) {
      parseGridSchedule(rows, i, payload, warnings);
      return;
    }
  }

  if (!parseColumnSchedule(rows, payload, warnings)) {
    warnings.push('Could not read the schedule sheet. Use Time across Court 1–4, or Time / Court / Event / Match.');
  }
}

function inferGroupsFromMatches(payload) {
  for (const categoryId of CATEGORY_IDS) {
    const cat = payload.categories[categoryId];
    if (cat.groups.length > 0 || cat.groupMatches.length === 0) continue;

    const byGroup = new Map();
    for (const match of cat.groupMatches) {
      const name = match.groupName || 'Group A';
      if (!byGroup.has(name)) byGroup.set(name, { name, members: [], seen: new Set() });
      const group = byGroup.get(name);
      for (const side of [match.side1, match.side2]) {
        const key = memberKey(side);
        if (key && !group.seen.has(key)) {
          group.seen.add(key);
          group.members.push(side);
        }
      }
    }
    cat.groups = [...byGroup.values()].map(({ name, members }) => ({ name, members }));
  }
}

/**
 * @param {ArrayBuffer} buffer
 * @returns {{ categories: object, maxCourts: number, warnings: string[], stats: object }}
 */
export function parseTournamentExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const warnings = [];
  const payload = {
    maxCourts: 0,
    categories: {
      'mens-singles': emptyCategory(),
      'mens-doubles': emptyCategory(),
      'mixed-doubles': emptyCategory()
    }
  };

  const groupRows = sheetRows(findSheet(wb, ['group']));
  const scheduleRows = sheetRows(findSheet(wb, ['schedule', 'fixture', 'final']));

  if (!groupRows.length && !scheduleRows.length) {
    throw new Error('No Groups or Schedule sheet found in this Excel file.');
  }

  parseGroupsSheet(groupRows, payload, warnings);
  parseScheduleSheet(scheduleRows, payload, warnings);
  inferGroupsFromMatches(payload);

  const stats = { participants: 0, groups: 0, groupMatches: 0, knockoutMatches: 0 };
  for (const categoryId of CATEGORY_IDS) {
    const cat = payload.categories[categoryId];
    stats.groups += cat.groups.length;
    stats.participants += cat.groups.reduce((n, g) => n + g.members.length, 0);
    stats.groupMatches += cat.groupMatches.length;
    stats.knockoutMatches += cat.knockoutMatches.length;
  }

  if (stats.participants === 0 && stats.groupMatches === 0) {
    throw new Error('No players or matches were found. Use the Groups + Final Schedule format.');
  }

  return { ...payload, warnings, stats };
}

export { CATEGORY_IDS };
