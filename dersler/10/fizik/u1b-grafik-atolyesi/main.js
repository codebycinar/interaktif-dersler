// 10. Sınıf Fizik · 1. Ünite: Kuvvet ve Hareket · Grafik Atölyesi
// Konum–zaman, hız–zaman ve ivme–zaman grafiklerini okuma, çizme ve birbirine dönüştürme.
// Her adım: önce animasyonlu anlatım, sonra yazılı tipinde uygulamalı görev.
import { dersBaslat, sayi, el, Grafik } from "../../../../engine/ders.js";
import { yolSahnesi, kosu } from "../u1-hareket/sahne.js";
import {
  parcali, sabitHizli, sinirlar, hareketTuru, xtSekli, atSeviye, vtAlan, ornekle, degiskenIvme,
  taslardanParcalar, tepeYaparMi,
} from "../ortak/kinematik.js";

const RENK_X = "#ff8a3d", RENK_V = "#5ad38b", RENK_A = "#ff9f43", RENK_SOLUK = "rgba(169,182,201,.55)", RENK_SARI = "#ffd28a";
const sec = (dizi) => dizi[Math.floor(Math.random() * dizi.length)];
const karistir = (dizi) => dizi.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

const xtGrafigi = (tMax, y = { min: -20, max: 100 }) =>
  ({ baslik: "Konum – zaman", x: { etiket: "t (s)", min: 0, max: tMax }, y: { etiket: "x (m)", otomatik: true, ...y } });
const vtGrafigi = (tMax, y = { min: -10, max: 20 }) =>
  ({ baslik: "Hız – zaman", x: { etiket: "t (s)", min: 0, max: tMax }, y: { etiket: "v (m/s)", otomatik: true, ...y } });
const atGrafigi = (tMax, y = { min: -4, max: 4 }) =>
  ({ baslik: "İvme – zaman", x: { etiket: "t (s)", min: 0, max: tMax }, y: { etiket: "a (m/s²)", ...y } });

function hud(ctx, liste) {
  const kap = el("div", { class: "d-etiket-hud" });
  ctx.katman.append(kap);
  return ctx.gostergeler(liste, kap);
}

/** Aracı f(t) modeline göre T saniye sürer; her karede seriler ve HUD güncellenir, her saniye iz bırakır. */
function oynat(S, { f, T, hud: h, sx, sv, sa, aGoster = true, bitti }) {
  S.izleriTemizle();
  sx?.temizle(); sv?.temizle(); sa?.temizle();
  return kosu(S, {
    sure: T,
    kare: (t) => {
      const d = f(t);
      S.A.yerlestir(d.x); S.A.oklar({ v: d.v, a: aGoster ? d.a : null }); S.takip(d.x);
      S.A.stopLambasi(hareketTuru(d.v, d.a) === "yavasliyor");
      sx?.ekle(t, d.x); sv?.ekle(t, d.v); sa?.ekle(t, d.a);
      h?.ayarla("t", t); h?.ayarla("x", d.x); h?.ayarla("v", d.v); h?.ayarla("a", d.a);
    },
    saniye: (n) => S.izBirak("A", f(n).x, `${n} s`),
    bitti: () => { S.A.oklar(); S.A.stopLambasi(false); bitti?.(); },
  });
}

/* Şekil paleti ikonları (40×30) */
const XT_SEKIL = {
  "yatay": { yol: "M4,15 L36,15", ad: "yatay" },
  "artan-dogru": { yol: "M4,26 L36,4", ad: "düz artan" },
  "azalan-dogru": { yol: "M4,4 L36,26", ad: "düz azalan" },
  "artan-yukari": { yol: "M4,26 Q34,26 36,4", ad: "artan, dikleşen" },
  "artan-asagi": { yol: "M4,26 Q6,4 36,4", ad: "artan, yatıklaşan" },
  "azalan-asagi": { yol: "M4,4 Q34,4 36,26", ad: "azalan, dikleşen" },
  "azalan-yukari": { yol: "M4,4 Q6,26 36,26", ad: "azalan, yatıklaşan" },
};
const AT_SEVIYE = {
  pozitif: { yol: "M4,8 L36,8 M4,22 L36,22", ad: "pozitif", cizgi: "M4,8 L36,8" },
  sifir: { yol: "M4,15 L36,15", ad: "sıfır", cizgi: "M4,15 L36,15" },
  negatif: { yol: "M4,22 L36,22", ad: "negatif", cizgi: "M4,22 L36,22" },
};
function sekilDugmesi(yol, ad, sinif = "") {
  return el("button", { class: `fzg-sekil ${sinif}`, "aria-pressed": "false", html: `<svg viewBox="0 0 40 30"><path d="${yol}"/></svg><span>${ad}</span>` });
}

/* Öğrencinin seçtiği konum–zaman şeklini (4 s'lik parça) niteliksel eğriye çevirir */
const SEKIL_FN = {
  "yatay": (s) => 0, "artan-dogru": (s) => 6 * s, "azalan-dogru": (s) => -6 * s,
  "artan-yukari": (s) => 1.5 * s * s, "artan-asagi": (s) => 6 * s - 0.75 * s * s,
  "azalan-asagi": (s) => -1.5 * s * s, "azalan-yukari": (s) => -6 * s + 0.75 * s * s,
};

/* Sembol sözlüğü: eşleştirme görevi için */
const SEMBOLLER = [
  { s: "x", ad: "konum", anlam: "Aracın 0 noktasına göre nerede olduğu (m)" },
  { s: "Δ", ad: "delta", anlam: "“Değişim”: son değer − ilk değer" },
  { s: "Δx", ad: "yer değiştirme", anlam: "Son konum − ilk konum (m)" },
  { s: "Δt", ad: "geçen süre", anlam: "Son an − ilk an (s)" },
  { s: "v", ad: "hız", anlam: "Bir saniyede alınan yol, yönüyle (m/s)" },
  { s: "Δv", ad: "hız değişimi", anlam: "Son hız − ilk hız (m/s)" },
  { s: "a", ad: "ivme", anlam: "Bir saniyedeki hız değişimi (m/s²)" },
];

