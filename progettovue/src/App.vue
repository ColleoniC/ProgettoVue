<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router';
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg:           #050a0f;
  --surface:      #0d1821;
  --surface2:     #162233;
  --border:       #1e3a50;
  --accent:       #00c9ff;
  --accent2:      #ff6b35;
  --text:         #e8f4fd;
  --text-muted:   #5a8fa8;
  --font-display: 'Syne', sans-serif;
  --font-mono:    'Space Mono', monospace;
}

html, body, #app {
  width: 100%;
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  overflow: hidden;
}

::-webkit-scrollbar       { width: 4px; }
::-webkit-scrollbar-track { background: var(--surface); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
</style>