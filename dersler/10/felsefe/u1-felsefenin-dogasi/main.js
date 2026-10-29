// 10. Sınıf Felsefe · 1. Ünite: Felsefenin Doğası
// FEL.10.1.1 Felsefenin anlamını, gelişim sürecini ve işlevini sorgulayabilme (a–d süreç bileşenleri)
import { dersBaslat, el } from "../../../../engine/ders.js";
import { sahneKap, sekmeler, siniflandirma, zamanCizelgesi, geriBildirim, karistir, sahneKartiAc } from "../_ortak/etkilesim.js";
import { harita } from "../_ortak/harita.js";
import { GELENEKLER, DUSUNURLER, KENTLER } from "./veri.js";
import egeVeri from "./harita-veri.json";
import { miletDunyasi, igneler } from "./milet.js";
import { TAHTA } from "./gemi.js";

const yilYaz = (y) => (y < 0 ? `MÖ ${-Math.round(y)}` : y === 0 ? "0" : `${Math.round(y)}`);

/* ---------- 1. adım: kavram ağı (felsefe ve ilişkili kavramlar) ---------- */
const KAVRAMLAR = [
  { id: "sevgi", ad: "Sevgi", dogru: "Felsefe bilgeliğe duyulan sevgiyle başlar: filozof, bilgeliğe sahip olan değil, onu seven ve arayan kişidir.",
    yanlis: [["Felsefe, insanlar arasındaki duygusal ilişkileri inceleyen bir alandır.", "Sözcüğün kökündeki “sevgi”, kişilere değil bilgeliğe duyulan tutkuyu anlatır."],
             ["Felsefe, sevdiğimiz fikirleri her koşulda savunmaktır.", "Felsefe sevdiği fikri de sorgular; savunmak için değil anlamak için düşünür."]] },
  { id: "arayis", ad: "Arayış", dogru: "Felsefe hazır cevap almak yerine yolda olmaktır; bulunan her cevap yeni bir arayış başlatır.",
    yanlis: [["Felsefe, aranan cevap bulununca sona eren bir etkinliktir.", "Felsefi cevaplar yeni sorular doğurur; arayış bitmez."],
             ["Felsefe, kaybolan eşyaları bulma yöntemlerini araştırır.", "Burada arayış, hakikati ve anlamı aramaktır."]] },
  { id: "hakikat", ad: "Hakikat", dogru: "Felsefe, görünüşün ardındaki gerçeği, “aslında olan”ı anlamaya çalışır.",
    yanlis: [["Felsefe, hakikati kesin ve değişmez biçimde ezberletir.", "Felsefe hakikati arar; ona sahip olduğunu iddia etmez."],
             ["Felsefe, yalnızca herkesin kabul ettiği görüşleri hakikat sayar.", "Çoğunluğun kabulü bir şeyi doğru yapmaz; felsefe bunu da sorgular."]] },
  { id: "bilgi", ad: "Bilgi", dogru: "Felsefe bilgiyi hem arar hem de sorgular: “Neyi, nasıl ve ne kadar biliyorum?”",
    yanlis: [["Felsefe, deneyle ölçülen bilgileri toplayıp tablolaştırır.", "Bu daha çok bilimin işidir. Felsefe bilginin kendisini, sınırlarını ve dayanaklarını sorgular."],
             ["Felsefe, bilginin değil, yalnızca inançların alanıdır.", "Felsefe akıl yürütmeye dayanır; bilginin ne olduğu onun temel sorularındandır."]] },
  { id: "erdem", ad: "Erdem", dogru: "Felsefe, iyi ve doğru yaşamanın ne olduğunu düşünerek insanı erdemli eyleme yöneltir.",
    yanlis: [["Felsefe, iyi ve kötü hakkında hiçbir şey söylemez.", "Ahlak (etik) felsefenin temel alanlarından biridir."],
             ["Felsefe, erdemi yalnızca kurallar listesi olarak öğretir.", "Felsefe kuralların neden iyi olduğunu sorgular; liste ezberletmez."]] },
  { id: "bilinc", ad: "Bilinç", dogru: "Felsefe, insanın kendini ve düşüncelerini fark etmesini, kendi üzerine düşünmesini sağlar.",
    yanlis: [["Felsefe, bayılan birinin bilincini yerine getirme yöntemidir.", "Burada bilinç, insanın kendini ve dünyayı fark etmesidir."],
             ["Felsefe, insanın kendini unutup yalnızca dış dünyaya bakmasıdır.", "“Kendini bil” felsefenin en eski çağrılarındandır."]] },
  { id: "dusunme", ad: "Düşünme", dogru: "Felsefe düşüncenin kendisini de düşünür: akıl yürütmeyi tutarlı ve sistemli hâle getirir.",
    yanlis: [["Felsefe, düşünmeden önce hemen karar vermeyi öğretir.", "Felsefe peşin hükümden kaçınmayı, gerekçeyle düşünmeyi öğretir."],
             ["Felsefe, yalnızca hayal kurmaktır.", "Hayal gücü önemlidir ama felsefe gerekçeli ve tutarlı düşünmedir."]] },
];

