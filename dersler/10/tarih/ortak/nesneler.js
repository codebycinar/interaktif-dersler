// Harita üstü maket nesneler (three.js): kervansaray, medrese, kale, çadır (oba), ordu, kervan, şehir, köprü, gemi, baraj, ağaç.
// Boyutlar "maket birimi"dir (1 birim ≈ nesnenin taban genişliği); çağıran harita.olcek ile ölçekler.
// Taş, keçe, ahşap yüzeyleri koddan üretilen dokularla verilir; telifli görsel yoktur.
import { THREE, malzeme, yuzeyDokusu, organiklestir, coklu, rastgele } from "../../../../engine/sahne3d.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/* ---------- Malzemeler (önbellekli) ---------- */
const onbellek = new Map();
const bir = (ad, f) => { if (!onbellek.has(ad)) onbellek.set(ad, f()); return onbellek.get(ad); };
export const MALZ = {
  tas: () => bir("tas", () => {
    const d = yuzeyDokusu({ boyut: 128, taban: "#c3ad8c", koyu: "#917b5e", acik: "#e0d0b4", olcek: 7, benek: 0.25, tohum: 5 });
    d.renk.repeat.set(2, 2); d.puruz.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: d.renk, roughnessMap: d.puruz, bumpMap: d.puruz, bumpScale: 0.6, roughness: 0.95, metalness: 0 });
  }),
  koyuTas: () => bir("koyuTas", () => {
    const d = yuzeyDokusu({ boyut: 128, taban: "#8d8174", koyu: "#5f564c", acik: "#b0a596", olcek: 6, benek: 0.3, tohum: 9 });
    d.renk.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: d.renk, roughnessMap: d.puruz, bumpMap: d.puruz, bumpScale: 0.6, roughness: 0.95 });
  }),
  kece: () => bir("kece", () => {
    const d = yuzeyDokusu({ boyut: 128, taban: "#e3d7c0", koyu: "#b9a989", acik: "#f3ecdc", olcek: 10, benek: 0.1, lif: 0.25, tohum: 3 });
    return new THREE.MeshStandardMaterial({ map: d.renk, roughnessMap: d.puruz, roughness: 1 });
  }),
  koyuKece: () => bir("koyuKece", () => {
    const d = yuzeyDokusu({ boyut: 128, taban: "#6b5440", koyu: "#4a3a2c", acik: "#8a7058", olcek: 10, benek: 0.1, lif: 0.3, tohum: 4 });
    return new THREE.MeshStandardMaterial({ map: d.renk, roughnessMap: d.puruz, roughness: 1 });
  }),
  ahsap: () => bir("ahsap", () => {
    const d = yuzeyDokusu({ boyut: 128, taban: "#8a5d36", koyu: "#5a3a1f", acik: "#a9774a", olcek: 4, lif: 0.7, uzama: [1, 6], tohum: 7 });
    return new THREE.MeshStandardMaterial({ map: d.renk, roughnessMap: d.puruz, roughness: 0.85 });
  }),
  kursun: () => bir("kursun", () => malzeme.metal(0x8e979e, { puruz: 0.55 })),
  kiremit: () => bir("kiremit", () => {
    const d = yuzeyDokusu({ boyut: 128, taban: "#a5573a", koyu: "#7a3a25", acik: "#c07454", olcek: 12, benek: 0.2, uzama: [1, 3], tohum: 8 });
    return new THREE.MeshStandardMaterial({ map: d.renk, roughnessMap: d.puruz, roughness: 0.9 });
  }),
  siva: () => bir("siva", () => {
    const d = yuzeyDokusu({ boyut: 128, taban: "#e6dccb", koyu: "#c4b59c", acik: "#f6f0e4", olcek: 8, benek: 0.12, tohum: 12 });
    return new THREE.MeshStandardMaterial({ map: d.renk, roughnessMap: d.puruz, roughness: 0.95 });
  }),
  beton: () => bir("beton", () => {
    const d = yuzeyDokusu({ boyut: 128, taban: "#b9b7b0", koyu: "#8f8d86", acik: "#d6d4cd", olcek: 9, benek: 0.2, tohum: 14 });
    return new THREE.MeshStandardMaterial({ map: d.renk, roughnessMap: d.puruz, roughness: 0.9 });
  }),
  toprakDam: () => bir("toprakDam", () => {
    const d = yuzeyDokusu({ boyut: 128, taban: "#b59a76", koyu: "#8c7356", acik: "#cdb592", olcek: 8, benek: 0.2, tohum: 15 });
    return new THREE.MeshStandardMaterial({ map: d.renk, roughnessMap: d.puruz, roughness: 1 });
  }),
  celik: () => bir("celik", () => malzeme.metal(0xc5ccd3, { puruz: 0.35 })),
  kirmiziCelik: () => bir("kcelik", () => new THREE.MeshStandardMaterial({ color: 0xb0453a, metalness: 0.6, roughness: 0.45 })),
  su: () => bir("su", () => new THREE.MeshStandardMaterial({ color: 0x2b6f93, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.92 })),
  renkli: () => bir("renkli", () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 })),
};

