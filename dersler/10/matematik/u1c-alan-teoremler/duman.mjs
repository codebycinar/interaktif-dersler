// Derse özel duman senaryosu: noktaları gerçekten sürükleyip, teodolitle ölçüp görevleri tamamlar
import { surukle, dugme, cevapla, gorevTamamMi, sinaviCoz, mobilGoruntuler } from "../ortak/duman-yardim.mjs";
import { BOGAZ, tabanAcisi, acHesapla, cdHesapla, gercekUzaklik } from "./model.js";

const hudOku = (page) => page.evaluate(() => [...document.querySelectorAll(".d-etiket-hud .d-gosterge b")].map((b) => b.textContent));
const formuller = (page) => page.evaluate(() => [...document.querySelectorAll(".d-panel .mt-formuller .mt-deger")].map((d) => d.textContent));
const kaydir = (page, v, i = 0) => page.evaluate((d, n) => {
  const r = document.querySelectorAll(".d-panel input[type=range]")[n];
  r.value = String(d);
  r.dispatchEvent(new Event("input", { bubbles: true }));
}, v, i);
/** Karışık ispat kartlarını verilen başlangıç metinlerinin sırasıyla tıklar; yanlış sırada bir kart denendiyse geri bildirimi döndürür */
const ispatDiz = (page, sira) => page.evaluate((s) => {
  for (const bas of s) [...document.querySelectorAll(".d-panel .mt-kart")].find((b) => b.textContent.startsWith(bas)).click();
  return document.querySelector(".d-panel .mt-sirala .d-geri-bildirim")?.textContent;
}, sira);

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: iki deney, dörder ölçüm
  await adimaGit(0);
  await dugme(page, "2 katına çıkar");
  await dugme(page, "Yarıya iner");
  await dugme(page, "Deney 1");
  for (const y of [2, 6, 7.5, 3]) await surukle(page, "A", 2, y);
  await dugme(page, "Deney 2");
  for (const x of [3, 8, 10, 5]) await surukle(page, "C", x, 0);
  const seri = await page.evaluate(() => document.querySelector(".d-grafik canvas") !== null);
  kontrol(seri, "1. adım: grafik çizildi");
  kontrol(await gorevTamamMi(page), "1. adım: görev tamamlanıyor");
  await ekranGoruntusu("c1-tamam");

  // 2. adım: paralel doğrular
  await adimaGit(1);
  await dugme(page, "Değişmez");
  await surukle(page, "A", 0, 4);
  await surukle(page, "A", 5.5, 4);
  const [abc, dbc] = await hudOku(page);
  kontrol(abc === "12" && dbc === "12", `2. adım: iki alan da 12 (${abc}, ${dbc})`);
  await surukle(page, "A", -5, 4);
  await dugme(page, "Ortak olmayan bölgeler");
  const hb = await hudOku(page);
  kontrol(hb[2] === hb[3] && hb[2] !== "—", `2. adım: ortak olmayan bölgeler eşit (${hb[2]} = ${hb[3]})`);
  const ipucu = await cevapla(page, 18);
  kontrol(ipucu.includes("KBC"), "2. adım: yanlış cevaba ipucu");
  await cevapla(page, 9);
  kontrol(await gorevTamamMi(page), "2. adım: görev tamamlanıyor");
  await ekranGoruntusu("c2-tamam");

  // 3. adım: benzerlik
  await adimaGit(2);
  await dugme(page, "6");
  for (const k of [2, 2.5, 3]) await kaydir(page, k);
  const f3 = await formuller(page);
  kontrol(f3[2] === "9" && f3[3] === "9", `3. adım: k = 3 iken S₂ ÷ S₁ = k² = 9 (${f3[2]}, ${f3[3]})`);
  const kup = await cevapla(page, 135);
  kontrol(kup.includes("hacim"), "3. adım: k³ yanılgısına ipucu");
  await cevapla(page, 45);
  kontrol(await gorevTamamMi(page), "3. adım: görev tamamlanıyor");
  const yorum = await page.evaluate(() => document.querySelector(".d-panel .d-geri-bildirim.yanlis")?.textContent || "");
  kontrol(yorum.includes("çelişiyor"), "3. adım: yanlış varsayım genellemeyle karşılaştırıldı");
  await ekranGoruntusu("c3-tamam");

  // 4. adım: sinüslü alan ve önermeler
  await adimaGit(3);
  await surukle(page, "C", 0, 5);
  await surukle(page, "C", -3, 4);
  const f4 = await formuller(page);
  kontrol(f4.length === 6 && f4.every((v) => v === f4[0]), `4. adım: altı alan formülü eşit (${f4.join(" ")})`);
  await page.evaluate((c) => document.querySelectorAll(".mt-onerme").forEach((o, i) => o.querySelectorAll("button")[c[i] ? 0 : 1].click()), [true, true, false, true, false]);
  const yarim = await cevapla(page, 30);
  kontrol(yarim.includes("½"), "4. adım: ½'yi unutma uyarısı");
  await cevapla(page, 15);
  kontrol(await gorevTamamMi(page), "4. adım: görev tamamlanıyor");
  await ekranGoruntusu("c4-genis");

  // 5. adım: tarla sınırı
  await adimaGit(4);
  await dugme(page, "AB'yi çiz");
  await dugme(page, "M'den AB'ye paralel");
  await surukle(page, "N", 7.5, 0);
  const t5 = await hudOku(page);
  kontrol(t5[0] === t5[1] && t5[2] === "%0", `5. adım: parsel alanı korunuyor (${t5.join(" / ")})`);
  const birim = await cevapla(page, 3.5);
  kontrol(birim.includes("10 m"), "5. adım: birim çevirme uyarısı");
  await cevapla(page, 35);
  kontrol(await gorevTamamMi(page), "5. adım: görev tamamlanıyor");
  await ekranGoruntusu("c5-tamam");

  // 6. adım: sinüs teoremi
  await adimaGit(5);
  await dugme(page, "Her üçgende eşittir");
  await surukle(page, "A", 1, 4);
  await surukle(page, "B", -5, -1);
  await surukle(page, "A", -6, 1);
  await dugme(page, "Çevrel çember");
  const f6 = await formuller(page);
  kontrol(f6.every((v) => v === f6[0]), `6. adım: a/sinA = b/sinB = c/sinC = 2R (${f6.join(" ")})`);
  const erken = await page.evaluate(() => {
    [...document.querySelectorAll(".d-panel .mt-kart")].find((b) => b.textContent.startsWith("Her iki tarafı sin")).click();
    return document.querySelector(".d-panel .mt-sirala .d-geri-bildirim").textContent;
  });
  kontrol(erken.includes("sadeleştir"), "6. adım: ispatta erken adıma ipucu");
  await ispatDiz(page, ["Aynı alanı", "Her iki tarafı ½", "Her iki tarafı sin", "Aynı yolu"]);
  kontrol(await gorevTamamMi(page), "6. adım: görev tamamlanıyor");
  await ekranGoruntusu("c6-tamam");

  // 7. adım: kosinüs teoremi
  await adimaGit(6);
  await dugme(page, "A'nın açıortayı");
  const yanlisCizim = await page.evaluate(() => document.querySelector(".d-panel .d-geri-bildirim.yanlis")?.textContent || "");
  kontrol(yanlisCizim.includes("dik"), "7. adım: yanlış ek çizime açıklama");
  await dugme(page, "C'den AB'ye dikme");
  await page.evaluate(() => {
    const s = document.querySelectorAll(".mt-secim-tablo select");
    s[0].value = "b · sin A"; s[1].value = "b · cos A"; s[2].value = "c − b · cos A";
  });
  await dugme(page, "Tabloyu kontrol et");
  await ispatDiz(page, ["BHC dik", "Yerine yaz", "Parantezleri", "sin²A"]);
  await surukle(page, "C", -5.5, 3);
  const h7 = await hudOku(page);
  kontrol(h7[1] === h7[2], `7. adım: geniş A'da a² = b² + c² − 2bc·cos A (${h7[1]} = ${h7[2]})`);
  kontrol(await gorevTamamMi(page), "7. adım: görev tamamlanıyor");
  await ekranGoruntusu("c7-genis");

  // 8. adım: Boğaz — teodolit ölçümleri
  await adimaGit(7);
  await bekle(600);
  const tuval = await page.evaluate(() => !!document.querySelector(".d-katman canvas.d-3b"));
  kontrol(tuval, "8. adım: 3B sahne kuruldu");
  const yuvarla = (v) => Math.round(v * 20) / 20;
  await kaydir(page, yuvarla(tabanAcisi("A", "C")) + 0.1);
  const kilitli = await hudOku(page);
  kontrol(kilitli[2].includes("saat kulesi"), `8. adım: teodolit hedefe kilitleniyor (${kilitli[2]})`);
  await ekranGoruntusu("c8-olcum");
  await dugme(page, "B istasyonu");
  await kaydir(page, yuvarla(tabanAcisi("B", "C")));
  const olc = (ist, hd) => Math.round(tabanAcisi(ist, hd) * 10) / 10;
  const bcHata = await cevapla(page, Math.round(gercekUzaklik("B", "C")));
  kontrol(bcHata.includes("BC"), "8. adım: AC yerine BC bulununca uyarı");
  const ac = acHesapla(olc("A", "C"), olc("B", "C"));
  await cevapla(page, Math.round(ac));
  await dugme(page, "A istasyonu");
  await kaydir(page, yuvarla(tabanAcisi("A", "D")));
  const fark = Math.round((olc("A", "D") - olc("A", "C")) * 10) / 10;
  await cevapla(page, Math.round(cdHesapla(Math.round(ac), BOGAZ.AD_metre, fark)), 1);
  const satir = await page.evaluate(() => document.querySelectorAll(".d-panel .d-tablo tbody tr").length);
  kontrol(satir === 3, `8. adım: üç ölçüm tabloda (${satir})`);
  kontrol(await gorevTamamMi(page), "8. adım: görev tamamlanıyor");
  await ekranGoruntusu("c8-tamam");

  // 9. adım: sınav
  await adimaGit(8);
  const puan = await sinaviCoz(page, [{ s: 1 }, 27, 12, 14.14, 7, { s: 1 }, { s: 0 }, 6], bekle);
  kontrol(puan === "8 / 8", `9. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "9. adım: sınav görevi tamamlanıyor");

  await mobilGoruntuler(page, adimaGit, ekranGoruntusu, [0, 3, 4, 7]);
};
