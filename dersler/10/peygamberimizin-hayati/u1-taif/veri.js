// Taif ünitesi — olaylar, yerler ve sayılar (tests/ph10-u1-taif.test.mjs tutarlılığı denetler)
// Tarihler yaygın kabul gören siyer kronolojisine göredir. Rivayetlerin farklılaştığı kayıtlar "yaklasik: true".
// miladi: { yil, ay? } (ay 1–12) · hicri: { yil, ay, gun? } · nubuvvet: peygamberliğin kaçıncı yılı (Mekke dönemi)

export const HICRI_AYLAR = ["Muharrem", "Safer", "Rebiülevvel", "Rebiülâhir", "Cemâziyelevvel", "Cemâziyelâhir", "Recep", "Şâban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"];
export const MILADI_AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export const SERITLER = [
  { id: "mekke", ad: "Mekke dönemi", renk: "#ffb547" },
  { id: "taif", ad: "Taif ve Sakif", renk: "#5ad38b" },
  { id: "medine", ad: "Medine dönemi", renk: "#4fc3f7" },
];

export const OLAYLAR = [
  { id: "vahiy", ad: "İlk vahiy", serit: "mekke", nubuvvet: 1, miladi: { yil: 610 }, yaklasik: true, bilgi: "Hira mağarasında ilk ayetler (Alak 96/1-5) indi." },
  { id: "acikDavet", ad: "Açık davet", serit: "mekke", nubuvvet: 4, miladi: { yil: 613 }, yaklasik: true, bilgi: "Davet herkese açıkça yapılmaya başlandı; Mekkeli müşriklerin baskısı arttı." },
  { id: "habesistan", ad: "Habeşistan'a hicret", serit: "mekke", nubuvvet: 5, miladi: { yil: 615 }, bilgi: "Baskıdan kaçan bir grup Müslüman, Habeşistan'a (Necâşî'nin ülkesine) göç etti." },
  { id: "boykot", ad: "Boykot yılları", serit: "mekke", nubuvvet: 7, nubuvvetBit: 10, miladi: { yil: 616 }, miladiBit: { yil: 619 }, yaklasik: true, bilgi: "Hâşimoğulları ile alışveriş ve evlenme yasaklandı; Müslümanlar yaklaşık üç yıl Ebû Tâlib mahallesinde kuşatma altında yaşadı." },
  { id: "huzun", ad: "Hüzün yılı", serit: "mekke", nubuvvet: 10, miladi: { yil: 619 }, bilgi: "Hz. Peygamber'i himaye eden amcası Ebû Tâlib ve eşi Hz. Hatice vefat etti." },
  { id: "taifYolculugu", ad: "Taif yolculuğu", serit: "taif", nubuvvet: 10, miladi: { yil: 619 }, yaklasik: true, bilgi: "Hz. Peygamber, Zeyd b. Hârise ile Taif'e gitti; Sakif'in ileri gelenleri daveti reddetti. Yolculuğun yılı ve süresi rivayetlerde farklıdır (yaklaşık 10 gün)." },
  { id: "akabe1", ad: "1. Akabe biatı", serit: "mekke", nubuvvet: 12, miladi: { yil: 621 }, bilgi: "Yesrib'den (Medine) gelen 12 kişi biat etti." },
  { id: "akabe2", ad: "2. Akabe biatı", serit: "mekke", nubuvvet: 13, miladi: { yil: 622, ay: 6 }, yaklasik: true, bilgi: "Yesrib'den gelen 75 kişi (73 erkek, 2 kadın) Hz. Peygamber'i korumaya söz verdi." },
  { id: "hicret", ad: "Hicret", serit: "medine", hicri: { yil: 1, ay: 3, gun: 12 }, miladi: { yil: 622, ay: 9 }, bilgi: "Hz. Peygamber Medine'ye göç etti; hicrî takvim bu yılı başlangıç alır." },
  { id: "bedir", ad: "Bedir", serit: "medine", hicri: { yil: 2, ay: 9, gun: 17 }, miladi: { yil: 624, ay: 3 }, bilgi: "Müslümanlar ile Mekkeli müşrikler arasındaki ilk büyük savaş." },
  { id: "hudeybiye", ad: "Hudeybiye", serit: "medine", hicri: { yil: 6, ay: 11 }, miladi: { yil: 628, ay: 3 }, bilgi: "Mekkelilerle on yıllık barış antlaşması; İslam'ın barış ortamında hızla yayılmasını sağladı." },
  { id: "fetih", ad: "Mekke'nin fethi", serit: "medine", hicri: { yil: 8, ay: 9, gun: 20 }, miladi: { yil: 630, ay: 1 }, bilgi: "Mekke büyük ölçüde savaşsız fethedildi; Hz. Peygamber Mekkelileri affetti." },
  { id: "huneyn", ad: "Huneyn", serit: "taif", hicri: { yil: 8, ay: 10, gun: 10 }, miladi: { yil: 630, ay: 1 }, yaklasik: true, bilgi: "Hevâzin ve Sakif kabileleri, Mâlik b. Avf komutasında Müslümanlara karşı savaştı; Müslümanlar zorlu bir başlangıçtan sonra kazandı (Tevbe 9/25-26)." },
  { id: "kusatma", ad: "Taif kuşatması", serit: "taif", hicri: { yil: 8, ay: 10 }, miladi: { yil: 630, ay: 2 }, sureGun: [15, 20], yaklasik: true, bilgi: "Huneyn'den kaçan Sakifliler surlu şehirlerine kapandı. Kuşatma yaklaşık 15–20 gün sürdü (rivayetler 10–40 gün); Hz. Peygamber kuşatmayı kaldırdı ve Sakif için hidayet duası etti." },
  { id: "cirane", ad: "Ci'râne", serit: "taif", hicri: { yil: 8, ay: 11, gun: 18 }, miladi: { yil: 630, ay: 3 }, yaklasik: true, bilgi: "Huneyn ganimetleri dağıtıldı; esirler Hevâzin'e iade edildi. Hevâzin komutanı Mâlik b. Avf Müslüman oldu; Hz. Peygamber umre yaptı." },
  { id: "urve", ad: "Urve b. Mes'ûd", serit: "taif", hicri: { yil: 9 }, miladi: { yil: 630 }, yaklasik: true, bilgi: "Sakif'in ileri gelenlerinden Urve, Medine yolunda Müslüman oldu; kavmini davet etmek için Taif'e döndü ve orada okla vurularak şehit edildi." },
  { id: "tebuk", ad: "Tebük seferi", serit: "medine", hicri: { yil: 9, ay: 7 }, miladi: { yil: 630, ay: 10 }, bilgi: "Bizans'a karşı yaklaşık 30.000 kişilik sefer; Arap yarımadasında Müslümanların gücü kesinleşti." },
  { id: "heyet", ad: "Sakif heyeti", serit: "taif", hicri: { yil: 9, ay: 9 }, miladi: { yil: 630, ay: 12 }, bilgi: "Abd Yâlîl başkanlığındaki Sakif heyeti Medine'ye gelip Müslüman oldu. Bu yıl, pek çok kabile heyetinin geldiği için “Heyetler yılı” olarak anılır." },
  { id: "lat", ad: "Lât'ın yıkılması", serit: "taif", hicri: { yil: 9, ay: 10 }, miladi: { yil: 631, ay: 1 }, yaklasik: true, bilgi: "Muğîre b. Şu'be ve Ebû Süfyân, Taif'teki Lât putunu yıktı; Taif halkı Müslüman oldu." },
  { id: "veda", ad: "Veda haccı", serit: "medine", hicri: { yil: 10, ay: 12, gun: 9 }, miladi: { yil: 632, ay: 3 }, bilgi: "Hz. Peygamber'in son haccı; yaklaşık 100.000 kişi katıldı." },
];

