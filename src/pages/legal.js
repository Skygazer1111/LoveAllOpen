/**
 * Privacy Policy & Terms of Use pages
 */

function renderLegalChrome(active) {
  const isPrivacy = active === 'privacy';
  return `
    <div class="legal-topbar">
      <a href="#/" class="btn btn-outline btn-sm legal-exit">← Exit to website</a>
      <div class="legal-switch" role="tablist" aria-label="Legal pages">
        <a href="#/privacy"
           class="legal-switch-link ${isPrivacy ? 'active' : ''}"
           role="tab"
           aria-selected="${isPrivacy}">Privacy Policy</a>
        <a href="#/terms"
           class="legal-switch-link ${!isPrivacy ? 'active' : ''}"
           role="tab"
           aria-selected="${!isPrivacy}">Terms of Use</a>
      </div>
    </div>
  `;
}

function renderLegalFooter(active) {
  const other = active === 'privacy'
    ? { href: '#/terms', label: 'Terms of Use' }
    : { href: '#/privacy', label: 'Privacy Policy' };

  return `
    <div class="legal-bottom">
      <a href="#/" class="btn btn-accent">Exit to website</a>
      <a href="${other.href}" class="btn btn-outline">View ${other.label}</a>
    </div>
  `;
}

export function renderPrivacyPage() {
  return `
    <div class="page legal-page" id="privacy-page">
      ${renderLegalChrome('privacy')}
      <div class="page-content legal-content">
        <header class="legal-header">
          <p class="eyebrow">Legal</p>
          <h1 class="page-title">Privacy Policy</h1>
          <p class="page-subtitle">Last updated: 10 August 2026 · LoveAll Open Badminton Tournament 2026</p>
        </header>

        <article class="legal-body">
          <section>
            <h2>1. Who we are</h2>
            <p>
              This website is operated by <strong>LoveAll Club</strong> (“we”, “us”, “our”) for the
              LoveAll Open Badminton Tournament 2026. It publishes event details, venue information,
              fixtures, and results for participants and spectators.
            </p>
          </section>

          <section>
            <h2>2. Information we collect</h2>
            <p>Depending on how you use the site, we may process:</p>
            <ul>
              <li><strong>Tournament data</strong> entered by organisers — player/team names, categories, match scores, and standings.</li>
              <li><strong>Technical data</strong> stored in your browser (such as local storage) so the site can remember tournament information on this device.</li>
              <li><strong>Contact details</strong> you share voluntarily when you message organisers on WhatsApp or other channels linked from the site.</li>
            </ul>
            <p>We do not require you to create a public user account to view fixtures or event details.</p>
          </section>

          <section>
            <h2>3. How we use information</h2>
            <p>We use information to:</p>
            <ul>
              <li>Display schedules, standings, and results for the tournament</li>
              <li>Help organisers manage participants, fixtures, and scores</li>
              <li>Respond to enquiries about the event</li>
              <li>Keep the website working reliably on your device</li>
            </ul>
          </section>

          <section>
            <h2>4. Local storage &amp; admin access</h2>
            <p>
              Tournament data may be saved in your browser’s local storage. Admin features are password-protected
              and intended only for authorised organisers. Anyone with access to a device where admin data is stored
              may be able to view that locally saved information.
            </p>
          </section>

          <section>
            <h2>5. Sharing</h2>
            <p>
              Player names, teams, fixtures, and results shown on the public site are visible to visitors.
              We do not sell personal information. We may share limited details with venue partners or co-organisers
              only as needed to run the event.
            </p>
          </section>

          <section>
            <h2>6. Third-party services</h2>
            <p>
              The site may embed or link to third-party services (for example Google Maps or WhatsApp).
              Those services have their own privacy practices. We are not responsible for content or data
              handling on external platforms.
            </p>
          </section>

          <section>
            <h2>7. Data retention</h2>
            <p>
              Public tournament information may remain available for the duration of the event and afterwards
              for archival or community purposes. Locally stored data remains on your device until cleared
              by you or reset by an organiser using admin tools.
            </p>
          </section>

          <section>
            <h2>8. Your choices</h2>
            <p>
              You can clear site data from your browser settings. If you want a player/team name corrected or
              removed from the public schedule where practical, contact the organisers using the details on the home page.
            </p>
          </section>

          <section>
            <h2>9. Children</h2>
            <p>
              The tournament may include younger participants. Organisers and guardians should only share
              information that is appropriate to publish on a public event website.
            </p>
          </section>

          <section>
            <h2>10. Changes</h2>
            <p>
              We may update this Privacy Policy from time to time. The “Last updated” date at the top of this
              page will change when we do. Continued use of the site after updates means you accept the revised policy.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              For privacy questions about this website or the tournament, use the WhatsApp contact
              button on the home page to reach LoveAll Club.
            </p>
          </section>
        </article>

        ${renderLegalFooter('privacy')}
      </div>
    </div>
  `;
}

