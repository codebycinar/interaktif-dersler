// 10. Sınıf Tarih · 1. Ünite (1040–1299) — 2. ders verileri: şehir, ticaret, Ahilik, Türk-İslam medeniyeti.
// Koordinatlar [boylam, enlem]; kervansaray konumları yaklaşıktır. Metinler kaynakların özgün özetleridir.
// tests/tar10-u1b-medeniyet.test.mjs ile denetlenir.

export const DONEM = { bas: 1040, son: 1299 };
export const ANADOLU = [[26, 35.6], [45, 42.3]];

export const KAVRAMLAR = [
  { id: "ahilik", ad: "Ahilik", tanim: "Şehirlerdeki esnaf ve zanaatkârları bir araya getiren; meslek, ahlak ve dayanışmayı birlikte öğreten teşkilat." },
  { id: "futuvvet", ad: "Fütüvvet", tanim: "Cömertlik, yiğitlik ve doğruluk gibi erdemleri öğütleyen; Ahiliğin de dayandığı ahlak anlayışı." },
  { id: "medrese", ad: "Medrese", tanim: "Din bilimlerinin yanında matematik, tıp ve astronomi gibi bilimlerin de okutulduğu eğitim kurumu." },
  { id: "sifahane", ad: "Şifahane (darüşşifa)", tanim: "Hastaların tedavi edildiği, bazılarında tıp eğitimi de verilen hastane." },
  { id: "tekke", ad: "Tekke (zaviye)", tanim: "Tasavvuf yolunda olanların toplanıp eğitim gördüğü, yolculara da konaklama sağlayan yapı." },
  { id: "kervansaray", ad: "Kervansaray", tanim: "Ticaret yolu üzerinde tüccarların, yolcuların ve hayvanların güvenle konakladığı yapı." },
  { id: "vakif", ad: "Vakıf", tanim: "Bir malın gelirinin cami, medrese, şifahane, çeşme gibi hayır hizmetlerine sürekli olarak ayrılması." },
  { id: "konargocer", ad: "Konar-göçer", tanim: "Sürüleriyle yazın yaylaya, kışın kışlağa göçen Türkmen yaşam biçimi." },
];

/** Öğrencinin seçtiği merak konusu, 2. ve 3. adımları biçimlendirir */
export const KONULAR = [
  {
    id: "ticaret", ad: "Kervansaraylar ve ticaret yolları",
    sorular: [
      { metin: "Sultanhanı hangi yıl yapıldı?", tur: "bilgi" },
      { metin: "Kervansaraylarda kimler konaklardı?", tur: "bilgi" },
      { metin: "Antalya hangi yıl fethedildi?", tur: "bilgi" },
      { metin: "Kervan yollarının geçtiği yerlerdeki şehirler neden büyüdü?", tur: "iliski" },
      { metin: "Limanların fethi Anadolu'daki ticareti ve şehirleri nasıl etkiledi?", tur: "iliski" },
      { metin: "Kervansarayların arasındaki mesafe ile kervanların günlük yolu arasında nasıl bir ilişki var?", tur: "iliski" },
    ],
  },
  {
    id: "ahilik", ad: "Ahilik ve şehir esnafı",
    sorular: [
      { metin: "Ahi Evran hangi şehirde yaşadı?", tur: "bilgi" },
      { metin: "Ahiler hangi meslekleri yapıyordu?", tur: "bilgi" },
      { metin: "Fütüvvetname ne demektir?", tur: "bilgi" },
      { metin: "Ahi teşkilatı şehirdeki üretimin kalitesini nasıl korudu?", tur: "iliski" },
      { metin: "Türkmenlerin şehirlere yerleşmesinde Ahiliğin nasıl bir rolü oldu?", tur: "iliski" },
      { metin: "Esnafın dayanışması şehir ekonomisini neden güçlendirdi?", tur: "iliski" },
    ],
  },
  {
    id: "yerlesme", ad: "Konar-göçer Türkmenlerin yerleşik hayata geçişi",
    sorular: [
      { metin: "Yaylak ve kışlak ne demektir?", tur: "bilgi" },
      { metin: "Türkmenler en çok hangi hayvanları besliyordu?", tur: "bilgi" },
      { metin: "Anadolu'ya gelen Oğuz boylarından bazıları hangileridir?", tur: "bilgi" },
      { metin: "Hayvancılıktan tarıma geçiş Türkmenlerin yerleşme biçimini nasıl değiştirdi?", tur: "iliski" },
      { metin: "Anadolu'da birçok köyün Oğuz boylarının adını taşıması neyi gösterir?", tur: "iliski" },
      { metin: "Türkmenlerin uç bölgelerine yerleştirilmesi neden önemliydi?", tur: "iliski" },
    ],
  },
  {
    id: "vakif", ad: "Vakıflar ve şehirlerin büyümesi",
    sorular: [
      { metin: "Gevher Nesibe Şifahanesi hangi şehirdedir?", tur: "bilgi" },
      { metin: "Vakfiye ne demektir?", tur: "bilgi" },
      { metin: "Karatay Medresesi hangi yıl yapıldı?", tur: "bilgi" },
      { metin: "Bir külliyenin çevresinde mahalleler nasıl oluştu?", tur: "iliski" },
      { metin: "Vakıf gelirleri şehirdeki sağlık ve eğitim hizmetlerini nasıl sürdürdü?", tur: "iliski" },
      { metin: "Vakıf eserleri yeni fethedilen şehirlerin Türkleşmesine neden katkı sağladı?", tur: "iliski" },
    ],
  },
];

