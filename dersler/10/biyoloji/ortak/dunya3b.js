// Biyoloji 10 ortak 3B dünya araçları (u1b, u1c): adlandırılmış yerler arasında kamera geçişi,
// yere özgü ışık/arka plan, adımla birlikte kaldırılan iğneler, hazır dokular ve biyolojik biçimler.
// Motor adayı: yerEkle/git, adimIgne, adimKare, dokuluMalzeme, borudanGeo, yuzenTuval.
import { sahne3dKur, THREE, malzeme, organiklestir, yuzeyDokusu, coklu, rastgele, fbm } from "../../../../engine/sahne3d.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { el } from "../../../../engine/ders.js";

export { THREE, malzeme, organiklestir, yuzeyDokusu, coklu, rastgele, fbm, mergeGeometries };

/**
 * Yer: { grup, merkez:[x,y,z], bakislar:{ad:{konum,hedef,min,max}}, arkaPlan, sis, isik:{gok,gunes,ortam} }
 * Yerler birbirinden uzakta durur; git() kamerayı uçurur, varınca eski yeri gizler (çizim yükü azalır).
 */
export function dunyaKur(kap, secenek = {}) {
  const S = sahne3dKur(kap, { arkaPlan: [0x1b2a40, 0x0b111b], ...secenek });
  const yerler = new Map();
  let simdiki = null, no = 0;
  S.gunes.shadow.camera.left = -18; S.gunes.shadow.camera.right = 18;
  S.gunes.shadow.camera.top = 18; S.gunes.shadow.camera.bottom = -18;
  S.gunes.shadow.camera.updateProjectionMatrix();

  function ortamUygula(y) {
    S.arkaPlan(y.arkaPlan ?? [0x1b2a40, 0x0b111b]);
    S.scene.fog = y.sis ? new THREE.Fog(Array.isArray(y.arkaPlan) ? y.arkaPlan[1] : y.arkaPlan, y.sis[0], y.sis[1]) : null;
    const i = y.isik || {};
    S.gok.intensity = i.gok ?? 0.55;
    S.gunes.intensity = i.gunes ?? 2.6;
    S.gunes.castShadow = (i.golge ?? true) && S.kalite !== "dusuk";
    S.scene.environmentIntensity = i.ortam ?? 0.7;
    const [x, yy, z] = y.merkez;
    S.gunes.position.set(x + (i.yon?.[0] ?? -12), yy + (i.yon?.[1] ?? 24), z + (i.yon?.[2] ?? 14));
    S.gunes.target.position.set(x, yy, z);
    S.gunes.target.updateMatrixWorld();
  }

  /* Kamera uçuşu: kare hızından bağımsız (duvar saati); yavaş cihazda da süresinde biter */
  let ucus = null;
  const yumusak = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  S.uc = ({ konum, hedef, sure = 1.4 }) => {
    ucus?.coz();
    return new Promise((coz) => {
      ucus = {
        t0: performance.now(), sure: Math.max(0.05, sure) * 1000, coz,
        k0: S.camera.position.clone(), k1: konum ? new THREE.Vector3(...konum) : S.camera.position.clone(),
        h0: S.kontrol.target.clone(), h1: hedef ? new THREE.Vector3(...hedef) : S.kontrol.target.clone(),
      };
    });
  };
  S.herKare(() => {
    if (!ucus) return;
    const u = Math.min(1, (performance.now() - ucus.t0) / ucus.sure), k = yumusak(u);
    S.camera.position.lerpVectors(ucus.k0, ucus.k1, k);
    S.kontrol.target.lerpVectors(ucus.h0, ucus.h1, k);
    if (u >= 1) { const c = ucus.coz; ucus = null; c(); }
  });

  S.yerEkle = (ad, y) => {
    y.ad = ad;
    y.grup.visible = false;
    y.kareler = new Set();
    S.scene.add(y.grup);
    yerler.set(ad, y);
    return y;
  };
  S.yer = (ad) => yerler.get(ad);
  S.simdikiYer = () => simdiki?.ad;

  /** Yere ve bakış noktasına git. İlk çağrıda kamera anında konur. */
  /** Görünür alan dar ise (telefon, paneller açık) kamerayı hedeften uzaklaştır: bakışlar ~1,15 en-boy için ayarlı */
  function uyarla(b) {
    const st = getComputedStyle(kap), px = (n) => parseFloat(st.getPropertyValue(n)) || 0;
    const w = kap.clientWidth - px("--sol-bosluk") - px("--sag-bosluk"), h = kap.clientHeight - px("--ust-bosluk") - px("--alt-bosluk");
    const oran = w > 0 && h > 0 ? w / h : 1.15, k = oran < 1.15 ? (1.15 / oran) ** 0.85 : 1;
    if (k === 1) return b;
    const [hx, hy, hz] = b.hedef;
    return { ...b, konum: b.konum.map((v, i) => [hx, hy, hz][i] + (v - [hx, hy, hz][i]) * k), max: (b.max ?? 60) * k };
  }
  S.git = (ad, bakis = "ana", { sure = 1.8 } = {}) => {
    const y = yerler.get(ad);
    const b = uyarla((typeof bakis === "string" ? y.bakislar[bakis] : bakis) || y.bakislar.ana);
    const benim = ++no, eski = simdiki;
    simdiki = y;
    y.grup.visible = true;
    S.kontrol.autoRotate = false;
    const sinir = () => { S.kontrol.minDistance = b.min ?? 2; S.kontrol.maxDistance = b.max ?? 60; };
    if (!eski) { ortamUygula(y); sinir(); ucus?.coz(); ucus = null; S.kameraKoy(b); return Promise.resolve(); }
    S.kontrol.minDistance = 0.1; S.kontrol.maxDistance = 5000;
    const ayni = eski === y;
    if (!ayni) setTimeout(() => { if (benim === no) ortamUygula(y); }, sure * 450);
    return S.uc({ ...b, sure: ayni ? sure * 0.7 : sure }).then(() => {
      if (benim !== no) return;
      sinir();
      for (const [, d] of yerler) if (d !== y) d.grup.visible = false;
    });
  };

  // Yalnızca görünen yerlerin canlandırmaları çalışır
  S.herKare((dt) => { for (const [, y] of yerler) if (y.grup.visible) for (const f of y.kareler) f(dt); });
  /** Yer sürekli canlandırması (sahne kurulurken eklenir) */
  S.yerKare = (ad, fn) => yerler.get(ad).kareler.add(fn);
  /** Adıma özgü kare fonksiyonu: adım değişince kaldırılır */
  S.adimKare = (ctx, fn) => ctx.temizlik(S.herKare(fn));
  /** Adıma özgü iğne: adım değişince kaldırılır */
  S.adimIgne = (ctx, hedef, html, ayar) => { const n = S.igne(hedef, html, ayar); ctx.temizlik(() => n.kaldir()); return n; };
  /** Yavaş otomatik dönüş (değerlendirme adımı gibi bekleme anları) */
  S.dondur = (ctx, hiz = 0.4) => { S.kontrol.autoRotate = true; S.kontrol.autoRotateSpeed = hiz; ctx.temizlik(() => (S.kontrol.autoRotate = false)); };
  return S;
}

