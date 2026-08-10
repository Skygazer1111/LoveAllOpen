/**
 * Venue map URL helpers (home feature)
 */

const DEFAULT_QUERY = 'Toneup Badminton Thoraipakkam Chennai';

export function mapsEmbedUrl(query) {
  const q = encodeURIComponent(query || DEFAULT_QUERY);
  return `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
}

export function mapsLinkUrl(query) {
  const q = encodeURIComponent(query || DEFAULT_QUERY);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
