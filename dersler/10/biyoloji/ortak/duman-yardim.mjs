// Biyoloji derslerinin duman senaryoları için ortak yardımcılar (tarayıcıda değil, Node'da çalışır)
export const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
export const gorevBekle = (page, ms = 15000) => page.waitForFunction(() => document.querySelector(".d-gorev.tamam"), { timeout: ms }).catch(() => {});
export const kaydir = (page, sira, deger) => page.evaluate((i, v) => {
  const r = document.querySelectorAll(".d-panel input[type=range]")[i];
  r.value = v; r.dispatchEvent(new Event("input"));
}, sira, deger);
/** Metni içeren ilk düğmeye tıklar */
export const dugme = (page, metin, kok = ".d-uygulama") => page.evaluate((m, k) => {
  const b = [...document.querySelectorAll(`${k} button`)].find((x) => x.textContent.includes(m) && !x.disabled);
  if (!b) throw new Error(`Düğme yok: ${m}`);
  b.click();
}, metin, kok);
/** Sınıflandırma: [kart metninin başı, kutu adı] çiftlerini yerleştirip “Kontrol et”e basar */
export const yerlestir = (page, ciftler) => page.evaluate((c) => {
  for (const [metin, kutu] of c) {
    const k = [...document.querySelectorAll(".bio-kart")].find((x) => x.textContent.startsWith(metin) && !x.classList.contains("dogru"));
    if (!k) throw new Error(`Kart yok: ${metin}`);
    k.click();
    document.querySelector(`.bio-kutu[data-kutu="${kutu}"]`).click();
  }
  [...document.querySelectorAll(".bio-sinif button")].find((b) => b.textContent === "Kontrol et").click();
}, ciftler);
/** Sınav: sayı ise metin kutusuna yazılır, değilse o şık seçilir */
export async function sinaviCoz(page, bekle, cevaplar) {
  for (const c of cevaplar) {
    if (typeof c === "string") {
      await page.evaluate((v) => { document.querySelector(".d-sinav input").value = v; }, c);
      await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => b.textContent === "Cevapla").click());
    } else await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    await bekle(80);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(80);
  }
  return page.evaluate(() => document.querySelector(".d-puan")?.textContent);
}
/** Telefon genişliğinde (390 px) seçilen adımların ekran görüntüsünü alır */
export async function telefon(page, adimaGit, bekle, ekranGoruntusu, adimlar) {
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  for (const i of adimlar) {
    await adimaGit(i);
    await page.evaluate(() => [...document.querySelectorAll(".d-giris button")].find((b) => /Başla|başla/.test(b.textContent))?.click());
    await bekle(500);
    await ekranGoruntusu(`telefon-${String(i + 1).padStart(2, "0")}`);
  }
  await page.setViewport({ width: 1408, height: 840 });
}