/** 3. adım: kaynak dosyası (birincil / ikincil) */
export const KAYNAK_DOSYASI = [
  { id: "kitabe", ad: "Sultanhanı'nın kapı kitabesi (1229)", tur: "birincil", konum: [33.55, 38.25],
    bilgi: "Hanın Sultan I. Alaeddin Keykubad adına 1229'da yapıldığını kaydeder.",
    neden: "Yapıyla aynı anda yazılmış, dönemin kendisine ait bir belgedir." },
  { id: "ibnibibi", ad: "İbni Bibi'nin Selçuknamesi (13. yüzyıl sonu)", tur: "birincil", konum: [32.48, 37.87],
    bilgi: "Antalya'nın (1207) ve Sinop'un (1214) fethini ve limanların önemini anlatır.",
    neden: "Yazar Selçuklu sarayında görev yapmış, dönemi yaşamış bir tarihçidir." },
  { id: "battuta", ad: "İbn Battuta'nın Seyahatnamesi (1330'lar)", tur: "birincil", konum: [30.71, 36.89],
    bilgi: "Antalya ve başka Anadolu şehirlerinde Ahilerin yolcuları zaviyelerinde ağırladığını anlatır.",
    neden: "Yazar anlattığı yerleri gezmiş bir görgü tanığıdır (dönemin hemen sonrası)." },
  { id: "sikke", ad: "Bir han kalıntısında bulunan 13. yüzyıl Selçuklu sikkesi", tur: "birincil", konum: [34.18, 38.44],
    bilgi: "Ticarette Selçuklu sultanları adına basılmış paraların kullanıldığını gösterir.",
    neden: "Dönemden kalma bir buluntudur; kalıntılar da birincil kaynaktır." },
  { id: "gevher", ad: "Gevher Nesibe Şifahanesi'nin kitabesi (1206)", tur: "birincil", konum: [35.49, 38.72],
    bilgi: "Şifahanenin I. Gıyaseddin Keyhüsrev tarafından kız kardeşi Gevher Nesibe adına yaptırıldığını kaydeder.",
    neden: "Yapının üzerindeki dönem yazısıdır." },
  { id: "kitap", ad: "Günümüz tarihçisinin Selçuklu ticaret yolları kitabı", tur: "ikincil", konum: null,
    bilgi: "Kervansarayların büyük bölümünün 13. yüzyılın ilk yarısında yapıldığını, kitabelere dayanarak derler.",
    neden: "Başka kaynaklardan yararlanarak sonradan yazılmıştır." },
  { id: "harita", ad: "Ders kitabındaki kervan yolları haritası", tur: "ikincil", konum: null,
    bilgi: "Konya, Kayseri ve Sivas'ın kervan yollarının kavşağında olduğunu gösterir.",
    neden: "Araştırmalara dayanılarak bugün hazırlanmıştır." },
  { id: "belgesel", ad: "Selçuklu kervansaraylarını anlatan bir belgesel", tur: "ikincil", konum: null,
    bilgi: "Kervansarayların mimarisini ve bugünkü hâllerini görüntülerle tanıtır.",
    neden: "Günümüzde, araştırmalara dayanılarak hazırlanmıştır." },
];

