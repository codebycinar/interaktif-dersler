// Derse özel duman senaryosu: sayısal soruların doğru cevapları kabul edildiğini ve provanın tam puanla bittiğini doğrular
const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
const sayiCevapla = async (page, bekle, sira, deger) => {
  await page.evaluate((i, v) => {
    const kutu = document.querySelectorAll(".d-panel .d-girdi")[i];
    const g = kutu.querySelector("input"); g.value = v;
    kutu.querySelector("button").click();
  }, sira, String(deger));
  await bekle(60);
};

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. soru benzeri: 11. ağaç, 24 m/s
  await adimaGit(0);
  await sayiCevapla(page, bekle, 0, "11");
  await sayiCevapla(page, bekle, 1, "24");
  kontrol(await gorevTamamMi(page), "1. soru: iki cevapla görev tamamlanıyor");

  // 2. soru benzeri: 5 s, 30 m
  await adimaGit(1);
  await sayiCevapla(page, bekle, 0, "5");
  await sayiCevapla(page, bekle, 1, "30");
  kontrol(await gorevTamamMi(page), "2. soru: yetişme süresi ve yol");

  // 7. soru benzeri: 24, 88, 3,27
  await adimaGit(6);
  await sayiCevapla(page, bekle, 0, "24");
  await sayiCevapla(page, bekle, 1, "88");
  await sayiCevapla(page, bekle, 2, "3,27");
  kontrol(await gorevTamamMi(page), "7. soru: ilk hız, yer değiştirme, en az ivme");

  // Prova
  await adimaGit(7);
  for (const c of ["13", "6", 1, 1, "-3", "126", "30", "5"]) {
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
  kontrol(puan === "8 / 8", `prova tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "prova görevi tamamlanıyor");
  await ekranGoruntusu("prova-sonu");
};
