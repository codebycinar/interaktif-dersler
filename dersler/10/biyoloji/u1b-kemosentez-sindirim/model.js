// Dersin sayısal modelleri ve sınıflandırma verileri — tests/bio10-u1b-kemosentez-sindirim.test.mjs ile doğrulanır

/* ------------------------------------------------------------------ */
/* 1. Emilim yüzeyi                                                      */
/* ------------------------------------------------------------------ */
/** İnce bağırsak: yaklaşık 6 m uzunluk, 2,5 cm çap (düz bir boru kabul edilirse iç yüzey) */
export const INCE_BAGIRSAK = { uzunluk: 6, cap: 0.025 };
/** Ders kitaplarında verilen yaklaşık yüzey artış katsayıları */
export const KATSAYI = { kivrim: 3, villus: 10, mikrovillus: 20 };

export const boruAlani = (b = INCE_BAGIRSAK) => Math.PI * b.cap * b.uzunluk; // m²
export function yuzeyKatsayisi({ kivrim = false, villus = false, mikrovillus = false } = {}, k = KATSAYI) {
  return (kivrim ? k.kivrim : 1) * (villus ? k.villus : 1) * (mikrovillus ? k.mikrovillus : 1);
}
export const toplamAlan = (yapilar) => boruAlani() * yuzeyKatsayisi(yapilar);

/**
 * Glikozun emilen oranı. Emilim hızı yüzey alanıyla orantılı kabul edilir (birinci derece):
 * kalan = e^(−k·A·t). k, düz boruda 4 saatte yalnızca ~%5 emilim olacak biçimde seçildi.
 * @param {number} katsayi yüzey katsayısı (1–600), @param {number} saat
 */
export const EMILIM_K = -Math.log(0.95) / 4; // 1/saat (katsayı 1 için)
export const emilenOran = (katsayi, saat) => 1 - Math.exp(-EMILIM_K * katsayi * saat);
/** Besinin ince bağırsakta kalma süresi (temsilî, saat) */
export const GECIS_SURESI = 4;

/* ------------------------------------------------------------------ */
/* 2. Sindirim → emilim → taşıma → hücre zinciri                         */
/* ------------------------------------------------------------------ */
export const SUREC = ["sindirim", "emilim", "tasima"];
/**
 * Hücreye ulaşan besin oranı: zincirin halkaları seri bağlıdır, toplam verim çarpımdır.
 * Bir halka bozulursa diğerleri ne kadar iyi çalışırsa çalışsın bunu telafi edemez.
 */
export function hucreyeUlasan(v = {}) {
  return SUREC.reduce((t, s) => t * Math.max(0, Math.min(1, v[s] ?? 1)), 1);
}
export const VAKALAR = [
  { metin: "Çölyak hastalığında gluten, ince bağırsaktaki villusların körelmesine yol açar.", bozuk: "emilim", verim: 0.35 },
  { metin: "Safra kesesindeki taş safra kanalını tıkadı; yağlar küçük damlacıklara ayrılamıyor.", bozuk: "sindirim", verim: 0.6 },
  { metin: "Bacak atardamarı daraldı; kas hücrelerine yeterince kan ulaşmıyor.", bozuk: "tasima", verim: 0.4 },
  { metin: "Diş kaybı nedeniyle besinler iyi çiğnenemiyor, büyük lokmalar yutuluyor.", bozuk: "sindirim", verim: 0.75 },
];

/* ------------------------------------------------------------------ */
/* 3. Sınıflandırma verileri                                             */
/* ------------------------------------------------------------------ */
/** Sindirim çeşidi: "ic" hücre içi, "dis" hücre dışı, "ikisi" */
export const CANLILAR = [
  { ad: "Amip", tur: "ic", neden: "Amip besini yalancı ayaklarıyla hücre içine alır; besin kofulu lizozomla birleşir." },
  { ad: "Terliksi hayvan (paramesyum)", tur: "ic", neden: "Tek hücrelidir; besin, hücre ağzından besin kofuluna alınıp hücre içinde sindirilir." },
  { ad: "Sünger", tur: "ic", neden: "Süngerlerde sindirim boşluğu yoktur; yakalayıcı hücreler besini hücre içinde sindirir." },
  { ad: "Hidra", tur: "ikisi", neden: "Hidrada sindirim, sindirim boşluğunda başlar (hücre dışı) ve boşluğu döşeyen hücrelerin içinde tamamlanır." },
  { ad: "Planarya", tur: "ikisi", neden: "Planaryada da besin önce sindirim boşluğunda parçalanır, sonra hücrelerin içinde sindirilir." },
  { ad: "Küf mantarı", tur: "dis", neden: "Mantarlar enzimlerini besinin üzerine salgılar; sindirim vücut dışında olur, küçük moleküller emilir." },
  { ad: "Sinekkapan bitkisi", tur: "dis", neden: "Böcekçil bitkiler yakaladıkları böceği salgıladıkları enzimlerle hücre dışında sindirir." },
  { ad: "İnsan", tur: "dis", neden: "İnsanda besinler sindirim kanalında, hücre dışında sindirilir. (Akyuvarların mikropları yutması ise hücre içi sindirime örnektir.)" },
];

/** Omurgalılarda sindirim yapıları (görseller temsilîdir) */
export const SECENEK = {
  dis: ["Diş yok, gaga var", "Sivri köpek dişleri, keskin azılar", "Köpek dişi yok, geniş öğütücü azılar", "Kesici, köpek ve azı dişleri dengeli"],
  mide: ["Kursak, bezli mide ve taşlık", "Tek gözlü, geniş mide", "Dört gözlü mide", "Tek gözlü, orta büyüklükte mide"],
  bagirsak: ["Kısa", "Orta", "Çok uzun"],
  beslenme: ["Etçil", "Otçul", "Hepçil"],
};
export const HAYVANLAR = [
  { ad: "Güvercin", dogru: [0, 0, [0, 1], 1], bagirsakOrani: 4 },
  { ad: "Kurt", dogru: [1, 1, 0, 0], bagirsakOrani: 4 },
  { ad: "İnek", dogru: [2, 2, 2, 1], bagirsakOrani: 20 },
  { ad: "İnsan", dogru: [3, 3, 1, 2], bagirsakOrani: 6 },
];

/** Emilim için sindirilmesi gereken / gerekmeyen maddeler */
export const MADDELER = [
  { ad: "Su", sindirim: false, neden: "Su küçük bir moleküldür, doğrudan emilir." },
  { ad: "Mineraller (Na⁺, Ca²⁺, Fe²⁺…)", sindirim: false, neden: "Mineraller iyon hâlinde doğrudan emilir." },
  { ad: "Vitaminler", sindirim: false, neden: "Vitaminler sindirilmeden emilir." },
  { ad: "Glikoz", sindirim: false, neden: "Glikoz bir monosakkarittir, yani zaten yapı taşıdır." },
  { ad: "Çoğu ilacın etken maddesi", sindirim: false, neden: "Tablet dağılır; içindeki küçük etken madde molekülleri sindirilmeden emilir." },
  { ad: "Sakkaroz (çay şekeri)", sindirim: true, neden: "Sakkaroz bir disakkarittir; emilmeden önce glikoz ve fruktoza ayrılmalıdır." },
  { ad: "Nişasta", sindirim: true, neden: "Nişasta binlerce glikozdan oluşan büyük bir moleküldür." },
  { ad: "Protein", sindirim: true, neden: "Proteinler amino asitlere ayrılmadan emilemez." },
  { ad: "Yağ (trigliserit)", sindirim: true, neden: "Yağlar yağ asitleri ve gliserole ayrılarak emilir." },
];