/** 4. adım: bilginin doğruluğu */
export const IDDIALAR = [
  { id: "blog", kaynak: "Yazarı belli olmayan bir blog (www.…-tarih-blog.com)", iddia: "“Selçuklular kervansarayları yalnızca askerler için yaptı.”",
    karar: "guvenilmez", aciklama: "Yazar ve kaynak gösterilmemiş; üstelik kitabeler ve seyyahlar hanlarda tüccarların ve yolcuların kaldığını gösteriyor." },
  { id: "makale", kaynak: "Bir üniversitenin (.edu.tr) dergisinde yayımlanmış, kaynakçalı makale", iddia: "“Kervansaraylar çoğunlukla yaklaşık bir günlük yol arayla sıralanır.”",
    karar: "guvenilir", aciklama: "Yazarı ve kaynakçası belli, hakemli bir yayın; iddia ölçümlere ve kitabelere dayanıyor." },
  { id: "dizi", kaynak: "Bir televizyon dizisinden sahne", iddia: "“Sultan, kervansarayın avlusunda düşmanıyla kılıç düellosu yaptı.”",
    karar: "guvenilmez", aciklama: "Diziler kurgu içerir; tarihî bilgi kaynağı olarak kullanılamaz." },
  { id: "sosyal", kaynak: "Sosyal medyada paylaşılan, kaynak belirtilmemiş bir görsel", iddia: "“Kervanların yolda uğradığı zararı devlet karşılardı.”",
    karar: "dogrulanmali", aciklama: "Ders kitaplarında da geçen bir bilgi olabilir ama görsel kaynak göstermiyor: başka güvenilir kaynaklarla karşılaştırılmalı." },
  { id: "kitabe", kaynak: "Sultanhanı'nın kapısındaki kitabe", iddia: "“Bu han hicrî 626 (miladi 1229) yılında yapıldı.”",
    karar: "guvenilir", aciklama: "Yapıyla aynı dönemde yazılmış birincil kaynaktır; tarih açıkça belirtilmiştir." },
  { id: "ansiklopedi", kaynak: "Herkesin düzenleyebildiği çevrim içi bir ansiklopedi maddesi", iddia: "“Sultanhanı, Anadolu'nun en büyük Selçuklu kervansaraylarından biridir.”",
    karar: "dogrulanmali", aciklama: "Bilgi doğru olabilir; ama maddeyi kimin yazdığı belli değil. Maddenin gösterdiği kaynaklara gidip kontrol et." },
];
export const KARARLAR = [
  { id: "guvenilir", ad: "Güvenilir" },
  { id: "dogrulanmali", ad: "Doğrulanmalı" },
  { id: "guvenilmez", ad: "Güvenilmez" },
];

/** 5. adım: Konya–Aksaray–Kayseri kervan yolu (temsilî güzergâh) ve bilinen hanlar (yaklaşık konum) */
export const KERVAN_YOLU = [
  [32.48, 37.87], [32.77, 38.03], [33.2, 38.13], [33.55, 38.25], [34.03, 38.37], [34.18, 38.44], [34.55, 38.6], [34.92, 38.73], [35.49, 38.72],
];
export const YOL_SEHIRLERI = [
  { ad: "Konya", konum: [32.48, 37.87] }, { ad: "Aksaray", konum: [34.03, 38.37] }, { ad: "Kayseri", konum: [35.49, 38.72] },
];
export const GERCEK_HANLAR = [
  { ad: "Zazadin Han", yil: "1236", konum: [32.77, 38.03] },
  { ad: "Obruk Han", yil: "13. yy", konum: [33.2, 38.13] },
  { ad: "Sultanhanı", yil: "1229", konum: [33.55, 38.25] },
  { ad: "Ağzıkara Han", yil: "1231–1239", konum: [34.18, 38.44] },
  { ad: "Sarıhan", yil: "1249", konum: [34.92, 38.73] },
];
export const GUNLUK_YOL = 40; // km: yüklü bir kervanın bir günde aldığı yaklaşık yol (30–40 km)

