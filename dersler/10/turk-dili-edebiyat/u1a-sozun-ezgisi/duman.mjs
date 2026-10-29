// Derse özel duman senaryosu: görevleri gerçekten yapıp tamamlandığını doğrular
import { SIIRLER } from "./metinler.js";
import { durakBul } from "./ahenk.js";

const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
/** sınıflandırma: { ogeId: kovaId } — önce karta, sonra kutuya dokunur */
const yerlestir = (page, harita, kap = ".d-sahne") => page.evaluate((h, k) => {
  const kok = document.querySelector(k);
  for (const [oge, kova] of Object.entries(h)) {
    kok.querySelector(`[data-oge="${oge}"]`).click();
    kok.querySelector(`.ort-kova[data-kova="${kova}"]`).click();
  }
  [...kok.querySelectorAll("button")].filter((b) => b.textContent === "Kontrol et").forEach((b) => b.click());
}, harita, kap);
const secenek = (page, metin) => page.evaluate((m) => [...document.querySelectorAll(".d-panel .d-secenekler button")].find((b) => b.textContent.includes(m)).click(), metin);

export default async ({ page, adimaGit, bekle, tikla, kontrol, ekranGoruntusu }) => {
  // 1. adım: bilgi görseli
  await adimaGit(0);
  await yerlestir(page, { olcu: "evet", durak: "evet", kafiye: "evet", redif: "evet", tekrar: "evet", vurgu: "evet", renk: "hayir", yil: "hayir", sayfa: "hayir" });
  await page.evaluate(() => document.querySelector('[data-oku="ezgili"]').click());
  await bekle(300);
  kontrol(await page.evaluate(() => !!document.querySelector(".tde-dize.okunuyor")), "1. adım: ezgili okumada dize vurgulanıyor");
  kontrol(await gorevTamamMi(page), "1. adım: ahenk kartları sınıflandırılınca görev tamamlanıyor");

  // 2. adım: iki şiirde hece sayısı ve durak
  await adimaGit(1);
  const yanlis = await page.evaluate(() => {
    document.querySelector("[data-sayi='0']").value = "6";
    [...document.querySelectorAll(".d-panel button")].find((b) => b.textContent === "Kontrol et").click();
    return document.querySelector(".tde-satir").classList.contains("yanlis");
  });
  kontrol(yanlis, "2. adım: yanlış hece sayısı kırmızıyla işaretleniyor");
  for (const [ad, sekme] of [["alp", "Alp Er Tunga"], ["karacaoglan", "Karacaoğlan"]]) {
    await secenek(page, sekme);
    const s = SIIRLER[ad];
    const duraklar = s.dizeler.map((d) => durakBul(d, s.olcu, s.durak));
    await page.evaluate((olcu, ds) => {
      ds.forEach((liste, i) => {
        document.querySelector(`[data-sayi='${i}']`).value = String(olcu);
        for (const j of liste) document.querySelector(`[data-yuva='${i}-${j}']`).click();
      });
      [...document.querySelectorAll(".d-panel button")].find((b) => b.textContent === "Kontrol et").click();
    }, s.olcu, duraklar);
    await bekle(150);
  }
  kontrol(await gorevTamamMi(page), "2. adım: iki şiirde hece ve durak doğru → görev tamam");
  await page.evaluate(() => [...document.querySelectorAll(".d-panel button")].find((b) => b.textContent.includes("Heceleri göster")).click());
  await ekranGoruntusu("adim02-hecelenmis");

  // 3. adım: kafiye ve redif boyama
  await adimaGit(2);
  for (const [ad, sekme] of [["yemen", "Yemen"], ["yunus", "Yunus"]]) {
    await secenek(page, sekme);
    const tipler = SIIRLER[ad].kafiye.filter(Boolean).flatMap((p) => p.flatMap((parca, pi) => [...parca].filter((c) => c !== " ").map(() => ["", "k", "r"][pi])));
    for (let i = 0; i < tipler.length; i++) {
      await secenek(page, tipler[i] === "k" ? "Kafiye" : tipler[i] === "r" ? "Redif" : "Silgi");
      await page.evaluate((n) => document.querySelector(`[data-harf='${n}']`).click(), i);
    }
    await secenek(page, SIIRLER[ad].kafiyeTuru === "tam" ? "Tam (" : "Yarım (");
    await tikla(".d-panel button", "Kontrol et");
    await bekle(100);
  }
  await ekranGoruntusu("adim03-boyanmis");
  kontrol(await gorevTamamMi(page), "3. adım: iki şiirde kafiye ve redif doğru → görev tamam");

  // 4. adım: ölçü dedektifi
  await adimaGit(3);
  await page.evaluate(() => document.querySelector("[data-kalip^='fâilâtün']").click());
  kontrol(await page.evaluate(() => !!document.querySelector(".tde-kalip.uyar")), "4. adım: İstiklal Marşı kalıba uyuyor");
  await page.evaluate(() => { document.querySelector("[data-mercek='yunus']").click(); });
  await page.evaluate(() => document.querySelector("[data-kalip^='fâilâtün']").click());
  kontrol(await page.evaluate(() => !!document.querySelector(".tde-kalip.uymaz")), "4. adım: Yunus Emre dizesi aruz kalıbına uymuyor");
  await yerlestir(page, { yunus: "hece", karacaoglan: "hece", yemen: "hece", istiklal: "aruz", hasim: "aruz", orhan: "serbest" });
  kontrol(await gorevTamamMi(page), "4. adım: ölçü sınıflandırması tamam");

  // 5. adım: eşleştir + sınıflandır
  await adimaGit(4);
  await page.evaluate(() => {
    for (const b of document.querySelectorAll("[data-sol]")) { b.click(); document.querySelector(`[data-sag="${b.dataset.sol}"]`).click(); }
  });
  await yerlestir(page, { a: "ses", b: "ses", c: "ses", d: "ses", e: "kelime", f: "kelime", g: "kelime" });
  kontrol(await gorevTamamMi(page), "5. adım: kelime eşleştirme ve değişim nedenleri tamam");

  // 6. adım: karşılaştırma tablosu
  await adimaGit(5);
  await yerlestir(page, { k1: "kosuk", k2: "kosuk", k3: "kosuk", m1: "kosma", m2: "kosma", m3: "kosma", t1: "turku", t2: "turku", t3: "turku", n1: "ninni", n2: "ninni", n3: "ninni" });
  kontrol(await gorevTamamMi(page), "6. adım: karşılaştırma tablosu tamam");

  // 7. adım: söylenme amacı + gerekçeli görüş
  await adimaGit(6);
  await secenek(page, "Gidip dönmeyen");
  await secenek(page, "Çocuğu uyutmak");
  await page.evaluate(() => {
    const r = document.querySelectorAll(".d-panel input[type=range]");
    r.forEach((x, i) => { x.value = String(5 - i); x.dispatchEvent(new Event("input")); });
    const t = document.querySelector(".d-panel textarea");
    t.value = "En çok Yemen Türküsü'nü beğendim; çünkü kavuştaktaki tekrar ve yanık ezgi gurbet acısını çok güçlü hissettiriyor.";
    t.dispatchEvent(new Event("input"));
  });
  kontrol(await gorevTamamMi(page), "7. adım: söylenme amacı ve beğeni yazısı tamam");

  // 8. adım: dinleti planı
  await adimaGit(7);
  await secenek(page, "Vatan ve kahramanlık");
  await page.evaluate(() => {
    const yaz = (g, v) => { g.value = v; g.dispatchEvent(new Event("input")); };
    yaz(document.querySelector(".d-panel input[aria-label='Dinletinin adı']"), "Sözün Ezgisinde Vatan");
    document.querySelectorAll("[data-rol]").forEach((g, i) => yaz(g, ["Ayşe", "Mert, Elif", "Deniz", "Kerem"][i]));
    [...document.querySelectorAll("[data-ortam]")].slice(0, 4).forEach((c) => c.click());
  });
  kontrol(await gorevTamamMi(page), "8. adım: dinleti planı (tema, roller, ortam) tamam");

  // 9. adım: program akışı
  await adimaGit(8);
  await page.evaluate(() => {
    for (const id of ["istiklal", "cturku", "yemen"]) document.querySelector(`[data-ekle="${id}"]`).click();
    const yaz = (g, v) => { g.value = v; g.dispatchEvent(new Event("input")); };
    yaz(document.querySelector("[data-alan='giris']"), "Değerli dinleyiciler, bugün sizi vatan şiirleriyle bir yolculuğa çıkarıyoruz.");
    yaz(document.querySelector("[data-alan='kapanis']"), "Bizi dinlediğiniz için teşekkür ederiz.");
  });
  kontrol(await gorevTamamMi(page), "9. adım: temaya uygun program ve süre tamam");
  await ekranGoruntusu("adim09-program");

  // 10. adım: prova
  await adimaGit(9);
  await page.evaluate(() => document.querySelector("[data-kelime='0-0']").click());
  await tikla(".d-panel button", "Denemeyi kaydet");
  await page.evaluate(() => { const r = document.querySelector(".d-panel input[type=range]"); r.value = "0.8"; r.dispatchEvent(new Event("input")); });
  await tikla(".d-panel button", "▶ Oku");
  await bekle(400);
  kontrol(await page.evaluate(() => !!document.querySelector(".tde-vurgu.okunuyor")), "10. adım: okuma sırasında kelime vurgulanıyor");
  await tikla(".d-panel button", "Denemeyi kaydet");
  kontrol(await gorevTamamMi(page), "10. adım: iki farklı deneme kaydedildi");

  // 11. adım: rubrik
  await adimaGit(10);
  await page.evaluate(() => {
    const [ben, akran] = document.querySelectorAll(".ort-rubrik");
    ben.querySelectorAll("button[data-puan='3']").forEach((b) => b.click());
    ben.querySelector("button[data-olcut='beden'][data-puan='1']").click();
    akran.querySelectorAll("button[data-puan='4']").forEach((b) => b.click());
    const t = document.querySelector(".d-panel textarea");
    t.value = "Güçlü yanım tonlamam. Bir sonraki dinletide beden dilimi daha etkin kullanacağım.";
    t.dispatchEvent(new Event("input"));
  });
  kontrol(await gorevTamamMi(page), "11. adım: öz ve akran değerlendirmesi tamam");
  await ekranGoruntusu("adim11-radar");

  // 12. adım: sınav tam puan
  await adimaGit(11);
  for (const c of ["7", 1, 0, 2, 0, 1, 2, 2, 2]) {
    if (typeof c === "string") {
      await page.evaluate((v) => { document.querySelector(".d-sinav input").value = v; }, c);
      await tikla(".d-sinav button", "Cevapla");
    } else {
      await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    }
    await bekle(60);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(60);
  }
  const puan = await page.evaluate(() => document.querySelector(".d-puan")?.textContent);
  kontrol(puan === "9 / 9", `12. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "12. adım: sınav görevi tamamlanıyor");
};
