// Doğal nesneler: çimen tutamı, arazi, ağaç, tavşan, tilki, yaprak, nane, Elodea, domates fidesi, saksı.
// Ölçek: çayırda 1 birim = 1 m; laboratuvar masasında 1 birim = 10 cm.
import { THREE, organiklestir, yuzeyDokusu, rastgele, fbm, malzeme } from "../../../../engine/sahne3d.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const R = new THREE.Color();
export const renk = (h) => new THREE.Color(h);

/** Köşe renkleri: fn(x, y, z, renk) her köşe için rengi ayarlar */
export function boya(geo, fn) {
  const p = geo.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    fn(p.getX(i), p.getY(i), p.getZ(i), R);
    c[i * 3] = R.r; c[i * 3 + 1] = R.g; c[i * 3 + 2] = R.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(c, 3));
  return geo;
}
const tekRenk = (h) => { const c = new THREE.Color(h); return (x, y, z, r) => r.copy(c); };
const yumusak = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Parça: ölçeklenmiş, döndürülmüş, taşınmış küre (hayvan gövdesi için) */
function parca(geo, { s = [1, 1, 1], p = [0, 0, 0], r = [0, 0, 0] } = {}) {
  geo.scale(...s);
  geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...r)));
  geo.translate(...p);
  return geo;
}
const kureG = (n = 24, m = 16) => new THREE.SphereGeometry(1, n, m);
/** mergeGeometries için öznitelikleri eşitler (uv, color, normal; indeksli) */
function hazirla(g) {
  for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv", "color"].includes(k)) g.deleteAttribute(k);
  if (!g.attributes.uv) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  if (!g.attributes.color) boya(g, tekRenk(0xffffff));
  return g;
}
export function birlestir(liste) {
  const indeksli = liste.map((g) => (g.index ? g : g.toNonIndexed()));
  const hepsiIndeksli = indeksli.every((g) => g.index);
  const son = hepsiIndeksli ? indeksli : liste.map((g) => (g.index ? g.toNonIndexed() : g));
  const m = mergeGeometries(son.map(hazirla));
  m.computeVertexNormals();
  return m;
}

/* ---------------- Kürk / kabuk / yaprak dokuları (önbellekli) ---------------- */
const dokular = {};
export function doku(ad) {
  if (dokular[ad]) return dokular[ad];
  const t = {
    kurk: { boyut: 256, taban: "#cfcfcf", koyu: "#8c8c8c", acik: "#f4f4f4", olcek: 16, benek: 0.35, uzama: [1, 4], tohum: 5 },
    kabuk: { boyut: 256, taban: "#5b4636", koyu: "#2f2219", acik: "#7d6650", olcek: 6, uzama: [6, 0.6], lif: 0.55, lifSiklik: 9, benek: 0.05, tohum: 8 },
    yaprak: { boyut: 256, taban: "#d8e8cf", koyu: "#a9c49a", acik: "#ffffff", olcek: 5, uzama: [0.5, 3], lif: 0.35, lifSiklik: 7, benek: 0.04, tohum: 12 },
    tac: { boyut: 256, taban: "#c9d8c0", koyu: "#6f8a63", acik: "#eef5e8", olcek: 18, benek: 0.4, tohum: 21 },
    toprak: { boyut: 256, taban: "#6b4a32", koyu: "#3f2a1c", acik: "#8a6648", olcek: 10, benek: 0.45, tohum: 31 },
    cayir: { boyut: 512, taban: "#d9e3c8", koyu: "#9fb08a", acik: "#f3f6ea", olcek: 14, benek: 0.25, tohum: 41 },
    pismis: { boyut: 256, taban: "#b5603a", koyu: "#8a4226", acik: "#cf7f58", olcek: 10, benek: 0.2, tohum: 51 },
    mum: { boyut: 128, taban: "#f2e8d2", koyu: "#e2d4b5", acik: "#fffaf0", olcek: 4, benek: 0.02, tohum: 61 },
  }[ad];
  dokular[ad] = yuzeyDokusu(t);
  return dokular[ad];
}

