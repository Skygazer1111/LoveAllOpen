/**
 * Export full tournament PDF — participants, groups, fixtures, and knockout bracket.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  store,
  getParticipantDisplayName,
  getMatchSideName,
  formatMatchTime
} from '../../data/store.js';

const FOREST = [31, 107, 69];
const INK = [16, 36, 26];
const MUTED = [122, 141, 130];
const LINE = [213, 223, 215];
const MIST = [247, 248, 245];
const ACCENT = [214, 239, 74];

function safeFileStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function ensureSpace(doc, y, need = 40, marginX = 14) {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + need > pageH - 14) {
    doc.addPage();
    return 16;
  }
  return y;
}

function sectionTitle(doc, text, y, marginX = 14) {
  y = ensureSpace(doc, y, 16, marginX);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...FOREST);
  doc.text(text, marginX, y);
  return y + 6;
}

function subTitle(doc, text, y, marginX = 14) {
  y = ensureSpace(doc, y, 12, marginX);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(text, marginX, y);
  return y + 4;
}

function matchMeta(match) {
  const bits = [];
  if (match.scheduledTime) bits.push(formatMatchTime(match.scheduledTime));
  if (match.court) bits.push(`Court ${match.court}`);
  return bits.join(' · ') || '—';
}

function matchResult(match) {
  if (match.status === 'completed') {
    const s1 = match.score1 != null ? match.score1 : '–';
    const s2 = match.score2 != null ? match.score2 : '–';
    return `${s1}–${s2}`;
  }
  if (match.status === 'live') return 'LIVE';
  return 'Upcoming';
}

function participantRows(categoryId, cat) {
  const participants = store.getParticipants(categoryId);
  const isSingles = cat.type === 'singles';

  if (isSingles) {
    return {
      head: [['#', 'Player']],
      body: participants.map((p, i) => [String(i + 1), getParticipantDisplayName(p, '—')])
    };
  }

  return {
    head: [['#', 'Player 1', 'Player 2']],
    body: participants.map((p, i) => [
      String(i + 1),
      (p.player1 || '').trim() || '—',
      (p.player2 || '').trim() || '—'
    ])
  };
}

function groupRows(categoryId, group) {
  return group.participantIds
    .map((id) => store.getParticipantById(categoryId, id))
    .filter(Boolean)
    .map((p, i) => [String(i + 1), getParticipantDisplayName(p, '—')]);
}

function groupFixtureRows(categoryId, groups) {
  const rows = [];
  for (const group of groups) {
    const matches = [...(group.matches || [])].sort((a, b) => {
      const t = String(a.scheduledTime || '99:99').localeCompare(String(b.scheduledTime || '99:99'));
      if (t !== 0) return t;
      return (a.court || 0) - (b.court || 0);
    });
    for (const match of matches) {
      rows.push([
        matchMeta(match),
        group.name,
        getMatchSideName(categoryId, match, 1),
        getMatchSideName(categoryId, match, 2),
        matchResult(match)
      ]);
    }
  }
  return rows;
}

function knockoutFixtureRows(categoryId, knockout) {
  const rows = [];
  (knockout.rounds || []).forEach((round) => {
    for (const match of round.matches || []) {
      rows.push([
        matchMeta(match),
        round.name,
        getMatchSideName(categoryId, match, 1),
        getMatchSideName(categoryId, match, 2),
        matchResult(match)
      ]);
    }
  });
  return rows;
}

function masterScheduleRows() {
  const items = [];
  for (const cat of Object.values(store.getCategories())) {
    for (const group of cat.groups || []) {
      for (const match of group.matches || []) {
        items.push({
          time: match.scheduledTime || '99:99',
          court: match.court || 99,
          category: cat.name,
          stage: group.name,
          side1: getMatchSideName(cat.id, match, 1),
          side2: getMatchSideName(cat.id, match, 2),
          result: matchResult(match)
        });
      }
    }
    for (const round of cat.knockout?.rounds || []) {
      for (const match of round.matches || []) {
        items.push({
          time: match.scheduledTime || '99:99',
          court: match.court || 99,
          category: cat.name,
          stage: round.name,
          side1: getMatchSideName(cat.id, match, 1),
          side2: getMatchSideName(cat.id, match, 2),
          result: matchResult(match)
        });
      }
    }
  }

  items.sort((a, b) => {
    const t = String(a.time).localeCompare(String(b.time));
    if (t !== 0) return t;
    return a.court - b.court;
  });

  return items.map((m) => [
    m.time === '99:99' ? '—' : formatMatchTime(m.time),
    m.court === 99 ? '—' : `C${m.court}`,
    m.category,
    m.stage,
    `${m.side1}  vs  ${m.side2}`,
    m.result
  ]);
}

function tableDefaults(doc, marginX) {
  return {
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 2.4,
      textColor: INK,
      lineColor: LINE,
      lineWidth: 0.2,
      overflow: 'linebreak',
      valign: 'middle'
    },
    headStyles: {
      fillColor: FOREST,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: { fillColor: MIST },
    margin: { left: marginX, right: marginX }
  };
}

function drawMatchBox(doc, x, y, w, h, match, categoryId, roundName) {
  doc.setDrawColor(...LINE);
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, w, h, 1.2, 1.2, 'FD');

  const name1 = getMatchSideName(categoryId, match, 1);
  const name2 = getMatchSideName(categoryId, match, 2);
  const meta = matchMeta(match);
  const p1Win = match.status === 'completed' && match.winner === match.player1Id;
  const p2Win = match.status === 'completed' && match.winner === match.player2Id;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...FOREST);
  doc.text(`${roundName} · M${match.matchNumber}`, x + 2, y + 4, { maxWidth: w - 4 });

  if (meta !== '—') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...MUTED);
    doc.text(meta, x + 2, y + 7.2, { maxWidth: w - 4 });
  }

  const mid = y + h / 2 + 1;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.line(x + 1.5, mid - 1.2, x + w - 1.5, mid - 1.2);

  doc.setFont('helvetica', p1Win ? 'bold' : 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...(p1Win ? FOREST : INK));
  doc.text(doc.splitTextToSize(name1, w - 5)[0] || 'TBD', x + 2.5, mid - 3.2);

  doc.setFont('helvetica', p2Win ? 'bold' : 'normal');
  doc.setTextColor(...(p2Win ? FOREST : INK));
  doc.text(doc.splitTextToSize(name2, w - 5)[0] || 'TBD', x + 2.5, mid + 4.2);

  if (match.status === 'completed' && match.score1 != null && match.score2 != null) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text(`${match.score1}–${match.score2}`, x + w - 2.5, y + 4, { align: 'right' });
  }
}

/**
 * Draw a left-to-right knockout bracket flowchart.
 */