/** Geometriye tek renk köşe rengi verir (birleştirilmiş çok renkli maketler için) */
function boya(geo, renk) {
  const c = new THREE.Color(renk), n = geo.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  geo.setAttribute("color", new THREE.BufferAttribute(a, 3));
  return geo;
}
const birlesik = (parcalar) => mergeGeometries(parcalar.map((g) => (g.index ? g.toNonIndexed() : g)), false);
const golgeli = (m) => { m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };
const kutu = (w, h, d, malz, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), malz); m.position.set(x, y + h / 2, z); return m; };

/* ---------- Yapılar ---------- */
/** Selçuklu kervansarayı: avlulu ana bölüm, kapalı kışlık bölüm, anıtsal taç kapı, kuleler */
export function kervansaray() {
  const g = new THREE.Group(), tas = MALZ.tas();
  const W = 1, D = 0.62, h = 0.16, t = 0.06;
  g.add(kutu(W, h, t, tas, 0, 0, -D / 2), kutu(t, h, D, tas, -W / 2, 0, 0), kutu(t, h, D, tas, W / 2, 0, 0));
  g.add(kutu(0.38, h, t, tas, -0.31, 0, D / 2), kutu(0.38, h, t, tas, 0.31, 0, D / 2));
  // kapalı bölüm (arka) ve avlu revakları
  g.add(kutu(W - 0.02, h * 1.25, 0.26, tas, 0, 0, -D / 2 - 0.13));
  const cati = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, W - 0.06, 14, 1, false, 0, Math.PI), tas);
  cati.rotation.z = Math.PI / 2; cati.position.set(0, h * 1.25, -D / 2 - 0.13); g.add(cati);
  // taç kapı
  g.add(kutu(0.26, h * 1.65, 0.1, tas, 0, 0, D / 2 + 0.02));
  const nis = kutu(0.12, h * 1.05, 0.02, MALZ.koyuTas(), 0, 0, D / 2 + 0.075); g.add(nis);
  // köşe ve yan kuleler
  for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2], [-W / 2, 0], [W / 2, 0]]) {
    const k = new THREE.Mesh(organiklestir(new THREE.CylinderGeometry(0.055, 0.065, h * 1.1, 10), { genlik: 0.004, olcek: 30 }), tas);
    k.position.set(x, h * 0.55, z); g.add(k);
  }
  // avlu ortasında köşk mescit
  g.add(kutu(0.12, 0.12, 0.12, tas, 0, 0, 0.04));
  return golgeli(g);
}

/** Kubbeli medrese: taç kapı, kubbe ve minare */
export function medrese({ minare = true, kubbe = true } = {}) {
  const g = new THREE.Group(), tas = MALZ.tas();
  g.add(kutu(0.9, 0.22, 0.75, tas));
  if (kubbe) {
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), MALZ.kursun());
    k.position.set(0, 0.22, -0.08); g.add(k);
    g.add(kutu(0.56, 0.06, 0.56, tas, 0, 0.2, -0.08));
  }
  g.add(kutu(0.34, 0.36, 0.1, tas, 0, 0, 0.4));
  g.add(kutu(0.16, 0.24, 0.02, MALZ.koyuTas(), 0, 0, 0.455));
  if (minare) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.62, 12), MALZ.tas());
    m.position.set(0.36, 0.31, 0.32); g.add(m);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 12), MALZ.tas()); s.position.set(0.36, 0.5, 0.32); g.add(s);
    const u = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 12), MALZ.kursun()); u.position.set(0.36, 0.68, 0.32); g.add(u);
  }
  return golgeli(g);
}