/* ---------------- Çimen ---------------- */
/** Bir çimen tutamı: incelen, kıvrılan birkaç yaprak (dipte koyu, uçta açık) */
export function tutamGeo({ yaprak = 7, boy = 0.22, tohum = 1 } = {}) {
  const r = rastgele(tohum), parcalar = [];
  for (let i = 0; i < yaprak; i++) {
    const g = new THREE.PlaneGeometry(0.02, 1, 1, 4);
    g.translate(0, 0.5, 0);
    const p = g.attributes.position;
    const h = boy * (0.55 + r() * 0.7), egik = 0.15 + r() * 0.45;
    for (let j = 0; j < p.count; j++) {
      const y = p.getY(j);
      p.setXYZ(j, p.getX(j) * (1 - y * 0.9), y * h * (1 - egik * y * 0.3), egik * y * y * h);
    }
    g.rotateY(r() * Math.PI * 2);
    g.translate((r() - 0.5) * 0.07, 0, (r() - 0.5) * 0.07);
    parcalar.push(g);
  }
  const m = mergeGeometries(parcalar);
  const dip = renk("#2d5a1e"), uc = renk("#9cc95a");
  boya(m, (x, y, z, c) => c.copy(dip).lerp(uc, Math.min(1, y / boy)));
  m.computeVertexNormals();
  return m;
}
/** Rüzgârda salınan çimen malzemesi (örnek başına renk desteği) */
export function cimenMalzemesi() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.75 });
  const zaman = { value: 0 };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uZaman = zaman;
    sh.vertexShader = "uniform float uZaman;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec4 ip = instanceMatrix[3];
        float sal = sin(uZaman * 1.6 + ip.x * 0.8 + ip.z * 0.6) + 0.4 * sin(uZaman * 3.1 + ip.x * 2.3);
        transformed.x += sal * 0.035 * position.y * position.y * 18.0;
      #endif`);
  };
  m.userData.zaman = zaman;
  return m;
}

/* ---------------- Arazi ---------------- */
export function arazi({ boyut = 160, seg = 140, tohum = 2 } = {}) {
  const yukseklik = (x, z) => {
    const d = Math.hypot(x, z + 6);
    const tepe = fbm(x * 0.025, 0.3, z * 0.025, { oktav: 4, tohum }) * 9 * yumusak(10, 60, d);
    return tepe + fbm(x * 0.2, 1.7, z * 0.2, { oktav: 2, tohum: tohum + 7 }) * 0.12 + Math.max(0, -z - 30) * 0.08;
  };
  const g = new THREE.PlaneGeometry(boyut, boyut, seg, seg);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, yukseklik(p.getX(i), p.getZ(i)));
  g.computeVertexNormals();
  const a = renk("#4e7a2c"), b = renk("#6f9a3a"), c = renk("#8a8a4a");
  boya(g, (x, y, z, r) => {
    const n = fbm(x * 0.08, 0.5, z * 0.08, { oktav: 3, tohum: tohum + 3 });
    r.copy(a).lerp(b, 0.5 + n).lerp(c, Math.max(0, n - 0.25) * 1.5);
  });
  const d = doku("cayir");
  d.renk.repeat.set(40, 40);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, map: d.renk, roughness: 0.95 }));
  m.receiveShadow = true;
  return { mesh: m, yukseklik };
}

