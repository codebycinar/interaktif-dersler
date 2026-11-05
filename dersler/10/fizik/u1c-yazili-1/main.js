// 10. Sınıf Fizik · 1. Ünite · Yazılıya Hazırlık: MEB OGM "Yazılıya Hazırlanıyorum" 1. dönem 1. yazılı senaryoları
// Her adım bir soru: senaryo sahnede canlandırılır, çözüm cevap anahtarındaki mantıkla satır satır açılır,
// sonra sayıları değiştirilmiş benzeri öğrenciye çözdürülür. Sorular kendi cümlelerimizle yeniden anlatılmıştır.
// Kaynak: https://ogmmateryal.eba.gov.tr/yaziliya-hazirlaniyorum (10. sınıf · Fizik · 1. Dönem 1. Yazılı)
import { dersBaslat, sayi, el, Grafik } from "../../../../engine/ders.js";
import { yolSahnesi, kosu } from "../u1-hareket/sahne.js";
import { parcali, hareketTuru } from "../ortak/kinematik.js";
import { agacDizisi, dronYap, isaretDiregi, kuleYap, devrikAgac } from "./sahne-ek.js";
import { yetisme, araliklar, deneme, bolgeIvmesi, duzgunDegisim, frenSenaryosu } from "./model.js";

const RENK_X = "#ff8a3d", RENK_V = "#5ad38b", RENK_A = "#ff9f43", RENK_B = "#3d9bff", RENK_SARI = "#ffd28a";
const KAYNAK = `<p class="fzy-kaynak">Kaynak: MEB OGM Materyal, <a href="https://ogmmateryal.eba.gov.tr/yaziliya-hazirlaniyorum" target="_blank" rel="noopener">Yazılıya Hazırlanıyorum</a> · 10. Sınıf Fizik · 1. Dönem 1. Yazılı. Soru burada kendi cümlelerimizle özetlendi; çözüm resmî cevap anahtarıyla aynı sonucu verir.</p>`;

const xtGrafigi = (tMax, y) => ({ baslik: "Konum – zaman", x: { etiket: "t (s)", min: 0, max: tMax }, y: { etiket: "x (m)", otomatik: true, ...y } });
const vtGrafigi = (tMax, y) => ({ baslik: "Hız – zaman", x: { etiket: "t (s)", min: 0, max: tMax }, y: { etiket: "v (m/s)", otomatik: true, ...y } });
const atGrafigi = (tMax, y) => ({ baslik: "İvme – zaman", x: { etiket: "t (s)", min: 0, max: tMax }, y: { etiket: "a (m/s²)", ...y } });

