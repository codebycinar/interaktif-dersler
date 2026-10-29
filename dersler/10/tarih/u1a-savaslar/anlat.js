// Adım adım anlatım kareleri (rehber 4·0): her adımda önce gösterim, arada mini sorular.
import { kare, soru, cozum } from "../ortak/anlat.js";
import { ordu, kale, oba, koy } from "../ortak/nesneler.js";
import { SAVASLAR, KUTU } from "./veri.js";

const K = Object.fromEntries(SAVASLAR.map((s) => [s.id, s.konum]));
const yer = (id, ad) => ({ konum: K[id], ad });
const HORASAN = [[52, 33], [68, 42]], DOGU_ANADOLU = [[37.5, 36.5], [47, 42]], BATI_ANADOLU = [[26, 35.5], [36, 42]];
const SURIYE = [[32, 30.5], [40, 36.5]], IRAN = [[43, 28], [62, 40]];
/** Savaş yerinde karşı karşıya iki küçük ordu */
const ikiOrdu = (id, r2 = "#6b4fa0") => (g, h) => {
  const [l, b] = K[id], d = 0.026 * (h.kutu[1][0] - h.kutu[0][0]);
  koy(h, g, ordu({ sayi: 36, renk: "#b5452f", yon: Math.PI, tohum: 3 }), [l + d, b], { boy: 5 });
  koy(h, g, ordu({ sayi: 36, renk: r2, sancak: "#4a2f7a", tohum: 7 }), [l - d, b], { boy: 5 });
};

