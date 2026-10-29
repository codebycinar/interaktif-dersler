// Lesson-specific smoke scenario: completes every task and checks that it is marked done
import { ZAMAN_KARTLARI, ZAMAN_BOSLUK, ETIKET_CUMLELERI, CIKARIM_BOSLUK, BELIRSIZ_BOSLUK, ISLEV_KARTLARI, MODEL_YAZI, BEYIN_FIRTINASI } from "./icerik.js";
import { soruEki } from "./dilbilgisi.js";

const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
const gorevBekle = (page) => page.waitForFunction(() => document.querySelector(".d-gorev")?.classList.contains("tamam"), { timeout: 60000 }).then(() => true, () => false);
const yerlestir = (page, harita) => page.evaluate((h) => {
  const kok = document.querySelector(".d-sahne");
  for (const [oge, kova] of Object.entries(h)) {
    kok.querySelector(`[data-oge="${oge}"]`).click();
    kok.querySelector(`.ort-kova[data-kova="${kova}"]`).click();
  }
  [...kok.querySelectorAll("button")].filter((b) => b.textContent === "Check").forEach((b) => b.click());
}, harita);
const secenek = (page, metin) => page.evaluate((m) => [...document.querySelectorAll(".d-panel .d-secenekler button")].find((b) => b.textContent.includes(m)).click(), metin);
const yaz = (page, secici, deger) => page.evaluate((s, v) => { const t = document.querySelector(s); t.value = v; t.dispatchEvent(new Event("input")); }, secici, deger);
const bosluklar = (page, liste) => page.evaluate((l) => l.forEach((o) => [...document.querySelectorAll(`[data-bosluk="${o.id}"] [data-secim]`)].find((b) => b.dataset.secim === o.dogru).click()), liste);

