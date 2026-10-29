// Derse özel duman senaryosu: görevleri programla tamamlayıp doğrular
const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
const yerlestir = (page, eslesme) => page.evaluate(async (es) => {
  for (const [kart, kat] of Object.entries(es)) {
    document.querySelector(`[data-kart="${kart}"]`).click();
    document.querySelector(`.ok-kova[data-kat="${kat}"]`).click();
    await new Promise((r) => setTimeout(r, 20));
  }
}, eslesme);
const dugme = (page, secici) => page.evaluate((s) => { const b = document.querySelector(s); if (!b) throw new Error("yok: " + s); b.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, secici);

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: gündelik kullanımlar + kavram ağı
  await adimaGit(0);
  await yerlestir(page, { k1: "gundelik", k2: "gundelik", k3: "gundelik", k4: "onyargi", k5: "onyargi", k6: "onyargi", k7: "onyargi", k8: "terim", k9: "terim" });
  await bekle(200);
  for (const k of ["sevgi", "arayis", "hakikat", "bilgi", "erdem", "bilinc", "dusunme"]) {
    await dugme(page, `[data-kavram="${k}"]`);
    await dugme(page, ".fe-siklar [data-dogru]");
  }
  await bekle(200);
  await ekranGoruntusu("f1-kavram-agi");
  kontrol(await gorevTamamMi(page), "1. adım: sınıflandırma + kavram ağı tamamlanıyor");

  // 3. adım: Theseus'un gemisi
  await adimaGit(2);
  const kaydir = (v) => page.evaluate((x) => { const r = document.querySelector(".ok-sahne input[type=range]"); r.value = x; r.dispatchEvent(new Event("input")); }, v);
  await kaydir(1); await dugme(page, '[data-soru="t1"] [data-cevap="evet"]');
  await kaydir(6); await dugme(page, '[data-soru="t6"] [data-cevap="emin"]');
  await kaydir(12); await dugme(page, '[data-soru="t12"] [data-cevap="evet"]');
  await dugme(page, "[data-buk] button");
  await dugme(page, '[data-soru="asil"] [data-cevap="eski"]');
  await dugme(page, '[data-soru="olcut"] [data-cevap="madde"]');
  const celiski = await page.evaluate(() => document.querySelector(".ok-geri.yanlis")?.textContent || "");
  kontrol(celiski.includes("Çelişki"), "3. adım: madde ölçütü + 12. tahtada evet çelişki olarak yakalanıyor");
  await dugme(page, '[data-soru="t12"] [data-cevap="hayir"]');
  await bekle(100);
  await yerlestir(page, { h1: "hayret", h2: "suphe", h3: "rasyonel", h4: "tutarli", h5: "refleksif", h6: "evrensel" });
  await bekle(200);
  await ekranGoruntusu("f3-theseus");
  kontrol(await gorevTamamMi(page), "3. adım: tutarlı ölçüt + eşleştirme ile görev tamamlanıyor");

  // 5. adım: gelenekler (kartlar zaman çizelgesinde beliriyor mu?)
  await adimaGit(4);
  const once = await page.evaluate(() => document.querySelectorAll(".ok-zc .olay").length);
  const GELENEK = { buda: "hint", konfucyus: "cin", thales: "yunan", farabi: "islam", descartes: "fransiz", kant: "alman", locke: "anglo", dewey: "amerikan" };
  // önce yanlış bir şerit, sonra doğrular
  const ilk = await page.evaluate(() => document.querySelector(".fe-deste-kart").dataset.kart);
  await dugme(page, `rect[data-serit="${GELENEK[ilk] === "hint" ? "cin" : "hint"}"]`);
  kontrol(await page.evaluate(() => document.querySelector(".fe-deste .ok-geri").classList.contains("yanlis")), "5. adım: yanlış şeride dokunmak geri bildirim veriyor");
  for (let i = 0; i < 8; i++) {
    const id = await page.evaluate(() => document.querySelector(".fe-deste-kart").dataset.kart);
    await dugme(page, `rect[data-serit="${GELENEK[id]}"]`);
    await bekle(40);
  }
  await bekle(200);
  const sonra = await page.evaluate(() => document.querySelectorAll(".ok-zc .olay").length);
  kontrol(sonra === once + 8, `5. adım: yerleştirilen 8 düşünür çizelgede beliriyor (${once} → ${sonra})`);
  await dugme(page, '.ok-zc [data-olay="farabi"]');
  await ekranGoruntusu("f5-zaman");
  kontrol(await gorevTamamMi(page), "5. adım: görev tamamlanıyor");

  // 6. adım: serbest sınıflandırma, önce iki hata ile
  await adimaGit(5);
  await yerlestir(page, { s1: "felsefi", s2: "felsefi", s3: "felsefi", s4: "felsefi", s5: "felsefi", s6: "bilimsel", s7: "felsefi", s8: "felsefi", s9: "bilimsel", s10: "gundelik", s11: "gundelik", s12: "gundelik" });
  const kontrolEt = () => page.evaluate(() => [...document.querySelectorAll(".ok-sahne .d-btn.ana")].find((b) => b.textContent === "Kontrol et").click());
  await kontrolEt();
  await bekle(150);
  kontrol(await page.evaluate(() => !document.querySelector(".fe-ozellik").hidden), "6. adım: ilk kontrolden sonra özellik kartı açılıyor");
  await ekranGoruntusu("f6-ilk-kontrol");
  await yerlestir(page, { s7: "bilimsel", s8: "bilimsel" });
  await kontrolEt();
  await bekle(100);
  kontrol(await gorevTamamMi(page), "6. adım: düzeltmeden sonra görev tamamlanıyor");

  // 7. adım: soru atölyesi
  await adimaGit(6);
  await dugme(page, '[data-durum="kopya"]');
  await dugme(page, '[data-kavram="dürüstlük"]');
  await dugme(page, '[data-kalip="1"]');
  for (const [k, c] of [["deney", "hayir"], ["evrensel", "evet"], ["tek", "hayir"], ["yeni", "evet"]]) await dugme(page, `[data-kart="${k}"] [data-cevap="${c}"]`);
  await page.evaluate(() => { const t = document.querySelector(".d-panel textarea"); t.value = "Dürüstlük her zaman iyidir diyebilirim; ama bir dostu korumak için susmak da erdem olabilir mi?"; t.dispatchEvent(new Event("input")); });
  await bekle(150);
  await ekranGoruntusu("f7-atolye");
  kontrol(await gorevTamamMi(page), "7. adım: dört karttan geçen soru + yazı ile görev tamamlanıyor");

  // 10. adım: sınav tam puan
  await adimaGit(9);
  for (const c of [1, 1, 1, 2, 1, 2, 1, 1, 2]) {
    await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    await bekle(60);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(60);
  }
  const puan = await page.evaluate(() => document.querySelector(".d-puan")?.textContent);
  kontrol(puan === "9 / 9", `10. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "10. adım: sınav görevi tamamlanıyor");

  // telefon görünümü: birkaç adımın sahnesi
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  for (const i of [1, 2, 4, 7]) {
    await adimaGit(i);
    await page.evaluate(() => document.querySelector(".d-giris .d-btn.ana")?.click());
    await adimaGit(i);
    await ekranGoruntusu(`mobil-adim-${String(i + 1).padStart(2, "0")}`);
  }
  await page.setViewport({ width: 1408, height: 840 });
};