/** Gotik katedral: uzun nef, beşik çatı, iki çan kulesi ve sivri külahlar */
export function katedral() {
  const g = new THREE.Group(), tas = MALZ.koyuTas();
  g.add(kutu(1, 0.26, 0.34, tas, 0.05, 0, 0));
  const cati = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1, 3, 1), MALZ.kursun());
  cati.rotation.z = Math.PI / 2; cati.rotation.x = Math.PI / 6; cati.scale.set(1, 1, 0.62); cati.position.set(0.05, 0.31, 0); g.add(cati);
  g.add(kutu(0.24, 0.24, 0.6, tas, 0.25, 0, 0));
  for (const z of [-0.11, 0.11]) {
    g.add(kutu(0.16, 0.62, 0.16, tas, -0.5, 0, z));
    const k = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 4), MALZ.kursun()); k.rotation.y = Math.PI / 4; k.position.set(-0.5, 0.77, z); g.add(k);
  }
  return golgeli(g);
}

/** Surlu kale: çokgen sur, burçlar ve iç kale */
export function kale({ kenar = 7, yaricap = 0.5 } = {}) {
  const g = new THREE.Group(), tas = MALZ.koyuTas();
  const r = rastgele(31);
  const noktalar = Array.from({ length: kenar }, (_, i) => {
    const a = (i / kenar) * Math.PI * 2, rr = yaricap * (0.85 + r() * 0.3);
    return new THREE.Vector3(Math.cos(a) * rr, 0, Math.sin(a) * rr);
  });
  noktalar.forEach((p, i) => {
    const q = noktalar[(i + 1) % kenar], L = p.distanceTo(q);
    const duvar = new THREE.Mesh(new THREE.BoxGeometry(L, 0.16, 0.05), tas);
    duvar.position.copy(p).add(q).multiplyScalar(0.5).setY(0.08);
    duvar.rotation.y = -Math.atan2(q.z - p.z, q.x - p.x);
    g.add(duvar);
    const k = new THREE.Mesh(organiklestir(new THREE.CylinderGeometry(0.06, 0.075, 0.24, 9), { genlik: 0.005, olcek: 25 }), tas);
    k.position.copy(p).setY(0.12); g.add(k);
    const kk = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 9), tas); kk.position.copy(p).setY(0.255); g.add(kk);
  });
  g.add(kutu(0.2, 0.36, 0.2, tas, 0.05, 0, -0.05));
  return golgeli(g);
}

/** Türkmen obası: keçe çadırlar (topak ev) */
export function oba({ sayi = 6, tohum = 3 } = {}) {
  const g = new THREE.Group(), r = rastgele(tohum);
  for (let i = 0; i < sayi; i++) {
    const c = new THREE.Group();
    const duvar = new THREE.Mesh(organiklestir(new THREE.CylinderGeometry(0.16, 0.17, 0.12, 18, 2), { genlik: 0.006, olcek: 20, tohum: i }), MALZ.kece());
    duvar.position.y = 0.06;
    const tepe = new THREE.Mesh(organiklestir(new THREE.ConeGeometry(0.175, 0.12, 18, 2), { genlik: 0.005, olcek: 20, tohum: i + 9 }), i % 3 ? MALZ.kece() : MALZ.koyuKece());
    tepe.position.y = 0.18;
    const kapi = kutu(0.06, 0.08, 0.01, MALZ.ahsap(), 0, 0, 0.165);
    c.add(duvar, tepe, kapi);
    const a = (i / sayi) * Math.PI * 2 + r() * 0.5, rr = 0.25 + r() * 0.35;
    c.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr);
    c.rotation.y = -a + Math.PI / 2 + (r() - 0.5);
    c.scale.setScalar(0.8 + r() * 0.4);
    g.add(c);
  }
  return golgeli(g);
}

