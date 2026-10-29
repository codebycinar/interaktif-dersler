// Dersin sayısal modelleri ve sınıflandırma verileri — tests/bio10-u1c-solunum-fermantasyon.test.mjs ile doğrulanır.
// Değerler ders kitaplarındaki yaklaşık değerlerdir; sayılar temsilî, eğilimler bilimsel modellerle uyumludur.

/* ------------------------------------------------------------------ */
/* 1. Oksijenli solunum: bir glikoz molekülünün yolculuğu                */
/* ------------------------------------------------------------------ */
/**
 * Basamaklar ve bir glikoz için ürünler. ETS'de oluşan ATP sayısı tek bir sabit değildir:
 * eski ders kitapları NADH başına 3, FADH₂ başına 2 ATP sayar (toplam 38); güncel ölçümler
 * yaklaşık 2,5 ve 1,5 verir (toplam ~30–32). Ders, ikisini de “en fazla” değer olarak gösterir.
 */
export const BASAMAKLAR = [
  { ad: "glikoliz", metin: "Glikoliz", yer: "Sitoplazma", o2: false, atp: 2, nadh: 2, fadh2: 0, co2: 0, karbon: "6C → 2 × 3C (piruvat)" },
  { ad: "piruvat", metin: "Piruvatın oksidasyonu", yer: "Mitokondri matriksi", o2: true, atp: 0, nadh: 2, fadh2: 0, co2: 2, karbon: "2 × 3C → 2 × 2C (asetil-KoA) + 2 CO₂" },
  { ad: "krebs", metin: "Krebs döngüsü", yer: "Mitokondri matriksi", o2: true, atp: 2, nadh: 6, fadh2: 2, co2: 4, karbon: "2 × 2C → 4 CO₂" },
  { ad: "ets", metin: "Elektron taşıma sistemi", yer: "Mitokondri iç zarı", o2: true, atp: null, nadh: 0, fadh2: 0, co2: 0, karbon: "karbon yok; O₂ son elektron alıcısı, su oluşur" },
];
export const ETS_VERIMI = { klasik: { nadh: 3, fadh2: 2 }, guncel: { nadh: 2.5, fadh2: 1.5 } };

/** Basamakların toplam ürünleri (glikoz başına) */
export function toplamUrun(kadar = BASAMAKLAR.length) {
  const t = { atp: 0, nadh: 0, fadh2: 0, co2: 0 };
  for (const b of BASAMAKLAR.slice(0, kadar)) for (const k of Object.keys(t)) t[k] += b[k] ?? 0;
  return t;
}
/** Bir glikozdan elde edilebilecek en fazla ATP (substrat düzeyi + ETS) */
export function atpVerimi(olcut = "klasik") {
  const { nadh, fadh2 } = ETS_VERIMI[olcut];
  const t = toplamUrun();
  return t.atp + t.nadh * nadh + t.fadh2 * fadh2;
}
/** Karbon sayacı: i. basamak bittikten sonra organik moleküllerdeki C ve açığa çıkan CO₂ */
export function karbonDurumu(i) {
  const co2 = toplamUrun(i).co2;
  return { organik: 6 - co2, co2 };
}
/**
 * O₂ yoksa ETS durur; NADH yeniden NAD⁺'ya dönüşemediği için piruvat oksidasyonu ve Krebs döngüsü de durur.
 * Glikoliz ancak fermantasyonla NAD⁺ yenilenirse sürer.
 */
export function calisanBasamaklar(o2Var) {
  return BASAMAKLAR.filter((b) => o2Var || !b.o2).map((b) => b.ad);
}

