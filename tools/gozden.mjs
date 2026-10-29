// Gözden geçirme: dersin her adımını öğrencinin göreceği hâliyle çeker ve tek bir temas sayfasında toplar.
// Her adım için: anlatımın ilk karesi, orta karesi, alıştırma ("Şimdi sen dene") ve telefonda ilk kare.
//   node tools/gozden.mjs slug1 [slug2 …]      → <geçici klasör>/edu-gozden/<slug>/temas.png
// Bitirmeden önce bu sayfaya bakın: boş grafik, üst üste binen etiket, odaksız kare, taşan metin kalmasın.
// Önce npm run build çalıştırılmalı.
import puppeteer from "puppeteer-core";
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
const CIKTI_KOK = process.env.GOZDEN_CIKTI || join(tmpdir(), "edu-gozden");
const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find((p) => existsSync(p));
const secilen = process.argv.slice(2);
if (!secilen.length) { console.error("Kullanım: node tools/gozden.mjs <slug> [slug …]"); process.exit(1); }

const dersler = readdirSync(join(KOK, "dersler"), { recursive: true })
  .map((p) => String(p).replaceAll("\\", "/"))
  .filter((p) => p.endsWith("/ders.json"))
  .map((p) => {
    const klasor = join(KOK, "dersler", dirname(p));
    try {
      const kayit = JSON.parse(readFileSync(join(klasor, "ders.json"), "utf8"));
      return { ...kayit, html: join(KOK, "dist", relative(join(KOK, "dersler"), klasor) + ".html") };
    } catch { return null; }
  })
  .filter((d) => d && secilen.includes(d.slug));

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
const tarayici = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 300000,
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--allow-file-access-from-files", "--mute-audio"],
});

/** Sayfayı açar, giriş kartını kapatır, sesli okumayı kapatır */
async function ac(boyut) {
  const page = await tarayici.newPage();
  await page.setViewport(boyut);
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem("edu:sesli", "false"); } catch {}
    if ("speechSynthesis" in window) speechSynthesis.speak = () => {};
  });
  return page;
}
const girisiKapat = (page) => page.evaluate(() => [...document.querySelectorAll(".d-giris button")].find((b) => /^(Başla|Baştan başla)$/.test(b.textContent))?.click());
/** Adıma gider ve anlatımı baştan başlatır; kare sayısını döndürür */
async function adimaGit(page, i) {
  await page.evaluate((n) => document.querySelectorAll(".d-adimlar li button")[n].click(), i);
  await bekle(600);
  await page.evaluate(() => document.querySelector('.d-anlat button[title="Anlatımı baştan izle"]')?.click());
  await bekle(1800);
  return page.evaluate(() => +(document.querySelector(".d-kare-sayac")?.textContent.split("/")[1] || 0));
}
/** Anlatımda k kare ilerler; mini soruda doğru şıkkı bulana dek dener. Anlatım biterse ya da
 *  bir kare öğrenciden sahnede bir hareket bekliyorsa (etkileşim) durur; takılan kareyi döndürür. */
async function ilerle(page, k) {
  for (let j = 0; j < k; j++) {
    const durum = await page.evaluate(async () => {
      const dur = (ms) => new Promise((r) => setTimeout(r, ms));
      for (let t = 0; t < 30; t++) {
        if (!document.querySelector(".d-anlat:not(.bitti)")) return "bitti";
        const d = document.querySelector(".d-anlat .d-devam");
        if (d && !d.disabled && !d.hidden) { d.click(); return "ok"; }
        document.querySelector(".d-kare.simdi .d-kare-siklar button:not([disabled])")?.click();
        await dur(120);
      }
      return document.querySelector(".d-kare.simdi")?.textContent.slice(0, 60) || "?";
    });
    if (durum === "bitti") return null;
    if (durum !== "ok") return durum;
    await bekle(250);
  }
  return null;
}
const sonaKadar = (page) => ilerle(page, 40);

// Hata ya da zaman aşımında Chrome arkada açık kalmasın
try {
for (const d of dersler) {
  const cikti = join(CIKTI_KOK, d.slug);
  mkdirSync(cikti, { recursive: true });
  const satirlar = [];
  const masa = await ac({ width: 1520, height: 900 });
  const tel = await ac({ width: 390, height: 844, isMobile: true, hasTouch: true });
  for (const p of [masa, tel]) { await p.goto(pathToFileURL(d.html).href, { waitUntil: "load" }); await bekle(1500); await girisiKapat(p); await bekle(400); }
  const adimlar = await masa.evaluate(() => [...document.querySelectorAll(".d-adimlar li")].map((li) => li.textContent.trim()));
  for (let i = 0; i < adimlar.length; i++) {
    const ad = (s) => join(cikti, `${String(i + 1).padStart(2, "0")}-${s}.png`);
    const toplam = await adimaGit(masa, i);
    await bekle(1500);
    await masa.screenshot({ path: ad("ilk") });
    const kareler = ["ilk"];
    if (toplam > 2) {
      await ilerle(masa, Math.floor(toplam / 2));
      await bekle(1800);
      await masa.screenshot({ path: ad("orta") });
      kareler.push("orta");
    }
    const takildi = await sonaKadar(masa);
    if (takildi) console.log(`\n  ! ${i + 1}. adım: anlatım "${takildi}" karesinde öğrenci hareketi bekliyor; alıştırma karesi o hâliyle çekildi`);
    await bekle(1500);
    await masa.screenshot({ path: ad("uygulama") });
    kareler.push("uygulama");
    await adimaGit(tel, i);
    await bekle(1500);
    await tel.screenshot({ path: ad("telefon") });
    kareler.push("telefon");
    satirlar.push({ no: i + 1, ad: adimlar[i], kareler: kareler.map((k) => `${String(i + 1).padStart(2, "0")}-${k}.png`), toplam });
    process.stdout.write(`  ${d.slug} ${i + 1}/${adimlar.length}\r`);
  }
  await masa.close(); await tel.close();

  // Temas sayfası: her satır bir adım
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#e9edf2;font:14px "Segoe UI",sans-serif;color:#1d2735;padding:16px}
    h1{font-size:20px;margin:0 0 12px}.s{display:grid;grid-template-columns:150px repeat(3,1fr) 120px;gap:8px;margin-bottom:10px;align-items:start}
    .s b{font-size:13px}.s small{display:block;color:#5b6b80}img{width:100%;border:1px solid #c3ccd8;border-radius:6px;display:block}
    figure{margin:0}figcaption{font-size:11px;color:#5b6b80}</style>
    <h1>${d.slug} · ${d.baslik}</h1>
    ${satirlar.map((r) => `<div class="s"><div><b>${r.no}. ${r.ad.replace(/^\d+\s*/, "")}</b><small>${r.toplam} kare</small></div>
      ${["ilk", "orta", "uygulama", "telefon"].map((k) => { const f = r.kareler.find((x) => x.includes(k)); return f ? `<figure><img src="${f}"><figcaption>${k}</figcaption></figure>` : "<div></div>"; }).join("")}</div>`).join("")}`;
  writeFileSync(join(cikti, "temas.html"), html);
  const sayfa = await tarayici.newPage();
  await sayfa.setViewport({ width: 1900, height: 1000 });
  await sayfa.goto(pathToFileURL(join(cikti, "temas.html")).href, { waitUntil: "load" });
  await bekle(500);
  await sayfa.screenshot({ path: join(cikti, "temas.png"), fullPage: true });
  await sayfa.close();
  console.log(`✓ ${d.slug}: ${satirlar.length} adım → ${join(cikti, "temas.png")}`);
}
} finally {
  await tarayici.close();
}
