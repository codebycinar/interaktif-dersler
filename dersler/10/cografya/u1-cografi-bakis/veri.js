// 10. Sınıf Coğrafya · 1. Ünite: Coğrafyanın Doğası — örnek olay verileri.
// Koordinatlar [boylam, enlem]. İklim değerleri yaklaşık uzun yıllar ortalamalarıdır (yuvarlatılmış).
// Göl çokgeni ve ulaşım çizgileri temsilîdir. tests/cog10-u1-cografi-bakis.test.mjs ile denetlenir.

export const TURKIYE_KUTU = [[25.6, 35.7], [44.9, 42.2]];
export const TURKIYE_BOYLAM = { bati: 26, dogu: 45 };
export const YAKIN_SINIR = 100; // km: bu derste “yakın çevre” sınırı

/** Yedi coğrafi soru (programdaki örnek sorular) */
export const SORULAR = [
  { id: "ne", ad: "Ne?" },
  { id: "nerede", ad: "Nerede?" },
  { id: "nezaman", ad: "Ne zaman?" },
  { id: "neden", ad: "Neden orada?" },
  { id: "onem", ad: "Neden önemli?" },
  { id: "ortam", ad: "Ortamın özellikleri neler?" },
  { id: "iliski", ad: "Doğal ve beşerî ortamla ilişkisi?" },
];