/* ---------------- Ağaç ---------------- */
export function agac({ boy = 7, tohum = 1, ayrinti = 1 } = {}) {
  const r = rastgele(tohum), grup = new THREE.Group();
  const govdeBoy = boy * 0.45;
  const govdeG = new THREE.CylinderGeometry(0.12 * boy / 7, 0.24 * boy / 7, govdeBoy, 10, 6);
  govdeG.translate(0, govdeBoy / 2, 0);
  organiklestir(govdeG, { genlik: 0.04, olcek: 3, tohum });
  const kb = doku("kabuk");
  const govde = new THREE.Mesh(govdeG, new THREE.MeshStandardMaterial({ map: kb.renk, bumpMap: kb.puruz, bumpScale: 3, roughness: 0.95 }));
  govde.castShadow = true;
  grup.add(govde);
  const tac = [];
  const n = 6 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const rr = boy * (0.17 + r() * 0.1);
    const g = ayrinti > 0.5 ? new THREE.SphereGeometry(1, 22, 16) : new THREE.SphereGeometry(1, 12, 9);
    g.scale(rr, rr * 0.85, rr);
    const a = (i / n) * Math.PI * 2 + r();
    g.translate(Math.cos(a) * boy * 0.18 * (i ? 1 : 0), govdeBoy + boy * (0.12 + r() * 0.25), Math.sin(a) * boy * 0.18 * (i ? 1 : 0));
    organiklestir(g, { genlik: rr * 0.28, olcek: 1.6 / rr, tohum: tohum * 10 + i });
    tac.push(g);
  }
  const tacG = birlestir(tac);
  const koyu = renk("#234d1a"), acik = renk("#5f9a35");
  const ust = govdeBoy + boy * 0.5;
  boya(tacG, (x, y, z, c) => c.copy(koyu).lerp(acik, Math.min(1, Math.max(0, (y - govdeBoy) / (ust - govdeBoy)) * 0.8 + fbm(x, y, z, { tohum }) * 0.4)));
  const td = doku("tac");
  const tacM = new THREE.Mesh(tacG, new THREE.MeshStandardMaterial({ vertexColors: true, map: td.renk, bumpMap: td.puruz, bumpScale: 4, roughness: 0.9 }));
  tacM.castShadow = true;
  grup.add(tacM);
  grup.userData.tac = tacM;
  return grup;
}

/* ---------------- Tavşan (yabani tavşan, ≈ 40 cm) ---------------- */
let tavsanG = null;
function tavsanGeometrisi() {
  if (tavsanG) return tavsanG;
  const sirt = renk("#7a6650"), karin = renk("#d9ccb4"), koyu = renk("#4f4031"), pembe = renk("#d9a39a"), beyaz = renk("#f4f1ea");
  const kurk = (alt = 0.12) => (x, y, z, c) => c.copy(karin).lerp(sirt, yumusak(alt - 0.05, alt + 0.06, y)).lerp(koyu, Math.max(0, y - 0.3) * 1.5);
  const parcalar = [
    boya(organiklestir(parca(kureG(28, 20), { s: [0.2, 0.15, 0.14], p: [0, 0.16, 0] }), { genlik: 0.008, olcek: 20, tohum: 2 }), kurk()),
    boya(organiklestir(parca(kureG(), { s: [0.14, 0.14, 0.16], p: [-0.09, 0.14, 0] }), { genlik: 0.008, olcek: 20, tohum: 3 }), kurk()),
    boya(parca(kureG(), { s: [0.11, 0.12, 0.1], p: [0.1, 0.17, 0] }), kurk(0.14)),
    boya(organiklestir(parca(kureG(24, 18), { s: [0.088, 0.078, 0.072], p: [0.2, 0.28, 0], r: [0, 0, -0.15] }), { genlik: 0.005, olcek: 25, tohum: 4 }), kurk(0.24)),
    boya(parca(kureG(), { s: [0.055, 0.045, 0.058], p: [0.262, 0.255, 0] }), kurk(0.26)),
    // kulaklar (sırtı koyu, içi pembe)
    ...[-1, 1].flatMap((k) => [
      boya(parca(kureG(16, 12), { s: [0.026, 0.11, 0.044], p: [0.165, 0.39, k * 0.035], r: [k * 0.18, 0, 0.32] }), (x, y, z, c) => c.copy(sirt).lerp(koyu, yumusak(0.43, 0.48, y))),
      boya(parca(kureG(12, 10), { s: [0.012, 0.085, 0.03], p: [0.178, 0.385, k * 0.038], r: [k * 0.18, 0, 0.32] }), tekRenk(pembe)),
    ]),
    // kuyruk (pamuk gibi)
    boya(organiklestir(parca(kureG(16, 12), { s: [0.045, 0.045, 0.045], p: [-0.21, 0.2, 0] }), { genlik: 0.012, olcek: 60, tohum: 6 }), tekRenk(beyaz)),
    // ön bacaklar, arka ayaklar
    ...[-1, 1].flatMap((k) => [
      boya(parca(new THREE.CapsuleGeometry(0.019, 0.08, 4, 8), { p: [0.14, 0.06, k * 0.05] }), kurk(0.05)),
      boya(parca(kureG(16, 10), { s: [0.08, 0.026, 0.032], p: [-0.05, 0.026, k * 0.085] }), kurk(0.03)),
    ]),
  ];
  const govde = birlestir(parcalar);
  const goz = birlestir([-1, 1].map((k) => parca(kureG(12, 10), { s: [0.014, 0.014, 0.014], p: [0.245, 0.295, k * 0.047] })).concat(
    [parca(kureG(10, 8), { s: [0.011, 0.009, 0.013], p: [0.314, 0.262, 0] })]));
  tavsanG = { govde, goz };
  return tavsanG;
}
export function tavsan() {
  const { govde, goz } = tavsanGeometrisi();
  const k = doku("kurk");
  const g = new THREE.Group();
  const m = new THREE.Mesh(govde, new THREE.MeshStandardMaterial({ vertexColors: true, map: k.renk, bumpMap: k.puruz, bumpScale: 1.5, roughness: 0.9 }));
  m.castShadow = true;
  const gz = new THREE.Mesh(goz, new THREE.MeshPhysicalMaterial({ color: 0x120c08, roughness: 0.15, clearcoat: 1 }));
  const ic = new THREE.Group(); ic.add(m, gz);
  g.add(ic);
  g.userData.govde = ic;
  return g;
}

