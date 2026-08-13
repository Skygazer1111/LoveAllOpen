/**
 * Export tournament participants as a PDF (tables by category).
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { store, getParticipantDisplayName } from '../../data/store.js';

function safeFileStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
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

/**
 * Build and download a participants PDF.
 */
export function downloadParticipantsPdf() {
  const settings = store.getSettings();
  const categories = Object.values(store.getCategories());
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const marginX = 16;
  let y = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(16, 36, 26);
  doc.text(settings.tournamentName || 'LoveAll Open Tournament', marginX, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(74, 95, 82);
  const meta = [
    settings.tournamentDate,
    settings.tournamentTime,
    settings.venueShort || settings.venue,
    settings.level
  ].filter(Boolean).join('  ·  ');
  doc.text(meta, marginX, y, { maxWidth: 178 });
  y += 6;
  doc.text(`Participants list · exported ${new Date().toLocaleString()}`, marginX, y);
  y += 10;

  for (const cat of categories) {
    const participants = store.getParticipants(cat.id);
    const groups = store.getGroups(cat.id);

    if (y > 250) {
      doc.addPage();
      y = 18;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(31, 107, 69);
    doc.text(cat.name, marginX, y);
    y += 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(122, 141, 130);
    doc.text(
      `${participants.length} ${cat.type === 'singles' ? 'player' : 'pair'}${participants.length === 1 ? '' : 's'}`,
      marginX,
      y + 5
    );
    y += 8;

    if (participants.length === 0) {
      doc.setTextColor(122, 141, 130);
      doc.setFontSize(10);
      doc.text('No participants registered yet.', marginX, y + 4);
      y += 14;
      continue;
    }

    const { head, body } = participantRows(cat.id, cat);
    autoTable(doc, {
      startY: y,
      head,
      body,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3,
        textColor: [20, 38, 28],
        lineColor: [213, 223, 215],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [31, 107, 69],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [247, 248, 245]
      },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' }
      },
      margin: { left: marginX, right: marginX }
    });

    y = (doc.lastAutoTable?.finalY || y) + 8;

    // Optional group breakdown if groups exist
    if (groups.length > 0) {
      if (y > 240) {
        doc.addPage();
        y = 18;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(16, 36, 26);
      doc.text(`${cat.name} — Groups`, marginX, y);
      y += 6;

      for (const group of groups) {
        if (y > 250) {
          doc.addPage();
          y = 18;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(31, 107, 69);
        doc.text(group.name, marginX, y);
        y += 3;

        const rows = groupRows(cat.id, group);
        autoTable(doc, {
          startY: y,
          head: [['#', 'Participant']],
          body: rows.length
            ? rows
            : [['—', 'Empty group']],
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 2.5,
            textColor: [20, 38, 28],
            lineColor: [213, 223, 215],
            lineWidth: 0.2
          },
          headStyles: {
            fillColor: [28, 58, 44],
            textColor: [214, 239, 74],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 14, halign: 'center' }
          },
          margin: { left: marginX, right: marginX }
        });
        y = (doc.lastAutoTable?.finalY || y) + 6;
      }
      y += 4;
    }

    y += 4;
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(122, 141, 130);
    doc.text(
      `LoveAll Club · Page ${i} of ${pages}`,
      marginX,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  const filename = `LoveAll_Participants_${safeFileStamp()}.pdf`;
  doc.save(filename);
  return filename;
}