/** Şehir: kerpiç/taş evler, kubbeli cami ve minare, isteğe bağlı sur */
export function sehir({ ev = 40, yaricap = 0.6, sur = false, tohum = 5, cami = true } = {}) {
  const g = new THREE.Group(), r = rastgele(tohum);
  const evGeo = birlesik([boya(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), "#e1d3bb")]);
  const evler = coklu(evGeo, MALZ.siva(), ev, { golge: true });
  const damGeo = new THREE.BoxGeometry(1.08, 0.12, 1.08).translate(0, 1.06, 0);
  const damlar = coklu(damGeo, MALZ.toprakDam(), ev);
  for (let i = 0; i < ev; i++) {
    const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * yaricap;
    const s = 0.1 + r() * 0.07, boy = [s, 0.06 + r() * 0.07, s * (0.8 + r() * 0.5)], don = r() * Math.PI;
    evler.userData.yerlestir(i, Math.cos(a) * rr, 0, Math.sin(a) * rr, boy, don);
    damlar.userData.yerlestir(i, Math.cos(a) * rr, 0, Math.sin(a) * rr, boy, don);
  }
  evler.userData.bitir(); damlar.userData.bitir();
  g.add(evler, damlar);
  if (cami) { const c = medrese({ minare: true }); c.scale.setScalar(0.32); c.position.set(0.04, 0, -0.02); g.add(c); }
  if (sur) { const k = kale({ kenar: 10, yaricap: yaricap * 1.12 }); k.children.slice(-1)[0].visible = false; k.scale.set(1, 0.5, 1); g.add(k); }
  return golgeli(g);
}

/* ---------- Canlılar (çok kopyalı) ---------- */
function atGeo() {
  const govde = boya(organiklestir(new THREE.CapsuleGeometry(0.06, 0.16, 4, 8).rotateZ(Math.PI / 2), { genlik: 0.006, olcek: 18 }).translate(0, 0.16, 0), "#5b3e28");
  const boyun = boya(new THREE.CylinderGeometry(0.03, 0.04, 0.13, 6).rotateZ(-0.7).translate(0.13, 0.22, 0), "#5b3e28");
  const bas = boya(new THREE.BoxGeometry(0.1, 0.045, 0.045).rotateZ(-0.35).translate(0.2, 0.27, 0), "#4e3422");
  const bacaklar = [[-0.08, 0.035], [-0.08, -0.035], [0.08, 0.035], [0.08, -0.035]].map(([x, z]) => boya(new THREE.CylinderGeometry(0.014, 0.012, 0.13, 5).translate(x, 0.065, z), "#3e2a1b"));
  const kuyruk = boya(new THREE.ConeGeometry(0.018, 0.1, 5).rotateZ(-2.6).translate(-0.15, 0.14, 0), "#2e2016");
  return birlesik([govde, boyun, bas, ...bacaklar, kuyruk]);
}
function biniciGeo() {
  const binici = boya(new THREE.CylinderGeometry(0.03, 0.045, 0.14, 7).translate(0, 0.29, 0), "#ffffff");
  const kafa = boya(new THREE.SphereGeometry(0.03, 8, 6).translate(0, 0.39, 0), "#e8cdb0");
  const bork = boya(new THREE.ConeGeometry(0.032, 0.05, 8).translate(0, 0.43, 0), "#ffffff");
  const mizrak = boya(new THREE.CylinderGeometry(0.004, 0.004, 0.42, 4).rotateZ(0.25).translate(0.03, 0.36, 0.05), "#6b5a48");
  return birlesik([binici, kafa, bork, mizrak]);
}
function yayaGeo() {
  const govde = boya(new THREE.CylinderGeometry(0.028, 0.04, 0.16, 7).translate(0, 0.12, 0), "#ffffff");
  const bacak = boya(new THREE.CylinderGeometry(0.02, 0.018, 0.08, 5).translate(0, 0.04, 0), "#3d3026");
  const kafa = boya(new THREE.SphereGeometry(0.026, 8, 6).translate(0, 0.225, 0), "#d9b38c");
  const migfer = boya(new THREE.SphereGeometry(0.028, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.232, 0), "#9aa3ab");
  const kalkan = boya(new THREE.CylinderGeometry(0.045, 0.045, 0.01, 10).rotateX(Math.PI / 2).translate(0, 0.13, 0.04), "#ffffff");
  const mizrak = boya(new THREE.CylinderGeometry(0.004, 0.004, 0.4, 4).translate(0.04, 0.2, 0), "#3b2b1d");
  return birlesik([govde, bacak, kafa, migfer, kalkan, mizrak]);
}
/**
 * Ordu: düzen içinde atlı ya da yaya birlikler ve bir sancak.
 * renk: birliğin giysi/kalkan rengi · yon: yüzlerinin döndüğü açı (radyan, +x'ten)
 */
