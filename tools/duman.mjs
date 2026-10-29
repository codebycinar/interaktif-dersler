// Duman testi: derlenmiş dersleri görünmez Chrome'da açar, tüm adımları gezer,
// konsol hatalarını toplar ve her adımın ekran görüntüsünü kaydeder.
//   node tools/duman.mjs                      → tüm dersler
//   node tools/duman.mjs slug1 slug2          → yalnızca bu dersler
//   node tools/duman.mjs slug --bekle 2500    → her adımda daha uzun bekle (ms)
//
// Ders klasöründe duman.mjs varsa genel gezintiden sonra çalıştırılır:
//   export default async ({ page, adimaGit, bekle, tikla, kontrol }) => { ... }
// kontrol(kosul, mesaj) yanlışsa test başarısız sayılır.
//
// Çıktı: <geçici klasör>/edu-duman/<slug>/adim-NN.png, mobil.png ve rapor.json
// (proje OneDrive içinde olduğu için senkron kilitlerinden kaçınmak adına; DUMAN_CIKTI ile değiştirilebilir)
import puppeteer from "puppeteer-core";
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
const CIKTI_KOK = process.env.DUMAN_CIKTI || join(tmpdir(), "edu-duman");
const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find((p) => existsSync(p));

const arguman = process.argv.slice(2);
const bekleIdx = arguman.indexOf("--bekle");
const ADIM_BEKLE = bekleIdx >= 0 ? +arguman.splice(bekleIdx, 2)[1] : 900;
const secilen = arguman;

const dersler = readdirSync(join(KOK, "dersler"), { recursive: true })
  .map((p) => String(p).replaceAll("\\", "/"))
  .filter((p) => p.endsWith("/ders.json"))
  .map((p) => {
    const klasor = join(KOK, "dersler", dirname(p));
    try {
      const kayit = JSON.parse(readFileSync(join(klasor, "ders.json"), "utf8"));
      const html = join(KOK, "dist", relative(join(KOK, "dersler"), klasor) + ".html");
      return { ...kayit, klasor, html };
    } catch { return null; }
  })
  .filter(Boolean)
  .filter((d) => !secilen.length || secilen.includes(d.slug));

if (!dersler.length) { console.error("Ders bulunamadı."); process.exit(1); }
if (!CHROME) { console.error("Chrome/Edge bulunamadı."); process.exit(1); }

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
const tarayici = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    "--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--autoplay-policy=no-user-gesture-required", "--allow-file-access-from-files", "--mute-audio",
    // GitHub Actions (Ubuntu) kullanıcı ad alanı kısıtı nedeniyle sandbox'sız çalışmalı
    ...(process.platform === "linux" ? ["--no-sandbox", "--disable-dev-shm-usage"] : []),
  ],
});

