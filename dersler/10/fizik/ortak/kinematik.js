// Hareket grafikleri için sahneden bağımsız model: parçalı hareket, grafik şekli sınıflandırma,
// hız–zaman alanı, hızlanma/yavaşlama kuralı. tests/ altında sayısal olarak doğrulanır.
export { parcali } from "../u1-hareket/fizik.js";
import { parcali } from "../u1-hareket/fizik.js";

const EPS = 1e-9;

/**
 * Hızı parça parça sabit olan hareket: [{sure, v}] → t → {x, v, a}
 * (Parçalar arasında hız anında değişir; "hızlı git, yavaş git, dur, geri dön" senaryoları için.)
 */
export function sabitHizli(x0, parcalar) {
  const baslar = [];
  let t = 0, x = x0;
  for (const p of parcalar) { baslar.push({ t, x, v: p.v, sure: p.sure }); x += p.v * p.sure; t += p.sure; }
  const son = { t, x, v: parcalar[parcalar.length - 1]?.v ?? 0 };
  return (zaman) => {
    if (zaman >= son.t) return { x: son.x + son.v * (zaman - son.t), v: son.v, a: 0 };
    let b = baslar[0];
    for (const p of baslar) if (zaman >= p.t - EPS) b = p;
    return { x: b.x + b.v * (zaman - b.t), v: b.v, a: 0 };
  };
}

/** Parçaların başlangıç/bitiş anları: [0, t1, t2, …] */
export function sinirlar(parcalar) {
  const s = [0];
  for (const p of parcalar) s.push(s[s.length - 1] + (Number.isFinite(p.sure) ? p.sure : 0));
  return s;
}

/**
 * Hareket türü: hız ve ivmenin işaretine göre.
 * aynı işaret → hızlanıyor, zıt işaret → yavaşlıyor, ivme sıfır → sabit hız (hız da sıfırsa duruyor)
 */
export function hareketTuru(v, a) {
  if (Math.abs(a) < EPS) return Math.abs(v) < EPS ? "duruyor" : "sabit";
  if (Math.abs(v) < EPS) return "hizlaniyor";
  return Math.sign(v) === Math.sign(a) ? "hizlaniyor" : "yavasliyor";
}

/**
 * Sabit ivmeli bir parçada konum–zaman grafiğinin şekli (parça içinde hız işaret değiştirmez varsayılır).
 * yatay · artan-dogru · azalan-dogru · artan-yukari (hızlanarak ileri) · artan-asagi (yavaşlayarak ileri)
 * azalan-asagi (hızlanarak geri) · azalan-yukari (yavaşlayarak geri)
 */
export function xtSekli(v0, a) {
  const vYok = Math.abs(v0) < EPS, aYok = Math.abs(a) < EPS;
  if (vYok && aYok) return "yatay";
  if (aYok) return v0 > 0 ? "artan-dogru" : "azalan-dogru";
  if (vYok) return a > 0 ? "artan-yukari" : "azalan-asagi";
  if (v0 > 0) return a > 0 ? "artan-yukari" : "artan-asagi";
  return a < 0 ? "azalan-asagi" : "azalan-yukari";
}

/** Hız–zaman grafiğinin parça şekli */
export function vtSekli(a) { return Math.abs(a) < EPS ? "yatay" : a > 0 ? "artan" : "azalan"; }

/** İvme–zaman grafiğinin parça düzeyi */
export function atSeviye(a) { return Math.abs(a) < EPS ? "sifir" : a > 0 ? "pozitif" : "negatif"; }

/** Parça içinde hız işaret değiştiriyor mu? (çizim bulmacalarında böyle parça kullanılmaz) */
export function isaretDegistirir(v0, a, sure) {
  const v1 = v0 + a * sure;
  return v0 * v1 < -EPS;
}

