// 10. Sınıf Tarih · 1. Ünite: Türkistan'dan Türkiye'ye (1040–1299) — 1. ders
// TAR.10.1.1 önemli askerî mücadeleler · TAR.10.1.2 devlet ve ordu teşkilatında değişim ve süreklilik
import { dersBaslat, el, sayi } from "../../../../engine/ders.js";
import { haritaKur, etiket, isaret, cizgi, alan, svg, UZAK_KARA } from "../ortak/harita.js";
import { geoContains } from "d3-geo";
import { tahta, eslestirme, siniflandirma, siralama, secmeli, karistir, payHesapla } from "../ortak/bilesenler.js";
import { seritKur } from "../ortak/serit.js";
import { cokgenIcinde } from "../ortak/cografi.js";
import { sehir, ordu, kale, oba, atlilar, koy } from "../ortak/nesneler.js";
import {
  DONEM, KUTU, SAVASLAR, OLAYLAR, SEHIRLER, BOLGE_ADLARI, ALANLAR, OKLAR,
  KAYNAKLAR, DAVRANISLAR, KARSILASTIRMALAR, TESKILAT, ALANLAR_TESKILAT, ZINCIRLER,
} from "./veri.js";
import { iktaModeli, hedefSaglandi, HEDEF, parselIktaMi } from "./model.js";
import { anlatimEkle } from "../ortak/anlat.js";
import { ANLAT } from "./anlat.js";

const savas = (id) => SAVASLAR.find((s) => s.id === id);
const TUM_OLAYLAR = [...SAVASLAR.map((s) => ({ ...s, savas: true, metin: `${s.ad}: ${s.sonuc}` })), ...OLAYLAR].sort((a, b) => a.yil - b.yil);
const SOLUK = { ulkeSinif: () => "soluk" };
const KUTU_BATI = [[25, 30.5], [52, 43.5]];

/* ---------- Ortak katmanlar ---------- */
function sehirler(h, { adlar, soluk = true } = {}) {
  h.katman("sehirler", (g) => {
    for (const s of SEHIRLER) {
      if (adlar && !adlar.includes(s.ad)) continue;
      const p = h.xy(s.konum);
      isaret(g, p, { r: 2.6, renk: "#a9b6c9" });
      etiket(g, p, s.ad, { sinif: `kucuk ${soluk ? "soluk" : ""}`, dy: -6 });
    }
  });
}
function bolgeAdlari(h) {
  h.katman("bolgeler", (g) => { for (const b of BOLGE_ADLARI) etiket(g, h.xy(b.konum), b.ad, { sinif: "bolge" }); });
}
function elmas(g, [x, y], { r = 7, renk = "#ffb547", sinif = "" } = {}) {
  return svg("path", { d: `M${x},${y - r} L${x + r},${y} L${x},${y + r} L${x - r},${y} Z`, fill: renk, stroke: "#0b1522", "stroke-width": 1.6, class: sinif }, g);
}
/** Savaş adlarının birbirine binmemesi için etiket yerleşimi */
const ETIKET_YERI = {
  dandanakan: { dy: -12 }, pasinler: { dy: -11, dx: 3, hiza: "start" }, malazgirt: { dy: 21 },
  hacli: { dy: -12 }, miryokefalon: { dy: 21 }, hittin: { dy: -12 }, kosedag: { dy: -11, dx: -3, hiza: "end" },
};
const savasEtiketi = (g, p, s, metin, sinif = "", yer = ETIKET_YERI) => etiket(g, p, metin, { ...yer[s.id], sinif });
// 2. adımdaki küçük ölçekli haritada numaralı etiketler daha uzun: Kösedağ ve Malazgirt aşağı-sağa alınır
const ETIKET_YERI_2 = { ...ETIKET_YERI, kosedag: { dy: 19, dx: -4, hiza: "start" }, malazgirt: { dy: 24, dx: 4, hiza: "start" } };
function merkez(halka) {
  const n = halka.length;
  return [halka.reduce((s, p) => s + p[0], 0) / n, halka.reduce((s, p) => s + p[1], 0) / n];
}