export const olay = (id) => OLAYLAR.find((o) => o.id === id);

// Hicrî takvimin başlangıcı: 1 Muharrem 1 = 16 Temmuz 622 (Jülyen). Ortalama hicrî yıl 354,367 gün.
export const HICRI_BASLANGIC = 622 + 196 / 365.25;
export const HICRI_YIL_GUN = 354.367;
export const HICRI_AY_GUN = 29.5306;

/** Hicrî tarihi ondalık milâdî yıla çevirir (yaklaşık; ay ya da gün yoksa ortası alınır) */
export function hicridenMiladi({ yil, ay, gun }) {
  const ayKesri = ay == null ? 6 : ay - 1 + (gun == null ? 0.5 : (gun - 1) / HICRI_AY_GUN);
  const gunler = (yil - 1) * HICRI_YIL_GUN + ayKesri * HICRI_AY_GUN;
  return HICRI_BASLANGIC + gunler / 365.25;
}

/** {yil, ay?} → ondalık yıl (ay yoksa yıl ortası) */
export const miladiOndalik = ({ yil, ay }) => (ay == null ? yil + 0.5 : yil + (ay - 0.5) / 12);

/** Nübüvvet yılı → yaklaşık milâdî yıl (ilk vahiy 610) */
export const nubuvvettenMiladi = (n) => 609 + n;

