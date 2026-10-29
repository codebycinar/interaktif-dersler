// Ana sayfa (dist/index.html): tanıtım, sınıf seçici, nasıl öğreniyoruz, kapak görselli ders kartları.
// Tek dosya, dış bağımlılık yok (internetsiz açılabilir). Veri paketle.mjs'den gelir.
const kacir = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const DEPO = "https://github.com/codebycinar/interaktif-dersler";

// Ders alanı renkleri (kart rozeti ve süzgeç noktası)
export const DERS_RENK = {
  "Matematik": "#2f6fe4", "Fizik": "#e0522f", "Kimya": "#0e9f86", "Biyoloji": "#2f9e44",
  "Türk Dili ve Edebiyatı": "#c2410c", "İngilizce": "#7048e8", "Tarih": "#a16207", "Coğrafya": "#0b8fb3",
  "Felsefe": "#6741d9", "Din Kültürü ve Ahlak Bilgisi": "#0f766e", "Peygamberimizin Hayatı": "#b45309",
  "Müzik": "#d6336c", "Görsel Sanatlar": "#e8590c", "Beden Eğitimi ve Spor": "#37b24d",
};

export function anaSayfa(veri) {
  const json = JSON.stringify(veri).replace(/</g, "\\u003c");
  const dersSayisi = veri.length;
  const alanSayisi = new Set(veri.map((d) => d.ders)).size;
  // Tanıtım kolajı: farklı derslerden üç kapak; önce sahnesi en çok şey anlatan dersler
  const ONCELIK = ["Fizik", "Felsefe", "Biyoloji", "Kimya", "Matematik"];
  const sira = (d) => (ONCELIK.indexOf(d.ders) + 1 || 99);
  const kolaj = [];
  for (const d of veri.filter((d) => d.kapak).sort((a, b) => sira(a) - sira(b))) if (kolaj.length < 3 && !kolaj.some((k) => k.ders === d.ders)) kolaj.push(d);
  const renk = (d) => DERS_RENK[d] || "#475569";

  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>İnteraktif Dersler</title>
<meta name="description" content="Türkiye Yüzyılı Maarif Modeli'ne göre hazırlanmış, 3B sahnelerle adım adım anlatan ücretsiz ve açık kaynak interaktif dersler.">
<style>
:root{--zemin:#f5f7fb;--kart:#fff;--metin:#14213a;--metin2:#566278;--cizgi:#e2e7ef;--vurgu:#f08c00;--vurgu2:#ffb43d;--lacivert:#1c3466;--golge:0 1px 2px rgba(20,33,58,.06),0 6px 24px rgba(20,33,58,.07);--uyari:#fff4db;--uyari-cizgi:#f5c26b;--uyari-metin:#7a4a00}
@media (prefers-color-scheme:dark){:root{--zemin:#0d1524;--kart:#16213a;--metin:#e9eef7;--metin2:#a3b0c4;--cizgi:#26344f;--lacivert:#0a1222;--golge:0 1px 2px rgba(0,0,0,.3),0 8px 28px rgba(0,0,0,.25);--uyari:#2a2210;--uyari-cizgi:#7a5a1c;--uyari-metin:#ffd88a}}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--zemin);color:var(--metin);font-family:"Segoe UI Variable","Segoe UI",system-ui,-apple-system,Roboto,sans-serif;line-height:1.5}
a{color:inherit}
.ic{max-width:1180px;margin:0 auto;padding:0 20px}
/* üst çubuk */
.ust{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--zemin) 85%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--cizgi)}
.ust .ic{display:flex;align-items:center;gap:18px;height:64px}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:800;font-size:18px;letter-spacing:-.01em}
.logo svg{width:34px;height:34px}
.ust nav{margin-left:auto;display:flex;gap:6px;align-items:center}
.ust nav a{text-decoration:none;font-weight:600;font-size:14.5px;color:var(--metin2);padding:8px 12px;border-radius:999px}
.ust nav a:hover{color:var(--metin);background:var(--kart)}
.ust nav a.hata{color:var(--uyari-metin);background:var(--uyari);border:1px solid var(--uyari-cizgi)}
/* yapay zekâ uyarısı */
.uyari{background:var(--uyari);border-bottom:1px solid var(--uyari-cizgi);color:var(--uyari-metin);font-size:14px}
.uyari .ic{display:flex;gap:10px;align-items:flex-start;padding-top:10px;padding-bottom:10px}
.uyari b{white-space:nowrap}.uyari a{font-weight:700}.uyari .kisa{display:none}
[id]{scroll-margin-top:76px}
/* tanıtım */
.tanitim{position:relative;overflow:hidden}
.tanitim .ic{display:grid;grid-template-columns:1.05fr 1fr;gap:40px;align-items:center;padding-top:56px;padding-bottom:56px}
.leke{position:absolute;border-radius:50%;filter:blur(60px);opacity:.35;z-index:-1}
.leke.l1{width:520px;height:520px;background:#ffd08a;right:-120px;top:-140px}
.leke.l2{width:380px;height:380px;background:#a9c8ff;right:280px;bottom:-220px}
@media (prefers-color-scheme:dark){.leke{opacity:.16}}
.etiket{display:inline-flex;gap:8px;align-items:center;font-size:13px;font-weight:700;color:var(--lacivert);background:var(--kart);border:1px solid var(--cizgi);border-radius:999px;padding:6px 12px;box-shadow:var(--golge)}
@media (prefers-color-scheme:dark){.etiket{color:var(--metin)}}
.etiket i{width:8px;height:8px;border-radius:50%;background:var(--vurgu)}
h1{font-size:clamp(34px,5.2vw,58px);line-height:1.04;letter-spacing:-.025em;margin:18px 0 16px;font-weight:850}
h1 span{display:block;background:linear-gradient(90deg,var(--vurgu),#e8590c);-webkit-background-clip:text;background-clip:text;color:transparent}
.tanitim p.alt{font-size:18px;color:var(--metin2);max-width:540px;margin:0 0 26px}
.dugmeler{display:flex;gap:12px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:8px;font:inherit;font-weight:700;font-size:16px;text-decoration:none;border-radius:999px;padding:13px 24px;border:2px solid transparent;cursor:pointer}
.btn.ana{background:var(--vurgu);color:#fff;box-shadow:0 6px 18px rgba(240,140,0,.35)}
.btn.ana:hover{background:#d97a00}
.btn.ikinci{background:var(--kart);color:var(--metin);border-color:var(--cizgi)}
.btn.ikinci:hover{border-color:var(--vurgu)}
.sayilar{display:flex;gap:28px;margin-top:30px;flex-wrap:wrap}
.sayilar div b{display:block;font-size:26px;font-weight:800;letter-spacing:-.02em}
.sayilar div span{font-size:13.5px;color:var(--metin2)}
.kolaj{position:relative;height:420px}
.kolaj figure{position:absolute;margin:0;border-radius:18px;overflow:hidden;box-shadow:0 18px 40px rgba(20,33,58,.22);border:5px solid var(--kart);background:var(--kart)}
.kolaj img{display:block;width:100%;height:100%;object-fit:cover}
.kolaj figcaption{position:absolute;left:10px;bottom:10px;font-size:12.5px;font-weight:700;color:#fff;padding:4px 10px;border-radius:999px}
.kolaj .k0{width:62%;height:62%;left:0;top:6%;transform:rotate(-4deg);z-index:2}
.kolaj .k1{width:56%;height:56%;right:0;top:0;transform:rotate(5deg)}
.kolaj .k2{width:58%;height:56%;right:8%;bottom:0;transform:rotate(-1.5deg);z-index:3}
/* sınıf seçici */
.siniflar{display:flex;align-items:center;gap:0;margin:8px 0 0;overflow-x:auto;padding:6px 2px 10px}
.sinif{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:120px;position:relative;text-decoration:none;color:var(--metin2);font-weight:700;font-size:14px}
.sinif::before{content:"";position:absolute;top:11px;left:-50%;width:100%;height:3px;background:var(--cizgi);z-index:0}
.sinif:first-child::before{display:none}
.sinif i{width:24px;height:24px;border-radius:50%;background:var(--kart);border:3px solid var(--cizgi);z-index:1}
.sinif small{font-weight:600;font-size:12px}
.sinif.aktif{color:var(--metin)}.sinif.aktif i{border-color:var(--vurgu);background:var(--vurgu);box-shadow:0 0 0 5px rgba(240,140,0,.18)}
.sinif.aktif::before{background:linear-gradient(90deg,var(--cizgi),var(--vurgu))}
/* bölümler */
section.blok{padding:44px 0}
.blok h2{font-size:clamp(24px,3vw,32px);letter-spacing:-.02em;margin:0 0 6px;font-weight:800}
.blok p.giris{color:var(--metin2);margin:0 0 22px;font-size:16px}
.adimlar3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.adim3{background:var(--kart);border:1px solid var(--cizgi);border-radius:20px;padding:22px;box-shadow:var(--golge)}
.adim3 .no{display:inline-grid;place-items:center;width:40px;height:40px;border-radius:12px;font-weight:800;color:#fff;margin-bottom:12px}
.adim3 h3{margin:0 0 6px;font-size:19px}.adim3 p{margin:0;color:var(--metin2);font-size:15px}
/* devam kartı */
.devam{display:none;align-items:center;gap:16px;background:var(--kart);border:2px solid var(--vurgu);border-radius:20px;padding:12px;text-decoration:none;box-shadow:var(--golge);margin-bottom:26px}
.devam.var{display:flex}
.devam img{width:132px;height:82px;object-fit:cover;border-radius:12px;background:var(--cizgi)}
.devam span{font-size:13px;color:var(--metin2);font-weight:600}.devam b{display:block;font-size:18px;line-height:1.25}
.devam .ok{margin-left:auto;margin-right:10px;white-space:nowrap}
/* araç çubuğu */
.arac{display:flex;flex-direction:column;gap:12px;margin-bottom:22px}
.ara{position:relative}
.ara input{width:100%;font:inherit;font-size:16px;color:inherit;background:var(--kart);border:1px solid var(--cizgi);border-radius:14px;padding:13px 16px 13px 44px;box-shadow:var(--golge)}
.ara input:focus{outline:2px solid var(--vurgu);outline-offset:1px}
.ara svg{position:absolute;left:15px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--metin2)}
.cipler{display:flex;gap:8px;flex-wrap:wrap}
.cip{display:inline-flex;align-items:center;gap:7px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;color:var(--metin);background:var(--kart);border:1px solid var(--cizgi);border-radius:999px;padding:7px 14px}
.cip i{width:9px;height:9px;border-radius:50%}
.cip[aria-pressed=true]{background:var(--metin);color:var(--kart);border-color:var(--metin)}
/* ders kartları */
.izgara{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:20px}
.kart{display:flex;flex-direction:column;background:var(--kart);border:1px solid var(--cizgi);border-radius:20px;overflow:hidden;text-decoration:none;box-shadow:var(--golge);transition:transform .15s,box-shadow .15s}
.kart:hover,.kart:focus-visible{transform:translateY(-3px);box-shadow:0 14px 34px rgba(20,33,58,.14);outline:none}
.kart .resim{position:relative;aspect-ratio:16/10;background:linear-gradient(135deg,var(--r),color-mix(in srgb,var(--r) 55%,#000));overflow:hidden}
.kart .resim img{width:100%;height:100%;object-fit:cover;display:block}
.kart .resim .bas{position:absolute;inset:0;display:grid;place-items:center;font-size:44px;font-weight:850;color:rgba(255,255,255,.9)}
.rozet{position:absolute;left:12px;top:12px;font-size:12px;font-weight:700;color:#fff;background:var(--r);padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25)}
.kart .govde{display:flex;flex-direction:column;gap:6px;padding:14px 16px 16px;flex:1}
.kart .unite{font-size:12.5px;font-weight:700;color:var(--metin2)}
.kart b{font-size:17px;line-height:1.3}
.kart .soru{color:var(--metin2);font-size:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ilerleme{margin-top:auto;padding-top:8px;display:flex;align-items:center;gap:10px;font-size:12.5px;font-weight:600;color:var(--metin2)}
.ilerleme i{flex:1;height:6px;border-radius:3px;background:var(--cizgi);overflow:hidden}.ilerleme i s{display:block;height:100%;background:var(--r)}
.bos{color:var(--metin2);padding:30px 0}
/* alt bilgi */
footer{background:var(--lacivert);color:#c9d3e3;margin-top:30px}
footer .ic{padding-top:34px;padding-bottom:34px;display:grid;grid-template-columns:1.4fr 1fr;gap:30px;font-size:14px}
footer b{color:#fff;font-size:16px}footer a{color:#fff}
footer p{margin:6px 0}
@media (max-width:900px){
  .tanitim .ic{grid-template-columns:1fr;padding-top:32px;padding-bottom:32px;gap:28px}
  .kolaj{height:300px}
  .adimlar3{grid-template-columns:1fr}
  footer .ic{grid-template-columns:1fr}
  .ust nav a.gizle{display:none}
}
@media (max-width:560px){
  .ic{padding:0 16px}
  .kolaj{height:230px}
  .tanitim p.alt{font-size:16px}
  .devam img{width:88px;height:60px}.devam .ok{display:none}
  .ust nav a.hata span{display:none}
  .uyari .ic{flex-direction:column;gap:2px}.uyari .uzun{display:none}.uyari .kisa{display:inline}
  .cipler{flex-wrap:nowrap;overflow-x:auto;margin:0 -16px;padding:2px 16px 6px;scrollbar-width:none}
  .cip{flex:none}
  .sayilar{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}
}
</style></head>
<body>
<header class="ust"><div class="ic">
  <a class="logo" href="#"><svg viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="10" fill="#f08c00"/><path d="M20 9l9 5v11l-9 5-9-5V14z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path d="M11 14l9 5 9-5M20 19v11" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>İnteraktif Dersler</a>
  <nav>
    <a class="gizle" href="#nasil">Nasıl öğreniyoruz?</a>
    <a class="gizle" href="#dersler">Dersler</a>
    <a class="gizle" href="${DEPO}">GitHub</a>
    <a class="hata" href="${DEPO}/issues/new?labels=hata-bildirimi&title=${encodeURIComponent("[genel] ")}">⚠ <span>Hata bildir</span></a>
  </nav>
</div></header>

<div class="uyari" role="note"><div class="ic">
  <b>⚠ Yapay zekâ ile üretildi.</b>
  <span class="uzun">Bu sitedeki dersler (metinler, görseller, sorular) tamamen yapay zekâ ile hazırlandı ve henüz öğretmen denetiminden geçmedi. Bilgilerde hata olabilir. Bir hata görürseniz <a href="${DEPO}/issues/new?labels=hata-bildirimi">bize bildirin</a>; her dersin üst çubuğunda da “Hata bildir” bağlantısı var.</span>
  <span class="kisa">Öğretmen denetiminden geçmedi, hata olabilir. <a href="${DEPO}/issues/new?labels=hata-bildirimi">Hata bildir</a></span>
</div></div>

<section class="tanitim"><div class="leke l1"></div><div class="leke l2"></div><div class="ic">
  <div>
    <span class="etiket"><i></i>Türkiye Yüzyılı Maarif Modeli · 10. sınıf</span>
    <h1>Dokun, döndür, dene.<span>Ders sana adım adım anlatsın.</span></h1>
    <p class="alt">Fizikte yolda giden arabayı sen sürersin, kimyada mercimekleri tartarsın, felsefede Milet limanında dolaşırsın. Her konu önce kısa adımlarla anlatılır, sonra sıra sana gelir.</p>
    <div class="dugmeler">
      <a class="btn ana" href="#dersler">Derslere başla ↓</a>
      <a class="btn ikinci" id="devam-btn" href="#" hidden>Kaldığın yerden devam et ›</a>
    </div>
    <div class="sayilar">
      <div><b>${dersSayisi}</b><span>interaktif ders</span></div>
      <div><b>${alanSayisi}</b><span>ders alanı</span></div>
      <div><b>Ücretsiz</b><span>reklamsız, üyeliksiz</span></div>
      <div><b>Çevrimdışı</b><span>internetsiz de çalışır</span></div>
    </div>
  </div>
  <div class="kolaj" aria-hidden="true">
    ${kolaj.map((d, i) => `<figure class="k${i}"><img src="${kacir(d.kapak)}" alt=""><figcaption style="background:${renk(d.ders)}">${kacir(d.ders)}</figcaption></figure>`).join("")}
  </div>
</div></section>

<section class="blok" id="nasil" style="padding-top:12px"><div class="ic">
  <h2>Nasıl öğreniyoruz?</h2>
  <p class="giris">Her adım aynı üç basamakla ilerler. Uzun metin ve ezber formül yerine önce görür, sonra kendin yaparsın.</p>
  <div class="adimlar3">
    <div class="adim3"><span class="no" style="background:#2f6fe4">1</span><h3>İzle</h3><p>Konu kısa kareler hâlinde anlatılır. 3B sahne her karede söylenen şeyi gösterir; formüller parça parça kurulur.</p></div>
    <div class="adim3"><span class="no" style="background:#2f9e44">2</span><h3>Birlikte yap</h3><p>Çözümlü örnek satır satır açılır. Arada küçük sorular gelir; yanlışta ipucu çıkar, doğruyu bulunca devam edersin.</p></div>
    <div class="adim3"><span class="no" style="background:#f08c00">3</span><h3>Şimdi sen dene</h3><p>Sahnede kendin deney yaparsın: kaydırırsın, ölçersin, karşılaştırırsın. Ünite sonunda değerlendirme seni bekler.</p></div>
  </div>
</div></section>

<section class="blok" id="dersler" style="padding-top:12px"><div class="ic">
  <h2>Dersler</h2>
  <div class="siniflar" role="group" aria-label="Sınıf">
    ${[9, 10, 11, 12].map((s) => `<span class="sinif${s === 10 ? " aktif" : ""}"><i></i>${s}. Sınıf<small>${s === 10 ? `${dersSayisi} ders` : "yakında"}</small></span>`).join("")}
  </div>
  <a class="devam" id="devam" href="#"><img id="devam-resim" alt=""><div><span>Kaldığın yerden devam et</span><b id="devam-baslik"></b><span id="devam-alt"></span></div><span class="btn ana ok">Devam ›</span></a>
  <div class="arac">
    <label class="ara"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input type="search" id="ara" placeholder="Konu, ders ya da çıktı kodu ara… (ör. fotosentez, trigonometri, MAT.10.1)" aria-label="Ders ara"></label>
    <div class="cipler" id="cipler" role="group" aria-label="Ders alanına göre süz"></div>
  </div>
  <div class="izgara" id="liste"></div>
  <noscript><ul>${veri.map((d) => `<li><a href="${kacir(d.href)}">${kacir(d.ders)} · ${kacir(d.baslik)}</a></li>`).join("")}</ul></noscript>
</div></section>

<footer><div class="ic">
  <div>
    <b>İnteraktif Dersler</b>
    <p>Türkiye Yüzyılı Maarif Modeli öğretim programlarına göre hazırlanan ücretsiz, açık kaynak dersler. MEB ile bağlantılı değildir.</p>
    <p>İçerikler yapay zekâ ile üretilmiştir; hata görürseniz <a href="${DEPO}/issues/new?labels=hata-bildirimi">bildirin</a>.</p>
  </div>
  <div>
    <p><a href="${DEPO}">GitHub'da kaynak kod</a></p>
    <p>İçerik: <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.tr">CC BY-NC-SA 4.0</a> · Kod: MIT</p>
  </div>
</div></footer>
<script>${betik(json)}</script>
</body></html>
`;
}

/** Tarayıcı betiği: arama, ders alanı süzgeci, ilerleme, kaldığın yerden devam */
function betik(json) {
  return String.raw`
const DERSLER = ${json};
const RENK = ${JSON.stringify(DERS_RENK)};
const renk = (d) => RENK[d] || "#475569";
const $ = (s) => document.querySelector(s);
const oku = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const kacir = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const kucuk = (s) => s.toLocaleLowerCase("tr");
let secili = null;
try { secili = sessionStorage.getItem("edu:filtre"); } catch {}

const son = oku("edu:son");
const sonDers = son && DERSLER.find((d) => d.slug === son.slug);
if (sonDers) {
  const o = oku("edu:" + sonDers.slug)?.ozet;
  $("#devam").href = $("#devam-btn").href = sonDers.href;
  $("#devam").classList.add("var");
  $("#devam-btn").hidden = false;
  if (sonDers.kapak) $("#devam-resim").src = sonDers.kapak; else $("#devam-resim").remove();
  $("#devam-baslik").textContent = sonDers.baslik;
  $("#devam-alt").textContent = sonDers.ders + (o ? " · " + o.biten + "/" + o.toplam + " görev" : "");
}

const dersAdlari = [...new Set(DERSLER.map((d) => d.ders))].sort((a, b) => a.localeCompare(b, "tr"));
$("#cipler").innerHTML = ['<button class="cip" data-d="">Tümü</button>']
  .concat(dersAdlari.map((d) => '<button class="cip" data-d="' + kacir(d) + '"><i style="background:' + renk(d) + '"></i>' + kacir(d) + "</button>")).join("");
$("#cipler").addEventListener("click", (e) => {
  const b = e.target.closest(".cip");
  if (!b) return;
  secili = b.dataset.d || null;
  try { secili ? sessionStorage.setItem("edu:filtre", secili) : sessionStorage.removeItem("edu:filtre"); } catch {}
  ciz();
});
$("#ara").addEventListener("input", ciz);

function kart(d) {
  const o = oku("edu:" + d.slug)?.ozet;
  const y = o ? Math.round((100 * o.biten) / o.toplam) : 0;
  const durum = !o ? "Başlanmadı" : y === 100 ? "Tamamlandı ✓" : "%" + y;
  const resim = d.kapak ? '<img decoding="async" src="' + kacir(d.kapak) + '" alt="">' : '<span class="bas">' + kacir(d.ders.slice(0, 1)) + "</span>";
  return '<a class="kart" style="--r:' + renk(d.ders) + '" href="' + kacir(d.href) + '" title="' + kacir(d.kodlar.join(" · ")) + '">' +
    '<div class="resim">' + resim + '<span class="rozet">' + kacir(d.ders) + "</span></div>" +
    '<div class="govde"><span class="unite">' + kacir(d.unite) + "</span>" +
    "<b>" + kacir(d.baslik) + "</b>" +
    '<span class="soru">' + kacir(d.soru || "") + "</span>" +
    '<span class="ilerleme"><i><s style="width:' + y + '%"></s></i>' + durum + "</span></div></a>";
}
function ciz() {
  for (const b of document.querySelectorAll(".cip")) b.setAttribute("aria-pressed", String((b.dataset.d || null) === secili));
  const q = kucuk($("#ara").value.trim());
  const uyan = DERSLER.filter((d) => (!secili || d.ders === secili) &&
    (!q || kucuk([d.ders, d.unite, d.baslik, d.soru, d.kodlar.join(" ")].join(" ")).includes(q)));
  $("#liste").innerHTML = uyan.length ? uyan.map(kart).join("") : '<p class="bos">Eşleşen ders yok.</p>';
}
ciz();
// Bir dersten geri dönüldüğünde ilerleme çubukları güncel olsun
window.addEventListener("pageshow", (e) => e.persisted && ciz());
`;
}