let basarisiz = 0;
for (const d of dersler) {
  const cikti = join(CIKTI_KOK, d.slug);
  mkdirSync(cikti, { recursive: true });
  const rapor = { slug: d.slug, hatalar: [], uyarilar: [], adimlar: [], kontroller: [] };
  if (!existsSync(d.html)) {
    rapor.hatalar.push(`Derlenmiş dosya yok: ${d.html} (önce npm run build)`);
  } else {
    const page = await tarayici.newPage();
    const ekran = page.screenshot.bind(page);
    page.screenshot = async (o) => { try { return await ekran(o); } catch { await bekle(500); return ekran(o); } };
    await page.setViewport({ width: 1408, height: 840 });
    // Görünmez tarayıcıda da Windows konuşma motoru hoparlörden çalar: sesli okumayı sessiz bir taklitle değiştir
    await page.evaluateOnNewDocument(() => {
      if (!("speechSynthesis" in window)) return;
      let zamanlayici = null, aktif = null;
      const bitir = (tur) => { clearTimeout(zamanlayici); const u = aktif; aktif = null; u?.dispatchEvent(new Event(tur)); };
      speechSynthesis.speak = (u) => {
        if (aktif) bitir("error");
        aktif = u;
        setTimeout(() => u.dispatchEvent(new Event("start")), 0);
        zamanlayici = setTimeout(() => bitir("end"), Math.min(2000, 15 * (u.text || "").length + 100));
      };
      speechSynthesis.cancel = () => { if (aktif) bitir("error"); };
      Object.defineProperty(speechSynthesis, "speaking", { get: () => !!aktif });
    });
    page.on("console", (m) => {
      if (m.type() === "error") rapor.hatalar.push(`console: ${m.text()}`);
      else if (m.type() === "warning") rapor.uyarilar.push(m.text());
    });
    page.on("pageerror", (e) => rapor.hatalar.push(`pageerror: ${e.message}`));
    await page.goto(pathToFileURL(d.html).href, { waitUntil: "load" });
    await bekle(800);
    await page.screenshot({ path: join(cikti, "giris.png") });

    // giriş kartını kapat
    await page.evaluate(() => [...document.querySelectorAll(".d-giris button")].find((b) => /^(Başla|Baştan başla)$/.test(b.textContent))?.click());
    await bekle(300);

    const adimSayisi = await page.evaluate(() => document.querySelectorAll(".d-adimlar li").length);
    const adimaGit = async (i) => {
      await page.evaluate((n) => document.querySelectorAll(".d-adimlar li button")[n].click(), i);
      await bekle(ADIM_BEKLE);
    };
    for (let i = 0; i < adimSayisi; i++) {
      await adimaGit(i);
      const bilgi = await page.evaluate(() => ({
        baslik: document.querySelector(".d-panel h2")?.textContent,
        cikti: document.querySelector(".d-adim-cikti")?.textContent || null,
        gorev: !!document.querySelector(".d-gorev"),
        yuklemeHatasi: [...document.querySelectorAll(".d-panel .d-geri-bildirim.yanlis")].map((e) => e.textContent).find((t) => t.includes("yüklenirken hata")) || null,
        bosPanel: (document.querySelector(".d-anlatim")?.textContent.trim().length || 0) < 40,
        tasma: document.documentElement.scrollWidth > window.innerWidth + 1,
      }));
      if (bilgi.yuklemeHatasi) rapor.hatalar.push(`Adım ${i + 1}: ${bilgi.yuklemeHatasi}`);
      if (bilgi.bosPanel) rapor.hatalar.push(`Adım ${i + 1}: anlatım metni boş ya da çok kısa`);
      if (bilgi.tasma) rapor.uyarilar.push(`Adım ${i + 1}: yatay taşma var`);
      rapor.adimlar.push(bilgi);
      await page.screenshot({ path: join(cikti, `adim-${String(i + 1).padStart(2, "0")}.png`) });
    }

    // derse özel senaryo
    const ozel = join(d.klasor, "duman.mjs");
    if (existsSync(ozel)) {
      const kontrol = (kosul, mesaj) => { rapor.kontroller.push(`${kosul ? "✓" : "✗"} ${mesaj}`); if (!kosul) rapor.hatalar.push(`kontrol: ${mesaj}`); };
      const tikla = (secici, metin) => page.evaluate((s, m) => {
        const el = [...document.querySelectorAll(s)].find((e) => !m || e.textContent.includes(m));
        if (!el) throw new Error(`Bulunamadı: ${s} ${m || ""}`);
        el.click();
      }, secici, metin);
      try {
        const fn = (await import(pathToFileURL(ozel).href)).default;
        await fn({ page, adimaGit, bekle, tikla, kontrol, ekranGoruntusu: (ad) => page.screenshot({ path: join(cikti, `${ad}.png`) }) });
      } catch (e) {
        rapor.hatalar.push(`duman.mjs: ${e.message}`);
      }
    }

    // mobil görünüm
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await adimaGit(0);
    await page.screenshot({ path: join(cikti, "mobil.png"), fullPage: true });
    await page.close();
  }
  writeFileSync(join(cikti, "rapor.json"), JSON.stringify(rapor, null, 2));
  const durum = rapor.hatalar.length ? "✗" : "✓";
  if (rapor.hatalar.length) basarisiz++;
  console.log(`${durum} ${d.slug}: ${rapor.adimlar.length} adım, ${rapor.hatalar.length} hata, ${rapor.uyarilar.length} uyarı${rapor.kontroller.length ? `, ${rapor.kontroller.filter((k) => k.startsWith("✓")).length}/${rapor.kontroller.length} kontrol` : ""}`);
  for (const h of rapor.hatalar.slice(0, 10)) console.log(`    ${h}`);
}
await tarayici.close();
console.log(`Ekran görüntüleri: ${CIKTI_KOK}`);
process.exit(basarisiz ? 1 : 0);
