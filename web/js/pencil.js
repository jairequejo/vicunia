/**
 * Vista 3D del nombre para lápiz con la geometría real del generador
 * (letras en relieve, alturas alternas, agujero y tubo opcional).
 * Usa three.js + el motor de generador.py (js/pencil-geo.js).
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { engine } from './pencil-geo.js';

const PEN_COLOR = '#f5c542';

export class PencilPreview {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.onReady = options.onReady || (() => {});
    this.onError = options.onError || (() => {});
    this.onSelect = options.onSelect || (() => {});
    this.onBusy = options.onBusy || (() => {});

    this.spec = null;
    this.active = 0;
    this.letterMeshes = [];
    this.building = false;
    this.ready = false;
    this.token = 0;

    this._onResize = this._onResize.bind(this);
    this._loop = this._loop.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
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
      this.onError('webgl');
      return;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9a90b8, 0.95));

    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(60, 170, 100);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -160, right: 160, top: 160, bottom: -160, near: 10, far: 600 });
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.ShadowMaterial({ opacity: 0.18 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.camera = new THREE.PerspectiveCamera(32, 1, 1, 3000);
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.minDistance = 30;
    this.controls.maxDistance = 600;

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.canvas.addEventListener('pointerup', this._onPointerUp);
    new ResizeObserver(this._onResize).observe(this.canvas.parentElement);
    this._onResize();

    this.ready = true;
    this.onReady();
    this._loop();
  }

  _loop() {
    requestAnimationFrame(this._loop);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h || !this.renderer) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this._length) this._frame(this._length, true);
  }

  _frame(length, force) {
    const key = length.toFixed(0) + '|' + this.camera.aspect.toFixed(2);
    if (!force && key === this._framedKey) return;
    this._framedKey = key;
    const fov = this.camera.fov * Math.PI / 180;
    const dh = ((length + 50) / 2) / (Math.tan(fov / 2) * this.camera.aspect);
    const dv = 34 / Math.tan(fov / 2);
    const d = Math.max(dh, dv, 90) * 1.15;
    this.camera.position.set(0, d * 0.75, d * 0.65);
    this.controls.target.set(0, 5, 0);
    this.controls.update();
  }

  _onPointerUp(event) {
    if (!this._down || Math.hypot(event.clientX - this._down[0], event.clientY - this._down[1]) > 5) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, this.camera);
    const targets = this.letterMeshes.map((m) => m.back).filter(Boolean);
    const hit = ray.intersectObjects(targets, false)[0];
    if (hit && hit.object.userData.i !== undefined) {
      this.select(hit.object.userData.i);
      this.onSelect(hit.object.userData.i);
    }
  }

  /** spec: { p, lay, frontColor, backColor, showPen } */
  setState(spec) {
    this.spec = spec;
    if (!this.ready) return;
    this._rebuild();
  }

  _rebuild() {
    const my = ++this.token;
    this.onBusy(true);
    // deja pintar el indicador antes del trabajo pesado
    setTimeout(() => {
      if (my !== this.token) return;
      try {
        this._build();
      } catch (error) {
        console.warn('No se pudo construir el nombre', error);
      }
      this.onBusy(false);
    }, 20);
  }

  _build() {
    const { p, lay, frontColor, backColor, showPen } = this.spec;
    while (this.root.children.length) this.root.remove(this.root.children[0]);
    this.letterMeshes = [];

    const frontMat = this._mat(frontColor);
    frontMat.side = THREE.DoubleSide;

    lay.items.forEach((it, i) => {
      const geom3 = engine.letraSolida(it, p);
      const { front, back } = splitFrontBack(engine.triangulos(geom3));

      const backGeo = new THREE.BufferGeometry();
      backGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(back), 3));
      backGeo.computeVertexNormals();
      const backMesh = new THREE.Mesh(backGeo, this._mat(backColor));
      backMesh.position.x = it.x - lay.length / 2;
      backMesh.castShadow = backMesh.receiveShadow = true;
      backMesh.userData.i = i;
      this.root.add(backMesh);

      const frontGeo = new THREE.BufferGeometry();
      frontGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(front), 3));
      frontGeo.computeVertexNormals();
      const frontMesh = new THREE.Mesh(frontGeo, frontMat);
      frontMesh.position.x = it.x - lay.length / 2;
      frontMesh.renderOrder = 1;
      frontMesh.userData.i = i;
      this.root.add(frontMesh);

      this.letterMeshes.push({ back: backMesh, front: frontMesh, base: it.x - lay.length / 2 });
    });

    if (p.refuerzo) {
      const tube = new THREE.Mesh(this._geo(engine.tuboSolido(p, lay.length)), this._mat(backColor));
      tube.position.x = -lay.length / 2;
      tube.castShadow = true;
      tube.receiveShadow = true;
      this.root.add(tube);
    }

    if (showPen) this.root.add(this._pen(p, lay.length));

    this._length = lay.length;
    this._frame(lay.length, true);
    this._applyActive();
  }

  _mat(color) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0 });
  }

  _geo(geom3) {
    const tris = engine.triangulos(geom3);
    const f = new Float32Array(tris.length * 3);
    tris.forEach((v, i) => {
      // transformación del root: (x, y, z) -> (x, z, -y)
      f[i * 3] = v[0];
      f[i * 3 + 1] = v[2];
      f[i * 3 + 2] = -v[1];
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(f, 3));
    geo.computeVertexNormals();
    return geo;
  }

  _pen(p, L) {
    const g = new THREE.Group();
    const r = Math.max(1.2, p.agujero / 2 - 0.25);
    const len = L + 50;
    const tip = Math.max(10, r * 3.6);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), this._mat(PEN_COLOR));
    const wood = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.28, r, tip, 6), this._mat('#e7c39a'));
    const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.01, r * 0.28, tip * 0.28, 6), this._mat('#3a3a44'));
    body.position.y = 0;
    wood.position.y = len / 2 + tip / 2;
    lead.position.y = len / 2 + tip + tip * 0.14;
    [body, wood, lead].forEach((m) => { m.castShadow = true; g.add(m); });
    g.rotation.z = -Math.PI / 2;
    g.position.set(19, p.espesor / 2, 0);
    return g;
  }

  select(index) {
    this.active = index;
    this._applyActive();
  }

  _applyActive() {
    this.letterMeshes.forEach((m, i) => {
      const on = i === this.active;
      if (m.front) m.front.material.emissive?.set(on ? '#3a3a44' : '#000000');
      if (m.back) m.back.material.emissive?.set(on ? '#2a2a33' : '#000000');
    });
  }

  /** Captura la vista como PNG. */
  async snapshot(background = '#F6F2E9') {
    if (!this.renderer) return null;
    const prev = this.renderer.getClearAlpha();
    this.renderer.setClearColor(background, 1);
    this.renderer.render(this.scene, this.camera);
    const blob = await new Promise((resolve) => this.canvas.toBlob(resolve, 'image/png'));
    this.renderer.setClearAlpha(prev);
    return blob;
  }
}

/** Separa una geometría en cara frontal (adelante) y el resto (atrás). */
function splitFrontBack(triangles) {
  const front = [];
  const back = [];
  const world = (v) => [v[0], v[2], -v[1]];

  for (let i = 0; i < triangles.length; i += 3) {
    const a = world(triangles[i]);
    const b = world(triangles[i + 1]);
    const c = world(triangles[i + 2]);

    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;

    const isFront = nz > 0.25;
    const push = (arr, P, dz) => arr.push(P[0], P[1], P[2] + dz);

    if (isFront) {
      push(front, a, 0.6);
      push(front, b, 0.6);
      push(front, c, 0.6);
    }
    push(back, a, 0);
    push(back, b, 0);
    push(back, c, 0);
  }

  return { front, back };
}
