// three.js sahnesi için ortak kurulum: renderer, kamera, stüdyo ışığı, yörünge kontrolü,
// kamera geçişleri, nesneye bağlı HTML etiketleri (iğne), hazır malzemeler, kalite ayarı
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export { THREE };

/* ---------------- Kalite ----------------
 * yuksek: tam çözünürlük, yumuşak gölge, gerçek cam (transmission)
 * orta:   1,5x çözünürlük, gölge
 * dusuk:  1x çözünürlük, gölgesiz, cam yerine yarı saydam yüzey (zayıf akıllı tahtalar)
 * ?kalite=dusuk adres parametresi ya da localStorage "edu:kalite" ile zorlanabilir. */
const KALITELER = ["dusuk", "orta", "yuksek"];
function kaliteOku() {
  try {
    const p = new URLSearchParams(location.search).get("kalite");
    if (KALITELER.includes(p)) return p;
    const d = localStorage.getItem("edu:kalite");
    if (KALITELER.includes(d)) return d;
  } catch { /* depolama kapalı olabilir */ }
  const cekirdek = navigator.hardwareConcurrency || 4;
  return cekirdek <= 2 ? "dusuk" : cekirdek <= 4 ? "orta" : "yuksek";
}
export let kalite = typeof window !== "undefined" ? kaliteOku() : "orta";

/* ---------------- Malzemeler ---------------- */
export const malzeme = {
  /** Gerçek cam: arkasını kırarak gösterir; düşük kalitede yarı saydam yüzeye döner */
  cam({ renk = 0xffffff, puruz = 0.04, kalinlik = 0.4, opaklik = 0.22 } = {}) {
    if (kalite === "dusuk") {
      return new THREE.MeshPhysicalMaterial({ color: renk, roughness: 0.1, metalness: 0, transparent: true, opacity: opaklik, depthWrite: false, side: THREE.DoubleSide, clearcoat: 1 });
    }
    return new THREE.MeshPhysicalMaterial({
      color: renk, roughness: puruz, metalness: 0, transmission: 1, thickness: kalinlik, ior: 1.5,
      transparent: true, opacity: 1, clearcoat: 1, clearcoatRoughness: 0.05, specularIntensity: 1, side: THREE.DoubleSide,
    });
  },
  /** Kap içindeki sıvı */
  sivi(renk = 0x6fb8ff, { opaklik = 0.55 } = {}) {
    return new THREE.MeshPhysicalMaterial({ color: renk, roughness: 0.08, transmission: kalite === "dusuk" ? 0 : 0.6, thickness: 1.5, ior: 1.33, transparent: true, opacity: opaklik, depthWrite: false });
  },
  metal(renk = 0xb8c2cc, { puruz = 0.3 } = {}) {
    return new THREE.MeshStandardMaterial({ color: renk, metalness: 1, roughness: puruz });
  },
  plastik(renk, { puruz = 0.45, parlak = 0.3 } = {}) {
    return new THREE.MeshPhysicalMaterial({ color: renk, roughness: puruz, clearcoat: parlak, clearcoatRoughness: 0.3 });
  },
  /** Mat, doğal yüzey (toprak, yaprak, kürk, ahşap) */
  mat(renk, { puruz = 0.85 } = {}) {
    return new THREE.MeshStandardMaterial({ color: renk, roughness: puruz, metalness: 0 });
  },
  /** Kendinden ışıyan (alev, güneş, ekran, vurgulanan parça) */
  isik(renk, guc = 1.5) {
    return new THREE.MeshStandardMaterial({ color: renk, emissive: renk, emissiveIntensity: guc, roughness: 1 });
  },
};

/** Dikey renk geçişli gökyüzü / stüdyo zemini (ekran uzayında) */
function gradyanDoku(ust, alt) {
  const t = document.createElement("canvas");
  t.width = 2; t.height = 256;
  const c = t.getContext("2d");
  const g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, `#${new THREE.Color(ust).getHexString()}`);
  g.addColorStop(1, `#${new THREE.Color(alt).getHexString()}`);
  c.fillStyle = g; c.fillRect(0, 0, 2, 256);
  const d = new THREE.CanvasTexture(t);
  d.colorSpace = THREE.SRGBColorSpace;
  return d;
}