/* ---------------- Dokular ---------------- */
const DOKU = {
  ahsap: { taban: "#946a45", koyu: "#7a5434", acik: "#ad835a", olcek: 4, uzama: [0.2, 3], lif: 0.35, lifSiklik: 22, benek: 0.06 },
  mermer: { taban: "#e9e5dc", koyu: "#c9c1b2", acik: "#faf8f3", olcek: 3, benek: 0.04, lif: 0.25, lifSiklik: 6 },
  bazalt: { taban: "#3b3a37", koyu: "#1d1c1a", acik: "#5a5650", olcek: 9, benek: 0.35 },
  sulfur: { taban: "#3a2f28", koyu: "#120e0b", acik: "#8a5a2e", olcek: 7, benek: 0.4 },
  et: { taban: "#d98b8b", koyu: "#b45f62", acik: "#f0b0aa", olcek: 8, benek: 0.25 },
  mukoza: { taban: "#e59a95", koyu: "#c06a6c", acik: "#f6c2b8", olcek: 12, benek: 0.3 },
  ekmekIci: { taban: "#ead6ae", koyu: "#c9ae7e", acik: "#f7ead0", olcek: 14, benek: 0.55 },
  kabuk: { taban: "#b5773a", koyu: "#7d4a1e", acik: "#d39a58", olcek: 6, benek: 0.25 },
  seramik: { taban: "#f4f1ea", koyu: "#dcd6ca", acik: "#ffffff", olcek: 3, benek: 0.03 },
  kas: { taban: "#b8454a", koyu: "#7d2228", acik: "#d9706e", olcek: 5, uzama: [6, 0.2], lif: 0.5, lifSiklik: 40, benek: 0.05 },
  sitoplazma: { taban: "#2c4660", koyu: "#1b2c40", acik: "#3f6283", olcek: 6, benek: 0.25 },
  kemik: { taban: "#efe8d6", koyu: "#d2c6a8", acik: "#fffaf0", olcek: 6, benek: 0.08 },
};
const onbellek = new Map();
export function doku(ad, ek = {}) {
  const k = `${ad}:${JSON.stringify(ek)}`;
  if (!onbellek.has(k)) onbellek.set(k, yuzeyDokusu({ boyut: 256, tohum: 3, ...DOKU[ad], ...ek }));
  return onbellek.get(k);
}
/** Dokulu doğal yüzey */
export function dokuluMalzeme(ad, { tekrar = [1, 1], puruz = 0.85, kabarti = 1, renk = 0xffffff, fizik = null, ...ek } = {}) {
  const d = doku(ad, ek);
  const h = d.renk.clone(), p = d.puruz.clone();
  for (const t of [h, p]) { t.repeat.set(...tekrar); t.needsUpdate = true; }
  const o = { color: renk, map: h, roughnessMap: p, bumpMap: p, bumpScale: kabarti, roughness: puruz, metalness: 0 };
  return fizik ? new THREE.MeshPhysicalMaterial({ ...o, ...fizik }) : new THREE.MeshStandardMaterial(o);
}

