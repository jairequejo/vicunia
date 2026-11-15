/**
 * Vista 3D del clicker Vicunia con la malla real del modelo
 * «Chunky Keycaps / Compact Fidget Clicker».
 * Las geometrías vienen del archivo de producción (vendor/clicker-geo.bin),
 * así que la pieza que se ve es la misma que se imprime.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MAN } from './geo-manifest.js';
import { baseColor, capColor, inkFor } from './palette.js';

const GEO_URL = new URL('../vendor/clicker-geo.bin', import.meta.url).href;
const PITCH = 20.5;
const CAP_Z = 8.5;
const GROUND_Y = -8.15;

let geoPromise = null;

/** Descarga y decodifica la malla una sola vez. */
function loadGeometry() {
  if (!geoPromise) {
    geoPromise = (async () => {
      if (typeof DecompressionStream === 'undefined') throw new Error('sin DecompressionStream');
      const response = await fetch(GEO_URL);
      if (!response.ok) throw new Error('No se pudo descargar la malla');
      const raw = new Uint8Array(await response.arrayBuffer());
      const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate'));
      const buffer = await new Response(stream).arrayBuffer();
      const view = new DataView(buffer);
      const out = {};

      Object.entries(MAN).forEach(([key, [offset, vertexCount, triangleCount]]) => {
        const positions = new Float32Array(vertexCount * 3);
        for (let i = 0; i < positions.length; i += 1) {
          positions[i] = view.getInt16(offset + i * 2, true) / 100;
        }
        const indexCount = triangleCount * 3;
        const indices = new Uint16Array(indexCount);
        const indexOffset = offset + vertexCount * 6;
        for (let i = 0; i < indexCount; i += 1) {
          indices[i] = view.getUint16(indexOffset + i * 2, true);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        geometry.computeVertexNormals();
        out[key] = geometry;
      });

      return out;
    })();
  }
  return geoPromise;
}

export class ClickerPreview {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.onReady = options.onReady || (() => {});
    this.onError = options.onError || (() => {});
    this.onSelect = options.onSelect || (() => {});
    this.onPress = options.onPress || (() => {});
    this.sound = options.sound || null;

    this.state = null;
    this.geo = null;
    this.keys = [];
    this.root = null;
    this.disposed = false;
    this.ready = false;
    this.selected = 0;
    this.autoEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.autoTimer = 0;
    this.desiredDistance = 220;

    this.clock = new THREE.Clock();
    this._onResize = this._onResize.bind(this);
    this._loop = this._loop.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  async init() {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance'
      });
    } catch (error) {
      console.warn('WebGL no disponible', error);
      this.onError('webgl');
      return;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.environmentIntensity = 0.5;

    this.camera = new THREE.PerspectiveCamera(32, 1, 1, 3000);
    this.camera.position.set(0, 180, 150);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.rotateSpeed = 0.6;
    this.controls.autoRotate = this.autoEnabled;
    this.controls.autoRotateSpeed = 0.7;
    this.controls.minPolarAngle = 0.45;
    this.controls.maxPolarAngle = 1.4;

    this.controls.addEventListener('start', () => {
      this.controls.autoRotate = false;
      window.clearTimeout(this.autoTimer);
    });
    this.controls.addEventListener('end', () => {
      window.clearTimeout(this.autoTimer);
      if (!this.autoEnabled) return;
      this.autoTimer = window.setTimeout(() => {
        if (!this.disposed) this.controls.autoRotate = true;
      }, 3200);
    });

    this._buildEnvironment();
    this._buildLights();
    this._buildGround();

    this.canvas.tabIndex = 0;
    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    this.canvas.addEventListener('pointerup', this._onPointerUp);
    this.canvas.addEventListener('keydown', this._onKeyDown);

    this.resizeObserver = new ResizeObserver(this._onResize);
    this.resizeObserver.observe(this.canvas);
    this._onResize();

    try {
      this.geo = await loadGeometry();
    } catch (error) {
      console.warn('No se pudo cargar la malla del clicker', error);
      this.onError('geometry');
      return;
    }

    if (this.disposed) return;
    this.ready = true;
    if (this.pendingState) {
      const pending = this.pendingState;
      this.pendingState = null;
      this.setState(pending, { force: true });
    }
    this._loop();
    this.onReady();
  }

  /* ---------------------------------------------------------------- escena */

  _buildEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.scene.environment = pmrem.fromScene(room, 0.04).texture;
    room.dispose?.();
    pmrem.dispose();
  }

  _buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xfff9ef, 0x6b7590, 1.0));

    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(70, 170, 120);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 620;
    key.shadow.camera.left = -180;
    key.shadow.camera.right = 180;
    key.shadow.camera.top = 180;
    key.shadow.camera.bottom = -180;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.5;
    this.keyLight = key;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xffe9d6, 0.7);
    fill.position.set(-140, 80, 90);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xdfeafe, 1.0);
    rim.position.set(20, 90, -150);
    this.scene.add(rim);
  }

  _buildGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = GROUND_Y;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  /* --------------------------------------------------------------- modelo */

  _material(hex, { gloss = 0.5, flat = false } = {}) {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hex),
      roughness: gloss,
      metalness: 0,
      clearcoat: 0.16,
      clearcoatRoughness: 0.55,
      flatShading: flat,
      envMapIntensity: 0.9
    });
  }

  _disposeGroup() {
    if (!this.root) return;
    this.scene.remove(this.root);
    this.root.traverse((object) => {
      if (!object.isMesh) return;
      if (object.userData.ownGeometry) object.geometry.dispose();
      if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
      else object.material?.dispose?.();
    });
    this.root = null;
    this.baseMesh = null;
    this.keys = [];
  }

  _buildModel() {
    this._disposeGroup();
    const slots = Math.max(1, Math.min(10, this.state.slots));
    const geo = this.geo;

    const root = new THREE.Group();
    root.rotation.x = -Math.PI / 2;
    this.root = root;
    this.scene.add(root);

    const base = baseColor(this.state.baseColor);
    const baseMat = this._material(base.hex, { gloss: 0.55 });
    this.baseMaterial = baseMat;

    const baseGeo = geo['b:' + slots];
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    root.add(baseMesh);
    this.baseMesh = baseMesh;

    this.state.caps.slice(0, slots).forEach((cap, index) => {
      const color = capColor(cap.color);
      const x = 1.9 + (index - (slots - 1) / 2) * PITCH;

      const group = new THREE.Group();
      group.userData.slot = index;
      group.position.set(x, 0, CAP_Z);

      const material = this._material(color.hex, { gloss: 0.46 });
      const mesh = new THREE.Mesh(geo.cap, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.slot = index;
      group.add(mesh);

      const glyph = this._makeGlyph(cap, color.hex);
      if (glyph) {
        group.add(glyph);
        glyph.traverse((object) => { if (object.isMesh) object.userData.slot = index; });
      }

      root.add(group);
      this.keys.push({ group, mesh, material, glyph, press: 0, velocity: 0 });
    });

    this._fitCamera();
    if (!this._didInitialView) {
      this._didInitialView = true;
      this.resetView();
    }
  }

  /* --------------------------------------------------------------- glifos */

  _makeGlyph(cap, capHex) {
    const key = cap.symbol ? 's:' + cap.symbol : (cap.char ? 'g:' + cap.char : '');
    if (!key) return null;
    const geometry = this.geo[key];
    if (!geometry) return null;

    const ink = cap.ink || inkFor(capHex);
    const material = this._material(ink, { gloss: 0.5 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (cap.symbol) mesh.position.z = 0.3;
    return mesh;
  }

  /* ---------------------------------------------------------------- estado */

  setState(state, options = {}) {
    this.state = state;
    if (!this.ready) {
      this.pendingState = state;
      return;
    }

    const previous = this._lastBuilt;
    const structural = !previous || previous.slots !== state.slots;

    if (structural) {
      this._buildModel();
      this._lastBuilt = {
        slots: state.slots,
        caps: state.caps.map((cap) => ({ ...cap })),
        baseColor: state.baseColor
      };
      return;
    }

    const base = baseColor(state.baseColor);
    if (this.baseMaterial) this.baseMaterial.color.set(base.hex);

    state.caps.forEach((cap, index) => {
      const node = this.keys[index];
      if (!node) return;
      const color = capColor(cap.color);
      node.material.color.set(color.hex);

      const before = previous.caps[index];
      if (!before || before.char !== cap.char || before.symbol !== cap.symbol || before.ink !== cap.ink || before.color !== cap.color) {
        if (node.glyph) {
          node.group.remove(node.glyph);
          node.glyph.material?.dispose?.();
          node.glyph = null;
        }
        const glyph = this._makeGlyph(cap, color.hex);
        if (glyph) {
          node.group.add(glyph);
          node.glyph = glyph;
        }
      }
    });

    this._lastBuilt = {
      slots: state.slots,
      caps: state.caps.map((cap) => ({ ...cap })),
      baseColor: state.baseColor
    };
  }

  /* --------------------------------------------------------------- cámara */

  _fitCamera() {
    if (!this.camera || !this.root) return;
    const slots = Math.max(1, Math.min(10, this.state?.slots || 1));
    const aspect = Math.max(0.45, this._aspect || 1);
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);

    // Mismo encuadre que el diseñador original: ancho real de la fila + margen.
    const largo = PITCH * slots + 16;
    const distW = largo / 2 / (Math.tan(vFov / 2) * aspect);
    const distH = 40 / Math.tan(vFov / 2);
    this.desiredDistance = Math.max(distW, distH, 110) * 1.2;

    if (this.controls) this.controls.target.set(0, 0, 0);
  }

  resetView() {
    if (!this.camera || !this.controls) return;
    this._fitCamera();
    const d = this.desiredDistance;
    this.camera.position.set(0, d * 0.8, d * 0.6);
    this.camera.lookAt(this.controls.target);
    this.controls.update();
  }

  setAutoRotate(enabled) {
    this.autoEnabled = enabled;
    window.clearTimeout(this.autoTimer);
    if (this.controls) this.controls.autoRotate = enabled;
  }

  /* ----------------------------------------------------------- interacción */

  press(index) {
    const node = this.keys[index];
    if (!node) return;
    node.press = -3.2;
    node.velocity = 0;
    this.sound?.play?.(1);
    this.onPress(index);
  }

  _pointerToRay(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const ray = new THREE.Raycaster();
    ray.setFromCamera({ x, y }, this.camera);
    return ray;
  }

  _slotFromObject(object) {
    let node = object;
    while (node) {
      if (typeof node.userData?.slot === 'number') return node.userData.slot;
      node = node.parent;
    }
    return -1;
  }

  _onPointerDown(event) {
    this.pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() };
  }

  _onPointerUp(event) {
    if (!this.pointerStart) return;
    const dx = event.clientX - this.pointerStart.x;
    const dy = event.clientY - this.pointerStart.y;
    const elapsed = performance.now() - this.pointerStart.time;
    this.pointerStart = null;
    if (Math.hypot(dx, dy) > 8 || elapsed > 700) return;

    const ray = this._pointerToRay(event);
    const hits = ray.intersectObjects(this.root ? [this.root] : [], true);
    const hit = hits.find((entry) => this._slotFromObject(entry.object) >= 0);
    if (!hit) return;
    const slot = this._slotFromObject(hit.object);
    this.select(slot);
    this.press(slot);
    this.onSelect(slot);
  }

  _onKeyDown(event) {
    if (!this.state) return;
    const total = this.state.slots;
    const current = this.selected ?? 0;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const next = event.key === 'ArrowRight'
        ? Math.min(total - 1, current + 1)
        : Math.max(0, current - 1);
      this.select(next);
      this.onSelect(next);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.press(current);
    }
  }

  select(index) {
    this.selected = index;
  }

  /* --------------------------------------------------------------- render */

  _onResize() {
    if (!this.renderer || !this.camera) return;
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this._aspect = width / height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = this._aspect;
    this.camera.updateProjectionMatrix();
    this._fitCamera();
  }

  _loop() {
    if (this.disposed) return;
    this._frame = requestAnimationFrame(this._loop);
    const dt = Math.min(this.clock.getDelta(), 1 / 30);

    this.keys.forEach((node, index) => {
      const target = (index === this.selected ? 1.1 : 0) + node.press;
      if (node.press !== 0) {
        node.velocity += (-node.press * 320 - node.velocity * 22) * dt;
        node.press += node.velocity * dt;
        if (Math.abs(node.press) < 0.02 && Math.abs(node.velocity) < 0.08) {
          node.press = 0;
          node.velocity = 0;
        }
      }
      node.group.position.z += (CAP_Z + target - node.group.position.z) * Math.min(1, dt * 16);
    });

    if (this.camera && this.controls) {
      const current = this.camera.position.distanceTo(this.controls.target);
      if (Math.abs(current - this.desiredDistance) > 0.6) {
        const next = THREE.MathUtils.lerp(current, this.desiredDistance, Math.min(1, dt * 6));
        this.camera.position.sub(this.controls.target).setLength(next).add(this.controls.target);
      }
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  /* ------------------------------------------------------------ utilidades */

  async snapshot({ background = '#F1EFFC' } = {}) {
    if (!this.renderer) return null;
    const previous = this.scene.background;
    this.scene.background = new THREE.Color(background);
    this.renderer.render(this.scene, this.camera);
    const blob = await new Promise((resolve) => this.canvas.toBlob(resolve, 'image/png'));
    this.scene.background = previous;
    this.renderer.render(this.scene, this.camera);
    return blob;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this._frame);
    window.clearTimeout(this.autoTimer);
    this.resizeObserver?.disconnect();
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    this.canvas.removeEventListener('keydown', this._onKeyDown);
    this.controls?.dispose();
    this._disposeGroup();
    this.renderer?.dispose();
  }
}