export const ORNEKLER = [
  {
    id: "tuz", ad: "Tuz Gölü", olgu: "Sığ ve çok tuzlu bir göl",
    konum: [33.3, 38.7], kenar: [33.17, 38.72], yerel: [[32.4, 37.95], [34.3, 39.45]],
    // temsilî göl kıyısı (gerçek kıyı mevsime göre çok değişir)
    gol: [[33.32, 39.11], [33.38, 39.07], [33.41, 39.0], [33.47, 38.95], [33.44, 38.88], [33.5, 38.83], [33.57, 38.78], [33.6, 38.7], [33.55, 38.64], [33.58, 38.57], [33.52, 38.5], [33.46, 38.44], [33.39, 38.41], [33.36, 38.46], [33.31, 38.52], [33.27, 38.6], [33.24, 38.68], [33.2, 38.75], [33.21, 38.83], [33.18, 38.9], [33.21, 38.98], [33.25, 39.05]],
    cevaplar: {
      ne: "Türkiye'nin en büyük ikinci gölü; çok sığ ve çok tuzlu.",
      nerede: "İç Anadolu'da; Ankara, Konya ve Aksaray il sınırlarının buluştuğu bir çanakta.",
      nezaman: "Yaz sonunda suyun büyük bölümü buharlaşır; göl yüzeyi beyaz bir tuz tabakasıyla kaplanır.",
      neden: "Akarsuların denize ulaşamadığı kapalı bir havzada: su yalnızca buharlaşarak gider, tuz geride kalır.",
      onem: "Türkiye'de üretilen tuzun önemli bir bölümü buradan çıkar; flamingoların önemli üreme alanlarındandır.",
      ortam: "Yazları sıcak ve kurak, yağış az, buharlaşma çok.",
      iliski: "Tuzlalar, çevre tarlalar için çekilen yeraltı suyu ve kuş gözlemcileri gölle bağlantılıdır.",
    },
    goreceli: [
      { sehir: "Ankara", konum: [32.85, 39.93], yon: "güney" },
      { sehir: "Aksaray", konum: [34.03, 38.37], yon: "kuzeybatı" },
      { sehir: "Konya", konum: [32.48, 37.87], yon: "kuzeydoğu" },
    ],
    kosullar: [
      { metin: "Yıllık yağış azdır, yazlar sıcak ve kuraktır.", kutu: "dogal" },
      { metin: "Göl, akarsuların denize ulaşamadığı kapalı bir havzadadır.", kutu: "dogal" },
      { metin: "Göl çok sığdır; yazın büyük bölümü kurur.", kutu: "dogal" },
      { metin: "Kıyıdaki tuzlalarda tuz üretilir ve işlenir.", kutu: "beseri" },
      { metin: "Çevredeki tarlalarda sulama için yeraltı suyu çekilir.", kutu: "beseri" },
      { metin: "Göl ve çevresi koruma altına alınmış bir alandır.", kutu: "beseri" },
    ],
    iklim: { istasyon: "Konya", sicaklik: [-0.2, 1.4, 5.6, 10.9, 15.7, 20.2, 23.6, 23.3, 18.8, 12.6, 6.0, 1.6], yagis: [37, 28, 29, 32, 41, 23, 7, 5, 12, 30, 34, 43] },
    iliskiler: [
      { yer: "Şereflikoçhisar", konum: [33.54, 38.94], metin: "Şereflikoçhisar kıyısındaki tuzlalar gölden tuz üretir." },
      { yer: "Cihanbeyli", konum: [32.93, 38.66], metin: "Cihanbeyli çevresindeki tarlalarda yeraltı suyuyla sulama yapılır; göle ulaşan su azalır." },
      { yer: "Ankara", konum: [32.85, 39.93], metin: "Ankara'dan gelen ziyaretçiler gölde gün batımını ve flamingoları izler." },
      { yer: "İstanbul", konum: [28.98, 41.01], metin: "Gölden çıkan sofra tuzu İstanbul'daki marketlerin raflarına ulaşır." },
    ],
    etki: {
      olay: "Göle gelen su azalırsa (kuraklık, aşırı yeraltı suyu kullanımı)…",
      ogeler: [
        { metin: "Göl yüzeyinin alanı", kutu: "azalir" },
        { metin: "Flamingoların yavrularını büyütebildiği sulak alan", kutu: "azalir" },
        { metin: "Kuruyan göl tabanından rüzgârla taşınan tuzlu toz", kutu: "artar" },
        { metin: "Göl suyunun tuzluluk oranı", kutu: "artar" },
        { metin: "Kuş gözlemi için gelen ziyaretçi sayısı", kutu: "azalir" },
      ],
      ornek: "2021 yazındaki kuraklıkta gölün kuruyan kesimlerinde çok sayıda flamingo yavrusunun öldüğü haberleri gündeme geldi.",
    },
    dagilis: [{ ad: "Acıgöl", konum: [29.85, 37.83] }, { ad: "Burdur Gölü", konum: [30.18, 37.73] }, { ad: "Seyfe Gölü", konum: [34.43, 39.2] }],
    ulasim: [[32.85, 39.93], [33.2, 39.35], [33.54, 38.94], [34.03, 38.37]],
  },
  {
    id: "bogaz", ad: "İstanbul Boğazı", olgu: "İki denizi bağlayan dar su yolu",
    konum: [29.08, 41.12], yerel: [[28.75, 40.93], [29.4, 41.3]],
    cevaplar: {
      ne: "Karadeniz'i Marmara Denizi'ne bağlayan, yaklaşık 30 km uzunluğunda dar bir su yolu.",
      nerede: "Asya ile Avrupa arasında, İstanbul şehrinin ortasında.",
      nezaman: "Gemi trafiği yıl boyu sürer; yoğun sisli günlerde geçişler yavaşlar ya da durdurulur.",
      neden: "Eski bir akarsu vadisinin deniz suları altında kalmasıyla oluştuğu düşünülür.",
      onem: "Karadeniz kıyısındaki ülkelerin Akdeniz'e ve açık denizlere çıkış kapısıdır.",
      ortam: "Yüzeyde Karadeniz'den Marmara'ya, derinde ise ters yönde akıntı vardır; kıvrımlı ve dardır.",
      iliski: "Köprüler ve tüneller iki yakayı bağlar; kıyılar yoğun yerleşim, ticaret ve turizm alanıdır.",
    },
    goreceli: [
      { sehir: "Bursa", konum: [29.06, 40.18], yon: "kuzey" },
      { sehir: "Edirne", konum: [26.56, 41.68], yon: "doğu" },
      { sehir: "İzmit", konum: [29.92, 40.77], yon: "kuzeybatı" },
    ],
    kosullar: [
      { metin: "Yüzeyde Karadeniz'den Marmara'ya doğru güçlü bir akıntı vardır.", kutu: "dogal" },
      { metin: "Boğaz dar ve kıvrımlıdır; en dar yeri 1 km'nin altındadır.", kutu: "dogal" },
      { metin: "İlkbaharda yoğun sis görülebilir.", kutu: "dogal" },
      { metin: "Her yıl on binlerce gemi Boğaz'dan geçer.", kutu: "beseri" },
      { metin: "İki yakayı köprüler, Marmaray ve Avrasya Tüneli bağlar.", kutu: "beseri" },
      { metin: "Kıyılar boyunca yalılar, iskeleler ve yoğun yerleşim vardır.", kutu: "beseri" },
    ],
    iklim: { istasyon: "İstanbul", sicaklik: [5.7, 5.9, 7.6, 11.6, 16.3, 21.0, 23.4, 23.5, 20.2, 15.8, 11.2, 7.8], yagis: [98, 75, 66, 45, 33, 35, 33, 41, 56, 89, 99, 121] },
    iliskiler: [
      { yer: "Üsküdar", konum: [29.02, 41.03], metin: "Üsküdar ile karşı yaka arasında her gün vapurlar ve Marmaray çalışır." },
      { yer: "Rumeli Feneri", konum: [29.1, 41.23], metin: "Karadeniz'den gelen az tuzlu yüzey suyu Boğaz'a buradan girer." },
      { yer: "Köstence", konum: [28.65, 44.17], metin: "Romanya'nın Köstence limanından çıkan gemiler Akdeniz'e Boğaz'dan geçerek ulaşır." },
      { yer: "Odessa", konum: [30.73, 46.48], metin: "Ukrayna limanlarından yüklenen tahıl, Boğaz üzerinden dünyaya taşınır." },
    ],
    etki: {
      olay: "Boğaz'dan geçen büyük tanker sayısı artarsa…",
      ogeler: [
        { metin: "Gemi kazası riski", kutu: "artar" },
        { metin: "Deniz kirliliği riski", kutu: "artar" },
        { metin: "Gemilerin Boğaz girişinde bekleme süresi", kutu: "artar" },
        { metin: "Balıkçı teknelerinin güvenle avlanabildiği alan", kutu: "azalir" },
        { metin: "Kıyıda yaşayanların kendini güvende hissetmesi", kutu: "azalir" },
      ],
      ornek: "1979'da Boğaz girişinde çarpışan Independenta tankeri günlerce yandı; kaza deniz ve hava kirliliğine yol açtı.",
    },
    dagilis: [{ ad: "Çanakkale Boğazı", konum: [26.4, 40.2] }],
    ulasim: [[28.95, 41.25], [29.11, 41.2], [29.3, 41.12]],
    kopruler: [{ ad: "15 Temmuz Şehitler Köprüsü", konum: [29.035, 41.045] }, { ad: "Fatih Sultan Mehmet Köprüsü", konum: [29.06, 41.09] }, { ad: "Yavuz Sultan Selim Köprüsü", konum: [29.11, 41.2] }],
  },
  {
    id: "rize", ad: "Rize'de çay tarımı", olgu: "Dik yamaçlarda çay bahçeleri",
    konum: [40.52, 41.02], yerel: [[39.75, 40.6], [41.5, 41.5]],
    cevaplar: {
      ne: "Türkiye'de çay tarımının en yoğun yapıldığı yerlerden biri.",
      nerede: "Doğu Karadeniz kıyısında; dağların denize paralel uzandığı dar bir kıyı şeridinde.",
      nezaman: "Çay yaprakları ilkbahar sonundan sonbahara kadar birkaç kez toplanır.",
      neden: "Yıl boyu yağışlı ve kışları ılık iklim ile asitli topraklar çayın istediği koşullardır.",
      onem: "Binlerce ailenin geçim kaynağıdır; ülkenin çay ihtiyacının büyük bölümü bu bölgeden karşılanır.",
      ortam: "Yıllık yağış Türkiye'nin en yükseklerindendir; yamaçlar çok dik ve ormanlıktır.",
      iliski: "Çay fabrikaları, kooperatifler, mevsimlik işçiler ve taşımacılık çayla bağlantılıdır.",
    },
    goreceli: [
      { sehir: "Trabzon", konum: [39.72, 41.0], yon: "doğu" },
      { sehir: "Artvin", konum: [41.82, 41.18], yon: "batı" },
      { sehir: "Gümüşhane", konum: [39.48, 40.46], yon: "kuzeydoğu" },
    ],
    kosullar: [
      { metin: "Yıl boyunca bol yağış alır.", kutu: "dogal" },
      { metin: "Kışlar ılık geçer, don olayı azdır.", kutu: "dogal" },
      { metin: "Dağlar kıyıya çok yakın, yamaçlar diktir.", kutu: "dogal" },
      { metin: "Çay bahçeleri küçük aile işletmeleridir.", kutu: "beseri" },
      { metin: "Toplanan yaş çay fabrikalarda işlenir.", kutu: "beseri" },
      { metin: "Kıyı boyunca uzanan yol, şehirleri birbirine bağlar.", kutu: "beseri" },
    ],
    iklim: { istasyon: "Rize", sicaklik: [6.8, 7.0, 8.7, 12.3, 16.2, 20.4, 23.1, 23.3, 20.2, 16.2, 11.9, 8.5], yagis: [225, 186, 163, 92, 96, 147, 148, 187, 262, 297, 255, 247] },
    iliskiler: [
      { yer: "Çayeli", konum: [40.73, 41.09], metin: "Çayeli'ndeki fabrikada yaş çay aynı gün işlenir." },
      { yer: "Pazar", konum: [40.85, 41.18], metin: "Pazar yakınında denize dolgu yapılarak bir havalimanı kuruldu." },
      { yer: "Ankara", konum: [32.85, 39.93], metin: "Paketlenen çay Ankara'daki marketlere kamyonlarla ulaşır." },
      { yer: "Tiflis", konum: [44.79, 41.72], metin: "Hasat döneminde Gürcistan'dan mevsimlik işçiler gelir." },
    ],
    etki: {
      olay: "Dik yamaçlardaki ormanlar çay bahçesi ve yapılaşma için açılırsa…",
      ogeler: [
        { metin: "Heyelan (toprak kayması) riski", kutu: "artar" },
        { metin: "Yağmur suyunun toprağa sızması", kutu: "azalir" },
        { metin: "Sellerde derelere taşınan toprak", kutu: "artar" },
        { metin: "Ormandaki canlı türü sayısı", kutu: "azalir" },
        { metin: "Çay bahçelerinin alanı", kutu: "artar" },
      ],
      ornek: "2022'de açılan Rize-Artvin Havalimanı, dağlar arasında düz alan bulunamadığı için denize dolgu yapılarak inşa edildi.",
    },
    dagilis: [{ ad: "Of (Trabzon)", konum: [40.27, 40.95] }, { ad: "Hopa (Artvin)", konum: [41.42, 41.39] }],
    ulasim: [[39.72, 41.0], [40.52, 41.02], [40.85, 41.18], [41.42, 41.39]],
    havalimani: { ad: "Rize-Artvin Havalimanı", konum: [40.83, 41.17] },
  },
];