function kavramAgi(kap, bitti) {
  const ag = el("div", { class: "fe-ag" });
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none");
  ag.append(svg, el("div", { class: "fe-merkez" }, "FELSEFE"));
  const secim = el("div", { class: "ok-kutu fe-secim" }, el("span", { class: "fe-soluk" }, "Bir kavrama dokun: felsefeyle ilişkisini en iyi anlatan cümleyi seç."));
  const tamam = new Set();
  const konum = KAVRAMLAR.map((_, i) => {
    const a = (i / KAVRAMLAR.length) * 2 * Math.PI - Math.PI / 2;
    return { x: 50 + 38 * Math.cos(a), y: 50 + 39 * Math.sin(a) };
  });
  const dugme = KAVRAMLAR.map((k, i) => {
    const b = el("button", { class: "d-btn fe-kavram", "data-kavram": k.id, style: `left:${konum[i].x}%;top:${konum[i].y}%`, onclick: () => ac(i) }, k.ad);
    ag.append(b);
    return b;
  });
  function cizgiler() {
    svg.innerHTML = konum.map((p, i) => `<line x1="50" y1="50" x2="${p.x}" y2="${p.y}" stroke="${tamam.has(KAVRAMLAR[i].id) ? "#5ad38b" : "rgba(169,182,201,.35)"}" stroke-width="${tamam.has(KAVRAMLAR[i].id) ? 0.9 : 0.5}" ${tamam.has(KAVRAMLAR[i].id) ? "" : 'stroke-dasharray="1.5 1.5"'} vector-effect="non-scaling-stroke"/>`).join("");
  }
  function ac(i) {
    const k = KAVRAMLAR[i];
    dugme.forEach((b, j) => b.classList.toggle("secili", i === j));
    if (tamam.has(k.id)) { secim.replaceChildren(el("b", {}, `${k.ad}: `), k.dogru); return; }
    const geri = el("div", { class: "d-geri-bildirim" });
    const siklar = karistir([{ m: k.dogru, d: true }, ...k.yanlis.map(([m, n]) => ({ m, n }))]);
    secim.replaceChildren(el("b", {}, `“${k.ad}” ile felsefe arasındaki ilişkiyi en iyi hangisi anlatır?`),
      el("div", { class: "fe-siklar" }, siklar.map((s) => el("button", { class: "ok-kart", "data-dogru": s.d ? "1" : null, onclick: (e) => {
        if (s.d) {
          tamam.add(k.id); dugme[i].classList.add("tamam"); cizgiler();
          geri.className = "d-geri-bildirim dogru"; geri.textContent = `✓ ${k.dogru}`;
          e.currentTarget.classList.add("dogru");
          if (tamam.size === KAVRAMLAR.length) bitti();
        } else { e.currentTarget.classList.add("yanlis"); geri.className = "d-geri-bildirim yanlis"; geri.textContent = `✗ ${s.n}`; }
      } }, s.m))), geri);
  }
  cizgiler();
  kap.append(ag, secim);
}

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "“Felsefe” ne demek?",
    cikti: "FEL.10.1.1-a",
    anlatim: `<p>“Felsefe” Yunanca <b>philo</b> (sevgi) ve <b>sophia</b> (bilgelik) sözcüklerinden gelir: <b>bilgelik sevgisi</b>. Gündelik dilde ise çoğu zaman “ilke, tarz” anlamında kullanılır ya da ön yargıyla küçümsenir.</p>`,
    anlat: [
      { s: "Ayşe derste sordu: “Zaman nedir?” Arkadaşı güldü: “Felsefe yapma!”", yap: (_, ctx) => ctx.sahne.bak("genel") },
      { s: "“Felsefe” sözcüğünü her gün duyarız: <b>hayat felsefem</b>, <b>oyun felsefesi</b>…" },
      { s: "Bu sözlerde felsefe “ilke, tarz” demektir. Buna <b>gündelik anlam</b> diyoruz." },
      { s: "“Felsefe yapma!” gibi sözler ise felsefeyi küçümser. Bunlar <b>ön yargıdır</b>." },
      { soru: "“Felsefe boş iş” cümlesi hangisine örnektir?", secenekler: ["Gündelik anlam", "Ön yargı", "Terim anlamı"], dogru: 1,
        aciklama: "Cümle felsefeyi tanımlamıyor, değersiz sayıyor: ön yargı.", ipucu: "Cümle felsefeyi anlatıyor mu, küçümsüyor mu?" },
      { s: "Peki sözcüğün asıl anlamı ne? İki eski Yunanca sözcükten gelir.", yap: (_, ctx) => ctx.sahne.bak("ufuk") },
      { formul: [["philo", "sevgi"], ["+"], ["sophia", "bilgelik"], ["="], ["philosophia", "bilgelik sevgisi"]],
        s: "Felsefe, <b>bilgeliği sevmek</b> demektir.", oku: "Filo, sevgi. Sofya, bilgelik. Felsefe, bilgelik sevgisi demektir." },
      { s: "<b>Filozof</b>, bilgeliğe sahip olan değil, onu <b>seven ve arayan</b> kişidir." },
      { soru: "Filozof kimdir?", secenekler: ["Her şeyi bilen kişi", "Bilgeliği seven ve arayan kişi", "Çok kitap okuyan kişi"], dogru: 1,
        aciklama: "Filozof bildiğini iddia etmez; merak eder ve arar.", ipucu: "Sözcükteki “sevgi” kısmını hatırla." },
      { baslik: "Birlikte yapalım: Bu cümle hangi kutuya?", cozum: ["“Mutluluğun gerçekte ne olduğunu merak ediyorum.”", "Bir ilke mi söylüyor? Hayır.", "Felsefeyi küçümsüyor mu? Hayır.", "Bir kavramın özünü arıyor: <b>terim anlamına yakın</b>."] },
      { s: "Felsefe; <b>sevgi, arayış, hakikat, bilgi, erdem, bilinç ve düşünme</b> kavramlarıyla iç içedir." },
      { s: "Şimdi sen dene: Cümleleri üç kutuya yerleştir. Sonra kavram ağında yedi bağı kur." },
    ],
    anlatBitti: (_, ctx) => ctx.sahne.bak("genel"),
    gorev: "Cümleleri doğru kutulara yerleştir, ardından <b>kavram ağındaki yedi bağı</b> kur.",
    ogretmen: "Program, öğrencilerden günlük hayatta felsefenin nasıl tanımlandığını iş birliğiyle ifade etmelerini ve ön yargılarını fark etmelerini öneriyor (E1.1, KB2.18, D6.2). Sınıflandırmadan önce öğrencilere kendi duydukları kullanımları sorup tahtaya yazdırabilirsiniz. Kavram ağı, programdaki “sevgi, arayış, hakikat, bilgi, erdem, bilinç ve düşünme” bilgi görselinin etkileşimli hâlidir (OB1).",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Gündelik dilden terim anlamına" });
      ctx.sahne.bak("genel");
      igneler(ctx, [["liman", "Milet limanı<small>MÖ 6. yüzyıl · temsilî canlandırma</small>"]]);
      let a = false, b = false;
      const bak = () => a && b && ctx.gorevTamam();
      const sek = sekmeler(kap, [
        { ad: "1. Gündelik kullanımlar", kur: (k) => siniflandirma({
          kap: k, sutun: 3,
          kategoriler: [
            { id: "gundelik", ad: "Gündelik anlam", aciklama: "Kişisel ilke, tutum, yaklaşım", renk: "#4fc3f7" },
            { id: "onyargi", ad: "Ön yargı", aciklama: "Felsefeyi küçümseyen ya da yanlış tanıtan yargı", renk: "#ff6b6b" },
            { id: "terim", ad: "Terim anlamına yakın", aciklama: "Bilgelik arayışı, sorgulama", renk: "#5ad38b" },
          ],
          kartlar: [
            { id: "k1", metin: "“Benim hayat felsefem: Bugünün işini yarına bırakma.”", dogru: "gundelik", aciklama: "Burada felsefe “kişisel ilke” anlamında kullanılmış.", yanlis: { terim: "Bir ilkeyi benimsemek, onu sorgulamakla aynı şey değildir.", onyargi: "Cümle felsefeyi küçümsemiyor; yalnızca “ilke” anlamında kullanıyor." } },
            { id: "k2", metin: "“Bu lokantanın felsefesi: yerel ve taze ürün.”", dogru: "gundelik", aciklama: "Felsefe burada “temel yaklaşım, ilke” anlamında.", yanlis: { terim: "Bir işletmenin ilkesi, bilgelik arayışı değildir.", onyargi: "Küçümseme yok; gündelik bir kullanım." } },
            { id: "k3", metin: "“Hocanın oyun felsefesi hücum futbolu.”", dogru: "gundelik", aciklama: "Spor dilinde felsefe “tarz, anlayış” demektir.", yanlis: { terim: "Bu bir oyun tarzı; varlık, bilgi ya da değer sorgulaması değil.", onyargi: "Küçümseme yok; gündelik bir kullanım." } },
            { id: "k4", metin: "“Felsefe yapma, kısa kes!”", dogru: "onyargi", aciklama: "Felsefeyi gereksiz laf kalabalığı sayan bir ön yargı.", yanlis: { gundelik: "Cümle felsefeyi “boş söz” olarak küçümsüyor; bu bir ön yargıdır.", terim: "Cümle sorgulamayı değil, sorgulamayı kesmeyi istiyor." } },
            { id: "k5", metin: "“Felsefe boş iş, kimseye bir faydası yok.”", dogru: "onyargi", aciklama: "Felsefenin bireysel ve toplumsal işlevlerini görmezden gelen bir ön yargı (9. adımda tartışacağız).", yanlis: { gundelik: "Bu bir değer yargısı; felsefeyi küçümsüyor.", terim: "Cümle felsefeyi tanımlamıyor, değersiz sayıyor." } },
            { id: "k6", metin: "“Felsefe sadece çok zeki insanlar içindir.”", dogru: "onyargi", aciklama: "Merak eden ve soru soran herkes felsefe yapabilir.", yanlis: { gundelik: "Bu cümle felsefeye ulaşılmaz bir duvar örüyor: ön yargı.", terim: "Felsefe herkesin merakından doğar; cümle bunu reddediyor." } },
            { id: "k7", metin: "“Filozof, her şeyi bilen kişidir.”", dogru: "onyargi", aciklama: "Filozof bilgeliği seven ve arayandır; her şeyi bildiğini iddia etmez.", yanlis: { terim: "Terim anlamı “bilgeliği sevmek”tir, “her şeyi bilmek” değil.", gundelik: "Bu cümle felsefe hakkında yanlış bir genelleme yapıyor." } },
            { id: "k8", metin: "“Doğru bildiklerimi bir de ‘Neden böyle?’ diye sorgulamak istiyorum.”", dogru: "terim", aciklama: "Sorgulama ve gerekçe arama felsefenin özüdür.", yanlis: { gundelik: "Burada bir ilke değil, bir sorgulama var.", onyargi: "Küçümseme yok; tam tersine felsefi bir tutum." } },
            { id: "k9", metin: "“Adaletin ne olduğunu örnekleri karşılaştırarak anlamaya çalışıyoruz.”", dogru: "terim", aciklama: "Bir kavramın özünü aramak felsefi bir etkinliktir.", yanlis: { gundelik: "Bu bir kişisel ilke değil, kavram arayışı.", onyargi: "Küçümseme yok; felsefi bir arayış." } },
          ],
          bitti: () => { a = true; sek.bitti(0); sek.ac(1); bak(); },
        }) },
        { ad: "2. Kavram ağı", kur: (k) => kavramAgi(k, () => { b = true; sek.bitti(1); bak(); }) },
      ]);
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Filozoflar felsefeyi nasıl tanımladı?",
    cikti: "FEL.10.1.1-a",
    anlatim: `<p>Filozoflar felsefeyi farklı tanımladı: kimi <b>varlığa</b>, kimi <b>bilginin sınırına</b>, kimi <b>eyleme</b>, kimi <b>dilin açıklığına</b>, kimi <b>bitmeyen arayışa</b> vurgu yaptı. Ortak bir tanım yapılabilir mi?</p>`,
    anlat: [
      { s: "Beş kişiye “Arkadaşlık nedir?” diye sor. Büyük ihtimalle beş farklı cevap alırsın.", yap: (_, ctx) => ctx.sahne.bak("stoa") },
      { s: "Filozoflar da “Felsefe nedir?” sorusuna farklı cevaplar verdi." },
      { s: "Antik Yunan'da insanlar böyle sütunlu galerilerde, <b>stoalarda</b> sohbet edip tartışırdı." },
      { s: "<b>Aristoteles</b>: Felsefe varlığın ilk nedenlerini araştırır. Vurgusu: <b>varlık</b>." },
      { s: "<b>Kant</b>: Felsefe aklın neyi bilip neyi bilemeyeceğini sorar. Vurgusu: <b>bilgi ve sınır</b>." },
      { s: "<b>Marx</b>: Asıl mesele dünyayı değiştirmektir. Vurgusu: <b>eylem</b>." },
      { soru: "Sokrates: “Sorgulanmamış hayat yaşanmaya değmez.” Bu tanım neyi öne çıkarır?", secenekler: ["Dilin açıklığını", "İyi yaşamayı", "Aklın sınırını"], dogru: 1,
        aciklama: "Sokrates felsefeyi iyi yaşamanın yolu olarak görür.", ipucu: "Cümledeki “hayat” sözcüğüne dikkat et." },
      { baslik: "Birlikte yapalım: Tanımın vurgusunu bul", cozum: ["Tanım: “Felsefe yolda olmaktır.” (Jaspers)", "Anahtar sözcük: <b>yolda</b>.", "Hakikate sahip olmaktan değil, onu aramaktan söz ediyor.", "Vurgusu: <b>bitmeyen bir arayış</b>."] },
      { s: "Tanımlar farklı, ama çoğunda ortak bir iz var: <b>akılla, sorgulayarak aramak</b>." },
      { soru: "Bu kadar farklı tanım ne gösterir?", secenekler: ["Filozoflar birbirini hiç okumamış", "“Felsefe nedir?” sorusu da felsefi bir sorudur", "Felsefenin bir konusu yoktur"], dogru: 1,
        aciklama: "Her filozof kendi çağının sorularından bakar; bu soru da tartışmaya açıktır.", ipucu: "Tek ve kesin cevabı olmayan sorular hangi türdendir?" },
      { s: "Şimdi sen dene: On tanımı vurgularına göre yerleştir. Sonra ortak tanım hakkında iddianı seç ve gerekçeni yaz." },
    ],
    gorev: "Tanımları sınıflandır, ortak tanım sorusunda <b>iddianı seç</b> ve gerekçeni yaz.",
    ogretmen: "Program “Filozofların tanımları neden farklı? Ortak bir tanım yapılabilir mi?” gibi yönlendirici sorularla şüphe duyulmasını öneriyor (E3.9, SDB2.2, D4.2). Tanımlar özgün ifadelerle verilmiştir (Wittgenstein: Tractatus 4.112; Marx: Feuerbach Üzerine Tezler 11; Sokrates: Platon, Savunma 38a). İddia seçenekleri arasında “yanlış” yoktur; gerekçenin niteliğini tartışın.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Hangi tanım neyi öne çıkarıyor?" });
      ctx.sahne.bak("stoa");
      igneler(ctx, [["stoa", "Stoa<small>Sütunlu galeri: sohbet ve tartışma yeri</small>"]]);
      let sinif = false, iddia = null, yazi = false;
      const bak = () => sinif && iddia && yazi && ctx.gorevTamam();
      const KAT = [
        { id: "varlik", ad: "Varlığı ve hakikati anlamak", renk: "#4fc3f7" },
        { id: "bilgi", ad: "Bilgiyi ve aklın sınırını sınamak", renk: "#ffd166" },
        { id: "eylem", ad: "İyi yaşamak, dünyayı değiştirmek", renk: "#5ad38b" },
        { id: "dil", ad: "Düşünceyi ve dili açıklığa kavuşturmak", renk: "#b89cff" },
        { id: "arayis", ad: "Bitmeyen bir arayış olmak", renk: "#ff9f43" },
      ];
      const kart = (id, kim, metin, dogru, aciklama) => ({ id, metin: `${metin}<small>— ${kim}</small>`, dogru, aciklama });
      const kartlar = [
        kart("aristoteles", "Aristoteles", "Felsefe, varlığın ilk ilkelerini ve nedenlerini araştırır.", "varlik", "Aristoteles felsefeyi “ilk nedenlerin bilgisi” olarak görür."),
        kart("farabi", "Fârâbî", "Felsefe, var olanları var oldukları yönüyle bilmektir.", "varlik", "Fârâbî'nin tanımı varlığın bütününe yönelir."),
        kart("ibnsina", "İbn Sînâ", "Felsefe, insanın gücü yettiğince varlıkların hakikatini kavrayıp kendini olgunlaştırmasıdır.", ["varlik", "eylem"], "Hakikati kavramak ve insanın olgunlaşması birlikte vurgulanır."),
        kart("kant", "Kant", "Felsefe, aklın neyi bilip neyi bilemeyeceğini, kendi sınırlarını araştırmasıdır.", "bilgi", "Kant aklın kendi kendini eleştirmesini öne çıkarır."),
        kart("descartes", "Descartes", "Felsefe, her şeyden şüphe ederek sağlam ve kesin bilgiye ulaşma çabasıdır.", "bilgi", "Descartes için felsefenin başlangıcı, bilginin temelini sınamaktır."),
        kart("sokrates", "Sokrates (Platon'un aktarımıyla)", "Sorgulanmamış bir hayat yaşanmaya değmez; felsefe iyi yaşamanın yolunu arar.", "eylem", "Sokrates felsefeyi yaşamın kendisiyle, erdemle ilişkilendirir."),
        kart("marx", "Marx", "Filozoflar dünyayı yalnızca farklı biçimlerde yorumladı; asıl mesele onu değiştirmektir.", "eylem", "Vurgu düşüncenin eyleme dönüşmesindedir."),
        kart("wittgenstein", "Wittgenstein", "Felsefenin amacı, düşüncelerin mantıksal olarak açıklığa kavuşturulmasıdır.", "dil", "Felsefe bir öğretiden çok bir açıklığa kavuşturma etkinliğidir."),
        kart("jaspers", "Jaspers", "Felsefenin özü hakikate sahip olmak değil, onu aramaktır; felsefe yolda olmaktır.", "arayis", "Jaspers felsefeyi bitmeyen bir yolculuk olarak görür."),
        kart("platon", "Platon", "Felsefe hayretle başlar.", "arayis", "Hayret, arayışı başlatan ilk kıvılcımdır."),
      ];
      const ozet = el("div", { class: "ok-kutu", hidden: true });
      siniflandirma({
        kap, kartlar, kategoriler: KAT, sutun: 3, deste: 1,
        bitti: () => {
          sinif = true;
          ozet.hidden = false;
          const sayi = Object.fromEntries(KAT.map((k) => [k.id, kartlar.filter((c) => [].concat(c.dogru)[0] === k.id).length]));
          ozet.innerHTML = `<b>Vurgu dağılımı</b><div class="fe-cubuklar">${KAT.map((k) => `<div><span>${k.ad}</span><i style="width:${sayi[k.id] * 22}%;background:${k.renk}"></i><b>${sayi[k.id]}</b></div>`).join("")}</div>
            <p class="fe-soluk">On tanımın hiçbiri bu beş vurgunun hepsini birden taşımıyor. Yine de çoğunda <b>akılla, sorgulayarak arama</b> ortak bir iz gibi görünüyor. Sence bu ortak bir tanıma yeter mi?</p>`;
          bak();
        },
      });
      kap.append(ozet);
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.secenekler({
        etiket: "İddian: Felsefenin ortak bir tanımı yapılabilir mi?",
        liste: [{ deger: "evet", metin: "Evet" }, { deger: "kismen", metin: "Kısmen" }, { deger: "hayir", metin: "Hayır" }],
        deger: null,
        degisti: (v) => {
          iddia = v;
          geri.className = "d-geri-bildirim dogru";
          geri.textContent = {
            evet: "Güçlü bir iddia: o tanım bu on filozofu da kapsamalı. Onu yazabilir misin?",
            kismen: "Ortak bir yön bulup tanımın sınırlarını kabul ediyorsun. Ortak yön nedir?",
            hayir: "Tanımların farkı felsefenin kendisinin de felsefi bir soru olduğunu gösterebilir. Neden?",
          }[v];
          bak();
        },
      });
      ctx.kontroller.append(geri);
      ctx.yaziAlani({ etiket: "Gerekçeni yaz: Tanımlar neden farklı? Ortak tanım neden mümkün ya da imkânsız?", anahtar: "fel-ortak-tanim", enAz: 50, yeterli: () => { yazi = true; bak(); } });
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Düşünce deneyi: Theseus'un gemisi",
    cikti: "FEL.10.1.1-b",
    anlatim: `<p>Theseus'un gemisinin çürüyen tahtaları tek tek yenilenir; sonunda hiç eski tahta kalmaz. Bu bir <b>düşünce deneyidir</b>: laboratuvar yerine akılda yapılır. Kararını bir <b>ölçüte</b> dayandırıp <b>tutarlı</b> kalmak gerekir.</p>`,
    anlat: [
      { s: "Limandaki gemiye bak. Antik bir anlatıya göre bu, kahraman <b>Theseus'un gemisi</b>.", yap: (api, ctx) => { api.gemi(0); ctx.sahne.bak("gemi"); } },
      { s: "Yıllar geçer, tahtalar çürür. Ustalar çürüyeni <b>tek tek</b> yenisiyle değiştirir.", yap: (api) => api.gemi(1) },
      { s: "Şimdi altı tahta yeni. Açık renkli tahtalara dikkat et.", yap: (api) => api.gemi(6) },
      { s: "Bu bir <b>düşünce deneyi</b>: laboratuvar yerine <b>akılda</b> yapılan deney." },
      { soru: "Bu deneyi yapmak için gerçek bir gemi gerekir mi?", secenekler: ["Evet, gerçek gemi şart", "Hayır, akılda yapılabilir"], dogru: 1,
        aciklama: "Düşünce deneyinde durumu hayal eder, sonuçlarını akılla izleriz.", ipucu: "“Düşünce” deneyi nerede yapılır?" },
      { s: "Sonunda on iki tahtanın hepsi yenilenir. Hiç eski tahta kalmaz.", yap: (api) => api.gemi(12) },
      { s: "Karar verirken bir <b>ölçüt</b> seçersin: aynı malzeme mi, kesintisiz kullanım mı, aynı biçim mi?" },
      { baslik: "Birlikte yapalım: Ali tutarlı mı?", cozum: ["Ali'nin ölçütü: <b>aynı malzeme</b>.", "Ali, 12 tahta değişince “Aynı gemi” diyor.", "Ama eski malzemeden hiçbir şey kalmadı.", "Cevabı ölçütüyle <b>çelişiyor</b>. Ya cevabını ya ölçütünü değiştirmeli."] },
      { soru: "Düşüncelerin birbiriyle çelişmemesine ne denir?", secenekler: ["Tutarlılık", "Hayret", "Evrensellik"], dogru: 0,
        aciklama: "Tutarlılık, felsefi düşüncenin temel özelliklerindendir.", ipucu: "Ali'nin eksiği neydi?" },
      { s: "Deneyde <b>hayret, şüphe, tutarlılık</b> gibi felsefi düşünce özelliklerini kullanacaksın." },
      { s: "Şimdi sen dene: Kaydırıcıyla tahtaları değiştir, her durakta cevap ver. Sonra beklenmedik gelişmeyi izle." },
    ],
    anlatBitti: (api, ctx) => { api.gemi(0); ctx.sahne.bak("gemi"); },
    gorev: "Deneyi tamamla, <b>tutarlı</b> bir kimlik ölçütü belirle ve düşünme hamlelerini özelliklerle eşleştir.",
    ogretmen: "Program, felsefi düşüncenin özelliklerinin (hayret, merak, şüphe, sorgulama, yığılımlı ilerleme; rasyonel, tutarlı, refleksif, eleştirel, sistemli, evrensel) bir bilgi görseliyle verilip birbirleriyle ilişkisi üzerine çıkarım yapılmasını öneriyor (KB2.10, E3.10). Isınma olarak yerdeki rakama iki taraftan bakan iki kişinin “6” ve “9” dediği karikatürü (OB4) tahtaya çizebilirsiniz. Deneyden sonra kısa bir yansıtma yazısı istenebilir.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Bu hâlâ aynı gemi mi?" });
      const S = ctx.sahne;
      S.bak("gemi");
      const [igGemi, igYigin, igIkinci] = igneler(ctx, [
        ["gemi", "Limandaki gemi", { renk: "#ffb547" }],
        ["yigin", "Sökülen eski tahtalar", { renk: "#a9b6c9", yon: "alt" }],
        ["ikinci", "Eski tahtalardan kurulan gemi", { renk: "#b89cff" }],
      ]);
      ctx.temizlik(() => { S.gemi.degistir(0); S.gemi.ikinci(false); });
      const kaydir = el("input", { type: "range", min: 0, max: TAHTA, step: 1, value: 0, "aria-label": "Değiştirilen tahta sayısı" });
      const sayac = el("b", {}, "0");
      const sorular = el("div", { class: "fe-gemi-sorular" });
      const sonuc = el("div", { hidden: true });
      kap.append(el("div", { class: "d-kaydirici" }, el("label", {}, "Değiştirilen tahta sayısı"), sayac, kaydir), sorular, sonuc);
      const cevap = {};
      let ikinci = false;
      const DURAK = [1, 6, 12];
      const ciz = () => {
        const n = +kaydir.value;
        S.gemi.degistir(n); S.gemi.ikinci(ikinci);
        sayac.textContent = `${n}/${TAHTA}`;
        igGemi.metin(`Limandaki gemi<small>${n}/${TAHTA} tahta yeni</small>`);
        igYigin.metin(`Sökülen eski tahtalar<small>${n} kalas</small>`);
        igYigin.gizle(ikinci || n === 0);
        igIkinci.gizle(!ikinci);
      };

      const SECENEK = [{ d: "evet", m: "Evet, aynı gemi" }, { d: "hayir", m: "Hayır, başka bir gemi" }, { d: "emin", m: "Emin değilim" }];
      const soruSatiri = (anahtar, metin, liste, sonra) => {
        const satir = el("div", { class: "fe-gemi-soru", "data-soru": anahtar },
          el("span", { html: metin }),
          el("div", { class: "d-satir" }, liste.map((s) => el("button", { class: "d-btn kucuk", "data-cevap": s.d, "aria-pressed": "false", onclick: (e) => {
            cevap[anahtar] = s.d;
            satir.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
            sonra?.();
            degerlendir();
          } }, s.m))));
        sorular.append(satir);
        requestAnimationFrame(() => satir.scrollIntoView({ block: "nearest", behavior: "smooth" }));
      };
      kaydir.addEventListener("input", () => {
        const n = +kaydir.value;
        // cevaplanmamış bir durağı geçmeye izin verme
        const engel = DURAK.find((d) => d < n && !cevap[`t${d}`]);
        if (engel) { kaydir.value = engel; }
        ciz();
        const d = +kaydir.value;
        if (DURAK.includes(d) && !sorular.querySelector(`[data-soru="t${d}"]`)) {
          soruSatiri(`t${d}`, `<b>${d} tahta</b> değişti. Bu hâlâ Theseus'un gemisi mi?`, SECENEK, d === 12 ? bukle : null);
        }
      });
      function bukle() {
        if (sorular.querySelector("[data-buk]")) return;
        sorular.append(el("div", { class: "d-satir", "data-buk": "1" }, el("button", { class: "d-btn ana", onclick: (e) => {
          ikinci = true; ciz(); e.currentTarget.remove();
          S.bak("gemiIki");
          sorular.append(el("div", { class: "fe-not" }, "Bir usta, söktüğün eski tahtaların hepsini toplayıp aynı plana göre ikinci bir gemi kurdu!"));
          soruSatiri("asil", "Şimdi hangisi <b>asıl</b> Theseus'un gemisi?", [
            { d: "yeni", m: "Limandaki (yenilenmiş) gemi" }, { d: "eski", m: "Eski tahtalardan kurulan" }, { d: "ikisi", m: "İkisi de" }, { d: "hicbiri", m: "Hiçbiri" }]);
          soruSatiri("olcut", "Kararını hangi <b>ölçüte</b> dayandırdın?", [
            { d: "madde", m: "Aynı malzeme" }, { d: "sureklilik", m: "Kesintisiz kullanım ve tarih" }, { d: "bicim", m: "Aynı biçim ve tasarım" }, { d: "kabul", m: "İnsanların öyle kabul etmesi" }]);
        } }, "Beklenmedik gelişme ›")));
      }
      function degerlendir() {
        if (!cevap.asil || !cevap.olcut) return;
        const celiski = [];
        if (cevap.olcut === "madde") {
          if (cevap.t12 === "evet") celiski.push("Ölçütün “aynı malzeme” ise hiçbir eski tahtası kalmayan gemiye 12. adımda “aynı gemi” dememeliydin.");
          if (cevap.asil !== "eski") celiski.push("Malzeme ölçütüne göre asıl gemi, eski tahtalardan kurulan olmalı.");
        } else if (cevap.olcut === "sureklilik") {
          if (cevap.t12 === "hayir") celiski.push("Ölçütün süreklilik ise kesintisiz kullanılan gemiye 12. adımda “başka gemi” dememeliydin.");
          if (cevap.asil !== "yeni") celiski.push("Süreklilik ölçütüne göre asıl gemi limandaki gemidir; ikinci gemi sonradan bir araya getirildi.");
        }
        sonuc.hidden = false;
        sonuc.replaceChildren();
        const tutarli = !celiski.length;
        const not = {
          madde: "Ama dikkat: senin vücudundaki hücreler de yıllar içinde yenileniyor. Sen de “başka biri” mi oluyorsun?",
          sureklilik: "Ama dikkat: süreklilik ne kadar kesintiye dayanır? Gemi bir yıl karada kalsa yine aynı mı?",
          bicim: "İki ayrı gemi aynı anda tek bir gemi olabilir mi? Bu ölçüt yeni bir soru doğurdu.",
          kabul: "Kimliği insanların kabulüne bağladın. Kabul değişirse gemi de mi değişir?",
        }[cevap.olcut];
        sonuc.append(el("div", { class: `ok-geri ${tutarli ? "dogru" : "yanlis"}`, html: tutarli
          ? `✓ Cevapların ölçütünle <b>tutarlı</b>. ${not}`
          : `✗ <b>Çelişki</b> bulundu: ${celiski.join(" ")} Cevabını ya da ölçütünü değiştirerek düşünceni yeniden kur.` }));
        if (tutarli && !sonuc.dataset.eslesme) eslestirme();
        else if (tutarli) sonuc.append(sonuc._eslesme);
      }
      function eslestirme() {
        const k = el("div", { style: "display:flex;flex-direction:column;gap:10px;margin-top:10px" },
          el("div", { class: "ok-baslik", style: "font-size:16px" }, "Deneyde hangi özellikleri kullandın? Her hamleyi bir özellikle eşleştir."));
        sonuc._eslesme = k; sonuc.dataset.eslesme = "1";
        sonuc.append(k);
        siniflandirma({
          kap: k, sutun: 3,
          kategoriler: [
            { id: "hayret", ad: "Hayret ve merak" }, { id: "suphe", ad: "Şüphe" }, { id: "rasyonel", ad: "Rasyonellik" },
            { id: "tutarli", ad: "Tutarlılık" }, { id: "refleksif", ad: "Refleksiflik" }, { id: "evrensel", ad: "Evrensellik" },
          ],
          kartlar: [
            { id: "h1", metin: "Tek bir tahta değişince “Bu basit bir soru değil!” diye şaşırdım.", dogru: "hayret", aciklama: "Felsefe hayretle başlar: sıradan görünen bir şey soru hâline gelir." },
            { id: "h2", metin: "Altıncı tahtada cevabımdan emin olamadım.", dogru: "suphe", aciklama: "Şüphe, peşin hükmü askıya alıp yeniden düşünmeyi sağlar." },
            { id: "h3", metin: "Kararımı duyguyla değil, gerekçe göstererek verdim.", dogru: "rasyonel", aciklama: "Felsefi düşünce akla ve gerekçeye dayanır." },
            { id: "h4", metin: "Bir ölçüt seçtim ve tüm cevaplarımı ona göre denetledim.", dogru: "tutarli", aciklama: "Tutarlılık: düşünceler birbiriyle çelişmemeli." },
            { id: "h5", metin: "“Neden önce ‘evet’ demiştim?” diye kendi düşünme biçimimi düşündüm.", dogru: "refleksif", aciklama: "Refleksiflik: düşüncenin kendi üzerine dönmesi." },
            { id: "h6", metin: "Bu sorun yalnız gemi için değil; hücreleri yenilenen insan, nehir, şehir için de geçerli.", dogru: "evrensel", aciklama: "Felsefi sorunlar tek bir duruma değil, her zamana ve herkese ilişkindir." },
          ],
          bitti: () => ctx.gorevTamam(),
        });
      }
      ciz();
      ctx.not("<p>Deneyde kullanılmayan ama felsefenin diğer özellikleri: <b>sorgulama</b>, <b>eleştirellik</b>, <b>sistemlilik</b> ve <b>yığılımlı ilerleme</b> (her filozof öncekilerin sorularını devralıp geliştirir).</p>");
      // Anlatım kareleri gemiyi gösterir; alıştırma kaydırıcısına dokunmaz
      return { gemi(n) { if (ikinci || +kaydir.value) return; S.gemi.degistir(n); igGemi.metin(`Limandaki gemi<small>${n}/${TAHTA} tahta yeni</small>`); igYigin.metin(`Sökülen eski tahtalar<small>${n} kalas</small>`); igYigin.gizle(n === 0); } };
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Felsefe neden Milet'te doğdu?",
    cikti: "FEL.10.1.1-b",
    anlatim: `<p>Antik Yunan felsefesinin başlangıcı <b>MÖ 6. yüzyılda</b> Milet'le ve <b>Thales</b>'le ilişkilendirilir. Thales her şeyin ana maddesini (<b>arkhe</b>) mitlerde değil doğada aradı. Felsefenin doğuşunda <b>kültürel, ekonomik, siyasal ve bilimsel</b> koşullar etkiliydi.</p>`,
    anlat: [
      { s: "Yaklaşık 2600 yıl önce, Ege kıyısında işlek bir liman kenti: <b>Milet</b>.", yap: (_, ctx) => ctx.sahne.bak("havadan") },
      { s: "Gemiler Mısır'dan, Fenike'den, Karadeniz'den mal ve insan getirirdi.", yap: (_, ctx) => ctx.sahne.bak("genel") },
      { s: "Milet'te yaşayan <b>Thales</b> sordu: “Her şeyin ana maddesi nedir?” Bu ilk maddeye <b>arkhe</b> denir." },
      { s: "Thales cevabı mitlerde değil, <b>doğada</b> aradı. Ona göre arkhe <b>su</b>ydu." },
      { soru: "Thales'i kendinden öncekilerden ayıran nedir?", secenekler: ["Tanrılar hakkında yeni bir mit anlatması", "Doğayı akılla, doğadaki bir maddeyle açıklaması", "Çok zengin olması"], dogru: 1,
        aciklama: "Açıklamayı mitten akla taşıdı. Bu yüzden ilk filozof sayılır.", ipucu: "Cevabı nerede aradı?" },
      { s: "Peki neden Milet? Koşulları dört başlıkta düşüneceğiz: <b>kültürel, ekonomik, siyasal, bilimsel</b>." },
      { s: "Ticaret zenginlik getirdi; bazı insanların düşünmeye <b>boş zamanı</b> oldu. Bu <b>ekonomik</b> bir koşul." },
      { s: "Agorada yurttaşlar ortak işleri açıkça tartışırdı. Bu <b>siyasal</b> bir koşul.", yap: (_, ctx) => ctx.sahne.bak("agora") },
      { baslik: "Birlikte yapalım: Hangi koşul?", cozum: ["Bilgi: “Babil'de yüzyıllarca gökyüzü gözlemleri kaydedilmişti.”", "Ticaretten mi söz ediyor? Hayır, bir <b>bilgi birikiminden</b>.", "Doğayı akılla açıklamayı besleyen birikim: <b>bilimsel</b> koşul."] },
      { soru: "Farklı halkların mitleri limanda karşılaşınca ne oldu?", secenekler: ["Hepsine sorgusuz inanıldı", "“Hangisi doğru?” sorusu doğdu", "Mitler unutuldu"], dogru: 1,
        aciklama: "Farklı anlatıların karşılaşması sorgulamayı başlattı: <b>kültürel</b> bir koşul.", ipucu: "İki farklı anlatı duyan biri ne sorar?" },
      { s: "Şimdi sen dene: Haritada kentlere bak, koşulları dört kutuya yerleştir ve “tek neden” sorusunu cevapla.", yap: (_, ctx) => ctx.sahne.bak("havadan") },
    ],
    anlatBitti: (_, ctx) => ctx.sahne.bak("havadan"),
    gorev: "Koşulları dört kutuya yerleştir ve “tek neden” sorusuna cevap ver.",
    ogretmen: "Program kültürel, ekonomik, siyasal ve bilimsel koşulların felsefenin doğuşuna etkisinin iş birliğiyle analiz edilmesini ve dört köşe tekniğinin kullanılmasını öneriyor (SDB2.2). Sınıfın dört köşesini dört koşula ayırıp öğrencileri en önemli bulduklarının köşesine gönderebilir, gerekçelerini tartıştırabilirsiniz. Disiplinler arası: Tarih ve Coğrafya. Thales'in MÖ 585 güneş tutulmasını önceden bildirdiği bir rivayettir.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Ege kıyısında ilk filozoflar" });
      ctx.sahne.bak("havadan");
      igneler(ctx, [["liman", "Liman<small>Doğu ile Batı arasında ticaret</small>"], ["agora", "Agora<small>Yurttaşların buluştuğu meydan</small>", { renk: "#4fc3f7" }], ["tapinak", "Tapınak", { renk: "#b89cff" }], ["kent", "Kent<small>Temsilî canlandırma</small>", { renk: "#a9b6c9" }]]);
      harita({
        kap, veri: egeVeri, kutu: [22.6, 36.4, 29.6, 41.4], yukseklik: 250, vurgu: ["Turkey"], temizlik: ctx.temizlik,
        noktalar: KENTLER, denizler: [{ ad: "EGE DENİZİ", lon: 25.2, lat: 38.9 }, { ad: "Anadolu", lon: 28.8, lat: 39.6 }],
        not: "Antik kentlerin yerleri yaklaşıktır · Sınırlar günümüze aittir", olcekKm: 100,
      });
      let sinif = false, cevap = false;
      const bak = () => sinif && cevap && ctx.gorevTamam();
      siniflandirma({
        kap, sutun: 4, deste: 1,
        kategoriler: [
          { id: "kulturel", ad: "Kültürel", renk: "#b89cff" }, { id: "ekonomik", ad: "Ekonomik", renk: "#ffd166" },
          { id: "siyasal", ad: "Siyasal", renk: "#4fc3f7" }, { id: "bilimsel", ad: "Bilimsel", renk: "#5ad38b" },
        ],
        kartlar: [
          { id: "m1", metin: "Milet, Doğu ile Batı arasında işlek bir liman ve ticaret kentiydi.", dogru: "ekonomik", aciklama: "Ticaret zenginlik ve farklı insanlarla karşılaşma getirdi." },
          { id: "m2", metin: "Zenginleşen bir kesimin düşünmeye ayıracak boş zamanı vardı.", dogru: "ekonomik", aciklama: "Geçim derdinin hafiflemesi düşünmeye zaman açtı." },
          { id: "m3", metin: "Mısır ve Babil'de gelişen geometri ve astronomi bilgisi kente ulaşmıştı.", dogru: "bilimsel", aciklama: "Önceki bilgi birikimi, doğayı akılla açıklama girişimini besledi." },
          { id: "m4", metin: "Thales'in bir güneş tutulmasını önceden bildirdiği rivayet edilir.", dogru: "bilimsel", aciklama: "Gök olaylarının düzenli olduğu fikri, doğaya akılla bakmayı güçlendirdi." },
          { id: "m5", metin: "Farklı halkların farklı mitleri karşılaşınca hiçbir anlatı sorgusuz kabul edilmedi.", dogru: "kulturel", aciklama: "Farklı inanç ve anlatıların karşılaşması, “Hangisi doğru?” sorusunu doğurdu." },
          { id: "m6", metin: "Alfabe yaygınlaşmıştı; düşünceler yazıya geçirilip tartışılabiliyordu.", dogru: "kulturel", aciklama: "Yazı, düşüncelerin kalıcı olmasını ve eleştirilmesini kolaylaştırdı." },
          { id: "m7", metin: "Kent devletinde (polis) yurttaşlar ortak meseleleri açıkça tartışabiliyordu.", dogru: "siyasal", aciklama: "Tartışma kültürü, gerekçe göstermeyi alışkanlık hâline getirdi." },
          { id: "m8", metin: "Düşünceyi baskı altında tutan mutlak bir yönetim yoktu.", dogru: "siyasal", aciklama: "Görece özgür ortam, yerleşik görüşleri sorgulamaya imkân verdi." },
        ],
        bitti: () => { sinif = true; bak(); },
      });
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.secenekler({
        etiket: "Felsefenin doğuşu tek bir nedene bağlanabilir mi?",
        liste: [{ deger: "evet-ekonomi", metin: "Evet: zenginlik yeterli" }, { deger: "evet-bilim", metin: "Evet: bilim yeterli" }, { deger: "hayir", metin: "Hayır: koşullar birlikte etkili" }],
        deger: null,
        degisti: (v) => {
          if (v === "hayir") { cevap = true; geri.className = "d-geri-bildirim dogru"; geri.textContent = "✓ Doğru. Zengin kentlerin hepsinde felsefe doğmadı; Mısır ve Babil'de bilim vardı ama bilgiler çoğu zaman uygulamaya yönelikti. Koşulların bir araya gelmesi belirleyici oldu."; bak(); }
          else { geri.className = "d-geri-bildirim yanlis"; geri.textContent = v === "evet-ekonomi" ? "Zenginlik başka birçok kentte de vardı ama felsefe her yerde doğmadı. Başka hangi koşullar gerekti?" : "Mısır ve Babil'de de geometri ve astronomi vardı. Bilginin sorgulanabilmesi için başka hangi koşullar gerekti?"; }
        },
      });
      ctx.kontroller.append(geri);
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Felsefenin yolculuğu: gelenekler",
    cikti: "FEL.10.1.1-b",
    anlatim: `<p>Felsefe tek bir kültüre <b>indirgenemez</b>. Hint, Çin, Antik Yunan, Türk-İslam ve Avrupa'nın farklı geleneklerinde farklı çağlarda özgün felsefi sorular soruldu. Zaman çizelgesinde her şerit bir gelenek, her çubuk bir düşünürdür (<b>~</b>: yaklaşık tarih).</p>`,
    anlat: [
      { s: "Felsefe Milet'te kalmadı. Fikirler de gemiler gibi yol aldı.", yap: (_, ctx) => ctx.sahne.bak("ufuk") },
      { s: "Aynı çağlarda dünyanın başka yerlerinde de insanlar büyük sorular soruyordu." },
      { s: "Hindistan'daki <b>Upanişadlar</b> sordu: “Benliğim ile evrenin özü arasında nasıl bir bağ var?”" },
      { s: "Çin'de <b>Laozi</b>, doğanın akışına uyumlu yaşamayı öğütledi." },
      { soru: "Upanişadlar, Laozi ve Milet'teki düşünürler aşağı yukarı aynı çağda. Bu ne gösterir?", secenekler: ["Felsefe yalnızca Yunanlılara aittir", "Felsefe tek bir kültüre indirgenemez", "Hepsi aynı soruyu sordu"], dogru: 1,
        aciklama: "Farklı coğrafyalarda, farklı sorularla felsefe yapıldı.", ipucu: "Üçü de farklı ülkelerden." },
      { s: "İslam dünyasında <b>Kindî</b> ve <b>İbn Sînâ</b>, Yunan felsefesini işleyip yeni sorular sordu." },
      { s: "Sonra Avrupa'da ve Amerika'da yeni gelenekler doğdu: Fransız, Alman, Anglosakson, Amerikan." },
      { s: "Bu birikimlere <b>felsefe gelenekleri</b> diyoruz. Çizelgede her gelenek bir şerittir." },
      { baslik: "Birlikte yapalım: Çizelgeyi oku", yap: (_, ctx) => sahneKartiAc(ctx), cozum: ["Her şerit bir gelenek, her çubuk bir düşünürün yaşamı.", "<b>~</b> işareti tarihin yaklaşık olduğunu gösterir.", "Örnek: İbn Sînâ'nın çubuğu Türk-İslam şeridinde, 980–1037 arası.", "Bir çubuğa dokunursan düşünürün sorusunu okursun."] },
      { soru: "Farklı şeritlerdeki iki çubuk aynı hizadaysa ne anlarız?", secenekler: ["Aynı kişiler", "Aynı dönemde yaşamışlar", "Aynı geleneğe aitler"], dogru: 1,
        aciklama: "Yatay eksen zamandır; aynı hiza aynı dönem demektir.", ipucu: "Çizelgenin yatay ekseni neyi gösteriyor?" },
      { s: "Şimdi sen dene: Kartta yazan düşünürün geleneğine ait şeride dokun. Sekiz düşünürü yerleştir." },
    ],
    gorev: "Sekiz düşünürü zaman çizelgesinde <b>doğru geleneğin şeridine</b> yerleştir.",
    ogretmen: "Program farklı felsefe geleneklerinin (Hint, Çin, Türk-İslam, Antik Yunan, Fransız, Alman, Anglosakson, Amerikan) adlarına yer verilerek felsefenin tek bir kültüre indirgenemeyeceğinin vurgulanmasını, soru-cevap tekniğinin kullanılmasını öneriyor (OB5). Öğrencilere “Aynı yüzyılda yaşayan Konfüçyüs, Buda ve Herakleitos hangi soruları sordu?” diye sorup çizelgede dikey okuma yaptırabilirsiniz. Yansıtma yazısı ödev olarak verilebilir.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Felsefe gelenekleri zaman çizelgesi" });
      ctx.sahne.bak("ufuk");
      igneler(ctx, [["deniz", "Fikirler de gemilerle yol aldı", { renk: "#4fc3f7" }]]);
      const KART = karistir(["buda", "konfucyus", "thales", "farabi", "descartes", "kant", "locke", "dewey"]);
      const IPUCU = { thales: "Thales Milet'te yaşadı; Antik Yunan felsefesinin başlatıcısı sayılır.", farabi: "Fârâbî, İslam felsefesinin kurucu isimlerindendir.", dewey: "Dewey ABD'de yaşadı; pragmatizmin temsilcisidir.", locke: "Locke İngiliz deneyimci (empirist) bir düşünürdür.", kant: "Kant, Königsberg'de yaşamış Alman bir filozoftur.", descartes: "Descartes, modern felsefenin kurucusu sayılan Fransız bir filozoftur.", buda: "Buda Hindistan'da yaşadı.", konfucyus: "Konfüçyüs Çin'de yaşadı." };
      const olaylar = DUSUNURLER.map((d) => ({ id: d.id, serit: d.gelenek, bas: d.bas, bit: d.bit, ad: d.ad, yaklasik: d.yaklasik, gizli: KART.includes(d.id) }));
      let n = 0, alan = [-850, 2000];
      const deste = el("div", { class: "fe-deste" });
      const kartKutu = el("div", { class: "ok-kart fe-deste-kart" });
      const sayac = el("span", { class: "ok-ilerleme" });
      deste.append(el("div", { class: "d-satir", style: "justify-content:space-between" }, el("b", {}, "Bu düşünür hangi geleneğe ait? Şeridine dokun."), sayac), kartKutu);
      const geri = geriBildirim(deste, "Zaman çizelgesinde doğru şeride (gelenek adına ya da şeridin boş bir yerine) dokun.");
      const bilgi = el("div", { class: "ok-kutu fe-bilgi" }, el("span", { class: "fe-soluk" }, "Bir çubuğa dokunarak düşünürün sorusunu oku."));
      const donem = el("div", { class: "ok-sekmeler" });
      kap.append(deste, donem);
      const goster = () => {
        sayac.textContent = `${n}/${KART.length}`;
        if (n >= KART.length) { kartKutu.hidden = true; return; }
        const d = DUSUNURLER.find((q) => q.id === KART[n]);
        kartKutu.dataset.kart = d.id;
        kartKutu.innerHTML = `<b>${d.ad}</b><small>${d.fikir}</small>`;
      };
      const zc = zamanCizelgesi({
        kap, seritler: GELENEKLER, olaylar, min: alan[0], max: alan[1], yilYaz, temizlik: ctx.temizlik, satir: 20,
        secildi: (o) => {
          const d = DUSUNURLER.find((q) => q.id === o.id);
          const g = GELENEKLER.find((q) => q.id === d.gelenek);
          bilgi.innerHTML = `<b>${d.ad}</b> <span class="fe-soluk">· ${g.ad} · ${d.yaklasik ? "yaklaşık " : ""}${yilYaz(d.bas)} – ${yilYaz(d.bit)}${d.tur === "metin" ? " (yazıldığı dönem)" : ""}</span><br>${d.fikir}`;
        },
        seritSecildi: (serit) => {
          if (n >= KART.length) return;
          const d = DUSUNURLER.find((q) => q.id === KART[n]);
          if (d.gelenek !== serit) {
            const g = GELENEKLER.find((q) => q.id === serit);
            geri.yaz(`✗ ${d.ad}, ${g.ad} şeridine ait değil. ${IPUCU[d.id]}`, "yanlis");
            kartKutu.classList.remove("sars"); void kartKutu.offsetWidth; kartKutu.classList.add("sars");
            return;
          }
          if (d.bas < alan[0] || d.bit > alan[1]) donem.querySelector("button").click();
          zc.goster(d.id); zc.sec(d.id);
          geri.yaz(`✓ ${d.ad}: ${GELENEKLER.find((g) => g.id === d.gelenek).ad} geleneği. Çubuğu çizelgede belirdi.`, "dogru");
          n++; goster();
          if (n === KART.length) { geri.yaz("✓ Sekiz düşünürün hepsi yerini buldu. Aynı yüzyılda farklı coğrafyalarda hangi sorular soruluyordu? Çizelgeyi dikey olarak oku.", "dogru"); ctx.gorevTamam(); }
        },
      });
      const ARALIK = [["Tümü", -850, 2000], ["Antik çağ", -850, 300], ["Orta çağ", 700, 1300], ["Yeni ve yakın çağ", 1500, 2000]];
      ARALIK.forEach(([ad, a, b], i) => donem.append(el("button", { class: "d-btn kucuk", "aria-pressed": String(i === 0), onclick: (e) => {
        donem.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === e.currentTarget)));
        alan = [a, b]; zc.aralik(a, b);
      } }, ad)));
      kap.append(bilgi);
      goster();
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Felsefi soru mu, değil mi?",
    cikti: "FEL.10.1.1-c",
    anlatim: `<p>Her soru felsefi değildir. <b>Gündelik</b> sorular kısa sürede, kişiye bağlı cevaplanır; <b>bilimsel</b> sorular gözlem ve deneyle; <b>felsefi</b> sorular ise evrenseldir, deneyle kesin cevaplanamaz ve her cevap yeni sorular doğurur.</p>`,
    anlat: [
      { s: "Gün içinde onlarca soru sorarız: “Otobüs kaçta?” “Su neden kaynar?” “Adalet nedir?”", yap: (_, ctx) => ctx.sahne.bak("agora") },
      { s: "Bu üç soru aynı türden değil. Her birinin cevabı başka bir yolla bulunur." },
      { s: "“Otobüs kaçta?” Saate bakınca cevap biter. Bu bir <b>gündelik soru</b>." },
      { s: "“Su kaç derecede kaynar?” Termometreyle ölçülür. Deneyle cevaplanan soruya <b>bilimsel soru</b> denir." },
      { soru: "“Bitkiler ışıkta mı daha hızlı büyür?” Bu hangi tür soru?", secenekler: ["Gündelik", "Bilimsel", "Felsefi"], dogru: 1,
        aciklama: "Deney kurup ölçerek cevaplanır: bilimsel.", ipucu: "Bir deneyle sınanabilir mi?" },
      { s: "“Adalet nedir?” Hiçbir ölçüm aleti bunu cevaplayamaz. Akıl yürüterek tartışırız." },
      { s: "Böyle sorulara <b>felsefi soru</b> denir. Evrenseldir, tek kesin cevabı yoktur, her cevap yeni soru doğurur." },
      { baslik: "Birlikte yapalım: “Neden” her soruyu felsefi yapar mı?", cozum: ["Soru: “Gökkuşağı neden oluşur?”", "İçinde “neden” var, ama…", "Işığın su damlasında kırılmasıyla, gözlemle açıklanır.", "Sonuç: <b>bilimsel</b> bir soru. Sözcüğe değil, cevabın nasıl bulunduğuna bak."] },
      { soru: "“Dostluk bir çıkar ilişkisi midir?” Bu hangi tür soru?", secenekler: ["Gündelik", "Bilimsel", "Felsefi"], dogru: 2,
        aciklama: "Deneyle kesinleşmez, herkesi ilgilendirir, tartışmaya açıktır: felsefi.", ipucu: "Bir ölçüm aletiyle cevaplayabilir misin?" },
      { s: "Şimdi sen dene: On iki soruyu kendi gerekçenle sınıflandır ve kontrol et. Sonra özellikler kartıyla gözden geçir." },
    ],
    gorev: "On iki soruyu <b>felsefi, bilimsel, gündelik</b> diye doğru sınıflandır.",
    ogretmen: "Program farklı türden soruların karışık verilip gerekçeleriyle sınıflandırılmasını, ardından felsefi sorunun özelliklerini gösteren bilgi görseli sunularak sınıflandırmanın yeniden gözden geçirilmesini öneriyor (KB2.5, E3.1, SDB1.2). Özellikler kartı ilk kontrolden sonra açılır; böylece öğrenciler önce kendi ölçütlerini kullanır.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Soruları sınıflandır" });
      ctx.sahne.bak("agora");
      igneler(ctx, [["agora", "Agora<small>Her soru burada tartışılabilirdi</small>", { renk: "#4fc3f7" }]]);
      const ozellik = el("div", { class: "ok-kutu fe-ozellik", hidden: true, html: `<b>Felsefi sorunun özellikleri</b>
        <ul><li><b>Evrenseldir:</b> tek bir kişiye, yere ya da zamana bağlı değildir.</li>
        <li><b>Deney ve gözlemle kesin olarak cevaplanamaz;</b> akıl yürütmeyle tartışılır.</li>
        <li><b>Tek ve kesin bir cevabı yoktur;</b> cevaplar gerekçeleriyle tartışmaya açıktır.</li>
        <li><b>Her cevap yeni sorular doğurur.</b></li>
        <li><b>Kavramsal ve soyuttur;</b> varlığın, bilginin, değerlerin temeline yönelir.</li>
        <li><b>Eskimez:</b> yüzyıllar önce sorulan soru bugün de sorulabilir.</li></ul>` });
      const F = "felsefi", B = "bilimsel", G = "gundelik";
      const s = (id, metin, dogru, yanlis) => ({ id, metin, dogru, ipucu: yanlis });
      siniflandirma({
        kap, kip: "serbest", sutun: 3,
        kategoriler: [{ id: F, ad: "Felsefi soru", renk: "#ffb547" }, { id: B, ad: "Bilimsel soru", renk: "#4fc3f7" }, { id: G, ad: "Gündelik soru", renk: "#a9b6c9" }],
        kartlar: [
          s("s1", "Adalet nedir?", F, "Adaletin ne olduğu deneyle ölçülemez; cevapları tartışmalıdır ve her toplum için sorulabilir: felsefi."),
          s("s2", "Bilgimizin doğru olduğundan nasıl emin olabiliriz?", F, "Bilginin kendisini sorgulayan, deneyle kesin cevaplanamayan bir soru: felsefi."),
          s("s3", "İnsan özgür müdür?", F, "Her cevabı yeni sorular doğuran, evrensel bir soru: felsefi."),
          s("s4", "Neden hiçbir şey yerine bir şey var?", F, "Varlığın temeline yönelen, gözlemle cevaplanamayan bir soru: felsefi."),
          s("s5", "Güzel olan herkes için aynı mıdır?", F, "Güzelliğin ölçütünü soran kavramsal bir soru: felsefi."),
          s("s6", "Su deniz seviyesinde kaç derecede kaynar?", B, "Deneyle ölçülüp kesin olarak cevaplanabilir: bilimsel."),
          s("s7", "Depremler neden olur?", B, "Yer kabuğundaki hareketlerin gözlem ve ölçümle açıklanması: bilimsel. “Neden” sözcüğü her soruyu felsefi yapmaz."),
          s("s8", "Evren nasıl oluştu?", B, "Gözlem ve kuramlarla araştırılan bir soru: bilimsel (kozmoloji). Felsefe ise “Evren neden var?” diye sorar."),
          s("s9", "Kuşlar göç ederken yönlerini nasıl bulur?", B, "Deney ve gözlemle araştırılır: bilimsel."),
          s("s10", "Bu akşam ne yesek?", G, "Kişiye ve ana bağlı, kısa sürede cevaplanan bir soru: gündelik."),
          s("s11", "Otobüs kaçta kalkıyor?", G, "Tek ve kesin bir cevabı olan, bilgi edinmeye yönelik gündelik bir soru."),
          s("s12", "Hafta sonu sinemaya gelir misin?", G, "Kişisel bir davet: gündelik."),
        ],
        kontrolSonrasi: () => { if (ozellik.hidden) { ozellik.hidden = false; ozellik.scrollIntoView({ block: "nearest", behavior: "smooth" }); } },
        bitti: () => ctx.gorevTamam(),
      });
      kap.append(ozellik);
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Kendi felsefi sorunu kur",
    cikti: "FEL.10.1.1-c",
    anlatim: `<p>Felsefi sorular çoğu zaman sıradan bir olaydan doğar. Olaydaki temel <b>kavramı</b> bul, bir <b>soru kalıbıyla</b> sorunu kur ve <b>refleksif sorgulama kartlarıyla</b> sına. Kişisel bir soru çıktıysa onu <b>genelleştir</b>.</p>`,
    anlat: [
      { s: "Elif, arkadaşının sınavda kopya çektiğini gördü. Öğretmene söylemeli mi?", yap: (_, ctx) => ctx.sahne.bak("sokak") },
      { s: "Bu, Elif'in <b>kişisel</b> bir sorusu. Cevabı Elif'in durumuna bağlı." },
      { s: "Ama içinde büyük <b>kavramlar</b> saklı: <b>dürüstlük</b> ve <b>dostluk</b>." },
      { s: "Kişi adlarını çıkarıp kavrama yönelirsek soru <b>genelleşir</b>, herkesi ilgilendirir." },
      { baslik: "Birlikte yapalım: Olaydan felsefi soruya", cozum: ["Olay: Elif kopyayı gördü.", "Kavramlar: dürüstlük ve dostluk.", "Kalıp: “… her zaman … önce mi gelir?”", "Felsefi soru: “Dürüstlük her zaman dostluktan önce mi gelir?”"] },
      { soru: "Hangisi felsefi bir sorudur?", secenekler: ["Elif yarın öğretmenle konuşacak mı?", "Dürüstlük her zaman doğru mudur?", "Sınav kaçta bitti?"], dogru: 1,
        aciklama: "Kişiye ve güne bağlı değil, herkese ilişkin ve tartışmaya açık.", ipucu: "Hangi soruda kişi adı ya da zaman yok?" },
      { s: "Kurduğun soruyu kendi kendine sınarsın. Düşünceyi düşünmeye <b>refleksif</b> sorgulama denir." },
      { s: "Dört kart sorar: Deneyle kesin cevaplanır mı? Herkese mi ilişkin? Tek cevabı var mı? Yeni soru doğurur mu?" },
      { soru: "“Bu telefon kaç gram?” sorusu hangi kartta takılır?", secenekler: ["“Deneyle kesin cevaplanır mı?” kartında", "Hiçbir kartta takılmaz"], dogru: 0,
        aciklama: "Tartıyla kesin cevaplanır; felsefi değil.", ipucu: "Bir tartı bu soruyu bitirir mi?" },
      { s: "Bir cevap yeni bir soru doğurur. Felsefede buna <b>yığılımlı ilerleme</b> denir." },
      { s: "Şimdi sen dene: Bir durum, bir kavram ve bir kalıp seç. Sorunu kartlarla sına, olası bir cevap yaz." },
    ],
    gorev: "Dört sorgulama kartının hepsinden geçen bir felsefi soru kur ve olası bir cevabı yaz.",
    ogretmen: "Program günlük yaşamdan ya da felsefe tarihinden seçilen düşündürücü olay, ikilem veya alıntılar üzerinden özgün felsefi sorular üretilmesini, refleksif sorgulama kartlarının hazırlanmasını ve soruların Sokratik tartışmayla yığılımlı biçimde geliştirilmesini öneriyor (E3.3, E3.8, KB2.13). Öğrencilerin kurduğu soruları tahtada toplayıp bir soruyu Sokratik tartışmayla birlikte derinleştirebilirsiniz.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Felsefi soru atölyesi" });
      ctx.sahne.bak("sokak");
      const DURUM = [
        { id: "kopya", ad: "Sınavda kopya", metin: "Yakın arkadaşının sınavda kopya çektiğini gördün. Öğretmene söylemek ispiyon mu, dürüstlük mü?", kavram: ["dürüstlük", "dostluk", "adalet", "sorumluluk"] },
        { id: "algoritma", ad: "Tahmin eden uygulama", metin: "Telefonundaki uygulama ne izleyeceğini senden önce biliyor gibi.", kavram: ["özgürlük", "seçim", "bilgi", "mahremiyet"] },
        { id: "tablo", ad: "Yapay zekâ tablosu", metin: "Ödül alan bir tablonun bir yapay zekâ tarafından üretildiği ortaya çıktı.", kavram: ["sanat", "güzellik", "yaratıcılık", "emek"] },
        { id: "deprem", ad: "Deprem dayanışması", metin: "Depremden sonra binlerce insan karşılık beklemeden yardıma koştu.", kavram: ["iyilik", "fedakârlık", "insan doğası", "sorumluluk"] },
      ];
      const KALIP = [
        (k) => `${buyuk(k)} nedir?`,
        (k) => `${buyuk(k)} her zaman iyi midir?`,
        (k) => `Gerçek ${k} mümkün müdür?`,
        (k) => `${buyuk(k)} olmadan insan, insan olabilir mi?`,
        (k) => `${buyuk(k)} öğrenilebilir mi, yoksa doğuştan mı gelir?`,
      ];
      function buyuk(s) { return s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1); }
      let durum = null, kavram = null, kalip = null;
      const durumSatir = el("div", { class: "fe-durumlar" });
      const kavramSatir = el("div", { class: "d-satir" });
      const kalipSatir = el("div", { class: "d-satir" });
      const durumMetin = el("div", { class: "fe-soluk" });
      const soru = el("input", { type: "text", class: "fe-soru-girdi", placeholder: "Sorun burada belirecek; istersen düzenle…", "aria-label": "Felsefi sorum" });
      kap.append(el("div", { class: "ok-kutu" }, el("b", {}, "1. Bir durum seç"), durumSatir, durumMetin),
        el("div", { class: "ok-kutu" }, el("b", {}, "2. Temel kavramı seç"), kavramSatir),
        el("div", { class: "ok-kutu" }, el("b", {}, "3. Soru kalıbını seç"), kalipSatir),
        el("div", { class: "ok-kutu" }, el("b", {}, "Sorum:"), soru));
      DURUM.forEach((d) => durumSatir.append(el("button", { class: "d-btn kucuk", "data-durum": d.id, "aria-pressed": "false", onclick: (e) => {
        durum = d; kavram = null;
        durumSatir.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
        durumMetin.textContent = d.metin;
        kavramSatir.replaceChildren(...d.kavram.map((k) => el("button", { class: "d-btn kucuk", "data-kavram": k, "aria-pressed": "false", onclick: (ev) => {
          kavram = k; kavramSatir.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === ev.currentTarget))); kur();
        } }, k)));
        kur();
      } }, d.ad)));
      kalipSatir.append(...KALIP.map((f, i) => el("button", { class: "d-btn kucuk", "data-kalip": i, "aria-pressed": "false", onclick: (e) => {
        kalip = f; kalipSatir.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget))); kur();
      } }, f("…"))));
      function kur() { if (kavram && kalip) { soru.value = kalip(kavram); sinamaSifirla(); } }

      // refleksif sorgulama kartları
      const KARTLAR = [
        { id: "deney", soru: "Bu soru deneyle ya da ölçümle <b>kesin</b> olarak cevaplanabilir mi?", gecer: "hayir", uyari: "Deneyle cevaplanabiliyorsa bilimsel bir sorudur. Kavramın <b>ne olduğunu</b> ya da <b>değerini</b> sor." },
        { id: "evrensel", soru: "Soru yalnız bu olaya ve kişilere mi, yoksa <b>herkese ve her zamana</b> mı ilişkin?", secenek: [["evet", "Herkese"], ["hayir", "Yalnız bu olaya"]], gecer: "evet", uyari: "Soruyu genelleştir: kişi adlarını, “ben, arkadaşım, yarın” gibi sözcükleri çıkar." },
        { id: "tek", soru: "Sorunun <b>tek ve kesin</b> bir cevabı var mı?", gecer: "hayir", uyari: "Tek cevabı olan soru tartışma doğurmaz. Gerekçeli farklı cevaplara açık bir soru kur." },
        { id: "yeni", soru: "Bir cevap, <b>yeni sorular</b> doğurur mu?", gecer: "evet", uyari: "Felsefi cevaplar yeni sorular doğurur. Sorunu kavramın temeline yönelt." },
      ];
      const sinama = el("div", { class: "ok-kutu" }, el("b", {}, "4. Refleksif sorgulama kartları"));
      const sinamaGeri = geriBildirim(sinama, "Sorunu kurduktan sonra her karta dürüstçe cevap ver.");
      const yanit = {};
      const kartEl = KARTLAR.map((k) => {
        const satir = el("div", { class: "fe-gemi-soru", "data-kart": k.id }, el("span", { html: k.soru }),
          el("div", { class: "d-satir" }, (k.secenek || [["evet", "Evet"], ["hayir", "Hayır"]]).map(([d, m]) => el("button", { class: "d-btn kucuk", "data-cevap": d, "aria-pressed": "false", onclick: (e) => {
            yanit[k.id] = d;
            satir.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
            sina();
          } }, m))));
        sinama.insertBefore(satir, sinamaGeri.el);
        return satir;
      });
      kap.append(sinama);
      function sinamaSifirla() { for (const k of KARTLAR) delete yanit[k.id]; kartEl.forEach((s) => s.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false"))); sinamaGeri.yaz("Yeni soru: kartları yeniden cevapla."); gecti = false; }
      soru.addEventListener("input", () => sinamaSifirla());
      let gecti = false, yazildi = false;
      const kisisel = /\b(ben|benim|arkadaşım|arkadaşımı|yarın|bugün|annem|babam|öğretmenim)\b/i;
      function sina() {
        if (soru.value.trim().length < 8) { sinamaGeri.yaz("Önce bir soru kur.", "yanlis"); return; }
        if (Object.keys(yanit).length < KARTLAR.length) { sinamaGeri.yaz(`${Object.keys(yanit).length}/${KARTLAR.length} kart cevaplandı.`); return; }
        const kalan = KARTLAR.filter((k) => yanit[k.id] !== k.gecer);
        if (kisisel.test(soru.value) && yanit.evrensel === "evet") kalan.push(KARTLAR[1]);
        if (kalan.length) { sinamaGeri.yaz(`✗ Sorun henüz felsefi değil. ${[...new Set(kalan)].map((k) => k.uyari).join(" ")}`, "yanlis"); gecti = false; return; }
        if (!/\?\s*$/.test(soru.value.trim())) { sinamaGeri.yaz("Neredeyse! Sorunun sonuna soru işareti koymayı unutma.", "yanlis"); return; }
        gecti = true;
        sinamaGeri.yaz(`✓ “${soru.value.trim()}” dört karttan da geçti: evrensel, kavramsal, tartışmaya açık ve yeni sorular doğuran bir soru.`, "dogru");
        bak();
      }
      const bak = () => gecti && yazildi && ctx.gorevTamam();
      ctx.yaziAlani({ etiket: "Sorunun olası bir cevabını ve bu cevabın doğurduğu <b>yeni soruyu</b> yaz (yığılımlı ilerleme).", anahtar: "fel-kendi-sorum", enAz: 40, yeterli: () => { yazildi = true; bak(); } });
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Felsefe, bilim, din ve sanat",
    cikti: "FEL.10.1.1-ç",
    anlatim: `<p>Felsefe, bilim, din ve sanat insanın dünyayı anlama yollarıdır. Benzer yönleri vardır, ama <b>amaç, yöntem ve konu</b> bakımından ayrılırlar. Bir görüş, gerekçe ve bilgiyle desteklendiğinde <b>güçlüdür</b>.</p>`,
    anlat: [
      { s: "Bir gün batımını düşün. Dört kişi aynı gökyüzüne bakıyor.", yap: (_, ctx) => ctx.sahne.bak("tapinak") },
      { s: "Bilim insanı sorar: “Gökyüzü neden kızıla döner?” Bu <b>bilimin</b> sorusu." },
      { s: "Ressam, rengi ve duyguyu tuvale aktarır. Bu <b>sanatın</b> yolu." },
      { s: "İnanan biri bu düzenin ardındaki yaratıcıyı düşünür. Bu <b>dinin</b> bakışı." },
      { s: "Filozof sorar: “Güzel nedir? Bu düzenin bir anlamı var mı?” Bu <b>felsefenin</b> sorusu." },
      { soru: "Dört alanı karşılaştırırken hangi ölçütleri kullanırız?", secenekler: ["Yalnızca konuyu", "Amaç, yöntem ve konuyu", "Yalnızca kimin yaptığını"], dogru: 1,
        aciklama: "Amaç: ne için? Yöntem: nasıl? Konu: ne hakkında?", ipucu: "Üç ölçüt var." },
      { baslik: "Birlikte yapalım: Yöntemleri karşılaştır", cozum: ["Bilim: gözlem ve deneyle sınar.", "Sanat: sezgi ve hayal gücüyle eser üretir.", "Din: vahye dayanır; temel ilkeleri inanarak kabul eder.", "Felsefe: akıl yürütür, kavramları çözümler, eleştirir."] },
      { soru: "Bir görüşün <b>güçlü</b> olması ne demektir?", secenekler: ["Çok kişinin onu savunması", "Gerekçe ve bilgiyle desteklenmesi", "Kesin bir dille söylenmesi"], dogru: 1,
        aciklama: "Güç, gerekçeden gelir; kalabalıktan ya da ses tonundan değil.", ipucu: "Felsefe neye dayanır?" },
      { s: "Din sütunu dinlerin genel özelliklerini anlatır. Amaç karşılaştırmaktır, alanları yarıştırmak değil." },
      { s: "Şimdi sen dene: Tabloyu satır satır kur. Sonra beş görüşün güçlü mü zayıf mı olduğuna karar ver." },
    ],
    gorev: "Karşılaştırma tablosunu tamamla ve beş görüşü güçlü/zayıf diye değerlendir.",
    ogretmen: "Program felsefenin bilim, din ve sanatla benzer ve farklı yönlerinin iş birliğiyle tartışılmasını, paylaşılan görüşlerin güçlü ve zayıf yönlerinin tespit edilmesini ve ilişkinin amaç, yöntem ve konu ölçütleriyle karşılaştırma tablosu tekniğiyle değerlendirilmesini öneriyor (SDB2.2, KB2.7, E3.2, E3.1). Din sütunundaki ifadeler dinlerin genel özelliklerini betimler; konu tarafsız bir dille ele alınmalıdır.",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Karşılaştırma tablosu" });
      ctx.sahne.bak("tapinak");
      igneler(ctx, [["tapinak", "Tapınak<small>Din, sanat ve geometri bir arada</small>", { renk: "#b89cff" }]]);
      const ALAN = [{ id: "felsefe", ad: "Felsefe", renk: "#ffb547" }, { id: "bilim", ad: "Bilim", renk: "#4fc3f7" }, { id: "din", ad: "Din", renk: "#5ad38b" }, { id: "sanat", ad: "Sanat", renk: "#b89cff" }];
      const SATIR = [
        { id: "amac", ad: "Amaç", kart: {
          felsefe: "Varlık, bilgi ve değerler hakkında sorgulayarak bütüncül bir anlayışa ulaşmak",
          bilim: "Olguları açıklamak, aralarındaki yasaları bulmak ve öngörmek",
          din: "İnsanı inanç, ibadet ve ahlak yoluyla dünya ve ahiret mutluluğuna yöneltmek",
          sanat: "Güzeli ve duyguyu özgün bir biçimde ifade edip estetik haz uyandırmak" } },
        { id: "yontem", ad: "Yöntem", kart: {
          felsefe: "Akıl yürütme, kavram çözümleme, eleştiri ve tutarlılık denetimi",
          bilim: "Gözlem, deney, hipotez kurma ve sınama",
          din: "Vahye ve peygamberlerin bildirdiklerine dayanma; temel ilkeleri inanarak kabul etme",
          sanat: "Sezgi, hayal gücü ve yaratıcılıkla eser ortaya koyma" } },
        { id: "konu", ad: "Konu", kart: {
          felsefe: "Varlığın bütünü, bilgi ve değerler (iyi, doğru, güzel)",
          bilim: "Gözlemlenebilir doğa ve toplum olguları; her bilim belirli bir alan",
          din: "Allah (Tanrı), insan, evren, ahiret ve ahlak ilişkisi",
          sanat: "İnsan deneyiminin her yönü: doğa, duygu, toplum" } },
      ];
      const tablo = el("table", { class: "fe-tablo" },
        el("thead", {}, el("tr", {}, el("th", {}, ""), ALAN.map((a) => el("th", { style: `color:${a.renk}` }, a.ad)))),
        el("tbody", {}, SATIR.map((s) => el("tr", { "data-satir": s.id }, el("th", {}, s.ad), ALAN.map((a) => el("td", { "data-hucre": `${s.id}-${a.id}` }, "…"))))));
      kap.append(el("div", { class: "fe-tablo-kutu" }, tablo));
      let tabloBitti = false, gorusBitti = false;
      const bak = () => tabloBitti && gorusBitti && ctx.gorevTamam();
      const sek = sekmeler(kap, [
        { ad: "1. Tabloyu kur", kur: (k) => {
          let n = 0;
          const tur = el("div", { style: "display:flex;flex-direction:column;gap:10px" });
          k.append(tur);
          function sonraki() {
            tur.replaceChildren();
            const s = SATIR[n];
            tablo.querySelectorAll("tr").forEach((tr) => tr.classList.toggle("fe-aktif", tr.dataset.satir === s.id));
            tur.append(el("div", { class: "ok-baslik", style: "font-size:15.5px" }, `Satır ${n + 1}/3: ${s.ad}`));
            siniflandirma({
              kap: tur, sutun: 4, kategoriler: ALAN, deste: 1,
              kartlar: ALAN.map((a) => ({ id: `${s.id}-${a.id}`, metin: s.kart[a.id], dogru: a.id, aciklama: `${a.ad} — ${s.ad.toLocaleLowerCase("tr-TR")}: ${s.kart[a.id]}.` })),
              bitti: () => {
                for (const a of ALAN) tablo.querySelector(`[data-hucre="${s.id}-${a.id}"]`).textContent = s.kart[a.id];
                n++;
                if (n < SATIR.length) setTimeout(sonraki, 700);
                else { tabloBitti = true; tablo.querySelectorAll("tr").forEach((tr) => tr.classList.remove("fe-aktif")); tur.replaceChildren(el("div", { class: "ok-geri dogru" }, "✓ Tablo tamam. Şimdi “2. Görüşleri sına” sekmesine geç.")); sek.bitti(0); sek.ac(1); bak(); }
              },
            });
          }
          sonraki();
        } },
        { ad: "2. Görüşleri sına", kur: (k) => siniflandirma({
          kap: k, sutun: 2, deste: 1,
          kategoriler: [{ id: "guclu", ad: "Güçlü görüş", renk: "#5ad38b" }, { id: "zayif", ad: "Zayıf görüş", renk: "#ff6b6b" }],
          kartlar: [
            { id: "g1", metin: "“Felsefe ve bilim akla dayandığı için yöntemleri tamamen aynıdır.”", dogru: "zayif", aciklama: "İkisi de akla dayanır, ama bilim deneyle sınar; felsefe kavramları ve varsayımları akıl yürütmeyle sorgular." },
            { id: "g2", metin: "“Felsefe ve din; Tanrı, ölüm ve ahlak gibi ortak konuları ele alabilir, ama dayanakları farklıdır.”", dogru: "guclu", aciklama: "Konular kesişebilir: felsefe akla ve sorgulamaya, din vahye ve inanca dayanır." },
            { id: "g3", metin: "“Sanat öznel olduğu için felsefeyle hiçbir ilgisi yoktur.”", dogru: "zayif", aciklama: "Güzelin ne olduğu felsefenin (estetik) konusudur; sanat da dünyaya özgün bir bakış sunar." },
            { id: "g4", metin: "“Bilim ilerledikçe felsefeye gerek kalmayacak.”", dogru: "zayif", aciklama: "Bilimin kendi temelleri ve değer soruları (bilim felsefesi, etik) yine felsefi sorulardır." },
            { id: "g5", metin: "“Bilim, belirli bir alanı inceler; felsefe ise varlığa bütün olarak bakmaya çalışır.”", dogru: "guclu", aciklama: "Konu ölçütüne dayalı, tablodaki bilgilerle desteklenen bir görüş." },
          ],
          bitti: () => { gorusBitti = true; sek.bitti(1); bak(); },
        }) },
      ]);
    },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Felsefe ne işe yarar?",
    cikti: "FEL.10.1.1-d",
    anlatim: `<p>“Felsefe ne işe yarar?” da felsefi bir sorudur. Görüşleri <b>tutarlılık</b> ölçütüyle sına. Felsefenin <b>bireysel</b> işlevleri kişinin düşünce ve yaşamıyla, <b>toplumsal</b> işlevleri toplumun kurumları, değerleri ve tartışma kültürüyle ilgilidir.</p>`,
    anlat: [
      { s: "Deniz bir gün sordu: “Felsefe ne işe yarar? Bana ne kazandırır?”", yap: (_, ctx) => ctx.sahne.bak("tepe") },
      { s: "Bu soru da felsefi bir soru! Cevabını gerekçeyle arayalım." },
      { s: "Bir görüşü kabul etmeden önce sorarız: Öğrendiklerimle <b>tutarlı</b> mı?" },
      { baslik: "Birlikte yapalım: Tutarlılık sınaması", cozum: ["Görüş: “Felsefe yalnızca eski Yunan'da yapılır.”", "5. adımda gördük: Hint, Çin, Türk-İslam ve Avrupa geleneklerinde de felsefe yapıldı.", "Görüş bu bilgiyle çelişiyor.", "Sonuç: Bu görüşü <b>reddederiz</b>."] },
      { s: "Felsefenin kişiye katkısına <b>bireysel işlev</b> denir. Örnek: kendi hayat amacını gerekçelendirmek." },
      { s: "Topluma katkısına <b>toplumsal işlev</b> denir. Örnek: insan hakları fikrinin tartışılıp güçlenmesi." },
      { soru: "“Bir mahallede insanlar sorunlarını kavga etmeden, gerekçeyle tartışıyor.” Bu hangi işleve örnek?", secenekler: ["Bireysel işlev", "Toplumsal işlev"], dogru: 1,
        aciklama: "Tartışma kültürü toplumun ortak yaşamıyla ilgilidir.", ipucu: "Tek bir kişi mi, bir topluluk mu?" },
      { s: "Bir işlev hem kişiyi hem toplumu etkileyebilir. Karar verirken <b>asıl kimi</b> ilgilendirdiğine bak." },
      { soru: "Hangisi felsefenin doğasıyla <b>çelişir</b>?", secenekler: ["Felsefe sorgulamayı öğretir.", "Felsefe her soruya tek bir kesin cevap verir.", "Felsefe farklı görüşleri tartışır."], dogru: 1,
        aciklama: "Felsefi soruların tek ve kesin cevabı yoktur.", ipucu: "6. adımdaki felsefi sorunun özelliklerini hatırla." },
      { s: "Şimdi sen dene: Görüşleri kabul ya da ret diye ayır. Sonra kabul ettiklerini bireysel ve toplumsal diye sınıflandır." },
    ],
    gorev: "Görüşleri kabul/ret diye ayır, sonra kabul ettiklerini bireysel ve toplumsal diye sınıflandır.",
    ogretmen: "Program öğrencilerin felsefenin işlevlerine ilişkin görüşlerini yansıtan bir liste oluşturmasını, tutarlılığı tartışarak kabul ya da reddetmesini ve ardından işlevleri bireysel ve toplumsal olarak sınıflamasını öneriyor (E3.7, KB2.18, KB3.3). Ünite performans görevi: “Felsefe nedir? Filozof kime denir? Felsefe ne işe yarar? Felsefe nasıl yapılır?” sorularıyla farklı yaş ve meslekten kişilerle röportaj yapılıp okul sayfasında yayımlanması (D3.2, D14.1, D16.3, OB2).",
    kur(ctx) {
      const kap = sahneKap(ctx, { baslik: "Felsefenin işlevleri" });
      ctx.sahne.bak("tepe");
      igneler(ctx, [["kent", "Bireyden topluma", { renk: "#5ad38b" }]]);
      const ikinci = el("div", { style: "display:flex;flex-direction:column;gap:10px", hidden: true });
      kap.append(el("div", { class: "ok-baslik", style: "font-size:15.5px" }, "1. Bu görüşleri kabul eder misin?"));
      const kabul = [
        { id: "i1", metin: "Felsefe, ön yargılarımı fark etmemi sağlar.", tur: "bireysel" },
        { id: "i2", metin: "Felsefe, dünya görüşümü gerekçeleriyle kurmama yardım eder.", tur: "bireysel" },
        { id: "i3", metin: "Felsefe, karar verirken gerekçelerimi tartmamı sağlar.", tur: "bireysel" },
        { id: "i4", metin: "Felsefe, farklı görüşlere saygıyı ve tartışma kültürünü geliştirir.", tur: "toplumsal" },
        { id: "i5", metin: "Felsefe, bilimin temel kavramlarını sorgulayarak gelişmesine katkı sağlar.", tur: "toplumsal" },
        { id: "i6", metin: "Felsefe, toplumun değerlerini ve kurumlarını eleştirel olarak değerlendirmeyi sağlar.", tur: "toplumsal" },
      ];
      const ret = [
        { id: "r1", metin: "Felsefe insanlara kesin ve değişmez cevaplar verir.", neden: "Felsefi soruların tek ve kesin cevabı yoktur (6. adım). Bu görüş felsefenin doğasıyla çelişir." },
        { id: "r2", metin: "Felsefe yalnızca filozofları ilgilendirir; topluma etkisi yoktur.", neden: "Demokrasi, insan hakları, hoşgörü gibi düşünceler felsefi tartışmalarla gelişti." },
        { id: "r3", metin: "Felsefe öğrenen kişi her tartışmada haklı çıkar.", neden: "Felsefe haklı çıkmayı değil, gerekçeli düşünmeyi ve gerektiğinde fikir değiştirmeyi öğretir." },
      ];
      siniflandirma({
        kap, sutun: 2, deste: 1,
        kategoriler: [{ id: "kabul", ad: "Kabul ederim", aciklama: "Tutarlı görüş", renk: "#5ad38b" }, { id: "ret", ad: "Reddederim", aciklama: "Tutarsız görüş", renk: "#ff6b6b" }],
        kartlar: [
          ...kabul.map((k) => ({ id: k.id, metin: k.metin, dogru: "kabul", aciklama: "Tutarlı: derste gördüğün özelliklerle uyumlu.", ipucu: "Bu görüş felsefenin özellikleriyle çelişmiyor. Neden reddedesin?" })),
          ...ret.map((k) => ({ id: k.id, metin: k.metin, dogru: "ret", aciklama: k.neden, ipucu: k.neden })),
        ],
        bitti: () => {
          ikinci.hidden = false;
          ikinci.append(el("div", { class: "ok-baslik", style: "font-size:15.5px" }, "2. Kabul ettiğin işlevler bireysel mi, toplumsal mı?"));
          siniflandirma({
            kap: ikinci, sutun: 2, deste: 1,
            kategoriler: [{ id: "bireysel", ad: "Bireysel işlev", renk: "#4fc3f7" }, { id: "toplumsal", ad: "Toplumsal işlev", renk: "#ffb547" }],
            kartlar: kabul.map((k) => ({ id: `b-${k.id}`, metin: k.metin, dogru: k.tur, aciklama: k.tur === "bireysel" ? "Kişinin kendi düşünce ve yaşamıyla ilgili." : "Toplumun kurumları, bilimi ve tartışma kültürüyle ilgili." })),
            bitti: () => ctx.gorevTamam(),
          });
          ikinci.scrollIntoView({ block: "start", behavior: "smooth" });
        },
      });
      kap.append(ikinci);
    },
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Değerlendirme",
    cikti: "FEL.10.1.1",
    anlatim: `<p>Dokuz soruluk kısa bir değerlendirme. En az <b>7 doğru</b> yaparsan dersi tamamlamış olursun. Yanlış yaptığın konular için ilgili adıma dönebilirsin.</p>`,
    anlat: [
      { s: "Bu derste uzun bir yol yürüdük. Kısaca hatırlayalım.", yap: (_, ctx) => ctx.sahne.bak("genel") },
      { s: "Felsefe <b>bilgelik sevgisidir</b>. Filozof, bilgeliği seven ve arayan kişidir." },
      { s: "Theseus'un gemisinde <b>hayret, şüphe ve tutarlılık</b> gibi özellikleri kullandık.", yap: (_, ctx) => ctx.sahne.bak("gemi") },
      { s: "Felsefe Milet'te koşulların <b>bir araya gelmesiyle</b> doğdu, sonra pek çok gelenekte gelişti.", yap: (_, ctx) => ctx.sahne.bak("havadan") },
      { soru: "“Zaman nedir?” sorusu hangi türden?", secenekler: ["Gündelik", "Bilimsel", "Felsefi"], dogru: 2,
        aciklama: "Saate bakmak bu soruyu cevaplamaz; zamanın ne olduğu evrensel ve tartışmalı bir sorudur.", ipucu: "“Saat kaç?” ile aynı soru mu?" },
      { s: "Felsefe bilim, din ve sanattan <b>amaç, yöntem ve konu</b> bakımından ayrılır." },
      { s: "Felsefenin hem <b>bireysel</b> hem <b>toplumsal</b> işlevleri vardır." },
      { s: "Şimdi sen dene: Dokuz soruyu cevapla. En az 7 doğru yaparsan dersi tamamlarsın.", yap: (_, ctx) => ctx.sahne.bak("genel") },
    ],
    gorev: "Değerlendirmede en az <b>7/9</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (çalışma kâğıdı, açık uçlu sorular) uyumludur. Açık uçlu bir soru olarak “Felsefenin ortak bir tanımı yapılabilir mi? Gerekçelendir.” sorusunu ekleyebilirsiniz.",
    kur(ctx) {
      ctx.sahne.bak("genel");
      ctx.sinav([
        { tur: "coktan", metin: "“Felsefe” sözcüğünün kökeni ve anlamı hangisidir?",
          siklar: ["philo + logos: sözü sevmek", "philo + sophia: bilgelik sevgisi", "sophia + kosmos: evrenin bilgisi", "theos + logos: tanrı bilgisi"],
          dogru: 1, aciklama: "Yunanca philo (sevgi) ve sophia (bilgelik): bilgelik sevgisi. Filozof bilgeliği seven ve arayandır." },
        { tur: "coktan", metin: "Aşağıdakilerden hangisi <b>felsefi</b> bir sorudur?",
          siklar: ["Bir depremin büyüklüğü nasıl ölçülür?", "İyi bir insan olmak ne demektir?", "Türkiye'nin en yüksek dağı hangisidir?", "Yarın yağmur yağacak mı?"],
          dogru: 1, aciklama: "“İyi insan” sorusu evrenseldir, deneyle kesin cevaplanamaz ve her cevap yeni sorular doğurur. Diğerleri ölçüm ya da gözlemle cevaplanır." },
        { tur: "coktan", metin: "Filozofların felsefeyi farklı biçimlerde tanımlamasının temel nedeni hangisidir?",
          siklar: ["Filozofların birbirlerinin eserlerini okumamış olması", "Farklı dönem, kültür ve sorunlardan yola çıkmaları; felsefenin ne olduğunun da felsefi bir soru olması", "Felsefenin hiçbir konusu olmaması", "İlk tanımın yanlış çevrilmiş olması"],
          dogru: 1, aciklama: "Her filozof kendi çağının ve sorularının içinden felsefeye bakar. “Felsefe nedir?” sorusu da tartışmaya açık bir felsefi sorudur." },
        { tur: "coktan", metin: "Felsefi düşüncenin <b>refleksif</b> olması ne anlama gelir?",
          siklar: ["Düşüncenin deneyle sınanması", "Düşüncenin duygulara dayanması", "Düşüncenin kendi üzerine dönüp kendi düşünme biçimini sorgulaması", "Düşüncenin kesin sonuçlar vermesi"],
          dogru: 2, aciklama: "Refleksiyon: düşüncenin kendini konu edinmesi. Theseus deneyinde “Neden önce ‘evet’ dedim?” diye sorman refleksif bir hamleydi." },
        { tur: "coktan", metin: "Antik Yunan felsefesinin başlangıcı genellikle hangi kent ve düşünürle ilişkilendirilir?",
          siklar: ["Atina — Sokrates", "Milet — Thales", "İskenderiye — Aristoteles", "Bağdat — Kindî"],
          dogru: 1, aciklama: "MÖ 6. yüzyılda Milet'te Thales, “Her şeyin ana maddesi (arkhe) nedir?” sorusunu doğada aradı." },
        { tur: "coktan", metin: "Felsefenin doğuşu ile ilgili hangisi <b>en doğru</b> değerlendirmedir?",
          siklar: ["Yalnızca ticaretle gelen zenginliğin sonucudur.", "Yalnızca Mısır ve Babil biliminin sonucudur.", "Kültürel, ekonomik, siyasal ve bilimsel koşulların birlikte etkisiyle ortaya çıkmıştır.", "Hiçbir koşula bağlı olmadan bir anda ortaya çıkmıştır."],
          dogru: 2, aciklama: "Tek bir neden yeterli değildir: zengin ya da bilim bilen her toplumda felsefe aynı biçimde doğmadı." },
        { tur: "coktan", metin: "Felsefenin tek bir kültüre indirgenemeyeceğini en iyi hangisi gösterir?",
          siklar: ["Bütün filozofların Yunanca yazmış olması", "Hint, Çin, Türk-İslam ve Avrupa düşüncesinde farklı çağlarda özgün felsefi soruların sorulması", "Felsefi soruların her kültürde aynı cevabı alması", "Felsefenin Antik Yunan'dan sonra gelişmemesi"],
          dogru: 1, aciklama: "Konfüçyüs, Buda, Fârâbî, İbn Sînâ, Kant, Dewey… Farklı bağlamlarda farklı sorular ve kavramlar ortaya çıktı." },
        { tur: "coktan", metin: "Felsefe ile bilim arasındaki farkı en iyi hangisi açıklar?",
          siklar: ["Bilim akla dayanır, felsefe akla dayanmaz.", "Bilim olguları gözlem ve deneyle sınar; felsefe kavramları ve temel varsayımları akıl yürütmeyle sorgular.", "Felsefe yalnızca sanatla ilgilenir.", "İkisinin konusu ve yöntemi tamamen aynıdır."],
          dogru: 1, aciklama: "İkisi de akla ve eleştiriye dayanır; farkları yöntem ve konudadır." },
        { tur: "coktan", metin: "Aşağıdakilerden hangisi felsefenin <b>toplumsal</b> işlevine örnektir?",
          siklar: ["Kişinin kendi ön yargılarını fark etmesi", "Bireyin yaşam amacını gerekçelendirmesi", "Farklı görüşlerin tartışıldığı demokratik bir kamusal kültürün gelişmesine katkı sağlaması", "Her soruya kesin bir cevap bulunması"],
          dogru: 2, aciklama: "Tartışma kültürü ve demokratik değerler toplumsal işlevdir. İlk ikisi bireysel işlevdir; sonuncusu felsefenin doğasıyla çelişir." },
      ], { baslik: "Felsefenin doğası", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: miletDunyasi });
