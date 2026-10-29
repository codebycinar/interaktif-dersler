// 10. Sınıf Matematik · 1. Tema (Geometrik Şekiller) için ortak geometri ve trigonometri modelleri.
// Sahneden bağımsızdır, tests/mat10-*.test.mjs ile doğrulanır. Noktalar { x, y } nesneleridir.
// Üçgen gösterimi: a = |BC|, b = |CA|, c = |AB|; A, B, C aynı zamanda açıların adıdır.

export const DERECE = Math.PI / 180;
export const derece = (rad) => rad / DERECE;
export const radyan = (der) => der * DERECE;

/* ---------- Vektör işlemleri ---------- */
export const nk = (x, y) => ({ x, y });
export const fark = (p, q) => nk(p.x - q.x, p.y - q.y);
export const topla = (p, q) => nk(p.x + q.x, p.y + q.y);
export const olcekle = (p, k) => nk(p.x * k, p.y * k);
export const uzunluk = (v) => Math.hypot(v.x, v.y);
export const uzaklik = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
export const icCarpim = (u, v) => u.x * v.x + u.y * v.y;
export const vektorel = (u, v) => u.x * v.y - u.y * v.x;
export const ortaNokta = (p, q) => nk((p.x + q.x) / 2, (p.y + q.y) / 2);
export const birimVektor = (v) => { const L = uzunluk(v) || 1; return nk(v.x / L, v.y / L); };
export const dik = (v) => nk(-v.y, v.x);

/** Ağırlıklı ortalama: [[nokta, ağırlık], …] */
export function agirlikliOrta(liste) {
  let x = 0, y = 0, t = 0;
  for (const [p, w] of liste) { x += p.x * w; y += p.y * w; t += w; }
  return nk(x / t, y / t);
}

/* ---------- Üçgen ölçüleri ---------- */
/** B köşesindeki ABC açısı (radyan, 0…π) */
export function aci(A, B, C) {
  const u = fark(A, B), v = fark(C, B);
  return Math.atan2(Math.abs(vektorel(u, v)), icCarpim(u, v));
}
export const kenarlar = (A, B, C) => ({ a: uzaklik(B, C), b: uzaklik(C, A), c: uzaklik(A, B) });
/** Üç iç açı (derece) */
export const acilar = (A, B, C) => ({ A: derece(aci(B, A, C)), B: derece(aci(A, B, C)), C: derece(aci(A, C, B)) });
export const yonluAlan = (A, B, C) => vektorel(fark(B, A), fark(C, A)) / 2;
export const alan = (A, B, C) => Math.abs(yonluAlan(A, B, C));
/** Çokgen alanı (köşeler sırayla, işaretsiz) */
export function cokgenAlani(liste) {
  let t = 0;
  for (let i = 0; i < liste.length; i++) t += vektorel(liste[i], liste[(i + 1) % liste.length]);
  return Math.abs(t) / 2;
}

/* ---------- Doğrular ---------- */
/** P'den AB doğrusuna inilen dikmenin ayağı */
export function dikmeAyagi(P, A, B) {
  const d = fark(B, A);
  const t = icCarpim(fark(P, A), d) / icCarpim(d, d);
  return topla(A, olcekle(d, t));
}
/** P'nin AB doğrusuna uzaklığı */
export const dogruyaUzaklik = (P, A, B) => Math.abs(vektorel(fark(B, A), fark(P, A))) / uzaklik(A, B);
/** P1P2 ve Q1Q2 doğrularının kesişimi (paralelse null) */
export function kesisim(P1, P2, Q1, Q2) {
  const r = fark(P2, P1), s = fark(Q2, Q1);
  const pay = vektorel(r, s);
  if (Math.abs(pay) < 1e-12) return null;
  return topla(P1, olcekle(r, vektorel(fark(Q1, P1), s) / pay));
}
/** P'nin AB doğrusu üzerindeki konum parametresi (A → 0, B → 1) */
export const parametre = (P, A, B) => icCarpim(fark(P, A), fark(B, A)) / icCarpim(fark(B, A), fark(B, A));

