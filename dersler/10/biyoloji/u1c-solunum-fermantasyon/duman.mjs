// Derse özel duman senaryosu (tools/duman.mjs çalıştırır): görevleri gerçekten yapıp tamamlandığını doğrular
import { gorevTamamMi, kaydir, dugme, yerlestir, sinaviCoz, telefon, anlatKaresi } from "../ortak/duman-yardim.mjs";

const P = ".d-panel";
const sayiYaz = (page, v) => page.evaluate((x) => {
  const g = document.querySelector(".d-panel .d-girdi input");
  g.value = x;
  [...g.parentElement.querySelectorAll("button")].find((b) => b.textContent === "Kontrol et").click();
}, v);
const dugmeHazir = (page, metin, ms = 25000) => page.waitForFunction((m) =>
  [...document.querySelectorAll(".d-panel button")].some((b) => b.textContent.includes(m) && !b.disabled), { timeout: ms }, metin).catch(() => {});

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: dört basamak + CO₂ sayısı
  await adimaGit(0);
  await dugme(page, "▶ Glikoliz", P); await bekle(1500);
  await dugme(page, "▶ Piruvatın oksidasyonu", P); await bekle(1500);
  await dugme(page, "▶ Krebs döngüsü", P); await bekle(1500);
  await ekranGoruntusu("ozel-01-krebs");
  await sayiYaz(page, "4");
  kontrol(!(await gorevTamamMi(page)), "1. adım: yanlış CO₂ sayısı kabul edilmiyor");
  await dugme(page, "▶ Elektron taşıma sistemi", P); await bekle(1500);
  await sayiYaz(page, "6");
  kontrol(await gorevTamamMi(page), "1. adım: dört basamak ve 6 CO₂ ile görev tamamlanıyor");
  await ekranGoruntusu("ozel-01-ets");

  // 2. adım: sıralama + iki kanıt
  await adimaGit(1);
  for (let tur = 0; tur < 30; tur++) {
    const bitti = await page.evaluate(() => {
      const o = [...document.querySelectorAll(".bio-sira-oge")];
      const i = o.findIndex((e, k) => k > 0 && +e.dataset.oge < +o[k - 1].dataset.oge);
      if (i < 0) return true;
      o[i].querySelector("button[aria-label='Yukarı taşı']").click();
      return false;
    });
    if (bitti) break;
  }
  await dugme(page, "Sırayı kontrol et", P);
  kontrol(!(await gorevTamamMi(page)), "2. adım: kanıtlar cevaplanmadan görev tamamlanmıyor");
  await dugme(page, "Glikoliz sitoplazmada olur", P);
  await dugme(page, "ETS durunca", P);
  kontrol(await gorevTamamMi(page), "2. adım: sıralama ve kanıtlar tamamlanıyor");
  await dugme(page, "O₂'yi kes", P); await bekle(500);
  await ekranGoruntusu("ozel-02-o2-yok");

  // 3. adım: besinlerin giriş kapıları
  await adimaGit(2);
  await yerlestir(page, [["Glikoz", "glikoliz"], ["Nişasta", "glikoliz"], ["Glikojen", "glikoliz"], ["Gliserol", "ara"], ["Yağ asidi", "asetil"], ["Amino asit", "cok"]]);
  kontrol(await gorevTamamMi(page), "3. adım: altı besin doğru kapıda");
  await ekranGoruntusu("ozel-03-kapilar");

  // 4. adım: ızgara + benzerlik/farklılık
  await adimaGit(3);
  await page.evaluate(() => {
    const dogru = [[0, 0, 1, 0, 0], [1, 0, 1, 1, 1], [2, 0, 0, 0, 2]];
    [...document.querySelectorAll(".bio-izgara select")].forEach((s, i) => { s.value = String(dogru[Math.floor(i / 5)][i % 5]); s.dispatchEvent(new Event("change")); });
    [...document.querySelectorAll(".bio-sinif button")].find((b) => b.textContent.includes("Izgarayı")).click();
  });
  kontrol(!(await gorevTamamMi(page)), "4. adım: liste yapılmadan görev tamamlanmıyor");
  await yerlestir(page, [["Üçünün de karbonları", "b"], ["Üçünden elde", "b"], ["Üçü de Krebs", "b"], ["Yalnızca proteinlerden", "f"], ["Yağlar gram", "f"], ["Yağ asitleri glikoliz", "f"]]);
  kontrol(await gorevTamamMi(page), "4. adım: ızgara ve liste tamamlanıyor");
  await ekranGoruntusu("ozel-04-izgara");

  // 5. adım: iki koşu + fermantasyon ATP'si
  await adimaGit(4);
  await kaydir(page, 0, 60);
  await dugme(page, "60 saniye koş", P); await bekle(500); await dugmeHazir(page, "60 saniye koş");
  await kaydir(page, 0, 180);
  await dugme(page, "60 saniye koş", P); await bekle(500); await dugmeHazir(page, "60 saniye koş");
  kontrol(!(await gorevTamamMi(page)), "5. adım: ATP sorusu cevaplanmadan görev tamamlanmıyor");
  await sayiYaz(page, "2");
  kontrol(await gorevTamamMi(page), "5. adım: iki koşu ve net 2 ATP");
  const satir = await page.evaluate(() => document.querySelectorAll(".d-tablo tbody tr").length);
  kontrol(satir === 2, `5. adım: tabloda iki koşu var (${satir})`);
  await ekranGoruntusu("ozel-05-kas");

  // 6. adım: maya deneyi (önce geçersiz tasarım)
  await adimaGit(5);
  const ayarla = (degerler) => page.evaluate((d) => {
    for (const [i, ad, v] of d) { const s = document.querySelector(`select[data-sise="${i}"][data-d="${ad}"]`); s.value = String(v); s.dispatchEvent(new Event("change")); }
  }, degerler);
  await ayarla([[0, "T", 20], [0, "seker", 5]]);
  await dugme(page, "Tasarımı onayla", P);
  kontrol(await page.evaluate(() => document.querySelector(".d-panel .d-geri-bildirim.yanlis")?.textContent.includes("Birden çok")), "6. adım: iki değişkenli tasarım reddediliyor");
  await ayarla([[0, "seker", 10], [0, "T", 5], [1, "T", 20], [2, "T", 35], [3, "T", 50]]);
  await dugme(page, "Tasarımı onayla", P);
  await dugme(page, "Deneyi başlat", P);
  await bekle(4000);
  await ekranGoruntusu("ozel-06a-deney");
  await page.waitForFunction(() => [...document.querySelectorAll(".d-panel button")].some((b) => b.textContent === "Şişe 3"), { timeout: 30000 }).catch(() => {});
  await dugme(page, "CO₂; maya şekeri etil alkol", P);
  await dugme(page, "Şişe 3", P);
  kontrol(await gorevTamamMi(page), "6. adım: geçerli tasarım, deney ve analiz tamamlanıyor");
  await ekranGoruntusu("ozel-06-maya");

  // 7. adım: mutfakta fermantasyon
  await adimaGit(6);
  await yerlestir(page, [["Yoğurt", "laktik"], ["Peynir", "laktik"], ["Turşu", "laktik"], ["Şalgam", "laktik"], ["Ekmek", "alkol"], ["Kefir", "ikisi"], ["Boza", "ikisi"]]);
  await dugme(page, "Fırında pişerken", P);
  kontrol(await gorevTamamMi(page), "7. adım: ürünler ve ekmek sorusu tamamlanıyor");
  await ekranGoruntusu("ozel-07-mutfak");

  // 8. adım: enerji bütçesi (önce dengesiz menü)
  await adimaGit(7);
  await dugme(page, "Gazlı içecek", P); await dugme(page, "Menüyü tabloya kaydet", P);
  kontrol(!(await gorevTamamMi(page)), "8. adım: dengesiz menü kabul edilmiyor");
  await dugme(page, "Tabağı boşalt", P);
  for (const [ad, n] of [["Ekmek (2 dilim)", 4], ["Mercimek", 1], ["Pilav", 1], ["Kuru fasulye", 1], ["Yoğurt", 1], ["Izgara tavuk", 1], ["Elma", 2], ["Beyaz peynir", 1], ["Haşlanmış yumurta", 1], ["Ceviz", 1]]) {
    for (let i = 0; i < n; i++) await dugme(page, ad, P);
  }
  await dugme(page, "Menüyü tabloya kaydet", P);
  kontrol(await gorevTamamMi(page), "8. adım: dengeli menü kaydediliyor");
  await bekle(300);
  await ekranGoruntusu("ozel-08-butce");

  // 9. adım: ATP harcayan olaylar
  await adimaGit(8);
  await yerlestir(page, [["Kas hücresinin", "e"], ["Ribozomda", "e"], ["Sinir hücresinde", "e"], ["Böbrekte", "e"], ["DNA'nın", "e"], ["O₂'nin alveolden", "h"], ["Suyun hücreye", "h"], ["CO₂'nin dokudan", "h"]]);
  await dugme(page, "Protein sentezi, onarım", P);
  kontrol(await gorevTamamMi(page), "9. adım: sınıflandırma ve beslenme sorusu tamamlanıyor");
  await ekranGoruntusu("ozel-09-atp");

  // 10. adım: sınav
  await adimaGit(9);
  kontrol(await page.evaluate(() => !document.querySelector(".d-sinav").textContent.includes("null")), "10. adım: sınav kartında 'null' metni yok");
  const puan = await sinaviCoz(page, bekle, [1, "6", 2, 1, 2, "35", 1, "470", 2]);
  kontrol(puan === "9 / 9", `10. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "10. adım: sınav görevi tamamlanıyor");

  // anlatım kareleri: sahne anlatılanı gösteriyor mu (iğne vurgusu, kamera, gösterim durumu)
  for (const [i, k] of [[0, 6], [2, 5], [4, 7], [5, 4], [7, 8], [8, 3]]) {
    await adimaGit(i);
    await anlatKaresi(page, bekle, k);
    if (i === 4) kontrol(await page.evaluate(() => document.querySelector(".d-uygulama-blok").hidden && !!document.querySelector(".d-igne.bio-vurgu")), "5. adım: anlatımda alıştırma gizli, laktik asit iğnesi vurgulu");
    await ekranGoruntusu(`anlat-${String(i + 1).padStart(2, "0")}-${k}`);
  }

  await telefon(page, adimaGit, bekle, ekranGoruntusu, [0, 4, 5, 7]);
};
