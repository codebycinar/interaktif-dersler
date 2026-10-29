// Derse özel duman senaryosu: görevleri gerçek sürükleme ve tıklamalarla yapıp tamamlandığını doğrular
import { surukle, dunyaSurukle, dugme, cevapla, gorevTamamMi, sinaviCoz, mobilGoruntuler } from "../ortak/duman-yardim.mjs";

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: varsayım + üç farklı boyutta ölçüm
  await adimaGit(0);
  await dugme(page, "Değişmez");
  await dugme(page, "Ölç ve tabloya yaz");
  await surukle(page, "B", 8, 6);
  await dugme(page, "Ölç ve tabloya yaz");
  await surukle(page, "B", 2, 1.5);
  await dugme(page, "Ölç ve tabloya yaz");
  const satir = await page.evaluate(() => [...document.querySelectorAll(".d-tablo tbody tr")].map((tr) => tr.children[1].textContent));
  kontrol(satir.length === 3 && satir.every((v) => v === "0,600"), `1. adım: üç satırda karşı/hip = 0,600 (${satir.join(" ")})`);
  kontrol(await gorevTamamMi(page), "1. adım: görev tamamlanıyor");
  await ekranGoruntusu("a1-tamam");

  // 2. adım: tan = 1, sin = 0,6, cot = 2
  await adimaGit(1);
  kontrol(!(await gorevTamamMi(page)), "2. adım: başlangıçta görev tamam değil");
  await surukle(page, "B", 5, 5);
  await surukle(page, "B", 4, 3);
  await surukle(page, "B", 8, 4);
  kontrol(await gorevTamamMi(page), "2. adım: üç hedef üçgen kuruldu");

  // 3. adım: iki varsayım + dört açı
  await adimaGit(2);
  await dugme(page, "Açıya göre değişir");
  await page.evaluate(() => [...document.querySelectorAll(".d-panel .d-secenekler")][1].querySelector("button").click());
  for (const a of [37, 20, 45, 70]) {
    const r = a * Math.PI / 180;
    await surukle(page, "B", Math.cos(r), Math.sin(r));
    await dugme(page, "Ölçümü kaydet");
  }
  const kare = await page.evaluate(() => [...document.querySelectorAll(".d-tablo tbody tr")].map((tr) => tr.children[2].textContent));
  kontrol(kare.length === 4 && kare.every((v) => v === "1,000"), `3. adım: sin²+cos² hep 1 (${kare.join(" ")})`);
  kontrol(await gorevTamamMi(page), "3. adım: görev tamamlanıyor");
  await ekranGoruntusu("a3-tamam");

  // 4. adım: özel açılar tablosu
  await adimaGit(3);
  await dugme(page, "yükseklik indir");
  const D = { sin: ["1/2", "√2/2", "√3/2"], cos: ["√3/2", "√2/2", "1/2"], tan: ["√3/3", "1", "√3"], cot: ["√3", "1", "√3/3"] };
  await page.evaluate((d) => {
    const sel = [...document.querySelectorAll(".mt-secim-tablo select")];
    Object.values(d).flat().forEach((v, i) => { sel[i].value = v; });
    sel[0].value = "√3/2"; // önce bir yanlış
  }, D);
  await dugme(page, "Tabloyu kontrol et");
  const ipucu = await page.evaluate(() => document.querySelector(".mt-secim-tablo").closest("div").querySelector(".d-geri-bildirim").textContent);
  kontrol(ipucu.includes("11/12") && ipucu.includes("sin 30°"), `4. adım: yanlış hücre için ipucu (${ipucu.slice(0, 60)})`);
  await page.evaluate(() => { document.querySelector(".mt-secim-tablo select").value = "1/2"; });
  await dugme(page, "Tabloyu kontrol et");
  kontrol(await gorevTamamMi(page), "4. adım: tablo doğru doldurulunca görev tamam");
  await ekranGoruntusu("a4-tamam");

  // 5. adım: önermeler (önce bir yanlış cevap)
  await adimaGit(4);
  const cevap = [true, false, true, false, true, false];
  await page.evaluate(() => document.querySelectorAll(".mt-onerme")[1].querySelectorAll("button")[0].click());
  const yanlis = await page.evaluate(() => document.querySelectorAll(".mt-onerme")[1].classList.contains("yanlis"));
  kontrol(yanlis, "5. adım: yanlış sınıflandırma işaretleniyor");
  await page.evaluate((c) => document.querySelectorAll(".mt-onerme").forEach((o, i) => o.querySelectorAll("button")[c[i] ? 0 : 1].click()), cevap);
  kontrol(await gorevTamamMi(page), "5. adım: altı önerme doğru sınıflandırıldı");

  // 6. adım: birim çember (sürükleme + düğmeler)
  await adimaGit(5);
  await surukle(page, "P", -0.5, Math.sqrt(3) / 2, 20);
  await surukle(page, "P", -Math.sqrt(3) / 2, 0.5, 10);
  const teta = await page.evaluate(() => document.querySelector(".d-etiket-hud .d-gosterge b").textContent);
  kontrol(teta === "150°", `6. adım: P sürüklenince θ = 150° (${teta})`);
  for (let i = 0; i < 16; i++) await dugme(page, "↻ −15°");
  const teta2 = await page.evaluate(() => document.querySelector(".d-etiket-hud .d-gosterge b").textContent);
  kontrol(teta2 === "-90°" || teta2 === "−90°", `6. adım: negatif yönde −90° (${teta2})`);
  kontrol(await gorevTamamMi(page), "6. adım: üç açı bulundu");
  await ekranGoruntusu("a6-tamam");

  // 7. adım: minare — iki ölçüm + doğru yükseklik (önce göz yüksekliğini unutan cevap)
  await adimaGit(6);
  await dugme(page, "Ölçümü kaydet");
  await dunyaSurukle(page, "sen", 50, 0);
  const d = await page.evaluate(() => document.querySelector(".d-etiket-hud .d-gosterge b").textContent);
  kontrol(d === "50 m", `7. adım: gözlemci 3B avluda sürüklenince d = 50 m (${d})`);
  await ekranGoruntusu("a7-surukle");
  await dugme(page, "Ölçümü kaydet");
  const unuttu = await cevapla(page, 36.4);
  kontrol(unuttu.includes("Göz yüksekliğini"), `7. adım: göz yüksekliği unutulunca uyarı (${unuttu.slice(0, 40)})`);
  await cevapla(page, 38);
  kontrol(await gorevTamamMi(page), "7. adım: minare yüksekliği bulundu");
  await ekranGoruntusu("a7-tamam");

  // 8. adım: sınav
  await adimaGit(7);
  const puan = await sinaviCoz(page, [0.6, { s: 2 }, 0.6, { s: 1 }, { s: 1 }, 50, 5, { s: 1 }], bekle);
  kontrol(puan === "8 / 8", `8. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "8. adım: sınav görevi tamamlanıyor");
  await ekranGoruntusu("sinav-sonu");

  await mobilGoruntuler(page, adimaGit, ekranGoruntusu, [0, 2, 5, 6]);
};