/** 7. adım: Atatürk Barajı örneği */
export const BARAJ = {
  ad: "Atatürk Barajı", konum: [38.32, 37.48], kutu: [[37.4, 36.6], [40.0, 38.2]],
  yerler: [
    { ad: "Şanlıurfa", konum: [38.79, 37.16] }, { ad: "Adıyaman", konum: [38.28, 37.76] },
    { ad: "Samsat (yeni yeri)", konum: [38.48, 37.58] }, { ad: "Harran Ovası", konum: [39.03, 36.86] },
  ],
  // baraj gölü (temsilî kıyı): Fırat vadisi boyunca kuzeye uzanır
  gol: [[38.3, 37.47], [38.36, 37.52], [38.5, 37.56], [38.62, 37.6], [38.75, 37.66], [38.86, 37.76], [38.95, 37.88], [38.98, 37.98], [38.9, 38.02], [38.8, 37.93], [38.68, 37.8], [38.55, 37.72], [38.42, 37.66], [38.32, 37.6], [38.24, 37.53]],
  tunel: [[38.32, 37.48], [38.6, 37.3], [38.79, 37.16], [39.03, 36.86]], // temsilî
  ifadeler: [
    { metin: "Fırat Nehri üzerinde, Adıyaman ile Şanlıurfa arasında yer alır.", kisa: "Fırat üzerinde, Adıyaman–Şanlıurfa arası", kutu: "konum" },
    { metin: "Yaklaşık 37,5° kuzey enlemi ve 38,3° doğu boylamı yakınındadır.", kisa: "≈ 37,5° K · 38,3° D", kutu: "konum" },
    { metin: "Yazlar çok sıcak ve kuraktır; ova tarımı sulamaya bağlıdır.", kisa: "Sıcak ve kurak yazlar", kutu: "kosul" },
    { metin: "Fırat, yüksek dağlardaki karların erimesiyle ilkbaharda en çok suyu taşır.", kisa: "İlkbaharda kar erimesiyle bol su", kutu: "kosul" },
    { metin: "Şanlıurfa Tünelleri barajdaki suyu Harran Ovası'na ulaştırır.", kisa: "Tüneller suyu Harran'a taşır", kutu: "iliski" },
    { metin: "Üretilen elektrik ulusal ağ ile uzak şehirlere ulaşır.", kisa: "Elektrik uzak şehirlere ulaşır", kutu: "iliski" },
    { metin: "Baraj gölü altında kalan Samsat ilçesi yeni yerine taşındı.", kisa: "Samsat yeni yerine taşındı", kutu: "etki" },
    { metin: "Sulamayla Harran Ovası'nda pamuk ve mısır üretimi arttı.", kisa: "Harran'da pamuk ve mısır arttı", kutu: "etki" },
  ],
};
export const BOLUMLER = [
  { id: "konum", ad: "a) Konum" }, { id: "kosul", ad: "b) Koşullar" }, { id: "iliski", ad: "c) İlişkiler" }, { id: "etki", ad: "ç) Etki" },
];
export const AYLAR = ["O", "Ş", "M", "N", "M", "H", "T", "A", "E", "E", "K", "A"];
