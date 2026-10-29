// 10. Sınıf Matematik · 1. Tema: Geometrik Şekiller — B dersi
// MAT.10.1.2 Üçgenin yardımcı elemanları: iç/dış açıortay, kenarortay, kenar orta dikme, yükseklik ve kesişim noktaları
import { dersBaslat, el } from "../../../../engine/ders.js";
import { tahtaKur, sekilCiz, RENK } from "../ortak/tahta.js";
import { hud, gorevListesi, formulListesi, secimTablosu, sekilSayaci, kisa } from "../ortak/yardim.js";
import {
  uzaklik, ortaNokta, topla, fark, olcekle, birimVektor, dik, parametre, dikmeAyagi, dogruyaUzaklik,
  icAciortayAyagi, disAciortayAyagi, icAciortayYonu, disAciortayYonu, icTegetCember, disTegetCember,
  agirlikMerkezi, cevrelCember, diklikMerkezi, ucgenTuru, ucgenGore, acilar,
} from "../ortak/geometri.js";
import { IZGARA, yapistir, gecerliUcgen, MERKEZLER, SENARYOLAR, senaryoHedefi, HEDEF_TOLERANS } from "./model.js";

const ALAN = { alan: { xmin: -6.2, xmax: 6.2, ymin: -3.4, ymax: 5.2 }, izgara: 1 };
const sinirla = (v, a, b) => Math.min(b, Math.max(a, v));
const TUR_ADI = { dar: "dar açılı", dik: "dik açılı", genis: "geniş açılı" };
const KONUM_ADI = { ic: "üçgenin içinde", kenar: "bir kenarın üzerinde", dis: "üçgenin dışında" };