export function ordu({ sayi = 60, renk = "#2f6db0", atli = true, yon = 0, sancak = "#c8102e", tohum = 2, sira = 6 } = {}) {
  const g = new THREE.Group(), r = rastgele(tohum);
  const geo = bir(atli ? "biniciGeo" : "yayaGeo", () => (atli ? biniciGeo() : yayaGeo()));
  const m = coklu(geo, MALZ.renkli(), sayi, { golge: true });
  const at = atli ? coklu(bir("atGeo", atGeo), MALZ.renkli(), sayi, { golge: true }) : null;
  const tint = new THREE.Color(renk), beyaz = new THREE.Color(1, 1, 1), atRenk = new THREE.Color();
  const kolon = Math.ceil(sayi / sira), ara = atli ? 0.13 : 0.09;
  for (let i = 0; i < sayi; i++) {
    const a = i % kolon, b = Math.floor(i / kolon);
    const x = (b - sira / 2) * ara * 1.6 + (r() - 0.5) * 0.03, z = (a - kolon / 2) * ara + (r() - 0.5) * 0.03;
    const s = 0.9 + r() * 0.2, don = (r() - 0.5) * 0.25;
    m.userData.yerlestir(i, x, 0, z, s, don);
    m.setColorAt(i, beyaz.clone().lerp(tint, 0.85));
    if (at) { at.userData.yerlestir(i, x, 0, z, s, don); at.setColorAt(i, atRenk.setHSL(0.07, 0.3, 0.55 + r() * 0.5)); }
  }
  m.userData.bitir();
  if (m.instanceColor) m.instanceColor.needsUpdate = true;
  if (at) { at.userData.bitir(); if (at.instanceColor) at.instanceColor.needsUpdate = true; }
  const birlik = new THREE.Group(); birlik.add(m); if (at) birlik.add(at);
  // sancak
  const direk = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 6), MALZ.ahsap());
  direk.position.set(sira * ara * 0.9, 0.35, 0);
  const bez = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.14, 6, 2), new THREE.MeshStandardMaterial({ color: sancak, side: THREE.DoubleSide, roughness: 0.9 }));
  const p = bez.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 18) * 0.015);
  bez.geometry.computeVertexNormals();
  bez.position.set(sira * ara * 0.9 + 0.11, 0.62, 0);
  birlik.add(direk, bez);
  birlik.rotation.y = -yon;
  g.add(birlik);
  g.userData.sancak = bez;
  return golgeli(g);
}

function deveGeo() {
  const govde = boya(organiklestir(new THREE.CapsuleGeometry(0.06, 0.15, 4, 8).rotateZ(Math.PI / 2), { genlik: 0.006, olcek: 18 }).translate(0, 0.2, 0), "#b48a5a");
  const hor = boya(new THREE.SphereGeometry(0.055, 10, 8).scale(1.1, 0.8, 0.9).translate(-0.01, 0.27, 0), "#a97f50");
  const boyun = boya(new THREE.CylinderGeometry(0.025, 0.035, 0.16, 6).rotateZ(-0.9).translate(0.15, 0.27, 0), "#b48a5a");
  const bas = boya(new THREE.BoxGeometry(0.08, 0.04, 0.04).translate(0.23, 0.33, 0), "#a07548");
  const bacaklar = [[-0.07, 0.03], [-0.07, -0.03], [0.07, 0.03], [0.07, -0.03]].map(([x, z]) => boya(new THREE.CylinderGeometry(0.013, 0.01, 0.17, 5).translate(x, 0.085, z), "#8f6a43"));
  const yuk1 = boya(new THREE.BoxGeometry(0.08, 0.06, 0.05).translate(-0.04, 0.26, 0.065), "#7b4f2c");
  const yuk2 = boya(new THREE.BoxGeometry(0.08, 0.06, 0.05).translate(-0.04, 0.26, -0.065), "#5f6b3a");
  return birlesik([govde, hor, boyun, bas, ...bacaklar, yuk1, yuk2]);
}
/**
 * Kervan: develer bir yol boyunca dizilir; ilerle(t) ile yol üzerinde yürür.
 * noktaFn(u) → THREE.Vector3 (u: 0–1 yol üzerinde) · yonFn(u) → açı
 */
