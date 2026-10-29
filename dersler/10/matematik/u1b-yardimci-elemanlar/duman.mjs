// Derse özel duman senaryosu: köşeleri gerçekten sürükleyip görevleri tamamlar
import { surukle, dugme, cevapla, gorevTamamMi, sinaviCoz, mobilGoruntuler } from "../ortak/duman-yardim.mjs";
import { SENARYOLAR, senaryoHedefi } from "./model.js";

const formul = (page, i) => page.evaluate((n) => document.querySelectorAll(".d-panel .mt-formuller .mt-deger")[n]?.textContent, i);
const hudOku = (page) => page.evaluate(() => [...document.querySelectorAll(".d-etiket-hud .d-gosterge b")].map((b) => b.textContent));

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: iç açıortay teoremi
  await adimaGit(0);
  await dugme(page, "AB ÷ AC");
  await surukle(page, "A", 1, 4);
  const [o1, o2] = [await formul(page, 0), await formul(page, 1)];
  kontrol(o1 === o2, `1. adım: AB/AC = BD/DC (${o1} = ${o2})`);
  await surukle(page, "C", 5, -1);
  const ters = await cevapla(page, 6);
  kontrol(ters.includes("ters"), `1. adım: ters oran uyarısı (${ters.slice(0, 30)})`);
  await cevapla(page, 4);
  kontrol(await gorevTamamMi(page), "1. adım: görev tamamlanıyor");

  // 2. adım: açıortaylar ve iç teğet çember
  await adimaGit(1);
  await dugme(page, "Her üçgende tek noktada");
  await dugme(page, "B'nin açıortayı");
  await dugme(page, "C'nin açıortayı");
  await surukle(page, "P", -1, 1);
  kontrol(await formul(page, 0) === await formul(page, 1), "2. adım: P'nin kollara uzaklıkları eşit");
  await surukle(page, "A", 1, 4.5);
  await surukle(page, "B", -5, -1);
  await dugme(page, "İç teğet çember");
  const r = (await formul(page, 2)).split(" · ");
  kontrol(r.length === 3 && r.every((v) => v === r[0]), `2. adım: I üç kenara eşit uzaklıkta (${r.join(", ")})`);
  kontrol(await gorevTamamMi(page), "2. adım: görev tamamlanıyor");
  await ekranGoruntusu("b2-tamam");

  // 3. adım: dış açıortay — ikizkenar üçgende paralellik, dış teğet çember, problem
  await adimaGit(2);
  await surukle(page, "A", 1, 3);
  const paralel = await page.evaluate(() => document.querySelector(".d-panel").textContent.includes("paralel"));
  kontrol(paralel, "3. adım: AB = AC iken dış açıortay BC'ye paralel");
  await surukle(page, "A", -2.5, 2.5);
  await dugme(page, "dış açıortayları");
  const eb = await cevapla(page, 15);
  kontrol(eb.includes("EB"), "3. adım: EB/EC karışıklığı uyarısı");
  await cevapla(page, 10);
  kontrol(await gorevTamamMi(page), "3. adım: görev tamamlanıyor");
  await ekranGoruntusu("b3-tamam");

  // 4. adım: ağırlık merkezi 2:1 ve dik üçgen
  await adimaGit(3);
  await dugme(page, "2 : 1");
  await surukle(page, "C", 4, -2);
  await surukle(page, "B", -4, -2);
  await surukle(page, "A", -4, 3);
  const g = [await formul(page, 0), await formul(page, 1), await formul(page, 2)];
  kontrol(g.every((v) => v === "2"), `4. adım: üç kenarortayda oran 2 (${g.join(", ")})`);
  kontrol(await formul(page, 3) === await formul(page, 4), "4. adım: hipotenüse ait kenarortay = hipotenüs/2");
  kontrol(await gorevTamamMi(page), "4. adım: görev tamamlanıyor");
  await ekranGoruntusu("b4-tamam");

  // 5. adım: çevrel çember — dar, dik, geniş
  await adimaGit(4);
  await dugme(page, "Her zaman geçer");
  await dugme(page, "Dışarıdadır");
  await dugme(page, "BC'nin kenar orta dikmesi");
  await dugme(page, "Çevrel çember");
  const dar = await hudOku(page);
  await surukle(page, "C", 4, -2.5);
  await surukle(page, "A", -4, 3.5);
  const dikH = await hudOku(page);
  await surukle(page, "A", -6, 1);
  const genis = await hudOku(page);
  kontrol(dar[1] === "üçgenin içinde" && dikH[1] === "bir kenarın üzerinde" && genis[1] === "üçgenin dışında", `5. adım: O'nun yeri (${dar[1]} / ${dikH[1]} / ${genis[1]})`);
  kontrol(await gorevTamamMi(page), "5. adım: görev tamamlanıyor");
  await ekranGoruntusu("b5-genis");

  // 6. adım: diklik merkezi + önermeler
  await adimaGit(5);
  await surukle(page, "C", 4, -2.5);
  await surukle(page, "A", -4, 3.5);
  const hDik = await hudOku(page);
  await surukle(page, "A", -6, 1);
  const hGenis = await hudOku(page);
  kontrol(hDik[1] === "dik açının köşesinde" && hGenis[1] === "üçgenin dışında", `6. adım: H'nin yeri (${hDik[1]} / ${hGenis[1]})`);
  await ekranGoruntusu("b6-genis");
  await page.evaluate(() => {
    const s = document.querySelectorAll(".mt-secim-tablo select");
    s[0].value = "üçgenin içinde"; s[1].value = "üçgenin dışında"; s[2].value = "dik açının köşesinde";
  });
  await dugme(page, "Tabloyu kontrol et");
  kontrol(await gorevTamamMi(page), "6. adım: görev tamamlanıyor");

  // 7. adım: üç gerçek yaşam problemi
  await adimaGit(6);
  await dugme(page, "Ağırlık merkezi");
  const uyari = await page.evaluate(() => document.querySelector(".d-panel .d-geri-bildirim.yanlis")?.textContent || "");
  kontrol(uyari.includes("eşit uzaklıkta"), "7. adım: yanlış merkez seçimine açıklama");
  for (const s of SENARYOLAR) {
    await dugme(page, s.baslik);
    const etiket = { cevrel: "Çevrel çemberin merkezi", ic: "İç teğet çemberin merkezi", agirlik: "Ağırlık merkezi" }[s.dogru];
    await dugme(page, etiket);
    const h = senaryoHedefi(s);
    await surukle(page, "P", h.x + 0.05, h.y - 0.05);
    if (s.ad === "depo") await ekranGoruntusu("b7-depo");
  }
  await ekranGoruntusu("b7-levha");
  const cozulen = await page.evaluate(() => document.querySelector(".d-panel").textContent.match(/Çözülen problem: (\d)\/3/)?.[1]);
  kontrol(cozulen === "3", `7. adım: üç problem çözüldü (${cozulen}/3)`);
  kontrol(await gorevTamamMi(page), "7. adım: görev tamamlanıyor");

  // 8. adım: sınav
  await adimaGit(7);
  const puan = await sinaviCoz(page, [4, 8, { s: 1 }, { s: 1 }, 5, { s: 2 }, { s: 1 }, 10], bekle);
  kontrol(puan === "8 / 8", `8. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "8. adım: sınav görevi tamamlanıyor");

  await mobilGoruntuler(page, adimaGit, ekranGoruntusu, [0, 2, 6]);
};
