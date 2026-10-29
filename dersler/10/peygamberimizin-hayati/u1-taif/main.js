// 10. Sınıf Peygamberimizin Hayatı · 1. Ünite: Peygamberimizin Hayatında Önemli Bir Şehir: Taif
// PH.10.1.1 Taif yolculuğuna dair tarihsel empati · PH.10.1.2 Taif'in İslamlaşması olayını sentezleme
import { dersBaslat, el } from "../../../../engine/ders.js";
import { sahneKap, sekmeler, siniflandirma, siralama, iliskiAgi, zamanCizelgesi, karistir } from "../../felsefe/_ortak/etkilesim.js";
import { harita } from "../../felsefe/_ortak/harita.js";
import { OLAYLAR, SERITLER, SAYILAR, olay, yer, olayYili, miladiOndalik, tarihYaz, uzaklik, sayiYaz } from "./veri.js";
import hicazVeri from "./harita-veri.json";

const NOT_HARITA = "Sınırlar günümüze aittir · Antik yerlerin konumu yaklaşıktır";
const noktalar = (ids) => ids.map((id) => ({ ...yer(id), alt: yer(id).yaklasik ? "(yaklaşık)" : undefined }));
const lonlat = (id) => [yer(id).lon, yer(id).lat];

/* ---------- 1. adım: Mekke–Taif temsilî yükselti profili ---------- */
function profilSvg() {
  const P = [[0, 277], [18, 330], [32, 420], [42, 700], [47, 1350], [51, 2000], [57, 1950], [63, 1879]];
  const W = 600, H = 170, x = (k) => 70 + (k / 63) * (W - 130), y = (m) => H - 26 - (m / 2100) * (H - 50);
  const d = P.map(([k, m], i) => `${i ? "L" : "M"}${x(k).toFixed(1)},${y(m).toFixed(1)}`).join("");
  const alan = `${d}L${x(63)},${y(0)}L${x(0)},${y(0)}Z`;
  return `<svg viewBox="0 0 ${W} ${H}" class="ph-profil" role="img" aria-label="Mekke ile Taif arasındaki yükselti profili">
    <path d="${alan}" class="ph-dag"/><path d="${d}" class="ph-dag-cizgi"/>
    ${[0, 1000, 2000].map((m) => `<line x1="64" x2="${W - 56}" y1="${y(m)}" y2="${y(m)}" class="ph-izgara"/><text x="60" y="${y(m) + 4}" text-anchor="end">${m.toLocaleString("tr-TR")} m</text>`).join("")}
    <circle cx="${x(0)}" cy="${y(277)}" r="6" fill="#ffb547"/><text x="${x(0) + 10}" y="${y(277) - 10}" class="ph-b">Mekke ~277 m</text>
    <circle cx="${x(63)}" cy="${y(1879)}" r="6" fill="#5ad38b"/><text x="${x(63) - 8}" y="${y(1879) - 12}" text-anchor="end" class="ph-b">Taif ~1.880 m</text>
    <text x="${x(46) - 8}" y="${y(1500)}" text-anchor="end">Serat dağları ↗</text>
    <text x="${W / 2}" y="${H - 6}" text-anchor="middle">Kuş uçuşu ~${Math.round(uzaklik(yer("mekke"), yer("taif")))} km (temsilî profil)</text>
  </svg>`;
}

/* ---------- 2. adım: logaritmik sayı grafiği ---------- */
function sayiGrafigi() {
  const W = 640, sat = 26, ust = 26, H = ust + SAYILAR.length * sat + 8, L = 150, R = 74;
  const x = (n) => L + (Math.log10(n) / 10) * (W - L - R);
  const TIK = [[1, "1"], [100, "100"], [1e4, "10 bin"], [1e6, "1 milyon"], [1e8, "100 milyon"], [1e10, "10 milyar"]];
  return `<svg viewBox="0 0 ${W} ${H}" class="ph-grafik" role="img" aria-label="Olaylarda bir arada bulunan Müslüman sayısı, logaritmik ölçek">
    ${TIK.map(([n, t]) => `<line x1="${x(n)}" x2="${x(n)}" y1="${ust - 6}" y2="${H - 4}" class="ph-izgara"/><text x="${x(n)}" y="${ust - 10}" text-anchor="middle">${t}</text>`).join("")}
    ${SAYILAR.map((s, i) => { const yy = ust + i * sat; return `<g data-sayi="${s.id}">
      <text x="${L - 8}" y="${yy + 17}" text-anchor="end" class="${s.id === "taif" ? "ph-b" : ""}">${s.ad} (${s.yil})</text>
      <rect x="${L}" y="${yy + 5}" width="${Math.max(3, x(s.sayi) - L)}" height="${sat - 9}" rx="4" class="${s.id === "taif" ? "ph-cubuk vurgu" : s.id === "bugun" ? "ph-cubuk bugun" : "ph-cubuk"}"/>
      <text x="${x(s.sayi) + 6}" y="${yy + 17}" class="ph-deger">${s.yaklasik ? "~" : ""}${sayiYaz(s.sayi)}</text></g>`; }).join("")}
  </svg>`;
}

/* ---------- çoklu seçim + kontrol ---------- */
function cokluSecim({ kap, baslik, secenekler, bitti }) {
  const kutu = el("div", { class: "ok-kutu" }, el("b", { html: baslik }), el("div", { class: "ph-soluk" }, "Birden fazla seçenek doğru olabilir. Seç, sonra kontrol et."));
  const secili = new Set();
  const liste = el("div", { class: "ph-siklar" });
  const geri = el("div", { class: "d-geri-bildirim" });
  let tamam = false;
  const dugme = {};
  for (const s of karistir(secenekler)) {
    dugme[s.id] = el("button", { class: "ok-kart", "data-secenek": s.id, "aria-pressed": "false", onclick: () => {
      if (tamam) return;
      secili.has(s.id) ? secili.delete(s.id) : secili.add(s.id);
      dugme[s.id].setAttribute("aria-pressed", String(secili.has(s.id)));
      Object.values(dugme).forEach((b) => b.classList.remove("dogru", "yanlis"));
    } }, s.metin);
    liste.append(dugme[s.id]);
  }
  const kontrolBtn = el("button", { class: "d-btn ana", onclick: () => {
    const yanlis = secenekler.filter((s) => secili.has(s.id) && !s.dogru), eksik = secenekler.filter((s) => s.dogru && !secili.has(s.id));
    secenekler.forEach((s) => { if (secili.has(s.id)) dugme[s.id].classList.add(s.dogru ? "dogru" : "yanlis"); });
    if (!yanlis.length && !eksik.length) {
      tamam = true; kontrolBtn.disabled = true;
      geri.className = "d-geri-bildirim dogru"; geri.innerHTML = `✓ ${secenekler.filter((s) => s.dogru).map((s) => s.aciklama).filter(Boolean).join(" ")}`;
      bitti?.();
    } else {
      geri.className = "d-geri-bildirim yanlis";
      geri.innerHTML = yanlis.length ? `✗ ${yanlis[0].aciklama}` : `Eksik var: ${eksik.length} doğru seçenek daha var.`;
    }
  } }, "Kontrol et");
  kutu.append(liste, el("div", { class: "d-satir" }, kontrolBtn), geri);
  kap.append(kutu);
  return kutu;
}

