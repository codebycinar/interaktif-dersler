// Derse özel duman senaryosu: görevleri programla yapar ve tamamlandığını doğrular
import { ORNEKLER, BARAJ, YAKIN_SINIR } from "./veri.js";
import { mesafe } from "../../tarih/ortak/cografi.js";

const gorevTamamMi = (page) => page.evaluate(() => document.querySelector(".d-gorev")?.classList.contains("tamam"));
const tiklaSecici = (page, secici) => page.evaluate((s) => {
  const e = document.querySelector(s);
  if (!e) throw new Error(`Bulunamadı: ${s}`);
  e.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}, secici);
const metinliDugme = (page, metin) => page.evaluate((m) => {
  const b = [...document.querySelectorAll(".d-panel .d-btn")].find((x) => x.textContent.trim() === m);
  if (!b) throw new Error(`Düğme yok: ${m}`);
  b.click();
}, metin);
const yaz = (page, secici, metin) => page.evaluate((s, m) => {
  const t = document.querySelector(s);
  t.value = m;
  t.dispatchEvent(new Event("input"));
}, secici, metin);

/** Sınıflandırma destesini veri tablosuna göre çözer */
async function desteyiCoz(page, bekle, kutuBul, adet) {
  for (let i = 0; i < adet; i++) {
    const id = await page.evaluate(() => document.querySelector(".hrt-deste-kart")?.dataset.id);
    await tiklaSecici(page, `.hrt-kutu-dugmeleri [data-kutu="${kutuBul(id)}"]`);
    await bekle(40);
  }
}
const ornekBul = (id) => ORNEKLER.find((o) => o.id === id);
const sira = (id) => +id.split("-")[1];

