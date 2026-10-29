// Biyoloji derslerinin duman senaryoları için ortak yardımcılar (tarayıcıda değil, Node'da çalışır)
export const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
export const gorevBekle = (page, ms = 15000) => page.waitForFunction(() => document.querySelector(".d-gorev.tamam"), { timeout: ms }).catch(() => {});
export const kaydir = (page, sira, deger) => page.evaluate((i, v) => {
  const r = document.querySelectorAll(".d-panel input[type=range]")[i];
  r.value = v; r.dispatchEvent(new Event("input"));
}, sira, deger);
/** Metni içeren ilk etkin düğmeye tıklar; yavaş makinede (CI) düğme belirene ya da etkinleşene kadar bekler (varsayılan 15 sn) */
export const dugme = async (page, metin, kok = ".d-uygulama", ms = 15000) => {
  const tiklandi = await page.waitForFunction((m, k) => {
    const b = [...document.querySelectorAll(`${k} button`)].find((x) => x.textContent.includes(m) && !x.disabled);
    b?.click();
    return !!b;
  }, { timeout: ms }, metin, kok).then(() => true, () => false);
  if (!tiklandi) throw new Error(`Düğme yok: ${metin}`);
};
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
/** Adımın anlatımını ↺ Baştan ile yeniden başlatır ve k. kareye (1'den) kadar ilerler; mini soruları deneyerek geçer */
export async function anlatKaresi(page, bekle, k, kareBekle = 1600) {
  await page.evaluate(() => [...document.querySelectorAll(".d-anlat button")].find((b) => b.textContent.includes("Baştan"))?.click());
  await bekle(kareBekle);
  for (let n = 1; n < k;) {
    const durum = await page.evaluate(() => {
      const sik = document.querySelector(".d-kare.simdi .d-kare-siklar button:not([disabled])");
      const devam = document.querySelector(".d-anlat .d-devam");
      if (devam && !devam.disabled && !devam.hidden) { devam.click(); return "ileri"; }
      if (sik) { sik.click(); return "sik"; }
      return "yok";
    });
    if (durum === "yok") break;
    if (durum === "ileri") { n++; await bekle(kareBekle); } else await bekle(120);
  }
}
/** Adım anlatımı bitip alıştırma bölümü (“Şimdi sen dene”) görünene kadar bekler */
export const alistirmaBekle = (page, ms = 30000) => page.waitForFunction(() =>
  !document.querySelector(".d-anlat:not(.bitti)") && !document.querySelector(".d-uygulama-blok[hidden]"), { timeout: ms }).catch(() => {});