/* ---------- 3. adım: yolculuğun durakları ---------- */
const DURAKLAR = [
  { id: "y1", yer: "mekke", gidis: 0.5, donus: 0, metin: "Mekke'den çıkış", ayrinti: "Hz. Peygamber, Zeyd b. Hârise ile birlikte yaya olarak Taif'e doğru yola çıktı." },
  { id: "y2", yer: "taif", gidis: 1, donus: 0, metin: "Sakif'in liderleriyle görüşme", ayrinti: "Taif'te Sakif'in ileri gelenleri olan üç kardeşle (Abd Yâlîl, Mes'ûd ve Habîb) görüşüp onları İslam'a davet etti; üçü de daveti alaycı sözlerle reddetti." },
  { id: "y3", yer: "taif", gidis: 1, donus: 0, metin: "Taşlanarak şehirden çıkarılma", ayrinti: "Yaklaşık on gün şehirde kalıp insanlarla konuştu. Ayrılırken kışkırtılan kalabalık onu taşladı; ayakları kanadı, onu korumaya çalışan Zeyd başından yaralandı." },
  { id: "y4", yer: "taif", gidis: 1, donus: 0.04, metin: "Bağa sığınma ve dua", ayrinti: "Utbe ve Şeybe'ye ait bir bağa sığındı ve dua etti: Güçsüzlüğünü ve çaresizliğini Allah'a arz etti; Allah ondan razı olduktan sonra çektiklerine aldırmayacağını söyledi (İbn Hişâm, es-Sîre)." },
  { id: "y5", yer: "taif", gidis: 1, donus: 0.06, metin: "Addâs ile karşılaşma", ayrinti: "Bağın sahipleri Hristiyan köleleri Addâs ile üzüm gönderdi. Hz. Peygamber'in Yûnus peygamberden söz etmesi üzerine Addâs onun bir peygamber olduğunu anladı ve elini öptü." },
  { id: "y6", yer: "karn", gidis: 1, donus: 0.38, metin: "Karnü's-seâlib: dağlar meleği", ayrinti: "Cebrâil ve dağlar meleği geldi; melek, isterse iki dağı onların üzerine kapatabileceğini söyledi. Hz. Peygamber, onların soyundan Allah'a ortak koşmadan ibadet edecek nesiller çıkmasını umduğunu söyleyerek kabul etmedi (Buhârî, Bed'ü'l-halk, 7; Müslim, Cihâd, 111)." },
  { id: "y7", yer: "nahle", gidis: 1, donus: 0.7, metin: "Nahle'de konaklama", ayrinti: "Nahle'de birkaç gün kaldı. Siyer kaynaklarına göre burada gece namazında okuduğu Kur'an'ı bir grup cin dinledi (Ahkâf 46/29-32)." },
  { id: "y8", yer: "mekke", gidis: 1, donus: 1, metin: "Himaye ile Mekke'ye dönüş", ayrinti: "Himayesi olmadan Mekke'ye giremeyeceği için Hira'dan haber gönderdi. İki kişi himaye vermeyi reddetti; Mut'im b. Adî'nin himayesiyle şehre girdi." },
];
const GIDIS = [lonlat("mekke"), [40.12, 21.36], lonlat("taif")];
const DONUS = [lonlat("taif"), lonlat("karn"), lonlat("nahle"), lonlat("mekke")];