/* ---------------- Tilki (kızıl tilki, ≈ 70 cm + 40 cm kuyruk) ---------------- */
let tilkiG = null;
function tilkiGeometrisi() {
  if (tilkiG) return tilkiG;
  const turuncu = renk("#b8541c"), acikT = renk("#d98a4a"), beyaz = renk("#f1ece4"), siyah = renk("#2a1d16");
  const kurk = (alt) => (x, y, z, c) => c.copy(beyaz).lerp(turuncu, yumusak(alt - 0.04, alt + 0.04, y)).lerp(acikT, Math.max(0, Math.min(1, (y - alt) * 3)) * 0.35);
  const govdeP = [
    boya(organiklestir(parca(kureG(32, 20), { s: [0.3, 0.12, 0.11], p: [0, 0.4, 0] }), { genlik: 0.008, olcek: 15, tohum: 2 }), kurk(0.34)),
    boya(parca(kureG(), { s: [0.13, 0.14, 0.11], p: [0.2, 0.42, 0] }), (x, y, z, c) => c.copy(beyaz).lerp(turuncu, yumusak(0.36, 0.46, y + (0.3 - x) * 0.3))),
    boya(parca(kureG(), { s: [0.1, 0.12, 0.075], p: [0.3, 0.5, 0], r: [0, 0, -0.7] }), (x, y, z, c) => c.copy(beyaz).lerp(turuncu, yumusak(0.44, 0.54, y + (0.36 - x)))),
    boya(organiklestir(parca(kureG(24, 18), { s: [0.1, 0.082, 0.085], p: [0.4, 0.58, 0] }), { genlik: 0.004, olcek: 25 }), (x, y, z, c) => c.copy(beyaz).lerp(turuncu, yumusak(0.54, 0.6, y))),
    // burun (incelen koni) ve kulaklar
    boya(parca(new THREE.ConeGeometry(0.045, 0.15, 16, 3), { p: [0.53, 0.555, 0], r: [0, 0, -Math.PI / 2 - 0.12] }), (x, y, z, c) => c.copy(beyaz).lerp(turuncu, yumusak(0.54, 0.565, y))),
    ...[-1, 1].map((k) => boya(parca(new THREE.ConeGeometry(0.042, 0.11, 12, 2), { p: [0.38, 0.68, k * 0.05], r: [k * 0.2, 0, 0.1] }), (x, y, z, c) => c.copy(turuncu).lerp(siyah, yumusak(0.68, 0.72, y)))),
  ];
  const govde = birlestir(govdeP);
  // gür kuyruk, ucu beyaz
  const prof = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14; prof.push(new THREE.Vector2(0.075 * Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.05)) ** 0.6 + 0.004, t * 0.46)); }
  const kuyruk = new THREE.LatheGeometry(prof, 14);
  organiklestir(kuyruk, { genlik: 0.01, olcek: 30, tohum: 5 });
  boya(kuyruk, (x, y, z, c) => c.copy(turuncu).lerp(siyah, yumusak(0.25, 0.34, y) * 0.35).lerp(beyaz, yumusak(0.38, 0.41, y)));
  kuyruk.rotateZ(Math.PI / 2 + 0.55);
  kuyruk.translate(-0.26, 0.42, 0);
  const bacak = new THREE.CapsuleGeometry(0.024, 0.3, 4, 10);
  bacak.translate(0, -0.15, 0);
  boya(bacak, (x, y, z, c) => c.copy(siyah).lerp(turuncu, yumusak(-0.16, -0.08, y)));
  const goz = birlestir([-1, 1].map((k) => parca(kureG(10, 8), { s: [0.012, 0.012, 0.012], p: [0.47, 0.6, k * 0.05] })).concat([parca(kureG(10, 8), { s: [0.014, 0.012, 0.016], p: [0.6, 0.545, 0] })]));
  tilkiG = { govde: birlestir([govde, kuyruk]), bacak, goz };
  return tilkiG;
}
export function tilki() {
  const { govde, bacak, goz } = tilkiGeometrisi();
  const k = doku("kurk");
  const malz = new THREE.MeshStandardMaterial({ vertexColors: true, map: k.renk, bumpMap: k.puruz, bumpScale: 1.5, roughness: 0.85 });
  const g = new THREE.Group(), ic = new THREE.Group();
  const m = new THREE.Mesh(govde, malz); m.castShadow = true; ic.add(m);
  ic.add(new THREE.Mesh(goz, new THREE.MeshPhysicalMaterial({ color: 0x0c0806, roughness: 0.15, clearcoat: 1 })));
  const bacaklar = [[0.22, 0.06], [0.22, -0.06], [-0.2, 0.06], [-0.2, -0.06]].map(([x, z]) => {
    const b = new THREE.Mesh(bacak, malz); b.castShadow = true;
    b.position.set(x, 0.32, z); ic.add(b); return b;
  });
  g.add(ic);
  g.userData = { govde: ic, bacaklar };
  return g;
}