/* ------------------------------------------------------------------ */
/* 2. Besinlerin solunuma giriş kapıları                                */
/* ------------------------------------------------------------------ */
export const KAPILAR = [
  { ad: "glikoliz", baslik: "Glikolizin başı" },
  { ad: "ara", baslik: "Glikolizin ara basamağı" },
  { ad: "asetil", baslik: "Asetil-KoA" },
  { ad: "cok", baslik: "Piruvat, asetil-KoA ya da Krebs" },
];
export const BESIN_GIRIS = [
  { ad: "Glikoz", kapi: "glikoliz", grup: "karbonhidrat", neden: "Glikoz, glikolizin başlangıç maddesidir." },
  { ad: "Nişasta (sindirilince)", kapi: "glikoliz", grup: "karbonhidrat", neden: "Nişasta sindirilince glikozlara ayrılır; glikoz glikolize girer." },
  { ad: "Glikojen (depodan)", kapi: "glikoliz", grup: "karbonhidrat", neden: "Kas ve karaciğerdeki glikojen glikoza ayrılarak glikolize girer." },
  { ad: "Gliserol", kapi: "ara", grup: "yag", neden: "Gliserol, glikolizin ara basamaklarındaki 3 karbonlu bir moleküle dönüşerek katılır." },
  { ad: "Yağ asidi", kapi: "asetil", grup: "yag", neden: "Yağ asitleri iki karbonlu parçalara ayrılarak asetil-KoA olarak Krebs döngüsüne girer." },
  { ad: "Amino asit (NH₃ ayrıldıktan sonra)", kapi: "cok", grup: "protein", neden: "Amino asidin azotlu grubu (NH₃) ayrılır; kalan karbon iskeleti türüne göre piruvat, asetil-KoA ya da Krebs ara maddesi olarak katılır." },
];
/** 1 g besinden açığa çıkan yaklaşık enerji (kcal) */
export const KCAL_G = { karbonhidrat: 4, protein: 4, yag: 9 };
export const KJ_KCAL = 4.184;

/* ------------------------------------------------------------------ */
/* 3. Kas: oksijen yetmezse laktik asit fermantasyonu                   */
/* ------------------------------------------------------------------ */
/**
 * Kasın ATP ihtiyacı (I, aerobik kapasitenin katı) oksijenli solunumla karşılanamadığında fark
 * laktik asit fermantasyonuyla kapatılır. Oksijen alımı egzersizin başında hemen artmaz (τ saniye).
 * ATP verimi: oksijenli ~30, fermantasyon 2 ATP/glikoz.
 */
export const KAS = { tau: 20, atpOksijenli: 30, atpFermantasyon: 2 };
export function kasAdim(d, I, dt, k = KAS) {
  const kapasite = Math.min(I, 1) * (1 - Math.exp(-(d.t + dt) / k.tau));
  const oksijenli = Math.min(I, kapasite), fermantasyon = Math.max(0, I - oksijenli);
  const glikoz = (oksijenli / k.atpOksijenli + fermantasyon / k.atpFermantasyon) * dt;
  return {
    t: d.t + dt,
    oksijenli, fermantasyon,
    glikoz: d.glikoz + glikoz,
    laktat: d.laktat + 2 * (fermantasyon / k.atpFermantasyon) * dt,
  };
}
export const kasBaslangic = () => ({ t: 0, oksijenli: 0, fermantasyon: 0, glikoz: 0, laktat: 0 });

/* ------------------------------------------------------------------ */
/* 4. Maya ile etil alkol fermantasyonu (balon deneyi)                  */
/* ------------------------------------------------------------------ */
/**
 * Hız (g şeker / saat) = maya · Vmax · f(T) · S / (Km + S)
 * Vmax ≈ 0,4 g şeker / g maya / saat; optimum ~35 °C, 50 °C ve üstünde maya ölür.
 * Sakkaroz glikoz + fruktoza ayrılır; her heksoz 2 CO₂ verir. 25 °C'de 1 mol gaz ≈ 24,5 L.
 */
