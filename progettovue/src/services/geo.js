// ─────────────────────────────────────────────
// Reverse geocoding via Nominatim (no API key)
// ─────────────────────────────────────────────

export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=it`
  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'it',
      'User-Agent': 'GlobeExplorer/1.0 (educational project)'
    }
  })
  if (!res.ok) throw new Error(`Geocoding fallito: ${res.status}`)
  const data = await res.json()

  // Nominatim restituisce un campo "error" se si clicca in oceano
  if (data.error) {
    return { country: null, countryCode: null, region: null, city: null, displayName: null }
  }

  const a = data.address || {}
  return {
    country:     a.country || null,
    countryCode: (a.country_code || '').toUpperCase(),
    region:      a.state || a.region || a.county || null,
    city:        a.city || a.town || a.village || a.municipality || a.suburb || null,
    displayName: data.display_name || null
  }
}

// ─────────────────────────────────────────────
// Wikipedia: cerca titolo + estratto + immagine
// ─────────────────────────────────────────────

export async function fetchWikipedia(query, lang = 'it') {
  if (!query) return null

  try {
    const searchUrl =
      `https://${lang}.wikipedia.org/w/api.php` +
      `?action=query&list=search&srsearch=${encodeURIComponent(query)}` +
      `&format=json&origin=*&srlimit=1`

    const searchRes  = await fetch(searchUrl)
    const searchData = await searchRes.json()
    const pages      = searchData?.query?.search

    if (!pages?.length) {
      if (lang === 'it') return fetchWikipedia(query, 'en')
      return null
    }

    const pageId = pages[0].pageid
    const title  = pages[0].title

    const detailUrl =
      `https://${lang}.wikipedia.org/w/api.php` +
      `?action=query&pageids=${pageId}` +
      `&prop=extracts|pageimages|info` +
      `&exintro=true&explaintext=true` +
      `&piprop=thumbnail&pithumbsize=400` +
      `&inprop=url&format=json&origin=*`

    const detailRes  = await fetch(detailUrl)
    const detailData = await detailRes.json()
    const page       = detailData?.query?.pages?.[pageId]

    return {
      title:     page?.title || title,
      extract:   page?.extract || null,
      thumbnail: page?.thumbnail?.source || null,
      url:       page?.fullurl || `https://${lang}.wikipedia.org/?curid=${pageId}`,
      lang
    }
  } catch (e) {
    console.warn(`Wikipedia fetch fallito per "${query}":`, e)
    return null
  }
}

// ─────────────────────────────────────────────
// Recupera tutti e tre i livelli in parallelo
// ─────────────────────────────────────────────

export async function fetchAllLevels(lat, lon) {
  const geo = await reverseGeocode(lat, lon)

  if (!geo.country) {
    return { geo, levels: [] }
  }

  const [countryWiki, regionWiki, cityWiki] = await Promise.all([
    fetchWikipedia(geo.country),
    geo.region ? fetchWikipedia(geo.region) : Promise.resolve(null),
    geo.city   ? fetchWikipedia(geo.city)   : Promise.resolve(null),
  ])

  const levels = [
    { id: 'country', label: 'Paese',   name: geo.country, wiki: countryWiki },
    { id: 'region',  label: 'Regione', name: geo.region,  wiki: regionWiki  },
    { id: 'city',    label: 'Città',   name: geo.city,    wiki: cityWiki     },
  ].filter(l => l.name)

  return { geo, levels }
}
