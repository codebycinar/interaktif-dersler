// dersler/**/ders.json ile tanımlanan her dersi, internetsiz açılabilen tek bir HTML dosyasına paketler.
// Ders klasörü: ders.json (katalog kaydı) + main.js (giriş) + isteğe bağlı ders.css
// Çıktı: dist/<ders klasörünün dersler/ altındaki yolu>.html, ayrıca dist/index.html ve dist/katalog.json
//   node tools/paketle.mjs                       → hepsini derle
//   node tools/paketle.mjs --sadece slug1,slug2  → yalnızca bu dersleri derle (dizin sayfası yine tüm katalogla yazılır)
//   node tools/paketle.mjs --izle                → değişiklikte yeniden derle
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, watch } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { anaSayfa } from "./anasayfa.mjs";

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

/** Ana sayfa verisi; dersin kapak.webp'si varsa dist'te dersin yanına kopyalanır */
function dizinVerisi(katalog) {
  return katalog.map((k) => {
    const href = relative(yol("dist"), yol(k.cikti)).replaceAll("\\", "/");
    const kapakKaynak = join(dirname(k.kaynak), "kapak.webp");
    let kapak = null;
    if (existsSync(yol(kapakKaynak))) {
      kapak = href.replace(/\.html$/, ".webp");
      mkdirSync(dirname(yol("dist", kapak)), { recursive: true });
      copyFileSync(yol(kapakKaynak), yol("dist", kapak));
    }
    return { slug: k.slug, sinif: k.sinif, ders: k.ders, unite: k.unite, baslik: k.baslik, soru: k.soru, kodlar: k.ciktiKodlari, href, kapak };
  });
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
  writeFileSync(yol("dist/index.html"), anaSayfa(dizinVerisi(katalog)));
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
