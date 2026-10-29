// Ortak 3B harita: kabartmalı arazi (three.js) + üstünde ekran uzayında SVG çizim katmanı (d3-geo + world-atlas).
// Bugünkü sınırlar Natural Earth verisinden (world-atlas, kamu malı) gelir; ayrıntılı bölge verisi
// bolge.json'da 50m çözünürlükten [18°D–84°D, 24°K–50°K] kutusuna kırpılmıştır. Kutu dışı için 110m kara.
import { geoPath, geoGraticule } from "d3-geo";
import { sahne3dKur, THREE, kalite } from "../../../../engine/sahne3d.js";
import { araziUret, araziOrgusu, kureOrgusu } from "./arazi.js";
import { feature } from "topojson-client";
import kara110 from "world-atlas/land-110m.json";
import bolge from "./bolge.json";
import { stilEkle } from "./bilesenler.js";

/** Kırpılmış veride kutu kenarına düşen kenarlar sınır değildir; çizilecek sınır/kıyı çizgilerini ayırır */
export function kenarlariHazirla(fc) {
  const k = fc.kirpma;
  for (const f of fc.features) {
    if (k) f.properties.kirpma = k;
    if (!k || f.properties.kenar) continue;
    const [L0, B0, L1, B1] = k;
    const kenarda = (p, q) => [[0, L0], [0, L1], [1, B0], [1, B1]].some(([e, v]) => Math.abs(p[e] - v) < 1e-6 && Math.abs(q[e] - v) < 1e-6);
    const kenar = [];
    for (const poly of f.geometry.coordinates) for (const halka of poly) {
      let parca = [];
      for (let i = 0; i < halka.length - 1; i++) {
        const p = halka[i], q = halka[i + 1];
        if (kenarda(p, q)) { if (parca.length > 1) kenar.push(parca); parca = []; continue; }
        if (!parca.length) parca.push(p);
        parca.push(q);
      }
      if (parca.length > 1) kenar.push(parca);
    }
    f.properties.kenar = { type: "MultiLineString", coordinates: kenar };
  }
  return fc.features;
}
export const BOLGE = kenarlariHazirla(bolge);
export const UZAK_KARA = feature(kara110, kara110.objects.land);

const D2R = Math.PI / 180;
const NS = "http://www.w3.org/2000/svg";
/** SVG öğesi oluşturur */
export function svg(etiket, ozellik = {}, ebeveyn) {
  const e = document.createElementNS(NS, etiket);
  for (const [k, v] of Object.entries(ozellik)) if (v != null && v !== false) e.setAttribute(k, v);
  if (ebeveyn) ebeveyn.append(e);
  return e;
}

const CSS = `
.hrt-harita { position: absolute; inset: 0; overflow: hidden; background: #0b111b; }
.hrt-harita > canvas.d-3b { position: absolute; inset: 0; }
.hrt-ust { position: absolute; inset: 0; touch-action: none; cursor: grab; z-index: 2; }
.hrt-ust.suruklen { cursor: grabbing; }
.hrt-ust > svg { display: block; width: 100%; height: 100%; user-select: none; -webkit-user-select: none; overflow: visible; }
.hrt-sinir { fill: none; stroke: #55677f; stroke-width: .7; stroke-linejoin: round; }
.hrt-izgara { fill: none; stroke: rgba(225, 236, 248, .28); stroke-width: .8; }
.hrt-izgara.guclu { stroke: rgba(79, 195, 247, .6); stroke-width: 1.2; }
.hrt-izgara-et { fill: #d7e8f7; font: 600 11px "Segoe UI", system-ui, sans-serif; paint-order: stroke; stroke: #0b1522; stroke-width: 3px; }
.hrt-et { font: 600 13px "Segoe UI", system-ui, sans-serif; fill: #f2f5fa; paint-order: stroke; stroke: #0b1522; stroke-width: 3.4px; stroke-linejoin: round; pointer-events: none; }
.hrt-et.kucuk { font-size: 11.5px; font-weight: 600; }
.hrt-et.soluk { fill: #c3cedc; }
.hrt-et.bolge { font-size: 12px; font-style: italic; font-weight: 700; fill: #f1e3b4; letter-spacing: .14em; text-transform: uppercase; }
.hrt-et.deniz { font-size: 11.5px; font-style: italic; font-weight: 600; fill: #a9d3f0; letter-spacing: .08em; stroke: #0c2a44; }
.hrt-et.vurgu { fill: var(--vurgu); }
.hrt-nokta { fill: #e8eef7; stroke: #0b1522; stroke-width: 1.5; }
.hrt-alan { stroke-width: 1.8; stroke-dasharray: 6 4; fill-opacity: .3; }
.hrt-cizgi { fill: none; stroke-width: 2.8; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 1px 1.5px rgba(0,0,0,.55)); }
.hrt-ok { fill: none; stroke-width: 3; stroke-linecap: round; filter: drop-shadow(0 1px 1.5px rgba(0,0,0,.55)); }
.hrt-nabiz { animation: hrt-nabiz 1.6s ease-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes hrt-nabiz { 0% { opacity: .9; transform: scale(.6); } 100% { opacity: 0; transform: scale(2.2); } }
.hrt-uyari { position: absolute; z-index: 3; left: calc(var(--sol-bosluk, 0px) + 10px); top: calc(var(--ust-bosluk, 0px) + 10px); max-width: min(460px, 70%); font-size: 11.5px; line-height: 1.35;
  color: #c9d4e4; background: rgba(11, 17, 27, .82); border: 1px solid var(--cizgi); border-radius: 8px; padding: 4px 8px; pointer-events: none; }
.hrt-uyari:empty { display: none; }
.hrt-imlec { position: absolute; z-index: 3; right: calc(var(--sag-bosluk, 0px) + 10px); top: calc(var(--ust-bosluk, 0px) + 10px); font: 12px var(--mono); color: #cfe7ff; background: rgba(11,17,27,.82);
  border: 1px solid var(--cizgi); border-radius: 8px; padding: 3px 8px; pointer-events: none; }
.hrt-imlec:empty { display: none; }
.hrt-kaynak { position: absolute; z-index: 1; left: calc(var(--sol-bosluk, 0px) + 10px); bottom: calc(var(--alt-bosluk, 0px) + 6px); font-size: 10px; color: rgba(220, 230, 242, .7);
  text-shadow: 0 1px 2px #000; pointer-events: none; }
body:has(.hrt-serit) .hrt-kaynak { bottom: calc(var(--alt-bosluk, 0px) + 112px); }
.hrt-harita:has(.hrt-izgara-et) .hrt-kaynak { bottom: calc(var(--alt-bosluk, 0px) + 26px); }
@media (max-width: 760px) {
  .hrt-et { font-size: 11px; } .hrt-et.kucuk { font-size: 10px; } .hrt-et.bolge { font-size: 10px; letter-spacing: .08em; }
  .hrt-uyari { font-size: 10.5px; max-width: 80%; }
  .hrt-kaynak { font-size: 9px; }
}
@media (prefers-reduced-motion: reduce) { .hrt-nabiz { animation: none; } }
`;