export const ANLAT = [
  /* 1 · hareketli harita */
  [
    kare("1040 yılı. Türkmen boyları <b>Horasan</b>'da, Merv ve Nişabur çevresinde yaşıyor.", { kutu: HORASAN, yerler: [{ konum: [62.19, 37.66], ad: "Merv" }, { konum: [58.8, 36.21], ad: "Nişabur" }] }),
    kare("Selçuklular burada <b>Dandanakan</b>'da Gaznelileri yendi. Büyük Selçuklu Devleti böyle kuruldu.", { kutu: HORASAN, yerler: [yer("dandanakan", "Dandanakan 1040")], maket: ikiOrdu("dandanakan", "#3f7f5f") }),
    kare("Sonra yön batıya döndü: İran, Irak ve Bağdat Selçukluların eline geçti.", { kutu: IRAN, oklar: [{ yol: [[61.5, 37.2], [55, 35.8], [51.4, 35.6], [47, 34.3], [44.4, 33.3]] }], yerler: [{ konum: [44.37, 33.31], ad: "Bağdat 1055" }] }),
    soru("Selçuklular hangi yönde ilerleyerek Anadolu'ya ulaştı?", ["Batıdan doğuya", "Doğudan batıya", "Güneyden kuzeye"], 1, "Horasan Anadolu'nun doğusundadır; göç ve seferler doğudan batıya ilerledi.", "Horasan haritada Anadolu'nun hangi yanında?"),
    kare("1071'de <b>Malazgirt</b>'te Bizans yenildi. Türkmenler Anadolu'ya yerleşmeye başladı.", { kutu: DOGU_ANADOLU, yerler: [yer("malazgirt", "Malazgirt 1071")], maket: ikiOrdu("malazgirt") }),
    kare("Anadolu'da <b>Türkiye Selçuklu Devleti</b> kuruldu. Merkezi önce İznik, sonra Konya oldu.", { kutu: BATI_ANADOLU, yerler: [{ konum: [29.72, 40.43], ad: "İznik" }, { konum: [32.48, 37.87], ad: "Konya" }], oklar: [{ yol: [[29.72, 40.43], [31.2, 39.2], [32.48, 37.87]], kesikli: true }] }),
    kare("Türkmenler obalarıyla Anadolu'nun dört bir yanına yayıldı. Göçle birlikte dil ve kültür de geldi.", { kutu: [[28, 36], [44, 42]], maket: (g, h) => [[40.6, 39.6], [37.5, 39.3], [35.2, 38.9], [33.0, 38.6], [31.0, 39.3]].forEach((ll, i) => koy(h, g, oba({ sayi: 5, tohum: i + 2 }), ll, { boy: 4 })) }),
    soru("Malazgirt'ten sonra Anadolu'da neler oldu?", ["Türkler Anadolu'dan çekildi", "Türkmenler Anadolu'ya kalıcı olarak yerleşti", "Bizans bütün Anadolu'yu geri aldı"], 1, "Malazgirt Anadolu'nun kapılarını açtı; Türkmen göçü kalıcı yerleşmeye dönüştü.", "Malazgirt'i kim kazandı?"),
    kare("1243'te <b>Kösedağ</b>'da Moğollar kazandı. 1299'da Söğüt'te Osmanlı Beyliği doğdu.", { kutu: KUTU, yerler: [yer("kosedag", "Kösedağ 1243"), { konum: [30.18, 40.02], ad: "Söğüt 1299" }] }),
    kare("Şimdi sıra sende: şeridi oynat, yedi savaşı gör ve bu dönem hakkında bildiklerini yaz."),
  ],
  /* 2 · tarih şeridi */
  [
    kare("Tarih şeridi olayları <b>önce–sonra</b> sırasıyla gösterir. Soldaki olay daha eskidir."),
    kare("Dandanakan 1040'ta, Pasinler 1048'de oldu. Küçük yıl daha eskidir: önce Dandanakan gelir.", { yerler: [yer("dandanakan", "1040"), yer("pasinler", "1048")] }),
    cozum(["Dandanakan: 1040", "Pasinler: 1048", "1040 < 1048", "Sıra: önce Dandanakan, sonra Pasinler"], "Çözümlü örnek: iki savaşı sırala"),
    soru("Hangisi daha önce oldu?", ["Malazgirt (1071)", "Miryokefalon (1176)"], 0, "1071, 1176'dan küçüktür; Malazgirt yaklaşık bir yüzyıl önce yapıldı.", "İki yılın küçüğünü bul."),
    kare("Yıl kadar <b>neden–sonuç</b> da önemlidir. Kapılar açılmadan Anadolu'da Türk devleti kurulamazdı.", { yerler: [yer("malazgirt", "Malazgirt 1071"), { konum: [29.72, 40.43], ad: "Türkiye Selçuklu 1075" }] }),
    kare("Haçlılar 1096'da Anadolu'ya girdi. Miryokefalon 1176'da, Kösedağ 1243'te oldu.", { yerler: [yer("hacli", "1096"), yer("miryokefalon", "1176"), yer("kosedag", "1243")] }),
    soru("I. Haçlı Seferi hangi iki savaşın arasında yer alır?", ["Dandanakan ile Pasinler", "Malazgirt ile Miryokefalon", "Hıttin ile Kösedağ"], 1, "1071 < 1096 < 1176: Haçlı Seferi Malazgirt'ten sonra, Miryokefalon'dan önce başladı.", "1096'yı yılların arasına yerleştir."),
    kare("Şimdi kartlardaki yedi savaşı en eskiden en yeniye sırala."),
  ],
  /* 3 · dilsiz harita */
  [
    kare("Dilsiz harita, adı yazmayan bir haritadır. Yeri bulmak için <b>ipuçlarını</b> kullanırız."),
    kare("İpucu 1: Horasan çölü en doğudadır. Dandanakan Merv ile Serahs arasındadır.", { kutu: HORASAN, yerler: [{ konum: [62.19, 37.66], ad: "Merv" }] }),
    kare("İpucu 2: Van Gölü Doğu Anadolu'nun büyük gölüdür. Malazgirt Ovası onun kuzeyindedir.", { kutu: DOGU_ANADOLU, yerler: [{ konum: [42.9, 38.65], ad: "Van Gölü" }] }),
    cozum(["Ararız: Malazgirt", "İpucu: Van Gölü'nün kuzeyi, Muş", "Haritada Van Gölü'nü bul", "Kuzeyindeki noktayı seç"], "Çözümlü örnek: Malazgirt nerede?"),
    soru("Erzurum yakınındaki Pasinler Ovası Anadolu'nun hangi bölümündedir?", ["Batı Anadolu", "Doğu Anadolu", "Akdeniz kıyısı"], 1, "Erzurum Doğu Anadolu'dadır; Pasinler Ovası da oradadır.", "Erzurum'u haritada düşün."),
    kare("İpucu 3: Miryokefalon göller bölgesinde, Eğirdir Gölü'nün kuzeyindedir.", { kutu: BATI_ANADOLU, yerler: [{ konum: [30.85, 38.05], ad: "Eğirdir Gölü" }] }),
    kare("İpucu 4: Hıttin, Taberiye Gölü'nün batısında; yani bugünkü Filistin–İsrail topraklarındadır.", { kutu: SURIYE, yerler: [{ konum: [35.58, 32.82], ad: "Taberiye Gölü" }] }),
    soru("Savaşların yerleri zamanla hangi yöne kaydı?", ["Batıdan doğuya", "Doğudan batıya", "Hep aynı yerde kaldı"], 1, "1040 Horasan, 1071 Doğu Anadolu, 1176 Batı Anadolu: savaşlar doğudan batıya ilerledi.", "Dandanakan ile Miryokefalon'un yerlerini karşılaştır."),
    kare("Şimdi her savaşı haritadaki numarasına yerleştir."),
  ],
  /* 4 · savaş kartları */
  [
    kare("Bir savaşı tanımak için dört şey sorarız: <b>kim, nerede, ne zaman</b> ve <b>sonuç</b>."),
    cozum(["Kim: Alparslan – Romen Diyojen", "Nerede: Malazgirt Ovası, Muş", "Ne zaman: 26 Ağustos 1071", "Sonuç: Anadolu'nun kapıları açıldı"], "Çözümlü örnek: Malazgirt"),
    kare("Taraflara dikkat: Bazen karşı taraf Bizans, bazen Haçlılar, bazen Moğollardır.", { yerler: [yer("malazgirt", "Bizans"), yer("hacli", "Haçlılar"), yer("kosedag", "Moğollar")] }),
    soru("Kösedağ Savaşı'nda Türkiye Selçukluları kime karşı savaştı?", ["Bizans", "Moğollar", "Gazneliler"], 1, "1243'te Kösedağ'da Moğollara yenildiler ve İlhanlı hâkimiyetine girdiler.", "13. yüzyılda doğudan gelen büyük güç hangisiydi?"),
    kare("Sonuçlar birbirine benzeyebilir. Malazgirt kapıyı <b>açtı</b>, Miryokefalon kapının kalıcı olduğunu <b>kesinleştirdi</b>.", { yerler: [yer("malazgirt", "Kapı açıldı"), yer("miryokefalon", "Kalıcı oldu")] }),
    kare("Hıttin'de Selahaddin Eyyubi Haçlıları yendi ve Kudüs'ü geri aldı.", { kutu: SURIYE, yerler: [yer("hittin", "Hıttin 1187"), { konum: [35.23, 31.78], ad: "Kudüs" }] }),
    soru("Hangi savaş Bizans'ın Türkleri Anadolu'dan çıkarma umudunu bitirdi?", ["Malazgirt", "Miryokefalon", "Dandanakan"], 1, "1176 Miryokefalon'dan sonra Bizans Anadolu'da savunmaya çekildi.", "Kapıyı açan değil, kalıcı kılan savaşı ara."),
    kare("Şimdi iki turu oyna: önce tarafları, sonra sonuçları eşleştir."),
  ],
  /* 5 · kaynaklar */
  [
    kare("Tarihçi olayı görmedi; bilgiyi <b>kaynaklardan</b> çıkarır."),
    kare("Olayı yaşayan ya da o döneme ait kaynak <b>birincildir</b>: kronik, mektup, kitabe."),
    kare("Sonradan, başka kaynaklara dayanılarak yazılan kaynak <b>ikincildir</b>: ders kitabı, araştırma."),
    soru("Malazgirt seferine katılan bir Bizanslının yazdığı tarih nasıl bir kaynaktır?", ["Birincil", "İkincil"], 0, "Yazar olayın görgü tanığıdır; bu yüzden birincil kaynaktır.", "Yazar olayı kendi gözüyle gördü mü?"),
    kare("1071'de Alparslan esir imparatoru ayağa kaldırdı, ağırladı ve antlaşmayla serbest bıraktı.", { kutu: DOGU_ANADOLU, yerler: [yer("malazgirt", "Malazgirt 1071")], maket: (g, h) => { ikiOrdu("malazgirt")(g, h); koy(h, g, kale({ kenar: 6 }), [K.malazgirt[0] + 0.3, K.malazgirt[1] + 0.9], { boy: 5 }); } }),
    kare("Bunu anlatan bir <b>Bizans</b> yazarıdır. Karşı tarafın övgüsü bilgiyi güçlendirir."),
    soru("Bir olayı iki karşıt tarafın kaynağı da anlatıyorsa ne söyleyebiliriz?", ["Bilgi daha güvenilir olur", "Bilgi kesin yanlıştır", "Kaynakların ikisi de ikincildir"], 0, "Birbirinden bağımsız ve karşıt kaynakların aynı şeyi anlatması bilgiyi doğrular.", "İki rakip aynı şeyi söylüyorsa…"),
    kare("Şimdi dört kaynağı oku: türünü ve anlattığı davranışı belirle."),
  ],
  /* 6 · karşılaştırma */
  [
    kare("Karşılaştırmada iki soru sorarız: <b>Ortak</b> yanları ne? <b>Farklı</b> yanları ne?"),
    kare("Malazgirt ve Miryokefalon: ikisi de Bizans'a karşı kazanılmış zaferlerdir.", { kutu: [[28, 36], [45, 42]], yerler: [yer("malazgirt", "1071"), yer("miryokefalon", "1176")] }),
    kare("Fark: Malazgirt'i <b>Büyük Selçuklu</b>, Miryokefalon'u <b>Türkiye Selçuklu</b> kazandı."),
    cozum(["İfade: “Bizans'a karşı yapıldı.”", "Malazgirt: evet · Miryokefalon: evet", "İkisinde de var", "Kutu: ortak"], "Çözümlü örnek: ifadeyi yerleştir"),
    soru("“Bizans ordusu dar bir dağ geçidinde pusuya düşürüldü.” Bu ifade hangisine aittir?", ["Malazgirt", "Miryokefalon", "İkisine de"], 1, "Miryokefalon'da Bizans ordusu dağ geçidinde pusuya düşürüldü; Malazgirt bir ova savaşıydı.", "Malazgirt Ovası bir dağ geçidi midir?"),
    kare("Bir yenilgi bile göçü etkileyebilir: Moğol baskısından kaçan Türkmenler batıya yığıldı.", { yerler: [yer("kosedag", "Kösedağ 1243")], oklar: [{ yol: [[38.05, 40.02], [35, 39.6], [32, 39.6], [30, 39.9]], kesikli: true }] }),
    soru("Malazgirt ile Kösedağ'ın ortak yanı hangisidir?", ["İkisi de zaferdir", "İkisi de Anadolu'ya yeni Türkmen göçlerine yol açtı", "İkisi de Bizans'a karşıdır"], 1, "Malazgirt kapıyı açtı; Kösedağ'dan sonra da Moğollardan kaçan Türkmenler Anadolu'nun batısına göç etti.", "Sonuçların göçle ilgisine bak."),
    kare("Şimdi iki karşılaştırma tablosunu doldur."),
  ],
  /* 7 · teşkilat */
  [
    kare("Bir şey eskiden de vardı ve sürdüyse <b>süreklilik</b>; yeni geldiyse <b>değişim</b> deriz."),
    kare("Türkler Türkistan'dan gelirken devlet geleneklerini de getirdi: kut, kurultay, tuğ, otağ."),
    kare("Yolda İslam ve İran geleneğiyle tanıştılar: sultan unvanı, hutbe, vezirlik geldi.", { kutu: IRAN, yerler: [{ konum: [44.37, 33.31], ad: "Bağdat" }, { konum: [51.67, 32.65], ad: "İsfahan" }] }),
    cozum(["Unsur: Büyük Divan", "Eski Türklerde: kurultay", "Benzer bir kurul sürüyor", "Sonuç: süreklilik"], "Çözümlü örnek"),
    soru("Hükümdarın “kağan” yerine “sultan” unvanını kullanması nedir?", ["Süreklilik", "Değişim"], 1, "Sultan unvanı İslam dünyasından gelen yeni bir unsurdur.", "Bu unvan İslamiyet öncesi Türk devletlerinde var mıydı?"),
    kare("Hilal (Turan) taktiği Hunlardan beri sürüyordu. Malazgirt'te de kullanıldı.", { kutu: DOGU_ANADOLU, yerler: [yer("malazgirt", "Malazgirt")], maket: ikiOrdu("malazgirt") }),
    soru("Ülkenin hanedanın ortak malı sayılması hangi alanı etkiler?", ["Ordu", "Hükümdarlık ve veraset", "Toprak ve vergi düzeni"], 1, "Bu anlayış tahtın kime geçeceğini, yani veraseti belirler.", "Kimin hükümdar olacağıyla ilgili mi?"),
    kare("Şimdi formun iki bölümünü doldur."),
  ],
  /* 8 · ikta */
  [
    kare("Büyük bir ordu beslemek pahalıdır. Hazine her yıl askerlere maaş öder.", { yerler: [{ konum: [51.67, 32.65], ad: "Hazine (İsfahan)" }] }),
    kare("<b>İkta</b>da devlet bir toprağın vergisini bir komutana bırakır. Komutan o gelirle atlı asker besler."),
    kare("Böylece hazine rahatlar, ordu büyür. Köylü de toprağı işlemeye devam eder."),
    soru("İkta sisteminde vergiyi kim toplayıp kullanır?", ["Merkezdeki hazine", "İktayı alan komutan (iktadar)", "Köylünün kendisi"], 1, "Vergi geliri hizmet karşılığında iktadara bırakılır; o da bununla asker besler.", "Toprağın gelirini kime bırakıyorduk?"),
    kare("Ama dikkat: İkta <b>mülk</b> değildir. Merkez denetler, gerekirse geri alır."),
    kare("İktalar babadan oğula geçmeye başlarsa iktadar sultana değil kendi toprağına bağlanır."),
    soru("İktalar denetimsiz kalıp babadan oğula geçerse ne olur?", ["Merkezî otorite güçlenir", "Merkezî otorite zayıflar", "Hiçbir şey değişmez"], 1, "Yerel güçler bağımsızlaşır; Büyük Selçuklu'nun son döneminde bu yaşandı.", "İktadar kime bağlı kalır?"),
    kare("Şimdi kaydırıcıyla dengeyi bul. Sayılar temsilîdir; yalnızca ilişkilerin yönünü gösterir."),
  ],
  /* 9 · neden–sonuç */
  [
    kare("Neden–sonuç zincirinde her halka bir sonrakini doğurur: <b>çünkü… bu yüzden…</b>"),
    kare("Eski bir anlayış: ülke hanedanın <b>ortak malıdır</b>. Şehzadeler bölgelere melik olarak gider."),
    kare("1092'de Melikşah ölünce şehzadeler taht için savaştı. Otorite zayıfladı.", { kutu: IRAN, yerler: [{ konum: [51.67, 32.65], ad: "İsfahan 1092" }] }),
    soru("Taht kavgalarının sonucu hangisidir?", ["Merkezî otorite zayıflar", "Devlet daha da güçlenir", "Ordu dağılır, savaş biter"], 0, "Kavgalar merkezi zayıflattı; atabeyler ve yerel güçler bağımsızlaştı.", "Kavga eden bir hanedan güçlü kalabilir mi?"),
    kare("İkinci zincir: Selçuklular İran ve Irak gibi kalabalık, yerleşik toprakları aldı.", { kutu: IRAN, alanlar: [{ halka: [[44, 31], [44, 37], [52, 37.5], [58, 36], [56, 30], [48, 29.5]], renk: "#ffb547" }] }),
    kare("Bu kadar insanı yönetmek için yazılı kayıt ve vergi gerekti. Vezir ve divan güçlendi."),
    cozum(["Neden: yerleşik topraklar", "Sonuç 1: yazılı kayıt ihtiyacı", "Sonuç 2: vezirlik ve divan güçlenir", "Sonuç 3: görevli yetiştiren Nizamiye medreseleri"], "Çözümlü örnek: zinciri oku"),
    soru("Nizamiye medreseleri neden açıldı?", ["Devlete görevli yetiştirmek için", "Orduyu büyütmek için", "Ticareti artırmak için"], 0, "Gelişen bürokrasi eğitimli katip ve görevlilere ihtiyaç duydu.", "Bürokrasinin neye ihtiyacı vardı?"),
    kare("Şimdi iki zinciri nedenden sonuca doğru kur."),
  ],
  /* 10 · değerlendirme */
  [
    kare("Bu derste 1040'tan 1299'a uzanan yolculuğu izledik.", { kutu: KUTU }),
    kare("Savaşlar doğudan batıya ilerledi: Dandanakan, Pasinler, Malazgirt, Miryokefalon.", { kutu: KUTU, yerler: [yer("dandanakan"), yer("pasinler"), yer("malazgirt"), yer("miryokefalon")] }),
    kare("Devlette bazı gelenekler sürdü, bazıları değişti. İkta orduyu ve vergi düzenini birleştirdi."),
    soru("Hangisi bir <b>süreklilik</b> örneğidir?", ["Sultan unvanı", "Hilal (Turan) taktiği", "Vezirlik"], 1, "Hilal taktiği Hunlardan beri kullanılıyordu; ötekiler yeni gelen unsurlardır.", "Hangisi İslamiyet öncesinde de vardı?"),
    kare("Kaynakları okurken türünü ve yazarını sorduk. Karşı tarafın tanıklığı bilgiyi güçlendirir."),
    kare("Şimdi dokuz soruluk değerlendirmeyi çöz. Dersi tamamlamak için en az yedi doğru gerekir."),
  ],
];
