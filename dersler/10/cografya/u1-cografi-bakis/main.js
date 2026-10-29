// 10. Sınıf Coğrafya · 1. Ünite: Coğrafyanın Doğası
// COĞ.10.1.1 Örnek olay, olgu ve/veya mekânı coğrafyanın temel kavramları ile ilişkilendirebilme
// Harita ve etkinlik bileşenleri tarih dersleriyle ortaktır (dersler/10/tarih/ortak).
import { dersBaslat, el } from "../../../../engine/ders.js";
import { geoCircle } from "d3-geo";
import { feature } from "topojson-client";
import ulkeler110 from "world-atlas/countries-110m.json";
import { haritaKur, isaret, cizgi, svg, BOLGE, enlemBoylam, etiketleriYerlestir, uyariKutusu } from "../../tarih/ortak/harita.js";
import { tahta, siniflandirma, secmeli, payHesapla, karistir } from "../../tarih/ortak/bilesenler.js";
import { mesafe, yon, yonAdi, saatFarki } from "../../tarih/ortak/cografi.js";
import { sehir, cayBahcesi, baraj, suAlani, koy } from "../../tarih/ortak/nesneler.js";
import { YEREL, yerelMaket, gemileriDurdur, rastgeleSayi } from "./maket.js";
import { TURKIYE_KUTU, TURKIYE_BOYLAM, YAKIN_SINIR, SORULAR, ORNEKLER, BARAJ, BOLUMLER, AYLAR } from "./veri.js";
import { anlatimEkle } from "../../tarih/ortak/anlat.js";
import { ANLAT } from "./anlat.js";

const DUNYA = feature(ulkeler110, ulkeler110.objects.countries).features;
const turkiyeMi = (f) => (f.properties?.ad ?? f.properties?.name) === "Turkey";
const VURGU = { ulkeSinif: (f) => (turkiyeMi(f) ? "vurgu" : "soluk") };
const SAG = payHesapla({ sagTahta: true });

/* Seçilen örnek olay: 1. adımda seçilir, sonraki adımlarda değiştirilebilir; cihazda saklanır */
const ORNEK_ANAHTARI = "edu-cog10-u1-ornek";
let seciliId = (() => { try { return localStorage.getItem(ORNEK_ANAHTARI); } catch { return null; } })();
if (!ORNEKLER.some((o) => o.id === seciliId)) seciliId = ORNEKLER[0].id;
const ornek = () => ORNEKLER.find((o) => o.id === seciliId);
function ornekSec(id) { seciliId = id; try { localStorage.setItem(ORNEK_ANAHTARI, id); } catch { /* özel pencere vb. */ } }
function ornekSecici(ctx, degisti) {
  return ctx.secenekler({
    etiket: "Örnek olay / mekân", liste: ORNEKLER.map((o) => ({ deger: o.id, metin: o.ad })), deger: seciliId,
    degisti: (id) => { ornekSec(id); degisti(); },
  });
}

/* ---------- Çizim yardımcıları ---------- */
const alanSiniri = (h, pay) => h.gorunur(pay || null);
/** İşaretleri çizip etiketlerini çakışmadan yerleştirir. ogeler: [{ konum, ad, renk?, r?, nabiz?, sinif?, atla? }] */
function isaretler(g, h, ogeler, { pay, ek = [] } = {}) {
  const liste = ogeler.map((o) => ({ ...o, p: h.xy(o.konum), metin: o.ad, r: o.r ?? 5 }));
  for (const o of liste) isaret(g, o.p, { r: o.r, renk: o.renk || "#ffb547", nabiz: o.nabiz });
  // göl ekranda büyükse adı göl yüzeyine değil kıyının dışına yazılır (kıyı noktaları etiket engeli)
  const engeller = [...uyariKutusu(h)], ekEtiket = [];
  for (const o of liste) {
    const orn = ORNEKLER.find((x) => x.kenar && x.konum === o.konum);
    if (!orn || !o.metin) continue;
    const pk = h.xy(orn.kenar);
    if (Math.hypot(pk[0] - o.p[0], pk[1] - o.p[1]) < 12) continue;
    for (const q of orn.gol) { const [x, y] = h.xy(q); engeller.push({ x0: x - 3, y0: y - 3, x1: x + 3, y1: y + 3 }); }
    ekEtiket.push({ p: pk, r: 1, metin: o.metin, sinif: o.sinif });
    o.metin = null;
  }
  etiketleriYerlestir(g, h, [...liste, ...ekEtiket, ...ek], { engeller, sinir: alanSiniri(h, pay) });
}
/** Tuz Gölü için temsilî göl yüzeyi */
/** Örneğin yakın çevresindeki yerler (yerel ölçekte bağlam etiketi olarak) */
const yakinYerler = (o) => [
  ...o.iliskiler.filter((r) => mesafe(o.konum, r.konum) < YAKIN_SINIR).map((r) => ({ ad: r.yer, konum: r.konum })),
  ...o.goreceli.map((s) => ({ ad: s.sehir, konum: s.konum })),
  ...(o.havalimani ? [o.havalimani] : []),
];
/** Yerel ölçekli harita: göl yüzeyi, örnek ve çevresindeki yerler */
function yerelCiz(g, h, o, { pay, nabiz = false } = {}) {
  isaretler(g, h, [{ konum: o.konum, ad: o.ad, r: 7, nabiz },
    ...yakinYerler(o).map((y) => ({ ...y, r: 3.5, renk: "#e8eef7", sinif: "kucuk", atla: true }))], { pay });
}
const yerelUyari = (h, o) => h.uyari(o.gol ? "Göl kıyısı <b>temsilîdir</b>: gerçek kıyı mevsime göre çok değişir." : "");
/** Kartı gelen tanıma göre kutu seçilen deste; kutu ızgarası gizlenir */
function gizliDeste(t, ayar) {
  const kap = el("div", { class: "cog-gizli-kutular" });
  t.append(kap);
  return siniflandirma(kap, ayar);
}
/** Noktaları içine alan, kenarlarından pay bırakılmış kutu */
function kapsayanKutu(noktalar, pay = 0.25) {
  const l = noktalar.map((p) => p[0]), b = noktalar.map((p) => p[1]);
  const dl = Math.max(...l) - Math.min(...l), db = Math.max(...b) - Math.min(...b);
  return [[Math.min(...l) - dl * pay - 0.3, Math.min(...b) - db * pay - 0.3], [Math.max(...l) + dl * pay + 0.3, Math.max(...b) + db * pay + 0.3]];
}


