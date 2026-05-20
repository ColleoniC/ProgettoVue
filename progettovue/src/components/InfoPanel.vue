<template>
  <aside class="panel" :class="{ visible: data || loading }">

    <!-- ── LOADING ── -->
    <div v-if="loading" class="panel-loading">
      <div class="loader-orb"></div>
      <span class="loader-text">Analisi coordinate...</span>
      <div class="loader-coords" v-if="data">
        {{ formatCoord(data?.lat) }} · {{ formatCoord(data?.lon) }}
      </div>
    </div>

    <template v-else-if="data">

      <!-- ── HEADER ── -->
      <div class="panel-header">
        <div class="header-left">
          <div class="coords-row">
            <span class="coord-chip">
              <span class="coord-label">LAT</span>
              <span class="coord-val">{{ formatCoord(data.lat) }}</span>
            </span>
            <span class="coord-chip">
              <span class="coord-label">LON</span>
              <span class="coord-val">{{ formatCoord(data.lon) }}</span>
            </span>
          </div>
          <div class="location-breadcrumb" v-if="data.geo?.country">
            <span v-for="(crumb, i) in breadcrumbs" :key="i" class="crumb">
              <span class="crumb-text">{{ crumb }}</span>
              <span v-if="i < breadcrumbs.length - 1" class="crumb-sep">›</span>
            </span>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')" title="Chiudi">
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <!-- ── OCEANO / NESSUN DATO ── -->
      <div v-if="!data.levels?.length" class="ocean-msg">
        <div class="ocean-icon">🌊</div>
        <div class="ocean-title">Acque Aperte</div>
        <p class="ocean-sub">Nessuna terra ferma rilevata a queste coordinate.</p>
        <p class="ocean-coords">{{ formatCoord(data.lat) }}, {{ formatCoord(data.lon) }}</p>
      </div>

      <template v-else>
        <!-- ── LEVEL TABS ── -->
        <div class="level-tabs">
          <button
            v-for="level in data.levels"
            :key="level.id"
            class="level-tab"
            :class="{ active: activeTab === level.id }"
            @click="selectTab(level.id)"
          >
            <span class="level-icon">{{ levelIcon(level.id) }}</span>
            <span class="level-meta">
              <span class="level-type">{{ level.label }}</span>
              <span class="level-name">{{ level.name }}</span>
            </span>
          </button>
        </div>

        <!-- ── PANEL BODY ── -->
        <div class="panel-body" ref="bodyRef">
          <template v-if="activeLevel">

            <!-- HERO IMAGE -->
            <div class="hero-wrap" v-if="activeLevel.wiki?.thumbnail">
              <img
                :src="activeLevel.wiki.thumbnail"
                :alt="activeLevel.wiki.title"
                class="hero-img"
              />
              <div class="hero-gradient"></div>
              <div class="hero-title-overlay">
                <h1 class="hero-title">{{ activeLevel.wiki.title }}</h1>
                <a :href="activeLevel.wiki.url" target="_blank" class="wiki-badge">
                  W Wikipedia
                </a>
              </div>
            </div>
            <div class="title-no-img" v-else>
              <h1 class="section-title-big">{{ activeLevel.wiki?.title || activeLevel.name }}</h1>
              <a v-if="activeLevel.wiki?.url" :href="activeLevel.wiki.url" target="_blank" class="wiki-badge standalone">
                W Wikipedia
              </a>
            </div>

            <!-- INTRO EXTRACT -->
            <div class="extract-block" v-if="activeLevel.wiki?.extract">
              <p class="extract-intro">{{ introText }}</p>
              <button
                v-if="activeLevel.wiki.extract.length > 320"
                class="expand-btn"
                @click="expanded = !expanded"
              >
                {{ expanded ? '▲ Mostra meno' : '▼ Leggi di più' }}
              </button>
            </div>

            <!-- FULL EXTRACT SECTIONS -->
            <div class="sections-block" v-if="expanded && parsedSections.length">
              <div
                v-for="(sec, i) in parsedSections"
                :key="i"
                class="section-card"
              >
                <h3 class="section-heading" v-if="sec.heading">{{ sec.heading }}</h3>
                <p class="section-body">{{ sec.text }}</p>
              </div>
            </div>

            <!-- CURIOSITÀ CARD -->
            <div class="curiosity-card" v-if="curiosities.length">
              <div class="curiosity-header">
                <span class="curiosity-icon">💡</span>
                <span class="curiosity-title">Lo sapevi?</span>
              </div>
              <ul class="curiosity-list">
                <li v-for="(c, i) in curiosities" :key="i" class="curiosity-item">
                  <span class="bullet">◆</span>
                  <span>{{ c }}</span>
                </li>
              </ul>
            </div>

            <!-- STATISTICS / INFO GRID -->
            <div class="info-grid" v-if="infoItems.length">
              <div class="info-grid-header">
                <span>📊</span> <span>Dati chiave</span>
              </div>
              <div class="info-grid-body">
                <div v-for="(item, i) in infoItems" :key="i" class="info-cell">
                  <span class="info-key">{{ item.key }}</span>
                  <span class="info-val">{{ item.val }}</span>
                </div>
              </div>
            </div>

            <!-- HISTORY SECTION -->
            <div class="history-block" v-if="historyText">
              <div class="block-header">
                <span>📜</span> <span>Storia</span>
              </div>
              <p class="history-text">{{ historyText }}</p>
            </div>

            <!-- NO WIKI FALLBACK -->
            <div v-if="!activeLevel.wiki" class="no-wiki">
              <span class="no-wiki-icon">🔍</span>
              <p>Nessuna pagina Wikipedia trovata per <strong>{{ activeLevel.name }}</strong></p>
            </div>

            <!-- FOOTER LINK -->
            <a
              v-if="activeLevel.wiki?.url"
              :href="activeLevel.wiki.url"
              target="_blank"
              class="full-wiki-link"
            >
              <span>Articolo completo su Wikipedia</span>
              <span class="link-arrow">→</span>
            </a>

          </template>
        </div>
      </template>

    </template>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: Object,
  loading: Boolean
})
defineEmits(['close'])

