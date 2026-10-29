// Adım adım anlatım kareleri (rehber 4·0): her adımda önce gösterim, arada mini sorular.
import { kare, soru, cozum } from "../ortak/anlat.js";
import { kervansaray, medrese, oba, koy } from "../ortak/nesneler.js";
import { KERVAN_YOLU } from "./veri.js";

const KONYA = [32.48, 37.87], KAYSERI = [35.49, 38.72], AKSARAY = [34.03, 38.37], SULTANHANI = [33.55, 38.25], KIRSEHIR = [34.16, 39.15];
const ORTA = [[31.4, 36.9], [36.6, 39.6]], ANADOLU = [[26.5, 35.6], [44.8, 42.2]], ASYA = [[28, 30.5], [79, 45.5]];

export const ANLAT = [
  /* 1 · kavramlar */
  [
    kare("13. yüzyıl. Bir kervanla <b>Konya</b>'dan <b>Kayseri</b>'ye yola çıkıyoruz.", { kutu: ORTA, yerler: [{ konum: KONYA, ad: "Konya" }, { konum: KAYSERI, ad: "Kayseri" }], oklar: [{ yol: KERVAN_YOLU, kesikli: true }] }),
    kare("Akşam bir <b>kervansaray</b>a varırız. Tüccar, yolcu ve hayvanlar burada güvenle konaklar.", { yerler: [{ konum: SULTANHANI, ad: "Sultanhanı (1229)" }], maket: (g, h) => koy(h, g, kervansaray(), SULTANHANI, { boy: 6, yon: 20 }) }),
    kare("Şehirde <b>medrese</b> görürüz: din bilimlerinin yanında matematik, tıp, astronomi okutulur.", { yerler: [{ konum: KONYA, ad: "Karatay Medresesi" }], maket: (g, h) => koy(h, g, medrese(), KONYA, { boy: 5, yon: 20 }) }),
    soru("Kervansarayın asıl görevi nedir?", ["Askerleri eğitmek", "Ticaret yolunda yolcuları güvenle konaklatmak", "Hastaları tedavi etmek"], 1, "Kervansaraylar ticaret yolları üzerinde tüccarlara, yolculara ve hayvanlara güvenli konak sağlar.", "Kervan yolunun üzerinde ne gerekir?"),
    kare("Kayseri'de bir <b>şifahane</b> var. Gevher Nesibe Şifahanesi'nde hastalar tedavi edilir, tıp öğretilir.", { yerler: [{ konum: KAYSERI, ad: "Gevher Nesibe (1206)" }] }),
    kare("Bu yapıların çoğunu <b>vakıflar</b> yaşatır: bir malın geliri sürekli olarak hayır işine ayrılır."),
    kare("Çarşıda <b>Ahi</b> esnafı çalışır. Kırşehir'de yaşayan Ahi Evran bu teşkilatın kurucusu sayılır.", { yerler: [{ konum: KIRSEHIR, ad: "Kırşehir" }] }),
    kare("Toroslarda <b>konar-göçer</b> Türkmenler var: yazın yaylaya, kışın kışlağa göçerler.", { yerler: [{ konum: [33.1, 37.05], ad: "Toros yaylaları" }], maket: (g, h) => koy(h, g, oba({ sayi: 7 }), [33.1, 37.05], { boy: 5 }) }),
    soru("Bir şifahanenin giderleri yüzyıllarca nasıl karşılanabilir?", ["Vakıf gelirleriyle", "Her hasta ücret öderdi", "Ordunun ganimetiyle"], 0, "Vakfedilen dükkân, tarla ve hamamların geliri şifahaneyi sürekli yaşatırdı.", "Hayır işi için sürekli ayrılan gelire ne denir?"),
    kare("Şimdi her tanımı doğru kavramla eşleştir ve merak ettiğin konuyu seç."),
  ],
  /* 2 · araştırma sorusu */
  [
    kare("Araştırma bir <b>soruyla</b> başlar. Ama her soru araştırma sorusu değildir."),
    kare("“Sultanhanı hangi yıl yapıldı?” Cevap tek bir bilgidir: 1229. Buna <b>bilgi sorusu</b> deriz.", { kutu: ORTA, yerler: [{ konum: SULTANHANI, ad: "Sultanhanı 1229" }] }),
    kare("“Kervan yolları şehirlerin büyümesini nasıl etkiledi?” İki şeyi ilişkilendirir: <b>araştırma sorusu</b>.", { kutu: ORTA, oklar: [{ yol: KERVAN_YOLU, kesikli: true }], yerler: [{ konum: KONYA, ad: "Konya" }, { konum: AKSARAY, ad: "Aksaray" }, { konum: KAYSERI, ad: "Kayseri" }] }),
    soru("Hangisi bir araştırma sorusudur?", ["Ahi Evran hangi şehirde yaşadı?", "Ahi teşkilatı şehirdeki üretimin kalitesini nasıl korudu?", "Karatay Medresesi hangi yıl yapıldı?"], 1, "“Nasıl” sorusu teşkilat ile üretim arasında bir ilişki kurmanı ister.", "Cevabı tek kelime olmayan soruyu ara."),
    kare("İpucu: Araştırma soruları çoğunlukla <b>nasıl</b>, <b>neden</b>, <b>hangi etkiler</b> diye başlar."),
    cozum(["Konu: kervansaraylar", "Ekonomik faaliyet: ticaret", "Yerleşme: şehirlerin büyümesi", "Soru: Ticaret yolları Kayseri'nin büyümesini nasıl etkiledi?"], "Çözümlü örnek: kendi soruyu kur"),
    soru("Bir araştırma sorusunun sonunda ne olmalı?", ["Ünlem", "Soru işareti", "Üç nokta"], 1, "Soru cümlesi soru işaretiyle biter.", "Bir soru cümlesini nasıl bitiririz?"),
    kare("Şimdi soruları ayır ve kendi araştırma sorunu yaz."),
  ],
  /* 3 · kaynak dosyası */
  [
    kare("Sorunun cevabı kaynaklarda saklı. İlk iş, kaynağın <b>ne zaman</b> ve <b>kim</b> tarafından üretildiğini sormak."),
    kare("Sultanhanı'nın kapısındaki <b>kitabe</b> yapıyla aynı anda yazıldı: dönemin kendisinden kalan <b>birincil</b> kaynak.", { kutu: [[31.4, 36.6], [36.2, 39.4]], yerler: [{ konum: SULTANHANI, ad: "Kitabe 1229" }], maket: (g, h) => koy(h, g, kervansaray(), SULTANHANI, { boy: 6, yon: 20 }) }),
    kare("Toprak altından çıkan bir <b>sikke</b> de birincildir. Yazı olmasa bile dönemden kalan buluntudur.", { yerler: [{ konum: [34.18, 38.44], ad: "Ağzıkara Han" }] }),
    soru("Selçuklu sarayında çalışmış İbni Bibi'nin tarihi nasıl bir kaynaktır?", ["Birincil", "İkincil"], 0, "Yazar dönemi yaşamış ve saray olaylarını içeriden anlatmıştır.", "Yazar olayların yaşandığı dönemde mi yaşadı?"),
    kare("Bugün yazılan bir kitap, çizilen bir harita ya da belgesel <b>ikincil</b> kaynaktır: başka kaynaklara dayanır."),
    kare("İkincil kaynak değersiz değildir: birçok birincil kaynağı bir araya getirip yorumlar."),
    soru("Ders kitabındaki kervan yolları haritası hangi türdendir?", ["Birincil", "İkincil"], 1, "Harita bugün araştırmalara dayanılarak hazırlanmıştır.", "Haritayı 13. yüzyılda yaşayan biri mi çizdi?"),
    kare("Şimdi dosyana gelen sekiz kaynağı birincil ve ikincil diye ayır."),
  ],
  /* 4 · doğruluk */
  [
    kare("Tarih bilgisi her yerde dolaşır: dizi, blog, sosyal medya… Hepsine aynı güveni duyamayız."),
    kare("Üç şeye bak: <b>yazarı belli mi, kaynak gösteriyor mu, kurgu mu belge mi</b>."),
    cozum(["İddia: “Han 1229'da yapıldı.”", "Kaynak: hanın kapı kitabesi", "Yazarı ve tarihi belli, dönemden kalma", "Karar: güvenilir"], "Çözümlü örnek"),
    soru("Bir dizideki kılıç düellosu sahnesi tarihî kanıt olabilir mi?", ["Evet, çünkü görüntülüdür", "Hayır, diziler kurgu içerir"], 1, "Diziler senaryoya dayanır; tarihî bilgi için belgeye bakmak gerekir.", "Sahneyi kim yazdı?"),
    kare("Bazı bilgiler doğru olabilir ama kaynağı zayıftır. Onları <b>doğrulamak</b> gerekir: başka güvenilir kaynaklara bak."),
    kare("Herkesin düzenleyebildiği bir ansiklopedi maddesi bir başlangıçtır. Gösterdiği kaynaklara gidip kontrol et."),
    soru("Kaynak göstermeyen bir sosyal medya görseli için en doğru karar hangisi?", ["Kesin doğrudur", "Doğrulanmalıdır", "Kesin yanlıştır"], 1, "Bilgi doğru da olabilir yanlış da; güvenilir kaynaklarla karşılaştırmadan karar verilmez.", "Kaynak yoksa doğruluğunu nasıl bileceğiz?"),
    kare("Şimdi altı iddiayı güvenilir, doğrulanmalı ve güvenilmez diye ayır."),
  ],
  /* 5 · kervan yolu */
  [
    kare("Konya'dan Kayseri'ye yol yaklaşık <b>284 km</b>. Yüklü bir kervan bir günde 30–40 km gidebilir.", { kutu: [[31.95, 37.45], [36.05, 39.2]], oklar: [{ yol: KERVAN_YOLU }] }),
    cozum(["Yol: ≈ 284 km", "Günlük yol: ≈ 40 km", "284 ÷ 40 ≈ 7,1", "Yolculuk yaklaşık 7–8 gün sürer"], "Kaç günde varılır?"),
    kare("Her akşam güvenli bir konak gerekir. Yoksa kervan soğukta ve eşkıyaya karşı korumasız kalır."),
    soru("Konaklar arası en fazla kaç km olmalı?", ["En fazla 40 km", "En fazla 100 km", "Fark etmez"], 0, "Kervan bir günde en çok 40 km gidebildiği için iki konak arası bunu aşmamalı.", "Kervanın günlük yolu ne kadardı?"),
    kare("Şehirler de konaktır. Konya ile Aksaray arası yine de bir günlük yoldan çok uzun.", { yerler: [{ konum: KONYA, ad: "Konya" }, { konum: AKSARAY, ad: "Aksaray" }] }),
    kare("Selçuklu sultanları yol boyunca hanlar yaptırdı. Sultanhanı bunların en büyüklerindendir.", { yerler: [{ konum: SULTANHANI, ad: "Sultanhanı 1229" }], maket: (g, h) => koy(h, g, kervansaray(), SULTANHANI, { boy: 4, yon: 15 }) }),
    soru("Konya–Aksaray arası yaklaşık 147 km ise en az kaç han gerekir?", ["1", "3", "6"], 1, "147 km'yi 40 km'lik parçalara bölmek için araya en az 3 han gerekir: 4 aralık × ≈37 km.", "Aralık sayısı = han sayısı + 1."),
    kare("Şimdi sen sultansın: yola hanlar kur ve hiçbir aralık 40 km'yi geçmesin."),
  ],
  /* 6 · Ahilik */
  [
    kare("13. yüzyılda Anadolu şehirleri büyüdü. Esnaf ve zanaatkârlar <b>Ahi</b> teşkilatında birleşti.", { kutu: [[29.6, 36.3], [37.4, 40.3]], yerler: [{ konum: KIRSEHIR, ad: "Kırşehir: Ahi Evran" }] }),
    kare("Ahilik <b>fütüvvet</b> ahlakına dayanır: cömertlik, doğruluk, yiğitlik."),
    kare("Meslek basamaklarla öğrenilir: <b>çırak → kalfa → usta</b>. Ahlak da her basamakta sınanır."),
    soru("Ahi teşkilatında çırak önce neyi öğrenirdi?", ["Yalnızca para kazanmayı", "Ahlakı, sonra mesleği", "Yalnızca savaşmayı"], 1, "Ahilikte meslek ve ahlak birlikte öğretilir; kusurlu mal satmak ayıptır.", "Fütüvvet neyi öğütler?"),
    kare("Teşkilat kaliteyi ve fiyatı denetler. Haksız kazanç engellenir, halk ve dürüst esnaf korunur."),
    kare("Ahiler yabancı yolcuları zaviyelerinde ağırlardı. Seyyah İbn Battuta bunu hayranlıkla anlatır.", { yerler: [{ konum: [30.71, 36.89], ad: "Antalya" }, { konum: [32.48, 37.87], ad: "Konya" }] }),
    soru("Ahiliğin şehir ekonomisine etkisi hangisidir?", ["Üretimde kaliteyi ve güveni artırdı", "Ticareti tamamen durdurdu", "Esnafı köylere taşıdı"], 0, "Denetlenen kalite ve fiyat, şehirlerdeki ticarete güven kazandırdı.", "Kaliteli ve adil fiyatlı mal neyi artırır?"),
    kare("Şimdi dört örnek olayda bir Ahi ustası gibi karar ver."),
  ],
  /* 7 · medrese ve üniversite */
  [
    kare("11.–13. yüzyılda hem Doğu'da hem Batı'da yeni eğitim kurumları doğdu.", { kutu: [[-8, 31], [50, 54]] }),
    kare("Doğu'da <b>Nizamiye medreseleri</b>: ilki 1067'de Bağdat'ta açıldı. Öğrencilere burs ve yurt verildi.", { yerler: [{ konum: [44.36, 33.31], ad: "Bağdat 1067" }] }),
    kare("Batı'da ilk <b>üniversiteler</b>: Bologna, Paris, Oxford. Bilim dili Latinceydi.", { yerler: [{ konum: [11.34, 44.49], ad: "Bologna" }, { konum: [2.35, 48.86], ad: "Paris" }, { konum: [-1.26, 51.75], ad: "Oxford" }] }),
    soru("Türk-İslam dünyasında bilim dili büyük ölçüde hangisiydi?", ["Latince", "Arapça", "Yunanca"], 1, "Bilim dili Arapça, edebiyat ve yazışma dili çoğunlukla Farsçaydı.", "Medreselerde okutulan kitapların dili…"),
    kare("İki dünya birbirini etkiledi. Toledo'da Arapça bilim kitapları Latinceye çevrildi.", { yerler: [{ konum: [-4.02, 39.86], ad: "Toledo" }], oklar: [{ yol: [[44.36, 33.31], [20, 36], [-4.02, 39.86]], kesikli: true }] }),
    kare("Bazı özellikler ikisinde de vardı: din bilimleri ağırlıktaydı, hükümdarlar bilim insanlarını destekledi."),
    soru("“Gotik katedraller şehirlerin simgesi oldu.” Bu hangi medeniyete aittir?", ["Türk-İslam", "Batı (Latin Avrupa)", "İkisinde de"], 1, "Gotik katedraller Latin Avrupa şehirlerinin simgesidir.", "Katedral hangi dinin yapısıdır?"),
    kare("Şimdi on bir kartı doğru medeniyete yerleştir."),
  ],
  /* 8 · kanıt haritası */
  [
    kare("<b>Yargı</b>, kanıta dayanan bir sonuçtur. Önce kanıt toplar, sonra karar veririz."),
    kare("Soru: 13. yüzyıl eserleri Anadolu'nun Türkleşmesine ve İslamlaşmasına etki etti mi?", { kutu: [[27.4, 36.2], [41.2, 41.6]] }),
    kare("Kanıt 1: Kayseri'deki Gevher Nesibe Şifahanesi (1206). Alanı: sağlık ve eğitim.", { yerler: [{ konum: KAYSERI, ad: "Gevher Nesibe 1206" }], maket: (g, h) => koy(h, g, medrese({ minare: false }), KAYSERI, { boy: 4 }) }),
    kare("Kanıt 2: Konya'da Mevlana'nın Mesnevi'si. Alanı: tasavvuf ve düşünce.", { yerler: [{ konum: KONYA, ad: "Mesnevi" }] }),
    soru("Kösedağ yenilgisi (1243) bu yargı için kanıt olur mu?", ["Evet, çünkü 13. yüzyıldadır", "Hayır, bu bir askerî olaydır"], 1, "Soru kültür, bilim ve sanat eserlerinin etkisini soruyor; askerî bir yenilgi bunu göstermez.", "Sorunun aradığı kanıt türü ne?"),
    kare("İyi bir dosya <b>farklı alanlardan</b> kanıt içerir: eğitim, sağlık, mimari, dil, esnaf ahlakı…"),
    soru("Hangi yargı abartılıdır?", ["Eserler Türkleşmeyi hızlandırdı", "Eserler Anadolu'yu birkaç yılda tamamen Türk yaptı"], 1, "Kanıtlar bir yüzyıla yayılıyor; “birkaç yılda tamamen” ifadesi kanıtı aşıyor.", "Eserlerin tarihlerine bak."),
    kare("Şimdi yıl kaydırıcısını ilerlet ve en az 6 kanıt topla."),
  ],
  /* 9 · düşünürler */
  [
    kare("Bu dönemin düşünürleri Türkistan'dan Anadolu'ya uzanan geniş bir alanda yaşadı.", { kutu: ASYA }),
    kare("Kaşgarlı Mahmud, <b>Divanü Lügati't-Türk</b>'ü yazdı: Türkçenin ilk büyük sözlüğü.", { yerler: [{ konum: [75.99, 39.47], ad: "Kaşgar" }] }),
    kare("Ahmed Yesevi tasavvufu sade Türkçeyle anlattı. Öğrencileri Anadolu'ya kadar ulaştı.", { yerler: [{ konum: [68.27, 43.3], ad: "Yesi" }], oklar: [{ yol: [[68.27, 43.3], [58, 37.5], [45, 38.5], [34.56, 38.94]], kesikli: true }] }),
    soru("Türkçenin Arapça açıklamalı ilk büyük sözlüğünü kim yazdı?", ["Ömer Hayyam", "Kaşgarlı Mahmud", "Cezeri"], 1, "Divanü Lügati't-Türk Kaşgarlı Mahmud'un eseridir.", "Eserin adında “Türk” geçiyor."),
    kare("Ömer Hayyam takvim ve cebir üzerine çalıştı. Cezeri 1206'da otomatik makineleri çizdi.", { yerler: [{ konum: [58.8, 36.21], ad: "Nişabur" }, { konum: [42.19, 37.33], ad: "Cizre" }] }),
    kare("Konya'da Mevlana, Anadolu'da Yunus Emre ve Hacı Bektaş Veli insan sevgisini anlattı.", { kutu: [[28, 36], [38, 41]], yerler: [{ konum: KONYA, ad: "Mevlana" }, { konum: [31.4, 39.6], ad: "Yunus Emre" }, { konum: [34.56, 38.94], ad: "Hacı Bektaş" }] }),
    soru("Anadolu Türkçesinin edebiyat dili olmasına en çok kim katkı yaptı?", ["Yunus Emre", "İbni Bibi", "Ömer Hayyam"], 0, "Yunus Emre şiirlerini sade Türkçeyle yazdı.", "Türkçe şiirleriyle bilinen kişi…"),
    kare("Şimdi eserleri sahipleriyle eşleştir ve bir düşünür hakkında kanıtlı yargını yaz."),
  ],
  /* 10 · değerlendirme */
  [
    kare("Bu derste bir araştırmanın basamaklarını izledik.", { kutu: ANADOLU }),
    kare("<b>Soru sor → kaynak topla → doğruluğunu sına → çıkarım yap.</b>"),
    kare("Kervan yolları ve hanlar ticareti güvenli kıldı; yol üstündeki şehirler büyüdü.", { yerler: [{ konum: KONYA, ad: "Konya" }, { konum: KAYSERI, ad: "Kayseri" }] }),
    soru("Hangisi birincil kaynaktır?", ["Bugün yazılmış bir araştırma kitabı", "Bir hanın kapı kitabesi", "Bir belgesel"], 1, "Kitabe yapıyla aynı dönemde yazılmıştır.", "Hangisi döneminden kalmadır?"),
    kare("Medrese, şifahane, zaviye ve vakıf eserleri Türk-İslam kültürünü Anadolu'da kalıcı kıldı."),
    kare("Şimdi dokuz soruluk değerlendirmeyi çöz. Dersi tamamlamak için en az yedi doğru gerekir."),
  ],
];
