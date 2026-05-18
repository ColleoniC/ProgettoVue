const LANG = 'en';
const REST_V1_BASE   = `https://${LANG}.wikipedia.org/api/rest_v1`;
const ACTION_BASE    = `https://${LANG}.wikipedia.org/w/api.php`;

const USER_AGENT = 'GlobeExplorer/1.0 (educational project)';

const defaultHeaders = {
  'Api-User-Agent': USER_AGENT,
};

// ─────────────────────────────────────────────
// WIKIMEDIA REST API v1
// Base: https://en.wikipedia.org/api/rest_v1
// ─────────────────────────────────────────────

/** Sommario di un articolo (titolo, estratto, immagine, coordinate) */
const getPageSummary = async (title) => {
  const response = await fetch(
    `${REST_V1_BASE}/page/summary/${encodeURIComponent(title)}`,
    { headers: defaultHeaders }
  );
  if (response.ok) return await response.json();
  console.error('Error fetching page summary:', response.status);
};

/** Contenuto HTML completo di un articolo */
const getPageHtml = async (title) => {
  const response = await fetch(
    `${REST_V1_BASE}/page/html/${encodeURIComponent(title)}`,
    { headers: defaultHeaders }
  );
  if (response.ok) return await response.text();
  console.error('Error fetching page HTML:', response.status);
};

/** Contenuto in formato MobileHTML (ottimizzato per mobile) */
const getPageMobileHtml = async (title) => {
  const response = await fetch(
    `${REST_V1_BASE}/page/mobile-html/${encodeURIComponent(title)}`,
    { headers: defaultHeaders }
  );
  if (response.ok) return await response.text();
  console.error('Error fetching mobile HTML:', response.status);
};

/** Media (immagini, video, audio) usati in una pagina */
const getPageMedia = async (title) => {
  const response = await fetch(
    `${REST_V1_BASE}/page/media-list/${encodeURIComponent(title)}`,
    { headers: defaultHeaders }
  );
  if (response.ok) return await response.json();
  console.error('Error fetching page media:', response.status);
};

/** Articolo casuale */
const getRandomPage = async () => {
  const response = await fetch(
    `${REST_V1_BASE}/page/random/summary`,
    { headers: defaultHeaders }
  );
  if (response.ok) return await response.json();
  console.error('Error fetching random page:', response.status);
};

/** PDF di un articolo (restituisce Blob) */
const getPagePdf = async (title) => {
  const response = await fetch(
    `${REST_V1_BASE}/page/pdf/${encodeURIComponent(title)}`,
    { headers: defaultHeaders }
  );
  if (response.ok) return await response.blob();
  console.error('Error fetching page PDF:', response.status);
};

/** Metadati dell'ultima revisione di un articolo */
const getPageRevision = async (title) => {
  const response = await fetch(
    `${REST_V1_BASE}/page/title/${encodeURIComponent(title)}`,
    { headers: defaultHeaders }
  );
  if (response.ok) return await response.json();
  console.error('Error fetching page revision:', response.status);
};

// ─────────────────────────────────────────────
// ACTION API (ricerca testuale, più flessibile)
// Base: https://en.wikipedia.org/w/api.php
// ─────────────────────────────────────────────

/**
 * Cerca articoli per testo.
 * @param {string} query - Testo da cercare
 * @param {string} lang  - Lingua (default 'en')
 * @param {number} limit - Numero massimo risultati (default 5)
 */
const searchPages = async (query, lang = LANG, limit = 5) => {
  const url =
    `https://${lang}.wikipedia.org/w/api.php` +
    `?action=query&list=search&srsearch=${encodeURIComponent(query)}` +
    `&format=json&origin=*&srlimit=${limit}`;
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    return data?.query?.search || [];
  }
  console.error('Error searching pages:', response.status);
  return [];
};

/**
 * Recupera estratto + thumbnail + URL di una pagina tramite pageId.
 * Usato internamente da geo.js, esposto per riuso esterno.
 * @param {number} pageId
 * @param {string} lang
 */
const getPageDetails = async (pageId, lang = LANG) => {
  const url =
    `https://${lang}.wikipedia.org/w/api.php` +
    `?action=query&pageids=${pageId}` +
    `&prop=extracts|pageimages|info` +
    `&exintro=true&explaintext=true` +
    `&piprop=thumbnail&pithumbsize=400` +
    `&inprop=url&format=json&origin=*`;
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    return data?.query?.pages?.[pageId] || null;
  }
  console.error('Error fetching page details:', response.status);
  return null;
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

export {
  // REST API v1
  getPageSummary,
  getPageHtml,
  getPageMobileHtml,
  getPageMedia,
  getRandomPage,
  getPagePdf,
  getPageRevision,
  // Action API
  searchPages,
  getPageDetails,
};
