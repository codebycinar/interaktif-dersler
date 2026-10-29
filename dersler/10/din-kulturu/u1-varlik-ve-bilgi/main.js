// 10. Sınıf Din Kültürü ve Ahlak Bilgisi · 1. Ünite: İslam'da Varlık ve Bilgi
// DKAB.10.1.1 bilginin yeri ve kaynakları · DKAB.10.1.2 Allah-âlem ilişkisi · DKAB.10.1.3 İsrâ 36 ve Mülk 23
import { dersBaslat, el } from "../../../../engine/ders.js";
import { sahneKap, sekmeler, siniflandirma, siralama, iliskiAgi, geriBildirim, karistir } from "../../felsefe/_ortak/etkilesim.js";
import { AYETLER, HADISLER, kunye, yalanUzlasmaOlasiligi, olasilikYaz, MUTEVATIR_ESIK } from "./veri.js";
import { tefekkurDunyasi, igneler } from "./tefekkur.js";

const A = (id) => `<span class="dk-kunye">${kunye(AYETLER[id])}</span>`;
const ayetKart = (id) => `<span class="dk-ayet">${AYETLER[id].anlam}</span> ${A(id)}`;

/* ---------- Bilgi kutusu: 5. adımda yazılan sorular 6. adımda kullanılır ---------- */
const KUTU_ANAHTARI = "edu:dkab10-bilgi-kutusu";
const kutuOku = () => { try { return JSON.parse(localStorage.getItem(KUTU_ANAHTARI)) || { sorular: [], merak: [] }; } catch { return { sorular: [], merak: [] }; } };
const kutuYaz = (v) => { try { localStorage.setItem(KUTU_ANAHTARI, JSON.stringify(v)); } catch { /* özel pencere */ } };
const KONULAR = [
  { id: "yaratilis", ad: "Yaratılış", renk: "#ffb547" },
  { id: "duzen", ad: "Düzen ve yönetim", renk: "#4fc3f7" },
  { id: "insan", ad: "İnsanın yeri", renk: "#5ad38b" },
  { id: "gayb", ad: "Gayb", renk: "#b89cff" },
];

/* ---------- Anlatım kareleri için sahne tutamacı ----------
   Kareler kamerayı, günün saatini ve geçici iğneleri yönetir; sifirla() alıştırmanın beklediği görünüme döner. */
function sahneApi(ctx, { saat, bak }) {
  const S = ctx.sahne, ek = new Map();
  const igneKaldir = () => { ek.forEach((i) => i.kaldir()); ek.clear(); };
  ctx.temizlik(igneKaldir);
  return {
    bak: (ad) => S.bak(ad),
    saat: (ad) => S.saat(ad),
    igne(anahtar, yer, html, ayar = {}) { ek.get(anahtar)?.kaldir(); ek.set(anahtar, S.igne(typeof yer === "string" ? S.yerler[yer] : yer, html, ayar)); },
    sifirla() { igneKaldir(); S.saat(saat); S.bak(bak); },
  };
}

/* ---------- 2. adım: Müller-Lyer yanılsaması ---------- */
function okluCizgi(x, y, L, disa) {
  const u = 22, h = 15, x0 = x - L / 2, x1 = x + L / 2, d = disa ? -1 : 1;
  return `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/>
    <polyline points="${x0 + d * u},${y - h} ${x0},${y} ${x0 + d * u},${y + h}"/>
    <polyline points="${x1 - d * u},${y - h} ${x1},${y} ${x1 - d * u},${y + h}"/>`;
}

/* ---------- 2. adım: haber zinciri görseli ---------- */
function haberSvg(n, bagimsiz) {
  const H = 230, ox = 60, sx = 540, px = bagimsiz ? 300 : 360, kx = 200;
  const ys = Array.from({ length: n }, (_, i) => (n === 1 ? H / 2 : 24 + (i * (H - 48)) / (n - 1)));
  const cizgi = ys.map((y) => `<line x1="${bagimsiz ? ox + 26 : kx + 18}" y1="${bagimsiz ? H / 2 : H / 2}" x2="${px - 8}" y2="${y}" class="dk-hat"/><line x1="${px + 8}" y1="${y}" x2="${sx - 26}" y2="${H / 2}" class="dk-hat soluk"/>`).join("");
  const r = n > 1 ? Math.min(7, (H - 48) / (n - 1) / 2 - 0.5) : 7;
  const kisi = ys.map((y) => `<circle cx="${px}" cy="${y}" r="${r}" class="dk-kisi"/>`).join("");
  return `<svg viewBox="0 0 600 ${H + 24}" class="dk-haber-svg" role="img" aria-label="Haber zinciri">
    ${bagimsiz ? "" : `<line x1="${ox + 26}" y1="${H / 2}" x2="${kx - 18}" y2="${H / 2}" class="dk-hat"/><circle cx="${kx}" cy="${H / 2}" r="18" class="dk-kaynak"/><text x="${kx}" y="${H / 2 + 38}" text-anchor="middle">tek paylaşım</text>`}
    ${cizgi}${kisi}
    <circle cx="${ox}" cy="${H / 2}" r="26" class="dk-olay"/><text x="${ox}" y="${H / 2 + 5}" text-anchor="middle" class="dk-b">Olay</text>
    <circle cx="${sx}" cy="${H / 2}" r="26" class="dk-sen"/><text x="${sx}" y="${H / 2 + 5}" text-anchor="middle" class="dk-b">Sen</text>
    <text x="${px}" y="${H + 18}" text-anchor="middle">${n} aktarıcı</text>
  </svg>`;
}

