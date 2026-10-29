// Derse özel duman senaryosu (tools/duman.mjs çalıştırır): görevleri gerçekten yapıp tamamlandığını doğrular
import { gorevTamamMi, gorevBekle, kaydir, dugme, yerlestir, sinaviCoz, telefon } from "../ortak/duman-yardim.mjs";

// 3B dünyadaki iğne etiketleri ve sahne üstü paneller
const igneler = (page) => page.evaluate(() => [...document.querySelectorAll(".d-igne")].filter((e) => e.style.display !== "none").map((e) => e.textContent));
// iğne görünürlüğü birkaç karede bir ölçülür (panel altı gizleme); yavaş makinede 10 sn'ye kadar bekle
const igneVar = async (page, metin) => {
  for (let t = 0; t < 20; t++) {
    if ((await igneler(page)).some((x) => x.includes(metin))) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};
const metin = (page, secici) => page.evaluate((s) => document.querySelector(s)?.textContent || "", secici);
// karartmalı geçiş yavaş makinede (CI) uzayabilir: 10 sn'ye kadar açılmasını bekle
const perdeAcik = (page) => page.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector(".bio-perde")).opacity) < 0.05, { timeout: 10000 }).then(() => true, () => false);

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // anlatım kareleri bitince kamera istasyon görünümüne döner; iğneler yerine otursun
  const git = async (i) => { await adimaGit(i); await bekle(1100); };

  // Adım adım anlatımın ortası: ATP adımında fosfat karesi (kamera yaklaşır, iğneler parlar)
  await adimaGit(1, { anlatimiGec: false });
  // ana döngü anlatımı zaten izledi: baştan başlat
  await page.evaluate(() => document.querySelector('.d-anlat button[title="Anlatımı baştan izle"]')?.click());
  await bekle(300);
  for (let k = 0; k < 3; k++) { await page.evaluate(() => document.querySelector(".d-anlat .d-devam")?.click()); await bekle(250); }
  await bekle(1500);
  kontrol((await metin(page, ".d-kare.simdi")).includes("üç fosfat"), "anlatım: ATP adımının 4. karesi (fosfatlar) açık");
  kontrol(await page.evaluate(() => [...document.querySelectorAll(".d-igne.bio-vurgu")].some((e) => e.textContent.includes("Fosfat"))), "anlatım: karede sözü edilen fosfat iğneleri parlıyor");
  kontrol(await page.evaluate(() => !!document.querySelector(".d-anlat:not(.bitti) .d-devam")), "anlatım: kareler sürüyor, Devam düğmesi açık");
  await ekranGoruntusu("ozel-00-anlatim-ortasi");
  // 1. adım: tahmin + ışığı kes + zamanı başlat
  await git(0);
  kontrol(await page.evaluate(() => !!document.querySelector(".d-tam canvas.d-3b")), "tam ekran 3B dünya kurulu");
  kontrol(await igneVar(page, "Güneş") && await igneVar(page, "Etçil (tilki)"), "1. adım: çayırda güneş, ot, tavşan, tilki iğneleri");
  await dugme(page, "Otlar");
  await kaydir(page, 0, 0);
  await dugme(page, "Zamanı başlat");
  await gorevBekle(page);
  kontrol(await gorevTamamMi(page), "1. adım: güneş kesilince zincirin çöküşü izleniyor");
  kontrol(await igneVar(page, "ışık %0"), "1. adım: güneş iğnesi ışığın kesildiğini gösteriyor");
  kontrol((await metin(page, ".bio-akis")).includes("✕"), "1. adım: enerji şemasında akış kesildi (✕)");
  await ekranGoruntusu("ozel-01-zincir");

  // 2. adım: üç iş, arada pil doldurma
  await git(1);
  await bekle(1200);
  kontrol(await perdeAcik(page), "2. adım: ortam geçişi karartması açıldı");
  kontrol(await igneVar(page, "Adenin") && await igneVar(page, "Riboz") && await igneVar(page, "Fosfat γ"), "2. adım: ATP molekülünde adenin, riboz, fosfat iğneleri");
  await dugme(page, "Kas kasılması"); await bekle(400);
  await dugme(page, "Aktif taşıma"); await bekle(400);
  await dugme(page, "Protein sentezi"); await bekle(200);
  kontrol(!(await gorevTamamMi(page)), "2. adım: pil boşken protein sentezi yapılamıyor");
  await dugme(page, "pili doldur"); await bekle(600);
  await dugme(page, "Protein sentezi"); await bekle(900);
  kontrol(await gorevTamamMi(page), "2. adım: üç iş tamamlanıyor");
  await ekranGoruntusu("ozel-02-atp");

  // 3. adım: doğru/yanlış sınıflandırma (önce bir yanlış deneme)
  await git(2);
  await yerlestir(page, [["ATP, vücutta", "d"]]);
  kontrol(await page.evaluate(() => document.querySelector(".bio-nedenler li") !== null), "3. adım: yanlış kartın nedeni gösteriliyor");
  await yerlestir(page, [["ATP, bütün", "d"], ["ATP, vücutta", "y"], ["Bitki hücreleri", "y"], ["Uyurken", "d"], ["Yalnızca hareket", "y"], ["Besinlerdeki", "d"], ["Güneş enerjisi", "d"], ["ATP'nin son", "y"]]);
  kontrol(await gorevTamamMi(page), "3. adım: sınıflandırma tamamlanıyor");
  await ekranGoruntusu("ozel-03-iddialar");

  // 4. adım: kloroplast modeli
  await git(3);
  kontrol(await igneVar(page, "Tilakoit") && await igneVar(page, "Stroma"), "4. adım: kloroplast iğneleri");
  await page.evaluate(() => [...document.querySelectorAll(".d-igne")].find((e) => e.textContent.includes("Tilakoit"))?.querySelector("span")?.click());
  await bekle(200);
  kontrol((await metin(page, ".bio-bilgi-kutu")).includes("granum"), "4. adım: tilakoit iğnesine dokununca açıklama geliyor");
  await yerlestir(page, [["Işığın", "t"], ["Suyun", "t"], ["O₂'nin", "t"], ["Elektron", "t"], ["ATP ve NADPH üretimi", "t"], ["CO₂'nin", "s"], ["ATP ve NADPH'nin", "s"], ["Glikoz", "s"]]);
  kontrol(await gorevTamamMi(page), "4. adım: kloroplast modeli kuruluyor");
  await ekranGoruntusu("ozel-04-kloroplast");

  // 5. adım: Engelmann + yeşil ışık
  await git(4);
  kontrol(await igneVar(page, "Prizma") && await igneVar(page, "Aerobik bakteriler"), "5. adım: Engelmann düzeneği (prizma, alg, bakteri) iğneleri");
  await dugme(page, "Mavi-mor ve kırmızı");
  await dugme(page, "Engelmann");
  await bekle(7800);
  await kaydir(page, 0, 545);
  await bekle(200);
  kontrol(await gorevTamamMi(page), "5. adım: Engelmann deneyi ve yeşil ışık bulunuyor");
  kontrol(await igneVar(page, "545 nm"), "5. adım: lamdaki dalga boyu imleci kaydırıcıyı izliyor");
  await ekranGoruntusu("ozel-05-engelmann");

  // 6. adım: izotop (iki madde) + ışığı kapat
  await git(5);
  await dugme(page, "Sudan");
  await dugme(page, "Suyu işaretle"); await bekle(2200);
  await dugme(page, "CO₂'yi işaretle"); await bekle(2200);
  await dugme(page, "Işık: AÇIK"); await bekle(6000);
  kontrol(await gorevTamamMi(page), "6. adım: izotop deneyleri ve karanlık testi");
  await ekranGoruntusu("ozel-06-kanit");

  // 7. adım: fanus
  await git(6);
  kontrol(await igneVar(page, "Mum") && await igneVar(page, "Nane"), "7. adım: fanusta mum ve nane");
  await dugme(page, "Mumu yak"); await bekle(700);
  await ekranGoruntusu("ozel-07a-mum-yaniyor");
  await bekle(1900);
  kontrol(await igneVar(page, "O₂ %16"), "7. adım: fanus iğnesi O₂'nin %16'ya düştüğünü gösteriyor");
  await dugme(page, "Karanlık"); await dugme(page, "1 gün bekle"); await dugme(page, "Mumu yak"); await bekle(300);
  await dugme(page, "Işıklı"); await dugme(page, "1 gün bekle"); await dugme(page, "1 gün bekle"); await dugme(page, "Mumu yak"); await bekle(2600);
  kontrol(await gorevTamamMi(page), "7. adım: mum ışıkta yeniden yanıyor, karanlıkta yanmıyor");
  await ekranGoruntusu("ozel-07-fanus");

  // 8. adım: kabarcık deneyi (lamba uzaklığı)
  await git(7);
  await dugme(page, "Dakikadaki kabarcık");
  await dugme(page, "Lamba uzaklığı");
  for (const d of [10, 15, 20, 30, 40]) {
    await kaydir(page, 0, d);
    await dugme(page, "1 dakika say");
    if (d === 10) { await bekle(1800); await ekranGoruntusu("ozel-08a-kabarciklar"); await bekle(1600); } else await bekle(3400);
  }
  kontrol(await igneVar(page, "Lamba · 40 cm"), "8. adım: lamba 3B sahnede 40 cm'ye taşındı");
  kontrol(await gorevTamamMi(page), "8. adım: 5 farklı uzaklıkta ölçüm yapılıyor");
  const satir = await page.evaluate(() => document.querySelectorAll(".d-tablo tbody tr").length);
  kontrol(satir === 5, `8. adım: tabloda 5 ölçüm var (${satir})`);
  await ekranGoruntusu("ozel-08-kabarcik");

  // 9. adım: dört sera
  await git(8);
  for (const [sera, cevap] of [["A)", "Işığı artırmak"], ["B)", "CO₂ vermek"], ["C)", "Sıcaklığı optimuma"], ["D)", "Sıcaklığı optimuma"]]) {
    await dugme(page, sera); await dugme(page, cevap); await bekle(100);
  }
  kontrol(await gorevTamamMi(page), "9. adım: dört sera teşhisi doğru");
  kontrol(await igneVar(page, "Temmuz") && await igneVar(page, "42 °C"), "9. adım: sera iğneleri seçili senaryoyu gösteriyor");
  await ekranGoruntusu("ozel-09-sera");

  // 10. adım: sınav tam puan
  await git(9);
  kontrol(await page.evaluate(() => !document.querySelector(".d-sinav").textContent.includes("null")), "10. adım: sınav kartında 'null' metni yok");
  const puan = await sinaviCoz(page, bekle, [3, 1, 1, 1, "25", 1, 1, 1, "30"]);
  kontrol(puan === "9 / 9", `10. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "10. adım: sınav görevi tamamlanıyor");

  await telefon(page, adimaGit, bekle, ekranGoruntusu, [0, 3, 7, 8]);
};