function hud(ctx, liste) {
  const kap = el("div", { class: "d-etiket-hud" });
  ctx.katman.append(kap);
  return ctx.gostergeler(liste, kap);
}
/** Birkaç sayısal sorunun hepsi doğru olunca görevi tamamlar */
function soruTakibi(ctx, adet) {
  const biten = new Set();
  return (i) => { biten.add(i); if (biten.size >= adet) ctx.gorevTamam(); };
}
const yakin = (c, d, tol = 0.3) => Math.abs(c - d) <= tol;

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "1. Soru: Ağaçlı yolda sabit hız",
    cikti: "FİZ.10.1.1-a",
    anlatim: `
      <p><b>Senaryo:</b> Yol kenarına eşit aralıklarla ağaç dikilmiş. Aracın hız–zaman grafiği yatay bir doğru (sabit hız). Araç t = 0'da 1. ağaç, t = 1 s'de 2. ağaç hizasında.</p>
      <p><b>Sorular:</b> (1.1) t = 6 s'de kaçıncı ağaç? (1.2) İvmesi kaç, neden? (1.3) Konum–zaman grafiğini çiz, Δx, v, t arasındaki modeli yaz.</p>
      <p><b>Cevaplar:</b> 7. ağaç · a = 0 (hız değişmiyor) · grafik orijinden çıkan düz doğru, <span class="formul">Δx = v · t</span>.</p>${KAYNAK}`,
    gorev: "Sayıları değiştirilmiş benzerini çöz: <b>iki sayısal cevap</b>.",
    ogretmen: "Puanlama: 1.1 (5) 1.2 (4) 1.3 (6). Öğrencilerin en çok kaybettiği yer 1.3: grafik doğru ama model yazılmıyor. 'Grafikten model' derken eğimin hız olduğunu ve x = v·t'nin eğim denklemi olduğunu vurgulayın.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      const ARALIK = 10;
      const agaclar = agacDizisi(S, { bas: 0, aralik: ARALIK, sayi: 12 });
      ctx.temizlik(() => agaclar.kaldir());
      let k = null;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "x", etiket: "Konum", birim: "m" }, { ad: "v", etiket: "Hız", birim: "m/s" }, { ad: "agac", etiket: "Hizasındaki ağaç", birim: "" }]);
      const [gvt, gxt] = ctx.grafikler([vtGrafigi(6, { min: 0, max: 15, otomatik: false }), xtGrafigi(6, { min: 0, max: 70, otomatik: false })]);
      const sv = gvt.seri("v", { renk: RENK_V, kalinlik: 3 }), sx = gxt.seri("x", { renk: RENK_X, nokta: true });
      S.A.yerlestir(0); S.kameraya(25, { uzaklik: 48 });
      function sur(v, T = 6) {
        k?.durdur(); sx.temizle(); sv.ayarla([[0, v], [T, v]]); gxt.not([]); S.izleriTemizle();
        S.A.yerlestir(0);
        k = kosu(S, {
          sure: T,
          kare: (t) => { const x = v * t; S.A.yerlestir(x); S.A.oklar({ v }); S.takip(x); h.ayarla("t", t); h.ayarla("x", x); h.ayarla("v", v); h.ayarla("agac", `${Math.floor(x / ARALIK + 1e-6) + 1}.`); },
          saniye: (n) => { sx.ekle(n, v * n); S.izBirak("A", v * n, `${n} s`); },
          bitti: () => S.A.oklar(),
        });
      }
      function egim() { gxt.egimUcgeni(0, 0, 6, 60, { xEtiket: "t", yEtiket: "Δx" }); gxt.not([{ x: 3, y: 40, metin: "Δx = v · t", renk: RENK_SARI }]); }

      /* Alıştırma: aralık 12 m, t = 1 s'de 3. ağaç */
      const tamam = soruTakibi(ctx, 2);
      ctx.not(`<p><b>Benzer soru.</b> Ağaçlar <b>12 m</b> aralıkla dikili. Araç t = 0'da 1. ağaç, <b>t = 1 s'de 3. ağaç</b> hizasında ve hızı sabit.</p>`);
      ctx.dugmeler([{ metin: "▶ Aracı izle", ana: true, tik: () => sur(24, 5) }]);
      ctx.sayiSorusu({ etiket: "<b>a)</b> t = 5 s'de araç kaçıncı ağaç hizasındadır?", birim: ". ağaç",
        kontrol: (c) => { if (yakin(c, 11, 0.1)) { tamam(0); return true; } if (yakin(c, 10, 0.1)) return "Her saniye 2 aralık: 5 s'de 10 aralık. Ama 1. ağaçtan başladı; 10 aralık sonrası kaçıncı ağaç?"; return "1 s'de 1. ağaçtan 3. ağaca geldi: saniyede kaç aralık? 5 saniyede kaç aralık?"; } });
      ctx.sayiSorusu({ etiket: "<b>b)</b> Aracın hızı kaç m/s? (Aralık 12 m.)", birim: "m/s",
        kontrol: (c) => { if (yakin(c, 24, 0.3)) { tamam(1); return true; } if (yakin(c, 12, 0.3)) return "Saniyede bir aralık değil, iki aralık geçiyor."; return "Bir saniyede kaç metre gitti? 2 aralık × 12 m."; } });
      ctx.temizlik(() => k?.durdur());
      return { sur, egim };
    },
    anlat: [
      { s: "Yol kenarında eşit aralıklı ağaçlar var. Araç t = 0'da <b>1. ağaç</b> hizasında ve hızı sabit. İzle…", yap: (api) => api.sur(10) },
      { s: "Hız–zaman grafiği <b>yatay</b>: hız hiç değişmiyor. Konum grafiği ise her saniye bir ağaç yukarı çıkıyor.", grafik: true },
      { s: "<b>1.1</b> Araç 1 saniyede 2. ağaca geldi: saniyede <b>1 aralık</b>. 6 saniyede 6 aralık → <b>7. ağaç</b>. (6. değil! 1'den başladı.)" },
      { soru: "Araç t = 1 s'de 2. ağaçtaysa, t = 6 s'de kaçıncı ağaçta olur?", secenekler: ["6. ağaç", "7. ağaç", "12. ağaç"], dogru: 1,
        aciklama: "6 aralık ilerler; 1. ağaçtan 6 aralık sonrası 7. ağaçtır. Ağaç sayısı = aralık sayısı + 1.", ipucu: "1. ağaçtan 1 aralık sonra kaçıncı ağaç? Oradan devam et." },
      { s: "<b>1.2</b> İvme nedir? Hız sabit → hız değişimi yok → <b>a = 0</b>. Gerekçe cümlesini yazmayı unutma: “Araç sabit hızlı hareket ettiği için ivmesi sıfırdır.”" },
      { formul: [["a", "ivme"], ["="], ["Δv", "hız değişimi = 0"], ["/"], ["Δt", "süre"]], s: "Δv = 0 olduğundan a = 0.", oku: "a eşittir delta v bölü delta t. Delta v sıfır olduğundan a sıfırdır." },
      { s: "<b>1.3</b> Konum–zaman grafiği: sabit hızda eşit sürede eşit yol → <b>orijinden çıkan düz bir doğru</b>.", yap: (api) => api.egim() },
      { formul: [["Δx", "yer değiştirme"], ["="], ["v", "hız (eğim)"], ["·"], ["t", "süre"]], s: "Doğrunun eğimi hızdır. Matematiksel model: <b>Δx = v · t</b>. Burada v = 10 m/s: Δx = 10t.", oku: "Delta x eşittir v çarpı t." },
      { cozum: ["Grafikten iki nokta: (0 s, 0 m) ve (6 s, 60 m)", "Eğim = Δx / Δt = 60 / 6 = 10 m/s = v", "Model: Δx = 10 · t"] },
      { s: "Puan kaybetmemek için: grafik + model <b>ikisi birden</b> yazılmalı (3 + 3 puan)." },
      { s: "Şimdi sen: ağaçlar 12 m aralıklı, araç 1 saniyede 3. ağaca geliyor." },
    ],
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "2. Soru: Dronlar, yetişme problemi",
    cikti: "FİZ.10.1.1-c",
    anlatim: `
      <p><b>Senaryo:</b> K ve L dronları aynı yönde sabit hızla uçuyor; K arkada, aralarında 48 m. v<sub>K</sub> = 20 m/s, v<sub>L</sub> = 8 m/s.</p>
      <p><b>Sorular:</b> (2.1) K, L'ye kaç s sonra yetişir? (2.2) O ana kadar her biri kaç m yol alır? (2.3) Hız–zaman, (2.4) konum–zaman grafikleri (K'nin başlangıcı referans).</p>
      <p><b>Cevaplar:</b> 4 s · K: 80 m, L: 32 m · v–t: 20 ve 8'de yatay doğrular · x–t: K 0'dan, L 48'den çıkan ve 80 m'de kesişen doğrular.</p>${KAYNAK}`,
    gorev: "Benzerini çöz: yetişme süresi ve yavaş dronun yolu.",
    ogretmen: "Puanlama: 2.1 (3) 2.2 (6) 2.3 (4) 2.4 (6). Konum–zaman grafiğinde L'nin 48 m'den başladığını unutmak en sık hata; grafikte kesişme noktasının (4 s, 80 m) olduğunu işaretletin.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla(); S.A.grup.visible = false;
      const K = dronYap(S, { renk: 0xff8a3d, z: -2.5, ad: "K" }), L = dronYap(S, { renk: 0x3d9bff, z: 2.5, ad: "L" });
      ctx.temizlik(() => { K.kaldir(); L.kaldir(); });
      let k = null;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "xK", etiket: "K konumu", birim: "m" }, { ad: "xL", etiket: "L konumu", birim: "m" }, { ad: "fark", etiket: "Aradaki mesafe", birim: "m" }]);
      const [gvt, gxt] = ctx.grafikler([vtGrafigi(5, { min: 0, max: 25, otomatik: false }), xtGrafigi(5, { min: 0, max: 100, otomatik: false })]);
      const svK = gvt.seri("K", { renk: RENK_X, kalinlik: 3 }), svL = gvt.seri("L", { renk: RENK_B, kalinlik: 3 });
      const sxK = gxt.seri("K", { renk: RENK_X }), sxL = gxt.seri("L", { renk: RENK_B });
      function kur(d, vK, vL) { k?.durdur(); K.yerlestir(0); L.yerlestir(d); K.hiz(null); L.hiz(null); sxK.temizle(); sxL.temizle(); svK.temizle(); svL.temizle(); gxt.not([]); S.kameraya(d / 2, { uzaklik: 60 }); h.ayarla("t", 0); h.ayarla("xK", 0); h.ayarla("xL", d); h.ayarla("fark", d); }
      function sur({ d, vK, vL, grafik = true }) {
        kur(d, vK, vL);
        const y = yetisme({ mesafe: d, vHizli: vK, vYavas: vL });
        const T = y.t + 1;
        gvt.eksenAyarla({ x: { max: T }, y: { max: Math.max(25, vK + 5) } }); gxt.eksenAyarla({ x: { max: T }, y: { max: Math.max(100, vK * T + 10) } });
        if (grafik) svK.ayarla([[0, vK], [T, vK]]), svL.ayarla([[0, vL], [T, vL]]);
        let isaretlendi = false;
        k = kosu(S, {
          sure: T,
          kare: (t) => {
            const xK = vK * t, xL = d + vL * t;
            K.yerlestir(xK); L.yerlestir(xL); K.hiz(vK); L.hiz(vL); S.takip((xK + xL) / 2);
            if (grafik) { sxK.ekle(t, xK); sxL.ekle(t, xL); }
            h.ayarla("t", t); h.ayarla("xK", xK); h.ayarla("xL", xL); h.ayarla("fark", xL - xK);
            if (!isaretlendi && t >= y.t) { isaretlendi = true; if (grafik) gxt.not([{ x: y.t, y: y.yolHizli, metin: `yetişme: ${sayi(y.t)} s, ${sayi(y.yolHizli, 0)} m`, renk: RENK_SARI, hiza: "right", dx: -6 }]); }
          },
          saniye: (n) => { S.izBirak("A", vK * n, `${n} s`); S.izBirak("B", d + vL * n); },
        });
      }
      /* Alıştırma: 60 m, 18 ve 6 m/s */
      const tamam = soruTakibi(ctx, 2);
      ctx.not(`<p><b>Benzer soru.</b> K dronu arkada, aralarında <b>60 m</b>. v<sub>K</sub> = <b>18 m/s</b>, v<sub>L</sub> = <b>6 m/s</b>.</p>`);
      ctx.dugmeler([{ metin: "▶ Dronları izle", ana: true, tik: () => sur({ d: 60, vK: 18, vL: 6, grafik: false }) }]);
      ctx.sayiSorusu({ etiket: "<b>a)</b> K, L'ye kaç saniye sonra yetişir?", birim: "s",
        kontrol: (c) => { if (yakin(c, 5, 0.1)) { tamam(0); return true; } if (yakin(c, 60 / 18, 0.2)) return "L de hareket ediyor; sadece K'nin hızına bölemezsin. Aradaki mesafe her saniye kaç m kapanıyor?"; return "Yaklaşma hızı = 18 − 6. Mesafeyi bu hıza böl. (ya da 18t = 60 + 6t)"; } });
      ctx.sayiSorusu({ etiket: "<b>b)</b> Yetişene kadar L dronu kaç m yol alır?", birim: "m",
        kontrol: (c) => { if (yakin(c, 30, 0.5)) { tamam(1); return true; } if (yakin(c, 90, 0.5)) return "Bu K'nin yolu. L'nin hızı 6 m/s."; return "x_L = v_L · t = 6 · (bulduğun süre)."; } });
      ctx.temizlik(() => k?.durdur());
      return { sur };
    },
    anlat: [
      { s: "İki dron aynı yönde uçuyor. K (turuncu) arkada, L (mavi) 48 m önde. K daha hızlı: 20 m/s'ye karşı 8 m/s. İzle…", yap: (api) => api.sur({ d: 48, vK: 20, vL: 8 }) },
      { s: "Aradaki mesafe her saniye kapanıyor. <b>Ne kadar?</b> 20 − 8 = 12 m. Buna yaklaşma hızı diyebiliriz.", grafik: true },
      { formul: [["x<sub>K</sub>", "K'nin konumu"], ["="], ["20·t", "hız × süre"]], s: "K'nin başlangıcı referans (0 m). L ise 48 m önden başlıyor: x<sub>L</sub> = 48 + 8·t.", oku: "x K eşittir 20 t. x L eşittir 48 artı 8 t." },
      { cozum: ["<b>2.1</b> Yetişme anında konumlar eşit: x<sub>K</sub> = x<sub>L</sub>", "20t = 48 + 8t", "12t = 48", "t = 4 s"] },
      { cozum: ["<b>2.2</b> K'nin yolu: x<sub>K</sub> = 20 · 4 = 80 m", "L'nin yolu: x<sub>L</sub> = 8 · 4 = 32 m", "Sağlama: 80 − 32 = 48 m, aradaki fark kapandı ✓"] },
      { soru: "L dronu 32 m yol aldığına göre yetişme anında <b>konumu</b> kaç m'dir (K'nin başlangıcına göre)?", secenekler: ["32 m", "48 m", "80 m"], dogru: 2,
        aciklama: "L 48 m'den başladı, 32 m gitti: 48 + 32 = 80 m. K de 80 m'de: aynı yerdeler.", ipucu: "L'nin ilk konumu 0 değil 48." },
      { s: "<b>2.3</b> Hız–zaman: iki <b>yatay</b> doğru, K 20'de, L 8'de, 0–4 s arası. Soldaki grafik." },
      { s: "<b>2.4</b> Konum–zaman: K <b>0'dan</b>, L <b>48'den</b> çıkan iki doğru; (4 s, 80 m)'de kesişiyorlar. L'yi 0'dan başlatmak en sık hata!" },
      { s: "Şimdi sen: 60 m ara, 18 ve 6 m/s." },
    ],
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "3. Soru: S–T–R, ivme yönü ve hareket türü",
    cikti: "FİZ.10.1.2",
    anlatim: `
      <p><b>Senaryo:</b> +x yönünde giden araç S'den 18 m/s ile geçiyor. S–T arası: 2 m/s² büyüklüğünde, <b>−x yönlü</b> ivme, 3 s. T–R arası: 3 m/s², <b>+x yönlü</b>, 6 s.</p>
      <p><b>Sorular:</b> (3.1) Her aralıkta hareket türü, gerekçesiyle. (3.2) v<sub>T</sub>, v<sub>R</sub>; tabloyu doldur.</p>
      <p><b>Cevaplar:</b> S–T: hız +x, ivme −x, zıt → yavaşlar; v<sub>T</sub> = 12 m/s. T–R: aynı yön → hızlanır; v<sub>R</sub> = 30 m/s.</p>${KAYNAK}`,
    gorev: "Benzerini çöz: v<sub>T</sub>, v<sub>R</sub> ve iki aralığın hareket türü.",
    ogretmen: "Puanlama: 3.1 (4) 3.2 (5, her boşluk 1). Gerekçe cümlesi puanın yarısı: 'hız ve ivme vektörleri zıt yönlü olduğundan yavaşlar' kalıbını öğrencilere yazdırın.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      const dir = [isaretDiregi(S, 0, "S"), isaretDiregi(S, 45, "T"), isaretDiregi(S, 171, "R")];
      ctx.temizlik(() => dir.forEach((d) => d.kaldir()));
      let k = null;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "v", etiket: "Hız", birim: "m/s" }, { ad: "a", etiket: "İvme", birim: "m/s²" }, { ad: "tur", etiket: "Hareket", birim: "" }]);
      const [gvt] = ctx.grafikler([vtGrafigi(9, { min: 0, max: 32, otomatik: false })]);
      const sv = gvt.seri("v", { renk: RENK_V, kalinlik: 3 });
      S.A.yerlestir(0); S.kameraya(20, { uzaklik: 50 });
      function sur(v0, liste) {
        k?.durdur(); sv.temizle(); gvt.not([]); S.izleriTemizle();
        const parcalar = liste.map((p) => ({ sure: p.sure, a: p.yon * p.buyukluk }));
        const f = parcali(0, v0, parcalar), T = parcalar.reduce((s, p) => s + p.sure, 0);
        gvt.eksenAyarla({ x: { max: T } });
        S.A.yerlestir(0);
        k = kosu(S, {
          sure: T,
          kare: (t) => { const d = f(t); S.A.yerlestir(d.x); S.A.oklar({ v: d.v, a: d.a }); S.A.stopLambasi(hareketTuru(d.v, d.a) === "yavasliyor"); S.takip(d.x); sv.ekle(t, d.v); h.ayarla("t", t); h.ayarla("v", d.v); h.ayarla("a", d.a); h.ayarla("tur", { hizlaniyor: "hızlanıyor", yavasliyor: "yavaşlıyor", sabit: "sabit hız" }[hareketTuru(d.v, d.a)] || "—"); },
          saniye: (n) => S.izBirak("A", f(n).x, `${n} s`),
          bitti: () => { S.A.oklar(); S.A.stopLambasi(false); const s = araliklar(v0, liste); let t = 0; gvt.not(s.map((r, i) => { t += liste[i].sure; return { x: t, y: r.son, metin: `${sayi(r.son, 0)} m/s`, renk: RENK_SARI, hiza: "right", dx: -4 }; })); },
        });
      }
      /* Alıştırma: 24 m/s; S–T: 3 m/s² −x, 2 s; T–R: 2 m/s² +x, 5 s */
      const tamam = soruTakibi(ctx, 4);
      ctx.not(`<p><b>Benzer soru.</b> Araç S'den <b>24 m/s</b> ile geçiyor. S–T: <b>3 m/s²</b>, <b>−x</b> yönlü, <b>2 s</b>. T–R: <b>2 m/s²</b>, <b>+x</b> yönlü, <b>5 s</b>.</p>`);
      ctx.dugmeler([{ metin: "▶ Aracı izle", ana: true, tik: () => sur(24, [{ yon: -1, buyukluk: 3, sure: 2 }, { yon: 1, buyukluk: 2, sure: 5 }]) }]);
      const turSoru = (i, etiket, dogru) => ctx.secenekler({ etiket, deger: null, liste: [{ deger: "hizlaniyor", metin: "Hızlanır" }, { deger: "yavasliyor", metin: "Yavaşlar" }, { deger: "sabit", metin: "Sabit hız" }],
        degisti: (v) => { if (ctx.gosteriyor()) return; geri[i].className = `d-geri-bildirim ${v === dogru ? "dogru" : "yanlis"}`; geri[i].textContent = v === dogru ? "Doğru." : "Hız +x yönünde. İvme aynı yönde mi, zıt mı?"; if (v === dogru) tamam(i); } });
      const geri = [el("div", { class: "d-geri-bildirim" }), el("div", { class: "d-geri-bildirim" })];
      turSoru(0, "S–T arası hareket türü", "yavasliyor"); ctx.kontroller.append(geri[0]);
      ctx.sayiSorusu({ etiket: "v<sub>T</sub> kaç m/s?", birim: "m/s", kontrol: (c) => { if (yakin(c, 18)) { tamam(2); return true; } if (yakin(c, 30)) return "İvme −x yönlü: hız azalır, artmaz."; return "v = v₀ + a·t = 24 + (−3)·2"; } });
      turSoru(1, "T–R arası hareket türü", "hizlaniyor"); ctx.kontroller.append(geri[1]);
      ctx.sayiSorusu({ etiket: "v<sub>R</sub> kaç m/s?", birim: "m/s", kontrol: (c) => { if (yakin(c, 28)) { tamam(3); return true; } if (yakin(c, 34)) return "T'deki hızdan başla (24'ten değil)."; return "v_R = v_T + 2 · 5"; } });
      ctx.temizlik(() => k?.durdur());
      return { sur };
    },
    anlat: [
      { s: "Araç S'den <b>18 m/s</b> ile geçiyor. S–T arasında ivme <b>−x</b> yönlü (hıza ters), T–R arasında <b>+x</b> yönlü. İzle…", yap: (api) => api.sur(18, [{ yon: -1, buyukluk: 2, sure: 3 }, { yon: 1, buyukluk: 3, sure: 6 }]) },
      { s: "S–T: hız oku sağa, ivme oku sola: <b>zıt yönlü</b>. Stop lambaları yandı, araç yavaşlıyor. Hız grafiği aşağı iniyor.", grafik: true },
      { s: "T–R: ivme oku da sağa döndü: <b>aynı yönlü</b>. Araç hızlanıyor, hız grafiği yukarı çıkıyor." },
      { s: "<b>3.1</b> Cevap cümlesi: “S–T arasında hız +x, ivme −x yönünde; vektörler zıt yönlü olduğundan araç <b>yavaşlayan</b> hareket yapar.” T–R için aynı kalıp, “aynı yönlü → hızlanan”." },
      { formul: [["v", "son hız"], ["="], ["v₀", "ilk hız"], ["+"], ["a·t", "ivme (işaretli) × süre"]], s: "İvme −x yönlüyse a'yı eksi al.", oku: "v eşittir v sıfır artı a çarpı t." },
      { cozum: ["<b>S–T:</b> v₀ = 18 m/s, a = −2 m/s², t = 3 s", "v_T = 18 + (−2)·3 = 18 − 6 = 12 m/s", "<b>T–R:</b> v₀ = 12 m/s (T'deki hız!), a = +3 m/s², t = 6 s", "v_R = 12 + 3·6 = 12 + 18 = 30 m/s"] },
      { soru: "T–R aralığında ilk hız olarak neyi almalıyız?", secenekler: ["18 m/s (S'deki hız)", "12 m/s (T'deki hız)", "0"], dogru: 1,
        aciklama: "Her aralığın ilk hızı, bir önceki aralığın son hızıdır. T–R için başlangıç T noktasıdır: 12 m/s.", ipucu: "Araç T'den geçerken hızı kaçtı?" },
      { s: "<b>3.2</b> Tablo: S–T: 18 → 12, azalır, −x, 2. T–R: 12 → 30, artar, +x, 3. Her boşluk 1 puan." },
      { s: "Şimdi sen: 24 m/s ile giriyor, S–T: 3 m/s² ters yönlü 2 s; T–R: 2 m/s² aynı yönlü 5 s." },
    ],
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "4. Soru: Tramvay denemeleri, tablo doldurma",
    cikti: "FİZ.10.1.2",
    anlatim: `
      <p><b>Senaryo:</b> Tramvay düz hatta dört deneme yapıyor; 0, 2, 4. saniyelerdeki hızlar: K: +2, +6, +10 · L: +2, +4, +6 · M: −10, −6, −2 · N: −2, −6, −10 (doğu +).</p>
      <p><b>Sorular:</b> (4.1) 0–2 s için Δv, a, hız yönü, ivme yönü, hareket türü. (4.2) K ve N için 0–2 s ve 0–4 s'deki Δv'yi karşılaştır; Δv'nin büyüklüğü süreye, yönü ivmeye nasıl bağlı?</p>
      <p><b>Cevaplar:</b> K: +4, +2, D, D, hızlanır · L: +2, +1, D, D, hızlanır · M: +4, +2, B, D, yavaşlar · N: −4, −2, B, B, hızlanır. Süre 2 katına çıkınca |Δv| 2 katına çıkar; Δv'nin yönü ivmenin yönüdür.</p>${KAYNAK}`,
    gorev: "Benzerini çöz: iki yeni deneme için ivme ve hareket türü.",
    ogretmen: "Puanlama: 4.1 (5, sütun başına 1) 4.2 (6). M denemesi can alıcı: hız batıya, ivme doğuya, yavaşlıyor; 'ivme pozitif ama tramvay yavaşlıyor' ifadesini sınıfta tartıştırın.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      let k = null;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "v", etiket: "Hız", birim: "m/s" }, { ad: "a", etiket: "İvme", birim: "m/s²" }]);
      const [gvt] = ctx.grafikler([vtGrafigi(4, { min: -12, max: 12, otomatik: false })]);
      const sv = gvt.seri("v", { renk: RENK_V, kalinlik: 3 });
      const DENEME = { K: [2, 6, 10], L: [2, 4, 6], M: [-10, -6, -2], N: [-2, -6, -10] };
      S.A.yerlestir(0); S.kameraya(10, { uzaklik: 48 });
      function sur(ad) {
        k?.durdur(); sv.temizle(); S.izleriTemizle();
        const [v0, v2] = DENEME[ad], a = (v2 - v0) / 2;
        const f = parcali(0, v0, [{ sure: 4, a }]);
        S.A.yerlestir(0); S.kameraya(v0 > 0 ? 15 : -15, { uzaklik: 48 });
        k = kosu(S, { sure: 4,
          kare: (t) => { const d = f(t); S.A.yerlestir(d.x); S.A.oklar({ v: d.v, a }); S.A.stopLambasi(hareketTuru(d.v, a) === "yavasliyor"); S.takip(d.x); sv.ekle(t, d.v); h.ayarla("t", t); h.ayarla("v", d.v); h.ayarla("a", a); },
          saniye: (n) => S.izBirak("A", f(n).x, `${n} s`),
          bitti: () => { S.A.oklar(); S.A.stopLambasi(false); } });
      }
      const tablo = ctx.tablo(["Deneme", "Δv (m/s)", "a (m/s²)", "Hız yönü", "İvme yönü", "Hareket"]);
      for (const ad of Object.keys(DENEME)) { const d = deneme([[0, DENEME[ad][0]], [2, DENEME[ad][1]]]); tablo.satirEkle([ad, (d.dv > 0 ? "+" : "") + d.dv, (d.a > 0 ? "+" : "") + d.a, d.hizYonu, d.ivmeYonu, d.hareket]); }
      /* Alıştırma: P: −4, −7, −10 (batı, hızlanır, a = −1,5) · Q: +12, +8, +4 (doğu, yavaşlar, a = −2) */
      const tamam = soruTakibi(ctx, 4);
      ctx.not(`<p><b>Benzer soru.</b> İki yeni deneme (0, 2, 4. saniyelerdeki hızlar): <b>P:</b> −4, −7, −10 m/s · <b>Q:</b> +12, +8, +4 m/s.</p>`);
      const ekle = (ad, dizi) => { DENEME[ad] = dizi; };
      ekle("P", [-4, -7, -10]); ekle("Q", [12, 8, 4]);
      ctx.dugmeler([{ metin: "▶ P'yi izle", tik: () => sur("P") }, { metin: "▶ Q'yu izle", tik: () => sur("Q") }]);
      const hareketSoru = (i, ad, dogru, ipucu) => { const g = el("div", { class: "d-geri-bildirim" }); ctx.secenekler({ etiket: `${ad} denemesi: hareket`, deger: null, liste: [{ deger: "Hızlanır", metin: "Hızlanır" }, { deger: "Yavaşlar", metin: "Yavaşlar" }], degisti: (v) => { if (ctx.gosteriyor()) return; const ok = v === dogru; g.className = `d-geri-bildirim ${ok ? "dogru" : "yanlis"}`; g.textContent = ok ? "Doğru." : ipucu; if (ok) tamam(i); } }); ctx.kontroller.append(g); };
      hareketSoru(0, "P", "Hızlanır", "Hız batıya (−), sürat 4'ten 7'ye büyüyor. Hız ve ivme aynı yönde mi?");
      ctx.sayiSorusu({ etiket: "P denemesinde 0–2 s aralığında ivme kaç m/s²? (İşaretli.)", birim: "m/s²", kontrol: (c) => { if (yakin(c, -1.5, 0.05)) { tamam(1); return true; } if (yakin(c, 1.5, 0.05)) return "Δv = (−7) − (−4) = −3. İşaret eksi."; return "a = Δv / Δt = [(−7) − (−4)] / 2"; } });
      hareketSoru(2, "Q", "Yavaşlar", "Hız doğuya (+), ivme Δv = 8 − 12 = −4 → batıya. Zıt yönlüler.");
      ctx.sayiSorusu({ etiket: "Q denemesinde 0–4 s aralığında hız değişimi Δv kaç m/s?", birim: "m/s", kontrol: (c) => { if (yakin(c, -8, 0.1)) { tamam(3); return true; } if (yakin(c, -4, 0.1)) return "Bu 0–2 s için. 0–4 s: son hız 4, ilk hız 12."; return "Δv = v(4 s) − v(0 s) = 4 − 12"; } });
      ctx.temizlik(() => k?.durdur());
      return { sur };
    },
    anlat: [
      { s: "Tramvay dört deneme sürüşü yapıyor. Doğu +, batı −. Önce <b>K</b>: hızı +2, +6, +10. İzle…", yap: (api) => api.sur("K") },
      { s: "Her 2 saniyede hız 4 m/s artıyor: Δv = +4, a = +4/2 = <b>+2 m/s²</b>. Hız doğuya, ivme doğuya: <b>hızlanır</b>.", grafik: true },
      { s: "Şimdi <b>M</b>: hızı −10, −6, −2. Araç batıya gidiyor ama sürati küçülüyor.", yap: (api) => api.sur("M") },
      { cozum: ["<b>M:</b> Δv = (−6) − (−10) = +4 m/s", "a = +4 / 2 = +2 m/s² → ivme <b>doğuya</b>", "Hız batıya, ivme doğuya: zıt → <b>yavaşlar</b>"] },
      { soru: "M denemesinde ivme pozitif (+2). Tramvay hızlanıyor mu?", secenekler: ["Evet, ivme pozitif olduğu için", "Hayır, hız ve ivme zıt yönlü olduğu için yavaşlıyor"], dogru: 1,
        aciklama: "İvmenin işareti tek başına hızlanma/yavaşlama söylemez. Hız (batı) ile ivme (doğu) zıt: yavaşlar. Sürat 10'dan 2'ye düştü.", ipucu: "Sürat büyüyor mu küçülüyor mu? Hız oku ile ivme oku aynı yöne mi bakıyor?" },
      { s: "<b>N</b>: −2, −6, −10. Batıya giderken sürati büyüyor. Δv = −4, a = −2: ivme batıya. Aynı yön → <b>hızlanır</b>. Eksi ivme ama hızlanıyor!", yap: (api) => api.sur("N") },
      { s: "<b>4.2</b> K için 0–2 s: Δv = +4; 0–4 s: Δv = 10 − 2 = +8. N için −4 ve −8. Süre 2 katına çıkınca Δv'nin <b>büyüklüğü</b> 2 katına çıktı." },
      { formul: [["Δv", "hız değişimi"], ["="], ["a", "ivme"], ["·"], ["Δt", "süre"]], s: "Sabit ivmede Δv süreyle <b>doğru orantılıdır</b>; Δv'nin <b>yönü</b> ivmenin yönüdür (K'de doğu, N'de batı).", oku: "Delta v eşittir a çarpı delta t." },
      { s: "Tam puan için iki cümle: “Hız değişiminin büyüklüğü geçen süreyle doğru orantılıdır.” ve “Hız değişiminin yönü ivmenin yönüyle aynıdır.”" },
      { s: "Şimdi sen: P ve Q denemeleri için ivme ve hareket türünü bul." },
    ],
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "5. Soru: Düşüş kulesi, aşağı giderken yavaşlamak",
    cikti: "FİZ.10.1.2",
    anlatim: `
      <p><b>Senaryo:</b> Lunapark düşüş kulesinin kabini P bölgesine 2 m/s ile giriyor; aşağı yönde sabit ivmeyle hızlanıyor (1 s aralıkla hızlar: 2, 5, 8, 11 m/s). R bölgesinde fren devreye giriyor, sabit ivmeyle yavaşlıyor (11, 7, 3 m/s). Bir ziyaretçi: “Kabin aşağı gittiğine göre ivmesi de aşağı olmalı.”</p>
      <p><b>Sorular:</b> (5.1) Ardışık Δv'ler, her bölgenin ivmesi (büyüklük + yön), Δv ile ivme ilişkisi. (5.2) R'de aşağı giderken süratin neden azaldığı.</p>
      <p><b>Cevaplar:</b> P: Δv = +3 her saniye, a = +3 m/s² aşağı. R: Δv = −4, a = −4 m/s² yukarı. Hız değişimi ile ivme aynı yöndedir. R'de hız aşağı, ivme yukarı; zıt yönlü olduğundan sürat azalır. Ziyaretçi yanılıyor.</p>${KAYNAK}`,
    gorev: "Benzerini çöz: iki bölgenin ivmesi (işaretli) ve neden sorusu.",
    ogretmen: "Puanlama: 5.1 (8) 5.2 (4). Düşey hareket ama mantık yatayla aynı; 'aşağı +' seçildiğini baştan belirtin. Ziyaretçinin yanılgısı sınıfın yarısının yanılgısıdır: hareket yönü ile ivme yönünü ayırın.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla(); S.A.grup.visible = false;
      const kule = kuleYap(S, { x: -30, z: -16, yukseklik: 44 });
      kule.bolge("P", 40, 24, 0x5ad38b); kule.bolge("R", 24, 12, 0xff5a5a);
      // kamera kuleye bakar; adım bitince yol görünümüne geri döner
      S.kameraKoy({ konum: [kule.x - 14, 30, 70], hedef: [kule.x, 24, kule.z] });
      S.kameraya(kule.x);
      ctx.temizlik(() => { kule.kaldir(); S.kameraKoy({ konum: [kule.x - 18, 15, 30], hedef: [kule.x, 0, 0] }); });
      let k = null;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "v", etiket: "Hız (aşağı +)", birim: "m/s" }, { ad: "a", etiket: "İvme (aşağı +)", birim: "m/s²" }, { ad: "bolge", etiket: "Bölge", birim: "" }]);
      const [gvt] = ctx.grafikler([vtGrafigi(5, { min: 0, max: 14, otomatik: false })]);
      const sv = gvt.seri("v", { renk: RENK_V, kalinlik: 3, nokta: true });
      function sur({ v0, aP, tP, aR, tR }) {
        k?.durdur(); sv.temizle(); kule.izleriTemizle(); gvt.not([]);
        const f = parcali(0, v0, [{ sure: tP, a: aP }, { sure: tR, a: aR }]), T = tP + tR;
        const yUst = 40, olcek = (yUst - 13) / f(T).x;
        gvt.eksenAyarla({ x: { max: T } });
        kule.yukseklik(yUst); kule.oklar();
        k = kosu(S, { sure: T,
          kare: (t) => { const d = f(t); kule.yukseklik(yUst - d.x * olcek); kule.oklar({ v: d.v, a: d.a }); h.ayarla("t", t); h.ayarla("v", d.v); h.ayarla("a", d.a); h.ayarla("bolge", t < tP ? "P (hızlanıyor)" : "R (fren)"); },
          saniye: (n) => { const d = f(n); sv.ekle(n, d.v); kule.iz(yUst - d.x * olcek, `${n} s · ${sayi(d.v, 0)} m/s`); },
          bitti: () => kule.oklar() });
      }
      /* Alıştırma: P: 3, 7, 11 · R: 11, 5 */
      const tamam = soruTakibi(ctx, 3);
      ctx.not(`<p><b>Benzer soru.</b> Kabin P'ye <b>3 m/s</b> ile giriyor; hızlar 1 s aralıkla P'de <b>3, 7, 11</b>, R'de <b>11, 5</b> m/s. Aşağı yön +.</p>`);
      ctx.dugmeler([{ metin: "▶ Kabini izle", ana: true, tik: () => sur({ v0: 3, aP: 4, tP: 2, aR: -6, tR: 1 }) }]);
      ctx.sayiSorusu({ etiket: "P bölgesinin ivmesi kaç m/s²? (aşağı +)", birim: "m/s²", kontrol: (c) => { if (yakin(c, 4, 0.05)) { tamam(0); return true; } return "Her saniye hız kaç artıyor? Δv = 7 − 3."; } });
      ctx.sayiSorusu({ etiket: "R bölgesinin ivmesi kaç m/s²? (işaretli)", birim: "m/s²", kontrol: (c) => { if (yakin(c, -6, 0.05)) { tamam(1); return true; } if (yakin(c, 6, 0.05)) return "Hız azalıyor: Δv = 5 − 11 = −6. İvme eksi, yani yukarı."; return "a = (5 − 11) / 1"; } });
      const g = el("div", { class: "d-geri-bildirim" });
      ctx.secenekler({ etiket: "R'de kabin aşağı giderken sürati neden azalıyor?", deger: null, liste: [{ deger: 0, metin: "İvmesi aşağı ama küçük" }, { deger: 1, metin: "Hız aşağı, ivme yukarı: zıt yönlü" }, { deger: 2, metin: "Kabin durduğu için" }],
        degisti: (v) => { if (ctx.gosteriyor()) return; g.className = `d-geri-bildirim ${v === 1 ? "dogru" : "yanlis"}`; g.textContent = v === 1 ? "Doğru: hız ile ivme zıt yönlü olduğundan sürat azalır." : "Δv'nin işaretine bak: eksi. Hız değişimi yukarı yönlü; ivme de yukarı."; if (v === 1) tamam(2); } });
      ctx.kontroller.append(g);
      ctx.temizlik(() => k?.durdur());
      return { sur };
    },
    anlat: [
      { s: "Düşüş kulesi. Kabin P bölgesine <b>2 m/s</b> ile giriyor ve aşağı doğru hızlanıyor; R bölgesinde fren var. Aşağı yön <b>+</b>. İzle…", yap: (api) => api.sur({ v0: 2, aP: 3, tP: 3, aR: -4, tR: 2 }) },
      { s: "P'de her saniyenin sonundaki hız: 2, 5, 8, 11. R'de: 11, 7, 3. Hız grafiğine bak: önce yukarı, sonra aşağı.", grafik: true },
      { cozum: ["<b>P bölgesi:</b> Δv₁ = 5 − 2 = +3, Δv₂ = 8 − 5 = +3, Δv₃ = 11 − 8 = +3 m/s", "Her saniye +3 m/s: hız değişimi <b>aşağı</b> yönlü", "a_P = Δv / Δt = (11 − 2) / 3 = <b>+3 m/s²</b> (aşağı)"] },
      { cozum: ["<b>R bölgesi:</b> Δv₁ = 7 − 11 = −4, Δv₂ = 3 − 7 = −4 m/s", "Her saniye −4 m/s: hız değişimi <b>yukarı</b> yönlü", "a_R = (3 − 11) / 2 = <b>−4 m/s²</b> (yukarı)"] },
      { s: "<b>5.1 c)</b> İlişki: hız değişimi ile ivme <b>aynı yöndedir</b>. P'de ikisi de aşağı, R'de ikisi de yukarı." },
      { soru: "R bölgesinde kabin aşağı gidiyor. İvmesi hangi yönde?", secenekler: ["Aşağı, çünkü kabin aşağı gidiyor", "Yukarı, çünkü hız değişimi yukarı (Δv eksi)"], dogru: 1,
        aciklama: "İvme hareket yönünü değil, hızın <b>değişim</b> yönünü gösterir. Hız her saniye 4 m/s azalıyor: değişim yukarı, ivme yukarı.", ipucu: "Δv = 7 − 11 = −4. Eksi yön hangisi?" },
      { s: "<b>5.2</b> Cevap: “R'de kabinin hızı aşağı, hız değişimi ve dolayısıyla ivmesi yukarı yönlüdür. Hız ile ivme zıt yönlü olduğundan sürat azalır.” Ziyaretçi yanılıyor." },
      { s: "Şimdi sen: P'de 3, 7, 11; R'de 11, 5 m/s." },
    ],
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "6. Soru: Motosiklet ve otomobil, ivme–zaman ve yer değiştirme",
    cikti: "FİZ.10.1.3-a",
    anlatim: `
      <p><b>Senaryo:</b> Işık yeşile dönünce motosiklet duruştan sabit ivmeyle kalkıyor, 5 s'de 20 m/s'ye çıkıyor. Yan şeritteki otomobil 28 m/s ile geçerken yavaşlamaya başlıyor; 5 s'de 8 m/s'ye iniyor. İvmelerin büyüklükleri eşit.</p>
      <p><b>Sorular:</b> (6.1) İki ivme ve ivme–zaman grafikleri. (6.2) 0–5 s için hız yönü, ivme yönü, yer değiştirme yönü ve büyüklüğü (tablo).</p>
      <p><b>Cevaplar:</b> a<sub>moto</sub> = +4 m/s², a<sub>oto</sub> = −4 m/s² (yatay doğrular). Motosiklet: +, +, +, 50 m. Otomobil: +, −, +, 90 m.</p>${KAYNAK}`,
    gorev: "Benzerini çöz: otomobilin ivmesi ve iki aracın yer değiştirmesi.",
    ogretmen: "Puanlama: 6.1 (8) 6.2 (4, boşluk başına 0,5). Yer değiştirmeyi hız–zaman grafiğinin altındaki alandan (üçgen ve yamuk) buldurun; otomobilin ivmesi negatif ama yer değiştirmesi pozitif, bunu tabloda görsünler.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla(); S.B.grup.visible = true;
      let k = null;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "vA", etiket: "Motosiklet hızı", birim: "m/s" }, { ad: "vB", etiket: "Otomobil hızı", birim: "m/s" }]);
      const [gvt, gat] = ctx.grafikler([vtGrafigi(5, { min: 0, max: 32, otomatik: false }), atGrafigi(5, { min: -6, max: 6 })]);
      const svA = gvt.seri("moto", { renk: RENK_X, kalinlik: 3 }), svB = gvt.seri("oto", { renk: RENK_B, kalinlik: 3 });
      const saA = gat.seri("moto", { renk: RENK_X, kalinlik: 3 }), saB = gat.seri("oto", { renk: RENK_B, kalinlik: 3 });
      S.A.yerlestir(0); S.B.yerlestir(0); S.kameraya(30, { uzaklik: 60 });
      function sur({ vA2, vB1, vB2, T = 5, grafik = true }) {
        k?.durdur(); [svA, svB, saA, saB].forEach((s) => s.temizle()); gvt.golgeTemizle(); gvt.not([]); S.izleriTemizle();
        const aA = vA2 / T, aB = (vB2 - vB1) / T;
        const fA = parcali(0, 0, [{ sure: T, a: aA }]), fB = parcali(0, vB1, [{ sure: T, a: aB }]);
        S.A.yerlestir(0); S.B.yerlestir(0);
        gvt.eksenAyarla({ y: { max: Math.max(32, vB1 + 4) } });
        k = kosu(S, { sure: T,
          kare: (t) => { const a = fA(t), b = fB(t); S.A.yerlestir(a.x); S.B.yerlestir(b.x); S.A.oklar({ v: a.v, a: aA }); S.B.oklar({ v: b.v, a: aB }); S.B.stopLambasi(true); S.takip((a.x + b.x) / 2); if (grafik) { svA.ekle(t, a.v); svB.ekle(t, b.v); saA.ekle(t, aA); saB.ekle(t, aB); } h.ayarla("t", t); h.ayarla("vA", a.v); h.ayarla("vB", b.v); },
          saniye: (n) => { S.izBirak("A", fA(n).x, `${n} s`); S.izBirak("B", fB(n).x); },
          bitti: () => { S.A.oklar(); S.B.oklar(); S.B.stopLambasi(false); if (grafik) gvt.not([{ x: T, y: vA2, metin: `${sayi(fA(T).x, 0)} m`, renk: RENK_X, hiza: "right", dx: -4, dy: 10 }, { x: T, y: vB2, metin: `${sayi(fB(T).x, 0)} m`, renk: RENK_B, hiza: "right", dx: -4, dy: -10 }]); } });
      }
      function alan(hangi) { const T = 5; if (hangi === "A") gvt.golge(svA, 0, T, "rgba(255,138,61,.3)"); else gvt.golge(svB, 0, T, "rgba(61,155,255,.3)"); }
      /* Alıştırma: moto 0→24 (6 s), oto 30→6 (6 s) */
      const tamam = soruTakibi(ctx, 3);
      ctx.not(`<p><b>Benzer soru.</b> Motosiklet duruştan <b>6 s</b>'de <b>24 m/s</b>'ye çıkıyor; otomobil <b>30 m/s</b>'den aynı 6 s'de <b>6 m/s</b>'ye iniyor.</p>`);
      ctx.dugmeler([{ metin: "▶ Araçları izle", ana: true, tik: () => sur({ vA2: 24, vB1: 30, vB2: 6, T: 6, grafik: false }) }]);
      ctx.sayiSorusu({ etiket: "<b>a)</b> Otomobilin ivmesi kaç m/s²? (işaretli)", birim: "m/s²", kontrol: (c) => { if (yakin(c, -4, 0.05)) { tamam(0); return true; } if (yakin(c, 4, 0.05)) return "Hız azalıyor: Δv = 6 − 30 = −24. İvme eksi."; return "a = Δv / Δt = (6 − 30) / 6"; } });
      ctx.sayiSorusu({ etiket: "<b>b)</b> Motosikletin 0–6 s'deki yer değiştirmesi kaç m?", birim: "m", kontrol: (c) => { if (yakin(c, 72, 0.6)) { tamam(1); return true; } if (yakin(c, 144, 0.6)) return "Üçgen alanı: ½ · taban · yükseklik. Yarımı unuttun."; return "Hız–zaman grafiği üçgen: ½ · 6 · 24."; } });
      ctx.sayiSorusu({ etiket: "<b>c)</b> Otomobilin 0–6 s'deki yer değiştirmesi kaç m?", birim: "m", kontrol: (c) => { if (yakin(c, 108, 0.6)) { tamam(2); return true; } if (yakin(c, 36, 0.6)) return "Sadece alttaki dikdörtgeni aldın; üstteki üçgeni ekle (ya da yamuk formülü)."; return "Yamuk: (30 + 6) / 2 · 6."; } });
      ctx.temizlik(() => k?.durdur());
      return { sur, alan };
    },
    anlat: [
      { s: "Işık yeşil. Turuncu araç <b>motosiklet</b> rolünde: duruştan kalkıyor, 5 s'de 20 m/s. Mavi <b>otomobil</b> 28 m/s ile geçerken fren yapıyor, 5 s'de 8 m/s. İzle…", yap: (api) => api.sur({ vA2: 20, vB1: 28, vB2: 8 }) },
      { s: "Hız grafiğinde motosikletin çizgisi yukarı, otomobilinki aşağı. İvme grafiğinde iki <b>yatay</b> doğru: biri +4, biri −4.", grafik: true },
      { cozum: ["<b>6.1</b> Motosiklet: a = Δv/Δt = (20 − 0) / 5 = <b>+4 m/s²</b>", "Otomobil: a = (8 − 28) / 5 = −20 / 5 = <b>−4 m/s²</b>", "İvme–zaman: t eksenine paralel iki doğru, +4 ve −4 düzeyinde"] },
      { s: "<b>6.2</b> Yer değiştirme = hız–zaman grafiğinin altındaki alan. Motosiklet: <b>üçgen</b>.", yap: (api) => api.alan("A") },
      { formul: [["Δx", "yer değiştirme"], ["="], ["½ · t · v", "üçgenin alanı"]], s: "Δx<sub>moto</sub> = ½ · 5 · 20 = <b>50 m</b>.", oku: "Delta x eşittir yarım çarpı t çarpı v. Yarım çarpı 5 çarpı 20, 50 metre." },
      { s: "Otomobil: <b>yamuk</b> (28'den 8'e iniyor).", yap: (api) => api.alan("B") },
      { formul: [["Δx", "yer değiştirme"], ["="], ["(v₁ + v₂) / 2", "ortalama hız"], ["·"], ["t", "süre"]], s: "Δx<sub>oto</sub> = (28 + 8) / 2 · 5 = 18 · 5 = <b>90 m</b>.", oku: "Delta x eşittir v bir artı v iki bölü iki çarpı t. 18 çarpı 5, 90 metre." },
      { soru: "Otomobilin ivmesi eksi. Yer değiştirmesinin yönü nedir?", secenekler: ["Negatif, çünkü ivme negatif", "Pozitif, çünkü hız hep pozitif (ileri gidiyor)"], dogru: 1,
        aciklama: "Yer değiştirmenin yönünü <b>hız</b> belirler. Otomobil hiç geri gitmedi, sadece yavaşladı: Δx = +90 m.", ipucu: "Hız grafiği eksenin üstünde mi altında mı?" },
      { s: "Tablo: Motosiklet: hız +, ivme +, yer değiştirme +, 50 m. Otomobil: hız +, ivme <b>−</b>, yer değiştirme +, 90 m." },
      { s: "Şimdi sen: 6 saniyelik sürüm; 0→24 ve 30→6." },
    ],
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "7. Soru: Devrilen ağaç, tepki süresi ve en az ivme",
    cikti: "FİZ.10.1.3-c",
    anlatim: `
      <p><b>Senaryo:</b> Sabit v ile giden sürücü yola devrilen ağacı görüyor; <b>1 s</b> sonra frene basıyor, araç 5 m/s² ile yavaşlıyor. Ağacı gördükten <b>5 s</b> sonra araç ağaca <b>20 m/s</b> ile çarpıyor.</p>
      <p><b>Sorular:</b> (7.1) v'yi bul, hız–zaman grafiğini çiz. (7.2) Görmeden çarpmaya kadar yer değiştirme. (7.3) Gördüğü an frene bassaydı çarpmamak için en az ivme.</p>
      <p><b>Cevaplar:</b> v = 40 m/s (0–1 s yatay, 1–5 s 40'tan 20'ye inen doğru) · 40·1 + (40+20)/2·4 = 160 m · tam ağaçta durmalı: ½·t·40 = 160 → t = 8 s, a = 40/8 = <b>5 m/s²</b>.</p>${KAYNAK}`,
    gorev: "Benzerini çöz: ilk hız, yer değiştirme ve en az ivme.",
    ogretmen: "Puanlama: 7.1 (10) 7.2 (6) 7.3 (6). 7.3'te öğrenciler 'durmak için 160 m' fikrine zor geliyor: 'çarpmamak = tam ağaçta hız sıfır' cümlesini kurun, üçgen alanından süreyi bulun. (Alternatif: v² = 2·a·x; programda grafik yolu bekleniyor.)",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      let agac = devrikAgac(S, 160);
      ctx.temizlik(() => agac.kaldir());
      let k = null;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "x", etiket: "Konum", birim: "m" }, { ad: "v", etiket: "Hız", birim: "m/s" }, { ad: "kalan", etiket: "Ağaca kalan", birim: "m" }]);
      const [gvt] = ctx.grafikler([vtGrafigi(9, { min: 0, max: 45, otomatik: false })]);
      const sv = gvt.seri("v", { renk: RENK_V, kalinlik: 3 }), sv2 = gvt.seri("v2", { renk: RENK_SARI, kalinlik: 2, kesikli: true });
      S.A.yerlestir(0); S.kameraya(40, { uzaklik: 70 });
      function sur({ v0, tepki, a, sure, agacX }) {
        k?.durdur(); sv.temizle(); sv2.temizle(); gvt.golgeTemizle(); gvt.not([]); S.izleriTemizle();
        agac.kaldir(); agac = devrikAgac(S, agacX);
        const f = parcali(0, v0, [{ sure: tepki, a: 0 }, { sure: sure - tepki, a: -a }]);
        gvt.eksenAyarla({ x: { max: Math.max(9, sure + 1) }, y: { max: Math.max(45, v0 + 5) } });
        S.A.yerlestir(0);
        k = kosu(S, { sure,
          kare: (t) => { const d = f(t); S.A.yerlestir(Math.min(d.x, agacX - 2.3)); S.A.oklar({ v: d.v, a: d.a }); S.A.stopLambasi(t >= tepki); S.takip(d.x); sv.ekle(t, d.v); h.ayarla("t", t); h.ayarla("x", d.x); h.ayarla("v", d.v); h.ayarla("kalan", Math.max(0, agacX - d.x)); },
          saniye: (n) => S.izBirak("A", f(n).x, `${n} s`),
          bitti: () => { S.A.oklar(); gvt.not([{ x: sure, y: f(sure).v, metin: `çarpma: ${sayi(f(sure).v, 0)} m/s`, renk: "#ff6b6b", hiza: "right", dx: -4 }]); } });
      }
      function alan(sure) { gvt.golge(sv, 0, sure, "rgba(255,181,71,.3)"); }
      function enAz({ v0, dx }) { const t = (2 * dx) / v0; sv2.ayarla([[0, v0], [t, 0]]); gvt.eksenAyarla({ x: { max: t + 1 } }); gvt.golgeTemizle(); gvt.not([{ x: t, y: 2, metin: `t = ${sayi(t)} s, alan = ${sayi(dx, 0)} m`, renk: RENK_SARI, hiza: "right", dx: -4, dy: -10 }]); }
      /* Alıştırma: tepki 1 s, a = 4, 5 s sonra 8 m/s ile çarpıyor → v0 = 24, Δx = 88, a_min = 3,27 */
      const V = frenSenaryosu({ tepki: 1, a: 4, toplamSure: 5, carpmaHizi: 8 });
      const tamam = soruTakibi(ctx, 3);
      ctx.not(`<p><b>Benzer soru.</b> Sürücü ağacı görüyor, <b>1 s</b> sonra frene basıyor; araç <b>4 m/s²</b> ile yavaşlıyor. Gördükten <b>5 s</b> sonra ağaca <b>8 m/s</b> ile çarpıyor.</p>`);
      ctx.dugmeler([{ metin: "▶ Aracı izle", ana: true, tik: () => sur({ v0: V.v0, tepki: 1, a: 4, sure: 5, agacX: V.dx }) }]);
      ctx.sayiSorusu({ etiket: "<b>a)</b> Aracın ilk hızı v kaç m/s?", birim: "m/s", kontrol: (c) => { if (yakin(c, V.v0, 0.3)) { tamam(0); return true; } if (yakin(c, 28, 0.3)) return "Fren süresi 5 s değil, 5 − 1 = 4 s."; return "Fren 4 s sürdü, her saniye 4 m/s azaldı: toplam azalma 16. Çarpma hızına ekle."; } });
      ctx.sayiSorusu({ etiket: "<b>b)</b> Görmeden çarpmaya kadar yer değiştirme kaç m?", birim: "m", kontrol: (c) => { if (yakin(c, V.dx, 0.6)) { tamam(1); return true; } if (yakin(c, V.dx - V.v0, 0.6)) return "Tepki süresindeki 1 saniyelik dikdörtgeni (24 · 1) unuttun."; return "Dikdörtgen (24 · 1) + yamuk ((24 + 8)/2 · 4)."; } });
      ctx.sayiSorusu({ etiket: "<b>c)</b> Gördüğü an frene bassaydı çarpmamak için en az ivme kaç m/s²? (1 ondalık)", birim: "m/s²", kontrol: (c) => { if (yakin(c, V.aMin, 0.06)) { tamam(2); enAz({ v0: V.v0, dx: V.dx }); return true; } if (yakin(c, 4, 0.06)) return "Daha küçük bir ivme yeter: aracın tam ağaçta (88 m'de) durması gerekir. ½ · t · 24 = 88 → t = ?"; return "Üçgen alanı = 88 m: ½ · t · 24 = 88, t'yi bul; a = 24 / t."; } });
      ctx.temizlik(() => k?.durdur());
      return { sur, alan, enAz, sifirla() { k?.durdur(); sv.temizle(); sv2.temizle(); gvt.golgeTemizle(); gvt.not([]); gvt.eksenAyarla({ x: { max: 9 }, y: { max: 45 } }); S.izleriTemizle(); S.A.yerlestir(0); S.A.oklar(); S.A.stopLambasi(false); agac.kaldir(); agac = devrikAgac(S, V.dx); S.kameraya(40, { uzaklik: 70 }); } };
    },
    anlatBitti: (api) => api.sifirla(),
    anlat: [
      { s: "Sürücü ağacı görüyor ama frene basması <b>1 saniye</b> sürüyor (tepki süresi). Sonra 5 m/s² ile fren. 5. saniyede ağaca <b>20 m/s</b> ile çarpıyor. İzle…", yap: (api) => api.sur({ v0: 40, tepki: 1, a: 5, sure: 5, agacX: 160 }) },
      { s: "Hız grafiği: 0–1 s <b>yatay</b> (fren yok), 1–5 s <b>aşağı inen doğru</b>. Sondaki değer 20 m/s. Peki baştaki değer?", grafik: true },
      { cozum: ["<b>7.1</b> Fren süresi = 5 − 1 = 4 s", "Her saniye 5 m/s azalma: Δv = 5 · 4 = 20 m/s", "v = 20 + 20 = <b>40 m/s</b>", "Grafik: (0, 40)–(1, 40) yatay; (1, 40)–(5, 20) eğik"] },
      { soru: "Fren 5 s değil 4 s sürüyor. Neden?", secenekler: ["Araç 1 s durdu", "İlk 1 saniye tepki süresi: fren yok, hız sabit", "Çarpışma 1 s sürdü"], dogru: 1,
        aciklama: "Sürücü gördüğü anda frene basamaz; 1 s boyunca araç 40 m/s ile gitmeye devam eder. Fren 1. saniyede başlar.", ipucu: "Grafikte 0–1 s neden yatay?" },
      { s: "<b>7.2</b> Yer değiştirme = grafiğin altındaki alan: dikdörtgen + yamuk.", yap: (api) => api.alan(5) },
      { cozum: ["Dikdörtgen (0–1 s): 40 · 1 = 40 m", "Yamuk (1–5 s): (40 + 20) / 2 · 4 = 30 · 4 = 120 m", "Δx = 40 + 120 = <b>160 m</b>"] },
      { s: "<b>7.3</b> Gördüğü an frene bassaydı… <b>Çarpmamak = tam ağaçta hızın sıfır olması.</b> Yani 160 m'de durmalı. En az ivme için en uzun sürede durmalı.", yap: (api) => api.enAz({ v0: 40, dx: 160 }) },
      { formul: [["Alan", "= 160 m"], ["="], ["½", ""], ["·"], ["t", "durma süresi"], ["·"], ["40", "ilk hız"]], s: "Üçgen alanı 160 m olmalı: ½ · t · 40 = 160 → t = 8 s.", oku: "Yarım çarpı t çarpı 40 eşittir 160. t eşittir 8 saniye." },
      { cozum: ["a = Δv / Δt = 40 / 8 = <b>5 m/s²</b>", "Daha küçük ivmeyle 160 m'de duramaz, çarpar; daha büyükle önce durur."] },
      { s: "Şimdi sen: tepki 1 s, fren 4 m/s², 5 s sonra 8 m/s ile çarpma." },
    ],
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Değerlendirme: yazılı provası",
    anlatim: `
      <p>Sekiz soru, yedi senaryonun yeni sayılarla kısa cevaplı hâlleri. Yazılıda bunları açık uçlu çözeceksin; burada sonucu kontrol ediyoruz.</p>
      <p>En az <b>6 doğru</b> ile dersi tamamlarsın.</p>`,
    gorev: "Provada en az <b>6/8</b> doğru yap.",
    ogretmen: "Puanlama tablosundaki ağırlığa göre: 7. soru (22 puan) ve 6. soru (12 puan) en değerli; provada iki soru bunlardan.",
    anlat: [
      { s: "Sekiz soruluk yazılı provası. Senaryoların yeni sayılı hâlleri." },
      { s: "Hesap kâğıdı kullan; formülü yazıp sayıları yerine koy. En az <b>6 doğru</b> ile dersi bitirirsin." },
    ],
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(0, { uzaklik: 40 });
      const cizgiGrafik = (ayar, seriler) => (kap) => { const g = new Grafik(kap, ayar); for (const s of seriler) g.seri(s.ad, { renk: s.renk, kalinlik: 3 }).ayarla(s.n); };
      ctx.sinav([
        { tur: "sayi", metin: "Ağaçlar eşit aralıklı. Sabit hızlı araç t = 0'da 1. ağaç, t = 2 s'de 5. ağaç hizasında. <b>t = 6 s</b>'de kaçıncı ağaç hizasındadır?", dogru: 13, tolerans: 0.1, birim: ". ağaç",
          aciklama: "2 s'de 4 aralık: saniyede 2 aralık. 6 s'de 12 aralık; 1 + 12 = 13. ağaç." },
        { tur: "sayi", metin: "Aynı yönde uçan iki dron: arkadaki 25 m/s, öndeki 10 m/s, aralarında 90 m. Arkadaki kaç saniye sonra yetişir?", dogru: 6, tolerans: 0.1, birim: "s",
          aciklama: "Yaklaşma hızı 25 − 10 = 15 m/s. t = 90 / 15 = 6 s. (25t = 90 + 10t)" },
        { tur: "coktan", metin: "+x yönünde 30 m/s ile giden aracın ivmesi 4 s boyunca 2 m/s² büyüklüğünde ve <b>−x</b> yönlü. 4 s sonunda hızı ve hareket türü?",
          siklar: ["38 m/s, hızlanan", "22 m/s, yavaşlayan", "22 m/s, hızlanan", "−8 m/s, geri giden"], dogru: 1,
          aciklama: "v = 30 + (−2)·4 = 22 m/s. Hız +x, ivme −x: zıt yönlü, yavaşlayan hareket." },
        { tur: "coktan", metin: "Tramvayın hızı 0, 2, 4. saniyelerde −12, −8, −4 m/s (doğu +). Hangisi doğrudur?",
          siklar: ["Batıya gidiyor, ivme batıya, hızlanıyor", "Batıya gidiyor, ivme doğuya (+2 m/s²), yavaşlıyor", "Doğuya gidiyor, yavaşlıyor", "İvmesi −2 m/s², hızlanıyor"], dogru: 1,
          aciklama: "Hız eksi: batıya. Δv = −8 − (−12) = +4, a = +2 m/s²: doğuya. Zıt yönlü: yavaşlıyor (sürat 12'den 4'e)." },
        { tur: "sayi", metin: "Düşüş kulesinde kabinin hızı (aşağı +) 1 s aralıkla 12, 9, 6, 3 m/s ölçülüyor. Bu bölgedeki ivme kaç m/s²'dir? (işaretli)", dogru: -3, tolerans: 0.05, birim: "m/s²",
          aciklama: "Her saniye Δv = −3 m/s; a = (3 − 12)/3 = −3 m/s². Eksi: yukarı yönlü. Kabin aşağı giderken yavaşlıyor." },
        { tur: "sayi", metin: "Hız–zaman grafiği verilen otomobilin 0–6 s'deki yer değiştirmesi kaç m?",
          grafik: cizgiGrafik(vtGrafigi(6, { min: 0, max: 35, otomatik: false }), [{ ad: "v", renk: RENK_B, n: [[0, 30], [6, 12]] }]),
          dogru: 126, tolerans: 1, birim: "m", aciklama: "Yamuk: (30 + 12)/2 · 6 = 21 · 6 = 126 m." },
        { tur: "sayi", metin: "Sürücü engeli görüyor, 1 s sonra frene basıyor (6 m/s²). Gördükten 4 s sonra engele 12 m/s ile çarpıyor. Aracın <b>ilk hızı</b> kaç m/s?", dogru: 30, tolerans: 0.3, birim: "m/s",
          aciklama: "Fren 3 s sürdü: Δv = 6·3 = 18 m/s. v = 12 + 18 = 30 m/s." },
        { tur: "sayi", metin: "Aynı araç (30 m/s) gördüğü an frene bassa ve engel 90 m ilerideyse, çarpmamak için en az ivme kaç m/s²?", dogru: 5, tolerans: 0.1, birim: "m/s²",
          aciklama: "Tam engelde durmalı: ½ · t · 30 = 90 → t = 6 s. a = 30/6 = 5 m/s²." },
      ], { baslik: "Yazılı provası", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: yolSahnesi });
