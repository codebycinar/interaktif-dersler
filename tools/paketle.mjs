// dersler/**/ders.json ile tanımlanan her dersi, internetsiz açılabilen tek bir HTML dosyasına paketler.
// Ders klasörü: ders.json (katalog kaydı) + main.js (giriş) + isteğe bağlı ders.css
// Çıktı: dist/<ders klasörünün dersler/ altındaki yolu>.html, ayrıca dist/index.html ve dist/katalog.json
//   node tools/paketle.mjs                       → hepsini derle
//   node tools/paketle.mjs --sadece slug1,slug2  → yalnızca bu dersleri derle (dizin sayfası yine tüm katalogla yazılır)
//   node tools/paketle.mjs --izle                → değişiklikte yeniden derle
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, watch } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
const yol = (...p) => join(KOK, ...p);
const oku = (p) => readFileSync(yol(p), "utf8");

const mufredatOnbellek = new Map();
function mufredat(dosya) {
  if (!mufredatOnbellek.has(dosya)) mufredatOnbellek.set(dosya, JSON.parse(oku(dosya)));
  return mufredatOnbellek.get(dosya);
}

/** Katalogdaki çıktı kodlarını müfredat dosyasındaki resmi ifadelerle eşleştirir */
function ciktilariCoz(kayit) {
  const d = mufredat(kayit.mufredat);
  // Bazı derslerde kodlar üniteler arasında tekrar eder (ör. TDE1.1 her temada var); uniteId ile daraltılır
  const uniteler = d.dersler.flatMap((ders) => ders.uniteler);
  const kapsam = kayit.uniteId != null ? uniteler.filter((u) => u.id === kayit.uniteId) : uniteler;
  if (kayit.uniteId != null && !kapsam.length) throw new Error(`${kayit.slug}: müfredatta uniteId ${kayit.uniteId} yok`);
  const hepsi = kapsam.flatMap((u) => u.ogrenme_ciktilari);
  return kayit.ciktiKodlari.map((kod) => {
    const c = hepsi.find((x) => x.kod === kod);
    if (!c) throw new Error(`${kayit.slug}: müfredatta bulunamayan çıktı kodu ${kod}`);
    return { kod: c.kod, ifade: c.ifade, surec_bilesenleri: c.surec_bilesenleri };
  });
}

const kacir = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** dersler/ altındaki tüm ders.json dosyalarını okur; kaynak ve çıktı yollarını klasörden türetir */
function katalogOku() {
  const kayitlar = readdirSync(yol("dersler"), { recursive: true })
    .map((p) => String(p).replaceAll("\\", "/"))
    .filter((p) => p.endsWith("/ders.json"))
    .sort()
    .map((p) => {
      const klasor = dirname(`dersler/${p}`);
      let kayit;
      try {
        kayit = JSON.parse(oku(`${klasor}/ders.json`));
        if (!kayit.slug || !Array.isArray(kayit.ciktiKodlari)) throw new Error("slug ve ciktiKodlari zorunlu");
      } catch (e) {
        // başka bir ders yazılırken yarım kalmış olabilir; o dersi atla, diğerlerini derle
        console.error(`! ${klasor}/ders.json okunamadı, atlandı: ${e.message}`);
        return null;
      }
      return { ...kayit, kaynak: `${klasor}/main.js`, cikti: `dist/${relative("dersler", klasor).replaceAll("\\", "/")}.html` };
    })
    .filter(Boolean);
  const slugs = new Set();
  for (const k of kayitlar) {
    if (slugs.has(k.slug)) throw new Error(`Aynı slug iki kez kullanılmış: ${k.slug}`);
    slugs.add(k.slug);
  }
  return kayitlar;
}

/** Ders içi gezinme için aynı sınıftaki derslerin listesi (bağlantılar bu dersin konumuna göre göreli) */
function gezinti(kayit, katalog) {
  const buradan = dirname(yol(kayit.cikti));
  const href = (hedef) => relative(buradan, yol(hedef)).replaceAll("\\", "/");
  return {
    ana: href("dist/index.html"),
    dersler: katalog.filter((k) => k.sinif === kayit.sinif)
      .map((k) => ({ slug: k.slug, ders: k.ders, unite: k.unite, baslik: k.baslik, href: href(k.cikti) })),
  };
}

async function dersiPaketle(kayit, katalog) {
  const meta = { ...kayit, ciktilar: ciktilariCoz(kayit), gezinti: gezinti(kayit, katalog) };
  delete meta.kaynak; delete meta.cikti; delete meta.mufredat; delete meta.ciktiKodlari;

  const sonuc = await build({
    entryPoints: [yol(kayit.kaynak)],
    bundle: true,
    format: "iife",
    minify: true,
    write: false,
    target: ["es2020"],
    legalComments: "eof", // three.js vb. lisans başlıkları paketin sonunda korunur (MIT/ISC gereği)
    loader: { ".json": "json", ".svg": "text", ".txt": "text" },
    define: { __DERS_META__: JSON.stringify(meta) },
    logLevel: "warning",
  });
  const js = sonuc.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

  let css = oku("engine/ders.css");
  const yerelCss = join(dirname(kayit.kaynak), "ders.css");
  if (existsSync(yol(yerelCss))) css += "\n" + oku(yerelCss);

  const html = `<!doctype html>
<html lang="${kacir((kayit.dil || "tr-TR").split("-")[0])}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${kacir(kayit.baslik)}</title>
<meta name="description" content="${kacir(kayit.soru)}">
<style>${css}</style>
</head>
<body>
<noscript>Bu ders için JavaScript gereklidir.</noscript>
<script>${js}</script>
</body>
</html>
`;
  const hedef = yol(kayit.cikti);
  mkdirSync(dirname(hedef), { recursive: true });
  writeFileSync(hedef, html);
  return { hedef, boyut: Buffer.byteLength(html) };
}