const activeTab = ref(null)
const expanded  = ref(false)
const bodyRef   = ref(null)

watch(() => props.data, (newData) => {
  expanded.value = false
  if (newData?.levels?.length) {
    activeTab.value = newData.levels[0].id
  }
}, { immediate: true })

function selectTab(id) {
  activeTab.value = id
  expanded.value = false
  if (bodyRef.value) bodyRef.value.scrollTop = 0
}

const activeLevel = computed(() =>
  props.data?.levels?.find(l => l.id === activeTab.value)
)

const breadcrumbs = computed(() => {
  const g = props.data?.geo
  if (!g) return []
  return [g.country, g.region, g.city].filter(Boolean)
})

// ── Extract: intro (first 320 chars) ──
const introText = computed(() => {
  const text = activeLevel.value?.wiki?.extract
  if (!text) return ''
  if (!expanded.value || text.length <= 320) return text.slice(0, 320) + (text.length > 320 ? '…' : '')
  return text.slice(0, 320) + '…'
})

// ── Parse full extract into sections ──
const parsedSections = computed(() => {
  const text = activeLevel.value?.wiki?.extract
  if (!text) return []

  // Split by double newline (paragraph breaks) – Wikipedia extract doesn't have headings
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 60)
  if (paragraphs.length <= 1) return []

  // Skip first paragraph (already shown as intro)
  return paragraphs.slice(1).map((p, i) => ({
    heading: null, // Wikipedia plaintext extracts don't have headings
    text: p
  }))
})

// ── Curiosities: short standalone sentences from extract ──
const curiosities = computed(() => {
  const text = activeLevel.value?.wiki?.extract
  if (!text) return []

  const sentences = text.match(/[^.!?]*[.!?]/g) || []
  const interesting = sentences
    .map(s => s.trim())
    .filter(s => {
      const l = s.length
      if (l < 50 || l > 220) return false
      const lower = s.toLowerCase()
      // sentences with numbers or interesting keywords
      return /\d/.test(s) || /fondat|nasc|capital|region|popola|premier|record|celebr|famoso|conosciut|important|grande|piccol|antico|modern|unico|primo|prima/i.test(s)
    })
    .slice(0, 4)

  return interesting
})

// ── Info grid: extract key figures ──
const infoItems = computed(() => {
  const text = activeLevel.value?.wiki?.extract
  if (!text) return []

  const items = []
  const geo = props.data?.geo

  if (geo?.country)     items.push({ key: 'Paese',    val: geo.country })
  if (geo?.region)      items.push({ key: 'Regione',  val: geo.region })
  if (geo?.city)        items.push({ key: 'Città',    val: geo.city })
  if (props.data?.lat != null) items.push({ key: 'Latitudine', val: formatCoord(props.data.lat) })
  if (props.data?.lon != null) items.push({ key: 'Longitudine', val: formatCoord(props.data.lon) })

  // Extract population if mentioned
  const popMatch = text.match(/(\d[\d\s.,]*)\s*(?:abitanti|residents|population|milion)/i)
  if (popMatch) items.push({ key: 'Popolazione', val: popMatch[1].trim() })

  // Extract area if mentioned
  const areaMatch = text.match(/(\d[\d\s.,]*)\s*(?:km²|km2|square kilometres|sq km)/i)
  if (areaMatch) items.push({ key: 'Area', val: areaMatch[1].trim() + ' km²' })

  return items.slice(0, 6)
})

