// 10. Sınıf Tarih · 1. Ünite: Türkistan'dan Türkiye'ye (1040–1299) — 2. ders
// TAR.10.1.3 sosyoekonomik hayat, yerleşme ve şehirleşme (araştırma süreci) · TAR.10.1.4 Türk-İslam medeniyeti
import { dersBaslat, el } from "../../../../engine/ders.js";
import { haritaKur, isaret, cizgi, svg, etiketleriYerlestir, uyariKutusu } from "../ortak/harita.js";
import { tahta, siniflandirma, secmeli, payHesapla } from "../ortak/bilesenler.js";
import { cizgiyeUzaklik, cizgiUzunlugu, cizgiUzerinde } from "../ortak/cografi.js";
import { sehir, medrese, kervansaray, oba, kale, katedral, ordu, kervan, koy, yolNoktasi } from "../ortak/nesneler.js";
import {
  KAVRAMLAR, KONULAR, KAYNAK_DOSYASI, IDDIALAR, KARARLAR, KERVAN_YOLU, YOL_SEHIRLERI, GERCEK_HANLAR, GUNLUK_YOL,
  AHI_OLAYLARI, MEDENIYET, MERKEZLER, KANITLAR, YARGILAR, DOGRU_YARGI, KISILER,
} from "./veri.js";
import { anlatimEkle } from "../ortak/anlat.js";
import { ANLAT } from "./anlat.js";

const SOLUK = { ulkeSinif: () => "soluk" };
const ANADOLU = [[26.5, 35.6], [44.8, 42.2]];
const ORTA_ANADOLU = [[30.6, 36.4], [39, 40.4]];
const SAG = payHesapla({ sagTahta: true });

/** Bağlam için birkaç Selçuklu şehri (bugünkü adlarıyla) */
const SEHIRLER = [
  { ad: "Konya", konum: [32.48, 37.87] }, { ad: "Kayseri", konum: [35.49, 38.72] }, { ad: "Sivas", konum: [37.02, 39.75] },
  { ad: "Aksaray", konum: [34.03, 38.37] }, { ad: "Kırşehir", konum: [34.16, 39.15] }, { ad: "Antalya", konum: [30.71, 36.89] },
  { ad: "Alanya", konum: [32.0, 36.54] }, { ad: "Sinop", konum: [35.15, 42.02] }, { ad: "Malatya", konum: [38.31, 38.35] },
  { ad: "Erzurum", konum: [41.27, 39.9] },
];
const TUM_SEHIRLER = SEHIRLER.map((s) => s.ad);
/* ---------- 3B maketler ---------- */
/** Eser türüne göre maket: medrese, şifahane, zaviye, kervansaray, külliye, oba, çarşılı şehir */
const MAKET = {
  medrese: () => medrese(), sifahane: () => medrese({ minare: false }), tekke: () => medrese({ minare: false }),
  kervansaray: () => kervansaray(), vakif: () => medrese(), konargocer: () => oba({ sayi: 7 }), ahilik: () => sehir({ ev: 22, cami: false, yaricap: 0.45 }),
  katedral: () => katedral(), kale: () => kale(), ordu: () => ordu({ sayi: 30, renk: "#4b4f57", sancak: "#2a2a2a" }),
};
/** Bağlam şehirleri: maket şehirler */
function sehirMaketleri(g, h, adlar, boy = 5) {
  SEHIRLER.forEach((s, i) => { if (adlar.includes(s.ad)) koy(h, g, sehir({ ev: s.ad === "Konya" ? 45 : 28, sur: s.ad === "Konya", tohum: i + 3 }), s.konum, { boy }); });
}

/** Etiketlerin yerleşebileceği alan: tahtanın kapattığı kenar dışarıda kalır */
const alanSiniri = (h, pay) => h.gorunur(pay || null);
/** Bağlam şehirlerinin etiket öğeleri (yer kalmazsa adı yazılmaz) */
const sehirOgeleri = (h, adlar) => SEHIRLER.filter((s) => adlar.includes(s.ad))
  .map((s) => ({ p: h.xy(s.konum), metin: s.ad, r: 2.6, renk: "#a9b6c9", sinif: "kucuk soluk", atla: true }));
/**
 * İşaretleri çizip etiketlerini çakışmadan yerleştiren katman.
 * ogelerFn() → [{ konum, ad, renk?, r?, nabiz?, sinif? }]; sehir: arkada soluk gösterilecek şehirler
 */
function isaretKatmani(h, ad, ogelerFn, { sehir = [], pay } = {}) {
  return h.katman(ad, (g) => {
    const liste = ogelerFn().map((o) => {
      const [x, y] = h.xy(o.konum), [dx, dy] = o.kay || [0, 0]; // kay: aynı yerdeki işaretleri ayırmak için piksel kayması
      return { ...o, p: [x + dx, y + dy], metin: o.ad, r: o.r ?? 5.5 };
    });
    const arka = sehirOgeleri(h, sehir);
    for (const o of [...arka, ...liste]) isaret(g, o.p, { r: o.r, renk: o.renk || "#ffb547", nabiz: o.nabiz });
    etiketleriYerlestir(g, h, [...liste, ...arka], { engeller: uyariKutusu(h), sinir: alanSiniri(h, pay) });
  });
}
/** Kutu ızgarası gizli deste: sonuçları kutular yerine harita gösterir */
function haritaliDeste(t, ayar) {
  const kap = el("div", { class: "tar-gizli-kutular" });
  t.append(kap);
  return siniflandirma(kap, ayar);
}
const kisalt = (m, n = 46) => {
  const ilk = m.split(/[;:]/)[0];
  return ilk.length > n ? `${ilk.slice(0, n).replace(/\s+\S*$/, "")}…` : ilk;
};

/* Öğrencinin merak konusu: 1. adımda seçilir, 2. adımı biçimlendirir; cihazda saklanır */
const KONU_ANAHTARI = "edu-tar10-u1b-konu";
const konuOku = () => { try { return localStorage.getItem(KONU_ANAHTARI); } catch { return null; } };
const konuYaz = (v) => { try { localStorage.setItem(KONU_ANAHTARI, v); } catch { /* özel pencere vb. */ } };
let secilenKonu = KONULAR.some((k) => k.id === konuOku()) ? konuOku() : null;

/** 1. adımda doğru bilinen kavramın haritadaki örneği */
const ORNEKLER = {
  ahilik: { ad: "Ahi Evran (Kırşehir)", konum: [34.16, 39.15] },
  medrese: { ad: "Karatay Medresesi (Konya)", konum: [32.49, 37.87] },
  sifahane: { ad: "Gevher Nesibe Şifahanesi (Kayseri)", konum: [35.49, 38.72] },
  tekke: { ad: "Hacı Bektaş zaviyesi", konum: [34.56, 38.94] },
  kervansaray: { ad: "Sultanhanı (1229)", konum: [33.55, 38.25] },
  vakif: { ad: "Divriği külliyesi (vakıf)", konum: [38.12, 39.37] },
  konargocer: { ad: "Toros yaylaları", konum: [33.1, 37.05] },
};

