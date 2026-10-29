// 10. Sınıf Matematik · 1. Tema: Geometrik Şekiller — A dersi
// MAT.10.1.1 Dik üçgende trigonometrik oranlar (sin, cos, tan, cot) ve trigonometrik özdeşlikler
import { dersBaslat, sayi, el } from "../../../../engine/ders.js";
import { tahtaKur, sekilCiz, RENK } from "../ortak/tahta.js";
import { hud, gorevListesi, formulListesi, onermeler, secimTablosu, kisa } from "../ortak/yardim.js";
import { dikUcgenOranlari, trigOranlar, birimCemberNoktasi, yonluAciAc, derece, OZEL_DEGERLER } from "../ortak/geometri.js";
import { AILELER, aileUcgeni, kYapistir } from "./model.js";
import { minareAdimi } from "./minare3b.js";

const sinirla = (v, a, b) => Math.min(b, Math.max(a, v));
const yuvarla = (v, adim) => Math.round(v / adim) * adim;
const O = { x: 0, y: 0 };
const eksi = (v) => String(v).replace("-", "−");

/** 2. ve 5. adımdaki serbest dik üçgen: A orijinde, C = (B.x, 0), B ızgaraya yapışır */
function serbestDikUcgen(T, { x = 8, y = 6 } = {}) {
  return T.nokta("B", {
    x, y, adim: 0.5,
    kisit: (p) => ({ x: sinirla(yuvarla(p.x, 0.5), 1, 9.5), y: sinirla(yuvarla(p.y, 0.5), 0.5, 7.5) }),
  });
}
const DIK_ALAN = { alan: { xmin: -0.8, xmax: 10.4, ymin: -1.3, ymax: 8.3 }, izgara: 1 };