const TASLAK = `Hi everyone at our partner school!

My name is Ali and I go to an Anatolian high school in Konya. Our school has a big courtyard and a new basketball court. Lessons usually start at 8:30. I always have lunch in the canteen with my friends.

On Tuesdays I go to the chess club. These days we are preparing for Republic Day, and I'm practising a poem for the ceremony.

Before exams I sometimes feel anxious, so I make a weekly plan. What is your school like? Do you have clubs too?

Write soon!
Ali`;

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. routine or now
  await adimaGit(0);
  await yerlestir(page, Object.fromEntries(ZAMAN_KARTLARI.map((k) => [k.id, k.kova])));
  await secenek(page, "actions happening now");
  await page.evaluate(() => [...document.querySelectorAll('[data-bosluk="b3"] [data-secim]')].find((b) => b.dataset.secim === "arrive always").click());
  kontrol(await page.evaluate(() => document.querySelector('[data-bosluk="b3"] .ort-geri').classList.contains("yanlis")), "1: wrong word order gets feedback");
  await bosluklar(page, ZAMAN_BOSLUK);
  kontrol(await gorevTamamMi(page), "1: sorting, rule and five gaps done");

  // 2. question tag machine
  await adimaGit(1);
  await page.evaluate(() => { document.querySelector("[data-yard='do']").click(); document.querySelector("[data-zamir='they']").click(); document.querySelector("[data-etiket-kontrol]").click(); });
  kontrol(await page.evaluate(() => document.querySelector(".d-sahne .ort-geri")?.classList.contains("yanlis")), "2: a wrong tag gets a hint");
  for (const c of ETIKET_CUMLELERI) {
    const e = soruEki(c.cumle, c.ozne);
    await page.evaluate((y, z) => { document.querySelector(`[data-yard="${y}"]`).click(); document.querySelector(`[data-zamir="${z}"]`).click(); document.querySelector("[data-etiket-kontrol]").click(); }, e.yardimci, e.zamir);
  }
  kontrol(await gorevTamamMi(page), `2: all ${ETIKET_CUMLELERI.length} tags built`);
  await ekranGoruntusu("adim02-etiket");

  // 3. detective
  await adimaGit(2);
  await page.evaluate(() => [...document.querySelectorAll('[data-bosluk="s5"] [data-secim]')].find((b) => b.dataset.secim === "nothing").click());
  kontrol(await page.evaluate(() => /negative/.test(document.querySelector('[data-bosluk="s5"] .ort-geri').textContent)), "3: double negative is explained");
  await bosluklar(page, [...CIKARIM_BOSLUK, ...BELIRSIZ_BOSLUK]);
  kontrol(await gorevTamamMi(page), "3: deductions and something/anything/nothing done");
  await ekranGoruntusu("adim03-dedektif");

  // 4. model dialogue
  await adimaGit(3);
  await page.evaluate(() => document.querySelector("[data-oynat]").click());
  await page.waitForFunction(() => [...document.querySelectorAll(".d-sahne .ort-alt")].some((s) => s.textContent === "Finished."), { timeout: 60000 });
  await yerlestir(page, Object.fromEntries(ISLEV_KARTLARI.map((k) => [k.id, k.kova])));
  await secenek(page, "He is anxious");
  await secenek(page, "A weekly plan");
  kontrol(await gorevTamamMi(page), "4: dialogue heard, functions sorted, questions answered");

  // 5. role-play
  await adimaGit(4);
  await page.evaluate(() => ["0|0", "1|1", "2|0", "3|0", "4|4", "5|1"].forEach((k) => document.querySelector(`[data-satir="${k}"]`).click()));
  kontrol(await page.evaluate(() => [...document.querySelectorAll(".d-panel .ort-geri.yanlis")].some((g) => /advice/.test(g.textContent))), "5: unhelpful advice is flagged");
  await page.evaluate(() => document.querySelector('[data-satir="4|0"]').click());
  await page.evaluate(() => document.querySelector("[data-perform]").click());
  kontrol(await gorevBekle(page), "5: role-play built and performed");
  await ekranGoruntusu("adim05-rol");

  // 6. national days
  await adimaGit(5);
  await page.evaluate(() => { for (const b of document.querySelectorAll("[data-sol]")) { b.click(); document.querySelector(`[data-sag="${b.dataset.sol}"]`).click(); } });
  for (const m of ["29 October", "a poetry evening", "courtyard", "15:30", "literature club"]) await secenek(page, m);
  await page.evaluate(() => document.querySelector("[data-radyo]").click());
  kontrol(await gorevBekle(page), "6: days matched, announcement written and read");
  kontrol(await page.evaluate(() => /On 29 October, we celebrate Republic Day/.test(document.querySelector(".eng-radyo-metin").textContent)), "6: announcement text is generated");
  await ekranGoruntusu("adim06-radyo");

  // 7. model blog post
  await adimaGit(6);
  await yerlestir(page, Object.fromEntries(MODEL_YAZI.map((k) => [k.id, k.kova])));
  await secenek(page, "To tell students abroad");
  await secenek(page, "Students at a partner school");
  await page.evaluate(() => {
    const g = document.querySelector(".d-panel .d-girdi input");
    g.value = "4";
    g.parentElement.querySelector("button").click();
  });
  kontrol(await gorevTamamMi(page), "7: purpose, reader, parts and adverb count done");

  // 8. plan and draft
  await adimaGit(7);
  await page.evaluate((gruplar) => gruplar.forEach((g) => document.querySelector(`[data-fikir="${g.id}|${g.secenekler[0]}"]`).click()), BEYIN_FIRTINASI);
  await yaz(page, ".d-panel textarea", TASLAK);
  kontrol(await gorevTamamMi(page), "8: brainstorm and draft meet the checklist");
  await ekranGoruntusu("adim08-taslak");

  // 9. feedback, revise, publish
  await adimaGit(8);
  kontrol(await page.evaluate(() => document.querySelector("[data-yayinla]").disabled), "9: publish is locked before revising");
  await page.evaluate(() => ["neden", "nesne"].forEach((k) => document.querySelector(`[data-oneri="${k}"]`).click()));
  await yaz(page, ".d-panel textarea", TASLAK.replace("On Tuesdays I go to the chess club.", "On Tuesdays I go to the chess club. I love it because our teacher always helps us."));
  await page.evaluate(() => document.querySelector("[data-yayinla]").click());
  kontrol(await gorevTamamMi(page), "9: suggestions used, post revised and published");
  await ekranGoruntusu("adim09-yayin");

  // 10. reflection
  await adimaGit(9);
  await page.evaluate(() => document.querySelectorAll(".ort-rubrik button[data-puan='3']").forEach((b) => b.click()));
  await secenek(page, "Plan my writing");
  await yaz(page, ".d-panel textarea", "The question tags were easy for me, but writing a long blog post was difficult. I feel more confident now.");
  kontrol(await gorevTamamMi(page), "10: rubric, goal and exit ticket done");

  // 11. quiz
  await adimaGit(10);
  for (const c of [1, 1, 0, 1, 2, 1, 1, 1]) {
    await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    await bekle(60);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(60);
  }
  const puan = await page.evaluate(() => document.querySelector(".d-puan")?.textContent);
  kontrol(puan === "8 / 8", `11: quiz full marks (${puan})`);
  kontrol(await gorevTamamMi(page), "11: quiz task done");
};
