<template>
  <div class="globe-wrapper">
    <canvas ref="canvasRef" class="globe-canvas" />

    <div class="hud-hint" v-if="!panelData && !loading">
      <span>CLICCA SUL GLOBO PER ESPLORARE</span>
    </div>

    <InfoPanel
      :data="panelData"
      :loading="loading"
      @close="panelData = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import InfoPanel from '@/components/InfoPanel.vue'
import { useGlobe } from '@/composables/useGlobe'
import { fetchAllLevels } from '@/services/geo'

const canvasRef = ref(null)
const panelData = ref(null)
const loading   = ref(false)

let globeInstance = null

async function handleClick(lat, lon, worldPoint) {
  loading.value   = true
  panelData.value = null

  globeInstance?.addMarker(worldPoint)

  try {
    const result = await fetchAllLevels(lat, lon)
    panelData.value = { lat, lon, ...result }
  } catch (e) {
    console.error('Errore fetch dati:', e)
    panelData.value = { lat, lon, levels: [] }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  globeInstance = useGlobe(canvasRef.value, handleClick)
  globeInstance.init()
})

onUnmounted(() => {
  globeInstance?.destroy()
})
</script>

<style scoped>
.globe-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.globe-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
}

.hud-hint {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(13, 24, 33, 0.75);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 8px 18px;
  pointer-events: none;
}

.hud-hint span {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
</style>