/**
 * Haritayı kap'ın içine (en alta) 3B kabartmalı arazi olarak kurar; çizimler arazinin üstünde
 * ekran uzayında bir SVG katmanında durur ve kamera her değiştiğinde yeniden yerleşir.
 * ayar: { kutu: [[boylam0, enlem0], [boylam1, enlem1]] | null (Dünya küresi), projeksiyon: "konik"|"merkator"|"dunya",
 *         ozellikler: GeoJSON Feature[] (varsayılan: BOLGE), izgara: derece adımı | null, ulkeSinif: (f) => sınıf
 *         ("vurgu", "soluk", "isaretli", "sinirsiz"), uzakKara, pay: { ust, sag, alt, sol } | (W, H) => {…},
 *         egim: kamera eğimi (derece), merkez: kürede bakılan [boylam, enlem], kabartma: false ise düz }
 */
export function haritaKur(kap, ayar = {}) {
  stilEkle("hrt-harita-stil", CSS);
  const kok = document.createElement("div");
  kok.className = "hrt-harita";
  kap.prepend(kok);
  const S = sahne3dKur(kok, { kameraKonum: [0, 160, 110], hedef: [0, 0, 0], arkaPlan: [0x0a1322, 0x2a4560], pozlama: 1.05 });
  S.kontrol.enabled = false;
  S.kontrol.enableDamping = false;
  S.scene.fog = new THREE.Fog(0x2a4560, 300, 900);
  S.gok.intensity = 0.9;
  S.scene.environmentIntensity = 0.5;
  S.gunes.intensity = 2.1;
  const deniz = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshStandardMaterial({ color: 0x123c5c, roughness: 0.9, metalness: 0 }));
  deniz.rotation.x = -Math.PI / 2; deniz.position.y = -0.08;
  S.scene.add(deniz);
  const modelKok = new THREE.Group();
  S.scene.add(modelKok);
  // Yalnız bir şey değişince çiz: durağan haritayı her karede yeniden çizmek zayıf tahtalarda
  // ve yazılım GL'de işlemciyi boğar. Kamera, tuval boyutu, görünen nesneler ya da canlandırma
  // (herKare) değişince çizilir; güvenlik için en geç 2 sn'de bir.
  const asilCiz = S.renderer.render.bind(S.renderer);
  let cizImza = NaN, cizZaman = 0, canli = 0, cizGerek = true;
  S.renderer.render = (sahne, kamera) => {
    const tv = S.renderer.domElement;
    let imza = tv.width * 8191 + tv.height;
    sahne.traverseVisible((o) => { imza = (imza * 31 + o.id) | 0; });
    const simdi = performance.now();
    if (!cizGerek && !canli && imza === cizImza && simdi - cizZaman < 2000) return;
    cizImza = imza; cizZaman = simdi; cizGerek = false;
    asilCiz(sahne, kamera);
  };

  const ust = document.createElement("div"); ust.className = "hrt-ust"; kok.append(ust);
  const s = svg("svg", { role: "img", "aria-label": "Harita" }, ust);
  const defs = svg("defs", {}, s);
  const okUcu = (id, renk) => {
    const m = svg("marker", { id, viewBox: "0 0 10 10", refX: 7, refY: 5, markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" }, defs);
    svg("path", { d: "M0,0 L10,5 L0,10 z", fill: renk }, m);
  };
  const OK_RENKLERI = { sari: "#ffb547", mavi: "#4fc3f7", yesil: "#5ad38b", kirmizi: "#ff6b6b", mor: "#b89cff", beyaz: "#e8eef7" };
  for (const [ad, r] of Object.entries(OK_RENKLERI)) okUcu(`hrt-uc-${ad}`, r);
  const izgaraG = svg("g", {}, s), katmanG = svg("g", {}, s);
  const uyari = document.createElement("div"); uyari.className = "hrt-uyari"; kok.append(uyari);
  const imlec = document.createElement("div"); imlec.className = "hrt-imlec"; kok.append(imlec);
  const kaynak = document.createElement("div"); kaynak.className = "hrt-kaynak"; kok.append(kaynak);
  kaynak.textContent = "Kabartma, göl ve akarsular temsilîdir · Sınırlar: Natural Earth";

  const VARSAYILAN = { kutu: [[24, 33], [80, 47]], projeksiyon: "konik", ozellikler: BOLGE, izgara: null, ulkeSinif: null, uzakKara: true, pay: null, egim: 56, merkez: [35, 39], kabartma: true };
  let d = { ...VARSAYILAN, ...ayar };
  let W = 0, H = 0;
  let arazi = null; // { mod, sinirlar, anahtar, orgu-api }
  let gorus = null; // son yerleştirmenin kamera bilgisi
  const katmanlar = new Map(), modeller = new Map();
  const dinleyiciler = new Set();

  /* ---------- Arazi ---------- */
  const mod = () => (d.projeksiyon === "dunya" || !d.kutu ? "kure" : "duz");
  function katmanListesi() {
    const liste = [];
    if (d.uzakKara && mod() === "duz") liste.push({ ozellikler: UZAK_KARA.features, kirpma: null, siniflar: [], sinirCiz: false });
    let son = null;
    for (const f of d.ozellikler) {
      const k = f.properties?.kirpma || null;
      if (!son || son.kirpma !== k) { son = { ozellikler: [], kirpma: k, siniflar: [], sinirCiz: true }; liste.push(son); }
      son.ozellikler.push(f);
      son.siniflar.push(d.ulkeSinif?.(f) || "");
    }
    return liste;
  }
  function gerekliSinir() {
    const [[l0, b0], [l1, b1]] = d.kutu;
    const w = l1 - l0, h = b1 - b0;
    return [l0 - 0.3 * w - 0.5, Math.max(-78, b0 - 0.3 * h - 0.4), l1 + 0.3 * w + 0.5, Math.min(80, b1 + 0.7 * h + 0.8)];
  }
  // Arazi üretimi ağırdır (yaklaşık 1 s): sayfa yüklenene kadar ertelenir, ilk ekran ve "load" olayı beklemesin
  let ertelendi = false;
  function araziHazirla(ek = null) {
    if (document.readyState !== "complete") {
      if (!ertelendi) {
        ertelendi = true;
        window.addEventListener("load", () => setTimeout(() => { W = kok.clientWidth; H = kok.clientHeight; araziHazirla(); yerlestir(0); kirli = true; }, 30), { once: true });
      }
      return false;
    }
    const m = mod();
    const kats = katmanListesi();
    const anahtar = `${m}|${d.kabartma}|${kats.map((k) => `${k.ozellikler.length}:${k.ozellikler[0]?.properties?.ad}:${k.kirpma}:${k.siniflar.join(",")}`).join("/")}`;
    let sinirlar;
    if (m === "kure") sinirlar = [-180, -85, 180, 85];
    else {
      const g = gerekliSinir();
      if (ek) { g[0] = Math.min(g[0], ek[0]); g[1] = Math.max(-80, Math.min(g[1], ek[1])); g[2] = Math.max(g[2], ek[2]); g[3] = Math.min(82, Math.max(g[3], ek[3])); }
      const a = arazi?.mod === "duz" ? arazi.sinirlar : null;
      const kapsar = a && a[0] <= g[0] && a[1] <= g[1] && a[2] >= g[2] && a[3] >= g[3] && (a[2] - a[0]) < 1.7 * (g[2] - g[0]);
      if (kapsar && arazi.anahtar === anahtar) return false;
      if (kapsar) sinirlar = a;
      else { const w = g[2] - g[0], h = g[3] - g[1]; sinirlar = [g[0] - 0.08 * w, Math.max(-80, g[1] - 0.08 * h), g[2] + 0.08 * w, Math.min(82, g[3] + 0.08 * h)]; }
    }
    if (arazi && arazi.anahtar === anahtar && arazi.sinirlar === sinirlar) return false;
    if (arazi) { S.scene.remove(arazi.orgu); arazi.orgu.geometry.dispose(); arazi.orgu.material.map?.dispose(); arazi.orgu.material.roughnessMap?.dispose(); arazi.orgu.material.dispose(); }
    const veri = araziUret(sinirlar, kats, { kabartma: d.kabartma && m === "duz", dokuGen: m === "kure" ? (kalite === "dusuk" ? 2048 : 4096) : undefined });
    const o = m === "kure" ? kureOrgusu(veri) : araziOrgusu(veri);
    arazi = { ...o, mod: m, sinirlar, anahtar };
    S.scene.add(o.orgu);
    deniz.visible = m === "duz";
    S.scene.fog = m === "duz" ? new THREE.Fog(0x2a4560, 300, 900) : null;
    for (const md of modeller.values()) modelKur(md);
    return true;
  }

  /* ---------- Görünür alan ve kamera yerleşimi ---------- */
  function gorunurAlan(payFn = d.pay) {
    const st = getComputedStyle(kok);
    const px = (a) => parseFloat(st.getPropertyValue(a)) || 0;
    const sol = px("--sol-bosluk"), sag = px("--sag-bosluk"), us = px("--ust-bosluk"), al = px("--alt-bosluk");
    const Wk = W - sol - sag, Hk = H - us - al;
    const ek = (typeof payFn === "function" ? payFn(Wk, Hk) : payFn) || {};
    return { x0: sol + (ek.sol || 0), y0: us + (ek.ust || 0), x1: W - sag - (ek.sag || 0), y1: H - al - (ek.alt || 0) };
  }
  const ekranda = (v, cam) => { const p = v.clone().project(cam); return [((p.x + 1) / 2) * W, ((1 - p.y) / 2) * H]; };
  function hesapla() {
    const V = gorunurAlan();
    const Vw = Math.max(60, V.x1 - V.x0), Vh = Math.max(60, V.y1 - V.y0), Vx = (V.x0 + V.x1) / 2, Vy = (V.y0 + V.y1) / 2;
    const cam = S.camera.clone();
    const tan = Math.tan((cam.fov * D2R) / 2);
    if (arazi.mod === "kure") {
      const yon = arazi.yer(d.merkez).normalize();
      const sag = new THREE.Vector3(0, 1, 0).cross(yon).normalize(), yukari = yon.clone().cross(sag).normalize();
      const ornek = [];
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; ornek.push(sag.clone().multiplyScalar(Math.cos(a) * arazi.R).addScaledVector(yukari, Math.sin(a) * arazi.R)); }
      let hedef = new THREE.Vector3(), uzak = arazi.R * 3;
      for (let it = 0; it < 8; it++) {
        cam.position.copy(hedef).addScaledVector(yon, uzak); cam.up.set(0, 1, 0); cam.lookAt(hedef); cam.updateMatrixWorld();
        const kut = sinirKutusu(ornek.map((v) => ekranda(v, cam)));
        const sc = Math.max(kut.w / (Vw * 0.9), kut.h / (Vh * 0.9));
        const wpp = (2 * uzak * tan) / H;
        hedef.addScaledVector(sag, (kut.cx - Vx) * wpp).addScaledVector(yukari, -(kut.cy - Vy) * wpp);
        uzak *= 0.4 + 0.6 * sc;
      }
      return { konum: cam.position.toArray(), hedef: hedef.toArray(), uzak, olcek: arazi.R / 40 };
    }
    const [[l0, b0], [l1, b1]] = d.kutu;
    const ornek = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      for (const ll of [[l0 + t * (l1 - l0), b0], [l0 + t * (l1 - l0), b1], [l0, b0 + t * (b1 - b0)], [l1, b0 + t * (b1 - b0)]]) ornek.push(arazi.yer(ll));
    }
    const eg = (d.egim ?? 56) * D2R;
    const m = arazi.yer([(l0 + l1) / 2, (b0 + b1) / 2]);
    const hedef = new THREE.Vector3(m.x, 0, m.z);
    let uzak = Math.hypot(ornek[0].x - ornek[ornek.length - 1].x, ornek[0].z - ornek[ornek.length - 1].z) * 1.2 + 1;
    for (let it = 0; it < 10; it++) {
      cam.position.set(hedef.x, hedef.y + uzak * Math.sin(eg), hedef.z + uzak * Math.cos(eg)); cam.up.set(0, 1, 0); cam.lookAt(hedef); cam.updateMatrixWorld();
      const kut = sinirKutusu(ornek.map((v) => ekranda(v, cam)));
      const sc = Math.max(kut.w / (Vw * 0.94), kut.h / (Vh * 0.94));
      const wpp = (2 * uzak * tan) / H;
      hedef.x += (kut.cx - Vx) * wpp;
      hedef.z += ((kut.cy - Vy) * wpp) / Math.sin(eg);
      uzak *= 0.35 + 0.65 * sc;
    }
    const gen = arazi.yer([l1, (b0 + b1) / 2]).x - arazi.yer([l0, (b0 + b1) / 2]).x;
    return { konum: cam.position.toArray(), hedef: hedef.toArray(), uzak, olcek: gen / 100 };
  }
  function sinirKutusu(pts) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) { if (!Number.isFinite(x)) continue; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return { w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }
  /** Yerleşimden sonra ekranda görünecek zemin alanı (boylam-enlem kutusu) */
  function izKutusu() {
    const cam = S.camera.clone();
    cam.position.set(...gorus.konum); cam.up.set(0, 1, 0); cam.lookAt(new THREE.Vector3(...gorus.hedef)); cam.updateMatrixWorld();
    const r = new THREE.Raycaster(), duz = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p = new THREE.Vector3();
    let L0 = Infinity, B0 = Infinity, L1 = -Infinity, B1 = -Infinity;
    for (const [x, y] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
      r.setFromCamera(new THREE.Vector2(x, y), cam);
      let q = r.ray.intersectPlane(duz, p) ? p.clone() : null;
      if (!q || q.distanceTo(cam.position) > gorus.uzak * 3) {
        const yon = r.ray.direction.clone(); yon.y = Math.min(yon.y, -0.05);
        q = cam.position.clone().addScaledVector(yon.normalize(), gorus.uzak * 3); q.y = 0;
      }
      const [l, b] = arazi.geri(q);
      L0 = Math.min(L0, l); L1 = Math.max(L1, l); B0 = Math.min(B0, b); B1 = Math.max(B1, b);
    }
    return [L0, B0, L1, B1];
  }
  function yerlestir(sure = 0) {
    if (!arazi || !W || !H) return;
    gorus = hesapla();
    if (arazi.mod === "duz") {
      const iz = izKutusu(), a = arazi.sinirlar;
      if (iz[0] < a[0] || iz[1] < a[1] || iz[2] > a[2] || iz[3] > a[3]) {
        if (araziHazirla(iz)) { gorus = hesapla(); sure = 0; }
      }
    }
    // maket boyu görünen alana bağlı: ölçek belirgin değiştiyse modelleri yeniden kur
    if (modelOlcek && Math.abs(gorus.olcek / modelOlcek - 1) > 0.12) for (const md of modeller.values()) modelKur(md);
    const gunesYon = new THREE.Vector3(-0.6, 0.95, -0.5).normalize();
    const h = new THREE.Vector3(...gorus.hedef);
    S.gunes.target.position.copy(h);
    S.gunes.position.copy(h).addScaledVector(gunesYon, gorus.uzak * 1.2);
    const g = S.gunes.shadow.camera, r = gorus.uzak * 0.9;
    g.left = -r; g.right = r; g.top = r; g.bottom = -r; g.near = 0.1; g.far = gorus.uzak * 3; g.updateProjectionMatrix();
    if (S.scene.fog) { S.scene.fog.near = gorus.uzak * 1.5; S.scene.fog.far = gorus.uzak * 4.2; }
    S.camera.near = Math.max(0.05, gorus.uzak / 200); S.camera.far = gorus.uzak * 20; S.camera.updateProjectionMatrix();
    if (sure > 0 && !hareketAzalt()) S.kameraGit({ konum: gorus.konum, hedef: gorus.hedef, sure });
    else S.kameraKoy({ konum: gorus.konum, hedef: gorus.hedef });
    kirli = true;
  }
  const hareketAzalt = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

  /* ---------- Ekran izdüşümü ---------- */
  const gv = new THREE.Vector3();
  function xy(p) {
    if (!arazi || !p) return [-9999, -9999];
    const v = arazi.yer(p);
    if (arazi.mod === "kure" && v.dot(S.camera.position) < arazi.R * arazi.R * 1.002) return [-9999, -9999];
    gv.copy(v).project(S.camera);
    if (gv.z > 1) return [-9999, -9999];
    return [((gv.x + 1) / 2) * W, ((1 - gv.y) / 2) * H];
  }
  // d3-geo yol üreteci için izdüşüm: uzun kenarları ara noktalarla böler, görünmeyen noktada çizgiyi keser
  const izdusum = {
    stream(cikis) {
      let onceki = null, cizgide = false, kesik = false;
      const adim = () => (arazi?.mod === "kure" ? 2 : Math.max(0.05, (d.kutu[1][0] - d.kutu[0][0]) / 60));
      const yaz = (l, b) => {
        const q = xy([l, b]);
        if (q[0] === -9999) { if (cizgide) { cikis.lineEnd(); kesik = true; cizgide = false; } return; }
        if (kesik && !cizgide) { cikis.lineStart(); cizgide = true; }
        cikis.point(q[0], q[1]);
      };
      return {
        point(l, b) {
          if (onceki) {
            const n = Math.min(80, Math.ceil(Math.max(Math.abs(l - onceki[0]), Math.abs(b - onceki[1])) / adim()));
            for (let i = 1; i < n; i++) yaz(onceki[0] + ((l - onceki[0]) * i) / n, onceki[1] + ((b - onceki[1]) * i) / n);
          }
          yaz(l, b); onceki = [l, b];
        },
        lineStart() { onceki = null; cizgide = true; kesik = false; cikis.lineStart(); },
        lineEnd() { if (cizgide) cikis.lineEnd(); cizgide = false; onceki = null; },
        polygonStart() { cikis.polygonStart(); },
        polygonEnd() { cikis.polygonEnd(); },
        sphere() {},
      };
    },
  };
  const yol = geoPath(izdusum);

  const isin = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const olayKonumu = (e) => { const r = kok.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  function ekrandanYer([x, y], { duzlem = false } = {}) {
    if (!arazi) return null;
    ndc.set((x / W) * 2 - 1, 1 - (y / H) * 2);
    S.camera.updateMatrixWorld();
    isin.setFromCamera(ndc, S.camera);
    if (duzlem && arazi.mod === "duz") {
      const p = new THREE.Vector3();
      return isin.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p) ? p : null;
    }
    const k = isin.intersectObject(arazi.orgu, false)[0];
    return k ? k.point : null;
  }
  function lonlat(e, secenek) {
    const p = ekrandanYer(olayKonumu(e), secenek);
    return p ? arazi.geri(p) : null;
  }

  /* ---------- SVG katmanı ---------- */
  let kirli = true;
  function izgaraCiz() {
    izgaraG.replaceChildren();
    if (!d.izgara || !arazi) return;
    const a = d.izgara;
    const [L0, B0, L1, B1] = arazi.mod === "kure" ? [-180, -80, 180, 80] : arazi.sinirlar;
    const graticule = geoGraticule().step([a, a]).extentMinor([[Math.floor(L0 / a) * a, Math.max(-80, Math.floor(B0 / a) * a) - 1e-6], [Math.ceil(L1 / a) * a, Math.min(80, Math.ceil(B1 / a) * a) + 1e-6]]);
    svg("path", { class: "hrt-izgara", d: yol(graticule()) }, izgaraG);
    if (arazi.mod === "kure") {
      svg("path", { class: "hrt-izgara guclu", d: yol({ type: "LineString", coordinates: Array.from({ length: 73 }, (_, i) => [-180 + i * 5, 0]) }) }, izgaraG);
      svg("path", { class: "hrt-izgara guclu", d: yol({ type: "LineString", coordinates: Array.from({ length: 33 }, (_, i) => [0, -80 + i * 5]) }) }, izgaraG);
      return;
    }
    // kenar etiketleri: görünür alanın alt kenarında boylamlar, sol kenarında enlemler
    const V = gorunurAlan(null);
    const ll = (x, y) => { const p = ekrandanYer([x, y], { duzlem: true }); return p ? arazi.geri(p) : null; };
    let onceki = null;
    for (let x = V.x0 + 26; x < V.x1 - 18; x += 4) {
      const q = ll(x, V.y1 - 16);
      if (q && onceki && Math.floor(q[0] / a) !== Math.floor(onceki[0] / a)) {
        const l = Math.floor(q[0] / a) * a;
        svg("text", { class: "hrt-izgara-et", x, y: V.y1 - 6, "text-anchor": "middle" }, izgaraG).textContent = `${Math.abs(l)}°${l < 0 ? "B" : "D"}`;
      }
      onceki = q;
    }
    onceki = null;
    for (let y = V.y0 + 16; y < V.y1 - 26; y += 4) {
      const q = ll(V.x0 + 6, y);
      if (q && onceki && Math.floor(q[1] / a) !== Math.floor(onceki[1] / a)) {
        const b = Math.floor(onceki[1] / a) * a;
        svg("text", { class: "hrt-izgara-et", x: V.x0 + 6, y: y - 3 }, izgaraG).textContent = `${Math.abs(b)}°${b < 0 ? "G" : "K"}`;
      }
      onceki = q;
    }
  }
  function katmanCiz(k) {
    k.g.replaceChildren();
    if (!k.ciz || !arazi) return;
    try { k.ciz(k.g, api); } catch (e) { console.error(e); }
  }
  function ciz() {
    W = kok.clientWidth; H = kok.clientHeight;
    if (!W || !H || !arazi) return;
    s.setAttribute("viewBox", `0 0 ${W} ${H}`);
    S.camera.updateMatrixWorld();
    izgaraCiz();
    for (const k of katmanlar.values()) katmanCiz(k);
    kirli = false;
  }
  // kamera her değiştiğinde (geçiş, sürükleme, boyut) SVG katmanını yeniden yerleştir
  const sonKamera = new Float64Array(33);
  S.herKare(() => {
    S.camera.lookAt(S.kontrol.target);
    S.camera.updateMatrixWorld();
    const m = S.camera.matrixWorld.elements, p = S.camera.projectionMatrix.elements;
    let degisti = kirli || kok.clientWidth !== W || kok.clientHeight !== H;
    for (let i = 0; i < 16; i++) { if (sonKamera[i] !== m[i]) { degisti = true; sonKamera[i] = m[i]; } if (sonKamera[16 + i] !== p[i]) { degisti = true; sonKamera[16 + i] = p[i]; } }
    if (degisti) { ciz(); cizGerek = true; }
  });
  let boyutZaman = 0;
  const boyutDegisti = () => { clearTimeout(boyutZaman); boyutZaman = setTimeout(() => { W = kok.clientWidth; H = kok.clientHeight; yerlestir(0); }, 60); };
  new ResizeObserver(boyutDegisti).observe(kok);
  window.addEventListener("d-yerlesim", boyutDegisti);

  /* ---------- Modeller (3B nesne katmanları) ---------- */
  let modelOlcek = 0;
  function modelKur(md) {
    md.grup.clear();
    cizGerek = true;
    if (!md.kur || !arazi) return;
    modelOlcek = gorus?.olcek || 0;
    try { md.kur(md.grup, api); } catch (e) { console.error(e); }
  }

  /* ---------- Kaydırma, döndürme, yakınlaştırma ---------- */
  const isaretciler = new Map();
  let surukle = null, yutTik = false;
  ust.addEventListener("contextmenu", (e) => e.preventDefault());
  ust.addEventListener("pointerdown", (e) => {
    isaretciler.set(e.pointerId, [e.clientX, e.clientY]);
    surukle = { x: e.clientX, y: e.clientY, dugme: e.button, basladi: false, kaydir: !(e.button === 2 || e.shiftKey || e.ctrlKey) };
  });
  const birak = (e) => {
    isaretciler.delete(e.pointerId);
    if (surukle?.basladi) { yutTik = true; setTimeout(() => (yutTik = false), 0); }
    if (!isaretciler.size) { surukle = null; ust.classList.remove("suruklen"); }
  };
  window.addEventListener("pointerup", birak);
  window.addEventListener("pointercancel", birak);
  window.addEventListener("pointermove", (e) => {
    if (!surukle || !isaretciler.has(e.pointerId) || !arazi) return;
    const once = isaretciler.get(e.pointerId);
    isaretciler.set(e.pointerId, [e.clientX, e.clientY]);
    if (!surukle.basladi) {
      if (Math.hypot(e.clientX - surukle.x, e.clientY - surukle.y) < 6) return;
      surukle.basladi = true; ust.classList.add("suruklen");
    }
    if (isaretciler.size >= 2) { // iki parmak: yakınlaştır
      const [a, b] = [...isaretciler.values()];
      const diger = [...isaretciler.entries()].find(([id]) => id !== e.pointerId)[1];
      const eski = Math.hypot(once[0] - diger[0], once[1] - diger[1]), yeni = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (eski > 0) yakinlas(eski / yeni);
      return;
    }
    const dx = e.clientX - once[0], dy = e.clientY - once[1];
    if (surukle.kaydir && arazi.mod === "duz") kaydir(once, [e.clientX, e.clientY]);
    else dondur(dx, dy);
  });
  ust.addEventListener("click", (e) => { if (yutTik) { e.stopPropagation(); e.preventDefault(); yutTik = false; } }, true);
  ust.addEventListener("wheel", (e) => { e.preventDefault(); yakinlas(Math.exp(e.deltaY * 0.0012)); }, { passive: false });
  function kameraYaz(konum, hedef) { S.kameraKoy({ konum: konum.toArray(), hedef: hedef.toArray() }); }
  function kaydir(a, b) {
    const r = kok.getBoundingClientRect();
    const p = ekrandanYer([a[0] - r.left, a[1] - r.top], { duzlem: true }), q = ekrandanYer([b[0] - r.left, b[1] - r.top], { duzlem: true });
    if (!p || !q) return;
    const fark = p.sub(q);
    const hedef = S.kontrol.target.clone().add(fark);
    const [L0, B0, L1, B1] = arazi.sinirlar;
    const k0 = arazi.yer([L0, B1]), k1 = arazi.yer([L1, B0]);
    hedef.x = Math.min(k1.x, Math.max(k0.x, hedef.x)); hedef.z = Math.min(k1.z, Math.max(k0.z, hedef.z));
    fark.copy(hedef).sub(S.kontrol.target);
    kameraYaz(S.camera.position.clone().add(fark), hedef);
  }
  function dondur(dx, dy) {
    const hedef = S.kontrol.target.clone(), ofs = S.camera.position.clone().sub(hedef);
    const sph = new THREE.Spherical().setFromVector3(ofs);
    sph.theta -= dx * 0.006;
    const [en, ek] = arazi.mod === "kure" ? [0.15, Math.PI - 0.15] : [0.2, 1.15];
    sph.phi = Math.min(ek, Math.max(en, sph.phi - dy * 0.005));
    ofs.setFromSpherical(sph);
    kameraYaz(hedef.clone().add(ofs), hedef);
  }
  function yakinlas(f) {
    if (!gorus) return;
    const hedef = S.kontrol.target.clone(), ofs = S.camera.position.clone().sub(hedef);
    const L = Math.min(gorus.uzak * 2.2, Math.max(arazi.mod === "kure" ? arazi.R * 1.4 : gorus.uzak * 0.18, ofs.length() * f));
    ofs.setLength(L);
    kameraYaz(hedef.clone().add(ofs), hedef);
  }

  const api = {
    el: kok, svg: s, S, THREE,
    get W() { return W; }, get H() { return H; }, get proj() { return null; }, get yol() { return yol; },
    get kutu() { return d.kutu; },
    /** Görünür alandan düşülen pay (tahta, şerit) */
    get pay() { return d.pay; },
    /** Kutunun dünya birimindeki genişliğinin yüzde biri: maket nesnelerin boyu için */
    get olcek() { return gorus?.olcek || 1; },
    get mod() { return arazi?.mod; },
    /** [boylam, enlem] → ekran [x, y] */
    xy,
    /** [boylam, enlem] → arazi yüzeyindeki 3B nokta (ek: yüzeyden yükseklik, dünya birimi) */
    yer: (p, ek = 0) => (arazi ? arazi.yer(p, ek) : new THREE.Vector3()),
    /** işaretçi olayı → [boylam, enlem] */
    lonlat: (e) => lonlat(e),
    ekran: olayKonumu,
    /** Panellerin ve payın dışında kalan görünür ekran dikdörtgeni */
    gorunur: (payFn) => gorunurAlan(payFn === undefined ? d.pay : payFn),
    /** Zemin ayarlarını değiştirir (kutu, projeksiyon, ozellikler, izgara, ulkeSinif, uzakKara, pay, egim) */
    zemin(yeni) {
      const eskiMod = mod(), eskiKutu = JSON.stringify(d.kutu), eskiPay = d.pay, eskiEgim = d.egim;
      d = { ...d, ...yeni };
      const yeniden = araziHazirla();
      if (yeniden || eskiMod !== mod() || eskiKutu !== JSON.stringify(d.kutu) || eskiPay !== d.pay || eskiEgim !== d.egim) yerlestir(yeniden || eskiMod !== mod() ? 0 : 0.8);
      kirli = true;
    },
    /** Görünen kutuyu yumuşak geçişle değiştirir */
    kutuya(kutu, sure = 650) {
      d.kutu = kutu;
      const yeniden = araziHazirla();
      yerlestir(yeniden ? 0 : sure / 1000);
    },
    /** Adlandırılmış SVG katmanı: ciz(g, harita) her yeniden çizimde (kamera değişince de) çağrılır */
    katman(ad, cizFn) {
      let k = katmanlar.get(ad);
      if (!k) { k = { g: svg("g", { "data-katman": ad }, katmanG), ciz: null }; katmanlar.set(ad, k); }
      if (cizFn !== undefined) k.ciz = cizFn;
      katmanCiz(k);
      return {
        g: k.g,
        yenile: () => katmanCiz(k),
        goster(acik) { k.g.style.display = acik ? "" : "none"; },
        get gorunur() { return k.g.style.display !== "none"; },
      };
    },
    katmanSil(ad) { const k = katmanlar.get(ad); if (k) { k.g.remove(); katmanlar.delete(ad); } },
    /** Adlandırılmış 3B model katmanı: kur(grup, harita) arazi değişince yeniden çağrılır */
    model(ad, kurFn) {
      let md = modeller.get(ad);
      if (!md) { md = { grup: new THREE.Group(), kur: null }; md.grup.name = ad; modelKok.add(md.grup); modeller.set(ad, md); }
      if (kurFn !== undefined) md.kur = kurFn;
      modelKur(md);
      return { grup: md.grup, yenile: () => modelKur(md), goster(acik) { md.grup.visible = acik; } };
    },
    modelSil(ad) { const md = modeller.get(ad); if (md) { modelKok.remove(md.grup); modeller.delete(ad); } },
    /** Her karede çağrılır (kervan yürüyüşü, sancak dalgası); adım değişince kendiliğinden silinir. fn(sn) */
    herKare(fn) {
      const t0 = performance.now();
      const sil = S.herKare(() => fn((performance.now() - t0) / 1000));
      canli++;
      let silindi = false;
      const kaldir = () => { if (!silindi) { silindi = true; canli--; sil(); } };
      dinleyiciler.add(kaldir);
      return kaldir;
    },
    /** Haritaya dokunma/tıklama dinleyicisi: fn([boylam, enlem], olay) */
    tikla(fn) {
      const f = (e) => { const ll = lonlat(e); if (ll) fn(ll, e); };
      ust.addEventListener("click", f);
      dinleyiciler.add(() => ust.removeEventListener("click", f));
    },
    /** İmleç altındaki koordinatı köşede gösterir */
    koordinatGoster(acik = true) {
      let bekliyor = null;
      const f = (e) => {
        if (bekliyor) { bekliyor = e; return; }
        bekliyor = e;
        requestAnimationFrame(() => { const ll = lonlat(bekliyor); imlec.textContent = ll ? enlemBoylam(ll) : ""; bekliyor = null; });
      };
      const g = () => (imlec.textContent = "");
      if (!acik) return;
      ust.addEventListener("pointermove", f); ust.addEventListener("pointerleave", g);
      dinleyiciler.add(() => { ust.removeEventListener("pointermove", f); ust.removeEventListener("pointerleave", g); imlec.textContent = ""; });
    },
    uyari(metin = "") { uyari.innerHTML = metin; },
    /** Adım değişince: katmanları, modelleri, dinleyicileri ve uyarıyı temizler; zemini varsayılana döndürür */
    sifirla(yeni = {}) {
      const eskiMod = arazi?.mod;
      for (const k of katmanlar.values()) k.g.remove();
      katmanlar.clear();
      for (const md of modeller.values()) modelKok.remove(md.grup);
      modeller.clear();
      for (const f of dinleyiciler) f();
      dinleyiciler.clear();
      uyari.innerHTML = ""; imlec.textContent = "";
      d = { ...VARSAYILAN, ...ayar, ...yeni };
      W = kok.clientWidth; H = kok.clientHeight;
      const yeniden = araziHazirla();
      yerlestir(yeniden || eskiMod !== arazi?.mod ? 0 : 0.7);
      kirli = true;
    },
    ciz,
  };
  W = kok.clientWidth; H = kok.clientHeight;
  return api;
}

