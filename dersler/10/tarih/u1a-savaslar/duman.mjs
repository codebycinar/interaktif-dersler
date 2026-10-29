// Derse özel duman senaryosu: görevleri programla yapar ve tamamlandığını doğrular
import { SAVASLAR, TESKILAT, KARSILASTIRMALAR, ZINCIRLER } from "./veri.js";

const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
const tiklaSecici = (page, secici) => page.evaluate((s) => {
  const e = document.querySelector(s);
  if (!e) throw new Error(`Bulunamadı: ${s}`);
  e.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}, secici);

/** Sınıflandırma destesini veri tablosuna göre çözer */
async function desteyiCoz(page, bekle, kutuBul, adet) {
  for (let i = 0; i < adet; i++) {
    const id = await page.evaluate(() => document.querySelector(".hrt-deste-kart")?.dataset.id);
    await tiklaSecici(page, `.hrt-kutu-dugmeleri [data-kutu="${kutuBul(id)}"]`);
    await bekle(40);
  }
}

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: şeridi sona götür, yazıyı doldur
  await adimaGit(0);
  await page.evaluate(() => {
    const s = document.querySelector(".hrt-serit"), r = s.getBoundingClientRect();
    s.dispatchEvent(new PointerEvent("pointerdown", { clientX: r.right - 2, clientY: r.top + 40, pointerId: 1, bubbles: true }));
    s.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, bubbles: true }));
    const t = document.querySelector(".d-panel textarea");
    t.value = "Selçukluların Malazgirt'i kazandığını biliyorum; Anadolu'ya nasıl yerleştiklerini merak ediyorum.";
    t.dispatchEvent(new Event("input"));
  });
  await bekle(200);
  kontrol(await gorevTamamMi(page), "1. adım: şerit 1299'a gelince ve yazı dolunca görev tamamlanıyor");
  await ekranGoruntusu("adim01-1299");

  // 2. adım: kronolojik sıralama (yanlış bir deneme ile)
  await adimaGit(1);
  await tiklaSecici(page, `.hrt-havuz [data-id="kosedag"]`);
  const ipucu = await page.evaluate(() => document.querySelector(".hrt-geri")?.textContent);
  kontrol(/devletin/.test(ipucu || ""), "2. adım: yanlış seçimde ipucu çıkıyor");
  for (const s of SAVASLAR) { await tiklaSecici(page, `.hrt-havuz [data-id="${s.id}"]`); await bekle(40); }
  kontrol(await gorevTamamMi(page), "2. adım: yedi savaş doğru sıralanınca görev tamamlanıyor");
  await ekranGoruntusu("adim02-tamam");

  // 3. adım: dilsiz harita
  await adimaGit(2);
  for (const s of SAVASLAR) {
    await tiklaSecici(page, `.tar-kart-listesi [data-id="${s.id}"]`);
    await tiklaSecici(page, `g.tar-rozet[data-id="${s.id}"]`);
    await bekle(40);
  }
  kontrol(await gorevTamamMi(page), "3. adım: yedi savaş dilsiz haritaya yerleşiyor");
  await ekranGoruntusu("adim03-tamam");

  // 4. adım: iki tur eşleştirme
  await adimaGit(3);
  for (let tur = 0; tur < 2; tur++) {
    for (const s of SAVASLAR) {
      await tiklaSecici(page, `.hrt-kart[data-taraf="sol"][data-id="${s.id}"]`);
      await tiklaSecici(page, `.hrt-kart[data-taraf="sag"][data-id="${s.id}"]`);
    }
    await bekle(1100);
  }
  kontrol(await gorevTamamMi(page), "4. adım: taraflar ve sonuçlar eşleşiyor");

  // 6. adım: iki karşılaştırma tablosu
  await adimaGit(5);
  for (let c = 0; c < KARSILASTIRMALAR.length; c++) {
    const ifadeler = KARSILASTIRMALAR[c].ifadeler;
    await desteyiCoz(page, bekle, (id) => ifadeler[+id.split("-")[1]].kutu, ifadeler.length);
    await bekle(1400);
  }
  kontrol(await gorevTamamMi(page), "6. adım: iki karşılaştırma tablosu tamamlanıyor");

  // 7. adım: değişim–süreklilik formu
  await adimaGit(6);
  await desteyiCoz(page, bekle, (id) => TESKILAT.find((t) => t.id === id).kutu, TESKILAT.length);
  await bekle(1100);
  await desteyiCoz(page, bekle, (id) => TESKILAT.find((t) => `${t.id}-2` === id).alan, TESKILAT.length);
  kontrol(await gorevTamamMi(page), "7. adım: formun iki bölümü tamamlanıyor");

  // 8. adım: ikta dengesi + soru
  await adimaGit(7);
  await page.evaluate(() => { const r = document.querySelector(".d-panel input[type=range]"); r.value = 70; r.dispatchEvent(new Event("input")); });
  await bekle(100);
  await tiklaSecici(page, `.d-panel .hrt-kart[data-i="0"]`);
  kontrol(await gorevTamamMi(page), "8. adım: denge bulunup soru cevaplanınca görev tamamlanıyor");
  await ekranGoruntusu("adim08-denge");

  // 9. adım: iki zincir
  await adimaGit(8);
  for (let z = 0; z < ZINCIRLER.length; z++) {
    for (let j = 0; j < ZINCIRLER[z].halkalar.length; j++) { await tiklaSecici(page, `.hrt-havuz [data-id="${z}-${j}"]`); await bekle(30); }
    await bekle(1400);
  }
  kontrol(await gorevTamamMi(page), "9. adım: iki neden–sonuç zinciri kuruluyor");

  // 10. adım: sınav
  await adimaGit(9);
  for (const c of [0, "105", 1, 2, 1, 2, 3, 1, 1]) {
    if (typeof c === "string") {
      await page.evaluate((v) => { document.querySelector(".d-sinav input").value = v; }, c);
      await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => b.textContent.includes("Cevapla")).click());
    } else {
      await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    }
    await bekle(60);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(60);
  }
  const puan = await page.evaluate(() => document.querySelector(".d-puan")?.textContent);
  kontrol(puan === "9 / 9", `10. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "10. adım: sınav görevi tamamlanıyor");
  await ekranGoruntusu("sinav-sonu");

  // telefon genişliğinde birkaç adım (yeniden yüklemeden)
  await page.setViewport({ width: 390, height: 844 });
  for (const i of [0, 2, 4, 7]) { await adimaGit(i); await ekranGoruntusu(`telefon-adim${String(i + 1).padStart(2, "0")}`); }
  await page.setViewport({ width: 1408, height: 840 });
};