function drawKnockoutBracket(doc, categoryId, knockout, startY, marginX) {
  const rounds = knockout.rounds || [];
  if (!rounds.length) return startY;

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const usableW = pageW - marginX * 2;
  const colCount = rounds.length;
  const gapX = 10;
  const boxW = Math.min(52, (usableW - gapX * (colCount - 1)) / colCount);
  const boxH = 22;
  const firstCount = rounds[0].matches?.length || 1;
  const rowPitch = Math.max(boxH + 8, Math.min(36, (pageH - startY - 24) / Math.max(firstCount, 1)));

  // New landscape-ish feel: if too tall, start fresh page
  let yBase = ensureSpace(doc, startY, firstCount * rowPitch + 20, marginX);
  if (yBase === 16) {
    // already new page
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('Knockout bracket', marginX, yBase);
  yBase += 8;

  const positions = []; // positions[roundIdx][matchIdx] = { x, y, cx, cy }

  rounds.forEach((round, rIdx) => {
    const matches = round.matches || [];
    const colX = marginX + rIdx * (boxW + gapX);
    positions[rIdx] = [];

    // Round header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...FOREST);
    doc.text(round.name, colX, yBase - 2, { maxWidth: boxW });

    matches.forEach((match, mIdx) => {
      let boxY;
      if (rIdx === 0) {
        boxY = yBase + mIdx * rowPitch;
      } else {
        const leftA = positions[rIdx - 1][mIdx * 2];
        const leftB = positions[rIdx - 1][mIdx * 2 + 1];
        if (leftA && leftB) {
          boxY = (leftA.y + leftB.y) / 2;
        } else if (leftA) {
          boxY = leftA.y;
        } else {
          boxY = yBase + mIdx * rowPitch * Math.pow(2, rIdx);
        }
      }

      // Page overflow: push remaining content to next page once
      if (boxY + boxH > pageH - 12) {
        doc.addPage();
        yBase = 20;
        boxY = yBase + mIdx * rowPitch;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...INK);
        doc.text(`${store.getCategory(categoryId)?.name || ''} bracket (cont.)`, marginX, 14);
      }

      drawMatchBox(doc, colX, boxY, boxW, boxH, match, categoryId, round.name);
      positions[rIdx][mIdx] = {
        x: colX,
        y: boxY,
        cx: colX + boxW,
        cy: boxY + boxH / 2,
        lx: colX,
        ly: boxY + boxH / 2
      };
    });
  });

  // Connector lines between rounds
  doc.setDrawColor(...FOREST);
  doc.setLineWidth(0.45);
  for (let rIdx = 0; rIdx < rounds.length - 1; rIdx++) {
    const next = positions[rIdx + 1] || [];
    next.forEach((target, mIdx) => {
      if (!target) return;
      const a = positions[rIdx][mIdx * 2];
      const b = positions[rIdx][mIdx * 2 + 1];
      const midX = (a?.cx ?? target.lx) + gapX / 2;
      if (a) {
        doc.line(a.cx, a.cy, midX, a.cy);
        doc.line(midX, a.cy, midX, target.ly);
      }
      if (b) {
        doc.line(b.cx, b.cy, midX, b.cy);
        doc.line(midX, b.cy, midX, target.ly);
      }
      doc.line(midX, target.ly, target.lx, target.ly);
    });
  }

  const lastRound = positions[positions.length - 1] || [];
  const bottom = lastRound.reduce((max, p) => Math.max(max, (p?.y || 0) + boxH), yBase);
  return bottom + 14;
}

