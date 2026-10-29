// 10. Sınıf Biyoloji · 1. Tema: Enerji — A dersi: Güneşten Besine (ATP ve fotosentez)
// BİY.10.1.1 enerjinin gerekliliği ve ATP · BİY.10.1.2 fotosentez modeli · BİY.10.1.3 fotosentez deneyi
import { dersBaslat, sayi, el, Grafik } from "../../../../engine/ders.js";
import { biyoSahnesi } from "./sahne.js";
import { siniflandir, ortuKart, poisson, sinav } from "../ortak/bilesenler.js";
import {
  zincirAdim, zincirDengesi, atpHavuzu, ISLER, ATP_ENERJI_KJ, PIGMENTLER, yaprakSogurma, eylemSpektrumu,
  ISIK_RENKLERI, isikSiddeti, fotosentezHizi, sinirlayiciFaktor, tepkimeAdim, izotopDeneyi, mumYak, fanusGun, FANUS,
} from "./model.js";

const YESIL = "#5ad38b", TURUNCU = "#ffb547";
const geriBildirim = (ctx) => { const g = el("div", { class: "d-geri-bildirim" }); ctx.kontroller.append(g); return g; };
const yaz = (g, dogru, html) => { g.className = `d-geri-bildirim ${dogru ? "dogru" : "yanlis"}`; g.innerHTML = html; };