/** 38,7° K · 33,3° D biçiminde koordinat yazısı */
export const enlemBoylam = ([l, b], ondalik = 1) =>
  `${Math.abs(b).toFixed(ondalik).replace(".", ",")}° ${b < 0 ? "G" : "K"} · ${Math.abs(l).toFixed(ondalik).replace(".", ",")}° ${l < 0 ? "B" : "D"}`;

/* ---------- Katman içinde kullanılan çizim yardımcıları ---------- */

/** Yazı etiketi (hale ile okunaklı) */
export function etiket(g, [x, y], metin, { sinif = "", hiza = "middle", dx = 0, dy = 0 } = {}) {
  const t = svg("text", { class: `hrt-et ${sinif}`, x: x + dx, y: y + dy, "text-anchor": hiza }, g);
  t.textContent = metin;
  return t;
}

/** Daire işaret */
export function isaret(g, [x, y], { r = 5, renk, sinif = "", nabiz = false } = {}) {
  if (nabiz) svg("circle", { cx: x, cy: y, r: r + 3, fill: "none", stroke: renk || "#ffb547", "stroke-width": 2, class: "hrt-nabiz" }, g);
  return svg("circle", { class: `hrt-nokta ${sinif}`, cx: x, cy: y, r, style: renk ? `fill:${renk}` : null }, g);
}

