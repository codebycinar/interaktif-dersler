// Lesson-specific smoke scenario: completes every task and checks that it is marked done
import { PODCAST, KONU_SIRASI, AYRINTILAR, TONLAMA, FOTO_TAHMIN, OKUMA_TAHMIN, TARAMA, KELIMELER, KARSILASTIR } from "./icerik.js";

const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
const yerlestir = (page, harita) => page.evaluate((h) => {
  const kok = document.querySelector(".d-sahne");
  for (const [oge, kova] of Object.entries(h)) {
    kok.querySelector(`[data-oge="${oge}"]`).click();
    kok.querySelector(`.ort-kova[data-kova="${kova}"]`).click();
  }
  [...kok.querySelectorAll("button")].filter((b) => b.textContent === "Check").forEach((b) => b.click());
}, harita);
const eslestirHepsi = (page) => page.evaluate(() => {
  for (const b of document.querySelectorAll("[data-sol]")) { b.click(); document.querySelector(`[data-sag="${b.dataset.sol}"]`).click(); }
});
const secenek = (page, metin) => page.evaluate((m) => [...document.querySelectorAll(".d-panel .d-secenekler button")].find((b) => b.textContent.includes(m)).click(), metin);
const yaz = (page, secici, deger) => page.evaluate((s, v) => { const t = document.querySelector(s); t.value = v; t.dispatchEvent(new Event("input")); }, secici, deger);

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. warm-up
  await adimaGit(0);
  await eslestirHepsi(page);
  await secenek(page, "a boarding school");
  await page.evaluate(() => ["karsilastir", "yatili"].forEach((k) => document.querySelector(`[data-tahmin='${k}']`).click()));
  kontrol(await gorevTamamMi(page), "1: matching, picture question and predictions done");

  // 2. gist listening
  await adimaGit(1);
  await page.evaluate(() => document.querySelector("[data-oynat]").click());
  await bekle(400);
  kontrol(await page.evaluate(() => !!document.querySelector(".eng-dokum p.okunuyor") && !!document.querySelector(".eng-kisi.konusuyor")), "2: current line and speaker are highlighted while playing");
  await page.waitForFunction(() => document.querySelector(".eng-oynatici-sag .ort-alt")?.textContent === "Episode finished.", { timeout: 60000 });
  await secenek(page, "Two students compare");
  await page.evaluate((ids) => {
    ids.forEach((id, hedef) => {
      for (let g = 0; g < 10; g++) {
        const satirlar = [...document.querySelectorAll(".ort-sira")];
        const i = satirlar.findIndex((s) => s.dataset.sira === id);
        if (i <= hedef) break;
        satirlar[i].querySelector("button").click();
      }
    });
    [...document.querySelectorAll("button")].find((b) => b.textContent === "Check the order").click();
  }, KONU_SIRASI.map((o) => o.id));
  kontrol(await gorevTamamMi(page), `2: whole episode (${PODCAST.length} lines), gist and topic order done`);
  await ekranGoruntusu("adim02-dinlendi");

  // 3. details + inferences
  await adimaGit(2);
  await yerlestir(page, Object.fromEntries(AYRINTILAR.map((a) => [a.id, a.kova])));
  for (const m of ["He is a perfectionist", "Building an app", "He knows that studying"]) await secenek(page, m);
  kontrol(await gorevTamamMi(page), "3: details sorted, three inferences correct");

  // 4. opinions + message
  await adimaGit(3);
  await page.evaluate(() => ["yatili|hayir", "kodlama|evet", "rugby|evet", "plan|evet"].forEach((k) => document.querySelector(`[data-gorus='${k}']`).click()));
  await yaz(page, ".d-panel textarea", "Hi Maya! I'd like to swap schools with Elif for a week because I love coding and I want to see her new basketball court. I wouldn't like to live at school like Jack.");
  kontrol(await gorevTamamMi(page), "4: opinions and message done");
  await ekranGoruntusu("adim04-gorus");

  // 5. intonation (one wrong try first)
  await adimaGit(4);
  await page.evaluate(() => document.querySelector("[data-ton='t2'] [data-sec='dusen']").click());
  kontrol(await page.evaluate(() => document.querySelector("[data-ton='t2'] .eng-kontur").classList.contains("yanlis")), "5: wrong intonation choice gets feedback");
  await page.evaluate((liste) => liste.forEach((t) => document.querySelector(`[data-ton='${t.id}'] [data-sec='${t.ton}']`).click()), TONLAMA);
  kontrol(await gorevTamamMi(page), "5: all intonation choices correct");
  await ekranGoruntusu("adim05-tonlama");

  // 6. reading predictions
  await adimaGit(5);
  await page.evaluate(() => document.querySelector("[data-foto='f1|haruto']").click());
  await page.evaluate(() => document.querySelector("[data-foto='f2|deniz']").click());
  await page.evaluate(() => document.querySelector("[data-foto='f3|deniz']").click());
  await page.evaluate((l) => l.forEach((t, i) => document.querySelector(`[data-ifade='${t.id}|${i % 2 === 0}']`).click()), OKUMA_TAHMIN);
  kontrol(await gorevTamamMi(page), `6: ${FOTO_TAHMIN.length} photos and ${OKUMA_TAHMIN.length} statements predicted`);

  // 7. skim and scan
  await adimaGit(6);
  await page.evaluate(() => document.querySelector("[data-goz]").click());
  await bekle(300);
  await page.evaluate(() => document.querySelector("[data-goz-bitti]").click());
  await secenek(page, "What a school morning looks like");
  await page.evaluate(() => document.querySelector(".eng-sozcuk:not([data-anahtar])").click());
  kontrol(await page.evaluate(() => document.querySelector(".d-panel .ort-geri.yanlis") !== null), "7: tapping a wrong word gives feedback");
  for (const q of TARAMA) await page.evaluate((a) => document.querySelector(`[data-anahtar='${a}']`).click(), q.anahtar);
  kontrol(await gorevTamamMi(page), "7: main idea and six scan answers found");
  await ekranGoruntusu("adim07-tarama");

  // 8. words in context
  await adimaGit(7);
  await page.evaluate((ws) => ws.slice(0, 4).forEach((w) => document.querySelector(`[data-kelime='${w.id}']`).click()), KELIMELER);
  kontrol(await page.evaluate(() => !!document.querySelector(".eng-baglam mark")), "8: the word is shown in its sentence");
  await eslestirHepsi(page);
  kontrol(await gorevTamamMi(page), "8: words opened and matched");

  // 9. compare
  await adimaGit(8);
  await yerlestir(page, Object.fromEntries(KARSILASTIR.map((a) => [a.id, a.kova])));
  for (const m of ["having a chemistry quiz", "clean the classrooms themselves"]) await secenek(page, m);
  kontrol(await gorevTamamMi(page), "9: comparison and inferences done");

  // 10. my school morning
  await adimaGit(9);
  await yaz(page, ".d-panel textarea", "My lessons start at 8:20 and I usually walk to school with my sister. Every Monday we have a flag ceremony in the courtyard, like Deniz. Unlike Haruto, I don't change my shoes, but we sometimes clean the board. My favourite part is the break because I play basketball with my friends.");
  kontrol(await gorevTamamMi(page), "10: paragraph meets the checklist");
  await ekranGoruntusu("adim10-paragraf");

  // 11. quiz
  await adimaGit(10);
  for (const c of [0, 1, 1, 2, 0, 1, 2, 1]) {
    await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    await bekle(60);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(60);
  }
  const puan = await page.evaluate(() => document.querySelector(".d-puan")?.textContent);
  kontrol(puan === "8 / 8", `11: quiz full marks (${puan})`);
  kontrol(await gorevTamamMi(page), "11: quiz task done");
};