/** 6. adım: Ahilik örnek olayları */
export const AHI_OLAYLARI = [
  {
    durum: "Bir çırak ayakkabıyı aceleyle dikmiş; dikiş kusurlu ama müşteri fark etmemiş. Usta ne yapmalı?",
    siklar: ["Müşteri fark etmediğine göre satılabilir.", "Ayakkabı yeniden dikilir; çırağa işin doğrusu sabırla öğretilir.", "Çırak hemen işten çıkarılır."],
    dogru: 1, aciklama: "Ahilikte kusurlu mal satmak ayıptır; usta, çırağını hem meslekte hem ahlakta yetiştirmekle yükümlüdür.",
  },
  {
    durum: "Şehre yabancı bir yolcu geldi; kalacak yeri ve parası yok. Ahi zaviyesi ne yapar?",
    siklar: ["Yolcuyu misafir eder; yemek ve yatacak yer verir.", "Yolcudan konaklama ücreti ister.", "Yolcuyu yalnızca esnafsa kabul eder."],
    dogru: 0, aciklama: "İbn Battuta, Anadolu şehirlerinde Ahilerin yabancı yolcuları zaviyelerinde nasıl ağırladığını hayranlıkla anlatır.",
  },
  {
    durum: "Bir usta, mal kıtlığını fırsat bilip fiyatları çok yükseltmek istiyor.",
    siklar: ["Serbest piyasa: herkes istediği fiyatı koyar.", "Diğer ustalar da fiyatları yükseltir.", "Esnaf teşkilatı haksız kazancı engeller; fiyat ve kalite birlikte denetlenir."],
    dogru: 2, aciklama: "Ahi teşkilatı üretimi, fiyatı ve kaliteyi denetleyerek hem halkı hem dürüst esnafı korur.",
  },
  {
    durum: "Yıllarca çalışan bir kalfa, usta olmak istiyor. Bu nasıl olur?",
    siklar: ["Parası olan herkes dükkân açıp usta olabilir.", "Ustasının ve esnafın onayıyla, törenle usta olur; ahlakı da göz önünde tutulur.", "Sultanın emriyle usta olur."],
    dogru: 1, aciklama: "Çıraklıktan kalfalığa, kalfalıktan ustalığa geçiş, meslek bilgisi ve ahlakın birlikte sınandığı törenlerle yapılırdı.",
  },
];

/** 7. adım: Türk-İslam ve Batı (Latin Avrupa) medeniyetleri, 11.–13. yüzyıl */
export const MEDENIYET = [
  { metin: "Nizamiye medreseleri (ilki 1067, Bağdat) devlet desteğiyle kuruldu; öğrencilere burs ve yurt sağlandı.", kutu: "turk", yerler: ["bagdat"] },
  { metin: "Bologna, Paris ve Oxford'da ilk üniversiteler ortaya çıktı.", kutu: "bati", yerler: ["bologna", "paris", "oxford"] },
  { metin: "Eğitimde din bilimleri ağırlıktaydı; âlimler ve din adamları öğretimde belirleyiciydi.", kutu: "ikisi" },
  { metin: "Vakıfların yaşattığı darüşşifalarda hastalar ücretsiz tedavi edildi; bazıları tıp medresesiyle birlikte çalıştı.", kutu: "turk", yerler: ["kayseri", "divrigi"] },
  { metin: "Bilim ve eğitim dili Latinceydi.", kutu: "bati" },
  { metin: "Bilim dili büyük ölçüde Arapça, edebiyat ve yazışma dili çoğunlukla Farsçaydı; Türkçe halk arasında ve tasavvufi şiirde güçlendi.", kutu: "turk" },
  { metin: "12. yüzyılda Toledo'da (İspanya) Arapça bilim ve felsefe eserleri Latinceye çevrildi.", kutu: "bati", yerler: ["toledo"] },
  { metin: "Gotik katedraller şehirlerin simgesi oldu.", kutu: "bati", yerler: ["paris"] },
  { metin: "Cami, medrese ve kervansaraylarda taş işçiliği, çini ve geometrik süslemeler öne çıktı.", kutu: "turk", yerler: ["konya", "divrigi"] },
  { metin: "Cezeri 1206'da su saatlerini ve otomatik makineleri çizimleriyle anlatan bir kitap yazdı.", kutu: "turk", yerler: ["diyarbakir"] },
  { metin: "Hükümdarlar ve varlıklı kişiler bilim insanlarını ve sanatçıları destekledi.", kutu: "ikisi" },
];

