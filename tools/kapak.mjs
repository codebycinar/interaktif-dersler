// Kapak görseli: derlenmiş dersi görünmez Chrome'da açar, arayüzü gizler ve sahnenin
// ekran görüntüsünü ders klasörüne kapak.webp olarak yazar (ana sayfadaki ders kartları için).
//   node tools/kapak.mjs                  → tüm dersler
//   node tools/kapak.mjs slug1 slug2      → yalnızca bu dersler
// Ders hangi adımda çekileceğini ders.json'da "kapakAdim" (0'dan başlar) ile seçebilir.
// Önce npm run build çalıştırılmalı.
import puppeteer from "puppeteer-core";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find((p) => existsSync(p));
const secilen = process.argv.slice(2);

const dersler = readdirSync(join(KOK, "dersler"), { recursive: true })
  .map((p) => String(p).replaceAll("\\", "/"))
  .filter((p) => p.endsWith("/ders.json"))
  .map((p) => {
    const klasor = join(KOK, "dersler", dirname(p));
    try {
      const kayit = JSON.parse(readFileSync(join(klasor, "ders.json"), "utf8"));
      return { ...kayit, klasor, html: join(KOK, "dist", relative(join(KOK, "dersler"), klasor) + ".html") };
    } catch { return null; }
  })
  .filter((d) => d && existsSync(d.html) && (!secilen.length || secilen.includes(d.slug)));

if (!CHROME) { console.error("Chrome/Edge bulunamadı."); process.exit(1); }
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
const tarayici = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 300000,
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--allow-file-access-from-files", "--mute-audio"],
});

// Hata ya da zaman aşımında Chrome arkada açık kalmasın
try {
for (const d of dersler) {
  const page = await tarayici.newPage();
  await page.setViewport({ width: 960, height: 600 });
  // sesli okuma ve anlatım kapalı başlasın
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem("edu:sesli", "false"); } catch {} });
  try {
    await page.goto(pathToFileURL(d.html).href, { waitUntil: "load", timeout: 60000 });
    await bekle(1200);
    await page.evaluate(() => [...document.querySelectorAll(".d-giris button")].find((b) => /^(Başla|Baştan başla)$/.test(b.textContent))?.click());
    await bekle(400);
    const adim = d.kapakAdim ?? 0;
    if (adim) await page.evaluate((n) => document.querySelectorAll(".d-adimlar li button")[n]?.click(), adim);
    // Arayüzü gizle: yalnızca sahne (3B tuval ya da çizim) kalsın
    await page.addStyleTag({ content: `
      .d-uygulama > :not(.d-sahne), .d-ortu, .d-igneler, .d-sahne .d-kenar-btn { visibility: hidden !important; }
      .d-tam .d-panel, .d-tam .d-adimlar, .d-tam .d-ust, .d-tam .d-alt { visibility: hidden !important; }` });
    // 3B dünyası olan derste yüzen 2B paneller de gizlenir; 2B derste çizim katmandadır, kalır
    await page.evaluate(() => { if (document.querySelector(".d-sahne canvas.d-3b")) document.querySelector(".d-katman")?.style.setProperty("visibility", "hidden", "important"); });
    await bekle(3500);
    const sahne = await page.$(".d-sahne");
    const kutu = sahne && await sahne.boundingBox();
    const yol = join(d.klasor, "kapak.webp");
    const resim = await page.screenshot({ type: "webp", quality: 72, ...(kutu && kutu.width > 200 ? { clip: kutu } : {}) });
    writeFileSync(yol, resim);
    console.log(`✓ ${d.slug} → ${relative(KOK, yol)} (${(resim.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    console.error(`✗ ${d.slug}: ${e.message}`);
    process.exitCode = 1;
  }
  await page.close();
}
} finally {
  await tarayici.close();
}
