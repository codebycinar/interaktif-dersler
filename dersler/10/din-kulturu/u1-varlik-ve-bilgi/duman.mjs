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
const tumunu = (page, secici) => page.evaluate((s) => document.querySelectorAll(s).forEach((b) => b.dispatchEvent(new MouseEvent("click", { bubbles: true }))), secici);
const kaydir = (page, etiket, v) => page.evaluate(([e, x]) => { const r = document.querySelector(`input[aria-label="${e}"]`); r.value = x; r.dispatchEvent(new Event("input")); }, [etiket, v]);
const yaz = (page, metin) => page.evaluate((m) => { const t = document.querySelector(".d-panel textarea"); t.value = m; t.dispatchEvent(new Event("input")); }, metin);

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: bilgi kaynakları (önce bir yanlış)
  await adimaGit(0);
  await page.evaluate(() => { localStorage.removeItem("edu:dkab10-bilgi-kutusu"); });
  await yerlestir(page, { b7: "duyu" });
  kontrol(await page.evaluate(() => document.querySelector(".ok-geri.yanlis")?.textContent.includes("Kim bildirdi")), "1. adım: yanlış kutu ipucu veriyor");
  await yerlestir(page, { b1: "duyu", b2: "duyu", b3: "akil", b4: "akil", b5: "mutevatir", b6: "mutevatir", b7: "vahiy", b8: "vahiy", b9: "oznel", b10: "oznel" });
  await bekle(150);
  await ekranGoruntusu("d1-kaynaklar");
  kontrol(await gorevTamamMi(page), "1. adım: on bilgi doğru kaynağa yerleşince görev tamamlanıyor");

  // 2. adım: yanılsama + haber modeli
  await adimaGit(1);
  await kaydir(page, "Alttaki çizginin uzunluğu", 268);
  await dugme(page, "[data-olc]");
  await bekle(100);
  kontrol(await page.evaluate(() => /%12/.test(document.querySelector(".ok-sahne .ok-geri").textContent)), "2. adım: 268 birim ayarı %12 yanılma olarak ölçülüyor");
  await dugme(page, ".ok-sahne .ok-kutu [data-dogru]");
  await ekranGoruntusu("d2-yanilsama");
  await dugme(page, '[data-sekme="1"]');
  await kaydir(page, "Aktarıcı sayısı", 5);
  kontrol(await page.evaluate(() => !document.querySelector(".dk-mut")), "2. adım: 5 bağımsız tanık henüz mütevatir değil");
  await kaydir(page, "Aktarıcı sayısı", 10);
  kontrol(await page.evaluate(() => !!document.querySelector(".dk-mut")), "2. adım: 10 bağımsız tanık mütevatir eşiğini geçiyor");
  await dugme(page, '[data-bagimsiz="false"]');
  await kaydir(page, "Aktarıcı sayısı", 20);
  kontrol(await page.evaluate(() => !document.querySelector(".dk-mut") && document.querySelector(".dk-durum").textContent.includes("%30")), "2. adım: tek kaynaklı 20 kişi olasılığı değiştirmiyor (%30)");
  await bekle(100);
  await ekranGoruntusu("d2-haber");
  kontrol(await gorevTamamMi(page), "2. adım: iki sekme bitince görev tamamlanıyor");

  // 3. adım: kavram haritası (bir ters bağla)
  await adimaGit(2);
  await dugme(page, '[data-dugum="akil"]'); await dugme(page, '[data-dugum="duyu"]');
  kontrol(await page.evaluate(() => document.querySelector(".ok-geri.yanlis")?.textContent.includes("yönü ters")), "3. adım: ters yön uyarısı");
  for (const [a, b] of [["duyu", "akil"], ["duyu", "haber"], ["akil", "haber"], ["akil", "vahiy"], ["vahiy", "akil"], ["akil", "bilgi"], ["bilgi", "inanc"], ["inanc", "davranis"]]) {
    await dugme(page, `[data-dugum="${a}"]`); await dugme(page, `[data-dugum="${b}"]`);
  }
  await bekle(200);
  await ekranGoruntusu("d3-harita");
  kontrol(await gorevTamamMi(page), "3. adım: sekiz bağ kurulunca görev tamamlanıyor");

  // 4. adım: şehadet / gayb + merak
  await adimaGit(3);
  await yerlestir(page, { v4: "gayb" });
  kontrol(await page.evaluate(() => document.querySelector(".ok-geri.yanlis")?.textContent.includes("araçla")), "4. adım: “bakteri gayb” yanılgısı ipucuyla düzeltiliyor");
  const S = "sehadet", G = "gayb";
  await yerlestir(page, { v1: S, v2: S, v3: S, v4: S, v5: S, v6: S, v7: S, v8: G, v9: G, v10: G, v11: G, v12: G, v13: G });
  kontrol(!(await gorevTamamMi(page)), "4. adım: merak seçilmeden görev bitmiyor");
  await dugme(page, '[data-merak="Âlem nasıl var oldu?"]');
  await bekle(100);
  await ekranGoruntusu("d4-varlik");
  kontrol(await gorevTamamMi(page), "4. adım: sınıflandırma + merak ile görev tamamlanıyor");

  // 5. adım: bilgi kutusu
  await adimaGit(4);
  await dugme(page, '[data-hazir="Âlem neden var?"]');
  await dugme(page, '[data-konu="insan"]');
  await dugme(page, '[data-hazir="İnsanın âlemdeki görevi nedir?"]');
  kontrol(!(await gorevTamamMi(page)), "5. adım: iki soru yetmiyor");
  await page.evaluate(() => { const i = document.querySelector(".dk-girdi"); i.value = "Melekler neden görünmez"; i.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })); });
  await bekle(100);
  kontrol(await page.evaluate(() => [...document.querySelectorAll(".dk-kutu-soru")].some((s) => s.textContent.includes("Melekler neden görünmez?"))), "5. adım: özgün soru soru işaretiyle kutuya giriyor");
  await ekranGoruntusu("d5-kutu");
  kontrol(await gorevTamamMi(page), "5. adım: üç soru, iki konu ile görev tamamlanıyor");

  // 6. adım: kaynak kartları
  await adimaGit(5);
  await yerlestir(page, { yasin82: "yaratilis", furkan2: "yaratilis", ihlas: "yaratilis", mulk3: "duzen", rahman29: "duzen", enbiya22: "duzen", bakara30: "insan", isra70: "insan", zariyat56: "insan", enam59: "gayb", bakara3: "gayb", lokman34: "gayb" });
  await bekle(150);
  kontrol(await page.evaluate(() => document.querySelectorAll(".dk-liste li").length === 3), "6. adım: bilgi kutusundaki üç soru kaynaklarıyla listeleniyor");
  await ekranGoruntusu("d6-kaynak");
  kontrol(await gorevTamamMi(page), "6. adım: görev tamamlanıyor");

  // 7. adım: hudûs delili + çıkarımlar
  await adimaGit(6);
  for (const o of ["d1", "d2", "d4", "d3"]) await dugme(page, `[data-oge="${o}"]`);
  kontrol(await page.evaluate(() => document.querySelectorAll(".ok-dizi .ok-kart.yanlis").length === 2), "7. adım: yanlış sıra iki kartı işaretliyor");
  for (const o of ["d4", "d3", "d3", "d4"]) await dugme(page, `[data-oge="${o}"]`);
  await bekle(1000);
  await yerlestir(page, { c1: "evet", c2: "evet", c3: "evet", c4: "evet", c5: "hayir", c6: "hayir", c7: "hayir", c8: "hayir" });
  await bekle(150);
  await ekranGoruntusu("d7-cikarim");
  kontrol(await gorevTamamMi(page), "7. adım: delil + çıkarımlar ile görev tamamlanıyor");

  // 8. adım: ayet çözümleme
  await adimaGit(7);
  await tumunu(page, "button.dk-kelime[data-kavram]");
  await bekle(100);
  kontrol(await page.evaluate(() => document.querySelector(".ok-sahne .ok-ilerleme").textContent.includes("11/11")), "8. adım: on bir anahtar kavram bulunuyor");
  await ekranGoruntusu("d8-kavramlar");
  await dugme(page, '[data-sekme="1"]');
  await yerlestir(page, { t1: "isra", t2: "isra", t3: "isra", t4: "ikisi", t5: "mulk", t6: "mulk", t7: "ikisi" });
  await bekle(100);
  kontrol(await gorevTamamMi(page), "8. adım: çözümleme + sınıflandırma ile görev tamamlanıyor");

  // 9. adım: durumlar
  await adimaGit(8);
  await tumunu(page, ".dk-durum-kart [data-dogru]");
  await yaz(page, "İsrâ 36 bilmeden konuşmamayı ve duyularımızdan sorumlu olduğumuzu, Mülk 23 ise bu nimetlere şükretmeyi öğütler.");
  await bekle(100);
  await ekranGoruntusu("d9-durumlar");
  kontrol(await gorevTamamMi(page), "9. adım: dört doğru seçim + özet ile görev tamamlanıyor");

  // 10. adım: sınav tam puan
  await adimaGit(9);
  for (const c of [1, 2, 2, 1, 0, 2, 0, 1, 1]) {
    await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    await bekle(60);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(60);
  }
  const puan = await page.evaluate(() => document.querySelector(".d-puan")?.textContent);
  kontrol(puan === "9 / 9", `10. adım: sınav tam puan (${puan})`);
  kontrol(await page.evaluate(() => !/(^|>)null(<|$)/.test(document.querySelector(".d-sinav")?.innerHTML || "")), "10. adım: sınavda “null” metni yok");
  kontrol(await gorevTamamMi(page), "10. adım: sınav görevi tamamlanıyor");

  // telefon görünümü
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  for (const i of [1, 2, 4, 7]) {
    await adimaGit(i);
    await page.evaluate(() => document.querySelector(".d-giris .d-btn.ana")?.click());
    await adimaGit(i);
    await ekranGoruntusu(`mobil-adim-${String(i + 1).padStart(2, "0")}`);
  }
  await page.setViewport({ width: 1408, height: 840 });
};
