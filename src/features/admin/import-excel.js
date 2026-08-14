/**
 * Parse the LoveAll tournament Excel workbook
 * (Groups + Schedule sheets) into a draw payload.
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
  if (t.includes('group')) return 'group';
  if (t.includes('qf') || t.includes('quarter')) return 'qf';
  if (t.includes('sf') || t.includes('semi')) return 'sf';
  if (t.includes('final')) return 'final';
  return null;
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
  const compact = raw.replace(/\s+/g, '').toUpperCase();
  const match = compact.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/);
  if (!match) return '';
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];
  if (ampm === 'AM') {
    if (hours === 12) hours = 0;
  } else if (ampm === 'PM') {
    if (hours !== 12) hours += 12;
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

function parseMatchSides(text) {
  const raw = cellText(text);
  if (!raw) return { side1: null, side2: null, placeholder: true };
  const split = raw.split(/\s+vs\.?\s+/i);
  if (split.length < 2) {
    return { side1: null, side2: null, placeholder: true, label: raw };
  }
  return {
    side1: parseTeam(split[0]),
    side2: parseTeam(split.slice(1).join(' vs ')),
    placeholder: false,
    label: raw
  };
}

function emptyCategory() {
  return {
    groups: [],
    groupMatches: [],
    knockoutMatches: []
  };
}

function findSheet(wb, needle) {
  const name = wb.SheetNames.find((n) => n.toLowerCase().includes(needle));
  return name ? wb.Sheets[name] : null;
}

function sheetRows(sheet) {
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });
}

function parseGroupsSheet(rows, payload, warnings) {
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
        else if (team?.name) {
          warnings.push(`Could not read pair "${chunk.trim()}" in ${a}`);
        }
      }
    }

    if (members.length === 0) {
      warnings.push(`No players found for group ${a}`);
      continue;
    }

    cat.groups.push({ name: a, members });
  }
}

function parseScheduleSheet(rows, payload, warnings) {
  let headerIdx = -1;
  let col = { time: 0, court: 1, event: 2, match: 3 };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const labels = row.map((c) => normalizeName(c));
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

  if (headerIdx < 0) {
    warnings.push('Could not find a Schedule header row (Time / Court / Event / Match).');
    return;
  }

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const event = cellText(row[col.event]);
    const matchText = cellText(row[col.match]);
    if (!event && !matchText) continue;

    const categoryId = detectCategory(event) || detectCategory(matchText);
    const stage = detectStage(event) || detectStage(matchText);
    if (!categoryId || !stage) {
      warnings.push(`Skipped row ${i + 1}: could not read event "${event || matchText}"`);
      continue;
    }

    const scheduledTime = parseTime(row[col.time]);
    const court = parseCourt(row[col.court]);
    const sides = parseMatchSides(matchText);
    const entry = {
      scheduledTime,
      court,
      side1: sides.side1,
      side2: sides.side2,
      placeholder: sides.placeholder,
      label: sides.label || matchText,
      stage
    };

    if (stage === 'group') {
      if (!sides.side1 || !sides.side2) {
        warnings.push(`Group match missing players: "${matchText}"`);
        continue;
      }
      payload.categories[categoryId].groupMatches.push(entry);
    } else {
      payload.categories[categoryId].knockoutMatches.push(entry);
    }

    if (court) payload.maxCourts = Math.max(payload.maxCourts, court);
  }
}

function inferGroupsFromMatches(payload) {
  for (const categoryId of CATEGORY_IDS) {
    const cat = payload.categories[categoryId];
    if (cat.groups.length > 0 || cat.groupMatches.length === 0) continue;

    const seen = new Map();
    for (const match of cat.groupMatches) {
      for (const side of [match.side1, match.side2]) {
        const key = memberKey(side);
        if (key && !seen.has(key)) seen.set(key, side);
      }
    }
    cat.groups.push({
      name: 'Group A',
      members: [...seen.values()]
    });
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

  const groupRows = sheetRows(findSheet(wb, 'group'));
  const scheduleRows = sheetRows(findSheet(wb, 'schedule'));

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
    throw new Error('No players or matches were found. Use the Groups + Schedule format.');
  }

  return { ...payload, warnings, stats };
}

export { CATEGORY_IDS };