export function renderTermsPage() {
  return `
    <div class="page legal-page" id="terms-page">
      ${renderLegalChrome('terms')}
      <div class="page-content legal-content">
        <header class="legal-header">
          <p class="eyebrow">Legal</p>
          <h1 class="page-title">Terms of Use</h1>
          <p class="page-subtitle">Last updated: 10 August 2026 · LoveAll Open Badminton Tournament 2026</p>
        </header>

        <article class="legal-body">
          <section>
            <h2>1. Agreement</h2>
            <p>
              By using this website, you agree to these Terms of Use. If you do not agree, please do not use the site.
              These terms apply to visitors, participants, and anyone viewing LoveAll Open tournament information online.
            </p>
          </section>

          <section>
            <h2>2. Purpose of the site</h2>
            <p>
              This website provides information about the LoveAll Open Badminton Tournament 2026, including event details,
              venue location, fixtures, standings, and results. It is an unofficial event companion site operated by LoveAll Club.
            </p>
          </section>

          <section>
            <h2>3. Participation &amp; registration</h2>
            <p>
              Entering the tournament is subject to organiser rules, category eligibility, fees, and any venue requirements.
              Publishing a name or fixture on this site does not itself create a contract of participation.
              Payment, check-in, and on-court rules are managed by the organisers and venue.
            </p>
          </section>

          <section>
            <h2>4. Fixtures, scores &amp; accuracy</h2>
            <p>
              Schedules and scores are updated by authorised admins and may change without notice (walkovers, delays,
              court changes, corrections). While we aim for accuracy, the live board or organiser announcements at the venue
              take priority if there is any conflict.
            </p>
          </section>

          <section>
            <h2>5. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Attempt to access admin features without authorisation</li>
              <li>Tamper with, scrape abusively, or disrupt the website</li>
              <li>Misuse published player names or contact details</li>
              <li>Post or transmit unlawful, harmful, or misleading content through channels linked from this site</li>
            </ul>
          </section>

          <section>
            <h2>6. Intellectual property</h2>
            <p>
              LoveAll Club branding, event artwork, and site content are owned by LoveAll Club or used with permission.
              You may view and share links to public pages for personal, non-commercial purposes.
              Do not copy the site design or materials for commercial use without permission.
            </p>
          </section>

          <section>
            <h2>7. Third-party links &amp; maps</h2>
            <p>
              Links to WhatsApp, Google Maps, or other services are provided for convenience.
              We do not control those services and are not responsible for their availability, content, or terms.
            </p>
          </section>

          <section>
            <h2>8. Disclaimer</h2>
            <p>
              The site is provided “as is”. To the fullest extent permitted by law, LoveAll Club is not liable for
              losses arising from reliance on website information, temporary outages, browser storage issues,
              or decisions made solely based on online fixtures.
            </p>
          </section>

          <section>
            <h2>9. Conduct at the event</h2>
            <p>
              Participants and spectators must follow venue rules, play fairly, and treat others with respect.
              Organisers may refuse entry or remove anyone whose behaviour is unsafe or disruptive.
            </p>
          </section>

          <section>
            <h2>10. Changes to these terms</h2>
            <p>
              We may update these Terms of Use at any time. The latest version will be posted on this page with an
              updated date. Continued use of the site after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              Questions about these terms or the tournament can be sent via the WhatsApp contact
              on the home page.
            </p>
          </section>
        </article>

        ${renderLegalFooter('terms')}
      </div>
    </div>
  `;
}

export function initPrivacyPage() {}
export function initTermsPage() {}