/* ---------- 6. adım: araştırma kartları ---------- */
const ARASTIRMA = [
  { id: "huneyn", kaynak: "Mekke'nin fethini duyan Hevâzin kabilesinin reisi Mâlik b. Avf, Sakif ile birleşerek büyük bir ordu topladı. İki ordu, Mekke ile Taif arasındaki Huneyn vadisinde karşılaştı.",
    soru: "Huneyn'de Müslümanlara karşı savaşan kabileler hangileridir?", siklar: ["Hevâzin ve Sakif", "Evs ve Hazrec", "Kaynuka ve Nadir oğulları"] },
  { id: "kusatma", kaynak: "Huneyn'de yenilen Sakifliler Taif'e çekildi ve şehrin sağlam surlarının ardına kapandı. Müslümanlar şehri kuşattı; şehir alınamayınca Hz. Peygamber kuşatmayı kaldırdı. Kendisinden Sakif'e beddua etmesi istendiğinde onların hidayeti için dua etti.",
    soru: "Kuşatma kaldırılırken Hz. Peygamber Sakif için ne yaptı?", siklar: ["Hidayetleri için dua etti", "Onlara beddua etti", "Şehre yeniden saldırı emri verdi"] },
  { id: "cirane", kaynak: "Ci'râne'de Huneyn ganimetleri dağıtıldı. Hevâzin heyeti gelip Müslüman olunca esirleri geri verildi. Komutanları Mâlik b. Avf da Müslüman oldu, kabilesinin Müslümanlarına başkan yapıldı ve Sakif'i sıkıştırmaya başladı.",
    soru: "Ci'râne'deki gelişmeler Sakif'i nasıl etkiledi?", siklar: ["Eski müttefikleri Müslüman olunca Taif çevresinde yalnız kaldılar", "Yeni ve güçlü müttefikler buldular", "Hiç etkilenmediler"] },
  { id: "urve", kaynak: "Sakif'in ileri gelenlerinden Urve b. Mes'ûd, Medine yolunda Hz. Peygamber'e yetişip Müslüman oldu. Kavmini davet etmek için Taif'e döndü; davetini duyurunca okla vurularak şehit edildi. Bu olaydan sonra Sakifliler, çevrelerindeki Müslüman Araplarla savaşamayacaklarını anladılar.",
    soru: "Urve b. Mes'ûd'un şehit edilmesinden sonra Sakifliler neyi fark etti?", siklar: ["Çevrelerindeki Müslüman kabilelere karşı koyamayacaklarını", "Lât'ın kendilerini her zaman koruyacağını", "Mekke'ye göç etmeleri gerektiğini"] },
  { id: "heyet", kaynak: "Hicretin 9. yılı, Arap yarımadasının dört bir yanından kabile heyetlerinin Medine'ye geldiği “Heyetler yılı” oldu. Sakif de Abd Yâlîl başkanlığında bir heyet gönderdi. Heyet Medine'de bir süre kalıp İslam'ı öğrendi ve Müslüman oldu.",
    soru: "Sakif heyeti Medine'ye ne zaman geldi?", siklar: ["Hicretin 9. yılında, Heyetler yılında", "Hicretin 1. yılında", "Taif yolculuğu ile aynı yıl"] },
  { id: "lat", kaynak: "Heyet Taif'e dönerken Hz. Peygamber, Muğîre b. Şu'be ile Ebû Süfyân'ı Lât putunu yıkmakla görevlendirdi. Lât yıkıldı ve Taif halkı Müslüman oldu.",
    soru: "Lât putunu kimler yıktı?", siklar: ["Muğîre b. Şu'be ve Ebû Süfyân", "Sakif heyetinin üyeleri", "Urve b. Mes'ûd"] },
];

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Taif: dağların ardındaki şehir",
    cikti: "PH.10.1.1-b",
    anlatim: `
      <p><b>Taif</b>, Hicaz bölgesinde, Mekke'nin yaklaşık 65 km güneydoğusunda, <b>Serat dağları</b> üzerinde kurulmuş bir şehirdir. Mekke'den yaklaşık 1.600 m daha yüksektir; bu yüzden serin ve verimlidir.</p>
      <p>Şehirde <b>Sakif</b> kabilesi yaşıyordu. Mekkeli müşrikler, Kur'an'ın “iki şehrin birinden” büyük bir adama inmesi gerektiğini söylemişti (Zuhruf 43/31). Bu iki şehir, Mekke ve Taif'tir.</p>
      <p>Haritayı ve yükselti profilini incele; sonra Taif hakkındaki bilgileri sınıflandır.</p>`,
    gorev: "On bir bilgiyi <b>coğrafi, sosyal, kültürel ve ekonomik</b> özelliklerine göre sınıflandır.",
    ogretmen: "Program, Taif'in İslam öncesindeki durumunun coğrafi, sosyal, kültürel ve ekonomik açılardan; ayrıca Sakif kabilesi ile Mekkeliler arasındaki sosyal ve ticari ilişkiler bakımından ele alınmasını, konunun coğrafya ile ilişkilendirilmesini ve halkın gelir kaynakları ile refah seviyesine (OB3) değinilmesini öneriyor. Temel kabul: öğrenciler Taif'in Hicaz'daki önemli şehirlerden biri olduğunu bilir.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Hicaz'da Taif" });
      harita({
        kap, veri: hicazVeri, kutu: [38.0, 20.3, 41.4, 24.8], yukseklik: 320, vurgu: ["Saudi Arabia"], temizlik: ctx.temizlik, olcekKm: 100, not: NOT_HARITA,
        noktalar: noktalar(["mekke", "taif", "medine", "cidde", "ukaz"]).map((n) => (n.id === "mekke" ? { ...n, yon: "ust" } : n)),
        denizler: [{ ad: "KIZILDENİZ", lon: 38.35, lat: 22.2, aci: -62 }, { ad: "HİCAZ", lon: 40.6, lat: 23.6 }],
      });
      kap.append(el("div", { class: "ok-kutu", html: profilSvg() }));
      const C = "cografi", S = "sosyal", K = "kulturel", E = "ekonomik";
      siniflandirma({
        kap, deste: 1, sutun: 4,
        kategoriler: [
          { id: C, ad: "Coğrafi", renk: "#4fc3f7" }, { id: S, ad: "Sosyal", renk: "#ffb547" },
          { id: K, ad: "Kültürel", renk: "#b89cff" }, { id: E, ad: "Ekonomik", renk: "#5ad38b" },
        ],
        kartlar: [
          { id: "t1", metin: "Deniz seviyesinden yaklaşık 1.800 m yükseklikte, dağlık bir bölgede kuruluydu.", dogru: C, aciklama: "Yükselti, Taif'in iklimini belirleyen coğrafi bir özelliktir." },
          { id: "t2", metin: "Yazları Mekke'den çok daha serindi; suyu ve verimli toprakları vardı.", dogru: C, aciklama: "İklim ve su kaynakları coğrafi özelliklerdir; tarımı mümkün kılar." },
          { id: "t3", metin: "Bağ ve bahçelerinde üzüm, nar ve çeşitli meyveler yetiştirilirdi.", dogru: E, aciklama: "Tarım, Taif halkının başlıca gelir kaynaklarındandı." },
          { id: "t4", metin: "Deri işlemeciliği (tabaklama) şehrin önemli bir gelir kaynağıydı.", dogru: E, aciklama: "Taif derileri bölgede tanınıyordu." },
          { id: "t5", metin: "Zengin Mekkelilerin Taif'te bağları ve yazlık arazileri vardı; aralarında faizli borç ilişkileri yaygındı.", dogru: E, aciklama: "Mekke ile Taif arasındaki ticari bağlar, iki şehrin çıkarlarını birbirine bağlıyordu." },
          { id: "t6", metin: "Şehirde Sakif kabilesi yaşıyordu; kabile Ahlâf ve Mâlik oğulları kollarına ayrılıyordu.", dogru: S, aciklama: "Toplumsal yapı kabile ve kollar üzerine kuruluydu." },
          { id: "t7", metin: "Sakif ile Kureyş arasında evlilik ve ittifak bağları vardı.", dogru: S, aciklama: "Bu bağlar, Taiflilerin İslam davetine tepkisinde belirleyici olacaktı." },
          { id: "t8", metin: "Mekkeli müşrikler Taif'in ileri gelenlerini o kadar itibarlı görüyordu ki, Kur'an'ın onlardan birine inmesi gerektiğini söylediler (Zuhruf 43/31).", dogru: S, aciklama: "Taif'in önde gelenlerinin toplumdaki itibarını gösterir." },
          { id: "t9", metin: "Sakif'in en önemli putu Lât'tı; şehirde onun için bir tapınak vardı.", dogru: K, aciklama: "Lât, Sakif'in dinî ve kültürel kimliğinin merkezindeydi." },
          { id: "t10", metin: "Yakınlardaki Ukaz panayırında şairler şiirlerini okur, yarışırdı.", dogru: K, aciklama: "Ukaz, Arap şiirinin ve dilinin en önemli buluşma yerlerindendi." },
          { id: "t11", metin: "Ukaz panayırında Arap yarımadasının dört bir yanından gelen tüccarlar alışveriş yapardı.", dogru: E, aciklama: "Panayırlar aynı zamanda büyük ticaret merkezleriydi." },
        ],
        bitti: () => ctx.gorevTamam(),
      });
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Taif'e giden yol: Mekke'de zor yıllar",
    cikti: "PH.10.1.1-a",
    anlatim: `
      <p>Davetin açıkça yapılmaya başlamasıyla Mekkeli müşriklerin Müslümanlara <b>baskısı</b> arttı: alay, işkence, boykot. Bir grup Müslüman Habeşistan'a göç etmek zorunda kaldı.</p>
      <p>Nübüvvetin 10. yılında Hz. Peygamber'i koruyan amcası <b>Ebû Tâlib</b> ve eşi <b>Hz. Hatice</b> vefat etti. Bu yıla <b>Hüzün yılı</b> denir. Hz. Peygamber artık kabilesinin himayesinden yoksundu.</p>
      <p>Önce olayları sırala, sonra grafiği yorumla: Taif yolculuğunda Müslümanlar ne kadar kalabalıktı?</p>`,
    gorev: "Taif yolculuğuna giden olayları <b>sırala</b> ve sayı grafiğini <b>yorumla</b>.",
    ogretmen: "Program, Hz. Peygamber'i Taif yolculuğuna sevk eden sürecin; Mekke'de Müslümanlara yapılan baskıların, müşriklerin daveti engelleme çabalarının ve Hüzün Yılı'nın ayrıntılarıyla işlenmesini (soru turu tekniği), öğrencilerin süreçle ilgili çıkarımlarını grafik bilgi üzerinden değerlendirmelerini ve Müslümanların o dönemdeki nicel durumunun günümüzle karşılaştırılmasını öneriyor. Grafikteki sayılar olaylarda bir arada bulunan kişi sayısıdır; tarihî sayılar yaklaşıktır.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Mekke'de zor yıllar" });
      let sira = false, grafik = false;
      const bak = () => sira && grafik && ctx.gorevTamam();
      const sek = sekmeler(kap, [
        { ad: "1. Olayları sırala", kur: (k) => siralama({
          kap: k, basariMesaji: "Taif yolculuğu, baskı ve kayıplarla dolu yılların ardından geldi.",
          ogeler: ["vahiy", "acikDavet", "habesistan", "boykot", "huzun", "taifYolculugu"].map((id) => ({ id, metin: `<b>${olay(id).ad}</b><small>${olay(id).bilgi}</small>`, ek: tarihYaz(olay(id)) })),
          bitti: () => { sira = true; sek.bitti(0); bak(); },
        }) },
        { ad: "2. Grafiği yorumla", kur: (k) => {
          k.append(el("div", { class: "ok-kutu", html: `${sayiGrafigi()}<div class="ph-soluk">Logaritmik ölçek: her dikey çizgi bir öncekinin 100 katıdır. Tarihî sayılar yaklaşıktır; rivayetler farklıdır.</div>` }));
          const soru = el("div", { class: "ok-kutu" }, el("b", {}, "Grafiğe göre hangisi söylenebilir?"));
          const g = el("div", { class: "d-geri-bildirim" });
          [["Taif yolculuğunda Hz. Peygamber neredeyse yalnızdı; birkaç yıl içinde bir arada bulunan Müslümanların sayısı binlerle ifade edilir oldu.", true, "Doğru! 619'da yanında yalnızca Zeyd vardı; 630'da on binler, bugün yaklaşık iki milyar Müslüman var. Taif'teki ret, davetin sonu olmadı."],
            ["Taif yolculuğundan sonra Müslümanların sayısı azaldı.", false, "Grafikte çubuklar zamanla uzuyor: sayı azalmadı, arttı."],
            ["Taif yolculuğu sırasında Müslümanlar Arap yarımadasının en kalabalık topluluğuydu.", false, "Tam tersine: Taif yolculuğu, Müslümanların az ve himayesiz olduğu bir dönemde yapıldı."]]
            .forEach(([m, d, a]) => soru.append(el("button", { class: "ok-kart", "data-dogru": d ? "1" : null, style: "display:block;width:100%;margin-top:6px", onclick: (e) => {
              e.currentTarget.classList.add(d ? "dogru" : "yanlis"); g.className = `d-geri-bildirim ${d ? "dogru" : "yanlis"}`; g.textContent = a;
              if (d && !grafik) { grafik = true; sek.bitti(1); bak(); }
            } }, m)));
          soru.append(g);
          k.append(soru);
        } },
      ]);
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Yolculuğu adım adım kur",
    cikti: "PH.10.1.1-c",
    anlatim: `
      <p>Hz. Peygamber, nübüvvetin 10. yılında (yaklaşık 619) <b>Zeyd b. Hârise</b> ile birlikte Taif'e gitti. Amacı, Sakif'i İslam'a davet etmek ve davetine destek bulmaktı.</p>
      <p>Yolculuğun sekiz durağını kartlardan <b>sıraya koy</b>. Sonra kaydırıcıyla yolculuğu haritada adım adım izle.</p>
      <p>Not: Yolculuğun süresi ve bazı ayrıntılar rivayetlerde farklıdır; güzergâh <b>temsilîdir</b>.</p>`,
    gorev: "Sekiz durağı doğru sıraya koy ve yolculuğu haritada <b>sonuna kadar</b> izle.",
    ogretmen: "Program, Hz. Peygamber'in Taif'te kaldığı süre içinde yaşadıklarının, Mekke'ye dönüş yolunda çektiği sıkıntıların ve şehre girebilmek için gösterdiği çabanın ayrıntılı incelenmesini; metanetinin (D12.3), affedici tutumunun ve Taif dönüşü yaptığı duanın vurgulanmasını öneriyor. Kaynaklar: İbn Hişâm, es-Sîre (yolculuk ve dua); Buhârî, Bed'ü'l-halk, 7 ve Müslim, Cihâd, 111 (dağlar meleği); Ahkâf 46/29-32 (Nahle).",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Taif yolculuğu" });
      let sira = false, sona = false;
      const bak = () => sira && sona && ctx.gorevTamam();
      const oynatici = el("div", { class: "ph-oynatici", hidden: true });
      siralama({
        kap, basariMesaji: "Yolculuğu kurdun. Şimdi aşağıda haritada izle.",
        ogeler: DURAKLAR.map((d) => ({ id: d.id, metin: d.metin })),
        bitti: () => { sira = true; oynatici.hidden = false; h.yenile(); goster(); oynatici.scrollIntoView?.({ behavior: "smooth", block: "nearest" }); bak(); },
      });
      kap.append(oynatici);
      const h = harita({
        kap: oynatici, veri: hicazVeri, kutu: [39.65, 21.12, 40.72, 21.78], yukseklik: 280, vurgu: ["Saudi Arabia"], temizlik: ctx.temizlik, olcekKm: 20,
        not: "Güzergâh temsilîdir · Nahle ve Karnü's-seâlib'in yeri yaklaşıktır", noktalar: noktalar(["mekke", "taif", "nahle", "karn"]),
      });
      const R = el("input", { type: "range", min: 0, max: DURAKLAR.length - 1, step: 1, value: 0, "aria-label": "Yolculuğun durağı" });
      const out = el("output");
      const kart = el("div", { class: "ok-kutu ph-durak" });
      oynatici.append(el("div", { class: "d-kaydirici" }, el("label", {}, "Yolculuğun durağı"), out, R), kart);
      function goster() {
        const i = +R.value, d = DURAKLAR[i];
        out.textContent = `${i + 1}/${DURAKLAR.length}`;
        h.cizgileriTemizle();
        h.cizgiEkle({ noktalar: GIDIS, renk: "#ffb547", ilerleme: d.gidis });
        if (d.donus) h.cizgiEkle({ noktalar: DONUS, renk: "#b89cff", kesikli: true, ilerleme: d.donus });
        h.sec(d.yer);
        kart.innerHTML = `<b>${i + 1}. ${d.metin}</b> <span class="ph-soluk">· ${yer(d.yer).ad}</span><br>${d.ayrinti}`;
        if (i === DURAKLAR.length - 1 && !sona) { sona = true; kart.innerHTML += `<br><b class="ph-yesil">✓ Yolculuk tamamlandı. Hz. Peygamber Mekke'ye döndükten sonra davetine devam etti.</b>`; bak(); }
      }
      R.addEventListener("input", goster);
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Taifliler neden reddetti?",
    cikti: "PH.10.1.1-b",
    anlatim: `
      <p>Bir olayı anlamak için onu <b>kendi döneminin şartları içinde</b> düşünmek gerekir. Buna tarihsel bağlamsallaştırma denir.</p>
      <p>Tarihî kaynaklardaki kanıtlara göre Taifliler daveti yalnızca tek bir nedenle reddetmedi. <b>Dinî, siyasi, toplumsal ve ekonomik</b> nedenler iç içeydi.</p>
      <p>Genelleme: <b>Taiflilerin Mekkeli müşriklerle kurduğu siyasi ve ticari ilişkiler, İslam'a karşı çıkışlarında belirleyici oldu.</b></p>`,
    gorev: "Kanıtları nedenlere göre sınıflandır; sonra açıklamaların hangisinin <b>dönemin şartlarına uygun</b>, hangisinin <b>bugünün gözüyle</b> yapıldığını ayırt et.",
    ogretmen: "Program, Taiflilerin İslam davetine tepkilerinin tarihî kaynaklarda geçen kanıtlara göre analiz edilmesini, dönemin şartlarının fark edilmesini ve tepkilerin dinî, siyasi, toplumsal ve ekonomik sebepleri hakkında çıkarım yapılmasını (Sokrat semineri tekniği) öneriyor. İkinci sekme anakronizm (bugünün kavramlarıyla geçmişi yargılama) hatasını fark ettirmeyi amaçlar. Makale veya rapor yazma görevi verilebilir.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Kanıtlardan nedenlere" });
      let neden = false, baglam = false;
      const bak = () => neden && baglam && ctx.gorevTamam();
      const D = "dini", S = "siyasi", T = "toplumsal", E = "ekonomik";
      const sek = sekmeler(kap, [
        { ad: "1. Nedenleri sınıflandır", kur: (k) => siniflandirma({
          kap: k, deste: 1, sutun: 4,
          kategoriler: [{ id: D, ad: "Dinî", renk: "#b89cff" }, { id: S, ad: "Siyasi", renk: "#4fc3f7" }, { id: T, ad: "Toplumsal", renk: "#ffb547" }, { id: E, ad: "Ekonomik", renk: "#5ad38b" }],
          kartlar: [
            { id: "n1", metin: "Sakif, Lât putunu şehrin koruyucusu sayıyordu.", dogru: D, aciklama: "Putperest inanç, tevhit davetine karşı çıkışın dinî nedeniydi." },
            { id: "n2", metin: "Atalarından gelen dini bırakmayı kabul etmediler.", dogru: D, aciklama: "Atalar dinine bağlılık, Kur'an'da müşriklerin sık dile getirdiği bir gerekçedir." },
            { id: "n3", metin: "Sakif'in Kureyş ile ittifakı vardı; Hz. Peygamber'i desteklemek Kureyş'i karşılarına almak demekti.", dogru: S, aciklama: "Güçlü müttefiklerini kaybetmek istemediler." },
            { id: "n4", metin: "Hz. Peygamber görüşmenin gizli kalmasını istedi; onlar ise bunu kabul etmedi ve haberin Mekke'ye ulaşmasından çekinmediler.", dogru: S, aciklama: "Taif'in ileri gelenleri tavırlarını Kureyş ile ilişkilerine göre belirledi." },
            { id: "n5", metin: "Liderler, kabile içindeki itibarlarını ve üstünlüklerini kaybetmekten çekindiler.", dogru: T, aciklama: "İslam'ın eşitlik çağrısı, kabile hiyerarşisini sarsıyordu." },
            { id: "n6", metin: "Şehrin ayak takımı ve köleler kışkırtılarak Hz. Peygamber'in üzerine salındı.", dogru: T, aciklama: "Liderler, toplumun alt kesimlerini kendi amaçları için kullandı." },
            { id: "n7", metin: "Mekke ile ticaretleri ve Mekkelilerin Taif'teki bağ-bahçe yatırımları ortak çıkarlarıydı.", dogru: E, aciklama: "Ticari bağlar bozulursa refahları tehlikeye girecekti." },
            { id: "n8", metin: "İslam'ın yasakladığı faizli borç ilişkileri Sakif'in gelir kaynakları arasındaydı.", dogru: E, aciklama: "Faiz yasağı, Sakif'in ekonomik çıkarlarıyla çatışıyordu." },
            { id: "n9", metin: "Lât tapınağını ziyarete gelenler şehre gelir ve saygınlık getiriyordu.", dogru: [E, D], aciklama: "Bu kanıt hem dinî hem ekonomiktir: tapınak, inancın ve gelirin merkeziydi." },
          ],
          bitti: () => { neden = true; sek.bitti(0); bak(); },
        }) },
        { ad: "2. Dönemin gözüyle bak", kur: (k) => siniflandirma({
          kap: k, kip: "serbest", sutun: 2,
          kategoriler: [{ id: "uygun", ad: "Dönemin şartlarına uygun", renk: "#5ad38b" }, { id: "anakronik", ad: "Bugünün gözüyle (anakronik)", renk: "#ff6b6b" }],
          kartlar: [
            { id: "a1", metin: "Kabile, bireyin can ve mal güvenliğinin tek güvencesiydi; kabileye ters düşmek büyük risk demekti.", dogru: "uygun", ipucu: "O dönemde devlet ya da polis yoktu; insanı kim koruyordu?" },
            { id: "a2", metin: "Putlar kabilenin kimliğiyle iç içeydi; dini değiştirmek toplumsal düzeni değiştirmek demekti.", dogru: "uygun", ipucu: "Bu açıklama dönemin toplum yapısını dikkate alıyor mu?" },
            { id: "a3", metin: "Taifliler, Kureyş'le ittifakları bozulursa kervan ticaretinin tehlikeye gireceğini düşünmüş olabilir.", dogru: "uygun", ipucu: "Kervan ticareti o dönemin temel geçim yollarından biriydi." },
            { id: "a4", metin: "Taifliler daveti, sosyal medyada yeterince bilgi bulamadıkları için reddetti.", dogru: "anakronik", yanlis: { uygun: "7. yüzyılda sosyal medya yoktu: bu, bugünün araçlarıyla geçmişi açıklamaktır." } },
            { id: "a5", metin: "Taif devletinin başkanı, ülkesinin dış politikası gereği daveti reddetti.", dogru: "anakronik", yanlis: { uygun: "Taif bir devlet değil, kabile yapısına sahip bir şehirdi; “devlet başkanı” ve “dış politika” bugünün kavramlarıdır." } },
            { id: "a6", metin: "Her Taifli, yeni dini kabul edip etmemeye toplumdan bağımsız, tamamen kişisel olarak karar verebilirdi.", dogru: "anakronik", yanlis: { uygun: "Bireyin kabilesinden bağımsız karar vermesi o dönemde çok zordu; bu, bugünün bireyci bakışıdır." } },
          ],
          bitti: () => { baglam = true; sek.bitti(1); bak(); },
        }) },
      ]);
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Metanet ve af: empatiyle yorumla",
    cikti: "PH.10.1.1-a",
    anlatim: `
      <p><b>Tarihsel empati</b>, geçmişteki bir insanın yaşadıklarını onun yerine koyarak ve kendi dönemi içinde anlamaya çalışmaktır.</p>
      <p>Taif dönüşünde Hz. Peygamber yaralı, yorgun ve himayesizdi. Dağlar meleği ona, isterse iki dağın onların üzerine kapanacağını söyledi. O ise “Onların soyundan yalnız Allah'a ibadet eden nesiller çıkmasını umarım.” diyerek bunu kabul etmedi (Buhârî, Bed'ü'l-halk, 7; Müslim, Cihâd, 111).</p>
      <p>Bu adımda Hz. Peygamber'in yolculuğunu ve tepkisini <b>yorumla</b>.</p>`,
    gorev: "Yolculuğun nedenlerini ve Hz. Peygamber'in tepkisinin nedenlerini doğru seç; sonra <b>öğrenme günlüğünü</b> yaz.",
    ogretmen: "Program, öğrencilerin empati kurarak (E2.1) Hz. Peygamber'in niçin böyle bir tepkide bulunduğunu tespit etmelerini ve zorluklar karşısında insanın nasıl bir tutum sergilemesi gerektiği (SDB1.1) konusunda duygu ve düşüncelerini değerlendirerek fikirlerini söylemelerini (SDB1.3); Taif yolculuğu sürecine dair çıkarımlarını öğrenme günlüğüne yazmalarını öneriyor. “Sen olsan ne hissederdin?” sorusunun doğru cevabı yoktur.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Onun yerinde olsaydın…" });
      let nedenler = false, tepki = false, yazi = false;
      const bak = () => nedenler && tepki && yazi && ctx.gorevTamam();
      cokluSecim({
        kap, baslik: "1. Hz. Peygamber neden Taif'e gitmiş olabilir?",
        secenekler: [
          { id: "himaye", metin: "Ebû Tâlib'in vefatıyla Mekke'de himayesiz kalmıştı.", dogru: true, aciklama: "Himayesini kaybetmesi davetini Mekke'de zorlaştırmıştı." },
          { id: "destek", metin: "Güçlü Sakif kabilesinden davetine destek ve koruma bulmayı umuyordu.", dogru: true, aciklama: "Sakif'in desteği davete yeni bir güç kazandırabilirdi." },
          { id: "yeni", metin: "İslam'ı Mekke dışındaki insanlara da ulaştırmak istiyordu.", dogru: true, aciklama: "Davet yalnız Mekkelilere değil, bütün insanlara yönelikti." },
          { id: "yakin", metin: "Taif, Mekke'ye yakın, zengin ve etkili bir şehirdi.", dogru: true },
          { id: "ticaret", metin: "Taif'te ticaret yapıp zenginleşmek istiyordu.", dogru: false, aciklama: "Kaynaklar yolculuğun amacının davet olduğunu bildirir; ticari bir amaç aktarılmaz." },
          { id: "fetih", metin: "Taif'i savaşla ele geçirmek istiyordu.", dogru: false, aciklama: "Hz. Peygamber yanında yalnızca Zeyd ile gitti; amacı savaş değil davetti." },
        ],
        bitti: () => { nedenler = true; ikinci.hidden = false; bak(); },
      });
      const ikinci = el("div", { class: "ok-kutu", hidden: true });
      ikinci.append(el("b", {}, "2. Taşlanmış, yaralı ve himayesiz biri olarak dağlar meleğinin teklifini duysaydın ne hissederdin?"));
      const his = el("div", { class: "d-satir" });
      const yanit = el("div", { hidden: true, class: "ph-yanit" });
      ["Öfke", "Kırgınlık", "Çaresizlik", "Hayal kırıklığı", "İntikam isteği", "Sabır"].forEach((h) => his.append(el("button", { class: "d-btn kucuk", "data-his": h, onclick: (e) => {
        his.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
        yanit.hidden = false; ucuncu.hidden = false;
        yanit.innerHTML = `<p>“${h}” hissetmek çok insani olurdu. <b>Hz. Peygamber ise</b> teklifi kabul etmedi; onların soyundan Allah'a ibadet edecek nesiller çıkmasını umduğunu söyledi. Dönüş yolunda yaptığı duada da kendi güçsüzlüğünü Allah'a arz etti, ama kimseye beddua etmedi (İbn Hişâm, es-Sîre).</p>`;
      } }, h)));
      ikinci.append(his, yanit);
      kap.append(ikinci);
      const ucuncu = el("div", { hidden: true });
      kap.append(ucuncu);
      cokluSecim({
        kap: ucuncu, baslik: "3. Hz. Peygamber neden böyle bir tepki gösterdi?",
        secenekler: [
          { id: "merhamet", metin: "İnsanlara merhametle bakıyordu; amacı onları cezalandırmak değil, doğruya ulaştırmaktı.", dogru: true, aciklama: "Merhamet ve af, onun ahlakının temelidir." },
          { id: "umut", metin: "Bugün reddedenlerin soyundan iman edecek nesiller çıkacağını umuyordu.", dogru: true, aciklama: "Nitekim on bir yıl sonra Sakif Müslüman oldu." },
          { id: "metanet", metin: "Zorluklar karşısında sabredip davetine devam etmeyi seçti.", dogru: true, aciklama: "Metanet: zorluk karşısında yılmadan doğru bildiği yolda kararlı durmak." },
          { id: "korku", metin: "Taiflilerden korktuğu için.", dogru: false, aciklama: "Taşlanmayı göze alıp davetine devam etmesi korkuyla açıklanamaz." },
          { id: "onemsiz", metin: "Yaşadıklarını önemsemediği için.", dogru: false, aciklama: "Yaşadıkları ona çok ağır gelmişti; duasında bunu Allah'a arz etti. Buna rağmen affetmeyi seçti." },
        ],
        bitti: () => { tepki = true; bak(); },
      });
      ctx.yaziAlani({ etiket: "Öğrenme günlüğü: Taif yolculuğundan zorluklar karşısındaki tutum hakkında ne öğrendin? Kendi hayatından bir örnekle yaz.", anahtar: "ph-gunluk", enAz: 80, yeterli: () => { yazi = true; bak(); } });
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Taif'ten Huneyn'e: araştır",
    cikti: "PH.10.1.2-a",
    anlatim: `
      <p>Taif yolculuğundan sonra Müslümanlarla Taifliler arasındaki ilişkiler yaklaşık on bir yıl sürecek bir süreç başlattı. Sakif, bu süreçte de Mekkeli müşriklerle iş birliği yaptı.</p>
      <p>Zaman çizelgesinde Mekke ve Medine dönemlerinin ana olayları var; <b>Taif ve Sakif</b> şeridinde ise yalnızca yolculuk görünüyor. Kaynak notlarını okuyup soruları cevapla; her doğru cevap bir olayı çizelgeye ekler.</p>
      <p>Çizelgedeki olaylara dokunarak ayrıntılarını da okuyabilirsin.</p>`,
    gorev: "Altı kaynak notunu araştırıp soruları cevapla ve <b>Taif ve Sakif</b> şeridini tamamla.",
    ogretmen: "Program, Taiflilerle Müslümanlar arasında Taif yolculuğu ile başlayan ilişkilerin kronolojik olarak ele alınmasını; Taiflilerin Mekkeli müşriklerle iş birliğinin, Huneyn Gazvesi'nin, Taif'in muhasarasının, Heyetler Yılı'nın ve Taiflilerin İslam'ı kabulünün aralarında ilişki kurularak işlenmesini öneriyor. Kaynak notları siyer kaynaklarının (İbn Hişâm, es-Sîre; Vâkıdî, el-Meğâzî) kısa ve sade bir özetidir. Kuşatmanın süresi rivayetlerde 10–40 gün arasında değişir.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Taif'in İslamlaşma süreci" });
      const GIZLI = ARASTIRMA.map((a) => a.id);
      const olaylar = OLAYLAR.map((o) => ({ id: o.id, serit: o.serit, ad: o.ad, yaklasik: o.yaklasik, bas: olayYili(o), bit: o.miladiBit ? miladiOndalik(o.miladiBit) : undefined, gizli: GIZLI.includes(o.id) }));
      const bilgi = el("div", { class: "ok-kutu ph-bilgi" }, el("span", { class: "ph-soluk" }, "Çizelgedeki bir olaya dokun."));
      const zc = zamanCizelgesi({
        kap, seritler: SERITLER, olaylar, min: 609, max: 633, temizlik: ctx.temizlik, satir: 20,
        secildi: (o) => { const v = olay(o.id); bilgi.innerHTML = `<b>${v.ad}</b> <span class="ph-soluk">· ${tarihYaz(v)}</span><br>${v.bilgi}`; },
      });
      const donem = el("div", { class: "ok-sekmeler" });
      [["Tümü", 609, 633], ["Mekke dönemi", 609, 623], ["629–632", 629.5, 631.5]].forEach(([ad, a, b], i) => donem.append(el("button", { class: "d-btn kucuk", "data-donem": i, "aria-pressed": String(i === 0), onclick: (e) => {
        donem.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === e.currentTarget)));
        zc.aralik(a, b);
      } }, ad)));
      kap.append(donem, bilgi);
      let n = 0;
      const arastir = el("div", { class: "ok-kutu ph-arastir" });
      kap.append(arastir);
      function goster() {
        if (n >= ARASTIRMA.length) {
          arastir.innerHTML = `<b class="ph-yesil">✓ Şerit tamamlandı.</b> Taif yolculuğundan Lât'ın yıkılmasına kadar geçen süre: yaklaşık ${Math.floor(olayYili(olay("lat")) - olayYili(olay("taifYolculugu")))} yıl. “629–632” düğmesiyle son yılları yakından incele.`;
          ctx.gorevTamam(); return;
        }
        const a = ARASTIRMA[n];
        const g = el("div", { class: "d-geri-bildirim" });
        arastir.replaceChildren(el("div", { class: "d-satir", style: "justify-content:space-between" }, el("b", {}, `Kaynak notu ${n + 1}/${ARASTIRMA.length}`), el("span", { class: "ph-soluk" }, "siyer kaynaklarından özet")),
          el("p", { class: "ph-kaynak" }, a.kaynak), el("b", {}, a.soru),
          el("div", { class: "ph-siklar" }, karistir(a.siklar.map((m, i) => [m, i === 0])).map(([m, d]) => el("button", { class: "ok-kart", "data-dogru": d ? "1" : null, onclick: (e) => {
            if (!d) { e.currentTarget.classList.add("yanlis"); g.className = "d-geri-bildirim yanlis"; g.textContent = "Kaynak notunu yeniden oku; cevap metinde."; return; }
            e.currentTarget.classList.add("dogru");
            zc.goster(a.id); zc.sec(a.id);
            n++; setTimeout(goster, 450);
          } }, m))), g);
      }
      goster();
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Olaylar arasında ilişki kur",
    cikti: "PH.10.1.2-b",
    anlatim: `
      <p>Tarihî olaylar birbirinin <b>nedeni ve sonucu</b> olabilir. Taif'in İslamlaşması tek bir olayla değil, birbirine bağlı gelişmelerle gerçekleşti.</p>
      <p>Kavram haritasında her bağ için önce <b>neden</b> olan olaya, sonra onun <b>sonucuna</b> dokun. Sekiz bağın hepsini kur.</p>`,
    gorev: "Taif'in İslamlaşma sürecindeki <b>sekiz neden-sonuç bağını</b> kur.",
    ogretmen: "Program, Taiflilerle Müslümanların ilişkileri ele alınırken kavram haritası tekniğinin kullanılmasını ve öğrencilerin bu süreçteki gelişmeleri sistematik bir şekilde ele alarak (E3.7) Taiflilerin İslam'ı kabul etme serüveni hakkındaki düşüncelerini ifade etmelerini öneriyor. Haritayı tamamladıktan sonra öğrencilerden haritaya kendi bulguları olan yeni bir bağ eklemelerini isteyebilirsiniz.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Taif'in İslamlaşması: kavram haritası" });
      iliskiAgi({
        kap, yukseklik: 470, temizlik: ctx.temizlik,
        dugumler: [
          { id: "ittifak", metin: "Sakif–Kureyş ittifakı", x: 15, y: 10 },
          { id: "red", metin: "Davetin reddi (619)", x: 15, y: 34 },
          { id: "fetih", metin: "Mekke'nin fethi", x: 15, y: 86 },
          { id: "huneyn", metin: "Huneyn", x: 38, y: 74 },
          { id: "kusatma", metin: "Taif kuşatması", x: 38, y: 52 },
          { id: "cirane", metin: "Ci'râne (Mâlik b. Avf)", x: 66, y: 88 },
          { id: "yalniz", metin: "Sakif yalnız kalır", x: 66, y: 60 },
          { id: "urve", metin: "Urve'nin şehadeti", x: 52, y: 12 },
          { id: "heyet", metin: "Sakif heyeti", x: 86, y: 32 },
          { id: "lat", metin: "Lât yıkılır", x: 86, y: 74 },
        ],
        baglar: [
          { kaynak: "ittifak", hedef: "red", etiket: "belirleyici", aciklama: "Kureyş ile siyasi ve ticari ilişkiler, Taiflilerin daveti reddetmesinde belirleyici oldu." },
          { kaynak: "fetih", hedef: "huneyn", etiket: "endişe", aciklama: "Mekke'nin fethinden sonra sıranın kendilerine geleceğinden endişelenen Hevâzin ve Sakif ordu topladı." },
          { kaynak: "huneyn", hedef: "kusatma", etiket: "çekilme", aciklama: "Huneyn'de yenilen Sakifliler Taif surlarına kapandı; Müslümanlar şehri kuşattı." },
          { kaynak: "huneyn", hedef: "cirane", etiket: "ganimet, esirler", aciklama: "Huneyn'in ganimetleri ve esirleri Ci'râne'de toplandı; esirler iade edilince Hevâzin ve Mâlik b. Avf Müslüman oldu." },
          { kaynak: "cirane", hedef: "yalniz", etiket: "baskı", aciklama: "Eski müttefikleri Müslüman olunca Sakif yalnız kaldı; Mâlik b. Avf Taif çevresinde onları sıkıştırdı." },
          { kaynak: "urve", hedef: "heyet", etiket: "fark ettirdi", aciklama: "Urve'nin şehit edilmesinden sonra Sakifliler çevredeki Müslüman Araplarla savaşamayacaklarını anladı." },
          { kaynak: "yalniz", hedef: "heyet", etiket: "zorunlu kıldı", aciklama: "Yalnız kalan Sakif, Heyetler yılında Medine'ye heyet gönderdi." },
          { kaynak: "heyet", hedef: "lat", etiket: "sonuç", aciklama: "Heyet Müslüman oldu; Lât yıkıldı ve Taif halkı İslam'ı kabul etti." },
        ],
        tersMesaj: "Bağ var ama yönü ters. Hangisi önce oldu ve diğerine yol açtı?",
        bitti: () => ctx.gorevTamam(),
      });
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Sakif heyeti Medine'de",
    cikti: "PH.10.1.2-b",
    anlatim: `
      <p>Hicretin 9. yılında (yaklaşık 630 sonu) Medine'ye gelen Sakif heyetine Hz. Peygamber'in, onları Mescid'in yanında kurulan bir çadırda ağırladığı aktarılır. Heyet İslam'ı kabul etmeden önce bazı <b>taleplerde</b> bulundu.</p>
      <p>İlginç bir bağlantı: Siyer kaynaklarına göre heyetin başkanı <b>Abd Yâlîl</b>, on bir yıl önce Taif'te daveti reddeden liderlerden biriydi.</p>
      <p>Taleplerin hangisinin kabul edildiğini, hangisinin reddedildiğini tahmin et.</p>`,
    gorev: "Dört talebi <b>kabul / ret</b> olarak sınıflandır ve heyetin imamının neden seçildiğini bul.",
    ogretmen: "Kaynaklar: İbn Hişâm, es-Sîre (heyetin talepleri); Ebû Dâvûd, Harâc, 26 (namazdan muafiyet talebinin reddi: “Rükûsu olmayan dinde hayır yoktur.”); Müslim, Salât, 186 (Osman b. Ebi'l-Âs'a imamlık ve namazı hafif kıldırma tavsiyesi). Tartışma sorusu: Hz. Peygamber hangi konularda esneklik gösterdi, hangilerinde göstermedi? Bu ayrım neyi anlatır?",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Heyetin talepleri" });
      let sinif = false, imam = false;
      const bak = () => sinif && imam && ctx.gorevTamam();
      siniflandirma({
        kap, kip: "serbest", sutun: 2,
        kategoriler: [{ id: "kabul", ad: "Kabul edildi", renk: "#5ad38b" }, { id: "red", ad: "Reddedildi", renk: "#ff6b6b" }],
        kartlar: [
          { id: "k1", metin: "Lât'ın birkaç yıl daha yıkılmadan bırakılması", dogru: "red", ipucu: "Tevhit inancında putlar için süre tanınabilir mi?" },
          { id: "k2", metin: "Namaz kılmaktan muaf tutulmaları", dogru: "red", ipucu: "Namaz, dinin temel ibadetlerindendir." },
          { id: "k3", metin: "Putlarını kendi elleriyle kırmamaları", dogru: "kabul", ipucu: "Bu talep, inanç esaslarından birinden vazgeçmek anlamına geliyor mu?" },
          { id: "k4", metin: "Faiz, içki ve zinanın kendilerine serbest bırakılması", dogru: "red", ipucu: "Bunlar İslam'ın açık yasaklarıdır." },
        ],
        kontrolSonrasi: ({ yanlis }) => { if (!yanlis) aciklama.hidden = false; },
        bitti: () => { sinif = true; bak(); },
      });
      const aciklama = el("div", { class: "ok-kutu", hidden: true, html: `<b>Neden?</b> Hz. Peygamber inanç ve ibadetin özüyle ilgili taleplerde (Lât'ın korunması, namazdan muafiyet, açık yasaklar) esneklik göstermedi. Putların Sakifliler yerine başkalarınca kırılmasını ise kabul etti: Muğîre b. Şu'be ile Ebû Süfyân bu işle görevlendirildi.` });
      kap.append(aciklama);
      const soru = el("div", { class: "ok-kutu" }, el("b", {}, "Hz. Peygamber, Sakif'e imam olarak heyetin en genç üyesi Osman b. Ebi'l-Âs'ı atadı. Neden onu seçmiş olabilir?"));
      const g = el("div", { class: "d-geri-bildirim" });
      soru.append(el("div", { class: "ph-siklar" }, karistir([
        ["Kur'an'ı ve dini öğrenmeye heyetin en istekli üyesi olduğu için", true, "Doğru. Osman b. Ebi'l-Âs, heyet Medine'deyken boş vakitlerinde Kur'an öğrenmeye çalışırdı. Hz. Peygamber ona namazı cemaate ağır gelmeyecek şekilde kıldırmasını tavsiye etti (Müslim, Salât, 186)."],
        ["Kabilenin en zengini olduğu için", false, "Kaynaklar seçimde servetin değil, öğrenme isteğinin belirleyici olduğunu bildirir."],
        ["Kabilenin en yaşlısı olduğu için", false, "Tam tersine, heyetin en genci oydu."],
      ]).map(([m, d, a]) => el("button", { class: "ok-kart", "data-dogru": d ? "1" : null, onclick: (e) => {
        e.currentTarget.classList.add(d ? "dogru" : "yanlis"); g.className = `d-geri-bildirim ${d ? "dogru" : "yanlis"}`; g.textContent = a;
        if (d) { imam = true; bak(); }
      } }, m))), g);
      kap.append(soru);
    },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Sentez: Taif'in İslamlaşma serüveni",
    cikti: "PH.10.1.2-c",
    anlatim: `
      <p>Şimdi öğrendiklerini birleştirerek <b>özgün bir bütün</b> oluştur.</p>
      <p><b>1.</b> Taif'in İslamlaşma sürecini gösteren <b>olay çizelgesini</b> kronolojik sıraya koy.</p>
      <p><b>2.</b> Bir gazetenin tarih sayfası için kısa bir <b>köşe yazısı</b> yaz: Bir şehir, on bir yılda daveti reddetmekten kabul etmeye nasıl geldi? En az üç olaya ve aralarındaki ilişkiye değin.</p>`,
    gorev: "Olay çizelgesini sırala ve en az <b>üç olayı</b> ilişkilendiren bir köşe yazısı yaz (en az 200 karakter).",
    ogretmen: "Program, öğrencilerden Taiflilerin İslam'ı kabul etme serüveni konusundaki düşüncelerini bir köşe yazısıyla ifade etmelerini ve performans görevi olarak süreci kronolojik şekilde sıralayan bir olay çizelgesi hazırlamalarını öneriyor. Değerlendirme: veri toplama, ilişki kurma ve özgünlük ölçütleri bulunan analitik dereceli puanlama anahtarı. Ekrandaki denetim listesi öğrencinin öz değerlendirmesine yardım eder.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Olay çizelgesi ve köşe yazısı" });
      let sira = false, yazi = false;
      const bak = () => sira && yazi && ctx.gorevTamam();
      siralama({
        kap, basariMesaji: "Olay çizelgesi tamam: yaklaşık on bir yıllık bir süreç.",
        ogeler: ["taifYolculugu", "hicret", "fetih", "huneyn", "kusatma", "urve", "heyet", "lat"].map((id) => ({ id, metin: olay(id).ad, ek: tarihYaz(olay(id)) })),
        bitti: () => { sira = true; bak(); },
      });
      const UNSUR = [
        ["Taif yolculuğu", /taif yolculu|yolculu/], ["Huneyn", /huneyn/], ["Kuşatma", /kuşat|muhasara/], ["Ci'râne / Mâlik b. Avf", /ci.?r[aâ]ne|m[aâ]lik/],
        ["Urve b. Mes'ûd", /urve/], ["Sakif heyeti", /heyet/], ["Lât'ın yıkılması", /l[aâ]t/],
      ];
      const liste = el("div", { class: "ph-unsurlar" });
      const kutu = ctx.yaziAlani({ etiket: "Köşe yazın: “Bir şehrin on bir yılı: Taif”", anahtar: "ph-kose-yazisi", enAz: 200, yeterli: () => denetle() });
      const ozdeg = el("div", { class: "ph-ozdeg" }, el("b", {}, "Öz değerlendirme"),
        ...["Olayları doğru sırayla anlattım.", "Olaylar arasında neden-sonuç ilişkisi kurdum.", "Kendi yorumumu ve başlığımı ekledim."].map((m) => el("label", {}, el("input", { type: "checkbox" }), ` ${m}`)));
      kutu.append(el("div", { class: "ph-soluk" }, "Yazında geçen olaylar:"), liste, ozdeg);
      const t = kutu.querySelector("textarea");
      function denetle() {
        const v = t.value.toLocaleLowerCase("tr");
        const bulunan = UNSUR.filter(([, r]) => r.test(v));
        liste.replaceChildren(...UNSUR.map(([ad, r]) => el("span", { class: `ph-unsur${r.test(v) ? " var" : ""}` }, `${r.test(v) ? "✓" : "○"} ${ad}`)));
        if (bulunan.length >= 3 && t.value.trim().length >= 200 && !yazi) { yazi = true; bak(); }
      }
      t.addEventListener("input", denetle);
      denetle();
    },
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Değerlendirme",
    cikti: "PH.10.1",
    anlatim: `
      <p>On soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>7 doğru</b> yaparsan dersi tamamlamış olursun.</p>`,
    gorev: "Değerlendirmede en az <b>7/10</b> doğru yap.",
    ogretmen: "Sorular programdaki kısa cevaplı soru önerisiyle uyumludur. Köşe yazısı ve öğrenme günlüğü bütüncül dereceli puanlama anahtarıyla; olay çizelgesi analitik dereceli puanlama anahtarıyla değerlendirilebilir.",
    kur(ctx) {
      ctx.sinav([
        { tur: "coktan", metin: "Taif'in iklimi Mekke'ye göre daha serindir. Bunun temel nedeni nedir?",
          siklar: ["Denize daha yakın olması", "Yüksek, dağlık bir bölgede (yaklaşık 1.800 m) kurulmuş olması", "Çölün ortasında olması", "Ekvatora daha yakın olması"],
          dogru: 1, aciklama: "Taif Serat dağları üzerindedir; Mekke'den yaklaşık 1.600 m yüksektir." },
        { tur: "coktan", metin: "Hangisi Taif yolculuğuna <b>zemin hazırlayan</b> gelişmelerden biridir?",
          siklar: ["Mekke'nin fethi", "Ebû Tâlib'in vefatıyla himayenin kaybedilmesi", "Bedir zaferi", "Hudeybiye Antlaşması"],
          dogru: 1, aciklama: "Hüzün yılında Ebû Tâlib'in vefatı, Hz. Peygamber'i Mekke'de himayesiz bıraktı. Diğerleri Taif yolculuğundan sonradır." },
        { tur: "coktan", metin: "Taif yolculuğunda Hz. Peygamber'e kim eşlik etti?",
          siklar: ["Hz. Ebû Bekir", "Hz. Ali", "Zeyd b. Hârise", "Hz. Ömer"],
          dogru: 2, aciklama: "Zeyd b. Hârise, taşlanma sırasında Hz. Peygamber'i korumaya çalışırken yaralandı." },
        { tur: "coktan", metin: "Taiflilerin İslam'a karşı çıkışında <b>belirleyici</b> olan hangisidir?",
          siklar: ["Mekkeli müşriklerle kurdukları siyasi ve ticari ilişkiler", "Medine ile savaş hâlinde olmaları", "Bizans'a bağlı olmaları", "Şehirlerinin çok uzak olması"],
          dogru: 0, aciklama: "Ünitenin genellemesi: Sakif'in Kureyş ile ittifakı ve ticari bağları, daveti reddetmelerinde belirleyici oldu." },
        { tur: "coktan", metin: "Hz. Peygamber'in dağlar meleğinin teklifini kabul etmemesi neyi gösterir?",
          siklar: ["İntikam duygusunu", "Merhametini ve insanların hidayetine dair umudunu", "Kararsızlığını", "Taiflileri önemsemediğini"],
          dogru: 1, aciklama: "“Onların soyundan Allah'a ibadet eden nesiller çıkmasını umarım.” (Buhârî, Bed'ü'l-halk, 7; Müslim, Cihâd, 111)" },
        { tur: "coktan", metin: "Hangisi Taiflilerin tutumunu <b>dönemin şartları içinde</b> açıklayan bir ifadedir?",
          siklar: ["Taifliler daveti internetteki haberler yüzünden reddetti.", "Kabileye ters düşmek, can ve mal güvencesini kaybetmek demekti.", "Taif devletinin anayasası yeni bir dine izin vermiyordu.", "Taifliler toplumdan bağımsız, kişisel bir tercih yaptı."],
          dogru: 1, aciklama: "Diğer seçenekler bugünün kavramlarıyla (internet, devlet, anayasa, bireycilik) geçmişi açıklıyor: anakronizm." },
        { tur: "coktan", metin: "Huneyn Gazvesi hangi olaydan <b>hemen sonra</b> yapıldı?",
          siklar: ["Hicret", "Bedir", "Mekke'nin fethi", "Veda haccı"],
          dogru: 2, aciklama: "Mekke'nin fethinden (Ramazan 8) yaklaşık üç hafta sonra, Şevval 8'de." },
        { tur: "coktan", metin: "Sakif heyetinin hangi talebi <b>kabul edildi</b>?",
          siklar: ["Namazdan muaf tutulmak", "Lât'ın birkaç yıl yıkılmaması", "Putları kendi elleriyle kırmamak", "Faizin serbest bırakılması"],
          dogru: 2, aciklama: "Lât'ı yıkmakla Muğîre b. Şu'be ve Ebû Süfyân görevlendirildi. İnanç ve ibadetin özüyle ilgili talepler reddedildi." },
        { tur: "coktan", metin: "Olaylar hangi seçenekte kronolojik sıradadır?",
          siklar: ["Taif yolculuğu → Huneyn → Taif kuşatması → Sakif heyeti", "Huneyn → Taif yolculuğu → Sakif heyeti → Taif kuşatması", "Sakif heyeti → Huneyn → Taif kuşatması → Taif yolculuğu", "Taif kuşatması → Taif yolculuğu → Huneyn → Sakif heyeti"],
          dogru: 0, aciklama: "619 Taif yolculuğu · 630 başı Huneyn ve kuşatma · 630 sonu Sakif heyeti." },
        { tur: "coktan", metin: "Taif yolculuğu ile Taif halkının Müslüman olması arasında yaklaşık kaç yıl vardır?",
          siklar: ["1", "5", "11", "25"],
          dogru: 2, aciklama: "Yaklaşık 619'dan 630 sonu – 631 başına: on bir yıl kadar." },
      ], { baslik: "Taif", gecmeOrani: 0.7 });
    },
  },
];

dersBaslat({ adimlar });