// ── History: look for paragraph with date/historical keywords ──
const historyText = computed(() => {
  const text = activeLevel.value?.wiki?.extract
  if (!text) return null
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  const histPara = paragraphs.find(p =>
    /\b(storia|fondat|secol|storico|guerra|impero|domin|conquisat|medioev|antico|period|civiltà|rivolu|indipend|dynasty|kingdom|founded|century|ancient|medieval|war|empire|history)/i.test(p)
    && p.length > 80
  )
  return histPara || null
})

function levelIcon(id) {
  return id === 'country' ? '🌍' : id === 'region' ? '🗺️' : '🏙️'
}

function formatCoord(val) {
  if (val == null) return '—'
  const abs = Math.abs(val).toFixed(4)
  const dir = val >= 0 ? (arguments.length ? 'N' : 'E') : (arguments.length ? 'S' : 'W')
  return abs + '°'
}
</script>

<style scoped>
/* ── Panel Shell ── */
.panel {
  position: fixed;
  top: 0; right: 0;
  width: 400px; height: 100%;
  background: var(--surface);
  border-left: 1px solid var(--border);
  display: flex; flex-direction: column;
  transform: translateX(105%);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
  overflow: hidden;
  box-shadow: -8px 0 40px rgba(0,0,0,0.5);
}
.panel.visible { transform: translateX(0); }

/* ── Loading ── */
.panel-loading {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 18px;
}
.loader-orb {
  width: 48px; height: 48px;
  border-radius: 50%;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-right-color: var(--accent);
  animation: spin 1s linear infinite;
  box-shadow: 0 0 20px rgba(0,201,255,0.3);
}
@keyframes spin { to { transform: rotate(360deg); } }
.loader-text {
  font-size: 0.7rem; letter-spacing: 0.2em;
  color: var(--text-muted); text-transform: uppercase;
}
.loader-coords { font-size: 0.65rem; color: var(--accent); font-family: var(--font-mono); }

/* ── Header ── */
.panel-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--surface2);
  flex-shrink: 0;
}
.header-left { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.coords-row { display: flex; gap: 8px; align-items: center; }
.coord-chip {
  display: flex; align-items: center; gap: 5px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 4px; padding: 3px 8px;
}
.coord-label { font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.12em; }
.coord-val { font-size: 0.75rem; color: var(--accent); font-family: var(--font-mono); }

.location-breadcrumb { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.crumb { display: flex; align-items: center; gap: 4px; }
.crumb-text { font-size: 0.7rem; color: var(--text); font-family: var(--font-display); font-weight: 600; }
.crumb-sep { font-size: 0.65rem; color: var(--text-muted); }

.close-btn {
  background: none; border: 1px solid var(--border);
  color: var(--text-muted); cursor: pointer;
  width: 28px; height: 28px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0; margin-left: 8px;
}
.close-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,201,255,0.06); }

/* ── Ocean msg ── */
.ocean-msg {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  padding: 40px 24px; text-align: center;
}
.ocean-icon { font-size: 2.5rem; }
.ocean-title { font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; color: var(--text); }
.ocean-sub { font-size: 0.78rem; color: var(--text-muted); line-height: 1.6; }
.ocean-coords { font-size: 0.7rem; color: var(--accent); font-family: var(--font-mono); }

/* ── Level Tabs ── */
.level-tabs {
  display: flex; flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}
.level-tab {
  flex: 1; display: flex; align-items: center; gap: 8px;
  padding: 10px 12px;
  background: none; border: none; border-bottom: 2px solid transparent;
  cursor: pointer; transition: all 0.2s;
}
.level-tab:hover { background: var(--surface); }
.level-tab.active {
  border-bottom-color: var(--accent);
  background: var(--surface);
}
.level-icon { font-size: 1rem; line-height: 1; }
.level-meta { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.level-type { font-size: 0.58rem; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; font-family: var(--font-mono); }
.level-name {
  font-size: 0.72rem; color: var(--text); font-family: var(--font-display);
  font-weight: 700; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; max-width: 90px;
}
.level-tab.active .level-name { color: var(--accent); }

/* ── Panel Body ── */
.panel-body {
  flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0;
}

/* ── Hero Image ── */
.hero-wrap {
  position: relative; width: 100%; height: 220px; flex-shrink: 0; overflow: hidden;
}
.hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 30%, rgba(5,10,15,0.95) 100%);
}
.hero-title-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 16px 18px; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px;
}
.hero-title {
  font-family: var(--font-display); font-size: 1.5rem; font-weight: 900;
  color: #fff; line-height: 1.1; text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  flex: 1;
}

.title-no-img {
  padding: 20px 18px 0;
  display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
}
.section-title-big {
  font-family: var(--font-display); font-size: 1.5rem; font-weight: 900;
  color: var(--text); line-height: 1.2; flex: 1;
}

