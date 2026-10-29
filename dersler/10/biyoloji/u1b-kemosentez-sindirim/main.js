// 10. Sınıf Biyoloji · 1. Tema: Enerji — B dersi: Güneşsiz besin ve sindirim
// BİY.10.1.4 kemosentez · BİY.10.1.5 sindirim çeşitleri ve yapıları · BİY.10.1.6 sindirim, emilim, taşıma
import { dersBaslat, sayi, el } from "../../../../engine/ders.js";
import { biyoSahnesi } from "./sahne.js";
import { yazi, siniflandir, izgara, rastgele } from "../ortak/bilesenler.js";
import { yuzenTuval } from "../ortak/dunya3b.js";
import { anlatApi, odakla } from "../ortak/anlat3b.js";
import {
  KATSAYI, boruAlani, yuzeyKatsayisi, emilenOran, GECIS_SURESI, SUREC, hucreyeUlasan, VAKALAR,
  CANLILAR, SECENEK, HAYVANLAR, MADDELER,
} from "./model.js";

const YESIL = "#5ad38b", TURUNCU = "#ffb547", MAVI = "#4fc3f7", MOR = "#b89cff", SOLUK = "#8193ad", KIRMIZI = "#ff6b6b";
const geriBildirim = (ctx) => { const g = el("div", { class: "d-geri-bildirim" }); ctx.kontroller.append(g); return g; };
const yaz = (g, dogru, html) => { g.className = `d-geri-bildirim ${dogru ? "dogru" : "yanlis"}`; g.innerHTML = html; };
const yuzde = (v, o = 0) => `%${sayi(100 * v, o)}`;
const SARI = "#ffe066";

/* ---------- 1. adımın verileri ---------- */
const ARACLAR = [
  { metin: "Bilimsel dergi / makale veri tabanı", guvenilir: true },
  { metin: "Üniversite ya da araştırma kurumu sitesi", guvenilir: true },
  { metin: "Ders kitabı, bilim ansiklopedisi", guvenilir: true },
  { metin: "Bir biyoloğa (uzmana) sormak", guvenilir: true },
  { metin: "Kaynağı belirsiz sosyal medya videosu", guvenilir: false },
  { metin: "Ürün reklamı", guvenilir: false },
];
const BILGI = {
  baca: { baslik: "Hidrotermal baca", metin: "Okyanus tabanındaki çatlaklardan sızan deniz suyu, derindeki magmanın etkisiyle ısınır ve çözünmüş minerallerle yüklü olarak geri fışkırır. “Siyah duman” bacalarında su sıcaklığı 350 °C'yi aşabilir; yüksek basınç nedeniyle kaynamaz. Bu suda <b>hidrojen sülfür (H₂S)</b> gibi inorganik maddeler bol bulunur. Işık buraya hiç ulaşmaz." },
  bakteri: { baslik: "Kemosentetik bakteriler", metin: "Bu bakteriler <b>ışık yerine</b>, H₂S, amonyak (NH₃) ya da demir (Fe²⁺) gibi <b>inorganik maddelerin oksitlenmesinden</b> açığa çıkan kimyasal enerjiyi kullanarak CO₂'den organik besin üretir. Buna <b>kemosentez</b> denir. Kemosentez yapan bakteri ve arkeler de <b>üreticidir (ototrof)</b>." },
  solucan: { baslik: "Dev tüp solucanı", metin: "Boyu 2 metreyi bulabilen bu solucanın <b>ağzı ve sindirim kanalı yoktur</b>. Vücudundaki özel bir organda milyarlarca kemosentetik bakteri yaşar. Kırmızı tüyleri sudan H₂S, O₂ ve CO₂ alıp bakterilere ulaştırır; bakteriler ürettikleri besini solucanla paylaşır. Bu bir <b>ortak yaşamdır</b>." },
  midye: { baslik: "Midye, yengeç, karides", metin: "Bu <b>tüketiciler</b> bakteri örtüsüyle, bakterilerle ortak yaşayan canlılarla ya da birbirleriyle beslenir. Böylece güneş ışığının hiç ulaşmadığı 2000 metreden derin sularda zengin bir besin ağı kurulur. Besin ağının temelinde bitkiler değil, kemosentez yapan bakteriler vardır." },
  kesif: { baslik: "Bilim tarihinden", metin: "1977'de <b>Alvin</b> denizaltısıyla Galápagos Rifti'ne inen bilim insanları, karanlık okyanus tabanında kalabalık bir canlı topluluğu bularak şaşırdı. Kemosentez ise ilk kez 1880'lerde <b>Sergei Winogradsky</b>'nin kükürt ve azot bakterileri üzerindeki çalışmalarıyla tanımlanmıştı. Kemosentez karada da olur: topraktaki <b>nitrifikasyon bakterileri</b> amonyağı oksitleyerek enerji elde eder ve azot döngüsünde görev alır." },
};
const NOKTA_SIRA = ["baca", "bakteri", "solucan", "midye", "kesif"];