/** Kenarları odak açıya göre adlandırılmış dik üçgen çizimi */
function dikUcgenCiz(c, B, odak = "α", { ikiAci = false } = {}) {
  const A = O, C = { x: B.x, y: 0 };
  const karsiKenar = odak === "α" ? [C, B] : [A, C], komsuKenar = odak === "α" ? [A, C] : [C, B];
  c.cokgen([A, B, C], { dolgu: "rgba(79,195,247,.10)", renk: null });
  c.parca(...komsuKenar, { renk: RENK.mavi, kalinlik: 4 });
  c.parca(...karsiKenar, { renk: RENK.yesil, kalinlik: 4 });
  c.parca(A, B, { kalinlik: 3 });
  c.dikAci(A, C, B);
  if (odak === "α" || ikiAci) c.aci(C, A, B, { etiket: "α", r: 40 });
  if (odak === "β" || ikiAci) c.aci(A, B, C, { etiket: ikiAci ? "90°−α" : "β", r: 34, renk: RENK.pembe });
  const kar = uzun(...karsiKenar), kom = uzun(...komsuKenar);
  c.kenarYazisi(A, C, `${odak === "α" ? "komşu" : "karşı"} = ${kisa(B.x)}`, { renk: odak === "α" ? RENK.mavi : RENK.yesil, uzak: B, mesafe: 18 });
  c.kenarYazisi(C, B, `${odak === "α" ? "karşı" : "komşu"} = ${kisa(B.y)}`, { renk: odak === "α" ? RENK.yesil : RENK.mavi, uzak: A, hiza: "start", mesafe: 12 });
  c.kenarYazisi(A, B, `hipotenüs = ${kisa(Math.hypot(B.x, B.y))}`, { uzak: C, hiza: "end", mesafe: 14 });
  c.nokta(A); c.yazi(A, "A", { dx: -14, dy: 14, kalin: true, boyut: 17 });
  c.nokta(C); c.yazi(C, "C", { dx: 14, dy: 16, kalin: true, boyut: 17 });
  return { kar, kom };
}
const uzun = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Aynı açı, farklı boyut",
    cikti: "MAT.10.1.1-a",
    anlatim: `
      <p>Bir rampanın eğimi, duvara yaslanan merdiven, güneşin yüksekliği… Hepsinde bir <b>dik üçgen</b> ve bir <b>dar açı</b> (α) var.</p>
      <p>α'ya göre: <b style="color:var(--vurgu-2)">mavi kenar komşu dik kenar</b>, <b style="color:var(--yesil)">yeşil kenar karşı dik kenar</b>, beyaz kenar <b>hipotenüs</b>.</p>
      <p><b>B</b> köşesini sürükle: üçgen büyür ya da küçülür ama α değişmez, yani üçgenler <b>benzer</b> kalır. Önce bir varsayımda bulun, sonra ölç ve tabloya yaz.</p>`,
    gorev: "Varsayımını seç ve aynı ailede <b>en az 3 farklı boyutta</b> üçgeni ölçüp tabloya yaz.",
    ogretmen: "Programda 3-4-5 gibi kenarları rasyonel olan benzer dik üçgenlerin çalışma kâğıdına çizilmesi ve bir dar açıya göre dört oranın tabloda düzenlenmesi öneriliyor (SDB2.1, SDB2.2). Grupları farklı ailelere (3-4-5, 5-12-13, 8-15-17) ayırıp tablolarını tahtada karşılaştırtın; “oranlar hep eşit çıktı” genellemesini (OB1) öğrencilerin kendisi ifade etsin.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster({ alan: { xmin: -0.8, xmax: 10.4, ymin: -1.3, ymax: 8.4 }, izgara: 1 });
      let aile = AILELER[0], k = 1, iddia = null, bitti = false;
      const olculen = [];
      const klavyeAdimi = () => (aile.kAdim * aile.hip * 0.6) / Math.min(aile.komsu, aile.karsi) * aile.hip;
      const B = T.nokta("B", {
        x: aile.komsu * k, y: aile.karsi * k, adim: klavyeAdimi(),
        kisit: (p) => {
          const L = (p.x * aile.komsu + p.y * aile.karsi) / aile.hip;
          k = kYapistir(aile, L / aile.hip);
          return { x: aile.komsu * k, y: aile.karsi * k };
        },
      });
      T.ciz((c) => {
        for (const kk of olculen) {
          if (Math.abs(kk - k) < 1e-9) continue;
          const g = aileUcgeni(aile, kk);
          c.cokgen([O, { x: g.komsu, y: g.karsi }, { x: g.komsu, y: 0 }], { renk: "rgba(169,182,201,.45)", kalinlik: 1.5, kesikli: true });
        }
        dikUcgenCiz(c, { x: B.x, y: B.y });
      });

      ctx.secenekler({
        etiket: "Üçgen ailesi (α'ya göre karşı-komşu-hipotenüs)",
        liste: AILELER.map((a, i) => ({ deger: i, metin: `${a.karsi}-${a.komsu}-${a.hip}` })), deger: 0,
        degisti: (i) => {
          aile = AILELER[i]; olculen.length = 0; tablo.temizle();
          k = kYapistir(aile, (aile.kMin + aile.kMax) / 2);
          B.adim = klavyeAdimi();
          B.ayarla(aile.komsu * k, aile.karsi * k, true);
          if (!bitti) sonuc.innerHTML = "";
        },
      });
      ctx.secenekler({
        etiket: "Varsayımın: üçgen büyüdükçe karşı / hipotenüs oranı…",
        liste: [{ deger: "artar", metin: "Artar" }, { deger: "azalir", metin: "Azalır" }, { deger: "sabit", metin: "Değişmez" }],
        deger: null, degisti: (v) => { iddia = v; olcBtn.disabled = false; },
      });
      const [olcBtn] = ctx.dugmeler([{ metin: "📏 Ölç ve tabloya yaz", ana: true, tik: olc }]);
      olcBtn.disabled = true;
      const tablo = ctx.tablo(["hip.", "karşı / hip.", "komşu / hip.", "karşı / komşu", "komşu / karşı"]);
      tablo.el.classList.add("mt-tablo");
      const sonuc = ctx.not("");

      function olc() {
        if (olculen.some((kk) => Math.abs(kk - k) < 1e-9)) {
          sonuc.innerHTML = `<p class="d-geri-bildirim yanlis">Bu boyutu zaten ölçtün. B'yi sürükleyip başka bir boyut dene.</p>`;
          return;
        }
        olculen.push(k);
        const u = aileUcgeni(aile, k);
        tablo.satirEkle([kisa(u.hip, 3), sayi(u.sin, 3), sayi(u.cos, 3), sayi(u.tan, 3), sayi(u.cot, 3)]);
        T.yenile();
        if (olculen.length < 3) {
          sonuc.innerHTML = `<p>${olculen.length}/3 ölçüm. B'yi sürükleyip farklı bir boyutta tekrar ölç.</p>`;
          return;
        }
        const uyumlu = iddia === "sabit";
        sonuc.innerHTML = `<p class="d-geri-bildirim ${uyumlu ? "dogru" : "yanlis"}">${uyumlu
          ? "Varsayımın tabloyla uyumlu: dört oran da her satırda aynı çıktı."
          : "Tablo varsayımını desteklemiyor: hipotenüs büyüdükçe karşı kenar da <b>aynı oranda</b> büyüdü, bölüm hiç değişmedi."}</p>
          <p>Benzer üçgenlerde karşılıklı kenarlar aynı oranda büyür. Bu yüzden bu dört oran üçgenin boyutuna değil, <b>yalnızca α açısına</b> bağlıdır. Başka bir aile seçip aynı şeyi gözle.</p>`;
        bitti = true;
        ctx.gorevTamam();
      }
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Oranlara ad ver: sin, cos, tan, cot",
    cikti: "MAT.10.1.1-b",
    anlatim: `
      <p>Bir dar açıya ait bu dört sabit orana <b>trigonometrik oranlar</b> denir:</p>
      <p><span class="formul">sin α = karşı / hipotenüs</span> <span class="formul">cos α = komşu / hipotenüs</span><br>
      <span class="formul">tan α = karşı / komşu</span> <span class="formul">cot α = komşu / karşı</span></p>
      <p>Şimdi <b>B</b>'yi serbestçe sürükle: açı da değişir. Hangi açıya göre baktığını değiştirirsen (α ya da β) karşı ve komşu kenarların <b>yer değiştirdiğine</b> dikkat et.</p>`,
    gorev: "Listedeki üç üçgeni kur.",
    ogretmen: "Öğrencilerin genellemelerini varsayımlarıyla karşılaştırdıktan sonra oranları sinüs, kosinüs, tanjant, kotanjant olarak adlandırın. “Karşı” ve “komşu” sözcüklerinin açıya göre değiştiğini β seçeneğiyle vurgulayın; bu, sonraki adımdaki tümler açı önermesine hazırlık olur.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(DIK_ALAN);
      let odak = "α";
      const B = serbestDikUcgen(T, { x: 6, y: 2.5 });
      const h = hud(ctx, [
        { ad: "aci", etiket: "Açı" }, { ad: "sin", etiket: "sin" }, { ad: "cos", etiket: "cos" },
        { ad: "tan", etiket: "tan" }, { ad: "cot", etiket: "cot" },
      ]);
      T.ciz((c) => dikUcgenCiz(c, B, odak));
      ctx.secenekler({
        etiket: "Hangi açıya göre?", deger: "α",
        liste: [{ deger: "α", metin: "α (A köşesi)" }, { deger: "β", metin: "β (B köşesi)" }],
        degisti: (v) => { odak = v; guncelle(); T.yenile(); },
      });
      const f = formulListesi(ctx, ["sin = karşı ÷ hipotenüs", "cos = komşu ÷ hipotenüs", "tan = karşı ÷ komşu", "cot = komşu ÷ karşı"]);
      const liste = gorevListesi(ctx, ["<b>tan = 1</b> olan bir üçgen", "<b>sin = 0,6</b> olan bir üçgen", "<b>cot = 2</b> olan bir üçgen"]);
      const sonuc = ctx.not("");
      const yakin = (a, b) => Math.abs(a - b) < 1e-9;

      function guncelle() {
        const kar = odak === "α" ? B.y : B.x, kom = odak === "α" ? B.x : B.y;
        const o = dikUcgenOranlari(kar, kom);
        const aci = derece(Math.atan2(kar, kom));
        h.ayarla("aci", `${odak} = ${sayi(aci, 1)}°`);
        for (const ad of ["sin", "cos", "tan", "cot"]) h.ayarla(ad, sayi(o[ad], 3));
        const hip = kisa(o.hip, 3);
        f.ayarla(0, `${kisa(kar)} ÷ ${hip} = ${sayi(o.sin, 3)}`);
        f.ayarla(1, `${kisa(kom)} ÷ ${hip} = ${sayi(o.cos, 3)}`);
        f.ayarla(2, `${kisa(kar)} ÷ ${kisa(kom)} = ${sayi(o.tan, 3)}`);
        f.ayarla(3, `${kisa(kom)} ÷ ${kisa(kar)} = ${sayi(o.cot, 3)}`);
        if (yakin(o.tan, 1)) liste.isaretle(0);
        if (yakin(o.sin, 0.6)) liste.isaretle(1);
        if (yakin(o.cot, 2)) liste.isaretle(2);
        if (liste.hepsi() && !ctx.gorevTamamMi()) {
          sonuc.innerHTML = `<p class="d-geri-bildirim dogru">Üçünü de kurdun!</p>
            <p>tan = 1 iken açı 45°'dir ve iki dik kenar eşittir. tan ile cot birbirinin <b>çarpmaya göre tersidir</b>: tan = ½ ise cot = 2.</p>`;
          ctx.gorevTamam();
        }
      }
      T.degisti(guncelle);
      guncelle();
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Hipotenüs 1 olunca: özdeşlikler",
    cikti: "MAT.10.1.1-c",
    anlatim: `
      <p>Hipotenüsü <b>1 birim</b> olan bir dik üçgende dik kenarların uzunlukları doğrudan <b>cos α</b> ve <b>sin α</b> olur. Neden?</p>
      <p>Kenarların üzerine kurulan karelere bak: alanları <b style="color:var(--vurgu-2)">cos²α</b>, <b style="color:var(--yesil)">sin²α</b> ve <b>1</b>.</p>
      <p>Önce iki varsayımda bulun. Sonra <b>B</b>'yi çember yayı üzerinde sürükleyip farklı açılarda ölçüm al ve varsayımlarını tabloyla karşılaştır.</p>`,
    gorev: "İki varsayımını seç ve <b>en az 4 farklı açıda</b> ölçüm al.",
    ogretmen: "Programda Pisagor teoremi ve cebirsel işlemlerle sin²x + cos²x = 1 ve tan x · cot x = 1 özdeşliklerine ulaşılması, hipotenüsü 1 birim olan dik üçgende dik kenarların trigonometrik oranlarla ilişkisinin keşfedilmesi öneriliyor. “sin α + cos α = 1” sık görülen bir kavram yanılgısıdır; tabloda neden tutmadığını tartıştırın.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster({ alan: { xmin: -1.15, xmax: 1.6, ymin: -1.12, ymax: 1.55 }, izgara: 0.5 });
      let aci = 37;
      const B = T.nokta("B", {
        ...birimCemberNoktasi(aci), adim: 0.03,
        kisit: (p) => { aci = sinirla(Math.round(derece(Math.atan2(p.y, p.x))), 5, 85); return birimCemberNoktasi(aci); },
      });
      const iddia = { toplam: null, kare: null };
      const olculen = new Set();
      const h = hud(ctx, [{ ad: "aci", etiket: "α" }]);
      T.ciz((c) => {
        const cs = B.x, sn = B.y, C = { x: cs, y: 0 };
        c.yay(O, 1, 0, 90, { renk: RENK.soluk, kalinlik: 1.5, kesikli: true });
        c.cokgen([O, C, { x: cs, y: -cs }, { x: 0, y: -cs }], { dolgu: "rgba(79,195,247,.20)", renk: RENK.mavi, kalinlik: 1.5 });
        c.cokgen([C, { x: cs + sn, y: 0 }, { x: cs + sn, y: sn }, B], { dolgu: "rgba(90,211,139,.20)", renk: RENK.yesil, kalinlik: 1.5 });
        c.cokgen([O, B, { x: cs - sn, y: sn + cs }, { x: -sn, y: cs }], { dolgu: "rgba(255,181,71,.12)", renk: RENK.turuncu, kalinlik: 1.5 });
        // küçük karelerde alan yazısı karenin dışına alınır
        if (cs > 0.5) c.yazi({ x: cs / 2, y: -cs * 0.6 }, `cos²α = ${sayi(cs * cs, 3)}`, { renk: RENK.mavi, boyut: 15 });
        else c.yazi({ x: cs / 2, y: -cs }, `cos²α = ${sayi(cs * cs, 3)}`, { renk: RENK.mavi, boyut: 14, dy: 16 });
        if (sn > 0.5) c.yazi({ x: cs + sn * 0.55, y: sn * 0.28 }, `sin²α = ${sayi(sn * sn, 3)}`, { renk: RENK.yesil, boyut: 15 });
        else c.yazi({ x: cs + sn, y: sn }, `sin²α = ${sayi(sn * sn, 3)}`, { renk: RENK.yesil, boyut: 14, dx: 6, dy: -14, hiza: "start" });
        c.yazi({ x: (cs - sn) / 2, y: (sn + cs) / 2 }, "1² = 1", { renk: RENK.turuncu, boyut: 16, kalin: true });
        c.cokgen([O, B, C], { dolgu: "rgba(255,255,255,.06)", renk: null });
        c.parca(O, C, { renk: RENK.mavi, kalinlik: 4 });
        c.parca(C, B, { renk: RENK.yesil, kalinlik: 4 });
        c.parca(O, B, { kalinlik: 3 });
        c.dikAci(O, C, B, { boyut: 10 });
        c.aci(C, O, B, { etiket: "α", r: 34 });
        c.kenarYazisi(O, C, "cos α", { renk: RENK.mavi, uzak: { x: cs / 2, y: 1 }, mesafe: 13, boyut: 14, kalin: true });
        // karşı kenar yazısı: üçgen yeterince genişse içeride, değilse karenin içinde
        const icte = cs > 0.45;
        c.kenarYazisi(C, B, "sin α", { renk: RENK.yesil, uzak: icte ? { x: 2, y: sn / 2 } : { x: 0, y: sn / 2 }, mesafe: 10, hiza: icte ? "end" : "start", boyut: 14, kalin: true });
        c.kenarYazisi(O, B, "1", { uzak: C, mesafe: 13, boyut: 15, kalin: true, renk: RENK.turuncu });
        c.nokta(O); c.yazi(O, "A", { dx: -14, dy: -12, kalin: true, boyut: 17 });
        c.yazi(C, "C", { dx: 12, dy: 12, kalin: true, boyut: 15 });
      });

      ctx.secenekler({
        etiket: "Varsayım 1: sin α + cos α …", deger: null,
        liste: [{ deger: "bir", metin: "Her açıda 1'dir" }, { deger: "degisir", metin: "Açıya göre değişir" }],
        degisti: (v) => { iddia.toplam = v; kontrol(); },
      });
      ctx.secenekler({
        etiket: "Varsayım 2: sin²α + cos²α …", deger: null,
        liste: [{ deger: "bir", metin: "Her açıda 1'dir" }, { deger: "degisir", metin: "Açıya göre değişir" }],
        degisti: (v) => { iddia.kare = v; kontrol(); },
      });
      const f = formulListesi(ctx, ["sin α", "cos α", "sin α + cos α", "sin²α + cos²α", "-", "tan α", "sin α ÷ cos α", "tan α · cot α"]);
      ctx.dugmeler([{ metin: "📏 Ölçümü kaydet", ana: true, tik: kaydet }]);
      const tablo = ctx.tablo(["α", "sin + cos", "sin² + cos²", "tan", "sin ÷ cos"]);
      tablo.el.classList.add("mt-tablo");
      const sonuc = ctx.not("");

      function guncelle() {
        const t = trigOranlar(aci);
        h.ayarla("aci", `${aci}°`);
        const satir = [t.sin, t.cos, t.sin + t.cos, t.sin ** 2 + t.cos ** 2, t.tan, t.sin / t.cos, t.tan * t.cot];
        satir.forEach((v, i) => f.ayarla(i, sayi(v, 3)));
      }
      function kaydet() {
        if (olculen.has(aci)) { sonuc.innerHTML = `<p class="d-geri-bildirim yanlis">${aci}° zaten tabloda. B'yi başka bir açıya sürükle.</p>`; return; }
        olculen.add(aci);
        const t = trigOranlar(aci);
        tablo.satirEkle([`${aci}°`, sayi(t.sin + t.cos, 3), sayi(t.sin ** 2 + t.cos ** 2, 3), sayi(t.tan, 3), sayi(t.sin / t.cos, 3)]);
        kontrol();
      }
      function kontrol() {
        if (olculen.size < 4) { sonuc.innerHTML = `<p>${olculen.size}/4 açı ölçüldü.</p>`; return; }
        if (!iddia.toplam || !iddia.kare) { sonuc.innerHTML = "<p>Karşılaştırma için iki varsayımını da seç.</p>"; return; }
        const d1 = iddia.toplam === "degisir", d2 = iddia.kare === "bir";
        sonuc.innerHTML = `
          <p class="d-geri-bildirim ${d1 ? "dogru" : "yanlis"}">Varsayım 1: ${d1 ? "doğru, sin α + cos α açıya göre değişiyor." : "tablo bunu desteklemiyor: sin α + cos α her açıda farklı (45°'de ≈ 1,414)."}</p>
          <p class="d-geri-bildirim ${d2 ? "dogru" : "yanlis"}">Varsayım 2: ${d2 ? "doğru, sin²α + cos²α her açıda 1." : "tablo bunu desteklemiyor: sin²α + cos²α her satırda tam 1."}</p>
          <p><b>Neden?</b> Pisagor: (karşı)² + (komşu)² = (hipotenüs)². Hipotenüs 1 iken bu, <span class="formul">sin²α + cos²α = 1</span> olur.
          Son iki sütun da aynı: <span class="formul">tan α = sin α / cos α</span>. Ayrıca <span class="formul">tan α · cot α = 1</span>.</p>`;
        ctx.gorevTamam();
      }
      T.degisti(guncelle);
      guncelle();
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Özel açılar: 30°, 45°, 60°",
    cikti: "MAT.10.1.1-ç",
    anlatim: `
      <p>30°, 45° ve 60°'nin oranlarını hesap makinesi olmadan, <b>tam değer</b> olarak bulabiliriz.</p>
      <p><b>Eşkenar üçgen</b> (kenarı 2): bir köşeden yükseklik indirince üçgen 30°-60°-90° üçgenlerine ayrılır. Yüksekliği <b>Pisagor</b> ile bul.</p>
      <p><b>İkizkenar dik üçgen</b> (dik kenarları 1): açıları 45°'dir, hipotenüsü yine Pisagor ile bulunur.</p>
      <p>İki şekli incele ve tabloyu doldur.</p>`,
    gorev: "Tablodaki <b>12 hücrenin</b> hepsini doğru doldur.",
    ogretmen: "Programda sınıfın ikiye ayrılması; bir grubun eşkenar üçgenden, diğerinin ikizkenar dik üçgenden 30°, 45°, 60°'nin oranlarını bulup birbirine sunması öneriliyor. Tabloyu tahtada iki grubun sonuçlarını birleştirerek doldurun; sin 30° = cos 60° gibi eşitlikleri öğrencilerin kendisi fark etsin.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      const K3 = Math.sqrt(3);
      let sekil = "eskenar", yukseklik = false;
      const alanlar = {
        eskenar: { alan: { xmin: -1.45, xmax: 1.45, ymin: -0.4, ymax: 2.05 }, izgara: 0.5 },
        ikizkenar: { alan: { xmin: -0.45, xmax: 1.7, ymin: -0.35, ymax: 1.3 }, izgara: 0.5 },
      };
      T.goster(alanlar.eskenar);
      T.ciz((c) => {
        if (sekil === "eskenar") {
          const P = { x: -1, y: 0 }, Q = { x: 1, y: 0 }, R = { x: 0, y: K3 }, H = { x: 0, y: 0 };
          c.cokgen([P, Q, R], { dolgu: "rgba(79,195,247,.08)" });
          c.kenarYazisi(P, Q, "2", { uzak: R, boyut: 16 });
          c.kenarYazisi(P, R, "2", { uzak: Q, boyut: 16, hiza: "end" });
          c.aci(Q, P, R, { etiket: "60°", r: 30 });
          if (yukseklik) {
            c.cokgen([H, Q, R], { dolgu: "rgba(255,181,71,.16)", renk: null });
            c.parca(R, H, { renk: RENK.yesil, kalinlik: 3, kesikli: true });
            c.dikAci(Q, H, R);
            c.kenarYazisi(H, Q, "1", { uzak: R, boyut: 16, renk: RENK.turuncu });
            c.kenarYazisi(Q, R, "2", { uzak: H, boyut: 16, hiza: "start", renk: RENK.turuncu });
            c.kenarYazisi(H, R, "√3", { uzak: Q, boyut: 17, hiza: "end", renk: RENK.yesil, kalin: true });
            c.aci(H, Q, R, { etiket: "60°", r: 30, renk: RENK.turuncu });
            c.aci(H, R, Q, { etiket: "30°", r: 36, renk: RENK.pembe });
            c.yazi({ x: 0.55, y: 1.45 }, "Pisagor: 2² − 1² = 3", { hiza: "start", boyut: 14, renk: RENK.soluk });
          } else {
            c.kenarYazisi(Q, R, "2", { uzak: P, boyut: 16, hiza: "start" });
            c.aci(P, Q, R, { etiket: "60°", r: 30 });
            c.aci(P, R, Q, { etiket: "60°", r: 30 });
          }
          for (const [p, ad, dx, dy] of [[P, "A", -14, 12], [Q, "B", 14, 12], [R, "C", 0, -18]]) { c.nokta(p); c.yazi(p, ad, { dx, dy, kalin: true, boyut: 16 }); }
          if (yukseklik) { c.nokta(H); c.yazi(H, "H", { dy: 16, kalin: true, boyut: 16 }); }
        } else {
          const A = { x: 0, y: 0 }, C = { x: 1, y: 0 }, B = { x: 1, y: 1 };
          c.cokgen([A, C, B], { dolgu: "rgba(255,181,71,.14)" });
          c.dikAci(A, C, B);
          c.kenarYazisi(A, C, "1", { uzak: B, boyut: 16 });
          c.kenarYazisi(C, B, "1", { uzak: A, boyut: 16, hiza: "start" });
          c.kenarYazisi(A, B, "√2", { uzak: C, boyut: 17, hiza: "end", kalin: true, renk: RENK.yesil });
          c.aci(C, A, B, { etiket: "45°", r: 34 });
          c.aci(A, B, C, { etiket: "45°", r: 34, renk: RENK.pembe });
          c.yazi({ x: 0.2, y: 1.12 }, "Pisagor: 1² + 1² = 2", { hiza: "start", boyut: 14, renk: RENK.soluk });
          for (const [p, ad, dx, dy] of [[A, "A", -14, 12], [C, "C", 14, 12], [B, "B", 14, -12]]) { c.nokta(p); c.yazi(p, ad, { dx, dy, kalin: true, boyut: 16 }); }
        }
      });
      ctx.secenekler({
        etiket: "Şekil", deger: "eskenar",
        liste: [{ deger: "eskenar", metin: "Eşkenar üçgen (30°, 60°)" }, { deger: "ikizkenar", metin: "İkizkenar dik üçgen (45°)" }],
        degisti: (v) => { sekil = v; yBtn.hidden = v !== "eskenar"; T.goster(alanlar[v]); },
      });
      const [yBtn] = ctx.dugmeler([{ metin: "⟂ C'den yükseklik indir", tik: () => { yukseklik = true; yBtn.disabled = true; T.yenile(); } }]);
      const ip = {
        sin: { 30: "30°'nin karşısındaki kenar 1, hipotenüs 2.", 45: "İkizkenar dik üçgende karşı 1, hipotenüs √2: 1/√2 = √2/2.", 60: "60°'nin karşısındaki kenar √3, hipotenüs 2." },
        cos: { 30: "30°'ye komşu dik kenar √3 (yükseklik), hipotenüs 2.", 45: "Komşu 1, hipotenüs √2: 1/√2 = √2/2.", 60: "60°'ye komşu dik kenar 1, hipotenüs 2." },
        tan: { 30: "karşı / komşu = 1/√3; paydayı rasyonel yap: √3/3.", 45: "İki dik kenar eşit: 1/1.", 60: "karşı / komşu = √3/1." },
        cot: { 30: "komşu / karşı = √3/1.", 45: "İki dik kenar eşit: 1/1.", 60: "komşu / karşı = 1/√3 = √3/3." },
      };
      secimTablosu(ctx, {
        sutunlar: ["30°", "45°", "60°"],
        secenekler: ["1/2", "√2/2", "√3/2", "1", "√3", "√3/3"],
        satirlar: ["sin", "cos", "tan", "cot"].map((f) => ({ etiket: f, hucreler: [30, 45, 60].map((a) => ({ dogru: OZEL_DEGERLER[f][a], ipucu: `${f} ${a}°: ${ip[f][a]}` })) })),
        bitti: () => {
          sonuc.innerHTML = "<p>Tabloya bak: <b>sin 30° = cos 60°</b>, <b>sin 60° = cos 30°</b>. 30° ile 60° <b>tümler</b> açılardır. Ayrıca her sütunda tan · cot = 1.</p>";
          ctx.gorevTamam();
        },
      });
      const sonuc = ctx.not("");
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Önermeler: doğru mu, yanlış mı?",
    cikti: "MAT.10.1.1-ç",
    anlatim: `
      <p>Bir arkadaşın trigonometrik oranlar hakkında altı önerme yazdı. Hangileri <b>her dar açı</b> için doğru?</p>
      <p>Karar vermeden önce sahnedeki üçgende <b>B</b>'yi sürükleyerek önermeyi farklı açılarda sına. Bir önermenin yanlış olduğunu göstermek için tek bir <b>karşı örnek</b> yeter.</p>
      <p>B köşesindeki açı <b>90° − α</b>'dır: α ile tümlerdir.</p>`,
    gorev: "Altı önermenin hepsini doğru sınıflandır.",
    ogretmen: "Programın “önermeler sunar” ve “önermeleri değerlendirir” vurgusuna uygun olarak öğrencilerden kendi önermelerini yazmalarını da isteyebilirsiniz. Her yanlış önerme için bir karşı örnek açıyı tahtada gösterin.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(DIK_ALAN);
      const B = serbestDikUcgen(T, { x: 6, y: 4.5 });
      const h = hud(ctx, [
        { ad: "a", etiket: "α" }, { ad: "sin", etiket: "sin α" }, { ad: "cos", etiket: "cos α" },
        { ad: "tan", etiket: "tan α" }, { ad: "cot", etiket: "cot α" }, { ad: "cb", etiket: "cos(90° − α)" },
      ]);
      T.ciz((c) => dikUcgenCiz(c, B, "α", { ikiAci: true }));
      const guncelle = () => {
        const o = dikUcgenOranlari(B.y, B.x);
        h.ayarla("a", `${sayi(derece(Math.atan2(B.y, B.x)), 1)}°`);
        for (const ad of ["sin", "cos", "tan", "cot"]) h.ayarla(ad, sayi(o[ad], 3));
        h.ayarla("cb", sayi(B.y / o.hip, 3));
      };
      T.degisti(guncelle);
      guncelle();
      onermeler(ctx, [
        { metin: "sin α = cos(90° − α)", dogru: true, aciklama: "90° − α, B köşesindeki açıdır; α'nın karşı kenarı o açının komşu kenarıdır.", ipucu: "Göstergelerde sin α ile cos(90° − α)'yı karşılaştır." },
        { metin: "Her dar açı için sin α + cos α = 1", dogru: false, aciklama: "Karşı örnek: α = 45° iken sin α + cos α ≈ 1,414. Doğru olan sin²α + cos²α = 1.", ipucu: "α'yı 45°'ye yaklaştır ve iki değeri topla." },
        { metin: "tan α = sin α ÷ cos α", dogru: true, aciklama: "(karşı / hip.) ÷ (komşu / hip.) = karşı / komşu.", ipucu: "sin α'yı cos α'ya böl ve tan α ile karşılaştır." },
        { metin: "Dar açılarda α büyüdükçe cos α da büyür", dogru: false, aciklama: "α büyüdükçe komşu kenar hipotenüse göre kısalır, cos α azalır.", ipucu: "B'yi yukarı sürükle ve cos α'yı izle." },
        { metin: "tan α · cot α = 1", dogru: true, aciklama: "(karşı / komşu) · (komşu / karşı) = 1.", ipucu: "İki değeri çarp." },
        { metin: "Bir dar açının sinüsü 1'den büyük olabilir", dogru: false, aciklama: "Dik kenar her zaman hipotenüsten kısadır, bu yüzden 0 < sin α < 1.", ipucu: "Karşı kenar hipotenüsten uzun olabilir mi?" },
      ], () => ctx.gorevTamam());
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Birim çember: geniş açılar ve yönlü açı",
    cikti: "MAT.10.1.1-b",
    anlatim: `
      <p>Dik üçgende yalnızca dar açılar var. Peki <b>120°</b>'nin sinüsü nedir?</p>
      <p>Merkezi orijinde, yarıçapı 1 olan <b>birim çember</b> üzerinde <b>P</b> noktasını sürükle. OP ışınının x ekseniyle yaptığı açı θ'dır. Saat yönünün tersi <b>pozitif</b>, saat yönü <b>negatif</b> yöndür (<b>yönlü açı</b>).</p>
      <p>Dar açılarda gördüğümüz gibi <span class="formul">P = (cos θ, sin θ)</span>. Bu tanım her açı için geçerlidir; işaretler P'nin hangi bölgede olduğuna göre değişir.</p>`,
    gorev: "Listedeki üç açıyı birim çemberde bul.",
    ogretmen: "Programda “Geniş açıların trigonometrik oranları nasıl bulunur?” sorusundan hareketle birim çemberin tanıtılması, yönlü açının birim çember üzerindeki noktalarla ilişkilendirilmesi öneriliyor. P'yi ok tuşlarıyla 1° adımla da taşıyabilirsiniz.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster({ alan: { xmin: -1.45, xmax: 1.45, ymin: -1.28, ymax: 1.28 }, izgara: 0.5, eksen: true, eksenSayilari: 0.5 });
      let teta = 40;
      const P = T.nokta("P", {
        ...birimCemberNoktasi(teta), renk: RENK.turuncu,
        kisit: (p) => {
          teta = Math.max(-359, Math.min(360, Math.round(yonluAciAc(derece(Math.atan2(p.y, p.x)), teta))));
          return birimCemberNoktasi(teta);
        },
      });
      const dondur = (d) => { teta = Math.max(-359, Math.min(360, teta + d)); const q = birimCemberNoktasi(teta); P.ayarla(q.x, q.y); };
      const h = hud(ctx, [{ ad: "t", etiket: "θ" }, { ad: "cos", etiket: "cos θ (x)" }, { ad: "sin", etiket: "sin θ (y)" }, { ad: "tan", etiket: "tan θ" }]);
      T.ciz((c) => {
        const t = trigOranlar(teta), X = { x: t.cos, y: 0 }, Yy = { x: 0, y: t.sin }, Pn = { x: t.cos, y: t.sin };
        for (const [x, y, m] of [[0.95, 1.12, "I. bölge (+, +)"], [-0.95, 1.12, "II. bölge (−, +)"], [-0.95, -1.12, "III. bölge (−, −)"], [0.95, -1.12, "IV. bölge (+, −)"]]) c.yazi({ x, y }, m, { renk: RENK.soluk, boyut: 13 });
        c.cember(O, 1, { renk: "rgba(169,182,201,.7)", kalinlik: 2 });
        c.cokgen([O, X, Pn], { dolgu: "rgba(255,181,71,.10)", renk: null });
        c.parca(Pn, X, { renk: RENK.yesil, kalinlik: 1.6, kesikli: true });
        c.parca(Pn, Yy, { renk: RENK.mavi, kalinlik: 1.6, kesikli: true });
        c.parca(O, X, { renk: RENK.mavi, kalinlik: 5 });
        c.parca(O, Yy, { renk: RENK.yesil, kalinlik: 5 });
        c.parca(O, Pn, { kalinlik: 3 });
        c.yay(O, 0.26, 0, teta, { renk: RENK.turuncu, kalinlik: 2.5, ok: true });
        const yon = trigOranlar(teta / 2);
        c.yazi({ x: yon.cos * 0.42, y: yon.sin * 0.42 }, `θ = ${eksi(teta)}°`, { renk: RENK.turuncu, kalin: true, boyut: 15 });
        if (Math.abs(t.cos) > 0.12) c.yazi(X, `cos θ = ${sayi(t.cos, 2)}`, { renk: RENK.mavi, dy: t.sin >= 0 ? 18 : -18, boyut: 14, kalin: true });
        if (Math.abs(t.sin) > 0.12) c.yazi(Yy, `sin θ = ${sayi(t.sin, 2)}`, { renk: RENK.yesil, dx: t.cos >= 0 ? -10 : 10, hiza: t.cos >= 0 ? "end" : "start", boyut: 14, kalin: true });
      });
      ctx.dugmeler([
        { metin: "↻ −15°", tik: () => dondur(-15) }, { metin: "−1°", tik: () => dondur(-1) },
        { metin: "+1°", tik: () => dondur(1) }, { metin: "↺ +15°", tik: () => dondur(15) },
      ]);
      const liste = gorevListesi(ctx, [
        "<b>cos θ = −0,5</b> ve <b>sin θ &gt; 0</b> olan açı",
        "<b>sin θ = sin 30°</b> olan <b>geniş</b> açı",
        "Saat yönünde çeyrek tur: <b>θ = −90°</b>",
      ]);
      const sonuc = ctx.not("");
      const mod = (t) => ((t % 360) + 360) % 360;
      function guncelle() {
        const t = trigOranlar(teta);
        h.ayarla("t", `${eksi(teta)}°`); h.ayarla("cos", sayi(t.cos, 3)); h.ayarla("sin", sayi(t.sin, 3));
        h.ayarla("tan", Number.isFinite(t.tan) ? sayi(t.tan, 3) : "tanımsız");
        if (mod(teta) === 120) liste.isaretle(0);
        if (mod(teta) === 150) liste.isaretle(1);
        if (teta === -90) liste.isaretle(2);
        if (liste.hepsi() && !ctx.gorevTamamMi()) {
          sonuc.innerHTML = `<p class="d-geri-bildirim dogru">Üçünü de buldun!</p>
            <p>150° ile 30°'nin noktaları y eksenine göre simetrik: <span class="formul">sin(180° − θ) = sin θ</span>, <span class="formul">cos(180° − θ) = −cos θ</span>.
            −90°'de P = (0, −1): kosinüs 0 olduğu için tanjant tanımsızdır.</p>`;
          ctx.gorevTamam();
        }
      }
      T.degisti(guncelle);
      guncelle();
    },
  },

  /* 7 ------------------------------------------------------------------ */
  minareAdimi,

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Değerlendirme: trigonometri atölyesi",
    anlatim: `
      <p>Sekiz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>6 doğru</b> yaparsan dersi tamamlamış olursun. Yanlış yaptığın konular için ilgili adıma dönebilirsin.</p>`,
    gorev: "Değerlendirmede en az <b>6/8</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (çalışma kâğıdı, gerçek yaşam problemleri içeren performans görevi) uyumludur. Akıllı tahtada birlikte çözülüp her çeldiricinin hangi kavram yanılgısını hedeflediği tartışılabilir.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(DIK_ALAN);
      const ucgen = (karsi, komsu, etiketler) => (kap) => sekilCiz(kap, { alan: { xmin: -0.6, xmax: komsu + 2.2, ymin: -0.9, ymax: karsi + 0.6 }, izgara: 0 }, (c) => {
        const A = O, C = { x: komsu, y: 0 }, B = { x: komsu, y: karsi };
        c.cokgen([A, C, B], { dolgu: "rgba(79,195,247,.12)" });
        c.dikAci(A, C, B, { boyut: 10 });
        c.aci(C, A, B, { etiket: "α", r: 26 });
        c.kenarYazisi(A, C, etiketler[0], { uzak: B, renk: RENK.mavi });
        c.kenarYazisi(C, B, etiketler[1], { uzak: A, hiza: "start", renk: RENK.yesil });
        c.kenarYazisi(A, B, etiketler[2], { uzak: C, hiza: "end" });
      });
      ctx.sinav([
        {
          tur: "sayi", metin: "Şekildeki dik üçgende <b>sin α</b> kaçtır?",
          grafik: ucgen(3, 4, ["4", "3", "5"]), dogru: 0.6, tolerans: 0.001,
          aciklama: "sin α = karşı / hipotenüs = 3 / 5 = 0,6. (4/5 kosinüs olurdu.)",
        },
        {
          tur: "coktan", metin: "Bir dik üçgenin bütün kenarları <b>2 katına</b> çıkarılıyor. α açısının sinüsü ne olur?",
          siklar: ["2 katına çıkar", "4 katına çıkar", "Değişmez", "Yarıya iner"], dogru: 2,
          aciklama: "Yeni üçgen eskisine benzerdir; açılar ve kenarların oranları değişmez. Trigonometrik oranlar yalnızca açıya bağlıdır.",
        },
        {
          tur: "sayi", metin: "α bir dar açı ve <b>sin α = 0,8</b> ise <b>cos α</b> kaçtır?",
          dogru: 0.6, tolerans: 0.001,
          aciklama: "sin²α + cos²α = 1 → cos²α = 1 − 0,64 = 0,36 → cos α = 0,6 (dar açıda pozitif). 0,2 cevabı “sin α + cos α = 1” yanılgısından gelir.",
        },
        {
          tur: "coktan", metin: "Her dar açı α için hangisi <b>her zaman</b> doğrudur?",
          siklar: ["sin α + cos α = 1", "tan α · cot α = 1", "tan α = cos α ÷ sin α", "sin α > cos α"], dogru: 1,
          aciklama: "tan α · cot α = (karşı/komşu)·(komşu/karşı) = 1. tan α = sin α ÷ cos α olmalıdır; sin α > cos α ancak α > 45° iken doğrudur.",
        },
        {
          tur: "coktan", metin: "<b>sin 30° + cos 60°</b> işleminin sonucu kaçtır?",
          siklar: ["1/2", "1", "√3/2", "√3"], dogru: 1,
          aciklama: "sin 30° = 1/2 ve cos 60° = 1/2 (tümler açılar). Toplam 1.",
        },
        {
          tur: "sayi", metin: "α bir dar açı ve <b>sin α = cos 40°</b> ise α kaç derecedir?",
          dogru: 50, tolerans: 0.01, birim: "°",
          aciklama: "sin α = cos(90° − α) olduğundan 90° − α = 40°, α = 50°.",
        },
        {
          tur: "sayi", metin: "<b>10 m</b> uzunluğundaki bir itfaiye merdiveni yerle <b>60°</b> açı yapacak biçimde duvara yaslanıyor. Merdivenin ayağı duvardan kaç metre uzaktadır?",
          grafik: ucgen(Math.sqrt(3) * 2.5, 2.5, ["?", "duvar", "10 m"]), dogru: 5, tolerans: 0.01, birim: "m",
          aciklama: "Duvara uzaklık açının komşu dik kenarıdır: 10 · cos 60° = 10 · 1/2 = 5 m.",
        },
        {
          tur: "coktan", metin: "Birim çemberde <b>120°</b>'lik yönlü açının belirlediği P noktası hangisidir?",
          grafik: (kap) => sekilCiz(kap, { alan: { xmin: -1.4, xmax: 1.4, ymin: -1.2, ymax: 1.25 }, izgara: 0.5, eksen: true }, (c) => {
            c.cember(O, 1, { renk: RENK.soluk, kalinlik: 1.6 });
            const p = birimCemberNoktasi(120);
            c.parca(O, p, { kalinlik: 2.5 });
            c.yay(O, 0.3, 0, 120, { ok: true, kalinlik: 2 });
            c.nokta(p, { renk: RENK.turuncu, r: 6 }); c.yazi(p, "P", { dx: -14, dy: -10, kalin: true, renk: RENK.turuncu });
          }),
          siklar: ["(1/2, √3/2)", "(−1/2, √3/2)", "(−√3/2, 1/2)", "(−1/2, −√3/2)"], dogru: 1,
          aciklama: "P = (cos 120°, sin 120°). 120° ikinci bölgededir: cos 120° = −cos 60° = −1/2, sin 120° = sin 60° = √3/2.",
        },
      ], { baslik: "Trigonometri atölyesi", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: tahtaKur });
