// three.js sahnesi için ortak kurulum: renderer, kamera, ışık, yörünge kontrolü, yazı etiketleri
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export { THREE };

export function sahne3dKur(kap, { kameraKonum = [0, 20, 40], hedef = [0, 0, 0], arkaPlan = 0x0d1522, sis = null } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = "d-3b";
  kap.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(arkaPlan);
  if (sis) scene.fog = new THREE.Fog(arkaPlan, sis[0], sis[1]);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
  camera.position.set(...kameraKonum);

  const kontrol = new OrbitControls(camera, renderer.domElement);
  kontrol.target.set(...hedef);
  kontrol.enableDamping = true;
  kontrol.maxPolarAngle = Math.PI * 0.49;
  kontrol.minDistance = 5;
  kontrol.maxDistance = 400;

  scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x2a2f22, 1.1));
  const gunes = new THREE.DirectionalLight(0xffffff, 2.2);
  gunes.position.set(-40, 80, 40);
  gunes.castShadow = true;
  gunes.shadow.mapSize.set(2048, 2048);
  const g = gunes.shadow.camera;
  g.left = -120; g.right = 120; g.top = 60; g.bottom = -60; g.far = 300;
  scene.add(gunes, gunes.target);

  const boyutla = () => {
    const w = kap.clientWidth, h = kap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(boyutla).observe(kap);
  boyutla();

  const dinleyiciler = new Set();
  const saat = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    // Hareket analitik hesaplandığı için büyük adımlar doğruluğu bozmaz; sınır yalnızca
    // sekme arka plandan dönünce oluşan dev sıçramaları önler. Zayıf akıllı tahtalarda
    // (düşük kare hızı) simülasyonun ağır çekime düşmemesi için yüksek tutuldu.
    const dt = Math.min(saat.getDelta(), 0.25);
    for (const fn of dinleyiciler) fn(dt);
    kontrol.update();
    renderer.render(scene, camera);
  });

  return {
    THREE, scene, camera, renderer, kontrol, gunes,
    /** Her karede çağrılacak fonksiyon ekler; kaldırma fonksiyonu döndürür */
    herKare(fn) { dinleyiciler.add(fn); return () => dinleyiciler.delete(fn); },
  };
}

/** Kameraya dönük yazı etiketi (sprite) */
export function yaziEtiketi(metin, { boyut = 1, renk = "#ffffff", zemin = "rgba(15,23,36,.85)", kalin = true } = {}) {
  const tuval = document.createElement("canvas");
  const c = tuval.getContext("2d");
  const font = `${kalin ? "700 " : ""}64px Segoe UI, system-ui, sans-serif`;
  c.font = font;
  const gen = Math.ceil(c.measureText(metin).width) + 48;
  tuval.width = gen; tuval.height = 96;
  c.font = font;
  if (zemin) {
    c.fillStyle = zemin;
    const r = 28;
    c.beginPath();
    c.roundRect(0, 0, gen, 96, r);
    c.fill();
  }
  c.fillStyle = renk;
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(metin, gen / 2, 50);
  const doku = new THREE.CanvasTexture(tuval);
  doku.colorSpace = THREE.SRGBColorSpace;
  doku.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: doku, depthWrite: false, transparent: true }));
  sprite.scale.set((gen / 96) * boyut, boyut, 1);
  sprite.userData.metniDegistir = (yeni) => {
    sprite.material.map.dispose();
    const y = yaziEtiketi(yeni, { boyut, renk, zemin, kalin });
    sprite.material.map = y.material.map;
    sprite.scale.copy(y.scale);
  };
  return sprite;
}

/** Ok (vektör) — boyu ve yönü sonradan güncellenebilir */
export function vektorOku(renk) {
  const grup = new THREE.Group();
  const malzeme = new THREE.MeshStandardMaterial({ color: renk, emissive: renk, emissiveIntensity: 0.35 });
  const govde = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1, 12), malzeme);
  const uc = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 16), malzeme);
  govde.rotation.z = -Math.PI / 2;
  uc.rotation.z = -Math.PI / 2;
  grup.add(govde, uc);
  grup.userData.ayarla = (uzunluk) => {
    const L = Math.abs(uzunluk);
    grup.visible = L > 0.05;
    const yon = Math.sign(uzunluk) || 1;
    const govdeL = Math.max(0.01, L - 1.1);
    govde.scale.set(1, govdeL, 1);
    govde.position.x = (yon * govdeL) / 2;
    uc.position.x = yon * (govdeL + 0.55);
    uc.rotation.z = yon > 0 ? -Math.PI / 2 : Math.PI / 2;
  };
  grup.userData.ayarla(1);
  return grup;
}
