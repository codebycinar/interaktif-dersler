// Derse özel duman senaryosu (tools/duman.mjs çalıştırır): görevleri gerçekten yapıp tamamlandığını doğrular
import { gorevTamamMi, gorevBekle, dugme, yerlestir, sinaviCoz, telefon, anlatKaresi, alistirmaBekle } from "../ortak/duman-yardim.mjs";

const P = ".d-panel";

export default async ({ page, adimaGit: git, bekle, kontrol, ekranGoruntusu }) => {
  // yavaş makinede (CI) anlatım bitip alıştırma görünmeden düğme aranmasın
  const adimaGit = async (i, o) => { await git(i, o); if (o?.anlatimiGec !== false) await alistirmaBekle(page); };
  // 1. adım: güvenilmez araç reddedilir, sonra beş bilgi noktası
  await adimaGit(0);
  await dugme(page, "Kaynağı belirsiz", P);
  await dugme(page, "Bilimsel dergi", P);
  await dugme(page, "Araç listemi onayla", P);
  kontrol(await page.evaluate(() => document.querySelector(".d-panel .d-geri-bildirim.yanlis") !== null), "1. adım: güvenilmez araç seçilince uyarı veriliyor");
  await dugme(page, "Kaynağı belirsiz", P);
  await dugme(page, "Üniversite", P);
  await dugme(page, "Araç listemi onayla", P);
  // 3B sahnedeki iğneye (nesneye bağlı etiket) gerçekten dokun: ilk iğne hidrotermal bacadır
  await page.evaluate(() => document.querySelector(".d-igne.tiklanir span").click());
  await bekle(300);
  kontrol(await page.waitForFunction(() => document.querySelector(".d-gosterge b")?.textContent.startsWith("1 /") && document.querySelector(".d-igne.tiklanir")?.textContent.includes("✓"), { timeout: 10000 }).then(() => true, () => false), "1. adım: sahnedeki iğneye dokununca bilgi toplanıyor");
  for (const ad of ["Kemosentetik bakteriler", "Dev tüp solucanı", "Midye, yengeç"]) await dugme(page, ad, P);
  kontrol(!(await gorevTamamMi(page)), "1. adım: dört bilgiyle görev henüz tamamlanmıyor");
  await dugme(page, "Bilim tarihinden", P);
  await gorevBekle(page, 5000);
  kontrol(await gorevTamamMi(page), "1. adım: beş bilgi noktası incelenince görev tamamlanıyor");
  await ekranGoruntusu("ozel-01-baca");

  // 2. adım: fotosentez / kemosentez karşılaştırması + iddia
  await adimaGit(1);
  await bekle(1500);
  await yerlestir(page, [["Işık enerjisi", "k"]]);
  kontrol(await page.evaluate(() => document.querySelector(".bio-nedenler li") !== null), "2. adım: yanlış kartın nedeni gösteriliyor");
  await yerlestir(page, [["Işık enerjisi", "f"], ["Klorofil", "f"], ["Bitkiler,", "f"], ["İnorganik", "k"], ["Yalnızca bazı", "k"], ["Işığın hiç", "k"], ["CO₂ kullanılarak", "i"], ["Bu süreci", "i"], ["Üretilen besin", "i"]]);
  kontrol(!(await gorevTamamMi(page)), "2. adım: iddia değerlendirilmeden görev tamamlanmıyor");
  await dugme(page, "Kısmen yanlış", P);
  kontrol(await gorevTamamMi(page), "2. adım: sınıflandırma ve iddia değerlendirmesi tamamlanıyor");
  await bekle(300);
  await ekranGoruntusu("ozel-02-venn");

  // 3. adım: ölçüt + canlıların sınıflandırılması
  await adimaGit(2);
  await dugme(page, "Besinin parçalandığı", P);
  await yerlestir(page, [["Amip", "ic"], ["Terliksi", "ic"], ["Sünger", "ic"], ["Hidra", "ikisi"], ["Planarya", "ikisi"], ["Küf", "dis"], ["Sinekkapan", "dis"], ["İnsan", "dis"]]);
  kontrol(await gorevTamamMi(page), "3. adım: ölçüt ve sınıflandırma tamamlanıyor");
  await bekle(4000);
  await ekranGoruntusu("ozel-03-sindirim");

  // 4. adım: yapılandırılmış ızgara (önce bir yanlış hücre)
  await adimaGit(3);
  await bekle(1500);
  const izgaraDoldur = (yanlis) => page.evaluate((y) => {
    const dogru = [[0, 0, 0, 1], [1, 1, 0, 0], [2, 2, 2, 1], [3, 3, 1, 2]];
    const sel = [...document.querySelectorAll(".bio-izgara select")];
    sel.forEach((s, i) => { s.value = String(y && i === 0 ? 1 : dogru[Math.floor(i / 4)][i % 4]); s.dispatchEvent(new Event("change")); });
    [...document.querySelectorAll(".bio-sinif button")].find((b) => b.textContent.includes("Izgarayı")).click();
  }, yanlis);
  await izgaraDoldur(true);
  kontrol(!(await gorevTamamMi(page)) && (await page.evaluate(() => document.querySelectorAll(".bio-izgara select.yanlis").length === 1)), "4. adım: yanlış hücre işaretleniyor");
  await izgaraDoldur(false);
  kontrol(await gorevTamamMi(page), "4. adım: ızgara doğru dolduruluyor");
  await ekranGoruntusu("ozel-04-izgara");

  // 5. adım: sindirim → emilim → taşıma + maddeler
  await adimaGit(4);
  await dugme(page, "Çiğne ve karıştır", P); await bekle(2500);
  await ekranGoruntusu("ozel-05a-mekanik");
  await dugme(page, "Kimyasal sindirim", P); await bekle(3500);
  await dugme(page, "Dolaşımı başlat", P);
  await yerlestir(page, [["Su", "h"], ["Mineraller", "h"], ["Vitaminler", "h"], ["Glikoz", "h"], ["Çoğu ilacın", "h"], ["Sakkaroz", "s"], ["Nişasta", "s"], ["Protein", "s"], ["Yağ", "s"]]);
  kontrol(await gorevTamamMi(page), "5. adım: üç süreç ve madde sınıflandırması tamamlanıyor");
  await bekle(3500);
  await ekranGoruntusu("ozel-05-emilim");

  // 6. adım: emilim yüzeyi (üç yapılandırma)
  await adimaGit(5);
  await dugme(page, "Ölçümü tabloya kaydet", P);
  await dugme(page, "Villuslar: KAPALI", P); await dugme(page, "Ölçümü tabloya kaydet", P);
  kontrol(!(await gorevTamamMi(page)), "6. adım: iki kayıtla görev tamamlanmıyor");
  await dugme(page, "Mikrovilluslar: KAPALI", P); await dugme(page, "Ölçümü tabloya kaydet", P);
  const satir = await page.evaluate(() => document.querySelectorAll(".d-tablo tbody tr").length);
  kontrol(satir === 3 && (await gorevTamamMi(page)), `6. adım: üç kayıt ve %90 üstü emilim (${satir} satır)`);
  await dugme(page, "Kıvrımlar: KAPALI", P);
  await bekle(600);
  await ekranGoruntusu("ozel-06-yuzey");

  // 7. adım: dört vaka
  await adimaGit(6);
  await dugme(page, "Taşıma", P);
  kontrol(!(await gorevTamamMi(page)) && (await page.evaluate(() => document.querySelector(".d-panel .d-geri-bildirim.yanlis") !== null)), "7. adım: yanlış teşhis reddediliyor");
  for (const [i, cevap] of [[1, "Emilim"], [2, "Sindirim"], [3, "Taşıma"], [4, "Sindirim"]]) {
    await dugme(page, `Vaka ${i}`, P); await dugme(page, cevap, P); await bekle(100);
  }
  kontrol(await gorevTamamMi(page), "7. adım: dört vaka doğru teşhis ediliyor");
  await bekle(1500);
  await ekranGoruntusu("ozel-07-zincir");

  // 8. adım: sınav
  await adimaGit(7);
  kontrol(await page.evaluate(() => !document.querySelector(".d-sinav").textContent.includes("null")), "8. adım: sınav kartında 'null' metni yok");
  const puan = await sinaviCoz(page, bekle, [2, 1, 2, 1, 2, "300", "40", 3]);
  kontrol(puan === "8 / 8", `8. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "8. adım: sınav görevi tamamlanıyor");

  // anlatım kareleri: sahne anlatılanı gösteriyor mu (iğne vurgusu, kamera)
  kontrol(await page.evaluate(() => !document.querySelector(".d-uygulama-blok[hidden]")), "anlatım bitince “Şimdi sen dene” açık");
  for (const [i, k] of [[0, 4], [2, 7], [3, 6], [5, 7], [6, 4]]) {
    await adimaGit(i);
    await anlatKaresi(page, bekle, k);
    if (i === 5) kontrol(await page.waitForFunction(() => document.querySelectorAll(".d-igne.bio-vurgu").length === 1 && document.querySelector(".d-uygulama-blok").hidden, { timeout: 10000 }).then(() => true, () => false), "6. adım: anlatımda tek iğne vurgulu, alıştırma gizli");
    await ekranGoruntusu(`anlat-${String(i + 1).padStart(2, "0")}-${k}`);
  }

  await telefon(page, adimaGit, bekle, ekranGoruntusu, [0, 3, 5, 6]);
};