/* ======================================================================== */
const adimlar = [
  /* 0 ------------------------------------------------------------------ */
  {
    baslik: "Önce semboller: x, Δ, v, a ne demek?",
    cikti: "FİZ.10.1.1-a",
    anlatim: `
      <p>Formüllerdeki her harf bir şeyin kısaltmasıdır:</p>
      <ul>
        <li><b>x</b> konum (m) · <b>t</b> zaman (s) · <b>v</b> hız (m/s) · <b>a</b> ivme (m/s²)</li>
        <li><b>Δ</b> (delta) “değişim” demektir: <b>Δx</b> = x<sub>son</sub> − x<sub>ilk</sub>, <b>Δt</b> = t<sub>son</sub> − t<sub>ilk</sub>, <b>Δv</b> = v<sub>son</sub> − v<sub>ilk</sub></li>
      </ul>
      <p>İki temel formül: <span class="formul">v = Δx / Δt</span> ve <span class="formul">a = Δv / Δt</span>. Birimler de formülden çıkar: m ÷ s = m/s, (m/s) ÷ s = m/s².</p>`,
    gorev: "Yedi sembolü anlamıyla <b>eşleştir</b>.",
    ogretmen: "Öğrencilerin çoğu Δ'yı ayrı bir büyüklük sanıyor. 'Δ bir sayı değil, bir işlem: sondan ilki çıkar' cümlesini tahtaya yazın. Birim analizi (m/s², yani 'saniyede kaç m/s') ivmeyi somutlaştırır.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(25, { uzaklik: 44 });
      let k = null;
      const h = hud(ctx, [{ ad: "t", etiket: "t (zaman)", birim: "s" }, { ad: "x", etiket: "x (konum)", birim: "m" }, { ad: "v", etiket: "v (hız)", birim: "m/s" }, { ad: "a", etiket: "a (ivme)", birim: "m/s²" }]);
      function yerlestir(x) { k?.durdur(); S.A.yerlestir(x); S.A.oklar(); S.yerDegistirme(null); S.izleriTemizle(); S.kameraya(x + 10, { uzaklik: 44 }); h.ayarla("t", 0); h.ayarla("x", x); h.ayarla("v", 0); h.ayarla("a", 0); }
      function sur({ x0, v0, a, T }) {
        k?.durdur();
        const f = parcali(x0, v0, [{ sure: T, a }]);
        S.A.yerlestir(x0); S.kameraya(x0 + 15, { uzaklik: 46 });
        k = oynat(S, { f, T, hud: h, aGoster: a !== 0, bitti: () => S.yerDegistirme(x0, f(T).x) });
      }

      /* Eşleştirme görevi: sembole tıkla, sonra anlamına tıkla */
      const kap = el("div", { class: "fzg-eslestir" });
      ctx.kontroller.append(el("div", { class: "d-anlatim" }, el("p", { html: "Önce bir <b>sembole</b>, sonra <b>anlamına</b> tıkla." })), kap);
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(geri);
      let secili = null, eslesen = 0;
      function eslesmeKur() {
        kap.replaceChildren(); secili = null; eslesen = 0; geri.textContent = "";
        const sol = el("div", { class: "fzg-sutun" }), sag = el("div", { class: "fzg-sutun" });
        karistir(SEMBOLLER).forEach((m) => sol.append(el("button", { class: "d-btn fzg-sembol", "data-s": m.s, html: `<b>${m.s}</b><small>${m.ad}</small>`, onclick: (e) => { if (e.currentTarget.disabled) return; sol.querySelectorAll("button").forEach((b) => b.classList.remove("secili")); e.currentTarget.classList.add("secili"); secili = m.s; } })));
        karistir(SEMBOLLER).forEach((m) => sag.append(el("button", { class: "d-btn fzg-anlam", "data-s": m.s, html: m.anlam, onclick: (e) => {
          if (ctx.gosteriyor() || !secili || e.currentTarget.disabled) return;
          const solBtn = sol.querySelector(`[data-s="${secili}"]`);
          if (m.s === secili) {
            e.currentTarget.disabled = solBtn.disabled = true;
            e.currentTarget.classList.add("dogru"); solBtn.classList.add("dogru"); solBtn.classList.remove("secili");
            secili = null; eslesen++;
            geri.className = "d-geri-bildirim dogru"; geri.textContent = `${eslesen}/7 eşleşti.`;
            if (eslesen === SEMBOLLER.length) { geri.textContent = "Hepsi doğru. Artık formülleri okuyabilirsin."; ctx.gorevTamam(); }
          } else {
            geri.className = "d-geri-bildirim yanlis";
            geri.textContent = `${secili} bu değil. İpucu: Δ'lı semboller hep “son − ilk” anlatır; birimine bak.`;
          }
        } })));
        kap.append(sol, sag);
      }
      eslesmeKur();
      ctx.temizlik(() => k?.durdur());
      return { yerlestir, sur, eslesmeKur };
    },
    anlat: [
      { s: "Formüller harflerden oluşur. Her harf bir şeyin <b>kısaltmasıdır</b>. Tek tek bakalım.", yap: (api) => api.yerlestir(20) },
      { s: "<b>x</b>: <b>konum</b>. Aracın 0 işaretine göre nerede olduğu. Şu an x = 20 m. Birimi metre." },
      { s: "<b>t</b>: <b>zaman</b>. Kronometrede okunan an. Birimi saniye." },
      { s: "<b>Δ</b> (delta) bir sayı değil, bir <b>işlemdir</b>: “sondan ilki çıkar”. Değişim demek." },
      { s: "Araç 20 m'den 60 m'ye gitsin. İzle…", yap: (api) => api.sur({ x0: 20, v0: 10, a: 0, T: 4 }) },
      { formul: [["Δx", "yer değiştirme"], ["="], ["x<sub>son</sub>", "son konum"], ["−"], ["x<sub>ilk</sub>", "ilk konum"]],
        s: "Mavi ok Δx'tir: 60 − 20 = 40 m.", oku: "Delta x eşittir son konum eksi ilk konum. 60 eksi 20, 40 metre." },
      { formul: [["Δt", "geçen süre"], ["="], ["t<sub>son</sub>", "son an"], ["−"], ["t<sub>ilk</sub>", "ilk an"]],
        s: "Bu yolculuk 0. saniyede başladı, 4. saniyede bitti: Δt = 4 − 0 = 4 s.", oku: "Delta t eşittir son an eksi ilk an. 4 saniye." },
      { formul: [["v", "hız"], ["="], ["Δx", "yer değiştirme"], ["/"], ["Δt", "geçen süre"]],
        s: "<b>v</b>: hız. Bir saniyede alınan yol. 40 m ÷ 4 s = 10 m/s. Birimi de formülden çıkar: metre bölü saniye.", oku: "v eşittir delta x bölü delta t. 40 bölü 4, saniyede 10 metre." },
      { soru: "Araç 3 saniyede 15 m'den 45 m'ye gitti. Hızı kaç m/s?", secenekler: ["15 m/s", "10 m/s", "45 m/s"], dogru: 1,
        aciklama: "Δx = 45 − 15 = 30 m, Δt = 3 s, v = 30 ÷ 3 = 10 m/s.", ipucu: "Önce Δx'i bul: son − ilk. Sonra süreye böl." },
      { s: "Şimdi araç hızlansın: hızı 2 m/s'den 10 m/s'ye çıksın. İzle…", yap: (api) => api.sur({ x0: 0, v0: 2, a: 2, T: 4 }) },
      { formul: [["Δv", "hız değişimi"], ["="], ["v<sub>son</sub>", "son hız"], ["−"], ["v<sub>ilk</sub>", "ilk hız"]],
        s: "Δv = 10 − 2 = 8 m/s. Hız 8 m/s arttı.", oku: "Delta v eşittir son hız eksi ilk hız. 10 eksi 2, saniyede 8 metre." },
      { formul: [["a", "ivme"], ["="], ["Δv", "hız değişimi"], ["/"], ["Δt", "geçen süre"]],
        s: "<b>a</b>: ivme. Bir saniyede hızın ne kadar değiştiği. 8 ÷ 4 = 2 m/s². Yani <b>her saniye hız 2 m/s artıyor</b>.", oku: "a eşittir delta v bölü delta t. 8 bölü 4, 2 metre bölü saniye kare." },
      { s: "Birimi m/s² garip görünür. Böyle oku: “saniyede, saniyede 2 metre”: her saniye, hız 2 m/s değişiyor." },
      { soru: "Hızı 6 saniyede 30 m/s'den 12 m/s'ye düşen aracın ivmesi?", secenekler: ["+3 m/s²", "−3 m/s²", "−18 m/s²"], dogru: 1,
        aciklama: "Δv = 12 − 30 = −18 m/s, Δt = 6 s, a = −18 ÷ 6 = −3 m/s². Eksi: hız azalıyor.", ipucu: "Δv = son − ilk. İşaretine dikkat, sonra süreye böl." },
      { s: "Özet: <b>Δ = son − ilk</b>. <b>v = Δx/Δt</b> (konum değişimi ÷ süre). <b>a = Δv/Δt</b> (hız değişimi ÷ süre)." },
      { s: "Şimdi sen: yedi sembolü anlamıyla eşleştir." },
    ],
    anlatBitti: (api) => { api.yerlestir(20); api.eslesmeKur(); },
  },

  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Grafik bir film şerididir",
    cikti: "FİZ.10.1.1-a",
    anlatim: `
      <p>Konum–zaman grafiği, aracın her saniye çekilmiş fotoğraflarının yan yana dizilmiş hâlidir: <b>zaman sağa doğru akar, konum yukarı okunur</b>.</p>
      <p>Okuma kuralı: alt eksende zamanı bul, yukarı çık, çizgiye çarpınca sola bak. Çizgi aracın izlediği yol <b>değildir</b>; araç düz yolda gidiyor, yokuş çıkmıyor.</p>`,
    gorev: "Verilen konum–zaman grafiğinden <b>iki değeri</b> doğru oku.",
    ogretmen: "En yaygın yanılgı: öğrenciler grafiğin çizgisini aracın yörüngesi sanır. Anlatımda 'araç yokuş çıkmıyor' karesinde durup sınıfa sorun: grafikte yukarı çıkan çizgi ne anlatıyor?",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(20, { uzaklik: 46 });
      let k = null, x0 = 0, v = 8, cozulen = 0;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "x", etiket: "Konum", birim: "m" }]);
      const [gxt] = ctx.grafikler([xtGrafigi(8, { min: 0, max: 100, otomatik: false })]);
      const sx = gxt.seri("x", { renk: RENK_X, nokta: true });

      function sur(hiz, bas) {
        k?.durdur();
        v = hiz; x0 = bas;
        gxt.eksenAyarla({ y: { min: Math.min(0, x0 + v * 8 - 10), max: Math.max(100, x0 + v * 8 + 10) } });
        gxt.dikey(null); gxt.not([]);
        S.izleriTemizle(); sx.temizle();
        S.A.yerlestir(x0); S.kameraya(x0 + 25, { uzaklik: 50 });
        const f = (t) => ({ x: x0 + v * t, v, a: 0 });
        k = kosu(S, {
          sure: 8,
          kare: (t) => { const d = f(t); S.A.yerlestir(d.x); S.A.oklar({ v }); S.takip(d.x); h.ayarla("t", t); h.ayarla("x", d.x); },
          saniye: (n) => { sx.ekle(n, f(n).x); S.izBirak("A", f(n).x, `${n} s`); },
          bitti: () => S.A.oklar(),
        });
      }
      function isaretle(t) {
        gxt.dikey(t);
        gxt.not([{ x: t, y: x0 + v * t, metin: `t = ${t} s → x = ${sayi(x0 + v * t, 0)} m`, renk: RENK_SARI }]);
      }

      ctx.dugmeler([{ metin: "▶ Aracı izle", ana: true, tik: () => sur(v, x0) }, { metin: "↻ Yeni grafik", tik: yeni }]);
      const soru1 = ctx.sayiSorusu({
        etiket: "<b>Soru 1.</b> Grafiğe göre araç <b>t = 5 s</b> anında hangi konumdadır?", birim: "m",
        kontrol: (c) => {
          if (Math.abs(c - (x0 + v * 5)) < 0.6) { bir(0); return true; }
          if (Math.abs(c - v * 5) < 0.6 && x0) return "Araç 0'dan başlamıyor. Çizginin t = 0'daki yüksekliğine bak.";
          return "t = 5'i alt eksende bul, yukarı çık, çizgiye çarpınca sola bak.";
        },
      });
      const soru2 = ctx.sayiSorusu({
        etiket: "<b>Soru 2.</b> Araç kaçıncı saniyede <b>son konumun yarısına</b> (grafikteki en yüksek konumun yarısı) ulaşır?", birim: "s",
        kontrol: (c) => {
          const hedef = (x0 + v * 8) / 2, t = (hedef - x0) / v;
          if (Math.abs(c - t) < 0.3) { bir(1); return true; }
          if (Math.abs(c - 4) < 0.3 && x0) return "Araç 0'dan başlamadığı için yarı konum tam ortada değil. Hedef konumu sol eksende bul, sağa git, çizgiye çarpınca aşağı in.";
          return `Son konum ${sayi(x0 + v * 8, 0)} m, yarısı ${sayi(hedef, 0)} m. Bu konumu sol eksende bulup çizgiye kadar sağa git.`;
        },
      });
      const bitenler = new Set();
      function bir(i) { bitenler.add(i); if (bitenler.size === 2) ctx.gorevTamam(); }
      function yeni() {
        bitenler.clear();
        soru1.girdi.value = soru2.girdi.value = ""; soru1.geri.textContent = soru2.geri.textContent = "";
        sur(sec([4, 6, 8, 10]), sec([10, 20, 30]));
      }
      yeni();
      ctx.temizlik(() => k?.durdur());
      return { sur, isaretle, yeni };
    },
    anlat: [
      { s: "Bir aracın hareketini anlatmanın en basit yolu: <b>her saniye bir fotoğraf</b> çekmek. İzle…", yap: (api) => api.sur(8, 0) },
      { s: "Yoldaki turuncu izler o fotoğraflar: 0 s'de 0 m, 1 s'de 8 m, 2 s'de 16 m…" },
      { s: "Şimdi grafiğe bak. Her nokta bir fotoğraf: <b>zaman sağa doğru akar, konum yukarı doğru okunur</b>.", grafik: true },
      { s: "Okuma kuralı: alttaki eksende zamanı bul, <b>yukarı çık</b>, çizgiye çarpınca <b>sola bak</b>.", yap: (api) => api.isaretle(3) },
      { soru: "Grafiğe göre araç 3. saniyede nerede?", secenekler: ["8 m", "24 m", "32 m"], dogru: 1,
        aciklama: "t = 3 s'den yukarı çıkınca çizgiye 24 m'de çarpıyoruz. Araç her saniye 8 m gitti.", ipucu: "Alt eksende 3'ü bul, yukarı çık." },
      { s: "Tersi de olur: konumu sol eksende bul, <b>sağa git</b>, çizgiye çarpınca <b>aşağı in</b>.", yap: (api) => api.isaretle(5) },
      { soru: "Araç 40 m'ye kaçıncı saniyede ulaşır?", secenekler: ["4 s", "5 s", "8 s"], dogru: 1,
        aciklama: "Sol eksende 40'ı bul, sağa git; çizgi t = 5 s'de 40 m'den geçiyor.", ipucu: "40 m'yi sol eksende bul, sağa git, aşağı in." },
      { s: "<b>Dikkat:</b> Çizgi yukarı çıkıyor ama araç <b>yokuş çıkmıyor</b>. Düz yolda gidiyor. Çizgi yalnızca “ne zaman, nerede?” sorusunun cevabıdır." },
      { s: "Şimdi sen: aşağıdaki grafikte araç 0'dan değil, başka bir yerden yola çıkıyor. İki değeri oku." },
    ],
    anlatBitti: (api) => api.yeni(),
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Eğim hızdır: dik, yatık, yatay, aşağı",
    cikti: "FİZ.10.1.1-b",
    anlatim: `
      <p>Konum–zaman grafiğinde çizginin <b>eğimi hızı</b> verir: <span class="formul">v = Δx / Δt</span>.</p>
      <ul>
        <li>Dik çizgi → hızlı. Yatık çizgi → yavaş.</li>
        <li><b>Yatay çizgi → araç duruyor</b> (zaman geçiyor, konum değişmiyor).</li>
        <li><b>Aşağı inen çizgi → araç geri gidiyor</b> (konum azalıyor, hız negatif).</li>
      </ul>`,
    gorev: "Grafikteki <b>üç parçayı</b> doğru adlandır ve <b>2. parçanın hızını</b> hesapla.",
    ogretmen: "Yatay çizginin 'yolun ortasında yatay gitmek' değil 'durmak' olduğunu, aşağı inen çizginin 'yokuş aşağı' değil 'geri dönüş' olduğunu sınıfta tartıştırın. Hızın işaretini yönle ilişkilendirin.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(20, { uzaklik: 50 });
      const GOSTERI = [{ sure: 3, v: 10 }, { sure: 3, v: 4 }, { sure: 2, v: 0 }, { sure: 3, v: -8 }];
      let k = null, parcalar = GOSTERI, x0 = 0;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "x", etiket: "Konum", birim: "m" }, { ad: "v", etiket: "Hız", birim: "m/s" }]);
      const [gxt] = ctx.grafikler([xtGrafigi(11, { min: -10, max: 60, otomatik: false })]);
      const sx = gxt.seri("x", { renk: RENK_X });

      function ciz(p, bas) {
        parcalar = p; x0 = bas;
        const f = sabitHizli(x0, p), T = sinirlar(p).pop();
        const n = []; for (let t = 0; t <= T + 1e-9; t += 0.25) n.push([t, f(t).x]);
        sx.ayarla(n);
        const ys = n.map((q) => q[1]);
        gxt.eksenAyarla({ x: { max: T }, y: { min: Math.min(-10, Math.min(...ys) - 5), max: Math.max(...ys) + 10 } });
        gxt.golgeTemizle(); gxt.ucgenTemizle(); gxt.not([]);
        S.A.yerlestir(x0); S.A.oklar(); S.izleriTemizle(); S.kameraya(x0 + 20, { uzaklik: 50 });
        return { f, T };
      }
      function sur(p = parcalar, bas = x0) {
        k?.durdur();
        const { f, T } = ciz(p, bas);
        sx.temizle();
        k = oynat(S, { f, T, hud: h, sx, aGoster: false });
      }
      function vurgula(i) {
        k?.durdur();
        const s = sinirlar(parcalar), f = sabitHizli(x0, parcalar);
        const t0 = s[i], t1 = s[i + 1];
        gxt.golge(sx, t0, t1, "rgba(255,181,71,.22)");
        gxt.egimUcgeni(t0, f(t0).x, t1, f(t1).x, { xEtiket: "Δt", yEtiket: "Δx" });
        const orta = (t0 + t1) / 2, d = f(orta);
        S.A.yerlestir(d.x); S.A.oklar({ v: d.v }); S.kameraya(d.x, { uzaklik: 42 });
        h.ayarla("t", orta); h.ayarla("x", d.x); h.ayarla("v", d.v);
      }

      /* Alıştırma: rastgele üç parça */
      const ETIKET = { hizli: "Hızlı ileri", yavas: "Yavaş ileri", dur: "Duruyor", geri: "Geri gidiyor" };
      const HIZ = { hizli: [10, 12], yavas: [3, 4], dur: [0], geri: [-6, -8, -10] };
      let turler = [], secimler = [];
      ctx.dugmeler([{ metin: "▶ Aracı izle", ana: true, tik: () => sur() }, { metin: "↻ Yeni grafik", tik: yeni }]);
      const sira = el("div", { class: "fzg-sira" });
      ctx.kontroller.append(sira);
      const gruplar = [0, 1, 2].map((i) => ctx.secenekler({
        etiket: `${i + 1}. parça`, deger: null,
        liste: Object.entries(ETIKET).map(([deger, metin]) => ({ deger, metin })),
        degisti: (v) => { secimler[i] = v; },
      }));
      const geri = el("div", { class: "d-geri-bildirim" });
      const [kontrolBtn] = ctx.dugmeler([{ metin: "Kontrol et", tik: kontrol }]);
      ctx.kontroller.append(geri);
      const hizSoru = ctx.sayiSorusu({
        etiket: "<b>2. parçanın hızı</b> kaç m/s? (Eğim: Δx / Δt; geri gidiyorsa eksi yaz.)", birim: "m/s",
        kontrol: (c) => {
          const v = parcalar[1].v;
          if (Math.abs(c - v) < 0.3) { hizDogru = true; bitir(); return true; }
          if (Math.abs(c + v) < 0.3) return "Büyüklük doğru ama işaret yanlış: çizgi yukarı mı çıkıyor, aşağı mı iniyor?";
          return "2. parçanın başındaki ve sonundaki konumu oku; farkı süreye böl.";
        },
      });
      let etiketDogru = false, hizDogru = false;
      function bitir() { if (etiketDogru && hizDogru) ctx.gorevTamam(); }
      function kontrol() {
        if (ctx.gosteriyor()) return;
        let dogru = 0;
        turler.forEach((t, i) => { if (secimler[i] === t) dogru++; });
        if (dogru === 3) {
          geri.className = "d-geri-bildirim dogru"; geri.textContent = "Üç parça da doğru!";
          etiketDogru = true; gruplar.forEach((g) => g.etkin(false)); kontrolBtn.disabled = true; bitir();
        } else {
          geri.className = "d-geri-bildirim yanlis";
          geri.textContent = `${dogru}/3 doğru. İpucu: yatay = duruyor, aşağı inen = geri, dik = hızlı.`;
        }
      }
      function yeni() {
        k?.durdur();
        etiketDogru = hizDogru = false; secimler = [];
        gruplar.forEach((g) => { g.deger = null; g.etkin(true); }); kontrolBtn.disabled = false;
        geri.textContent = ""; hizSoru.girdi.value = ""; hizSoru.geri.textContent = "";
        const havuz = karistir(["hizli", "yavas", "dur", "geri"]);
        turler = havuz.slice(0, 3);
        if (turler[1] === "dur") [turler[1], turler[2]] = [turler[2], turler[1]]; // 2. parçanın hızı sorulacak: sıfır olmasın
        const p = turler.map((t) => ({ sure: sec([2, 3, 4]), v: sec(HIZ[t]) }));
        ciz(p, sec([0, 10, 20]));
        const s = sinirlar(p);
        sira.innerHTML = `Parçalar: ${p.map((q, i) => `<b>${i + 1}.</b> ${s[i]}–${s[i + 1]} s`).join(" · ")}`;
      }
      yeni();
      ctx.temizlik(() => k?.durdur());
      return { sur: () => sur(GOSTERI, 0), vurgula, yeni };
    },
    anlat: [
      { s: "Bu araç dört şey yapacak: <b>hızlı gidecek, yavaş gidecek, duracak, geri dönecek</b>. İzle…", yap: (api) => api.sur() },
      { s: "Grafikte dört parça var ve her biri <b>farklı eğimde</b>.", grafik: true },
      { s: "<b>1. parça</b> dik: araç 3 saniyede 30 m gitti. Hızlı.", yap: (api) => api.vurgula(0) },
      { s: "<b>2. parça</b> daha yatık: aynı sürede yalnızca 12 m. Yavaş.", yap: (api) => api.vurgula(1) },
      { soru: "<b>3. parça</b> yatay. Araç ne yapıyor?", secenekler: ["Sabit hızla gidiyor", "Duruyor", "Geri gidiyor"], dogru: 1,
        aciklama: "Zaman geçiyor ama konum hiç değişmiyor: araç <b>yerinde duruyor</b>. Konum grafiğinde yatay çizgi = dur.", ipucu: "2 saniye boyunca konum hep 42 m. Konumu değişmeyen araç ne yapar?" },
      { s: "<b>4. parça</b> aşağı iniyor: konum azalıyor, araç <b>geri</b> (− yöne) gidiyor. Hızı −8 m/s.", yap: (api) => api.vurgula(3) },
      { formul: [["v", "hız"], ["="], ["Δx", "konum değişimi"], ["/"], ["Δt", "geçen süre"]],
        s: "Bu oran çizginin <b>eğimidir</b>.", oku: "v eşittir delta x bölü delta t. Bu oran çizginin eğimidir." },
      { cozum: ["4. parça: 8. saniyede x = 42 m, 11. saniyede x = 18 m", "Δx = 18 − 42 = −24 m", "Δt = 11 − 8 = 3 s", "v = −24 ÷ 3 = −8 m/s (geri)"] },
      { s: "Kural: <b>ne kadar dik, o kadar hızlı</b>. Yatay = duruyor. Aşağı inen = geri gidiyor." },
      { s: "Şimdi sen: yeni bir grafikte üç parçayı adlandır, 2. parçanın hızını hesapla." },
    ],
    anlatBitti: (api) => api.yeni(),
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Hız–zaman grafiği: yükseklik hızdır, konum değil",
    cikti: "FİZ.10.1.1-b",
    anlatim: `
      <p>Hız–zaman grafiğinde çizginin yüksekliği <b>hızı</b> gösterir. Bu yüzden:</p>
      <ul>
        <li>Sıfırın üstünde <b>yatay çizgi → sabit hızla gidiyor</b> (durmuyor!).</li>
        <li>Çizgi <b>sıfıra oturduğunda → duruyor</b>.</li>
        <li>Eksenin <b>altına inen çizgi → geri gidiyor</b>.</li>
      </ul>
      <p>Konum grafiğinde yatay = dur; hız grafiğinde yatay = sabit hız. İkisini karıştırma.</p>`,
    gorev: "Hız–zaman grafiğinde <b>üç soruyu</b> doğru cevapla.",
    ogretmen: "Aynı hareketin konum ve hız grafiğini yan yana göstermek yanılgıyı kırmanın en etkili yolu. Öğrencilere 'hız grafiğinde çizgi inerken konum ne yapıyor?' diye sorun.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(20, { uzaklik: 50 });
      const GOSTERI = [{ sure: 3, v: 10 }, { sure: 3, v: 4 }, { sure: 2, v: 0 }, { sure: 3, v: -8 }];
      let k = null, parcalar = GOSTERI;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "x", etiket: "Konum", birim: "m" }, { ad: "v", etiket: "Hız", birim: "m/s" }]);
      const [gxt, gvt] = ctx.grafikler([xtGrafigi(11, { min: -10, max: 60, otomatik: false }), vtGrafigi(11, { min: -12, max: 14, otomatik: false })]);
      const sx = gxt.seri("x", { renk: RENK_X }), sv = gvt.seri("v", { renk: RENK_V, kalinlik: 3 });

      function ciz(p) {
        parcalar = p;
        const f = sabitHizli(0, p), T = sinirlar(p).pop(), s = sinirlar(p);
        const nx = []; for (let t = 0; t <= T + 1e-9; t += 0.25) nx.push([t, f(t).x]);
        sx.ayarla(nx);
        sv.ayarla(p.flatMap((q, i) => [[s[i], q.v], [s[i + 1], q.v]]));
        const ys = nx.map((q) => q[1]);
        gxt.eksenAyarla({ x: { max: T }, y: { min: Math.min(-10, Math.min(...ys) - 5), max: Math.max(...ys) + 10 } });
        gvt.eksenAyarla({ x: { max: T } });
        gxt.golgeTemizle(); gvt.golgeTemizle(); gxt.dikey(null); gvt.dikey(null);
        S.A.yerlestir(0); S.A.oklar(); S.izleriTemizle(); S.kameraya(20, { uzaklik: 50 });
        return { f, T };
      }
      function sur(p = parcalar) {
        k?.durdur();
        const { f, T } = ciz(p);
        sx.temizle(); sv.temizle();
        k = oynat(S, { f, T, hud: h, sx, sv, aGoster: false });
      }
      function vurgula(i) {
        k?.durdur();
        const s = sinirlar(parcalar), f = sabitHizli(0, parcalar);
        gvt.golge(sv, s[i], s[i + 1], "rgba(90,211,139,.22)");
        gxt.golge(sx, s[i], s[i + 1], "rgba(255,181,71,.22)");
        const orta = (s[i] + s[i + 1]) / 2, d = f(orta);
        S.A.yerlestir(d.x); S.A.oklar({ v: d.v }); S.kameraya(d.x, { uzaklik: 42 });
        h.ayarla("t", orta); h.ayarla("x", d.x); h.ayarla("v", d.v);
      }

      /* Alıştırma */
      const SORULAR = [
        { metin: "Araç hangi aralıkta <b>duruyor</b>?", dogru: (p) => p.findIndex((q) => q.v === 0), ipucu: "Hız çizgisi sıfıra oturduğu parça." },
        { metin: "Araç hangi aralıkta <b>geri</b> gidiyor?", dogru: (p) => p.findIndex((q) => q.v < 0), ipucu: "Çizgi eksenin altına indiği parça." },
        { metin: "Araç hangi aralıkta <b>en hızlı</b>?", dogru: (p) => p.reduce((en, q, i) => Math.abs(q.v) > Math.abs(p[en].v) ? i : en, 0), ipucu: "Sıfırdan en uzak çizgi; eksenin altındaysa da hızlıdır (sürat)." },
      ];
      let soruNo = 0, dogruSayisi = 0;
      ctx.dugmeler([{ metin: "▶ Aracı izle", ana: true, tik: () => sur() }, { metin: "↻ Yeni grafik", tik: yeni }]);
      const soruKutu = ctx.not("");
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(geri);
      let secenekEl = null;
      function soruGoster() {
        const s = sinirlar(parcalar);
        const q = SORULAR[soruNo];
        soruKutu.innerHTML = `<p><b>Soru ${soruNo + 1}/3.</b> ${q.metin}</p>`;
        secenekEl?.remove();
        const yeniSec = ctx.secenekler({
          etiket: "Aralık", deger: null,
          liste: parcalar.map((_, i) => ({ deger: i, metin: `${s[i]}–${s[i + 1]} s` })),
          degisti: (v) => {
            if (ctx.gosteriyor()) return;
            const dogru = q.dogru(parcalar);
            if (v === dogru) {
              geri.className = "d-geri-bildirim dogru"; geri.textContent = "Doğru!";
              vurgula(v);
              dogruSayisi++;
              yeniSec.etkin(false);
              if (++soruNo < SORULAR.length) setTimeout(soruGoster, 900);
              else { soruKutu.innerHTML = "<p>Üç soru da doğru. Hız grafiğini okuyabiliyorsun.</p>"; ctx.gorevTamam(); }
            } else {
              geri.className = "d-geri-bildirim yanlis"; geri.textContent = `Tam değil. İpucu: ${q.ipucu}`;
            }
          },
        });
        secenekEl = yeniSec.el;
        geri.before(secenekEl);
      }
      function yeni() {
        k?.durdur();
        soruNo = 0; dogruSayisi = 0; geri.textContent = "";
        const hizlar = karistir([sec([8, 10, 12]), sec([3, 4, 5]), 0, sec([-6, -9, -12, -14])]);
        ciz(hizlar.map((v) => ({ sure: sec([2, 3]), v })));
        soruGoster();
      }
      yeni();
      ctx.temizlik(() => k?.durdur());
      return { sur: () => sur(GOSTERI), vurgula, yeni };
    },
    anlat: [
      { s: "Geçen adımdaki aynı hareket: hızlı, yavaş, dur, geri. Bu kez iki grafik birden çizilecek.", yap: (api) => api.sur() },
      { s: "Soldaki konum grafiği, sağdaki <b>hız–zaman</b> grafiği. Sağdakinde yükseklik <b>hızı</b> gösterir, konumu değil.", grafik: true },
      { s: "<b>1. parça:</b> hız grafiğinde 10 m/s'de <b>yatay</b> bir çizgi. Yatay ama araç duruyor mu? Hayır! Hızı 10, sabit hızla gidiyor.", yap: (api) => api.vurgula(0) },
      { soru: "Hız–zaman grafiğinde çizgi sıfırın üstünde ve yatay. Araç ne yapıyor?", secenekler: ["Duruyor", "Sabit hızla gidiyor", "Hızlanıyor"], dogru: 1,
        aciklama: "Hız sabit ve sıfırdan büyük: araç <b>sabit hızla gidiyor</b>. Durmak için hızın sıfır olması gerekir.", ipucu: "Yükseklik hızı gösteriyor. Hız 10 m/s olan araç durur mu?" },
      { s: "<b>3. parça:</b> hız çizgisi <b>sıfıra oturdu</b>. İşte araç burada duruyor. Konum grafiğinde de aynı yerde yatay çizgi var.", yap: (api) => api.vurgula(2) },
      { s: "<b>4. parça:</b> hız çizgisi eksenin <b>altına</b> indi: −8 m/s. Araç geri gidiyor; konum grafiği de aşağı iniyor.", yap: (api) => api.vurgula(3) },
      { soru: "Hız grafiğinde çizgi 10'dan 4'e <b>düşüyor</b> ama hâlâ sıfırın üstünde. Araç?", secenekler: ["Geri gidiyor", "Daha yavaş ama hâlâ ileri gidiyor", "Duruyor"], dogru: 1,
        aciklama: "Hız azaldı ama pozitif kaldı: araç <b>ileri</b> gitmeye devam ediyor, sadece daha yavaş. Konum hâlâ artıyor.", ipucu: "Hız 4 m/s. Pozitif mi, negatif mi?" },
      { s: "Özet: <b>Konum grafiğinde yatay = dur. Hız grafiğinde yatay = sabit hız.</b> Hız grafiğinde durmak, çizginin sıfıra oturmasıdır." },
      { s: "Şimdi sen: yeni bir hız–zaman grafiğinde üç soruyu cevapla." },
    ],
    anlatBitti: (api) => api.yeni(),
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Hızlanıyor mu, yavaşlıyor mu? İşaret kuralı",
    cikti: "FİZ.10.1.2",
    anlatim: `
      <p><b>Hız ve ivme aynı yöndeyse araç hızlanır; zıt yöndeyse yavaşlar.</b> İvmenin eksi olması “yavaşlıyor” demek değildir: geri giden (hızı eksi) bir araç eksi ivmeyle <b>hızlanır</b>.</p>
      <p>Hız–zaman grafiğinde pratik kural: çizgi <b>sıfırdan uzaklaşıyorsa</b> hızlanıyor, <b>sıfıra yaklaşıyorsa</b> yavaşlıyor. İvme ise bu çizginin eğimidir: <span class="formul">a = Δv / Δt</span>.</p>`,
    gorev: "Üç hız–zaman grafiği için hareket türünü seç ve <b>ivmeyi işaretiyle</b> hesapla.",
    ogretmen: "OYSS yazılı senaryolarında (3. ve 4. soru) tam bu beceri ölçülüyor: hız ve ivme yönünden hareket türüne karar verme, tabloyu doldurma. 'Negatif ivme = yavaşlama' yanılgısını özellikle M ve N tipi örneklerle (batıya giden araç) kırın.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(30, { uzaklik: 50 });
      const T = 5;
      const DURUM = {
        ileriHizlan: { x0: 0, v0: 2, a: 2 }, ileriYavasla: { x0: 0, v0: 14, a: -2.5 },
        geriHizlan: { x0: 80, v0: -2, a: -2 }, geriYavasla: { x0: 80, v0: -12, a: 2.5 },
      };
      let k = null, simdiki = DURUM.ileriHizlan;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "v", etiket: "Hız", birim: "m/s" }, { ad: "a", etiket: "İvme", birim: "m/s²" }]);
      const [gvt] = ctx.grafikler([vtGrafigi(T, { min: -16, max: 16, otomatik: false })]);
      const sv = gvt.seri("v", { renk: RENK_V, kalinlik: 3 });

      function ciz(d) {
        simdiki = d;
        const { v } = ornekle(d.x0, d.v0, [{ sure: T, a: d.a }], { dt: 0.25 });
        sv.ayarla(v); gvt.not([]); gvt.ucgenTemizle();
        S.A.yerlestir(d.x0); S.A.oklar(); S.izleriTemizle(); S.kameraya(d.x0 + (d.v0 > 0 ? 20 : -20), { uzaklik: 50 });
        h.ayarla("t", 0); h.ayarla("v", d.v0); h.ayarla("a", "?");
      }
      function sur(d = simdiki) {
        k?.durdur(); ciz(d);
        const f = parcali(d.x0, d.v0, [{ sure: T, a: d.a }]);
        k = oynat(S, { f, T, hud: h, sv, bitti: () => { h.ayarla("a", d.a); gvt.egimUcgeni(0, d.v0, T, d.v0 + d.a * T, { xEtiket: "Δt", yEtiket: "Δv" }); } });
      }

      /* Alıştırma: üç tur */
      const HAVUZ = [
        { x0: 0, v0: 3, a: 2 }, { x0: 0, v0: 15, a: -3 }, { x0: 60, v0: -4, a: -2 }, { x0: 60, v0: -15, a: 3 },
        { x0: 0, v0: 0, a: 3 }, { x0: 0, v0: 10, a: -2 }, { x0: 60, v0: 0, a: -2 }, { x0: 60, v0: -10, a: 2 },
      ];
      let tur = 0, siraDizi = [];
      const durum = el("div", { class: "fzg-sira" });
      ctx.kontroller.append(durum);
      const tip = ctx.secenekler({
        etiket: "Araç", deger: null,
        liste: [{ deger: "hizlaniyor", metin: "Hızlanıyor" }, { deger: "yavasliyor", metin: "Yavaşlıyor" }],
        degisti: (v) => {
          if (ctx.gosteriyor()) return;
          const d = siraDizi[tur];
          if (v === hareketTuru(d.v0 + 1e-6 * Math.sign(d.a), d.a)) {
            tipGeri.className = "d-geri-bildirim dogru";
            tipGeri.innerHTML = `Doğru: hız ${d.v0 >= 0 ? "+" : "−"} yönde, ivme ${d.a > 0 ? "+" : "−"} yönde → ${v === "hizlaniyor" ? "aynı yön, hızlanır" : "zıt yön, yavaşlar"}. Şimdi ivmeyi hesapla.`;
            tip.etkin(false); ivme.girdi.disabled = false; ivme.girdi.focus();
            sur(d);
          } else {
            tipGeri.className = "d-geri-bildirim yanlis";
            tipGeri.textContent = "Tam değil. Çizgi sıfırdan uzaklaşıyor mu, sıfıra mı yaklaşıyor?";
          }
        },
      });
      const tipGeri = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(tipGeri);
      const ivme = ctx.sayiSorusu({
        etiket: "İvme kaç m/s²? (İşaretini de yaz: a = Δv / Δt)", birim: "m/s²",
        kontrol: (c) => {
          const d = siraDizi[tur];
          if (Math.abs(c - d.a) < 0.05) { setTimeout(sonraki, 900); return true; }
          if (Math.abs(c + d.a) < 0.05) return "Büyüklük doğru, işaret yanlış. Δv = son hız − ilk hız; hangisi büyük?";
          return `İlk hız ${sayi(d.v0, 0)} m/s, son hız ${sayi(d.v0 + d.a * T, 1)} m/s, süre ${T} s.`;
        },
        dogruMesaj: "Doğru!",
      });
      function sonraki() {
        tur++;
        if (tur >= 3) { durum.innerHTML = "<b>3/3</b> tamamlandı. Hız ve ivmenin yönünü birlikte okuyabiliyorsun."; ctx.gorevTamam(); return; }
        turGoster();
      }
      function turGoster() {
        k?.durdur();
        durum.innerHTML = `Tur <b>${tur + 1}/3</b>. Grafiğe bak: araç hızlanıyor mu, yavaşlıyor mu?`;
        tip.deger = null; tip.etkin(true); tipGeri.textContent = "";
        ivme.girdi.value = ""; ivme.geri.textContent = ""; ivme.girdi.disabled = true;
        ciz(siraDizi[tur]);
      }
      function yeni() { tur = 0; siraDizi = karistir(HAVUZ).slice(0, 3); turGoster(); }
      yeni();
      ctx.temizlik(() => k?.durdur());
      return { sur: (ad) => sur(DURUM[ad]), ciz: (ad) => { k?.durdur(); ciz(DURUM[ad]); }, yeni };
    },
    anlat: [
      { s: "Araç ileri gidiyor ve gaza basıyor: hız oku ile ivme oku <b>aynı yönde</b>. İzle…", yap: (api) => api.sur("ileriHizlan") },
      { s: "Hız grafiğinde çizgi yukarı tırmanıyor: <b>sıfırdan uzaklaşıyor</b>. Araç hızlanıyor.", grafik: true },
      { s: "Şimdi araç ileri giderken frene basıyor: ivme oku <b>ters</b> döndü, stop lambaları yandı.", yap: (api) => api.sur("ileriYavasla") },
      { s: "Çizgi aşağı iniyor ve <b>sıfıra yaklaşıyor</b>: araç yavaşlıyor. İvme eksi: a = (1,5 − 14) ÷ 5 = −2,5 m/s²." },
      { s: "Peki ya araç <b>geri</b> giderken gaza basarsa? Hız eksi, ivme de eksi…", yap: (api) => api.sur("geriHizlan") },
      { soru: "Hız −2'den −12 m/s'ye gitti. Araç hızlanıyor mu, yavaşlıyor mu?", secenekler: ["Yavaşlıyor, çünkü ivme eksi", "Hızlanıyor, çünkü hız ve ivme aynı yönde"], dogru: 1,
        aciklama: "Sürat 2'den 12'ye çıktı: araç <b>hızlanıyor</b>. Eksi ivme 'yavaşlama' demek değildir; hız da eksi olduğu için aynı yöndeler.", ipucu: "Çizgi sıfırdan uzaklaşıyor mu? Sürat büyüyor mu?" },
      { s: "Son durum: geri giderken fren. Hız eksi, ivme artı: zıt yönler, araç yavaşlıyor.", yap: (api) => api.sur("geriYavasla") },
      { formul: [["a", "ivme"], ["="], ["Δv", "hız değişimi"], ["/"], ["Δt", "geçen süre"]],
        s: "İvme, hız–zaman çizgisinin eğimidir. Δv = son hız − ilk hız; işaretine dikkat.", oku: "a eşittir delta v bölü delta t." },
      { cozum: ["Geri giderken fren: ilk hız −12 m/s, son hız 0,5 m/s, süre 5 s", "Δv = 0,5 − (−12) = +12,5 m/s", "a = 12,5 ÷ 5 = +2,5 m/s²", "Hız (−) ile ivme (+) zıt → yavaşlıyor"] },
      { s: "<b>Kural:</b> Hız ve ivme aynı işaretliyse hızlanır, zıt işaretliyse yavaşlar. Grafikte: çizgi sıfırdan uzaklaşıyorsa hızlanır, sıfıra yaklaşıyorsa yavaşlar." },
      { s: "Şimdi sen: üç grafikte hareket türünü seç, ivmeyi işaretiyle hesapla." },
    ],
    anlatBitti: (api) => api.yeni(),
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Alan yer değiştirmedir",
    cikti: "FİZ.10.1.3-a",
    anlatim: `
      <p>Hız–zaman grafiğinde çizgi ile zaman ekseni arasında kalan <b>alan, yer değiştirmeyi</b> verir.</p>
      <ul>
        <li>Dikdörtgen: v · Δt. Üçgen: ½ · taban · yükseklik. Yamuk: (ilk hız + son hız) / 2 · Δt.</li>
        <li>Eksenin <b>altındaki alan negatif</b> sayılır (araç geri gidiyor). Yer değiştirme için işaretli topla; <b>alınan yol</b> için hepsini pozitif topla.</li>
      </ul>`,
    gorev: "Verilen hız–zaman grafiği için <b>yer değiştirmeyi</b> ve <b>alınan yolu</b> hesapla.",
    ogretmen: "Grafik üzerinde sürükleyerek alanın adım adım dolduğunu ve aracın aynı anda ilerlediğini gösterin. Yazılıda (7. soru) yamuk alanı ve 'en az ivme' sorusu bu beceriye dayanıyor.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(30, { uzaklik: 50 });
      const GOSTERI = { v0: 4, parcalar: [{ sure: 4, a: 2 }, { sure: 3, a: 0 }, { sure: 3, a: -4 }] };
      let k = null, v0 = GOSTERI.v0, parcalar = GOSTERI.parcalar, T = 10, f = null;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "x", etiket: "Konum", birim: "m" }, { ad: "v", etiket: "Hız", birim: "m/s" }]);
      const [gvt] = ctx.grafikler([vtGrafigi(10, { min: -12, max: 16, otomatik: false })]);
      const sv = gvt.seri("v", { renk: RENK_V, kalinlik: 3 });

      function ciz(d) {
        v0 = d.v0; parcalar = d.parcalar; T = sinirlar(parcalar).pop();
        const o = ornekle(0, v0, parcalar, { dt: 0.25 });
        f = o.f; sv.ayarla(o.v);
        const ys = o.v.map((q) => q[1]);
        gvt.eksenAyarla({ x: { max: T }, y: { min: Math.min(-4, Math.min(...ys) - 2), max: Math.max(...ys) + 3 } });
        gvt.golgeTemizle(); gvt.dikey(null); gvt.not([]);
        S.A.yerlestir(0); S.A.oklar(); S.izleriTemizle(); S.kameraya(20, { uzaklik: 50 });
      }
      function boya(t) {
        if (!f) return;
        const tt = Math.max(0, Math.min(T, Math.round(t * 4) / 4));
        gvt.golge(sv, 0, tt, "rgba(255,181,71,.3)");
        gvt.dikey(tt);
        const d = f(tt);
        gvt.not([{ x: tt, y: d.v, metin: `Alan (0–${sayi(tt, 2)} s) = ${sayi(d.x, 1)} m`, renk: RENK_SARI, dx: 8, dy: -12 }]);
        S.A.yerlestir(d.x); S.A.oklar({ v: d.v }); S.takip(d.x);
        h.ayarla("t", tt); h.ayarla("x", d.x); h.ayarla("v", d.v);
      }
      gvt.surukle(boya);
      function sur() { k?.durdur(); gvt.golgeTemizle(); k = oynat(S, { f, T, hud: h, aGoster: false, bitti: () => boya(T) }); }

      /* Alıştırma: sıfırı kesen bir parça da var */
      ctx.dugmeler([{ metin: "▶ Aracı izle", ana: true, tik: sur }, { metin: "↻ Yeni grafik", tik: yeni }]);
      ctx.not("<p>Grafik üzerinde <b>sürükle</b>: alan dolarken araç ilerler.</p>");
      let bitenler = new Set();
      const bir = (i) => { bitenler.add(i); if (bitenler.size === 2) ctx.gorevTamam(); };
      const s1 = ctx.sayiSorusu({
        etiket: "<b>Yer değiştirme</b> kaç m? (Eksen altındaki alanı eksi say.)", birim: "m",
        kontrol: (c) => {
          const { alan, yol } = vtAlan(v0, parcalar);
          if (Math.abs(c - alan) < 0.6) { bir(0); return true; }
          if (Math.abs(c - yol) < 0.6) return "Bu alınan yol. Yer değiştirme için eksen altındaki alanı eksi olarak topla.";
          return "Grafiği parçalara böl: dikdörtgen, üçgen, yamuk. Her parçanın alanını ayrı hesapla.";
        },
      });
      const s2 = ctx.sayiSorusu({
        etiket: "<b>Alınan yol</b> kaç m? (Tüm alanları pozitif topla.)", birim: "m",
        kontrol: (c) => {
          const { alan, yol } = vtAlan(v0, parcalar);
          if (Math.abs(c - yol) < 0.6) { bir(1); return true; }
          if (Math.abs(c - alan) < 0.6) return "Bu yer değiştirme. Alınan yolda geri gidilen mesafe de artı sayılır.";
          return "Eksenin üstündeki ve altındaki alanları ayrı ayrı bul, büyüklüklerini topla.";
        },
      });
      function yeni() {
        k?.durdur(); bitenler = new Set();
        [s1, s2].forEach((s) => { s.girdi.value = ""; s.geri.textContent = ""; });
        // sıfırı tam saniyede kesen üçlüler: ilk hız, geri hız, geçiş süresi
        const [ilk, geriHiz, t2] = sec([[6, 6, 2], [8, 4, 3], [10, 5, 3], [6, 3, 3], [8, 8, 4], [4, 8, 3], [12, 6, 3]]);
        const t1 = sec([2, 3]), t3 = sec([2, 3]);
        ciz({ v0: ilk, parcalar: [{ sure: t1, a: 0 }, { sure: t2, a: -(ilk + geriHiz) / t2 }, { sure: t3, a: 0 }] });
      }
      yeni();
      ctx.temizlik(() => k?.durdur());
      return { gosteri() { k?.durdur(); ciz(GOSTERI); }, sur, boya, yeni };
    },
    anlat: [
      { s: "Bu araç önce hızlanacak, sonra sabit gidecek, sonra fren yapıp duracak. İzle…", yap: (api) => { api.gosteri(); api.sur(); } },
      { s: "Hız grafiği üç parçadan oluştu: eğik doğru, yatay doğru, eğik doğru. Şimdi alanlara bakalım.", grafik: true },
      { s: "0–4 s: hız 4'ten 12'ye çıktı. Çizginin altı bir <b>yamuk</b>.", yap: (api) => api.boya(4) },
      { formul: [["Alan", "yer değiştirme"], ["="], ["(v₁ + v₂) / 2", "ortalama hız"], ["·"], ["Δt", "süre"]],
        s: "Yamuğun alanı: paralel kenarların ortalaması çarpı yükseklik.", oku: "Alan eşittir v bir artı v iki bölü iki çarpı delta t." },
      { cozum: ["0–4 s: (4 + 12) / 2 · 4 = 8 · 4 = 32 m", "4–7 s: dikdörtgen, 12 · 3 = 36 m", "7–10 s: üçgen, ½ · 3 · 12 = 18 m", "Toplam yer değiştirme = 32 + 36 + 18 = 86 m"], yap: (api) => api.boya(10) },
      { soru: "Aracın 10 s sonundaki konumu kaç m olur (0'dan başladı)?", secenekler: ["68 m", "86 m", "120 m"], dogru: 1,
        aciklama: "Alan = yer değiştirme = 86 m. Yoldaki araç da tam 86 m işaretinde durdu.", ipucu: "Üç alanı topla." },
      { s: "Peki çizgi eksenin <b>altına</b> inerse? O alan <b>eksi</b> sayılır: araç geri gidiyor, konumu azalıyor." },
      { s: "<b>Yer değiştirme</b> için alanları işaretiyle topla. <b>Alınan yol</b> için hepsini pozitif topla." },
      { s: "Şimdi sen: yeni grafikte araç bir ara geri gidiyor. Yer değiştirmeyi ve alınan yolu hesapla." },
    ],
    anlatBitti: (api) => api.yeni(),
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Üç grafik, tek hareket: yapı taşlarıyla kur",
    cikti: "FİZ.10.1.3-b",
    anlatim: `
      <p>Aynı hareketin üç grafiği birbirine bağlıdır:</p>
      <ul>
        <li><b>İvme–zaman</b> basamaklıdır: her yapı taşında sabit bir değer.</li>
        <li><b>Hız–zaman</b> kırık doğrudur: ivme artıysa yukarı, eksiyse aşağı, sıfırsa yatay.</li>
        <li><b>Konum–zaman</b> eğridir: hız artıyorsa dikleşir, sabitse düz, azalıyorsa yatıklaşır.</li>
      </ul>`,
    gorev: "Konum–zaman grafiği <b>tepe yapan</b> bir hareket kur: araç ileri gidip <b>geri dönsün</b>.",
    ogretmen: "Öğrencilerden hareketi kurmadan önce üç grafiğin nasıl çıkacağını kâğıda çizmelerini isteyin, sonra oynatıp karşılaştırsınlar. 'Tepe noktasında hız sıfır, ivme sıfır değil' noktasını vurgulayın.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(20, { uzaklik: 50 });
      let k = null, taslar = [];
      const TAS = { hizlan: "Hızlan (a = +2, 2 s)", sabit: "Sabit git (3 s)", fren: "Fren (durana kadar, 2 s)", dur: "Bekle (2 s)", geri: "Geri hızlan (a = −2, 2 s)" };
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "x", etiket: "Konum", birim: "m" }, { ad: "v", etiket: "Hız", birim: "m/s" }, { ad: "a", etiket: "İvme", birim: "m/s²" }]);
      const [gxt, gvt, gat] = ctx.grafikler([xtGrafigi(12, { min: -10, max: 60 }), vtGrafigi(12, { min: -8, max: 8 }), atGrafigi(12, { min: -3, max: 3 })]);
      const sx = gxt.seri("x", { renk: RENK_X }), sv = gvt.seri("v", { renk: RENK_V }), sa = gat.seri("a", { renk: RENK_A });

      const liste = el("div", { class: "fzg-parcalar" });
      const yaz = () => { liste.replaceChildren(...taslar.map((t, i) => el("span", { class: "fzg-parca" }, `${i + 1}. ${TAS[t].split(" (")[0]}`))); if (!taslar.length) liste.append(el("span", { class: "fzg-parca" }, "Henüz taş yok")); };
      ctx.not("<p>Yapı taşlarını sırayla ekle, sonra oynat.</p>");
      ctx.kontroller.append(liste);
      ctx.dugmeler(Object.entries(TAS).map(([ad, metin]) => ({ metin: `+ ${metin}`, tik: () => { if (taslar.length < 6) { taslar.push(ad); yaz(); } } })));
      const [oynatBtn] = ctx.dugmeler([{ metin: "▶ Oynat", ana: true, tik: () => oynatTaslar() }, { metin: "✕ Temizle", tik: () => { taslar = []; yaz(); } }]);
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(geri);
      yaz();

      function oynatTaslar(dizi = taslar, { gosterim = false } = {}) {
        if (!dizi.length) return;
        k?.durdur();
        const p = taslardanParcalar(dizi);
        const T = sinirlar(p).pop();
        const f = parcali(0, 0, p);
        [gxt, gvt, gat].forEach((g) => g.eksenAyarla({ x: { max: Math.max(4, T) } }));
        gxt.not([]);
        oynatBtn.disabled = true;
        S.A.yerlestir(0); S.kameraya(10, { uzaklik: 50 });
        k = oynat(S, { f, T, hud: h, sx, sv, sa, bitti: () => {
          oynatBtn.disabled = false;
          if (gosterim) return;
          const tepe = tepeYaparMi(0, p);
          geri.className = `d-geri-bildirim ${tepe ? "dogru" : "yanlis"}`;
          geri.textContent = tepe ? "Konum grafiği tepe yaptı: araç ileri gitti, durdu, geri döndü. Tepe noktasında hız sıfır." : "Henüz tepe yok. Araç önce ileri gitmeli, sonra hızı eksiye dönmeli (ör. Hızlan → Fren → Geri hızlan).";
          if (tepe) ctx.gorevTamam();
        } });
      }
      function vurgulaTepe() {
        const p = taslardanParcalar(["hizlan", "fren", "geri"]);
        const f = parcali(0, 0, p);
        gxt.not([{ x: 4, y: f(4).x, metin: "tepe: v = 0", renk: RENK_SARI, hiza: "center", dx: 0, dy: -10 }]);
      }
      ctx.temizlik(() => k?.durdur());
      return { gosteri: (dizi) => { taslar = dizi.slice(); yaz(); oynatTaslar(dizi, { gosterim: true }); }, vurgulaTepe, sifirla() { k?.durdur(); taslar = []; yaz(); geri.textContent = ""; sx.temizle(); sv.temizle(); sa.temizle(); gxt.not([]); S.sifirla(); } };
    },
    anlat: [
      { s: "Bir hareketi <b>yapı taşlarından</b> kuralım: Hızlan, Sabit git, Fren. İzle…", yap: (api) => api.gosteri(["hizlan", "sabit", "fren"]) },
      { s: "Üç grafik aynı anda çizildi. En alttan başlayalım: <b>ivme–zaman</b> basamaklı: +2, sonra 0, sonra −2.", grafik: true },
      { s: "<b>Hız–zaman</b> kırık bir doğru: ivme +2 iken yukarı, 0 iken yatay, −2 iken aşağı." },
      { s: "<b>Konum–zaman</b> eğri: hız artarken <b>dikleşiyor</b>, sabitken <b>düz</b>, azalırken <b>yatıklaşıyor</b>." },
      { soru: "İvme sıfırken hız grafiği ve konum grafiği nasıldır?", secenekler: ["Hız yatay, konum düz eğik doğru", "Hız yatay, konum da yatay", "Hız eğik, konum eğri"], dogru: 0,
        aciklama: "İvme yoksa hız değişmez (yatay). Hız sabit ama sıfır değil: konum düzgün artar, eğik düz doğru.", ipucu: "İvme sıfır = hız sabit. Hız sabit ama sıfır mı?" },
      { s: "Şimdi başka taşlar: Hızlan, Fren, Geri hızlan. Araç ileri gidip <b>geri dönecek</b>.", yap: (api) => api.gosteri(["hizlan", "fren", "geri"]) },
      { s: "Konum grafiği <b>tepe</b> yaptı. Tepe anında hız tam sıfır; ivme ise sıfır değil, hâlâ −2.", yap: (api) => api.vurgulaTepe() },
      { soru: "Konum grafiğinin tepe noktasında hız–zaman grafiği ne yapar?", secenekler: ["Tepe yapar", "Sıfırı keser", "Yatay olur"], dogru: 1,
        aciklama: "Tepe = konum artmayı bırakıp azalmaya başlıyor = hız +'dan −'ye geçiyor = hız çizgisi sıfırı keser.", ipucu: "Tepe noktasında araç bir an durur. Durmak hız grafiğinde ne demek?" },
      { s: "Şimdi sen: taşları kendin diz, konum grafiği tepe yapan bir hareket kur." },
    ],
    anlatBitti: (api) => api.sifirla(),
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Kendin çiz: hız grafiğinden konum ve ivme grafiği",
    cikti: "FİZ.10.1.3-b",
    anlatim: `
      <p>Yazılıda “şu grafiği çiziniz” sorusu çıkar. Yöntem: hız–zaman grafiğini <b>parçalara böl</b>, her parça için iki soru sor:</p>
      <ul>
        <li><b>İvme:</b> çizgi yukarı mı (+), yatay mı (0), aşağı mı (−)?</li>
        <li><b>Konum şekli:</b> hız artı mı eksi mi (artan/azalan), hız büyüyor mu küçülüyor mu (dikleşen/yatıklaşan)?</li>
      </ul>`,
    gorev: "<b>İki bulmacada</b> her parça için doğru konum şeklini ve ivme düzeyini seç.",
    ogretmen: "Öğrenciler şekli seçtikçe grafik canlı çizilir; yanlış parça kırmızı olur. Sınıfta önce kâğıda çizdirip sonra burada kontrol ettirmek iyi sonuç veriyor.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(20, { uzaklik: 50 });
      const SURE = 4;
      const BULMACA = [
        { v0: 0, a: [2, 0, -2] }, { v0: 8, a: [0, -2, 0] }, { v0: 0, a: [-2, 0, 2] }, { v0: -8, a: [2, 0, 2] },
      ];
      let k = null, b = null, cozulen = 0, no = 0, sira = karistir([0, 1, 2, 3]);
      let secX = [null, null, null], secA = [null, null, null];
      const [gvt, gxt, gat] = ctx.grafikler([vtGrafigi(12, { min: -10, max: 10, otomatik: false }), xtGrafigi(12, { min: -30, max: 60, otomatik: false }), atGrafigi(12, { min: -3, max: 3 })]);
      const sv = gvt.seri("v", { renk: RENK_V, kalinlik: 3 });
      const sxCizim = gxt.seri("x", { renk: RENK_X, kalinlik: 3 });
      const saCizim = gat.seri("a", { renk: RENK_A, kalinlik: 3 });

      const durum = el("div", { class: "fzg-sira" });
      const paletKap = el("div");
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(durum, paletKap, geri);
      const [kontrolBtn, sonrakiBtn] = ctx.dugmeler([{ metin: "Kontrol et", ana: true, tik: kontrol }, { metin: "Sonraki bulmaca ›", tik: () => { no++; goster(); } }]);
      sonrakiBtn.hidden = true;

      function cizim() {
        // öğrencinin seçimleri → niteliksel konum ve ivme grafiği
        const px = [[0, 0]]; let x = 0;
        secX.forEach((s, i) => {
          if (!s) return;
          for (let t = 0.25; t <= SURE + 1e-9; t += 0.25) px.push([i * SURE + t, x + SEKIL_FN[s](t)]);
          x += SEKIL_FN[s](SURE);
        });
        sxCizim.ayarla(px.length > 1 ? px : []);
        const pa = [];
        secA.forEach((s, i) => { if (!s) return; const y = s === "pozitif" ? 2 : s === "negatif" ? -2 : 0; pa.push([i * SURE, y], [(i + 1) * SURE, y]); });
        saCizim.ayarla(pa);
      }
      function paletKur() {
        paletKap.replaceChildren();
        for (let i = 0; i < 3; i++) {
          paletKap.append(el("p", { class: "fzg-sira" }, `${i + 1}. parça (${i * SURE}–${(i + 1) * SURE} s): konum–zaman şekli`));
          const px = el("div", { class: "fzg-palet", "data-parca": i, "data-tur": "x" });
          for (const [ad, s] of Object.entries(XT_SEKIL)) {
            const d = sekilDugmesi(s.yol, s.ad);
            d.dataset.sekil = ad;
            d.onclick = () => { if (ctx.gosteriyor()) return; secX[i] = ad; px.querySelectorAll("button").forEach((q) => q.setAttribute("aria-pressed", String(q === d))); cizim(); };
            px.append(d);
          }
          paletKap.append(px, el("p", { class: "fzg-sira" }, `${i + 1}. parça: ivme düzeyi`));
          const pa = el("div", { class: "fzg-palet uc", "data-parca": i, "data-tur": "a" });
          for (const [ad, s] of Object.entries(AT_SEVIYE)) {
            const d = sekilDugmesi(s.cizgi, s.ad, "ivme");
            d.dataset.sekil = ad;
            d.onclick = () => { if (ctx.gosteriyor()) return; secA[i] = ad; pa.querySelectorAll("button").forEach((q) => q.setAttribute("aria-pressed", String(q === d))); cizim(); };
            pa.append(d);
          }
          paletKap.append(pa);
        }
      }
      function goster() {
        k?.durdur();
        b = BULMACA[sira[no % 4]];
        secX = [null, null, null]; secA = [null, null, null];
        const parcalar = b.a.map((a) => ({ sure: SURE, a }));
        const o = ornekle(0, b.v0, parcalar, { dt: 0.25 });
        sv.ayarla(o.v); sxCizim.temizle(); saCizim.temizle();
        geri.textContent = ""; kontrolBtn.disabled = false; sonrakiBtn.hidden = true;
        durum.innerHTML = `Bulmaca <b>${Math.min(no + 1, 3)}/3</b> · çözülen: <b>${cozulen}</b>. Hız–zaman grafiği verildi; konum ve ivme grafiklerini parça parça kur.`;
        paletKur();
        S.A.yerlestir(0); S.A.oklar(); S.izleriTemizle(); S.kameraya(10, { uzaklik: 50 });
      }
      function kontrol() {
        if (ctx.gosteriyor() || !b) return;
        const parcalar = b.a.map((a) => ({ sure: SURE, a }));
        const f = parcali(0, b.v0, parcalar);
        let dogru = 0;
        for (let i = 0; i < 3; i++) {
          const vBas = f(i * SURE).v, a = b.a[i];
          const xDogru = secX[i] === xtSekli(Math.abs(vBas) < 1e-9 ? 0 : vBas, a);
          const aDogru = secA[i] === atSeviye(a);
          const px = paletKap.querySelector(`.fzg-palet[data-parca="${i}"][data-tur="x"]`), pa = paletKap.querySelector(`.fzg-palet[data-parca="${i}"][data-tur="a"]`);
          px.querySelectorAll("button").forEach((q) => q.classList.toggle("yanlis", q.getAttribute("aria-pressed") === "true" && !xDogru));
          pa.querySelectorAll("button").forEach((q) => q.classList.toggle("yanlis", q.getAttribute("aria-pressed") === "true" && !aDogru));
          px.querySelectorAll("button").forEach((q) => q.classList.toggle("dogru", q.getAttribute("aria-pressed") === "true" && xDogru));
          pa.querySelectorAll("button").forEach((q) => q.classList.toggle("dogru", q.getAttribute("aria-pressed") === "true" && aDogru));
          if (xDogru && aDogru) dogru++;
        }
        if (dogru === 3) {
          cozulen++;
          geri.className = "d-geri-bildirim dogru"; geri.textContent = "Üç parça da doğru! Araç şimdi bu grafiğe göre gidiyor.";
          kontrolBtn.disabled = true; sonrakiBtn.hidden = cozulen >= 2;
          const T = 3 * SURE;
          gxt.eksenAyarla({ y: { min: Math.min(-30, f(T).x - 10), max: Math.max(60, f(T).x + 10) } });
          k = oynat(S, { f, T, sx: null, aGoster: true });
          if (cozulen >= 2) { durum.innerHTML = "<b>2/3</b> bulmaca çözüldü. Hız grafiğinden konum ve ivme grafiği çizebiliyorsun."; ctx.gorevTamam(); }
        } else {
          geri.className = "d-geri-bildirim yanlis";
          geri.textContent = `${dogru}/3 parça doğru. Kırmızı olanlara yeniden bak: hız artı mı eksi mi, büyüyor mu küçülüyor mu?`;
        }
      }
      function gosteri(secimX, secimA) {
        secX = secimX; secA = secimA; cizim();
      }
      const baslat = () => { cozulen = 0; no = 0; sira = karistir([0, 1, 2, 3]); goster(); };
      baslat();
      ctx.temizlik(() => k?.durdur());
      return {
        baslat,
        gosteriGrafik() { k?.durdur(); const o = ornekle(0, 0, [{ sure: SURE, a: 2 }, { sure: SURE, a: 0 }, { sure: SURE, a: -2 }], { dt: 0.25 }); sv.ayarla(o.v); sxCizim.temizle(); saCizim.temizle(); },
        gosteri,
      };
    },
    anlat: [
      { s: "Elimizde yalnızca bir <b>hız–zaman</b> grafiği var. Konum ve ivme grafiklerini biz çizeceğiz.", yap: (api) => api.gosteriGrafik(), grafik: true },
      { s: "Yöntem: grafiği <b>parçalara böl</b>. Burada üç parça var: 0–4, 4–8, 8–12 s." },
      { s: "<b>1. parça:</b> hız 0'dan 8'e çıkıyor. İvme <b>artı</b>. Konum: hız artı ve büyüyor → <b>artan, dikleşen</b> eğri.", yap: (api) => api.gosteri(["artan-yukari", null, null], ["pozitif", null, null]) },
      { s: "<b>2. parça:</b> hız 8'de sabit. İvme <b>sıfır</b>. Konum: hız artı ve sabit → <b>düz artan</b> doğru.", yap: (api) => api.gosteri(["artan-yukari", "artan-dogru", null], ["pozitif", "sifir", null]) },
      { soru: "<b>3. parça:</b> hız 8'den 0'a iniyor. Konum grafiği nasıl olmalı?", secenekler: ["Azalan, dikleşen", "Artan, yatıklaşan", "Yatay"], dogru: 1,
        aciklama: "Hız hâlâ artı: konum <b>artmaya devam eder</b>. Ama hız küçüldüğü için eğri <b>yatıklaşır</b> ve sonunda düzleşir.", ipucu: "Hız 8'den 0'a ama hiç eksi olmuyor. Konum azalır mı?" },
      { s: "İvme ise bu parçada <b>eksi</b>: çizgi aşağı iniyor.", yap: (api) => api.gosteri(["artan-yukari", "artan-dogru", "artan-asagi"], ["pozitif", "sifir", "negatif"]) },
      { s: "İki soruyla her parça çözülür: <b>İvme:</b> çizgi yukarı/yatay/aşağı? <b>Konum:</b> hız artı mı eksi mi, büyüyor mu küçülüyor mu?" },
      { s: "Şimdi sen: iki bulmacada şekilleri seç, kontrol et." },
    ],
    anlatBitti: (api) => api.baslat(),
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Sabit ivme mi, değişken ivme mi?",
    cikti: "FİZ.10.1.2",
    anlatim: `
      <p>Hız–zaman grafiği <b>düz bir doğruysa ivme sabittir</b>: her saniye hız aynı miktar değişir. Grafik <b>eğriyse ivme değişiyordur</b>.</p>
      <ul>
        <li>Eğri gittikçe dikleşiyorsa ivme artıyor (gaz pedalına gittikçe daha çok basmak).</li>
        <li>Eğri gittikçe yatıklaşıyorsa ivme azalıyor (gazı yavaş yavaş bırakmak).</li>
      </ul>
      <p>Bu ünitede hesaplar sabit ivme içindir; değişken ivmeyi tanımak, grafiği doğru yorumlamak için gerekir.</p>`,
    gorev: "Üç hız–zaman grafiğinden <b>sabit ivmeli</b> olanı ve <b>ivmesi azalan</b> olanı bul.",
    ogretmen: "MEB programı 10. sınıfta sabit ivmeyle sınırlıdır; bu adım yalnızca 'doğru = sabit ivme, eğri = değişken ivme' ayrımını kazandırır. Üstte üç grafik kartı var; öğrenci iki kartı doğru seçmeli.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(20, { uzaklik: 50 });
      const T = 6;
      const IVME = {
        sabit: { ad: "sabit", fn: () => 2 },
        artan: { ad: "artan", fn: (t) => (4 * t) / T },
        azalan: { ad: "azalan", fn: (t) => 4 - (4 * t) / T },
      };
      let k = null;
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "v", etiket: "Hız", birim: "m/s" }, { ad: "a", etiket: "İvme", birim: "m/s²" }]);
      const [gvt, gat] = ctx.grafikler([vtGrafigi(T, { min: 0, max: 14, otomatik: false }), atGrafigi(T, { min: 0, max: 5 })]);
      const sv = gvt.seri("v", { renk: RENK_V, kalinlik: 3 }), sa = gat.seri("a", { renk: RENK_A, kalinlik: 3 });

      function sur(tur) {
        k?.durdur();
        const d = degiskenIvme(0, 0, IVME[tur].fn, T);
        const f = (t) => { const i = Math.min(d.v.length - 1, Math.round(t / 0.02)); return { x: d.x[i][1], v: d.v[i][1], a: d.a[i][1] }; };
        S.A.yerlestir(0); S.kameraya(15, { uzaklik: 50 });
        k = oynat(S, { f, T, hud: h, sv, sa });
      }

      /* Kartlar */
      const kartlar = el("div", { class: "fzg-kartlar d-alistirma" });
      ctx.katman.append(kartlar);
      const kartGrafikleri = [];
      ctx.temizlik(() => kartGrafikleri.forEach((g) => g.yokEt()));
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(geri);
      let asama = 0, bitti = false;
      const HEDEF = [{ ara: "sabit", metin: "Hangi grafikte ivme <b>sabittir</b>?" }, { ara: "azalan", metin: "Hangi grafikte ivme <b>azalıyor</b>?" }];
      let secenekler = [];
      function kartlariKur() {
        kartGrafikleri.splice(0).forEach((g) => g.yokEt());
        secenekler = karistir(Object.keys(IVME));
        const baslik = el("div", { class: "fzg-kartlar-baslik", html: HEDEF[asama].metin });
        const satir = el("div", { class: "fzg-kart-satir" });
        kartlar.replaceChildren(baslik, satir);
        secenekler.forEach((tur, i) => {
          const kap = el("div", { class: "fzg-kart-grafik" });
          const kart = el("button", { class: "fzg-kart", "aria-label": `Seçenek ${"ABC"[i]}` }, el("span", {}, "ABC"[i]), kap);
          satir.append(kart);
          const g = new Grafik(kap, { x: { etiket: "t", min: 0, max: T }, y: { etiket: "v", min: 0, max: 14 } });
          g.seri("v", { renk: RENK_V, kalinlik: 2.5 }).ayarla(degiskenIvme(0, 0, IVME[tur].fn, T, 0.1).v);
          kartGrafikleri.push(g);
          kart.onclick = () => {
            if (bitti || ctx.gosteriyor()) return;
            if (tur === HEDEF[asama].ara) {
              kart.classList.add("dogru");
              geri.className = "d-geri-bildirim dogru";
              geri.innerHTML = asama === 0 ? "Doğru: düz doğru = her saniye aynı hız artışı = sabit ivme." : "Doğru: eğri gittikçe yatıklaşıyor = hız artışı küçülüyor = ivme azalıyor.";
              sur(tur);
              asama++;
              if (asama < HEDEF.length) setTimeout(kartlariKur, 1200);
              else { bitti = true; ctx.gorevTamam(); setTimeout(() => kartlar.replaceChildren(), 1500); }
            } else {
              kart.classList.add("yanlis");
              geri.className = "d-geri-bildirim yanlis";
              geri.textContent = asama === 0 ? "Bu grafik eğri: hız her saniye farklı miktarda değişiyor, ivme sabit değil." : "Bu grafikte eğim azalmıyor. Gittikçe yatıklaşan eğriyi ara.";
            }
          };
        });
      }
      const baslat = () => { asama = 0; bitti = false; geri.textContent = ""; kartlariKur(); };
      baslat();
      ctx.temizlik(() => k?.durdur());
      return { sur, baslat };
    },
    anlat: [
      { s: "Tramvay kalkıyor: sürücü gaza <b>hep aynı</b> basıyor. İvme sabit: 2 m/s². İzle…", yap: (api) => api.sur("sabit") },
      { s: "Hız grafiği <b>dümdüz bir doğru</b>: her saniye hız 2 m/s artıyor. İvme grafiği yatay.", grafik: true },
      { s: "Şimdi bir otobüs: sürücü gaza <b>gittikçe daha çok</b> basıyor. İvme artıyor.", yap: (api) => api.sur("artan") },
      { s: "Hız grafiği artık doğru değil, <b>eğri</b>: gittikçe dikleşiyor. İvme grafiği yükseliyor." },
      { soru: "Hız–zaman grafiği eğriyse ne diyebiliriz?", secenekler: ["Araç geri gidiyor", "İvme değişiyor", "Hız sabit"], dogru: 1,
        aciklama: "Eğim = ivme. Eğri bir çizgide eğim her noktada farklıdır, yani ivme değişiyor.", ipucu: "Eğim her noktada aynı mı?" },
      { s: "Son durum: sürücü gazı <b>yavaş yavaş bırakıyor</b>. İvme azalıyor: eğri gittikçe yatıklaşıyor ama hız hâlâ artıyor.", yap: (api) => api.sur("azalan") },
      { soru: "İvme azalırken hız ne yapar?", secenekler: ["Azalır", "Artmaya devam eder, ama daha yavaş artar", "Sabit kalır"], dogru: 1,
        aciklama: "İvme hâlâ artı: hız artmaya devam eder. Sadece artış hızı küçülür.", ipucu: "İvme azalıyor ama sıfırın üstünde. Artı ivme hıza ne yapar?" },
      { s: "Kural: <b>Doğru = sabit ivme. Eğri = değişken ivme.</b> Bu ünitedeki hesaplar sabit ivme içindir." },
      { s: "Şimdi sen: üstteki üç karttan istenenleri seç." },
    ],
    anlatBitti: (api) => api.baslat(),
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Değerlendirme: yazılı tipi sorular",
    anlatim: `
      <p>Sekiz soru. Hepsi grafik okuma, çizme ya da dönüştürme üzerine; yazılıdaki açık uçlu soruların kısa cevaplı hâlleri.</p>
      <p>En az <b>6 doğru</b> ile dersi tamamlarsın. Her sorudan sonra açıklamayı mutlaka oku.</p>`,
    gorev: "Değerlendirmede en az <b>6/8</b> doğru yap.",
    ogretmen: "Sorular OYSS 1. dönem yazılı senaryolarındaki beceri dağılımına göre seçildi: hız–zaman'dan konum çizme, alan, ivme işareti, hareket türü. Yanlış cevaplanan sorunun adımına geri dönülebilir.",
    anlat: [
      { s: "Sekiz soruluk değerlendirme. Grafik okuma, çizme ve dönüştürme." },
      { s: "En az <b>6 doğru</b> ile dersi bitirirsin. Her sorudan sonra açıklamayı oku." },
    ],
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(0, { uzaklik: 40 });
      const cizgiGrafik = (ayar, noktalar, renk) => (kap) => { const g = new Grafik(kap, ayar); g.seri("s", { renk, kalinlik: 3 }).ayarla(noktalar); };
      ctx.sinav([
        {
          tur: "coktan", metin: "Konum–zaman grafiği verilen araç için hangisi <b>doğrudur</b>?",
          grafik: cizgiGrafik(xtGrafigi(8, { min: 0, max: 50, otomatik: false }), [[0, 10], [3, 40], [5, 40], [8, 10]], RENK_X),
          siklar: ["3–5 s arasında sabit hızla gidiyor", "3–5 s arasında duruyor, 5–8 s arasında geri dönüyor", "5–8 s arasında yavaşlıyor", "Araç hiç durmuyor"],
          dogru: 1, aciklama: "Konum grafiğinde yatay çizgi = duruyor (konum 40 m'de sabit). 5–8 s arasında konum azalıyor: araç geri (− yönde) gidiyor; sabit −10 m/s ile.",
        },
        {
          tur: "sayi", metin: "Konum–zaman grafiğindeki aracın <b>5–8 s</b> aralığındaki hızı kaç m/s'dir? (İşaretiyle.)",
          grafik: cizgiGrafik(xtGrafigi(8, { min: 0, max: 50, otomatik: false }), [[0, 10], [3, 40], [5, 40], [8, 10]], RENK_X),
          dogru: -10, tolerans: 0.2, birim: "m/s",
          aciklama: "v = Δx/Δt = (10 − 40)/(8 − 5) = −30/3 = −10 m/s. Aşağı inen çizgi: hız negatif.",
        },
        {
          tur: "coktan", metin: "Hız–zaman grafiğinde çizgi <b>sıfırın üstünde ve yatay</b>. Araç ne yapıyor?",
          grafik: cizgiGrafik(vtGrafigi(6, { min: 0, max: 15, otomatik: false }), [[0, 8], [6, 8]], RENK_V),
          siklar: ["Duruyor", "Sabit hızla gidiyor", "Sabit ivmeyle hızlanıyor", "Yavaşlıyor"],
          dogru: 1, aciklama: "Hız grafiğinde yükseklik hızdır. 8 m/s'de sabit: araç sabit hızla gidiyor. Durmak için çizginin sıfıra oturması gerekir.",
        },
        {
          tur: "sayi", metin: "Hız–zaman grafiği verilen aracın <b>0–8 s</b> arasındaki <b>yer değiştirmesi</b> kaç metredir?",
          grafik: cizgiGrafik(vtGrafigi(8, { min: -10, max: 15, otomatik: false }), [[0, 10], [4, 10], [6, -6], [8, -6]], RENK_V),
          dogru: 32, tolerans: 1, birim: "m",
          aciklama: "0–4 s: 10 · 4 = 40 m. 4–6 s: yamuk, işaretli hızlarla (10 + (−6))/2 · 2 = +4 m (üstteki üçgen +6,25, alttaki −2,25). 6–8 s: −6 · 2 = −12 m. Toplam 40 + 4 − 12 = 32 m.",
        },
        {
          tur: "coktan", metin: "Batıya (−) doğru giden bir aracın hızı <b>−4 m/s'den −12 m/s'ye</b> değişiyor. Hareket türü ve ivmenin yönü nedir?",
          siklar: ["Yavaşlıyor, ivme doğuya", "Yavaşlıyor, ivme batıya", "Hızlanıyor, ivme batıya", "Hızlanıyor, ivme doğuya"],
          dogru: 2, aciklama: "Sürat 4'ten 12'ye çıkıyor: hızlanıyor. Δv = −12 − (−4) = −8: ivme batıya (−). Hız ve ivme aynı yönde olduğu için hızlanır.",
        },
        {
          tur: "coktan", metin: "Hız–zaman grafiği verilen hareketin <b>konum–zaman</b> grafiği nasıldır?",
          grafik: cizgiGrafik(vtGrafigi(6, { min: 0, max: 15, otomatik: false }), [[0, 12], [6, 0]], RENK_V),
          siklar: ["Artan, gittikçe yatıklaşan eğri", "Azalan, gittikçe dikleşen eğri", "Artan düz doğru", "Önce artan sonra azalan eğri"],
          dogru: 0, aciklama: "Hız hep artı: konum artar. Hız küçüldüğü için eğim azalır: eğri yatıklaşır ve 6. saniyede düzleşir. Hız hiç eksiye geçmediği için konum azalmaz.",
        },
        {
          tur: "coktan", metin: "İvme–zaman grafiği verilen, duruştan kalkan aracın <b>hız–zaman</b> grafiği nasıldır?",
          grafik: cizgiGrafik(atGrafigi(6, { min: -3, max: 3 }), [[0, 2], [3, 2], [3, 0], [6, 0]], RENK_A),
          siklar: ["0–3 s yatay, 3–6 s artan", "0–3 s artan doğru, 3–6 s yatay", "Hep artan doğru", "0–3 s artan, 3–6 s azalan"],
          dogru: 1, aciklama: "İvme +2 iken hız 0'dan 6'ya düzgün artar (eğik doğru). İvme 0 olunca hız 6 m/s'de sabit kalır (yatay). İvmenin sıfır olması durmak değil, hızın değişmemesi demektir.",
        },
        {
          tur: "sayi", metin: "Hız–zaman grafiğindeki aracın <b>ivmesi</b> kaç m/s²'dir? (İşaretiyle.)",
          grafik: cizgiGrafik(vtGrafigi(4, { min: 0, max: 30, otomatik: false }), [[0, 24], [4, 8]], RENK_V),
          dogru: -4, tolerans: 0.1, birim: "m/s²",
          aciklama: "a = Δv/Δt = (8 − 24)/4 = −16/4 = −4 m/s². Hız artı, ivme eksi: araç yavaşlıyor.",
        },
      ], { baslik: "Grafik atölyesi", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: yolSahnesi });