/* ---------- Yardımcı elemanlar ---------- */
/** A'dan çizilen iç açıortayın BC'yi kestiği D noktası: BD/DC = AB/AC */
export function icAciortayAyagi(A, B, C) {
  const c = uzaklik(A, B), b = uzaklik(A, C);
  return agirlikliOrta([[B, b], [C, c]]);
}
/** A'daki dış açıortayın BC doğrusunu kestiği E noktası: EB/EC = AB/AC. AB = AC ise paraleldir → null */
export function disAciortayAyagi(A, B, C) {
  const c = uzaklik(A, B), b = uzaklik(A, C);
  if (Math.abs(c - b) < 1e-9 * Math.max(b, c)) return null;
  return nk((c * C.x - b * B.x) / (c - b), (c * C.y - b * B.y) / (c - b));
}
/** V köşesindeki iç açıortayın doğrultusu (birim vektör); P ve Q diğer köşeler */
export const icAciortayYonu = (V, P, Q) => birimVektor(topla(birimVektor(fark(P, V)), birimVektor(fark(Q, V))));
/** V köşesindeki dış açıortayın doğrultusu (iç açıortaya dik) */
export const disAciortayYonu = (V, P, Q) => birimVektor(fark(birimVektor(fark(P, V)), birimVektor(fark(Q, V))));

