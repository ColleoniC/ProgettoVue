const BASE_URL = 'https://api.countrystatecity.in/v1';
const API_KEY = 'YOUR_API_KEY'; // ← sostituisci con la tua chiave da countrystatecity.in

const headers = { 'X-CSCAPI-KEY': API_KEY };

// ─────────────────────────────────────────────
// COUNTRIES
// ─────────────────────────────────────────────

/** Get All Countries */
const getAllCountries = async () => {
  const response = await fetch(`${BASE_URL}/countries`, { headers });
  if (response.ok) return await response.json();
  console.error('Error fetching countries:', response.status);
};

/** Get Country Details by ISO2 code (e.g. 'IT', 'US') */
const getCountryDetails = async (countryCode) => {
  const response = await fetch(`${BASE_URL}/countries/${countryCode}`, { headers });
  if (response.ok) return await response.json();
  console.error('Country not found:', countryCode);
};

// ─────────────────────────────────────────────
// STATES
// ─────────────────────────────────────────────

/** Get All States (all countries) */
const getAllStates = async () => {
  const response = await fetch(`${BASE_URL}/states`, { headers });
  if (response.ok) return await response.json();
  console.error('Error fetching states:', response.status);
};

/** Get States by Country ISO2 code (e.g. 'IT') */
const getStatesByCountry = async (countryCode) => {
  const response = await fetch(`${BASE_URL}/countries/${countryCode}/states`, { headers });
  if (response.ok) return await response.json();
  console.error('Error fetching states for country:', countryCode);
};

/** Get State Details by Country ISO2 and State ISO2 code (e.g. 'IT', 'LO') */
const getStateDetails = async (countryCode, stateCode) => {
  const response = await fetch(`${BASE_URL}/countries/${countryCode}/states/${stateCode}`, { headers });
  if (response.ok) return await response.json();
  console.error('State not found:', stateCode, 'in', countryCode);
};

// ─────────────────────────────────────────────
// CITIES
// ─────────────────────────────────────────────

/** Get Cities by Country ISO2 code (e.g. 'IT') */
const getCitiesByCountry = async (countryCode) => {
  const response = await fetch(`${BASE_URL}/countries/${countryCode}/cities`, { headers });
  if (response.ok) return await response.json();
  console.error('Error fetching cities for country:', countryCode);
};

/** Get Cities by Country ISO2 and State ISO2 code (e.g. 'IT', 'LO') */
const getCitiesByState = async (countryCode, stateCode) => {
  const response = await fetch(`${BASE_URL}/countries/${countryCode}/states/${stateCode}/cities`, { headers });
  if (response.ok) return await response.json();
  console.error('Error fetching cities for state:', stateCode, 'in', countryCode);
};

// ─────────────────────────────────────────────
// REGIONS
// ─────────────────────────────────────────────

/** Get All Regions */
const getAllRegions = async () => {
  const response = await fetch(`${BASE_URL}/regions`, { headers });
  if (response.ok) return await response.json();
  console.error('Error fetching regions:', response.status);
};

/** Get Subregions by Region ID */
const getSubregionsByRegion = async (regionId) => {
  const response = await fetch(`${BASE_URL}/regions/${regionId}/subregions`, { headers });
  if (response.ok) return await response.json();
  console.error('Error fetching subregions for region:', regionId);
};

/** Get Countries by Subregion ID */
const getCountriesBySubregion = async (subregionId) => {
  const response = await fetch(`${BASE_URL}/subregions/${subregionId}/countries`, { headers });
  if (response.ok) return await response.json();
  console.error('Error fetching countries for subregion:', subregionId);
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

export {
  getAllCountries,
  getCountryDetails,
  getAllStates,
  getStatesByCountry,
  getStateDetails,
  getCitiesByCountry,
  getCitiesByState,
  getAllRegions,
  getSubregionsByRegion,
  getCountriesBySubregion,
};