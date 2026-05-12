// ─────────────────────────────────────────────────────────────────────────────
// Wikipedia / Wikimedia API
//
// Tre API disponibili:
//   1. Wikimedia REST API v1  → https://en.wikipedia.org/api/rest_v1/
//   2. MediaWiki REST API     → https://en.wikipedia.org/w/rest.php/v1/
//   3. MediaWiki Action API   → https://en.wikipedia.org/w/api.php
//
// Nessuna API key richiesta per le richieste in sola lettura.
// Imposta sempre un User-Agent identificativo come da linee guida Wikimedia.
// Rate limit: max 200 richieste/secondo.
// ─────────────────────────────────────────────────────────────────────────────

const LANG = 'en'; // lingua Wikipedia (es. 'it', 'fr', 'de', ...)

const REST_V1_BASE   = `https://${LANG}.wikipedia.org/api/rest_v1`;
const MEDIAWIKI_BASE = `https://${LANG}.wikipedia.org/w/rest.php/v1`;
const ACTION_BASE    = `https://${LANG}.wikipedia.org/w/api.php`;

const USER_AGENT = 'MyApp/1.0 (myemail@example.com)';

const defaultHeaders = {
  'Api-User-Agent': USER_AGENT,
};

// ─────────────────────────────────────────────
// 1. WIKIMEDIA REST API v1
//    Base: https://en.wikipedia.org/api/rest_v1
// ─────────────────────────────────────────────

/** Ottieni il sommario di un articolo (titolo, estratto, immagine, coordinate) */
const getPageSummary = async (title) => {
  const response = await fetch(`${REST_V1_BASE}/page/summary/${encodeURIComponent(title)}`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.json();
  console.error('Error fetching page summary:', response.status);
};

/** Ottieni il contenuto HTML completo di un articolo */
const getPageHtml = async (title) => {
  const response = await fetch(`${REST_V1_BASE}/page/html/${encodeURIComponent(title)}`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.text();
  console.error('Error fetching page HTML:', response.status);
};

/** Ottieni il contenuto in formato MobileHTML (ottimizzato per mobile) */
const getPageMobileHtml = async (title) => {
  const response = await fetch(`${REST_V1_BASE}/page/mobile-html/${encodeURIComponent(title)}`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.text();
  console.error('Error fetching mobile HTML:', response.status);
};

/** Ottieni i media (immagini, video, audio) usati in una pagina */
const getPageMedia = async (title) => {
  const response = await fetch(`${REST_V1_BASE}/page/media-list/${encodeURIComponent(title)}`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.json();
  console.error('Error fetching page media:', response.status);
};

/** Ottieni un articolo casuale */
const getRandomPage = async () => {
  const response = await fetch(`${REST_V1_BASE}/page/random/summary`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.json();
  console.error('Error fetching random page:', response.status);
};

/** Ottieni il PDF di un articolo */
const getPagePdf = async (title) => {
  const response = await fetch(`${REST_V1_BASE}/page/pdf/${encodeURIComponent(title)}`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.blob(); // PDF binario
  console.error('Error fetching page PDF:', response.status);
};

/** Ottieni i metadati di una revisione specifica */
const getPageRevision = async (title) => {
  const response = await fetch(`${REST_V1_BASE}/page/title/${encodeURIComponent(title)}`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.json();
  console.error('Error fetching page revision:', response.status);
};

// ─────────────────────────────────────────────
// 2. MEDIAWIKI REST API
//    Base: https://en.wikipedia.org/w/rest.php/v1
// ─────────────────────────────────────────────

/** Cerca pagine per titolo (prefix search) */
const searchByTitle = async (query, limit = 10) => {
  const url = new URL(`${MEDIAWIKI_BASE}/search/title`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', limit);
  const response = await fetch(url, { headers: defaultHeaders });
  if (response.ok) return await response.json();
  console.error('Error searching by title:', response.status);
};

/** Cerca pagine per contenuto (full-text search) */
const searchByContent = async (query, limit = 10) => {
  const url = new URL(`${MEDIAWIKI_BASE}/search/page`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', limit);
  const response = await fetch(url, { headers: defaultHeaders });
  if (response.ok) return await response.json();
  console.error('Error searching by content:', response.status);
};

/** Ottieni i dati di una pagina (sorgente wikitext, ultima revisione) */
const getPage = async (title) => {
  const response = await fetch(`${MEDIAWIKI_BASE}/page/${encodeURIComponent(title)}`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.json();
  console.error('Error fetching page:', response.status);
};

/** Ottieni il wikitext sorgente di una pagina */
const getPageWikitext = async (title) => {
  const response = await fetch(`${MEDIAWIKI_BASE}/page/${encodeURIComponent(title)}/bare`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.json();
  console.error('Error fetching page wikitext:', response.status);
};

/** Ottieni la cronologia delle revisioni di una pagina */
const getPageHistory = async (title) => {
  const response = await fetch(`${MEDIAWIKI_BASE}/page/${encodeURIComponent(title)}/history`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.json();
  console.error('Error fetching page history:', response.status);
};

/** Ottieni il conteggio delle revisioni di una pagina */
const getPageHistoryCount = async (title) => {
  const response = await fetch(`${MEDIAWIKI_BASE}/page/${encodeURIComponent(title)}/history/counts/edits`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.json();
  console.error('Error fetching page history count:', response.status);
};

/** Ottieni i link a file/media usati in una pagina */
const getPageMediaLinks = async (title) => {
  const response = await fetch(`${MEDIAWIKI_BASE}/page/${encodeURIComponent(title)}/links/media`, {
    headers: defaultHeaders,
  });
  if (response.ok) return await response.json();
  console.error('Error fetching page media links:', response.status);
};



// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

export {
  // Wikimedia REST API v1
  getPageSummary,
  getPageHtml,
  getPageMobileHtml,
  getPageMedia,
  getRandomPage,
  getPagePdf,
  getPageRevision,
};