// Şiirde ahenk modeli: heceleme, hece ölçüsü, durak denetimi, açık/kapalı hece dizisi (aruz için)
// Türkçede her hecede tek ünlü bulunur; iki ünlü arasındaki ünsüzlerden yalnızca sonuncusu sonraki heceye geçer.

const UNLU = new Set("aeıioöuüâîûAEIİOÖUÜÂÎÛ");
const UZUN_UNLU = new Set("âîûÂÎÛ");
const harfMi = (c) => /\p{L}/u.test(c);
export const unluMu = (c) => UNLU.has(c);

/** "İncecikten" → ["İn","ce","cik","ten"]; noktalama ve kesme işareti bulunduğu hecede kalır */
export function heceler(kelime) {
  const k = [...kelime];
  const unluler = k.map((c, i) => (unluMu(c) ? i : -1)).filter((i) => i >= 0);
  if (unluler.length <= 1) return [kelime];
  const sinirlar = [];
  for (let j = 1; j < unluler.length; j++) {
    const once = unluler[j - 1], sonra = unluler[j];
    const unsuzler = [];
    for (let i = once + 1; i < sonra; i++) if (harfMi(k[i])) unsuzler.push(i);
    sinirlar.push(unsuzler.length ? unsuzler[unsuzler.length - 1] : sonra);
  }
  const sonuc = [];
  let bas = 0;
  for (const s of sinirlar) { sonuc.push(k.slice(bas, s).join("")); bas = s; }
  sonuc.push(k.slice(bas).join(""));
  return sonuc;
}

/** Dizeyi kelimelerine ve her kelimeyi hecelerine ayırır (ünlüsüz parçalar — ör. tire — atlanır) */
export function dizeCoz(dize) {
  return dize.split(/\s+/).filter((w) => [...w].some(unluMu)).map((kelime) => ({ kelime, heceler: heceler(kelime) }));
}

export const heceSayisi = (dize) => [...dize].filter(unluMu).length;

/** Hece ölçüsünde yaygın durak kalıpları (çok kullanılanlar) */
export const DURAK_KALIPLARI = {
  6: [[3, 3]],
  7: [[4, 3], [3, 4]],
  8: [[4, 4], [5, 3]],
  11: [[6, 5], [4, 4, 3]],
};

/**
 * Durak denetimi. duraklar: durağın hemen ÖNÜNDEKİ kelimelerin sıra numaraları (0'dan başlar).
 * kaliplar verilirse (bir şiirde durak düzeni korunur) uygunluk ona göre, verilmezse ölçünün yaygın kalıplarına göre belirlenir.
 * Döner: { gruplar: [4,4], uygun, genelUygun, toplam }
 */
export function durakDenetle(dize, duraklar, olcu, kaliplar) {
  const kelimeler = dizeCoz(dize);
  const sirali = [...new Set(duraklar)].filter((i) => i >= 0 && i < kelimeler.length - 1).sort((a, b) => a - b);
  const gruplar = [];
  let say = 0;
  kelimeler.forEach((k, i) => {
    say += k.heceler.length;
    if (sirali.includes(i)) { gruplar.push(say); say = 0; }
  });
  gruplar.push(say);
  const toplam = gruplar.reduce((a, b) => a + b, 0);
  const uyar = (liste) => toplam === (olcu ?? toplam) && liste.some((k) => k.length === gruplar.length && k.every((v, i) => v === gruplar[i]));
  const genelUygun = uyar(DURAK_KALIPLARI[olcu ?? toplam] || []);
  return { gruplar, uygun: kaliplar ? uyar(kaliplar) : genelUygun, genelUygun, toplam };
}

/** Bir dize için ölçüye uyan ilk durak dizilimini bulur (sesli okumada varsayılan duraklar için) */
export function durakBul(dize, olcu, kaliplar) {
  const n = dizeCoz(dize).length;
  const denenecek = [];
  for (let a = 0; a < n - 1; a++) {
    denenecek.push([a]);
    for (let b = a + 1; b < n - 1; b++) denenecek.push([a, b]);
  }
  return denenecek.find((d) => durakDenetle(dize, d, olcu, kaliplar).uygun) || [];
}

/**
 * Açık hece ünlüyle biter (kısa: "."), kapalı hece ünsüzle biter (uzun: "–").
 * Uzun ünlülü (â, î, û) açık heceler de aruzda uzun sayılır.
 */
export function heceTipi(hece) {
  const harfler = [...hece].filter(harfMi);
  const son = harfler[harfler.length - 1] || "";
  if (!unluMu(son)) return "–";
  return UZUN_UNLU.has(son) ? "–" : ".";
}
export const acikKapaliDizisi = (dize) => dizeCoz(dize).flatMap((k) => k.heceler.map(heceTipi));

/** Aruz kalıpları (yalnızca derste kullanılan örnekler için) */
export const ARUZ = {
  "fâilâtün feilâtün feilâtün fa'lün": "–.–– ..–– ..–– ––",
  "mefâilün feilâtün mefâilün feilün": ".–.– ..–– .–.– ..–",
};
export function kalibaUyar(dize, kalip) {
  const beklenen = [...ARUZ[kalip].replace(/\s/g, "")];
  const gercek = acikKapaliDizisi(dize);
  return beklenen.length === gercek.length && beklenen.every((c, i) => c === gercek[i]);
}
