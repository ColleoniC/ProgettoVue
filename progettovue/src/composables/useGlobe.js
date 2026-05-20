import * as THREE from 'three'

export function useGlobe(canvas, onClickCoords) {
  let renderer, scene, camera, globe, stars, animId
  let isDragging = false
  let isMouseDown = false
  let prevMouse = { x: 0, y: 0 }
  let rotVelocity = { x: 0, y: 0 }
  const GLOBE_RADIUS = 2

  function init() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)

    // Scene
    scene = new THREE.Scene()

    // Camera
    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.z = 5.5

    // Lights
    const ambient = new THREE.AmbientLight(0x1a3a5c, 2)
    scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xffffff, 3)
    sun.position.set(5, 3, 5)
    scene.add(sun)
    const rim = new THREE.DirectionalLight(0x00c9ff, 0.8)
    rim.position.set(-5, -2, -3)
    scene.add(rim)

    // Globe
    const geo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64)
    const textureLoader = new THREE.TextureLoader()

    // Usa texture da CDN pubblico
    const earthTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      undefined, undefined,
      () => {
        // fallback colore se texture non carica
        mat.color.set(0x1a4a7a)
      }
    )
    const bumpTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'
    )
    const specTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'
    )

    const mat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.05,
      specularMap: specTexture,
      specular: new THREE.Color(0x226699),
      shininess: 25,
    })
    globe = new THREE.Mesh(geo, mat)
    scene.add(globe)

    // Atmosfera (glow)
    const atmosGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.02, 64, 64)
    const atmosMat = new THREE.MeshPhongMaterial({
      color: 0x0088cc,
      transparent: true,
      opacity: 0.08,
      side: THREE.FrontSide,
    })
    scene.add(new THREE.Mesh(atmosGeo, atmosMat))

    // Stelle
    const starGeo = new THREE.BufferGeometry()
    const starVerts = []
    for (let i = 0; i < 6000; i++) {
      starVerts.push((Math.random() - 0.5) * 200)
      starVerts.push((Math.random() - 0.5) * 200)
      starVerts.push((Math.random() - 0.5) * 200)
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3))
    stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12 }))
    scene.add(stars)

    // Events
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('click', onClick)
    window.addEventListener('resize', onResize)

    animate()
  }

  function animate() {
    animId = requestAnimationFrame(animate)
    if (!isMouseDown) {
      globe.rotation.y += rotVelocity.y
      globe.rotation.x += rotVelocity.x
      rotVelocity.x *= 0.95
      rotVelocity.y *= 0.95
    }
    stars.rotation.y += 0.0001
    renderer.render(scene, camera)
  }

  function onMouseDown(e) {
    isMouseDown = true
    isDragging = false
    prevMouse = { x: e.clientX, y: e.clientY }
    canvas.style.cursor = 'grabbing'
  }

  function onMouseMove(e) {
    if (!isMouseDown) return
    const dx = e.clientX - prevMouse.x
    const dy = e.clientY - prevMouse.y
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      isDragging = true
      rotVelocity.y = dx * 0.005
      rotVelocity.x = dy * 0.005
      globe.rotation.y += dx * 0.005
      globe.rotation.x += dy * 0.005
      prevMouse = { x: e.clientX, y: e.clientY }
    }
  }

  function onMouseUp() {
    isMouseDown = false
    canvas.style.cursor = 'default'
    setTimeout(() => { isDragging = false }, 50)
  }

  function onClick(e) {
    if (isDragging) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera({ x, y }, camera)
    const hits = raycaster.intersectObject(globe)

    if (!hits.length) return

    // Punto nello spazio locale del globo (tenendo conto della rotazione)
    const localPoint = globe.worldToLocal(hits[0].point.clone())
    const lat = 90 - (Math.acos(localPoint.y / GLOBE_RADIUS) * 180) / Math.PI
    const lon = (Math.atan2(localPoint.z, localPoint.x) * 180) / Math.PI

    onClickCoords(lat, lon, { lat, lon, globe })
  }

  function onResize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  function addMarker({ lat, lon, globe }) {
    // Rimuovi tutti i vecchi marker
    const toRemove = scene.children.filter(o => o.name === 'marker')
    toRemove.forEach(o => scene.remove(o))

    // Ricalcola posizione world dalla lat/lon
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = lon * (Math.PI / 180)
    const localPos = new THREE.Vector3(
      GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta),
      GLOBE_RADIUS * Math.cos(phi),
      GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)
    )
    const worldPoint = localPos.clone().applyMatrix4(globe.matrixWorld)

    const markerGeo = new THREE.SphereGeometry(0.02, 16, 16)
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xff6b35 })
    const marker = new THREE.Mesh(markerGeo, markerMat)
    marker.name = 'marker'
    marker.position.copy(worldPoint)
    scene.add(marker)

    // Pulse ring
    const ringGeo = new THREE.RingGeometry(0.025, 0.04, 32)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.name = 'marker'
    ring.position.copy(worldPoint)
    ring.lookAt(camera.position)
    scene.add(ring)
  }

  function destroy() {
    cancelAnimationFrame(animId)
    canvas.removeEventListener('mousedown', onMouseDown)
    canvas.removeEventListener('mousemove', onMouseMove)
    canvas.removeEventListener('mouseup', onMouseUp)
    canvas.removeEventListener('click', onClick)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
  }

  return { init, addMarker, destroy }
}