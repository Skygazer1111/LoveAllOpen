/**
 * Rules Page — Tournament regulations
 */

import { store } from '../../data/store.js';
import { initMotion } from '../../ui/motion.js';
import { renderFooter } from '../../ui/layout/footer.js';

const RULE_SECTIONS = [
  {
    id: 'scoring',
    title: 'Scoring',
    icon: 'bx-trophy',
    rules: [
      {
        title: '21 points per game',
        text: 'Each game is played to 21 points using rally scoring.'
      },
      {
        title: 'Golden point',
        text: 'At 20–20, the next point wins the game — no extra points beyond 21.'
      }
    ]
  },
  {
    id: 'court',
    title: 'Court',
    icon: 'bx-transfer-alt',
    rules: [
      {
        title: 'Side change at 11',
        text: 'In the third game, players change ends when one side reaches 11 points.'
      }
    ]
  },
  {
    id: 'format',
    title: 'Tournament format',
    icon: 'bx-grid-alt',
    rules: [
      {
        title: 'Group stage',
        text: 'All categories begin with round-robin groups. Standings decide who advances.'
      },
      {
        title: 'Knockout',
        text: 'The top two from each group qualify for the quarter-finals and progress through the knockout draw.'
      }
    ]
  },
  {
    id: 'equipment',
    title: 'Equipment & attire',
    icon: 'bx-shopping-bag',
    rules: [
      {
        title: 'Shuttles',
        text: null // filled from settings in render
      },
      {
        title: 'Shoes',
        text: 'Bring your own non-marking court shoes. Outdoor or marking soles are not allowed on court.'
      },
      {
        title: 'Rackets',
        text: 'Bring your own racket(s). Spare rackets are recommended for doubles and mixed pairs.'
      }
    ]
  },
  {
    id: 'matchday',
    title: 'Match day',
    icon: 'bx-time-five',
    rules: [
      {
        title: 'Report early',
        text: 'Be at the venue at least 15 minutes before your scheduled reporting time so warm-up and court changes run smoothly.'
      },
      {
        title: 'Check fixtures',
        text: 'Confirm your match time and court on the Fixtures page before you travel. Times may shift as the day progresses.'
      }
    ]
  },
  {
    id: 'conduct',
    title: 'Conduct',
    icon: 'bx-shield-quarter',
    rules: [
      {
        title: 'Referee is final',
        text: 'The on-court referee’s decision is final. Queries are handled calmly through the organiser, not during live play.'
      },
      {
        title: 'Fair play',
        text: 'Respect officials, opponents, and fellow players. Unsportsmanlike behaviour may lead to disqualification.'
      }
    ]
  }
];

function renderRuleCard(rule) {
  return `
    <article class="rule-card" data-reveal>
      <h3 class="rule-card-title">${rule.title}</h3>
      <p class="rule-card-text">${rule.text}</p>
    </article>
  `;
}

function renderRuleSection(section, settings) {
  const rules = section.rules.map((rule) => {
    if (section.id === 'equipment' && rule.title === 'Shuttles') {
      return { ...rule, text: `${settings.shuttles || 'Yonex Mavis 350'} shuttles are used for all matches.` };
    }
    return rule;
  });

  return `
    <section class="rules-section" id="rules-${section.id}" data-reveal>
      <div class="rules-section-head">
        <span class="rules-section-icon" aria-hidden="true"><i class='bx ${section.icon}'></i></span>
        <h2 class="rules-section-title">${section.title}</h2>
      </div>
      <div class="rules-grid" data-stagger>
        ${rules.map(renderRuleCard).join('')}
      </div>
    </section>
  `;
}

export function renderRulesPage() {
  const settings = store.getSettings();

  return `
    <div class="page" id="rules-page">
      <header class="page-hero">
        <div class="page-hero-inner">
          <p class="eyebrow">Regulations</p>
          <h1 class="page-title">Tournament rules</h1>
          <p class="page-subtitle">
            Scoring, format, and match-day expectations for LoveAll Open ${settings.tournamentDate ? `— ${settings.tournamentDate}` : '2026'}.
          </p>
        </div>
      </header>

      <div class="page-content">
        <div class="rules-intro" data-reveal>
          <p>
            Please read these before match day. When in doubt, the on-court referee and tournament organiser have the final say.
          </p>
          <a href="#/schedule" class="btn btn-outline btn-sm">View fixtures</a>
        </div>

        ${RULE_SECTIONS.map((section) => renderRuleSection(section, settings)).join('')}

        ${renderFooter()}
      </div>
    </div>
  `;
}

export function initRulesPage() {
  initMotion(document.getElementById('rules-page') || document);
}
