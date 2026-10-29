// Matematik derslerinin duman senaryoları için yardımcılar: tahtadaki noktaları gerçek fare hareketiyle sürükler.
// Tahta, dünya → ekran dönüşümünü svg[data-donusum] = "ox,oy,olcek" olarak yazar.

/** Dünya koordinatını sayfa koordinatına çevirir */
export const ekranda = (page, x, y) => page.evaluate((wx, wy) => {
  const svg = document.querySelector(".d-sahne svg.mt-tahta");
  const [ox, oy, sc] = svg.dataset.donusum.split(",").map(Number);
  const r = svg.getBoundingClientRect();
  return { x: r.left + ox + wx * sc, y: r.top + oy - wy * sc };
}, x, y);

/** Adı verilen noktanın ekran konumu */
export const noktaEkranda = (page, ad) => page.evaluate((a) => {
  const g = document.querySelector(`.d-sahne [data-nokta="${a}"]`);
  if (!g) throw new Error(`Nokta yok: ${a}`);
  const r = g.querySelector("circle:nth-child(3)").getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}, ad);

/** Noktayı dünya koordinatı (x, y)'ye sürükler */
export async function surukle(page, ad, x, y, adim = 12) {
  const p = await noktaEkranda(page, ad);
  const h = await ekranda(page, x, y);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(h.x, h.y, { steps: adim });
  await page.mouse.up();
  await new Promise((r) => setTimeout(r, 60));
}

/** Panelde metni içeren düğmeye basar (secenekler, dugmeler); anlatım karelerindeki şıklar atlanır */
export const dugme = (page, metin, kap = ".d-panel") => page.evaluate((m, k) => {
  const b = [...document.querySelectorAll(`${k} button`)].filter((e) => !e.closest(".d-anlat"))
    .find((e) => e.textContent.trim() === m || e.textContent.includes(m));
  if (!b) throw new Error(`Düğme yok: ${m}`);
  b.click();
}, metin, kap);

/** Sayı sorusuna (sıradaki) cevap yazıp kontrol eder; geri bildirim metnini döndürür */
export const cevapla = (page, deger, sira = 0) => page.evaluate((v, i) => {
  const girdi = document.querySelectorAll(".d-panel .d-girdi input[type=text]")[i];
  girdi.value = String(v);
  girdi.closest(".d-girdi").querySelector("button").click();
  return girdi.closest("div").parentElement.querySelector(".d-geri-bildirim")?.textContent || "";
}, deger, sira);

export const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));

/** Sınavı verilen cevaplarla bitirir: sayı → yazılır, {s: i} → i. şık */
export async function sinaviCoz(page, cevaplar, bekle) {
  for (const c of cevaplar) {
    if (typeof c === "object") await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c.s);
    else {
      await page.evaluate((v) => {
        const g = document.querySelector(".d-sinav input");
        g.value = String(v);
        [...document.querySelectorAll(".d-sinav button")].find((b) => b.textContent === "Cevapla").click();
      }, c);
    }
    await bekle(80);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(80);
  }
  return page.evaluate(() => document.querySelector(".d-puan")?.textContent);
}

/** Telefon genişliğinde (390 px) seçilen adımların ekran görüntüsünü alır, sonra masaüstüne döner */
export async function mobilGoruntuler(page, adimaGit, ekranGoruntusu, adimlar) {
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await new Promise((r) => setTimeout(r, 300));
  await page.evaluate(() => document.querySelector(".d-giris")?.closest(".d-ortu")?.remove());
  for (const i of adimlar) {
    await adimaGit(i);
    await ekranGoruntusu(`mobil-${String(i + 1).padStart(2, "0")}`);
  }
  await page.setViewport({ width: 1408, height: 840 });
}

/** 3B dünyadaki tutamağı (dunyaAc → tutamak) zeminde (x, z) noktasına gerçek fare hareketiyle sürükler */
export async function dunyaSurukle(page, ad, x, z, { y = 0, adim = 14 } = {}) {
  await kameraDursun(page);
  const [p, h] = await page.evaluate((a, wx, wy, wz) => {
    const k = document.querySelector(".mt-dunya");
    return [k.__tutamak(a), k.__ekran(wx, wy, wz)];
  }, ad, x, y, z);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(h.x, h.y, { steps: adim });
  await page.mouse.up();
  await new Promise((r) => setTimeout(r, 80));
}

/** Kamera geçişi (S.kameraGit) bitene kadar bekler, sonra iki kare daha çizilsin (en çok 8 s) */
export async function kameraDursun(page) {
  await page.waitForFunction(() => document.querySelector(".mt-dunya")?.__gecis === 0, { timeout: 8000, polling: 100 });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 120)))));
}

/** Anlatımı en çok n kare ilerletir (mini sorularda doğru şıkkı bulana dek dener); geçilen kare sayısını döndürür */
export const anlatimIlerle = (page, n = 999) => page.evaluate(async (en) => {
  const dur = (ms) => new Promise((r) => setTimeout(r, ms));
  let kare = 0, takili = 0;
  while (kare < en && document.querySelector(".d-anlat:not(.bitti)")) {
    const devam = document.querySelector(".d-anlat .d-devam");
    if (devam && !devam.disabled && !devam.hidden) { devam.click(); kare++; takili = 0; await dur(150); continue; }
    const sik = document.querySelector(".d-kare.simdi .d-kare-siklar button:not([disabled])");
    if (sik) { sik.click(); await dur(80); continue; }
    if (++takili > 40) break;
    await dur(100);
  }
  return kare;
}, n);

/**
 * Bulunulan adımın anlatımını ↺ Baştan ile yeniden oynatır: kare kadar ilerleyip görüntü alır, sonra bitirir.
 * Gösterimin görevi ya da görev maddelerini tamamlamadığını ve sonunda alıştırmanın açık olduğunu denetler.
 */
export async function anlatimDenetle(page, { bekle, kontrol, ekranGoruntusu }, ad, kare = 5) {
  const say = () => page.evaluate(() => document.querySelectorAll(".d-panel .mt-liste li.tamam").length);
  const once = await say();
  await page.evaluate(() => [...document.querySelectorAll(".d-anlat button")].find((b) => b.textContent.includes("Baştan"))?.click());
  await bekle(200);
  await anlatimIlerle(page, kare);
  await bekle(1500);
  await ekranGoruntusu(`${ad}-anlat`);
  await anlatimIlerle(page);
  await bekle(400);
  const d = await page.evaluate(() => ({
    bitti: !!document.querySelector(".d-anlat.bitti"),
    acik: !document.querySelector(".d-uygulama-blok[hidden]"),
    gorev: document.querySelector(".d-gorev")?.classList.contains("tamam") || false,
  }));
  kontrol(d.bitti && d.acik, `${ad}: anlatım baştan oynatılıp bitirildi, alıştırma açık`);
  kontrol(!d.gorev && (await say()) === once, `${ad}: gösterim görevi ve görev maddelerini tamamlamadı`);
}
