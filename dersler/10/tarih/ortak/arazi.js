// Kabartmalı 3B arazi ve küre: ülke verisinden (Natural Earth / world-atlas) kara-deniz maskesi,
// rolyef.js'teki temsilî dağ, plato, akarsu ve göllerden yükseklik alanı ve renk dokusu üretir.
// Yükseklikler ölçülmüş veri değildir; biçim tanınsın diye yaklaşık verilmiştir.
import { THREE, fbm, gurultu3, kalite } from "../../../../engine/sahne3d.js";
import { geoEquirectangular, geoPath } from "d3-geo";
import { DAGLAR, DORUKLAR, PLATOLAR, AKARSULAR, GOLLER } from "./rolyef.js";

const D = Math.PI / 180;
const sat = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ad = (a, b, x) => { const t = sat((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const KM = 111.2;

/* ---------------- Yükseklik modeli (m) ---------------- */
function hazirla(liste) {
  return liste.map((r) => {
    const l = r.yol.map((p) => p[0]), b = r.yol.map((p) => p[1]);
    const pay = (r.w * 3.2) / KM;
    return { ...r, kutu: [Math.min(...l) - pay / 0.6, Math.min(...b) - pay, Math.max(...l) + pay / 0.6, Math.max(...b) + pay] };
  });
}
const SIRALAR = hazirla(DAGLAR);
/** Noktanın kırık çizgiye uzaklığı (km, yerel düzlem yaklaşımı) */
function uzaklikKm(l, b, yol) {
  const c = Math.cos(b * D);
  let en = Infinity;
  for (let i = 0; i < yol.length - 1; i++) {
    const ax = yol[i][0] * c, ay = yol[i][1], bx = yol[i + 1][0] * c, by = yol[i + 1][1];
    const px = l * c, py = b;
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    const t = L ? sat(((px - ax) * dx + (py - ay) * dy) / L) : 0;
    const qx = ax + t * dx - px, qy = ay + t * dy - py;
    en = Math.min(en, qx * qx + qy * qy);
  }
  return Math.sqrt(en) * KM;
}

/**
 * Kara üzerindeki bir noktanın temsilî yüksekliği.
 * dk: kıyıya uzaklık (km), ince: ayrıntı gürültüsünün periyotları (derece)
 */
export function yukseklik(l, b, dk, ince) {
  let e = 40 + 380 * ad(0, 320, dk);
  let p = 0;
  for (const q of PLATOLAR) {
    const r = Math.hypot((l - q.merkez[0]) / q.r[0], (b - q.merkez[1]) / q.r[1]);
    if (r < 1.25) p = Math.max(p, q.h * (1 - ad(0.5, 1.2, r)));
  }
  e = Math.max(e, p + 120 * ad(0, 200, dk));
  // sırtlar: hedef yüksekliğe doğru harmanla, gürültüyle tepe-boğaz dizisi oluştur
  const sirt = 1 - Math.abs(fbm(l * 1.3, b * 1.3, 0.7, { oktav: 3, tohum: 11 })) * 1.5;
  for (const s of SIRALAR) {
    if (l < s.kutu[0] || l > s.kutu[2] || b < s.kutu[1] || b > s.kutu[3]) continue;
    const u = uzaklikKm(l, b, s.yol);
    const f = Math.exp(-((u / s.w) ** 2));
    if (f < 0.01) continue;
    const H = s.h * (0.5 + 0.6 * sat(sirt));
    if (H > e) e += (H - e) * f;
  }
  for (const t of DORUKLAR) {
    const u = Math.hypot((l - t.konum[0]) * Math.cos(b * D), b - t.konum[1]) * KM;
    if (u > t.w * 3) continue;
    const f = Math.exp(-((u / t.w) ** 1.6));
    if (t.h > e) e += (t.h - e) * f;
  }
  // ayrıntı: periyodu hücreden büyük olan oktavlar
  let n = 0;
  for (const P of ince) n += 300 * (P / 1.2) ** 0.55 * gurultu3(l / P, b / P, 0.31, 7 + Math.round(P * 1000) % 13);
  e += n * (0.45 + Math.min(1.2, e / 1500));
  e *= ad(0, 10, dk);
  return Math.max(2, e);
}

/** Bitki örtüsü/nem göstergesi 0 (çöl) – 1 (orman), temsilî */
function nem(l, b, dk, e) {
  let n = 0.38 + 0.3 * (1 - ad(0, 260, dk));
  // bölgesel farklar dikdörtgen ek yeri bırakmasın: sınırlar yumuşak geçişli
  n += 0.4 * (1 - ad(0, 70, dk)) * ad(28.6, 30.2, l) * (1 - ad(42, 43.2, l)) * ad(39.9, 40.7, b) * (1 - ad(42, 42.6, b)); // Karadeniz kıyısı
  n += 0.35 * (1 - ad(0, 60, dk)) * ad(48.5, 49.5, l) * (1 - ad(54, 55, l)) * ad(35.8, 36.6, b) * (1 - ad(38, 38.8, b)); // Hazar kıyısı (Gilan, Mazenderan)
  n += 0.15 * (1 - ad(28.6, 30.2, l)) * ad(40, 41, b); // Balkanlar
  n -= 0.55 * ad(34, 27, b); // güneyde kuraklık
  const elips = (cx, cy, rx, ry) => Math.max(0, 1 - Math.hypot((l - cx) / rx, (b - cy) / ry));
  n -= 0.9 * elips(61, 40.5, 6.5, 3.8); // Karakum, Kızılkum
  n -= 0.7 * elips(56, 33, 6, 3.5); // İran iç çölleri
  n -= 0.9 * elips(82, 39.5, 7, 2.4); // Taklamakan
  n -= 0.4 * elips(33.6, 38.8, 3.6, 1.6); // İç Anadolu bozkırı (Tuz Gölü çevresi)
  n -= 0.3 * elips(40.5, 36.2, 4, 1.8); // Cezire
  n -= 0.25 * ad(43, 47, b) * ad(47, 55, l); // Kazak bozkırı
  n += 0.25 * ad(1000, 2000, e) * (1 - ad(2400, 3200, e)); // dağ ormanları
  n += 0.12 * fbm(l * 0.8, b * 0.8, 2.1, { oktav: 3, tohum: 4 });
  return sat(n);
}

const renk = (h) => new THREE.Color(h);
const P = {
  col: renk("#cdb991"), cl2: renk("#b6a47f"), bozkir: renk("#a49a6c"), zeytin: renk("#78804f"), yesil: renk("#57703f"), orman: renk("#405c36"),
  kaya: renk("#8a7a66"), yuksek: renk("#a9a196"), kar: renk("#eef2f5"),
  sig: renk("#3b7f96"), orta: renk("#1f587a"), derin: renk("#123c5c"), gol: renk("#2f7795"), tuz: renk("#d5dfdf"),
};
const gecici = new THREE.Color();
function karaRengi(e, n, b, hedef) {
  // nem → bitki örtüsü
  const c = hedef;
  if (n < 0.2) c.copy(P.col).lerp(P.cl2, n / 0.2);
  else if (n < 0.42) c.copy(P.cl2).lerp(P.bozkir, (n - 0.2) / 0.22);
  else if (n < 0.6) c.copy(P.bozkir).lerp(P.zeytin, (n - 0.42) / 0.18);
  else if (n < 0.78) c.copy(P.zeytin).lerp(P.yesil, (n - 0.6) / 0.18);
  else c.copy(P.yesil).lerp(P.orman, (n - 0.78) / 0.22);
  // yükselti: kaya, yüksek dağ, kar (kar sınırı kuzeyde alçalır)
  // nemli yamaçlarda orman daha yükseğe çıkar (Karadeniz), kurak dağlarda kaya erken başlar
  const ns = 900 * Math.max(0, n - 0.5);
  c.lerp(P.kaya, 0.75 * ad(1500 + ns, 2600 + ns, e));
  c.lerp(P.yuksek, 0.8 * ad(2600 + ns * 0.5, 3500 + ns * 0.5, e));
  const karSiniri = 4700 - (b - 30) * 45;
  c.lerp(P.kar, 0.85 * ad(karSiniri - 200, karSiniri + 600, e));
  return c;
}
function rastgeleSayi(t) { let x = t * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); }
/**
 * Kaba noktaları Catmull-Rom eğrisiyle yumuşatır; akarsulara küçük kıvrımlar (menderes) ekler.
 * kapali: halka (göl kıyısı) · tohum: kıvrımların deseni
 */
function yumusat(nk, kapali = false, tohum = 0) {
  const n = nk.length, out = [];
  const al = (i) => (kapali ? nk[(i + n) % n] : nk[Math.max(0, Math.min(n - 1, i))]);
  const son = kapali ? n : n - 1;
  for (let i = 0; i < son; i++) {
    const p0 = al(i - 1), p1 = al(i), p2 = al(i + 1), p3 = al(i + 2);
    const L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const adim = Math.max(4, Math.min(24, Math.round(L * 30)));
    const nx = -(p2[1] - p1[1]) / (L || 1), ny = (p2[0] - p1[0]) / (L || 1);
    for (let k = 0; k < adim; k++) {
      const t = k / adim, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      let x = f(p0[0], p1[0], p2[0], p3[0]), y = f(p0[1], p1[1], p2[1], p3[1]);
      if (!kapali) { const m = Math.sin((i + t) * 7.3 + tohum) * 0.6 + Math.sin((i + t) * 17.9 + tohum * 2) * 0.4; const gm = Math.min(0.035, L * 0.04) * Math.sin(Math.PI * t) ** 0.3; x += nx * m * gm; y += ny * m * gm; }
      out.push([x, y]);
    }
  }
  out.push(kapali ? out[0] : nk[n - 1]);
  return out;
}
function denizRengi(dd, hedef) {
  if (dd < 25) return hedef.copy(P.sig).lerp(P.orta, dd / 25);
  return hedef.copy(P.orta).lerp(P.derin, ad(25, 220, dd));
}

/* ---------------- Maske ve uzaklık ---------------- */
function tuval(w, h) { const t = document.createElement("canvas"); t.width = w; t.height = h; return t; }
function projeksiyon([L0, B0, L1, B1], w, h) {
  const s = w / ((L1 - L0) * D);
  return geoEquirectangular().scale(s).translate([-L0 * D * s, B1 * D * s]).precision(0.2);
}
/** Özellikleri kümelerine (kırpma kutusuna) göre sırayla çizer: önce kutu temizlenir, sonra kara doldurulur */
function karaCiz(c, proj, katmanlar, w, h) {
  const yol = geoPath(proj, c);
  c.fillStyle = "#fff";
  for (const k of katmanlar) {
    if (k.kirpma) {
      const [x0, y1] = proj([k.kirpma[0], k.kirpma[1]]), [x1, y0] = proj([k.kirpma[2], k.kirpma[3]]);
      c.clearRect(x0, y0, x1 - x0, y1 - y0);
    }
    c.beginPath();
    for (const f of k.ozellikler) yol(f);
    c.fill();
  }
  void w; void h;
}
/** Kara/deniz ızgarasında en yakın karşı hücreye uzaklık (km), iki geçişli yaklaşık uzaklık dönüşümü */
function uzaklikDonusumu(maske, NX, NY, dx, dy, kara) {
  const INF = 1e9, d = new Float32Array(NX * NY);
  for (let i = 0; i < d.length; i++) d[i] = (maske[i] > 0) === kara ? INF : 0;
  const dd = Math.hypot(dx, dy);
  const bak = (i, j, v) => (i >= 0 && j >= 0 && i < NX && j < NY ? d[j * NX + i] + v : INF);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const k = j * NX + i; if (!d[k]) continue;
    d[k] = Math.min(d[k], bak(i - 1, j, dx), bak(i, j - 1, dy), bak(i - 1, j - 1, dd), bak(i + 1, j - 1, dd));
  }
  for (let j = NY - 1; j >= 0; j--) for (let i = NX - 1; i >= 0; i--) {
    const k = j * NX + i; if (!d[k]) continue;
    d[k] = Math.min(d[k], bak(i + 1, j, dx), bak(i, j + 1, dy), bak(i + 1, j + 1, dd), bak(i - 1, j + 1, dd));
  }
  for (let i = 0; i < d.length; i++) if (d[i] >= INF) d[i] = 2000;
  return d;
}
function icinde([x, y], halka) {
  let ic = false;
  for (let i = 0, j = halka.length - 1; i < halka.length; j = i++) {
    const [xi, yi] = halka[i], [xj, yj] = halka[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ic = !ic;
  }
  return ic;
}

/** d3 küresel çokgen için dış halkayı doğru yöne çevirip kapatır */
export function saatYonu(halka) {
  let t = 0;
  for (let i = 0; i < halka.length; i++) { const [x1, y1] = halka[i], [x2, y2] = halka[(i + 1) % halka.length]; t += (x2 - x1) * (y2 + y1); }
  const h = t < 0 ? halka.slice().reverse() : halka.slice();
  h.push(h[0]);
  return h;
}

/** Tekrarlanan ince doku gürültüsü (piksel başına pahalı fbm yerine) */
let INCE = null;
function inceDoku() {
  if (INCE) return INCE;
  const N = 256, a = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = i / N, v = j / N, s = 24;
    const g = (x, y) => fbm(x, y, 0.5, { oktav: 4, tohum: 21 });
    a[j * N + i] = (g(u * s, v * s) * (1 - u) + g((u - 1) * s, v * s) * u) * (1 - v) + (g(u * s, (v - 1) * s) * (1 - u) + g((u - 1) * s, (v - 1) * s) * u) * v;
  }
  INCE = { N, a };
  return INCE;
}

/**
 * Arazi verisi üretir (geometri bağımsız): yükseklik ızgarası + renk/pürüz dokusu.
 * sinirlar: [L0, B0, L1, B1] · katmanlar: [{ ozellikler, kirpma, siniflar: string[] }]
 */
export function araziUret(sinirlar, katmanlar, { kabartma = true, akarsu = true, dokuGen } = {}) {
  const [L0, B0, L1, B1] = sinirlar;
  const dw = L1 - L0, dh = B1 - B0;
  const NX = kalite === "dusuk" ? 170 : 256;
  const NY = Math.max(48, Math.min(256, Math.round((NX * dh) / dw)));
  const TW0 = dokuGen || (kalite === "dusuk" ? 1024 : kalite === "yuksek" ? 2560 : 2048);
  let TW = TW0, TH = Math.round((TW * dh) / dw);
  if (TH > TW0) { TH = TW0; TW = Math.round((TH * dw) / dh); }

  // kara maskesi (ızgara ve doku çözünürlüğünde)
  const izg = tuval(NX, NY), cg = izg.getContext("2d");
  karaCiz(cg, projeksiyon(sinirlar, NX, NY), katmanlar, NX, NY);
  const gm = cg.getImageData(0, 0, NX, NY).data;
  const maske = new Uint8Array(NX * NY);
  for (let i = 0; i < maske.length; i++) maske[i] = gm[i * 4 + 3] > 110 ? 1 : 0;
  const latOrta = (B0 + B1) / 2;
  const hx = (dw / (NX - 1)) * KM * Math.cos(latOrta * D), hy = (dh / (NY - 1)) * KM;
  const dKara = uzaklikDonusumu(maske, NX, NY, hx, hy, true);
  const dDeniz = uzaklikDonusumu(maske, NX, NY, hx, hy, false);

  // yükseklik
  const hucre = Math.max(dw / NX, dh / NY);
  const ince = [1.2, 0.45, 0.16, 0.06, 0.022].filter((p) => p > hucre * 2.2);
  const e = new Float32Array(NX * NY);
  const lon = (i) => L0 + (i / (NX - 1)) * dw, lat = (j) => B1 - (j / (NY - 1)) * dh;
  const golMaske = new Int8Array(NX * NY).fill(-1);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const k = j * NX + i;
    e[k] = maske[k] && kabartma ? yukseklik(lon(i), lat(j), dKara[k], ince) : maske[k] ? 2 : 0;
  }
  GOLLER.forEach((g, gi) => {
    const ls = g.halka.map((p) => p[0]), bs = g.halka.map((p) => p[1]);
    if (Math.max(...ls) < L0 || Math.min(...ls) > L1 || Math.max(...bs) < B0 || Math.min(...bs) > B1) return;
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const k = j * NX + i;
      if (maske[k] && icinde([lon(i), lat(j)], g.halka)) { golMaske[k] = gi; if (kabartma) e[k] = g.duzey; }
    }
  });

  // ızgarayı hafifçe yumuşat: tek köşeli sivri tepeler oluşmasın
  if (kabartma) {
    const y = e.slice();
    for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
      const k = j * NX + i;
      if (!maske[k] || golMaske[k] >= 0) continue;
      y[k] = (4 * e[k] + 2 * (e[k - 1] + e[k + 1] + e[k - NX] + e[k + NX]) + e[k - NX - 1] + e[k - NX + 1] + e[k + NX - 1] + e[k + NX + 1]) / 16;
    }
    e.set(y);
  }
  // ızgara renkleri
  const karaR = new Float32Array(NX * NY * 3), denizR = new Float32Array(NX * NY * 3);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const k = j * NX + i;
    const yk = kabartma ? e[k] : 0;
    const c = karaRengi(maske[k] ? yk : 20, nem(lon(i), lat(j), dKara[k], yk), lat(j), gecici);
    karaR[k * 3] = c.r; karaR[k * 3 + 1] = c.g; karaR[k * 3 + 2] = c.b;
    const s = denizRengi(dDeniz[k], gecici);
    denizR[k * 3] = s.r; denizR[k * 3 + 1] = s.g; denizR[k * 3 + 2] = s.b;
  }

  // doku: kara maskesi + vurgu/işaret maskeleri
  const dokuT = tuval(TW, TH), c = dokuT.getContext("2d");
  const proj = projeksiyon(sinirlar, TW, TH);
  karaCiz(c, proj, katmanlar, TW, TH);
  const km = c.getImageData(0, 0, TW, TH).data;
  const vurguVar = katmanlar.some((k) => k.siniflar.some((s) => /\bvurgu\b/.test(s)));
  const ozelMaske = (filtre) => {
    const t = tuval(TW, TH), cc = t.getContext("2d"), yol = geoPath(proj, cc);
    cc.fillStyle = "#fff"; cc.beginPath();
    let var_ = false;
    for (const k of katmanlar) k.ozellikler.forEach((f, i) => { if (filtre(k.siniflar[i] || "")) { yol(f); var_ = true; } });
    if (!var_) return null;
    cc.fill();
    return cc.getImageData(0, 0, TW, TH).data;
  };
  const vm = vurguVar ? ozelMaske((s) => /\bvurgu\b/.test(s)) : null;
  const im = ozelMaske((s) => /\bisaretli\b/.test(s));
  const img = c.createImageData(TW, TH), px = img.data;
  const pz = new Uint8ClampedArray(TW * TH * 4), kb = new Uint8ClampedArray(TW * TH * 4);
  const yOrnek = (gx, gy) => {
    const i0 = Math.floor(gx), j0 = Math.floor(gy), i1 = Math.min(NX - 1, i0 + 1), j1 = Math.min(NY - 1, j0 + 1);
    const fx = gx - i0, fy = gy - j0;
    return (e[j0 * NX + i0] * (1 - fx) + e[j0 * NX + i1] * fx) * (1 - fy) + (e[j1 * NX + i0] * (1 - fx) + e[j1 * NX + i1] * fx) * fy;
  };
  const { N, a: gurultu } = inceDoku();
  const isaretR = renk("#e3a34a");
  const ornekle = (dizi, gx, gy, kanal) => {
    const i0 = Math.floor(gx), j0 = Math.floor(gy), i1 = Math.min(NX - 1, i0 + 1), j1 = Math.min(NY - 1, j0 + 1);
    const fx = gx - i0, fy = gy - j0;
    const at = (i, j) => dizi[(j * NX + i) * 3 + kanal];
    return (at(i0, j0) * (1 - fx) + at(i1, j0) * fx) * (1 - fy) + (at(i0, j1) * (1 - fx) + at(i1, j1) * fx) * fy;
  };
  // tarla parselleri yalnız yakın ölçekte (bir parsel birkaç km olacak kadar ayrıntılı dokuda) görünür
  const tarlaG = ad(90, 200, TW / dw);
  for (let y = 0; y < TH; y++) {
    const gy = (y / (TH - 1)) * (NY - 1);
    for (let x = 0; x < TW; x++) {
      const gx = (x / (TW - 1)) * (NX - 1);
      const k = y * TW + x, k4 = k * 4;
      const kara = km[k4 + 3] > 127;
      const dizi = kara ? karaR : denizR;
      let r = ornekle(dizi, gx, gy, 0), g = ornekle(dizi, gx, gy, 1), b = ornekle(dizi, gx, gy, 2);
      const gn = gurultu[(y % N) * N + (x % N)] * 0.6 + gurultu[((y >> 2) % N) * N + ((x >> 2) % N)] * 0.5 + gurultu[((y >> 4) % N) * N + ((x >> 4) % N)] * 0.4;
      const yk = kara && kabartma ? yOrnek(gx, gy) : 0;
      if (kara) {
        const m = 1 + gn * 0.3;
        r *= m; g *= m; b *= m;
        // ova ve yaylalarda tarla dokusu: düzensiz kenarlı küçük parseller
        const tarla = tarlaG * (1 - ad(1100, 1700, yk));
        if (tarla > 0) {
          const hx = Math.floor((x + gn * 10) / 13), hy = Math.floor((y + gn * 10) / 11);
          const h1 = (Math.imul(hx, 73856093) ^ Math.imul(hy, 19349663)) >>> 0, h2 = (Math.imul(hx, 83492791) ^ Math.imul(hy, 2654435761)) >>> 0;
          const a1 = ((h1 % 1000) / 1000 - 0.5) * 0.1 * tarla, a2 = ((h2 % 1000) / 1000 - 0.5) * 0.08 * tarla;
          r *= 1 + a1; g *= 1 + a1 + a2; b *= 1 + a1 - a2 * 0.5;
        }
        if (vm && vm[k4 + 3] < 128) { const o = (r + g + b) / 3; r = (r * 0.5 + o * 0.5) * 0.78; g = (g * 0.5 + o * 0.5) * 0.78; b = (b * 0.5 + o * 0.5) * 0.8; }
        if (im && im[k4 + 3] > 127) { r = r * 0.45 + isaretR.r * 0.55; g = g * 0.45 + isaretR.g * 0.55; b = b * 0.45 + isaretR.b * 0.55; }
      } else {
        const m = 1 + gn * 0.06;
        r *= m; g *= m; b *= m;
      }
      px[k4] = Math.min(255, r * 255); px[k4 + 1] = Math.min(255, g * 255); px[k4 + 2] = Math.min(255, b * 255); px[k4 + 3] = 255;
      const p = kara ? 238 : 225; // deniz: alçak bakış açısında gökyüzü yansıması denizi griye boğmasın
      pz[k4] = pz[k4 + 1] = pz[k4 + 2] = p; pz[k4 + 3] = 255;
      const kv = kara ? 40 + Math.min(150, yk / 30) + gn * (18 + Math.min(40, yk / 60)) : 30;
      kb[k4] = kb[k4 + 1] = kb[k4 + 2] = kv; kb[k4 + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
  const pzT = tuval(TW, TH), cp = pzT.getContext("2d");
  const kbT = tuval(TW, TH);
  kbT.getContext("2d").putImageData(new ImageData(kb, TW, TH), 0, 0);
  cp.putImageData(new ImageData(pz, TW, TH), 0, 0);

  // göller ve akarsular
  const pxDerece = TW / dw;
  const yol = geoPath(proj, c), yolP = geoPath(proj, cp);
  for (const g of GOLLER) {
    const f = { type: "Polygon", coordinates: [saatYonu(yumusat(g.halka, true))] };
    if (g.tuzlu) {
      // tuz gölü: kıyıda yumuşak geçişli tuzla düzlüğü, ortada sığ, açık turkuaz su (bulanıklaştırma filtresi yavaş: katmanlı çizgiler)
      const w = Math.max(2, pxDerece * 0.1);
      for (let k = 4; k >= 1; k--) { c.strokeStyle = `rgba(226,222,206,${0.22 * (5 - k) / 4})`; c.lineWidth = (w * k) / 2; c.beginPath(); yol(f); c.stroke(); }
      c.save(); c.beginPath(); yol(f); c.clip();
      c.fillStyle = `#${P.tuz.getHexString()}`; c.fill();
      const r = rastgeleSayi(11);
      for (let i = 0; i < 26; i++) {
        const q = g.halka[i % g.halka.length], [x, y] = proj([q[0] * 0.6 + 33.45 * 0.4 + (r() - 0.5) * 0.2, q[1] * 0.6 + 38.75 * 0.4 + (r() - 0.5) * 0.2]);
        const R = pxDerece * (0.06 + r() * 0.08);
        const gr = c.createRadialGradient(x, y, 0, x, y, R);
        gr.addColorStop(0, i % 3 ? "rgba(170,210,212,.5)" : "rgba(240,224,228,.55)"); gr.addColorStop(1, "rgba(200,220,220,0)");
        c.fillStyle = gr; c.fillRect(x - R, y - R, 2 * R, 2 * R);
      }
      c.restore();
    } else {
      const w = Math.max(1.5, pxDerece * 0.03);
      for (let k = 3; k >= 1; k--) { c.strokeStyle = `rgba(70,140,170,${0.3 * (4 - k) / 3})`; c.lineWidth = w * k; c.beginPath(); yol(f); c.stroke(); }
      c.fillStyle = `#${P.gol.getHexString()}`;
      c.beginPath(); yol(f); c.fill();
    }
    cp.fillStyle = g.tuzlu ? "#8a8a8a" : "#3a3a3a"; cp.beginPath(); yolP(f); cp.fill();
  }
  if (akarsu) {
    c.lineCap = c.lineJoin = "round";
    for (const r of AKARSULAR) {
      const yatak = { type: "LineString", coordinates: yumusat(r.yol, false, r.ad.length) };
      const w = Math.max(0.9, Math.min(r.genis ? 3.4 : 2.4, pxDerece * (r.genis ? 0.016 : 0.01)));
      // kıyı boyunca hafif yeşil şerit (vadi tabanı), üstünde su
      c.strokeStyle = "rgba(78,104,58,.35)"; c.lineWidth = w * 3.2;
      c.beginPath(); yol(yatak); c.stroke();
      c.strokeStyle = "rgba(44,104,146,.95)"; c.lineWidth = w;
      c.beginPath(); yol(yatak); c.stroke();
    }
  }

  // sınırlar: iki yanı da kara olan kenarlar (kıyılar çizgisiz kalır)
  const karaMi = (x, y) => { const xi = Math.round(x), yi = Math.round(y); return xi >= 0 && yi >= 0 && xi < TW && yi < TH && km[(yi * TW + xi) * 4 + 3] > 127; };
  katmanlar.forEach((kat, ki) => {
    c.save();
    const sonraki = katmanlar.slice(ki + 1).filter((k) => k.kirpma);
    if (sonraki.length) {
      c.beginPath(); c.rect(0, 0, TW, TH);
      for (const k of sonraki) {
        const [x0, y1] = proj([k.kirpma[0], k.kirpma[1]]), [x1, y0] = proj([k.kirpma[2], k.kirpma[3]]);
        c.rect(x1, y0, x0 - x1, y1 - y0);
      }
      c.clip("evenodd");
    }
    kat.ozellikler.forEach((f, i) => {
      const sinif = kat.siniflar[i] || "";
      if (/\bsinirsiz\b/.test(sinif) || !kat.sinirCiz) return;
      const vurgu = /\bvurgu\b/.test(sinif);
      c.strokeStyle = vurgu ? "rgba(250,244,205,.95)" : "rgba(236,232,218,.55)";
      c.lineWidth = vurgu ? Math.min(4, Math.max(1.6, pxDerece * 0.03)) : Math.min(2.4, Math.max(1, pxDerece * 0.014));
      c.setLineDash(vurgu ? [] : [Math.max(3, pxDerece * 0.08), Math.max(2, pxDerece * 0.04)]);
      const geom = f.properties?.kenar || { type: "MultiLineString", coordinates: (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates).flat() };
      c.beginPath();
      for (const cizgi of geom.coordinates) {
        let acik = false, onceki = null;
        for (const ll of cizgi) {
          const q = proj(ll);
          if (!q) { acik = false; continue; }
          if (onceki && Math.abs(ll[0] - onceki[0]) < 90) {
            const p = proj(onceki);
            const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
            // dar koy ve dalgakıranlarda kıyı "iki yanı kara" sanılmasın: iki uzaklıkta yokla
            const o = Math.max(2.5, Math.min(5, pxDerece * 0.003)), nx = (-(q[1] - p[1]) / L) * o, ny = ((q[0] - p[0]) / L) * o;
            if (karaMi(mx + nx, my + ny) && karaMi(mx - nx, my - ny) && karaMi(mx + 2 * nx, my + 2 * ny) && karaMi(mx - 2 * nx, my - 2 * ny)) {
              if (!acik) { c.moveTo(p[0], p[1]); acik = true; }
              c.lineTo(q[0], q[1]);
            } else acik = false;
          } else acik = false;
          onceki = ll;
        }
      }
      c.stroke();
    });
    c.restore();
  });
  const doku = new THREE.CanvasTexture(dokuT);
  doku.colorSpace = THREE.SRGBColorSpace;
  doku.anisotropy = 8;
  const puruz = new THREE.CanvasTexture(pzT);
  const kabartmaD = new THREE.CanvasTexture(kbT);
  return { sinirlar, NX, NY, e, maske, golMaske, dKara, doku, puruz, kabartma: kabartmaD, pxDerece };
}

/* ---------------- Düz arazi (bölge ve yerel ölçek) ---------------- */
/**
 * Arazi örgüsü. Dünya koordinatı: x doğuya, z güneye, y yukarı. Genişlik/yükseklikten büyüğü 200 birim.
 */
export function araziOrgusu(veri, { abarti } = {}) {
  const [L0, B0, L1, B1] = veri.sinirlar;
  const lonc = (L0 + L1) / 2, latc = (B0 + B1) / 2, cc = Math.cos(latc * D);
  const K = 200 / Math.max((L1 - L0) * cc, B1 - B0); // birim / enlem derecesi
  const W = (L1 - L0) * cc * K, H = (B1 - B0) * K;
  const genKm = (L1 - L0) * cc * KM;
  const E = abarti ?? Math.max(10, Math.min(24, 10 + genKm / 350));
  const hs = (K / KM / 1000) * E; // birim / metre
  const { NX, NY, e, maske } = veri;
  const geo = new THREE.PlaneGeometry(W, H, NX - 1, NY - 1);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) p.setY(k, maske[k] ? Math.max(0.004, e[k] * hs) : -0.02);
  geo.computeVertexNormals();
  const malz = new THREE.MeshStandardMaterial({ map: veri.doku, roughnessMap: veri.puruz, bumpMap: veri.kabartma, bumpScale: 4, roughness: 1, metalness: 0, envMapIntensity: 0.35 });
  const orgu = new THREE.Mesh(geo, malz);
  orgu.receiveShadow = true;
  orgu.name = "arazi";
  const X = (l) => (l - lonc) * cc * K, Z = (b) => -(b - latc) * K;
  const yuk = (l, b) => {
    const gx = sat((l - L0) / (L1 - L0)) * (NX - 1), gy = sat((B1 - b) / (B1 - B0)) * (NY - 1);
    const i0 = Math.floor(gx), j0 = Math.floor(gy), i1 = Math.min(NX - 1, i0 + 1), j1 = Math.min(NY - 1, j0 + 1);
    const fx = gx - i0, fy = gy - j0;
    const at = (i, j) => { const k = j * NX + i; return maske[k] ? Math.max(0.004, e[k] * hs) : 0; };
    return (at(i0, j0) * (1 - fx) + at(i1, j0) * fx) * (1 - fy) + (at(i0, j1) * (1 - fx) + at(i1, j1) * fx) * fy;
  };
  return {
    orgu, K, W, H, hs, birimKm: K / KM,
    /** [boylam, enlem] → dünya noktası (arazi yüzeyinde) */
    yer: ([l, b], ek = 0) => new THREE.Vector3(X(l), yuk(l, b) + ek, Z(b)),
    /** dünya noktası → [boylam, enlem] */
    geri: (v) => [v.x / (cc * K) + lonc, -v.z / K + latc],
    yukseklik: yuk,
    icinde: ([l, b]) => l >= L0 && l <= L1 && b >= B0 && b <= B1,
  };
}

/* ---------------- Küre (Dünya ölçeği) ---------------- */
export function kureOrgusu(veri, R = 60) {
  const geo = new THREE.SphereGeometry(R, 160, 110);
  const malz = new THREE.MeshStandardMaterial({ map: veri.doku, roughnessMap: veri.puruz, roughness: 1, metalness: 0, envMapIntensity: 0.6 });
  const orgu = new THREE.Mesh(geo, malz);
  orgu.name = "kure";
  // atmosfer parıltısı: kenarlara doğru artan mavi ışıma
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.035, 96, 64), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }",
    fragmentShader: "varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.2); gl_FragColor = vec4(0.35,0.62,1.0, f*0.75); }",
  }));
  orgu.add(atm);
  const yer = ([l, b], ek = 0) => {
    const r = R + ek, c = Math.cos(b * D);
    return new THREE.Vector3(r * c * Math.cos(l * D), r * Math.sin(b * D), -r * c * Math.sin(l * D));
  };
  return {
    orgu, R, birimKm: R / 6371,
    yer,
    geri: (v) => { const r = v.length(); return [Math.atan2(-v.z, v.x) / D, Math.asin(v.y / r) / D]; },
    yukseklik: () => 0,
    icinde: () => true,
  };
}