/** Coğrafi koordinat dizisinden (büyük çember boyunca) çizgi ya da ok çizer */
export function cizgi(g, harita, noktalar, { renk = "sari", ok = false, kesikli = false, kalinlik, sinif = "" } = {}) {
  const r = { sari: "#ffb547", mavi: "#4fc3f7", yesil: "#5ad38b", kirmizi: "#ff6b6b", mor: "#b89cff", beyaz: "#e8eef7" }[renk] || renk;
  return svg("path", {
    class: `${ok ? "hrt-ok" : "hrt-cizgi"} ${sinif}`, d: harita.yol({ type: "LineString", coordinates: noktalar }),
    stroke: r, "stroke-dasharray": kesikli ? "7 5" : null, "stroke-width": kalinlik,
    "marker-end": ok ? `url(#hrt-uc-${renk in { sari: 1, mavi: 1, yesil: 1, kirmizi: 1, mor: 1, beyaz: 1 } ? renk : "sari"})` : null,
  }, g);
}

/** Yumuşak eğri ok: ekran uzayında iki nokta arasında hafif kavis */
export function egriOk(g, harita, a, b, { renk = "sari", bukum = 0.18, kesikli = false } = {}) {
  const [x1, y1] = harita.xy(a), [x2, y2] = harita.xy(b);
  const mx = (x1 + x2) / 2 - (y2 - y1) * bukum, my = (y1 + y2) / 2 + (x2 - x1) * bukum;
  const r = { sari: "#ffb547", mavi: "#4fc3f7", yesil: "#5ad38b", kirmizi: "#ff6b6b", mor: "#b89cff", beyaz: "#e8eef7" }[renk];
  return svg("path", {
    class: "hrt-ok", d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, stroke: r,
    "stroke-dasharray": kesikli ? "7 5" : null, "marker-end": `url(#hrt-uc-${renk})`,
  }, g);
}