/** Sahne üstünde yüzen küçük bilgi paneli (adım değişince katmanla birlikte silinir) */
const panel = (ctx, sinif) => { const p = el("div", { class: `bio-hud ${sinif}` }); ctx.katman.append(p); return p; };
/** Gerçek zamanlı adım döngüsü: fn(dt) her ~50 ms'de çağrılır, adım değişince durur */
function zamanlayici(ctx, fn) {
  let son = performance.now();
  const id = setInterval(() => { const s = performance.now(), dt = Math.min(1, (s - son) / 1000); son = s; fn(dt); }, 50);
  ctx.temizlik(() => clearInterval(id));
}

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Güneş sönerse ne olur?",
    cikti: "BİY.10.1.1-a",
    anlatim: `
      <p>Bir çayırda <b>otlar</b> güneş ışığıyla besin üretiyor, <b>tavşanlar</b> otla, <b>tilkiler</b> tavşanla besleniyor. Sağdaki şemada okların kalınlığı, bir basamaktan diğerine akan <b>enerji</b> miktarını gösterir.</p>
      <p>Her canlı, yaşamını sürdürmek için sürekli enerji harcar: büyür, hareket eder, vücut sıcaklığını korur, hücrelerini onarır. Bu enerji besinlerden gelir.</p>
      <p>Önce <b>tahminini</b> seç: Güneş ışığı tamamen kesilirse ilk kim etkilenir? Sonra ışığı kıs ve zamanı başlat. Tilki hiç ot yemiyor; yine de güneşe muhtaç mı?</p>`,
    gorev: "Tahminini seç, güneş ışığını <b>%0</b>'a indir ve zinciri <b>tilkiler yarıya inene kadar</b> izle.",
    ogretmen: "Program, “Güneş olmasaydı canlılara ne olurdu?”, “Fotosentez olmasaydı bundan sadece bitkiler mi etkilenirdi?”, “Bir insan beslenmeden kaç gün yaşayabilir?” sorularıyla merak uyandırılmasını öneriyor. Önce bireysel düşündürüp eşlere paylaştırın, sonra simülasyonla sınayın. Modeldeki gün sayıları temsilîdir; önemli olan etkilenme sırasıdır (enerji akışı tek yönlüdür, depolar tükendikçe üst basamaklar etkilenir).",
    kur(ctx) {
      const S = ctx.sahne;
      S.istasyon("cayir");
      const d0 = zincirDengesi(1);
      let s = { ...d0 }, gun = 0, L = 1, calisiyor = false, birikim = 0, tahmin = null, cRef = null, bitti = false;
      const [gr] = ctx.grafikler([{ baslik: "Biyokütle (başlangıca göre %)", x: { etiket: "gün", min: 0, max: 160 }, y: { etiket: "%", min: 0, max: 110 } }]);
      const sP = gr.seri("P", { renk: YESIL }), sH = gr.seri("H", { renk: "#d9c4a3" }), sC = gr.seri("C", { renk: "#ff8a3d" });
      const kaydet = () => { sP.ekle(gun, (100 * s.P) / d0.P); sH.ekle(gun, (100 * s.H) / d0.H); sC.ekle(gun, (100 * s.C) / d0.C); };
      kaydet();
      // sağ üstte enerji akışı şeması: okun kalınlığı akan enerjiyi gösterir
      const sema = panel(ctx, "bio-akis");
      let anahtar = "";
      function ciz() {
        const o = { P: s.P / d0.P, H: s.H / d0.H, C: s.C / d0.C };
        const yeni = `${L}|${o.P.toFixed(3)}|${o.H.toFixed(3)}|${o.C.toFixed(3)}|${gun}`;
        if (yeni === anahtar) return;
        anahtar = yeni;
        S.cayir.ayarla({ L, ...o });
        const satir = (ad, deger, renk) => `<div class="bio-akis-kutu" style="--renk:${renk}"><b>${ad}</b><span>${deger}</span></div>`;
        const okH = (v) => (v > 0.02 ? `<i class="bio-akis-ok" style="--k:${(2 + 10 * Math.min(1, v)).toFixed(1)}px"></i>` : `<i class="bio-akis-yok">✕</i>`);
        sema.innerHTML = `<div class="bio-akis-gun">Gün: <b>${gun}</b></div>`
          + satir("Güneş", `ışık: %${Math.round(L * 100)}`, "#ffd45a") + okH(L)
          + satir("Üretici (ot)", `${sayi(100 * o.P, 0)} %`, YESIL) + okH(o.P)
          + satir("Otçul (tavşan)", `${sayi(100 * o.H, 0)} %`, "#d9c4a3") + okH(o.H)
          + satir("Etçil (tilki)", `${sayi(100 * o.C, 0)} %`, "#ff8a3d");
      }
      zamanlayici(ctx, (dt) => {
        if (calisiyor) {
          birikim += dt * 14;
          while (birikim >= 1) {
            birikim -= 1; gun++;
            s = zincirAdim(s, L);
            kaydet();
            if (gun >= 160) { calisiyor = false; btn.textContent = "▶ Zamanı başlat"; birikim = 0; }
            kontrolEt();
            if (!calisiyor) break;
          }
        }
        ciz();
      });
      const tahminSec = ctx.secenekler({
        etiket: "Tahminin: Güneş ışığı kesilirse ilk kim etkilenir?",
        liste: [{ deger: "P", metin: "Otlar" }, { deger: "H", metin: "Tavşanlar" }, { deger: "C", metin: "Tilkiler" }, { deger: "hepsi", metin: "Hepsi aynı anda" }],
        deger: null, degisti: (v) => (tahmin = v),
      });
      const isikK = ctx.kaydirici({ etiket: "Güneş ışığı", min: 0, max: 100, adim: 10, deger: 100, birim: "%", degisti: (v) => { L = v / 100; cRef = L === 0 ? s.C : null; } });
      const [btn] = ctx.dugmeler([
        { metin: "▶ Zamanı başlat", ana: true, tik: () => {
          if (!tahmin) { yaz(geri, false, "Önce tahminini seç."); return; }
          if (gun >= 160) sifirla();
          calisiyor = !calisiyor; btn.textContent = calisiyor ? "⏸ Durdur" : "▶ Zamanı başlat";
          tahminSec.etkin(false);
        } },
        { metin: "↺ Sıfırla", tik: () => sifirla() },
      ]);
      const geri = geriBildirim(ctx);
      ctx.not("<p><b>Düşün:</b> Bir insan hiç besin almadan, yalnızca su içerek birkaç hafta yaşayabilir. Bu sürede vücut enerjiyi nereden bulur? (İpucu: glikojen ve yağ depoları.)</p>");
      function sifirla() {
        s = { ...d0 }; gun = 0; birikim = 0; calisiyor = false; cRef = L === 0 ? s.C : null;
        btn.textContent = "▶ Zamanı başlat";
        for (const x of [sP, sH, sC]) x.temizle();
        kaydet(); tahminSec.etkin(true);
      }
      function kontrolEt() {
        if (bitti || L !== 0 || cRef == null || cRef < 0.2 * d0.C || s.C > 0.5 * cRef) return;
        bitti = true;
        const sira = "önce <b>otlar</b>, sonra <b>tavşanlar</b>, en son <b>tilkiler</b>";
        const m = {
          P: `Tahminin doğru! Enerji akışı kesilince ${sira} azaldı.`,
          H: `Tavşanlar etkilendi ama ilk değil: ${sira} azaldı. Tavşanların besini olan otlar önce tükendi.`,
          C: `Tilkiler en son etkilendi: ${sira} azaldı. Tilkiler, depoladıkları enerjiyle ve kalan tavşanlarla bir süre dayandı.`,
          hepsi: `Hepsi etkilendi ama aynı anda değil: ${sira} azaldı.`,
        }[tahmin];
        yaz(geri, tahmin === "P", `${m} Fotosentez durunca yalnızca bitkiler değil, <b>besin zincirindeki tüm canlılar</b> enerjisiz kalır.`);
        ctx.gorevTamam();
      }
      ctx.temizlik(() => (calisiyor = false));
      void isikK;
      return {
        bak: (konum, hedef, sure = 1.2) => S.kameraGit({ konum, hedef, sure }),
        vurgula: (...m) => S.vurgula(...m),
        isik(v) { L = v; isikK.deger = Math.round(v * 100); cRef = L === 0 ? s.C : null; },
        don: () => { S.vurgula(); S.istasyonaDon(); },
      };
    },
    anlat: [
      { s: "Bu çayırda her şey <b>Güneş</b>'le başlıyor. Gelen enerjinin kaynağı orada.", yap: (api) => { api.vurgula("Güneş"); api.bak([0.6, 2.4, 10.2], [-8, 5, -22]); } },
      { s: "Otlar ışığı yakalayıp <b>besin</b> yapar. Bu yüzden onlara <b>üretici</b> diyoruz.", yap: (api) => { api.vurgula("Üretici"); api.bak([0.4, 1.3, 4.5], [0, 0.2, -1.5]); } },
      { s: "Tavşan otu yer; otun içindeki enerji tavşana geçer. Tavşan bir <b>otçuldur</b>.", yap: (api) => { api.vurgula("Otçul"); api.bak([1.6, 1.1, 1.8], [0, 0.25, -3.2]); } },
      { s: "Tilki tavşanı avlar. Enerji bir basamak daha yukarı çıkar: tilki bir <b>etçildir</b>.", yap: (api) => { api.vurgula("Etçil"); api.bak([-0.6, 1.6, -0.5], [0, 0.4, -7]); } },
      { soru: "Tilki hiç ot yemiyor. Enerjisinin asıl kaynağı nedir?", secenekler: ["Tavşan", "Güneş", "Toprak"], dogru: 1,
        aciklama: "Tavşanın enerjisi otlardan, otlarınki Güneş'ten gelir. Zincirin başında hep Güneş vardır.", ipucu: "Tavşanın enerjisi nereden geliyordu? Bir basamak daha geri git." },
      { s: "Sarı parçacıklar akan enerjiyi gösteriyor. Akış <b>tek yönlüdür</b>: Güneş → ot → tavşan → tilki.", yap: (api) => { api.vurgula(); api.don(); } },
      { s: "Şimdi Güneş'i biraz kısalım. Gökyüzü ve çayır nasıl değişiyor, izle…", yap: (api) => api.isik(0.3) },
      { soru: "Işık azalınca enerji akışında ilk hangi halka zayıflar?", secenekler: ["Tilki → tavşan", "Güneş → ot", "Hepsi birden"], dogru: 1,
        aciklama: "Işık doğrudan otlara gelir; ot az besin yapınca zayıflık zincir boyunca yukarı yayılır.", ipucu: "Işığı doğrudan kullanan canlı hangisi?" },
      { s: "Sıra sende: tahminini seç, ışığı tamamen kes ve zinciri izle." },
    ],
    anlatBitti: (api) => { api.isik(1); api.don(); },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "ATP: hücrenin şarj edilebilir pili",
    cikti: "BİY.10.1.1-c",
    anlatim: `
      <p>Besinlerdeki enerji hücrede doğrudan kullanılmaz; önce <b>ATP (adenozin trifosfat)</b> molekülüne aktarılır. ATP; <b>adenin</b> (azotlu organik baz), <b>riboz</b> (beş karbonlu şeker) ve <b>üç fosfat</b> grubundan oluşur. Adenin ile riboza birlikte <b>adenozin</b> denir.</p>
      <p>Hücre bir iş yapacağı zaman ATP'nin son fosfatı su yardımıyla ayrılır:
      <span class="formul">ATP + H₂O → ADP + Pi + enerji</span> (yaklaşık ${sayi(ATP_ENERJI_KJ)} kJ/mol).</p>
      <p>ADP ve Pi, besinlerden gelen enerjiyle yeniden ATP'ye dönüşür. Yani ATP bir <b>şarj edilebilir pil</b> gibidir: harcanır, yeniden doldurulur. Molekülü döndürüp yakından incele, sonra hücrene iş yaptır.</p>`,
    gorev: "Üç hücresel işin <b>hepsini</b> yaptır. Pil biterse onu yeniden doldurman gerekecek.",
    ogretmen: "Program, öğrencilerin ATP'nin yapısı ve enerji dönüşümlerindeki işlevi hakkında soru sorup bilgi toplamasını istiyor; bu süreçte ATP sentezinin hangi yollarla gerçekleştiği (substrat düzeyinde fosforilasyon, fotofosforilasyon, oksidatif fosforilasyon) verilmez. “Pil” benzetmesinin sınırlarını tartıştırın: ATP uzun süreli bir depo değildir, sürekli üretilip tüketilen bir enerji taşıyıcısıdır.",
    kur(ctx) {
      const S = ctx.sahne;
      S.istasyon("atp"); S.atp.aninda("ATP");
      const havuz = atpHavuzu(5);
      const yapilan = new Set();
      let harcanan = 0, dolum = 0;
      const pil = el("div", { class: "bio-pil", "aria-label": "Hücrenin ATP pili" });
      const denklem = el("div", { class: "bio-denklem", html: "ATP + H₂O → ADP + Pi + enerji" });
      ctx.katman.append(pil, denklem);
      const g = ctx.gostergeler([
        { ad: "atp", etiket: "Pildeki ATP", ondalik: 0 },
        { ad: "adp", etiket: "ADP + Pi", ondalik: 0 },
        { ad: "e", etiket: "Harcanan ATP", ondalik: 0 },
      ]);
      const geri = geriBildirim(ctx);
      const isDugmeleri = ctx.dugmeler(ISLER.map((is) => ({ metin: `${is.metin} · ${is.atp} ATP`, tik: () => isYap(is) })));
      ctx.dugmeler([{ metin: "🔋 Glikozu solunumda kullan → pili doldur", ana: true, tik: doldur }]);
      ctx.not("<p><b>Merak et:</b> Hücrelerdeki ATP miktarı çok küçüktür, ancak çok kısa süreli ihtiyacı karşılar. Buna rağmen bir insan günde kabaca kendi vücut kütlesi kadar ATP üretip harcar. Bu nasıl mümkün olabilir?</p>");
      function guncelle() {
        pil.replaceChildren(el("b", {}, "ATP pili"), el("div", { class: "bio-pil-govde" },
          Array.from({ length: havuz.kapasite }, (_, i) => el("i", { class: i < havuz.atp ? "dolu" : "" }))),
          el("span", {}, `${havuz.atp} ATP · ${havuz.adp} ADP`));
        g.ayarla("atp", havuz.atp); g.ayarla("adp", havuz.adp); g.ayarla("e", harcanan);
        isDugmeleri.forEach((b, i) => b.classList.toggle("bio-yapildi", yapilan.has(ISLER[i].ad)));
      }
      function isYap(is) {
        if (!havuz.kullan(is.atp)) {
          yaz(geri, false, `${is.metin} için <b>${is.atp} ATP</b> gerekiyor, pilde ${havuz.atp} ATP var. Önce pili doldur.`);
          return;
        }
        harcanan += is.atp; yapilan.add(is.ad);
        if (S.atp.durum !== "ATP") S.atp.aninda("ATP");
        S.atp.parcala(() => { if (havuz.atp > 0) setTimeout(() => S.atp.durum === "ADP" && S.atp.aninda("ATP"), 500); });
        yaz(geri, true, `${is.metin} yapıldı: ${is.atp} ATP → ${is.atp} ADP + ${is.atp} Pi. Açığa çıkan enerji işte kullanıldı, bir kısmı da ısıya dönüştü.`);
        guncelle();
        if (yapilan.size === ISLER.length) {
          ctx.gorevTamam();
          geri.innerHTML += ` <br><b>Üç iş de tamam!</b> ${dolum ? `Pili ${dolum} kez doldurdun:` : ""} ATP sürekli harcanıp yeniden üretilen bir enerji taşıyıcısıdır.`;
        }
      }
      function doldur() {
        if (havuz.atp === havuz.kapasite) { yaz(geri, false, "Pil zaten dolu. Önce bir iş yaptır."); return; }
        const n = havuz.doldur(); dolum++;
        if (S.atp.durum === "ADP") S.atp.doldur(); else S.atp.aninda("ATP");
        yaz(geri, true, `Glikozdaki kimyasal enerji hücresel solunumla açığa çıktı ve ${n} ADP + ${n} Pi yeniden <b>ATP</b>'ye dönüştü.`);
        guncelle();
      }
      guncelle();
      return {
        bak: (konum, hedef, sure = 1.1) => S.kameraGit({ konum, hedef, sure }),
        vurgula: (...m) => S.vurgula(...m),
        parcala: () => { if (S.atp.durum !== "ATP") S.atp.aninda("ATP"); S.atp.parcala(); },
        don: () => { S.vurgula(); S.atp.aninda("ATP"); S.istasyonaDon(); },
      };
    },
    anlat: [
      { s: "Hücrenin içine girdik. Ortadaki molekül <b>ATP</b>: hücrenin “bozuk parası”.", yap: (api) => api.vurgula("ATP") },
      { s: "Soldaki halkalı yapı <b>adenin</b>, azotlu bir organik baz.", yap: (api) => { api.vurgula("Adenin"); api.bak([-6, 2.4, 15], [-4.5, 1.6, 0]); } },
      { s: "Ona bağlı beşgen şeker <b>riboz</b>. Adenin + riboz birlikte <b>adenozin</b> adını alır.", yap: (api) => { api.vurgula("Riboz"); api.bak([-3, 0.2, 14], [-2.2, -0.6, 0]); } },
      { s: "Sağda arka arkaya <b>üç fosfat</b> var: α, β, γ. Adındaki “tri” buradan gelir.", yap: (api) => { api.vurgula("Fosfat"); api.bak([5, 1.2, 15], [3.5, 0, 0]); } },
      { soru: "ATP'nin yapısında hangisi bulunur?", secenekler: ["Glikoz", "Riboz", "Deoksiriboz"], dogru: 1,
        aciklama: "ATP; adenin, riboz ve üç fosfattan oluşur. Deoksiriboz DNA'nın şekeridir.", ipucu: "Beşgen şekerin adını az önce okudun." },
      { s: "Hücre iş yapacağı zaman <b>son fosfat</b> su yardımıyla kopar. İzle…", yap: (api) => { api.vurgula("Fosfat γ"); api.parcala(); } },
      { s: "Geriye <b>ADP</b> (iki fosfat) ve serbest fosfat <b>Pi</b> kalır; açığa çıkan enerji işte kullanılır.", yap: (api) => api.vurgula() },
      { soru: "ADP yeniden ATP'ye nasıl döner?", secenekler: ["Kendiliğinden, enerji gerekmez", "Besinlerden gelen enerjiyle", "Fosfat yok olunca"], dogru: 1,
        aciklama: "ADP + Pi, solunumda besinlerden açığa çıkan enerjiyle yeniden ATP olur. Pil gibi: harcanır, doldurulur.", ipucu: "Pili doldurmak için bir enerji kaynağı gerekir." },
      { s: "Şimdi sen hücrene iş yaptır; pil biterse doldurmayı unutma." },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Bilgiyi sına: doğru mu, yanılgı mı?",
    cikti: "BİY.10.1.1-ç",
    anlatim: `
      <p>İnternette ve sosyal medyada enerji ve ATP hakkında pek çok bilgi dolaşıyor; bazıları doğru, bazıları <b>kavram yanılgısı</b>.</p>
      <p>Kartları <b>doğru bilgi</b> ya da <b>yanlış bilgi</b> kutusuna yerleştir. Yanlış yerleştirdiğin kartlar için nedenini okuyacaksın.</p>
      <p>Bilginin doğruluğunu değerlendirirken kaynağına bak: bilimsel dergiler, üniversite ve araştırma kurumlarının yayınları, ders kitapları güvenilir kaynaklardır.</p>`,
    gorev: "Sekiz kartın hepsini doğru kutuya yerleştir.",
    ogretmen: "Program, öğrencilerin topladıkları bilgilerin doğruluğunu bilim dergileri ve bilimsel makaleler gibi güvenilir kaynaklardan değerlendirmesini ve bilgileri görsel/şematik olarak sunarak canlılık–enerji ilişkisi hakkında çıkarım yapmasını istiyor. Bu adımdaki yazı alanı, programın önerdiği öğrenme günlüğünün bir girdisi olarak kullanılabilir.",
    kur(ctx) {
      ctx.sahne.istasyon("kartlar");
      const kart = ortuKart(ctx, "Doğru bilgi mi, kavram yanılgısı mı?");
      siniflandir(kart, {
        kutular: [{ ad: "d", baslik: "✓ Doğru bilgi" }, { ad: "y", baslik: "✗ Yanlış bilgi" }],
        ogeler: [
          { metin: "ATP, bütün canlı hücrelerde kullanılan ortak enerji molekülüdür.", dogru: "d", neden: "Bakteriden insana kadar tüm canlılar ATP kullanır; bu, canlıların ortak özelliklerinden biridir." },
          { metin: "ATP, vücutta uzun süreli enerji deposu olarak birikir.", dogru: "y", neden: "ATP depolanmaz; hücrede az miktarda bulunur ve sürekli yenilenir. Uzun süreli depolar glikojen ve yağdır." },
          { metin: "Bitki hücreleri yalnızca fotosentez yapar, solunum yapmaz.", dogru: "y", neden: "Bitki hücreleri de gece-gündüz hücresel solunum yaparak ATP üretir." },
          { metin: "Uyurken de hücrelerimiz ATP harcar.", dogru: "d", neden: "Kalp atışı, solunum, beyin faaliyeti, vücut sıcaklığı ve onarım uykuda da sürer." },
          { metin: "Yalnızca hareket eden canlılar enerjiye ihtiyaç duyar.", dogru: "y", neden: "Hareket etmeyen bir bitki de büyümek, madde taşımak ve sentez yapmak için enerji harcar." },
          { metin: "Besinlerdeki enerji hücresel işlerde kullanılmadan önce ATP'ye aktarılır.", dogru: "d", neden: "Hücresel işlerin çoğu doğrudan ATP'nin enerjisiyle yapılır." },
          { metin: "Güneş enerjisi besin zincirine üreticilerin fotosentezi ile girer.", dogru: "d", neden: "Tüketiciler güneş enerjisini doğrudan kullanamaz; üreticilerin yaptığı besinlerle alır." },
          { metin: "ATP'nin son fosfatı ayrıldığında enerji yok olur.", dogru: "y", neden: "Enerji yok olmaz; bir kısmı hücresel işe, bir kısmı ısıya dönüşür (enerjinin korunumu)." },
        ],
        tamam: () => ctx.gorevTamam(),
      });
      const kaynak = ctx.secenekler({
        etiket: "Bu bilgileri doğrulamak için en güvenilir kaynak hangisi?",
        liste: [{ deger: 0, metin: "Sosyal medya paylaşımı" }, { deger: 1, metin: "Bilimsel dergi / üniversite yayını" }, { deger: 2, metin: "Takviye ürünü reklamı" }, { deger: 3, metin: "Forum yorumu" }],
        deger: null,
        degisti: (v) => yaz(kg, v === 1, v === 1 ? "Doğru. Hakemli bilimsel yayınlar uzmanlarca denetlenir." : "Bu kaynak denetimden geçmez ya da ticari amaç taşıyabilir. Bilgiyi bilimsel bir kaynakla karşılaştır."),
      });
      const kg = geriBildirim(ctx);
      void kaynak;
      ctx.yaziAlani({ etiket: "<b>Öğrenme günlüğü:</b> Canlılık ile enerji arasındaki ilişki hakkında vardığın çıkarımı kendi cümlelerinle yaz.", anahtar: "enerji-cikarim", enAz: 60 });
      return { bak: (konum, hedef, sure = 1.4) => ctx.sahne.kameraGit({ konum, hedef, sure }), don: () => ctx.sahne.istasyonaDon() };
    },
    anlat: [
      { s: "Çayıra geri döndük. Bu ot da, tavşan da, sen de her an <b>enerji</b> harcıyoruz.", yap: (api) => api.bak([2, 1.4, 6], [0, 0.6, -3]) },
      { s: "Hareket etmeyen ağaç bile büyümek, su taşımak ve madde yapmak için enerji harcar.", yap: (api) => api.bak([3, 2.2, 4], [-4, 4, -18]) },
      { soru: "Uyurken vücudumuz enerji harcar mı?", secenekler: ["Hayır, dinlenir", "Evet, kalp ve beyin çalışır", "Yalnızca rüya görürken"], dogru: 1,
        aciklama: "Kalp atışı, solunum, beyin ve vücut sıcaklığı uykuda da sürer; ATP sürekli harcanır.", ipucu: "Uykuda kalbin durur mu?" },
      { s: "İnternette bunun tersini söyleyen çok iddia var. Bazıları <b>kavram yanılgısı</b>." },
      { s: "Bir iddiayı sınarken <b>kaynağına</b> bak: bilimsel dergi, üniversite, ders kitabı." },
      { soru: "Hangisi en güvenilir kaynaktır?", secenekler: ["Ürün reklamı", "Hakemli bilimsel dergi", "Forum yorumu"], dogru: 1,
        aciklama: "Hakemli dergilerdeki yazılar başka uzmanlarca denetlenir.", ipucu: "Hangisini uzmanlar yayımlanmadan önce kontrol ediyor?" },
      { s: "Şimdi kartları doğru ya da yanlış kutusuna yerleştir.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Kloroplasta yolculuk",
    cikti: "BİY.10.1.2-a",
    anlatim: `
      <p>Fotosentez, bitki hücresindeki <b>kloroplastta</b> gerçekleşir. Kloroplastı döndür ve bölümlerine dokun.</p>
      <p>Fotosentez iki evrede düşünülür:</p>
      <ul>
        <li><b>Işığa bağımlı tepkimeler</b> (tilakoit zarlarında): pigmentler ışığı soğurur, su parçalanır (<b>fotoliz</b>), O₂ açığa çıkar, elektron taşıma sistemiyle <b>ATP</b> ve <b>NADPH</b> üretilir.</li>
        <li><b>Işıktan bağımsız tepkimeler</b> (stromada, <b>Calvin döngüsü</b>): CO₂, ATP ve NADPH kullanılarak <b>glikoz</b> yapılır.</li>
      </ul>
      <p>Parçacıkların yolunu izle: hangi madde nereden gelip nereye gidiyor?</p>`,
    gorev: "Fotosentezdeki olayları gerçekleştikleri yere göre <b>doğru kutuya</b> yerleştirerek modelini kur.",
    ogretmen: "Program, fotosentezin genel aşamalarını (ışığa bağlı evre, elektron taşıma sistemi, ATP sentezi, suyun parçalanması, ışıktan bağımsız evre, Calvin döngüsü) gösteren bir modelin grup çalışmasıyla oluşturulmasını öneriyor. Fotofosforilasyon mekanizması, devirli/devirsiz fotofosforilasyon, fotosistem çeşitleri, Calvin döngüsünün ara basamakları, C4 ve CAM bitkileri verilmez. Gruplardan önce kâğıda kendi modellerini çizmelerini, sonra buradaki modelle karşılaştırmalarını isteyin.",
    kur(ctx) {
      const S = ctx.sahne;
      S.istasyon("kloroplast");
      S.kp.akis({ isik: 6, su: 2.5, o2: 2.5, atp: 3, co2: 2, glikoz: 0.6 }); S.kp.calvinHizi = 1;
      const lejant = el("div", { class: "bio-lejant" },
        [["#fff2a0", "Işık"], ["#6fc3ff", "H₂O"], ["#bfefff", "O₂"], ["#ffa53d", "ATP + NADPH"], ["#9aa4b2", "CO₂"], ["#ffffff", "Glikoz"]]
          .map(([r, m]) => el("span", {}, el("i", { style: `background:${r}` }), m)));
      ctx.katman.append(lejant);
      const BOLUM = {
        dis: "<b>Dış zar:</b> Kloroplastı sitoplazmadan ayırır. Kloroplast çift zarlıdır.",
        ic: "<b>İç zar:</b> Kloroplasta madde giriş-çıkışını denetler.",
        tilakoit: "<b>Tilakoit:</b> Zarında klorofil ve karotenoit gibi pigmentler bulunur. <b>Işığa bağımlı tepkimeler</b> burada olur. Üst üste dizilmiş tilakoitlerin oluşturduğu yapıya <b>granum</b> denir.",
        stroma: "<b>Stroma:</b> Kloroplastın sıvı kısmı. Calvin döngüsünün enzimleri, kloroplast DNA'sı ve ribozomlar buradadır. <b>Işıktan bağımsız tepkimeler</b> burada olur.",
      };
      const bilgi = el("div", { class: "d-anlatim bio-bilgi-kutu", html: "<p>Kloroplastın bir bölümüne dokun.</p>" });
      ctx.kontroller.append(bilgi);
      S.tikla((b) => (bilgi.innerHTML = `<p>${BOLUM[b]}</p>`));
      const T = "t", St = "s";
      siniflandir(ctx.kontroller, {
        kutular: [{ ad: T, baslik: "Tilakoit: ışığa bağımlı" }, { ad: St, baslik: "Stroma: ışıktan bağımsız" }],
        ogeler: [
          { metin: "Işığın pigmentlerce soğurulması", dogru: T, neden: "Pigmentler tilakoit zarındadır." },
          { metin: "Suyun parçalanması (fotoliz)", dogru: T, neden: "Su, ışık enerjisiyle tilakoitte parçalanır." },
          { metin: "O₂'nin açığa çıkması", dogru: T, neden: "O₂, suyun parçalanmasından gelir; bu da tilakoitte olur." },
          { metin: "Elektron taşıma sistemi", dogru: T, neden: "Elektron taşıma sistemi tilakoit zarındadır." },
          { metin: "ATP ve NADPH üretimi", dogru: T, neden: "Işığa bağımlı tepkimelerin ürünleridir." },
          { metin: "CO₂'nin tutulması", dogru: St, neden: "CO₂, stromadaki Calvin döngüsünde organik moleküle bağlanır." },
          { metin: "ATP ve NADPH'nin harcanması", dogru: St, neden: "Tilakoitte üretilen ATP ve NADPH, stromada glikoz yapımında harcanır." },
          { metin: "Glikoz sentezi (Calvin döngüsü)", dogru: St, neden: "Calvin döngüsü stromada gerçekleşir." },
        ],
        sutun: 2,
        tamam: () => { ctx.gorevTamam(); bilgi.innerHTML = "<p><b>Modelin hazır!</b> Tilakoitte üretilen ATP ve NADPH (turuncu) stromaya geçip Calvin döngüsünü çalıştırıyor. Sonraki adımlarda bu modeli kanıtlarla sınayacaksın.</p>"; },
      });
      return {
        bak: (konum, hedef, sure = 1.2) => S.kameraGit({ konum, hedef, sure }),
        vurgula: (...m) => S.vurgula(...m),
        don: () => { S.vurgula(); S.istasyonaDon(); },
      };
    },
    anlat: [
      { s: "Bir yaprak hücresinden <b>kloroplasta</b> yaklaştık. Ön tarafı kesik: içini görebilesin diye.", yap: (api) => api.vurgula() },
      { s: "Kloroplast <b>çift zarlıdır</b>: dışta dış zar, onun içinde iç zar.", yap: (api) => { api.vurgula("Dış zar", "İç zar"); api.bak([6, 5, 14], [2, 0.5, 0]); } },
      { s: "Yeşil disk yığınları <b>tilakoit</b>; üst üste dizilince bir <b>granum</b> oluşur.", yap: (api) => { api.vurgula("Tilakoit"); api.bak([3, 3, 8.5], [0.5, 0, 0]); } },
      { s: "Tilakoit zarındaki pigmentler ışığı yakalar; <b>su</b> burada parçalanır ve <b>O₂</b> çıkar.", yap: (api) => api.vurgula("Tilakoit") },
      { soru: "Fotosentezde O₂ hangi bölümde açığa çıkar?", secenekler: ["Stromada", "Tilakoitte", "Dış zarda"], dogru: 1,
        aciklama: "O₂, suyun ışık enerjisiyle parçalanmasından gelir; bu tilakoitte olur.", ipucu: "Suyun parçalandığı yeri az önce gördün." },
      { s: "Disklerin arasını dolduran sıvı <b>stroma</b>. Mor halka orada dönen <b>Calvin döngüsü</b>.", yap: (api) => { api.vurgula("Stroma", "Calvin"); api.bak([3, 3.6, 8], [1.2, 1.4, 1.8]); } },
      { s: "Calvin döngüsü <b>CO₂</b>'yi, tilakoitten gelen ATP ve NADPH ile <b>glikoza</b> çevirir." },
      { soru: "Calvin döngüsü ATP'yi nereden alır?", secenekler: ["Tilakoitteki ışığa bağımlı tepkimelerden", "Topraktan", "Dış zardan"], dogru: 0,
        aciklama: "Işığa bağımlı tepkimeler ATP ve NADPH üretir; stroma bunları glikoz yapımında harcar.", ipucu: "Turuncu parçacıkların nereden çıkıp nereye gittiğine bak." },
      { s: "Şimdi bölümlere dokun ve olayları doğru yere yerleştirerek modelini kur.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Pigmentler ve ışığın rengi",
    cikti: "BİY.10.1.2-a",
    anlatim: `
      <p>Işık enerjisini <b>pigmentler</b> soğurur. <b>Klorofil a</b> ve <b>klorofil b</b> en çok <b>mavi-mor</b> ve <b>kırmızı</b> ışığı soğurur. <b>Karotenoitler</b> (turuncu <b>karoten</b>, sarı <b>ksantofil</b>) mavi-yeşil ışığı soğurup enerjiyi klorofile aktarır ve klorofili aşırı ışıktan korur. Domatesi kırmızı yapan <b>likopen</b> de bir karotenoittir.</p>
      <p>1882'de <b>Engelmann</b>, bir ipliksi alg üzerine prizmayla ışık tayfı düşürdü. Suya, oksijene yönelen bakteriler ekledi. Bakteriler nerede toplanırsa orada daha çok O₂, yani daha hızlı fotosentez vardır.</p>
      <p>Önce tahmin et, sonra deneyi başlat. Kaydırıcıyla dalga boyunu değiştirip grafikte soğurmayı incele.</p>`,
    gorev: "Tahminini seçip Engelmann deneyini çalıştır; ardından yaprağın ışığı en az soğurduğu (<b>%10'dan az</b>) bir dalga boyu bul.",
    ogretmen: "Program, pigmentlerin (klorofil, ksantofil, karoten, likopen vb.) fotosentezdeki görevlerinin verilmesini; pigmentlerin yapısına ve klorofil çeşitlerine girilmemesini istiyor. Bu adımda klorofil a/b ayrımı yalnızca soğurma grafiğini okumak için kullanıldı. Sonbaharda yaprakların sararmasını (klorofil yıkılınca karotenoitlerin görünür olması) yerel örneklerle (ör. Abant, Yedigöller) tartışabilirsiniz.",
    kur(ctx) {
      const S = ctx.sahne, E = S.lab.engelmann;
      S.istasyon("engelmann");
      let lambda = 550, tahmin = null, deneyYapildi = false, bulundu = false, calisiyor = false;
      const [gr] = ctx.grafikler([{ baslik: "Soğurma ve fotosentez hızı", x: { etiket: "dalga boyu (nm)", min: 400, max: 700 }, y: { etiket: "göreli", min: 0, max: 1.05 } }]);
      for (const p of Object.values(PIGMENTLER)) {
        const n = []; for (let l = 400; l <= 700; l += 4) n.push([l, Math.min(1, p.f(l))]);
        gr.seri(p.ad, { renk: p.renk, kalinlik: 2 }).ayarla(n);
      }
      const eylem = gr.seri("eylem", { renk: "#ffffff", kalinlik: 2.5, kesikli: true });
      gr.not([
        { x: 402, y: 1.02, metin: "— — beyaz: fotosentez hızı (deneyden sonra)", renk: "#c9d4e4", dy: 0 },
        { x: 672, y: 0.92, metin: "klorofil a", renk: PIGMENTLER.klorofilA.renk, dy: 0, dx: 2 },
        { x: 628, y: 0.66, metin: "klorofil b", renk: PIGMENTLER.klorofilB.renk, hiza: "right", dy: 0, dx: -6 },
        { x: 490, y: 0.78, metin: "karotenoitler", renk: PIGMENTLER.karotenoit.renk, dy: 0, dx: 4 },
      ]);
      gr.dikey(lambda);
      // bakteriler 3B lamda: eylem spektrumunun yüksek olduğu hücrelerin çevresinde toplanır
      let deneyZamani = null;
      ctx.temizlik(() => { clearTimeout(deneyZamani); E.calistir(false); });
      const tahminSec = ctx.secenekler({
        etiket: "Tahminin: Bakteriler en çok nerede toplanır?",
        liste: [{ deger: "mk", metin: "Mavi-mor ve kırmızı ışıkta" }, { deger: "y", metin: "Yeşil ışıkta" }, { deger: "s", metin: "Sarı-turuncu ışıkta" }, { deger: "e", metin: "Her yerde eşit" }],
        deger: null, degisti: (v) => (tahmin = v),
      });
      ctx.dugmeler([{ metin: "▶ Engelmann deneyini başlat", ana: true, tik: () => {
        if (!tahmin) { yaz(geri, false, "Önce tahminini seç."); return; }
        if (calisiyor) return;
        calisiyor = true; tahminSec.etkin(false); E.calistir(true);
        S.kameraGit({ ...E.yakin, sure: 1.2 });
        deneyZamani = setTimeout(() => !deneyYapildi && deneySonu(), 7000);
      } }]);
      const kL = ctx.kaydirici({ etiket: "Dalga boyu", min: 400, max: 700, adim: 5, deger: lambda, birim: "nm", degisti: (v) => { lambda = v; olc(); } });
      const gs = ctx.gostergeler([
        { ad: "a", etiket: "Klorofil a", ondalik: 0, birim: "%" }, { ad: "b", etiket: "Klorofil b", ondalik: 0, birim: "%" },
        { ad: "k", etiket: "Karotenoitler", ondalik: 0, birim: "%" }, { ad: "y", etiket: "Yaprak soğurur", ondalik: 0, birim: "%" },
      ]);
      const geri = geriBildirim(ctx);
      function olc() {
        E.dalga(lambda);
        gr.dikey(lambda);
        gs.ayarla("a", 100 * Math.min(1, PIGMENTLER.klorofilA.f(lambda))); gs.ayarla("b", 100 * Math.min(1, PIGMENTLER.klorofilB.f(lambda)));
        gs.ayarla("k", 100 * Math.min(1, PIGMENTLER.karotenoit.f(lambda))); gs.ayarla("y", 100 * yaprakSogurma(lambda));
        if (deneyYapildi && !bulundu && lambda < 650 && yaprakSogurma(lambda) < 0.1) {
          bulundu = true;
          yaz(geri, true, `Buldun: ${lambda} nm civarındaki yeşil ışığın çok azı soğuruluyor; çoğu <b>yansıyıp gözümüze ulaştığı</b> için yaprak yeşil görünür. Bu ışık fotosentezde çok az kullanılır.`);
          ctx.gorevTamam();
        }
      }
      function deneySonu() {
        deneyYapildi = true; calisiyor = true;
        const n = []; for (let l = 400; l <= 700; l += 4) n.push([l, eylemSpektrumu(l)]);
        eylem.ayarla(n);
        yaz(geri, tahmin === "mk", `${tahmin === "mk" ? "Tahminin doğru!" : "Tahminin tutmadı."} Bakteriler <b>mavi-mor</b> ve <b>kırmızı</b> ışık düşen hücrelerin çevresinde toplandı: O₂ en çok orada üretiliyor. Beyaz kesikli eğri (fotosentez hızı), pigmentlerin soğurma eğrileriyle örtüşüyor. Şimdi kaydırıcıyla yaprağın en az soğurduğu dalga boyunu bul.`);
        olc();
      }
      void kL; olc();
      return {
        bak: (konum, hedef, sure = 1.2) => S.kameraGit({ konum, hedef, sure }),
        vurgula: (...m) => S.vurgula(...m),
        dalga(l) { lambda = l; kL.deger = l; olc(); },
        don: () => { S.vurgula(); S.istasyonaDon(); },
      };
    },
    anlat: [
      { s: "Laboratuvar masasındayız. Burası <b>Engelmann</b>'ın 1882'deki deneyinin bir benzeri.", yap: (api) => api.vurgula() },
      { s: "Lambanın beyaz ışığı <b>prizmaya</b> giriyor ve renklerine ayrılıyor: bir <b>tayf</b>.", yap: (api) => { api.vurgula("Prizma", "Işık kaynağı"); api.bak([-13.5, 4.8, 6.5], [-10.4, 3.4, 0]); } },
      { s: "Tayf, lamın üstündeki <b>ipliksi alge</b> düşüyor: her hücreye farklı renk ışık geliyor.", yap: (api) => { api.vurgula("İpliksi alg"); api.bak([-10, 8.4, 3.4], [-10, 0.3, 1.0]); } },
      { s: "Beyaz çubuklar <b>aerobik bakteriler</b>: oksijen nerede çoksa oraya yüzerler.", yap: (api) => api.vurgula("Aerobik") },
      { soru: "Bakteriler hangi hücrelerin çevresinde toplanırsa ne anlarız?", secenekler: ["O hücreler çok O₂ üretiyor", "O hücreler ölüyor", "O hücreler ışık yansıtıyor"], dogru: 0,
        aciklama: "Bakteriler O₂'ye yönelir. Çok O₂ = hızlı fotosentez.", ipucu: "Bakteriler neyi arıyordu?" },
      { s: "Işığı soğuran maddelere <b>pigment</b> denir. Bu imleç <b>450 nm</b>'de: mavi ışık.", yap: (api) => { api.vurgula("nm"); api.dalga(450); } },
      { s: "Şimdi <b>530 nm</b>: yeşil ışık. Grafikte pigmentlerin soğurmasına bak.", yap: (api) => api.dalga(530) },
      { soru: "Yeşil ışığı klorofil çok mu soğurur, az mı?", secenekler: ["Çok", "Az"], dogru: 1,
        aciklama: "Yeşil ışık çok az soğurulur, çoğu yansır. Yaprağın yeşil görünmesinin nedeni bu.", ipucu: "Grafikte 530 nm'deki yeşil ve sarı eğriler ne kadar yüksek?" },
      { s: "Sıra sende: tahminini seç, deneyi başlat ve bakterileri izle.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => { api.dalga(550); api.don(); },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Modelini kanıtlarla sına",
    cikti: "BİY.10.1.2-b",
    anlatim: `
      <p>Bilim insanları fotosentez modelini deneylerle geliştirdi. İki kanıtla senin modelini sınayalım.</p>
      <p><b>1. Oksijen nereden geliyor?</b> 1941'de Ruben ve Kamen, suyu ya da CO₂'yi ağır oksijen izotopuyla (<b>¹⁸O</b>) işaretledi. Daha önce de Robert Hill (1937), CO₂ olmadan ışık alan kloroplastların O₂ çıkardığını göstermişti. Kırmızı atomlar işaretli oksijendir. Basitleştirilmiş denklem:
      <span class="formul">CO₂ + 2 H₂O → (CH₂O) + O₂ + H₂O</span></p>
      <p><b>2. “Işıktan bağımsız” tepkimeler ışık olmadan sürer mi?</b> Işığı ya da CO₂'yi kes, grafikte ATP + NADPH düzeyini ve glikoz yapım hızını izle.</p>`,
    gorev: "İzotop deneyini <b>iki maddeyle de</b> yap ve CO₂ varken <b>ışığı kapatıp</b> glikoz yapımının durduğunu gözle.",
    ogretmen: "Program, bilim insanlarının geliştirdiği fotosentez modelinin paylaşılmasını ve öğrencilerin kendi modellerini bu modelle karşılaştırıp yenilemesini istiyor (E3.10). Tartışma sorusu: “Işıktan bağımsız tepkimeler gece de sürer mi?” Grafikte ışık kapanınca Calvin döngüsünün kısa bir süre devam edip ATP ve NADPH tükenince durduğu görülür. CO₂ kesilince ise ATP ve NADPH birikir, ADP ve NADP⁺ azaldığı için ışığa bağımlı tepkimeler ve O₂ çıkışı da yavaşlar.",
    kur(ctx) {
      const S = ctx.sahne;
      S.istasyon("kanit");
      S.kp.akis({ isik: 6, su: 2.5, o2: 2.5, atp: 3, co2: 2, glikoz: 0.6 }); S.kp.calvinHizi = 1;
      let isaretli = null, tahmin = null;
      const yapilan = new Set();
      let isik = true, co2 = true, A = 0.6, t = 0, karanlikTest = false, bitti = false;
      const PENCERE = 40;
      const [gr] = ctx.grafikler([{ baslik: "Işığa bağımlı ↔ ışıktan bağımsız tepkimeler", x: { etiket: "zaman (s)", min: 0, max: PENCERE }, y: { etiket: "göreli", min: 0, max: 1.05 } }]);
      const sA = gr.seri("A", { renk: "#ffa53d" }), sG = gr.seri("G", { renk: "#ffffff" }), sO = gr.seri("O", { renk: "#6fc3ff", kesikli: true });
      gr.not([{ x: 0.5, y: 1.0, metin: "turuncu: ATP+NADPH · beyaz: glikoz yapımı · mavi: O₂ çıkışı", renk: "#c9d4e4", dy: 0 }]);
      // ¹⁸O atomları 3B tezgâhta, kloroplastın üstünde girenlerden ürünlere taşınır
      ctx.secenekler({
        etiket: "Tahminin: Açığa çıkan O₂'deki oksijen nereden gelir?",
        liste: [{ deger: "co2", metin: "CO₂'den" }, { deger: "su", metin: "Sudan" }, { deger: "yari", metin: "İkisinden yarı yarıya" }],
        deger: null, degisti: (v) => (tahmin = v),
      });
      const isaretSec = ctx.secenekler({
        etiket: "¹⁸O ile işaretlenecek madde",
        liste: [{ deger: "su", metin: "Suyu işaretle" }, { deger: "co2", metin: "CO₂'yi işaretle" }],
        deger: null,
        degisti: (v) => {
          if (!tahmin) { yaz(g1, false, "Önce tahminini seç."); isaretSec.deger = null; return; }
          isaretli = v; isaretSec.etkin(false);
          S.izotop.baslat(v, deneyBitti);
        },
      });
      const g1 = geriBildirim(ctx);
      function deneyBitti() {
        const s = izotopDeneyi(isaretli);
        yapilan.add(isaretli);
        isaretSec.etkin(true);
        yaz(g1, true, isaretli === "su"
          ? `Su işaretlenince <b>O₂'nin tamamı ¹⁸O</b> taşıdı${s.glikoz ? "" : ", glikozda işaret görülmedi"}. ${tahmin === "su" ? "Tahminin doğru!" : "Tahminin tutmadı."}`
          : "CO₂ işaretlenince O₂'de işaret <b>görülmedi</b>; ¹⁸O glikoza ve üretilen suya geçti.");
        if (yapilan.size === 2) g1.innerHTML += " <br><b>Sonuç:</b> Fotosentezde açığa çıkan O₂ <b>sudan</b> gelir (fotoliz). CO₂'nin oksijeni besine ve suya katılır.";
        kontrolEt();
      }
      const [isikBtn, co2Btn] = ctx.dugmeler([
        { metin: "💡 Işık: AÇIK", tik: () => { isik = !isik; isikBtn.textContent = `💡 Işık: ${isik ? "AÇIK" : "KAPALI"}`; } },
        { metin: "🫧 CO₂: VAR", tik: () => { co2 = !co2; co2Btn.textContent = `🫧 CO₂: ${co2 ? "VAR" : "YOK"}`; } },
      ]);
      const gs = ctx.gostergeler([{ ad: "a", etiket: "ATP + NADPH", ondalik: 2 }, { ad: "g", etiket: "Glikoz yapımı", ondalik: 2 }, { ad: "o", etiket: "O₂ çıkışı", ondalik: 2 }]);
      const g2 = geriBildirim(ctx);
      let ornek = 0;
      // gerçek zamanlı: yavaş ekran kartlarında da tepkimeler saniyesinde ilerler
      zamanlayici(ctx, (dt) => {
        t += dt;
        const r = tepkimeAdim(A, { isik, co2 }, dt); A = r.A;
        ornek += dt;
        if (ornek > 0.2) {
          ornek = 0;
          sA.ekle(t, A); sG.ekle(t, r.glikoz); sO.ekle(t, r.o2);
          for (const s of [sA, sG, sO]) while (s.noktalar.length && s.noktalar[0][0] < t - PENCERE) s.noktalar.shift();
          gr.eksenAyarla({ x: { min: Math.max(0, t - PENCERE), max: Math.max(PENCERE, t) } });
          gs.ayarla("a", A); gs.ayarla("g", r.glikoz); gs.ayarla("o", r.o2);
          S.kp.akis({ isik: isik ? 6 : 0, su: 5 * r.o2, o2: 5 * r.o2, atp: 3 * Math.min(1, r.glikoz * 2 + r.o2 * 2), co2: co2 ? 2 : 0, glikoz: 1.2 * r.glikoz });
          S.kp.calvinHizi = Math.min(1.4, r.glikoz * 2.4);
          if (!isik && co2 && r.glikoz / 0.5 < 0.1 && !karanlikTest) {
            karanlikTest = true;
            yaz(g2, true, "Işık kesilince Calvin döngüsü <b>birkaç saniye daha</b> sürdü, ATP ve NADPH tükenince durdu. “Işıktan bağımsız” tepkimeler, ışığa bağımlı tepkimelerin ürünlerine muhtaçtır.");
            kontrolEt();
          }
          if (isik && !co2 && A > 0.95) yaz(g2, true, "CO₂ yokken ATP ve NADPH birikti; ADP ve NADP⁺ azaldığı için ışığa bağımlı tepkimeler ve <b>O₂ çıkışı da yavaşladı</b>.");
        }
      });
      function kontrolEt() { if (!bitti && yapilan.size === 2 && karanlikTest) { bitti = true; ctx.gorevTamam(); } }
      return {
        bak: (konum, hedef, sure = 1.2) => S.kameraGit({ konum, hedef, sure }),
        izotop: (v) => S.izotop.baslat(v, () => {}),
        don: () => { S.izotop.sifirla(); S.istasyonaDon(); },
      };
    },
    anlat: [
      { s: "Kloroplastın üstünde bir <b>tezgâh</b> var: solda girenler, sağda ürünler.", yap: (api) => api.bak([0, 9.2, 17], [0, 8.4, 1.5]) },
      { s: "Soru şu: fotosentezde çıkan <b>O₂</b>'deki oksijen, CO₂'den mi geliyor, sudan mı?" },
      { s: "Bilim insanları oksijeni <b>¹⁸O</b> ile işaretledi: ağır, izlenebilir bir oksijen. Burada kırmızı görünür." },
      { s: "Önce <b>suyun</b> oksijenini işaretleyelim ve atomların nereye gittiğini izleyelim…", yap: (api) => api.izotop("su") },
      { soru: "Kırmızı (işaretli) oksijen hangi ürüne gitti?", secenekler: ["O₂'ye", "Glikoza", "Hiçbirine"], dogru: 0,
        aciklama: "Suyun oksijeni O₂ olarak açığa çıkar. Yani O₂ sudan gelir (fotoliz).", ipucu: "Sağ tarafta kırmızı atomların durduğu yere bak." },
      { s: "Alttaki kloroplasta bak: ışık varken turuncu <b>ATP + NADPH</b> üretiliyor.", yap: (api) => api.bak([3, 3.8, 16], [0, 0.6, 0]) },
      { s: "Calvin döngüsü bu ATP ile çalışıyor. Peki ışık kapanırsa ne olur?" },
      { soru: "Işık kapanınca Calvin döngüsü…", secenekler: ["Hiç etkilenmez", "ATP bitene kadar kısa süre sürer, sonra durur", "Hızlanır"], dogru: 1,
        aciklama: "“Işıktan bağımsız” tepkimeler ışığı doğrudan kullanmaz ama ışığın ürettiği ATP ve NADPH'ye muhtaçtır.", ipucu: "Calvin döngüsü yakıtını nereden alıyordu?" },
      { s: "Şimdi sen dene: iki maddeyi de işaretle, sonra ışığı kapatıp grafiği izle.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Bilim tarihinden: fanustaki mum",
    cikti: "BİY.10.1.3-a",
    anlatim: `
      <p><b>Jan Baptist van Helmont</b> (1600'lerin ilk yarısı) saksıdaki söğüdü 5 yıl yalnızca suyla besledi: ağaç yaklaşık <b>74 kg</b> arttı, toprak yalnızca yaklaşık <b>57 g</b> azaldı.</p>
      <p><b>Joseph Priestley</b> (1771) kapalı bir fanusta yanan mumun söndüğünü, fanusa bir nane dalı koyup beklediğinde mumun yeniden yanabildiğini gördü. <b>Jan Ingenhousz</b> (1779) bunun yalnızca <b>ışıkta</b> ve bitkinin <b>yeşil kısımlarıyla</b> olduğunu gösterdi.</p>
      <p>Bu deneyleri sen tekrarla. Mum, fanustaki O₂ yaklaşık <b>%16</b>'ya düşünce söner.</p>`,
    gorev: "Mumun bitkiyle <b>yeniden yandığı</b> bir deney ve bitki olduğu hâlde <b>yanmadığı</b> bir deney yap.",
    ogretmen: "Program, bilim tarihindeki fotosentez çalışmalarının (van Helmont, Priestley, Ingenhousz, Calvin, Hill) verilmesini, öğrencilerin bu bilgileri kullanılan ve üretilen maddelere göre yapılandırıp kontrollü deney tasarlamada kullanmasını istiyor. Bu adımda kontrol grubunu (bitkisiz fanus) ve değişkeni (ışık) öğrencilere buldurun. Hayvan kullanılan tarihî deneylerin günümüzde etik nedenlerle yapılmadığını vurgulayabilirsiniz.",
    kur(ctx) {
      const S = ctx.sahne, F = S.lab.fanus;
      S.istasyon("fanus"); F.bitkiGoster(true); F.isik(true); F.alev = 0;
      let d = { o2: FANUS.o2Bas, co2: FANUS.co2Bas }, bitki = true, isik = true, gun = 0, sondu = false, gI = 0, gK = 0;
      let yanma = null, alev = 0, dene = 0;
      ctx.temizlik(() => { F.alev = 0; S.labIsik(1); });
      const basari = { yandi: false, yanmadi: false };
      const gaz = panel(ctx, "bio-gaz");
      const cubuk = (ad, v, min, max, renk, esik) => {
        const h = 100 * Math.max(0, Math.min(1, (v - min) / (max - min)));
        const e = esik == null ? "" : `<i class="bio-gaz-esik" style="bottom:${(100 * (esik - min)) / (max - min)}%"></i>`;
        return `<div class="bio-gaz-cubuk"><b style="color:${renk}">${ad}</b><div class="bio-gaz-tup"><i style="height:${h}%;background:${renk}"></i>${e}</div><span>%${sayi(v, v < 1 ? 2 : 1)}</span></div>`;
      };
      zamanlayici(ctx, (dt) => {
        if (yanma) {
          yanma.t += dt / 2.2;
          const k = Math.min(1, yanma.t);
          d.o2 = yanma.o2a + (yanma.o2b - yanma.o2a) * k; d.co2 = yanma.co2a + (yanma.co2b - yanma.co2a) * k;
          alev = 1 - k * k;
          if (k >= 1) { yanma = null; alev = 0; }
        }
        F.alev = alev;
        gaz.innerHTML = `<div class="bio-akis-gun">Gün: <b>${gun}</b></div><div class="bio-gaz-ikili">${cubuk("O₂", d.o2, 14, 22, "#6fc3ff", FANUS.sonmeO2)}${cubuk("CO₂", d.co2, 0, 4, "#9aa4b2", null)}</div><small>kesikli çizgi: mum söner</small>`;
        F.fanusIgne()?.metin(`Çan fanus<small>O₂ %${sayi(d.o2, 1)} · CO₂ %${sayi(d.co2, d.co2 < 1 ? 2 : 1)}</small>`);
      });
      ctx.secenekler({ etiket: "Fanusta bitki", liste: [{ deger: true, metin: "Nane var" }, { deger: false, metin: "Bitki yok (kontrol)" }], deger: true, degisti: (v) => { bitki = v; F.bitkiGoster(v); } });
      ctx.secenekler({ etiket: "Ortam", liste: [{ deger: true, metin: "☀ Işıklı" }, { deger: false, metin: "🌙 Karanlık" }], deger: true, degisti: (v) => { isik = v; F.isik(v); S.labIsik(v ? 1 : 0.1); } });
      ctx.dugmeler([
        { metin: "🔥 Mumu yak", ana: true, tik: yak },
        { metin: "⏭ 1 gün bekle", tik: () => {
          if (yanma) return;
          const once = d.o2;
          d = fanusGun(d, { bitki, isik });
          gun++;
          if (bitki && isik) gI++; else if (bitki) gK++;
          tablo.satirEkle(["bekleme", bitki ? "var" : "yok", isik ? "ışık" : "karanlık", gun, `O₂ %${sayi(once)} → %${sayi(d.o2)}`]);
        } },
        { metin: "↺ Havayı yenile", tik: () => { d = { o2: FANUS.o2Bas, co2: FANUS.co2Bas }; gun = 0; sondu = false; gI = gK = 0; yaz(geri, true, "Fanus açıldı, hava yenilendi (O₂ %21)."); } },
      ]);
      const geri = geriBildirim(ctx);
      const tablo = ctx.tablo(["Olay", "Bitki", "Ortam", "Gün", "Sonuç"]);
      function yak() {
        if (yanma) return;
        dene++;
        const s = mumYak(d);
        if (!s.yandi) {
          yaz(geri, false, `Mum yanmadı: fanusta O₂ %${sayi(d.o2)}, yanma için en az %${sayi(FANUS.yanmaO2)} gerekli.`);
          tablo.satirEkle([`mum #${dene}`, bitki ? "var" : "yok", isik ? "ışık" : "karanlık", gun, "yanmadı"]);
          if (sondu && bitki && gK > 0 && gI === 0) { basari.yanmadi = true; geri.innerHTML += " <b>Karanlıkta bitki O₂ üretmedi, solunumla O₂ harcadı.</b>"; }
          kontrolEt(); return;
        }
        yanma = { t: 0, o2a: d.o2, o2b: s.o2, co2a: d.co2, co2b: s.co2 };
        const yeniden = sondu;
        tablo.satirEkle([`mum #${dene}`, bitki ? "var" : "yok", isik ? "ışık" : "karanlık", gun, yeniden ? "yeniden yandı!" : "yandı, söndü"]);
        if (yeniden && gI > 0) { basari.yandi = true; yaz(geri, true, `Mum yeniden yandı! Işıkta bekleyen bitki, mumun ürettiği <b>CO₂'yi kullanıp O₂ üretti</b>. (${gI} gün ışıkta bekledi.)`); }
        else yaz(geri, true, "Mum yandı ve O₂ %16'ya düşünce söndü. Şimdi koşulları seçip bekle, sonra yeniden yakmayı dene.");
        sondu = true; gI = gK = 0;
        kontrolEt();
      }
      function kontrolEt() { if (basari.yandi && basari.yanmadi) ctx.gorevTamam(); }
      ctx.secenekler({
        etiket: "van Helmont'un söğüdü 74 kg arttı, toprak yalnızca 57 g azaldı. Bu kütle büyük oranda nereden geldi?",
        liste: [{ deger: 0, metin: "Topraktan" }, { deger: 1, metin: "Yalnızca sudan" }, { deger: 2, metin: "Su ve havadaki CO₂'den" }],
        deger: null,
        degisti: (v) => yaz(vh, v === 2, [
          "Toprak yalnızca 57 g azaldı; 74 kg'ı açıklayamaz.",
          "van Helmont da böyle düşünmüştü! Ancak bitkinin kuru kütlesindeki karbonun kaynağı havadaki CO₂'dir. Su da fotosentezde kullanılır.",
          "Doğru. Fotosentezle havadaki CO₂ ve su, besine (glikoz, selüloz…) dönüşür. van Helmont CO₂'yi bilmediği için kütleyi yalnızca suya bağlamıştı.",
        ][v]),
      });
      const vh = geriBildirim(ctx);
      return {
        bak: (konum, hedef, sure = 1.2) => S.kameraGit({ konum, hedef, sure }),
        vurgula: (...m) => S.vurgula(...m),
        don: () => { S.vurgula(); S.istasyonaDon(); },
      };
    },
    anlat: [
      { s: "Masada cam bir <b>çan fanus</b> var. İçine hava girip çıkamaz.", yap: (api) => api.vurgula("Çan fanus") },
      { s: "Fanusun içinde bir <b>mum</b>. Mum yanarken havadaki <b>O₂</b>'yi harcar, <b>CO₂</b> çıkarır.", yap: (api) => { api.vurgula("Mum"); api.bak([-1.4, 2.6, 5.2], [-0.9, 1.6, 0.3]); } },
      { soru: "Kapalı fanusta mum bir süre sonra neden söner?", secenekler: ["Mum biter", "O₂ azalır", "Cam ısınır"], dogru: 1,
        aciklama: "Yanma O₂ ister. Fanustaki O₂ yaklaşık %16'ya inince alev söner.", ipucu: "Yanma için havadaki hangi gaz gerekir?" },
      { s: "Priestley 1771'de fanusa bir <b>nane</b> dalı koydu ve bekledi.", yap: (api) => { api.vurgula("Nane"); api.bak([1.7, 2.7, 5.4], [1.0, 1.8, -0.2]); } },
      { s: "Günler sonra mum <b>yeniden yanabildi</b>: bitki havayı “onarmıştı”." },
      { s: "Ingenhousz bunun yalnızca <b>ışıkta</b> olduğunu gösterdi. Karanlıkta bitki de solunumla O₂ harcar." },
      { soru: "Mumun yeniden yanması için fanus nerede beklemeli?", secenekler: ["Karanlıkta", "Işıkta", "Fark etmez"], dogru: 1,
        aciklama: "Bitki ancak ışıkta fotosentez yapıp O₂ üretir.", ipucu: "Fotosentez için neye ihtiyaç var?" },
      { s: "Şimdi deneyi sen tekrarla: hem yeniden yanan hem yanmayan bir durum bul.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Kabarcık deneyi: tasarla ve ölç",
    cikti: "BİY.10.1.3-b",
    anlatim: `
      <p>Su veba otu (Elodea) suyun içinde fotosentez yaptığında çıkan O₂, kesik gövdeden <b>kabarcıklar</b> hâlinde yükselir. Dakikadaki kabarcık sayısı fotosentez hızının bir ölçüsüdür.</p>
      <p>Kontrollü bir deney tasarla: <b>bağımsız değişkeni</b> (senin değiştirdiğin) seç, <b>bağımlı değişkeni</b> (ölçtüğün) belirle. Ölçüm sırasında diğer koşullar <b>sabit</b> kalır (kontrol değişkenleri).</p>
      <p>Lamba uzaklaştıkça ışık şiddeti uzaklığın karesiyle azalır (ışık şiddeti ∝ 1/d²). Suya eklenen <b>sodyum bikarbonat</b> (NaHCO₃) suya CO₂ sağlar.</p>`,
    gorev: "Bağımlı değişkeni doğru seç ve bağımsız değişkenin <b>en az 5 farklı değeri</b> için 1'er dakikalık ölçüm yap.",
    ogretmen: "Program, öğrencilerin deneylerinin amacını, bağımlı ve bağımsız değişkenlerini tanımlamasını; deneyi grup çalışmasıyla yapıp sonuçları analiz ederek fotosentezle ilişkilendirmesini istiyor. Gerçek deneyde her koşul değişikliğinden sonra bitkiyi birkaç dakika dengeye bırakmak ve ölçümü tekrarlamak gerekir; sayım gürültüsünü (aynı koşulda farklı sayılar) hata kaynakları tartışmasında kullanın. Gruplara farklı bağımsız değişkenler verip sonuçları tahtada birleştirebilirsiniz.",
    kur(ctx) {
      const S = ctx.sahne, K = S.lab.kabarcik;
      S.istasyon("kabarcik"); K.gazSifirla();
      const DEG = {
        uzaklik: { ad: "Lamba uzaklığı", birim: "cm", eksen: { etiket: "lamba uzaklığı (cm)", min: 0, max: 60 } },
        renk: { ad: "Işık rengi", birim: "nm", eksen: { etiket: "ışığın dalga boyu (nm)", min: 420, max: 690 } },
        co2: { ad: "NaHCO₃ (CO₂ kaynağı)", birim: "%", eksen: { etiket: "NaHCO₃ (%)", min: 0, max: 1 } },
        T: { ad: "Su sıcaklığı", birim: "°C", eksen: { etiket: "sıcaklık (°C)", min: 0, max: 50 } },
      };
      const k = { uzaklik: 20, renk: "beyaz", co2: 0.3, T: 25 };
      let bagimsiz = null, bagimliDogru = false, sayiyor = false, sayac = 0, sayimSure = 0;
      const olcumler = [];
      const DK = 3; // 1 benzetim dakikası = 3 s
      const kosul = () => ({ isik: isikSiddeti(k.uzaklik), renk: k.renk, co2: k.co2, T: k.T });
      const [gr] = ctx.grafikler([{ baslik: "Ölçümler: kabarcık / dk", x: { etiket: "bağımsız değişken", min: 0, max: 60 }, y: { etiket: "kabarcık/dk", min: 0, max: 30, otomatik: true } }]);
      const seri = gr.seri("olcum", { renk: TURUNCU, nokta: true });
      const sayacP = panel(ctx, "bio-sayac");
      let anahtar = "";
      zamanlayici(ctx, (dt) => {
        const h = fotosentezHizi(kosul());
        const hiz = h.kabarcik / DK; // kabarcık / s
        const n = poisson(hiz * dt);
        if (n) { K.kabarcik(n); if (sayiyor) sayac += n; }
        if (sayiyor) {
          sayimSure += dt;
          if (sayimSure >= DK) sayimBitti();
        }
        const yeni = `${k.uzaklik}|${k.renk}|${k.co2}|${k.T}`;
        if (yeni !== anahtar) { anahtar = yeni; K.ayarla(k, isikSiddeti(k.uzaklik) / 100); }
        sayacP.classList.toggle("aktif", sayiyor);
        sayacP.innerHTML = `<span>${sayiyor ? "Sayılıyor…" : "Son ölçüm"}</span><b>${sayiyor ? sayac : olcumler.length ? olcumler[olcumler.length - 1].n : "—"}</b>`
          + `<span>${sayiyor ? `${Math.max(0, Math.ceil(60 - (sayimSure / DK) * 60))} s kaldı` : "kabarcık/dk"}</span><small>NaHCO₃ %${sayi(k.co2, 2)}</small>`;
      });
      const bagimliSec = ctx.secenekler({
        etiket: "Bağımlı değişken (ölçeceğin) hangisi?",
        liste: [{ deger: 0, metin: "Lambanın uzaklığı" }, { deger: 1, metin: "Dakikadaki kabarcık sayısı" }, { deger: 2, metin: "Suyun sıcaklığı" }],
        deger: null,
        degisti: (v) => { bagimliDogru = v === 1; yaz(g, bagimliDogru, bagimliDogru ? "Doğru: kabarcık sayısını ölçeceksin; o, bağımsız değişkene bağlı olarak değişir." : "Bu senin ayarladığın bir koşul. Deneyde ölçtüğün sonuç hangisi?"); },
      });
      const bagimsizSec = ctx.secenekler({
        etiket: "Bağımsız değişkenin (değiştireceğin):",
        liste: Object.entries(DEG).map(([d, v]) => ({ deger: d, metin: v.ad })),
        deger: null,
        degisti: (v) => {
          bagimsiz = v; olcumler.length = 0; seri.temizle(); tablo.temizle();
          gr.eksenAyarla({ x: { ...DEG[v].eksen } });
          gr.ayar.baslik = `Kabarcık/dk – ${DEG[v].ad.toLowerCase()}`;
          kilitle();
          yaz(g, true, `Bağımsız değişken: <b>${DEG[v].ad}</b>. Diğer koşullar artık sabit (kontrol değişkenleri). Değeri değiştir, “1 dakika say”a bas.`);
        },
      });
      const uK = ctx.kaydirici({ etiket: "Lamba uzaklığı", min: 10, max: 60, adim: 5, deger: k.uzaklik, birim: "cm", degisti: (v) => (k.uzaklik = v) });
      const rS = ctx.secenekler({ etiket: "Işık rengi (filtre)", liste: Object.entries(ISIK_RENKLERI).map(([d, v]) => ({ deger: d, metin: v.ad })), deger: k.renk, degisti: (v) => (k.renk = v) });
      const cK = ctx.kaydirici({ etiket: "NaHCO₃ (CO₂ kaynağı)", min: 0, max: 1, adim: 0.1, deger: k.co2, birim: "%", degisti: (v) => (k.co2 = v) });
      const tK = ctx.kaydirici({ etiket: "Su sıcaklığı", min: 5, max: 45, adim: 5, deger: k.T, birim: "°C", degisti: (v) => (k.T = v) });
      const [sayBtn] = ctx.dugmeler([{ metin: "⏱ 1 dakika say", ana: true, tik: sayimBasla }]);
      const g = geriBildirim(ctx);
      const tablo = ctx.tablo(["Bağımsız değişken", "Kabarcık/dk"]);
      function kilitle() {
        const ac = (ad) => !sayiyor && bagimsiz === ad;
        uK.etkin(ac("uzaklik")); rS.etkin(ac("renk")); cK.etkin(ac("co2")); tK.etkin(ac("T"));
        sayBtn.disabled = sayiyor || !bagimsiz;
        bagimsizSec.etkin(!sayiyor);
      }
      function deger() {
        return bagimsiz === "renk" ? ISIK_RENKLERI[k.renk].nm : k[bagimsiz];
      }
      function sayimBasla() {
        if (!bagimliDogru) { yaz(g, false, "Önce bağımlı değişkeni doğru seç."); return; }
        if (bagimsiz === "renk" && k.renk === "beyaz") { yaz(g, false, "Işık rengi değişkeninde renkli bir filtre seç (beyaz ışığın tek bir dalga boyu yoktur)."); return; }
        sayiyor = true; sayac = 0; sayimSure = 0; kilitle(); K.gazSifirla();
      }
      function sayimBitti() {
        sayiyor = false; kilitle();
        const x = deger();
        olcumler.push({ x, n: sayac });
        tablo.satirEkle([bagimsiz === "renk" ? `${ISIK_RENKLERI[k.renk].ad} (${x} nm)` : `${sayi(x, bagimsiz === "co2" ? 1 : 0)} ${DEG[bagimsiz].birim}`, sayac]);
        seri.ayarla(olcumler.map((o) => [o.x, o.n]).sort((a, b) => a[0] - b[0]));
        const farkli = new Set(olcumler.map((o) => o.x)).size;
        if (farkli >= 5) {
          const sonuc = {
            uzaklik: "Lamba uzaklaştıkça ışık şiddeti hızla azaldı, kabarcık sayısı da azaldı: <b>ışık şiddeti arttıkça fotosentez hızı artar</b> (belli bir değere kadar).",
            renk: "Kabarcık sayısı kırmızı ve mavi ışıkta yüksek, yeşil ışıkta en düşük çıktı: klorofil yeşil ışığı az soğurur.",
            co2: "CO₂ kaynağı arttıkça fotosentez hızı arttı, sonra artış yavaşladı (doygunluk): CO₂ fotosentezde kullanılan bir maddedir.",
            T: "Hız optimum sıcaklığa (≈30 °C) kadar arttı, daha yüksek sıcaklıkta enzimler bozulmaya başladığı için hızla düştü.",
          }[bagimsiz];
          yaz(g, true, `${farkli} farklı değerde ölçüm yaptın. ${sonuc} Aynı koşulda tekrar ölçersen sayılar biraz değişir: bu, ölçüm hatasıdır.`);
          ctx.gorevTamam();
        } else yaz(g, true, `${farkli}/5 farklı değerde ölçüm yapıldı.`);
      }
      kilitle(); void rS;
      return {
        bak: (konum, hedef, sure = 1.2) => S.kameraGit({ konum, hedef, sure }),
        vurgula: (...m) => S.vurgula(...m),
        lamba(cm) { k.uzaklik = cm; uK.deger = cm; },
        don: () => { S.vurgula(); S.istasyonaDon(); },
      };
    },
    anlat: [
      { s: "Beherin içinde suda yaşayan bir bitki var: <b>Elodea</b> (su veba otu).", yap: (api) => { api.vurgula("Elodea"); api.bak([10.7, 1.9, 4.6], [10, 1.2, 0]); } },
      { s: "Fotosentez yaptıkça çıkan <b>O₂</b>, kesik gövdeden <b>kabarcık</b> hâlinde yükselir.", yap: (api) => api.bak([10.5, 2.4, 4.4], [10, 1.9, 0]) },
      { s: "Kabarcıklar ters huniden tüpe dolar; tüpün tepesinde gaz birikir.", yap: (api) => { api.vurgula("O₂ toplanıyor"); api.bak([10.5, 3.8, 3.8], [10, 3.0, 0]); } },
      { s: "Lambayı yaklaştıralım: <b>10 cm</b>. Kabarcıklar nasıl değişiyor?", yap: (api) => { api.vurgula("Lamba"); api.lamba(10); api.don(); } },
      { s: "Şimdi uzaklaştıralım: <b>40 cm</b>.", yap: (api) => api.lamba(40) },
      { soru: "Lamba uzaklaşınca kabarcık sayısı ne olur?", secenekler: ["Artar", "Azalır", "Değişmez"], dogru: 1,
        aciklama: "Uzaklık 2 katına çıkınca ışık 4 kat azalır (∝ 1/d²); fotosentez yavaşlar.", ipucu: "Lamba iğnesindeki ışık şiddeti yüzdesine bak." },
      { s: "Senin değiştirdiğin koşul <b>bağımsız değişken</b>, ölçtüğün sonuç <b>bağımlı değişkendir</b>." },
      { soru: "Bu deneyde bağımlı değişken hangisi?", secenekler: ["Lambanın uzaklığı", "Dakikadaki kabarcık sayısı", "Suyun sıcaklığı"], dogru: 1,
        aciklama: "Kabarcık sayısını ölçüyoruz; o, lambaya bağlı olarak değişiyor.", ipucu: "Hangisini sayarak buluyorsun?" },
      { s: "Diğer koşullar sabit kalmalı: bunlar <b>kontrol değişkenleri</b>. Şimdi deneyini sen tasarla." },
    ],
    anlatBitti: (api) => { api.lamba(20); api.don(); },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Sınırlayıcı faktör: sera danışmanı",
    cikti: "BİY.10.1.3-b",
    anlatim: `
      <p>Fotosentez hızı birden çok faktöre bağlıdır: <b>ışık şiddeti</b>, <b>CO₂</b> ve <b>sıcaklık</b>. Hız, o anda <b>en yetersiz</b> olan faktörle sınırlanır: buna <b>sınırlayıcı faktör</b> denir.</p>
      <p>Soldaki grafikte hız ışıkla önce artar, sonra <b>düzleşir</b>: ışık artık sınırlayıcı değildir, CO₂ ya da sıcaklık sınırlar. Sağdaki grafikte hız bir <b>optimum sıcaklıkta</b> en yüksektir; çok sıcakta enzimler bozulur.</p>
      <p>Antalya'daki seracıların sorunlarına çözüm bul: her durumda hızı en çok neyi değiştirmek artırır?</p>`,
    gorev: "Dört seranın sorununu doğru teşhis et.",
    ogretmen: "Program, deney sonuçlarının analiz edilip fotosentezi açıklamak için kullanılmasını istiyor. Seralarda CO₂ gübrelemesi, gölgeleme ve ısıtma gerçek uygulamalardır. Öğrencilerden sınırlayıcı faktörü grafikten (eğrinin düzleştiği bölge) okumalarını isteyin; modeldeki sayılar temsilîdir.",
    kur(ctx) {
      const S = ctx.sahne;
      S.istasyon("sera");
      const SEN = [
        { ad: "Aralık sabahı, bulutlu", k: { isik: 8, co2: 0.5, T: 25 }, dogru: "isik" },
        { ad: "Kapalı sera, CO₂ tükenmiş", k: { isik: 100, co2: 0, T: 28 }, dogru: "co2" },
        { ad: "Ocak, ısıtma bozuk", k: { isik: 100, co2: 0.5, T: 8 }, dogru: "sicaklik" },
        { ad: "Temmuz, sıcak hava dalgası", k: { isik: 100, co2: 0.5, T: 42 }, dogru: "sicaklik" },
      ];
      const k = { ...SEN[0].k, renk: "beyaz" };
      let no = 0;
      const cozulen = new Set();
      const [gI, gT] = ctx.grafikler([
        { baslik: "Hız – ışık şiddeti", x: { etiket: "ışık (%)", min: 0, max: 100 }, y: { etiket: "hız", min: 0, max: 35 } },
        { baslik: "Hız – sıcaklık", x: { etiket: "T (°C)", min: 0, max: 50 }, y: { etiket: "hız", min: 0, max: 35 } },
      ]);
      const eI = gI.seri("e", { renk: YESIL }), nI = gI.seri("n", { renk: TURUNCU, nokta: true });
      const eT = gT.seri("e", { renk: "#ff8a8a" }), nT = gT.seri("n", { renk: TURUNCU, nokta: true });
      const hiz = (x) => fotosentezHizi({ ...x, renk: "beyaz" }).brut;
      function ciz() {
        const a = [], b = [];
        for (let i = 0; i <= 100; i += 2) a.push([i, hiz({ ...k, isik: i })]);
        for (let T = 0; T <= 50; T += 1) b.push([T, hiz({ ...k, T })]);
        eI.ayarla(a); eT.ayarla(b);
        nI.ayarla([[k.isik, hiz(k)]]); nT.ayarla([[k.T, hiz(k)]]);
        gs.ayarla("h", hiz(k));
        S.sera.ayarla(k, hiz(k) / 32, SEN[no].ad);
      }
      const senSec = ctx.secenekler({ etiket: "Sera", liste: SEN.map((s, i) => ({ deger: i, metin: `${"ABCD"[i]}) ${s.ad}` })), deger: 0, degisti: (i) => yukle(i) });
      const iK = ctx.kaydirici({ etiket: "Işık şiddeti", min: 0, max: 100, adim: 2, deger: k.isik, birim: "%", degisti: (v) => { k.isik = v; ciz(); } });
      const cK = ctx.kaydirici({ etiket: "CO₂ düzeyi (göreli)", min: 0, max: 1, adim: 0.05, deger: k.co2, ondalik: 2, degisti: (v) => { k.co2 = v; ciz(); } });
      const tK = ctx.kaydirici({ etiket: "Sıcaklık", min: 0, max: 50, adim: 1, deger: k.T, birim: "°C", degisti: (v) => { k.T = v; ciz(); } });
      const gs = ctx.gostergeler([{ ad: "h", etiket: "Fotosentez hızı (göreli)", ondalik: 1 }, { ad: "c", etiket: "Çözülen sera", ondalik: 0 }]);
      const cevap = ctx.secenekler({
        etiket: "Bu serada hızı en çok ne artırır?",
        liste: [{ deger: "isik", metin: "Işığı artırmak" }, { deger: "co2", metin: "CO₂ vermek" }, { deger: "sicaklik", metin: "Sıcaklığı optimuma getirmek" }],
        deger: null, degisti: degerlendir,
      });
      const g = geriBildirim(ctx);
      function yukle(i) {
        no = i; Object.assign(k, SEN[i].k);
        iK.deger = k.isik; cK.deger = k.co2; tK.deger = k.T; cevap.deger = null; g.textContent = "";
        ciz();
      }
      function degerlendir(v) {
        const s = SEN[no];
        const dogru = sinirlayiciFaktor(s.k) === v && v === s.dogru;
        const once = hiz(s.k);
        const yeni = { isik: hiz({ ...s.k, isik: Math.min(100, s.k.isik * 1.5 + 1) }), co2: hiz({ ...s.k, co2: s.k.co2 * 1.5 + 0.05 }), sicaklik: hiz({ ...s.k, T: 30 }) }[v];
        const art = (100 * (yeni - once)) / (once || 1);
        if (dogru) { cozulen.add(no); gs.ayarla("c", cozulen.size); }
        const neden = { isik: "Işık çok az; eğrinin dik (yükselen) bölgesindesin.", co2: "Işık bol ama eğri düzleşmiş: CO₂ yetersiz.", sicaklik: s.k.T > 30 ? "Sıcaklık optimumun üstünde; enzimler bozulmaya başlıyor. Gölgeleme ve havalandırma gerekir." : "Sıcaklık çok düşük; Calvin döngüsünün enzimleri yavaş çalışıyor." }[s.dogru];
        yaz(g, dogru, `${dogru ? "Doğru teşhis!" : "Bu değil."} Bu değişiklik hızı yaklaşık <b>%${sayi(art, 0)}</b> değiştirir. ${dogru ? neden : "Grafikteki turuncu noktanın eğrinin neresinde olduğuna bak."}`);
        if (cozulen.size === SEN.length) { ctx.gorevTamam(); g.innerHTML += " <br><b>Dört sera da kurtarıldı!</b>"; }
      }
      yukle(0); void senSec;
      return {
        bak: (konum, hedef, sure = 1.2) => S.kameraGit({ konum, hedef, sure }),
        vurgula: (...m) => S.vurgula(...m),
        yukle,
        don: () => { S.vurgula(); S.istasyonaDon(); },
      };
    },
    anlat: [
      { s: "Antalya'da bir domates serasındayız. Seracı daha çok ürün istiyor.", yap: (api) => api.vurgula() },
      { s: "Domatesin büyümesi fotosentez hızına bağlı. Hızı üç şey etkiler: <b>ışık</b>, <b>CO₂</b>, <b>sıcaklık</b>.", yap: (api) => { api.vurgula("Domates"); api.bak([-1.6, 1.9, 4.8], [-0.4, 1.0, 1.4]); } },
      { s: "Bu tüp seraya <b>CO₂</b> veriyor; hortum bitkilerin üstünden geçiyor.", yap: (api) => { api.vurgula("CO₂ tüpü"); api.bak([5, 1.9, 6.8], [3.9, 1.1, 2.55]); } },
      { s: "Termometre sera içindeki <b>sıcaklığı</b> gösteriyor.", yap: (api) => { api.vurgula("°C"); api.bak([-4.8, 2.3, 6.4], [-3.95, 1.7, 2.9]); } },
      { s: "Hız, o anda <b>en yetersiz</b> olan faktörle sınırlanır. Buna <b>sınırlayıcı faktör</b> denir.", yap: (api) => api.don() },
      { soru: "Işık çok az, CO₂ ve sıcaklık uygun. Hızı en çok ne artırır?", secenekler: ["CO₂ vermek", "Işığı artırmak", "Isıtmak"], dogru: 1,
        aciklama: "Eksik olan ışık; onu artırmadan diğerlerini artırmak hızı pek değiştirmez.", ipucu: "Üçünden hangisi yetersiz?" },
      { s: "Grafikte eğri <b>düzleştiyse</b>, o faktör artık sınırlayıcı değildir." },
      { s: "Şimdi dört seranın sorununu sen teşhis et." },
    ],
    anlatBitti: (api) => { api.yukle(0); api.don(); },
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Değerlendirme: Güneşten besine",
    anlatim: `
      <p>Dokuz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>7 doğru</b> yaparsan dersi tamamlamış olursun. Yanlış yaptığın konular için ilgili adıma dönebilirsin.</p>`,
    gorev: "Değerlendirmede en az <b>7/9</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (deney raporu, model oluşturma) uyumludur. Deney raporu performans görevi için 8. adımdaki tabloyu ve grafiği kullanabilirler; analitik puanlama anahtarına “olası hatalar için alınan önlemler” ölçütünü ekleyin.",
    kur(ctx) {
      ctx.sahne.istasyon("sinav");
      const grafikSoru = (ayar, fn, renk) => (kap) => {
        const g = new Grafik(kap, ayar);
        const n = []; for (let x = ayar.x.min; x <= ayar.x.max; x += (ayar.x.max - ayar.x.min) / 60) n.push([x, fn(x)]);
        g.seri("s", { renk, kalinlik: 3 }).ayarla(n);
      };
      sinav(ctx, [
        {
          tur: "coktan", metin: "Aşağıdakilerden hangisi ATP molekülünün yapısında <b>bulunmaz</b>?",
          siklar: ["Adenin", "Riboz", "Üç fosfat grubu", "Deoksiriboz"], dogru: 3,
          aciklama: "ATP; adenin, riboz (beş karbonlu şeker) ve üç fosfattan oluşur. Deoksiriboz DNA'nın şekeridir.",
        },
        {
          tur: "coktan", metin: "Fotosentezde O₂ kloroplastın hangi bölümünde açığa çıkar?",
          siklar: ["Stromada, Calvin döngüsünde", "Tilakoitte, suyun parçalanmasıyla", "Dış zarda", "Stromada, CO₂'nin parçalanmasıyla"], dogru: 1,
          aciklama: "O₂, ışığa bağımlı tepkimelerde suyun parçalanmasından (fotoliz) gelir ve bu tilakoitte olur.",
        },
        {
          tur: "coktan", metin: "Bir su bitkisine oksijeni <b>¹⁸O</b> ile işaretlenmiş <b>CO₂</b> verilirse işaret en çok nerede görülür?",
          siklar: ["Yalnızca açığa çıkan O₂'de", "Üretilen glikoz ve suda", "Hem O₂'de hem glikozda", "Hiçbir üründe görülmez"], dogru: 1,
          aciklama: "O₂ sudan gelir. CO₂'nin oksijen atomları glikoza ve fotosentezde oluşan suya geçer.",
        },
        {
          tur: "coktan", metin: "Grafikte bir bitkinin fotosentez hızının ışık şiddetiyle değişimi görülüyor. Eğrinin <b>düz</b> olduğu bölgede hızı artırmak için ne yapılabilir?",
          grafik: grafikSoru({ baslik: "Hız – ışık şiddeti", x: { etiket: "ışık (%)", min: 0, max: 100 }, y: { etiket: "hız", min: 0, max: 30 } }, (x) => fotosentezHizi({ isik: x, co2: 0.1, T: 25 }).brut, YESIL),
          siklar: ["Işık şiddetini daha da artırmak", "CO₂ miktarını artırmak", "Lambayı uzaklaştırmak", "Hiçbir şey hızı artıramaz"], dogru: 1,
          aciklama: "Düz bölgede ışık artık sınırlayıcı değildir. Hızı CO₂ (ya da optimumun altındaysa sıcaklık) sınırlar.",
        },
        {
          tur: "sayi", metin: "Elodea deneyinde lamba 20 cm uzaktayken ışık şiddeti %100 kabul ediliyor. Lamba <b>40 cm</b>'ye çekilirse ışık şiddeti yüzde kaç olur? (ışık şiddeti ∝ 1/d²)",
          dogru: 25, tolerans: 0.5, birim: "%",
          aciklama: "Uzaklık 2 katına çıkınca ışık şiddeti 2² = 4 kat azalır: %100 / 4 = %25.",
        },
        {
          tur: "coktan", metin: "Yaprakların yeşil görünmesinin nedeni nedir?",
          siklar: ["Klorofil yeşil ışığı en çok soğurur", "Klorofil yeşil ışığı çok az soğurur, büyük kısmını yansıtır", "Yapraklar yeşil ışık üretir", "Karotenoitler yeşil renklidir"], dogru: 1,
          aciklama: "Klorofil mavi-mor ve kırmızı ışığı soğurur; yeşil ışığın çoğunu yansıtır ve geçirir. Gözümüze ulaşan bu yansıyan ışıktır.",
        },
        {
          tur: "coktan", metin: "Işıkta fotosentez yapan bir bitkinin ışığı aniden kapatılırsa Calvin döngüsü ne olur?",
          siklar: ["Işıktan bağımsız olduğu için hiç etkilenmez", "ATP ve NADPH tükenene kadar kısa süre sürer, sonra durur", "Hemen hızlanır", "Su parçalanmaya devam ettiği için sürer"], dogru: 1,
          aciklama: "Işıktan bağımsız tepkimeler ışığı doğrudan kullanmaz ama ışığa bağımlı tepkimelerin ürettiği ATP ve NADPH'ye muhtaçtır.",
        },
        {
          tur: "coktan", metin: "Priestley'nin deneyinde sönen mumun aynı fanusta yeniden yanabilmesi için hangisi gereklidir?",
          siklar: ["Fanusu karanlıkta bekletmek", "Fanusa bitki koyup ışıkta bekletmek", "Fanusa bitki koyup karanlıkta bekletmek", "Yalnızca uzun süre beklemek"], dogru: 1,
          aciklama: "Bitki yalnızca ışıkta fotosentez yapıp O₂ üretir (Ingenhousz). Karanlıkta solunumla O₂ harcar.",
        },
        {
          tur: "sayi", metin: "Grafiğe göre bu bitkide fotosentez hızının <b>en yüksek</b> olduğu sıcaklık kaç °C'dir?",
          grafik: grafikSoru({ baslik: "Hız – sıcaklık", x: { etiket: "T (°C)", min: 0, max: 50 }, y: { etiket: "hız", min: 0, max: 35 } }, (T) => fotosentezHizi({ isik: 100, co2: 0.5, T }).brut, "#ff8a8a"),
          dogru: 30, tolerans: 3, birim: "°C",
          aciklama: "Hız yaklaşık 30 °C'de en yüksektir (optimum sıcaklık). Daha yüksek sıcaklıkta enzimlerin yapısı bozulmaya başlar ve hız hızla düşer.",
        },
      ], { baslik: "Güneşten besine", gecmeOrani: 0.75 });
      return { bak: (konum, hedef, sure = 1.6) => ctx.sahne.kameraGit({ konum, hedef, sure }), don: () => ctx.sahne.istasyonaDon() };
    },
    anlat: [
      { s: "Yolculuğu hatırla: enerji <b>Güneş</b>'ten geldi, otlar onu besine çevirdi.", yap: (api) => api.bak([-3, 2.2, 9], [-8, 5, -22]) },
      { s: "Hücrede bu enerji <b>ATP</b>'ye aktarıldı; ATP harcandı ve yeniden üretildi." },
      { s: "Fotosentez kloroplastta oldu: tilakoitte <b>ışığa bağımlı</b>, stromada <b>ışıktan bağımsız</b> tepkimeler." },
      { s: "Hızı ışık, CO₂ ve sıcaklık sınırladı. Şimdi bildiklerini sına.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => api.don(),
  },
];

dersBaslat({ adimlar, sahneKur: biyoSahnesi });