function addFooter(doc) {
  const pages = doc.getNumberOfPages();
  const marginX = 14;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `LoveAll Club · Full fixtures · Page ${i} of ${pages}`,
      marginX,
      doc.internal.pageSize.getHeight() - 8
    );
  }
}

/**
 * Build and download the full tournament fixtures PDF.
 */
export function downloadParticipantsPdf() {
  return downloadTournamentPdf();
}

export function downloadTournamentPdf() {
  const settings = store.getSettings();
  const categories = Object.values(store.getCategories());
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const marginX = 14;
  let y = 16;

  // Cover header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...INK);
  doc.text(settings.tournamentName || 'LoveAll Open Tournament', marginX, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const meta = [
    settings.tournamentDate,
    settings.tournamentTime,
    settings.venueShort || settings.venue,
    settings.level,
    `${settings.courts || 4} courts`
  ].filter(Boolean).join('  ·  ');
  doc.text(meta, marginX, y, { maxWidth: 180 });
  y += 5;
  doc.text(`Full fixtures export · ${new Date().toLocaleString()}`, marginX, y);
  y += 10;

  // Master schedule
  const master = masterScheduleRows();
  if (master.length) {
    y = sectionTitle(doc, 'Full match schedule (all categories)', y, marginX);
    autoTable(doc, {
      startY: y,
      head: [['Time', 'Court', 'Category', 'Round', 'Match', 'Result']],
      body: master,
      ...tableDefaults(doc, marginX),
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 14, halign: 'center' },
        2: { cellWidth: 28 },
        3: { cellWidth: 24 },
        5: { cellWidth: 18, halign: 'center' }
      }
    });
    y = (doc.lastAutoTable?.finalY || y) + 10;
  }

  for (const cat of categories) {
    const participants = store.getParticipants(cat.id);
    const groups = store.getGroups(cat.id);
    const knockout = store.getKnockout(cat.id);

    doc.addPage();
    y = 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...FOREST);
    doc.text(cat.name, marginX, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(
      `${participants.length} ${cat.type === 'singles' ? 'player' : 'pair'}${participants.length === 1 ? '' : 's'} · ${groups.length} group${groups.length === 1 ? '' : 's'} · ${(knockout.rounds || []).length} knockout round${(knockout.rounds || []).length === 1 ? '' : 's'}`,
      marginX,
      y
    );
    y += 8;

    // Participants
    y = sectionTitle(doc, 'Participants', y, marginX);
    if (participants.length === 0) {
      doc.setTextColor(...MUTED);
      doc.text('No participants yet.', marginX, y);
      y += 8;
    } else {
      const { head, body } = participantRows(cat.id, cat);
      autoTable(doc, {
        startY: y,
        head,
        body,
        ...tableDefaults(doc, marginX),
        styles: { ...tableDefaults(doc, marginX).styles, fontSize: 9 },
        columnStyles: { 0: { cellWidth: 12, halign: 'center' } }
      });
      y = (doc.lastAutoTable?.finalY || y) + 8;
    }

    // Groups
    if (groups.length) {
      y = sectionTitle(doc, 'Groups', y, marginX);
      for (const group of groups) {
        y = subTitle(doc, group.name, y, marginX);
        const rows = groupRows(cat.id, group);
        autoTable(doc, {
          startY: y,
          head: [['#', 'Participant']],
          body: rows.length ? rows : [['—', 'Empty group']],
          ...tableDefaults(doc, marginX),
          headStyles: {
            fillColor: [28, 58, 44],
            textColor: ACCENT,
            fontStyle: 'bold',
            fontSize: 8.5
          },
          columnStyles: { 0: { cellWidth: 12, halign: 'center' } }
        });
        y = (doc.lastAutoTable?.finalY || y) + 6;
      }
      y += 2;
    }

    // Group fixtures
    const groupFixtures = groupFixtureRows(cat.id, groups);
    if (groupFixtures.length) {
      y = sectionTitle(doc, 'Group stage fixtures', y, marginX);
      autoTable(doc, {
        startY: y,
        head: [['Time / Court', 'Group', 'Side 1', 'Side 2', 'Result']],
        body: groupFixtures,
        ...tableDefaults(doc, marginX),
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 22 },
          4: { cellWidth: 18, halign: 'center' }
        }
      });
      y = (doc.lastAutoTable?.finalY || y) + 8;
    }

    // Knockout fixtures table
    const koFixtures = knockoutFixtureRows(cat.id, knockout);
    if (koFixtures.length) {
      y = sectionTitle(doc, 'Knockout fixtures', y, marginX);
      autoTable(doc, {
        startY: y,
        head: [['Time / Court', 'Round', 'Side 1', 'Side 2', 'Result']],
        body: koFixtures,
        ...tableDefaults(doc, marginX),
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 28 },
          4: { cellWidth: 18, halign: 'center' }
        }
      });
      y = (doc.lastAutoTable?.finalY || y) + 10;
    }

    // Bracket flowchart on its own landscape page for clarity
    if ((knockout.rounds || []).length > 0) {
      doc.addPage('a4', 'landscape');
      let by = 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...FOREST);
      doc.text(`${cat.name} — Knockout flowchart`, marginX, by);
      by += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text('Winners advance along the connectors to the next round.', marginX, by);
      by += 8;
      drawKnockoutBracket(doc, cat.id, knockout, by, marginX);
    }
  }

  addFooter(doc);

  const filename = `LoveAll_Full_Fixtures_${safeFileStamp()}.pdf`;
  doc.save(filename);
  return filename;
}