/** İç açıortayların kesişimi ve iç teğet çember */
export function icTegetCember(A, B, C) {
  const { a, b, c } = kenarlar(A, B, C);
  const merkez = agirlikliOrta([[A, a], [B, b], [C, c]]);
  return { merkez, r: (2 * alan(A, B, C)) / (a + b + c) };
}
/** A köşesinin karşısındaki dış teğet çember: A'nın iç, B ve C'nin dış açıortaylarının kesişimi */
export function disTegetCember(A, B, C) {
  const { a, b, c } = kenarlar(A, B, C);
  const merkez = agirlikliOrta([[A, -a], [B, b], [C, c]]);
  const u = (a + b + c) / 2;
  return { merkez, r: alan(A, B, C) / (u - a) };
}
export const agirlikMerkezi = (A, B, C) => nk((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3);
/** Kenar orta dikmelerin kesişimi ve çevrel çember */
export function cevrelCember(A, B, C) {
  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  const a2 = A.x * A.x + A.y * A.y, b2 = B.x * B.x + B.y * B.y, c2 = C.x * C.x + C.y * C.y;
  const merkez = nk((a2 * (B.y - C.y) + b2 * (C.y - A.y) + c2 * (A.y - B.y)) / d,
    (a2 * (C.x - B.x) + b2 * (A.x - C.x) + c2 * (B.x - A.x)) / d);
  return { merkez, R: uzaklik(merkez, A) };
}
/** Yüksekliklerin kesişimi (diklik merkezi): H = A + B + C − 2·O */
export function diklikMerkezi(A, B, C) {
  const O = cevrelCember(A, B, C).merkez;
  return nk(A.x + B.x + C.x - 2 * O.x, A.y + B.y + C.y - 2 * O.y);
}

/** "dar" | "dik" | "genis" — en büyük açı 90°'ye tol derece yakınsa dik sayılır */
export function ucgenTuru(A, B, C, tol = 0.5) {
  const { A: x, B: y, C: z } = acilar(A, B, C);
  const m = Math.max(x, y, z);
  return Math.abs(m - 90) <= tol ? "dik" : m > 90 ? "genis" : "dar";
}
/** P üçgenin "ic" | "kenar" | "dis" bölgesinde mi? (kenara eps'ten yakınsa "kenar") */
export function ucgenGore(P, A, B, C, eps = 1e-6) {
  const isaret = Math.sign(yonluAlan(A, B, C)) || 1;
  const d = [[A, B], [B, C], [C, A]].map(([p, q]) => (isaret * vektorel(fark(q, p), fark(P, p))) / uzaklik(p, q));
  const m = Math.min(...d);
  return m > eps ? "ic" : m < -eps ? "dis" : "kenar";
}

/* ---------- Trigonometri ---------- */
/** Dik üçgende bir dar açının oranları: karşı dik kenar, komşu dik kenar */
export function dikUcgenOranlari(karsi, komsu) {
  const hip = Math.hypot(karsi, komsu);
  return { hip, sin: karsi / hip, cos: komsu / hip, tan: karsi / komsu, cot: komsu / karsi };
}
/** Derece cinsinden açının oranları (birim çember tanımı; tanımsız değer → Infinity) */
export function trigOranlar(der) {
  const r = radyan(der);
  let s = Math.sin(r), c = Math.cos(r);
  if (Math.abs(s) < 1e-12) s = 0;
  if (Math.abs(c) < 1e-12) c = 0;
  return { sin: s, cos: c, tan: c === 0 ? Infinity : s / c, cot: s === 0 ? Infinity : c / s };
}
/** Birim çemberde yönlü açıya karşılık gelen nokta: (cos θ, sin θ) */
export const birimCemberNoktasi = (der) => { const t = trigOranlar(der); return nk(t.cos, t.sin); };
/** Yönlü açıyı (−360°, 360°] aralığına, önceki değere en yakın olacak biçimde açar (sürüklemede sıçrama olmasın) */
export function yonluAciAc(ham, onceki) {
  let t = ham + 360 * Math.round((onceki - ham) / 360);
  if (t > 360) t -= 360;
  if (t <= -360) t += 360;
  return t;
}
/** 30°, 45°, 60° için tam değerler (ders kitabı gösterimi) */
export const OZEL_DEGERLER = {
  sin: { 30: "1/2", 45: "√2/2", 60: "√3/2" },
  cos: { 30: "√3/2", 45: "√2/2", 60: "1/2" },
  tan: { 30: "√3/3", 45: "1", 60: "√3" },
  cot: { 30: "√3", 45: "1", 60: "√3/3" },
};
export const IFADE_DEGERI = { "1/2": 0.5, "√2/2": Math.SQRT2 / 2, "√3/2": Math.sqrt(3) / 2, "1": 1, "√3": Math.sqrt(3), "√3/3": Math.sqrt(3) / 3 };

/* ---------- Alan formülleri ve teoremler ---------- */
/** Aynı üçgenin alanını altı farklı yoldan hesaplar */
export function alanFormulleri(A, B, C) {
  const { a, b, c } = kenarlar(A, B, C);
  const ac = acilar(A, B, C);
  const sin = (d) => Math.sin(radyan(d));
  return {
    yukseklik: { ha: dogruyaUzaklik(A, B, C), hb: dogruyaUzaklik(B, C, A), hc: dogruyaUzaklik(C, A, B) },
    tabanYukseklik: [a * dogruyaUzaklik(A, B, C) / 2, b * dogruyaUzaklik(B, C, A) / 2, c * dogruyaUzaklik(C, A, B) / 2],
    sinuslu: [b * c * sin(ac.A) / 2, a * c * sin(ac.B) / 2, a * b * sin(ac.C) / 2],
  };
}
/** İki kenarı ve aradaki açısı verilen üçgenin alanı: ½·b·c·sin A */
export const sinusluAlan = (b, c, Ader) => (b * c * Math.sin(radyan(Ader))) / 2;
/** Sinüs teoremi oranı: kenar / sin(karşı açı) = 2R */
export const sinusOrani = (kenar, aciDer) => kenar / Math.sin(radyan(aciDer));
/** Kosinüs teoremi: iki kenar ve aradaki açıdan üçüncü kenar */
export const kosinusKenar = (b, c, Ader) => Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(radyan(Ader)));
/** Kosinüs teoremi: üç kenardan a'nın karşısındaki açı (derece) */
export const kosinusAci = (a, b, c) => derece(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
/** Sinüs teoremiyle çözüm: bir kenar (c) ve ona komşu iki açı (A, B) → diğer kenarlar */
export function ucgenCozAKA(c, Ader, Bder) {
  const Cder = 180 - Ader - Bder;
  const k = sinusOrani(c, Cder);
  return { C: Cder, a: k * Math.sin(radyan(Ader)), b: k * Math.sin(radyan(Bder)) };
}