/* ---------------- Yaprak ---------------- */
/** Yaprak için daha düzgün kıvrılan, ızgaralı geometri (ShapeGeometry'nin büyük üçgenleri yerine) */
export function yaprakIzgara({ boy = 1, en = 0.5, dis = 0, disSayisi = 9, kivrim = 0.15, cukur = 0.1, sivri = 1, uzun = 16, gen = 6 } = {}) {
  const g = new THREE.PlaneGeometry(1, 1, gen, uzun);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) * 2, t = p.getY(i) + 0.5; // u ∈ [-1, 1], t ∈ [0, 1]
    let w = en * 0.5 * Math.sin(Math.PI * Math.min(1, Math.max(0.0001, t)) ** (0.75 * sivri)) * (1 - 0.25 * t);
    if (dis && t > 0.12 && t < 0.95 && Math.abs(u) > 0.99) w += dis * (Math.abs(((t * disSayisi) % 1) - 0.5) - 0.25) * en;
    const x = u * w, y = t * boy;
    p.setXYZ(i, x, y, -kivrim * boy * t * t + cukur * u * u * w);
  }
  g.computeVertexNormals();
  return g;
}
export function yaprakMalzemesi(renkHex = "#3f8f3a", { parlak = 0.35 } = {}) {
  const d = doku("yaprak");
  return new THREE.MeshPhysicalMaterial({ color: renkHex, map: d.renk, bumpMap: d.puruz, bumpScale: 1, roughness: 0.55, sheen: 0.3, sheenColor: 0xd8ffd0, clearcoat: parlak, clearcoatRoughness: 0.5, side: THREE.DoubleSide });
}

/* ---------------- Saksı ---------------- */
export function saksi({ cap = 0.5, boy = 0.45 } = {}) {
  const prof = [[0, 0], [cap * 0.36, 0], [cap * 0.38, 0.02], [cap * 0.5, boy * 0.86], [cap * 0.56, boy * 0.88], [cap * 0.56, boy], [cap * 0.5, boy], [cap * 0.47, boy * 0.9]].map(([a, b]) => new THREE.Vector2(a, b));
  const d = doku("pismis");
  const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), new THREE.MeshStandardMaterial({ map: d.renk, bumpMap: d.puruz, bumpScale: 2, roughness: 0.9, side: THREE.DoubleSide }));
  m.castShadow = true; m.receiveShadow = true;
  const td = doku("toprak");
  const toprak = new THREE.Mesh(organiklestir(new THREE.CircleGeometry(cap * 0.47, 32).rotateX(-Math.PI / 2), { genlik: 0.01, olcek: 20 }), new THREE.MeshStandardMaterial({ map: td.renk, roughness: 1 }));
  toprak.position.y = boy * 0.88;
  const g = new THREE.Group(); g.add(m, toprak);
  g.userData.ust = boy * 0.88;
  return g;
}