function dizinSayfasi(katalog) {
  const veri = katalog.map((k) => ({
    slug: k.slug, sinif: k.sinif, ders: k.ders, unite: k.unite, baslik: k.baslik, soru: k.soru,
    kodlar: k.ciktiKodlari, href: relative(yol("dist"), yol(k.cikti)).replaceAll("\\", "/"),
  }));
  const json = JSON.stringify(veri).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>İnteraktif Dersler</title>
<meta name="description" content="Türkiye Yüzyılı Maarif Modeli'ne uygun, ücretsiz ve açık kaynak interaktif dersler.">
<style>
:root{color-scheme:dark;--zemin:#0f1724;--panel:#172234;--cizgi:#2c3c56;--metin:#e8eef7;--metin2:#a9b6c9;--vurgu:#ffb547;--yesil:#5ad38b}
*{box-sizing:border-box}
body{margin:0;background:var(--zemin);color:var(--metin);font-family:"Segoe UI",system-ui,sans-serif}
main{max-width:1100px;margin:0 auto;padding:28px 16px 40px}
h1{margin:0 0 4px;font-size:28px}p.alt{color:var(--metin2);margin:0 0 20px}
.devam{display:none;align-items:center;gap:14px;padding:14px 16px;border-radius:14px;background:linear-gradient(90deg,rgba(255,181,71,.16),rgba(255,181,71,.04));border:1px solid var(--vurgu);color:inherit;text-decoration:none;margin-bottom:18px}
.devam.var{display:flex}.devam b{display:block;font-size:17px}.devam span{color:var(--metin2);font-size:13px}.devam .ok{margin-left:auto;font-weight:700;color:var(--vurgu);white-space:nowrap}
.arac{position:sticky;top:0;z-index:2;background:var(--zemin);padding:10px 0 12px;display:flex;flex-direction:column;gap:10px}
input[type=search]{width:100%;font:inherit;color:inherit;background:var(--panel);border:1px solid var(--cizgi);border-radius:12px;padding:11px 14px}
.cipler{display:flex;gap:6px;flex-wrap:wrap}
.cip{font:inherit;font-size:13.5px;cursor:pointer;color:var(--metin2);background:var(--panel);border:1px solid var(--cizgi);border-radius:999px;padding:5px 12px}
.cip[aria-pressed=true]{color:var(--vurgu);border-color:var(--vurgu);background:rgba(255,181,71,.1)}
section{margin-top:22px}section>h2{font-size:15px;margin:0 0 10px;color:var(--vurgu);text-transform:uppercase;letter-spacing:.06em;display:flex;gap:10px;align-items:baseline}
section>h2 small{color:var(--metin2);font-weight:500;text-transform:none;letter-spacing:0}
.izgara{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px}
.kart{display:flex;flex-direction:column;gap:6px;padding:15px 16px;border-radius:14px;background:var(--panel);border:1px solid var(--cizgi);color:inherit;text-decoration:none}
.kart:hover,.kart:focus-visible{border-color:var(--vurgu);outline:none}
.ust{font-size:12px;color:var(--metin2);font-weight:600}
.kart b{font-size:16px;line-height:1.3}
.soru{color:var(--metin2);font-size:13.5px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.kod{font-family:Consolas,monospace;font-size:11.5px;color:#8193ad;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ilerleme{margin-top:auto;padding-top:6px;display:flex;align-items:center;gap:8px;font-size:12px;color:var(--metin2)}
.ilerleme i{flex:1;height:5px;border-radius:3px;background:var(--zemin);overflow:hidden}.ilerleme i s{display:block;height:100%;background:var(--yesil)}
.bos{color:var(--metin2);margin-top:24px}
footer{margin-top:36px;color:#8193ad;font-size:13px}footer a{color:var(--metin2)}
</style></head>
<body><main>
<h1>İnteraktif Dersler</h1>
<p class="alt">Türkiye Yüzyılı Maarif Modeli öğretim programlarına göre hazırlanmış, ücretsiz ve açık kaynak interaktif dersler. Her ders internetsiz de çalışır.</p>
<a class="devam" id="devam" href="#"><div><span>Kaldığın yerden devam et</span><b id="devam-baslik"></b><span id="devam-alt"></span></div><span class="ok">Devam ›</span></a>
<div class="arac">
  <input type="search" id="ara" placeholder="Ders, konu ya da çıktı kodu ara… (ör. fotosentez, MAT.10.1)" aria-label="Ders ara">
  <div class="cipler" id="cipler" role="group" aria-label="Derse göre süz"></div>
</div>
<div id="liste"></div>
<noscript><ul>${veri.map((d) => `<li><a href="${kacir(d.href)}">${kacir(d.ders)} · ${kacir(d.baslik)}</a></li>`).join("")}</ul></noscript>
<footer>
  <a href="https://github.com/codebycinar/interaktif-dersler">GitHub'da kaynak kod</a> ·
  İçerik <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.tr">CC BY-NC-SA 4.0</a>, kod MIT ·
  MEB ile bağlantılı değildir.
</footer>
</main>
<script>${dizinBetigi(json)}</script>
</body></html>
`;
}

/** Ana sayfanın tarayıcı betiği: arama, derse göre süzme, ilerleme, kaldığın yerden devam */
function dizinBetigi(json) {
  return String.raw`
const DERSLER = ${json};
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
  $("#devam").href = sonDers.href;
  $("#devam").classList.add("var");
  $("#devam-baslik").textContent = sonDers.baslik;
  $("#devam-alt").textContent = sonDers.sinif + ". Sınıf · " + sonDers.ders + (o ? " · " + o.biten + "/" + o.toplam + " görev" : "");
}

const dersAdlari = [...new Set(DERSLER.map((d) => d.ders))];
$("#cipler").innerHTML = ['<button class="cip" data-d="">Tümü</button>']
  .concat(dersAdlari.map((d) => '<button class="cip" data-d="' + kacir(d) + '">' + kacir(d) + "</button>")).join("");
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
  return '<a class="kart" href="' + kacir(d.href) + '">' +
    '<span class="ust">' + kacir(d.unite) + "</span>" +
    "<b>" + kacir(d.baslik) + "</b>" +
    '<span class="soru">' + kacir(d.soru || "") + "</span>" +
    '<span class="kod">' + d.kodlar.map(kacir).join(" · ") + "</span>" +
    '<span class="ilerleme"><i><s style="width:' + y + '%"></s></i>' + durum + "</span></a>";
}
function ciz() {
  for (const b of document.querySelectorAll(".cip")) b.setAttribute("aria-pressed", String((b.dataset.d || null) === secili));
  const q = kucuk($("#ara").value.trim());
  const uyan = DERSLER.filter((d) => (!secili || d.ders === secili) &&
    (!q || kucuk([d.ders, d.unite, d.baslik, d.soru, d.kodlar.join(" ")].join(" ")).includes(q)));
  const gruplar = new Map();
  for (const d of uyan) {
    const k = d.sinif + ". Sınıf · " + d.ders;
    if (!gruplar.has(k)) gruplar.set(k, []);
    gruplar.get(k).push(d);
  }
  $("#liste").innerHTML = gruplar.size
    ? [...gruplar].map(([k, ds]) => '<section><h2>' + kacir(k) + " <small>" + ds.length + " ders</small></h2>" +
        '<div class="izgara">' + ds.map(kart).join("") + "</div></section>").join("")
    : '<p class="bos">Eşleşen ders yok.</p>';
}
ciz();
// Bir dersten geri dönüldüğünde ilerleme çubukları güncel olsun
window.addEventListener("pageshow", (e) => e.persisted && ciz());
`;
}

async function hepsiniPaketle() {
  const katalog = katalogOku();
  mufredatOnbellek.clear();
  const baslangic = Date.now();
  const hedefler = SADECE ? katalog.filter((k) => SADECE.includes(k.slug)) : katalog;
  if (SADECE) for (const s of SADECE) if (!katalog.some((k) => k.slug === s)) console.error(`✗ ${s}: böyle bir ders yok`), (process.exitCode = 1);
  for (const k of hedefler) {
    try {
      const { hedef, boyut } = await dersiPaketle(k, katalog);
      console.log(`✓ ${k.slug} → ${relative(KOK, hedef)} (${(boyut / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.error(`✗ ${k.slug}: ${e.message}`);
      if (!IZLE) process.exitCode = 1;
    }
  }
  mkdirSync(yol("dist"), { recursive: true });
  writeFileSync(yol("dist/index.html"), dizinSayfasi(katalog));
  writeFileSync(yol("dist/katalog.json"), JSON.stringify(katalog.map(({ kaynak, ...k }) => ({ ...k, cikti: k.cikti.replace(/^dist\//, "") })), null, 2));
  console.log(`dist/index.html yazıldı · ${Date.now() - baslangic} ms`);
}

const IZLE = process.argv.includes("--izle");
const sadeceIdx = process.argv.indexOf("--sadece");
const SADECE = sadeceIdx > 0 ? process.argv[sadeceIdx + 1].split(",").map((s) => s.trim()).filter(Boolean) : null;
await hepsiniPaketle();

if (IZLE) {
  let zamanlayici;
  const tetikle = () => { clearTimeout(zamanlayici); zamanlayici = setTimeout(hepsiniPaketle, 150); };
  for (const d of ["engine", "dersler"]) watch(yol(d), { recursive: true }, tetikle);
  console.log("Değişiklikler izleniyor…");
}
