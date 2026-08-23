/**
 * Tournament hero slideshow — photos from assets/TournamentPhotos
 */

const modules = import.meta.glob('../../../assets/TournamentPhotos/*.{jpeg,jpg,JPEG,JPG}', {
  eager: true,
  query: '?url',
  import: 'default'
});

export const heroPhotos = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url);