/** Sıcaklık (çizgi) ve yağış (sütun) gösteren küçük iklim grafiği */
function iklimGrafigi(kap, iklim) {
  const W = 320, H = 190, sol = 34, sag = 30, ust = 26, alt = 22, gw = W - sol - sag, gh = H - ust - alt;
  const yMax = Math.max(100, Math.ceil(Math.max(...iklim.yagis) / 100) * 100);
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "cog-iklim", role: "img", "aria-label": `${iklim.istasyon} iklim grafiği` });
  const xm = (i) => sol + (i + 0.5) * (gw / 12);
  const yy = (v) => ust + gh - (v / yMax) * gh;
  const ys = (t) => ust + gh - ((t + 10) / 40) * gh; // sıcaklık ekseni −10…30 °C
  for (let k = 0; k <= 4; k++) {
    const y = ust + (gh * k) / 4;
    svg("line", { x1: sol, x2: W - sag, y1: y, y2: y, class: "cog-iklim-izgara" }, s);
    svg("text", { x: sol - 4, y: y + 4, "text-anchor": "end", class: "cog-iklim-et yagis" }, s).textContent = String(Math.round(yMax * (1 - k / 4)));
    svg("text", { x: W - sag + 4, y: y + 4, class: "cog-iklim-et sicak" }, s).textContent = String(30 - 10 * k);
  }
  iklim.yagis.forEach((v, i) => {
    svg("rect", { x: xm(i) - gw / 30, y: yy(v), width: gw / 15, height: ust + gh - yy(v), class: "cog-iklim-sutun" }, s);
    svg("text", { x: xm(i), y: H - 6, "text-anchor": "middle", class: "cog-iklim-et" }, s).textContent = AYLAR[i];
  });
  svg("path", { d: iklim.sicaklik.map((t, i) => `${i ? "L" : "M"}${xm(i)},${ys(t)}`).join(" "), class: "cog-iklim-cizgi" }, s);
  iklim.sicaklik.forEach((t, i) => svg("circle", { cx: xm(i), cy: ys(t), r: 2.4, class: "cog-iklim-nokta" }, s));
  const toplam = iklim.yagis.reduce((a, b) => a + b, 0);
  svg("text", { x: sol, y: 14, class: "cog-iklim-baslik" }, s).textContent = `${iklim.istasyon} · yıllık yağış ≈ ${toplam} mm (yaklaşık)`;
  svg("text", { x: 2, y: ust - 6, class: "cog-iklim-et yagis" }, s).textContent = "mm";
  svg("text", { x: W - 2, y: ust - 6, "text-anchor": "end", class: "cog-iklim-et sicak" }, s).textContent = "°C";
  kap.append(s);
  return toplam;
}

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Coğrafyacının yedi sorusu",
    cikti: "COĞ.10.1.1-a",
    anlatim: `
      <p>Bir coğrafyacı bir göle, bir boğaza ya da bir çay bahçesine bakarken hep aynı soruları sorar: <b>Ne? Nerede? Ne zaman? Neden orada? Neden önemli?</b> Ortamın özellikleri neler? Doğal ve beşerî ortamla ilişkisi ne?</p>
      <p>Önce incelemek istediğin <b>örnek olayı</b> seç: haritadaki işarete dokun ya da paneldeki düğmeyi kullan.</p>
      <p>Sonra kartlarda gelen her bilginin <b>hangi soruya</b> cevap olduğunu bul.</p>`,
    gorev: "Bir örnek seç ve yedi bilginin hepsini <b>doğru coğrafi soruyla</b> eşleştir.",
    ogretmen: "Program, örnek olay inceleme yöntemiyle öğrencilerin belirlenen örneklerden birini seçmesini ve “Ne? Nerede? Ne zaman? Neden orada? Neden önemli?…” sorularıyla coğrafyanın olay, olgu ve mekânı ele alma biçimini görmesini öneriyor. Seçilen örnek sonraki adımlarda da kullanılır ve cihazda saklanır.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: TURKIYE_KUTU, ...VURGU, pay: SAG });
      const k = h.katman("ornekler", (g) => {
        const liste = ORNEKLER.map((o) => ({ konum: o.konum, ad: o.ad, r: o.id === seciliId ? 8 : 6, renk: o.id === seciliId ? "#ffb547" : "#4fc3f7", nabiz: o.id === seciliId }));
        isaretler(g, h, liste, { pay: SAG });
        for (const o of ORNEKLER) {
          const [x, y] = h.xy(o.konum);
          const d = svg("circle", { cx: x, cy: y, r: 16, fill: "transparent", class: "cog-ornek", "data-id": o.id, style: "cursor:pointer" }, g);
          d.addEventListener("click", (e) => { e.stopPropagation(); sec(o.id); });
        }
      });
      const t = tahta(ctx, { konum: "sag" });
      const durum = el("div", { class: "d-geri-bildirim" });
      const secici = ornekSecici(ctx, () => kur());
      ctx.kontroller.append(durum);
      function sec(id) { ornekSec(id); secici.deger = id; kur(); }
      function kur() {
        const o = ornek();
        k.yenile();
        durum.className = "d-geri-bildirim";
        durum.textContent = `İncelenen: ${o.ad} — ${o.olgu}`;
        t.replaceChildren(el("h3", {}, `${o.ad}: bu bilgi hangi sorunun cevabı?`));
        gizliDeste(t, {
          soru: o.ad,
          kutular: SORULAR,
          ogeler: SORULAR.map((s) => ({ id: s.id, kutu: s.id, metin: o.cevaplar[s.id], ipucu: "Bilgi bir yeri mi, bir zamanı mı, bir nedeni mi, yoksa bir bağlantıyı mı anlatıyor?" })),
          bitti: () => {
            durum.className = "d-geri-bildirim dogru";
            durum.innerHTML = `Yedi soru tamam ✓ Artık <b>${o.ad}</b> için bir coğrafi bakış kurmaya başladın.`;
            t.replaceChildren(el("h3", {}, `${o.ad}: yedi sorunun cevabı`),
              el("dl", { class: "cog-ozet" }, SORULAR.flatMap((s) => [el("dt", {}, s.ad), el("dd", {}, o.cevaplar[s.id])])));
            ctx.gorevTamam();
          },
        });
      }
      kur();
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Mutlak konum: enlem ve boylam",
    cikti: "COĞ.10.1.1-a",
    anlatim: `
      <p>Bir yerin <b>mutlak konumu</b>, enlem ve boylamla verilen kesin yeridir. Enlemler Ekvator'un kuzeyinde ya da güneyinde, boylamlar başlangıç meridyeninin doğusunda ya da batısında ölçülür.</p>
      <p>Panelde koordinatı verilen noktayı haritada bul ve dokun. İmlecin altındaki koordinat sağ üstte görünür.</p>
      <p>Sonra boylamlar ile <b>yerel saat</b> arasındaki ilişkiyi hesapla: Dünya 24 saatte 360° döner.</p>`,
    gorev: "Üç örneğin yerini koordinatlarından bul ve Türkiye'nin doğusu ile batısı arasındaki <b>yerel saat farkını</b> hesapla.",
    ogretmen: "Program, örnek olay ve mekânın harita üzerindeki konumunun algılanmasını istiyor. 1° boylam farkı 4 dakikalık yerel saat farkı demektir; Türkiye yaklaşık 26° D ile 45° D boylamları arasında olduğundan doğu ve batı uçları arasında yaklaşık 76 dakika fark vardır. Dokunma toleransı 50 km'dir.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: TURKIYE_KUTU, ...VURGU, izgara: 1 });
      if (h.W < 560) h.zemin({ izgara: 2 });
      h.koordinatGoster(true);
      const sira = karistir(ORNEKLER.slice());
      const bulunan = [];
      let deneme = null;
      const k = h.katman("hedefler", (g) => {
        if (bulunan.length === sira.length) {
          for (const b of [TURKIYE_BOYLAM.bati, TURKIYE_BOYLAM.dogu]) cizgi(g, h, [[b, 35.5], [b, 42.5]], { renk: "mavi", kesikli: true, kalinlik: 2 });
        }
        if (deneme) isaret(g, h.xy(deneme), { r: 4, renk: "#ff6b6b" });
        isaretler(g, h, bulunan.map((o) => ({ konum: o.konum, ad: `${o.ad} · ${enlemBoylam(o.konum)}`, renk: "#5ad38b" })), {
          ek: bulunan.length === sira.length ? [
            { p: h.xy([TURKIYE_BOYLAM.bati, 36.2]), metin: `${TURKIYE_BOYLAM.bati}° D`, r: 2, sinif: "kucuk" },
            { p: h.xy([TURKIYE_BOYLAM.dogu, 36.2]), metin: `${TURKIYE_BOYLAM.dogu}° D`, r: 2, sinif: "kucuk" }] : [],
        });
        // duman testi için görünmez çapalar (hedef noktalar)
        sira.forEach((o, i) => { const [x, y] = h.xy(o.konum); svg("circle", { class: "cog-capa", "data-i": i, cx: x, cy: y, r: 0.1, opacity: 0 }, g); });
      });
      const hedefEl = el("div", { class: "cog-hedef" });
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(hedefEl, geri);
      function hedefYaz() {
        const o = sira[bulunan.length];
        hedefEl.innerHTML = o ? `<span>${bulunan.length + 1}. nokta</span><b>${enlemBoylam(o.konum)}</b>` : "<span>Üç nokta da bulundu ✓</span>";
      }
      h.tikla((ll) => {
        const o = sira[bulunan.length];
        if (!o) return;
        deneme = ll;
        const d = mesafe(ll, o.konum);
        if (d < 50) {
          bulunan.push(o); deneme = null;
          geri.className = "d-geri-bildirim dogru";
          geri.innerHTML = `<b>Buldun:</b> ${o.ad}. Mutlak konumu ${enlemBoylam(o.konum)}.`;
          if (bulunan.length === sira.length) saatSorusu();
        } else {
          const ipucu = [];
          if (Math.abs(ll[1] - o.konum[1]) > 0.3) ipucu.push(ll[1] < o.konum[1] ? "daha kuzeye" : "daha güneye");
          if (Math.abs(ll[0] - o.konum[0]) > 0.3) ipucu.push(ll[0] < o.konum[0] ? "daha doğuya" : "daha batıya");
          geri.className = "d-geri-bildirim yanlis";
          geri.innerHTML = `Dokunduğun yer ${enlemBoylam(ll)}. Hedef ${ipucu.join(" ve ")} (yaklaşık ${Math.round(d)} km uzakta).`;
        }
        hedefYaz(); k.yenile();
      });
      function saatSorusu() {
        k.yenile();
        ctx.sayiSorusu({
          etiket: `Türkiye yaklaşık <b>${TURKIYE_BOYLAM.bati}° D</b> ile <b>${TURKIYE_BOYLAM.dogu}° D</b> boylamları arasındadır. En doğu ile en batı arasında yerel saat farkı kaç <b>dakikadır</b>?`,
          birim: "dk",
          kontrol: (v) => {
            const dogru = saatFarki(TURKIYE_BOYLAM.dogu - TURKIYE_BOYLAM.bati);
            if (v === dogru) { ctx.gorevTamam(); return true; }
            if (v === TURKIYE_BOYLAM.dogu - TURKIYE_BOYLAM.bati) return "Bu boylam farkı. Her 1° için kaç dakika?";
            return "İpucu: 360° → 24 saat ise 1° → 4 dakika.";
          },
          dogruMesaj: `Doğru: 19° × 4 dk = 76 dk. Doğuda Güneş yaklaşık 1 saat 16 dakika önce doğar.`,
        });
      }
      hedefYaz();
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Göreceli konum, ölçek ve katmanlar",
    cikti: "COĞ.10.1.1-a",
    anlatim: `
      <p><b>Göreceli konum</b>, bir yerin başka yerlere göre durumudur: “Ankara'nın güneyinde”, “iki kıtanın arasında” gibi.</p>
      <p>Örneğine üç farklı <b>ölçekte</b> bak: Dünya, bölge (Türkiye) ve yerel. Katman düğmeleriyle ızgarayı, sınırları, şehirleri, benzer olguların <b>dağılışını</b> ve ulaşımı aç-kapat.</p>
      <p>Sonra üç soruda örneğinin göreceli konumunu yön adıyla belirt.</p>`,
    gorev: "Üç ölçeğin hepsine bak ve üç <b>göreceli konum</b> sorusunu doğru cevapla.",
    ogretmen: "Konum algılama becerisinde ölçek değiştirmek önemlidir: Dünya ölçeğinde İstanbul Boğazı iki kıta arasındaki bir geçittir, yerel ölçekte ise şehrin ortasından geçen bir su yoludur. Dağılış katmanı benzer olguların başka nerelerde görüldüğünü gösterir. Ulaşım çizgileri temsilîdir.",
    kur(ctx) {
      const h = ctx.sahne;
      let olcek = "bolge", soruNo = 0;
      const gorulen = new Set(["bolge"]);
      const acik = { izgara: false, sinir: true, sehir: true, dagilis: false, ulasim: false };
      function zemin() {
        const o = ornek();
        const ulkeSinif = (f) => `${turkiyeMi(f) ? `vurgu${olcek === "dunya" ? " isaretli" : ""}` : "soluk"}${acik.sinir ? "" : " sinirsiz"}`;
        h.uyari(olcek === "dunya" ? "" : o.gol ? "Göl kıyısı <b>temsilîdir</b>; ulaşım çizgileri temsilîdir." : acik.ulasim ? "Ulaşım çizgileri <b>temsilîdir</b>." : "");
        if (olcek === "dunya") h.zemin({ projeksiyon: "dunya", kutu: null, ozellikler: DUNYA, uzakKara: true, ulkeSinif, izgara: acik.izgara ? 30 : null });
        else if (olcek === "bolge") h.zemin({ projeksiyon: "konik", kutu: TURKIYE_KUTU, ozellikler: BOLGE, uzakKara: true, ulkeSinif, izgara: acik.izgara ? 2 : null });
        else h.zemin({ projeksiyon: "konik", kutu: o.yerel, ozellikler: YEREL[o.id], uzakKara: true, ulkeSinif, izgara: acik.izgara ? 0.5 : null });
        if (olcek === "yerel") yerelMaket(h, o); else { h.modelSil("yerel"); gemileriDurdur(); }
      }
      h.sifirla({ kutu: TURKIYE_KUTU, ...VURGU });
      const k = h.katman("katmanlar", (g) => {
        const o = ornek();
        if (acik.ulasim && olcek !== "dunya") cizgi(g, h, o.ulasim, { renk: "beyaz", kesikli: true, kalinlik: 2 });
        const soru = o.goreceli[soruNo];
        if (soru && olcek !== "dunya") cizgi(g, h, [soru.konum, o.konum], { renk: "mavi", ok: true, kalinlik: 2.2 });
        const liste = [{ konum: o.konum, ad: o.ad, r: 7, nabiz: true }];
        if (acik.sehir && olcek !== "dunya") for (const s of o.goreceli) liste.push({ konum: s.konum, ad: s.sehir, r: 3.5, renk: "#e8eef7", sinif: "kucuk" });
        if (acik.sehir && olcek === "yerel") for (const r of o.iliskiler.filter((r) => mesafe(o.konum, r.konum) < YAKIN_SINIR)) liste.push({ konum: r.konum, ad: r.yer, r: 3.5, renk: "#e8eef7", sinif: "kucuk", atla: true });
        if (acik.dagilis && olcek !== "dunya") for (const d of o.dagilis) liste.push({ konum: d.konum, ad: d.ad, r: 4.5, renk: "#b89cff", sinif: "kucuk" });
        if (olcek === "dunya") {
          for (const [ad, p] of [["AVRUPA", [15, 53]], ["ASYA", [90, 50]], ["AFRİKA", [20, 6]]]) svg("text", { x: h.xy(p)[0], y: h.xy(p)[1], "text-anchor": "middle", class: "cog-kita" }, g).textContent = ad;
          isaretler(g, h, [{ konum: o.konum, ad: o.ad, r: 6, nabiz: true }]);
          return;
        }
        if (acik.ulasim && olcek === "yerel") for (const x of [...(o.kopruler || []), ...(o.havalimani ? [o.havalimani] : [])]) liste.push({ konum: x.konum, ad: x.ad, r: 3.5, renk: "#ffffff", sinif: "kucuk", atla: true });
        isaretler(g, h, liste);
      });
      const yenile = () => { zemin(); k.yenile(); };
      ornekSecici(ctx, () => { soruNo = 0; yenile(); soruKur(); });
      ctx.secenekler({
        etiket: "Ölçek", liste: [{ deger: "dunya", metin: "Dünya" }, { deger: "bolge", metin: "Bölge (Türkiye)" }, { deger: "yerel", metin: "Yerel" }], deger: olcek,
        degisti: (v) => { olcek = v; gorulen.add(v); yenile(); kontrol(); },
      });
      const katmanlar = el("div", { class: "d-grup cog-katmanlar", role: "group", "aria-label": "Katmanlar" });
      for (const [anahtar, ad] of [["izgara", "Izgara"], ["sinir", "Sınırlar"], ["sehir", "Şehirler"], ["dagilis", "Dağılış"], ["ulasim", "Ulaşım"]]) {
        const b = el("button", { class: "d-btn", "aria-pressed": String(acik[anahtar]), "data-katman": anahtar, onclick: () => {
          acik[anahtar] = !acik[anahtar]; b.setAttribute("aria-pressed", String(acik[anahtar])); yenile();
        } }, ad);
        katmanlar.append(b);
      }
      const durum = el("div", { class: "d-geri-bildirim" });
      const soruKap = el("div", { class: "cog-yon-soru" });
      ctx.kontroller.append(soruKap, el("div", { class: "d-secenekler" }, el("span", {}, "Katmanlar"), katmanlar), durum);
      function soruKur() {
        const o = ornek(), s = o.goreceli[soruNo];
        k.yenile();
        if (!s) { soruKap.replaceChildren(el("div", { class: "d-geri-bildirim dogru" }, "Üç göreceli konum sorusu tamam ✓")); kontrol(); return; }
        const geri = el("div", { class: "hrt-geri" });
        const pusula = el("div", { class: "cog-pusula" });
        // 3×3 pusula: kuzeybatı, kuzey, kuzeydoğu / batı, ·, doğu / güneybatı, güney, güneydoğu
        for (const ad of ["kuzeybatı", "kuzey", "kuzeydoğu", "batı", null, "doğu", "güneybatı", "güney", "güneydoğu"]) {
          if (!ad) { pusula.append(el("span", { class: "cog-pusula-orta" }, s.sehir)); continue; }
          pusula.append(el("button", { class: "d-btn", "data-yon": ad, onclick: (e) => {
            const dogru = yonAdi(yon(s.konum, o.konum));
            if (ad === dogru) {
              geri.className = "hrt-geri dogru"; geri.innerHTML = `<b>Doğru.</b> ${o.ad}, ${s.sehir}'in ${dogru}sindedir.`;
              soruNo++; setTimeout(soruKur, 900);
            } else {
              e.currentTarget.classList.add("yanlis");
              geri.className = "hrt-geri yanlis"; geri.innerHTML = "Haritadaki mavi oka bak: ok şehirden örneğe doğru gidiyor. Kuzey haritanın üstüdür.";
            }
          } }, ad));
        }
        soruKap.replaceChildren(el("div", { class: "hrt-soru", html: `<b>${soruNo + 1}/3.</b> ${o.ad}, <b>${s.sehir}</b>'e göre hangi yöndedir?` }), pusula, geri);
      }
      function kontrol() {
        const o = ornek();
        durum.textContent = `Bakılan ölçek: ${gorulen.size}/3`;
        if (gorulen.size === 3 && soruNo >= o.goreceli.length) { durum.className = "d-geri-bildirim dogru"; ctx.gorevTamam(); }
      }
      yenile(); soruKur(); kontrol();
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Coğrafi koşullar: doğal mı, beşerî mi?",
    cikti: "COĞ.10.1.1-b",
    anlatim: `
      <p>Bir mekânın <b>coğrafi koşulları</b> iki türlüdür: iklim, yer şekilleri, su, toprak gibi <b>doğal</b> koşullar ve nüfus, yerleşme, ekonomik faaliyetler, ulaşım gibi <b>beşerî</b> koşullar.</p>
      <p>Örneğinin koşullarını ayır. Paneldeki <b>iklim grafiğini</b> de oku: sütunlar aylık yağışı, çizgi aylık ortalama sıcaklığı gösterir.</p>`,
    gorev: "Altı koşulu doğal/beşerî diye ayır ve iklim grafiğindeki <b>yıllık yağışı</b> bul.",
    ogretmen: "Program, örnek olay ve mekânın temel coğrafi koşullarının tanımlanmasını istiyor. İklim grafiği değerleri yakın istasyonların uzun yıllar ortalamalarına dayanan yaklaşık değerlerdir (Tuz Gölü için Konya). Üç örneğin grafiklerini karşılaştırmak, Rize'deki yağışın Konya'nın yaklaşık yedi katı olduğunu gösterir.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: ornek().yerel, ozellikler: YEREL[ornek().id], ...VURGU, pay: SAG });
      const biten = { deste: false, yagis: false };
      const k = h.katman("ornek", (g) => yerelCiz(g, h, ornek(), { pay: SAG }));
      const t = tahta(ctx, { konum: "sag" });
      ornekSecici(ctx, () => kur());
      const grafikKap = el("div", { class: "cog-iklim-kap" });
      const soruKap = el("div");
      ctx.kontroller.append(grafikKap, soruKap);
      function kur() {
        const o = ornek();
        biten.deste = biten.yagis = false;
        h.zemin({ kutu: o.yerel, ozellikler: YEREL[o.id], uzakKara: true });
        yerelMaket(h, o);
        yerelUyari(h, o);
        k.yenile();
        t.replaceChildren(el("h3", {}, `${o.ad}: koşullar`));
        siniflandirma(t, {
          soru: "Bu koşul…",
          kutular: [{ id: "dogal", ad: "Doğal koşul" }, { id: "beseri", ad: "Beşerî koşul" }],
          ogeler: o.kosullar.map((x, i) => ({ id: `${o.id}-${i}`, ...x, ipucu: "İnsan eliyle mi ortaya çıktı, yoksa doğanın bir özelliği mi?" })),
          bitti: () => { biten.deste = true; kontrol(); },
        });
        grafikKap.replaceChildren();
        const toplam = iklimGrafigi(grafikKap, o.iklim);
        soruKap.replaceChildren();
        const secenek = ORNEKLER.map((x) => x.iklim.yagis.reduce((a, b) => a + b, 0)).sort((a, b) => a - b);
        secmeli(soruKap, {
          soru: `Grafiğe göre ${o.iklim.istasyon}'da yıllık toplam yağış yaklaşık ne kadardır?`,
          siklar: secenek.map((v) => `Yaklaşık ${Math.round(v / 10) * 10} mm`), dogru: secenek.indexOf(toplam),
          aciklama: toplam > 2000 ? "Bu, Türkiye'nin en yüksek yağış değerlerindendir: çay bol su ister." : toplam < 400 ? "Az yağış ve yüksek buharlaşma gölün tuzlu olmasının nedenlerindendir." : "Yağışın çoğu kış aylarında düşer.",
          yanlisAciklama: () => "On iki sütunun değerlerini topla ya da başlıktaki toplamı oku.",
          bitti: () => { biten.yagis = true; kontrol(); },
        });
      }
      function kontrol() { if (biten.deste && biten.yagis) ctx.gorevTamam(); }
      kur();
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Yakın ve uzak çevreyle ilişkiler",
    cikti: "COĞ.10.1.1-c",
    anlatim: `
      <p>Hiçbir mekân yalnız değildir. Bir göl çevresindeki tarlalarla, bir boğaz uzak limanlarla, bir çay bahçesi uzak şehirlerdeki sofralarla <b>ilişkilidir</b>.</p>
      <p>Haritadaki halka örneğinin <b>${YAKIN_SINIR} km</b> çevresini gösteriyor. Her ilişkiyi oku: <b>yakın çevre</b> ile mi, <b>uzak çevre</b> ile mi? Doğru bildiğinde ilişki haritada çizilir ve uzaklığı yazılır.</p>`,
    gorev: "Dört ilişkinin hepsini <b>yakın / uzak çevre</b> olarak doğru ayır.",
    ogretmen: `Program, örnek olay ve mekânın yakın ve uzak çevresiyle ilişkilerinin çözümlenmesini istiyor. Bu derste yakın çevre için ${YAKIN_SINIR} km'lik bir ölçüt kullanıldı; bu, tartışılabilecek bir sınırdır. Öğrencilere “Uzak çevre ile ilişki neden çoğunlukla ulaşım ve ticaretle kurulur?” sorusunu sorun.`,
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ ...VURGU, pay: SAG });
      let cizilen = [];
      const k = h.katman("iliskiler", (g) => {
        const o = ornek();
        const halka = geoCircle().center(o.konum).radius(YAKIN_SINIR / 111.2)();
        svg("path", { d: h.yol(halka), class: "cog-halka" }, g);
              const ek = [];
        for (const r of cizilen) {
          const yakin = mesafe(o.konum, r.konum) < YAKIN_SINIR;
          cizgi(g, h, [o.konum, r.konum], { renk: yakin ? "yesil" : "mavi", kalinlik: 2.2 });
          const [x1, y1] = h.xy(o.konum), [x2, y2] = h.xy(r.konum);
          if (Math.hypot(x2 - x1, y2 - y1) > 60) ek.push({ p: [(x1 + x2) / 2, (y1 + y2) / 2], metin: `${Math.round(mesafe(o.konum, r.konum))} km`, r: 2, sinif: "kucuk vurgu", atla: true });
        }
        isaretler(g, h, [{ konum: o.konum, ad: o.ad, r: 7 }, ...cizilen.map((r) => ({ konum: r.konum, ad: r.yer, r: 4.5, renk: "#e8eef7", sinif: "kucuk", atla: mesafe(o.konum, r.konum) < YAKIN_SINIR }))], { pay: SAG, ek });
      });
      const t = tahta(ctx, { konum: "sag" });
      const durum = el("div", { class: "d-geri-bildirim" });
      ornekSecici(ctx, () => kur());
      ctx.kontroller.append(durum);
      function kur() {
        const o = ornek();
        cizilen = [];
        h.zemin({ kutu: kapsayanKutu([o.konum, ...o.iliskiler.map((r) => r.konum)], 0.12) });
        k.yenile();
        t.replaceChildren(el("h3", {}, `${o.ad}: ilişkiler`));
        siniflandirma(t, {
          soru: "Bu ilişki hangi çevreyle?",
          kutular: [{ id: "yakin", ad: `Yakın çevre (< ${YAKIN_SINIR} km)` }, { id: "uzak", ad: "Uzak çevre" }],
          ogeler: o.iliskiler.map((r, i) => {
            const km = Math.round(mesafe(o.konum, r.konum));
            return { id: `${o.id}-${i}`, metin: r.metin, kisa: `${r.yer} · ${km} km`, kutu: km < YAKIN_SINIR ? "yakin" : "uzak", aciklama: `${r.yer} örneğe yaklaşık ${km} km uzaklıkta.`, ipucu: `${r.yer} haritadaki halkanın içinde mi?` };
          }),
          yerlesti: (x) => { cizilen.push(o.iliskiler[+x.id.split("-")[1]]); k.yenile(); },
          bitti: () => {
            durum.className = "d-geri-bildirim dogru";
            durum.textContent = "İlişkiler tamam ✓ Yakın çevreyle ilişkiler daha çok doğal ortam ve günlük yaşamla, uzak çevreyle olanlar ulaşım ve ticaretle kuruluyor.";
            ctx.gorevTamam();
          },
        });
      }
      kur();
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Etki ağı: bir değişim neleri etkiler?",
    cikti: "COĞ.10.1.1-ç",
    anlatim: `
      <p>Mekânda bir şey değiştiğinde etkisi çevresine yayılır: bir neden birçok sonucu doğurur, sonuçlar da birbirini etkiler.</p>
      <p>Örneğinde bir değişim düşün. Sonra her öğe için bu değişimin onu <b>artıracağını</b> mı yoksa <b>azaltacağını</b> mı seç. Böylece bir <b>etki ağı</b> kurmuş olursun.</p>
      <p>En sonda gerçekte yaşanmış bir örnekle karşılaştır.</p>`,
    gorev: "Etki ağındaki beş öğenin hepsinde değişimin <b>yönünü</b> doğru belirle.",
    ogretmen: "Program, örnek olay ve mekânın aynı çevredeki diğer olay, olgu ve mekânlar üzerindeki etkisinin sorgulanmasını istiyor. Etki ağını tahtada okların yönleriyle birlikte yeniden çizdirip “Bu etkilerden hangisi geri döndürülemez?” sorusunu tartıştırın. Doğaya ve canlılara karşı merhametli davranma değeri vurgulanabilir.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: ornek().yerel, ozellikler: YEREL[ornek().id], ...VURGU, pay: SAG });
      const k = h.katman("ornek", (g) => yerelCiz(g, h, ornek(), { pay: SAG, nabiz: true }));
      const t = tahta(ctx, { konum: "sag" });
      const durum = el("div", { class: "d-geri-bildirim" });
      ornekSecici(ctx, () => kur());
      ctx.kontroller.append(durum);
      function kur() {
        const o = ornek();
        h.zemin({ kutu: o.yerel, ozellikler: YEREL[o.id], uzakKara: true });
        yerelMaket(h, o);
        yerelUyari(h, o);
        k.yenile();
        durum.className = "d-geri-bildirim"; durum.textContent = "";
        t.replaceChildren(el("h3", {}, "Etki ağı"), el("div", { class: "cog-olay" }, o.etki.olay));
        siniflandirma(t, {
          soru: "Bu değişim bunu…",
          kutular: [{ id: "artar", ad: "↑ Artırır" }, { id: "azalir", ad: "↓ Azaltır" }],
          ogeler: o.etki.ogeler.map((x, i) => ({ id: `${o.id}-${i}`, ...x, ipucu: "Değişimin doğrudan sonucunu düşün: daha çok mu olur, daha az mı?" })),
          bitti: () => {
            durum.className = "d-geri-bildirim dogru";
            durum.innerHTML = `Etki ağı tamam ✓ <b>Gerçek bir örnek:</b> ${o.etki.ornek}`;
            ctx.gorevTamam();
          },
        });
      }
      kur();
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Coğrafi bakış: Atatürk Barajı ve raporum",
    cikti: "COĞ.10.1.1-a·b·c·ç",
    anlatim: `
      <p>Şimdi öğrendiklerini yeni bir örnekte kullan: Fırat Nehri üzerindeki <b>Atatürk Barajı</b>. Her bilgiyi coğrafi bakışın dört basamağından birine yerleştir: <b>konum, koşullar, ilişkiler, etki</b>.</p>
      <p>Sonra kendi örneğin için kısa bir <b>coğrafi bakış raporu</b> yaz: Nerede? Hangi koşullarda? Çevresiyle nasıl ilişkili? Çevresini nasıl etkiliyor?</p>`,
    gorev: "Sekiz bilgiyi dört basamağa yerleştir ve <b>raporunu</b> yaz (en az 120 karakter).",
    ogretmen: "Program, performans görevi olarak öğrencilerin merak ettikleri bir coğrafi olay, olgu ya da mekâna yönelik coğrafi bakışı yansıtan kısa bir makale/rapor yazmasını öneriyor; ölçütler konum ve ilişki belirleme, etki sorgulama ve yazımdır. Haritadaki tünel güzergâhı temsilîdir. Rapor cihazda saklanır; sınıfta paylaşılıp analitik dereceli puanlama anahtarıyla değerlendirilebilir.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: BARAJ.kutu, ...VURGU, pay: SAG });
      h.uyari("Baraj ve yerleşmeler yaklaşık konumlarındadır; tünel güzergâhı <b>temsilîdir</b>.");
      let desteTamam = false, raporTamam = false;
      h.katman("baraj", (g) => {
        cizgi(g, h, BARAJ.tunel, { renk: "mavi", kesikli: true, kalinlik: 2.5, ok: true });
        isaretler(g, h, [{ konum: BARAJ.konum, ad: BARAJ.ad, r: 8, nabiz: true }, ...BARAJ.yerler.map((y) => ({ ...y, r: 4, renk: "#e8eef7", sinif: "kucuk" }))], { pay: SAG });
      });
      h.model("baraj", (g) => {
        // baraj gövdesi, Fırat vadisinde baraj gölü, şehirler ve sulanan Harran Ovası (temsilî)
        const d = h.yer(BARAJ.konum);
        g.add(suAlani(h, BARAJ.gol, { duzey: d.y + h.olcek * 0.5 }));
        koy(h, g, baraj({ uzunluk: 1.2, yukseklik: 0.3 }), BARAJ.konum, { boy: 6, yon: 35 });
        for (const y of BARAJ.yerler) if (!/Harran/.test(y.ad)) koy(h, g, sehir({ ev: y.ad === "Şanlıurfa" ? 55 : 30, tohum: y.ad.length }), y.konum, { boy: y.ad === "Şanlıurfa" ? 8 : 6 });
        const r = rastgeleSayi(5), tarla = [];
        for (let i = 0; i < 700; i++) { const ll = [38.82 + r() * 0.5, 36.65 + r() * 0.4]; tarla.push(Object.assign(h.yer(ll), { aci: 0.3 })); }
        g.add(cayBahcesi(tarla, { olcek: h.olcek * 5 }));
      });
      const t = tahta(ctx, { baslik: "Atatürk Barajı: coğrafi bakışın dört basamağı", konum: "sag" });
      const dort = el("div", { class: "cog-dort" });
      t.append(dort);
      siniflandirma(dort, {
        soru: "Bu bilgi hangi basamakta?",
        kutular: BOLUMLER,
        ogeler: BARAJ.ifadeler.map((x, i) => ({ id: `b-${i}`, ...x, ipucu: "Yer mi anlatıyor, ortamın özelliğini mi, başka yerlerle bağlantıyı mı, yoksa bir değişimin sonucunu mu?" })),
        bitti: () => { desteTamam = true; kontrol(); },
      });
      ctx.yaziAlani({
        etiket: `<b>Coğrafi bakış raporum:</b> ${ornek().ad} (ya da merak ettiğin başka bir yer) için konumu, koşulları, ilişkileri ve etkisi hakkında kısa bir rapor yaz.`,
        anahtar: "cog10-rapor", enAz: 120, yeterli: () => { raporTamam = true; kontrol(); },
      });
      function kontrol() { if (desteTamam && raporTamam) ctx.gorevTamam(); }
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Değerlendirme",
    anlatim: `
      <p>Sekiz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>6 doğru</b> yaparsan dersi tamamlamış olursun.</p>`,
    gorev: "Değerlendirmede en az <b>6/8</b> doğru yap.",
    ogretmen: "Sorular coğrafi bakışın dört basamağını (konum, koşullar, ilişkiler, etki) yoklar. 3. soru boylam ile yerel saat ilişkisini, 8. soru iklim grafiği okumayı ölçer.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: TURKIYE_KUTU, ...VURGU });
      ctx.sinav([
        {
          tur: "coktan", metin: "“Tuz Gölü yaklaşık 38,7° kuzey enlemi ve 33,3° doğu boylamındadır.” Bu ifade neyi belirtir?",
          siklar: ["Göreceli konum", "Mutlak konum", "Coğrafi koşul", "Uzak çevre ilişkisi"], dogru: 1,
          aciklama: "Enlem ve boylamla verilen kesin yer mutlak konumdur.",
        },
        {
          tur: "coktan", metin: "İstanbul Boğazı, Bursa'ya göre hangi yöndedir?",
          siklar: ["Güney", "Doğu", "Kuzey", "Batı"], dogru: 2,
          aciklama: "Boğaz, Bursa ile hemen hemen aynı boylamda ve daha kuzeydedir.",
        },
        {
          tur: "sayi", metin: "Türkiye yaklaşık 26° D ile 45° D boylamları arasındadır. En doğu ile en batı arasındaki yerel saat farkı kaç <b>dakikadır</b>?",
          dogru: 76, tolerans: 0, birim: "dk", aciklama: "45 − 26 = 19°; 19 × 4 dk = 76 dk.",
        },
        {
          tur: "coktan", metin: "Aşağıdakilerden hangisi Rize'de çay tarımını sağlayan <b>doğal</b> koşullardandır?",
          siklar: ["Çay fabrikalarının bulunması", "Kooperatiflerin kurulması", "Yıl boyu bol yağış ve ılık kışlar", "Kıyı yolunun yapılması"], dogru: 2,
          aciklama: "Diğerleri insanın oluşturduğu beşerî koşullardır.",
        },
        {
          tur: "coktan", metin: "Hangisi Tuz Gölü'nün <b>yakın çevresiyle</b> olan ilişkisine örnektir?",
          siklar: ["Tuzun İstanbul'daki marketlere ulaşması", "Şereflikoçhisar kıyısındaki tuzlalarda tuz üretilmesi", "Ankara'dan turist gelmesi", "Tuzun başka ülkelere satılması"], dogru: 1,
          aciklama: "Şereflikoçhisar tuzlaları gölün hemen kıyısındadır.",
        },
        {
          tur: "coktan", metin: "Tuz Gölü'ne gelen su azalırsa aşağıdakilerden hangisi <b>artar</b>?",
          siklar: ["Göl yüzeyinin alanı", "Flamingoların üreme alanı", "Kuruyan tabandan rüzgârla taşınan tuzlu toz", "Kuş gözlemcisi sayısı"], dogru: 2,
          aciklama: "Kuruyan göl tabanı rüzgârla tuzlu toz taşınmasına yol açar; diğerleri azalır.",
        },
        {
          tur: "coktan", metin: "Atatürk Barajı yapılınca Samsat ilçesinin yeni yerine taşınması, coğrafi bakışın hangi basamağıyla ilgilidir?",
          siklar: ["Konum", "Coğrafi koşullar", "Uzak çevreyle ilişki", "Çevresindeki mekânlara etkisi"], dogru: 3,
          aciklama: "Baraj gölü eski yerleşmeyi sular altında bıraktı: bu, barajın çevresine etkisidir.",
        },
        {
          tur: "coktan", metin: "Bir istasyonun iklim grafiğinde aylık yağışların çoğu 150 mm'nin üzerinde, yıllık toplam yaklaşık 2300 mm'dir. Bu grafik hangi örneğe daha uygundur?",
          siklar: ["Tuz Gölü (Konya)", "İstanbul Boğazı", "Rize'de çay tarımı", "Atatürk Barajı (Şanlıurfa)"], dogru: 2,
          aciklama: "Doğu Karadeniz kıyısı Türkiye'nin en çok yağış alan yeridir.",
        },
      ], { baslik: "Coğrafi bakış", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar: anlatimEkle(adimlar, ANLAT), sahneKur: (kap) => haritaKur(kap, { kutu: TURKIYE_KUTU, ...VURGU }) });
