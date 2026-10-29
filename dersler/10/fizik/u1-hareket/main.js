// 10. Sınıf Fizik · 1. Ünite: Kuvvet ve Hareket
// FİZ.10.1.1 sabit hızlı hareket · FİZ.10.1.2 ivme ve hız değişimi · FİZ.10.1.3 sabit ivmeli hareket grafikleri
import { dersBaslat, sayi, el, Grafik } from "../../../../engine/ders.js";
import { yolSahnesi, kosu } from "./sahne.js";
import { parcali, surucuModeli } from "./fizik.js";

const RENK_A = "#ff8a3d", RENK_B = "#3d9bff", RENK_SOLUK = "rgba(169,182,201,.55)";
const sec = (dizi) => dizi[Math.floor(Math.random() * dizi.length)];
const karistir = (dizi) => dizi.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

function hud(ctx, liste) {
  const kap = el("div", { class: "d-etiket-hud" });
  ctx.katman.append(kap);
  return ctx.gostergeler(liste, kap);
}

const xtGrafigi = (tMax, y = { min: -20, max: 100 }) =>
  ({ baslik: "Konum – zaman", x: { etiket: "t (s)", min: 0, max: tMax }, y: { etiket: "x (m)", otomatik: true, ...y } });
const vtGrafigi = (tMax, y = { min: -10, max: 20 }) =>
  ({ baslik: "Hız – zaman", x: { etiket: "t (s)", min: 0, max: tMax }, y: { etiket: "v (m/s)", otomatik: true, ...y } });
