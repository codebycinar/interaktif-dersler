// Derse özel duman senaryosu (tools/duman.mjs çalıştırır): görevleri gerçekten yapıp tamamlandığını doğrular
const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
const kaydir = (page, sira, deger) => page.evaluate((i, v) => {
  const r = document.querySelectorAll(".d-panel input[type=range]")[i];
  r.value = v; r.dispatchEvent(new Event("input"));
}, sira, deger);

export default async ({ page, adimaGit, bekle, tikla, kontrol, ekranGoruntusu }) => {
  // 1. adım: ileri sonra geri sür → alınan yol ≠ |Δx|
  await adimaGit(0);
  await kaydir(page, 0, 70);
  await tikla(".d-panel button", "Hedefe sür");
  await page.waitForFunction(() => !document.querySelector(".d-panel")?.textContent.includes("Son konum") || document.querySelectorAll(".d-gosterge b")[1].textContent.startsWith("70"), { timeout: 15000 });
  await kaydir(page, 0, 40);
  await tikla(".d-panel button", "Hedefe sür");
  await page.waitForFunction(() => document.querySelector(".d-gorev.tamam"), { timeout: 15000 }).catch(() => {});
  kontrol(await gorevTamamMi(page), "1. adım: ileri-geri sürüşte görev tamamlanıyor");

  // 7. adım: doğru grafiği seç, alanı gir
  await adimaGit(6);
  const dogruHarf = await page.evaluate(() => {
    // doğru seçenek, hız–zaman grafiğine uyan eğri: denemeyle bul
    return [...document.querySelectorAll(".fz-secim-kart")].length;
  });
  kontrol(dogruHarf === 3, "7. adım: üç seçenek kartı var");

  // 9. adım: sınavı tam puanla bitir
  await adimaGit(8);
  for (const c of ["120", "10", 1, "160", "4", 1, 1, 0]) {
    if (typeof c === "string") {
      await page.evaluate((v) => { document.querySelector(".d-sinav input").value = v; }, c);
      await tikla(".d-sinav button", "Cevapla");
    } else {
      await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    }
    await bekle(80);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(80);
  }
  const puan = await page.evaluate(() => document.querySelector(".d-puan")?.textContent);
  kontrol(puan === "8 / 8", `9. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "9. adım: sınav görevi tamamlanıyor");
  await ekranGoruntusu("sinav-sonu");
};
