// 10. Sınıf Matematik · 1. Tema: Geometrik Şekiller — C dersi
// MAT.10.1.3 Üçgenin alanının taban ve yüksekliğe bağlı değişimi · MAT.10.1.4 Sinüs ve kosinüs teoremleri
import { dersBaslat, el, sayi } from "../../../../engine/ders.js";
import { tahtaKur, sekilCiz, RENK } from "../ortak/tahta.js";
import { hud, gorevListesi, formulListesi, onermeler, ispatSirala, secimTablosu, trigHesap, sekilSayaci, kisa } from "../ortak/yardim.js";
import {
  uzaklik, fark, topla, olcekle, birimVektor, dikmeAyagi, parametre, kenarlar, acilar, alan, cevrelCember, agirlikMerkezi,
  alanFormulleri, ucgenTuru, radyan,
} from "../ortak/geometri.js";
import { IZGARA, yapistir, sinirla, ortakOlmayan, bolmeCizgileri, TARLA, solParselKirik, solParselDuz, paralelN } from "./model.js";
import { bogazAdimi } from "./bogaz.js";

const ALAN = { alan: { xmin: -6.2, xmax: 6.2, ymin: -3.4, ymax: 5.2 }, izgara: 1 };
const TUR_ADI = { dar: "dar açılı", dik: "dik açılı", genis: "geniş açılı" };

