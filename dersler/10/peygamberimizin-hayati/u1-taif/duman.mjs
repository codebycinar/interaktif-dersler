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
const sirala = (page, ids, nitelik = "data-oge") => page.evaluate(([l, n]) => l.forEach((id) => document.querySelector(`[${n}="${id}"]`).click()), [ids, nitelik]);
const kontrolEt = (page) => page.evaluate(() => [...document.querySelectorAll(".ok-sahne .d-btn.ana")].find((b) => b.textContent === "Kontrol et" && !b.disabled && b.offsetParent).click());
const yaz = (page, metin) => page.evaluate((m) => { const t = document.querySelector(".d-panel textarea"); t.value = m; t.dispatchEvent(new Event("input")); }, metin);

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: Taif'in özellikleri
  await adimaGit(0);
  await yerlestir(page, { t1: "cografi", t2: "cografi", t3: "ekonomik", t4: "ekonomik", t5: "ekonomik", t6: "sosyal", t7: "sosyal", t8: "sosyal", t9: "kulturel", t10: "kulturel", t11: "ekonomik" });
  await bekle(150);
  await ekranGoruntusu("p1-taif");
  kontrol(await gorevTamamMi(page), "1. adım: on bir bilgi sınıflandırılınca görev tamamlanıyor");

  // 2. adım: sıralama + grafik
  await adimaGit(1);
  await sirala(page, ["acikDavet", "vahiy"]);
  await sirala(page, ["habesistan", "boykot", "huzun", "taifYolculugu"]);
  kontrol(await page.evaluate(() => document.querySelectorAll(".ok-dizi .ok-kart.yanlis").length === 2), "2. adım: ilk iki olayın yer değiştirmesi yakalanıyor");
  await sirala(page, ["vahiy", "acikDavet", "habesistan", "boykot", "huzun", "taifYolculugu"]); // hepsini geri al
  await sirala(page, ["vahiy", "acikDavet", "habesistan", "boykot", "huzun", "taifYolculugu"]);
  await bekle(100);
  await ekranGoruntusu("p2-sira");
  await dugme(page, '[data-sekme="1"]');
  await dugme(page, '.ok-sahne .ok-kutu [data-dogru]');
  await bekle(100);
  kontrol(await page.evaluate(() => document.querySelectorAll(".ph-grafik [data-sayi]").length === 9), "2. adım: grafikte dokuz çubuk var");
  await ekranGoruntusu("p2-grafik");
  kontrol(await gorevTamamMi(page), "2. adım: görev tamamlanıyor");

  // 3. adım: yolculuğu kur ve izle
  await adimaGit(2);
  kontrol(await page.evaluate(() => document.querySelector(".ph-oynatici").hidden), "3. adım: oynatıcı sıralamadan önce gizli");
  await sirala(page, ["y1", "y2", "y3", "y4", "y5", "y6", "y7", "y8"]);
  await bekle(150);
  const kaydir = (v) => page.evaluate((x) => { const r = document.querySelector('input[aria-label="Yolculuğun durağı"]'); r.value = x; r.dispatchEvent(new Event("input")); }, v);
  await kaydir(5);
  await bekle(100);
  kontrol(await page.evaluate(() => document.querySelectorAll(".ph-oynatici path.yol").length === 2), "3. adım: 6. durakta gidiş ve dönüş yolu çiziliyor");
  await ekranGoruntusu("p3-durak6");
  kontrol(!(await gorevTamamMi(page)), "3. adım: son durağa gelmeden görev bitmiyor");
  await kaydir(7);
  await bekle(100);
  await ekranGoruntusu("p3-son");
  kontrol(await gorevTamamMi(page), "3. adım: son durakta görev tamamlanıyor");

  // 4. adım: nedenler + anakronizm
  await adimaGit(3);
  await yerlestir(page, { n1: "dini", n2: "dini", n3: "siyasi", n4: "siyasi", n5: "toplumsal", n6: "toplumsal", n7: "ekonomik", n8: "ekonomik", n9: "ekonomik" });
  await dugme(page, '[data-sekme="1"]');
  await yerlestir(page, { a1: "uygun", a2: "uygun", a3: "uygun", a4: "uygun", a5: "anakronik", a6: "anakronik" });
  await kontrolEt(page);
  kontrol(await page.evaluate(() => document.querySelector('[data-kart="a4"]').classList.contains("yanlis")), "4. adım: anakronik ifade yanlış kutuda işaretleniyor");
  await yerlestir(page, { a4: "anakronik" });
  await kontrolEt(page);
  await bekle(100);
  await ekranGoruntusu("p4-baglam");
  kontrol(await gorevTamamMi(page), "4. adım: iki sekme ile görev tamamlanıyor");

  // 5. adım: empati
  await adimaGit(4);
  await dugme(page, '[data-secenek="himaye"]'); await dugme(page, '[data-secenek="ticaret"]');
  await kontrolEt(page);
  kontrol(await page.evaluate(() => document.querySelector(".ok-sahne .d-geri-bildirim.yanlis")?.textContent.includes("ticari")), "5. adım: yanlış neden açıklanıyor");
  await dugme(page, '[data-secenek="ticaret"]');
  for (const s of ["destek", "yeni", "yakin"]) await dugme(page, `[data-secenek="${s}"]`);
  await kontrolEt(page);
  await dugme(page, '[data-his="Kırgınlık"]');
  for (const s of ["merhamet", "umut", "metanet"]) await dugme(page, `[data-secenek="${s}"]`);
  await kontrolEt(page);
  await yaz(page, "Zor anlarda öfkeyle değil sabırla hareket etmeliyim. Arkadaşım beni kırdığında hemen küsmek yerine konuşmayı denedim.");
  await bekle(100);
  await ekranGoruntusu("p5-empati");
  kontrol(await gorevTamamMi(page), "5. adım: iki seçim + his + günlük ile görev tamamlanıyor");

  // 6. adım: araştırma ve zaman çizelgesi
  await adimaGit(5);
  const once = await page.evaluate(() => document.querySelectorAll(".ok-zc .olay").length);
  for (let i = 0; i < 6; i++) { await dugme(page, ".ph-arastir [data-dogru]"); await bekle(520); }
  const sonra = await page.evaluate(() => document.querySelectorAll(".ok-zc .olay").length);
  kontrol(sonra === once + 6, `6. adım: altı olay çizelgeye ekleniyor (${once} → ${sonra})`);
  await dugme(page, '[data-donem="2"]');
  await dugme(page, '.ok-zc [data-olay="kusatma"]');
  await bekle(100);
  await ekranGoruntusu("p6-cizelge");
  kontrol(await gorevTamamMi(page), "6. adım: görev tamamlanıyor");

  // 7. adım: kavram haritası
  await adimaGit(6);
  for (const [a, b] of [["ittifak", "red"], ["fetih", "huneyn"], ["huneyn", "kusatma"], ["huneyn", "cirane"], ["cirane", "yalniz"], ["urve", "heyet"], ["yalniz", "heyet"], ["heyet", "lat"]]) {
    await dugme(page, `[data-dugum="${a}"]`); await dugme(page, `[data-dugum="${b}"]`);
  }
  await bekle(200);
  await ekranGoruntusu("p7-harita");
  kontrol(await gorevTamamMi(page), "7. adım: sekiz bağ ile görev tamamlanıyor");

  // 8. adım: heyetin talepleri
  await adimaGit(7);
  await yerlestir(page, { k1: "red", k2: "red", k3: "kabul", k4: "red" });
  await kontrolEt(page);
  await dugme(page, ".ok-sahne .ph-siklar [data-dogru]");
  await bekle(100);
  await ekranGoruntusu("p8-heyet");
  kontrol(await gorevTamamMi(page), "8. adım: talepler + imam sorusu ile görev tamamlanıyor");

  // 9. adım: sentez
  await adimaGit(8);
  await sirala(page, ["taifYolculugu", "hicret", "fetih", "huneyn", "kusatma", "urve", "heyet", "lat"]);
  await yaz(page, "Kısa bir yazı.");
  kontrol(!(await gorevTamamMi(page)), "9. adım: kısa yazı yetmiyor");
  await yaz(page, "Bir şehrin on bir yılı: 619'daki Taif yolculuğunda daveti reddeden Sakif, Kureyş ile ittifakına güveniyordu. Mekke'nin fethinden sonra Huneyn'de yenildiler ve kuşatma sırasında surlarına kapandılar. Eski müttefikleri Müslüman olunca yalnız kaldılar; Urve'nin şehadeti de bunu gösterdi. Sonunda heyet gönderdiler ve Lât yıkıldı.");
  await bekle(100);
  kontrol(await page.evaluate(() => document.querySelectorAll(".ph-unsur.var").length >= 6), "9. adım: yazıdaki olaylar denetim listesinde işaretleniyor");
  await ekranGoruntusu("p9-sentez");
  kontrol(await gorevTamamMi(page), "9. adım: çizelge + köşe yazısı ile görev tamamlanıyor");

  // 10. adım: sınav
  await adimaGit(9);
  for (const c of [1, 1, 2, 0, 1, 1, 2, 2, 0, 2]) {
    await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    await bekle(60);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(60);
  }
  const puan = await page.evaluate(() => document.querySelector(".d-puan")?.textContent);
  kontrol(puan === "10 / 10", `10. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "10. adım: sınav görevi tamamlanıyor");

  // telefon görünümü
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  for (const i of [0, 2, 5, 6]) {
    await adimaGit(i);
    await page.evaluate(() => document.querySelector(".d-giris .d-btn.ana")?.click());
    await adimaGit(i);
    await ekranGoruntusu(`mobil-adim-${String(i + 1).padStart(2, "0")}`);
  }
  await page.setViewport({ width: 1408, height: 840 });
};
