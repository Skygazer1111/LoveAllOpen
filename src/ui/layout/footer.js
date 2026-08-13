/**
 * Shared site footer
 */

export function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="footer">
      <img src="/images/icon.png" alt="LoveAll Club" class="footer-logo" />
      <p class="footer-text">Organised by <span class="footer-brand">LoveAll Club</span></p>
      <nav class="footer-links" aria-label="Legal and social">
        <a href="https://www.instagram.com/loveall_badminton?utm_source=qr" target="_blank" rel="noopener noreferrer">Instagram</a>
        <span class="footer-links-sep" aria-hidden="true">·</span>
        <a href="#/privacy">Privacy Policy</a>
        <span class="footer-links-sep" aria-hidden="true">·</span>
        <a href="#/terms">Terms of Use</a>
      </nav>
      <p class="footer-built">
        Built by
        <a href="https://portfolio-priyan.vercel.app/" target="_blank" rel="noopener noreferrer">Priyan</a>
      </p>
      <p class="footer-copyright">© ${year} LoveAll Club</p>
    </footer>
  `;
}