const atGrafigi = (tMax) =>
  ({ baslik: "İvme – zaman", x: { etiket: "t (s)", min: 0, max: tMax }, y: { etiket: "a (m/s²)", min: -5, max: 5 } });

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Konum, yer değiştirme, alınan yol",
    cikti: "FİZ.10.1.1-a",
    anlatim: `
      <p>Yolun kenarındaki işaretler bir <b>sayı doğrusu</b> gibidir: <b>0 m</b> başlangıç noktası, doğu (sağ) yönü <b>+</b>, batı (sol) yönü <b>−</b> kabul edilir.</p>
      <p><b>Konum (x)</b>, aracın başlangıç noktasına göre nerede olduğunu söyler.
      <b>Yer değiştirme (Δx)</b> ilk konumdan son konuma çizilen oktur: <span class="formul">Δx = x<sub>son</sub> − x<sub>ilk</sub></span>.
      <b>Alınan yol</b> ise aracın gerçekte katettiği toplam mesafedir.</p>
      <p>Mavi ok yer değiştirmeyi gösterir. Aracı ileri ve geri sürüp üç büyüklüğü karşılaştır.</p>`,
    gorev: "Alınan yolun, yer değiştirmenin büyüklüğünden <b>farklı</b> olduğu bir hareket yap.",
    ogretmen: "Program, konum, yer değiştirme ve hızın bilindiğini kabul eder (Temel Kabuller). Bu adım ön değerlendirme ve köprü kurma için kullanılabilir: öğrencilere önce tahmin ettirip sonra sürdürün.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      let bas = 20, x = 20, yol = 0, k = null;
      S.A.yerlestir(x);
      S.kameraya(30, { uzaklik: 42 });
      const g = ctx.gostergeler([
        { ad: "bas", etiket: "İlk konum", birim: "m", ondalik: 0 },
        { ad: "x", etiket: "Son konum", birim: "m", ondalik: 0 },
        { ad: "dx", etiket: "Yer değiştirme Δx", birim: "m", ondalik: 0 },
        { ad: "yol", etiket: "Alınan yol", birim: "m", ondalik: 0 },
      ]);
      const yaz = () => {
        g.ayarla("bas", bas); g.ayarla("x", x); g.ayarla("dx", x - bas); g.ayarla("yol", yol);
        S.yerDegistirme(bas, x);
      };
      const hedef = ctx.kaydirici({ etiket: "Hedef konum", min: -40, max: 120, adim: 5, deger: 70, birim: "m" });
      ctx.dugmeler([
        { metin: "▶ Hedefe sür", ana: true, tik: () => sur(hedef.deger) },
        { metin: "↺ İlk konumu buraya al", tik: () => { bas = x; yol = 0; yaz(); } },
      ]);
      ctx.not("<p>İpucu: Önce 70 m'ye, sonra 40 m'ye sür. Yer değiştirme ve alınan yol neden farklı çıktı?</p>");
      yaz();

      // gosterim: anlatımdaki örnek sürüş görevi tamamlatmaz
      function sur(h, { gosterim = false } = {}) {
        k?.durdur();
        const x0 = x, yon = Math.sign(h - x0), V = 12;
        if (!yon) return Promise.resolve();
        return new Promise((coz) => {
          k = kosu(S, {
            sure: Math.abs(h - x0) / V,
            kare: (t) => {
              const yeni = x0 + yon * V * t;
              yol += Math.abs(yeni - x); x = yeni;
              S.A.yerlestir(x); S.A.oklar({ v: yon * V }); S.takip(x); yaz();
            },
            bitti: () => {
              x = h; S.A.yerlestir(x); S.A.oklar(); yaz();
              if (!gosterim && yol - Math.abs(x - bas) > 1) ctx.gorevTamam();
              coz();
            },
          });
        });
      }
      ctx.temizlik(() => k?.durdur());
      return {
        sur: (h) => sur(h, { gosterim: true }),
        yerlestir(v) { k?.durdur(); bas = x = v; yol = 0; S.A.yerlestir(v); S.A.oklar(); S.kameraya(v + 10, { uzaklik: 42 }); yaz(); },
      };
    },
    anlat: [
      { s: "Yolun kenarındaki işaretler bir <b>sayı doğrusu</b> gibidir. Başlangıç noktası <b>0 m</b>.", yap: (api) => api.yerlestir(0) },
      { s: "Sağa (doğuya) gidiş <b>+</b>, sola (batıya) gidiş <b>−</b> sayılır." },
      { s: "Şimdi araç <b>20 m</b> işaretinde. Bu, aracın <b>konumudur</b>: <b>x = 20 m</b>.", yap: (api) => api.yerlestir(20) },
      { soru: "Araç 50 m işaretine gelirse konumu ne olur?", secenekler: ["30 m", "50 m", "70 m"], dogru: 1,
        aciklama: "Konum, aracın 0 noktasına göre nerede olduğudur: x = 50 m.", ipucu: "Konum, işarette yazan sayıdır." },
      { s: "Aracı 20 m'den <b>70 m</b>'ye sürelim. İzle…", yap: (api) => api.sur(70) },
      { s: "Mavi ok <b>ilk konumdan son konuma</b> çizildi. Buna <b>yer değiştirme</b> denir." },
      { formul: [["Δx", "yer değiştirme"], ["="], ["x<sub>son</sub>", "son konum"], ["−"], ["x<sub>ilk</sub>", "ilk konum"]],
        s: "Δ (delta) “değişim” demektir.", oku: "Delta x eşittir son konum eksi ilk konum. Delta, değişim demektir." },
      { cozum: ["İlk konum: x<sub>ilk</sub> = 20 m", "Son konum: x<sub>son</sub> = 70 m", "Δx = 70 − 20", "Δx = 50 m (doğuya)"] },
      { s: "Şimdi araç geri dönüp <b>40 m</b>'ye gitsin.", yap: (api) => api.sur(40) },
      { soru: "Araç 20 → 70 → 40 gitti. Toplam kaç metre yol aldı?", secenekler: ["20 m", "50 m", "80 m"], dogru: 2,
        aciklama: "50 m gitti, 30 m geri döndü: 50 + 30 = 80 m. Buna <b>alınan yol</b> denir.", ipucu: "Gidişi ve dönüşü ayrı ayrı topla." },
      { soru: "Peki yer değiştirme kaç metre?", secenekler: ["20 m", "50 m", "80 m"], dogru: 0,
        aciklama: "Δx = 40 − 20 = 20 m. Yer değiştirme yalnızca başlangıca ve sona bakar.", ipucu: "Sadece ilk ve son konumu kullan." },
      { s: "Kısacası: <b>alınan yol</b> gidilen her metreyi sayar. <b>Yer değiştirme</b> yalnızca nereden nereye gittiğine bakar." },
    ],
    anlatBitti: (api) => api.yerlestir(20),
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Sabit hızla hareket: ölç ve kaydet",
    cikti: "FİZ.10.1.1-a",
    anlatim: `
      <p>Araç sabit hızla gidiyor. Her saniye yola bir <b>zaman izi</b> bırakıyor ve konumu tabloya yazılıyor.</p>
      <p>İzler arasındaki mesafelere ve tablodaki “1 s'de alınan yol” sütununa dikkat et. Hız değişince ne değişiyor, ne aynı kalıyor?</p>
      <p>Negatif hız verirsen araç batıya (− yön) gider.</p>`,
    gorev: "Aracı en az <b>iki farklı hızla</b> (0 hariç) sür ve ölçümlerini karşılaştır.",
    ogretmen: "Programda öğrencilerin deney tasarlaması ya da simülasyon kullanması, tekrarlanan sistematik ölçümler yapıp konum-zaman grafiği çizmesi öneriliyor. Gruplara farklı hızlar verip tablolarını tahtada karşılaştırtabilirsiniz.",
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(20, { uzaklik: 46 });
      const denenen = new Set();
      let k = null;
      const h = hud(ctx, [
        { ad: "t", etiket: "Zaman", birim: "s" },
        { ad: "x", etiket: "Konum", birim: "m" },
        { ad: "v", etiket: "Hız", birim: "m/s" },
      ]);
      const [gxt] = ctx.grafikler([xtGrafigi(10, { min: -100, max: 200, otomatik: false })]);
      const onceki = gxt.seri("onceki", { renk: RENK_SOLUK, kesikli: true, kalinlik: 2 });
      const simdi = gxt.seri("simdi", { renk: RENK_A, nokta: true });

      const vK = ctx.kaydirici({ etiket: "Hız (v)", min: -10, max: 20, adim: 1, deger: 8, birim: "m/s" });
      const [baslatBtn] = ctx.dugmeler([{ metin: "▶ Başlat", ana: true, tik: () => baslat() }]);
      const tablo = ctx.tablo(["t (s)", "x (m)", "1 s'de alınan yol (m)"]);

      // Anlatımdaki gösterim sürüşleri görev sayılmaz
      let gosterim = false;
      function baslat(hiz) {
        k?.durdur();
        gosterim = hiz != null;
        const v = hiz ?? vK.deger;
        if (simdi.noktalar.length) onceki.ayarla(simdi.noktalar);
        simdi.temizle(); tablo.temizle(); S.izleriTemizle();
        baslatBtn.disabled = true; vK.etkin(false);
        let sonX = 0;
        k = kosu(S, {
          sure: 10,
          kare: (t) => {
            const x = v * t;
            S.A.yerlestir(x); S.A.oklar({ v }); S.takip(x);
            h.ayarla("t", t); h.ayarla("x", x); h.ayarla("v", v);
          },
          saniye: (n) => {
            const x = v * n;
            simdi.ekle(n, x);
            S.izBirak("A", x, `${n} s`);
            tablo.satirEkle([n, sayi(x, 0), n ? sayi(Math.abs(x - sonX), 0) : "—"]);
            sonX = x;
          },
          bitti: () => {
            baslatBtn.disabled = false; vK.etkin(true); S.A.oklar();
            if (gosterim) return;
            if (v !== 0) denenen.add(v);
            if (denenen.size >= 2) ctx.gorevTamam();
          },
        });
      }
      ctx.temizlik(() => k?.durdur());
      return {
        sur: (v) => baslat(v),
        sifirla() { k?.durdur(); simdi.temizle(); onceki.temizle(); tablo.temizle(); S.izleriTemizle(); S.A.yerlestir(0); S.A.oklar(); baslatBtn.disabled = false; vK.etkin(true); },
      };
    },
    anlat: [
      { s: "Bu araç <b>sabit hızla</b> gidecek: hızı hiç değişmeyecek." },
      { s: "Her saniyenin sonunda yola bir <b>zaman izi</b> bırakacak. İzle…", yap: (api) => api.sur(5) },
      { soru: "İzlerin arası nasıl?", secenekler: ["Gittikçe açılıyor", "Hep aynı", "Gittikçe daralıyor"], dogru: 1,
        aciklama: "Araç her saniye <b>5 m</b> gitti. Sabit hızda, eşit sürelerde eşit yol alınır.", ipucu: "Tablodaki son sütuna bak." },
      { s: "Bir saniyede alınan yola <b>hız</b> diyoruz. Bu aracın hızı <b>5 m/s</b> (“metre bölü saniye”)." },
      { s: "Şimdi hızı iki katına çıkaralım: <b>10 m/s</b>.", yap: (api) => api.sur(10) },
      { soru: "İzlerin arası şimdi kaç metre?", secenekler: ["5 m", "10 m", "20 m"], dogru: 1,
        aciklama: "Hız 10 m/s ise araç her saniye 10 m gider. İzler iki kat seyrekleşti." },
      { s: "Grafiğe bak: kesikli çizgi 5 m/s, yeni çizgi 10 m/s. <b>Hız arttıkça çizgi dikleşir.</b>" },
    ],
    anlatBitti: (api) => api.sifirla(),
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Grafikten matematiksel modele",
    cikti: "FİZ.10.1.1-b",
    anlatim: `
      <p>Bu sefer aracın hızını <b>bilmiyorsun</b>. Sadece konum–zaman grafiği var.</p>
      <p>Grafiğin üzerinde <b>sürükle</b>: turuncu üçgen, iki an arasındaki <b>Δx</b> ve <b>Δt</b> değerlerini gösterir.
      Sabit hızlı harekette konum–zaman grafiğinin <b>eğimi hızı</b> verir: <span class="formul">v = Δx / Δt</span>.</p>
      <p>Hızı bulduğunda hız–zaman grafiği açılacak. Orada da <b>grafiğin altında kalan alanın</b> neyi verdiğini keşfet.</p>`,
    gorev: "Konum–zaman grafiğinden aracın <b>hızını</b> bul.",
    ogretmen: "Programın öğrenme-öğretme uygulamasında grafiklerin altında kalan alan ve eğim hesaplamalarına soru-cevap ile odaklanılması öneriliyor. Öğrencilere bulduklarını x = x₀ + v·t modeline taşıtın.",
    anlat: [
      { s: "Geçen adımda hızı biliyorduk. Şimdi <b>bilmiyoruz</b>; elimizde yalnızca konum–zaman grafiği var." },
      { s: "Grafikten iki an seçelim. Aradaki süreye <b>Δt</b>, konumdaki farka <b>Δx</b> diyelim." },
      { formul: [["v", "hız"], ["="], ["Δx", "ne kadar gitti"], ["/"], ["Δt", "ne kadar sürede"]],
        s: "Hız = gidilen yol ÷ geçen süre.", oku: "v eşittir delta x bölü delta t. Hız, gidilen yolun geçen süreye bölümüdür." },
      { cozum: ["2. saniyede x = 20 m, 6. saniyede x = 60 m olsun.", "Δx = 60 − 20 = 40 m", "Δt = 6 − 2 = 4 s", "v = 40 ÷ 4 = 10 m/s"] },
      { soru: "Bir araç 3 saniyede 45 m gittiyse hızı kaçtır?", secenekler: ["5 m/s", "15 m/s", "135 m/s"], dogru: 1,
        aciklama: "v = 45 ÷ 3 = 15 m/s.", ipucu: "Yolu süreye böl." },
      { s: "Grafikte bu oran çizginin <b>eğimidir</b>. Çizgi ne kadar dikse araç o kadar hızlıdır." },
      { s: "Şimdi sıra sende: grafik üzerinde sürükleyerek Δx ve Δt'yi oku, hızı bul." },
    ],
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      let v, x0, k = null, cozuldu = false;
      const [gxt, gvt] = ctx.grafikler([xtGrafigi(8, { min: 0, max: 100 }), vtGrafigi(8, { min: 0, max: 20 })]);
      const sxt = gxt.seri("x", { renk: RENK_A });
      const svt = gvt.seri("v", { renk: "#5ad38b" });
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "x", etiket: "Konum", birim: "m" }, { ad: "v", etiket: "Hız", birim: "" }]);
      const model = el("div", { class: "d-anlatim" });

      ctx.dugmeler([{ metin: "▶ Arabayı izle", ana: true, tik: izle }, { metin: "↻ Yeni araba", tik: yeni }]);
      const soru = ctx.sayiSorusu({
        etiket: "Grafiğe göre aracın hızı kaç m/s?", birim: "m/s",
        kontrol: (c) => {
          if (Math.abs(c - v) < 0.3) { coz(); return true; }
          if (Math.abs(c + v) < 0.3) return "İşaretine dikkat et: araç hangi yönde gidiyor?";
          if (Math.abs(c - (x0 + v * 8) / 8) < 0.3 && x0) return "Δx'i bulurken ilk konumu çıkarmayı unutma.";
          return "Eğimi tekrar hesapla: Δx / Δt.";
        },
        dogruMesaj: "Doğru! Şimdi hız–zaman grafiğini incele.",
      });
      ctx.kontroller.append(model);

      function yeni() {
        k?.durdur();
        v = sec([6, 8, 10, 12, 14, 16]); x0 = sec([0, 10, 20]);
        cozuldu = false;
        sxt.temizle(); svt.temizle(); gxt.ucgenTemizle(); gvt.golgeTemizle(); gxt.dikey(null); gvt.dikey(null);
        gvt.not([{ x: 0.3, y: 10, metin: "Önce hızı bul…", renk: RENK_SOLUK }]);
        gxt.eksenAyarla({ y: { min: 0, max: Math.max(100, x0 + v * 8 + 10) } });
        soru.girdi.value = ""; soru.geri.textContent = "";
        model.innerHTML = "";
        h.ayarla("v", "?");
        S.izleriTemizle(); S.A.yerlestir(x0); S.kameraya(x0 + 30, { uzaklik: 50 });
        izle();
      }
      function izle() {
        k?.durdur();
        sxt.temizle(); S.izleriTemizle();
        k = kosu(S, {
          sure: 8,
          kare: (t) => {
            const x = x0 + v * t;
            sxt.ekle(t, x);
            S.A.yerlestir(x); S.A.oklar({ v: cozuldu ? v : null }); S.takip(x);
            h.ayarla("t", t); h.ayarla("x", x);
          },
          saniye: (n) => S.izBirak("A", x0 + v * n, `${n} s`),
          bitti: () => surukle(5),
        });
      }
      function surukle(t) {
        const tt = Math.round(t * 2) / 2 || 0.5;
        gxt.egimUcgeni(0, x0, tt, x0 + v * tt, { xEtiket: "Δt", yEtiket: "Δx" });
        gxt.dikey(tt);
        if (cozuldu) {
          gvt.golge(svt, 0, tt);
          gvt.dikey(tt);
          gvt.not([{ x: tt / 2, y: v / 2, metin: `Alan = ${v}·${sayi(tt)} = ${sayi(v * tt)} m`, hiza: "center", dx: 0, dy: 0, renk: "#ffd28a" }]);
        }
      }
      function coz() {
        cozuldu = true;
        h.ayarla("v", `${v} m/s`);
        gvt.not([]);
        const n = []; for (let t = 0; t <= 8; t += 0.5) n.push([t, v]);
        svt.ayarla(n);
        surukle(5);
        model.innerHTML = `<p>Eğim her yerde aynı: hız sabit. Hız–zaman grafiğinde altta kalan alan = <b>v·Δt = Δx</b>, yani yer değiştirme.</p>
          <p>Bu aracın matematiksel modeli: <span class="formul">x = ${x0} + ${v}·t</span></p>
          <p>Genel olarak: <span class="formul">x = x₀ + v·t</span></p>`;
        ctx.gorevTamam();
      }
      gxt.surukle(surukle);
      gvt.surukle((t) => cozuldu && surukle(t));
      yeni();
      ctx.temizlik(() => k?.durdur());
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Genelleme: iki araç, bir buluşma",
    cikti: "FİZ.10.1.1-c",
    anlatim: `
      <p>Turuncu araç <b>0 m</b>'den, mavi araç <b>150 m</b>'den yola çıkıyor. Her ikisi de sabit hızla gidiyor.</p>
      <p>Her araç için <span class="formul">x = x₀ + v·t</span> modelini yaz. Yan yana geldikleri anda konumları eşittir:
      <span class="formul">0 + v<sub>A</sub>·t = 150 + v<sub>B</sub>·t</span></p>
      <p>Mavi araç batıya giderse <b>hızı negatif</b>, <b>sürati</b> ise pozitiftir. Sürat yön içermez.</p>`,
    gorev: "Hızları öyle ayarla ki iki araç tam <b>6. saniyede</b> yan yana gelsin (±0,2 s).",
    ogretmen: "Öğrencilerden önce kâğıt üzerinde v_A − v_B = 25 m/s ilişkisini bulmalarını isteyin. Farklı grupların farklı (v_A, v_B) çiftleri bulması, modelin genellenmesi için iyi bir tartışma zemini oluşturur.",
    anlat: [
      { s: "Aynı yolda iki araç var. Turuncu <b>0 m</b>'de, mavi <b>150 m</b>'de." },
      { s: "Sabit hızda bir aracın nerede olacağını bulmanın kuralı: <b>başladığın yer + hız × süre</b>." },
      { formul: [["x", "t anındaki konum"], ["="], ["x₀", "başlangıç konumu"], ["+"], ["v·t", "hız × süre"]],
        oku: "x eşittir x sıfır artı v çarpı t. Şimdiki konum, başlangıç konumu artı hız çarpı süredir." },
      { cozum: ["Turuncu araç: x₀ = 0 m, v = 10 m/s", "3. saniyede: x = 0 + 10 · 3", "x = 30 m"] },
      { soru: "Mavi araç 150 m'den batıya −5 m/s ile gidiyor. 2. saniyede nerede olur?", secenekler: ["140 m", "150 m", "160 m"], dogru: 0,
        aciklama: "x = 150 + (−5) · 2 = 150 − 10 = 140 m. Batıya gittiği için konumu azalır.", ipucu: "Hız negatif: konum azalır." },
      { s: "Batıya giden aracın <b>hızı negatiftir</b>, ama <b>sürati</b> (hızın büyüklüğü) pozitiftir: 5 m/s." },
      { s: "İki araç yan yana geldiğinde <b>konumları eşittir</b>. Şimdi hızları ayarlayıp bunu 6. saniyede yakala." },
    ],
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      const XB = 150;
      S.B.grup.visible = true; S.B.yerlestir(XB);
      S.kameraya(75, { uzaklik: 95 });
      let k = null;
      const [gxt] = ctx.grafikler([xtGrafigi(12, { min: -50, max: 200 })]);
      const sa = gxt.seri("A", { renk: RENK_A }), sb = gxt.seri("B", { renk: RENK_B });
      const vA = ctx.kaydirici({ etiket: "Turuncu aracın hızı (v_A)", min: 0, max: 25, adim: 1, deger: 10, birim: "m/s" });
      const vB = ctx.kaydirici({ etiket: "Mavi aracın hızı (v_B)", min: -25, max: 10, adim: 1, deger: -5, birim: "m/s" });
      const [btn] = ctx.dugmeler([{ metin: "▶ Başlat", ana: true, tik: baslat }]);
      const g = ctx.gostergeler([
        { ad: "sB", etiket: "Mavi aracın sürati", birim: "m/s", ondalik: 0 },
        { ad: "tm", etiket: "Buluşma anı", birim: "s", ondalik: 2 },
        { ad: "xm", etiket: "Buluşma konumu", birim: "m", ondalik: 1 },
      ]);
      const guncelle = () => g.ayarla("sB", Math.abs(vB.deger));
      vB.el.querySelector("input").addEventListener("input", guncelle);
      guncelle();

      function baslat() {
        k?.durdur();
        const a = vA.deger, b = vB.deger;
        const tm = a > b ? XB / (a - b) : Infinity;
        sa.temizle(); sb.temizle(); gxt.not([]); S.izleriTemizle();
        g.ayarla("tm", "—"); g.ayarla("xm", "—");
        btn.disabled = true;
        const sure = Math.min(12, Number.isFinite(tm) ? tm + 2 : 12);
        let isaretlendi = false;
        k = kosu(S, {
          sure,
          kare: (t) => {
            const xa = a * t, xb = XB + b * t;
            S.A.yerlestir(xa); S.B.yerlestir(xb);
            S.A.oklar({ v: a }); S.B.oklar({ v: b });
            S.takip((xa + xb) / 2);
            sa.ekle(t, xa); sb.ekle(t, xb);
            if (!isaretlendi && t >= tm) {
              isaretlendi = true;
              g.ayarla("tm", tm); g.ayarla("xm", a * tm);
              gxt.not([{ x: tm, y: a * tm, metin: `buluşma: t = ${sayi(tm, 2)} s`, renk: "#ffd28a" }]);
            }
          },
          saniye: (n) => { S.izBirak("A", a * n); S.izBirak("B", XB + b * n); },
          bitti: () => {
            btn.disabled = false; S.A.oklar(); S.B.oklar();
            if (!Number.isFinite(tm)) g.ayarla("tm", "Buluşmuyorlar");
            if (Math.abs(tm - 6) <= 0.2) ctx.gorevTamam();
          },
        });
      }
      ctx.temizlik(() => k?.durdur());
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "İvme: hız nasıl değişiyor?",
    cikti: "FİZ.10.1.2",
    anlatim: `
      <p>Hız değişiyorsa bir <b>ivme</b> vardır. İvme, birim zamandaki hız değişimidir:
      <span class="formul">a = Δv / Δt</span></p>
      <p>Dört günlük hayat durumu hazırladık. Her birinde araç çalışmadan önce <b>iddianı</b> seç: ivme hangi yönde?</p>
      <p>Sonra yeşil hız okunu ve turuncu ivme okunu izle, tablodaki <b>Δv</b> değerlerini incele. Hız ve ivme <b>aynı yönde</b> olduğunda ne oluyor? <b>Zıt yönde</b> olduğunda?</p>`,
    gorev: "Dört senaryonun hepsinde ivmenin yönünü <b>doğru tahmin et</b>.",
    ogretmen: "Program bu çıktı için hazır veri seti verilmesini, öğrencilerin ivmenin yönü ve büyüklüğü hakkında iddia ortaya koyup veriye dayalı tartışmasını öneriyor. İddiaları önce sınıfta oylatıp sonra simülasyonla sınayabilirsiniz.",
    anlat: [
      { s: "Şimdiye kadar hız hiç değişmedi. Gerçek hayatta ise araçlar <b>hızlanır</b> ve <b>yavaşlar</b>." },
      { s: "Hızdaki değişime <b>Δv</b> diyelim. Araç 0'dan 12 m/s'ye çıktıysa Δv = 12 m/s." },
      { formul: [["a", "ivme"], ["="], ["Δv", "hızdaki değişim"], ["/"], ["Δt", "geçen süre"]],
        s: "İvme şunu söyler: hız <b>her saniye</b> ne kadar değişiyor?", oku: "a eşittir delta v bölü delta t. İvme, hızın her saniye ne kadar değiştiğini söyler." },
      { cozum: ["Yeşil yandı; araç 4 saniyede 0'dan 12 m/s'ye çıktı.", "Δv = 12 − 0 = 12 m/s", "Δt = 4 s", "a = 12 ÷ 4 = 3 m/s² → hız her saniye 3 m/s artıyor"] },
      { soru: "Fren: hız 2 saniyede 10 m/s'den 4 m/s'ye düştü. Δv kaçtır?", secenekler: ["+6 m/s", "−6 m/s", "−14 m/s"], dogru: 1,
        aciklama: "Δv = son − ilk = 4 − 10 = −6 m/s. Eksi işaret, hızın azaldığını gösterir.", ipucu: "Δv = son hız − ilk hız." },
      { s: "Kural: hız ve ivme <b>aynı yöndeyse</b> araç hızlanır; <b>zıt yöndeyse</b> yavaşlar." },
      { s: "Şimdi dört günlük durumda ivmenin yönünü tahmin et. Yeşil ok hızı, turuncu ok ivmeyi gösterecek." },
    ],
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      const SEN = [
        { ad: "Yeşil yandı: kalkış", x0: 0, v0: 0, a: 2.5, sure: 6 },
        { ad: "Kırmızı ışık: fren", x0: 0, v0: 15, a: -2.5, sure: 6 },
        { ad: "Geri vitesle kalkış", x0: 40, v0: 0, a: -1.5, sure: 5 },
        { ad: "Geri giderken durma", x0: 60, v0: -8, a: 2, sure: 4 },
      ];
      const bilinen = new Set();
      let k = null, iddia = null;
      const [gvt] = ctx.grafikler([vtGrafigi(6, { min: -16, max: 16, otomatik: false })]);
      const sv = gvt.seri("v", { renk: "#5ad38b", nokta: true });
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "v", etiket: "Hız", birim: "m/s" }, { ad: "a", etiket: "İvme", birim: "" }]);

      const senaryo = ctx.secenekler({ etiket: "Senaryo", liste: SEN.map((s, i) => ({ deger: i, metin: s.ad })), deger: 0, degisti: hazirla });
      const iddiaSec = ctx.secenekler({
        etiket: "İddian: ivme hangi yönde?",
        liste: [{ deger: 1, metin: "+ yönde (doğu)" }, { deger: -1, metin: "− yönde (batı)" }, { deger: 0, metin: "İvme yok" }],
        deger: null,
        degisti: (v) => { iddia = v; btn.disabled = false; },
      });
      const [btn] = ctx.dugmeler([{ metin: "▶ Çalıştır", ana: true, tik: calistir }]);
      const sonuc = el("div", { class: "d-geri-bildirim" });
      const durum = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(sonuc);
      const tablo = ctx.tablo(["t (s)", "v (m/s)", "Δv (m/s)"]);
      ctx.kontroller.append(durum);

      function hazirla() {
        k?.durdur();
        const s = SEN[senaryo.deger];
        iddia = null; iddiaSec.deger = null; iddiaSec.etkin(true); btn.disabled = true;
        sv.temizle(); tablo.temizle(); S.izleriTemizle(); sonuc.textContent = "";
        S.A.yerlestir(s.x0); S.A.oklar({ v: s.v0 }); S.kameraya(s.x0 + 10, { uzaklik: 42 });
        h.ayarla("t", 0); h.ayarla("v", s.v0); h.ayarla("a", "?");
        durum.textContent = `Doğru tahmin: ${bilinen.size}/4 senaryo`;
      }
      function calistir() {
        const s = SEN[senaryo.deger];
        const f = parcali(s.x0, s.v0, [{ sure: s.sure, a: s.a }]);
        btn.disabled = true; iddiaSec.etkin(false);
        sv.temizle(); tablo.temizle(); S.izleriTemizle();
        let sonV = s.v0;
        k = kosu(S, {
          sure: s.sure,
          kare: (t) => {
            const { x, v } = f(t);
            S.A.yerlestir(x); S.A.oklar({ v, a: s.a }); S.takip(x);
            S.A.stopLambasi(Math.sign(v) !== Math.sign(s.a) && Math.abs(v) > 0.1 && s.v0 !== 0);
            h.ayarla("t", t); h.ayarla("v", v);
          },
          saniye: (n) => {
            const { x, v } = f(n);
            sv.ekle(n, v);
            S.izBirak("A", x, `${n} s`);
            tablo.satirEkle([n, sayi(v), n ? sayi(v - sonV) : "—"]);
            sonV = v;
          },
          bitti: () => {
            S.A.stopLambasi(false);
            h.ayarla("a", `${sayi(s.a)} m/s²`);
            const dogru = iddia === Math.sign(s.a);
            const hizlaniyor = Math.sign(s.v0 + s.a) === Math.sign(s.a) && s.v0 * s.a >= 0;
            sonuc.className = `d-geri-bildirim ${dogru ? "dogru" : "yanlis"}`;
            sonuc.innerHTML = `${dogru ? "İddian doğru!" : "İddian yanlış."} Her saniyede Δv = ${sayi(s.a)} m/s, yani a = ${sayi(s.a)} m/s².
              Hız ve ivme ${hizlaniyor ? "<b>aynı yönde</b> → araç <b>hızlanıyor</b>" : "<b>zıt yönde</b> → araç <b>yavaşlıyor</b>"}.`;
            if (dogru) bilinen.add(senaryo.deger);
            durum.textContent = `Doğru tahmin: ${bilinen.size}/4 senaryo`;
            if (bilinen.size === 4) ctx.gorevTamam();
            btn.disabled = false; iddiaSec.etkin(true);
          },
        });
      }
      hazirla();
      ctx.temizlik(() => k?.durdur());
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Sabit ivmeli hareketin grafikleri",
    cikti: "FİZ.10.1.3-a",
    anlatim: `
      <p>İlk hızı (<b>v₀</b>) ve ivmeyi (<b>a</b>) seç, aracı çalıştır. Üç grafik aynı anda çizilir.</p>
      <ul>
        <li><b>İvme–zaman:</b> sabit ivmede yatay bir doğru.</li>
        <li><b>Hız–zaman:</b> eğimi ivmeye eşit bir doğru: <span class="formul">v = v₀ + a·t</span></li>
        <li><b>Konum–zaman:</b> bir eğri (parabol): <span class="formul">x = v₀·t + ½·a·t²</span></li>
      </ul>
      <p>Yoldaki zaman izlerine bak: hızlanırken aralar açılıyor, yavaşlarken daralıyor.</p>`,
    gorev: "Konum–zaman grafiği <b>tepe yapan</b> (önce artıp sonra azalan) bir hareket oluştur.",
    ogretmen: "Konum–zaman grafiğinin tepe noktasında hızın sıfır olduğunu, hız–zaman grafiğinin zaman eksenini kestiği anla eşleştirmelerini isteyin.",
    anlat: [
      { s: "Sabit ivmeyle hızlanan bir aracın üç grafiği vardır: <b>ivme</b>, <b>hız</b> ve <b>konum</b>." },
      { s: "<b>İvme–zaman:</b> ivme değişmiyorsa yatay bir çizgidir." },
      { s: "<b>Hız–zaman:</b> hız her saniye aynı miktar artar. Bu yüzden eğik bir doğrudur." },
      { formul: [["v", "şimdiki hız"], ["="], ["v₀", "ilk hız"], ["+"], ["a·t", "ivme × süre"]],
        oku: "v eşittir v sıfır artı a çarpı t." },
      { soru: "İlk hız 2 m/s, ivme 3 m/s². 4. saniyede hız kaçtır?", secenekler: ["9 m/s", "12 m/s", "14 m/s"], dogru: 2,
        aciklama: "v = 2 + 3 · 4 = 2 + 12 = 14 m/s.", ipucu: "Önce 3 · 4'ü hesapla, sonra ilk hızı ekle." },
      { s: "<b>Konum–zaman:</b> araç hızlandıkça her saniye daha çok yol alır. Çizgi düz değil, <b>bükülür</b>." },
      { s: "Yoldaki zaman izlerine dikkat et: hızlanırken izlerin arası açılır, yavaşlarken daralır." },
    ],
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(20, { uzaklik: 50 });
      let k = null;
      const T = 8;
      const [gxt, gvt, gat] = ctx.grafikler([xtGrafigi(T), vtGrafigi(T), atGrafigi(T)]);
      const sx = gxt.seri("x", { renk: RENK_A }), sv = gvt.seri("v", { renk: "#5ad38b" }), sa = gat.seri("a", { renk: "#ff9f43" });
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "x", etiket: "Konum", birim: "m" }, { ad: "v", etiket: "Hız", birim: "m/s" }, { ad: "a", etiket: "İvme", birim: "m/s²" }]);
      const v0K = ctx.kaydirici({ etiket: "İlk hız (v₀)", min: -10, max: 20, adim: 1, deger: 4, birim: "m/s", degisti: model });
      const aK = ctx.kaydirici({ etiket: "İvme (a)", min: -4, max: 4, adim: 0.5, deger: 1.5, birim: "m/s²", degisti: model });
      const [btn] = ctx.dugmeler([{ metin: "▶ Çalıştır", ana: true, tik: calistir }]);
      const modelNot = ctx.not("");
      function model() {
        const v0 = v0K.deger, a = aK.deger;
        modelNot.innerHTML = `<p><span class="formul">v = ${sayi(v0, 0)} + (${sayi(a)})·t</span><br>
          <span class="formul">x = ${sayi(v0, 0)}·t + ½·(${sayi(a)})·t²</span></p>`;
      }
      model();

      function calistir() {
        k?.durdur();
        const v0 = v0K.deger, a = aK.deger;
        const f = parcali(0, v0, [{ sure: T, a }]);
        sx.temizle(); sv.temizle(); sa.temizle(); S.izleriTemizle();
        btn.disabled = true;
        k = kosu(S, {
          sure: T,
          kare: (t) => {
            const d = f(t);
            S.A.yerlestir(d.x); S.A.oklar({ v: d.v, a }); S.takip(d.x);
            sx.ekle(t, d.x); sv.ekle(t, d.v); sa.ekle(t, a);
            h.ayarla("t", t); h.ayarla("x", d.x); h.ayarla("v", d.v); h.ayarla("a", a);
          },
          saniye: (n) => S.izBirak("A", f(n).x, `${n} s`),
          bitti: () => {
            btn.disabled = false;
            if (v0 > 0 && a < 0 && v0 / -a < T) {
              const tt = v0 / -a;
              gxt.not([{ x: tt, y: f(tt).x, metin: `tepe: v = 0 (t = ${sayi(tt)} s)`, renk: "#ffd28a", hiza: "center", dx: 0, dy: -10 }]);
              ctx.gorevTamam();
            } else gxt.not([]);
          },
        });
      }
      ctx.temizlik(() => k?.durdur());
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Grafikleri birbirine dönüştür",
    cikti: "FİZ.10.1.3-b",
    anlatim: `
      <p>Elinde yalnızca bir <b>hız–zaman</b> grafiği var. Bu grafiğe uyan <b>konum–zaman</b> grafiğini bulabilir misin?</p>
      <p>İpuçları:</p>
      <ul>
        <li>Hız, konum–zaman grafiğinin <b>eğimidir</b>. Hız artıyorsa eğri dikleşir, azalıyorsa yatıklaşır.</li>
        <li>Hız–zaman grafiğinin altındaki <b>alan yer değiştirmeyi</b> verir. Eksenin altındaki alan negatif sayılır.</li>
      </ul>
      <p>Dikkat: Seçeneklerin üçü de aynı noktada bitebilir. Bitiş noktasına değil, <b>eğrinin şekline</b> bak.</p>`,
    gorev: "<b>İki</b> bulmacayı çöz: doğru konum–zaman grafiğini seç ve yer değiştirmeyi hesapla.",
    ogretmen: "Program, konum-zaman, hız-zaman ve ivme-zaman grafiklerinin birbirine dönüştürülmesini ve öğrencilerin bunu bir bilgi görseliyle sunmasını öneriyor. Bu adım bilgi görseli hazırlığı için ısınma olarak kullanılabilir.",
    anlat: [
      { s: "Bir hız–zaman grafiğinden iki önemli şey okunur." },
      { s: "<b>1)</b> Hız büyükse konum hızlı artar: konum–zaman çizgisi <b>dikleşir</b>." },
      { s: "<b>2)</b> Hız–zaman grafiğinin <b>altındaki alan</b>, yer değiştirmeye eşittir." },
      { cozum: ["Araç 5 saniye boyunca 4 m/s ile gitti.", "Grafikte bu bir dikdörtgen: eni 5 s, boyu 4 m/s.", "Alan = 5 × 4 = 20", "Yer değiştirme = 20 m"] },
      { soru: "Hız–zaman grafiğinde eksenin <b>altında</b> kalan alan ne anlama gelir?", secenekler: ["Araç durdu", "Araç geri (− yönde) gitti", "Araç hızlandı"], dogru: 1,
        aciklama: "Eksenin altı negatif hız demektir: araç geri gitmiştir. Bu alan eksi sayılır." },
      { s: "Şimdi iki bulmaca çöz: önce doğru konum grafiğini seç, sonra alanı kullanarak yer değiştirmeyi hesapla." },
    ],
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(30, { uzaklik: 55 });
      const T = 8;
      const BULMACALAR = [
        { v0: 0, a: 2, celdirici: [{ v0: 16, a: -2 }, { v0: 8, a: 0 }] },
        { v0: 12, a: -1.5, celdirici: [{ v0: 0, a: 1.5 }, { v0: 6, a: 0 }] },
        { v0: -6, a: 1.5, celdirici: [{ v0: 6, a: -1.5 }, { v0: 0, a: 0 }] },
      ];
      let sira = karistir([0, 1, 2]), no = 0, cozulen = 0, k = null;
      const [gvt] = ctx.grafikler([vtGrafigi(T, { min: -10, max: 16, otomatik: false })]);
      const sv = gvt.seri("v", { renk: "#5ad38b", kalinlik: 3 });
      const secim = el("div", { class: "fz-secim" });
      ctx.katman.append(secim);
      const kartGrafikleri = [];
      ctx.temizlik(() => kartGrafikleri.forEach((g) => g.yokEt()));
      const durum = el("div", { class: "d-geri-bildirim" });
      const soruKap = el("div");
      ctx.kontroller.append(durum, soruKap);

      function goster() {
        k?.durdur();
        const b = BULMACALAR[sira[no % sira.length]];
        const f = (p) => (t) => p.v0 * t + 0.5 * p.a * t * t;
        const n = []; for (let t = 0; t <= T; t += 0.25) n.push([t, b.v0 + b.a * t]);
        sv.ayarla(n);
        gvt.golgeTemizle();
        S.izleriTemizle(); S.A.yerlestir(0); S.A.oklar();
        durum.textContent = `Çözülen bulmaca: ${cozulen}/2`;
        soruKap.replaceChildren();

        kartGrafikleri.splice(0).forEach((g) => g.yokEt());
        const secenekler = karistir([{ p: b, dogru: true }, ...b.celdirici.map((p) => ({ p, dogru: false }))]);
        const xs = secenekler.flatMap(({ p }) => [0, 2, 4, 6, 8].map((t) => f(p)(t)));
        const yAralik = { min: Math.min(-5, ...xs), max: Math.max(10, ...xs) };
        secim.replaceChildren(el("div", { class: "fz-secim-baslik" }, "Bu hız–zaman grafiğine uyan konum–zaman grafiği hangisi?"));
        const satir = el("div", { class: "fz-secim-satir" });
        secim.append(satir);
        secenekler.forEach((s, i) => {
          const kap = el("div", { class: "fz-secim-grafik" });
          const kart = el("button", { class: "fz-secim-kart", "aria-label": `Seçenek ${"ABC"[i]}` }, el("span", {}, "ABC"[i]), kap);
          satir.append(kart);
          const g = new Grafik(kap, { x: { etiket: "t", min: 0, max: T }, y: { etiket: "x", ...yAralik } });
          const pts = []; for (let t = 0; t <= T; t += 0.25) pts.push([t, f(s.p)(t)]);
          g.seri("x", { renk: RENK_A }).ayarla(pts);
          kartGrafikleri.push(g);
          kart.addEventListener("click", () => {
            if (secim.dataset.bitti) return;
            if (s.dogru) {
              kart.classList.add("dogru"); secim.dataset.bitti = "1";
              alanSorusu(b);
            } else {
              kart.classList.add("yanlis");
              durum.className = "d-geri-bildirim yanlis";
              durum.textContent = "Bu değil. Eğimin zamanla nasıl değiştiğine bak: hız–zaman grafiğiyle uyumlu mu?";
            }
          });
        });
        delete secim.dataset.bitti;
      }

      function alanSorusu(b) {
        const dx = b.v0 * T + 0.5 * b.a * T * T;
        gvt.golge(sv, 0, T, "rgba(90,211,139,.25)");
        durum.className = "d-geri-bildirim dogru";
        durum.textContent = "Doğru grafik! Şimdi yer değiştirmeyi hesapla.";
        let sayildi = false;
        const s = ctx.sayiSorusu({
          etiket: "Hız–zaman grafiğinin altındaki alandan 0–8 s arasındaki yer değiştirme kaç metre?",
          birim: "m",
          kontrol: (c) => {
            if (Math.abs(c - dx) >= 0.6) return b.v0 < 0 ? "Eksenin altında kalan alanı negatif say." : "Alanı yamuk ya da üçgen olarak hesapla.";
            if (!sayildi) {
              sayildi = true;
              cozulen++;
              durum.textContent = `Çözülen bulmaca: ${cozulen}/2`;
              if (cozulen >= 2) ctx.gorevTamam();
              dogrula(b);
              soruKap.append(el("div", { class: "d-satir", style: "margin-top:8px" },
                el("button", { class: "d-btn ana", onclick: () => { no++; goster(); } }, "Sonraki bulmaca ›")));
            }
            return true;
          },
          dogruMesaj: "Doğru! Araç bu hareketi yolda gösteriyor.",
        });
        soruKap.replaceChildren(s.el);
      }

      function dogrula(b) {
        const f = parcali(0, b.v0, [{ sure: T, a: b.a }]);
        k = kosu(S, {
          sure: T,
          kare: (t) => { const d = f(t); S.A.yerlestir(d.x); S.A.oklar({ v: d.v, a: b.a }); S.takip(d.x); },
          saniye: (n) => S.izBirak("A", f(n).x, `${n} s`),
          bitti: () => S.A.oklar(),
        });
      }
      goster();
      ctx.temizlik(() => k?.durdur());
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Kırmızı ışık: sert mi, sakin mi?",
    cikti: "FİZ.10.1.3-c",
    anlatim: `
      <p>Başlangıçtaki soruya dönelim. İki araç da 0 m'deki ışıkta yeşil yanınca kalkıyor. <b>192 m</b> ilerideki ışık <b>30. saniyede</b> yeşile dönecek.</p>
      <p><b>Mavi araç (sert sürücü):</b> 3 m/s² ile 50 km/h'e çıkıyor, ışığa gelince sert fren yapıp bekliyor.</p>
      <p><b>Turuncu araç sensin.</b> İvmeni ve en yüksek hızını seç. Amacın: <b>hiç fren yapmadan</b>, ışık yeşile döndükten hemen sonra geçmek (“yeşil dalga”).</p>
      <p>Frende aracın hareket enerjisi (<span class="formul">½·m·v²</span>, m = 1200 kg) ısıya dönüşüp boşa gider. Araç sonra o enerjiyi yakıtla yeniden kazanmak zorunda kalır.</p>`,
    gorev: "Turuncu aracı ışıktan <b>30–34. saniyeler arasında</b> ve <b>hiç durmadan</b> geçir.",
    ogretmen: "Program, ani hızlanıp yavaşlamanın yakıt sarfiyatına etkisinin tartışılmasını öneriyor (D5 Duyarlılık, D17 Tasarruf). Hız sınırı vurgusu yapın: simülasyonda en yüksek hız 50 km/h ile sınırlıdır. Kendi cümleleriyle yazılan açıklamalar çıkış kartı olarak kullanılabilir.",
    anlat: [
      { s: "Gerçek bir sorun: 192 m ileride bir trafik ışığı var. <b>30. saniyede</b> yeşile dönecek." },
      { s: "<b>Mavi araç</b> sert bir sürücü: hızla gaza basar, ışığa gelince sert fren yapıp bekler." },
      { s: "Frende aracın <b>hareket enerjisi</b> ısıya dönüşüp boşa gider. Araç sonra bu enerjiyi yakıtla yeniden kazanır." },
      { soru: "Hangisi daha az yakıt harcar?", secenekler: ["Hızlanıp sert fren yapmak", "Sakin hızlanıp ışığa tam yeşilde varmak"], dogru: 1,
        aciklama: "Durmadan geçen araç fren yapmaz; hareket enerjisini boşa harcamaz. Buna “yeşil dalga” denir." },
      { s: "<b>Turuncu araç sensin.</b> İvmeni ve en yüksek hızını seç; ışıktan hiç durmadan, 30–34. saniyeler arasında geç." },
    ],
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      const L = 192, YESIL = 30, KUTLE = 1200, SURE = 42;
      S.B.grup.visible = true;
      S.isik.grup.position.x = L + 2.4; S.isik.grup.visible = true;
      S.isik.renk("kirmizi"); S.isik.yazi(`Yeşile ${YESIL} s`);
      S.kameraya(10, { uzaklik: 48 });
      let k = null, carpan = 2;
      const [gvt, gxt] = ctx.grafikler([vtGrafigi(SURE, { min: 0, max: 15 }), xtGrafigi(SURE, { min: 0, max: 250 })]);
      const va = gvt.seri("A", { renk: RENK_A }), vb = gvt.seri("B", { renk: RENK_B });
      const xa = gxt.seri("A", { renk: RENK_A }), xb = gxt.seri("B", { renk: RENK_B });
      const h = hud(ctx, [{ ad: "t", etiket: "Zaman", birim: "s" }, { ad: "va", etiket: "Senin hızın", birim: "km/h", ondalik: 0 }, { ad: "vb", etiket: "Mavi aracın hızı", birim: "km/h", ondalik: 0 }]);

      const aK = ctx.kaydirici({ etiket: "Kalkış ivmen (a)", min: 0.5, max: 3, adim: 0.25, deger: 2, birim: "m/s²" });
      const vK = ctx.kaydirici({ etiket: "En yüksek hızın (hız sınırı 50 km/h)", min: 10, max: 50, adim: 1, deger: 50, birim: "km/h" });
      ctx.secenekler({ etiket: "Simülasyon hızı", liste: [{ deger: 1, metin: "×1" }, { deger: 2, metin: "×2" }, { deger: 4, metin: "×4" }], deger: 2, degisti: (v) => (carpan = v) });
      const [btn] = ctx.dugmeler([{ metin: "▶ Başlat", ana: true, tik: baslat }]);
      const g = ctx.gostergeler([
        { ad: "ga", etiket: "Senin geçişin", birim: "s" },
        { ad: "gb", etiket: "Mavi aracın geçişi", birim: "s" },
        { ad: "ea", etiket: "Senin frende kaybın", birim: "kJ", ondalik: 0 },
        { ad: "eb", etiket: "Mavi aracın kaybı", birim: "kJ", ondalik: 0 },
      ]);
      const sonuc = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(sonuc);
      ctx.yaziAlani({
        etiket: "İki sürüşü <b>hız–zaman grafiklerinin altındaki alanlar</b>, <b>geçiş anları</b> ve <b>frende kaybolan enerji</b> üzerinden kendi cümlelerinle karşılaştır.",
        anahtar: "yesil-dalga", enAz: 80,
      });

      function baslat() {
        k?.durdur();
        const a = aK.deger, vmax = vK.deger / 3.6;
        const ortak = { cizgi: L, yesil: YESIL, kutle: KUTLE };
        const sen = surucuModeli({ a, vmax, b: 4, ...ortak }), sert = surucuModeli({ a: 3, vmax: 50 / 3.6, b: 6, ...ortak });
        const fa = parcali(0, 0, sen.parcalar), fb = parcali(0, 0, sert.parcalar);
        for (const s of [va, vb, xa, xb]) s.temizle();
        S.izleriTemizle(); sonuc.textContent = "";
        for (const ad of ["ga", "gb", "ea", "eb"]) g.ayarla(ad, "—");
        btn.disabled = true;
        let aYazildi = false, bYazildi = false;
        k = kosu(S, {
          sure: SURE,
          carpan: () => carpan,
          kare: (t) => {
            const A = fa(t), B = fb(t);
            S.A.yerlestir(A.x); S.B.yerlestir(B.x);
            S.A.oklar({ v: A.v, a: A.a }); S.B.oklar({ v: B.v, a: B.a });
            S.A.stopLambasi(A.a < 0); S.B.stopLambasi(B.a < 0);
            S.takip(Math.min(A.x, 260));
            va.ekle(t, A.v); vb.ekle(t, B.v); xa.ekle(t, A.x); xb.ekle(t, B.x);
            h.ayarla("t", t); h.ayarla("va", A.v * 3.6); h.ayarla("vb", B.v * 3.6);
            if (t < YESIL) S.isik.yazi(`Yeşile ${Math.ceil(YESIL - t)} s`);
            S.isik.renk(t >= YESIL ? "yesil" : t >= YESIL - 2 ? "sari" : "kirmizi");
            if (t >= YESIL) S.isik.yazi("YEŞİL");
            if (t >= sen.gecis && !aYazildi) { aYazildi = true; g.ayarla("ga", sen.gecis); g.ayarla("ea", sen.kayip / 1000); }
            if (t >= sert.gecis && !bYazildi) { bYazildi = true; g.ayarla("gb", sert.gecis); g.ayarla("eb", sert.kayip / 1000); }
          },
          saniye: (n) => { if (n % 2 === 0) { S.izBirak("A", fa(n).x); S.izBirak("B", fb(n).x); } },
          bitti: () => {
            btn.disabled = false;
            S.A.stopLambasi(false); S.B.stopLambasi(false);
            const basari = !sen.durdu && sen.gecis >= YESIL && sen.gecis <= YESIL + 4;
            sonuc.className = `d-geri-bildirim ${basari ? "dogru" : "yanlis"}`;
            if (basari) {
              const fark = sen.gecis - sert.gecis;
              sonuc.innerHTML = `Yeşil dalgayı yakaladın! Işıktan ${sayi(sen.gecis)} s'de, <b>${sayi(fa(sen.gecis).v * 3.6, 0)} km/h</b> hızla, hiç durmadan geçtin.
                Mavi araç ${sayi(sert.gecis)} s'de duruştan kalkarak geçti: senden yalnızca <b>${sayi(fark)} s</b> önce.
                Bu kısa avantaj için ışıkta ${sayi(sert.bekleme, 1)} s bekledi, frende <b>${sayi(sert.kayip / 1000, 0)} kJ</b> enerjiyi ısıya çevirdi
                ve aynı enerjiyi yeniden hızlanmak için yakıttan harcamak zorunda kaldı.`;
              ctx.gorevTamam();
            } else if (sen.durdu) {
              sonuc.innerHTML = `Işığa erken vardın ve <b>durmak zorunda kaldın</b> (${sayi(sen.kayip / 1000, 0)} kJ frende kayboldu). Daha düşük bir en yüksek hız dene.
                İpucu: 192 m'yi yaklaşık 30 s'de gitmek için ortalama hız ≈ 6,4 m/s ≈ 23 km/h olmalı.`;
            } else {
              sonuc.innerHTML = `Durmadın ama çok yavaştın: ışık ${sayi(sen.gecis - YESIL)} s boyunca yeşilken bekledin, arkandaki trafik de bekledi. Biraz daha hızlı git.`;
            }
          },
        });
      }
      ctx.temizlik(() => k?.durdur());
    },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Değerlendirme: trafik mühendisi sensin",
    anlatim: `
      <p>Sekiz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>6 doğru</b> yaparsan dersi tamamlamış olursun. Yanlış yaptığın konular için ilgili adıma dönebilirsin.</p>`,
    gorev: "Değerlendirmede en az <b>6/8</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (çalışma yaprağı, çıkış kartı) uyumludur. Sınıfta akıllı tahtada birlikte çözülüp her şıkkın neden doğru/yanlış olduğu tartışılabilir.",
    anlat: [
      { s: "Sekiz soruluk kısa bir değerlendirme." },
      { s: "En az <b>6 doğru</b> yaparsan dersi bitirirsin. Her sorudan sonra açıklamayı oku; yanlış yaptığın konunun adımına dönebilirsin." },
    ],
    kur(ctx) {
      const S = ctx.sahne;
      S.sifirla();
      S.kameraya(0, { uzaklik: 40 });
      const cizgiGrafik = (ayar, noktalar, renk) => (kap) => {
        const g = new Grafik(kap, ayar);
        g.seri("s", { renk, kalinlik: 3 }).ayarla(noktalar);
      };
      ctx.sinav([
        {
          tur: "sayi", metin: "Doğuya doğru sabit <b>15 m/s</b> hızla giden bir otobüs <b>8 s</b>'de kaç metre yer değiştirir?",
          dogru: 120, tolerans: 0.5, birim: "m",
          aciklama: "Sabit hızda Δx = v·Δt = 15·8 = 120 m (doğu yönünde).",
        },
        {
          tur: "sayi", metin: "Konum–zaman grafiği verilen aracın hızı kaç m/s'dir?",
          grafik: cizgiGrafik(xtGrafigi(6, { min: 0, max: 70, otomatik: false }), [[0, 10], [5, 60], [6, 70]], RENK_A),
          dogru: 10, tolerans: 0.2, birim: "m/s",
          aciklama: "Eğim = Δx/Δt = (60 − 10)/(5 − 0) = 10 m/s. İlk konumu (10 m) çıkarmayı unutmamak gerekir.",
        },
        {
          tur: "coktan", metin: "Doğuya (+ yön) doğru hareket eden bir araç fren yaparak <b>yavaşlıyor</b>. İvmesinin yönü nedir?",
          siklar: ["Doğu (+)", "Batı (−)", "İvme sıfırdır", "Aracın hızına bağlı olarak değişir"],
          dogru: 1, aciklama: "Yavaşlayan bir cisimde ivme, hızla zıt yöndedir. Hız doğuya doğru olduğundan ivme batıya (−) doğrudur.",
        },
        {
          tur: "sayi", metin: "Hız–zaman grafiği verilen aracın <b>0–10 s</b> arasındaki yer değiştirmesi kaç metredir?",
          grafik: cizgiGrafik(vtGrafigi(10, { min: 0, max: 25, otomatik: false }), [[0, 0], [4, 20], [10, 20]], "#5ad38b"),
          dogru: 160, tolerans: 1, birim: "m",
          aciklama: "Alan = üçgen + dikdörtgen = ½·4·20 + 6·20 = 40 + 120 = 160 m.",
        },
        {
          tur: "sayi", metin: "Hızı <b>3 s</b> içinde <b>4 m/s</b>'den <b>16 m/s</b>'ye düzgün olarak artan bir aracın ivmesi kaç m/s²'dir?",
          dogru: 4, tolerans: 0.05, birim: "m/s²",
          aciklama: "a = Δv/Δt = (16 − 4)/3 = 4 m/s².",
        },
        {
          tur: "coktan", metin: "Duruştan kalkıp <b>+ yönde sabit ivmeyle hızlanan</b> bir aracın konum–zaman grafiği nasıldır?",
          siklar: ["Eğimi sabit olan bir doğru", "Eğimi giderek artan (yukarı bükülen) bir eğri", "Eğimi giderek azalan bir eğri", "Zaman eksenine paralel bir doğru"],
          dogru: 1, aciklama: "Hız arttıkça konum–zaman grafiğinin eğimi (hız) artar; grafik x = ½·a·t² parabolüdür.",
        },
        {
          tur: "coktan", metin: "Bir öğrenci önce <b>30 m doğuya</b>, sonra <b>10 m batıya</b> yürüyor. Alınan yol ve yer değiştirme nedir?",
          siklar: ["Yol 40 m; yer değiştirme 40 m doğu", "Yol 40 m; yer değiştirme 20 m doğu", "Yol 20 m; yer değiştirme 40 m doğu", "Yol 20 m; yer değiştirme 20 m batı"],
          dogru: 1, aciklama: "Alınan yol toplam mesafedir: 30 + 10 = 40 m. Yer değiştirme son konum − ilk konum: +30 − 10 = +20 m, yani 20 m doğu.",
        },
        {
          tur: "coktan", metin: "Hız–zaman grafiği verilen hareket için hangisi <b>doğrudur</b>?",
          grafik: cizgiGrafik(vtGrafigi(8, { min: 0, max: 14, otomatik: false }), [[0, 12], [6, 0], [8, 0]], "#5ad38b"),
          siklar: ["Araç 0–6 s arasında yavaşlıyor ve 36 m yer değiştiriyor", "Araç 0–6 s arasında geri geri gidiyor", "Aracın ivmesi 0–6 s arasında +2 m/s²'dir", "Araç 6. saniyede başlangıç noktasına dönüyor"],
          dogru: 0, aciklama: "Hız pozitif ama azalıyor: araç ileri giderken yavaşlıyor. a = (0 − 12)/6 = −2 m/s². Alan = ½·6·12 = 36 m; hız hiç negatif olmadığı için başlangıca dönmez.",
        },
      ], { baslik: "Trafik mühendisi sensin", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: yolSahnesi });