/* ---------- 2. adımın kartları ---------- */
const OZELLIKLER = [
  { metin: "Işık enerjisi kullanılır.", kisa: "ışık enerjisi", dogru: "f", neden: "Kemosentezde ışık değil, inorganik maddelerin oksitlenmesinden elde edilen kimyasal enerji kullanılır." },
  { metin: "Klorofil gibi pigmentler gerekir.", kisa: "pigment (klorofil)", dogru: "f", neden: "Kemosentez yapan bakteriler ışık soğurmadığı için pigmente ihtiyaç duymaz." },
  { metin: "Bitkiler, algler ve siyanobakteriler yapar.", kisa: "bitki, alg, siyanobakteri", dogru: "f", neden: "Kemosentezi yalnızca bazı bakteri ve arkeler yapar." },
  { metin: "İnorganik maddelerin (H₂S, NH₃, Fe²⁺) oksitlenmesinden enerji elde edilir.", kisa: "inorganik madde oksitlenir", dogru: "k", neden: "Bu, kemosentezin enerji kaynağıdır; fotosentezde enerji ışıktan gelir." },
  { metin: "Yalnızca bazı bakteri ve arkeler yapar.", kisa: "bazı bakteri ve arkeler", dogru: "k", neden: "Fotosentezi bitkiler ve algler de yapar; kemosentez ise yalnızca bazı prokaryotlarda görülür." },
  { metin: "Işığın hiç ulaşmadığı derin denizde de yapılabilir.", kisa: "karanlıkta da olur", dogru: "k", neden: "Fotosentez ışık olmadan yapılamaz." },
  { metin: "CO₂ kullanılarak organik besin üretilir.", kisa: "CO₂ → organik besin", dogru: "i", neden: "İki süreçte de karbon kaynağı CO₂'dir ve organik besin üretilir." },
  { metin: "Bu süreci yapan canlılar üreticidir (ototrof).", kisa: "üretici (ototrof)", dogru: "i", neden: "Kendi besinini inorganik maddelerden yapan her canlı üreticidir." },
  { metin: "Üretilen besin, besin zincirindeki tüketicilere enerji sağlar.", kisa: "besin ağını başlatır", dogru: "i", neden: "Baca ekosisteminde tüketicilerin enerjisi kemosentezden, çayırda ise fotosentezden gelir." },
];

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Güneşsiz bir ekosistem",
    cikti: "BİY.10.1.4-a, b",
    anlatim: `
      <p>Okyanusun 2500 metre derinliğindesin. Güneş ışığı buraya hiç ulaşmıyor; yani <b>fotosentez yapılamıyor</b>. Yine de bacaların çevresi tüp solucanları, midyeler ve yengeçlerle dolu!</p>
      <p>Araştırma sorun: <b>Işık enerjisi kullanılmadan besin sentezi nasıl gerçekleşir?</b></p>
      <p>Önce bu soruya cevap ararken hangi <b>bilgi araçlarını</b> kullanacağını seç. Sonra sahneyi döndür ve turuncu <b>?</b> işaretlerine dokunarak bilgi topla (aşağıdaki düğmeleri de kullanabilirsin).</p>`,
    gorev: "Güvenilir bilgi araçlarını seçip onayla, ardından <b>beş bilgi noktasının</b> hepsini incele.",
    ogretmen: "Program, “Işık enerjisi kullanılmadan besin sentezi nasıl gerçekleşir?” sorusuyla öğrencilerin bilgi araçlarını belirlemesini, kemosentez hakkında araştırma yapıp bilgi toplamasını istiyor; <b>kemosentez tepkimelerine değinilmez</b>. Sanal dalış, araştırmanın başlangıç noktasıdır: öğrencilerden buradaki bilgileri seçtikleri araçlarla (ör. araştırma kurumlarının açık erişimli sayfaları) karşılaştırmalarını isteyin. Yerel bağlam: Karadeniz'de yaklaşık 150–200 m'nin altındaki sular oksijensizdir ve H₂S içerir; oksijenli ve oksijensiz suların buluştuğu katmanda kemosentez yapan bakteriler yaşar (uzman kontrolü gerekli: derinlik bölgeye göre değişir).",
    kur(ctx) {
      const S = ctx.sahne;
      S.git("baca");
      const A = anlatApi(S, ctx, "baca");
      const secili = new Set(), bulunan = new Set();
      let onayli = false;
      const igne = {};
      for (const ad of NOKTA_SIRA) igne[ad] = A.igne(S.baca.noktalar[ad], "?", { renk: TURUNCU, tik: () => incele(ad) });
      const araclar = ctx.dugmeler(ARACLAR.map((a, i) => ({ metin: a.metin, tik: () => {
        if (onayli) return;
        secili.has(i) ? secili.delete(i) : secili.add(i);
        araclar[i].classList.toggle("bio-secili", secili.has(i));
        araclar[i].setAttribute("aria-pressed", String(secili.has(i)));
      } })));
      araclar[0].parentElement.classList.add("bio-arac-satir");
      const [onay] = ctx.dugmeler([{ metin: "Araç listemi onayla", ana: true, tik: () => {
        const kotu = [...secili].filter((i) => !ARACLAR[i].guvenilir), iyi = [...secili].filter((i) => ARACLAR[i].guvenilir);
        if (kotu.length) { yaz(geri, false, `<b>${ARACLAR[kotu[0]].metin}</b> bilimsel denetimden geçmez ya da ticari amaç taşıyabilir. Listenden çıkar.`); return; }
        if (iyi.length < 2) { yaz(geri, false, "En az <b>iki</b> güvenilir araç seç; bilgiyi birden çok kaynaktan karşılaştırmak doğrulamayı kolaylaştırır."); return; }
        onayli = true; onay.disabled = true; araclar.forEach((b) => (b.disabled = true));
        noktaDugmeleri.forEach((b) => (b.disabled = false));
        yaz(geri, true, "Araçların hazır. Şimdi dalışa başla: sahnedeki turuncu <b>?</b> etiketlerine dokun.");
      } }]);
      const geri = geriBildirim(ctx);
      const noktaDugmeleri = ctx.dugmeler(NOKTA_SIRA.map((ad) => ({ metin: `🔍 ${BILGI[ad].baslik}`, tik: () => incele(ad) })));
      noktaDugmeleri.forEach((b) => (b.disabled = true));
      const kart = el("div", { class: "d-anlatim bio-bilgi-kutu", html: "<p>Bilgi kartları burada açılacak.</p>" });
      const sayac = ctx.gostergeler([{ ad: "n", etiket: "Toplanan bilgi", ondalik: 0 }]);
      ctx.kontroller.append(kart);
      sayac.ayarla("n", `0 / ${NOKTA_SIRA.length}`);
      function incele(ad) {
        if (!onayli) { yaz(geri, false, "Önce bilgi araçlarını seçip <b>onayla</b>; sonra dalışa başlayabilirsin."); return; }
        const b = BILGI[ad];
        kart.innerHTML = `<p><b>${b.baslik}.</b> ${b.metin}</p>`;
        bulunan.add(ad);
        igne[ad].metin(`✓ ${b.baslik}`); igne[ad].el.style.setProperty("--renk", YESIL);
        odakla(S, S.baca.noktalar[ad], ad === "kesif" ? 10 : ad === "baca" ? 9 : 6);
        noktaDugmeleri[NOKTA_SIRA.indexOf(ad)].classList.add("bio-yapildi");
        sayac.ayarla("n", `${bulunan.size} / ${NOKTA_SIRA.length}`);
        if (bulunan.size === NOKTA_SIRA.length && !ctx.gorevTamamMi()) {
          ctx.gorevTamam();
          kart.innerHTML += "<p><b>Araştırma tamam!</b> Işıksız ortamda besin, inorganik maddelerin kimyasal enerjisiyle üretiliyor: <b>kemosentez</b>. Sonraki adımda bu bilgileri doğrulayıp kaydedeceksin.</p>";
        }
      }
      const N = S.baca.noktalar;
      return Object.assign(A, { ig: igne, yakin: (ad, u) => A.odak(N[ad], u) });
    },
    anlat: [
      { s: "Okyanusun <b>2500 metre</b> derinliğine indik. Burası zifiri karanlık.", yap: (api) => api.don() },
      { s: "Güneş ışığı buraya hiç ulaşmaz. Işık yoksa <b>fotosentez</b> de yoktur.", yap: (api) => api.bak("genel") },
      { soru: "Burada bitki ya da alg yaşayamaz. Neden?", secenekler: ["Su çok tuzlu", "Fotosentez için ışık yok", "Su çok soğuk"], dogru: 1,
        aciklama: "Bitkiler ve algler besinini ışıkla yapar. Karanlıkta besin üretemezler.", ipucu: "Bitkiler besinlerini neyle yapar?" },
      { s: "Ama bak: bacanın çevresi canlılarla dolu! Solucanlar, midyeler, yengeçler…", yap: (api) => { api.vurgula(api.ig.solucan, api.ig.midye); api.yakin("solucan", 8); } },
      { s: "Bacadan sıcak, mineralli su fışkırıyor. İçinde <b>H₂S</b> gibi maddeler var.", yap: (api) => { api.vurgula(api.ig.baca); api.yakin("baca", 9); } },
      { s: "Bu maddelerde <b>kimyasal enerji</b> saklıdır. Biri bu enerjiyi kullanıyor olabilir mi?" },
      { s: "Bunu araştıracağız. Ama önce sor: bilgiyi <b>nereden</b> alacağız?", yap: (api) => api.don() },
      { s: "Bilimsel dergiler, üniversiteler ve uzmanlar bilgiyi <b>denetler</b>. Reklam ve kaynağı belirsiz paylaşımlar denetlenmez." },
      { soru: "Hangisi daha güvenilir bir kaynaktır?", secenekler: ["Kaynak göstermeyen bir blog yazısı", "Hakemli bir bilim dergisindeki makale", "Bir arkadaşının paylaşımı"], dogru: 1,
        aciklama: "Hakemli dergide makale, başka uzmanlarca incelenmeden yayımlanmaz.", ipucu: "Hangisini başka bilim insanları kontrol eder?" },
      { s: "Sıra sende: güvenilir araçlarını seç, sonra turuncu <b>?</b> işaretlerine dokunarak bilgi topla." },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Doğrula ve kaydet",
    cikti: "BİY.10.1.4-c, ç",
    anlatim: `
      <p>Topladığın bilgileri <b>doğrulama</b> zamanı. Kemosentezi tanıdığın fotosentezle karşılaştır: aşağıdaki özellikler yalnızca fotosentezde mi, yalnızca kemosentezde mi, yoksa ikisinde de mi var?</p>
      <p>Doğru yerleştirdiğin her kart sahnedeki karşılaştırma şemasına eklenir. Bu şema, hazırlayacağın <b>bilgi görselinin</b> iskeleti olabilir.</p>`,
    gorev: "Dokuz kartı doğru kutulara yerleştir ve videodaki iddiayı doğru değerlendir.",
    ogretmen: "Program, öğrencilerin doğruladıkları bilgilere ve telif hakkı olmayan görsellere yer verdikleri bir <b>bilgi görseli</b> hazırlamasını ve bunun analitik dereceli puanlama anahtarıyla değerlendirilmesini öneriyor. Sahnedeki karşılaştırma şeması ve yazı alanı bunun taslağıdır. Puanlama anahtarına “bilginin doğruluğu”, “kaynak gösterme”, “görsel düzen” ve “telif hakkına uygunluk” ölçütlerini ekleyebilirsiniz. Videodaki iddia sorusunda amaç, bilginin kısmen doğru kısmen yanlış olabileceğini fark ettirmektir: baca canlılarının çoğu, yüzeydeki fotosentezle üretilmiş ve okyanusa karışmış O₂'yi de kullanır.",
    kur(ctx) {
      const S = ctx.sahne, N = S.mikro.noktalar;
      S.git("mikro");
      const A = anlatApi(S, ctx, "mikro");
      A.ig = {
        bakteri: A.igne(N.bakteri, "Kemosentetik bakteriler<small>bakteri örtüsü, büyütülmüş</small>", { renk: TURUNCU }),
        iplik: A.igne(N.iplik, "İpliksi kükürt bakterileri", { renk: "#c9d4e4", yon: "sag" }),
        h2s: A.igne(N.h2s, "H₂S<small>enerji kaynağı (oksitlenir)</small>", { renk: SARI }),
        co2: A.igne(N.co2, "CO₂<small>karbon kaynağı</small>", { renk: "#9aa4b2" }),
        besin: A.igne(N.besin, "Üretilen organik besin", { renk: YESIL, yon: "sag" }),
      };
      let siniflandi = false, iddiaDogru = false;
      const yerlesen = () => {
        const s = { f: [], i: [], k: [] };
        for (const k of document.querySelectorAll(".bio-kutu[data-kutu] .bio-kart.dogru")) {
          const o = OZELLIKLER.find((x) => x.metin === k.textContent);
          if (o) s[o.dogru].push(o.kisa);
        }
        return s;
      };
      yuzenTuval(ctx, {
        gen: 640, yuk: 280, konum: "ust",
        ciz(c) {
          const s = yerlesen();
          yazi(c, "Fotosentez ve kemosentez", 320, 20, { boyut: 17, kalin: true });
          for (const [x, r] of [[232, YESIL], [408, TURUNCU]]) {
            c.globalAlpha = 0.14; c.fillStyle = r; c.beginPath(); c.arc(x, 156, 118, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
            c.strokeStyle = r; c.lineWidth = 2.5; c.beginPath(); c.arc(x, 156, 118, 0, Math.PI * 2); c.stroke();
          }
          yazi(c, "Yalnız fotosentez", 175, 62, { boyut: 13.5, kalin: true, renk: YESIL });
          yazi(c, "İkisi de", 320, 62, { boyut: 13.5, kalin: true });
          yazi(c, "Yalnız kemosentez", 465, 62, { boyut: 13.5, kalin: true, renk: TURUNCU });
          const liste = (dizi, x) => dizi.forEach((m, i) => yazi(c, m, x, 100 + i * 30, { boyut: 12.5 }));
          liste(s.f, 175); liste(s.i, 320); liste(s.k, 465);
          if (!(s.f.length + s.i.length + s.k.length)) yazi(c, "Kartları doğru kutulara yerleştirdikçe şema dolacak.", 320, 268, { boyut: 12.5, renk: SOLUK });
        },
      });
      const kutu = el("div");
      ctx.kontroller.append(kutu);
      siniflandir(kutu, {
        kutular: [{ ad: "f", baslik: "Yalnız fotosentez" }, { ad: "i", baslik: "İkisi de" }, { ad: "k", baslik: "Yalnız kemosentez" }],
        ogeler: OZELLIKLER, sutun: 3,
        tamam: () => { siniflandi = true; bitir(); },
      });
      ctx.secenekler({
        etiket: "Bir videoda “Baca ekosistemi Güneş'ten tamamen bağımsızdır.” deniyor. Bu iddia için hangisi doğru?",
        liste: [
          { deger: 0, metin: "Doğru: orada hiçbir canlı Güneş'e bağlı değildir." },
          { deger: 1, metin: "Kısmen yanlış: canlıların kullandığı O₂'nin büyük kısmı yüzeydeki fotosentezden gelir." },
          { deger: 2, metin: "Yanlış: bacalardaki bakteriler fotosentez yapar." },
        ],
        deger: null,
        degisti: (v) => {
          iddiaDogru = v === 1;
          yaz(ig, iddiaDogru, iddiaDogru
            ? "Doğru değerlendirme. Besin üretimi ışıktan bağımsızdır ama tüp solucanları ve bakterilerin çoğu, yüzeyde fotosentezle üretilip okyanusa karışan O₂'yi kullanır. İddia aşırı genelleme yapıyor."
            : v === 2 ? "Bacalarda ışık yoktur; bakteriler fotosentez değil kemosentez yapar." : "Besin üretimi ışıktan bağımsızdır, ancak canlıların çoğu sudaki O₂'yi kullanır. Bu O₂ nereden geliyor?");
          bitir();
        },
      });
      const ig = geriBildirim(ctx);
      ctx.yaziAlani({ etiket: "<b>Kayıt:</b> Bilgi görselin için kısa bir metin yaz: kemosentez nedir, kim yapar, nerede görülür, neden önemlidir? Kullandığın kaynakları da not et.", anahtar: "kemosentez-kayit", enAz: 80 });
      function bitir() { if (siniflandi && iddiaDogru && !ctx.gorevTamamMi()) ctx.gorevTamam(); }
      return A;
    },
    anlat: [
      { s: "Bacanın yanındaki bir kayaya yakından bakıyoruz. Bu beyaz örtü milyonlarca <b>bakteri</b>.", yap: (api) => { api.vurgula(api.ig.bakteri, api.ig.iplik); api.bak(); } },
      { s: "Bakteriler sudaki <b>H₂S</b>'yi alır ve oksitler. Bu tepkime enerji açığa çıkarır.", yap: (api) => api.vurgula(api.ig.h2s) },
      { s: "Bu enerjiyle <b>CO₂</b>'den organik besin yaparlar. Tıpkı bitkiler gibi!", yap: (api) => api.vurgula(api.ig.co2, api.ig.besin) },
      { s: "Işık yerine <b>kimyasal</b> enerji kullanıldığı için buna <b>kemosentez</b> diyoruz.", yap: (api) => api.vurgula() },
      { soru: "Bu bakteriler besin ağında hangi rolü üstlenir?", secenekler: ["Tüketici", "Üretici", "Ayrıştırıcı"], dogru: 1,
        aciklama: "Kendi besinini inorganik maddelerden yapan canlı üreticidir. Baca ekosistemi bu bakterilere dayanır.", ipucu: "Besinlerini başkasından mı alıyorlar, kendileri mi yapıyorlar?" },
      { s: "Şimdi kemosentezi tanıdığın <b>fotosentezle</b> karşılaştıracağız." },
      { s: "Her özelliği üç kutudan birine koyacaksın: yalnız fotosentez, yalnız kemosentez ya da ikisi de." },
      { baslik: "Birlikte yapalım", cozum: [
        "Kart: “Süreç hücrenin içinde gerçekleşir.”",
        "Fotosentez hücrede mi olur? Evet, kloroplastta.",
        "Kemosentez hücrede mi olur? Evet, bakteri hücresinde.",
        "İkisinde de var: kart <b>İkisi de</b> kutusuna gider.",
      ] },
      { s: "Bilgiyi doğrulamak da işin parçası. Bir iddia <b>kısmen</b> doğru, kısmen yanlış olabilir." },
      { soru: "“Bütün bakteriler hastalık yapar.” iddiası için hangisi doğru?", secenekler: ["Doğru", "Yanlış: pek çok bakteri zararsız ya da yararlıdır", "Yalnızca denizdekiler hastalık yapar"], dogru: 1,
        aciklama: "Baca bakterileri bütün bir ekosistemi besler. Bakterilerin yalnızca küçük bir kısmı hastalık yapar.", ipucu: "Baca bakterileri ne iş yapıyordu?" },
      { s: "Sıra sende: kartları yerleştir, sonra videodaki iddiayı değerlendir." },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Sindirim nerede olur?",
    cikti: "BİY.10.1.5-a, b",
    anlatim: `
      <p>Besinlerdeki büyük organik moleküllerin, hücre zarından geçebilecek küçük yapı taşlarına ayrılmasına <b>sindirim</b> denir.</p>
      <ul>
        <li><b>Hücre içi sindirim:</b> Besin hücreye alınır, besin kofulu <b>lizozomla</b> birleşir ve besin hücrenin içinde parçalanır.</li>
        <li><b>Hücre dışı sindirim:</b> Sindirim enzimleri hücre dışına (sindirim boşluğuna ya da besinin üzerine) salgılanır; besin hücre dışında parçalanır, küçük moleküller emilir.</li>
      </ul>
      <p>Sahnedeki iki canlıyı izle. Önce ayırt etmek için hangi <b>ölçütü</b> kullanacağına karar ver, sonra canlıları sınıflandır.</p>`,
    gorev: "Doğru ölçütü seç ve sekiz canlıyı sindirim çeşidine göre sınıflandır.",
    ogretmen: "Program, “Sindirim nedir?”, “Sindirim nerede ve nasıl gerçekleşir?” sorularıyla bilgi ihtiyacının fark ettirilmesini ve hücre içi / hücre dışı sindirim hakkında bilgi verilmesini öneriyor. Sindirim enzimlerinin adları verilmez. İnsan kartındaki not (akyuvarların mikropları hücre içinde sindirmesi), “bir canlıda tek bir sindirim çeşidi vardır” yanılgısını tartışmak için kullanılabilir.",
    kur(ctx) {
      const S = ctx.sahne, N = S.lab.noktalar;
      S.git("lab");
      const A = anlatApi(S, ctx, "lab");
      const evreIgne = A.igne(N.amip, `Amip: hücre içi sindirim<small>${S.lab.evre()}</small>`, { renk: MAVI });
      A.ig = {
        amip: evreIgne,
        koful: A.igne(N.koful, "besin (bakteri)", { renk: YESIL, yon: "alt" }),
        cekirdek: A.igne(N.cekirdek, "çekirdek", { renk: MOR, yon: "sol" }),
        hif: A.igne(N.hif, "Küf mantarı: hücre dışı sindirim<small>hifler (mantar iplikleri)</small>", { renk: TURUNCU }),
        enzim: A.igne(N.enzim, "turuncu: salgılanan enzimler<small>sarı: emilen küçük moleküller</small>", { renk: TURUNCU, yon: "sag" }),
        ekmek: A.igne(N.ekmek, "ekmek (besin)", { renk: "#c9a46a", yon: "alt" }),
      };
      let sonEvre = "";
      S.adimKare(ctx, () => { const e = S.lab.evre(); if (e !== sonEvre) { sonEvre = e; evreIgne.metin(`Amip: hücre içi sindirim<small>${e}</small>`); } });
      let olcutTamam = false, siniflandi = false;
      ctx.secenekler({
        etiket: "Ölçüt: Hücre içi ve hücre dışı sindirimi ayırt etmek için neye bakarsın?",
        liste: [
          { deger: 0, metin: "Canlının büyüklüğüne" },
          { deger: 1, metin: "Besinin parçalandığı yere" },
          { deger: 2, metin: "Besinin türüne" },
          { deger: 3, metin: "Canlının yaşadığı ortama" },
        ],
        deger: null,
        degisti: (v) => {
          olcutTamam = v === 1;
          yaz(og, olcutTamam, olcutTamam ? "Doğru ölçüt: besin <b>hücrenin içinde mi, dışında mı</b> parçalanıyor?" : "Bu ölçüt sindirim çeşidini belirlemez. Örneğin hem amip hem bakteri tek hücrelidir ama sindirimleri farklıdır. Sahnede iki canlı arasındaki farka bak.");
          bitir();
        },
      });
      const og = geriBildirim(ctx);
      const kap = el("div"); ctx.kontroller.append(kap);
      siniflandir(kap, {
        kutular: [{ ad: "ic", baslik: "Hücre içi" }, { ad: "ikisi", baslik: "Hücre içi + dışı" }, { ad: "dis", baslik: "Hücre dışı" }],
        ogeler: CANLILAR.map((x) => ({ metin: x.ad, dogru: x.tur, neden: x.neden })), sutun: 3,
        tamam: () => { siniflandi = true; bitir(); },
      });
      function bitir() {
        if (!olcutTamam || !siniflandi || ctx.gorevTamamMi()) return;
        ctx.gorevTamam();
        yaz(og, true, "Harika! Tek hücreliler ve süngerler besini hücre içinde; hidra ve planarya önce boşlukta sonra hücre içinde; mantarlar, böcekçil bitkiler ve omurgalılar ise hücre dışında sindirir.");
      }
      return Object.assign(A, { yakin: (ad, u) => A.odak(N[ad], u) });
    },
    anlat: [
      { s: "Yediğimiz besinler çoğunlukla <b>büyük moleküllerdir</b>: nişasta, protein, yağ.", yap: (api) => api.don() },
      { s: "Bu kadar büyük moleküller hücre zarından geçemez. Önce küçük parçalara ayrılmaları gerekir." },
      { s: "Büyük besin moleküllerini küçük yapı taşlarına ayırmaya <b>sindirim</b> diyoruz." },
      { soru: "Sindirimin asıl amacı nedir?", secenekler: ["Besini depolamak", "Besini hücreye girebilecek küçük parçalara ayırmak", "Besini ısıtmak"], dogru: 1,
        aciklama: "Yalnızca küçük yapı taşları hücre zarından geçebilir; sindirim onları hazırlar.", ipucu: "Büyük moleküller zardan geçebiliyor muydu?" },
      { s: "Soldaki <b>amibi</b> izle. Bir bakteriyi zarıyla sarıp içine alıyor.", yap: (api) => { api.vurgula(api.ig.amip, api.ig.koful); api.yakin("amip", 5); } },
      { s: "Besin, hücrenin içindeki bir kesecikte parçalanır. Bu <b>hücre içi sindirimdir</b>." },
      { s: "Şimdi sağdaki ekmeğe bak: üstünde bir <b>küf mantarı</b> büyüyor.", yap: (api) => { api.vurgula(api.ig.hif, api.ig.ekmek); api.yakin("hif", 5); } },
      { s: "Mantar enzimlerini dışarıya, ekmeğin üstüne salgılar. Besin hücrenin <b>dışında</b> parçalanır.", yap: (api) => api.vurgula(api.ig.enzim) },
      { s: "Sonra oluşan küçük molekülleri emer. Bu da <b>hücre dışı sindirimdir</b>." },
      { soru: "Örümcek avının üstüne sindirim sıvısı akıtır, sıvılaşan besini sonra emer. Bu hangisidir?", secenekler: ["Hücre içi sindirim", "Hücre dışı sindirim"], dogru: 1,
        aciklama: "Besin, örümceğin hücrelerinin dışında parçalanıyor; küçük moleküller sonra emiliyor.", ipucu: "Besin nerede parçalanıyor: hücrenin içinde mi, dışında mı?" },
      { s: "Sıra sende: önce ayırt etme ölçütünü seç, sonra sekiz canlıyı sınıflandır." },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Diş, mide, bağırsak",
    cikti: "BİY.10.1.5-c, ç",
    anlatim: `
      <p>Omurgalılarda sindirim yapıları, canlının neyle beslendiğine göre farklılaşmıştır. Sahnede bir <b>kuş (güvercin)</b>, <b>kurt</b>, <b>inek</b> ve <b>insanın</b> ağız, mide ve bağırsak yapıları görülüyor.</p>
      <p>Bitki hücrelerinin çeperindeki <b>selüloz</b> zor sindirilir; otçullarda besin sindirim kanalında daha uzun süre kalır. Etin sindirimi daha kolaydır.</p>
      <p>Görselleri incele ve <b>yapılandırılmış ızgarayı</b> doldur: dişler, mide, bağırsak uzunluğu ve beslenme tipi.</p>`,
    gorev: "Izgaradaki <b>16 hücrenin</b> hepsini doğru doldur.",
    ogretmen: "Program, görseller kullanılarak omurgalıların mide ve diş yapılarının karşılaştırılmasını, diş çeşitleri ile beslenme arasındaki ilişkinin sorgulanmasını ve kuş, kurt, inek, insan örnekleri üzerinden dişlerin yapısı, mide yapısı ve bağırsak uzunluğu ölçütleriyle sınıflandırma yapılmasını; bunun için yapılandırılmış grid kullanılmasını öneriyor. Öğrencilere önce kendi ölçütlerini kâğıda yazdırıp sonra ızgaradaki bilimsel ölçütlerle karşılaştırın. Çizimler temsilîdir; bağırsak uzunlukları vücut uzunluğuna göre yaklaşık oranlarla gösterildi (uzman kontrolü gerekli: kuşlarda oran türe göre değişir, güvercin için “kısa” ve “orta” kabul edildi).",
    kur(ctx) {
      const S = ctx.sahne, N = S.muze.N;
      S.git("muze");
      const A = anlatApi(S, ctx, "muze");
      const ad = HAYVANLAR.map((h) => A.igne(N[h.ad].ad, h.ad, { renk: TURUNCU, yon: "alt" }));
      const BEYAZ = "#c9d4e4", PEMBE = "#f2b8b8";
      A.ig = {
        ad,
        gaga: A.igne(N.Güvercin.agiz, "gaga (diş yok)", { renk: BEYAZ }),
        kursak: A.igne(N.Güvercin.kursak, "kursak", { renk: PEMBE, yon: "sol" }),
        bezli: A.igne(N.Güvercin.bezli, "bezli mide", { renk: PEMBE, yon: "sag" }),
        taslik: A.igne(N.Güvercin.taslik, "taşlık", { renk: PEMBE, yon: "sol" }),
        kopek: A.igne(N.Kurt.kopek, "köpek dişi", { renk: BEYAZ }),
        kurtAzi: A.igne(N.Kurt.azi, "sivri azı", { renk: BEYAZ, yon: "sag" }),
        kesici: A.igne(N.İnek.kesici, "kesici", { renk: BEYAZ }),
        inekAzi: A.igne(N.İnek.azi, "geniş öğütücü azı", { renk: BEYAZ, yon: "sag" }),
        odalar: N.İnek.odalar.map((o, i) => A.igne(o, "", { renk: PEMBE, no: i + 1 })),
        insanAzi: A.igne(N.İnsan.azi, "yuvarlak tümsekli azı", { renk: BEYAZ, yon: "sag" }),
      };
      ctx.not("<p>Modeller temsilîdir. Kaidelerin arkasındaki kıvrımlı borunun uzunluğu, hayvanın <b>vücut uzunluğuna göre</b> bağırsak uzunluğunu gösterir. Sahneyi döndürüp yakınlaştırarak dişlere ve midelere yakından bakabilirsin.</p>");
      const kap = el("div"); ctx.kontroller.append(kap);
      izgara(kap, {
        satirlar: HAYVANLAR.map((h) => ({ ad: h.ad, dogru: h.dogru })),
        sutunlar: [
          { baslik: "Diş / gaga", secenekler: SECENEK.dis },
          { baslik: "Mide", secenekler: SECENEK.mide },
          { baslik: "Bağırsak", secenekler: SECENEK.bagirsak },
          { baslik: "Beslenme", secenekler: SECENEK.beslenme },
        ],
        tamam: () => {
          ctx.gorevTamam();
          not.innerHTML = `<p><b>İsimlendir:</b> Kuşlarda besin <b>kursakta</b> depolanıp yumuşar, <b>bezli midede</b> salgılarla karışır, kaslı <b>taşlıkta</b> yutulan küçük taşlar yardımıyla öğütülür; kuşların dişi olmadığı için öğütme işini taşlık yapar. Geviş getiren otçulların dört gözlü midesi <b>işkembe</b> (1), <b>börkenek</b> (2), <b>kırkbayır</b> (3) ve <b>şirden</b> (4) bölümlerinden oluşur; işkembedeki mikroorganizmalar selülozun sindirimine yardım eder.</p>
            <p><b>Çıkarım:</b> Otçullarda bağırsak uzun, köpek dişi yok ve azılar geniştir; etçillerde köpek dişleri sivri, bağırsak kısadır; hepçil insanda yapılar ikisinin arasındadır.</p>`;
        },
      });
      const not = ctx.not("<p><b>İpucu:</b> Bir hücreyi seçemiyorsan sahnedeki modellere yakından bak. Kuş satırında bağırsak için birden fazla cevap kabul edilir.</p>");
      return Object.assign(A, { yakin: (h, parca, u) => A.odak([].concat(N[h][parca])[0], u) });
    },
    anlat: [
      { s: "Bu müzede dört omurgalının sindirim yapıları var: <b>güvercin, kurt, inek ve insan</b>.", yap: (api) => { api.vurgula(api.ig.ad); api.bak(); } },
      { s: "Bir canlının dişi, midesi ve bağırsağı, <b>neyle beslendiğine</b> uygundur.", yap: (api) => api.vurgula() },
      { s: "Bitki hücrelerinin çeperinde <b>selüloz</b> vardır. Selüloz zor sindirilir." },
      { s: "Zor sindirilen besin, kanalda daha <b>uzun süre</b> kalmalıdır. Et ise daha kolay sindirilir." },
      { soru: "Hangisinin sindirimi daha uzun sürer?", secenekler: ["Bir parça et", "Bir tutam ot", "İkisi aynı sürer"], dogru: 1,
        aciklama: "Ottaki selüloz zor sindirilir; bu yüzden otçulların sindirim kanalı uzundur.", ipucu: "Selüloz hangisinde bol?" },
      { baslik: "Birlikte yapalım: kurt", cozum: [
        "Dişler: <b>sivri köpek dişleri</b> ve keskin azılar; eti yakalar, keser.",
        "Mide: tek gözlü, geniş bir mide.",
        "Bağırsak: <b>kısa</b>; et kolay sindirilir.",
        "Sonuç: kurt <b>etçildir</b>.",
      ], yap: (api) => { api.vurgula(api.ig.kopek, api.ig.kurtAzi); api.yakin("Kurt", "kopek", 5.5); } },
      { s: "Kuşların dişi yoktur. Peki besini kim öğütür? Midenin bölümlerine yakından bak.", yap: (api) => { api.vurgula(api.ig.gaga, api.ig.kursak, api.ig.bezli, api.ig.taslik); api.yakin("Güvercin", "bezli", 4.5); } },
      { s: "İneğin midesi birkaç bölmelidir. Numaraları say.", yap: (api) => { api.vurgula(api.ig.odalar); api.yakin("İnek", "odalar", 5); } },
      { soru: "Kaidelerin arkasındaki kıvrımlı borular neyi gösteriyor?", secenekler: ["Damarları", "Vücut uzunluğuna göre bağırsak uzunluğunu", "Soluk borusunu"], dogru: 1,
        aciklama: "Boru ne kadar uzunsa, hayvanın vücuduna göre bağırsağı o kadar uzundur.", ipucu: "Sindirim kanalının hangi bölümü çok uzun olabilir?" },
      { s: "Sıra sende: modellere yakından bak ve ızgarayı doldur.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Büyük molekül zardan geçemez",
    cikti: "BİY.10.1.6-a",
    anlatim: `
      <p>İnsanda besinden enerji elde etmek için üç süreç gerekir:</p>
      <ul>
        <li><b>Sindirim:</b> Besinlerin önce <b>mekanik</b> (çiğneme, mide ve bağırsak hareketleri) sonra <b>kimyasal</b> olarak yapı taşlarına ayrılması.</li>
        <li><b>Emilim:</b> Yapı taşlarının ince bağırsak çeperindeki hücrelerden geçerek kana karışması.</li>
        <li><b>Taşıma:</b> Emilen maddelerin dolaşım sistemiyle vücut hücrelerine ulaştırılması.</li>
      </ul>
      <p>Sahnede bir lokma besinin ince bağırsaktaki yolculuğunu adım adım başlat. Su ve minerallerin ne yaptığına dikkat et.</p>`,
    gorev: "Üç süreci sırayla çalıştır ve maddeleri <b>emilmeden önce sindirilmesi gerekip gerekmediğine</b> göre sınıflandır.",
    ogretmen: "Program, “Vücutta su, ilaç, vitamin, karbohidrat, yağ, protein gibi moleküllerin sindirimi, emilimi ve taşınımı nasıl gerçekleşir?” sorusunun grup içinde tartışılarak süreçlerin niteliklerinin tanımlanmasını öneriyor. <b>Sindirimde görev alan enzim ve hormonlar verilmez; sindirim ürünlerinin kan ve lenf sisteminde izlediği yollara değinilmez.</b> Bu nedenle modelde emilen maddelerin tümü tek bir “kılcal damar” ile temsil edildi. İlaçların emilimi etken maddeye göre değişir; karttaki ifade genellemedir.",
    kur(ctx) {
      const S = ctx.sahne, D = S.doku;
      S.git("doku");
      let evre = 0, siniflandi = false, t = 0, ulasan = 0;
      const r = rastgele(9);
      const RENKLER = { glikoz: SARI, amino: "#ff8a8a", yag: TURUNCU, su: MAVI };
      const ogeler = [];
      for (let z = 0; z < 3; z++) for (let i = 0; i < 6; i++) ogeler.push({ tur: ["glikoz", "amino", "yag"][z], zincir: z, sira: i, x: 0, y: 0, z: 0, durum: "lokma" });
      for (let i = 0; i < 12; i++) ogeler.push({ tur: "su", zincir: -1, sira: i, x: D.X0 + 0.8 + r() * 8, y: 3 + r() * 2.4, z: (r() - 0.5) * 1.8, vx: (r() - 0.5) * 1.4, vy: (r() - 0.5) * 1.4, vz: (r() - 0.5) * 0.6, durum: "serbest" });
      const UST = 5.8, DUV = D.DUVAR + 0.2;
      const A = anlatApi(S, ctx, "doku");
      const hIgne = A.igne(D.noktalar.hucre, "Vücut hücresi<small>ATP ↑ 0</small>", { renk: YESIL });
      A.ig = {
        hucre: hIgne,
        bosluk: A.igne(D.noktalar.bosluk, "İnce bağırsak boşluğu", { renk: "#c9d4e4" }),
        cep: A.igne(D.noktalar.cep, "bağırsak çeperi (hücreler)", { renk: "#f2b8b8", yon: "sol" }),
        damar: A.igne(D.noktalar.damar, "kılcal damar (kan)", { renk: KIRMIZI, yon: "alt" }),
      };
      const engel = A.igne(D.dunya(-0.6, D.DUVAR + 0.35, 1.25), "✕ büyük moleküller çeperden geçemez", { renk: KIRMIZI, yon: "sag" });
      engel.gizle(true);
      D.lokma.visible = true;
      ctx.temizlik(() => { D.lokma.visible = false; D.ciz([]); });
      S.adimKare(ctx, (dt) => {
        t += dt;
        D.lokma.visible = evre === 0;
        D.lokma.rotation.y += dt * 0.3;
        const liste = [];
        for (const o of ogeler) {
          if (o.durum === "lokma") {
            if (evre === 0) continue;
            // mekanik sindirimden sonra: küçülmüş parçalar, ama moleküller hâlâ büyük zincirler
            const dibe = (Math.sin(t * 1.3 + o.zincir * 2) + 1) / 2;
            o.x = D.X0 + 1.6 + o.zincir * 2.8 + Math.sin(t * 0.8 + o.zincir) * 0.5 + o.sira * 0.3;
            o.y = 4.7 - dibe * 2.05 + Math.sin(o.sira + t * 3) * 0.07;
            o.z = (o.zincir - 1) * 0.55 + Math.cos(o.sira * 0.8 + t) * 0.12;
          } else if (o.durum === "serbest") {
            o.x += o.vx * dt; o.y += o.vy * dt; o.z += o.vz * dt;
            if (o.x < D.X0 + 0.4 || o.x > D.X1 - 0.4) o.vx *= -1;
            if (Math.abs(o.z) > 1) o.vz *= -1;
            if (o.y > UST) o.vy = -Math.abs(o.vy);
            const gecebilir = o.tur === "su" || evre >= 2;
            if (o.y < DUV && !gecebilir) o.vy = Math.abs(o.vy);
            if (o.y < DUV && gecebilir) { o.durum = "geciyor"; o.z0 = o.z; }
          } else if (o.durum === "geciyor") {
            o.y -= 1.2 * dt;
            o.z = o.z0 + (0.9 - o.z0) * Math.min(1, (DUV - o.y) / (DUV - D.KILCAL));
            if (o.y <= D.KILCAL) { o.durum = "kanda"; o.y = D.KILCAL; o.z = 0.9; o.t = D.tBul(o.x); }
          } else if (o.durum === "kanda") {
            if (evre >= 3) {
              o.t += dt * 0.09;
              if (o.t >= 1) { o.durum = "hucre"; ulasan++; D.parla(); hIgne.metin(`Vücut hücresi<small>ATP ↑ ${ulasan}</small>`); continue; }
              const p = D.egri.getPointAt(o.t); o.x = p.x; o.y = p.y; o.z = p.z;
            } else o.x += Math.sin(t * 2 + o.sira) * 0.15 * dt;
          }
          if (o.durum === "hucre") continue;
          liste.push({ x: o.x, y: o.y, z: o.z, r: o.tur === "su" ? 0.09 : 0.15, renk: RENKLER[o.tur] });
        }
        D.ciz(liste);
        engel.gizle(evre !== 1);
      });
      const [b1, b2, b3] = ctx.dugmeler([
        { metin: "1) Çiğne ve karıştır (mekanik)", tik: () => ilerle(1) },
        { metin: "2) Kimyasal sindirim", tik: () => ilerle(2) },
        { metin: "3) Dolaşımı başlat (taşıma)", tik: () => ilerle(3) },
      ]);
      b2.disabled = b3.disabled = true;
      const g = geriBildirim(ctx);
      function ilerle(e) {
        evre = e;
        [b1, b2, b3].forEach((b, i) => { b.disabled = i !== e; if (i < e) b.classList.add("bio-yapildi"); });
        if (e === 1) yaz(g, true, "Lokma küçük parçalara ayrıldı; yüzeyi arttı. Ama nişasta, protein ve yağ hâlâ <b>büyük moleküller</b>: çepere çarpıp geri dönüyorlar. Su ise baştan beri geçiyor!");
        if (e === 2) {
          for (const o of ogeler) if (o.durum === "lokma") { o.durum = "serbest"; o.vx = (r() - 0.5) * 1.8; o.vy = -(0.6 + r() * 0.8); o.vz = (r() - 0.5) * 0.8; }
          yaz(g, true, "Büyük moleküller yapı taşlarına ayrıldı: glikoz, amino asit, yağ asidi ve gliserol. Artık bağırsak çeperinden geçebiliyorlar: <b>emilim</b>.");
        }
        if (e === 3) { yaz(g, true, "Kan, emilen maddeleri vücut hücrelerine taşıyor. Hücreler bu maddeleri hücresel solunumda kullanarak <b>ATP</b> üretir."); bitir(); }
      }
      ctx.not(`<p><span style="color:${SARI}">●</span> glikoz &nbsp; <span style="color:#ff8a8a">●</span> amino asit &nbsp; <span style="color:${TURUNCU}">●</span> yağ asidi, gliserol &nbsp; <span style="color:${MAVI}">●</span> su</p>`);
      const kap = el("div"); ctx.kontroller.append(kap);
      siniflandir(kap, {
        kutular: [{ ad: "h", baslik: "Sindirilmeden emilir" }, { ad: "s", baslik: "Önce sindirilmeli" }],
        ogeler: MADDELER.map((m) => ({ metin: m.ad, dogru: m.sindirim ? "s" : "h", neden: m.neden })), sutun: 2,
        tamam: () => { siniflandi = true; bitir(); },
      });
      function bitir() {
        if (evre >= 3 && siniflandi && !ctx.gorevTamamMi()) {
          ctx.gorevTamam();
          yaz(g, true, "Tamam! <b>Sindirim</b> büyük molekülleri yapı taşlarına ayırır, <b>emilim</b> onları kana geçirir, <b>taşıma</b> hücrelere ulaştırır. Su, mineraller ve vitaminler gibi küçük maddeler sindirilmeden emilir.");
        }
      }
      return A;
    },
    anlat: [
      { s: "Bir lokma ekmek <b>ince bağırsağa</b> geldi. Bu lokma hücrelere göre dev gibi!", yap: (api) => { api.vurgula(api.ig.bosluk); api.bak(); } },
      { s: "Bağırsağın çeperi, hücrelerden yapılmış bir duvar. Hemen altında bir <b>kılcal damar</b> var.", yap: (api) => api.vurgula(api.ig.cep, api.ig.damar) },
      { s: "Besinin kana geçebilmesi için bu duvarı aşması gerekir." },
      { s: "Mavi noktalar <b>su</b> molekülleri. Su küçüktür; bak, duvardan rahatça geçiyor.", yap: (api) => api.vurgula(api.ig.cep) },
      { soru: "Süt şekeri (laktoz) iki şeker biriminden yapılmıştır. Duvardan olduğu gibi geçebilir mi?", secenekler: ["Evet, su gibi geçer", "Hayır, önce birimlerine ayrılmalı"], dogru: 1,
        aciklama: "Laktoz, bağırsakta iki küçük şekere ayrıldıktan sonra emilir. Bu ayrılamazsa laktoz emilemez.", ipucu: "Duvardan yalnızca en küçük yapı taşları geçebiliyor." },
      { s: "Besin önce <b>mekanik</b> olarak küçülür: çiğneme, mide ve bağırsak hareketleri.", yap: (api) => api.vurgula(api.ig.bosluk) },
      { s: "Sonra <b>kimyasal sindirim</b> gelir: büyük moleküller yapı taşlarına ayrılır." },
      { s: "Yapı taşlarının duvardan kana geçmesine <b>emilim</b> diyoruz.", yap: (api) => api.vurgula(api.ig.cep, api.ig.damar) },
      { s: "Kanın onları vücut hücrelerine götürmesi de <b>taşımadır</b>. Hücre bu besinlerle ATP üretir.", yap: (api) => api.vurgula(api.ig.hucre, api.ig.damar) },
      { soru: "Besinin yolculuğunda doğru sıra hangisi?", secenekler: ["Emilim → sindirim → taşıma", "Sindirim → emilim → taşıma", "Taşıma → sindirim → emilim"], dogru: 1,
        aciklama: "Önce parçalanır, sonra kana geçer, sonra hücrelere taşınır.", ipucu: "Besin parçalanmadan duvardan geçebilir mi?" },
      { s: "Sıra sende: üç süreci sırayla çalıştır, sonra maddeleri sınıflandır.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Emilim yüzeyini büyüt",
    cikti: "BİY.10.1.6-b",
    anlatim: `
      <p>İnce bağırsak yaklaşık <b>${sayi(6)} m</b> uzunluğunda ve <b>${sayi(2.5, 1)} cm</b> çapındadır. Düz bir boru olsaydı iç yüzeyi yalnızca <b>${sayi(boruAlani(), 2)} m²</b> olurdu.</p>
      <p>Emilim yüzeyini artıran üç uyum vardır:</p>
      <ul>
        <li><b>Kıvrımlar:</b> Çeperin büyük katlantıları (yüzeyi ~${KATSAYI.kivrim} kat artırır).</li>
        <li><b>Villuslar:</b> Kıvrımların üzerindeki parmak şeklindeki çıkıntılar (~${KATSAYI.villus} kat).</li>
        <li><b>Mikrovilluslar:</b> Villus hücrelerinin zarındaki çok küçük çıkıntılar (~${KATSAYI.mikrovillus} kat).</li>
      </ul>
      <p>Yapıları açıp kapat, her yapılandırmayı tabloya kaydet. Besin ince bağırsakta yaklaşık <b>${GECIS_SURESI} saat</b> kalıyorsa glikozun ne kadarı emilebilir?</p>`,
    gorev: "En az <b>3 farklı yapılandırmayı</b> tabloya kaydet; bunlardan birinde 4 saatte emilen glikoz <b>%90'ı</b> geçsin.",
    ogretmen: "Program, emilim için gelişen adaptasyonların sorgulanmasını ve sindirim, emilim, taşıma süreçlerinin enerji eldesi için gerekliliğine ilişkin bilgi/veri toplanıp kaydedilmesini istiyor. Modelde emilim hızı yüzey alanıyla orantılı kabul edildi (birinci dereceden emilim); katsayılar ders kitaplarındaki yaklaşık değerlerdir. Eski kaynaklarda ince bağırsağın toplam yüzeyi 200–300 m² (“bir tenis kortu”) olarak verilir; 2014'te yayımlanan ölçümler (Helander ve Fändriks) sindirim kanalı mukoza yüzeyinin yaklaşık 30 m² olduğunu gösterdi. Öğrencilerle bilimsel bilginin yeni verilerle nasıl güncellendiğini tartışın (uzman kontrolü gerekli).",
    kur(ctx) {
      const S = ctx.sahne, B = S.bagirsak;
      S.git("bagirsak");
      const y = { kivrim: false, villus: false, mikrovillus: false };
      const kayitlar = new Map();
      const RENK = [MAVI, YESIL, MOR, "#ff8a8a", "#e8eef7", "#9be7ff", "#ffd45a", "#c4e37a"];
      const [gr] = ctx.grafikler([{ baslik: "Emilen glikoz", x: { etiket: "saat", min: 0, max: 4 }, y: { etiket: "%", min: 0, max: 100 } }]);
      const simdi = gr.seri("şimdiki", { renk: TURUNCU, kalinlik: 3 });
      const egri = (k) => Array.from({ length: 41 }, (_, i) => [i / 10, 100 * emilenOran(k, i / 10)]);
      const A = anlatApi(S, ctx, "bagirsak");
      const igK = A.igne(B.noktalar.kivrim, "kıvrımlar", { renk: TURUNCU });
      const igV = A.igne(B.noktalar.villus, "villuslar", { renk: TURUNCU, yon: "alt" });
      const igM = A.igne(B.noktalar.mikro, "", { renk: "#f2b8b8" });
      A.ig = {
        kivrim: igK, villus: igV, mikro: igM,
        bosluk: A.igne(B.noktalar.bosluk, "bağırsak boşluğu<small>sarı: glikoz</small>", { renk: SARI }),
        dis: A.igne(B.noktalar.dis, "bağırsak çeperi (açılmış)", { renk: "#c9d4e4", yon: "alt" }),
      };
      ctx.temizlik(() => B.ayarla({ kivrim: false, villus: false, mikrovillus: false }));
      const isim = { kivrim: "Kıvrımlar", villus: "Villuslar", mikrovillus: "Mikrovilluslar" };
      const dugmeler = ctx.dugmeler(Object.keys(isim).map((a) => ({ metin: `${isim[a]}: KAPALI`, tik: () => { y[a] = !y[a]; guncelle(); } })));
      const gs = ctx.gostergeler([{ ad: "k", etiket: "Yüzey katsayısı", ondalik: 0 }, { ad: "a", etiket: "Yüzey alanı", ondalik: 1, birim: "m²" }, { ad: "e", etiket: "4 saatte emilen" }]);
      ctx.dugmeler([{ metin: "Ölçümü tabloya kaydet", ana: true, tik: kaydet }]);
      const tablo = ctx.tablo(["Yapılar", "Katsayı", "Alan (m²)", "4 saatte emilen"]);
      const g = geriBildirim(ctx);
      ctx.not("<p><b>Bilim güncellenir:</b> Eski kaynaklarda ince bağırsağın yüzeyi “bir tenis kortu kadar” (200–300 m²) diye geçer. 2014'teki daha hassas ölçümler yaklaşık <b>30 m²</b> (yarım badminton sahası kadar) buldu. İki değer de düz bir boruya göre çok büyüktür.</p>");
      function adi() { const a = Object.keys(isim).filter((x) => y[x]).map((x) => isim[x].toLocaleLowerCase("tr")); return a.length ? a.join(" + ") : "düz boru"; }
      function guncelle() {
        const k = yuzeyKatsayisi(y);
        Object.keys(isim).forEach((a, i) => { dugmeler[i].textContent = `${isim[a]}: ${y[a] ? "AÇIK" : "KAPALI"}`; dugmeler[i].classList.toggle("bio-secili", y[a]); });
        gs.ayarla("k", k); gs.ayarla("a", boruAlani() * k); gs.ayarla("e", yuzde(emilenOran(k, GECIS_SURESI)));
        simdi.ayarla(egri(k));
        B.ayarla(y); B.hiz(k);
        igK.gizle(!y.kivrim); igV.gizle(!y.villus);
        igM.metin(`büyütülmüş hücreler<small>${y.mikrovillus ? "mikrovilluslar açık" : "düz hücre zarı"}</small>`);
      }
      function kaydet() {
        const k = yuzeyKatsayisi(y), ad = adi();
        if (kayitlar.has(ad)) { yaz(g, false, `“${ad}” yapılandırmasını zaten kaydettin. Başka bir birleşim dene.`); return; }
        const e = emilenOran(k, GECIS_SURESI);
        kayitlar.set(ad, e);
        tablo.satirEkle([ad, `×${k}`, sayi(boruAlani() * k, 1), yuzde(e)]);
        gr.seri(ad, { renk: RENK[(kayitlar.size - 1) % RENK.length], kalinlik: 2, kesikli: true }).ayarla(egri(k));
        const enIyi = Math.max(...kayitlar.values());
        if (kayitlar.size >= 3 && enIyi >= 0.9) {
          if (!ctx.gorevTamamMi()) ctx.gorevTamam();
          yaz(g, true, `Verilerin hazır. Katsayılar <b>çarpılarak</b> büyüyor: üç yapı birlikte yüzeyi ${KATSAYI.kivrim * KATSAYI.villus * KATSAYI.mikrovillus} katına çıkarıyor. Düz bir boruda 4 saatte glikozun yalnızca ${yuzde(emilenOran(1, 4))}'i emilebilirdi; emilim yüzeyi olmasaydı besinlerin çoğu enerjiye dönüşemeden atılırdı.`);
        } else yaz(g, true, `Kaydedildi (${kayitlar.size}/3). ${enIyi < 0.9 ? "Henüz hiçbir yapılandırmada emilim %90'ı geçmedi." : "Bir yapılandırma daha kaydet."}`);
      }
      guncelle();
      return Object.assign(A, {
        /** Gösterim için yapıları açıp kapatır */
        yapi(o) { Object.assign(y, { kivrim: false, villus: false, mikrovillus: false }, o); guncelle(); },
        yakin: (ad, u, dy) => A.odak(B.noktalar[ad], u, 1.2, dy),
      });
    },
    anlat: [
      { s: `İnce bağırsak yaklaşık <b>${sayi(6)} m</b> uzunluğunda, <b>${sayi(2.5, 1)} cm</b> genişliğinde bir borudur.`, yap: (api) => { api.yapi({}); api.vurgula(api.ig.dis); api.bak(); } },
      { s: `İçi düz olsaydı yüzeyi yalnızca <b>${sayi(boruAlani(), 2)} m²</b> olurdu: bir okul sırasının üstü kadar.` },
      { s: "Besin bu yüzeyden emilir. Yüzey ne kadar büyükse, aynı sürede o kadar çok besin geçer.", yap: (api) => api.vurgula(api.ig.bosluk) },
      { soru: "Bir sünger ile aynı boydaki düz bir taş: hangisi daha çok su tutar?", secenekler: ["Düz taş", "Sünger: içi gözeneklerle dolu, yüzeyi çok büyük"], dogru: 1,
        aciklama: "Aynı boyda ama yüzeyi çok daha büyük. Bağırsak da yüzeyini böyle büyütür.", ipucu: "Hangisinin iç yüzeyi daha büyük?" },
      { s: "Bağırsak çeperi düz değildir; büyük <b>kıvrımlar</b> yapar.", yap: (api) => { api.yapi({ kivrim: true }); api.vurgula(api.ig.kivrim); } },
      { s: "Kıvrımların üstünde parmak gibi çıkıntılar var: <b>villuslar</b>.", yap: (api) => { api.yapi({ kivrim: true, villus: true }); api.vurgula(api.ig.villus); } },
      { s: "Villus hücrelerinin zarında da minicik çıkıntılar bulunur: <b>mikrovilluslar</b>.", yap: (api) => { api.yapi({ kivrim: true, villus: true, mikrovillus: true }); api.vurgula(api.ig.mikro); api.yakin("mikro", 7, -1.6); } },
      { formul: [["yüzey", "toplam alan"], ["="], ["boru", "düz boru alanı"], ["×"], ["k<sub>1</sub>", "kıvrım"], ["×"], ["k<sub>2</sub>", "villus"], ["×"], ["k<sub>3</sub>", "mikrovillus"]],
        s: "Her yapı yüzeyi <b>kat kat</b> büyütür; katsayılar çarpılır.", oku: "yüzey eşittir boru alanı çarpı üç katsayı", yap: (api) => { api.vurgula(); api.bak(); } },
      { baslik: "Birlikte yapalım", cozum: ["Boru yüzeyi 0,4 m² olsun.", "Yalnız kıvrımlar açık: katsayı ×3.", "0,4 × 3 = <b>1,2 m²</b>"] },
      { soru: "Kıvrımlar ×2, villuslar ×5 büyütseydi yüzey toplam kaç kat büyürdü?", secenekler: ["7 kat", "10 kat", "25 kat"], dogru: 1,
        aciklama: "Katsayılar toplanmaz, çarpılır: 2 × 5 = 10 kat.", ipucu: "Kıvrımlar ikiye katlar; villuslar o yüzeyi beşe katlar." },
      { s: "Sıra sende: yapıları aç, kapat ve her ölçümü tabloya kaydet." },
    ],
    anlatBitti: (api) => { api.yapi({}); api.don(); },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Zincirin zayıf halkası",
    cikti: "BİY.10.1.6-c",
    anlatim: `
      <p>Sindirim, emilim ve taşıma bir <b>zincirin halkaları</b> gibi art arda çalışır. Hücreye ulaşan besin oranı, üç sürecin verimlerinin <b>çarpımıdır</b>:</p>
      <p class="formul">ulaşan = sindirim × emilim × taşıma</p>
      <p>Kaydırıcılarla verimleri değiştir ve hücrenin ATP üretiminin nasıl etkilendiğini izle. Sonra dört hasta vakasında <b>hangi halkanın bozulduğunu</b> teşhis et.</p>`,
    gorev: "Dört vakanın hepsinde bozulan süreci doğru teşhis et.",
    ogretmen: "Program, toplanan bilgilerin grafik, tablo veya diyagram gibi görsel formatlara dönüştürülmesini, emilim ve taşıma süreçleri ile enerji eldesi arasındaki ilişkinin belirlenmesini ve bu süreçlerin vücudun sağlıklı çalışması için öneminin değerlendirilmesini istiyor. Vakalardaki verim değerleri temsilîdir. Çarpım modeli, bir halka bozulduğunda diğerlerinin bunu telafi edemeyeceğini göstermek içindir; gerçekte vücut, kısmi uyum (ör. daha uzun çiğneme, dolaşımın yeniden düzenlenmesi) gösterebilir.",
    kur(ctx) {
      const S = ctx.sahne, D = S.doku;
      S.git("doku");
      D.lokma.visible = false;
      ctx.temizlik(() => D.ciz([]));
      const v = { sindirim: 1, emilim: 1, tasima: 1 };
      const ADLAR = { sindirim: "Sindirim", emilim: "Emilim", tasima: "Taşıma" };
      const GX = D.X0 + 2.2, KT = 0.78;
      const parcalar = [];
      let biriken = 0, atp = 0, say = 0;
      const kp = D.egri.getPointAt(KT);
      const A = anlatApi(S, ctx, "doku");
      const kapi = [
        A.igne(D.dunya(GX, 5.5, 0), "", { renk: YESIL }),
        A.igne(D.dunya(-1.6, D.DUVAR + 0.3, 1.25), "", { renk: YESIL, yon: "sag" }),
        A.igne(D.dunya(kp.x, kp.y + 0.5, kp.z), "", { renk: YESIL, yon: "sol" }),
      ];
      const hIgne = A.igne(D.noktalar.hucre, "", { renk: TURUNCU });
      A.ig = { kapi, hucre: hIgne, gri: A.igne(D.noktalar.damar, "gri: hücreye ulaşamayan besin", { renk: "#8193ad", yon: "alt" }) };
      const ALT = ["besin → yapı taşı", "yapı taşı → kan", "kan → hücre"];
      function etiketle() {
        SUREC.forEach((s, i) => {
          kapi[i].metin(`${ADLAR[s]} ${yuzde(v[s])}<small>${ALT[i]}</small>`);
          kapi[i].el.style.setProperty("--renk", v[s] < 0.8 ? KIRMIZI : YESIL);
        });
        hIgne.metin(`Hücre: ulaşan ${yuzde(hucreyeUlasan(v))}<small>üretilen ATP (göreli): ${atp}</small>`);
      }
      const yeni = () => ({ x: D.X0 + 0.3, y: 3.5 + Math.random() * 1.6, z: (Math.random() - 0.5) * 1.6, asama: 0, dus: 0 });
      function ilerlet(dt) {
        biriken += dt * 5;
        while (biriken > 1) { biriken--; parcalar.push(yeni()); }
        for (let i = parcalar.length - 1; i >= 0; i--) {
          const p = parcalar[i];
          if (p.dus > 0) { p.dus -= dt; p.y -= 0.4 * dt; if (p.dus <= 0) parcalar.splice(i, 1); continue; }
          if (p.asama === 0) {
            p.x += 1.6 * dt;
            if (p.x > GX) { if (Math.random() > v.sindirim) { p.dus = 1.2; continue; } p.asama = 1; }
          } else if (p.asama === 1) {
            p.x += 0.5 * dt; p.y -= 1.1 * dt;
            if (p.y < D.DUVAR + 0.2) { if (Math.random() > v.emilim) { p.dus = 1.2; continue; } p.asama = 2; p.z0 = p.z; }
          } else if (p.asama === 2) {
            p.y -= 1.3 * dt;
            p.z = p.z0 + (0.9 - p.z0) * Math.min(1, (D.DUVAR + 0.2 - p.y) / (D.DUVAR + 0.2 - D.KILCAL));
            if (p.y <= D.KILCAL) { p.asama = 3; p.t = D.tBul(p.x); }
          } else {
            p.t += dt * 0.1;
            if (p.t > KT && !p.sinandi) { p.sinandi = true; if (Math.random() > v.tasima) { p.dus = 1.2; continue; } }
            if (p.t >= 1) { parcalar.splice(i, 1); atp++; D.parla(); continue; }
            const q = D.egri.getPointAt(p.t); p.x = q.x; p.y = q.y; p.z = q.z;
          }
        }
      }
      for (let i = 0; i < 200; i++) ilerlet(0.05);
      atp = 0;
      const RN = ["#b9a27a", SARI, SARI, "#ff7a8a"];
      S.adimKare(ctx, (dt) => {
        ilerlet(dt);
        D.ciz(parcalar.map((p) => ({ x: p.x, y: p.y, z: p.z, r: p.dus > 0 ? 0.12 * Math.min(1, p.dus) : 0.12, renk: p.dus > 0 ? "#8193ad" : RN[p.asama] })));
        if (++say % 8 === 0) etiketle();
      });
      etiketle();
      const kay = SUREC.map((s) => ctx.kaydirici({ etiket: `${ADLAR[s]} verimi`, min: 0, max: 100, adim: 5, deger: 100, birim: "%", degisti: (x) => { v[s] = x / 100; gs.ayarla("u", yuzde(hucreyeUlasan(v))); } }));
      const gs = ctx.gostergeler([{ ad: "u", etiket: "Hücreye ulaşan besin" }, { ad: "c", etiket: "Teşhis edilen vaka", ondalik: 0 }]);
      gs.ayarla("u", yuzde(1)); gs.ayarla("c", `0 / ${VAKALAR.length}`);
      const cozulen = new Set();
      let no = 0;
      const vakaKutu = el("div", { class: "d-anlatim bio-bilgi-kutu" });
      ctx.secenekler({ etiket: "Vaka", liste: VAKALAR.map((_, i) => ({ deger: i, metin: `Vaka ${i + 1}` })), deger: 0, degisti: (i) => yukle(i) });
      ctx.kontroller.append(vakaKutu);
      const teshis = ctx.secenekler({ etiket: "Bu vakada hangi süreç aksıyor?", liste: SUREC.map((s) => ({ deger: s, metin: ADLAR[s] })), deger: null, degisti: degerlendir });
      const g = geriBildirim(ctx);
      ctx.yaziAlani({ etiket: "<b>Yorumla:</b> Bir kişi yeterli besin aldığı hâlde sürekli yorgun hissediyorsa bunun sindirim, emilim ve taşıma süreçleriyle nasıl bir ilişkisi olabilir?", anahtar: "zincir-yorum", enAz: 60 });
      function yukle(i) {
        no = i; teshis.deger = null; g.textContent = ""; g.className = "d-geri-bildirim";
        vakaKutu.innerHTML = `<p><b>Vaka ${i + 1}:</b> ${VAKALAR[i].metin}${cozulen.has(i) ? " ✓" : ""}</p>`;
      }
      function degerlendir(s) {
        const vk = VAKALAR[no];
        if (s !== vk.bozuk) { yaz(g, false, `${ADLAR[s]} sürecinin bu vakayla doğrudan ilgisi yok. Vakada sorun hangi aşamada ortaya çıkıyor: besinin parçalanmasında mı, kana geçmesinde mi, hücrelere ulaşmasında mı?`); return; }
        cozulen.add(no); gs.ayarla("c", `${cozulen.size} / ${VAKALAR.length}`);
        SUREC.forEach((x, i) => { v[x] = x === s ? vk.verim : 1; kay[i].deger = 100 * v[x]; });
        gs.ayarla("u", yuzde(hucreyeUlasan(v)));
        yaz(g, true, `Doğru teşhis: <b>${ADLAR[s]}</b>. Diğer iki süreç kusursuz çalışsa bile hücreye ulaşan besin ${yuzde(hucreyeUlasan(v))}'e düşüyor; hücreler daha az ATP üretebiliyor.`);
        vakaKutu.innerHTML = `<p><b>Vaka ${no + 1}:</b> ${vk.metin} ✓</p>`;
        if (cozulen.size === VAKALAR.length && !ctx.gorevTamamMi()) { ctx.gorevTamam(); g.innerHTML += " <br><b>Dört vaka da çözüldü!</b> Zincirin en zayıf halkası tüm sistemin verimini belirler."; }
      }
      yukle(0);
      return Object.assign(A, {
        /** Gösterim için verimleri ayarlar (verilmeyenler %100) */
        verim(o = {}) {
          SUREC.forEach((x, i) => { v[x] = o[x] ?? 1; kay[i].deger = 100 * v[x]; });
          gs.ayarla("u", yuzde(hucreyeUlasan(v))); etiketle();
        },
      });
    },
    anlat: [
      { s: "Besin hücreye ulaşmak için art arda üç kapıdan geçer: <b>sindirim, emilim, taşıma</b>.", yap: (api) => { api.verim(); api.vurgula(api.ig.kapi); api.bak(); } },
      { s: "Etiketler her kapının <b>verimini</b> gösteriyor: gelen besinin yüzde kaçı kapıdan geçiyor?" },
      { s: "Şimdi hepsi %100. Sarı noktaların hepsi hücreye varıyor.", yap: (api) => api.vurgula(api.ig.hucre) },
      { s: "Emilimi bozalım: verimini <b>%50</b>'ye düşürüyorum. Gri noktalara bak.", yap: (api) => { api.verim({ emilim: 0.5 }); api.vurgula(api.ig.kapi[1], api.ig.gri); } },
      { s: "Besinin yarısı duvardan geçemeden kayboluyor. Hücreye ulaşan da yarıya iniyor.", yap: (api) => api.vurgula(api.ig.hucre) },
      { soru: "Emilim %50 iken sindirim %100'e çıkarılsa hücreye ulaşan artar mı?", secenekler: ["Evet, %100 olur", "Hayır, emilim yine yarısını kaybeder"], dogru: 1,
        aciklama: "Bir halka bozuksa diğerleri onu telafi edemez. Zincir en zayıf halkası kadar güçlüdür.", ipucu: "Sindirim zaten %100; sorun hangi kapıda?" },
      { formul: [["ulaşan", "hücreye varan oran"], ["="], ["sindirim"], ["×"], ["emilim"], ["×"], ["taşıma"]],
        s: "Hücreye ulaşan oran, üç verimin <b>çarpımıdır</b>.", oku: "ulaşan eşittir sindirim çarpı emilim çarpı taşıma", yap: (api) => api.vurgula() },
      { baslik: "Birlikte yapalım", cozum: ["Sindirim %90, emilim %50, taşıma %100 olsun.", "0,9 × 0,5 × 1 = 0,45", "Hücreye ulaşan: <b>%45</b>"] },
      { soru: "Taşıma %100 iken emilim %0 olursa hücreye ne ulaşır?", secenekler: ["Besinin yarısı", "Hiçbir şey", "Besinin hepsi"], dogru: 1,
        aciklama: "Herhangi bir verim 0 olursa çarpım da 0 olur.", ipucu: "Sıfırla çarpınca ne olur?" },
      { s: "Hastada bozuk kapıyı bulmak için belirtiye bak: besin parçalanmıyor mu, kana geçmiyor mu, hücreye varmıyor mu?", yap: (api) => api.verim() },
      { s: "Sıra sende: vakaları oku ve bozulan halkayı bul.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => { api.verim(); api.don(); },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Değerlendirme: Güneşsiz besin ve sindirim",
    anlatim: `
      <p>Sekiz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>6 doğru</b> yaparsan dersi tamamlamış olursun.</p>`,
    gorev: "Değerlendirmede en az <b>6/8</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (bilgi görseli, yapılandırılmış grid) uyumludur. Bilgi görseli için 2. adımdaki kaydı, grid için 4. adımdaki ızgarayı değerlendirmeye katabilirsiniz.",
    kur(ctx) {
      const S = ctx.sahne;
      S.git("baca", "genel"); S.dondur(ctx);
      ctx.sinav([
        {
          tur: "coktan", metin: "Fotosentez ile kemosentezin <b>ortak</b> özelliği hangisidir?",
          siklar: ["İkisinde de ışık enerjisi kullanılır", "İkisini de yalnızca bakteriler yapar", "İkisinde de CO₂'den organik besin üretilir", "İkisinde de klorofil gerekir"], dogru: 2,
          aciklama: "İki süreçte de CO₂ kullanılarak organik besin üretilir ve bu süreçleri yapan canlılar üreticidir. Enerji kaynakları farklıdır: ışık ya da inorganik maddelerin oksitlenmesi.",
        },
        {
          tur: "coktan", metin: "Işığın hiç ulaşmadığı hidrotermal baca ekosisteminde besin ağının <b>üreticileri</b> hangileridir?",
          siklar: ["Tüp solucanları", "Kemosentez yapan bakteriler", "Yengeçler", "Fitoplanktonlar"], dogru: 1,
          aciklama: "Kemosentetik bakteriler H₂S gibi inorganik maddelerin kimyasal enerjisiyle besin üretir. Tüp solucanları bu bakterilerle ortak yaşar; yengeçler tüketicidir. Fitoplankton ışığa muhtaçtır.",
        },
        {
          tur: "coktan", metin: "Hangi canlıda hem hücre dışı hem hücre içi sindirim görülür?",
          siklar: ["Amip", "Küf mantarı", "Hidra", "İnek"], dogru: 2,
          aciklama: "Hidrada besin önce sindirim boşluğunda (hücre dışında) parçalanır, sonra boşluğu döşeyen hücrelerin içinde sindirim tamamlanır.",
        },
        {
          tur: "coktan", metin: "Aşağıdakilerden hangisi geviş getiren otçul bir memelinin sindirim yapılarını tanımlar?",
          siklar: ["Sivri köpek dişleri, tek gözlü mide, kısa bağırsak", "Köpek dişi yok, geniş azılar, dört gözlü mide, çok uzun bağırsak", "Gaga, kursak ve taşlık", "Kesici, köpek ve azı dişleri dengeli, orta uzunlukta bağırsak"], dogru: 1,
          aciklama: "Selülozca zengin bitkisel besin, geniş azılarla öğütülür; dört gözlü midede mikroorganizmaların yardımıyla sindirilir ve uzun bağırsakta uzun süre kalarak emilir.",
        },
        {
          tur: "coktan", metin: "Hangi madde emilmeden önce <b>mutlaka sindirilmelidir</b>?",
          siklar: ["Glikoz", "Su", "Nişasta", "Vitamin"], dogru: 2,
          aciklama: "Nişasta binlerce glikozdan oluşan büyük bir moleküldür; bağırsak çeperinden geçebilmesi için glikoza kadar sindirilmesi gerekir.",
        },
        {
          tur: "sayi", metin: "Düz bir boru kabul edilen ince bağırsağın iç yüzeyi <b>0,5 m²</b> olsun. Kıvrımlar yüzeyi 3, villuslar 10, mikrovilluslar 20 kat artırıyorsa toplam yüzey kaç m² olur?",
          dogru: 300, tolerans: 1, birim: "m²",
          aciklama: "Katsayılar çarpılır: 3 × 10 × 20 = 600. Toplam yüzey 0,5 m² × 600 = 300 m².",
        },
        {
          tur: "sayi", metin: "Bir kişide sindirim verimi %80, emilim verimi %50, taşıma verimi %100 ise yediği besinin yüzde kaçı hücrelere ulaşır?",
          dogru: 40, tolerans: 0.5, birim: "%",
          aciklama: "Süreçler art arda çalıştığı için verimler çarpılır: 0,8 × 0,5 × 1 = 0,4, yani %40.",
        },
        {
          tur: "coktan", metin: "Villusları körelmiş bir hastada yeterli besin alındığı hâlde halsizlik görülmesinin en olası nedeni nedir?",
          siklar: ["Sindirim kanalında besin hiç parçalanmaz", "Kan dolaşımı tamamen durur", "Hücreler ATP kullanmayı bırakır", "Emilim yüzeyi azaldığı için hücrelere yeterli besin ve dolayısıyla enerji ulaşmaz"], dogru: 3,
          aciklama: "Villuslar emilim yüzeyini büyütür. Körelince yapı taşlarının çoğu kana geçemez; hücreler yeterli glikoz alamaz ve daha az ATP üretir.",
        },
      ], { baslik: "Güneşsiz besin ve sindirim", gecmeOrani: 0.75 });
      const sinavOrtu = ctx.katman.querySelector(".d-sinav")?.closest(".d-ortu");
      return {
        git: (yer, bakis) => S.git(yer, bakis),
        /** Anlatım sürerken sınav kartı sahneyi örtmesin */
        sinavGizle(b) { if (sinavOrtu) sinavOrtu.hidden = b; },
        bitir() { this.sinavGizle(false); S.git("baca", "genel").then(() => S.dondur(ctx)); },
      };
    },
    anlat: [
      { s: "Ders boyunca nerelere gittik, kısaca hatırlayalım.", yap: (api) => { api.sinavGizle(true); api.git("baca", "ana"); } },
      { s: "Işıksız derin denizde besini <b>kemosentez</b> yapan bakteriler üretir: enerji ışıktan değil, H₂S gibi maddelerden gelir." },
      { s: "<b>Sindirim</b>, büyük besinleri küçük yapı taşlarına ayırır; hücre içinde ya da dışında olabilir.", yap: (api) => api.git("lab") },
      { s: "Dişler, mide ve bağırsak, canlının <b>beslenme tipine</b> uygundur.", yap: (api) => api.git("muze") },
      { soru: "Villuslar ve mikrovilluslar neyi büyütür?", secenekler: ["Bağırsağın uzunluğunu", "Emilim yüzeyini", "Midenin hacmini"], dogru: 1,
        aciklama: "Bu çıkıntılar bağırsağın iç yüzeyini kat kat büyütür; böylece daha çok besin emilir.", ipucu: "Süngeri hatırla." },
      { s: "Sindirim, emilim ve taşıma bir zincirdir. Bir halka bozulursa hücreye az besin ulaşır.", yap: (api) => api.git("doku") },
      { s: "Şimdi bildiklerini sına: sekiz soru seni bekliyor." },
    ],
    anlatBitti: (api) => api.bitir(),
  },
];

dersBaslat({ adimlar, sahneKur: biyoSahnesi });
