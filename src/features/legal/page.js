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
          <p class="page-subtitle">Last updated: 13 August 2026 · LoveAll Open Badminton Tournament 2026</p>
        </header>

        <article class="legal-body">
          <section>
            <h2>1. Who we are</h2>
            <p>
              This website is operated by <strong>LoveAll Club</strong> (“we”, “us”, “our”) for the
              LoveAll Open Badminton Tournament 2026. It publishes event details, venue information,
              live fixtures, standings, and results for participants and spectators.
            </p>
          </section>

          <section>
            <h2>2. Information we collect</h2>
            <p>Depending on how you use the site, we may process:</p>
            <ul>
              <li>
                <strong>Tournament data</strong> entered by authorised organisers — player names,
                doubles/mixed pair names (Player 1 &amp; Player 2), categories, match times, courts,
                scores, winners, and standings.
              </li>
              <li>
                <strong>Device storage</strong> — tournament data and admin session state may be kept
                in your browser’s local storage / session storage so the site works on this device.
              </li>
              <li>
                <strong>Live board data</strong> — when organisers publish fixtures, the same tournament
                information may be stored on our hosting provider so other visitors can see live updates.
              </li>
              <li>
                <strong>Contact details</strong> you share voluntarily when you message organisers on
                WhatsApp or follow / message us on Instagram.
              </li>
            </ul>
            <p>
              You do not need a public user account to view fixtures or event details.
              Organiser phone numbers are not shown on the public pages; WhatsApp opens through a
              server redirect so the number is not embedded in the website code.
            </p>
          </section>

          <section>
            <h2>3. How we use information</h2>
            <p>We use information to:</p>
            <ul>
              <li>Display schedules, courts, standings, and live results</li>
              <li>Let organisers manage participants, groups, knockouts, and match outcomes</li>
              <li>Publish a shared live board so spectators can follow matches on their phones</li>
              <li>Allow organisers to export printable participant lists (PDF) for event operations</li>
              <li>Respond to enquiries about the event</li>
              <li>Keep the website working reliably on your device</li>
            </ul>
          </section>

          <section>
            <h2>4. Local storage, live board &amp; admin access</h2>
            <p>
              Tournament data may be saved in your browser and, when organisers publish, on our live-board
              storage (for example a hosted key-value store used by this site). Admin features are
              password-protected and intended only for authorised organisers. Anyone with access to a
              device where admin data is stored, or who can view the public fixtures page, may see
              participant names and results that organisers have published.
            </p>
          </section>

          <section>
            <h2>5. Sharing</h2>
            <p>
              Player and pair names, fixtures, times, courts, and results shown on the public site are
              visible to visitors. Organisers may also download PDF lists of participants for use at
              the venue. We do not sell personal information. We may share limited details with venue
              partners or co-organisers only as needed to run the event.
            </p>
          </section>

          <section>
            <h2>6. Third-party services</h2>
            <p>
              The site may embed or link to third-party services, including Google Maps, WhatsApp,
              Instagram, and our hosting provider (for example Vercel). Those services have their own
              privacy practices. We are not responsible for content or data handling on external platforms.
            </p>
          </section>

          <section>
            <h2>7. Data retention</h2>
            <p>
              Public tournament information may remain available for the duration of the event and
              afterwards for archival or community purposes. Locally stored data remains on your device
              until cleared by you or reset by an organiser using admin tools. Published live-board data
              remains until organisers overwrite or clear it.
            </p>
          </section>

          <section>
            <h2>8. Your choices</h2>
            <p>
              You can clear site data from your browser settings. If you want a player or pair name
              corrected or removed from the public schedule where practical, contact the organisers
              using the WhatsApp button on the home page.
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
              button on the home page, or reach LoveAll Club via
              <a href="https://www.instagram.com/loveall_badminton?utm_source=qr" target="_blank" rel="noopener noreferrer">Instagram</a>.
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
          <p class="page-subtitle">Last updated: 13 August 2026 · LoveAll Open Badminton Tournament 2026</p>
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
              venue location, live fixtures, standings, knockout brackets, and results. It also links to LoveAll Club
              on Instagram. It is an event companion site operated by LoveAll Club.
            </p>
          </section>

          <section>
            <h2>3. Participation &amp; registration</h2>
            <p>
              Entering the tournament is subject to organiser rules, category eligibility, and any venue requirements.
              Singles entries use a player name; doubles and mixed doubles use the two players’ names (no separate team name).
              Publishing a name or fixture on this site does not itself create a contract of participation.
              Check-in and on-court rules are managed by the organisers and venue.
            </p>
          </section>

          <section>
            <h2>4. Fixtures, scores &amp; live updates</h2>
            <p>
              Schedules, courts, and results are updated by authorised admins / referees and may change without notice
              (walkovers, delays, court changes, corrections). Matches may be marked live; winners may be selected with
              or without scores; in knockout rounds, winners advance automatically. While we aim for accuracy, organiser
              announcements and the on-site board at the venue take priority if there is any conflict with the website.
            </p>
          </section>

          <section>
            <h2>5. Admin tools &amp; exports</h2>
            <p>
              Admin features (including adding participants, setting times, picking winners, exporting a participants PDF,
              and importing backup data) are for authorised organisers only. Misuse of admin access, or attempting to
              alter published results without permission, is prohibited.
            </p>
          </section>

          <section>
            <h2>6. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Attempt to access admin features without authorisation</li>
              <li>Tamper with, scrape abusively, or disrupt the website or live board</li>
              <li>Misuse published player names or contact channels</li>
              <li>Post or transmit unlawful, harmful, or misleading content through channels linked from this site</li>
            </ul>
          </section>

          <section>
            <h2>7. Intellectual property</h2>
            <p>
              LoveAll Club branding, event artwork, and site content are owned by LoveAll Club or used with permission.
              You may view and share links to public pages for personal, non-commercial purposes.
              Do not copy the site design or materials for commercial use without permission.
            </p>
          </section>

          <section>
            <h2>8. Third-party links &amp; maps</h2>
            <p>
              Links to WhatsApp, Instagram, Google Maps, or other services are provided for convenience.
              We do not control those services and are not responsible for their availability, content, or terms.
            </p>
          </section>

          <section>
            <h2>9. Disclaimer</h2>
            <p>
              The site is provided “as is”. To the fullest extent permitted by law, LoveAll Club is not liable for
              losses arising from reliance on website information, temporary outages, sync delays between devices,
              browser storage issues, or decisions made solely based on online fixtures.
            </p>
          </section>

          <section>
            <h2>10. Conduct at the event</h2>
            <p>
              Participants and spectators must follow venue rules, play fairly, and treat others with respect.
              Organisers may refuse entry or remove anyone whose behaviour is unsafe or disruptive.
            </p>
          </section>

          <section>
            <h2>11. Changes to these terms</h2>
            <p>
              We may update these Terms of Use at any time. The latest version will be posted on this page with an
              updated date. Continued use of the site after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>
              Questions about these terms or the tournament can be sent via the WhatsApp contact on the home page,
              or through
              <a href="https://www.instagram.com/loveall_badminton?utm_source=qr" target="_blank" rel="noopener noreferrer">@loveall_badminton on Instagram</a>.
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