/* ---------------- Nane (karşılıklı dizilmiş dişli yapraklar) ---------------- */
export function nane({ boy = 1.6, dal = 3, tohum = 4 } = {}) {
  const r = rastgele(tohum), g = new THREE.Group();
  const govdeM = new THREE.MeshStandardMaterial({ color: "#4f7a37", roughness: 0.7 });
  const yM = yaprakMalzemesi("#4c9a42");
  const yG = yaprakIzgara({ boy: 0.34, en: 0.24, dis: 0.06, disSayisi: 8, kivrim: 0.25, cukur: 0.12 });
  const yapraklar = [];
  for (let d = 0; d < dal; d++) {
    const egim = (r() - 0.5) * 0.35, yon = (d / dal) * Math.PI * 2 + r();
    const h = boy * (0.75 + r() * 0.3);
    const yol = new THREE.CatmullRomCurve3([0, 0.33, 0.66, 1].map((t) => new THREE.Vector3(Math.cos(yon) * egim * t * h * 0.5, t * h, Math.sin(yon) * egim * t * h * 0.5 + (t > 0.5 ? (r() - 0.5) * 0.05 : 0))));
    const govde = new THREE.Mesh(new THREE.TubeGeometry(yol, 16, 0.018, 6), govdeM); govde.castShadow = true;
    g.add(govde);
    const dugum = 6;
    for (let i = 1; i <= dugum; i++) {
      const t = i / (dugum + 0.6), p = yol.getPoint(t), olcek = 1 - t * 0.55;
      for (const k of [0, 1]) {
        const a = (i % 2) * Math.PI / 2 + k * Math.PI + yon;
        yapraklar.push({ p, a, olcek, egik: 0.9 - t * 0.4 });
      }
    }
  }
  const im = new THREE.InstancedMesh(yG, yM, yapraklar.length);
  const kukla = new THREE.Object3D();
  yapraklar.forEach((y, i) => {
    kukla.position.copy(y.p);
    kukla.rotation.set(0, -y.a + Math.PI / 2, 0);
    kukla.rotateX(y.egik);
    kukla.scale.setScalar(y.olcek);
    kukla.updateMatrix(); im.setMatrixAt(i, kukla.matrix);
  });
  im.castShadow = true;
  g.add(im);
  g.userData.yapraklar = im;
  return g;
}

/* ---------------- Elodea (su veba otu): her düğümde üçlü küçük yaprak ---------------- */
export function elodea({ boy = 1.1, tohum = 7 } = {}) {
  const r = rastgele(tohum), g = new THREE.Group();
  const yol = new THREE.CatmullRomCurve3([[0, 0, 0], [0.05, boy * 0.3, 0.02], [-0.04, boy * 0.65, -0.02], [0.02, boy, 0.01]].map((v) => new THREE.Vector3(...v)));
  const govde = new THREE.Mesh(new THREE.TubeGeometry(yol, 30, 0.012, 6), new THREE.MeshStandardMaterial({ color: "#6f9a4a", roughness: 0.6 }));
  g.add(govde);
  const yG = yaprakIzgara({ boy: 0.11, en: 0.032, kivrim: 0.4, cukur: 0.05, sivri: 0.8, uzun: 6, gen: 2 });
  const n = 46, im = new THREE.InstancedMesh(yG, yaprakMalzemesi("#3f9a3a", { parlak: 0.6 }), n * 3);
  const kukla = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const t = 0.04 + (i / n) * 0.95, p = yol.getPoint(t);
    const yogun = 1 - Math.abs(t - 0.9) * 0.4;
    for (let k = 0; k < 3; k++) {
      kukla.position.copy(p);
      kukla.rotation.set(0, (k / 3) * Math.PI * 2 + i * 0.7, 0);
      kukla.rotateX(0.5 + t * 0.6 + r() * 0.2);
      kukla.scale.setScalar((0.75 + r() * 0.35) * yogun);
      kukla.updateMatrix(); im.setMatrixAt(i * 3 + k, kukla.matrix);
    }
  }
  g.add(im);
  g.userData.uc = yol.getPoint(1);
  return g;
}

