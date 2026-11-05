// Derse özel duman senaryosu: eşleştirme, alan hesabı ve değerlendirme
const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: sembolleri doğru eşleştir
  await adimaGit(0);
  await page.evaluate(() => {
    for (const s of document.querySelectorAll(".fzg-sembol")) {
      s.click();
      document.querySelector(`.fzg-anlam[data-s="${s.dataset.s}"]`).click();
    }
  });
  await bekle(100);
  kontrol(await gorevTamamMi(page), "1. adım: yedi sembol eşleşince görev tamamlanıyor");

  // 6. adım: alan sorularına modelden hesaplanan cevapları ver
  await adimaGit(5);
  const grafikVar = await page.evaluate(() => !!document.querySelector(".d-grafikler canvas"));
  kontrol(grafikVar, "6. adım: hız–zaman grafiği çizildi");

  // 10. adım: değerlendirme
  await adimaGit(9);
  for (const c of [1, "-10", 1, "32", 2, 0, 1, "-4"]) {
    if (typeof c === "string") {
      await page.evaluate((v) => { document.querySelector(".d-sinav input").value = v; }, c);
      await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => b.textContent === "Cevapla").click());
    } else {
      await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    }
    await bekle(80);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(80);
  }
  const puan = await page.evaluate(() => document.querySelector(".d-puan")?.textContent);
  kontrol(puan === "8 / 8", `değerlendirme tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "değerlendirme görevi tamamlanıyor");
  await ekranGoruntusu("sinav-sonu");
};
