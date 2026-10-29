// Derse özel duman senaryosu: görevleri programla yapar ve tamamlandığını doğrular
import { KONULAR, KAYNAK_DOSYASI, IDDIALAR, MEDENIYET, KANITLAR, AHI_OLAYLARI } from "./veri.js";

const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
const tiklaSecici = (page, secici) => page.evaluate((s) => {
  const e = document.querySelector(s);
  if (!e) throw new Error(`Bulunamadı: ${s}`);
  e.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}, secici);
const yaz = (page, metin) => page.evaluate((m) => {
  const t = document.querySelector(".d-panel textarea");
  t.value = m;
  t.dispatchEvent(new Event("input"));
}, metin);

/** Sınıflandırma destesini veri tablosuna göre çözer */
async function desteyiCoz(page, bekle, kutuBul, adet) {
  for (let i = 0; i < adet; i++) {
    const id = await page.evaluate(() => document.querySelector(".hrt-deste-kart")?.dataset.id);
    await tiklaSecici(page, `.hrt-kutu-dugmeleri [data-kutu="${kutuBul(id)}"]`);
    await bekle(40);
  }
}

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: kavram destesi (yanlış bir deneme ile) + merak konusu
  await adimaGit(0);
  const ilk = await page.evaluate(() => document.querySelector(".hrt-deste-kart")?.dataset.id);
  await tiklaSecici(page, `.hrt-kutu-dugmeleri [data-kutu="${ilk === "vakif" ? "ahilik" : "vakif"}"]`);
  const ipucu = await page.evaluate(() => document.querySelector(".hrt-geri.yanlis")?.textContent);
  kontrol(/Tekrar/.test(ipucu || ""), "1. adım: yanlış seçimde ipucu çıkıyor");
  await desteyiCoz(page, bekle, (id) => id, 8);
  kontrol(!(await gorevTamamMi(page)), "1. adım: konu seçilmeden görev tamamlanmıyor");
  await page.evaluate(() => document.querySelector(".d-panel .d-secenekler button").click());
  await bekle(100);
  kontrol(await gorevTamamMi(page), "1. adım: kavramlar ve merak konusu tamamlanınca görev bitiyor");
  await ekranGoruntusu("adim01-tamam");

  // 2. adım: seçilen konu (ticaret) soruları + kendi sorusu
  await adimaGit(1);
  const konu = KONULAR[0];
  await desteyiCoz(page, bekle, (id) => konu.sorular[+id.split("-")[1]].tur, konu.sorular.length);
  await yaz(page, "Kervan yolları Selçuklu döneminde Anadolu şehirleri");
  await bekle(60);
  kontrol(!(await gorevTamamMi(page)), "2. adım: soru işaretsiz/ilişkisiz cümle kabul edilmiyor");
  await yaz(page, "Kervan yolları Selçuklu döneminde Anadolu şehirlerinin büyümesini nasıl etkiledi?");
  await bekle(100);
  kontrol(await gorevTamamMi(page), "2. adım: ilişki kuran araştırma sorusu kabul ediliyor");

  // 3. adım: kaynak dosyası
  await adimaGit(2);
  await desteyiCoz(page, bekle, (id) => KAYNAK_DOSYASI.find((k) => k.id === id).tur, KAYNAK_DOSYASI.length);
  kontrol(await gorevTamamMi(page), "3. adım: sekiz kaynak türüne göre ayrılıyor");
  await ekranGoruntusu("adim03-tamam");

  // 4. adım: doğruluk + soru
  await adimaGit(3);
  await desteyiCoz(page, bekle, (id) => IDDIALAR.find((k) => k.id === id).karar, IDDIALAR.length);
  await tiklaSecici(page, `.hrt-tahta .hrt-kart[data-i="1"]`);
  kontrol(await gorevTamamMi(page), "4. adım: iddialar ve doğrulama sorusu tamamlanıyor");
  await ekranGoruntusu("adim04-tamam");

  // 5. adım: kervan yolu — rota noktalarına ve iki ara noktaya han kur
  await adimaGit(4);
  const tiklaRota = (i, t = 0) => page.evaluate((i, t) => {
    const n = (j) => document.querySelector(`.tar-yol-nokta[data-i="${j}"]`).getBoundingClientRect();
    const a = n(i), b = n(i + 1);
    const x = a.left + a.width / 2 + t * (b.left - a.left), y = a.top + a.height / 2 + t * (b.top - a.top);
    document.querySelector(".hrt-harita svg").dispatchEvent(new MouseEvent("click", { clientX: x, clientY: y, bubbles: true }));
  }, i, t);
  await tiklaRota(0, 0.5);
  await bekle(60);
  const han1 = await page.evaluate(() => document.querySelectorAll(".tar-han").length);
  await tiklaRota(0, 0.5);
  await bekle(60);
  const han0 = await page.evaluate(() => document.querySelectorAll(".tar-han").length);
  kontrol(han1 === 1 && han0 === 0, "5. adım: yola dokununca han kuruluyor, yeniden dokununca kalkıyor");
  for (const [i, t] of [[1, 0], [2, 0], [3, 0], [3, 0.5], [5, 0], [6, 0], [7, 0], [7, 0.5]]) { await tiklaRota(i, t); await bekle(50); }
  const aralik = await page.evaluate(() => [...document.querySelectorAll(".d-gosterge")].map((g) => g.textContent).join(" | "));
  await tiklaSecici(page, `.d-panel .hrt-kart[data-i="1"]`);
  kontrol(await gorevTamamMi(page), `5. adım: tüm aralıklar 40 km'nin altında, çıkarım yapıldı (${aralik})`);
  await ekranGoruntusu("adim05-tamam");

  // 6. adım: Ahilik örnek olayları + çıkarım
  await adimaGit(5);
  for (const c of [...AHI_OLAYLARI.map((o) => o.dogru), 1]) { await tiklaSecici(page, `.hrt-tahta .hrt-kart[data-i="${c}"]`); await bekle(1250); }
  kontrol(await gorevTamamMi(page), "6. adım: dört olay ve çıkarım tamamlanıyor");

  // 7. adım: medeniyet karşılaştırması
  await adimaGit(6);
  await desteyiCoz(page, bekle, (id) => MEDENIYET[+id.split("-")[1]].kutu, MEDENIYET.length);
  kontrol(await gorevTamamMi(page), "7. adım: on bir kart doğru medeniyete yerleşiyor");
  await ekranGoruntusu("adim07-tamam");

  // 8. adım: yıl kaydırıcısı + kanıt dosyası + yargı
  await adimaGit(7);
  const gizli = await page.evaluate(() => document.querySelectorAll(".tar-kanit").length);
  kontrol(gizli === 0, "8. adım: 1200'de henüz eser görünmüyor");
  await page.evaluate(() => { const r = document.querySelector(".d-panel input[type=range]"); r.value = 1300; r.dispatchEvent(new Event("input")); });
  await bekle(100);
  await tiklaSecici(page, `g.tar-kanit[data-id="kosedag"]`);
  const cel = await page.evaluate(() => document.querySelector(".tar-kanit-geri")?.className);
  kontrol(/yanlis/.test(cel || ""), "8. adım: çeldirici kanıt dosyasına alınmıyor");
  for (const x of KANITLAR.filter((k) => k.destekler).slice(0, 7)) { await tiklaSecici(page, `g.tar-kanit[data-id="${x.id}"]`); await bekle(40); }
  await tiklaSecici(page, `.d-panel .hrt-kart[data-i="1"]`);
  kontrol(await gorevTamamMi(page), "8. adım: kanıtlar toplanıp yargı seçilince görev tamamlanıyor");
  await ekranGoruntusu("adim08-tamam");

  // 9. adım: düşünürler + yargı yazısı
  await adimaGit(8);
  await desteyiCoz(page, bekle, (id) => id, 9);
  await yaz(page, "Kaşgarlı Mahmud'un sözlüğü Türkçeyi başka milletlere tanıttı; bugün de dil ve harita tarihi için temel bir kaynak.");
  await bekle(100);
  kontrol(await gorevTamamMi(page), "9. adım: dokuz eşleşme ve yargı yazısı tamamlanıyor");
  await ekranGoruntusu("adim09-tamam");

  // 10. adım: sınav
  await adimaGit(9);
  for (const c of [1, 2, "7", 2, 1, 1, 1, 2, 1]) {
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

  // telefon genişliğinde birkaç adım (yeniden yüklemeden)
  await page.setViewport({ width: 390, height: 844 });
  for (const i of [0, 4, 6, 7, 8]) { await adimaGit(i); await ekranGoruntusu(`telefon-adim${String(i + 1).padStart(2, "0")}`); }
  await page.setViewport({ width: 1408, height: 840 });
};