/* ---------- 8. adım: ayet metninde anahtar kavram arama ---------- */
const COZUMLE = [
  { id: "isra36", parca: [["Hakkında "], ["bilgin olmayan", "Bilgi: kesin bilgiye dayanmayan zan, söylenti ve tahmin bilgi sayılmaz."], [" bir şeyin "],
    ["ardına düşme", "Bilmeden bir sözün, inancın ya da davranışın peşinden gitmemek; körü körüne taklit etmemek."], ["; çünkü "],
    ["kulak", "Duyular (işitme): bilginin kaynaklarından biridir; doğru kullanılmalıdır."], [", "], ["göz", "Duyular (görme): salim duyular nesnel bilgi kaynağıdır."],
    [" ve "], ["gönül", "Gönül (fuâd): Kur'an'da düşünme, kavrama ve hissetme merkezi; akıl ve kalbi birlikte anlatır."], [", bunların her biri yaptığından "],
    ["sorumludur", "Sorumluluk: insan duyularını ve aklını nasıl kullandığından hesaba çekilir."], ["."]] },
  { id: "mulk23", parca: [["De ki: Sizi "], ["var eden", "Yaratma: insanı ve bilgi araçlarını var eden Allah'tır (Allah-âlem ilişkisi)."], [", size "],
    ["işitme", "İşitme bir nimettir; bilgi edinmenin yollarından biridir."], [", "], ["görme", "Görme bir nimettir; âlemdeki işaretleri görmeyi sağlar."],
    [" ve "], ["gönüller", "Gönüller (ef'ide): düşünme ve anlama gücü; aklın ve kalbin merkezi."], [" veren O'dur. Ne kadar da az "],
    ["şükrediyorsunuz", "Şükür: nimeti verene teşekkür etmek ve nimeti amacına uygun kullanmak."], ["!"]] },
];

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Bunu nereden biliyorsun?",
    cikti: "DKAB.10.1.1-a",
    anlatim: `
      <p>Bilgiyi farklı yollardan ediniriz. İslam düşüncesinde herkes için geçerli (<b>nesnel</b>) kaynaklar üçtür: <b>salim duyular</b>, <b>selim akıl</b> ve <b>sadık haber</b> (mütevatir haber ve vahiy).</p>
      <p>Sezgi, ilham ve rüya kişiye özgü, <b>öznel</b> kaynaklardır; başkasına delil olmaz. İlk inen ayetler “Oku!” emriyle başlar (${kunye(AYETLER.alak)}).</p>`,
    gorev: "On bilginin her birini <b>kaynağına</b> göre doğru kutuya yerleştir.",
    ogretmen: "Program, öğrencilere varlık, nesne, olay ve olgular hakkındaki bilgileri nasıl elde ettiklerinin sorulmasını ve cevaplardan yola çıkılarak bilgi kaynaklarının incelenmesini öneriyor (SDB2.1). Bilgi kaynaklarının öznel–nesnel sınıflandırması ele alınır; İslam'da nesnel kaynaklar sadık haber, selim akıl ve salim duyulardır. Sınıflandırmadan önce öğrencilere kendi örneklerini söyletip tahtaya zihin haritası olarak yazabilirsiniz.",
    anlat: [
      { s: "Ayşe çorbayı tadıyor: “Tuzlu olmuş!” Bunu nasıl bildi? <b>Diliyle</b>, yani bir duyusuyla.", yap: (api) => { api.saat("gun"); api.bak("genel"); } },
      { s: "Gözle, kulakla, dille, elle edindiğimiz bilgiye <b>duyu bilgisi</b> diyoruz. Terastaki akasyayı da gözünle görüyorsun." },
      { s: "Şimdi uzağa bak: duman yükseliyor. Ateşi görmüyoruz ama “orada ateş var” diyoruz.", yap: (api) => api.bak("duman") },
      { s: "Dumandan ateşe <b>akıl</b> ulaştı. Görmediğimiz bir şeyi akıl yürüterek bilebiliriz." },
      { soru: "“Bir bütün, kendi parçasından büyüktür.” Bunu nasıl biliriz?", secenekler: ["Her şeyi tek tek ölçerek", "Akıl yürüterek", "Birinden duyarak"], dogru: 1,
        aciklama: "Bunun için deney gerekmez; akıl kesin olarak kavrar.", ipucu: "Dünyadaki bütün nesneleri ölçmen gerekir mi?" },
      { s: "Çanakkale Savaşı'nı görmedin. Ama birbirinden bağımsız pek çok tanık ve belge anlatıyor. Buna <b>mütevatir haber</b> denir.", yap: (api) => api.bak("kitap") },
      { s: "Bir de Peygamber'in Allah'tan getirdiği bilgi var: <b>vahiy</b>. Mütevatir haber ve vahye birlikte <b>sadık haber</b> denir." },
      { soru: "Ahiret gününün geleceğini hangi yolla biliriz?", secenekler: ["Duyularla", "Vahiyle", "Rüyayla"], dogru: 1,
        aciklama: "Duyular da akıl da tek başına buna ulaşamaz; bu bilgiyi vahiy bildirir.", ipucu: "Ahireti görebilir ya da ölçebilir miyiz?" },
      { s: "Rüya, sezgi ve ilham <b>kişiye özgüdür</b>; başkasına delil olmaz. Bunlara <b>öznel</b> kaynak denir." },
      { baslik: "Birlikte yapalım: “Mısır'da piramitler var.”", cozum: ["Piramitleri gördün mü? Hayır: duyu bilgisi değil.", "Akılla çıkarabilir misin? Hayır: akıl tek başına bilemez.", "Sayısız bağımsız kişi ve kaynak anlatıyor.", "Kaynak: <b>mütevatir haber</b>."] },
      { s: "Şimdi sen dene: on bilginin her birini <b>kaynağına</b> göre doğru kutuya yerleştir." },
    ],
    anlatBitti: (api) => api.sifirla(),
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Bilginin kaynağını bul" });
      ctx.sahne.saat("gun"); ctx.sahne.bak("genel");
      igneler(ctx, [["agac", "Akasya<small>Gözle görülür: duyu</small>", { renk: "#5ad38b" }], ["kitap", "Kitap<small>Aktarılan bilgi: haber</small>", { renk: "#ffb547", yon: "alt" }], ["dumanUst", "Duman<small>Ateşe işaret eder: akıl</small>", { renk: "#4fc3f7" }]]);
      const D = "duyu", K = "akil", M = "mutevatir", V = "vahiy", O = "oznel";
      siniflandirma({
        kap, deste: 1, sutun: 3,
        kategoriler: [
          { id: D, ad: "Salim duyular", aciklama: "Görme, işitme, tatma…", renk: "#4fc3f7" },
          { id: K, ad: "Selim akıl", aciklama: "Akıl yürütme, çıkarım", renk: "#ffd166" },
          { id: M, ad: "Sadık haber: mütevatir", aciklama: "Çok sayıda bağımsız tanığın haberi", renk: "#5ad38b" },
          { id: V, ad: "Sadık haber: vahiy", aciklama: "Peygamber'in bildirdiği", renk: "#ffb547" },
          { id: O, ad: "Öznel: sezgi, ilham, rüya", aciklama: "Kişiye özgü, başkasına delil olmaz", renk: "#b89cff" },
        ],
        kartlar: [
          { id: "b1", metin: "Çorbanın tuzlu olduğunu biliyorum.", dogru: D, aciklama: "Tat alma duyusuyla elde edilen bilgi." },
          { id: "b2", metin: "Pencereden bakınca yağmur yağdığını görüyorum.", dogru: D, aciklama: "Görme duyusuyla elde edilen bilgi." },
          { id: "b3", metin: "Bir bütün, kendi parçasından büyüktür.", dogru: K, aciklama: "Deney gerekmeden akılla kesin olarak bilinir." },
          { id: "b4", metin: "Bu evi biri yapmıştır; ev kendiliğinden oluşmaz.", dogru: K, aciklama: "Eserden onu yapana akıl yürütmeyle ulaşılır." },
          { id: "b5", metin: "Çanakkale Savaşı'nın 1915'te yapıldığını biliyorum.", dogru: M, aciklama: "Pek çok bağımsız tanığın ve belgenin aktardığı mütevatir bir bilgi.", ipucu: "Bu olayı görmedin; peki kimlerden ve kaç kaynaktan duydun?" },
          { id: "b6", metin: "Hiç gitmediğim hâlde Mısır'da piramitler olduğunu biliyorum.", dogru: M, aciklama: "Görmediğin bir yeri, sayısız bağımsız insanın aktarımıyla kesin olarak bilirsin.", ipucu: "Görmedin; ama bunu sana kaç farklı kişi ve kaynak aktardı?" },
          { id: "b7", metin: "Ahiret gününün geleceğini biliyorum.", dogru: V, aciklama: "Duyuların ve aklın tek başına ulaşamayacağı bu bilgi vahiyle bildirilmiştir.", ipucu: "Bu bilgiyi duyularla elde edemeyiz. Kim bildirdi?" },
          { id: "b8", metin: "Meleklerin var olduğunu biliyorum.", dogru: V, aciklama: "Melekler gayb âlemine aittir; onların bilgisi vahiy yoluyla gelir.", ipucu: "Melekleri göremeyiz. Bu bilgi nereden geliyor?" },
          { id: "b9", metin: "Sabah içime bir his doğdu: bugün güzel bir gün olacak.", dogru: O, aciklama: "Sezgi kişiye özgüdür; başkasına delil olarak sunulamaz." },
          { id: "b10", metin: "Rüyamda sınavda çıkacak soruları gördüm.", dogru: O, aciklama: "Rüya kişiye özgüdür; nesnel bilgi kaynağı sayılmaz.", ipucu: "Bu bilgiyi başkası doğrulayabilir mi?" },
        ],
        bitti: () => ctx.gorevTamam(),
      });
      return sahneApi(ctx, { saat: "gun", bak: "genel" });
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Kaynakları sına: duyu, akıl, haber",
    cikti: "DKAB.10.1.1-a",
    anlatim: `
      <p>Nesnel kaynaklar sıfatlarıyla anılır: <b>salim</b> (sağlıklı) duyu, <b>selim</b> (sağlam) akıl, <b>sadık</b> (doğru) haber. Duyular yanılabilir; akıl ve ölçme onları denetler.</p>
      <p><b>Mütevatir haber</b>, yalan üzerinde birleşmeleri aklen mümkün olmayan, birbirinden bağımsız kalabalık bir topluluğun aktardığı haberdir (bk. ${kunye(AYETLER.hucurat6)}).</p>`,
    gorev: "Yanılsama deneyini yapıp doğru sonucu seç; haber modelinde <b>mütevatir</b> düzeye ulaş ve tek kaynaklı kalabalığı dene.",
    ogretmen: "Program bilgi kaynaklarının ve değerinin farklı disiplinler dikkate alınarak açıklanmasını öneriyor (OB1). Haber modeli temsilîdir: her aktarıcının aynı yanlışı uydurma payı %30 kabul edilmiş, bağımsız aktarıcılar için olasılık çarpılmıştır. Asıl vurgu sayının değil, aktarıcıların bağımsızlığının önemidir: aynı paylaşımı tekrarlayan bin kişi tek bir kaynaktır. Sosyal medyada haber doğrulama ile ilişkilendirin.",
    anlat: [
      { s: "Kasedeki suya bir kalem batırılmış. Kalem <b>kırık</b> görünüyor. Gerçekten kırık mı?", yap: (api) => { api.saat("gun"); api.bak("kase"); } },
      { s: "Kalemi sudan çıkarsak dümdüz! Gözümüz bir an <b>yanıldı</b>. Buna <b>yanılsama</b> denir." },
      { s: "Yanıldığımızı nasıl anladık? <b>Akıl</b> şüphelendi; dokunarak ve ölçerek kontrol ettik." },
      { soru: "Kalemin kırık görünmesinde hangi kaynak yanıldı?", secenekler: ["Akıl", "Göz, yani duyu", "Haber"], dogru: 1,
        aciklama: "Göz yanıldı; akıl ve ölçme yanılgıyı düzeltti.", ipucu: "Kalemin kırık olduğunu sana ne söyledi?" },
      { s: "Bu yüzden kaynaklar sıfatıyla anılır: <b>salim</b> (sağlıklı) duyu, <b>selim</b> (sağlam) akıl, <b>sadık</b> (doğru) haber." },
      { s: "Şimdi haberlere geçelim. Bir arkadaşın “Erzurum'a kar yağmış” dedi. Tek kişi yanılmış olabilir.", yap: (api) => api.bak("genel") },
      { s: "Peki birbirini tanımayan on kişi Erzurum'dan aynı şeyi söylese? Hepsinin aynı yanlışı uydurması neredeyse imkânsız." },
      { baslik: "Birlikte hesaplayalım", cozum: ["Bir kişinin yanılma payı %30 olsun (temsilî).", "İki bağımsız kişinin aynı yanlışta birleşmesi: 0,3 × 0,3 = %9", "Üç kişi: 0,3 × 0,3 × 0,3 ≈ %2,7", "Kişi arttıkça bu olasılık hızla sıfıra yaklaşır."] },
      { s: "Böyle kalabalık ve <b>bağımsız</b> bir topluluğun aktardığı habere <b>mütevatir haber</b> denir; kesin bilgi verir." },
      { soru: "Bin kişi aynı paylaşımı tekrar paylaşıyor. Bu haber mütevatir mi?", secenekler: ["Evet, bin kişi çok fazla", "Hayır, hepsi tek bir kaynağa dayanıyor", "Evet, çok paylaşılan doğrudur"], dogru: 1,
        aciklama: "Aynı paylaşımı tekrarlayan kalabalık <b>tek bir kaynaktır</b>. Önemli olan sayı değil, bağımsızlıktır.", ipucu: "Bu bin kişiden kaçı olayı kendi gözüyle gördü?" },
      { s: `Kur'an da uyarır: Güvenilmez biri bir haber getirirse onu <b>araştırın</b> (${kunye(AYETLER.hucurat6)}).` },
      { s: "Şimdi sen dene: 1. sekmede çizgileri gözünle eşitleyip ölç; 2. sekmede haber modelini iki türlü dene." },
    ],
    anlatBitti: (api) => api.sifirla(),
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Bilgi kaynaklarını sına" });
      ctx.sahne.saat("gun"); ctx.sahne.bak("kase");
      igneler(ctx, [["kase", "Suya batırılmış kalem<small>Kırık görünür ama düzdür</small>", { renk: "#4fc3f7" }]]);
      let gozBitti = false, haberBitti = false;
      const bak = () => gozBitti && haberBitti && ctx.gorevTamam();
      const sek = sekmeler(kap, [
        { ad: "1. Göz yanılır mı?", kur: (k) => {
          const svg = el("div", { class: "ok-kutu dk-yanilsama" });
          const L = el("input", { type: "range", min: 150, max: 330, step: 2, value: 196, "aria-label": "Alttaki çizginin uzunluğu" });
          let olculdu = false;
          const ciz = () => {
            const b = +L.value;
            svg.innerHTML = `<svg viewBox="0 0 600 240" role="img" aria-label="Müller-Lyer yanılsaması">
              <g class="dk-cizgi">${okluCizgi(300, 70, 240, true)}${okluCizgi(300, 170, b, false)}</g>
              <text x="28" y="75" class="dk-b">A</text><text x="28" y="175" class="dk-b">B</text>
              ${olculdu ? `<g class="dk-cetvel"><rect x="${300 - 120}" y="92" width="240" height="8"/><rect x="${300 - b / 2}" y="192" width="${b}" height="8"/>
                <text x="300" y="118" text-anchor="middle">A = 240 birim</text><text x="300" y="220" text-anchor="middle">B = ${b} birim</text></g>` : ""}
            </svg>`;
          };
          L.addEventListener("input", () => { if (!olculdu) ciz(); });
          const geri = el("div", { class: "ok-geri" }, "B çizgisini kaydırıcıyla ayarla: A ile aynı uzunlukta görünene kadar. Sonra cetvelle ölç.");
          const soru = el("div", { hidden: true, class: "ok-kutu" });
          k.append(svg, el("div", { class: "d-kaydirici" }, el("label", {}, "B çizgisinin uzunluğu (gözünle A'ya eşitle)"), el("output"), L),
            el("div", { class: "d-satir" }, el("button", { class: "d-btn ana", "data-olc": "1", onclick: (e) => {
              olculdu = true; L.disabled = true; e.currentTarget.disabled = true; ciz();
              const b = +L.value, fark = Math.round(((b - 240) / 240) * 100);
              geri.className = "ok-geri";
              geri.innerHTML = Math.abs(fark) <= 3
                ? `Çok yakın ayarladın (fark %${Math.abs(fark)}). Yine de çoğu kişi B'yi <b>daha uzun</b> ayarlar: uçlardaki ok başları B'yi kısa, A'nın dışa açılan uçları ise A'yı uzun gösterir.`
                : `Gözün seni <b>%${Math.abs(fark)}</b> yanılttı: B'yi ${fark > 0 ? "daha uzun" : "daha kısa"} ayarladın. Oklar çizgilerin uzunluğu hakkındaki algımızı değiştiriyor.`;
              soru.hidden = false;
            } }, "📏 Cetvelle ölç")), geri, soru);
          soru.append(el("b", {}, "Bu deneyden hangi sonuç çıkar?"));
          const sg = el("div", { class: "d-geri-bildirim" });
          [["Duyular hiçbir zaman güvenilir değildir.", "Aşırı bir genelleme: duyular çoğu zaman doğru bilgi verir; burada yalnızca belirli bir koşulda yanıldı.", false],
            ["Duyular yanılabilir; akıl ve ölçme araçları onları denetler ve düzeltir.", "Doğru! Selim akıl, duyulardan gelen bilgiyi sınar. Kaynaklar birbirini tamamlar.", true],
            ["Akıl, duyulara hiç ihtiyaç duymaz.", "Akıl, üzerinde düşüneceği verilerin çoğunu duyulardan alır. Cetveli okumak için de gözünü kullandın!", false]]
            .forEach(([m, a, d]) => soru.append(el("button", { class: "ok-kart", "data-dogru": d ? "1" : null, style: "margin-top:6px;display:block;width:100%", onclick: (e) => {
              e.currentTarget.classList.add(d ? "dogru" : "yanlis");
              sg.className = `d-geri-bildirim ${d ? "dogru" : "yanlis"}`; sg.textContent = a;
              if (d && !gozBitti) { gozBitti = true; sek.bitti(0); bak(); }
            } }, m)));
          soru.append(sg);
          const out = k.querySelector("output");
          const yaz = () => (out.textContent = `${L.value} birim`);
          L.addEventListener("input", yaz); yaz(); ciz();
        } },
        { ad: "2. Haber ne zaman güvenilir?", kur: (k) => {
          const P = 0.3;
          let bagimsiz = true, ulasti = false, tekDenendi = false;
          const gorsel = el("div", { class: "ok-kutu" });
          const N = el("input", { type: "range", min: 1, max: 20, step: 1, value: 1, "aria-label": "Aktarıcı sayısı" });
          const out = el("output");
          const tur = el("div", { class: "ok-sekmeler" });
          const durum = el("div", { class: "dk-durum" });
          const geri = el("div", { class: "ok-geri" });
          const turDugme = [[true, "Her biri olayı kendi gözüyle gördü"], [false, "Hepsi aynı paylaşımı tekrarlıyor"]].map(([v, m]) =>
            el("button", { class: "d-btn kucuk", "data-bagimsiz": String(v), "aria-pressed": String(v === bagimsiz), onclick: () => { bagimsiz = v; turDugme.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.bagimsiz === String(v)))); guncelle(); } }, m));
          tur.append(...turDugme);
          k.append(el("div", { class: "dk-soluk dk-haber-baslik" }, "Haber: “Dün akşam Erzurum'da kar yağdı.” Bir aktarıcının yanılma ya da uydurma payı (temsilî): %30"),
            gorsel, el("div", { class: "d-kaydirici" }, el("label", {}, "Haberi aktaran kişi sayısı"), out, N), tur, durum, geri);
          function guncelle() {
            const n = +N.value;
            out.textContent = `${n} kişi`;
            gorsel.innerHTML = haberSvg(n, bagimsiz);
            const o = yalanUzlasmaOlasiligi(n, P, bagimsiz);
            const mut = bagimsiz && o < MUTEVATIR_ESIK;
            durum.innerHTML = `<div class="d-gosterge"><span>Hepsinin aynı yanlışta birleşme olasılığı</span><b>${olasilikYaz(o)}</b></div>
              <div class="d-gosterge ${mut ? "dk-mut" : ""}"><span>Haberin niteliği</span><b>${mut ? "Mütevatir: kesin bilgi" : bagimsiz ? (n === 1 ? "Tek kişinin haberi" : "Güçleniyor, henüz kesin değil") : "Tek kaynaklı söylenti"}</b></div>`;
            if (mut && !ulasti) { ulasti = true; }
            if (!bagimsiz && n >= 8) tekDenendi = true;
            geri.className = `ok-geri ${ulasti && tekDenendi ? "dogru" : ""}`;
            geri.innerHTML = ulasti && tekDenendi
              ? "✓ Gördün: sayı tek başına yetmiyor. Bağımsız tanıklar çoğaldıkça yalanda birleşmeleri imkânsızlaşır; ama aynı paylaşımı tekrarlayan kalabalık, <b>tek bir kaynaktır</b>."
              : ulasti ? "Bağımsız tanıklarla haber mütevatir oldu. Şimdi “Hepsi aynı paylaşımı tekrarlıyor” seçeneğini en az 8 kişiyle dene."
              : tekDenendi ? "Tek kaynaklı kalabalık olasılığı değiştirmedi. Şimdi bağımsız tanıklarla haberi mütevatir düzeye çıkar."
              : "Kaydırıcıyla aktarıcı sayısını artır; iki seçeneği de dene.";
            if (ulasti && tekDenendi && !haberBitti) { haberBitti = true; sek.bitti(1); bak(); }
          }
          N.addEventListener("input", guncelle);
          guncelle();
        } },
      ]);
      return sahneApi(ctx, { saat: "gun", bak: "kase" });
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Bilgi kaynakları arasındaki ilişki",
    cikti: "DKAB.10.1.1-b",
    anlatim: `
      <p>Bilgi kaynakları birbirini <b>destekler ve denetler</b>: duyular akla veri getirir, akıl haberi sınar, akıl vahyi anlar, vahiy akla yol gösterir. Allah insana işitme, görme ve gönül vermiştir (${kunye(AYETLER.nahl78)}).</p>
      <p>Doğru bilgi <b>doğru inanca</b>, doğru inanç <b>doğru davranışa</b> yol açar.</p>`,
    gorev: "Kavram haritasında <b>sekiz bağın</b> hepsini doğru yönde kur.",
    ogretmen: "Program, öğrencilerin bilgi kaynakları arasındaki ilişkileri öğretmen rehberliğinde belirlemesini, bu süreçte zihin haritası kullanılmasını ve doğru bilgi–doğru inanç–doğru davranış ilişkisinden doğru bilginin önemine değinilmesini öneriyor (E3.4, D16.1, SDB1.2). Akıl ile vahiy arasındaki ilişkinin iki yönlü olduğuna (akıl vahyi anlar; vahiy akla yön verir) özellikle dikkat çekin.",
    anlat: [
      { s: "Bir doktor düşün. Hastayı <b>dinler</b>, ateşini <b>ölçer</b>, sonra <b>düşünüp</b> karar verir.", yap: (api) => { api.saat("aksam"); api.bak("genel"); } },
      { s: "Doktor tek bir kaynağa değil, hepsine birden başvurdu. Bilgi kaynakları da <b>birlikte çalışır</b>." },
      { s: "<b>Duyular</b> akla veri getirir. Akıl bu verileri düşünür, karşılaştırır, birleştirir." },
      { s: "<b>Akıl</b> haberi sınar: Kaç kişi söylüyor? Birbirinden bağımsızlar mı? Söyledikleri tutarlı mı?" },
      { s: "<b>Vahiy</b>, aklın tek başına ulaşamadığı konularda yol gösterir. Akıl da vahyi <b>anlamayı</b> sağlar.", yap: (api) => api.bak("kitap") },
      { soru: "Akıl ile vahiy arasındaki bağ hangi yöndedir?", secenekler: ["Yalnızca akıldan vahye", "Yalnızca vahiyden akla", "İki yönlü: akıl vahyi anlar, vahiy akla yol gösterir"], dogru: 2,
        aciklama: "Vahyi anlamak için akıl gerekir; akıl da gayb gibi konularda vahiyle yol bulur.", ipucu: "Aklı olmayan biri dinî bir emirden sorumlu tutulur mu?" },
      { s: `Kur'an'a göre Allah insana <b>işitme, görme ve gönül</b> vermiştir; bunlar bilginin araçlarıdır (${kunye(AYETLER.nahl78)}).` },
      { baslik: "Birlikte yapalım: bilgiden davranışa", cozum: ["Duyduk: “Bu içecek sağlığa zararlı.”", "Akılla sınadık: kaynak güvenilir, uzmanlar aynı şeyi söylüyor.", "<b>Doğru bilgi</b>: Bu içecek zararlı.", "<b>Doğru inanç</b>: Sağlığım bana verilmiş bir emanettir.", "<b>Doğru davranış</b>: Bu içeceği içmem."] },
      { soru: "Doğru davranışın temelinde ne vardır?", secenekler: ["Doğru inanç ve doğru bilgi", "Çoğunluğun yaptığı", "Tahmin"], dogru: 0,
        aciklama: "Doğru bilgi doğru inanca, doğru inanç doğru davranışa yol açar.", ipucu: "Zincirin başına dön." },
      { s: "Şimdi sen dene: haritada önce kaynağa, sonra onun etkilediğine dokunarak <b>sekiz bağı</b> doğru yönde kur." },
    ],
    anlatBitti: (api) => api.sifirla(),
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Kaynaklar birbirini nasıl etkiler?" });
      ctx.sahne.saat("aksam"); ctx.sahne.bak("kitap");
      igneler(ctx, [["kitap", "Kitap", { renk: "#ffb547" }], ["kandil", "Kandil", { renk: "#ffd166", yon: "sag" }]]);
      iliskiAgi({
        kap, yukseklik: 440, temizlik: ctx.temizlik,
        dugumler: [
          { id: "duyu", metin: "Salim duyular", x: 14, y: 16 },
          { id: "haber", metin: "Mütevatir haber", x: 14, y: 84 },
          { id: "akil", metin: "Selim akıl", x: 40, y: 50 },
          { id: "vahiy", metin: "Vahiy", x: 60, y: 14 },
          { id: "bilgi", metin: "Doğru bilgi", x: 66, y: 50 },
          { id: "inanc", metin: "Doğru inanç", x: 86, y: 24 },
          { id: "davranis", metin: "Doğru davranış", x: 86, y: 80 },
        ],
        baglar: [
          { kaynak: "duyu", hedef: "akil", etiket: "veri getirir", aciklama: "Duyular, aklın üzerinde düşüneceği verileri getirir." },
          { kaynak: "duyu", hedef: "haber", etiket: "tanıklık", aciklama: "Mütevatir haber, olayı duyularıyla bizzat algılayan tanıkların aktarımına dayanır." },
          { kaynak: "akil", hedef: "haber", etiket: "sınar", aciklama: "Akıl, haberi verenlerin sayısını, bağımsızlığını ve tutarlılığını sınar." },
          { kaynak: "akil", hedef: "vahiy", etiket: "anlar", aciklama: "Akıl, vahyi anlamanın ve ondan sorumlu tutulmanın şartıdır." },
          { kaynak: "vahiy", hedef: "akil", etiket: "yol gösterir", aciklama: "Vahiy, gayb gibi aklın tek başına ulaşamayacağı konularda bilgi verir ve akla yön gösterir." },
          { kaynak: "akil", hedef: "bilgi", etiket: "değerlendirir", aciklama: "Akıl, kaynaklardan geleni değerlendirerek doğru bilgiye ulaştırır." },
          { kaynak: "bilgi", hedef: "inanc", etiket: "temel olur", aciklama: "Doğru bilgi, doğru inancın temelidir." },
          { kaynak: "inanc", hedef: "davranis", etiket: "yön verir", aciklama: "Doğru inanç, doğru davranışa yön verir. İnsan duygu, düşünce ve davranışlarından sorumludur." },
        ],
        tersMesaj: "Bağ var ama yönü ters. Hangisi diğerine bir şey sağlıyor ya da onu denetliyor?",
        bitti: () => ctx.gorevTamam(),
      });
      return sahneApi(ctx, { saat: "aksam", bak: "kitap" });
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Görülen ve görülmeyen âlem",
    cikti: "DKAB.10.1.2-a",
    anlatim: `
      <p><b>Varlık</b>, var olan her şeydir. Duyularla ya da araçlarla algılanabilen <b>şehadet âlemi</b>, bilgisine ancak vahiyle ulaşılan ise <b>gayb âlemi</b>dir.</p>
      <p>Dikkat: Çıplak gözle görülmeyen her şey gayb değildir. Bakteri ve elektrik araçlarla gözlenir.</p>`,
    gorev: "On üç varlığı doğru âleme yerleştir ve en az bir <b>merak konusu</b> seç.",
    ogretmen: "Program, zihin haritaları oluşturularak görülen (şehadet) ve görülemeyen (gayb) âlem ile varlık türleri (insan, hayvan, bitki, melek, cin, şeytan) hakkında öğrencilerin görüşlerini paylaşmalarını ve Allah-âlem ilişkisiyle ilgili merak ettiklerini tanımlamalarını öneriyor. Temel kabul: öğrenciler görülen ve görülemeyen varlıklar hakkında bilgi sahibidir. “Görünmeyen = gayb” kavram yanılgısını özellikle tartışın.",
    anlat: [
      { s: "Gece gökyüzüne bak. Yıldızları gözünle görüyorsun.", yap: (api) => { api.saat("gece"); api.bak("gok"); } },
      { s: "Gözle göremediğin uzak galaksileri <b>teleskop</b> gösterir. Onlar da gözlenebilen varlıklardır." },
      { s: "Var olan her şeye <b>varlık</b> denir. Duyularla ya da araçlarla algılananların dünyasına <b>şehadet âlemi</b> denir." },
      { soru: "Telefonundaki Wi-Fi sinyalini göremezsin ama cihazlar onu ölçer. Sinyal hangi âleme aittir?", secenekler: ["Şehadet âlemi", "Gayb âlemi"], dogru: 0,
        aciklama: "Gözle görülmese de araçla ölçülür: şehadet âlemi.", ipucu: "Bir aletle ölçülebiliyor mu?" },
      { s: "Bazı varlıklar ise hiçbir duyu ya da araçla algılanamaz. Onları ancak <b>vahiy</b> sayesinde biliriz." },
      { s: "Bu görülmeyen âleme <b>gayb âlemi</b> denir. Melekler ve ahiret hayatı gayba aittir." },
      { s: `Gaybın tam bilgisi yalnızca Allah'tadır: “Gaybın anahtarları O'nun katındadır.” (${kunye(AYETLER.enam59)})` },
      { baslik: "Birlikte düşünelim: “Görmüyorsam gaybdır” doğru mu?", cozum: ["Havadaki oksijeni göremeyiz.", "Ama aletlerle ölçer, etkisini görürüz: nefes alırız.", "O hâlde oksijen şehadet âlemindedir.", "Sonuç: Görünmeyen her şey gayb <b>değildir</b>."] },
      { soru: "Hangisi gayb âlemine aittir?", secenekler: ["Ses dalgaları", "Cennet ve cehennem", "Mars gezegeni"], dogru: 1,
        aciklama: "Ses dalgaları ölçülür, Mars teleskopla görülür. Cennet ve cehennemin bilgisi vahiyle gelir.", ipucu: "Hangisini hiçbir araçla gözleyemeyiz?" },
      { s: "Şimdi sen dene: varlıkları iki âleme yerleştir, sonra en çok neyi merak ettiğini seç." },
    ],
    anlatBitti: (api) => api.sifirla(),
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Varlık haritası: şehadet ve gayb" });
      ctx.sahne.saat("gece"); ctx.sahne.bak("gok");
      igneler(ctx, [["gok", "Yıldızlar<small>Şehadet âlemi: gözle ya da araçla gözlenir</small>", { renk: "#4fc3f7" }]]);
      let sinif = false;
      const kutu = kutuOku();
      const bak = () => sinif && kutu.merak.length && ctx.gorevTamam();
      const S = "sehadet", G = "gayb";
      siniflandirma({
        kap, sutun: 2,
        kategoriler: [
          { id: S, ad: "Şehadet âlemi", aciklama: "Duyularla ya da araçlarla algılanabilen", renk: "#4fc3f7" },
          { id: G, ad: "Gayb âlemi", aciklama: "Bilgisine ancak vahiyle ulaşılan", renk: "#b89cff" },
        ],
        kartlar: [
          { id: "v1", metin: "🌳 Çınar ağacı", dogru: S, aciklama: "Bitkiler şehadet âlemine aittir." },
          { id: "v2", metin: "🐈 Kedi", dogru: S, aciklama: "Hayvanlar şehadet âlemine aittir." },
          { id: "v3", metin: "🧍 İnsan bedeni", dogru: S, aciklama: "İnsan bedeni duyularla algılanır." },
          { id: "v4", metin: "🦠 Bakteri", dogru: S, aciklama: "Çıplak gözle görülmez ama mikroskopla gözlenir: şehadet âlemi.", ipucu: "Gözle göremesek de bir araçla gözlenebilir mi?" },
          { id: "v5", metin: "⚡ Elektrik akımı", dogru: S, aciklama: "Görülmez ama ölçü aletleriyle ölçülür ve etkileri algılanır: şehadet âlemi.", ipucu: "Bir ölçü aletiyle ölçülebilir mi?" },
          { id: "v6", metin: "🌬️ Rüzgâr", dogru: S, aciklama: "Havanın hareketi tenimizle hissedilir ve ölçülür: şehadet âlemi.", ipucu: "Rüzgârı hissedebilir, hızını ölçebilir miyiz?" },
          { id: "v7", metin: "🌌 Uzak galaksiler", dogru: S, aciklama: "Teleskoplarla gözlenir: şehadet âlemi.", ipucu: "Teleskopla gözlenebilir mi?" },
          { id: "v8", metin: "Melekler", dogru: G, aciklama: "Melekler gayb âlemine aittir; onların bilgisi vahiyle gelir." },
          { id: "v9", metin: "Cinler", dogru: G, aciklama: "Cinler duyularımızla algılanamayan varlıklardır; Kur'an'da bildirilir." },
          { id: "v10", metin: "Şeytan", dogru: G, aciklama: "Kur'an'a göre İblis (şeytan) cinlerdendir; gayb âlemine aittir." },
          { id: "v11", metin: "Ahiret ve cennet", dogru: G, aciklama: "Ahiret hayatının bilgisi vahiyle bildirilmiştir." },
          { id: "v12", metin: "Kıyametin kopacağı zaman", dogru: G, aciklama: `Kıyametin vaktini yalnızca Allah bilir (${kunye(AYETLER.lokman34)}).` },
          { id: "v13", metin: "Ruhun mahiyeti", dogru: G, aciklama: `“Ruh, Rabbimin emrindendir; size ilimden az bir şey verilmiştir.” (${kunye(AYETLER.isra85)})` },
        ],
        bitti: () => { sinif = true; bak(); },
      });
      const MERAK = ["Âlem nasıl var oldu?", "Âlemdeki düzeni ne sürdürüyor?", "İnsanın âlemdeki yeri ne?", "Görmediğimiz varlıkları nasıl bilebiliriz?", "Allah âlemle nasıl bir ilişki içindedir?"];
      ctx.not("<p><b>Allah-âlem ilişkisiyle ilgili en çok neyi merak ediyorsun?</b> (Birden fazla seçebilirsin.)</p>");
      const satir = el("div", { class: "d-satir dk-merak" });
      MERAK.forEach((m) => satir.append(el("button", { class: "d-btn kucuk", "data-merak": m, "aria-pressed": String(kutu.merak.includes(m)), onclick: (e) => {
        const i = kutu.merak.indexOf(m);
        if (i >= 0) kutu.merak.splice(i, 1); else kutu.merak.push(m);
        e.currentTarget.setAttribute("aria-pressed", String(i < 0));
        kutuYaz(kutu); bak();
      } }, m)));
      ctx.kontroller.append(satir);
      return sahneApi(ctx, { saat: "gece", bak: "gok" });
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Bilgi kutusu: soru sor",
    cikti: "DKAB.10.1.2-b",
    anlatim: `
      <p>Merak, iyi bir soruyla bilgiye dönüşür. Allah-âlem ilişkisi üzerine sorular dört konuda toplanır: <b>yaratılış</b>, <b>düzen ve yönetim</b>, <b>insanın yeri</b> ve <b>gayb</b>.</p>
      <p>Bilgi kutusuna attığın sorulara sonraki adımda kaynaklardan cevap arayacaksın.</p>`,
    gorev: "Bilgi kutusuna <b>en az iki farklı konudan</b> en az <b>üç soru</b> at.",
    ogretmen: "Program, öğrencilerin Allah-âlem ilişkisini anlayabilmek için sorular sormasını ve bu süreçte bilgi kutusu tekniğinin kullanılmasını öneriyor (E3.8). Sınıfta öğrencilerin sorularını kâğıda yazıp gerçek bir kutuda toplayabilir, sonraki derste kaynaklardan birlikte cevaplayabilirsiniz. Öğrencilerin her türlü merakını saygıyla karşılayın.",
    anlat: [
      { s: "Küçük çocuklar durmadan sorar: “Gökyüzü neden mavi? Ben nereden geldim?” Bilgi, <b>merakla</b> başlar.", yap: (api) => { api.saat("gece"); api.bak("kitap"); } },
      { s: "Ama her soru aynı değildir. İyi bir soru <b>açıktır</b>, tek bir konuya odaklanır ve araştırılabilir." },
      { soru: "Hangisi daha iyi bir sorudur?", secenekler: ["Her şey ne?", "Âlemdeki düzeni ne sürdürüyor?", "Bilmem, sence?"], dogru: 1,
        aciklama: "Açık, tek bir konuya odaklı ve kaynaklarda araştırılabilir.", ipucu: "Hangisi tek bir konuya odaklanıyor?" },
      { s: "Allah-âlem ilişkisi üzerine sorular dört konuda toplanır. İlki <b>yaratılış</b>: Âlem nasıl var oldu?" },
      { s: "İkincisi <b>düzen ve yönetim</b>: Âlemdeki düzeni ne sürdürüyor? Üçüncüsü <b>insanın yeri</b>: Benim görevim ne?" },
      { s: "Dördüncüsü <b>gayb</b>: Görmediğimiz varlıkları nasıl bilebiliriz?" },
      { baslik: "Birlikte yapalım: soruyu konusuna bağla", cozum: ["Soru: “İnsan neden sorumlu bir varlıktır?”", "Soru, insanın görevinden ve değerinden söz ediyor.", "Konusu: <b>insanın yeri</b>."] },
      { soru: "“Melekler ne iş yapar?” sorusu hangi konuya girer?", secenekler: ["Yaratılış", "Gayb", "Düzen ve yönetim"], dogru: 1,
        aciklama: "Melekler gayb âlemine aittir; bilgileri vahiyle gelir.", ipucu: "Melekleri görebilir miyiz?" },
      { s: "Sorularını <b>bilgi kutusuna</b> atacaksın. Sonraki adımda cevaplarını Kur'an'dan arayacağız." },
      { s: "Şimdi sen dene: bir konu seç, hazır bir soru ekle ya da kendin yaz. En az <b>iki konudan üç soru</b> at." },
    ],
    anlatBitti: (api) => api.sifirla(),
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Bilgi kutusu" });
      ctx.sahne.saat("gece"); ctx.sahne.bak("kitap");
      const kutu = kutuOku();
      const HAZIR = {
        yaratilis: ["Âlem neden var?", "Âlem kendiliğinden var olabilir mi?", "Allah âlemi neden yarattı?"],
        duzen: ["Âlemdeki düzeni ne sürdürüyor?", "Doğa yasaları ile Allah'ın iradesi arasında nasıl bir ilişki var?", "Allah âlemi yarattıktan sonra kendi hâline mi bıraktı?"],
        insan: ["İnsanın âlemdeki görevi nedir?", "İnsanı diğer varlıklardan ayıran nedir?", "İnsan neden sorumlu bir varlıktır?"],
        gayb: ["Görmediğimiz varlıkları nasıl bilebiliriz?", "Gayb bilgisini kim bilir?", "Melekler ile insanlar arasında ne fark var?"],
      };
      let konu = "yaratilis";
      const konuSatir = el("div", { class: "ok-sekmeler" });
      const hazirKap = el("div", { class: "dk-hazir" });
      const girdi = el("input", { type: "text", class: "dk-girdi", placeholder: "Kendi sorunu yaz…", "aria-label": "Kendi sorum" });
      const kutuEl = el("div", { class: "dk-kutu" });
      const geri = el("div", { class: "ok-geri" });
      kap.append(el("div", { class: "ok-kutu" }, el("b", {}, "1. Konu seç"), konuSatir),
        el("div", { class: "ok-kutu" }, el("b", {}, "2. Bir soru seç ya da kendin yaz"), hazirKap,
          el("div", { class: "d-girdi", style: "margin-top:8px" }, girdi, el("button", { class: "d-btn", onclick: () => ekle(girdi.value) }, "Kutuya at"))),
        el("div", { class: "dk-kutu-sar" }, el("div", { class: "dk-kutu-ust" }, "📦 Bilgi kutusu"), kutuEl), geri);
      girdi.addEventListener("keydown", (e) => e.key === "Enter" && ekle(girdi.value));
      const konuDugme = KONULAR.map((k) => el("button", { class: "d-btn kucuk", "data-konu": k.id, style: `--renk:${k.renk}`, onclick: () => konuSec(k.id) }, k.ad));
      konuSatir.append(...konuDugme);
      function konuSec(id) {
        konu = id;
        konuDugme.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.konu === id)));
        hazirKap.replaceChildren(...HAZIR[id].map((s) => el("button", { class: "ok-kart", "data-hazir": s, onclick: () => ekle(s) }, `+ ${s}`)));
      }
      function ekle(metin) {
        const m = metin.trim();
        if (m.length < 8) { geri.className = "ok-geri yanlis"; geri.textContent = "Biraz daha uzun bir soru yaz."; return; }
        const soru = /[?]$/.test(m) ? m : `${m}?`;
        if (kutu.sorular.some((s) => s.metin === soru)) { geri.className = "ok-geri"; geri.textContent = "Bu soru zaten kutuda."; return; }
        kutu.sorular.push({ metin: soru, konu });
        kutuYaz(kutu); girdi.value = "";
        ciz();
      }
      function ciz() {
        kutuEl.replaceChildren(...(kutu.sorular.length ? kutu.sorular.map((s, i) => {
          const k = KONULAR.find((x) => x.id === s.konu);
          return el("div", { class: "dk-kutu-soru", style: `--renk:${k.renk}` }, el("span", {}, k.ad), s.metin,
            el("button", { class: "d-btn kucuk", title: "Kutudan çıkar", onclick: () => { kutu.sorular.splice(i, 1); kutuYaz(kutu); ciz(); } }, "×"));
        }) : [el("span", { class: "dk-soluk" }, "Kutu henüz boş.")]));
        const konuSayi = new Set(kutu.sorular.map((s) => s.konu)).size;
        const tamam = kutu.sorular.length >= 3 && konuSayi >= 2;
        geri.className = `ok-geri ${tamam ? "dogru" : ""}`;
        geri.textContent = tamam ? `✓ Kutunda ${kutu.sorular.length} soru, ${konuSayi} konu var. Bir sonraki adımda kaynaklardan cevap arayacaksın.`
          : `Kutuda ${kutu.sorular.length}/3 soru, ${konuSayi}/2 konu.`;
        if (tamam) ctx.gorevTamam();
      }
      if (kutu.merak.length) ctx.not(`<p>4. adımda merak ettiklerin: <i>${kutu.merak.join(" · ")}</i></p>`);
      konuSec(konu); ciz();
      return sahneApi(ctx, { saat: "gece", bak: "kitap" });
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Kaynaklardan bilgi topla",
    cikti: "DKAB.10.1.2-c",
    anlatim: `
      <p>İslam'ın temel kaynakları <b>Kur'an</b> ve <b>sünnet</b>tir. Kur'an insanı âlemdeki işaretler üzerinde <b>tefekküre</b> çağırır (${kunye(AYETLER.aliimran190)}).</p>
      <p>Künye okuma: <b>Mülk 67/3</b> = Mülk suresi (67. sure), 3. ayet.</p>`,
    gorev: "On iki kaynak kartını doğru konuya yerleştir.",
    ogretmen: "Program, öğrencilerin konuyla ilgili İslam'ın temel kaynaklarından bilgi toplamalarına imkân tanınmasını ve Kelam ilminin Allah-âlem ilişkisine dair yaklaşımının dikkate alınmasını öneriyor. Ayetlerin tam meallerini Diyanet İşleri Başkanlığının matbu ya da dijital meallerinden öğrencilerle birlikte okuyabilirsiniz; kartlarda ayetlerin anlamı kısaltılarak verilmiştir.",
    anlat: [
      { s: "Bir soruya cevap ararken ansiklopediye ya da bir uzmana başvururuz. Din konusunda önce <b>temel kaynaklara</b> bakarız.", yap: (api) => { api.saat("gun"); api.bak("yigin"); } },
      { s: "İslam'ın temel kaynakları ikidir: <b>Kur'an</b> ve Peygamberimizin örnek hayatı olan <b>sünnet</b>." },
      { s: `Kur'an insanı gökleri ve yeri düşünmeye çağırır. Bu derin düşünmeye <b>tefekkür</b> denir (${kunye(AYETLER.aliimran190)}).` },
      { s: "Bir ayetin yeri <b>künye</b> ile gösterilir. <b>Mülk 67/3</b>: Mülk suresi, 67. sure, 3. ayet." },
      { soru: "“Yâsîn 36/82” künyesinde 82 neyi gösterir?", secenekler: ["Surenin sırasını", "Ayet numarasını", "Sayfa numarasını"], dogru: 1,
        aciklama: "İlk sayı surenin sırası (36), ikinci sayı ayet numarasıdır (82).", ipucu: "Mülk 67/3'te 3 neyi gösteriyordu?" },
      { baslik: "Birlikte yapalım: Bu ayet hangi konuya cevap verir?", cozum: [`Ayet: “${AYETLER.isra85.anlam}” (${kunye(AYETLER.isra85)})`, "Anahtar sözcük: <b>ruh</b>. Ruhu göremez, ölçemeyiz.", "Bilgisi bize ancak vahiyle gelir.", "Konusu: <b>gayb</b>."] },
      { soru: `“${AYETLER.ahzab72.anlam}” Bu ayet hangi konuya cevap verir?`, secenekler: ["Yaratılış", "İnsanın yeri", "Gayb"], dogru: 1,
        aciklama: "Emaneti, yani sorumluluğu yüklenen insandır: insanın âlemdeki yeri.", ipucu: "Ayette kim, neyi yükleniyor?" },
      { s: "Kartları yerleştirince bilgi kutundaki soruların hangi ayetlerle cevaplanabileceğini göreceksin." },
      { s: "Şimdi sen dene: on iki kaynak kartını, ayetin cevap verdiği <b>konuya</b> yerleştir." },
    ],
    anlatBitti: (api) => api.sifirla(),
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Kaynak kartları" });
      ctx.sahne.saat("gun"); ctx.sahne.bak("yigin");
      igneler(ctx, [["yigin", "Kitaplar", { renk: "#ffb547" }], ["usturlap", "Usturlap<small>Gök cisimlerini gözlemeye yarayan alet</small>", { renk: "#ffd166", yon: "sag" }]]);
      const ESLESME = {
        yaratilis: ["yasin82", "furkan2", "ihlas"],
        duzen: ["mulk3", "rahman29", "enbiya22"],
        insan: ["bakara30", "isra70", "zariyat56"],
        gayb: ["enam59", "bakara3", "lokman34"],
      };
      const NEDEN = {
        yaratilis: "Bu ayet, Allah'ın yaratıcılığını ve yaratmadaki kudretini anlatır.",
        duzen: "Bu ayet, âlemdeki düzeni ve Allah'ın âlemi sürekli yönetmesini anlatır.",
        insan: "Bu ayet, insanın âlemdeki yerini, değerini ve görevini anlatır.",
        gayb: "Bu ayet, gayb âlemini ve gayb bilgisini anlatır.",
      };
      const kartlar = Object.entries(ESLESME).flatMap(([konu, ids]) => ids.map((id) => ({ id, metin: ayetKart(id), dogru: konu, aciklama: `${kunye(AYETLER[id])}: ${NEDEN[konu]}`, ipucu: "Ayetin anlamındaki anahtar sözcüğe dikkat et: yaratma mı, düzen mi, insan mı, görülmeyen mi?" })));
      const sonuc = el("div", { class: "ok-kutu", hidden: true });
      siniflandirma({
        kap, kartlar, deste: 1, sutun: 4,
        kategoriler: KONULAR,
        bitti: () => {
          const kutu = kutuOku();
          sonuc.hidden = false;
          sonuc.innerHTML = `<b>Bilgi kutundaki sorular ve kaynakları</b>${kutu.sorular.length
            ? `<ul class="dk-liste">${kutu.sorular.map((s) => `<li>${s.metin} <span class="dk-soluk">→ ${ESLESME[s.konu].map((id) => kunye(AYETLER[id])).join(", ")}</span></li>`).join("")}</ul>`
            : `<p class="dk-soluk">Bilgi kutun boş görünüyor. 5. adıma dönüp soru atarsan burada kaynaklarıyla eşleşir.</p>`}`;
          ctx.gorevTamam();
        },
      });
      kap.append(sonuc);
      return sahneApi(ctx, { saat: "gun", bak: "yigin" });
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Değerlendir ve çıkarım yap",
    cikti: "DKAB.10.1.2-ç, d",
    anlatim: `
      <p><b>Kelam</b> ilmi, Allah'ın varlığını ve âlemle ilişkisini akli delillerle de açıklar. <b>Hudûs</b> delili: değişen her şey sonradan var olmuştur; sonradan olanın bir yaratıcısı vardır.</p>
      <p>Doğru bir <b>çıkarım</b>, elimizdeki bilgilerle çelişmez (bk. ${kunye(AYETLER.sura11)}, ${kunye(AYETLER.fatir15)}).</p>`,
    gorev: "Hudûs delilini sırala ve sekiz çıkarımı <b>çıkarılabilir / çıkarılamaz</b> diye değerlendir.",
    ogretmen: "Program, öğrencilerin edindikleri bilgileri öğretmen rehberliğinde değerlendirerek çıkarımda bulunmasını, bu süreçte düşün-eşleş-paylaş tekniğinin kullanılmasını ve öğrencilerin insanın âlemdeki yerini ve Allah karşısındaki konumunu fark etmesini öneriyor (E3.6, D10.1). Performans görevi önerisi: Allah-âlem ilişkisiyle ilgili bir deneme yazma (bilgi toplama, inceleme, yorumlama, dil ve anlatım ölçütleri).",
    anlat: [
      { s: "Kumda bir <b>ayak izi</b> gördün. Kimseyi görmedin ama “buradan biri geçmiş” dersin.", yap: (api) => { api.saat("aksam"); api.bak("genel"); } },
      { s: "Uzaktaki duman da böyle: ateşi görmeden dumandan ateşe ulaşırız. Buna <b>akıl yürütme</b> denir.", yap: (api) => api.bak("duman") },
      { s: "<b>Kelam</b> ilmi, Allah'ın varlığını ve âlemle ilişkisini akli delillerle de açıklar." },
      { s: "Bu delillerden biri <b>hudûs</b> delilidir. Hudûs, “sonradan var olmak” demektir." },
      { baslik: "Birlikte düşünelim: terastaki akasya", yap: (api) => api.bak("genel"), cozum: ["Bu akasya bir tohumdan büyüdü; <b>değişti</b>.", "Değişen bir şeyin <b>bir başlangıcı</b> vardır.", "Başlangıcı olan bir şeyi <b>bir sebep</b> var etmiştir.", "Hudûs delili aynı düşünceyi bütün âleme uygular."] },
      { soru: "Delile göre değişen her şey için ne söylenebilir?", secenekler: ["Başlangıcı yoktur", "Sonradan var olmuştur", "Kendiliğinden var olmuştur"], dogru: 1,
        aciklama: "Değişen bir şeyin başlangıcı vardır; o sonradan var olmuştur (hâdistir).", ipucu: "Hudûs kelimesinin anlamını hatırla." },
      { s: "Delilin sonucu: Âlemin, kendisi sonradan olmayan, <b>ezelî</b> (başlangıcı olmayan) bir yaratıcısı vardır." },
      { s: "Bilgilerden yeni bir sonuç çıkarmaya <b>çıkarım</b> denir. Doğru çıkarım, elimizdeki bilgilerle <b>çelişmez</b>." },
      { soru: `“${AYETLER.fatir15.anlam}” Hangi çıkarım bu ayetle çelişir?`, secenekler: ["İnsan Allah'a muhtaçtır.", "Allah'ın hiçbir şeye ihtiyacı yoktur.", "Allah, yarattıklarına muhtaçtır."], dogru: 2,
        aciklama: "Ayet, Allah'ın hiçbir şeye muhtaç olmadığını bildirir.", ipucu: "Ayetin ikinci yarısını oku." },
      { s: "Şimdi sen dene: 1. sekmede delilin adımlarını sırala; 2. sekmede sekiz çıkarımı değerlendir." },
    ],
    anlatBitti: (api) => api.sifirla(),
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Bilgiden çıkarıma" });
      ctx.sahne.saat("aksam"); ctx.sahne.bak("duman");
      igneler(ctx, [["dumanUst", "Duman<small>Görülen izden ateşin varlığına: akıl yürütme</small>", { renk: "#4fc3f7" }]]);
      let delil = false, cikarim = false;
      const bak = () => delil && cikarim && ctx.gorevTamam();
      const sek = sekmeler(kap, [
        { ad: "1. Delili kur", kur: (k) => {
          k.append(el("div", { class: "dk-soluk" }, "Âlemin sonradan olması (hudûs) delilinin adımlarını öncüllerden sonuca doğru sırala."));
          siralama({
            kap: k,
            ogeler: [
              { id: "d1", metin: "Âlemde gözlediğimiz her şey değişir: oluşur, büyür, dönüşür, yok olur.", ek: "gözlem" },
              { id: "d2", metin: "Değişen bir şeyin bir başlangıcı vardır; o, sonradan var olmuştur (hâdistir).", ek: "1. öncül" },
              { id: "d3", metin: "Sonradan var olan her şeyin onu var eden bir sebebi vardır.", ek: "2. öncül" },
              { id: "d4", metin: "O hâlde âlemin, kendisi sonradan olmayan, ezelî bir yaratıcısı vardır.", ek: "sonuç" },
            ],
            basariMesaji: "Delil kuruldu: gözlemden öncüllere, öncüllerden sonuca.",
            bitti: () => { delil = true; sek.bitti(0); setTimeout(() => sek.ac(1), 900); bak(); },
          });
        } },
        { ad: "2. Çıkarım yap", kur: (k) => siniflandirma({
          kap: k, deste: 1, sutun: 2,
          kategoriler: [{ id: "evet", ad: "Bilgilerden çıkarılabilir", renk: "#5ad38b" }, { id: "hayir", ad: "Bilgilerle çelişir, çıkarılamaz", renk: "#ff6b6b" }],
          kartlar: [
            { id: "c1", metin: "Âlem var olmak için Allah'a muhtaçtır; Allah ise âleme muhtaç değildir.", dogru: "evet", aciklama: `${kunye(AYETLER.fatir15)} ve İhlâs suresi bunu bildirir.` },
            { id: "c2", metin: "Âlemdeki düzen ve ölçü tesadüf eseri değildir.", dogru: "evet", aciklama: `${kunye(AYETLER.mulk3)} ve ${kunye(AYETLER.furkan2)}: her şey bir ölçüyle yaratılmıştır.` },
            { id: "c3", metin: "Allah âlemi yaratmakla kalmaz, onu her an yönetir.", dogru: "evet", aciklama: `“O her an yeni bir iştedir.” (${kunye(AYETLER.rahman29)})` },
            { id: "c4", metin: "İnsan akıl ve irade verilmiş, sorumlu ve onurlu bir varlıktır.", dogru: "evet", aciklama: `${kunye(AYETLER.isra70)} ve ${kunye(AYETLER.ahzab72)}: insan emaneti yüklenmiştir.` },
            { id: "c5", metin: "Allah âlemi yaratıp kendi hâline bırakmıştır.", dogru: "hayir", aciklama: `Bu görüş, Allah'ın âlemi her an yönettiğini bildiren ${kunye(AYETLER.rahman29)} ile çelişir.` },
            { id: "c6", metin: "Allah ile âlem aynı şeydir; her şey Allah'tır.", dogru: "hayir", aciklama: `Yaratan ile yaratılan ayrıdır: “O'nun benzeri hiçbir şey yoktur.” (${kunye(AYETLER.sura11)})` },
            { id: "c7", metin: "Gördüğümüz ve ölçebildiğimiz şeylerden başka hiçbir varlık yoktur.", dogru: "hayir", aciklama: `Gayb âlemini bildiren ${kunye(AYETLER.enam59)} ve ${kunye(AYETLER.bakara3)} ile çelişir.` },
            { id: "c8", metin: "İnsanın âlemde hiçbir özel görevi ve sorumluluğu yoktur.", dogru: "hayir", aciklama: `${kunye(AYETLER.bakara30)} (halife) ve ${kunye(AYETLER.zariyat56)} (kulluk) ile çelişir.` },
          ],
          bitti: () => { cikarim = true; sek.bitti(1); bak(); },
        }) },
      ]);
      ctx.yaziAlani({ etiket: "İsteğe bağlı: Allah-âlem ilişkisi ve insanın âlemdeki yeri hakkında kısa bir deneme paragrafı yaz.", anahtar: "dkab-deneme", enAz: 100 });
      return sahneApi(ctx, { saat: "aksam", bak: "duman" });
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "İsrâ 36 ve Mülk 23: çözümle",
    cikti: "DKAB.10.1.3-a, b",
    anlatim: `
      <p>İsrâ 36 bilgiye dayanmayan şeyin ardına düşmemeyi ve kulak, göz, gönülden sorumlu olunduğunu; Mülk 23 bu araçların şükür gerektiren <b>nimetler</b> olduğunu bildirir.</p>
      <p>İki ayet de <b>Mekke döneminde</b> inen surelerdendir; ayetlerde belirli bir kişi ya da yer adı geçmez.</p>`,
    gorev: "On bir anahtar kavramın hepsini bul ve yedi konuyu doğru sınıflandır.",
    ogretmen: "Program, İsra 36 ve Mülk 23. ayetlerin Diyanet İşleri Başkanlığının matbu ve dijital meallerinden bulunarak incelenmesini, nüzul sebeplerine, ayetlerde geçen şahıs, yer, konu ve kavramlara yer verilmesini; bu süreçte bilgi kartlarının kullanılmasını öneriyor (OB2, SDB2.1). Ekrandaki metinler meal değil, ayetlerin kısaltılmış anlamıdır; sınıfta Diyanet meali ile karşılaştırın.",
    anlat: [
      { s: "Bir arkadaşın “Bu soru sınavda kesin çıkacak” dedi. Nereden bildiğini sordun: “Öyle duydum.”", yap: (api) => { api.saat("gun"); api.bak("kitap"); } },
      { s: `Kur'an bu duruma bir ilke koyar: “Hakkında bilgin olmayan bir şeyin ardına düşme.” (${kunye(AYETLER.isra36)})` },
      { s: "Ayet şöyle devam eder: <b>kulak, göz ve gönül</b>, her biri yaptığından sorumludur." },
      { s: "<b>Gönül</b> (fuâd), Kur'an'da düşünme, anlama ve hissetme merkezidir; aklı ve kalbi birlikte anlatır." },
      { soru: "İsrâ 36'ya göre söylentiyle konuşmak neden doğru değildir?", secenekler: ["Söylenti bilgi değildir ve duyularımızdan sorumluyuz", "Söylentiler her zaman yalandır", "Konuşmak her zaman yanlıştır"], dogru: 0,
        aciklama: "Söylenti doğru da çıkabilir ama bilgiye dayanmaz. İnsan kulağını, gözünü, gönlünü nasıl kullandığından sorumludur.", ipucu: "Ayetin ikinci yarısını hatırla." },
      { s: `İkinci ayet: “Sizi var eden, size işitme, görme ve gönüller veren O'dur. Ne kadar da az şükrediyorsunuz!” (${kunye(AYETLER.mulk23)})` },
      { s: "Burada aynı üç araç <b>nimet</b> olarak anılır. <b>Şükür</b>, nimeti verene teşekkür etmek ve onu amacına uygun kullanmaktır." },
      { s: "İki sure de <b>Mekke döneminde</b> inmiştir. Ayetlerde belirli bir kişi ya da yer adı geçmez." },
      { baslik: "Birlikte karşılaştıralım", cozum: ["İsrâ 36: kulak, göz, gönül → <b>sorumluluk</b>.", "Mülk 23: işitme, görme, gönül → <b>nimet ve şükür</b>.", "Ortak nokta: bilgi araçlarını <b>doğru kullanmak</b>."] },
      { soru: "Mülk 23'teki “De ki” hitabı kime yöneliktir?", secenekler: ["Hz. Peygamber'e", "Meleklere", "Ayette adı geçen bir kişiye"], dogru: 0,
        aciklama: "“De ki” emri Hz. Peygamber'e yöneliktir; ayetin mesajı ise bütün insanlaradır.", ipucu: "Vahyi insanlara kim bildirir?" },
      { s: "Şimdi sen dene: 1. sekmede ayetlerdeki anahtar kavramlara dokun; 2. sekmede konuları sınıflandır." },
    ],
    anlatBitti: (api) => api.sifirla(),
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Bilgi kartlarıyla çözümleme" });
      ctx.sahne.saat("gun"); ctx.sahne.bak("kitap");
      let bulundu = false, sinif = false;
      const bak = () => bulundu && sinif && ctx.gorevTamam();
      const sek = sekmeler(kap, [
        { ad: "1. Anahtar kavramlar", kur: (k) => {
          const toplam = COZUMLE.reduce((t, a) => t + a.parca.filter((p) => p[1]).length, 0);
          const bulunan = new Set();
          const kart = el("div", { class: "ok-kutu dk-bilgi-karti" }, el("span", { class: "dk-soluk" }, "Ayet metnindeki bir sözcüğe dokun."));
          const sayac = el("div", { class: "ok-ilerleme" });
          for (const a of COZUMLE) {
            const metin = el("p", { class: "dk-ayet-metin" });
            a.parca.forEach(([t, not]) => {
              if (not) metin.append(el("button", { class: "dk-kelime", "data-kavram": t, onclick: (e) => {
                e.currentTarget.classList.add("bulundu"); bulunan.add(`${a.id}:${t}`);
                kart.innerHTML = `<b>${t}</b> <span class="dk-soluk">(${kunye(AYETLER[a.id])})</span><br>${not}`;
                yaz();
              } }, t));
              else t.split(/(\s+)/).forEach((w) => metin.append(/\S/.test(w) ? el("span", { class: "dk-kelime soluk", onclick: () => { kart.innerHTML = `<span class="dk-soluk">“${w.replace(/[.,;:!]/g, "")}” bu ayetin bağlamı için önemli ama anahtar kavram değil. Bilgi, duyu, sorumluluk ve nimetle ilgili sözcükleri ara.</span>`; } }, w) : w));
            });
            k.append(el("div", { class: "ok-kutu" }, el("div", { class: "dk-kunye-baslik" }, kunye(AYETLER[a.id])), metin));
          }
          k.append(kart, sayac);
          function yaz() {
            sayac.textContent = `Bulunan anahtar kavram: ${bulunan.size}/${toplam}`;
            if (bulunan.size === toplam && !bulundu) { bulundu = true; sek.bitti(0); kart.innerHTML += `<br><b style="color:var(--yesil)">✓ Hepsini buldun. Şimdi 2. sekmede konuları sınıflandır.</b>`; bak(); }
          }
          yaz();
        } },
        { ad: "2. Konuları sınıflandır", kur: (k) => siniflandirma({
          kap: k, sutun: 3,
          kategoriler: [{ id: "isra", ad: "İsrâ 17/36", renk: "#4fc3f7" }, { id: "ikisi", ad: "İkisinde de", renk: "#ffb547" }, { id: "mulk", ad: "Mülk 67/23", renk: "#5ad38b" }],
          kartlar: [
            { id: "t1", metin: "Bilgisizce yargıda bulunmamak", dogru: "isra", aciklama: "İsrâ 36: Bilmediğin şeyin ardına düşme." },
            { id: "t2", metin: "Söylentiye dayanarak konuşmamak", dogru: "isra", aciklama: "İsrâ 36: Zan ve söylenti bilgi değildir." },
            { id: "t3", metin: "Duyu ve gönülden sorumlu olmak", dogru: "isra", aciklama: "İsrâ 36: Kulak, göz ve gönül yaptığından sorumludur." },
            { id: "t4", metin: "İşitme, görme ve gönül", dogru: "ikisi", aciklama: "Her iki ayette de bu üç bilgi aracı birlikte geçer." },
            { id: "t5", metin: "İnsanı var edenin Allah olması", dogru: "mulk", aciklama: "Mülk 23: Sizi var eden O'dur." },
            { id: "t6", metin: "Nimetlere şükretmek", dogru: "mulk", aciklama: "Mülk 23: Ne kadar da az şükrediyorsunuz!" },
            { id: "t7", metin: "Bilgi araçlarını doğru kullanmak", dogru: "ikisi", aciklama: "İsrâ 36 sorumluluğu, Mülk 23 nimet ve şükrü vurgular: ikisi de bilgi araçlarının doğru kullanımına çağırır." },
          ],
          bitti: () => { sinif = true; sek.bitti(1); bak(); },
        }) },
      ]);
      return sahneApi(ctx, { saat: "gun", bak: "kitap" });
    },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Ayetlerin mesajı hayatta",
    cikti: "DKAB.10.1.3-c",
    anlatim: `
      <p>Ayetlerin mesajını anlamanın en iyi yolu onları gündelik durumlara uygulamaktır: araştırmadan konuşmamak, bilgi araçlarını korumak ve doğru kullanmak.</p>
      <p>“${HADISLER.duydugunuAnlatma.anlam}” (${HADISLER.duydugunuAnlatma.kaynak})</p>`,
    gorev: "Dört durumun hepsinde ayetlere uygun davranışı seç ve iki ayetin mesajını kendi cümlelerinle özetle.",
    ogretmen: "Program, öğrencilerin ayetlerde ele alınan konuları açıklamasını ve ölçme-değerlendirmede çalışma yaprağı kullanılmasını öneriyor (SDB2.1). Durumlar, doğru bilgiyi elde etmeye yönlendirerek öğrencinin duygu, düşünce ve davranışlarından sorumlu olduğunu fark etmesini amaçlar (D16.1). Özet yazıları çalışma yaprağı yerine kullanılabilir.",
    anlat: [
      { s: "Bir ilkeyi anladığını göstermenin en iyi yolu, onu <b>hayatta uygulamaktır</b>.", yap: (api) => { api.saat("safak"); api.bak("ufuk"); } },
      { s: "Telefonuna bir mesaj geldi: “Bu çikolatada zehir bulundu, herkese yolla!” Kaynak yok." },
      { soru: "İsrâ 36'ya göre ilk ne yapmalısın?", secenekler: ["Hemen yollarım, belki doğrudur", "Önce güvenilir bir kaynaktan araştırırım", "Mesajı yazana kızarım"], dogru: 1,
        aciklama: "Bilgin olmayan şeyin ardına düşme: önce araştır, doğrulanmadıysa paylaşma.", ipucu: "Ayet, bilgimiz olmayan şey için ne diyordu?" },
      { s: `Peygamberimiz de uyarmıştır: “${HADISLER.duydugunuAnlatma.anlam}” (${HADISLER.duydugunuAnlatma.kaynak})` },
      { s: "Mülk 23 de bir davranış önerir: göz, kulak ve gönül <b>nimettir</b>; onları korumak da şükürdür." },
      { baslik: "Birlikte yapalım: Mülk 23 bir öğrenciye ne söyler?", cozum: ["Durum: Bütün gece kulaklıkla yüksek sesle müzik dinliyorum.", "Kulak bir nimettir (Mülk 23).", "Nimeti hor kullanmak şükürle bağdaşmaz.", "Davranış: Sesi kısar, kulağımı korurum."] },
      { soru: "Hangisi gönül (düşünme gücü) nimetini doğru kullanmaktır?", secenekler: ["Hiç düşünmeden karar vermek", "Soru sorup düşünerek öğrenmek", "Herkes ne diyorsa ona inanmak"], dogru: 1,
        aciklama: "Gönül düşünme ve kavrama gücüdür; onu kullanmak nimeti amacına uygun kullanmaktır.", ipucu: "Gönül neyin merkeziydi?" },
      { s: "Bir ayetin mesajını <b>kendi cümlelerinle</b> anlatabiliyorsan, onu gerçekten anlamışsındır." },
      { s: "Şimdi sen dene: dört durumda ayetlere en uygun davranışı seç, sonra iki ayetin mesajını kendi cümlelerinle özetle." },
    ],
    anlatBitti: (api) => api.sifirla(),
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Ne yapardın?" });
      ctx.sahne.saat("safak"); ctx.sahne.bak("ufuk");
      const DURUM = [
        { id: "d1", metin: "📱 Bir mesaj grubunda “Yarın okullar tatil!” yazıyor. Kaynağı belli değil, herkes paylaşıyor.", siklar: [
          ["Hemen paylaşırım; herkes paylaşıyorsa doğrudur.", false, "Çok paylaşılması haberi mütevatir yapmaz: hepsi aynı kaynağı tekrarlıyor olabilir. İsrâ 36: Bilmediğin şeyin ardına düşme."],
          ["Resmî kaynaktan doğrularım; doğrulanmadıysa paylaşmam.", true, "İsrâ 36 ve Hucurât 6'nın mesajı: haberi araştır, bilgiye dayanmadan konuşma."],
          ["Paylaşırım, yanlışsa başkası düzeltir.", false, "Sorumluluk başkasına devredilemez: kulak, göz ve gönül yaptığından sorumludur."]] },
        { id: "d2", metin: "🗣️ Bir arkadaşın hakkında kötü bir söz duydun; doğru olup olmadığını bilmiyorsun.", siklar: [
          ["Duyduğumu başkalarına da anlatırım.", false, "Peygamberimiz, duyduğu her şeyi anlatmanın kişiye yalan olarak yeteceğini söylemiştir (Müslim, Mukaddime, 5)."],
          ["Araştırmadan bu konuda konuşmam; gerekirse arkadaşımla doğrudan konuşurum.", true, "Bilgiye dayanmayan sözün ardına düşmemek İsrâ 36'nın temel mesajıdır."],
          ["Herkes biliyorsa doğrudur diye kabul ederim.", false, "Söylentinin yaygın olması onu doğru yapmaz."]] },
        { id: "d3", metin: "🌙 Gece geç saatlere kadar ekrana bakıyorsun; gözlerin yanıyor, uykusuz kalıyorsun.", siklar: [
          ["Gözlerim nasılsa iyileşir, önemsemem.", false, "Mülk 23: Görme bir nimettir; nimeti hor kullanmak şükürle bağdaşmaz."],
          ["Ekran süremi sınırlar, gözlerimi korurum.", true, "Nimeti amacına uygun kullanmak ve korumak şükrün bir parçasıdır (Mülk 23)."],
          ["Gözler yalnızca görmek içindir; sorumluluğu yoktur.", false, "İsrâ 36: Göz de yaptığından sorumludur."]] },
        { id: "d4", metin: "📚 Derste bir konuyu anlamadın; sınav yaklaşıyor.", siklar: [
          ["Anlamadan ezberler geçerim.", false, "Gönül (fuâd) düşünme ve kavrama gücüdür; onu kullanmadan ezber, bilgiye dönüşmez."],
          ["Anlayana kadar sorar, araştırır, düşünürüm.", true, "Allah'ın verdiği işitme, görme ve gönül nimetlerini bilgiye ulaşmak için kullanmak, ayetlerin ortak mesajıdır."],
          ["Konu hakkında tahminle cevap yazarım.", false, "İsrâ 36: Bilgin olmayan şeyin ardına düşme."]] },
      ];
      const dogrular = new Set();
      let yazi = false;
      const bak = () => dogrular.size === DURUM.length && yazi && ctx.gorevTamam();
      const sayac = el("div", { class: "ok-ilerleme" });
      for (const d of DURUM) {
        const geri = el("div", { class: "d-geri-bildirim" });
        kap.append(el("div", { class: "ok-kutu dk-durum-kart", "data-durum": d.id }, el("b", {}, d.metin),
          el("div", { class: "dk-siklar", style: "margin-top:8px" }, karistir(d.siklar).map(([m, ok, a]) => el("button", { class: "ok-kart", "data-dogru": ok ? "1" : null, onclick: (e) => {
            e.currentTarget.parentNode.querySelectorAll(".ok-kart").forEach((b) => b.classList.remove("dogru", "yanlis"));
            e.currentTarget.classList.add(ok ? "dogru" : "yanlis");
            geri.className = `d-geri-bildirim ${ok ? "dogru" : "yanlis"}`; geri.textContent = a;
            if (ok) dogrular.add(d.id); else dogrular.delete(d.id);
            sayac.textContent = `Ayetlere uygun seçim: ${dogrular.size}/${DURUM.length}`;
            bak();
          } }, m))), geri));
      }
      kap.append(sayac);
      sayac.textContent = `Ayetlere uygun seçim: 0/${DURUM.length}`;
      ctx.yaziAlani({ etiket: "İsrâ 36 ve Mülk 23. ayetlerin mesajını kendi cümlelerinle özetle.", anahtar: "dkab-ayet-ozet", enAz: 80, yeterli: () => { yazi = true; bak(); } });
      return sahneApi(ctx, { saat: "safak", bak: "ufuk" });
    },
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Değerlendirme",
    cikti: "DKAB.10.1",
    anlatim: `
      <p>Dokuz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>7 doğru</b> yaparsan dersi tamamlamış olursun.</p>`,
    gorev: "Değerlendirmede en az <b>7/9</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (açık uçlu sorular, kavram haritası, çalışma yaprağı) uyumludur. Ek olarak öğrencilerden bilgi kaynaklarını gösteren bir kavram haritası çizmeleri istenebilir.",
    anlat: [
      { s: "Derse bir soruyla başladık: <b>Bunu nereden biliyorsun?</b> Şimdi kısaca toparlayalım.", yap: (api) => { api.saat("aksam"); api.bak("genel"); } },
      { s: "Nesnel bilgi kaynakları: <b>salim duyular</b>, <b>selim akıl</b> ve <b>sadık haber</b>, yani mütevatir haber ve vahiy." },
      { s: "Kaynaklar birbirini <b>destekler ve denetler</b>. Doğru bilgi doğru inanca, doğru inanç doğru davranışa yol açar." },
      { s: "Âlem ikidir: algılanabilen <b>şehadet âlemi</b> ve bilgisine vahiyle ulaşılan <b>gayb âlemi</b>." },
      { soru: "Hangisi <b>öznel</b> bir bilgi kaynağıdır?", secenekler: ["Mütevatir haber", "Sezgi", "Selim akıl"], dogru: 1,
        aciklama: "Sezgi, ilham ve rüya kişiye özgüdür; başkasına delil olmaz.", ipucu: "Hangisi yalnızca kişinin kendisi için geçerlidir?" },
      { s: "Allah âlemi yaratmış ve her an yönetir. Âlem O'na muhtaçtır; O hiçbir şeye muhtaç değildir." },
      { s: "İsrâ 36 bilgisiz yargıya karşı uyarır. Mülk 23, bilgi araçlarımızın şükür gerektiren nimetler olduğunu hatırlatır." },
      { s: "Şimdi sen dene: dokuz soruluk değerlendirmeyi çöz. En az <b>yedi doğru</b> yaparsan dersi tamamlarsın." },
    ],
    anlatBitti: (api) => api.sifirla(),
    kur(ctx) {
      ctx.sahne.saat("aksam"); ctx.sahne.bak("genel");
      ctx.sinav([
        { tur: "coktan", metin: "İslam düşüncesinde <b>nesnel</b> bilgi kaynakları hangileridir?",
          siklar: ["Rüya, ilham ve sezgi", "Sadık haber, selim akıl ve salim duyular", "Yalnızca duyular", "Söylenti ve tahmin"],
          dogru: 1, aciklama: "Nesnel kaynaklar herkes için geçerlidir: sadık haber (mütevatir haber ve vahiy), selim akıl, salim duyular. Rüya, ilham ve sezgi öznel kaynaklardır." },
        { tur: "coktan", metin: "<b>Mütevatir haber</b> hangisidir?",
          siklar: ["Tek bir güvenilir kişinin aktardığı haber", "Sosyal medyada çok paylaşılan her haber", "Yalan üzerinde birleşmeleri aklen mümkün olmayan, birbirinden bağımsız kalabalık bir topluluğun aktardığı haber", "Rüyada öğrenilen haber"],
          dogru: 2, aciklama: "Önemli olan aktarıcıların hem çok hem de bağımsız olmasıdır. Aynı paylaşımı tekrarlayan kalabalık tek bir kaynaktır." },
        { tur: "coktan", metin: "Hangisi <b>gayb</b> âlemine aittir?",
          siklar: ["Bakteriler", "Elektrik akımı", "Melekler", "Uzak galaksiler"],
          dogru: 2, aciklama: "Bakteri, elektrik ve galaksiler araçlarla gözlenir: şehadet âlemi. Meleklerin bilgisi vahiyle gelir: gayb âlemi." },
        { tur: "coktan", metin: "“Duyular bazen yanılabilir.” Bu yargıdan hangisi çıkar?",
          siklar: ["Duyular hiçbir bilgi vermez.", "Duyulardan gelen bilgi akıl ve ölçme araçlarıyla denetlenmelidir.", "Akıl duyulara ihtiyaç duymaz.", "Gördüğümüz her şey yanılsamadır."],
          dogru: 1, aciklama: "Bilgi kaynakları birbirini tamamlar: selim akıl, salim duyulardan gelen bilgiyi sınar." },
        { tur: "coktan", metin: `“O her an yeni bir iştedir.” (${kunye(AYETLER.rahman29)}) ayeti hangi görüşle <b>çelişir</b>?`,
          siklar: ["Allah âlemi yaratıp kendi hâline bırakmıştır.", "Allah âlemi yönetir.", "Âlem Allah'a muhtaçtır.", "Âlemde bir düzen vardır."],
          dogru: 0, aciklama: "Ayet, Allah'ın yaratma ve yönetmesinin sürekli olduğunu bildirir; âlemin kendi hâline bırakıldığı görüşüyle çelişir." },
        { tur: "coktan", metin: "Kelamdaki <b>hudûs</b> (âlemin sonradan olması) delilinin sonucu hangisidir?",
          siklar: ["Âlem ezelîdir, başlangıcı yoktur.", "Âlem kendiliğinden var olmuştur.", "Âlemin, kendisi sonradan olmayan bir yaratıcısı vardır.", "Âlemde değişim yoktur."],
          dogru: 2, aciklama: "Değişen sonradan olmuştur; sonradan olanın bir yaratıcısı vardır. Bu yaratıcı sonradan olmayan, ezelî olandır." },
        { tur: "coktan", metin: `${kunye(AYETLER.isra36)} hangi davranışı öğütler?`,
          siklar: ["Bilmediği bir konuda kesin konuşmamayı ve araştırmayı", "Duyduğu her haberi hemen paylaşmayı", "Yalnızca gözle görüleni kabul etmeyi", "Hiç soru sormamayı"],
          dogru: 0, aciklama: "Ayet bilgiye dayanmayan şeyin ardına düşmemeyi ve kulak, göz, gönülden sorumlu olunduğunu bildirir." },
        { tur: "coktan", metin: `${kunye(AYETLER.mulk23)} işitme, görme ve gönül için ne söyler?`,
          siklar: ["İnsanın kendi kendine kazandığı yeteneklerdir.", "Allah'ın verdiği ve şükrü gerektiren nimetlerdir.", "Bilgi edinmede işe yaramazlar.", "Yalnızca peygamberlere verilmiştir."],
          dogru: 1, aciklama: "Ayet, bunları verenin Allah olduğunu ve insanların az şükrettiğini hatırlatır." },
        { tur: "coktan", metin: "İsrâ 36 ve Mülk 23. ayetlerin <b>ortak</b> konusu hangisidir?",
          siklar: ["Kıyametin vakti", "Kulak, göz ve gönül", "Meleklerin görevleri", "Namaz vakitleri"],
          dogru: 1, aciklama: "İki ayette de işitme, görme ve gönül birlikte geçer: biri sorumluluğu, öteki nimet ve şükrü vurgular." },
      ], { baslik: "İslam'da varlık ve bilgi", gecmeOrani: 0.75 });
      return sahneApi(ctx, { saat: "aksam", bak: "genel" });
    },
  },
];

dersBaslat({ adimlar, sahneKur: tefekkurDunyasi });
