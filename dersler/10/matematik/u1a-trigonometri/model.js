// Dik üçgende trigonometri dersinin modelleri — sahneden bağımsız, tests/mat10-u1a-trigonometri.test.mjs ile doğrulanır
import { dikUcgenOranlari, radyan, derece } from "../ortak/geometri.js";

/**
 * 1. adım: kenarları rasyonel olan benzer dik üçgen aileleri. k büyütme katsayısı; kAdim'in katlarına yapışır.
 * komşu ve karşı, α açısına göre dik kenarlardır.
 */
export const AILELER = [
  { ad: "3-4-5", komsu: 4, karsi: 3, hip: 5, kAdim: 0.25, kMin: 0.5, kMax: 2.25 },
  { ad: "5-12-13", komsu: 12, karsi: 5, hip: 13, kAdim: 0.125, kMin: 0.25, kMax: 0.75 },
  { ad: "8-15-17", komsu: 8, karsi: 15, hip: 17, kAdim: 0.1, kMin: 0.2, kMax: 0.5 },
];

/** Ailenin k katı üçgeninin kenarları ve oranları */
export function aileUcgeni(aile, k) {
  const komsu = aile.komsu * k, karsi = aile.karsi * k, hip = aile.hip * k;
  return { komsu, karsi, hip, ...dikUcgenOranlari(karsi, komsu) };
}

/** k'yı ailenin adımına yapıştırır ve sınırlar */
export function kYapistir(aile, k) {
  const r = Math.round(k / aile.kAdim) * aile.kAdim;
  return Math.min(aile.kMax, Math.max(aile.kMin, +r.toFixed(6)));
}

/** 7. adım: minare. Gözlemci minare ekseninden d metre uzakta, gözü yerden goz metre yukarıda. */
export const MINARE = { h: 38, goz: 1.6 };
export const bakisAcisi = (h, d, goz = MINARE.goz) => derece(Math.atan2(h - goz, d));
export const yukseklikHesapla = (d, aciDer, goz = MINARE.goz) => d * Math.tan(radyan(aciDer)) + goz;