/** 7. adımın haritasındaki merkezler */
export const MERKEZLER = {
  bagdat: { ad: "Bağdat", konum: [44.36, 33.31] }, konya: { ad: "Konya", konum: [32.48, 37.87] },
  kayseri: { ad: "Kayseri", konum: [35.49, 38.72] }, divrigi: { ad: "Divriği", konum: [38.12, 39.37] },
  diyarbakir: { ad: "Diyarbakır", konum: [40.23, 37.91] }, bologna: { ad: "Bologna", konum: [11.34, 44.49] },
  paris: { ad: "Paris", konum: [2.35, 48.86] }, oxford: { ad: "Oxford", konum: [-1.26, 51.75] },
  toledo: { ad: "Toledo", konum: [-4.02, 39.86] },
};

/** 8. adım: kanıt kartları — destekler: Türkleşme ve İslamlaşmaya etkisine kanıt mı? */
export const KANITLAR = [
  { id: "gevher", ad: "Gevher Nesibe Şifahanesi ve Tıp Medresesi", yer: "Kayseri", tarih: "1206", yil: 1206, konum: [35.49, 38.72], alan: "Sağlık ve eğitim", destekler: true },
  { id: "divrigi", ad: "Divriği Ulu Camii ve Darüşşifası", yer: "Sivas", tarih: "1228–1229", yil: 1229, konum: [38.12, 39.37], alan: "Sanat ve mimari", destekler: true },
  { id: "sultanhani", ad: "Sultanhanı kervansarayı", yer: "Aksaray", tarih: "1229", yil: 1229, konum: [33.55, 38.25], alan: "Sanat ve mimari", destekler: true },
  { id: "karatay", ad: "Karatay Medresesi", yer: "Konya", tarih: "1251", yil: 1251, konum: [32.49, 37.87], alan: "Eğitim", destekler: true },
  { id: "ahievran", ad: "Ahi Evran'ın zaviyesi ve esnaf teşkilatı", yer: "Kırşehir", tarih: "13. yy (Ahi Evran ö. 1261 dolayı)", yil: 1261, konum: [34.16, 39.15], alan: "Esnaf ve ahlak", destekler: true },
  { id: "hacibektas", ad: "Hacı Bektaş Veli'nin zaviyesi", yer: "Hacıbektaş (Nevşehir)", tarih: "13. yy (ö. 1270'ler)", yil: 1270, konum: [34.56, 38.94], alan: "Tasavvuf ve düşünce", destekler: true },
  { id: "cifte", ad: "Çifte Minareli Medrese", yer: "Sivas", tarih: "1271", yil: 1271, konum: [37.02, 39.75], alan: "Eğitim", destekler: true },
  { id: "mesnevi", ad: "Mevlana'nın Mesnevi'si", yer: "Konya", tarih: "1273'ten önce", yil: 1273, konum: [32.5, 37.88], alan: "Tasavvuf ve düşünce", destekler: true },
  { id: "yunus", ad: "Yunus Emre'nin Türkçe şiirleri", yer: "Sakarya çevresi", tarih: "13. yy sonu", yil: 1290, konum: [31.4, 39.6], alan: "Dil ve edebiyat", destekler: true },
  { id: "kosedag", ad: "Kösedağ'da Selçuklu ordusunun yenilgisi", yer: "Sivas", tarih: "1243", yil: 1243, konum: [38.05, 40.02], alan: "Askerî olay", destekler: false,
    neden: "Bu bir askerî olaydır; bilim, kültür ve sanattaki gelişmelere kanıt değildir." },
  { id: "latin", ad: "IV. Haçlı Seferi'nde İstanbul'un Latinlerce işgali", yer: "İstanbul", tarih: "1204", yil: 1204, konum: [28.98, 41.01], alan: "Askerî olay", destekler: false,
    neden: "Bizans'la Haçlılar arasındaki bir olaydır; Türk-İslam medeniyetinin Anadolu'daki etkisini göstermez." },
];
export const YARGILAR = [
  "Bu eserler Anadolu'yu birkaç yıl içinde tamamen Türk ve Müslüman bir ülke yaptı.",
  "Medrese, şifahane, zaviye ve vakıf eserleri yeni yerleşilen şehirlerde Türk-İslam kültürünü kalıcı kıldı; halkın bu kültürle tanışmasını sağlayarak Türkleşmeyi ve İslamlaşmayı hızlandırdı.",
  "Anadolu'nun Türkleşmesinde yalnızca savaşlar etkili oldu; kültürel eserlerin bir etkisi yoktu.",
];
export const DOGRU_YARGI = 1;