/* Wikipedia badge */
.wiki-badge {
  flex-shrink: 0;
  display: inline-flex; align-items: center;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 0.62rem; letter-spacing: 0.1em;
  padding: 4px 8px; border-radius: 3px; text-decoration: none;
  transition: background 0.2s; backdrop-filter: blur(4px);
}
.wiki-badge.standalone {
  background: rgba(0,201,255,0.1); border-color: var(--border); color: var(--accent);
  align-self: flex-start; margin-top: 4px;
}
.wiki-badge:hover { background: rgba(255,255,255,0.22); }

/* ── Extract ── */
.extract-block { padding: 16px 18px 0; display: flex; flex-direction: column; gap: 10px; }
.extract-intro {
  font-size: 0.82rem; line-height: 1.75; color: var(--text);
  font-family: var(--font-mono);
}
.expand-btn {
  align-self: flex-start;
  background: none; border: 1px solid var(--border);
  color: var(--accent); font-size: 0.68rem; letter-spacing: 0.08em;
  padding: 5px 12px; border-radius: 3px; cursor: pointer;
  transition: all 0.2s; font-family: var(--font-mono);
}
.expand-btn:hover { background: rgba(0,201,255,0.08); border-color: var(--accent); }

/* ── Sections ── */
.sections-block { padding: 0 18px; display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.section-card {
  border-left: 2px solid var(--border);
  padding: 10px 14px;
  background: rgba(22,34,51,0.5);
  border-radius: 0 4px 4px 0;
}
.section-heading {
  font-family: var(--font-display); font-size: 0.85rem; font-weight: 700;
  color: var(--accent); margin-bottom: 6px; letter-spacing: 0.04em;
}
.section-body { font-size: 0.78rem; line-height: 1.7; color: var(--text-muted); }

/* ── Curiosities ── */
.curiosity-card {
  margin: 14px 18px 0;
  background: rgba(0,201,255,0.05);
  border: 1px solid rgba(0,201,255,0.15);
  border-radius: 6px; overflow: hidden;
}
.curiosity-header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-bottom: 1px solid rgba(0,201,255,0.1);
  background: rgba(0,201,255,0.08);
}
.curiosity-icon { font-size: 0.9rem; }
.curiosity-title { font-size: 0.72rem; letter-spacing: 0.12em; color: var(--accent); text-transform: uppercase; font-family: var(--font-mono); }
.curiosity-list { list-style: none; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px; }
.curiosity-item { display: flex; gap: 8px; font-size: 0.78rem; line-height: 1.6; color: var(--text); }
.bullet { color: var(--accent); font-size: 0.5rem; margin-top: 5px; flex-shrink: 0; }

/* ── Info Grid ── */
.info-grid {
  margin: 14px 18px 0;
  border: 1px solid var(--border); border-radius: 6px; overflow: hidden;
}
.info-grid-header {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; background: var(--surface2);
  font-size: 0.7rem; letter-spacing: 0.12em; color: var(--text-muted);
  text-transform: uppercase; border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
}
.info-grid-body { display: grid; grid-template-columns: 1fr 1fr; }
.info-cell {
  padding: 10px 14px; display: flex; flex-direction: column; gap: 2px;
  border-bottom: 1px solid var(--border); border-right: 1px solid var(--border);
}
.info-cell:nth-child(even) { border-right: none; }
.info-cell:nth-last-child(-n+2) { border-bottom: none; }
.info-key { font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; font-family: var(--font-mono); }
.info-val { font-size: 0.8rem; color: var(--text); font-family: var(--font-display); font-weight: 700; }

/* ── History ── */
.history-block {
  margin: 14px 18px 0;
  border: 1px solid var(--border); border-radius: 6px; overflow: hidden;
}
.block-header {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; background: var(--surface2);
  font-size: 0.7rem; letter-spacing: 0.12em; color: var(--text-muted);
  text-transform: uppercase; border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
}
.history-text { padding: 12px 14px; font-size: 0.78rem; line-height: 1.75; color: var(--text-muted); }

/* ── No Wiki ── */
.no-wiki {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  padding: 40px 24px; text-align: center; color: var(--text-muted);
}
.no-wiki-icon { font-size: 2rem; }
.no-wiki p { font-size: 0.8rem; line-height: 1.6; }
.no-wiki strong { color: var(--text); }

/* ── Footer link ── */
.full-wiki-link {
  display: flex; align-items: center; justify-content: space-between;
  margin: 14px 18px 20px;
  padding: 13px 16px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 6px; text-decoration: none;
  color: var(--text); font-size: 0.78rem;
  letter-spacing: 0.04em; transition: all 0.2s;
  font-family: var(--font-mono);
}
.full-wiki-link:hover {
  border-color: var(--accent); color: var(--accent);
  background: rgba(0,201,255,0.06);
}
.link-arrow { color: var(--accent); font-size: 1rem; }
</style>