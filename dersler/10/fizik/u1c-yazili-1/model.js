// Yazılı senaryolarının hesapları: sahneden bağımsız, tests/ ile MEB cevap anahtarına karşı doğrulanır.
import { hareketTuru } from "../ortak/kinematik.js";

/** a = Δv / Δt */
export const ivme = (vIlk, vSon, sure) => (vSon - vIlk) / sure;
/** v = v0 + a·t */
export const sonHiz = (v0, a, sure) => v0 + a * sure;
/** Hız–zaman grafiğinde yamuk alanı = (v1 + v2)/2 · Δt */
export const yamukAlan = (v1, v2, sure) => ((v1 + v2) / 2) * sure;

/** 1. soru: her saniye bir ağaç aralığı ilerleyen araç t anında kaçıncı ağaç hizasındadır? */
export function agacHizasi({ ilkAgac = 1, saniyedeAralik, t }) { return ilkAgac + saniyedeAralik * t; }

/** 2. soru: aynı yönde sabit hızlı iki araç; hızlı olan arkadan geliyor. */
export function yetisme({ mesafe, vHizli, vYavas }) {
  const t = mesafe / (vHizli - vYavas);
  return { t, yolHizli: vHizli * t, yolYavas: vYavas * t };
}

/** 3. soru: ardışık sabit ivmeli aralıklar; ivme yönü hız yönüne göre ±. */
export function araliklar(vIlk, liste) {
  let v = vIlk;
  return liste.map((p) => {
    const a = p.yon * p.buyukluk;
    const son = sonHiz(v, a, p.sure);
    const satir = { ilk: v, son, degisim: son > v ? "artar" : son < v ? "azalır" : "değişmez", ivmeYonu: p.yon > 0 ? "+x" : "−x", tur: hareketTuru(v, a) };
    v = son;
    return satir;
  });
}

/** 4. soru: tramvay denemeleri: (t, v) ölçümlerinden Δv, a, yönler, hareket türü. */
export function deneme(olcumler) {
  const [t0, v0] = olcumler[0], [t1, v1] = olcumler[1];
  const dv = v1 - v0, a = dv / (t1 - t0);
  const yon = (x) => (x > 0 ? "Doğu" : x < 0 ? "Batı" : "—");
  const tur = hareketTuru(v0, a);
  return { dv, a, hizYonu: yon(v0), ivmeYonu: yon(a), hareket: tur === "hizlaniyor" ? "Hızlanır" : tur === "yavasliyor" ? "Yavaşlar" : "Sabit" };
}

/** 5. soru: ardışık saniyelerdeki hızlardan (aşağı +) bölge ivmesi. */
export function bolgeIvmesi(hizlar) {
  const degisimler = hizlar.slice(1).map((v, i) => v - hizlar[i]);
  const a = (hizlar[hizlar.length - 1] - hizlar[0]) / (hizlar.length - 1);
  return { degisimler, a, yon: a > 0 ? "aşağı" : "yukarı" };
}

/** 6. soru: hızı v1'den v2'ye düzgün değişen aracın ivmesi ve yer değiştirmesi */
export function duzgunDegisim(v1, v2, sure) {
  return { a: ivme(v1, v2, sure), dx: yamukAlan(v1, v2, sure) };
}

/** 7. soru: tepki süresi + fren; çarpma hızı biliniyorsa ilk hız, yer değiştirme ve çarpmamak için en küçük ivme */
export function frenSenaryosu({ tepki, a, toplamSure, carpmaHizi }) {
  const frenSuresi = toplamSure - tepki;
  const v0 = carpmaHizi + a * frenSuresi;
  const dx = v0 * tepki + yamukAlan(v0, carpmaHizi, frenSuresi);
  // Tam ağaçta durmak: v0²/(2·a_min) = dx  →  a_min = v0²/(2·dx)
  const aMin = (v0 * v0) / (2 * dx);
  const tMin = (2 * dx) / v0;
  return { v0, dx, aMin, tMin, frenSuresi };
}