export function kervan({ sayi = 9, aralik = 0.012 } = {}) {
  const geo = bir("deveGeo", deveGeo);
  const m = coklu(geo, MALZ.renkli(), sayi, { golge: true });
  m.frustumCulled = false;
  const g = new THREE.Group(); g.add(m);
  g.userData.ilerle = (u0, noktaFn, olcek) => {
    for (let i = 0; i < sayi; i++) {
      const u = Math.max(0, Math.min(1, u0 - i * aralik));
      const p = noktaFn(u), q = noktaFn(Math.min(1, u + 0.002));
      const aci = Math.atan2(-(q.z - p.z), q.x - p.x);
      m.userData.yerlestir(i, p.x, p.y, p.z, olcek * (i % 3 === 0 ? 1.05 : 0.95), aci);
    }
    m.userData.bitir();
  };
  return g;
}

/* ---------- Bugünün yapıları ---------- */
/** Asma köprü: iki kule, tabliye, ana kablolar ve askılar. boy: açıklık (maket birimi) */
export function kopru({ boy = 1, kule = 0.22 } = {}) {
  const g = new THREE.Group(), c = MALZ.beton();
  const yarim = boy / 2;
  g.add(kutu(boy * 1.5, 0.012, 0.05, MALZ.celik(), 0, 0.06, 0));
  for (const x of [-yarim, yarim]) for (const z of [-0.025, 0.025]) g.add(kutu(0.018, kule, 0.018, c, x, 0, z));
  for (const x of [-yarim, yarim]) g.add(kutu(0.02, 0.012, 0.07, c, x, kule * 0.92, 0));
  for (const z of [-0.025, 0.025]) {
    const yol = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-yarim * 1.5, 0.07, z), new THREE.Vector3(-yarim, kule, z), new THREE.Vector3(0, 0.085, z), new THREE.Vector3(yarim, kule, z), new THREE.Vector3(yarim * 1.5, 0.07, z)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(yol, 48, 0.0035, 5), MALZ.celik()));
  }
  return golgeli(g);
}
/** Yük gemisi */
export function gemi({ renk = "#9c2f2a" } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-0.5, -0.09); s.lineTo(0.38, -0.09); s.quadraticCurveTo(0.56, 0, 0.38, 0.09); s.lineTo(-0.5, 0.09); s.closePath();
  const govde = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, 0.08, 0), new THREE.MeshStandardMaterial({ color: renk, roughness: 0.6, metalness: 0.2 }));
  g.add(govde);
  const kp = ["#c7792f", "#2f6f8f", "#d4c24a", "#6c8f3a"];
  for (let i = 0; i < 6; i++) g.add(kutu(0.1, 0.05, 0.14, new THREE.MeshStandardMaterial({ color: kp[i % 4], roughness: 0.7 }), -0.25 + i * 0.105, 0.08, 0));
  g.add(kutu(0.1, 0.14, 0.15, new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.6 }), -0.42, 0.08, 0));
  return golgeli(g);
}
/** Toprak/kaya dolgu baraj gövdesi; uzunluk ve yükseklik maket birimi */
export function baraj({ uzunluk = 1, yukseklik = 0.18 } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-0.32, 0); s.lineTo(-0.03, yukseklik); s.lineTo(0.03, yukseklik); s.lineTo(0.32, 0); s.closePath();
  const govde = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: uzunluk, bevelEnabled: false }).translate(0, 0, -uzunluk / 2), MALZ.koyuTas());
  govde.rotation.y = Math.PI / 2;
  g.add(govde);
  g.add(kutu(uzunluk, 0.01, 0.06, MALZ.beton(), 0, yukseklik, 0));
  const santral = kutu(0.22, 0.08, 0.12, MALZ.beton(), uzunluk * 0.2, 0, 0.36); g.add(santral);
  return golgeli(g);
}

