// Küre üzerinde uzaklık, yön ve nokta–çokgen hesapları (DOM'suz; tarih ve coğrafya dersleri ile testler kullanır)
// Koordinatlar her yerde [boylam, enlem] (derece) sırasıyla verilir: d3-geo ile aynı.

const R = 6371; // ortalama Dünya yarıçapı (km)
const rad = (d) => (d * Math.PI) / 180;
const der = (r) => (r * 180) / Math.PI;

/** İki nokta arasındaki büyük çember uzaklığı (km) */
export function mesafe([l1, b1], [l2, b2]) {
  const db = rad(b2 - b1), dl = rad(l2 - l1);
  const a = Math.sin(db / 2) ** 2 + Math.cos(rad(b1)) * Math.cos(rad(b2)) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** A'dan B'ye başlangıç yönü (kuzeyden saat yönünde, 0–360°) */
export function yon([l1, b1], [l2, b2]) {
  const y = Math.sin(rad(l2 - l1)) * Math.cos(rad(b2));
  const x = Math.cos(rad(b1)) * Math.sin(rad(b2)) - Math.sin(rad(b1)) * Math.cos(rad(b2)) * Math.cos(rad(l2 - l1));
  return (der(Math.atan2(y, x)) + 360) % 360;
}

export const YONLER = ["kuzey", "kuzeydoğu", "doğu", "güneydoğu", "güney", "güneybatı", "batı", "kuzeybatı"];

/** Yön açısını sekiz ana/ara yönden birine çevirir */
export const yonAdi = (aci) => YONLER[Math.round(((aci % 360) + 360) % 360 / 45) % 8];

/** Açının en yakın yön sınırına uzaklığı (°): küçükse yön adı tartışmalı olur */
export const sinirPayi = (aci) => {
  const m = (((aci - 22.5) % 45) + 45) % 45;
  return Math.min(m, 45 - m);
};

/** "B, A'nın …ında/…inde" ifadesindeki yön: A'dan bakınca B hangi yönde? */
export const goreceliYon = (a, b) => yonAdi(yon(a, b));

/** Nokta, [boylam, enlem] halkasının içinde mi? (ışın yöntemi; küçük alanlar için düzlem yaklaşımı yeterli) */
export function cokgenIcinde([x, y], halka) {
  let ic = false;
  for (let i = 0, j = halka.length - 1; i < halka.length; j = i++) {
    const [xi, yi] = halka[i], [xj, yj] = halka[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ic = !ic;
  }
  return ic;
}

/** Noktanın kırık çizgiye en kısa uzaklığı (km) ve çizgi üzerindeki konumu (baştan km) */
export function cizgiyeUzaklik(p, cizgi) {
  const k = Math.cos(rad(p[1]));
  const xy = ([l, b]) => [rad(l) * R * k, rad(b) * R];
  const P = xy(p);
  let enIyi = { uzaklik: Infinity, konum: 0, nokta: cizgi[0] }, toplam = 0;
  for (let i = 0; i < cizgi.length - 1; i++) {
    const A = xy(cizgi[i]), B = xy(cizgi[i + 1]);
    const dx = B[0] - A[0], dy = B[1] - A[1], L2 = dx * dx + dy * dy;
    const t = L2 ? Math.max(0, Math.min(1, ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / L2)) : 0;
    const d = Math.hypot(A[0] + t * dx - P[0], A[1] + t * dy - P[1]);
    const L = Math.sqrt(L2);
    if (d < enIyi.uzaklik) {
      enIyi = {
        uzaklik: d, konum: toplam + t * L,
        nokta: [cizgi[i][0] + t * (cizgi[i + 1][0] - cizgi[i][0]), cizgi[i][1] + t * (cizgi[i + 1][1] - cizgi[i][1])],
      };
    }
    toplam += L;
  }
  return enIyi;
}

/** Kırık çizginin toplam uzunluğu (km) */
export const cizgiUzunlugu = (cizgi) => cizgi.slice(1).reduce((s, p, i) => s + mesafe(cizgi[i], p), 0);

/** Kırık çizgi üzerinde baştan d km uzaklıktaki nokta */
export function cizgiUzerinde(cizgi, d) {
  let kalan = d;
  for (let i = 0; i < cizgi.length - 1; i++) {
    const L = mesafe(cizgi[i], cizgi[i + 1]);
    if (kalan <= L) {
      const t = L ? kalan / L : 0;
      return [cizgi[i][0] + t * (cizgi[i + 1][0] - cizgi[i][0]), cizgi[i][1] + t * (cizgi[i + 1][1] - cizgi[i][1])];
    }
    kalan -= L;
  }
  return cizgi[cizgi.length - 1];
}

/** Sıralı duraklar (baştan km) arasındaki en büyük açıklık; uçlar dahil */
export function enBuyukAralik(duraklar, uzunluk) {
  const s = [0, ...duraklar.filter((d) => d > 0 && d < uzunluk).sort((a, b) => a - b), uzunluk];
  return Math.max(...s.slice(1).map((d, i) => d - s[i]));
}

/** Boylam farkından yerel saat farkı (dakika): Dünya 24 saatte 360° döner → 1° = 4 dk */
export const saatFarki = (boylamFarki) => Math.abs(boylamFarki) * 4;