const yumusak = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * @param {HTMLElement} kap
 * @param {object} o
 *   arkaPlan: tek renk ya da [üst, alt] renk geçişi · sis: [yakın, uzak]
 *   ortam: stüdyo yansımaları (PBR) · isik: "studyo" | "klasik"
 */
export function sahne3dKur(kap, {
  kameraKonum = [0, 20, 40], hedef = [0, 0, 0], arkaPlan = 0x0d1522, sis = null,
  ortam = true, isik = "studyo", pozlama = 1, gorusAcisi = 45,
} = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: kalite !== "dusuk", powerPreference: "high-performance" });
  const azamiOran = { dusuk: 1, orta: 1.5, yuksek: 2 }[kalite];
  let piksel = Math.min(window.devicePixelRatio || 1, azamiOran);
  renderer.setPixelRatio(piksel);
  renderer.shadowMap.enabled = kalite !== "dusuk";
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = pozlama;
  renderer.domElement.className = "d-3b";
  kap.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const altRenk = Array.isArray(arkaPlan) ? arkaPlan[1] : arkaPlan;
  scene.background = Array.isArray(arkaPlan) ? gradyanDoku(arkaPlan[0], arkaPlan[1]) : new THREE.Color(arkaPlan);
  if (sis) scene.fog = new THREE.Fog(altRenk, sis[0], sis[1]);
  if (ortam) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = isik === "studyo" ? 0.7 : 0.35;
    pmrem.dispose();
  }

  const camera = new THREE.PerspectiveCamera(gorusAcisi, 1, 0.1, 2000);
  camera.position.set(...kameraKonum);

  const kontrol = new OrbitControls(camera, renderer.domElement);
  kontrol.target.set(...hedef);
  kontrol.enableDamping = true;
  kontrol.maxPolarAngle = Math.PI * 0.49;
  kontrol.minDistance = 5;
  kontrol.maxDistance = 400;

  const gok = new THREE.HemisphereLight(0xdfeaff, 0x3a3326, isik === "studyo" ? 0.55 : 1.1);
  const gunes = new THREE.DirectionalLight(0xfff4e6, isik === "studyo" ? 2.6 : 2.2);
  gunes.position.set(-40, 80, 40);
  gunes.castShadow = kalite !== "dusuk";
  gunes.shadow.mapSize.set(kalite === "yuksek" ? 2048 : 1024, kalite === "yuksek" ? 2048 : 1024);
  gunes.shadow.bias = -0.0004;
  gunes.shadow.normalBias = 0.02;
  const g = gunes.shadow.camera;
  g.left = -120; g.right = 120; g.top = 60; g.bottom = -60; g.far = 300;
  scene.add(gok, gunes, gunes.target);

  /* Panellerin altında kalan alanı hesaba katarak görüş merkezini görünür bölgeye kaydır */
  const boyutla = () => {
    const w = kap.clientWidth, h = kap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const st = getComputedStyle(kap);
    const px = (ad) => parseFloat(st.getPropertyValue(ad)) || 0;
    const sol = px("--sol-bosluk"), sag = px("--sag-bosluk"), ust = px("--ust-bosluk"), alt = px("--alt-bosluk");
    if (sol || sag || ust || alt) camera.setViewOffset(w, h, (sag - sol) / 2, (alt - ust) / 2, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(boyutla).observe(kap);
  window.addEventListener("d-yerlesim", boyutla);
  boyutla();

  /* İğneler: 3B bir noktaya bağlı, her karede yeri güncellenen HTML etiketleri */
  const igneKatmani = document.createElement("div");
  igneKatmani.className = "d-igneler";
  kap.append(igneKatmani);
  const igneler = new Set();
  const gecici = new THREE.Vector3();
  function igneleriGuncelle() {
    if (!igneler.size) return;
    const w = kap.clientWidth, h = kap.clientHeight;
    for (const n of igneler) {
      if (n.gizli) { n.el.style.display = "none"; continue; }
      if (n.hedef.isObject3D) n.hedef.getWorldPosition(gecici); else gecici.copy(n.hedef);
      gecici.project(camera);
      const gorunur = gecici.z < 1 && Math.abs(gecici.x) < 1.15 && Math.abs(gecici.y) < 1.15;
      n.el.style.display = gorunur ? "" : "none";
      if (gorunur) n.el.style.transform = `translate(${((gecici.x + 1) / 2) * w}px, ${((1 - gecici.y) / 2) * h}px)`;
    }
  }

  /* Kamera geçişi */
  let gecis = null;
  function kameraGit({ konum, hedef: yeniHedef, sure = 1.4 } = {}) {
    gecis?.coz();
    return new Promise((coz) => {
      gecis = {
        t: 0, sure: Math.max(0.01, sure), coz,
        k0: camera.position.clone(), k1: konum ? new THREE.Vector3(...konum) : camera.position.clone(),
        h0: kontrol.target.clone(), h1: yeniHedef ? new THREE.Vector3(...yeniHedef) : kontrol.target.clone(),
      };
    });
  }

  /* Kare döngüsü + kare hızı düşükse kaliteyi kendiliğinden azalt */
  const dinleyiciler = new Set();
  const saat = new THREE.Clock();
  let olcum = { kare: 0, sure: 0, bitti: false };
  renderer.setAnimationLoop(() => {
    // Hareket analitik hesaplandığı için büyük adımlar doğruluğu bozmaz; sınır yalnızca
    // sekme arka plandan dönünce oluşan dev sıçramaları önler. Zayıf akıllı tahtalarda
    // (düşük kare hızı) simülasyonun ağır çekime düşmemesi için yüksek tutuldu.
    const dt = Math.min(saat.getDelta(), 0.25);
    if (!olcum.bitti && dt < 0.25) {
      olcum.kare++; olcum.sure += dt;
      if (olcum.kare === 120) {
        const fps = olcum.kare / olcum.sure;
        if (fps < 28 && piksel > 1) { piksel = 1; renderer.setPixelRatio(1); boyutla(); olcum = { kare: 0, sure: 0, bitti: false }; }
        else if (fps < 24 && renderer.shadowMap.enabled) { renderer.shadowMap.enabled = false; olcum.bitti = true; }
        else olcum.bitti = true;
      }
    }
    if (gecis) {
      gecis.t += dt / gecis.sure;
      const k = yumusak(Math.min(1, gecis.t));
      camera.position.lerpVectors(gecis.k0, gecis.k1, k);
      kontrol.target.lerpVectors(gecis.h0, gecis.h1, k);
      if (gecis.t >= 1) { const c = gecis.coz; gecis = null; c(); }
    }
    for (const fn of dinleyiciler) fn(dt);
    kontrol.update();
    renderer.render(scene, camera);
    igneleriGuncelle();
  });

  return {
    THREE, scene, camera, renderer, kontrol, gunes, gok, kalite,
    /** Her karede çağrılacak fonksiyon ekler; kaldırma fonksiyonu döndürür */
    herKare(fn) { dinleyiciler.add(fn); return () => dinleyiciler.delete(fn); },
    /** Kamerayı yumuşakça yeni konuma/hedefe taşır; geçiş bitince çözülen Promise döner */
    kameraGit,
    /** Kamerayı anında konumlar (adım başında) */
    kameraKoy({ konum, hedef: h }) { gecis?.coz(); gecis = null; if (konum) camera.position.set(...konum); if (h) kontrol.target.set(...h); kontrol.update(); },
    /**
     * 3B bir nesneye ya da noktaya bağlı etiket. hedef: Object3D | Vector3 | [x,y,z]
     * Dönen nesne: { el, metin(html), gizle(bool), kaldir() }
     */
    igne(hedef, html, { renk = "#ffb547", no = null, yon = "ust", tik = null } = {}) {
      const el = document.createElement("div");
      el.className = `d-igne yon-${yon}${tik ? " tiklanir" : ""}`;
      el.style.setProperty("--renk", renk);
      el.innerHTML = `<i></i><span>${no != null ? `<b>${no}</b>` : ""}<em></em></span>`;
      const em = el.querySelector("em");
      em.innerHTML = html;
      if (tik) el.querySelector("span").addEventListener("click", tik);
      igneKatmani.append(el);
      const n = { el, hedef: Array.isArray(hedef) ? new THREE.Vector3(...hedef) : hedef, gizli: false };
      igneler.add(n);
      return {
        el,
        metin(yeni) { em.innerHTML = yeni; },
        gizle(b = true) { n.gizli = b; },
        kaldir() { igneler.delete(n); el.remove(); },
      };
    },
    /** Gölge yakalayan zemin; renk verilirse görünür zemin olur */
    zemin({ boyut = 200, renk = null, y = 0, golgeOpaklik = 0.28 } = {}) {
      const m = renk == null ? new THREE.ShadowMaterial({ opacity: golgeOpaklik }) : malzeme.mat(renk, { puruz: 0.95 });
      const z = new THREE.Mesh(new THREE.PlaneGeometry(boyut, boyut), m);
      z.rotation.x = -Math.PI / 2; z.position.y = y; z.receiveShadow = true;
      scene.add(z);
      return z;
    },
    /** Arka planı değiştir: tek renk ya da [üst, alt] */
    arkaPlan(r) {
      scene.background?.dispose?.();
      scene.background = Array.isArray(r) ? gradyanDoku(r[0], r[1]) : new THREE.Color(r);
      if (scene.fog) scene.fog.color.set(Array.isArray(r) ? r[1] : r);
    },
  };
}

/* ---------------- Doğal görünüm: gürültü, organik şekil, doku ---------------- */
/** Tekrarlanabilir rastgele sayı üreteci (aynı tohum → aynı sahne) */
export function rastgele(tohum = 1) {
  let s = tohum >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
/** 3B değer gürültüsü, -1..1 (yumuşak, tekrarlanabilir) */
export function gurultu3(x, y, z, tohum = 0) {
  const h = (i, j, k) => {
    let n = (i * 374761393 + j * 668265263 + k * 2147483647 + tohum * 1274126177) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296 * 2 - 1;
  };
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const f = (t) => t * t * (3 - 2 * t);
  const u = f(x - xi), v = f(y - yi), w = f(z - zi);
  const l = (a, b, t) => a + (b - a) * t;
  return l(
    l(l(h(xi, yi, zi), h(xi + 1, yi, zi), u), l(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
    l(l(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), l(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v), w);
}
/** Birkaç katmanlı (fraktal) gürültü */
export function fbm(x, y, z, { oktav = 3, tohum = 0 } = {}) {
  let t = 0, a = 0.5, f = 1;
  for (let i = 0; i < oktav; i++) { t += a * gurultu3(x * f, y * f, z * f, tohum + i); a *= 0.5; f *= 2; }
  return t;
}
/**
 * Geometriyi organikleştirir: köşeleri normalleri yönünde gürültüyle iter.
 * Mükemmel küre/silindir yerine tane, taş, meyve, yaprak gibi doğal biçimler verir.
 */
export function organiklestir(geo, { genlik = 0.06, olcek = 2, tohum = 1, oktav = 3 } = {}) {
  const p = geo.attributes.position;
  if (!geo.attributes.normal) geo.computeVertexNormals();
  const n = geo.attributes.normal;
  // Dikişlerdeki çift köşeler aynı yere gitsin diye gürültü konumdan hesaplanır
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const d = genlik * fbm(x * olcek, y * olcek, z * olcek, { oktav, tohum });
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}
/**
 * Doğal yüzey dokusu (renk + pürüz): benekler, lekeler, lifler.
 * Dönen { renk, puruz } dokuları MeshStandardMaterial'ın map / roughnessMap / bumpMap alanlarına verilir.
 */
export function yuzeyDokusu({ boyut = 256, taban = "#c8a46a", koyu = "#8a6a3a", acik = "#e6cf9c", olcek = 6, benek = 0.15, lif = 0, lifSiklik = 24, uzama = [1, 1], tohum = 3 } = {}) {
  const tuvalR = document.createElement("canvas"), tuvalP = document.createElement("canvas");
  tuvalR.width = tuvalR.height = tuvalP.width = tuvalP.height = boyut;
  const cr = tuvalR.getContext("2d"), cp = tuvalP.getContext("2d");
  const ir = cr.createImageData(boyut, boyut), ip = cp.createImageData(boyut, boyut);
  const T = new THREE.Color(taban), K = new THREE.Color(koyu), A = new THREE.Color(acik), c = new THREE.Color();
  const r = rastgele(tohum);
  for (let j = 0; j < boyut; j++) for (let i = 0; i < boyut; i++) {
    const u = (i / boyut) * olcek, v = (j / boyut) * olcek, su = i / boyut, sv = j / boyut;
    // Doku tekrarlandığında dikiş görünmesin: dört kaydırılmış örneğin harmanı
    const n = (x, y) => fbm(x * uzama[0], y * uzama[1], 0.5, { oktav: 4, tohum });
    let g = (n(u, v) * (1 - su) + n(u - olcek, v) * su) * (1 - sv) + (n(u, v - olcek) * (1 - su) + n(u - olcek, v - olcek) * su) * sv;
    // Ahşap gibi lifli yüzeyler: gürültüyle bükülen ince halkalar
    if (lif) g = g * (1 - lif) + lif * Math.sin(sv * lifSiklik * Math.PI * 2 + g * 6) * 0.6;
    const nokta = r() < benek ? (r() - 0.5) * 0.9 : 0;
    const t = Math.max(-1, Math.min(1, g * 1.6 + nokta));
    c.copy(T).lerp(t < 0 ? K : A, Math.abs(t));
    const k = (j * boyut + i) * 4;
    ir.data[k] = c.r * 255; ir.data[k + 1] = c.g * 255; ir.data[k + 2] = c.b * 255; ir.data[k + 3] = 255;
    const pz = 150 + t * 70;
    ip.data[k] = ip.data[k + 1] = ip.data[k + 2] = pz; ip.data[k + 3] = 255;
  }
  cr.putImageData(ir, 0, 0); cp.putImageData(ip, 0, 0);
  const renk = new THREE.CanvasTexture(tuvalR), puruz = new THREE.CanvasTexture(tuvalP);
  renk.colorSpace = THREE.SRGBColorSpace;
  for (const d of [renk, puruz]) { d.wrapS = d.wrapT = THREE.RepeatWrapping; d.anisotropy = 4; }
  return { renk, puruz };
}

/** Aynı geometriden çok sayıda kopya (çimen, kabarcık, molekül, bakteri) */
export function coklu(geometri, malz, sayi, { golge = false } = {}) {
  const m = new THREE.InstancedMesh(geometri, malz, sayi);
  m.castShadow = golge;
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const kukla = new THREE.Object3D();
  m.userData.yerlestir = (i, x, y, z, olcek = 1, donus = 0, egim = 0) => {
    kukla.position.set(x, y, z);
    kukla.rotation.set(egim, donus, 0);
    if (Array.isArray(olcek)) kukla.scale.set(...olcek); else kukla.scale.setScalar(olcek);
    kukla.updateMatrix();
    m.setMatrixAt(i, kukla.matrix);
  };
  m.userData.bitir = () => { m.instanceMatrix.needsUpdate = true; };
  return m;
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
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: doku, depthWrite: false, transparent: true, toneMapped: false }));
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
  const malz = new THREE.MeshStandardMaterial({ color: renk, emissive: renk, emissiveIntensity: 0.35 });
  const govde = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1, 12), malz);
  const uc = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 16), malz);
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