/** 9. adım: düşünürler ve eserleri (yaşam tarihleri yaklaşık; bazıları kaynaklarda tartışmalı) */
export const KISILER = [
  { id: "yesevi", ad: "Hoca Ahmed Yesevi", yasam: "ö. 1166", yer: "Yesi (Türkistan)", konum: [68.27, 43.3],
    eser: "Divan-ı Hikmet: tasavvufu halkın anlayacağı sade Türkçe hikmetlerle anlattı.",
    katki: "Türkçeyi düşünce ve tasavvuf dili hâline getirdi; öğrencileri Horasan'dan Anadolu'ya kadar ulaştı." },
  { id: "kasgarli", ad: "Kaşgarlı Mahmud", yasam: "11. yüzyıl", yer: "Kaşgar → Bağdat", konum: [75.99, 39.47],
    eser: "Divanü Lügati't-Türk: Türkçenin Arapça açıklamalı ilk büyük sözlüğü; Türk boylarını gösteren bir dünya haritası içerir.",
    katki: "Türk dilini ve kültürünü başka milletlere tanıttı; dilbilim ve harita tarihi için eşsiz bir kaynak bıraktı." },
  { id: "hayyam", ad: "Ömer Hayyam", yasam: "1048–1131", yer: "Nişabur", konum: [58.8, 36.21],
    eser: "Melikşah'ın rasathanesinde Celali takvimi çalışmalarına katıldı; cebir üzerine eser yazdı; rubaileriyle tanındı.",
    katki: "Çok hassas bir takvim hesabına ve cebirin gelişimine katkı yaptı." },
  { id: "cezeri", ad: "Cezeri", yasam: "12.–13. yüzyıl", yer: "Cizre → Diyarbakır", konum: [42.19, 37.33],
    eser: "1206'da tamamladığı kitapta su saatlerini ve otomatik makineleri çizimleriyle anlattı.",
    katki: "Otomatik kontrol ve makine tasarımının öncülerinden sayılır." },
  { id: "ibnularabi", ad: "İbnülarabi", yasam: "1165–1240", yer: "Endülüs → Konya, Malatya → Şam", konum: [36.29, 33.51],
    eser: "Fütuhat-ı Mekkiye ve Füsusü'l-Hikem; vahdet-i vücut düşüncesi.",
    katki: "İslam düşünce ve tasavvuf tarihinin en etkili eserlerinden bazılarını yazdı; Anadolu'daki öğrencileriyle Konya'yı bir düşünce merkezi yaptı." },
  { id: "mevlana", ad: "Mevlana Celaleddin Rumi", yasam: "1207–1273", yer: "Belh → Konya", konum: [32.5, 37.88],
    eser: "Mesnevi: sevgi, hoşgörü ve insanı anlatan Farsça şiirler.",
    katki: "Sevgi ve hoşgörü çağrısı bugün de pek çok dile çevrilerek okunuyor." },
  { id: "bektas", ad: "Hacı Bektaş Veli", yasam: "13. yüzyıl", yer: "Horasan → Hacıbektaş", konum: [34.56, 38.94],
    eser: "Makalat; “Eline, beline, diline sahip ol” öğüdüyle bilinir.",
    katki: "Türkmenler arasında ahlak, kardeşlik ve birlikte yaşama öğütlerini yaydı." },
  { id: "yunus", ad: "Yunus Emre", yasam: "13. yy – 14. yy başı", yer: "Sakarya çevresi", konum: [31.4, 39.6],
    eser: "Türkçe şiirleri (Divan) ve Risaletü'n-Nushiyye; insan sevgisini sade Türkçeyle anlattı.",
    katki: "Anadolu Türkçesinin bir edebiyat dili olmasına büyük katkı yaptı." },
  { id: "ibnibibi", ad: "İbni Bibi", yasam: "13. yüzyıl", yer: "Konya (Selçuklu sarayı)", konum: [32.48, 37.87],
    eser: "El-Evamirü'l-Alaiyye (Selçukname): Türkiye Selçuklu tarihinin temel kaynaklarından.",
    katki: "Dönemin olaylarını içeriden anlatan bir tarih eseri bıraktı." },
];