export const MAYA = { Vmax: 0.4, Km: 0.5, Tmin: 4, Topt: 35, Tmax: 50, molHacim: 24.5, sakkarozMol: 342.3 };
export const CO2_ML_G = (4 * MAYA.molHacim * 1000) / MAYA.sakkarozMol; // ≈ 286 mL CO₂ / g sakkaroz
export function mayaSicaklik(T, m = MAYA) {
  if (T <= m.Tmin || T >= m.Tmax) return 0;
  // Yan–Hunt eğrisi: Topt'ta 1, Tmin ve Tmax'ta 0
  const a = (m.Tmax - T) / (m.Tmax - m.Topt), b = (T - m.Tmin) / (m.Topt - m.Tmin);
  return a * b ** ((m.Topt - m.Tmin) / (m.Tmax - m.Topt));
}
/** Şişe durumunu dt saat ilerletir. s: { seker (g), maya (g), T (°C), co2 (mL) } */
export function mayaAdim(s, dt, m = MAYA) {
  const hiz = s.maya * m.Vmax * mayaSicaklik(s.T, m) * (s.seker / (m.Km + s.seker));
  const harcanan = Math.min(s.seker, hiz * dt);
  return { ...s, seker: s.seker - harcanan, co2: s.co2 + harcanan * CO2_ML_G };
}
export function mayaDeney(sise, saat = 1, adim = 1 / 60) {
  let s = { ...sise, co2: 0 };
  const seri = [[0, 0]];
  for (let t = adim; t <= saat + 1e-9; t += adim) { s = mayaAdim(s, adim); seri.push([t * 60, s.co2]); }
  return { son: s, seri };
}
/** Deney tasarımı denetimi: yalnızca bir değişken farklı mı, en az 3 düzeyi var mı? */
export const DEGISKENLER = ["T", "seker", "maya"];
export function tasarimDenetle(siseler) {
  const farkli = DEGISKENLER.filter((d) => new Set(siseler.map((s) => s[d])).size > 1);
  if (farkli.length === 0) return { gecerli: false, neden: "hepsi-ayni" };
  if (farkli.length > 1) return { gecerli: false, neden: "cok-degisken", farkli };
  const duzey = new Set(siseler.map((s) => s[farkli[0]])).size;
  if (duzey < 3) return { gecerli: false, neden: "az-duzey", degisken: farkli[0] };
  return { gecerli: true, degisken: farkli[0] };
}

/* ------------------------------------------------------------------ */
/* 5. Enerji bütçesi                                                    */
/* ------------------------------------------------------------------ */
/** Porsiyon başına yaklaşık makro besin değerleri (g); kaynak: genel besin tabloları, temsilî */
export const YIYECEKLER = [
  { ad: "Ekmek (2 dilim)", k: 25, p: 4, y: 1 },
  { ad: "Beyaz peynir (30 g)", k: 0.5, p: 5, y: 6 },
  { ad: "Haşlanmış yumurta", k: 0.5, p: 6, y: 5 },
  { ad: "Mercimek çorbası", k: 20, p: 9, y: 4 },
  { ad: "Pilav (1 tabak)", k: 45, p: 4, y: 5 },
  { ad: "Kuru fasulye", k: 30, p: 12, y: 8 },
  { ad: "Izgara tavuk (100 g)", k: 0, p: 27, y: 4 },
  { ad: "Yoğurt (1 kase)", k: 9, p: 7, y: 6 },
  { ad: "Elma", k: 20, p: 0.3, y: 0.2 },
  { ad: "Ceviz (30 g)", k: 4, p: 4.5, y: 19 },
  { ad: "Patates kızartması", k: 40, p: 4, y: 17 },
  { ad: "Gazlı içecek (330 mL)", k: 35, p: 0, y: 0 },
  { ad: "Çikolata (40 g)", k: 23, p: 3, y: 12 },
  { ad: "Ayran", k: 6, p: 4, y: 3.5 },
];
export const besinEnerjisi = ({ k, p, y }) => k * KCAL_G.karbonhidrat + p * KCAL_G.protein + y * KCAL_G.yag;
export function tabakOzeti(tabak) {
  const t = { k: 0, p: 0, y: 0 };
  for (const [i, n] of tabak) { const f = YIYECEKLER[i]; t.k += f.k * n; t.p += f.p * n; t.y += f.y * n; }
  const kcal = besinEnerjisi(t);
  const oran = kcal ? { k: (4 * t.k) / kcal, p: (4 * t.p) / kcal, y: (9 * t.y) / kcal } : { k: 0, p: 0, y: 0 };
  return { ...t, kcal, oran };
}
/** MET değerleri (Ainsworth vd., yetişkin değerleri; temsilî) */
export const MET = { uyku: 0.95, oturma: 1.3, yuruyus: 3.5, spor: 7 };
/** Günlük enerji harcaması (kcal) ≈ Σ MET × kütle (kg) × süre (saat) */
export function gunlukHarcama(kg, { uyku = 8, yuruyus = 1, spor = 1 } = {}) {
  const oturma = Math.max(0, 24 - uyku - yuruyus - spor);
  return kg * (MET.uyku * uyku + MET.oturma * oturma + MET.yuruyus * yuruyus + MET.spor * spor);
}
/** Karbonhidratın önerilen enerji payı aralığı */
export const KARB_ARALIK = [0.45, 0.65];

