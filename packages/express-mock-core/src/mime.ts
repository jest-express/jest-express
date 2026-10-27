export const contentTypes = new Map([
  ['html', 'text/html'],
  ['json', 'application/json'],
  ['text', 'text/plain'],
  ['txt', 'text/plain'],
  ['xml', 'application/xml'],
  ['js', 'text/javascript'],
  ['css', 'text/css'],
  ['csv', 'text/csv'],
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['gif', 'image/gif'],
  ['svg', 'image/svg+xml'],
  ['pdf', 'application/pdf'],
]);

// Request-only aliases keep response Content-Type defaults unchanged.
export const requestContentTypes = new Map([
  ...contentTypes,
  ['htm', 'text/html'],
  ['mjs', 'text/javascript'],
  ['bin', 'application/octet-stream'],
  ['zip', 'application/zip'],
  ['wasm', 'application/wasm'],
  ['webp', 'image/webp'],
  ['ico', 'image/vnd.microsoft.icon'],
  ['mp3', 'audio/mpeg'],
  ['mp4', 'video/mp4'],
  ['yaml', 'text/yaml'],
  ['yml', 'text/yaml'],
  ['jsonld', 'application/ld+json'],
]);
