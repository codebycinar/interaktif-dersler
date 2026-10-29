// Üçgende alan, sinüs ve kosinüs teoremleri dersinin modelleri — tests/mat10-u1c-alan-teoremler.test.mjs ile doğrulanır
import { alan, cokgenAlani, uzaklik, kesisim, sinusOrani, kosinusKenar, derece, radyan } from "../ortak/geometri.js";

export const IZGARA = 0.25;
export const yapistir = (v, adim = IZGARA) => Math.round(v / adim) * adim;
export const sinirla = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- 2. adım: paralel doğrular arasında ortak tabanlı üçgenler ---------- */
/**
 * Taban BC alttaki doğruda, A ve D üstteki paralel doğruda. Soldaki tepe L, sağdaki R olsun.
 * LC ile RB, K'de kesişir; ortak olmayan bölgeler LBK ve RKC üçgenleridir (alanları eşit).
 */
export function ortakOlmayan(A, D, B, C) {
  if (Math.abs(A.x - D.x) < 1e-9) return null;
  const [L, R] = A.x < D.x ? [A, D] : [D, A];
  const K = kesisim(L, C, R, B);
  return { L, R, K, sol: [L, B, K], sag: [R, K, C], alanSol: alan(L, B, K), alanSag: alan(R, K, C) };
}

/* ---------- 3. adım: benzer üçgenler ---------- */
/** k tam sayıysa büyük üçgeni k² küçük eş üçgene bölen çizgiler (kenarlara paralel) */
export function bolmeCizgileri(A, B, C, k) {
  const ara = (p, q, t) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
  const cizgiler = [];
  for (let i = 1; i < k; i++) {
    const t = i / k;
    cizgiler.push([ara(A, B, t), ara(A, C, t)], [ara(B, A, t), ara(B, C, t)], [ara(C, A, t), ara(C, B, t)]);
  }
  return cizgiler;
}

/* ---------- 5. adım: tarla sınırını düzeltme ---------- */
export const TARLA = {
  gen: 12, yuk: 8, metre: 10, // 1 birim = 10 m
  A: { x: 5, y: 8 }, M: { x: 8, y: 4 }, B: { x: 4, y: 0 },
  tolerans: 0.005, // alan farkı < %0,5
};
/** Kırık sınırın (A–M–B) solunda kalan parselin alanı */
export const solParselKirik = (t = TARLA) => cokgenAlani([{ x: 0, y: 0 }, t.B, t.M, t.A, { x: 0, y: t.yuk }]);
/** Düz sınırın (A–N) solunda kalan parselin alanı, N = (x, 0) */
export const solParselDuz = (nx, t = TARLA) => cokgenAlani([{ x: 0, y: 0 }, { x: nx, y: 0 }, t.A, { x: 0, y: t.yuk }]);
/** M'den AB'ye çizilen paralelin alt kenarı kestiği nokta */
export function paralelN(t = TARLA) {
  const d = { x: t.B.x - t.A.x, y: t.B.y - t.A.y };
  const s = -t.M.y / d.y;
  return { x: t.M.x + s * d.x, y: 0 };
}

/* ---------- 8. adım: Boğaz'da ölçüm (temsilî; 1 birim = 10 m) ---------- */
export const BOGAZ = {
  metre: 10,
  A: { x: -20, y: 40 }, B: { x: 20, y: 40 }, // yakın kıyıdaki iki gözlem noktası
  C: { x: 8, y: -46, ad: "saat kulesi" }, D: { x: -30, y: -42, ad: "iskele" },
  AD_metre: 826, // lazer uzaklık ölçerle ölçülmüş kabul edilir
  kilit: 0.15, // teodolit hedefe bu kadar (derece) yakınsa kilitlenir
};
/**
 * İstasyondan hedefe olan yatay açı: istasyondan öbür istasyona giden ışından (taban) itibaren, karşı kıyıya doğru ölçülür.
 * A'da AB'den, B'de BA'dan.
 */
export function tabanAcisi(istasyon, hedef, b = BOGAZ) {
  const S = b[istasyon], O = istasyon === "A" ? b.B : b.A, H = b[hedef];
  const u = { x: O.x - S.x, y: O.y - S.y }, v = { x: H.x - S.x, y: H.y - S.y };
  return derece(Math.acos((u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y))));
}
/** Teodolit açısı → yatay doğrultu (birim vektör, dünya düzleminde). Karşı kıyı y < 0 tarafında. */
export function bakisYonu(istasyon, aciDer) {
  const t = radyan(aciDer);
  return istasyon === "A" ? { x: Math.cos(t), y: -Math.sin(t) } : { x: -Math.cos(t), y: -Math.sin(t) };
}
export const gercekUzaklik = (p, q, b = BOGAZ) => uzaklik(b[p], b[q]) * b.metre;
export const tabanMetre = (b = BOGAZ) => uzaklik(b.A, b.B) * b.metre;
/** Sinüs teoremi: A ve B'deki taban açılarından AC */
export function acHesapla(aDer, bDer, taban = tabanMetre()) {
  return sinusOrani(taban, 180 - aDer - bDer) * Math.sin(radyan(bDer));
}
/** Kosinüs teoremi: AC, AD ve aradaki açıdan CD */
export const cdHesapla = (ac, ad, aciDer) => kosinusKenar(ac, ad, aciDer);
