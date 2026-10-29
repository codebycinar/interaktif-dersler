// Adım adım anlatım kareleri (rehber 4·0): her adımda önce gösterim, arada mini sorular.
import { kare, soru, cozum } from "../../tarih/ortak/anlat.js";
import { TURKIYE_KUTU, BARAJ, ORNEKLER } from "./veri.js";
import { YEREL, yerelMaket, gemileriDurdur } from "./maket.js";

const TUZ = [33.3, 38.7], BOGAZ = [29.08, 41.12], RIZE = [40.52, 41.02];
const TUZ_KIYI = [33.17, 38.72]; // etiket göl kıyısının batısına yazılır
const TUZ_K = [[32.4, 37.95], [34.3, 39.45]];

export const ANLAT = [
  /* 1 · yedi soru */
  [
    kare("Coğrafyacı bir yere bakınca hep aynı soruları sorar. İlk ikisi: <b>ne</b> ve <b>nerede</b>.", { kutu: TURKIYE_KUTU, yerler: [{ konum: TUZ }, { konum: BOGAZ }, { konum: RIZE }] }),
    kare("Tuz Gölü <b>ne</b>? Türkiye'nin en büyük ikinci gölü; çok sığ ve çok tuzlu.", { kutu: TUZ_K, yerler: [{ konum: TUZ, ad: "Tuz Gölü", etiket: TUZ_KIYI }] }),
    kare("<b>Nerede?</b> İç Anadolu'da; Ankara, Konya ve Aksaray sınırlarının buluştuğu bir çanakta.", { kutu: [[31.8, 37.5], [34.8, 40.3]], yerler: [{ konum: [32.85, 39.93], ad: "Ankara" }, { konum: [32.48, 37.87], ad: "Konya" }, { konum: [34.03, 38.37], ad: "Aksaray" }] }),
    kare("<b>Ne zaman?</b> Yaz sonunda su buharlaşır, göl beyaz bir tuz tabakasıyla kaplanır."),
    soru("“Göl yaz sonunda büyük ölçüde kurur.” Bu bilgi hangi soruya cevaptır?", ["Nerede?", "Ne zaman?", "Neden önemli?"], 1, "Bilgi, olayın zamanını (yaz sonu) anlatıyor.", "Bilgide bir mevsim geçiyor mu?"),
    kare("<b>Neden orada?</b> Akarsular denize ulaşamaz; su yalnızca buharlaşarak gider, tuz geride kalır."),
    kare("<b>Neden önemli?</b> Türkiye'nin tuzunun önemli bir kısmı buradan çıkar; flamingolar burada ürer."),
    kare("Son iki soru: <b>Ortamın özellikleri neler?</b> ve <b>Doğal ve beşerî ortamla ilişkisi ne?</b>"),
    soru("“Kıyıdaki tuzlalar, tarlalar ve kuş gözlemcileri gölle bağlantılıdır.” Bu hangi sorunun cevabı?", ["Ortamın özellikleri neler?", "Doğal ve beşerî ortamla ilişkisi?", "Ne?"], 1, "Göl ile insan faaliyetleri arasındaki bağları anlatıyor.", "Bilgi gölü başka şeylere mi bağlıyor?"),
    kare("Şimdi bir örnek seç ve yedi bilgiyi doğru soruyla eşleştir."),
  ],
  /* 2 · mutlak konum */
  [
    kare("Bir yerin <b>mutlak konumu</b>, enlem ve boylamla verilen kesin adresidir.", { kutu: TURKIYE_KUTU }),
    kare("<b>Enlem</b> Ekvator'dan kuzeye ya da güneye uzaklıktır. Türkiye yaklaşık 36° ile 42° kuzey arasındadır.", { oklar: [{ yol: [[27, 36], [27, 42]], renk: "mavi" }] }),
    kare("<b>Boylam</b> başlangıç meridyeninden doğuya ya da batıya uzaklıktır. Türkiye 26° ile 45° doğu arasındadır.", { oklar: [{ yol: [[26, 37], [45, 37]], renk: "mavi" }] }),
    soru("38,7° K · 33,3° D koordinatı hangisine yakındır?", ["Tuz Gölü", "İstanbul Boğazı", "Rize"], 0, "Tuz Gölü İç Anadolu'da, yaklaşık 38,7° kuzey enlemi ve 33,3° doğu boylamındadır.", "33° doğu Türkiye'nin ortasına yakındır."),
    kare("Dünya 24 saatte 360° döner. Bir saatte 15°, yani her <b>1° boylam için 4 dakika</b>.", { yerler: [{ konum: [26, 39.5], ad: "26° D" }, { konum: [45, 39.5], ad: "45° D" }] }),
    cozum(["Doğu ucu: 45° · Batı ucu: 26°", "Boylam farkı: 45 − 26 = 19°", "Her derece: 4 dakika", "19 × 4 = 76 dakika"], "Çözümlü örnek: yerel saat farkı"),
    soru("İki şehir arasında 10° boylam farkı varsa yerel saat farkı kaç dakikadır?", ["10 dakika", "40 dakika", "150 dakika"], 1, "10 × 4 = 40 dakika.", "Her derece 4 dakikadır."),
    kare("Güneş önce doğuda doğar. Bu yüzden doğudaki yerin yerel saati <b>ileridedir</b>."),
    kare("Şimdi koordinatı verilen yerleri haritada bul ve saat farkını hesapla."),
  ],
  /* 3 · göreceli konum, ölçek */
  [
    kare("<b>Göreceli konum</b>, bir yerin başka yerlere göre durumudur: “Ankara'nın güneyinde” gibi.", { kutu: [[31.8, 37.5], [34.8, 40.3]], yerler: [{ konum: TUZ, ad: "Tuz Gölü", etiket: TUZ_KIYI }, { konum: [32.85, 39.93], ad: "Ankara" }], oklar: [{ yol: [[32.85, 39.93], [33.25, 38.95]], renk: "mavi" }] }),
    kare("Yönü bulmak için referans yerden örneğe bak. Ok Ankara'dan aşağı iniyor: göl Ankara'nın <b>güneyinde</b>."),
    soru("Tuz Gölü Aksaray'a göre hangi yöndedir?", ["Kuzeybatı", "Güneydoğu", "Doğu"], 0, "Aksaray'dan göle bakınca yukarı (kuzey) ve sola (batı) gideriz.", "Haritada kuzey yukarıda, batı soldadır."),
    kare("<b>Ölçek</b> değişince aynı yer farklı görünür. Geniş alanda Boğaz, Avrupa ile Asya arasında Karadeniz'i Marmara'ya bağlayan dar bir geçittir.", {
      kutu: [[27.9, 40.55], [30.1, 41.6]], zemin: { ozellikler: YEREL.bogaz },
      oklar: [{ yol: [[29.55, 41.42], [29.32, 41.3], [29.13, 41.18]], renk: "sari" }],
      yazilar: [{ konum: [29.62, 41.45], ad: "İstanbul Boğazı", sinif: "vurgu" }, { konum: [28.35, 41.3], ad: "Avrupa" }, { konum: [29.75, 40.85], ad: "Asya" },
        { konum: [29.2, 41.5], ad: "Karadeniz", sinif: "deniz" }, { konum: [28.6, 40.78], ad: "Marmara Denizi", sinif: "deniz" }],
    }),
    kare("Yerel ölçekte ise şehrin ortasından geçen, köprülerle aşılan bir su yoludur.", {
      kutu: [[28.82, 40.96], [29.3, 41.26]], zemin: { ozellikler: YEREL.bogaz },
      yap: (api, ctx) => yerelMaket(ctx.sahne, ORNEKLER.find((o) => o.id === "bogaz"), "anlat"),
      yazilar: [{ konum: [28.9, 41.18], ad: "Avrupa yakası" }, { konum: [29.2, 41.03], ad: "Asya yakası" }],
    }),
    kare("Haritada <b>katmanlar</b> vardır: ızgara, sınırlar, şehirler, ulaşım. Gerekeni açıp gereksizi kapatırız.", { kutu: TURKIYE_KUTU, yap: () => gemileriDurdur() }),
    soru("Bir boğazın iki kıtayı ayırdığını görmek için hangi ölçek daha uygundur?", ["Yerel ölçek", "Dünya ölçeği"], 1, "Kıtaları aynı anda görebilmek için geniş bir alanı, yani küçük ölçeği görmek gerekir.", "Kıtalar çok büyük alanlardır."),
    kare("Şimdi üç ölçeğe de bak ve göreceli konum sorularını cevapla."),
  ],
  /* 4 · koşullar */
  [
    kare("Bir yerin koşulları ikiye ayrılır. İnsandan bağımsız olanlar <b>doğal</b> koşullardır: iklim, yer şekli, su, toprak.", { kutu: TUZ_K }),
    kare("İnsanın oluşturduğu koşullar <b>beşerî</b> koşullardır: nüfus, yerleşme, tarım, sanayi, ulaşım."),
    cozum(["Koşul: “Kıyıda tuzlalar var.”", "Tuzlayı kim kurdu? İnsan.", "İnsan faaliyeti → beşerî", "Kutu: beşerî koşul"], "Çözümlü örnek"),
    soru("“Göl, akarsuların denize ulaşamadığı kapalı bir havzadadır.” Bu koşul nedir?", ["Doğal", "Beşerî"], 0, "Havzanın kapalı olması yer şekilleriyle ilgilidir; insan yapmamıştır.", "Bu durumu insan mı oluşturdu?"),
    kare("Birazdan göreceğin iklim grafiğinde <b>sütunlar</b> aylık yağışı, <b>çizgi</b> aylık ortalama sıcaklığı gösterir."),
    cozum(["Ayların yağışlarını oku", "Konya: 37 + 28 + 29 + … + 43", "Toplam ≈ 321 mm", "Yıllık yağış: on iki ayın toplamı"], "Grafikten yıllık yağış"),
    soru("Rize'de yıllık yağış yaklaşık 2300 mm, Konya'da 320 mm. Rize kaç kat fazla yağış alır?", ["Yaklaşık 2 kat", "Yaklaşık 7 kat", "Yaklaşık 20 kat"], 1, "2300 ÷ 320 ≈ 7.", "2300'ü 320'ye böl."),
    kare("Şimdi örneğinin koşullarını ayır ve grafikten yıllık yağışı bul."),
  ],
  /* 5 · yakın ve uzak çevre */
  [
    kare("Hiçbir yer yalnız değildir. Bir mekân çevresindeki yerlerle mal, insan ve su alışverişi yapar.", { kutu: TURKIYE_KUTU }),
    kare("Bu derste örneğe <b>100 km</b>'den yakın yerleri <b>yakın çevre</b> sayıyoruz.", { kutu: [[31.4, 37.4], [35.2, 40.2]], yerler: [{ konum: TUZ, ad: "Tuz Gölü", etiket: TUZ_KIYI }, { konum: [33.54, 38.94], ad: "Şereflikoçhisar" }] }),
    kare("Gölden çıkan tuz İstanbul'daki marketlere ulaşır. Bu <b>uzak çevre</b> ile bir ilişkidir.", { kutu: [[27, 37], [35, 42]], oklar: [{ yol: [TUZ, [31, 40.2], [28.98, 41.01]] }], yerler: [{ konum: [28.98, 41.01], ad: "İstanbul" }] }),
    soru("Rize'deki çayın Ankara'daki marketlere ulaşması hangi ilişkidir?", ["Yakın çevre", "Uzak çevre"], 1, "Rize ile Ankara arası 100 km'den çok uzaktır.", "İki şehir arası kaç km olabilir?"),
    kare("İlişki yalnızca ticaret değildir: işçi göçü, turizm ve su kullanımı da birer ilişkidir.", { kutu: [[38.5, 39.8], [46, 42.6]], oklar: [{ yol: [[44.79, 41.72], [42.5, 41.5], RIZE], renk: "mavi" }], yerler: [{ konum: [44.79, 41.72], ad: "Tiflis" }] }),
    soru("Cihanbeyli'de tarlaları sulamak için çekilen yeraltı suyu gölü etkiler. Bu hangi ilişkidir?", ["Yakın çevre", "Uzak çevre"], 0, "Cihanbeyli göle 30 km’den yakındır.", "Cihanbeyli gölün hemen batısındadır."),
    kare("Şimdi dört ilişkiyi yakın ve uzak çevre diye ayır."),
  ],
  /* 6 · etki ağı */
  [
    kare("Bir mekânda bir şey değişince etkisi zincir gibi çevreye yayılır. Buna <b>etki ağı</b> diyoruz.", { kutu: TUZ_K }),
    kare("Örnek değişim: Göle gelen su <b>azalıyor</b>. Kuraklık ve aşırı yeraltı suyu kullanımı yüzünden."),
    cozum(["Değişim: su azalır", "Göl yüzeyi → azalır", "Suyun tuzluluk oranı → artar", "Flamingoların sulak alanı → azalır"], "Çözümlü örnek: okların yönü"),
    soru("Göl kurudukça rüzgârla taşınan tuzlu toz ne olur?", ["Artar", "Azalır"], 0, "Kuruyan göl tabanı açığa çıkar; rüzgâr bu tuzlu tozu tarlalara taşır.", "Açıkta kalan kuru taban artarsa…"),
    kare("Etkiler birbirini de etkiler: Flamingo azalınca kuş gözlemine gelen ziyaretçi de azalır."),
    kare("Rize'de yamaç ormanları açılırsa yağmur suyu toprağa daha az sızar, heyelan riski artar.", { kutu: [[39.75, 40.6], [41.5, 41.5]], yerler: [{ konum: RIZE, ad: "Rize" }] }),
    soru("Ormanlar açılınca sellerde derelere taşınan toprak ne olur?", ["Artar", "Azalır"], 0, "Ağaç kökleri toprağı tutar; kökler gidince toprak kolayca taşınır.", "Toprağı ne tutuyordu?"),
    kare("Şimdi örneğinde her öğe için değişimin yönünü seç."),
  ],
  /* 7 · Atatürk Barajı */
  [
    kare("Yeni bir örnek: Fırat üzerindeki <b>Atatürk Barajı</b>. Dört basamakla bakacağız.", { kutu: BARAJ.kutu, yerler: [{ konum: BARAJ.konum, ad: "Atatürk Barajı" }] }),
    kare("1. <b>Konum</b>: Adıyaman ile Şanlıurfa arasında, yaklaşık 37,5° K · 38,3° D.", { yerler: [{ konum: [38.28, 37.76], ad: "Adıyaman" }, { konum: [38.79, 37.16], ad: "Şanlıurfa" }] }),
    kare("2. <b>Koşullar</b>: Yazlar çok sıcak ve kurak. Fırat ilkbaharda kar erimesiyle bol su taşır."),
    soru("“Şanlıurfa Tünelleri suyu Harran Ovası'na ulaştırır.” Bu hangi basamaktadır?", ["Konum", "Koşullar", "İlişkiler"], 2, "Baraj ile ova arasındaki su bağlantısını anlatıyor.", "Bilgi iki yeri birbirine bağlıyor mu?"),
    kare("3. <b>İlişkiler</b>: Su tünellerle ovaya, elektrik ulusal ağla uzak şehirlere gider.", { oklar: [{ yol: BARAJ.tunel, renk: "mavi" }], yerler: [{ konum: [39.03, 36.86], ad: "Harran Ovası" }] }),
    kare("4. <b>Etki</b>: Samsat baraj gölünün altında kaldı ve yeni yerine taşındı. Harran'da pamuk üretimi arttı.", { yerler: [{ konum: [38.48, 37.58], ad: "Samsat (yeni yeri)" }] }),
    soru("Rapor yazarken hangi sıra en uygundur?", ["Etki → konum → ilişki → koşul", "Konum → koşullar → ilişkiler → etki", "Sıra önemli değil"], 1, "Önce yeri tanıtır, sonra koşulları, çevreyle ilişkileri ve en sonda etkileri anlatırız.", "Okuyucu önce neyi bilmeli?"),
    kare("Şimdi sekiz bilgiyi dört basamağa yerleştir ve kendi örneğin için kısa raporunu yaz."),
  ],
  /* 8 · değerlendirme */
  [
    kare("Bu derste bir yere coğrafyacı gözüyle bakmayı öğrendik.", { kutu: TURKIYE_KUTU }),
    kare("Yedi soru sorduk; mutlak ve göreceli konumu bulduk; ölçeği değiştirdik."),
    kare("Koşulları doğal ve beşerî diye ayırdık; yakın ve uzak çevreyle ilişkileri gördük."),
    soru("Her 1° boylam farkı kaç dakikalık yerel saat farkı yapar?", ["1 dakika", "4 dakika", "15 dakika"], 1, "360° 24 saatte döner: 1440 ÷ 360 = 4 dakika.", "24 saat kaç dakikadır?"),
    kare("Son olarak bir değişimin çevreye nasıl yayıldığını etki ağıyla düşündük."),
    kare("Şimdi sekiz soruluk değerlendirmeyi çöz. Dersi tamamlamak için en az altı doğru gerekir."),
  ],
];
