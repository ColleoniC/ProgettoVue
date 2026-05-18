<template>
  <aside class="panel" :class="{ visible: data }">
    <!-- Loading -->
    <div v-if="loading" class="panel-loading">
      <div class="spinner"></div>
      <span>Caricamento dati...</span>
    </div>

    <template v-else-if="data">
      <!-- Header con coordinate -->
      <div class="panel-header">
        <div class="coords">
          <span class="coord-label">LAT</span>
          <span class="coord-val">{{ formatCoord(data.lat) }}</span>
          <span class="coord-label">LON</span>
          <span class="coord-val">{{ formatCoord(data.lon) }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Tab livelli -->
      <div class="tabs">
        <button
          v-for="level in data.levels"
          :key="level.id"
          class="tab"
          :class="{ active: activeTab === level.id }"
          @click="activeTab = level.id"
        >
          <span class="tab-label">{{ level.label }}</span>
          <span class="tab-name">{{ level.name }}</span>
        </button>
      </div>

      <!-- Contenuto tab attivo -->
      <div class="panel-body" v-if="activeLevel">
        <template v-if="activeLevel.wiki">
          <img
            v-if="activeLevel.wiki.thumbnail"
            :src="activeLevel.wiki.thumbnail"
            :alt="activeLevel.wiki.title"
            class="wiki-img"
          />
          <h2 class="wiki-title">{{ activeLevel.wiki.title }}</h2>
          <p class="wiki-extract">{{ truncate(activeLevel.wiki.extract) }}</p>
          <a :href="activeLevel.wiki.url" target="_blank" class="wiki-link">
            Leggi su Wikipedia →
          </a>
        </template>
        <div v-else class="no-data">
          Nessuna informazione trovata per <strong>{{ activeLevel.name }}</strong>
        </div>
      </div>
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

watch(() => props.data, (newData) => {
  if (newData?.levels?.length) {
    activeTab.value = newData.levels[0].id
  }
}, { immediate: true })

const activeLevel = computed(() =>
  props.data?.levels?.find(l => l.id === activeTab.value)
)

function formatCoord(val) {
  return val != null ? val.toFixed(4) + '°' : '—'
}

function truncate(text, max = 600) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '…' : text
}
</script>

<style scoped>
.panel {
  position: fixed;
  top: 0; right: 0;
  width: 380px; height: 100%;
  background: var(--surface);
  border-left: 1px solid var(--border);
  display: flex; flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
  overflow: hidden;
}
.panel.visible { transform: translateX(0); }

.panel-loading {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 16px; color: var(--text-muted);
  font-size: 0.8rem; letter-spacing: 0.1em;
}
.spinner {
  width: 32px; height: 32px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface2);
}
.coords { display: flex; align-items: center; gap: 10px; }
.coord-label {
  font-size: 0.65rem; color: var(--text-muted);
  letter-spacing: 0.15em;
}
.coord-val {
  font-size: 0.8rem; color: var(--accent);
  font-family: var(--font-mono);
}
.close-btn {
  background: none; border: 1px solid var(--border);
  color: var(--text-muted); cursor: pointer;
  width: 28px; height: 28px; border-radius: 4px;
  font-size: 0.7rem; transition: all 0.2s;
}
.close-btn:hover { border-color: var(--accent); color: var(--accent); }

.tabs {
  display: flex; border-bottom: 1px solid var(--border);
  background: var(--bg);
}
.tab {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; padding: 10px 8px;
  background: none; border: none; border-bottom: 2px solid transparent;
  cursor: pointer; transition: all 0.2s; gap: 2px;
}
.tab:hover { background: var(--surface); }
.tab.active {
  border-bottom-color: var(--accent);
  background: var(--surface);
}
.tab-label {
  font-size: 0.6rem; color: var(--text-muted);
  letter-spacing: 0.12em; text-transform: uppercase;
  font-family: var(--font-mono);
}
.tab-name {
  font-size: 0.75rem; color: var(--text);
  font-family: var(--font-display); font-weight: 700;
  white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; max-width: 100px;
}
.tab.active .tab-name { color: var(--accent); }

.panel-body {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
}
.wiki-img {
  width: 100%; height: 180px;
  object-fit: cover; border-radius: 6px;
  border: 1px solid var(--border);
}
.wiki-title {
  font-family: var(--font-display); font-size: 1.4rem;
  font-weight: 800; color: var(--text);
  line-height: 1.2;
}
.wiki-extract {
  font-size: 0.8rem; line-height: 1.7;
  color: var(--text-muted); font-family: var(--font-mono);
}
.wiki-link {
  display: inline-block; margin-top: 4px;
  color: var(--accent); font-size: 0.75rem;
  text-decoration: none; letter-spacing: 0.05em;
  transition: color 0.2s;
}
.wiki-link:hover { color: var(--accent2); }

.no-data {
  color: var(--text-muted); font-size: 0.8rem;
  padding: 40px 0; text-align: center;
}
.no-data strong { color: var(--text); }
</style>