/* ---------------- Biçimler ---------------- */
/** Noktalardan yumuşak boru (dal, hif, damar, bağırsak) */
export function borudanGeo(noktalar, r = 0.05, { bolum = 0, cevre = 8, kapali = false } = {}) {
  const egri = new THREE.CatmullRomCurve3(noktalar.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p))), kapali);
  return new THREE.TubeGeometry(egri, bolum || Math.max(8, noktalar.length * 6), r, cevre, kapali);
}
/** Profil noktalarından dönel kap (şişe, kase, kavanoz) */
export function donel(profil, bolum = 48) {
  return new THREE.LatheGeometry(profil.map(([a, b]) => new THREE.Vector2(a, b)), bolum);
}
/** Ahşap masa üstü (gölge alır) */
export function masa(grup, { gen = 30, der = 16, kalinlik = 0.6, y = 0, ad = "ahsap", tekrar = [4, 2] } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(gen, kalinlik, der), dokuluMalzeme(ad, { tekrar, puruz: 0.7, kabarti: 0.15 }));
  m.position.y = y - kalinlik / 2; m.receiveShadow = true;
  grup.add(m);
  return m;
}
/** Küçük molekül: renkli kürelerden birleşik geometri (köşe renkli). atomlar: [[x,y,z,r,renk],...] */
export function molekulGeo(atomlar, ayrinti = 12) {
  const parca = atomlar.map(([x, y, z, r, renk]) => {
    const g = new THREE.SphereGeometry(r, ayrinti, Math.round(ayrinti * 0.75));
    g.translate(x, y, z);
    const c = new THREE.Color(renk), n = g.attributes.position.count, rk = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { rk[i * 3] = c.r; rk[i * 3 + 1] = c.g; rk[i * 3 + 2] = c.b; }
    g.setAttribute("color", new THREE.BufferAttribute(rk, 3));
    return g;
  });
  return mergeGeometries(parca);
}
export const molekulMalz = () => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 });
/** Çoklu örneğe konum + yön (dördey ya da Euler) + ölçek ver */
const kukla = new THREE.Object3D();
export function koy(m, i, x, y, z, { q = null, rx = 0, ry = 0, rz = 0, s = 1 } = {}) {
  kukla.position.set(x, y, z);
  if (q) kukla.quaternion.copy(q); else kukla.rotation.set(rx, ry, rz);
  if (Array.isArray(s)) kukla.scale.set(...s); else kukla.scale.setScalar(s);
  kukla.updateMatrix();
  m.setMatrixAt(i, kukla.matrix);
}
export const YUKARI = new THREE.Vector3(0, 1, 0);
/** Yukarı ekseni verilen yöne çeviren dördey */
export const yoneDondur = (() => { const v = new THREE.Vector3(); return (yon, q = new THREE.Quaternion()) => q.setFromUnitVectors(YUKARI, v.copy(yon).normalize()); })();
/** Görünmez yer tutucu (iğneler için) */
export function nokta(grup, x, y, z) { const o = new THREE.Object3D(); o.position.set(x, y, z); grup.add(o); return o; }
/** Işık huzmesi (denizaltı, mikroskop): toplamalı yarı saydam koni */
export function huzme(uzunluk, yaricap, renk = 0xcfe8ff, opaklik = 0.07) {
  const g = new THREE.ConeGeometry(yaricap, uzunluk, 32, 1, true);
  g.translate(0, -uzunluk / 2, 0);
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: renk, transparent: true, opacity: opaklik, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
}

/* ---------------- Yüzen 2B panel (grafik, şema, formül) ---------------- */
/**
 * Sahnenin üstünde küçük cam panel içinde tuval: doğası gereği düzlem olan şemalar için.
 * konum: "ust" | "alt" | "sol-ust" | "sag-ust"
 */
export function yuzenTuval(ctx, { gen = 520, yuk = 260, ciz, konum = "ust", genislik = "min(560px, 92%)" }) {
  const cv = el("canvas", { class: "bio-yuzen-tuval", style: `aspect-ratio:${gen}/${yuk}` });
  const kart = el("div", { class: `bio-yuzen bio-yuzen-${konum}`, style: `width:${genislik}` }, cv);
  ctx.katman.append(kart);
  const c = cv.getContext("2d");
  let aktif = true, id = 0, son = performance.now(), t = 0;
  function kare(simdi) {
    if (!aktif) return;
    const dt = Math.min(0.1, Math.max(0, (simdi - son) / 1000)); son = simdi; t += dt;
    const dpr = Math.min(window.devicePixelRatio || 1, 2), W = cv.clientWidth, H = cv.clientHeight;
    if (W && H) {
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      c.setTransform(dpr * (W / gen), 0, 0, dpr * (H / yuk), 0, 0);
      c.clearRect(0, 0, gen, yuk);
      try { ciz(c, dt, t); } catch (e) { console.error(e); aktif = false; }
    }
    id = requestAnimationFrame(kare);
  }
  id = requestAnimationFrame(kare);
  ctx.temizlik(() => { aktif = false; cancelAnimationFrame(id); kart.remove(); });
  return { kart, cv, c };
}