/* ------------------------------------------------------------------ */
/* 6. Sınıflandırma verileri                                            */
/* ------------------------------------------------------------------ */
export const URUNLER = [
  { ad: "Yoğurt", tur: "laktik", neden: "Yoğurt bakterileri sütteki şekeri laktik aside dönüştürür; süt proteinleri pıhtılaşır." },
  { ad: "Peynir", tur: "laktik", neden: "Peynir yapımında laktik asit bakterileri sütü ekşitir." },
  { ad: "Turşu", tur: "laktik", neden: "Tuzlu suda laktik asit bakterileri sebzedeki şekerleri laktik aside dönüştürür; ortamın asitliği bozulmayı önler." },
  { ad: "Şalgam suyu", tur: "laktik", neden: "Şalgam suyu, mor havuç ve bulgur unundan laktik asit fermantasyonuyla yapılır." },
  { ad: "Ekmek hamurunun kabarması", tur: "alkol", neden: "Maya, şekerleri etil alkol ve CO₂'ye dönüştürür; CO₂ hamuru kabartır, alkol fırında buharlaşır." },
  { ad: "Kefir", tur: "ikisi", neden: "Kefir tanelerinde hem laktik asit bakterileri hem mayalar bulunur; az miktarda etil alkol ve CO₂ de oluşur." },
  { ad: "Boza", tur: "ikisi", neden: "Boza yapımında mayalar ve laktik asit bakterileri birlikte çalışır." },
];

export const OLAYLAR = [
  { metin: "Kas hücresinin kasılması", atp: true, neden: "Kas proteinlerinin birbiri üzerinde kayması ATP harcar." },
  { metin: "Ribozomda protein sentezi", atp: true, neden: "Amino asitlerin bağlanması (biyosentez) enerji ister." },
  { metin: "Sinir hücresinde impuls iletimi", atp: true, neden: "İmpulstan sonra Na⁺ ve K⁺ iyonlarını pompalarla eski yerine taşımak ATP harcar." },
  { metin: "Böbrekte glikozun geri emilimi", atp: true, neden: "Glikoz, derişimin az olduğu yerden çok olduğu yere aktif taşımayla alınır." },
  { metin: "DNA'nın eşlenmesi", atp: true, neden: "Nükleotitlerin bağlanması enerji gerektirir." },
  { metin: "O₂'nin alveolden kana geçmesi", atp: false, neden: "O₂, çok olduğu yerden az olduğu yere difüzyonla geçer; ATP harcanmaz." },
  { metin: "Suyun hücreye osmozla girmesi", atp: false, neden: "Osmoz pasif taşımadır, ATP harcanmaz." },
  { metin: "CO₂'nin dokudan kana geçmesi", atp: false, neden: "CO₂ de difüzyonla geçer." },
];

/** Dinlenme hâlinde ATP tüketiminin yaklaşık dağılımı (Rolfe ve Brown 1997'den yuvarlanmış; %) */
export const ATP_DAGILIM = [
  { ad: "Protein sentezi", pay: 28 },
  { ad: "Na⁺/K⁺ pompası", pay: 23 },
  { ad: "Karaciğerde glikoz yapımı", pay: 8 },
  { ad: "Ca²⁺ pompası", pay: 6 },
  { ad: "Kas kasılması (dinlenmede)", pay: 5 },
  { ad: "Üre yapımı", pay: 3 },
  { ad: "Diğer (DNA/RNA sentezi, taşıma…)", pay: 27 },
];