export default async ({ page, adimaGit, bekle, kontrol, ekranGoruntusu }) => {
  // 1. adım: Tuz Gölü (varsayılan) için yedi soru, bir yanlış denemeyle
  await adimaGit(0);
  const ilk = await page.evaluate(() => document.querySelector(".hrt-deste-kart")?.dataset.id);
  await tiklaSecici(page, `.hrt-kutu-dugmeleri [data-kutu="${ilk === "ne" ? "nerede" : "ne"}"]`);
  kontrol(/Tekrar/.test((await page.evaluate(() => document.querySelector(".hrt-geri.yanlis")?.textContent)) || ""), "1. adım: yanlış soruda ipucu çıkıyor");
  await desteyiCoz(page, bekle, (id) => id, 7);
  kontrol(await gorevTamamMi(page), "1. adım: yedi bilgi doğru coğrafi soruyla eşleşiyor");
  await ekranGoruntusu("adim01-tamam");

  // 2. adım: koordinattan nokta bulma + yerel saat farkı
  await adimaGit(1);
  const tiklaNokta = (secici, dx = 0, dy = 0) => page.evaluate((s, dx, dy) => {
    const r = document.querySelector(s).getBoundingClientRect();
    document.querySelector(".hrt-harita svg").dispatchEvent(new MouseEvent("click", { clientX: r.left + r.width / 2 + dx, clientY: r.top + r.height / 2 + dy, bubbles: true }));
  }, secici, dx, dy);
  await tiklaNokta(`.cog-capa[data-i="0"]`, 120, 60);
  await bekle(60);
  kontrol(/daha/.test((await page.evaluate(() => document.querySelector(".d-panel .d-geri-bildirim.yanlis")?.textContent)) || ""), "2. adım: uzak dokunuşta yön ipucu veriliyor");
  for (const i of [0, 1, 2]) { await tiklaNokta(`.cog-capa[data-i="${i}"]`); await bekle(60); }
  const sayiGir = async (v) => {
    await page.evaluate((v) => { document.querySelector(".d-panel .d-girdi input").value = v; }, v);
    await page.evaluate(() => [...document.querySelectorAll(".d-panel .d-btn")].find((b) => b.textContent === "Kontrol et").click());
    await bekle(50);
  };
  await sayiGir("19");
  kontrol(!(await gorevTamamMi(page)), "2. adım: boylam farkı (19) dakika yerine kabul edilmiyor");
  await sayiGir("76");
  kontrol(await gorevTamamMi(page), "2. adım: üç nokta bulundu, 76 dk hesaplandı");
  await ekranGoruntusu("adim02-tamam");

  // 3. adım: üç ölçek + katmanlar + üç yön sorusu
  await adimaGit(2);
  const tuz = ornekBul("tuz");
  await metinliDugme(page, "Dağılış"); await bekle(60);
  await metinliDugme(page, "Dünya"); await bekle(150);
  await ekranGoruntusu("adim03-dunya");
  await metinliDugme(page, "Yerel"); await bekle(150);
  await metinliDugme(page, "Ulaşım"); await bekle(60);
  await ekranGoruntusu("adim03-yerel");
  await metinliDugme(page, "Bölge (Türkiye)"); await bekle(150);
  await metinliDugme(page, "Izgara"); await bekle(60);
  for (const s of tuz.goreceli) { await tiklaSecici(page, `.cog-pusula [data-yon="${s.yon}"]`); await bekle(1050); }
  kontrol(await gorevTamamMi(page), "3. adım: üç ölçek görüldü, üç göreceli konum doğru");
  await ekranGoruntusu("adim03-tamam");

  // 4. adım: Rize'ye geç; koşullar + iklim grafiği
  await adimaGit(3);
  await metinliDugme(page, "Rize'de çay tarımı"); await bekle(150);
  const rize = ornekBul("rize");
  await desteyiCoz(page, bekle, (id) => rize.kosullar[sira(id)].kutu, rize.kosullar.length);
  kontrol(!(await gorevTamamMi(page)), "4. adım: yağış sorusu cevaplanmadan görev bitmiyor");
  const toplamlar = ORNEKLER.map((o) => o.iklim.yagis.reduce((a, b) => a + b, 0)).sort((a, b) => a - b);
  const rizeToplam = rize.iklim.yagis.reduce((a, b) => a + b, 0);
  await tiklaSecici(page, `.d-panel .hrt-kart[data-i="${toplamlar.indexOf(rizeToplam)}"]`);
  kontrol(await gorevTamamMi(page), `4. adım: koşullar ayrıldı, yıllık yağış (${rizeToplam} mm) okundu`);
  await ekranGoruntusu("adim04-tamam");

  // 5. adım: İstanbul Boğazı; yakın/uzak çevre
  await adimaGit(4);
  await metinliDugme(page, "İstanbul Boğazı"); await bekle(150);
  const bogaz = ornekBul("bogaz");
  await ekranGoruntusu("adim05");
  await desteyiCoz(page, bekle, (id) => (mesafe(bogaz.konum, bogaz.iliskiler[sira(id)].konum) < YAKIN_SINIR ? "yakin" : "uzak"), bogaz.iliskiler.length);
  kontrol(await gorevTamamMi(page), "5. adım: dört ilişki yakın/uzak çevreye ayrıldı");
  kontrol((await page.evaluate(() => document.querySelectorAll('[data-katman="iliskiler"] .hrt-cizgi').length)) === 4, "5. adım: her ilişki haritada çizildi");
  await ekranGoruntusu("adim05-tamam");

  // 6. adım: Tuz Gölü etki ağı
  await adimaGit(5);
  await metinliDugme(page, "Tuz Gölü"); await bekle(150);
  await desteyiCoz(page, bekle, (id) => tuz.etki.ogeler[sira(id)].kutu, tuz.etki.ogeler.length);
  kontrol(await gorevTamamMi(page), "6. adım: etki ağındaki beş öğe doğru yönde");
  await ekranGoruntusu("adim06-tamam");

  // 7. adım: Atatürk Barajı + rapor
  await adimaGit(6);
  await desteyiCoz(page, bekle, (id) => BARAJ.ifadeler[sira(id)].kutu, BARAJ.ifadeler.length);
  await yaz(page, ".d-panel textarea", "Tuz Gölü kısa.");
  await bekle(50);
  kontrol(!(await gorevTamamMi(page)), "7. adım: kısa rapor kabul edilmiyor");
  await yaz(page, ".d-panel textarea", "Tuz Gölü İç Anadolu'da, Ankara'nın güneyinde kapalı bir havzadadır. Az yağış ve yüksek buharlaşma gölü tuzlu yapar. Kıyıdaki tuzlalar ve çevredeki tarlalarla ilişkilidir; su azalırsa flamingoların üreme alanı daralır.");
  await bekle(80);
  kontrol(await gorevTamamMi(page), "7. adım: sekiz bilgi yerleşti, rapor yazıldı");
  await ekranGoruntusu("adim07-tamam");

  // 8. adım: değerlendirme
  await adimaGit(7);
  for (const c of [1, 2, "76", 2, 1, 2, 3, 2]) {
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
  kontrol(puan === "8 / 8", `8. adım: sınav tam puan (${puan})`);
  kontrol(await gorevTamamMi(page), "8. adım: sınav görevi tamamlanıyor");

  // telefon genişliğinde birkaç adım (yeniden yüklemeden)
  await page.setViewport({ width: 390, height: 844 });
  for (const i of [0, 1, 2, 3, 4, 6]) { await adimaGit(i); await ekranGoruntusu(`telefon-adim${String(i + 1).padStart(2, "0")}`); }
  await page.setViewport({ width: 1408, height: 840 });
};