/** Temsilî alan (çokgen) */
export function alan(g, harita, halka, { renk = "#ffb547", sinif = "" } = {}) {
  // d3 küresel çokgenlerde dış halkanın saat yönünde olmasını bekler; yönü kendimiz düzeltiriz
  let alanIsareti = 0;
  for (let i = 0; i < halka.length; i++) {
    const [x1, y1] = halka[i], [x2, y2] = halka[(i + 1) % halka.length];
    alanIsareti += (x2 - x1) * (y2 + y1);
  }
  const h = alanIsareti < 0 ? halka.slice().reverse() : halka.slice();
  h.push(h[0]);
  return svg("path", { class: `hrt-alan ${sinif}`, d: harita.yol({ type: "Polygon", coordinates: [h] }), fill: renk, stroke: renk }, g);
}

/**
 * Etiketleri işaretlerin çevresine çakışmadan yerleştirir (açgözlü, 8 aday konum; gerçek yazı kutusu ölçülür).
 * ogeler: [{ p: [x, y], metin, sinif?, r?, g?, atla? }] — öncelik sırasıyla verilir; atla: yer bulunamazsa yazılmaz.
 * engeller: [{ x0, y0, x1, y1 }] (ör. sahne üstü kutular), sinir: etiketlerin taşmaması gereken alan.
 */