/**
 * Hız–zaman grafiğinin altındaki (işaretli) alan ve alınan yol.
 * parcalar: [{sure, a}], v0 ilk hız. Eksenin altındaki alan negatif sayılır.
 */
export function vtAlan(v0, parcalar) {
  let v = v0, alan = 0, yol = 0;
  for (const p of parcalar) {
    const v1 = v + p.a * p.sure;
    if (v * v1 < -EPS) {
      // parça içinde hız sıfırı kesiyor: iki üçgen
      const tk = -v / p.a;
      alan += 0.5 * v * tk + 0.5 * v1 * (p.sure - tk);
      yol += Math.abs(0.5 * v * tk) + Math.abs(0.5 * v1 * (p.sure - tk));
    } else {
      const parca = ((v + v1) / 2) * p.sure;
      alan += parca; yol += Math.abs(parca);
    }
    v = v1;
  }
  return { alan, yol, sonHiz: v };
}

/** Hareketi örnekler: x–t, v–t noktaları ve basamaklı a–t noktaları */
export function ornekle(x0, v0, parcalar, { dt = 0.1 } = {}) {
  const f = parcali(x0, v0, parcalar);
  const T = sinirlar(parcalar).pop();
  const x = [], v = [], a = [];
  for (let t = 0; t <= T + EPS; t += dt) { const d = f(Math.min(t, T)); x.push([+t.toFixed(4), d.x]); v.push([+t.toFixed(4), d.v]); }
  let t = 0;
  for (const p of parcalar) { a.push([t, p.a], [t + p.sure, p.a]); t += p.sure; }
  return { x, v, a, T, f };
}

/**
 * Değişken ivme: a(t) fonksiyonundan sayısal olarak v ve x üretir (küçük adımlı Euler-Cromer).
 */
export function degiskenIvme(x0, v0, aFn, T, dt = 0.02) {
  const x = [[0, x0]], v = [[0, v0]], a = [[0, aFn(0)]];
  let xx = x0, vv = v0;
  for (let t = dt; t <= T + EPS; t += dt) {
    const at = aFn(t);
    vv += at * dt; xx += vv * dt;
    x.push([+t.toFixed(4), xx]); v.push([+t.toFixed(4), vv]); a.push([+t.toFixed(4), at]);
  }
  return { x, v, a };
}

/**
 * Yapı taşlarından hareket: "hizlan" | "sabit" | "fren" | "dur" | "geri" dizisi → [{sure, a}] parçaları.
 * fren: hıza zıt 2 m/s² ivme, durana kadar (en çok 2 s); kalan süre bekleme.
 */
export function taslardanParcalar(taslar, { a = 2, sure = 2 } = {}) {
  const parcalar = [];
  let v = 0;
  for (const t of taslar) {
    if (t === "hizlan") { parcalar.push({ sure, a }); v += a * sure; }
    else if (t === "geri") { parcalar.push({ sure, a: -a }); v -= a * sure; }
    else if (t === "sabit") parcalar.push({ sure: 3, a: 0 });
    else if (t === "dur") parcalar.push({ sure, a: 0 });
    else if (t === "fren") {
      if (Math.abs(v) < EPS) { parcalar.push({ sure, a: 0 }); continue; }
      const tf = Math.min(sure, Math.abs(v) / a);
      parcalar.push({ sure: tf, a: -Math.sign(v) * a });
      v -= Math.sign(v) * a * tf;
      if (sure - tf > EPS) parcalar.push({ sure: sure - tf, a: 0 });
    }
  }
  return parcalar;
}

/** Hareket önce ileri gidip sonra geri dönüyor mu (konum–zaman grafiği tepe yapar)? */
export function tepeYaparMi(v0, parcalar) {
  let v = v0, artiGordu = v > EPS;
  for (const p of parcalar) {
    const v1 = v + p.a * p.sure;
    if (v1 > EPS) artiGordu = true;
    if (artiGordu && v1 < -EPS) return true;
    v = v1;
  }
  return false;
}