/** Sürüklenebilir üç köşe (ızgaraya yapışır, dejenere üçgene izin vermez) */
function ucgenNoktalari(T, baslangic) {
  const koseler = [];
  for (const [i, ad] of ["A", "B", "C"].entries()) {
    koseler.push(T.nokta(ad, {
      ...baslangic[i], adim: IZGARA,
      kisit: (q, kendisi) => {
        const r = yapistir(q);
        const [P1, P2] = koseler.filter((k) => k !== kendisi);
        return gecerliUcgen(r, P1, P2) ? r : null;
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
/** Merkez görünür bölgedeyse etiketle; dışındaysa kenarda yönünü gösteren bir işaret çiz */
function merkezEtiketi(c, T, P, metin, uzak, renk) {
  const g = T.gorunur(), pay = 0.35;
  if (P.x >= g.xmin && P.x <= g.xmax && P.y >= g.ymin && P.y <= g.ymax) return etiket(c, P, metin, uzak, renk);
  const K = { x: Math.min(g.xmax - pay, Math.max(g.xmin + pay, P.x)), y: Math.min(g.ymax - pay, Math.max(g.ymin + pay, P.y)) };
  const d = birimVektor(fark(P, K));
  const ok = ["→", "↗", "↑", "↖", "←", "↙", "↓", "↘"][((Math.round(Math.atan2(d.y, d.x) / (Math.PI / 4)) % 8) + 8) % 8];
  const u = (K.x - g.xmin) / (g.xmax - g.xmin), hiza = u < 0.3 ? "start" : u > 0.7 ? "end" : "middle";
  c.nokta(K, { renk, r: 4 });
  c.yazi(K, `${metin} ${ok} görünür alanın dışında`, { renk, kalin: true, boyut: 14, hiza, dx: hiza === "start" ? 10 : hiza === "end" ? -10 : 0, dy: d.y > 0.4 ? 16 : -16 });
}
/** Basılı/basılı değil düğmesi */
function acKapa(btn, acik) { btn.setAttribute("aria-pressed", String(acik)); }

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "İç açıortay kenarı nasıl böler?",
    cikti: "MAT.10.1.2-a",
    anlatim: `
      <p>A köşesindeki açıyı iki eş parçaya bölen doğru parçası <b>AD</b>, A'nın <b>iç açıortayıdır</b>. D noktası BC kenarını iki parçaya ayırır.</p>
      <p>Merak ettiğimiz şu: <b>BD ÷ DC</b> oranı neye bağlı? Önce bir varsayımda bulun.</p>
      <p>Sonra köşeleri sürükleyerek <b>farklı üçgenler</b> oluştur ve iki oranı karşılaştır.</p>`,
    gorev: "Varsayımını seç ve <b>en az 3 farklı üçgende</b> oranları incele; sonra problemi çöz.",
    ogretmen: "Programda açıortayın pergel, ölçüsüz cetvel ya da kâğıt katlama ile hatırlatılması, ardından kenarlar oranı ile açıortayın ayırdığı parçalar oranı arasındaki ilişkinin sınıfta tartışılarak varsayıma dönüştürülmesi öneriliyor (SDB2.2). Varsayımları tahtaya yazdırıp grupların farklı üçgenlerle sınamasını isteyin.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(ALAN);
      const [A, B, C] = ucgenNoktalari(T, [{ x: -1, y: 4 }, { x: -4, y: -2 }, { x: 4.5, y: -2 }]);
      let iddia = null, karsilastirildi = false;
      const sayac = sekilSayaci();
      sayac.ekle([A, B, C]);
      T.ciz((c) => {
        const D = icAciortayAyagi(A, B, C), G = agirlikMerkezi(A, B, C);
        ucgenCiz(c, A, B, C);
        c.parca(B, D, { renk: RENK.mavi, kalinlik: 4 });
        c.parca(D, C, { renk: RENK.yesil, kalinlik: 4 });
        c.parca(A, D, { renk: RENK.turuncu, kalinlik: 3 });
        c.aci(B, A, D, { r: 38, renk: RENK.turuncu, etiket: "θ" });
        c.aci(D, A, C, { r: 38, renk: RENK.sari, etiket: "θ" });
        c.kenarYazisi(A, B, `AB = ${kisa(uzaklik(A, B))}`, { uzak: G, hiza: "end", mesafe: 14 });
        c.kenarYazisi(A, C, `AC = ${kisa(uzaklik(A, C))}`, { uzak: G, hiza: "start", mesafe: 14 });
        c.kenarYazisi(B, D, `BD = ${kisa(uzaklik(B, D))}`, { uzak: A, renk: RENK.mavi, kalin: true });
        c.kenarYazisi(D, C, `DC = ${kisa(uzaklik(D, C))}`, { uzak: A, renk: RENK.yesil, kalin: true });
        etiket(c, D, "D", A, RENK.turuncu);
      });
      ctx.secenekler({
        etiket: "Varsayımın: BD ÷ DC oranı neye eşittir?", deger: null,
        liste: [
          { deger: "1", metin: "Her zaman 1 (D orta noktadır)" }, { deger: "ab", metin: "AB ÷ AC" },
          { deger: "ac", metin: "AC ÷ AB" }, { deger: "bc", metin: "BC ÷ AB" },
        ],
        degisti: (v) => { iddia = v; kontrol(); },
      });
      const f = formulListesi(ctx, ["AB ÷ AC", "BD ÷ DC", "Denenen üçgen"]);
      const sonuc = ctx.not("");
      const soruKap = el("div");
      ctx.kontroller.append(soruKap);
      const guncelle = () => {
        const D = icAciortayAyagi(A, B, C);
        f.ayarla(0, kisa(uzaklik(A, B) / uzaklik(A, C), 3));
        f.ayarla(1, kisa(uzaklik(B, D) / uzaklik(D, C), 3));
        f.ayarla(2, `${Math.min(sayac.sayi, 3)}/3`);
      };
      T.degisti(guncelle);
      T.birakti(() => { sayac.ekle([A, B, C]); guncelle(); kontrol(); });
      guncelle();

      function kontrol() {
        if (karsilastirildi || !iddia || sayac.sayi < 3) {
          if (!iddia && sayac.sayi >= 3) sonuc.innerHTML = "<p>Karşılaştırma için varsayımını seç.</p>";
          return;
        }
        karsilastirildi = true;
        sonuc.innerHTML = `<p class="d-geri-bildirim ${iddia === "ab" ? "dogru" : "yanlis"}">${iddia === "ab"
          ? "Varsayımın doğrulandı: her üçgende BD ÷ DC = AB ÷ AC."
          : "Gözlemlerin varsayımını desteklemiyor: iki gösterge her üçgende eşit çıktı, yani BD ÷ DC = AB ÷ AC."}</p>
          <p><b>İç açıortay teoremi:</b> <span class="formul">BD / DC = AB / AC</span></p>
          <p><b>Neden?</b> ABD ve ADC üçgenlerinin A'dan BC'ye inen yüksekliği ortaktır; alanları oranı BD ÷ DC'dir. D açıortay üzerinde olduğundan AB'ye ve AC'ye uzaklığı eşittir; bu kez alanlar oranı AB ÷ AC çıkar.</p>`;
        soruKap.append(ctx.sayiSorusu({
          etiket: "Bir üçgende AB = 6, AC = 9, BC = 10 ve AD iç açıortaydır. <b>BD</b> kaç birimdir?",
          kontrol: (v) => {
            if (Math.abs(v - 4) < 0.01) { ctx.gorevTamam(); return true; }
            if (Math.abs(v - 6) < 0.01) return "Oranı ters kurdun: BD, kısa kenar AB'nin tarafındadır. BD/DC = 6/9.";
            if (Math.abs(v - 5) < 0.01) return "D orta nokta değildir; parçalar 6 : 9 oranında.";
            return "BD/DC = 6/9 = 2/3 ve BD + DC = 10.";
          },
          dogruMesaj: "Doğru! BD = 10 · 6/15 = 4, DC = 6.",
        }).el);
      }
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Açıortaylar ve iç teğet çember",
    cikti: "MAT.10.1.2-b",
    anlatim: `
      <p>Yeşil <b>P</b> noktasını A'nın açıortayı üzerinde kaydır. P'den açının kollarına (AB ve AC) indirilen dikmelerin uzunluklarını karşılaştır.</p>
      <p>Sonra B ve C'nin açıortaylarını da çiz. Üç açıortay hakkında ne söyleyebilirsin? Köşeleri sürükleyip farklı üçgenlerde sına.</p>
      <p>Üç kenara eşit uzaklıktaki bir nokta, neyin merkezi olabilir?</p>`,
    gorev: "Listedeki dört adımı tamamla.",
    ogretmen: "Programda eş üçgenler yardımıyla “açıortay üzerindeki bir noktanın kollara uzaklıkları eşittir” çıkarımının yapılması, bundan hareketle iç açıortayların tek noktada kesiştiği ve bu noktanın iç teğet çemberin merkezi olduğu sonucuna ulaşılması öneriliyor. Matematik yazılımıyla farklı açıların sunulması (MAB5) bu adımın amacıdır.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(ALAN);
      const [A, B, C] = ucgenNoktalari(T, [{ x: -2, y: 4 }, { x: -4.5, y: -2.5 }, { x: 4.5, y: -2 }]);
      const acik = { B: false, C: false, cember: false };
      let tP = 0.55, iddia = null;
      const pKonum = () => { const D = icAciortayAyagi(A, B, C); return topla(A, olcekle(fark(D, A), tP)); };
      const P = T.nokta("P", {
        ...pKonum(), renk: RENK.yesil, etiketKonum: [18, -14],
        kisit: (q) => { const D = icAciortayAyagi(A, B, C); tP = sinirla(parametre(q, A, D), 0.06, 0.94); return topla(A, olcekle(fark(D, A), tP)); },
      });
      const RENKLER = { A: RENK.turuncu, B: RENK.pembe, C: RENK.mor };
      T.ciz((c) => {
        const k = { A, B, C };
        ucgenCiz(c, A, B, C);
        for (const [ad, [p, q]] of Object.entries({ A: [B, C], B: [A, C], C: [A, B] })) {
          if (ad !== "A" && !acik[ad]) continue;
          c.parca(k[ad], icAciortayAyagi(k[ad], p, q), { renk: RENKLER[ad], kalinlik: 2.5 });
          c.aci(p, k[ad], icAciortayAyagi(k[ad], p, q), { r: 26, renk: RENKLER[ad] });
          c.aci(icAciortayAyagi(k[ad], p, q), k[ad], q, { r: 26, renk: RENKLER[ad] });
        }
        const F1 = dikmeAyagi(P, A, B), F2 = dikmeAyagi(P, A, C);
        c.parca(P, F1, { renk: RENK.yesil, kalinlik: 2, kesikli: true }); c.parca(P, F2, { renk: RENK.yesil, kalinlik: 2, kesikli: true });
        c.dikAci(P, F1, A, { boyut: 9 }); c.dikAci(P, F2, A, { boyut: 9 });
        c.centik(P, F1, 1, { renk: RENK.yesil }); c.centik(P, F2, 1, { renk: RENK.yesil });
        if (acik.B && acik.C) {
          const { merkez: I, r } = icTegetCember(A, B, C);
          if (acik.cember) {
            c.cember(I, r, { renk: RENK.sari, kalinlik: 2.5 });
            for (const [p, q] of [[A, B], [B, C], [C, A]]) { const F = dikmeAyagi(I, p, q); c.parca(I, F, { renk: RENK.sari, kalinlik: 1.5, kesikli: "4 4" }); }
          }
          etiket(c, I, "I", A, RENK.sari);
        }
      });
      const [bBtn, cBtn, cemBtn] = ctx.dugmeler([
        { metin: "B'nin açıortayı", tik: () => ac("B") }, { metin: "C'nin açıortayı", tik: () => ac("C") },
        { metin: "◯ İç teğet çember", tik: () => ac("cember") },
      ]);
      [bBtn, cBtn, cemBtn].forEach((b) => acKapa(b, false));
      cemBtn.disabled = true;
      ctx.secenekler({
        etiket: "Varsayımın: üç iç açıortay…", deger: null,
        liste: [{ deger: "hep", metin: "Her üçgende tek noktada kesişir" }, { deger: "bazen", metin: "Yalnızca bazı üçgenlerde tek noktada kesişir" }, { deger: "hic", metin: "Tek noktada kesişmez" }],
        degisti: (v) => { iddia = v; liste.isaretle(0); kontrol(); },
      });
      const f = formulListesi(ctx, ["P'nin AB'ye uzaklığı", "P'nin AC'ye uzaklığı", "-", "I'nın AB, BC, CA'ya uzaklığı"]);
      const liste = gorevListesi(ctx, ["Varsayımını seç", "Üç açıortayı da çiz", "Üç açıortay çiziliyken üçgeni <b>2 kez</b> değiştir", "İç teğet çemberi göster"]);
      const sonuc = ctx.not("");
      let sayac = null;
      function ac(ad) {
        acik[ad] = !acik[ad];
        acKapa({ B: bBtn, C: cBtn, cember: cemBtn }[ad], acik[ad]);
        const hepsi = acik.B && acik.C;
        cemBtn.disabled = !hepsi;
        if (hepsi) { liste.isaretle(1); if (!sayac) { sayac = sekilSayaci(); sayac.ekle([A, B, C]); } }
        if (acik.cember && hepsi) liste.isaretle(3);
        T.yenile(); guncelle(); kontrol();
      }
      function guncelle() {
        f.ayarla(0, kisa(dogruyaUzaklik(P, A, B), 2));
        f.ayarla(1, kisa(dogruyaUzaklik(P, A, C), 2));
        if (acik.B && acik.C) {
          const { merkez: I } = icTegetCember(A, B, C);
          f.ayarla(2, [[A, B], [B, C], [C, A]].map(([p, q]) => kisa(dogruyaUzaklik(I, p, q), 2)).join(" · "));
        } else f.ayarla(2, "—");
      }
      function kontrol() {
        if (!liste.hepsi() || ctx.gorevTamamMi()) return;
        sonuc.innerHTML = `<p class="d-geri-bildirim ${iddia === "hep" ? "dogru" : "yanlis"}">${iddia === "hep" ? "Varsayımın doğru" : "Gözlemlerin varsayımını desteklemiyor"}: üç iç açıortay her üçgende <b>tek bir noktada (I)</b> kesişir.</p>
          <p>Açıortay üzerindeki her nokta açının kollarına eşit uzaklıktadır. I üç açıortayın da üzerinde olduğundan <b>üç kenara eşit uzaklıktadır</b> (r). Bu yüzden I merkezli, r yarıçaplı çember üç kenara da teğettir: <b>iç teğet çember</b>.</p>`;
        ctx.gorevTamam();
      }
      T.degisti((n) => { if (n !== P) P.ayarla(pKonum().x, pKonum().y, true); guncelle(); });
      T.birakti((n) => {
        if (n === P || !sayac || !(acik.B && acik.C)) return;
        if (sayac.ekle([A, B, C]) >= 3) liste.isaretle(2);
        kontrol();
      });
      guncelle();
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Dış açıortay ve dış teğet çember",
    cikti: "MAT.10.1.2-b",
    anlatim: `
      <p>BA kenarını A'nın ötesine uzatınca A'da bir <b>dış açı</b> oluşur. Bu açıyı iki eş parçaya bölen doğru, A'nın <b>dış açıortayıdır</b>; iç açıortaya diktir.</p>
      <p>Dış açıortay BC doğrusunu <b>E</b> noktasında keser. İç açıortaydakine benzer bir oran ilişkisi var mı? <span class="formul">EB / EC = AB / AC</span></p>
      <p>AB = AC olursa ne olur? Sonra B ve C'nin dış açıortaylarını çizip neyin merkezini bulduğunu gör.</p>`,
    gorev: "Listedeki üç adımı tamamla.",
    ogretmen: "Programda iç açıortaydaki sürecin benzeri işletilerek dış açıortay teoremine ulaşılması; iki dış açıortay ile üçüncü açının iç açıortayının aynı noktada kesiştiği ve bu noktanın bir dış teğet çemberin merkezi olduğu fikrine varılması öneriliyor.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster({ alan: { xmin: -10.5, xmax: 7, ymin: -4.5, ymax: 5.5 }, izgara: 1 });
      const [A, B, C] = ucgenNoktalari(T, [{ x: -2.5, y: 2.5 }, { x: -2, y: -1.5 }, { x: 4, y: -1.5 }]);
      let cember = false;
      T.ciz((c) => {
        ucgenCiz(c, A, B, C);
        const uAB = birimVektor(fark(A, B)), uAC = birimVektor(fark(C, A));
        const X = topla(A, olcekle(uAB, 2.2)), W = topla(A, olcekle(birimVektor(topla(uAB, uAC)), 2));
        c.dogru(B, C, { renk: RENK.soluk, kesikli: true });
        c.parca(A, X, { renk: RENK.soluk, kesikli: true, kalinlik: 2 });
        c.dogru(A, W, { renk: RENK.turuncu, kalinlik: 2.5 });
        c.parca(A, icAciortayAyagi(A, B, C), { renk: RENK.turuncu, kalinlik: 1.5, kesikli: "3 5" });
        c.aci(X, A, W, { r: 34, renk: RENK.turuncu, etiket: "φ" });
        c.aci(W, A, C, { r: 34, renk: RENK.sari, etiket: "φ" });
        const E = disAciortayAyagi(A, B, C);
        if (E) {
          c.parca(E, B, { renk: RENK.mavi, kalinlik: 3.5 });
          etiket(c, E, "E", A, RENK.turuncu);
        }
        if (cember) {
          const { merkez: Ia, r } = disTegetCember(A, B, C);
          c.dogru(A, B, { renk: RENK.soluk, kesikli: true }); c.dogru(A, C, { renk: RENK.soluk, kesikli: true });
          c.dogru(B, topla(B, disAciortayYonu(B, A, C)), { renk: RENK.pembe, kalinlik: 2 });
          c.dogru(C, topla(C, disAciortayYonu(C, A, B)), { renk: RENK.mor, kalinlik: 2 });
          c.dogru(A, topla(A, icAciortayYonu(A, B, C)), { renk: RENK.turuncu, kalinlik: 1.5, kesikli: "3 5" });
          c.cember(Ia, r, { renk: RENK.sari, kalinlik: 2.5 });
          for (const [p, q] of [[A, B], [B, C], [C, A]]) { const F = dikmeAyagi(Ia, p, q); c.parca(Ia, F, { renk: RENK.sari, kalinlik: 1.5, kesikli: "4 4" }); c.nokta(F, { r: 3.5, renk: RENK.sari }); }
          etiket(c, Ia, "Iₐ", A, RENK.sari);
        }
      });
      const f = formulListesi(ctx, ["AB ÷ AC", "EB ÷ EC"]);
      const [cBtn] = ctx.dugmeler([{ metin: "◯ B ve C'nin dış açıortayları", tik: () => { cember = !cember; acKapa(cBtn, cember); if (cember) liste.isaretle(1); T.yenile(); bitir(); } }]);
      acKapa(cBtn, false);
      const liste = gorevListesi(ctx, ["<b>AB = AC</b> olan bir üçgen kur ve dış açıortaya bak", "B ve C'nin dış açıortaylarını çiz", "Problemi çöz"]);
      const durum = ctx.not("");
      ctx.sayiSorusu({
        etiket: "Bir üçgende AB = 6, AC = 4, BC = 5'tir. A'daki dış açıortay BC doğrusunu E'de kesiyor. <b>EC</b> kaç birimdir?",
        kontrol: (v) => {
          if (Math.abs(v - 10) < 0.01) { liste.isaretle(2); bitir(); return true; }
          if (Math.abs(v - 15) < 0.01) return "Bu EB. Soru EC'yi soruyor.";
          if (Math.abs(v - 2) < 0.01 || Math.abs(v - 3) < 0.01) return "Bu, iç açıortayın BC üzerinde ayırdığı parça. E, BC'nin uzantısındadır.";
          return "EB/EC = 6/4 ve E, BC'nin C tarafındaki uzantısında: EB = EC + 5.";
        },
        dogruMesaj: "Doğru! EB/EC = 3/2 ve EB = EC + 5 → EC = 10, EB = 15.",
      });
      function guncelle() {
        const E = disAciortayAyagi(A, B, C);
        f.ayarla(0, kisa(uzaklik(A, B) / uzaklik(A, C), 3));
        f.ayarla(1, E ? kisa(uzaklik(E, B) / uzaklik(E, C), 3) : "E yok");
        if (!E) {
          liste.isaretle(0);
          durum.innerHTML = "<p class=\"d-geri-bildirim dogru\">AB = AC: dış açıortay BC'ye <b>paralel</b> oldu, E noktası yok! İkizkenar üçgende tepe açısının dış açıortayı tabana paraleldir.</p>";
        } else if (!ctx.gorevTamamMi()) durum.innerHTML = "";
        bitir();
      }
      function bitir() { if (liste.hepsi() && !ctx.gorevTamamMi()) ctx.gorevTamam(); }
      T.degisti(guncelle);
      guncelle();
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Kenarortaylar ve ağırlık merkezi",
    cikti: "MAT.10.1.2-c",
    anlatim: `
      <p>Bir köşeyi karşı kenarın <b>orta noktasına</b> birleştiren doğru parçası <b>kenarortaydır</b>. Üç kenarortay <b>G</b> noktasında kesişir: <b>ağırlık merkezi</b>. Türdeş bir üçgen levha G noktasından tek parmakla dengede tutulabilir.</p>
      <p>G, her kenarortayı iki parçaya ayırır. Önce bu parçaların oranı hakkında bir varsayımda bulun, sonra farklı üçgenlerde dene.</p>
      <p>Son olarak bir <b>dik üçgen</b> kur ve dik köşeden hipotenüse çizilen kenarortaya bak.</p>`,
    gorev: "Listedeki üç adımı tamamla.",
    ogretmen: "Programda iki kenarortayın inşa edilerek kesim noktasının kenarortayları belli oranda böldüğüne dair varsayımda bulunulması, üçüncü kenarortayın da aynı noktadan geçtiğinin görülmesi ve ağırlık merkezinin kenarortayı 2 : 1 oranında böldüğüne dikkat çekilmesi öneriliyor. Dik üçgende hipotenüse ait kenarortayın hipotenüsün yarısına eşit olduğuna dair çıkarım için fırsat verin. Kartondan kesilmiş üçgenleri G'den kalem ucunda dengeletmek güzel bir somut etkinliktir.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(ALAN);
      const [A, B, C] = ucgenNoktalari(T, [{ x: -1.5, y: 4 }, { x: -4.5, y: -2.5 }, { x: 4.5, y: -1.5 }]);
      let iddia = null;
      const sayac = sekilSayaci();
      sayac.ekle([A, B, C]);
      const dikKose = () => {
        const a = acilar(A, B, C);
        return Object.entries(a).find(([, v]) => Math.abs(v - 90) < 0.3)?.[0] || null;
      };
      T.ciz((c) => {
        ucgenCiz(c, A, B, C);
        const D = ortaNokta(B, C), E = ortaNokta(C, A), F = ortaNokta(A, B), G = agirlikMerkezi(A, B, C);
        for (const [p, q, n] of [[B, C, 1], [C, A, 2], [A, B, 3]]) { const m = ortaNokta(p, q); c.centik(p, m, n); c.centik(m, q, n); }
        c.parca(A, D, { renk: RENK.turuncu, kalinlik: 2.5 }); c.parca(B, E, { renk: RENK.pembe, kalinlik: 2.5 }); c.parca(C, F, { renk: RENK.mor, kalinlik: 2.5 });
        const dk = dikKose();
        if (dk) {
          const V = { A, B, C }[dk], [p, q] = { A: [B, C], B: [A, C], C: [A, B] }[dk];
          const M = ortaNokta(p, q);
          c.cember(M, uzaklik(p, q) / 2, { renk: RENK.yesil, kalinlik: 2, kesikli: true });
          c.parca(V, M, { renk: RENK.yesil, kalinlik: 4 });
          c.dikAci(p, V, q);
        }
        etiket(c, D, "D", A, RENK.soluk, 16); etiket(c, E, "E", B, RENK.soluk, 16); etiket(c, F, "F", C, RENK.soluk, 16);
        c.nokta(G, { renk: RENK.sari, r: 6 }); c.yazi(G, "G", { dx: 14, dy: -14, renk: RENK.sari, kalin: true, boyut: 17 });
      });
      ctx.secenekler({
        etiket: "Varsayımın: G kenarortayı köşeden itibaren hangi oranda böler? (AG : GD)", deger: null,
        liste: [{ deger: "1", metin: "1 : 1" }, { deger: "2", metin: "2 : 1" }, { deger: "3", metin: "3 : 1" }, { deger: "x", metin: "Üçgene göre değişir" }],
        degisti: (v) => { iddia = v; liste.isaretle(0); kontrol(); },
      });
      const f = formulListesi(ctx, ["AG ÷ GD", "BG ÷ GE", "CG ÷ GF", "-", "Dik köşeden hipotenüse kenarortay", "Hipotenüs ÷ 2"]);
      const liste = gorevListesi(ctx, ["Varsayımını seç", "En az <b>3 farklı üçgende</b> oranlara bak", "Bir <b>dik üçgen</b> kur (ızgara noktalarını kullan)"]);
      const sonuc = ctx.not("");
      function guncelle() {
        const G = agirlikMerkezi(A, B, C);
        f.ayarla(0, kisa(uzaklik(A, G) / uzaklik(G, ortaNokta(B, C)), 3));
        f.ayarla(1, kisa(uzaklik(B, G) / uzaklik(G, ortaNokta(C, A)), 3));
        f.ayarla(2, kisa(uzaklik(C, G) / uzaklik(G, ortaNokta(A, B)), 3));
        const dk = dikKose();
        if (dk) {
          const V = { A, B, C }[dk], [p, q] = { A: [B, C], B: [A, C], C: [A, B] }[dk];
          f.ayarla(3, kisa(uzaklik(V, ortaNokta(p, q)), 3)); f.ayarla(4, kisa(uzaklik(p, q) / 2, 3));
          liste.isaretle(2);
        } else { f.ayarla(3, "dik üçgen yok"); f.ayarla(4, "—"); }
      }
      function kontrol() {
        if (!liste.hepsi() || ctx.gorevTamamMi()) return;
        sonuc.innerHTML = `<p class="d-geri-bildirim ${iddia === "2" ? "dogru" : "yanlis"}">${iddia === "2" ? "Varsayımın doğru" : "Gözlemlerin varsayımını desteklemiyor"}: G her kenarortayı köşeden itibaren <b>2 : 1</b> oranında böler. <span class="formul">AG = 2·GD</span></p>
          <p>Dik üçgende hipotenüsün orta noktası üç köşeye eşit uzaklıktadır (yeşil çember). Bu yüzden <b>hipotenüse ait kenarortay, hipotenüsün yarısına eşittir</b>.</p>`;
        ctx.gorevTamam();
      }
      T.degisti(guncelle);
      T.birakti(() => { if (sayac.ekle([A, B, C]) >= 3) liste.isaretle(1); guncelle(); kontrol(); });
      guncelle();
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Kenar orta dikmeler ve çevrel çember",
    cikti: "MAT.10.1.2-c",
    anlatim: `
      <p>Bir kenarın orta noktasından o kenara dik çizilen doğru <b>kenar orta dikmedir</b>. Üzerindeki her nokta, kenarın iki ucuna <b>eşit uzaklıktadır</b>.</p>
      <p>AB ve AC'nin kenar orta dikmeleri <b>O</b>'da kesişiyor. Üçüncüsü de O'dan geçer mi? O, köşelere ne kadar uzak?</p>
      <p>Üçgeni dar, dik ve geniş açılı yaparak O'nun yerini izle.</p>`,
    gorev: "Listedeki adımları tamamla.",
    ogretmen: "Programda farklı üçgenlerin iki kenar orta dikmesinin inşa edilmesi, üçüncünün bu kesim noktasından geçip geçmediğinin tartışılması (SDB2.2) ve kesim noktasının çevrel çemberin merkezi olduğuna dair çıkarım yapılması öneriliyor.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(ALAN);
      const [A, B, C] = ucgenNoktalari(T, [{ x: -1, y: 3.5 }, { x: -4, y: -2.5 }, { x: 4, y: -2 }]);
      let ucuncu = false, cember = false;
      const iddia = { gecer: null, genis: null };
      const h = hud(ctx, [{ ad: "tur", etiket: "Üçgen" }, { ad: "o", etiket: "O'nun yeri" }, { ad: "r", etiket: "OA = OB = OC" }]);
      const koseRengi = { AB: RENK.turuncu, AC: RENK.pembe, BC: RENK.mor };
      T.ciz((c) => {
        ucgenCiz(c, A, B, C);
        const kenarlar = [["AB", A, B, 1], ["AC", A, C, 2]];
        if (ucuncu) kenarlar.push(["BC", B, C, 3]);
        for (const [ad, p, q, n] of kenarlar) {
          const M = ortaNokta(p, q), d = dik(fark(q, p));
          c.dogru(M, topla(M, d), { renk: koseRengi[ad], kalinlik: 2, kesikli: "8 5" });
          c.dikAci(p, M, topla(M, d), { boyut: 10, renk: koseRengi[ad] });
          c.centik(p, M, n, { renk: koseRengi[ad] }); c.centik(M, q, n, { renk: koseRengi[ad] });
        }
        const { merkez: O, R } = cevrelCember(A, B, C);
        if (cember) c.cember(O, R, { renk: RENK.sari, kalinlik: 2.5 });
        if (cember) for (const k of [A, B, C]) c.parca(O, k, { renk: RENK.sari, kalinlik: 1.5, kesikli: "4 4" });
        merkezEtiketi(c, T, O, "O", agirlikMerkezi(A, B, C), RENK.sari);
      });
      ctx.secenekler({
        etiket: "Varsayım 1: BC'nin kenar orta dikmesi O'dan…", deger: null,
        liste: [{ deger: "gecer", metin: "Her zaman geçer" }, { deger: "bazen", metin: "Bazen geçer" }, { deger: "gecmez", metin: "Geçmez" }],
        degisti: (v) => { iddia.gecer = v; isaretle(); },
      });
      ctx.secenekler({
        etiket: "Varsayım 2: geniş açılı üçgende O…", deger: null,
        liste: [{ deger: "ic", metin: "İçeridedir" }, { deger: "dis", metin: "Dışarıdadır" }, { deger: "kenar", metin: "Bir kenar üzerindedir" }],
        degisti: (v) => { iddia.genis = v; isaretle(); },
      });
      const [uBtn, cBtn] = ctx.dugmeler([
        { metin: "BC'nin kenar orta dikmesi", tik: () => { ucuncu = !ucuncu; acKapa(uBtn, ucuncu); if (ucuncu) liste.isaretle(1); T.yenile(); guncelle(); } },
        { metin: "◯ Çevrel çember", tik: () => { cember = !cember; acKapa(cBtn, cember); T.yenile(); } },
      ]);
      acKapa(uBtn, false); acKapa(cBtn, false);
      const liste = gorevListesi(ctx, ["İki varsayımını seç", "Üçüncü kenar orta dikmeyi çiz", "<b>Dar</b> açılı üçgende O'ya bak", "<b>Dik</b> üçgende O'ya bak", "<b>Geniş</b> açılı üçgende O'ya bak"]);
      const sonuc = ctx.not("");
      function isaretle() { if (iddia.gecer && iddia.genis) liste.isaretle(0); bitir(); }
      function guncelle() {
        const tur = ucgenTuru(A, B, C, 0.3);
        const { merkez: O, R } = cevrelCember(A, B, C);
        const yer = tur === "dik" ? "kenar" : ucgenGore(O, A, B, C, 0.02);
        h.ayarla("tur", TUR_ADI[tur]); h.ayarla("o", KONUM_ADI[yer]); h.ayarla("r", kisa(R, 2));
        if (ucuncu) liste.isaretle({ dar: 2, dik: 3, genis: 4 }[tur]);
        bitir();
      }
      function bitir() {
        if (!liste.hepsi() || ctx.gorevTamamMi()) return;
        const d1 = iddia.gecer === "gecer", d2 = iddia.genis === "dis";
        sonuc.innerHTML = `<p class="d-geri-bildirim ${d1 ? "dogru" : "yanlis"}">Varsayım 1: ${d1 ? "doğru." : "gözlemlerle çelişiyor."} Üç kenar orta dikme her üçgende <b>tek noktada</b> kesişir.</p>
          <p class="d-geri-bildirim ${d2 ? "dogru" : "yanlis"}">Varsayım 2: ${d2 ? "doğru." : "gözlemlerle çelişiyor."} O; dar açılı üçgende içte, dik üçgende <b>hipotenüsün ortasında</b>, geniş açılı üçgende dışarıdadır.</p>
          <p>O üç köşeye eşit uzaklıkta olduğundan, O merkezli ve OA yarıçaplı çember üç köşeden geçer: <b>çevrel çember</b>.</p>`;
        ctx.gorevTamam();
      }
      T.degisti(guncelle);
      guncelle();
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Yükseklikler ve diklik merkezi",
    cikti: "MAT.10.1.2-ç",
    anlatim: `
      <p>Bir köşeden karşı kenara (ya da onun uzantısına) indirilen dikme <b>yüksekliktir</b>. Üç yükseklik (ya da uzantıları) <b>H</b> noktasında kesişir: <b>diklik merkezi</b>.</p>
      <p>Geniş açılı üçgende bazı yüksekliklerin ayağı kenarın <b>uzantısına</b> düşer (kesikli çizgiler).</p>
      <p>Üç üçgen türünü de dene, sonra gözlemlerini önerme olarak yaz.</p>`,
    gorev: "Üç üçgen türünü de incele ve önermeleri tamamla.",
    ogretmen: "Programda öğrencilerin “Dar açılı üçgenlerde yükseklikler üçgenin içinde, geniş açılı üçgenlerde dışında, dik açılı üçgenlerde dik açılı köşede kesişir.” gibi sonuçlara ulaşması bekleniyor. Grupların farklı yardımcı elemanlarla afiş ya da dijital sunum hazırlaması performans görevi olarak verilebilir.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(ALAN);
      const [A, B, C] = ucgenNoktalari(T, [{ x: -1, y: 3.5 }, { x: -4, y: -2.5 }, { x: 4, y: -2 }]);
      const h = hud(ctx, [{ ad: "tur", etiket: "Üçgen" }, { ad: "h", etiket: "H'nin yeri" }]);
      const RN = { A: RENK.turuncu, B: RENK.pembe, C: RENK.mor };
      T.ciz((c) => {
        ucgenCiz(c, A, B, C);
        const H = diklikMerkezi(A, B, C);
        const k = { A, B, C };
        for (const [ad, [p, q]] of Object.entries({ A: [B, C], B: [A, C], C: [A, B] })) {
          const V = k[ad], F = dikmeAyagi(V, p, q), t = parametre(F, p, q);
          if (t < 0) c.parca(p, F, { renk: RENK.soluk, kesikli: true, kalinlik: 1.6 });
          if (t > 1) c.parca(q, F, { renk: RENK.soluk, kesikli: true, kalinlik: 1.6 });
          c.parca(V, H, { renk: RN[ad], kesikli: "3 5", kalinlik: 1.4, opaklik: 0.8 });
          c.parca(V, F, { renk: RN[ad], kalinlik: 2.5 });
          const ref = uzaklik(F, p) > 0.05 ? p : q;
          if (uzaklik(F, V) > 0.05 && uzaklik(F, ref) > 0.05) c.dikAci(V, F, ref, { boyut: 10, renk: RN[ad] });
        }
        merkezEtiketi(c, T, H, "H", agirlikMerkezi(A, B, C), RENK.sari);
      });
      const liste = gorevListesi(ctx, ["<b>Dar</b> açılı üçgende H'ye bak", "<b>Dik</b> üçgende H'ye bak", "<b>Geniş</b> açılı üçgende H'ye bak", "Önermeleri tamamla"]);
      const sonuc = ctx.not("");
      ctx.not("<p><b>Önermelerini yaz:</b> Yükseklikler…</p>");
      secimTablosu(ctx, {
        sutunlar: ["Yüksekliklerin kesiştiği yer"],
        secenekler: ["üçgenin içinde", "üçgenin dışında", "dik açının köşesinde"],
        satirlar: [
          { etiket: "Dar açılı üçgende", hucreler: [{ dogru: "üçgenin içinde", ipucu: "Dar açılı üçgende her yüksekliğin ayağı kenarın üzerindedir." }] },
          { etiket: "Geniş açılı üçgende", hucreler: [{ dogru: "üçgenin dışında", ipucu: "Geniş açılı üçgende iki yüksekliğin ayağı kenar uzantısına düşer." }] },
          { etiket: "Dik üçgende", hucreler: [{ dogru: "dik açının köşesinde", ipucu: "Dik üçgende iki dik kenar aynı zamanda yüksekliktir." }] },
        ],
        bitti: () => { liste.isaretle(3); bitir(); },
      });
      function guncelle() {
        const tur = ucgenTuru(A, B, C, 0.3);
        const yer = tur === "dik" ? "dik açının köşesinde" : KONUM_ADI[ucgenGore(diklikMerkezi(A, B, C), A, B, C, 0.02)];
        h.ayarla("tur", TUR_ADI[tur]); h.ayarla("h", yer);
        liste.isaretle({ dar: 0, dik: 1, genis: 2 }[tur]);
        bitir();
      }
      function bitir() {
        if (!liste.hepsi() || ctx.gorevTamamMi()) return;
        sonuc.innerHTML = `<p class="d-geri-bildirim dogru">Önermelerin doğru!</p><p>Dik üçgende dik kenarlar birbirine dik olduğundan iki yükseklik dik açının köşesinden geçer; H o köşedir.</p>`;
        ctx.gorevTamam();
      }
      T.degisti(guncelle);
      guncelle();
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Hangi merkez? Gerçek yaşam problemleri",
    cikti: "MAT.10.1.2-d",
    anlatim: `
      <p>Üçgenin dört özel noktası, gerçek hayatta farklı sorulara cevap verir. Her problemde önce <b>hangi noktanın</b> aranan yer olduğuna karar ver.</p>
      <p>Doğru seçince inşa çizgileri belirir. Sonra <b>P</b>'yi sürükleyip tam yerine yerleştir. Göstergeler yardımcı olur.</p>`,
    gorev: "Üç problemin hepsini çöz.",
    ogretmen: "Programda yardımcı elemanlarla ilgili önermelerin farklı problem durumlarında kullanılarak değerlendirilmesi öneriliyor. Problemleri sınıfta önce tartıştırın: “köşelere eşit uzaklık” ile “kenarlara eşit uzaklık” arasındaki farkı vurgulayın. Su deposu problemi geniş açılı yerleşimlerde deponun üçgenin dışına düşebileceğini tartışmak için de kullanılabilir.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster({ alan: { xmin: -6, xmax: 6, ymin: -3.6, ymax: 5.2 }, izgara: 0 });
      const cozulen = new Set();
      let s = SENARYOLAR[0], secim = null, insa = false;
      const P = T.nokta("P", { x: -1.5, y: -1, renk: RENK.yesil, etiket: "P", kisit: (q) => q });
      const RNK = ["#d8b46a", "#7fb0d8", "#c98fd8"];
      T.ciz((c) => {
        const [A, B, C] = s.koseler;
        if (s.ad === "depo") {
          { const g = T.gorunur(), m = 4; c.cokgen([{ x: g.xmin - m, y: g.ymin - m }, { x: g.xmax + m, y: g.ymin - m }, { x: g.xmax + m, y: g.ymax + m }, { x: g.xmin - m, y: g.ymax + m }], { dolgu: "rgba(90,140,80,.12)", renk: null }); }
          for (const [p, q] of [[A, B], [B, C], [C, A]]) c.parca(p, q, { renk: "rgba(216,180,106,.45)", kalinlik: 5 });
        } else if (s.ad === "cesme") {
          c.cokgen([A, B, C], { dolgu: "rgba(90,180,100,.22)", renk: null });
          for (const [p, q] of [[A, B], [B, C], [C, A]]) { c.parca(p, q, { renk: "#4a5468", kalinlik: 16 }); c.parca(p, q, { renk: "rgba(255,255,255,.6)", kalinlik: 1.5, kesikli: "8 8" }); }
          for (const [x, y] of [[-2.5, -1.2], [1.5, -1.6], [-1.6, 1.6], [0.3, -0.5]]) c.cember({ x, y }, 0.28, { dolgu: "rgba(60,140,70,.8)", renk: "#2f6b3a", kalinlik: 1 });
        } else {
          c.cokgen([A, B, C], { dolgu: "rgba(170,182,200,.55)", renk: "#cfd8e6", kalinlik: 3 });
        }
        if (insa) {
          const k = [A, B, C];
          if (s.dogru === "cevrel") for (const [p, q] of [[A, B], [B, C], [C, A]]) { const M = ortaNokta(p, q); c.dogru(M, topla(M, dik(fark(q, p))), { renk: RENK.sari, kesikli: "8 5", kalinlik: 1.6 }); }
          if (s.dogru === "ic") k.forEach((V, i) => c.parca(V, icAciortayAyagi(V, k[(i + 1) % 3], k[(i + 2) % 3]), { renk: RENK.sari, kesikli: "8 5", kalinlik: 1.6 }));
          if (s.dogru === "agirlik") k.forEach((V, i) => c.parca(V, ortaNokta(k[(i + 1) % 3], k[(i + 2) % 3]), { renk: RENK.sari, kesikli: "8 5", kalinlik: 1.6 }));
        }
        if (s.ad === "depo") {
          s.koseler.forEach((K, i) => {
            c.cokgen([{ x: K.x - 0.35, y: K.y - 0.3 }, { x: K.x + 0.35, y: K.y - 0.3 }, { x: K.x + 0.35, y: K.y + 0.15 }, { x: K.x, y: K.y + 0.45 }, { x: K.x - 0.35, y: K.y + 0.15 }], { dolgu: RNK[i], renk: "#1a2333", kalinlik: 1.5 });
            c.yazi(K, s.adlar[i], { dy: K.y > 2 ? -30 : 28, kalin: true, boyut: 15, renk: RNK[i] });
          });
          for (const K of s.koseler) c.parca(P, K, { renk: RENK.yesil, kesikli: "3 5", kalinlik: 1.4 });
        }
        if (s.ad === "cesme") for (const [p, q] of [[A, B], [B, C], [C, A]]) c.parca(P, dikmeAyagi(P, p, q), { renk: RENK.yesil, kesikli: "3 5", kalinlik: 1.4 });
        if (s.ad === "levha") c.parca(P, { x: P.x, y: P.y - 0.9 }, { renk: "#6b7486", kalinlik: 6 });
      });
      ctx.secenekler({
        etiket: "Problem", deger: 0,
        liste: SENARYOLAR.map((x, i) => ({ deger: i, metin: x.baslik })),
        degisti: (i) => { s = SENARYOLAR[i]; secim = null; insa = false; merkezSec.deger = null; P.ayarla(-1.5, -1, true); yaz(); },
      });
      const metin = ctx.not("");
      const merkezSec = ctx.secenekler({
        etiket: "Aranan yer hangi nokta?", deger: null,
        liste: Object.entries(MERKEZLER).map(([k, m]) => ({ deger: k, metin: `${m.ad} (${m.eleman})` })),
        degisti: (v) => {
          secim = v;
          insa = v === s.dogru;
          geri.className = `d-geri-bildirim ${insa ? "dogru" : "yanlis"}`;
          geri.textContent = insa ? `Doğru seçim! Sarı ${MERKEZLER[v].eleman} çizildi. Şimdi P'yi kesişim noktasına taşı.` : s.yanlis[v];
          T.yenile(); kontrol();
        },
      });
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(geri);
      const f = formulListesi(ctx, ["", "", ""]);
      const durum = ctx.not("");
      function yaz() {
        metin.innerHTML = `<p>${s.metin}</p>`;
        geri.textContent = cozulen.has(s.ad) ? "Bu problemi çözdün ✓" : "";
        geri.className = `d-geri-bildirim ${cozulen.has(s.ad) ? "dogru" : ""}`;
        const etiketler = s.ad === "depo" ? s.adlar.map((a) => `P – ${a}`) : s.ad === "cesme" ? ["P – 1. yol", "P – 2. yol", "P – 3. yol"] : ["Denge noktasından sapma", "", ""];
        const degerler = f.el.querySelectorAll(".mt-deger");
        f.el.querySelectorAll("span:not(.mt-deger)").forEach((sp, i) => {
          sp.textContent = etiketler[i];
          sp.hidden = degerler[i].hidden = !etiketler[i];
        });
        T.yenile(); olc();
      }
      function olc() {
        const [A, B, C] = s.koseler;
        if (s.ad === "depo") [A, B, C].forEach((K, i) => f.ayarla(i, `${kisa(uzaklik(P, K), 2)} km`));
        else if (s.ad === "cesme") [[A, B], [B, C], [C, A]].forEach(([p, q], i) => f.ayarla(i, `${kisa(dogruyaUzaklik(P, p, q) * 10, 1)} m`));
        else { const d = uzaklik(P, agirlikMerkezi(A, B, C)); f.ayarla(0, d < HEDEF_TOLERANS ? "dengede ✓" : `levha eğiliyor (${kisa(d * 10, 0)} cm)`); f.ayarla(1, ""); f.ayarla(2, ""); }
        durum.innerHTML = `<p>Çözülen problem: ${cozulen.size}/3</p>`;
      }
      function kontrol() {
        const hedef = senaryoHedefi(s);
        if (secim === s.dogru && uzaklik(P, hedef) < HEDEF_TOLERANS && !cozulen.has(s.ad)) {
          cozulen.add(s.ad);
          P.ayarla(hedef.x, hedef.y, true);
          geri.className = "d-geri-bildirim dogru";
          geri.textContent = `Çözdün! ${MERKEZLER[s.dogru].ad} tam aranan yer.`;
          olc();
          if (cozulen.size === 3) ctx.gorevTamam();
        }
      }
      T.degisti(() => olc());
      T.birakti(() => kontrol());
      yaz();
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Değerlendirme: üçgenin gizli merkezleri",
    anlatim: `
      <p>Sekiz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>6 doğru</b> yaparsan dersi tamamlamış olursun.</p>`,
    gorev: "Değerlendirmede en az <b>6/8</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (performans görevi, akran ve grup değerlendirme) uyumludur. Çeldiriciler “köşeye/kenara eşit uzaklık” karışıklığını ve oranın ters kurulmasını hedefler.",
    kur(ctx) {
      const T = ctx.sahne;
      T.sifirla();
      T.goster(ALAN);
      const sekil = (ciz) => (kap) => sekilCiz(kap, { alan: { xmin: -4.6, xmax: 4.8, ymin: -2.6, ymax: 3.6 }, izgara: 0 }, ciz);
      const A = { x: -1, y: 3 }, B = { x: -4, y: -2 }, C = { x: 4.5, y: -2 };
      ctx.sinav([
        {
          tur: "sayi", metin: "ABC üçgeninde AD iç açıortaydır. AB = 6, AC = 9 ve BC = 10 ise <b>BD</b> kaç birimdir?",
          grafik: sekil((c) => {
            const D = icAciortayAyagi(A, B, C);
            c.cokgen([A, B, C], { dolgu: "rgba(79,195,247,.1)" }); c.parca(A, D, { renk: RENK.turuncu, kalinlik: 2.5 });
            c.aci(B, A, D, { r: 24 }); c.aci(D, A, C, { r: 24, renk: RENK.sari });
            c.kenarYazisi(A, B, "6", { uzak: C }); c.kenarYazisi(A, C, "9", { uzak: B }); c.kenarYazisi(B, D, "?", { uzak: A, renk: RENK.mavi });
            for (const [p, a, dx, dy] of [[A, "A", 0, -14], [B, "B", -12, 10], [C, "C", 12, 10], [D, "D", 0, 14]]) c.yazi(p, a, { dx, dy, kalin: true });
          }),
          dogru: 4, tolerans: 0.01,
          aciklama: "BD/DC = AB/AC = 6/9 = 2/3. BC = 10 olduğundan BD = 10·2/5 = 4.",
        },
        {
          tur: "sayi", metin: "G, ABC üçgeninin ağırlık merkezidir. A köşesinden çizilen kenarortayın uzunluğu <b>12 cm</b> ise <b>AG</b> kaç cm'dir?",
          dogru: 8, tolerans: 0.01, birim: "cm",
          aciklama: "Ağırlık merkezi kenarortayı köşeden itibaren 2 : 1 böler: AG = 12·2/3 = 8 cm, GD = 4 cm.",
        },
        {
          tur: "coktan", metin: "Geniş açılı bir üçgenin <b>çevrel çemberinin merkezi</b> nerededir?",
          siklar: ["Üçgenin içinde", "Üçgenin dışında", "En uzun kenarın orta noktasında", "Geniş açının köşesinde"], dogru: 1,
          aciklama: "Kenar orta dikmelerin kesişimi geniş açılı üçgende dışarıya düşer. Hipotenüsün ortası yalnızca dik üçgende geçerlidir.",
        },
        {
          tur: "coktan", metin: "Bir <b>dik üçgenin</b> yükseklikleri nerede kesişir?",
          siklar: ["Hipotenüsün orta noktasında", "Dik açının köşesinde", "Üçgenin dışında", "Ağırlık merkezinde"], dogru: 1,
          aciklama: "Dik kenarlar birbirine diktir; ikisi de yüksekliktir ve dik köşede kesişir. Hipotenüsün ortası çevrel çemberin merkezidir.",
        },
        {
          tur: "sayi", metin: "Hipotenüsü <b>10 cm</b> olan bir dik üçgende, dik köşeden hipotenüse çizilen kenarortay kaç cm'dir?",
          dogru: 5, tolerans: 0.01, birim: "cm",
          aciklama: "Hipotenüsün orta noktası üç köşeye eşit uzaklıktadır: kenarortay = hipotenüs/2 = 5 cm.",
        },
        {
          tur: "coktan", metin: "Üç mahalleye <b>eşit uzaklıkta</b> bir sağlık ocağı yapılacak. Bu nokta hangi doğruların kesişimidir?",
          siklar: ["İç açıortayların", "Kenarortayların", "Kenar orta dikmelerin", "Yüksekliklerin"], dogru: 2,
          aciklama: "Kenar orta dikme üzerindeki noktalar kenarın uçlarına eşit uzaklıktadır; kesişimleri üç köşeye eşit uzaklıktaki noktadır (çevrel çemberin merkezi).",
        },
        {
          tur: "coktan", metin: "Üçgenin <b>iç teğet çemberinin merkezi</b> için hangisi doğrudur?",
          siklar: ["Üç köşeye eşit uzaklıktadır", "Üç kenara eşit uzaklıktadır", "Kenarortayları 2 : 1 böler", "Her zaman yüksekliklerin kesişimidir"], dogru: 1,
          aciklama: "İç açıortayların kesişimi olan I, üç kenara eşit uzaklıktadır; bu uzaklık iç teğet çemberin yarıçapıdır.",
        },
        {
          tur: "sayi", metin: "ABC üçgeninde AB = 6, AC = 4, BC = 5'tir. A'daki dış açıortay BC doğrusunu E noktasında kesiyor. <b>EC</b> kaç birimdir?",
          dogru: 10, tolerans: 0.01,
          aciklama: "EB/EC = AB/AC = 3/2. E, C tarafındaki uzantıdadır: EB = EC + 5 → 3·EC = 2·(EC + 5) → EC = 10.",
        },
      ], { baslik: "Üçgenin gizli merkezleri", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: tahtaKur });