/** Olayın sıralamada kullanılan ondalık yılı */
export const olayYili = (o) => (o.hicri?.gun != null || o.hicri?.ay != null ? hicridenMiladi(o.hicri) : miladiOndalik(o.miladi));

export function tarihYaz(o) {
  const m = o.miladi.ay ? `${MILADI_AYLAR[o.miladi.ay - 1]} ${o.miladi.yil}` : `${o.miladi.yil}`;
  const h = o.hicri ? ` · H. ${o.hicri.ay ? `${HICRI_AYLAR[o.hicri.ay - 1]} ` : ""}${o.hicri.yil}` : o.nubuvvet ? ` · nübüvvetin ${o.nubuvvet}${o.nubuvvetBit ? `–${o.nubuvvetBit}` : ""}. yılı` : "";
  return `${o.yaklasik ? "yaklaşık " : ""}${m}${o.miladiBit ? `–${o.miladiBit.yil}` : ""}${h}`;
}

// Yerler: [lon, lat]. Antik yer adlarının günümüzdeki konumu yaklaşıktır.
export const YERLER = [
  { id: "mekke", ad: "Mekke", lon: 39.8262, lat: 21.4225, renk: "#ffb547", r: 8, yon: "sol", rakim: 277 },
  { id: "taif", ad: "Taif", lon: 40.4158, lat: 21.2703, renk: "#5ad38b", r: 8, yon: "sag", rakim: 1879 },
  { id: "medine", ad: "Medine", lon: 39.6111, lat: 24.4672, renk: "#4fc3f7", r: 7, yon: "sag" },
  { id: "cidde", ad: "Cidde", lon: 39.1925, lat: 21.4858, renk: "#a9b6c9", r: 5, yon: "sol" },
  { id: "ukaz", ad: "Ukaz panayırı", lon: 40.55, lat: 21.60, renk: "#ffd166", r: 5, yon: "sag", yaklasik: true },
  { id: "nahle", ad: "Nahle", lon: 40.10, lat: 21.55, renk: "#b89cff", r: 5, yon: "ust", yaklasik: true },
  { id: "karn", ad: "Karnü's-seâlib", lon: 40.42, lat: 21.63, renk: "#b89cff", r: 5, yon: "ust", yaklasik: true },
  { id: "cirane", ad: "Ci'râne", lon: 39.96, lat: 21.56, renk: "#4fc3f7", r: 5, yon: "ust", yaklasik: true },
  { id: "huneyn", ad: "Huneyn vadisi", lon: 40.06, lat: 21.47, renk: "#ff6b6b", r: 5, yon: "alt", yaklasik: true },
];
export const yer = (id) => YERLER.find((y) => y.id === id);

/** Kuş uçuşu uzaklık (haversine, km) */
export function uzaklik(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Grafik: olaylarda bir arada bulunan Müslüman sayısı (yaklaşık; rivayetler farklıdır)
export const SAYILAR = [
  { id: "taif", ad: "Taif yolculuğu", yil: 619, sayi: 2, not: "Hz. Peygamber ve Zeyd b. Hârise" },
  { id: "akabe1", ad: "1. Akabe", yil: 621, sayi: 12 },
  { id: "akabe2", ad: "2. Akabe", yil: 622, sayi: 75 },
  { id: "bedir", ad: "Bedir", yil: 624, sayi: 313, yaklasik: true, not: "rivayetler 305–317" },
  { id: "fetih", ad: "Mekke'nin fethi", yil: 630, sayi: 10000 },
  { id: "huneyn", ad: "Huneyn", yil: 630, sayi: 12000 },
  { id: "tebuk", ad: "Tebük", yil: 630, sayi: 30000 },
  { id: "veda", ad: "Veda haccı", yil: 632, sayi: 100000, yaklasik: true, not: "rivayetler 40.000–120.000 arası" },
  { id: "bugun", ad: "Bugün dünyada", yil: 2025, sayi: 2e9, yaklasik: true, not: "yaklaşık 1,9–2 milyar" },
];

/** Bir sayıyı okunur Türkçe biçimde yazar */
export function sayiYaz(n) {
  if (n >= 1e9) return `${(n / 1e9).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} milyar`;
  return n.toLocaleString("tr-TR");
}