/** Ağaçlar: iğne yapraklı ve geniş yapraklı karışık, çok kopyalı */
export function agaclar(noktalar, { olcek = 1, tohum = 4, kozalakli = 0.5, renk = "#3f6a35" } = {}) {
  const r = rastgele(tohum);
  const kozGeo = bir("kozGeo", () => birlesik([boya(new THREE.CylinderGeometry(0.012, 0.016, 0.06, 5).translate(0, 0.03, 0), "#5a3d26"), boya(new THREE.ConeGeometry(0.06, 0.2, 7).translate(0, 0.15, 0), "#ffffff")]));
  const genGeo = bir("genGeo", () => birlesik([boya(new THREE.CylinderGeometry(0.012, 0.016, 0.07, 5).translate(0, 0.035, 0), "#5a3d26"), boya(organiklestir(new THREE.IcosahedronGeometry(0.075, 1), { genlik: 0.012, olcek: 14 }).translate(0, 0.13, 0), "#ffffff")]));
  const kozSay = noktalar.filter(() => r() < kozalakli).length;
  const r2 = rastgele(tohum);
  const k = coklu(kozGeo, MALZ.renkli(), Math.max(1, kozSay), { golge: true }), gn = coklu(genGeo, MALZ.renkli(), Math.max(1, noktalar.length - kozSay), { golge: true });
  let ik = 0, ig = 0;
  const taban = new THREE.Color(renk);
  for (const p of noktalar) {
    const s = olcek * (0.7 + r2() * 0.6), c = taban.clone().offsetHSL((r2() - 0.5) * 0.04, 0, (r2() - 0.5) * 0.1);
    if (r2() < kozalakli && ik < kozSay) { k.userData.yerlestir(ik, p.x, p.y, p.z, s, r2() * 6); k.setColorAt(ik++, c.clone().offsetHSL(0.02, 0, -0.05)); }
    else if (ig < gn.count) { gn.userData.yerlestir(ig, p.x, p.y, p.z, s, r2() * 6); gn.setColorAt(ig++, c); }
  }
  k.count = ik; gn.count = ig;
  k.userData.bitir(); gn.userData.bitir();
  if (k.instanceColor) k.instanceColor.needsUpdate = true;
  if (gn.instanceColor) gn.instanceColor.needsUpdate = true;
  const g = new THREE.Group(); g.add(k, gn);
  return g;
}

/** Çay bahçesi: yamaç boyunca sıralanmış yuvarlak çay öbekleri */
export function cayBahcesi(noktalar, { olcek = 1 } = {}) {
  const geo = bir("cayGeo", () => boya(organiklestir(new THREE.SphereGeometry(0.05, 10, 7).scale(1.3, 0.6, 1).translate(0, 0.02, 0), { genlik: 0.008, olcek: 20 }), "#ffffff"));
  const m = coklu(geo, MALZ.renkli(), noktalar.length, { golge: true });
  const r = rastgele(17), c = new THREE.Color("#2f6b2a");
  noktalar.forEach((p, i) => { m.userData.yerlestir(i, p.x, p.y, p.z, olcek * (0.85 + r() * 0.3), p.aci || 0); m.setColorAt(i, c.clone().offsetHSL(0, 0, (r() - 0.5) * 0.08)); });
  m.userData.bitir();
  if (m.instanceColor) m.instanceColor.needsUpdate = true;
  return m;
}

/** Tuzla: beyaz tuz yığınları ve havuzlar */
export function tuzla({ yigin = 7 } = {}) {
  const g = new THREE.Group(), r = rastgele(8);
  const beyaz = new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.75 });
  for (let i = 0; i < yigin; i++) {
    const y = new THREE.Mesh(organiklestir(new THREE.ConeGeometry(0.09, 0.1, 12, 2), { genlik: 0.01, olcek: 20, tohum: i }), beyaz);
    y.position.set((i % 4) * 0.2 - 0.3 + r() * 0.05, 0.05, Math.floor(i / 4) * 0.22 - 0.1 + r() * 0.05);
    g.add(y);
  }
  for (let i = 0; i < 4; i++) g.add(kutu(0.18, 0.006, 0.12, new THREE.MeshStandardMaterial({ color: i % 2 ? 0xd9e6e8 : 0xe9d3d9, roughness: 0.3 }), -0.3 + i * 0.2, 0, 0.32));
  g.add(kutu(0.2, 0.1, 0.12, MALZ.beton(), 0.55, 0, 0));
  return golgeli(g);
}

/* ---------- Haritaya yerleştirme ---------- */
/**
 * Maketi [boylam, enlem] noktasına, arazinin üstüne koyar.
 * boy: harita ölçeğine göre büyüklük (1 ≈ görünen genişliğin %1'i) · yon: derece, doğudan saat yönünün tersine
 */