/** 2. adımda konuya göre haritada öne çıkan yerler */
const KONU_YERLERI = {
  ticaret: [["Sultanhanı", [33.55, 38.25]], ["Antalya limanı (1207)", [30.71, 36.89]], ["Sinop limanı (1214)", [35.15, 42.02]], ["Kayseri", [35.49, 38.72]]],
  ahilik: [["Kırşehir: Ahi Evran", [34.16, 39.15]], ["Konya", [32.48, 37.87]], ["Kayseri", [35.49, 38.72]], ["Antalya", [30.71, 36.89]]],
  yerlesme: [["Toros yaylaları", [33.1, 37.05]], ["Batı uçları", [30.3, 39.7]], ["Orta Anadolu kışlakları", [33.9, 38.9]]],
  vakif: [["Kayseri: Gevher Nesibe", [35.49, 38.72]], ["Divriği", [38.12, 39.37]], ["Sivas", [37.02, 39.75]], ["Konya", [32.48, 37.87]]],
};

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Selçuklu şehrinde bir gün: kavramlar",
    cikti: "TAR.10.1.3-a",
    anlatim: `
      <p>13. yüzyılda Konya'dan Kayseri'ye giden bir kervanla yolculuk ettiğini düşün. Yolda <b>kervansaraylarda</b> konaklarsın; şehirlerde <b>medreseler</b>, <b>şifahaneler</b>, <b>Ahi</b> esnafının dükkânlarını görürsün. Bu yapıların çoğunu <b>vakıflar</b> yaşatır.</p>
      <p>Kartta bir tanım göreceksin: hangi kavrama ait olduğunu seç. Doğru bildiğinde haritada o kavramın bir örneği belirir.</p>
      <p>Sonra bu derste en çok neyi <b>merak ettiğini</b> seç: araştırmanı o konu üzerine kuracaksın.</p>`,
    gorev: "Sekiz kavramı tanımlarıyla eşleştir ve araştırmak istediğin <b>merak konusunu</b> seç.",
    ogretmen: "Program, öğrencilerin sosyoekonomik faaliyetler ile yerleşme ve şehirleşme arasındaki ilişki hakkında merak ettikleri konuları belirlemesini istiyor. Seçilen konu cihazda saklanır ve 2. adımdaki soruları biçimlendirir. Haritadaki örnek yapıların konumları yaklaşıktır.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: [[31.6, 36.7], [38.8, 39.9]], ...SOLUK, pay: SAG });
      h.uyari("Örnek yapıların konumları <b>yaklaşıktır</b>; şehir adları bugünkü adlardır.");
      const bulunan = [];
      let desteTamam = false;
      const k = isaretKatmani(h, "ornekler", () => bulunan.filter((id) => ORNEKLER[id])
        .map((id) => ({ ...ORNEKLER[id], nabiz: id === bulunan[bulunan.length - 1] })), { sehir: TUM_SEHIRLER, pay: SAG });
      const maket = h.model("ornekler", (g) => {
        sehirMaketleri(g, h, ["Konya", "Kayseri", "Aksaray", "Sivas"], 4);
        for (const id of bulunan) if (ORNEKLER[id] && MAKET[id]) koy(h, g, MAKET[id](), ORNEKLER[id].konum, { boy: id === "medrese" || id === "sifahane" ? 3.5 : 4.5, yon: 20 });
      });
      const t = tahta(ctx, { baslik: "Bu tanım hangi kavrama ait?", konum: "sag" });
      haritaliDeste(t, {
        soru: "Tanım",
        kutular: KAVRAMLAR.map((x) => ({ id: x.id, ad: x.ad })),
        ogeler: KAVRAMLAR.map((x) => ({
          id: x.id, kutu: x.id, metin: x.tanim,
          aciklama: ORNEKLER[x.id] ? `Haritada bir örneği: <b>${ORNEKLER[x.id].ad}</b>.` : "Fütüvvetnameler bu ahlak kurallarını yazıya geçiren eserlerdir.",
          ipucu: "Tanımdaki anahtar sözcüğe bak: kim, nerede, ne için?",
        })),
        yerlesti: (o) => { bulunan.push(o.id); k.yenile(); maket.yenile(); },
        bitti: () => { desteTamam = true; kontrol(); },
      });
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.secenekler({
        etiket: "Hangi konuyu araştırmak istersin?",
        liste: KONULAR.map((x) => ({ deger: x.id, metin: x.ad })),
        deger: secilenKonu,
        degisti: (v) => { secilenKonu = v; konuYaz(v); kontrol(); },
      });
      ctx.kontroller.append(geri);
      function kontrol() {
        geri.className = `d-geri-bildirim ${secilenKonu ? "dogru" : ""}`;
        geri.textContent = secilenKonu ? `Merak konun: ${KONULAR.find((x) => x.id === secilenKonu).ad}` : "Henüz bir konu seçmedin.";
        if (desteTamam && secilenKonu) ctx.gorevTamam();
      }
      kontrol();
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Araştırma sorusu sor",
    cikti: "TAR.10.1.3-b",
    anlatim: `
      <p>Her soru aynı değerde değildir. “Sultanhanı hangi yıl yapıldı?” sorusunun cevabı <b>tek bir bilgidir</b>. “Kervan yolları şehirlerin büyümesini <b>nasıl etkiledi?</b>” sorusu ise iki şey arasında <b>ilişki</b> kurmanı ister: bu bir <b>araştırma sorusudur</b>.</p>
      <p>Merak konunla ilgili soruları ayır. Sonra kendi araştırma sorunu yaz: sosyoekonomik hayat (ticaret, zanaat, hayvancılık…) ile yerleşme ve şehirleşme arasında bir bağ kursun.</p>`,
    gorev: "Altı soruyu ayır ve <b>kendi araştırma sorunu</b> yaz (nasıl/neden gibi bir ilişki sorusu, sonunda soru işareti).",
    ogretmen: "Program, öğrencilerin ilgili konular hakkında soru sormasını istiyor. Bilgi soruları araştırmada gereklidir ama tek başına yeterli değildir; araştırma sorusu ilişki kurmalıdır. Öğrencilerin yazdığı soruları sınıfta paylaşıp birlikte iyileştirebilirsiniz.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: ANADOLU, ...SOLUK, pay: SAG });
      h.model("sehirler", (g) => sehirMaketleri(g, h, ["Konya", "Kayseri", "Sivas", "Antalya", "Sinop", "Erzurum", "Malatya"], 3.5));
      let konu = KONULAR.find((x) => x.id === secilenKonu) || KONULAR[0];
      let desteTamam = false, soruTamam = false;
      const yol = h.katman("yol", (g) => { if (konu.id === "ticaret") cizgi(g, h, KERVAN_YOLU, { renk: "sari", kesikli: true }); });
      const yerler = isaretKatmani(h, "konu", () => KONU_YERLERI[konu.id].map(([ad, konum]) => ({ ad, konum, renk: "#4fc3f7" })), { sehir: TUM_SEHIRLER, pay: SAG });
      const k = { yenile: () => { yol.yenile(); yerler.yenile(); } };
      const t = tahta(ctx, { konum: "sag" });
      const secim = ctx.secenekler({ etiket: "Merak konun", liste: KONULAR.map((x) => ({ deger: x.id, metin: x.ad })), deger: konu.id, degisti: (v) => { secilenKonu = v; konuYaz(v); kur(); } });
      const geri = el("div", { class: "d-geri-bildirim" });
      function kur() {
        konu = KONULAR.find((x) => x.id === secilenKonu) || KONULAR[0];
        secim.deger = konu.id;
        desteTamam = false;
        k.yenile();
        t.replaceChildren(el("h3", {}, konu.ad));
        siniflandirma(t, {
          soru: "Bu soru hangi türde?",
          kutular: [{ id: "bilgi", ad: "Bilgi sorusu" }, { id: "iliski", ad: "Araştırma sorusu" }],
          ogeler: konu.sorular.map((s, j) => ({
            id: `${konu.id}-${j}`, kutu: s.tur, metin: s.metin,
            aciklama: s.tur === "bilgi" ? "Tek bir bilgiyle cevaplanır." : "İki olgu arasında ilişki kuruyor; cevabı bir açıklamadır.",
            ipucu: "Cevabı tek bir yıl, yer ya da ad mı; yoksa bir açıklama mı?",
          })),
          bitti: () => { desteTamam = true; kontrol(); },
        });
      }
      ctx.yaziAlani({
        etiket: "<b>Benim araştırma sorum:</b> Konunla ilgili, ilişki kuran bir soru yaz.",
        anahtar: "u1b-arastirma-sorusu", enAz: 25,
        yeterli: (m) => {
          const s = m.trim().toLocaleLowerCase("tr");
          const iliski = /(nasıl|neden|niçin|niye|hangi ölçüde|ne gibi|etkile|ilişki|katkı|rol)/.test(s);
          soruTamam = iliski && s.endsWith("?");
          geri.className = `d-geri-bildirim ${soruTamam ? "dogru" : "yanlis"}`;
          geri.textContent = soruTamam ? "Bu bir araştırma sorusu: cevabı için kaynak toplaman gerekecek ✓"
            : !s.endsWith("?") ? "Sorunun sonuna soru işareti koy." : "Sorun bir ilişki kursun: “nasıl etkiledi?”, “neden …?” gibi.";
          kontrol();
        },
      });
      ctx.kontroller.append(geri);
      function kontrol() { if (desteTamam && soruTamam) ctx.gorevTamam(); }
      kur();
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Kaynak dosyası: birincil mi, ikincil mi?",
    cikti: "TAR.10.1.3-c",
    anlatim: `
      <p>Sorunun cevabı <b>farklı kaynaklarda</b> saklı: yapıların üzerindeki <b>kitabeler</b>, dönemin <b>tarihçileri</b> ve <b>seyyahları</b>, kazılarda bulunan <b>sikkeler</b>, bugünkü tarihçilerin kitapları…</p>
      <p>Dosyana gelen her kaynağı türüne göre ayır. Dönemden kalan <b>birincil</b> kaynakların bulunduğu yer haritada işaretlenir.</p>`,
    gorev: "Sekiz kaynağın hepsini <b>birincil</b> ya da <b>ikincil</b> olarak doğru ayır.",
    ogretmen: "Program, farklı kaynaklar üzerinden konuya ilişkin bilgi toplanmasını istiyor. İbn Battuta Anadolu'yu 1330'larda, yani Selçuklu döneminin hemen sonrasında gezmiştir; bu, “birincil kaynak tam olarak hangi döneme ait?” tartışması için iyi bir fırsattır. Kaynak özetleri özgün kısa özetlerdir.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: [[30.2, 36.5], [36.4, 39.4]], ...SOLUK, pay: SAG });
      h.model("sehirler", (g) => sehirMaketleri(g, h, ["Konya", "Kayseri", "Aksaray", "Antalya", "Alanya"], 4));
      const bulunan = [];
      const KISA = { kitabe: "Sultanhanı kitabesi", ibnibibi: "İbni Bibi (Konya sarayı)", battuta: "İbn Battuta (Antalya)", sikke: "Sikke (Ağzıkara Han)", gevher: "Gevher Nesibe kitabesi" };
      const k = isaretKatmani(h, "kaynaklar", () => bulunan.map((id) => KAYNAK_DOSYASI.find((x) => x.id === id)).filter((s) => s.konum)
        .map((s) => ({ konum: s.konum, ad: KISA[s.id], renk: "#5ad38b" })), { sehir: ["Konya", "Aksaray", "Kayseri", "Antalya", "Alanya"], pay: SAG });
      const t = tahta(ctx, { baslik: "Kaynak dosyası", konum: "sag" });
      const durum = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(durum);
      siniflandirma(t, {
        soru: "Bu kaynak…",
        kutular: [{ id: "birincil", ad: "Birincil kaynak" }, { id: "ikincil", ad: "İkincil kaynak" }],
        ogeler: KAYNAK_DOSYASI.map((s) => ({ id: s.id, kutu: s.tur, metin: s.ad, alt: s.bilgi, kisa: s.ad, aciklama: s.neden, ipucu: "Kaynak, incelenen dönemden mi kaldı, yoksa sonradan mı hazırlandı?" })),
        yerlesti: (o) => {
          bulunan.push(o.id); k.yenile();
          const b = bulunan.filter((id) => KAYNAK_DOSYASI.find((x) => x.id === id).tur === "birincil").length;
          durum.textContent = `Dosyada ${b} birincil, ${bulunan.length - b} ikincil kaynak`;
        },
        bitti: () => {
          durum.className = "d-geri-bildirim dogru";
          durum.textContent = "Dosya hazır ✓ İyi bir araştırma birincil ve ikincil kaynakları birlikte kullanır.";
          ctx.gorevTamam();
        },
      });
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Bilginin doğruluğunu sına",
    cikti: "TAR.10.1.3-ç",
    anlatim: `
      <p>İnternette, dizilerde, sosyal medyada tarih hakkında pek çok bilgi dolaşır. Hepsi doğru mu?</p>
      <p>Her iddiayı <b>kaynağıyla birlikte</b> değerlendir: Yazarı belli mi? Kaynak gösteriyor mu? Dönemden kalma bir belge mi, kurgu mu?</p>
      <p>Bazı bilgiler doğru olabilir ama kaynağı zayıftır: onları <b>başka kaynaklarla karşılaştırarak doğrulamak</b> gerekir.</p>`,
    gorev: "Altı iddiayı <b>güvenilir / doğrulanmalı / güvenilmez</b> diye ayır ve soruyu cevapla.",
    ogretmen: "Program, öğrencilerin topladıkları bilgilerin doğruluğunu değerlendirmesini istiyor. “Doğrulanmalı” kutusu bilinçli olarak konmuştur: bilginin kendisi doğru olsa bile kaynağı zayıfsa teyit gerekir. Kervanların zararının devletçe karşılanması bilgisi ders kitaplarında da geçer; öğrencilerden bu bilgiyi güvenilir bir kaynakta aramalarını isteyebilirsiniz.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: ANADOLU, ...SOLUK });
      const t = tahta(ctx, { baslik: "Bu bilgiye güvenebilir miyim?" });
      const soruKap = el("div");
      let desteTamam = false;
      siniflandirma(t, {
        soru: "Kaynağıyla birlikte değerlendir:",
        kutular: KARARLAR,
        ogeler: IDDIALAR.map((i) => ({ id: i.id, kutu: i.karar, metin: i.iddia, alt: i.kaynak, kisa: kisalt(i.kaynak, 40), aciklama: i.aciklama, ipucu: "Kaynağın yazarı ve dayanağı belli mi? Kurgu mu, belge mi?" })),
        bitti: () => {
          desteTamam = true;
          t.append(soruKap);
          secmeli(soruKap, {
            soru: "Kaynağı belirsiz bir bilgiyle karşılaştığında en doğru davranış hangisidir?",
            siklar: ["Çok paylaşıldıysa doğru kabul etmek", "Bilgiyi güvenilir ve farklı kaynaklarla karşılaştırıp doğrulamak", "Hiçbir tarih bilgisine güvenmemek"],
            dogru: 1, aciklama: "Bilgiyi farklı ve güvenilir kaynaklarla karşılaştırmak (teyit etmek) tarihçinin temel yöntemidir.",
            yanlisAciklama: (i) => (i === 0 ? "Bir bilginin çok paylaşılması doğru olduğunu göstermez." : "Kaynakları değerlendirerek güvenilir bilgiye ulaşabiliriz."),
            bitti: () => desteTamam && ctx.gorevTamam(),
          });
          t.scrollTop = t.scrollHeight;
        },
      });
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Kervan yolu: hanlar nereye?",
    cikti: "TAR.10.1.3-d",
    anlatim: `
      <p>Yüklü bir kervan bir günde yaklaşık <b>30–40 km</b> yol alabilirdi. Gece yolda kalan kervan hem soğuğa hem eşkıyaya açıktı.</p>
      <p>Sen bir Selçuklu sultanısın: Konya'dan Kayseri'ye giden yol üzerine <b>kervansaraylar</b> kur. Yola dokunarak han ekle, bir hana yeniden dokunarak kaldır. Şehirler de konaklama yeridir.</p>
      <p>Amaç: iki konak yeri arasında <b>${GUNLUK_YOL} km'den uzun</b> aralık kalmasın. Bitirince gerçek hanları göreceksin.</p>`,
    gorev: `Hiçbir aralık ${GUNLUK_YOL} km'yi geçmeyecek şekilde hanları yerleştir; sonra çıkarım sorusunu cevapla.`,
    ogretmen: "Program, toplanan bilgilerden çıkarım yapılmasını istiyor. Güzergâh temsilîdir; gösterilen hanlar yolun bilinen hanlarından yalnızca bir kısmıdır ve konumları yaklaşıktır (aralarında Alay Han gibi başka hanlar da vardır). Öğrencilerin kurduğu han sayısını gerçek dağılımla karşılaştırıp “Devlet bu kadar yapıyı neden yaptırdı?” sorusunu tartıştırın.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: [[31.95, 37.45], [36.05, 39.2]], ...SOLUK });
      h.uyari("Güzergâh <b>temsilîdir</b>; han konumları yaklaşıktır.");
      const uzunluk = cizgiUzunlugu(KERVAN_YOLU);
      const sabit = YOL_SEHIRLERI.map((s) => cizgiyeUzaklik(s.konum, KERVAN_YOLU).konum);
      let hanlar = [], gercek = false;
      const parca = (a, b) => Array.from({ length: 13 }, (_, i) => cizgiUzerinde(KERVAN_YOLU, a + ((b - a) * i) / 12));
      const duraklar = () => [...sabit, ...hanlar].sort((a, b) => a - b);
      const k = h.katman("yol", (g) => {
        const d = duraklar();
        const etiketler = [];
        for (let i = 1; i < d.length; i++) {
          const L = d[i] - d[i - 1], uygun = L <= GUNLUK_YOL;
          cizgi(g, h, parca(d[i - 1], d[i]), { renk: uygun ? "yesil" : "kirmizi", kalinlik: 4 });
          // gerçek hanlar açılınca kalabalık olmasın: yalnızca uzun (kırmızı) aralıkların uzunluğu yazılır
          if (!gercek || !uygun) etiketler.push({ p: h.xy(cizgiUzerinde(KERVAN_YOLU, (d[i] + d[i - 1]) / 2)), metin: `${Math.round(L)} km`, r: 3, sinif: `kucuk ${uygun ? "" : "vurgu"}` });
        }
        KERVAN_YOLU.forEach((q, i) => svg("circle", { class: "tar-yol-nokta", "data-i": i, cx: h.xy(q)[0], cy: h.xy(q)[1], r: 2, fill: "#0b1522" }, g));
        const sehirler = YOL_SEHIRLERI.map((s) => ({ p: h.xy(s.konum), metin: s.ad, r: 7 }));
        for (const s of sehirler) isaret(g, s.p, { r: 7, renk: "#4fc3f7" });
        const hanEl = hanlar.map((km) => {
          const p = h.xy(cizgiUzerinde(KERVAN_YOLU, km));
          svg("rect", { class: "tar-han", x: p[0] - 7, y: p[1] - 7, width: 14, height: 14, rx: 3 }, g);
          return { p, r: 7 };
        });
        const gercekEl = !gercek ? [] : GERCEK_HANLAR.map((r) => {
          const p = h.xy(r.konum);
          svg("rect", { x: p[0] - 5, y: p[1] - 5, width: 10, height: 10, fill: "#b89cff", stroke: "#0b1522", "stroke-width": 1.4, transform: `rotate(45 ${p[0]} ${p[1]})` }, g);
          return { p, r: 7, metin: `${r.ad} (${r.yil})`, sinif: "kucuk" };
        });
        etiketleriYerlestir(g, h, [...sehirler, ...hanEl, ...gercekEl, ...etiketler], { engeller: uyariKutusu(h) });
      });
      // maketler: yol şehirleri, kurulan hanlar (kervansaray), bilinen hanlar ve yolda yürüyen kervan
      let deve = null;
      const maket = h.model("hanlar", (g) => {
        YOL_SEHIRLERI.forEach((s, i) => koy(h, g, sehir({ ev: 40, sur: i === 0, tohum: i + 2 }), s.konum, { boy: 5 }));
        for (const km of hanlar) koy(h, g, kervansaray(), cizgiUzerinde(KERVAN_YOLU, km), { boy: 3.4, yon: 15 });
        if (gercek) for (const r of GERCEK_HANLAR) koy(h, g, kervansaray(), [r.konum[0], r.konum[1] + 0.07], { boy: 2.6, yon: -10 });
        deve = kervan({ sayi: 9, aralik: 0.008 });
        g.add(deve);
        deve.userData.yol = yolNoktasi(h, KERVAN_YOLU);
      });
      h.herKare((sn) => { if (deve) deve.userData.ilerle(((sn * 0.012) % 1.08), deve.userData.yol, h.olcek * 6); });
      const gost = ctx.gostergeler([{ ad: "han", etiket: "Kurduğun han" }, { ad: "aralik", etiket: "En uzun aralık" }, { ad: "toplam", etiket: "Yolun uzunluğu" }]);
      gost.ayarla("toplam", `≈ ${Math.round(uzunluk)} km`);
      const geri = el("div", { class: "d-geri-bildirim" });
      const soruKap = el("div");
      ctx.kontroller.append(geri, soruKap);
      ctx.dugmeler([{ metin: "Hanları sıfırla", tik: () => { hanlar = []; guncelle(); } }]);
      h.tikla((ll, e) => {
        const r = cizgiyeUzaklik(ll, KERVAN_YOLU);
        const [ex, ey] = h.ekran(e), [nx, ny] = h.xy(r.nokta);
        const pikselKm = (km) => { const [x, y] = h.xy(cizgiUzerinde(KERVAN_YOLU, km)); return Math.hypot(x - ex, y - ey); };
        const yakin = hanlar.findIndex((km) => pikselKm(km) < 14);
        if (yakin >= 0) { hanlar.splice(yakin, 1); guncelle(); return; }
        if (Math.hypot(nx - ex, ny - ey) > 24) { yaz("Hanı yolun üzerine kur: kesikli çizgiye dokun.", "yanlis"); return; }
        if (sabit.some((km) => Math.abs(km - r.konum) < 8)) { yaz("Burada zaten bir şehir var; şehirler de konaklama yeridir.", "yanlis"); return; }
        hanlar.push(r.konum);
        guncelle();
      });
      function yaz(m, tur = "") { geri.className = `d-geri-bildirim ${tur}`; geri.innerHTML = m; }
      function guncelle() {
        const d = duraklar();
        const enUzun = Math.max(...d.slice(1).map((x, i) => x - d[i]));
        gost.ayarla("han", String(hanlar.length));
        gost.ayarla("aralik", `${Math.round(enUzun)} km`);
        if (enUzun <= GUNLUK_YOL) {
          yaz(`Plan tamam: kervan her akşam bir konak yerine ulaşıyor. Mor işaretler yol üzerindeki <b>bilinen hanlardan</b> bazıları.`, "dogru");
          if (!gercek) { gercek = true; soruGoster(); }
        } else {
          yaz(`Kırmızı aralıklarda kervan gece yolda kalır. En uzun aralık: <b>${Math.round(enUzun)} km</b>.`);
        }
        k.yenile(); maket.yenile();
      }
      function soruGoster() {
        secmeli(soruKap, {
          soru: "Hanların yol boyunca yaklaşık bir günlük arayla sıralanmasından hangi <b>çıkarım</b> yapılabilir?",
          siklar: [
            "Hanlar rastgele, yalnızca manzaralı yerlere yapılmıştır.",
            "Devlet ticaret yollarını planlı biçimde güvenli kılmış; ticaret, yol üzerindeki şehirlerin büyümesini sağlamıştır.",
            "Kervanlar yalnızca kışın yolculuk etmiştir.",
          ],
          dogru: 1,
          aciklama: "Güvenli yollar ticareti artırdı; Konya, Aksaray, Kayseri, Sivas gibi yol kavşağındaki şehirler büyüdü. Sosyoekonomik faaliyet (ticaret) ile şehirleşme arasındaki ilişki budur.",
          yanlisAciklama: () => "Hanlar arası mesafenin bir kervanın günlük yoluna yakın olması neyi gösterir?",
          bitti: () => ctx.gorevTamam(),
        });
      }
      guncelle();
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Ahilik: esnafın ahlakı",
    cikti: "TAR.10.1.3-d",
    anlatim: `
      <p><b>Ahilik</b>, 13. yüzyılda Anadolu şehirlerinde esnaf ve zanaatkârları bir araya getiren teşkilattır. Kurucusu sayılan <b>Ahi Evran</b> Kırşehir'de yaşadı.</p>
      <p>Ahi teşkilatında çırak önce <b>ahlakı</b>, sonra <b>mesleği</b> öğrenirdi. Kalite, fiyat ve dürüstlük birlikte denetlenirdi.</p>
      <p>Dört örnek olayda bir Ahi ustası gibi karar ver; sonra Ahiliğin şehirlere etkisi hakkında bir çıkarım yap.</p>`,
    gorev: "Dört örnek olayı ve çıkarım sorusunu <b>doğru</b> cevapla.",
    ogretmen: "Program örnek olaylar üzerinden Ahiliğin değerlerinin (dürüstlük, cömertlik, iş ahlakı) tartışılmasını öneriyor. Ahilik ile Türkmenlerin şehirlere yerleşip zanaat öğrenmesi arasındaki bağ, sosyoekonomik hayat ile şehirleşme ilişkisinin bir örneğidir. İbn Battuta'nın aktarımları 14. yüzyıl başlarına aittir.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: [[29.6, 36.3], [37.4, 40.3]], ...SOLUK, pay: SAG });
      h.model("sehirler", (g) => sehirMaketleri(g, h, ["Konya", "Kayseri", "Aksaray", "Kırşehir", "Antalya", "Alanya", "Sivas"], 4));
      let n = 0;
      isaretKatmani(h, "ahi", () => [
        { konum: [34.16, 39.15], ad: "Kırşehir: Ahi Evran", r: 7, nabiz: true },
        { konum: [30.71, 36.89], ad: "Antalya: Ahi zaviyesi (İbn Battuta)", renk: "#4fc3f7" },
      ], { sehir: TUM_SEHIRLER.filter((s) => !["Kırşehir", "Antalya"].includes(s)), pay: SAG });
      const t = tahta(ctx, { konum: "sag" });
      const durum = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(durum);
      const OLAYLAR = [...AHI_OLAYLARI, {
        durum: "<b>Çıkarım:</b> Ahi teşkilatının Anadolu şehirlerine etkisi hakkında hangisi söylenebilir?",
        siklar: [
          "Şehirlerdeki ticareti azaltmış, halkı köylere göndermiştir.",
          "Türkmenlerin şehirlere yerleşip zanaat öğrenmesini kolaylaştırmış; üretim ve dayanışma şehirleri güçlendirmiştir.",
          "Yalnızca askerî bir örgüt olarak savaşlarla ilgilenmiştir.",
        ],
        dogru: 1, aciklama: "Meslek eğitimi, kalite denetimi ve dayanışma şehir ekonomisini güçlendirdi; göçebe Türkmenlerin şehirli zanaatkâr olmasını kolaylaştırdı.",
      }];
      function goster() {
        const o = OLAYLAR[n];
        durum.textContent = `Olay ${Math.min(n + 1, OLAYLAR.length)}/${OLAYLAR.length}`;
        t.replaceChildren(el("h3", {}, n < AHI_OLAYLARI.length ? `Örnek olay ${n + 1}` : "Ne çıkarabiliriz?"), el("div", { class: "tar-kaynak" }, el("p", { html: o.durum })));
        secmeli(t, {
          soru: n < AHI_OLAYLARI.length ? "Bir Ahi ne yapar?" : "", siklar: o.siklar, dogru: o.dogru, aciklama: o.aciklama,
          yanlisAciklama: () => "Ahiliğin dürüstlük, cömertlik ve iş ahlakı ilkelerini düşün.",
          bitti: () => {
            n++;
            if (n === OLAYLAR.length) { durum.className = "d-geri-bildirim dogru"; durum.textContent = "Tüm olaylar tamam ✓"; ctx.gorevTamam(); }
            else setTimeout(goster, 1100);
          },
        });
      }
      goster();
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Medreseler ve üniversiteler",
    cikti: "TAR.10.1.4-a",
    anlatim: `
      <p>11.–13. yüzyıllarda hem İslam dünyasında hem Avrupa'da yeni eğitim kurumları doğdu: Doğuda <b>medreseler</b>, Batıda <b>üniversiteler</b>.</p>
      <p>Her kartı oku: <b>Türk-İslam medeniyetine</b> mi, <b>Batı (Latin Avrupa)</b> medeniyetine mi ait, yoksa <b>ikisinde de</b> görülen bir özellik mi? Doğru bildiğin kartın merkezleri haritada yanar.</p>
      <p>İki medeniyetin birbirinden <b>etkilendiği</b> kartlara dikkat et.</p>`,
    gorev: "On bir kartı <b>doğru medeniyete</b> yerleştir.",
    ogretmen: "Program, Türk-İslam medeniyeti ile Batı medeniyetinin bilim, kültür, eğitim ve sanat anlayışını karşılaştırmayı istiyor. Karşılaştırmada üstünlük yarışından kaçınıp etkileşimi (Toledo çevirileri, Haçlı seferleri yoluyla temas) vurgulayın. Bologna'nın kuruluş tarihi geleneksel olarak 1088 kabul edilir.",
    kur(ctx) {
      const h = ctx.sahne;
      const pay7 = (W, H) => ({ alt: H * 0.5 + 8 });
      h.sifirla({ kutu: [[-8, 31], [50, 54]], ...SOLUK, pay: pay7 });
      const yanan = new Map();
      const k = isaretKatmani(h, "merkezler", () => Object.entries(MERKEZLER).map(([id, m]) => {
        const renk = yanan.get(id);
        return { ...m, renk: renk === "turk" ? "#ffb547" : renk === "bati" ? "#4fc3f7" : "#55677f", r: renk ? 6 : 4, sinif: renk ? "" : "kucuk soluk" };
      }), { pay: pay7 });
      const BATI = ["bologna", "paris", "oxford", "toledo"];
      h.model("merkezler", (g) => {
        for (const [id, m] of Object.entries(MERKEZLER)) koy(h, g, BATI.includes(id) ? katedral() : medrese(), m.konum, { boy: 4, yon: 30 });
      });
      const t = tahta(ctx, { konum: "alt" });
      const durum = el("div", { class: "d-geri-bildirim" }, "Turuncu: Türk-İslam merkezleri · Mavi: Batı merkezleri");
      ctx.kontroller.append(durum);
      siniflandirma(t, {
        soru: "Bu özellik hangi medeniyete ait?",
        kutular: [{ id: "turk", ad: "Türk-İslam" }, { id: "ikisi", ad: "İkisinde de" }, { id: "bati", ad: "Batı (Latin Avrupa)" }],
        ogeler: MEDENIYET.map((m, i) => ({ id: `m-${i}`, kutu: m.kutu, metin: m.metin, kisa: kisalt(m.metin), ipucu: m.kutu === "ikisi" ? "Bu özellik yalnızca bir tarafa mı özgü?" : "Metindeki yer adına ya da dile dikkat et." })),
        yerlesti: (o) => {
          const m = MEDENIYET[+o.id.split("-")[1]];
          for (const y of m.yerler || []) yanan.set(y, m.kutu);
          k.yenile();
        },
        bitti: () => { durum.className = "d-geri-bildirim dogru"; durum.textContent = "Karşılaştırma tamam ✓"; ctx.gorevTamam(); },
      });
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Kanıt haritası: eserler ve Türkleşme",
    cikti: "TAR.10.1.4-b",
    anlatim: `
      <p>Bir <b>yargıya</b> varmak için önce <b>kanıt</b> toplarız. Yıl kaydırıcısını ilerlet: 13. yüzyılda Anadolu'da yapılan eserler haritada belirir.</p>
      <p>Anadolu'nun <b>Türkleşme ve İslamlaşmasına</b> etkisini gösteren eserlere dokunup <b>kanıt dosyana</b> ekle. Dikkat: Haritada kanıt olmayan olaylar da var.</p>
      <p>En az <b>6 kanıt</b> ve <b>4 farklı alan</b> topladığında yargını seç.</p>`,
    gorev: "Kanıt dosyasına <b>4 farklı alandan en az 6</b> kanıt ekle ve kanıtlara dayanan yargıyı seç.",
    ogretmen: "Program, bilim, kültür, eğitim ve sanattaki gelişmelerin Anadolu'nun Türkleşme ve İslamlaşmasına etkisi hakkında kanıtlara dayalı yargıda bulunulmasını istiyor. İki çeldirici (1204 Latin işgali, Kösedağ) askerî olaydır. Ahi Evran, Hacı Bektaş Veli ve Yunus Emre için verilen tarihler yaklaşıktır; kaynaklarda farklı tarihler bulunur.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: [[27.4, 36.2], [41.2, 41.6]], ...SOLUK });
      let yil = 1200;
      const dosya = new Set();
      let yargiAcik = false;
      const KISA = { gevher: "Gevher Nesibe", divrigi: "Divriği", sultanhani: "Sultanhanı", karatay: "Karatay", ahievran: "Ahi Evran", hacibektas: "Hacı Bektaş", cifte: "Çifte Minareli", mesnevi: "Mesnevi", yunus: "Yunus Emre", kosedag: "Kösedağ", latin: "İstanbul 1204" };
      // aynı şehirdeki iki eser (Konya) yan yana gösterilir
      const KAYMA = { karatay: [-8, 0], mesnevi: [8, 0] };
      const k = h.katman("kanitlar", (g) => {
        const arka = sehirOgeleri(h, ["Konya", "Kayseri", "Sivas", "Aksaray", "Kırşehir"]);
        for (const o of arka) isaret(g, o.p, { r: o.r, renk: o.renk });
        const etiketler = [];
        for (const x of KANITLAR) {
          if (x.yil > yil) continue;
          const p0 = h.xy(x.konum), kay = KAYMA[x.id] || [0, 0], p = [p0[0] + kay[0], p0[1] + kay[1]];
          const secili = dosya.has(x.id);
          const grup = svg("g", { class: "tar-kanit", "data-id": x.id, style: "cursor:pointer" }, g);
          svg("circle", { cx: p[0], cy: p[1], r: 12, fill: "transparent" }, grup);
          svg("circle", { cx: p[0], cy: p[1], r: secili ? 7 : 6, fill: secili ? "#5ad38b" : x.destekler ? "#ffb547" : "#b9935a", stroke: "#0b1522", "stroke-width": 1.6 }, grup);
          etiketler.push({ p, r: 7, g: grup, metin: KISA[x.id], sinif: `kucuk ${secili ? "vurgu" : ""}` });
          grup.addEventListener("click", (e) => { e.stopPropagation(); sec(x); });
        }
        etiketleriYerlestir(g, h, [...etiketler, ...arka]);
      });
      const TUR = { gevher: "sifahane", divrigi: "vakif", sultanhani: "kervansaray", karatay: "medrese", ahievran: "ahilik", hacibektas: "tekke", cifte: "medrese", mesnevi: null, yunus: "konargocer", kosedag: "ordu", latin: "kale" };
      let gorunen = "";
      const maket = h.model("eserler", (g) => {
        for (const x of KANITLAR) if (x.yil <= yil && TUR[x.id]) koy(h, g, MAKET[TUR[x.id]](), [x.konum[0], x.konum[1] + 0.12], { boy: TUR[x.id] === "ordu" ? 4 : 3.4, yon: 25 });
      });
      const maketYenile = () => { const s = KANITLAR.filter((x) => x.yil <= yil).map((x) => x.id).join(); if (s !== gorunen) { gorunen = s; maket.yenile(); } };
      maketYenile();
      ctx.kaydirici({ etiket: "Yıl", min: 1200, max: 1300, adim: 1, deger: yil, degisti: (v) => { yil = v; k.yenile(); maketYenile(); } });
      const gost = ctx.gostergeler([{ ad: "kanit", etiket: "Kanıt" }, { ad: "alan", etiket: "Farklı alan" }]);
      // kanıt dosyası panelde: harita sahnenin tamamını kullanır
      const liste = el("div", { class: "hrt-kutu tar-dosya" }, el("b", {}, "Henüz kanıt yok"));
      const geri = el("div", { class: "hrt-geri tar-kanit-geri" });
      const yargiKap = el("div");
      ctx.kontroller.append(geri, liste, yargiKap);
      function sec(x) {
        if (!x.destekler) {
          geri.className = "hrt-geri tar-kanit-geri yanlis";
          geri.innerHTML = `<b>${x.ad} (${x.tarih})</b> kanıt olamaz: ${x.neden}`;
          return;
        }
        if (dosya.has(x.id)) dosya.delete(x.id); else dosya.add(x.id);
        geri.className = "hrt-geri tar-kanit-geri dogru";
        geri.innerHTML = dosya.has(x.id) ? `<b>${x.ad}</b> · ${x.yer}, ${x.tarih} · ${x.alan} — dosyaya eklendi.` : `${x.ad} dosyadan çıkarıldı.`;
        guncelle();
      }
      function guncelle() {
        const secilen = KANITLAR.filter((x) => dosya.has(x.id));
        const alanlar = new Set(secilen.map((x) => x.alan));
        liste.replaceChildren(el("b", {}, secilen.length ? "Dosyadaki kanıtlar" : "Henüz kanıt yok"),
          ...secilen.map((x) => el("div", {}, `${x.ad} · ${x.tarih} · ${x.alan}`)));
        gost.ayarla("kanit", `${secilen.length} / 6`);
        gost.ayarla("alan", `${alanlar.size} / 4`);
        k.yenile();
        if (!yargiAcik && secilen.length >= 6 && alanlar.size >= 4) {
          yargiAcik = true;
          secmeli(yargiKap, {
            soru: "<b>Yargın:</b> Kanıtların hangisini en iyi destekliyor?",
            siklar: YARGILAR, dogru: DOGRU_YARGI,
            aciklama: "Kanıtlar yüzyıla yayılıyor ve eğitimden sağlığa, mimariden dile kadar birçok alanı kapsıyor: Türkleşme ve İslamlaşma kültürel eserlerle kalıcı hâle geldi.",
            yanlisAciklama: (i) => (i === 0 ? "“Birkaç yıl içinde tamamen” abartılı: kanıtların tarihleri bir yüzyıla yayılıyor." : "Kanıt dosyandaki eserler, kültürün de etkili olduğunu gösteriyor."),
            bitti: () => ctx.gorevTamam(),
          });
          yargiKap.scrollIntoView?.({ block: "nearest" });
        }
      }
      guncelle();
    },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Düşünce ve bilim insanları",
    cikti: "TAR.10.1.4-c",
    anlatim: `
      <p>Türkistan'dan Anadolu'ya uzanan bu dönemde yaşayan düşünce ve bilim insanlarının eserleri bugün de okunuyor, çevriliyor, inceleniyor.</p>
      <p>Kartta bir eser ya da düşünce göreceksin: <b>kime</b> ait olduğunu seç. Doğru bildiğin kişi haritada yaşadığı yerde belirir.</p>
      <p>Sonunda birini seçip onun <b>insanlığın ortak mirasına</b> katkısı hakkında kanıtıyla birlikte bir yargı yaz.</p>`,
    gorev: "Dokuz eseri sahibiyle eşleştir ve bir düşünürün insanlığa katkısı hakkında <b>yargını</b> yaz.",
    ogretmen: "Program, Hoca Ahmed Yesevi, Kaşgarlı Mahmud, Ömer Hayyam, Cezeri, İbnülarabi, Mevlana, Hacı Bektaş Veli, Yunus Emre ve İbni Bibi'nin düşünceleri ya da eserleri hakkında insanlığın ortak mirasına katkıları bakımından yargıda bulunulmasını istiyor. Bazı kişilerin doğum-ölüm tarihleri kaynaklarda farklı verilir; haritadaki yerler yaşadıkları ya da eser verdikleri önemli şehirlerdir.",
    kur(ctx) {
      const h = ctx.sahne;
      const ALT = (W, H) => ({ alt: Math.min(H * 0.5, W > 760 ? 290 : 400) + 8 });
      h.sifirla({ kutu: [[28, 30.5], [79, 45.5]], ...SOLUK, pay: ALT });
      const bulunan = [];
      let desteTamam = false, yaziTamam = false;
      const KAYMA = { mevlana: [7, 3], ibnibibi: [-7, -3] }; // ikisi de Konya'da
      const k = isaretKatmani(h, "kisiler", () => bulunan.map((id) => {
        const x = KISILER.find((y) => y.id === id);
        return { konum: x.konum, kay: KAYMA[id], ad: x.ad.replace(" Celaleddin Rumi", "").replace("Hoca ", ""), nabiz: id === bulunan[bulunan.length - 1] };
      }), { pay: ALT });
      const t = tahta(ctx, { baslik: "Bu eser kime ait?", konum: "alt" });
      haritaliDeste(t, {
        soru: "Eser ya da düşünce",
        kutular: KISILER.map((x) => ({ id: x.id, ad: x.ad.replace(" Celaleddin Rumi", "") })),
        ogeler: KISILER.map((x) => ({ id: x.id, kutu: x.id, metin: x.eser, aciklama: `${x.ad} (${x.yasam}): ${x.katki}`, ipucu: `İpucu: bu eserin sahibi <b>${x.yer}</b> ile ilişkilidir (${x.yasam}).` })),
        yerlesti: (o) => { bulunan.push(o.id); k.yenile(); },
        bitti: () => { desteTamam = true; kontrol(); },
      });
      ctx.yaziAlani({
        etiket: "<b>Yargım:</b> Bir düşünür seç. Onun düşüncesi ya da eseri insanlığın ortak mirasına nasıl katkı yaptı? Bir kanıt göster.",
        anahtar: "u1b-ortak-miras", enAz: 50, yeterli: () => { yaziTamam = true; kontrol(); },
      });
      function kontrol() { if (desteTamam && yaziTamam) ctx.gorevTamam(); }
    },
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Değerlendirme",
    anlatim: `
      <p>Dokuz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>7 doğru</b> yaparsan dersi tamamlamış olursun.</p>`,
    gorev: "Değerlendirmede en az <b>7/9</b> doğru yap.",
    ogretmen: "Sorular araştırma sürecinin aşamalarını (soru sorma, kaynak türü, doğrulama, çıkarım) ve Türk-İslam medeniyetiyle ilgili kanıta dayalı yargıyı yoklar. 3. soru 5. adımdaki kervan planıyla ilişkilidir.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: ANADOLU, ...SOLUK });
      ctx.sinav([
        {
          tur: "coktan", metin: "Sultanhanı'nın kapısındaki 1229 tarihli kitabe nasıl bir kaynaktır?",
          siklar: ["İkincil kaynak", "Birincil kaynak", "Kurgusal kaynak", "Sözlü kaynak"], dogru: 1,
          aciklama: "Yapıyla aynı dönemde yazılmıştır; döneme ait birincil kaynaktır.",
        },
        {
          tur: "coktan", metin: "Aşağıdakilerden hangisi bir <b>araştırma sorusudur</b>?",
          siklar: ["Karatay Medresesi hangi şehirdedir?", "Ahi Evran hangi yüzyılda yaşadı?", "Kervan yolları Anadolu şehirlerinin büyümesini nasıl etkiledi?", "Sultanhanı'nı hangi sultan yaptırdı?"], dogru: 2,
          aciklama: "Ticaret ile şehirleşme arasında ilişki kuruyor; cevabı bir açıklamadır.",
        },
        {
          tur: "sayi", metin: "Yüklü bir kervan günde yaklaşık 40 km yol alıyorsa yaklaşık 280 km'lik Konya–Kayseri yolunu <b>kaç günde</b> tamamlar?",
          dogru: 7, tolerans: 0, birim: "gün", aciklama: "280 ÷ 40 = 7 gün. Her akşam bir konak yeri gerekir: yol boyunca kervansaraylar bu yüzden yapıldı.",
        },
        {
          tur: "coktan", metin: "Aşağıdakilerden hangisi Ahiliğin ilkeleriyle <b>bağdaşmaz</b>?",
          siklar: ["Kusurlu malı satmamak", "Yolcuyu misafir etmek", "Kıtlığı fırsat bilip fiyatı aşırı yükseltmek", "Çırağa meslekle birlikte ahlakı da öğretmek"], dogru: 2,
          aciklama: "Ahi teşkilatı haksız kazancı engeller, fiyat ve kaliteyi denetlerdi.",
        },
        {
          tur: "coktan", metin: "Sosyal medyada kaynak belirtilmeden paylaşılan bir tarih bilgisi için en doğru tutum hangisidir?",
          siklar: ["Beğeni sayısı çoksa doğrudur.", "Güvenilir ve farklı kaynaklarla karşılaştırarak doğrulamak", "Görsel varsa doğrudur.", "Hemen paylaşmak"], dogru: 1,
          aciklama: "Kaynağı belirsiz bilgi teyit edilmeden kullanılmaz.",
        },
        {
          tur: "coktan", metin: "1206'da Kayseri'de yapılan Gevher Nesibe Şifahanesi en çok hangi alandaki gelişmenin kanıtıdır?",
          siklar: ["Denizcilik", "Sağlık ve tıp eğitimi", "Ordu teşkilatı", "Takvim hesabı"], dogru: 1,
          aciklama: "Şifahane hem hastane hem tıp medresesi olarak çalıştı.",
        },
        {
          tur: "coktan", metin: "12. yüzyılda Toledo'da Arapça bilim ve felsefe eserlerinin Latinceye çevrilmesi neyi gösterir?",
          siklar: ["İki medeniyetin hiç temas etmediğini", "İslam dünyasındaki bilimsel birikimin Avrupa'yı etkilediğini", "Avrupa'da üniversitelerin kapandığını", "Arapçanın Avrupa'da halk dili olduğunu"], dogru: 1,
          aciklama: "Çeviriler, İslam dünyasındaki bilimsel birikimin Avrupa'ya aktarılmasını sağladı.",
        },
        {
          tur: "coktan", metin: "Aşağıdakilerden hangisi Anadolu'nun Türkleşme ve İslamlaşmasında kültürel eserlerin etkisine <b>kanıt olamaz</b>?",
          siklar: ["Karatay Medresesi", "Mevlana'nın Mesnevi'si", "Kösedağ yenilgisi", "Yunus Emre'nin Türkçe şiirleri"], dogru: 2,
          aciklama: "Kösedağ askerî bir olaydır; kültür ve sanattaki gelişmelere kanıt değildir.",
        },
        {
          tur: "coktan", metin: "Türkçenin Arapça açıklamalı ilk büyük sözlüğü olan <b>Divanü Lügati't-Türk</b>'ü kim yazmıştır?",
          siklar: ["Ömer Hayyam", "Kaşgarlı Mahmud", "İbni Bibi", "Cezeri"], dogru: 1,
          aciklama: "Kaşgarlı Mahmud eserini 11. yüzyılda Bağdat'ta yazdı; içinde Türk boylarını gösteren bir dünya haritası da vardır.",
        },
      ], { baslik: "Şehir, ticaret ve medeniyet", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar: anlatimEkle(adimlar, ANLAT), sahneKur: (kap) => haritaKur(kap, { kutu: ORTA_ANADOLU, ...SOLUK }) });