/* ---------------- Domates fidesi (sera) ---------------- */
export function domatesFidesi({ boy = 1.3, tohum = 3 } = {}) {
  const r = rastgele(tohum), g = new THREE.Group();
  const yol = new THREE.CatmullRomCurve3([0, 0.35, 0.7, 1].map((t) => new THREE.Vector3((r() - 0.5) * 0.08 * t, t * boy, (r() - 0.5) * 0.08 * t)));
  const govdeM = new THREE.MeshStandardMaterial({ color: "#5b7d34", roughness: 0.7 });
  g.add(Object.assign(new THREE.Mesh(new THREE.TubeGeometry(yol, 20, 0.022, 7), govdeM), { castShadow: true }));
  // bileşik yapraklar: sap + 5 yaprakçık
  const yG = yaprakIzgara({ boy: 0.22, en: 0.12, dis: 0.03, disSayisi: 6, kivrim: 0.2, cukur: 0.15, uzun: 8, gen: 4 });
  const yerler = [];
  const sapM = govdeM;
  const sapG = [];
  for (let i = 0; i < 9; i++) {
    const t = 0.15 + i * 0.09, p = yol.getPoint(t), a = i * 2.4 + r() * 0.3, L = 0.38 * (1 - t * 0.5);
    const yon = new THREE.Vector3(Math.cos(a), 0.25, Math.sin(a)).normalize();
    const son = p.clone().addScaledVector(yon, L).add(new THREE.Vector3(0, -0.06, 0));
    const egri = new THREE.QuadraticBezierCurve3(p, p.clone().addScaledVector(yon, L * 0.5).add(new THREE.Vector3(0, 0.05, 0)), son);
    sapG.push(new THREE.TubeGeometry(egri, 6, 0.007, 4));
    for (let k = 0; k < 5; k++) {
      const tk = 0.35 + k * 0.16, q = egri.getPoint(Math.min(1, tk));
      yerler.push({ p: q, a: a + (k % 2 ? 1 : -1) * 1.2 * (k < 4 ? 1 : 0), olcek: k === 4 ? 1.2 : 0.9 });
    }
  }
  g.add(new THREE.Mesh(mergeGeometries(sapG), sapM));
  const ym = yaprakMalzemesi("#3d7d2f", { parlak: 0.2 });
  const im = new THREE.InstancedMesh(yG, ym, yerler.length);
  const kukla = new THREE.Object3D();
  yerler.forEach((y, i) => {
    kukla.position.copy(y.p);
    kukla.rotation.set(0, -y.a + Math.PI / 2, 0); kukla.rotateX(1.25);
    kukla.scale.setScalar(y.olcek); kukla.updateMatrix(); im.setMatrixAt(i, kukla.matrix);
  });
  im.castShadow = true;
  g.add(im);
  // domatesler
  const dG = organiklestir(new THREE.SphereGeometry(1, 24, 16).scale(1, 0.82, 1), { genlik: 0.05, olcek: 2.5, tohum });
  const dM = new THREE.MeshPhysicalMaterial({ color: "#c8281c", roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 });
  const canakG = new THREE.ConeGeometry(0.35, 0.12, 5, 1, true); canakG.translate(0, 0.8, 0);
  const domatesler = [];
  for (let i = 0; i < 5; i++) {
    const t = 0.35 + i * 0.12, p = yol.getPoint(t), a = i * 2.1 + 1;
    const d = new THREE.Group();
    const top = new THREE.Mesh(dG, dM); top.castShadow = true;
    const canak = new THREE.Mesh(canakG, govdeM);
    d.add(top, canak);
    d.position.set(p.x + Math.cos(a) * 0.12, p.y - 0.08, p.z + Math.sin(a) * 0.12);
    d.scale.setScalar(0.06);
    g.add(d); domatesler.push(d);
  }
  g.userData = { yapraklar: im, domatesler, domatesM: dM, yaprakM: ym };
  return g;
}