export function koy(h, grup, nesne, ll, { boy = 3, yon = 0, ek = 0 } = {}) {
  const p = h.yer(ll, ek);
  nesne.position.copy(p);
  nesne.scale.multiplyScalar(boy * h.olcek);
  nesne.rotation.y += (yon * Math.PI) / 180;
  grup.add(nesne);
  return nesne;
}
/** Yol (boylam-enlem dizisi) üzerinde 0–1 arası parametreyle 3B nokta veren fonksiyon */
export function yolNoktasi(h, yol) {
  const pts = yol.map((ll) => h.yer(ll));
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const top = L[L.length - 1] || 1;
  return (u) => {
    const s = Math.max(0, Math.min(1, u)) * top;
    let i = 1;
    while (i < L.length - 1 && L[i] < s) i++;
    const t = (s - L[i - 1]) / (L[i] - L[i - 1] || 1);
    const ll = [yol[i - 1][0] + (yol[i][0] - yol[i - 1][0]) * t, yol[i - 1][1] + (yol[i][1] - yol[i - 1][1]) * t];
    return h.yer(ll);
  };
}
/** Dağınık atlılar: her 3B noktada bir atlı (tek çizimde yüzlerce). renk: giysi rengi */
export function atlilar(noktalar, { renk = "#ffb547", olcek = 1, tohum = 6 } = {}) {
  const r = rastgele(tohum), n = Math.max(1, noktalar.length);
  const b = coklu(bir("biniciGeo", biniciGeo), MALZ.renkli(), n, { golge: true });
  const a = coklu(bir("atGeo", atGeo), MALZ.renkli(), n, { golge: true });
  const tint = new THREE.Color(renk), c = new THREE.Color();
  noktalar.forEach((p, i) => {
    const don = p.yon ?? r() * Math.PI * 2, s = olcek * (0.9 + r() * 0.2);
    b.userData.yerlestir(i, p.x, p.y, p.z, s, don); a.userData.yerlestir(i, p.x, p.y, p.z, s, don);
    b.setColorAt(i, tint); a.setColorAt(i, c.setHSL(0.07, 0.3, 0.55 + r() * 0.5));
  });
  b.count = a.count = noktalar.length;
  for (const m of [a, b]) { m.userData.bitir(); if (m.instanceColor) m.instanceColor.needsUpdate = true; }
  const g = new THREE.Group(); g.add(a, b);
  return g;
}

/**
 * Arazinin üstüne serilen su yüzeyi (baraj gölü gibi): halka içinde kalan ızgara noktaları
 * suyun düzeyine (duzey: dünya birimi; verilmezse halkadaki en alçak noktanın biraz üstü) oturur.
 */
export function suAlani(h, halka, { duzey, renk = 0x2f6f8f, bolme = 90 } = {}) {
  const l = halka.map((p) => p[0]), b = halka.map((p) => p[1]);
  const L0 = Math.min(...l), L1 = Math.max(...l), B0 = Math.min(...b), B1 = Math.max(...b);
  const icinde = ([x, y]) => {
    let ic = false;
    for (let i = 0, j = halka.length - 1; i < halka.length; j = i++) {
      const [xi, yi] = halka[i], [xj, yj] = halka[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ic = !ic;
    }
    return ic;
  };
  const nx = bolme, ny = Math.max(8, Math.round((bolme * (B1 - B0)) / (L1 - L0)));
  const konum = [], indeks = [], ic = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const ll = [L0 + ((L1 - L0) * i) / nx, B1 - ((B1 - B0) * j) / ny];
    const v = h.yer(ll);
    konum.push(v.x, v.y, v.z); ic.push(icinde(ll));
  }
  const yuk = duzey ?? Math.min(...halka.map((p) => h.yer(p).y)) + 0.02;
  for (let k = 0; k < ic.length; k++) konum[k * 3 + 1] = Math.max(konum[k * 3 + 1], yuk) + 0.01;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b2 = a + 1, c = a + nx + 1, d = c + 1;
    if (ic[a] && ic[c] && ic[b2]) indeks.push(a, c, b2);
    if (ic[b2] && ic[c] && ic[d]) indeks.push(b2, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(konum, 3));
  geo.setIndex(indeks);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: renk, roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.93 }));
  m.receiveShadow = true;
  return m;
}
