// Derse özel duman senaryosu: görevleri gerçekten yapıp tamamlandığını doğrular
import { OLAYLAR, BOLUMLER } from "./masal.js";

const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
const yerlestir = (page, harita) => page.evaluate((h) => {
  const kok = document.querySelector(".d-sahne");
  for (const [oge, kova] of Object.entries(h)) {
    kok.querySelector(`[data-oge="${oge}"]`).click();
    kok.querySelector(`.ort-kova[data-kova="${kova}"]`).click();
  }
  [...kok.querySelectorAll("button")].filter((b) => b.textContent === "Kontrol et").forEach((b) => b.click());
}, harita);
const secenek = (page, metin) => page.evaluate((m) => [...document.querySelectorAll(".d-panel .d-secenekler button")].find((b) => b.textContent.includes(m)).click(), metin);
const yaz = (page, secici, deger) => page.evaluate((s, v) => { const t = document.querySelector(s); t.value = v; t.dispatchEvent(new Event("input")); }, secici, deger);

export default async ({ page, adimaGit, bekle, tikla, kontrol, ekranGoruntusu }) => {
  // 1. adım: başlık-kapak eşleştirme + tahmin
  await adimaGit(0);
  await page.evaluate(() => {
    for (const b of document.querySelectorAll("[data-sol]")) { b.click(); document.querySelector(`[data-sag="${b.dataset.sol}"]`).click(); }
    document.querySelector("[data-tahmin='kaval']").click();
    document.querySelector("[data-tahmin='kus']").click();
  });
  kontrol(await gorevTamamMi(page), "1. adım: kapak eşleştirme ve tahminler tamam");

  // 2. adım: kontrol listesi
  await adimaGit(1);
  await page.evaluate(() => ["olay", "kisiler", "zaman", "mekan", "tekerleme", "olaganustu"].forEach((k) => document.querySelector(`[data-olcut='${k}']`).click()));
  await secenek(page, "Not alarak");
  kontrol(await gorevTamamMi(page), "2. adım: kontrol listesi ve strateji tamam");

  // 3. adım: altı bölümü dinle, unsur yakala, not al
  await adimaGit(2);
  await page.evaluate(() => document.querySelector("[data-duydum='olaganustu']").click());
  kontrol(await page.evaluate(() => document.querySelector(".ort-geri")?.classList.contains("yanlis")), "3. adım: döşemede “olağanüstü” yanlış yakalama olarak bildiriliyor");
  for (let i = 0; i < BOLUMLER.length; i++) {
    await page.evaluate((n) => document.querySelector(`[data-bolum='${n}']`).click(), i);
    await page.evaluate(() => document.querySelector("[data-oynat]").click());
    if (i === 0) { await bekle(300); kontrol(await page.evaluate(() => !!document.querySelector(".tde-cumle.okunuyor")), "3. adım: dinlerken cümle vurgulanıyor"); }
    await page.waitForFunction((n) => document.querySelector(`[data-bolum='${n}']`)?.textContent.startsWith("✓"), { timeout: 30000 }, i);
    for (const tur of BOLUMLER[i].unsurlar.slice(0, 1)) await page.evaluate((t) => document.querySelector(`[data-duydum='${t}']`).click(), tur);
  }
  for (const [k, v] of [["olay", "Keloğlan kavalıyla sultan kızı konuşturuyor."], ["kisiler", "Keloğlan cesur, anası bilge."], ["mekan", "Köy, çeşme başı, Kara Dağ, saray."]]) await yaz(page, `[data-not='${k}']`, v);
  kontrol(await gorevTamamMi(page), "3. adım: dinleme, unsur yakalama ve notlar tamam");
  await ekranGoruntusu("adim03-dinlendi");

  // 4. adım: zihin haritası
  await adimaGit(3);
  await yerlestir(page, { k1: "kisi", k2: "kisi", k3: "kisi", z1: "zaman", z2: "zaman", m1: "mekan", m2: "mekan", m3: "mekan", o1: "olag", o2: "olag", o3: "olag", d1: "deger", d2: "deger", d3: "deger" });
  kontrol(await gorevTamamMi(page), "4. adım: zihin haritası tamam");
  await ekranGoruntusu("adim04-zihin");

  // 5. adım: olay sırası + kalıp sözler
  await adimaGit(4);
  await page.evaluate((ids) => {
    ids.forEach((id, hedef) => {
      for (let g = 0; g < 10; g++) {
        const satirlar = [...document.querySelectorAll(".ort-sira")];
        const i = satirlar.findIndex((s) => s.dataset.sira === id);
        if (i <= hedef) break;
        satirlar[i].querySelector("button").click();
      }
    });
    [...document.querySelectorAll("button")].find((b) => b.textContent === "Sırayı kontrol et").click();
  }, OLAYLAR.map((o) => o.id));
  await yerlestir(page, { a: "bas", b: "bas", c: "ic", d: "ic", e: "son", f: "son" });
  kontrol(await gorevTamamMi(page), "5. adım: olay sırası ve kalıp sözler tamam");

  // 6. adım: edebî / bilgilendirici
  await adimaGit(5);
  await yerlestir(page, { e1: "edebi", e2: "edebi", e3: "edebi", e4: "edebi", b0: "bilgi", b1: "bilgi", b2: "bilgi", b3: "bilgi" });
  await secenek(page, "Dayanışma");
  kontrol(await gorevTamamMi(page), "6. adım: metin türü sınıflandırması tamam");

  // 7. adım: beğeni ölçütleri + alternatif gelişme
  await adimaGit(6);
  await page.evaluate(() => {
    const kutular = [...document.querySelectorAll("[data-begeni]")].slice(0, 3);
    kutular.forEach((c) => c.click());
    kutular.forEach((c) => document.querySelector(`[data-yildiz="${c.dataset.begeni}|4"]`).click());
  });
  await secenek(page, "devden kaçsaydı");
  await yaz(page, ".d-panel textarea", "Keloğlan devden kaçsaydı dağın öbür yüzünden dolanır, yolda bir çobanla karşılaşır ve kavalın gücünü ondan öğrenirdi.");
  kontrol(await gorevTamamMi(page), "7. adım: öz değerlendirme ve alternatif gelişme tamam");

  // 8. adım: amaç ve kitle
  await adimaGit(7);
  await secenek(page, "Bir değeri aktarmak");
  await secenek(page, "İlkokul öğrencileri");
  await secenek(page, "6 kare");
  await secenek(page, "Anlatıcı sesi");
  kontrol(await gorevTamamMi(page), "8. adım: yapım kartı tamam");

  // 9. adım: altı kare
  await adimaGit(8);
  for (let i = 0; i < 6; i++) {
    await page.evaluate((n, olay) => {
      document.querySelector(`[data-kare='${n}']`).click();
      const s = document.querySelector("[data-secim='olay'] select, select[data-secim='olay']");
      s.value = olay; s.dispatchEvent(new Event("change"));
    }, i, OLAYLAR[i].id);
    if (i === 3) await page.evaluate(() => document.querySelector("[data-cekim='yakin']").click());
    await yaz(page, "[data-alan='metin']", `${i + 1}. sahnede ${OLAYLAR[i].metin}`);
  }
  kontrol(await gorevTamamMi(page), "9. adım: altı kare hazır");
  await ekranGoruntusu("adim09-serit");

  // 10. adım: örnek taslağı düzelt
  await adimaGit(9);
  await tikla(".d-panel button", "Örnek taslağı yükle");
  kontrol(await page.evaluate(() => document.querySelectorAll(".tde-denetim-satir.hatali").length === 6), "10. adım: örnek taslağın altı karesinde de bulgu var");
  await ekranGoruntusu("adim10-bulgular");
  const DUZGUN = [
    "Evvel zaman içinde dağ eteğindeki bir köyde Keloğlan ile anası yaşarmış.",
    "Günlerden bir gün tellallar bağırmış: “Duyduk duymadık demeyin!”",
    "Keloğlan yola düşmüş. Bir çeşme başında kanadı kırık bir bülbül görmüş.",
    "Derken Kara Dağ'daki dev çıkagelmiş. Keloğlan'ın ödü kopmuş ama kavalını çalmış.",
    "Gülsüm Sultan pencereye gelmiş ve üç yıl sonra ilk kez dile gelmiş.",
    "Sonunda kırk gün kırk gece düğün yapılmış, herkes sevinmiş.",
  ];
  for (let i = 0; i < 6; i++) {
    await page.evaluate((n) => document.querySelector(`[data-denetim='${n}']`).click(), i);
    await yaz(page, "[data-alan='duzelt']", DUZGUN[i]);
  }
  kontrol(await gorevTamamMi(page), "10. adım: düzeltilen taslak temiz → görev tamam");

  // 11. adım: rubrik + eleştiriye cevap
  await adimaGit(10);
  await page.evaluate(() => document.querySelectorAll(".ort-rubrik button[data-puan='3']").forEach((b) => b.click()));
  await secenek(page, "Hangi kısmı");
  kontrol(await gorevTamamMi(page), "11. adım: değerlendirme ve yapıcı cevap tamam");

  // 12. adım: sınav
  await adimaGit(11);
  for (const c of [0, 1, 1, 1, 1, 1, 2, 0]) {
    await page.evaluate((i) => document.querySelectorAll(".d-sinav .d-siklar button")[i].click(), c);
    await bekle(60);
    await page.evaluate(() => [...document.querySelectorAll(".d-sinav button")].find((b) => /Sonraki|Sonucu/.test(b.textContent)).click());
    await bekle(60);
  }
  const puan = await page.evaluate(() => document.querySelector(".d-puan")?.textContent);
  kontrol(puan === "8 / 8", `12. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "12. adım: sınav görevi tamamlanıyor");
};
