/**
 * Shared site footer
 */

export function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="footer">
      <img src="/images/icon.png" alt="LoveAll Club" class="footer-logo" />
      <p class="footer-text">Organised by <span class="footer-brand">LoveAll Club</span></p>
      <nav class="footer-links" aria-label="Legal">
        <a href="#/privacy">Privacy Policy</a>
        <span class="footer-links-sep" aria-hidden="true">·</span>
        <a href="#/terms">Terms of Use</a>
      </nav>
      <p class="footer-copyright">© ${year} LoveAll Club</p>
    </footer>
  `;
}