export function etiketleriYerlestir(g, harita, ogeler, { engeller = [], sinir } = {}) {
  const S = sinir || { x0: 0, y0: 0, x1: harita.W, y1: harita.H };
  const kutular = [...engeller];
  for (const o of ogeler) { const r = (o.r ?? 5) + 1.5; kutular.push({ x0: o.p[0] - r, y0: o.p[1] - r, x1: o.p[0] + r, y1: o.p[1] + r }); }
  const cakisir = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  for (const o of ogeler) {
    if (!o.metin) continue; // yalnızca engel olan işaret
    const r = o.r ?? 5;
    const adaylar = [[0, -r - 5, "middle"], [0, r + 14, "middle"], [r + 5, 4, "start"], [-r - 5, 4, "end"],
      [r + 3, -r - 3, "start"], [-r - 3, -r - 3, "end"], [r + 3, r + 13, "start"], [-r - 3, r + 13, "end"]];
    const t = etiket(o.g || g, o.p, o.metin, { sinif: o.sinif || "" });
    let enIyi = null;
    for (const [dx, dy, hiza] of adaylar) {
      t.setAttribute("x", o.p[0] + dx); t.setAttribute("y", o.p[1] + dy); t.setAttribute("text-anchor", hiza);
      const b = t.getBBox();
      const k = { x0: b.x - 2, y0: b.y - 1, x1: b.x + b.width + 2, y1: b.y + b.height + 1 };
      const disarida = k.x0 < S.x0 || k.x1 > S.x1 || k.y0 < S.y0 || k.y1 > S.y1;
      const n = kutular.filter((q) => cakisir(q, k)).length + (disarida ? 3 : 0);
      if (!enIyi || n < enIyi.n) enIyi = { n, dx, dy, hiza, k };
      if (!n) break;
    }
    if (enIyi.n && o.atla) { t.remove(); continue; }
    t.setAttribute("x", o.p[0] + enIyi.dx); t.setAttribute("y", o.p[1] + enIyi.dy); t.setAttribute("text-anchor", enIyi.hiza);
    kutular.push(enIyi.k);
  }
}

/** Sahne üstündeki uyarı kutusunun harita koordinatındaki dikdörtgeni (etiket engeli olarak) */
export function uyariKutusu(harita) {
  const u = harita.el.querySelector(".hrt-uyari");
  if (!u || !u.innerHTML) return [];
  const a = harita.el.getBoundingClientRect(), b = u.getBoundingClientRect();
  return [{ x0: b.left - a.left - 4, y0: b.top - a.top - 4, x1: b.right - a.left + 4, y1: b.bottom - a.top + 4 }];
}