/** Sürüklenebilir üç köşe (ızgaraya yapışır, dejenere üçgene izin vermez) */
function ucgenNoktalari(T, baslangic) {
  const koseler = [];
  for (const [i, ad] of ["A", "B", "C"].entries()) {
    koseler.push(T.nokta(ad, {
      ...baslangic[i], adim: IZGARA,
      kisit: (q, kendisi) => {
        const r = { x: yapistir(q.x), y: yapistir(q.y) };
        const [P1, P2] = koseler.filter((k) => k !== kendisi);
        const { a, b, c } = kenarlar(r, P1, P2);
        return alan(r, P1, P2) >= 1.2 && Math.min(a, b, c) >= 1.25 ? r : null;
      },
    }));
  }
  return koseler;
}
const ucgenCiz = (c, A, B, C, dolgu = "rgba(79,195,247,.08)") => c.cokgen([A, B, C], { dolgu });
/** Noktanın etiketini, başka bir noktadan uzağa doğru yaz */
function etiket(c, P, metin, uzak, renk = RENK.kenar, px = 18) {
  const d = birimVektor(fark(P, uzak));
  c.nokta(P, { renk });
  c.yazi(P, metin, { dx: d.x * px, dy: -d.y * px, renk, kalin: true, boyut: 16 });
}
function acKapa(btn, acik) { btn.setAttribute("aria-pressed", String(acik)); }
const dereceYaz = (v, o = 1) => `${kisa(v, o)}°`;

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Taban ve yükseklik değişince alan",
    cikti: "MAT.10.1.3-a",
    anlatim: `
      <p>Üçgenin alanı bir kenarına (<b>taban</b>, a) ve o kenara ait <b>yüksekliğe</b> (h) bağlıdır. Peki biri değişirken öbürü sabit kalırsa alan nasıl değişir?</p>
      <p>İki deney yapacağız. Her deneyden önce bir <b>varsayımda</b> bulun, sonra noktayı sürükleyip ölçümleri grafikte izle.</p>`,
    gorev: "İki varsayımı seç ve her deneyde <b>en az 4 farklı ölçüm</b> al.",
    ogretmen: "Programda matematik yazılımıyla bir kenar sabit tutulup yüksekliğin, ya da yükseklik sabit tutulup kenarın değiştirilmesiyle alandaki değişime dair varsayımda bulunulması öneriliyor (MAB5). Varsayımları ölçümden önce tahtaya yazdırın; grafik çizildikten sonra sınıfla karşılaştırın.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      let mod = null, zorla = false;
      const iddia = { h: null, a: null }, olcum = { h: new Map(), a: new Map() };
      const [g] = ctx.grafikler([{ baslik: "Alan – değişen uzunluk", x: { etiket: "değişen uzunluk (h ya da a)", min: 0, max: 10 }, y: { etiket: "alan", min: 0, max: 24 } }]);
      const s1 = g.seri("Deney 1: h değişiyor (a = 6)", { renk: RENK.turuncu, nokta: true });
      const s2 = g.seri("Deney 2: a değişiyor (h = 4)", { renk: RENK.mavi, nokta: true });
      g.not([{ x: 0.2, y: 24, dy: 6, metin: "● Deney 1: h değişiyor (a = 6)", renk: RENK.turuncu }, { x: 0.2, y: 24, dy: 20, metin: "● Deney 2: a değişiyor (h = 4)", renk: RENK.mavi }]);
      const h = hud(ctx, [{ ad: "a", etiket: "Taban a" }, { ad: "h", etiket: "Yükseklik h" }, { ad: "s", etiket: "Alan = a·h/2" }, { ad: "m", etiket: "Sürükle" }]);
      T.goster({ alan: { xmin: -1, xmax: 11, ymin: -1.2, ymax: 8.2 }, izgara: 1 });
      const B = { x: 0, y: 0 };
      const A = T.nokta("A", { x: 2, y: 4, adim: 0.5, kisit: (q, n) => (zorla ? q : mod === "h" ? { x: n.x, y: sinirla(yapistir(q.y, 0.5), 1, 7.5) } : null) });
      const C = T.nokta("C", { x: 6, y: 0, adim: 0.5, kisit: (q, n) => (zorla ? q : mod === "a" ? { x: sinirla(yapistir(q.x, 0.5), 1, 10), y: 0 } : null) });
      T.ciz((c) => {
        const H = { x: A.x, y: 0 };
        c.cokgen([A, B, C], { dolgu: "rgba(79,195,247,.12)" });
        if (H.x > C.x) c.parca(C, H, { renk: RENK.soluk, kesikli: true, kalinlik: 1.5 });
        c.parca(A, H, { renk: mod === "h" ? RENK.turuncu : RENK.soluk, kesikli: "6 5", kalinlik: 2 });
        if (A.x !== C.x) c.dikAci(A, H, H.x < C.x ? C : B, { boyut: 11 });
        c.parca(B, C, { renk: mod === "a" ? RENK.mavi : RENK.kenar, kalinlik: 4 });
        c.kenarYazisi(B, C, `a = ${kisa(C.x)}`, { uzak: A, renk: RENK.mavi, kalin: true, mesafe: 18 });
        c.yazi({ x: A.x, y: A.y / 2 }, `h = ${kisa(A.y)}`, { dx: 10, hiza: "start", renk: RENK.turuncu, kalin: true });
        etiket(c, B, "B", A);
        if (!mod) c.yazi({ x: 5, y: 7.4 }, "Bir deney seç →", { renk: RENK.soluk, boyut: 15 });
      });
      ctx.secenekler({
        etiket: "Varsayım 1: a sabitken h iki katına çıkarsa alan…", deger: null,
        liste: [{ deger: "2", metin: "2 katına çıkar" }, { deger: "4", metin: "4 katına çıkar" }, { deger: "0", metin: "Değişmez" }],
        degisti: (v) => { iddia.h = v; liste.isaretle(0, iddia.h && iddia.a); bitir(); },
      });
      ctx.secenekler({
        etiket: "Varsayım 2: h sabitken a yarıya inerse alan…", deger: null,
        liste: [{ deger: "2", metin: "Yarıya iner" }, { deger: "4", metin: "Dörtte birine iner" }, { deger: "0", metin: "Değişmez" }],
        degisti: (v) => { iddia.a = v; liste.isaretle(0, iddia.h && iddia.a); bitir(); },
      });
      const [d1, d2] = ctx.dugmeler([
        { metin: "Deney 1: tabanı sabit tut", tik: () => modSec("h") },
        { metin: "Deney 2: yüksekliği sabit tut", tik: () => modSec("a") },
      ]);
      const liste = gorevListesi(ctx, ["İki varsayımını seç", "Deney 1: A'yı yukarı-aşağı sürükle (4 ölçüm)", "Deney 2: C'yi sağa-sola sürükle (4 ölçüm)"]);
      const sonuc = ctx.not("");
      function modSec(m) {
        mod = m;
        acKapa(d1, m === "h"); acKapa(d2, m === "a");
        zorla = true; A.ayarla(2, 4); C.ayarla(6, 0); zorla = false;
        kaydet();
      }
      function kaydet() {
        if (mod === "h") olcum.h.set(A.y, 3 * A.y);
        if (mod === "a") olcum.a.set(C.x, 2 * C.x);
        const sirali = (m) => [...m.entries()].sort((p, q) => p[0] - q[0]);
        s1.ayarla(sirali(olcum.h)); s2.ayarla(sirali(olcum.a));
        liste.isaretle(1, olcum.h.size >= 4); liste.isaretle(2, olcum.a.size >= 4);
        bitir();
      }
      function guncelle() {
        h.ayarla("a", kisa(C.x)); h.ayarla("h", kisa(A.y)); h.ayarla("s", kisa((C.x * A.y) / 2));
        h.ayarla("m", mod === "h" ? "A ↕" : mod === "a" ? "C ↔" : "—");
      }
      function bitir() {
        if (!liste.hepsi() || ctx.gorevTamamMi()) return;
        const v1 = iddia.h === "2", v2 = iddia.a === "2";
        sonuc.innerHTML = `<p class="d-geri-bildirim ${v1 ? "dogru" : "yanlis"}">Varsayım 1 ${v1 ? "doğrulandı" : "ölçümlerle çelişiyor"}: a = 6 iken alan = 3·h, h iki katına çıkınca alan da iki katına çıkar.</p>
          <p class="d-geri-bildirim ${v2 ? "dogru" : "yanlis"}">Varsayım 2 ${v2 ? "doğrulandı" : "ölçümlerle çelişiyor"}: h = 4 iken alan = 2·a, a yarıya inince alan da yarıya iner.</p>
          <p>İki grafik de <b>başlangıçtan geçen birer doğru</b>: alan, sabit tutulmayan elemanla <b>doğru orantılı</b>dır.</p>`;
        ctx.gorevTamam();
      }
      T.degisti(guncelle);
      T.birakti(kaydet);
      guncelle();
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Paralel doğrular arasında ortak taban",
    cikti: "MAT.10.1.3-b",
    anlatim: `
      <p><b>d₁ ∥ d₂</b>. BC tabanı d₁ üzerinde sabit; A ve D tepe noktaları d₂ üzerinde kayabiliyor.</p>
      <p>ABC ve DBC üçgenlerinin tabanı ortak. Tepe noktası d₂ boyunca kayarken alan değişir mi? Varsayımını seç ve farklı konumlarda dene.</p>`,
    gorev: "Varsayımını seç, A'yı farklı yerlere taşı, ortak olmayan bölgeleri incele ve problemi çöz.",
    ogretmen: "Programda paralel doğrular arasında ortak tabanlı iki üçgenin alanlarının ve ortak olmayan bölgelerinin alanlarının eşit olduğuna ulaşılması bekleniyor. Öğrencilere “yükseklik nedir, burada neden değişmiyor?” sorusunu sorun; yamuk problemi bu genellemenin yeni bir duruma aktarılmasıdır.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      const h = hud(ctx, [{ ad: "abc", etiket: "Alan(ABC)" }, { ad: "dbc", etiket: "Alan(DBC)" }, { ad: "sol", etiket: "Pembe bölge" }, { ad: "sag", etiket: "Yeşil bölge" }]);
      T.goster({ alan: { xmin: -7, xmax: 7, ymin: -1.2, ymax: 5.6 }, izgara: 1 });
      const B = { x: -3, y: 0 }, C = { x: 3, y: 0 }, Y = 4;
      const kisit = (q) => ({ x: sinirla(yapistir(q.x), -6.5, 6.5), y: Y });
      const A = T.nokta("A", { x: -4.5, y: Y, kisit, adim: IZGARA, renk: RENK.turuncu });
      const D = T.nokta("D", { x: 1.5, y: Y, kisit, adim: IZGARA, renk: RENK.mavi });
      let bolge = false, iddia = null;
      const konumlar = new Set([A.x]);
      T.ciz((c) => {
        c.dogru({ x: 0, y: 0 }, { x: 1, y: 0 }, { renk: RENK.soluk, kalinlik: 1.5 });
        c.dogru({ x: 0, y: Y }, { x: 1, y: Y }, { renk: RENK.soluk, kalinlik: 1.5 });
        c.yazi({ x: 6.6, y: 0 }, "d₁", { dy: -14, renk: RENK.soluk, boyut: 16 });
        c.yazi({ x: 6.6, y: Y }, "d₂", { dy: -14, renk: RENK.soluk, boyut: 16 });
        const o = ortakOlmayan(A, D, B, C);
        if (bolge && o) {
          c.cokgen(o.sol, { dolgu: "rgba(255,143,199,.45)", renk: RENK.pembe, kalinlik: 1.5 });
          c.cokgen(o.sag, { dolgu: "rgba(90,211,139,.45)", renk: RENK.yesil, kalinlik: 1.5 });
          etiket(c, o.K, "K", { x: o.K.x, y: 0 }, RENK.sari);
        }
        c.cokgen([A, B, C], { dolgu: bolge ? "none" : "rgba(255,181,71,.18)", renk: RENK.turuncu, kalinlik: 2.5 });
        c.cokgen([D, B, C], { dolgu: bolge ? "none" : "rgba(79,195,247,.18)", renk: RENK.mavi, kalinlik: 2.5 });
        // ortak yükseklik
        c.parca({ x: 0, y: Y }, { x: 0, y: 0 }, { renk: RENK.kenar, kesikli: "4 5", kalinlik: 1.5 });
        c.dikAci({ x: 0, y: Y }, { x: 0, y: 0 }, C, { boyut: 10 });
        c.yazi({ x: 0, y: Y / 2 }, "h = 4", { dx: 8, hiza: "start", kalin: true });
        c.kenarYazisi(B, C, "BC = 6", { uzak: A, kalin: true, mesafe: 18 });
        etiket(c, B, "B", { x: 0, y: 2 }); etiket(c, C, "C", { x: 0, y: 2 });
      });
      ctx.secenekler({
        etiket: "Varsayımın: A, d₂ üzerinde kayarken ABC'nin alanı…", deger: null,
        liste: [{ deger: "sabit", metin: "Değişmez" }, { deger: "ust", metin: "A, BC'nin tam üstündeyken en büyüktür" }, { deger: "uzak", metin: "A uzaklaştıkça küçülür" }],
        degisti: (v) => { iddia = v; liste.isaretle(0); kontrol(); },
      });
      const [bBtn] = ctx.dugmeler([{ metin: "Ortak olmayan bölgeler", tik: () => { bolge = !bolge; acKapa(bBtn, bolge); if (bolge) liste.isaretle(2); T.yenile(); guncelle(); kontrol(); } }]);
      acKapa(bBtn, false);
      const liste = gorevListesi(ctx, ["Varsayımını seç", "A'yı en az 3 farklı yere taşı (biri tabanın dışında olsun)", "Ortak olmayan bölgeleri göster", "Problemi çöz"]);
      const sonuc = ctx.not("");
      const soruKap = el("div");
      ctx.kontroller.append(soruKap);
      let soruAcildi = false;
      function guncelle() {
        h.ayarla("abc", kisa(alan(A, B, C))); h.ayarla("dbc", kisa(alan(D, B, C)));
        const o = bolge ? ortakOlmayan(A, D, B, C) : null;
        h.ayarla("sol", o ? kisa(o.alanSol) : "—"); h.ayarla("sag", o ? kisa(o.alanSag) : "—");
      }
      function kontrol() {
        if (!liste.tamamMi(0) || !liste.tamamMi(1) || !liste.tamamMi(2) || soruAcildi) return;
        soruAcildi = true;
        const d = iddia === "sabit";
        sonuc.innerHTML = `<p class="d-geri-bildirim ${d ? "dogru" : "yanlis"}">${d ? "Varsayımın doğrulandı." : "Ölçümler varsayımını desteklemiyor."} Taban ortak ve d₂'nin d₁'e uzaklığı (yükseklik) her yerde 4 olduğundan alan hep <b>½ · 6 · 4 = 12</b>.</p>
          <p><b>Genelleme:</b> Paralel doğrular arasında ortak tabanlı üçgenlerin alanları eşittir. İkisinden ortak KBC üçgeni çıkarılırsa kalan <b>pembe ve yeşil bölgelerin alanları da eşit</b> olur.</p>`;
        soruKap.append(ctx.sayiSorusu({
          etiket: "ABCD yamuğunda AD ∥ BC'dir. Köşegenler K noktasında kesişiyor. Alan(ABK) = 9 m² ise <b>Alan(DKC)</b> kaç m²'dir?",
          birim: "m²",
          kontrol: (v) => {
            if (Math.abs(v - 9) < 0.01) { liste.isaretle(3); ctx.gorevTamam(); return true; }
            if (Math.abs(v - 18) < 0.01 || Math.abs(v - 4.5) < 0.01) return "ABC ve DBC'nin ortak bölgesi KBC'dir; onu ikisinden de çıkar.";
            return "Alan(ABC) = Alan(DBC) (ortak taban BC, aynı yükseklik). İkisinden de Alan(KBC)'yi çıkar.";
          },
          dogruMesaj: "Doğru! Alan(ABK) = Alan(ABC) − Alan(KBC) = Alan(DBC) − Alan(KBC) = Alan(DKC) = 9 m².",
        }).el);
      }
      T.degisti(guncelle);
      T.birakti((n) => {
        if (n === A) konumlar.add(A.x);
        if (konumlar.size >= 3 && [...konumlar].some((x) => x < B.x || x > C.x)) liste.isaretle(1);
        kontrol();
      });
      guncelle();
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Benzer üçgenlerin alanları",
    cikti: "MAT.10.1.3-c",
    anlatim: `
      <p>Sağdaki üçgen, soldakinin her kenarı <b>k</b> katına çıkarılarak elde edildi: iki üçgen <b>benzer</b>, benzerlik oranı k.</p>
      <p>Kenarlar k katına çıkınca alan kaç katına çıkar? Önce varsayımını seç, sonra k'yi değiştirip <b>genellemeni varsayımınla karşılaştır</b>.</p>`,
    gorev: "Varsayımını seç; k = 2, k = 3 ve tam sayı olmayan bir k dene; sonra problemi çöz.",
    ogretmen: "Programda benzer üçgenlerin alanları oranının benzerlik oranının karesine eşit olduğuna ulaşılması bekleniyor. Tam sayı k için büyük üçgenin k² eş küçük üçgene bölünmesi görsel bir gerekçedir; tam sayı olmayan k için ½·(ka)·(kh) = k²·½·a·h hesabını tahtada yapın.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster({ alan: { xmin: -0.6, xmax: 14, ymin: -0.9, ymax: 8.6 }, izgara: 1 });
      const B1 = { x: 0, y: 0 }, C1 = { x: 2.4, y: 0 }, O = { x: 3.6, y: 0 };
      const A1 = T.nokta("A", { x: 0.8, y: 1.8, adim: 0.1, kisit: (q) => ({ x: sinirla(yapistir(q.x, 0.1), 0.2, 2.4), y: sinirla(yapistir(q.y, 0.1), 0.8, 2) }) });
      let k = 1, iddia = null;
      const denenen = new Set();
      const buyut = (P) => topla(O, olcekle(fark(P, B1), k));
      T.ciz((c) => {
        const [A2, B2, C2] = [A1, B1, C1].map(buyut);
        c.cokgen([A1, B1, C1], { dolgu: "rgba(255,181,71,.3)", renk: RENK.turuncu });
        c.cokgen([A2, B2, C2], { dolgu: "rgba(79,195,247,.12)", renk: RENK.mavi });
        if (Number.isInteger(k) && k > 1) for (const [p, q] of bolmeCizgileri(A2, B2, C2, k)) c.parca(p, q, { renk: "rgba(255,181,71,.7)", kalinlik: 1.4 });
        c.kenarYazisi(B1, C1, "a", { uzak: A1, renk: RENK.turuncu, kalin: true });
        c.kenarYazisi(B2, C2, `${kisa(k)}·a`, { uzak: A2, renk: RENK.mavi, kalin: true });
        c.yazi(topla(agirlikMerkezi(A1, B1, C1), { x: 0, y: 0 }), "S₁", { renk: RENK.kenar, kalin: true, boyut: 14 });
        if (!(Number.isInteger(k) && k > 1)) c.yazi(agirlikMerkezi(A2, B2, C2), "S₂", { renk: RENK.kenar, kalin: true, boyut: 18 });
        c.yazi({ x: O.x + 0.2, y: 8.1 }, Number.isInteger(k) && k > 1 ? `${k}² = ${k * k} tane eş küçük üçgen` : `k = ${kisa(k)} → k² = ${kisa(k * k, 4)}`, { hiza: "start", renk: RENK.sari, kalin: true });
      });
      ctx.secenekler({
        etiket: "Varsayımın: benzerlik oranı 3 ise S₂ ÷ S₁ kaçtır?", deger: null,
        liste: [{ deger: 3, metin: "3" }, { deger: 6, metin: "6" }, { deger: 9, metin: "9" }, { deger: 27, metin: "27" }],
        degisti: (v) => { iddia = v; liste.isaretle(0); kontrol(); },
      });
      ctx.kaydirici({ etiket: "Benzerlik oranı k", min: 1, max: 4, adim: 0.5, deger: 1, degisti: (v) => { k = v; denenen.add(v); T.yenile(); guncelle(); kontrol(); } });
      const f = formulListesi(ctx, ["Küçük alan S₁", "Büyük alan S₂", "S₂ ÷ S₁", "k²"]);
      const liste = gorevListesi(ctx, ["Varsayımını seç", "k = 2 dene", "k = 3 dene", "Tam sayı olmayan bir k dene", "Problemi çöz"]);
      const sonuc = ctx.not("");
      const soruKap = el("div");
      ctx.kontroller.append(soruKap);
      let acildi = false;
      function guncelle() {
        const s1 = alan(A1, B1, C1), s2 = s1 * k * k;
        f.ayarla(0, kisa(s1, 3)); f.ayarla(1, kisa(s2, 3)); f.ayarla(2, kisa(s2 / s1, 3)); f.ayarla(3, kisa(k * k, 3));
      }
      function kontrol() {
        liste.isaretle(1, denenen.has(2)); liste.isaretle(2, denenen.has(3));
        liste.isaretle(3, [...denenen].some((v) => !Number.isInteger(v)));
        if (acildi || ![0, 1, 2, 3].every((i) => liste.tamamMi(i))) return;
        acildi = true;
        const yorum = { 9: "Varsayımın genellemeyle örtüşüyor.", 3: "Varsayımın genellemeyle çelişiyor: kenarlar 3 katına çıkar ama alan iki yönde (taban ve yükseklik) büyüdüğü için 3·3 = 9 katına çıkar.", 6: "Varsayımın genellemeyle çelişiyor: alan 3 + 3 değil, 3 · 3 = 9 katına çıkar.", 27: "Varsayımın genellemeyle çelişiyor: 27 = 3³, hacim için geçerlidir. Alan iki boyutludur: 3² = 9." }[iddia];
        sonuc.innerHTML = `<p class="d-geri-bildirim ${iddia === 9 ? "dogru" : "yanlis"}">${yorum}</p>
          <p><b>Genelleme:</b> Benzer üçgenlerin alanları oranı, benzerlik oranının karesidir: <span class="formul">S₂ / S₁ = k²</span>. Taban k·a, yükseklik k·h olur: ½·(k·a)·(k·h) = k²·(½·a·h).</p>`;
        soruKap.append(ctx.sayiSorusu({
          etiket: "Bir fotoğraf her yönde <b>3 katına</b> büyütülüyor. Fotoğraftaki üçgen bölgenin alanı 5 cm² ise büyütülmüş fotoğrafta bu bölgenin alanı kaç cm²'dir?",
          birim: "cm²",
          kontrol: (v) => {
            if (Math.abs(v - 45) < 0.01) { liste.isaretle(4); ctx.gorevTamam(); return true; }
            if (Math.abs(v - 15) < 0.01) return "Alan 3 katına değil, 3² katına çıkar.";
            if (Math.abs(v - 135) < 0.01) return "3³ hacim için geçerlidir; alan için k² kullan.";
            return "S₂ = k² · S₁ ile hesapla.";
          },
          dogruMesaj: "Doğru! S₂ = 3² · 5 = 45 cm².",
        }).el);
      }
      T.degisti(guncelle);
      guncelle();
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Sinüslü alan formülü ve önermeler",
    cikti: "MAT.10.1.3-ç",
    anlatim: `
      <p>C'den AB'ye inen yükseklik <b>h = b · sin A</b> olarak yazılabilir (AHC dik üçgeni). Bunu ½ · taban · yükseklik içine koyunca yeni bir alan bağıntısı çıkar:</p>
      <p class="formul">Alan = ½ · b · c · sin A</p>
      <p>C'yi sürükleyerek A açısını değiştir; altı formülün hep aynı sonucu verdiğini gör. Sonra gözlemlerinden yola çıkarak önermeleri değerlendir.</p>`,
    gorev: "A açısını dar, dik ve geniş yap; önermeleri değerlendir; problemi çöz.",
    ogretmen: "Programda üçgenin bir yüksekliği sinüs yardımıyla ifade edildiğinde farklı bir alan bağıntısı oluştuğuna ulaşılması ve elde edilen genellemelerin önerme olarak ifade edilmesi bekleniyor. Geniş açıda yüksekliğin ayağı uzantıya düşer: h = b · sin(180° − A) = b · sin A olduğunu vurgulayın.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      const [g] = ctx.grafikler([{ baslik: "Alan – A açısı (b ve c sabit)", x: { etiket: "A (°)", min: 0, max: 180 }, y: { etiket: "alan", min: 0, max: 20 } }]);
      const egri = g.seri("½·b·c·sin A", { renk: RENK.mavi, kesikli: true, kalinlik: 2 });
      const simdi = g.seri("şimdiki üçgen", { renk: RENK.turuncu, nokta: true });
      T.goster({ alan: { xmin: -6.5, xmax: 8.5, ymin: -1, ymax: 6.6 }, izgara: 1 });
      const A = { x: 0, y: 0 };
      const B = T.nokta("B", { x: 6, y: 0, adim: IZGARA, kisit: (q) => ({ x: sinirla(yapistir(q.x), 2, 8), y: 0 }) });
      const C = T.nokta("C", {
        x: 2.5, y: 4, adim: IZGARA,
        kisit: (q) => { const r = { x: sinirla(yapistir(q.x), -6, 8), y: sinirla(yapistir(q.y), 0.75, 6) }; return Math.hypot(r.x, r.y) >= 1.5 ? r : null; },
      });
      T.ciz((c) => {
        const H = { x: C.x, y: 0 };
        c.cokgen([A, B, C], { dolgu: "rgba(79,195,247,.1)" });
        if (C.x < 0) c.parca(A, H, { renk: RENK.soluk, kesikli: true, kalinlik: 1.5 });
        if (C.x > B.x) c.parca(B, H, { renk: RENK.soluk, kesikli: true, kalinlik: 1.5 });
        c.parca(C, H, { renk: RENK.turuncu, kalinlik: 2.5 });
        if (Math.abs(C.x) > 0.05) c.dikAci(C, H, A, { boyut: 10, renk: RENK.turuncu });
        c.aci(B, A, C, { r: 30, renk: RENK.sari, etiket: "A", etiketPay: 14 });
        c.yazi({ x: C.x, y: C.y / 2 }, "h = b·sin A", { dx: C.x < 0 ? -10 : 10, hiza: C.x < 0 ? "end" : "start", renk: RENK.turuncu, kalin: true, boyut: 14 });
        c.kenarYazisi(A, C, `b = ${kisa(uzaklik(A, C))}`, { uzak: B, kalin: true });
        // c etiketi, H'nin etiketiyle çakışmasın diye gerekirse B'ye doğru kayar
        const cx = Math.abs(H.x - B.x / 2) < 1.4 ? (H.x < B.x / 2 ? B.x * 0.8 : B.x * 0.22) : B.x / 2;
        c.yazi({ x: cx, y: 0 }, `c = ${kisa(B.x)}`, { dy: 18, kalin: true });
        if (Math.abs(C.x) > 0.05) { c.nokta(H, { renk: RENK.turuncu }); c.yazi(H, "H", { dx: C.x < 0 ? -12 : 12, dy: 16, renk: RENK.turuncu, kalin: true, boyut: 16 }); }
        etiket(c, A, "A", agirlikMerkezi(A, B, C), RENK.sari);
      });
      const h = hud(ctx, [{ ad: "a", etiket: "A açısı" }, { ad: "s", etiket: "Alan" }]);
      const f = formulListesi(ctx, ["½ · a · h<sub>a</sub>", "½ · b · h<sub>b</sub>", "½ · c · h<sub>c</sub>", "-", "½ · b · c · sin A", "½ · a · c · sin B", "½ · a · b · sin C"]);
      const liste = gorevListesi(ctx, ["A açısını <b>dar</b> yap", "A açısını <b>dik</b> yap", "A açısını <b>geniş</b> yap", "Önermeleri değerlendir", "Problemi çöz"]);
      ctx.not("<p><b>Önermeler:</b> Doğru mu, yanlış mı?</p>");
      onermeler(ctx, [
        { metin: "İki kenarı ve aradaki açısı bilinen üçgenin alanı ½ · b · c · sin A'dır.", dogru: true, aciklama: "Yükseklik b · sin A olduğundan ½ · c · (b · sin A).", ipucu: "Altı formülün değerlerine bak." },
        { metin: "Kolları aynı, aradaki açısı 30° ve 150° olan iki üçgenin alanları eşittir.", dogru: true, aciklama: "sin 150° = sin 30° = ½; grafik 90°'ye göre simetriktir.", ipucu: "Grafikte 30° ile 150°'nin yüksekliklerini karşılaştır." },
        { metin: "Kollar sabitken aradaki açı büyüdükçe alan hep artar.", dogru: false, aciklama: "Alan 90°'ye kadar artar, sonra azalır.", ipucu: "C'yi geniş açı tarafına sürükle ve alanı izle." },
        { metin: "Tabanı ve o tabana ait yüksekliği aynı olan tüm üçgenlerin alanları eşittir.", dogru: true, aciklama: "Alan = ½ · taban · yükseklik; şekil farklı olsa bile.", ipucu: "Paralel doğrular arasındaki üçgenleri hatırla." },
        { metin: "Benzerlik oranı 2 olan iki üçgenin alanları oranı 2'dir.", dogru: false, aciklama: "Alanlar oranı 2² = 4'tür.", ipucu: "Bir önceki adımda k = 2 iken S₂ ÷ S₁ kaçtı?" },
      ], () => { liste.isaretle(3); bitir(); });
      const soruKap = el("div");
      ctx.kontroller.append(soruKap);
      soruKap.append(ctx.sayiSorusu({
        etiket: "İki kenarı <b>6</b> ve <b>5</b> birim olan üçgenlerin alabileceği <b>en büyük alan</b> kaç birim²'dir?",
        kontrol: (v) => {
          if (Math.abs(v - 15) < 0.01) { liste.isaretle(4); bitir(); return true; }
          if (Math.abs(v - 30) < 0.01) return "½'yi unuttun: alan = ½ · 6 · 5 · sin A.";
          return "sin A'nın en büyük değeri 1'dir (A = 90°).";
        },
        dogruMesaj: "Doğru! sin A ≤ 1 olduğundan en büyük alan ½ · 6 · 5 · 1 = 15 (A = 90°).",
      }).el);
      const sonuc = ctx.not("");
      function guncelle() {
        const ac = acilar(A, B, C), { b, c } = kenarlar(A, B, C);
        const fo = alanFormulleri(A, B, C);
        [...fo.tabanYukseklik, ...fo.sinuslu].forEach((v, i) => f.ayarla(i, kisa(v, 2)));
        h.ayarla("a", dereceYaz(ac.A)); h.ayarla("s", kisa(alan(A, B, C)));
        const ust = Math.max(10, Math.ceil((b * c) / 2 / 5) * 5);
        g.eksenAyarla({ y: { max: ust } });
        g.not([{ x: 4, y: ust, dy: 6, metin: "- - ½·b·c·sin A", renk: RENK.mavi }, { x: 4, y: ust, dy: 20, metin: "● şimdiki üçgen", renk: RENK.turuncu }]);
        egri.ayarla(Array.from({ length: 91 }, (_, i) => [i * 2, (b * c * Math.sin(radyan(i * 2))) / 2]));
        simdi.ayarla([[ac.A, alan(A, B, C)]]);
        const tur = Math.abs(ac.A - 90) < 0.5 ? 1 : ac.A < 90 ? 0 : 2;
        liste.isaretle(tur);
        bitir();
      }
      function bitir() {
        if (!liste.hepsi() || ctx.gorevTamamMi()) return;
        sonuc.innerHTML = `<p class="d-geri-bildirim dogru">Önermelerin tamam!</p><p>Alan; bir kenar ve o kenara ait yüksekliğe ya da iki kenar ile aralarındaki açıya bağlıdır.</p>`;
        ctx.gorevTamam();
      }
      T.degisti(guncelle);
      guncelle();
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Tarla sınırını düzelt",
    cikti: "MAT.10.1.3-d",
    anlatim: `
      <p>İki komşu tarlanın arasındaki sınır <b>A – M – B</b> diye kırılıyor; traktör sürmek zor. Komşular sınırı A'dan alt kenardaki bir <b>N</b> noktasına giden <b>düz</b> bir çizgiyle değiştirmek istiyor; ama kimsenin toprağı azalmamalı.</p>
      <p>Ölçek: 1 kare = 10 m × 10 m. N'yi nereye koymalıyız? Önce AB'yi çiz; sonra M'den AB'ye bir <b>paralel</b> çizmenin neden işe yaradığını düşün.</p>`,
    gorev: "AB'yi ve M'den geçen paraleli çiz, N'yi doğru yere taşı ve soruyu yanıtla.",
    ogretmen: "Programda alan önermelerinin gerçek yaşam problemleri bağlamında değerlendirilmesi bekleniyor. ABM ve ABN üçgenleri AB tabanını paylaşır ve tepe noktaları AB'ye paralel bir doğru üzerindedir; alanları eşit olduğundan parsel alanları değişmez. Sınıfta kâğıt üzerinde cetvel ve gönye ile aynı inşayı yaptırın.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      const h = hud(ctx, [{ ad: "eski", etiket: "1. parsel (eski sınır)" }, { ad: "yeni", etiket: "1. parsel (A–N sınırı)" }, { ad: "fark", etiket: "Fark" }]);
      T.goster({ alan: { xmin: -0.8, xmax: 12.8, ymin: -1.4, ymax: 9 }, izgara: 1 });
      const { A, M, B, gen, yuk, metre } = TARLA;
      const N = T.nokta("N", { x: 2, y: 0, adim: IZGARA, renk: RENK.yesil, kisit: (q) => ({ x: sinirla(yapistir(q.x), 0, gen), y: 0 }) });
      let ab = false, par = false;
      const eski = solParselKirik();
      T.ciz((c) => {
        c.cokgen([{ x: 0, y: 0 }, B, M, A, { x: 0, y: yuk }], { dolgu: "rgba(214,178,94,.22)", renk: null });
        c.cokgen([B, { x: gen, y: 0 }, { x: gen, y: yuk }, A, M], { dolgu: "rgba(90,180,100,.2)", renk: null });
        c.cokgen([{ x: 0, y: 0 }, { x: gen, y: 0 }, { x: gen, y: yuk }, { x: 0, y: yuk }], { renk: "#cfd8e6", kalinlik: 2.5 });
        c.yazi({ x: 1.8, y: 6.6 }, "1. parsel", { renk: "#e8cf8a", kalin: true, boyut: 16 });
        c.yazi({ x: 10.2, y: 6.6 }, "2. parsel", { renk: "#9fe0a6", kalin: true, boyut: 16 });
        c.yol([A, M, B], { renk: "#c9894a", kalinlik: 5 });
        if (ab) c.parca(A, B, { renk: RENK.mor, kalinlik: 2, kesikli: "7 5" });
        if (par) {
          const d = fark(B, A);
          c.dogru(M, topla(M, d), { renk: RENK.pembe, kalinlik: 1.8, kesikli: "4 4" });
          if (ab) c.cokgen([A, B, M], { dolgu: "rgba(184,156,255,.22)", renk: null });
          if (ab) c.cokgen([A, B, N], { dolgu: "rgba(255,143,199,.18)", renk: null });
        }
        c.parca(A, N, { renk: RENK.kenar, kalinlik: 3, kesikli: "10 6" });
        etiket(c, A, "A", { x: A.x, y: 0 }, "#c9894a");
        etiket(c, M, "M", { x: 0, y: M.y }, "#c9894a");
        etiket(c, B, "B", { x: B.x, y: 4 }, "#c9894a");
        c.kenarYazisi({ x: 0, y: 0 }, { x: gen, y: 0 }, `${gen * metre} m`, { uzak: { x: 6, y: 4 }, renk: RENK.soluk, mesafe: 34 });
        c.yazi({ x: 0, y: yuk / 2 }, `${yuk * metre} m`, { dx: 8, hiza: "start", renk: RENK.soluk });
      });
      const [abBtn, pBtn] = ctx.dugmeler([
        { metin: "AB'yi çiz", tik: () => { ab = !ab; acKapa(abBtn, ab); if (ab) liste.isaretle(0); T.yenile(); } },
        { metin: "M'den AB'ye paralel", tik: () => { par = !par; acKapa(pBtn, par); if (par) liste.isaretle(1); T.yenile(); } },
      ]);
      acKapa(abBtn, false); acKapa(pBtn, false);
      const liste = gorevListesi(ctx, ["AB'yi çiz", "M'den AB'ye paralel çiz", "N'yi alanlar eşit olacak yere taşı (fark &lt; %0,5)", "Soruyu yanıtla"]);
      const sonuc = ctx.not("");
      const soruKap = el("div");
      ctx.kontroller.append(soruKap);
      let acildi = false;
      function guncelle() {
        const yeni = solParselDuz(N.x), fk = Math.abs(yeni - eski) / eski;
        h.ayarla("eski", `${sayi(eski * metre * metre, 0)} m²`);
        h.ayarla("yeni", `${sayi(yeni * metre * metre, 0)} m²`);
        h.ayarla("fark", `%${kisa(fk * 100, 1)}`);
        if (fk < TARLA.tolerans) liste.isaretle(2);
        if (acildi || !liste.tamamMi(2)) return;
        acildi = true;
        const dogruN = paralelN();
        sonuc.innerHTML = `<p class="d-geri-bildirim dogru">Parseller korundu! N, M'den AB'ye çizilen paralelin alt kenarı kestiği nokta: N = (${kisa(dogruN.x)}; 0).</p>
          <p><b>Neden?</b> ABM ve ABN üçgenlerinin tabanı AB ortak, M ve N de AB'ye paralel aynı doğru üzerinde. Yükseklikleri eşit → alanları eşit. 1. parsel ABM'yi kaybedip ABN'yi kazanıyor.</p>`;
        soruKap.append(ctx.sayiSorusu({
          etiket: "Yeni sınır için N noktası <b>B'den kaç metre</b> uzakta olmalı?",
          birim: "m",
          kontrol: (v) => {
            if (Math.abs(v - 35) < 0.5) { liste.isaretle(3); ctx.gorevTamam(); return true; }
            if (Math.abs(v - 3.5) < 0.05) return "Birim kareleri metreye çevir: 1 kare = 10 m.";
            if (Math.abs(v - 75) < 0.5) return "Bu, N'nin sol köşeye uzaklığı. B'den uzaklığı soruluyor.";
            return "B = (4; 0) ve N'nin x koordinatını karşılaştır; 1 birim = 10 m.";
          },
          dogruMesaj: "Doğru! N = (7,5; 0), B = (4; 0): 3,5 birim = 35 m.",
        }).el);
      }
      T.degisti(guncelle);
      guncelle();
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Sinüs teoremini doğrula",
    cikti: "MAT.10.1.4-a",
    anlatim: `
      <p>Bir üçgende her kenarı, karşısındaki açının sinüsüne bölelim: <b>a / sin A</b>, <b>b / sin B</b>, <b>c / sin C</b>.</p>
      <p>Bu üç oran arasında bir ilişki var mı? Varsayımını seç, farklı üçgenlerde dene, sonra alan formülünü kullanarak <b>neden</b> böyle olduğunu adım adım göster.</p>`,
    gorev: "Varsayımını seç, en az 3 farklı üçgen (biri geniş açılı) dene ve doğrulamayı sırala.",
    ogretmen: "Programda sinüs teoreminin her üçgen için geçerli olup olmadığının sorgulanması ve sinüslü alan formülüyle yapılan doğrulamanın değerlendirilmesi öneriliyor. Ortak oranın çevrel çemberin çapı (2R) olduğu ek bir gözlem olarak sunulabilir.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(ALAN);
      const [A, B, C] = ucgenNoktalari(T, [{ x: -1, y: 3.5 }, { x: -4, y: -2.5 }, { x: 4, y: -2 }]);
      const sayac = sekilSayaci();
      sayac.ekle([A, B, C]);
      let iddia = null, cember = false;
      T.ciz((c) => {
        const { merkez: O, R } = cevrelCember(A, B, C);
        if (cember) { c.cember(O, R, { renk: RENK.sari, kalinlik: 1.6, kesikli: "6 5" }); c.parca(O, A, { renk: RENK.sari, kalinlik: 1.2, kesikli: "3 4" }); c.yazi({ x: (O.x + A.x) / 2, y: (O.y + A.y) / 2 }, "R", { dy: -12, renk: RENK.sari, kalin: true }); etiket(c, O, "O", A, RENK.sari); }
        ucgenCiz(c, A, B, C);
        const G = agirlikMerkezi(A, B, C), ac = acilar(A, B, C);
        c.aci(C, A, B, { r: 26, renk: RENK.turuncu, etiket: dereceYaz(ac.A, 0), etiketPay: 20, boyut: 13 });
        c.aci(A, B, C, { r: 26, renk: RENK.pembe, etiket: dereceYaz(ac.B, 0), etiketPay: 20, boyut: 13 });
        c.aci(B, C, A, { r: 26, renk: RENK.mor, etiket: dereceYaz(ac.C, 0), etiketPay: 20, boyut: 13 });
        c.kenarYazisi(B, C, "a", { uzak: G, renk: RENK.turuncu, kalin: true, boyut: 17 });
        c.kenarYazisi(C, A, "b", { uzak: G, renk: RENK.pembe, kalin: true, boyut: 17 });
        c.kenarYazisi(A, B, "c", { uzak: G, renk: RENK.mor, kalin: true, boyut: 17 });
      });
      const h = hud(ctx, [{ ad: "tur", etiket: "Üçgen" }, { ad: "n", etiket: "Denenen" }]);
      ctx.secenekler({
        etiket: "Varsayımın: üç oran…", deger: null,
        liste: [{ deger: "hep", metin: "Her üçgende eşittir" }, { deger: "dik", metin: "Yalnızca dik üçgende eşittir" }, { deger: "eskenar", metin: "Yalnızca eşkenar üçgende eşittir" }],
        degisti: (v) => { iddia = v; liste.isaretle(0); kontrol(); },
      });
      const f = formulListesi(ctx, ["a / sin A", "b / sin B", "c / sin C", "-", "2R (çevrel çemberin çapı)"]);
      const [cBtn] = ctx.dugmeler([{ metin: "◯ Çevrel çember", tik: () => { cember = !cember; acKapa(cBtn, cember); T.yenile(); } }]);
      acKapa(cBtn, false);
      const liste = gorevListesi(ctx, ["Varsayımını seç", "En az 3 farklı üçgen dene", "<b>Geniş</b> açılı bir üçgende dene", "Doğrulamayı sırala"]);
      const sonuc = ctx.not("");
      ctx.not("<p><b>Doğrulama:</b> Kartları doğru sıraya diz (alan formülünden yola çık).</p>");
      ispatSirala(ctx, [
        { metin: "Aynı alanı iki yoldan yaz: ½ · b · c · sin A = ½ · a · c · sin B" },
        { metin: "Her iki tarafı ½ · c ile sadeleştir: b · sin A = a · sin B", erken: "Önce aynı alanı iki farklı biçimde yazmalısın." },
        { metin: "Her iki tarafı sin A · sin B'ye böl: a / sin A = b / sin B", erken: "Bölmeden önce c'yi sadeleştir." },
        { metin: "Aynı yolu ½ · a · b · sin C ile tekrarla: b / sin B = c / sin C", erken: "Önce ilk iki oranın eşitliğini tamamla." },
      ], () => { liste.isaretle(3); kontrol(); });
      function guncelle() {
        const { a, b, c } = kenarlar(A, B, C), ac = acilar(A, B, C);
        f.ayarla(0, kisa(a / Math.sin(radyan(ac.A)), 3)); f.ayarla(1, kisa(b / Math.sin(radyan(ac.B)), 3)); f.ayarla(2, kisa(c / Math.sin(radyan(ac.C)), 3));
        f.ayarla(3, kisa(2 * cevrelCember(A, B, C).R, 3));
        const tur = ucgenTuru(A, B, C, 0.3);
        h.ayarla("tur", TUR_ADI[tur]); h.ayarla("n", `${Math.min(sayac.sayi, 3)}/3`);
      }
      function kontrol() {
        if (sayac.sayi >= 3) liste.isaretle(1);
        if (!liste.hepsi() || ctx.gorevTamamMi()) return;
        const d = iddia === "hep";
        sonuc.innerHTML = `<p class="d-geri-bildirim ${d ? "dogru" : "yanlis"}">${d ? "Varsayımın doğrulandı." : "Denediğin geniş ve dar açılı üçgenler varsayımını desteklemiyor."} Üç oran her üçgende eşittir:</p>
          <p class="formul">a / sin A = b / sin B = c / sin C = 2R</p>
          <p>Bu, <b>sinüs teoremidir</b>. Ortak oran çevrel çemberin çapına eşittir.</p>`;
        ctx.gorevTamam();
      }
      T.degisti(guncelle);
      T.birakti(() => { sayac.ekle([A, B, C]); if (ucgenTuru(A, B, C, 0.3) === "genis") liste.isaretle(2); guncelle(); kontrol(); });
      guncelle();
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Kosinüs teoremini ispatla",
    cikti: "MAT.10.1.4-a",
    anlatim: `
      <p>İki kenarı (b, c) ve aradaki açısı (A) bilinen üçgende üçüncü kenar <b>a</b> nasıl bulunur? Dik üçgen olsaydı Pisagor yeterdi.</p>
      <p>Pisagor'u kullanabilmek için üçgene bir <b>ek çizim</b> yapmalıyız. Hangisi? Sonra parçaları b, c ve A cinsinden yaz ve ispatı adım adım tamamla.</p>`,
    gorev: "Doğru ek çizimi seç, parçaları ifade et, ispatı sırala ve A geniş açıyken dene.",
    ogretmen: "Programda kosinüs teoreminin ispatı için öğrencilerin ek çizim önerileri alınarak tartışma yapılması ve Pisagor teoreminin kullanılması gerektiğinin fark ettirilmesi öneriliyor (E3.6, E3.7). A geniş açıyken H, BA'nın uzantısına düşer; AH = b · |cos A| ve HB = c − b · cos A ifadesi yine geçerlidir.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(ALAN);
      const [A, B, C] = ucgenNoktalari(T, [{ x: -4, y: -2 }, { x: 4.5, y: -2 }, { x: -1, y: 3.5 }]);
      let cizim = false;
      T.ciz((c) => {
        ucgenCiz(c, A, B, C);
        const G = agirlikMerkezi(A, B, C);
        if (cizim) {
          const H = dikmeAyagi(C, A, B), t = parametre(H, A, B);
          if (t < 0) c.parca(A, H, { renk: RENK.soluk, kesikli: true, kalinlik: 1.6 });
          if (t > 1) c.parca(B, H, { renk: RENK.soluk, kesikli: true, kalinlik: 1.6 });
          c.parca(C, H, { renk: RENK.turuncu, kalinlik: 2.5 });
          if (uzaklik(H, A) > 0.1) c.dikAci(C, H, A, { boyut: 10, renk: RENK.turuncu });
          else c.dikAci(C, H, B, { boyut: 10, renk: RENK.turuncu });
          c.parca(A, H, { renk: RENK.yesil, kalinlik: 4, opaklik: 0.8 });
          c.parca(H, B, { renk: RENK.mavi, kalinlik: 4, opaklik: 0.6 });
          etiket(c, H, "H", C, RENK.turuncu);
          c.kenarYazisi(C, H, "CH", { uzak: G, renk: RENK.turuncu, kalin: true, boyut: 13, mesafe: 20 });
        }
        c.aci(B, A, C, { r: 28, renk: RENK.sari, etiket: "A", etiketPay: 14 });
        c.kenarYazisi(B, C, "a", { uzak: G, renk: RENK.kenar, kalin: true, boyut: 17 });
        c.kenarYazisi(C, A, "b", { uzak: G, renk: RENK.kenar, kalin: true, boyut: 17 });
        c.kenarYazisi(A, B, "c", { uzak: G, renk: RENK.kenar, kalin: true, boyut: 17, mesafe: 24 });
      });
      const h = hud(ctx, [{ ad: "a", etiket: "A açısı" }, { ad: "sol", etiket: "a²" }, { ad: "sag", etiket: "b² + c² − 2bc·cos A" }]);
      const liste = gorevListesi(ctx, ["Doğru ek çizimi seç", "Parçaları b, c ve A ile ifade et", "İspatı sırala", "A'yı <b>geniş</b> açı yapıp formülü dene"]);
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.secenekler({
        etiket: "Hangi ek çizim Pisagor'u kullanmamızı sağlar?", deger: null,
        liste: [{ deger: "aciortay", metin: "A'nın açıortayı" }, { deger: "dikme", metin: "C'den AB'ye dikme" }, { deger: "kenarortay", metin: "C'den AB'ye kenarortay" }],
        degisti: (v) => {
          const m = {
            aciortay: "Açıortay açıyı ikiye böler ama dik açı oluşturmaz; Pisagor için dik üçgen gerekir.",
            kenarortay: "Kenarortay AB'yi ikiye böler ama genellikle AB'ye dik değildir; dik üçgen oluşmaz.",
            dikme: "Doğru! CH dikmesi iki dik üçgen oluşturur: AHC ve BHC.",
          }[v];
          geri.className = `d-geri-bildirim ${v === "dikme" ? "dogru" : "yanlis"}`;
          geri.textContent = m;
          if (v === "dikme" && !cizim) { cizim = true; liste.isaretle(0); T.yenile(); tabloKap.hidden = false; }
        },
      });
      ctx.kontroller.append(geri);
      const tabloKap = el("div", { hidden: true });
      ctx.kontroller.append(tabloKap);
      tabloKap.append(el("div", { class: "d-anlatim", html: "<p>AHC dik üçgeninde trigonometrik oranları kullan:</p>" }));
      secimTablosu({ ...ctx, kontroller: tabloKap }, {
        sutunlar: ["Uzunluk"],
        secenekler: ["b · sin A", "b · cos A", "c − b · cos A", "b · tan A", "c − b · sin A"],
        satirlar: [
          { etiket: "CH", hucreler: [{ dogru: "b · sin A", ipucu: "CH, A açısının karşısındaki dik kenar; hipotenüs b." }] },
          { etiket: "AH", hucreler: [{ dogru: "b · cos A", ipucu: "AH, A açısına komşu dik kenar; hipotenüs b." }] },
          { etiket: "HB", hucreler: [{ dogru: "c − b · cos A", ipucu: "HB = AB − AH." }] },
        ],
        bitti: () => { liste.isaretle(1); ispatKap.hidden = false; },
      });
      const ispatKap = el("div", { hidden: true });
      ctx.kontroller.append(ispatKap);
      ispatKap.append(el("div", { class: "d-anlatim", html: "<p><b>İspat:</b> Adımları sırala.</p>" }));
      ispatSirala({ ...ctx, kontroller: ispatKap }, [
        { metin: "BHC dik üçgeninde Pisagor: a² = CH² + HB²" },
        { metin: "Yerine yaz: a² = (b · sin A)² + (c − b · cos A)²", erken: "Önce hangi dik üçgende Pisagor'u yazacağını seç." },
        { metin: "Parantezleri aç: a² = b²·sin²A + c² − 2bc·cos A + b²·cos²A", erken: "Önce CH ve HB'yi yerine yazmalısın." },
        { metin: "sin²A + cos²A = 1 olduğundan: a² = b² + c² − 2bc · cos A", erken: "Önce ifadeyi açmalısın." },
      ], () => { liste.isaretle(2); bitir(); });
      const sonuc = ctx.not("");
      function guncelle() {
        const { a, b, c } = kenarlar(A, B, C), ac = acilar(A, B, C);
        h.ayarla("a", dereceYaz(ac.A)); h.ayarla("sol", kisa(a * a, 2)); h.ayarla("sag", kisa(b * b + c * c - 2 * b * c * Math.cos(radyan(ac.A)), 2));
        if (ac.A > 90.5 && cizim) { liste.isaretle(3); bitir(); }
      }
      function bitir() {
        if (!liste.hepsi() || ctx.gorevTamamMi()) return;
        sonuc.innerHTML = `<p class="d-geri-bildirim dogru">İspat tamam!</p><p class="formul">a² = b² + c² − 2bc · cos A</p>
          <p>A geniş açıyken cos A &lt; 0 olur: −2bc · cos A pozitif bir terimdir, a² büyür. A = 90° iken cos A = 0 ve formül <b>Pisagor teoremine</b> dönüşür.</p>`;
        ctx.gorevTamam();
      }
      T.degisti(guncelle);
      guncelle();
    },
  },

  /* 8 ------------------------------------------------------------------ */
  bogazAdimi,

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Değerlendirme: alan ve teoremler",
    anlatim: `
      <p>Sekiz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>6 doğru</b> yaparsan dersi tamamlamış olursun.</p>`,
    gorev: "Değerlendirmede en az <b>6/8</b> doğru yap.",
    ogretmen: "Sorular programdaki önermeleri (taban–yükseklik orantısı, paralel doğrular, benzerlik, sinüslü alan) ve iki teoremin problemde kullanımını yoklar. Çeldiriciler “alan k katına çıkar” ve “½'yi unutma” yanılgılarını hedefler.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(ALAN);
      const sekil = (ciz, alanAyar = { xmin: -4.6, xmax: 4.8, ymin: -2.6, ymax: 3.6 }) => (kap) => sekilCiz(kap, { alan: alanAyar, izgara: 0 }, ciz);
      const yaz = (c, liste) => { for (const [p, a, dx, dy] of liste) c.yazi(p, a, { dx, dy, kalin: true }); };
      ctx.sinav([
        {
          tur: "coktan", metin: "Bir üçgenin tabanı aynı kalıp o tabana ait yüksekliği <b>3 katına</b> çıkarılırsa alanı ne olur?",
          siklar: ["Değişmez", "3 katına çıkar", "6 katına çıkar", "9 katına çıkar"], dogru: 1,
          aciklama: "Alan = ½ · a · h. a sabitken alan h ile doğru orantılıdır: 3 katına çıkar. 9 kat, iki kenar birden 3 katına çıkınca (benzerlikte) olur.",
        },
        {
          tur: "sayi", metin: "İki benzer üçgenin benzerlik oranı <b>2/3</b>'tür. Küçük üçgenin alanı 12 cm² ise büyük üçgenin alanı kaç cm²'dir?",
          dogru: 27, tolerans: 0.01, birim: "cm²",
          aciklama: "Alanlar oranı (2/3)² = 4/9. 12 / S = 4/9 → S = 27 cm².",
        },
        {
          tur: "sayi", metin: "ABC üçgeninde AB = 6, AC = 8 ve m(A) = 30°'dir. Üçgenin alanı kaç birim²'dir?",
          grafik: sekil((c) => {
            const A = { x: -3.8, y: -1.8 }, B = { x: 4, y: -1.8 }, C = { x: -3.8 + 7.2 * Math.cos(radyan(30)), y: -1.8 + 7.2 * Math.sin(radyan(30)) };
            c.cokgen([A, B, C], { dolgu: "rgba(79,195,247,.1)" });
            c.aci(B, A, C, { r: 30, renk: RENK.sari, etiket: "30°", etiketPay: 18 });
            c.kenarYazisi(A, B, "6", { uzak: C }); c.kenarYazisi(A, C, "8", { uzak: B });
            yaz(c, [[A, "A", -12, 8], [B, "B", 12, 8], [C, "C", 10, -10]]);
          }),
          dogru: 12, tolerans: 0.01,
          aciklama: "Alan = ½ · 6 · 8 · sin 30° = ½ · 48 · ½ = 12.",
        },
        {
          tur: "sayi", metin: "ABC üçgeninde a = 10, m(A) = 30° ve m(B) = 45°'dir. <b>b</b> kaç birimdir? (√2 ≈ 1,414)",
          dogru: 10 * Math.SQRT2, tolerans: 0.05,
          aciklama: "Sinüs teoremi: a / sin A = b / sin B → 10 / (1/2) = b / (√2/2) → b = 10√2 ≈ 14,14.",
        },
        {
          tur: "sayi", metin: "ABC üçgeninde b = 5, c = 8 ve m(A) = 60°'dir. <b>a</b> kaç birimdir?",
          grafik: sekil((c) => {
            const A = { x: -3.6, y: -1.8 }, B = { x: 4.2, y: -1.8 }, C = { x: -3.6 + 4.9 * Math.cos(radyan(60)), y: -1.8 + 4.9 * Math.sin(radyan(60)) };
            c.cokgen([A, B, C], { dolgu: "rgba(79,195,247,.1)" });
            c.aci(B, A, C, { r: 28, renk: RENK.sari, etiket: "60°", etiketPay: 16 });
            c.kenarYazisi(A, B, "8", { uzak: C }); c.kenarYazisi(A, C, "5", { uzak: B }); c.kenarYazisi(B, C, "a = ?", { uzak: A, renk: RENK.mavi, kalin: true });
            yaz(c, [[A, "A", -12, 8], [B, "B", 12, 8], [C, "C", 0, -14]]);
          }),
          dogru: 7, tolerans: 0.01,
          aciklama: "Kosinüs teoremi: a² = 25 + 64 − 2 · 5 · 8 · ½ = 89 − 40 = 49 → a = 7.",
        },
        {
          tur: "coktan", metin: "Kosinüs teoreminde <b>m(A) = 90°</b> alınırsa hangi bağıntı elde edilir?",
          siklar: ["a = b + c", "a² = b² + c²", "a² = b² − c²", "a = b · c"], dogru: 1,
          aciklama: "cos 90° = 0 olduğundan −2bc · cos A terimi yok olur: a² = b² + c² (Pisagor teoremi).",
        },
        {
          tur: "coktan", metin: "d₁ ∥ d₂; B ve C noktaları d₁, A ve D noktaları d₂ üzerindedir. Hangisi <b>her zaman</b> doğrudur?",
          grafik: sekil((c) => {
            const B = { x: -2, y: -1.8 }, C = { x: 2.5, y: -1.8 }, A = { x: -3.5, y: 2.4 }, D = { x: 3.6, y: 2.4 };
            c.dogru(B, C, { renk: RENK.soluk }); c.dogru(A, D, { renk: RENK.soluk });
            c.cokgen([A, B, C], { dolgu: "rgba(255,181,71,.18)", renk: RENK.turuncu });
            c.cokgen([D, B, C], { dolgu: "rgba(79,195,247,.18)", renk: RENK.mavi });
            yaz(c, [[A, "A", 0, -14], [D, "D", 0, -14], [B, "B", -4, 14], [C, "C", 4, 14], [{ x: 4.5, y: -1.8 }, "d₁", 0, -12], [{ x: 4.5, y: 2.4 }, "d₂", 0, -12]]);
          }),
          siklar: ["Alan(ABC) = Alan(DBC)", "AB = DC", "Alan(ABC) > Alan(DBC)", "ABC ile DBC eş üçgenlerdir"], dogru: 0,
          aciklama: "Taban BC ortak; A ve D'nin d₁'e uzaklıkları (yükseklikler) eşit. Alanlar eşittir ama üçgenler eş olmak zorunda değildir.",
        },
        {
          tur: "sayi", metin: "Bir üçgende a = 6 ve m(A) = 30°'dir. Üçgenin <b>çevrel çemberinin yarıçapı</b> R kaç birimdir?",
          dogru: 6, tolerans: 0.01,
          aciklama: "a / sin A = 2R → 6 / (1/2) = 12 = 2R → R = 6.",
        },
      ], { baslik: "Alan ve teoremler", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: tahtaKur });