/* ---------------- Laboratuvar masası ve oda ---------------- */
export function laboratuvar({ en = 30, derin = 14 } = {}) {
  const g = new THREE.Group();
  const ah = yuzeyDokusu({ boyut: 512, taban: "#a27650", koyu: "#74502f", acik: "#c09468", olcek: 4, uzama: [0.25, 3], lif: 0.45, lifSiklik: 14, benek: 0, tohum: 5 });
  ah.renk.repeat.set(3, 1.5); ah.puruz.repeat.set(3, 1.5);
  const ust = new THREE.Mesh(new THREE.BoxGeometry(en, 0.5, derin), new THREE.MeshPhysicalMaterial({ map: ah.renk, roughnessMap: ah.puruz, roughness: 0.6, clearcoat: 0.35, clearcoatRoughness: 0.3 }));
  ust.position.y = -0.25; ust.receiveShadow = true;
  g.add(ust);
  const duvarD = yuzeyDokusu({ boyut: 256, taban: "#e9e4da", koyu: "#d4cdbf", acik: "#f6f2ea", olcek: 8, benek: 0.05, tohum: 9 });
  duvarD.renk.repeat.set(4, 2);
  const duvar = new THREE.Mesh(new THREE.PlaneGeometry(en * 3, 30), new THREE.MeshStandardMaterial({ map: duvarD.renk, roughness: 0.95 }));
  duvar.position.set(0, 10, -derin / 2 - 1.5); duvar.receiveShadow = true;
  g.add(duvar);
  // arka rafta birkaç cam şişe (bağlam)
  const raf = new THREE.Mesh(new THREE.BoxGeometry(en * 0.8, 0.25, 2), new THREE.MeshStandardMaterial({ map: ah.renk, roughness: 0.7 }));
  raf.position.set(0, 7.5, -derin / 2 - 0.5); raf.castShadow = true; raf.receiveShadow = true;
  g.add(raf);
  const r = rastgele(3);
  const renkler = ["#7fb6d9", "#e3b35a", "#b0d37a", "#d98a7a", "#9fa8e0"];
  for (let i = 0; i < 9; i++) {
    const h = 1.6 + r() * 1.6, rr = 0.45 + r() * 0.35;
    const prof = [[0, 0], [rr, 0], [rr, h * 0.7], [rr * 0.4, h * 0.85], [rr * 0.35, h], [rr * 0.42, h * 1.03]].map(([a, b]) => new THREE.Vector2(a, b));
    const sise = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), new THREE.MeshPhysicalMaterial({ color: renkler[i % 5], roughness: 0.15, transparent: true, opacity: 0.55, clearcoat: 1 }));
    sise.position.set(-en * 0.36 + i * (en * 0.09), 7.62, -derin / 2 - 0.5 + (r() - 0.5) * 0.5);
    g.add(sise);
  }
  return g;
}

/* ---------------- Cam kap profilleri ---------------- */
/** Beher (ağızlı), yükseklik h, yarıçap rr; et kalınlığı içe doğru */
export function beherGeo(rr = 1, h = 2.4, et = 0.05) {
  const prof = [[0, 0], [rr - 0.08, 0], [rr, 0.06], [rr, h], [rr + 0.06, h + 0.04], [rr + 0.03, h + 0.07], [rr - et, h], [rr - et, et + 0.04], [rr - 0.1, et], [0, et]];
  return new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 64);
}
/** Çan fanus: düz kenarlı, kubbeli, tepesinde topuz */
export function fanusGeo(rr = 2.2, h = 3.6) {
  const prof = [];
  prof.push([rr + 0.05, 0], [rr, 0.02]);
  for (let i = 0; i <= 12; i++) prof.push([rr, (h - rr * 0.8) * (i / 12)]);
  for (let i = 1; i <= 16; i++) { const a = (i / 16) * Math.PI / 2; prof.push([rr * Math.cos(a), h - rr * 0.8 + rr * 0.8 * Math.sin(a)]); }
  prof.push([0.25, h + 0.02], [0.26, h + 0.25], [0.18, h + 0.45], [0, h + 0.47]);
  return new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(Math.max(0, a), b)), 72);
}

export { malzeme };