/* ---------- 3B maketler ---------- */
// Tarafların temsilî renkleri: [Türk tarafı, karşı taraf]
const ORDU_RENK = {
  dandanakan: ["#b5452f", "#3f7f5f"], pasinler: ["#b5452f", "#6b4fa0"], malazgirt: ["#b5452f", "#6b4fa0"],
  hacli: ["#b5452f", "#d8d2c4"], miryokefalon: ["#b5452f", "#6b4fa0"], hittin: ["#c99a2e", "#d8d2c4"], kosedag: ["#b5452f", "#4b4f57"],
};
/** Savaş yerinde karşı karşıya iki ordu */
function savasMaketi(g, h, s, { boy = 5 } = {}) {
  const [r1, r2] = ORDU_RENK[s.id] || ["#b5452f", "#6b4fa0"];
  const d = 0.026 * (h.kutu[1][0] - h.kutu[0][0]);
  koy(h, g, ordu({ sayi: 36, renk: r1, sancak: "#b51f2e", yon: Math.PI, tohum: 3 }), [s.konum[0] + d, s.konum[1]], { boy });
  koy(h, g, ordu({ sayi: 36, renk: r2, sancak: r2 === "#d8d2c4" ? "#e8e2d0" : "#4a2f7a", yon: 0, tohum: 7, atli: s.id !== "hacli" }), [s.konum[0] - d, s.konum[1]], { boy });
}
/** Dönemin büyük şehirleri: maket şehirler (surlu olanlar kale duvarıyla) */
const MAKET_SEHIR = { "Konstantinopolis": { sur: true, ev: 60 }, "Bağdat": { ev: 55 }, "İsfahan": { ev: 45 }, "Merv": { ev: 40 }, "Nişabur": { ev: 30 }, "Konya": { ev: 35, sur: true }, "Kudüs": { ev: 30, sur: true }, "Buhara": { ev: 30 }, "Tebriz": { ev: 30 }, "Sivas": { ev: 25 }, "Kaşgar": { ev: 25 } };
function sehirMaketleri(h, adlar, boy = 5) {
  h.model("sehirler", (g) => {
    SEHIRLER.forEach((s, i) => {
      const o = MAKET_SEHIR[s.ad];
      if (!o || (adlar && !adlar.includes(s.ad))) return;
      koy(h, g, sehir({ ev: o.ev, sur: o.sur, tohum: i + 1 }), s.konum, { boy });
    });
  });
}

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Türkistan'dan Türkiye'ye: hareketli harita",
    cikti: "TAR.10.1.1-a",
    anlatim: `
      <p>1040'ta Horasan'da kurulan bir devletten 1299'da Söğüt'te doğan bir beyliğe… Bu 260 yılda Türkler <b>Türkistan'dan Anadolu'ya</b> uzanan bir yolculuk yaptı ve Anadolu <b>Türkiye</b> adıyla anılmaya başladı.</p>
      <p>Sahnenin altındaki <b>tarih şeridini</b> sürükle ya da ▶ Oynat'a bas. Haritada hâkimiyet alanlarının, göç ve sefer oklarının nasıl değiştiğini izle. Elmas işaretler, tarihin seyrini değiştiren <b>savaşlardır</b>.</p>
      <p>Başlamadan önce bu dönem hakkında <b>bildiklerini</b> ve <b>merak ettiklerini</b> yaz.</p>`,
    gorev: "Şeridi <b>1299'a kadar</b> götürüp yedi savaşın hepsini gör ve <b>bildiklerim / merak ettiklerim</b> bölümünü doldur.",
    ogretmen: "Program, ünitenin başında “bildiklerim, merak ettiklerim, öğrendiklerim ve hissettiklerim” formunun yalnızca ilk iki bölümünün doldurulmasını öneriyor; son iki bölüm 6. adımda doldurulur. Haritadaki alanların temsilî olduğunu, bugünkü sınırların yalnızca yön bulmak için soluk gösterildiğini vurgulayın.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: KUTU, ...SOLUK, pay: payHesapla({ serit: true }) });
      h.uyari("Renkli alanlar, oklar ve bazı savaş yerleri <b>yaklaşık/temsilîdir</b>. Arka planda bugünkü ülke sınırları soluk gösterilir.");
      let yil = DONEM.bas, oynat = null, bati = false;
      const gorulen = new Set();
      let yaziTamam = false;
      bolgeAdlari(h);
      const alanK = h.katman("alanlar", (g) => {
        for (const a of ALANLAR) {
          if (yil < a.bas || yil > a.son) continue;
          alan(g, h, a.halka, { renk: a.renk });
          etiket(g, h.xy(a.etiket || merkez(a.halka)), a.ad, { sinif: "kucuk", dy: 4 });
        }
      });
      const okK = h.katman("oklar", (g) => { for (const o of OKLAR) if (yil >= o.bas && yil <= o.son) cizgi(g, h, o.yol, { renk: o.renk, ok: true, kesikli: o.renk !== "sari" }); });
      const ADLAR1 = ["Merv", "Nişabur", "Buhara", "Kaşgar", "İsfahan", "Bağdat", "Tebriz", "Konya", "Konstantinopolis", "Kudüs", "Sivas"];
      sehirler(h, { adlar: ADLAR1 });
      sehirMaketleri(h, ADLAR1);
      // Son savaş: iki ordu karşı karşıya · göç dönemi: Horasan ve Anadolu'da Türkmen obaları
      let sonSavas = null, obaEvresi = -1;
      const savasM = h.model("savas", (g) => { if (sonSavas) savasMaketi(g, h, sonSavas); });
      const obaM = h.model("obalar", (g) => {
        const yerler = [[58.6, 37.4], [56.5, 36.7], [60.4, 36.4]];
        if (obaEvresi >= 1) yerler.push([40.6, 39.6], [36.2, 39.1], [33.4, 38.9], [31.2, 39.4]);
        yerler.forEach((ll, i) => koy(h, g, oba({ sayi: 5, tohum: i + 2 }), ll, { boy: 3.5 }));
      });
      const olayK = h.katman("olaylar", (g) => {
        const gecmis = TUM_OLAYLAR.filter((o) => o.yil <= yil);
        const son = gecmis[gecmis.length - 1];
        for (const o of gecmis) {
          const p = h.xy(o.konum);
          if (o.savas) {
            if (o === son) isaret(g, p, { r: 8, renk: "#ffb547", nabiz: true });
            elmas(g, p, { renk: o === son ? "#ffb547" : "#b9935a", r: o === son ? 7 : 5.5 });
            if (o === son) savasEtiketi(g, p, o, `${o.kisa} ${o.yil}`, "vurgu");
            else etiket(g, p, String(o.yil), { dx: 8, dy: 4, hiza: "start", sinif: "kucuk soluk" });
          } else if (o === son) {
            isaret(g, p, { r: 5, renk: "#4fc3f7", nabiz: true });
            etiket(g, p, `${o.kisa} ${o.yil}`, { dx: -9, dy: 4, hiza: "end", sinif: "kucuk" });
          }
        }
      });
      const bilgi = ctx.not("");
      const durum = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(durum);
      const [oynatBtn] = ctx.dugmeler([{ metin: "▶ Oynat", ana: true, tik: () => (oynat ? dur() : basla()) }]);
      ctx.yaziAlani({
        etiket: "<b>Bildiklerim:</b> Bu dönem hakkında ne biliyorsun? <b>Merak ettiklerim:</b> Neyi öğrenmek istiyorsun?",
        anahtar: "bimh-bildiklerim", enAz: 40, yeterli: () => { yaziTamam = true; kontrol(); },
      });
      const serit = seritKur(ctx.katman, {
        min: DONEM.bas, max: DONEM.son, deger: yil,
        olaylar: TUM_OLAYLAR.map((o) => ({ yil: o.yil, kisa: o.kisa, savas: o.savas, renk: o.savas ? "#ffb547" : "#4fc3f7" })),
        degisti: (y) => guncelle(y),
      });
      function guncelle(y) {
        yil = y;
        // 1160'tan sonra olaylar Anadolu ve Suriye'de geçer: harita batıya yaklaşır
        if ((yil >= 1160) !== bati) { bati = yil >= 1160; h.kutuya(bati ? KUTU_BATI : KUTU); }
        alanK.yenile(); okK.yenile(); olayK.yenile();
        for (const s of SAVASLAR) if (s.yil <= yil) gorulen.add(s.id);
        const gecmis = TUM_OLAYLAR.filter((o) => o.yil <= yil);
        const son = gecmis[gecmis.length - 1];
        const sonS = [...gecmis].reverse().find((o) => o.savas) || null;
        if (sonS?.id !== sonSavas?.id) { sonSavas = sonS; savasM.yenile(); }
        const ev = yil >= 1071 ? 1 : 0;
        if (ev !== obaEvresi) { obaEvresi = ev; obaM.yenile(); }
        bilgi.innerHTML = `<p><b>${yil}</b> · Son olay: <b>${son.yil}</b> — ${son.metin}</p>`;
        durum.textContent = `Görülen savaş: ${gorulen.size}/${SAVASLAR.length}`;
        kontrol();
      }
      function kontrol() { if (gorulen.size === SAVASLAR.length && yaziTamam) ctx.gorevTamam(); }
      function basla() {
        if (yil >= DONEM.son) serit.ayarla(DONEM.bas);
        oynatBtn.textContent = "■ Durdur";
        oynat = setInterval(() => { if (yil >= DONEM.son) dur(); else serit.ayarla(yil + 1); }, 70);
      }
      function dur() { clearInterval(oynat); oynat = null; oynatBtn.textContent = "▶ Oynat"; }
      ctx.temizlik(dur);
      guncelle(yil);
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Tarih şeridinde savaşları sırala",
    cikti: "TAR.10.1.1-a",
    anlatim: `
      <p>Tarih şeridi, olayları <b>önce–sonra</b> ilişkisiyle görmemizi sağlar. Kartlardaki savaşları <b>en eskiden en yeniye</b> doğru sırayla seç.</p>
      <p>Yanlış seçersen bir ipucu göreceksin. Doğru yerleştirdiğin her savaş hem şeritte hem haritada belirir.</p>
      <p>Dikkat: Savaşları ezberlemek yerine aralarındaki <b>neden–sonuç</b> bağını düşün. Örneğin Anadolu'nun kapıları açılmadan Türkiye Selçuklu–Bizans savaşı olabilir mi?</p>`,
    gorev: "Yedi askerî mücadeleyi tarih şeridinde <b>doğru sıraya</b> diz.",
    ogretmen: "Program, öğrencilerin mücadeleleri tarih şeridi üzerinde sıralamasını öneriyor (SBAB10.2). Sıralama bittikten sonra şeritteki boşluklara dikkat çekin: 1048–1071 arası 23 yıl, 1071–1176 arası 105 yıl. “Malazgirt'ten Miryokefalon'a kadar Anadolu'da neler oldu?” sorusuyla 1. adıma dönülebilir.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: [[26, 30], [66, 43]], ...SOLUK, pay: payHesapla({ sagTahta: true, serit: true }) });
      const IPUCU = {
        dandanakan: "En başta, devletin <b>resmen kurulduğu</b> savaş gelmeli.",
        pasinler: "Selçukluların Bizans'la yaptığı <b>ilk büyük meydan savaşını</b> düşün.",
        malazgirt: "Anadolu'nun kapıları hangi savaşla açıldı?",
        hacli: "Avrupa'dan gelen ordular İznik'i aldığında başkent Konya'ya taşındı. Bu, Türkiye Selçuklu–Bizans savaşından önce mi sonra mı?",
        miryokefalon: "Kudüs'ün yeniden fethinden <b>11 yıl önce</b> Bizans'ın umudunu bitiren savaş.",
        hittin: "Kudüs'ün yeniden fethi Moğollardan önce geldi.",
        kosedag: "Moğollar en son gelir.",
      };
      const yerlesen = [];
      const k = h.katman("savaslar", (g) => {
        for (const s of yerlesen) {
          const p = h.xy(s.konum);
          elmas(g, p);
          savasEtiketi(g, p, s, `${yerlesen.indexOf(s) + 1}. ${s.kisa}`, "", ETIKET_YERI_2);
        }
      });
      const t = tahta(ctx, { baslik: "Hangisi daha önce?", konum: "sag", seritUstu: true });
      const serit = seritKur(ctx.katman, { min: DONEM.bas, max: DONEM.son, deger: DONEM.son, olaylar: [] });
      siralama(t, {
        ogeler: SAVASLAR.map((s) => ({ id: s.id, metin: s.ad, sonra: s.bitis ? `${s.yil}–${s.bitis}` : String(s.yil) })),
        ipucu: (beklenen) => IPUCU[beklenen.id],
        yerlesti: (o) => {
          yerlesen.push(savas(o.id));
          serit.olaylariAyarla(yerlesen.map((s) => ({ yil: s.yil, kisa: s.kisa, savas: true })));
          k.yenile();
        },
        bitti: () => {
          ctx.gorevTamam();
          ctx.not(`<p>Sıralama tamam. Savaşlar arasındaki süreler: ${SAVASLAR.slice(1).map((s, i) => `${SAVASLAR[i].kisa} → ${s.kisa}: <b>${s.yil - SAVASLAR[i].yil} yıl</b>`).join(" · ")}</p>`);
        },
      });
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Dilsiz harita: savaşlar nerede oldu?",
    cikti: "TAR.10.1.1-b",
    anlatim: `
      <p>Bir savaşın <b>yeri</b>, onu anlamanın anahtarıdır: Horasan çölü, Doğu Anadolu ovaları, Batı Anadolu'nun dağ geçitleri…</p>
      <p>Haritadaki numaralı noktalar savaş yerleridir ama adları yazmıyor. Paneldeki bir savaşı seç, sonra haritada ait olduğu <b>numaraya</b> dokun.</p>
      <p>Yerleştirdikçe savaşların nasıl <b>doğudan batıya</b> ilerlediğine dikkat et.</p>`,
    gorev: "Yedi savaşın hepsini dilsiz haritada <b>doğru yere</b> yerleştir.",
    ogretmen: "Program dilsiz harita üzerine mücadelelerin yerleştirilmesini öneriyor (E1.4). Miryokefalon, Dandanakan ve Kösedağ'ın kesin yerleri kaynaklarda tartışmalıdır; haritadaki noktalar yaklaşık konumlardır. Öğrencilere savaşların bugünkü hangi ülke ve illerde kaldığını sorabilirsiniz.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: [[27, 30.5], [65, 43]], ...SOLUK });
      h.uyari("Noktalar yaklaşık savaş yerleridir; bugünkü sınırlar soluk.");
      const sira = karistir(SAVASLAR.map((s) => s.id));
      const no = Object.fromEntries(sira.map((id, i) => [id, i + 1]));
      const bulunan = new Set();
      let secili = null;
      const geri = el("div", { class: "d-geri-bildirim" });
      bolgeAdlari(h);
      const k = h.katman("rozetler", (g) => {
        for (const s of SAVASLAR) {
          const p = h.xy(s.konum), [dx, dy] = s.rozet, q = [p[0] + dx, p[1] + dy];
          const tamam = bulunan.has(s.id);
          svg("line", { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: "#a9b6c9", "stroke-width": 1.2 }, g);
          isaret(g, p, { r: 3.5, renk: tamam ? "#5ad38b" : "#e8eef7" });
          const r = svg("g", { class: "tar-rozet", "data-id": s.id, style: "cursor:pointer" }, g);
          svg("circle", { cx: q[0], cy: q[1], r: 14, fill: tamam ? "#5ad38b" : "#ffb547", stroke: "#0b1522", "stroke-width": 2 }, r);
          const t = svg("text", { x: q[0], y: q[1] + 4.5, "text-anchor": "middle", "font-weight": 800, "font-size": 13, fill: "#1b1200", "pointer-events": "none" }, r);
          t.textContent = tamam ? "✓" : String(no[s.id]);
          if (tamam) etiket(g, q, `${s.kisa} ${s.yil}`, { dy: -19 });
          r.addEventListener("click", (e) => { e.stopPropagation(); dene(s.id); });
        }
      });
      const kartlar = el("div", { class: "tar-kart-listesi" });
      for (const s of karistir(SAVASLAR)) {
        kartlar.append(el("button", { class: "hrt-kart", "data-id": s.id, onclick: (e) => {
          if (bulunan.has(s.id)) return;
          secili = s.id;
          kartlar.querySelectorAll("button").forEach((b) => b.classList.toggle("secili", b === e.currentTarget));
          geri.className = "d-geri-bildirim"; geri.textContent = `${s.ad} seçildi. Şimdi haritada numarasına dokun.`;
        } }, el("span", {}, s.ad), el("small", {}, s.bitis ? `${s.yil}–${s.bitis}` : String(s.yil))));
      }
      ctx.kontroller.append(kartlar, geri);
      function dene(id) {
        if (bulunan.has(id)) return;
        if (!secili) { geri.className = "d-geri-bildirim yanlis"; geri.textContent = "Önce paneldeki kartlardan bir savaş seç."; return; }
        const s = savas(secili);
        if (id === secili) {
          bulunan.add(id);
          const b = kartlar.querySelector(`[data-id="${id}"]`);
          b.classList.remove("secili"); b.classList.add("tamam"); b.disabled = true;
          geri.className = "d-geri-bildirim dogru";
          geri.innerHTML = `<b>Doğru:</b> ${s.ad} — ${s.yer}.`;
          secili = null;
          k.yenile();
          if (bulunan.size === SAVASLAR.length) ctx.gorevTamam();
        } else {
          geri.className = "d-geri-bildirim yanlis";
          geri.innerHTML = `Bu nokta ${s.kisa} değil. İpucu: ${s.kisa} — <b>${s.yer}</b>.`;
        }
      }
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Savaş kartları: taraflar ve sonuçlar",
    cikti: "TAR.10.1.1-b",
    anlatim: `
      <p>Bir askerî mücadelenin <b>özelliklerini</b> belirlemek için şunları sorarız: <b>Kimler</b> savaştı? <b>Nerede</b>, <b>ne zaman</b>? <b>Sonucu</b> ne oldu?</p>
      <p>Önce her savaşı <b>taraflarıyla</b>, sonra <b>sonucuyla</b> eşleştir. Soldan bir savaş, sağdan bir kart seç.</p>
      <p>Benzer görünen sonuçlara dikkat: Malazgirt Anadolu'nun kapılarını <b>açtı</b>; peki o kapıyı <b>kalıcı</b> kılan hangisiydi?</p>`,
    gorev: "İki turu da tamamla: önce <b>taraflar</b>, sonra <b>sonuçlar</b>.",
    ogretmen: "Program, öğrencilerin farklı kaynaklardan ulaştıkları bilgilerle mücadelelerin özelliklerini belirlemesini istiyor (OB1). Eşleştirmeden sonra öğrencilerden her savaş için “taraf – yer – sonuç” üçlüsünü defterlerine bir tablo olarak geçirmelerini isteyebilirsiniz; bu tablo 6. adımdaki karşılaştırmanın temelidir.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: KUTU, ...SOLUK });
      const t = tahta(ctx, { baslik: "1. tur · Kimler savaştı?" });
      const durum = el("div", { class: "d-geri-bildirim" }, "1. tur: taraflar");
      ctx.kontroller.append(durum);
      const sol = SAVASLAR.map((s) => ({ id: s.id, metin: `<b>${s.ad}</b>`, alt: s.bitis ? `${s.yil}–${s.bitis}` : String(s.yil) }));
      const cevap = Object.fromEntries(SAVASLAR.map((s) => [s.id, s.id]));
      const tur = (alanAd, baslik, sonra) => {
        t.replaceChildren(el("h3", {}, baslik));
        eslestirme(t, {
          sol, sag: SAVASLAR.map((s) => ({ id: s.id, metin: s[alanAd] })), cevap,
          solBaslik: "Savaş", sagBaslik: alanAd === "taraflar" ? "Taraflar" : "Sonuç",
          ipucu: (a, b) => {
            const s = savas(a);
            return alanAd === "taraflar"
              ? `${s.kisa} ${s.yil} yılında oldu. O tarihte hangi devletler bu bölgede güçlüydü?`
              : `Bu sonuç ${s.kisa} için değil. ${savas(b).kisa} sonrasında neler değişti, hatırla.`;
          },
          bitti: sonra,
        });
      };
      tur("taraflar", "1. tur · Kimler savaştı?", () => {
        durum.textContent = "1. tur tamam ✓ · 2. tur: sonuçlar";
        setTimeout(() => tur("sonuc", "2. tur · Sonucu ne oldu?", () => {
          durum.className = "d-geri-bildirim dogru";
          durum.textContent = "İki tur da tamam ✓";
          ctx.gorevTamam();
        }), 900);
      });
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Kaynaklar konuşuyor: savaşta merhamet",
    cikti: "TAR.10.1.1-b",
    anlatim: `
      <p>Tarihçi bilgiyi <b>kaynaklardan</b> çıkarır. Olayı yaşayan ya da o döneme ait kaynaklar <b>birincil</b>, sonradan başka kaynaklara dayanılarak yazılanlar <b>ikincil</b> kaynaktır.</p>
      <p>Dört kaynak özetini oku. Her biri için kaynağın türünü ve anlattığı davranışı belirle.</p>
      <p>Bir de şunu sor: Bu kaynağı yazan kim? <b>Karşı tarafın</b> bir yazarı Türk hükümdarını anlatıyorsa bu, bilgiye nasıl bir güç katar?</p>`,
    gorev: "Dört kaynağın hepsinde <b>türü</b> ve <b>anlattığı davranışı</b> doğru belirle.",
    ogretmen: "Program, örnek olaylar üzerinden askerî mücadelelerde Türklerin sivil halka ve esirlere gösterdiği merhametli davranışların açıklanmasını istiyor (D9.1). Metinler, kamu malı eski kaynakların özgün özetleridir; doğrudan alıntı değildir. 1099 ile 1187'deki Kudüs olaylarının karşılaştırılmasında tarafsız ve saygılı bir dil kullanın.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: [[28, 30.5], [46, 42]], ...SOLUK, pay: payHesapla({ sagTahta: true }) });
      let n = 0;
      const tamam = new Set();
      const k = h.katman("yer", (g) => {
        const kay = KAYNAKLAR[n];
        for (const s of SAVASLAR) {
          if (!["pasinler", "malazgirt", "hittin"].includes(s.id)) continue;
          const p = h.xy(s.id === "hittin" ? [35.23, 31.78] : s.konum), aktif = kay.savas === s.id;
          if (aktif) isaret(g, p, { r: 9, renk: "#ffb547", nabiz: true });
          elmas(g, p, { renk: aktif ? "#ffb547" : "#7d8ea8" });
          savasEtiketi(g, p, s, s.id === "hittin" ? "Kudüs 1187" : `${s.kisa} ${s.yil}`, aktif ? "vurgu" : "soluk");
        }
      });
      const maket = h.model("kaynakYeri", (g) => {
        const kay = KAYNAKLAR[n];
        const s = savas(kay.savas);
        if (!s) return;
        if (s.id === "hittin") { koy(h, g, kale({ kenar: 9, yaricap: 0.5 }), [35.23, 31.78], { boy: 7 }); koy(h, g, sehir({ ev: 30, tohum: 4 }), [35.23, 31.78], { boy: 5.5 }); }
        else { savasMaketi(g, h, s, { boy: 5.5 }); koy(h, g, kale({ kenar: 6, yaricap: 0.45 }), [s.konum[0] + 0.3, s.konum[1] + 0.9], { boy: 5 }); koy(h, g, oba({ sayi: 7 }), [s.konum[0] + 1.6, s.konum[1] - 0.7], { boy: 4.5 }); }
      });
      const t = tahta(ctx, { konum: "sag" });
      const durum = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(durum);
      ctx.dugmeler([{ metin: "‹ Önceki kaynak", tik: () => goster(n - 1) }, { metin: "Sonraki kaynak ›", ana: true, tik: () => goster(n + 1) }]);
      function goster(i) {
        n = (i + KAYNAKLAR.length) % KAYNAKLAR.length;
        const kay = KAYNAKLAR[n];
        k.yenile(); maket.yenile();
        let turTamam = false, davTamam = false;
        const kontrol = () => {
          if (turTamam && davTamam) tamam.add(kay.id);
          durum.textContent = `Çözülen kaynak: ${tamam.size}/${KAYNAKLAR.length}`;
          if (tamam.size === KAYNAKLAR.length) ctx.gorevTamam();
        };
        t.replaceChildren(
          el("h3", {}, `Kaynak ${n + 1}/${KAYNAKLAR.length} · ${kay.baslik}`),
          el("div", { class: "tar-kaynak" }, el("p", {}, kay.metin), el("small", {}, kay.kunye)));
        secmeli(t, {
          soru: "<b>1.</b> Bu kaynak birincil mi, ikincil mi?",
          siklar: ["Birincil kaynak", "İkincil kaynak"], dogru: kay.tur === "birincil" ? 0 : 1,
          aciklama: kay.turAciklama,
          yanlisAciklama: () => "Yazarın olayla aynı dönemde yaşayıp yaşamadığına bak.",
          bitti: () => { turTamam = true; kontrol(); },
        });
        secmeli(t, {
          soru: "<b>2.</b> Kaynak en çok neyi gösteriyor?",
          siklar: DAVRANISLAR, dogru: kay.davranis,
          aciklama: kay.davranis === 2 ? "1099 ile 1187'yi karşılaştırınca fark açıkça görülür." : "",
          yanlisAciklama: () => "Metinde kimin, kime nasıl davrandığını yeniden oku.",
          bitti: () => { davTamam = true; kontrol(); },
        });
        if (tamam.has(kay.id)) t.append(el("div", { class: "hrt-geri dogru" }, "Bu kaynağı daha önce çözdün ✓"));
        kontrol();
        t.scrollTop = 0;
      }
      goster(0);
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Karşılaştırma tablosu: benzer mi, farklı mı?",
    cikti: "TAR.10.1.1-c",
    anlatim: `
      <p>İki savaşı karşılaştırmak, tarihin <b>seyrini</b> görmemizi sağlar. Her kartı okuyup <b>yalnızca birine</b> mi yoksa <b>ikisine birden</b> mi ait olduğunu seç.</p>
      <p>İlk karşılaştırma iki zaferi, ikincisi bir zafer ile bir yenilgiyi ele alıyor. Bir <b>yenilginin</b> bile Anadolu'nun Türkleşmesine etkisi olabilir mi?</p>
      <p>Sonunda “öğrendiklerim ve hissettiklerim” bölümünü doldurabilirsin.</p>`,
    gorev: "İki karşılaştırma tablosunu da <b>tamamla</b>.",
    ogretmen: "Program, mücadelelerin etkilerini benzerlik ve farklılıkları açısından ortaya koyan karşılaştırmalı bir tablo hazırlanmasını öneriyor (KB3.1, SDB1.2). Kösedağ kartı (“yeni Türkmen göçlerine yol açtı”) bilinçli bir tartışma noktasıdır. Ardından BİMH formunun öğrendiklerim ve hissettiklerim bölümleri doldurulur (SDB1.1).",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: [[28, 35], [46, 42.5]], ...SOLUK, pay: (W, H) => ({ ust: H * 0.55 }) });
      const biten = new Set();
      const t = tahta(ctx);
      const durum = el("div", { class: "d-geri-bildirim" });
      const secim = ctx.secenekler({
        etiket: "Karşılaştırma",
        liste: KARSILASTIRMALAR.map((c, i) => ({ deger: i, metin: `${savas(c.a).kisa} – ${savas(c.b).kisa}` })),
        deger: 0, degisti: (i) => kur(i),
      });
      ctx.kontroller.append(durum);
      ctx.yaziAlani({ etiket: "<b>Öğrendiklerim ve hissettiklerim:</b> Bu savaşlar Türk tarihinin seyrini nasıl değiştirdi? Ne hissettin?", anahtar: "bimh-ogrendiklerim", enAz: 40 });
      function kur(i) {
        const c = KARSILASTIRMALAR[i], A = savas(c.a), B = savas(c.b);
        h.katman("ab", (g) => {
          for (const [s, harf] of [[A, "A"], [B, "B"]]) {
            const p = h.xy(s.konum);
            elmas(g, p, { r: 8 });
            etiket(g, p, `${harf}: ${s.kisa} ${s.yil}`, { dy: 22, sinif: "vurgu" });
          }
        });
        t.replaceChildren(el("h3", {}, `${A.ad} (${A.yil}) ile ${B.ad} (${B.yil})`));
        siniflandirma(t, {
          soru: "Bu ifade hangi savaşa ait?",
          kutular: [{ id: "a", ad: `Yalnız ${A.kisa}` }, { id: "ortak", ad: "İkisi de" }, { id: "b", ad: `Yalnız ${B.kisa}` }],
          ogeler: c.ifadeler.map((f, j) => ({ id: `${i}-${j}`, ...f, ipucu: f.ipucu || `${A.kisa}: ${A.sonuc} ${B.kisa}: ${B.sonuc}` })),
          bitti: () => {
            biten.add(i);
            durum.className = "d-geri-bildirim dogru";
            durum.textContent = `Tamamlanan tablo: ${biten.size}/${KARSILASTIRMALAR.length}`;
            if (biten.size === KARSILASTIRMALAR.length) ctx.gorevTamam();
            else setTimeout(() => { secim.deger = 1 - i; kur(1 - i); }, 1200);
          },
        });
      }
      kur(0);
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Devlet teşkilatı: ne değişti, ne kaldı?",
    cikti: "TAR.10.1.2-a·b",
    anlatim: `
      <p>Türkler Türkistan'dan Anadolu'ya gelirken devlet geleneklerini yanlarında getirdi; yolda karşılaştıkları <b>İslam</b> ve <b>İran</b> devlet geleneklerinden de yeni kurumlar aldı.</p>
      <p><b>1. bölüm:</b> Karahanlı, Gazneli ve Selçuklu devletlerinde görülen her unsuru, İslamiyet öncesi Türk devletleriyle karşılaştır: <b>süreklilik</b> mi, <b>değişim</b> mi?</p>
      <p><b>2. bölüm:</b> Aynı unsurların devletin <b>hangi alanını</b> etkilediğini belirle.</p>`,
    gorev: "Değişim–süreklilik formunun <b>iki bölümünü</b> de tamamla.",
    ogretmen: "Program, Karahanlı ve Gaznelilerin son dönemleri ile Büyük Selçuklu ve Türkiye Selçuklu devletlerinin devlet ve ordu yapılarının incelenmesini, değişim ve süreklilik gösteren alanların sınıflandırılmasını öneriyor (E3.7). Görüş geliştirme tekniği için: “Kurultayın Büyük Divan olarak sürmesi gerçekten süreklilik mi, yoksa biçim değiştiren bir değişim mi?” sorusunu tartıştırın.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: KUTU, ...SOLUK });
      const t = tahta(ctx, { baslik: "Değişim ve süreklilik formu · 1. bölüm" });
      const durum = el("div", { class: "d-geri-bildirim" }, "1. bölüm: süreklilik mi, değişim mi?");
      ctx.kontroller.append(durum);
      siniflandirma(t, {
        soru: "İslamiyet öncesi Türk devletlerine göre bu bir…",
        kutular: [{ id: "sureklilik", ad: "Süreklilik" }, { id: "degisim", ad: "Değişim" }],
        ogeler: TESKILAT.map((o) => ({ ...o, kisa: o.metin.split("(")[0].trim(), ipucu: "Bu unsur İslamiyet öncesi Türk devletlerinde (Hun, Göktürk, Uygur) var mıydı?" })),
        bitti: () => setTimeout(ikinci, 900),
      });
      function ikinci() {
        durum.textContent = "1. bölüm tamam ✓ · 2. bölüm: hangi alanı etkiledi?";
        t.replaceChildren(el("h3", {}, "Değişim ve süreklilik formu · 2. bölüm"));
        siniflandirma(t, {
          soru: "Bu unsur devletin hangi alanını etkiledi?",
          kutular: ALANLAR_TESKILAT,
          ogeler: TESKILAT.map((o) => ({ ...o, id: `${o.id}-2`, kutu: o.alan, kisa: o.metin.split("(")[0].trim(), aciklama: "", ipucu: o.aciklama })),
          bitti: () => {
            durum.className = "d-geri-bildirim dogru";
            durum.textContent = "Form tamamlandı ✓";
            ctx.gorevTamam();
          },
        });
      }
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "İkta: toprak, asker ve otorite",
    cikti: "TAR.10.1.2-c",
    anlatim: `
      <p><b>İkta</b>, bir bölgenin vergi gelirinin, hizmet karşılığında asker ve devlet görevlilerine bırakılmasıdır. İktadar o gelirle atlı asker besler, savaşta orduya katılır.</p>
      <p>Haritadaki kareler temsilî toprak parçalarıdır. Kaydırıcıyla ordunun ne kadarının <b>ikta</b> ile beslendiğini, seçenekle de iktanın <b>merkezden denetlenip denetlenmediğini</b> değiştir.</p>
      <p>Bu bir <b>düşünce modelidir</b>: göstergelerdeki sayılar tarihî veri değil, ilişkilerin yönünü gösterir.</p>`,
    gorev: `Hazine yükü <b>en fazla ${HEDEF.maasEnCok}</b>, hazır asker <b>en az ${HEDEF.askerEnAz}</b>, merkezî otorite <b>en az ${HEDEF.otoriteEnAz}</b> olacak düzeni bul; sonra soruyu cevapla.`,
    ogretmen: "Program, değişim ve sürekliliğin kurumlara etkilerinin sorgulanmasını istiyor (SBAB2.1, SDB2.3). Modelde iktanın denetimi kalkınca otoritenin hızla düştüğünü göstermek, Büyük Selçuklu'nun parçalanma sürecini (9. adım) hazırlar. Modelin sayılarının tarihî veri olmadığını mutlaka belirtin.",
    kur(ctx) {
      const h = ctx.sahne;
      const kutu = [[43, 26.5], [67, 41.5]];
      // gösterge kutusu geniş ekranda sağ üstte, telefonda altta: parseller onun altında kalmasın
      h.sifirla({ kutu, ...SOLUK, pay: (W) => (W > 760 ? { sag: Math.min(330, W * 0.6) + 58 } : { alt: 180 }) });
      h.uyari("Kareler <b>temsilî</b> toprak parçalarıdır: <span style='color:#ffb547'>■</span> ikta · <span style='color:#7d8ea8'>■</span> hazineden maaşlı ordunun beslendiği has topraklar.");
      const sinir = ALANLAR.find((a) => a.id === "bsd-2").halka;
      const parseller = [];
      for (let l = 44; l < 67; l += 1.25) for (let b = 27; b < 41; b += 1) {
        const m = [l + 0.45, b + 0.35];
        if (cokgenIcinde(m, sinir) && geoContains(UZAK_KARA, m)) parseller.push([l, b]);
      }
      let p = 0.2, denetim = true, soruCozuldu = false, hedefTamam = false;
      const k = h.katman("parseller", (g) => {
        const n = parseller.length;
        parseller.forEach(([l, b], i) => {
          const ikta = parselIktaMi(i, n, p);
          const ring = [[l, b], [l, b + 0.7], [l + 0.9, b + 0.7], [l + 0.9, b]];
          const yolD = h.yol({ type: "Polygon", coordinates: [[...ring, ring[0]]] });
          svg("path", {
            d: yolD, fill: ikta ? "rgba(255,181,71,.55)" : "rgba(125,142,168,.35)",
            stroke: ikta && !denetim ? "#ff6b6b" : "#0b1522", "stroke-width": ikta && !denetim ? 1.6 : 0.8,
            "stroke-dasharray": ikta && !denetim ? "3 2" : null,
          }, g);
        });
        const merkezP = h.xy([51.67, 32.65]);
        isaret(g, merkezP, { r: 6, renk: "#4fc3f7" });
        etiket(g, merkezP, "Sultanın divanı (İsfahan)", { dy: -10 });
      });
      // İkta parsellerinde iktadarın atlıları, İsfahan'da hazineden maaşlı ordu (sayılar temsilî)
      const askerM = h.model("askerler", (g) => {
        const n = parseller.length, noktalar = [];
        parseller.forEach(([l, b], i) => { if (parselIktaMi(i, n, p)) for (const [dl, db] of [[0.3, 0.25], [0.6, 0.45]]) noktalar.push(h.yer([l + dl, b + db])); });
        if (noktalar.length) g.add(atlilar(noktalar, { renk: denetim ? "#ffb547" : "#ff6b6b", olcek: h.olcek * 4 }));
        koy(h, g, sehir({ ev: 45, sur: true, tohum: 9 }), [51.67, 32.65], { boy: 5 });
        const maasli = Math.round(40 * (1 - p));
        if (maasli) koy(h, g, ordu({ sayi: maasli, renk: "#7d8ea8", sancak: "#2b4a7a", sira: 4 }), [53.2, 31.6], { boy: 4.5 });
      });
      const bar = el("div", { class: "tar-cubuklar" });
      ctx.katman.append(bar);
      ctx.kaydirici({ etiket: "Ordunun ikta ile beslenen bölümü", min: 0, max: 100, adim: 10, deger: 20, birim: "%", degisti: (v) => { p = v / 100; guncelle(); } });
      ctx.secenekler({
        etiket: "İkta nasıl yönetiliyor?",
        liste: [{ deger: true, metin: "Merkez denetliyor, gerekirse geri alıyor" }, { deger: false, metin: "İktalar babadan oğula geçiyor" }],
        deger: true, degisti: (v) => { denetim = v; guncelle(); },
      });
      const sonuc = el("div", { class: "d-geri-bildirim" });
      const soruKap = el("div");
      ctx.kontroller.append(sonuc, soruKap);
      function cubuk(ad, deger, esik, iyi) {
        const ok = iyi === "az" ? deger <= esik : deger >= esik;
        return el("div", { class: "tar-cubuk" },
          el("span", {}, ad),
          el("div", { class: "tar-cubuk-hat" },
            el("i", { style: `width:${deger}%;background:${ok ? "var(--yesil)" : "var(--kirmizi)"}` }),
            el("b", { style: `left:${esik}%`, title: `eşik ${esik}` })),
          el("output", {}, sayi(deger, 0)));
      }
      function guncelle() {
        const m = iktaModeli({ oran: p, denetim });
        bar.replaceChildren(
          el("div", { class: "tar-cubuk-baslik" }, "Temsilî göstergeler (0–100)"),
          cubuk("Hazineden maaş yükü", m.maas, HEDEF.maasEnCok, "az"),
          cubuk("Savaşa hazır asker", m.asker, HEDEF.askerEnAz, "cok"),
          cubuk("Toprağın işlenmesi, vergi düzeni", m.uretim, 0, "cok"),
          cubuk("Merkezî otorite", m.otorite, HEDEF.otoriteEnAz, "cok"));
        k.yenile(); askerM.yenile();
        if (hedefSaglandi(m)) {
          sonuc.className = "d-geri-bildirim dogru";
          sonuc.innerHTML = "Dengeyi buldun! Ordunun çoğu iktayla besleniyor, hazine rahatladı; merkez iktaları denetlediği için otorite korunuyor.";
          if (!hedefTamam) { hedefTamam = true; soruGoster(); }
        } else if (!denetim && p > 0.33) {
          sonuc.className = "d-geri-bildirim yanlis";
          sonuc.innerHTML = "İktalar babadan oğula geçince iktadarlar sultana değil kendi topraklarına bağlanıyor: <b>merkezî otorite</b> düşüyor.";
        } else {
          sonuc.className = "d-geri-bildirim";
          sonuc.textContent = p < 0.6 ? "Hazine, maaşlı askerlerin yükünü taşımakta zorlanıyor." : "Göstergeleri eşiklerle karşılaştır.";
        }
      }
      function soruGoster() {
        secmeli(soruKap, {
          soru: "Büyük Selçuklu'nun son dönemlerinde iktalar fiilen babadan oğula geçmeye başladı. Bunun <b>kurumlara</b> etkisi ne olmuş olabilir?",
          siklar: [
            "İktadarlar güçlenip yerel hanedanlar kurdu; merkezî otorite zayıfladı.",
            "Hazine nakit maaş ödemek zorunda kaldığı için ikta tamamen kaldırıldı.",
            "Ordu yalnızca gulamlardan oluşmaya başladı, Türkmenler ordudan çıkarıldı.",
          ],
          dogru: 0,
          aciklama: "Atabeylikler ve yerel güçlerin bağımsızlaşması bu sürecin sonucudur. Ama ikta kurumu ortadan kalkmadı: Türkiye Selçuklu ve Osmanlı'da (tımar) biçim değiştirerek sürdü.",
          yanlisAciklama: () => "Modelde denetim kalkınca hangi gösterge düştü?",
          bitti: () => { soruCozuldu = true; if (hedefTamam) ctx.gorevTamam(); },
        });
      }
      guncelle();
    },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Neden–sonuç zinciri: veraset ve bürokrasi",
    cikti: "TAR.10.1.2-ç",
    anlatim: `
      <p>Bir değişimin <b>nedenini</b> ve <b>sonucunu</b> açıklamak için olayları bir zincir gibi bağlarız: her halka bir sonrakini doğurur.</p>
      <p>İki zinciri kur. Birincisi eski bir <b>süreklilik</b> unsurunun (veraset anlayışı) neye yol açtığını, ikincisi bir <b>değişimin</b> (bürokrasinin gelişmesi) neden ortaya çıktığını gösteriyor.</p>
      <p>Halkaları <b>nedenden sonuca</b> doğru sırayla seç.</p>`,
    gorev: "İki neden–sonuç zincirini de <b>doğru sırayla</b> kur.",
    ogretmen: "Program, veraset sistemi, hâkimiyet anlayışı, hükümdarlık alametleri, merkez ve ordu teşkilatındaki değişim ve sürekliliğin neden ve sonuçlarının açıklanmasını istiyor. Zincirler tamamlanınca II. Kılıç Arslan'ın ülkesini oğulları arasında paylaştırmasını örnek olarak tartıştırın: Aynı veraset anlayışı Türkiye Selçuklu'da da sürdü mü?",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: KUTU, ...SOLUK });
      const biten = new Set();
      const t = tahta(ctx);
      const durum = el("div", { class: "d-geri-bildirim" });
      const secim = ctx.secenekler({ etiket: "Zincir", liste: ZINCIRLER.map((z, i) => ({ deger: i, metin: z.baslik })), deger: 0, degisti: (i) => kur(i) });
      ctx.kontroller.append(durum);
      function kur(i) {
        const z = ZINCIRLER[i];
        t.replaceChildren(el("h3", {}, z.baslik));
        siralama(t, {
          ogeler: z.halkalar.map((m, j) => ({ id: `${i}-${j}`, metin: m })),
          listeBaslik: "Zincir (neden → sonuç)",
          ipucu: (beklenen, secilen) => {
            const a = z.halkalar.indexOf(beklenen.metin), b = z.halkalar.indexOf(secilen.metin);
            return b > a ? "Bu halka daha sonra gelir: önce onu doğuran nedeni bul." : "Bu halka zaten önceki bir adım olmalıydı.";
          },
          bitti: () => {
            biten.add(i);
            durum.className = "d-geri-bildirim dogru";
            durum.textContent = `Kurulan zincir: ${biten.size}/${ZINCIRLER.length}`;
            if (biten.size === ZINCIRLER.length) ctx.gorevTamam();
            else setTimeout(() => { const j = ZINCIRLER.findIndex((_, x) => !biten.has(x)); secim.deger = j; kur(j); }, 1200);
          },
        });
      }
      kur(0);
    },
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Değerlendirme",
    anlatim: `
      <p>Dokuz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>7 doğru</b> yaparsan dersi tamamlamış olursun. Yanlış yaptığın konular için ilgili adıma dönebilirsin.</p>`,
    gorev: "Değerlendirmede en az <b>7/9</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (karşılaştırma tablosu, değişim ve süreklilik formu, giriş-çıkış kartı) uyumludur. 8. soru kaynak analizi becerisini yoklar.",
    kur(ctx) {
      const h = ctx.sahne;
      h.sifirla({ kutu: KUTU, ...SOLUK });
      ctx.sinav([
        {
          tur: "coktan", metin: "Aşağıdakilerden hangisi <b>kronolojik olarak doğru</b> sıralanmıştır?",
          siklar: ["Dandanakan – Malazgirt – Miryokefalon – Kösedağ", "Malazgirt – Dandanakan – Kösedağ – Miryokefalon", "Dandanakan – Miryokefalon – Malazgirt – Kösedağ", "Pasinler – Dandanakan – Malazgirt – Hıttin"],
          dogru: 0, aciklama: "1040 Dandanakan, 1071 Malazgirt, 1176 Miryokefalon, 1243 Kösedağ.",
        },
        {
          tur: "sayi", metin: "Malazgirt Meydan Muharebesi ile Miryokefalon Savaşı arasında <b>kaç yıl</b> vardır?",
          dogru: 105, tolerans: 0, birim: "yıl", aciklama: "1176 − 1071 = 105 yıl. Anadolu'nun kapılarının açılmasından Türk yurdu olmasının kesinleşmesine kadar bir asırdan fazla geçti.",
        },
        {
          tur: "coktan", metin: "Büyük Selçuklu Devleti'nin <b>resmen kurulmasını</b> sağlayan savaş hangisidir?",
          siklar: ["Pasinler", "Dandanakan", "Malazgirt", "Kösedağ"], dogru: 1,
          aciklama: "Dandanakan'da (1040) Gaznelileri yenen Selçuklular kurultayda Tuğrul Bey'i hükümdar seçti.",
        },
        {
          tur: "coktan", metin: "“Bizans'ın Türkleri Anadolu'dan çıkarma umudu sona erdi.” Bu sonuç hangi savaşa aittir?",
          siklar: ["Malazgirt", "Pasinler", "Miryokefalon", "Hıttin"], dogru: 2,
          aciklama: "Malazgirt kapıları açtı; ama Bizans Anadolu'yu geri alma umudunu ancak Miryokefalon'da (1176) yitirdi.",
        },
        {
          tur: "coktan", metin: "Kösedağ yenilgisinin hangi sonucu Anadolu'nun Türkleşmesini <b>dolaylı olarak hızlandırmıştır</b>?",
          siklar: ["Selçuklu sultanlarının Moğollara vergi ödemesi", "Moğol baskısından kaçan Türkmenlerin Batı Anadolu uçlarına yığılması", "Haçlı seferlerinin yeniden başlaması", "Bizans'ın İznik'i geri alması"],
          dogru: 1, aciklama: "Uç bölgelerine yığılan Türkmenler Batı Anadolu'nun Türkleşmesini hızlandırdı; Osmanlı Beyliği de bu uç bölgesinde doğdu.",
        },
        {
          tur: "coktan", metin: "Aşağıdakilerden hangisi Türk devlet geleneğinde <b>süreklilik</b> gösteren bir unsurdur?",
          siklar: ["Vezirlik makamı", "İkta sistemi", "Ülkenin hanedanın ortak malı sayılması", "Hutbe okutma"],
          dogru: 2, aciklama: "Ortak mal anlayışı İslamiyet öncesinden beri sürdü ve taht kavgalarına yol açtı. Diğerleri yeni kurumlardır.",
        },
        {
          tur: "coktan", metin: "Aşağıdakilerden hangisi ikta sisteminin devlete sağladığı yararlardan <b>biri değildir</b>?",
          siklar: ["Hazineden maaş ödemeden büyük bir atlı ordu beslemek", "Toprağın boş kalmamasını sağlamak", "Vergilerin düzenli toplanması", "Merkezî otoriteyi her koşulda güçlendirmek"],
          dogru: 3, aciklama: "İktalar denetlenemeyip babadan oğula geçmeye başlayınca merkezî otorite zayıfladı.",
        },
        {
          tur: "coktan", metin: "“Esir imparatoru çadırında ağırladı, antlaşma yapıp serbest bıraktı.” Bu bilgiyi Malazgirt seferine katılan Bizanslı yazar <b>Mihail Attaleiates</b> aktarır. Hangisi söylenebilir?",
          siklar: ["Türk kaynağı olduğu için güvenilmezdir.", "Olayın tanığının yazdığı birincil kaynaktır ve Türk hükümdarının esire merhametli davrandığını gösterir.", "Olaydan yüzyıllar sonra yazılmış ikincil bir kaynaktır.", "Savaşın sonucunu Bizans'ın kazandığını gösterir."],
          dogru: 1, aciklama: "Yazar Bizanslı bir görgü tanığıdır; karşı tarafın kaynağı olması anlatılan merhameti daha da güçlü bir kanıt yapar.",
        },
        {
          tur: "coktan", metin: "Hıttin Muharebesi'nin (1187) ardından hangi şehir yeniden fethedilmiştir?",
          siklar: ["İznik", "Kudüs", "Antalya", "Bağdat"], dogru: 1,
          aciklama: "Selahaddin Eyyubi Hıttin'den sonra Kudüs'ü fethetti (2 Ekim 1187); bunun üzerine III. Haçlı Seferi düzenlendi.",
        },
      ], { baslik: "Türkistan'dan Türkiye'ye", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar: anlatimEkle(adimlar, ANLAT), sahneKur: (kap) => haritaKur(kap, { kutu: KUTU, ...SOLUK }) });
