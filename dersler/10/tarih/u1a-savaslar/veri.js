// 10. Sınıf Tarih · 1. Ünite (1040–1299) — 1. ders verileri. Tüm koordinatlar [boylam, enlem].
// Savaş yerlerinin bir kısmı (Dandanakan, Miryokefalon, Kösedağ) kaynaklarda tartışmalıdır: "yaklaşık" işaretlidir.
// Tarihler ve konumlar tests/tar10-u1a-savaslar.test.mjs ile tutarlılık açısından denetlenir.

export const DONEM = { bas: 1040, son: 1299 };

/** Harita etkinliklerinin kapsadığı coğrafya: Anadolu, Suriye–Filistin, İran, Orta Asya */
export const KUTU = [[26, 29.5], [78, 44.5]];

export const SAVASLAR = [
  {
    id: "dandanakan", ad: "Dandanakan Savaşı", kisa: "Dandanakan", yil: 1040, konum: [61.75, 37.3], yaklasik: true,
    yer: "Horasan; Merv ile Serahs arası (bugün Türkmenistan)",
    taraflar: "Selçuklular (Tuğrul ve Çağrı Beyler) – Gazneliler (Sultan Mesud)",
    sonuc: "Büyük Selçuklu Devleti resmen kuruldu; Horasan Selçukluların eline geçti.",
    ozet: "Gazneli ordusu Horasan çölünde yorgun ve susuz düştü; Selçuklular kesin bir zafer kazandı. Savaştan sonra toplanan kurultayda Tuğrul Bey hükümdar seçildi ve Abbasi halifesine zafer bildirildi.",
    rozet: [0, -32],
  },
  {
    id: "pasinler", ad: "Pasinler Savaşı", kisa: "Pasinler", yil: 1048, konum: [41.68, 39.98],
    yer: "Pasinler Ovası, Erzurum yakınları",
    taraflar: "Selçuklular (İbrahim Yınal ve Kutalmış) – Bizans ve Gürcü kuvvetleri",
    sonuc: "Selçukluların Bizans'a karşı kazandığı ilk büyük meydan savaşı oldu; Anadolu'ya Türkmen akınları yoğunlaştı.",
    ozet: "Doğu Anadolu'daki bu zaferle Bizans'ın doğu savunması sarsıldı. Esir düşen Gürcü komutan Liparit, Tuğrul Bey tarafından fidye alınmadan serbest bırakıldı.",
    rozet: [12, -34],
  },
  {
    id: "malazgirt", ad: "Malazgirt Meydan Muharebesi", kisa: "Malazgirt", yil: 1071, tarih: "26 Ağustos 1071", konum: [42.53, 39.14],
    yer: "Malazgirt Ovası, Muş (Van Gölü'nün kuzeyi)",
    taraflar: "Büyük Selçuklu (Sultan Alparslan) – Bizans (İmparator Romen Diyojen)",
    sonuc: "Anadolu'nun kapıları Türklere açıldı; Türkmenler Anadolu'ya kalıcı olarak yerleşmeye başladı.",
    ozet: "Bizans ordusundaki Uz ve Peçenek Türklerinin Selçuklu tarafına geçmesi ve Türklerin sahte geri çekilme (hilal) taktiği sonucu belirledi. Esir düşen imparatorla antlaşma yapılıp serbest bırakıldı.",
    rozet: [24, 26],
  },
  {
    id: "hacli", ad: "I. Haçlı Seferi", kisa: "I. Haçlı Seferi", yil: 1096, bitis: 1099, konum: [29.72, 40.43],
    yer: "Anadolu üzerinden Kudüs'e; İznik (1097) ve Kudüs (1099)",
    taraflar: "Haçlı orduları – Türkiye Selçukluları (I. Kılıç Arslan) ve bölgedeki Müslüman devletler",
    sonuc: "İznik kaybedildi, Türkiye Selçuklularının merkezi Konya'ya taşındı; Kudüs 1099'da Haçlıların eline geçti.",
    ozet: "Papa'nın çağrısıyla Avrupa'dan yola çıkan Haçlılar, Bizans'ın da desteğiyle Anadolu'yu geçti. Türklerin Batı Anadolu'daki ilerleyişi bir süre durdu.",
    rozet: [-30, -22],
  },
  {
    id: "miryokefalon", ad: "Miryokefalon Savaşı", kisa: "Miryokefalon", yil: 1176, tarih: "17 Eylül 1176", konum: [30.75, 38.15], yaklasik: true,
    yer: "Eğirdir Gölü'nün kuzeyi, Denizli–Isparta arası (kesin yeri tartışmalı)",
    taraflar: "Türkiye Selçuklu (II. Kılıç Arslan) – Bizans (İmparator I. Manuel Komnenos)",
    sonuc: "Bizans'ın Türkleri Anadolu'dan çıkarma umudu sona erdi; Anadolu'nun Türk yurdu olduğu kesinleşti.",
    ozet: "Bizans ordusu dar bir dağ geçidinde pusuya düşürüldü. Bizans bundan sonra Anadolu'da savunmaya çekildi.",
    rozet: [-34, 20],
  },
  {
    id: "hittin", ad: "Hıttin Muharebesi ve Kudüs'ün fethi", kisa: "Hıttin", yil: 1187, tarih: "4 Temmuz 1187", konum: [35.45, 32.8],
    yer: "Hıttin, Taberiye (Celile) Gölü'nün batısı; ardından Kudüs (2 Ekim 1187)",
    taraflar: "Eyyubiler (Selahaddin Eyyubi) – Kudüs Haçlı Krallığı",
    sonuc: "Kudüs yeniden fethedildi; Avrupa III. Haçlı Seferi'ni düzenledi.",
    ozet: "Yaz sıcağında su kaynaklarından uzakta kuşatılan Haçlı ordusu yenildi. Kudüs'ün teslim alınmasında halkın canına dokunulmadı.",
    rozet: [-34, 8],
  },
  {
    id: "kosedag", ad: "Kösedağ Savaşı", kisa: "Kösedağ", yil: 1243, konum: [38.05, 40.02], yaklasik: true,
    yer: "Kösedağ, Sivas (Zara–Suşehri arası)",
    taraflar: "Türkiye Selçuklu (II. Gıyaseddin Keyhüsrev) – Moğollar (Baycu Noyan)",
    sonuc: "Türkiye Selçukluları Moğol (İlhanlı) hâkimiyetine girdi; zamanla Anadolu'da beylikler dönemi başladı.",
    ozet: "Selçuklu ordusu Moğollar karşısında ağır bir yenilgi aldı. Moğol baskısından kaçan Türkmenler Batı Anadolu'daki uç bölgelerine yığıldı.",
    rozet: [-30, -30],
  },
];

/** Zaman kaydırıcısında görünen diğer olaylar (savaşlar SAVASLAR'dan eklenir) */
export const OLAYLAR = [
  { id: "bagdat", yil: 1055, kisa: "Bağdat", metin: "Tuğrul Bey Abbasi halifesinin çağrısıyla Bağdat'a girdi; Selçuklular İslam dünyasının siyasi liderliğini üstlendi.", konum: [44.37, 33.31] },
  { id: "tsd", yil: 1075, kisa: "Türkiye Selçuklu", metin: "Kutalmışoğlu Süleyman Şah, İznik merkezli Türkiye Selçuklu Devleti'ni kurdu (kuruluş için 1075 ve 1077 tarihleri verilir).", konum: [29.72, 40.43] },
  { id: "meliksah", yil: 1092, kisa: "Melikşah ölür", metin: "Sultan Melikşah ve veziri Nizamülmülk öldü; Büyük Selçuklu'da taht kavgaları başladı.", konum: [51.67, 32.65] },
  { id: "sencer", yil: 1157, kisa: "Sencer ölür", metin: "Sultan Sencer'in ölümüyle Büyük Selçuklu Devleti sona erdi.", konum: [62.19, 37.66] },
  { id: "antalya", yil: 1207, kisa: "Antalya", metin: "Antalya fethedildi; Türkiye Selçukluları Akdeniz ticaretine açıldı (Sinop 1214, Alanya 1221).", konum: [30.71, 36.89] },
  { id: "osmanli", yil: 1299, kisa: "Osmanlı", metin: "Söğüt çevresindeki Osmanlı Beyliği'nin kuruluşu (geleneksel tarih).", konum: [30.18, 40.02] },
];

export const SEHIRLER = [
  { ad: "Merv", konum: [62.19, 37.66] }, { ad: "Nişabur", konum: [58.8, 36.21] }, { ad: "Buhara", konum: [64.42, 39.77] },
  { ad: "Semerkant", konum: [66.96, 39.65] }, { ad: "Kaşgar", konum: [75.99, 39.47] }, { ad: "Gazne", konum: [68.42, 33.55] },
  { ad: "Rey", konum: [51.44, 35.59] }, { ad: "İsfahan", konum: [51.67, 32.65] }, { ad: "Tebriz", konum: [46.29, 38.08] },
  { ad: "Bağdat", konum: [44.37, 33.31] }, { ad: "Konya", konum: [32.48, 37.87] }, { ad: "İznik", konum: [29.72, 40.43] },
  { ad: "Kayseri", konum: [35.49, 38.72] }, { ad: "Sivas", konum: [37.02, 39.75] }, { ad: "Erzurum", konum: [41.27, 39.9] },
  { ad: "Konstantinopolis", konum: [28.98, 41.01] }, { ad: "Antakya", konum: [36.16, 36.2] }, { ad: "Şam", konum: [36.29, 33.51] },
  { ad: "Kudüs", konum: [35.23, 31.78] },
];

export const BOLGE_ADLARI = [
  { ad: "Maveraünnehir", konum: [65.5, 41.3] }, { ad: "Horasan", konum: [59.5, 35.0] }, { ad: "Anadolu", konum: [33, 40.3] },
  { ad: "Irak", konum: [44.5, 31.2] }, { ad: "Azerbaycan", konum: [47.5, 39.6] }, { ad: "Suriye", konum: [38.2, 34.6] },
];

/** Temsilî hâkimiyet alanları (elle çizildi; kaba yaklaşım) */
export const ALANLAR = [
  { id: "sel-horasan", etiket: [60.5, 34.1], bas: 1040, son: 1054, ad: "Selçuklular (Horasan)", renk: "#ffb547",
    halka: [[56.5, 35.2], [59, 34.6], [62.5, 35], [64.5, 36.5], [64.5, 38.3], [62.5, 39.6], [59.5, 39.3], [57, 38]] },
  { id: "bsd-1", etiket: [51, 33.3], bas: 1055, son: 1071, ad: "Büyük Selçuklu", renk: "#ffb547",
    halka: [[44, 36.8], [44.2, 33], [47.5, 31], [50.5, 29.5], [54, 28.5], [58, 28.5], [61.5, 30.5], [63.5, 34], [65.5, 37], [64, 39.8], [60, 40], [56, 38.8], [53.5, 37.2], [49.5, 37.6], [47, 39.2], [44.8, 39.5]] },
  { id: "bsd-2", etiket: [55, 31.5], bas: 1072, son: 1092, ad: "Büyük Selçuklu (Melikşah dönemi)", renk: "#ffb547",
    halka: [[38.5, 39], [35.8, 37.2], [36.2, 33.5], [35.5, 31.8], [38.5, 30], [43, 29.5], [47.8, 29.8], [50.5, 28.8], [54, 27], [57.5, 26.5], [61.5, 27], [63, 30], [66, 33.5], [68.5, 36.6], [71.5, 37.5], [73.5, 39.5], [72, 41.5], [69, 42.8], [65, 42.5], [61, 41.5], [58, 40.8], [55, 40.5], [53.5, 37.3], [50, 37.5], [48.8, 40.5], [46, 41.6], [43, 41.2], [40.5, 40.5]] },
  { id: "bsd-3", etiket: [60, 33], bas: 1093, son: 1157, ad: "Büyük Selçuklu (taht kavgaları sonrası, Sencer)", renk: "#ffb547",
    halka: [[52, 35], [56, 31], [61, 30], [64, 33], [67, 36.5], [69, 39.5], [66, 41.5], [60, 41], [55, 39], [52.5, 37.5]] },
  { id: "tsd-1", etiket: [31.5, 39.3], bas: 1075, son: 1096, ad: "Türkiye Selçuklu (İznik)", renk: "#5ad38b",
    halka: [[28.8, 40.7], [30.5, 41], [32, 40.8], [33.5, 40.2], [34.5, 38.8], [33.5, 37.6], [31.5, 37.6], [30, 38.3], [28.8, 39.3]] },
  { id: "tsd-2", etiket: [32.8, 38.4], bas: 1097, son: 1175, ad: "Türkiye Selçuklu (Konya)", renk: "#5ad38b",
    halka: [[30.8, 39.6], [32.6, 39.8], [34.3, 39.5], [35.2, 38.5], [34.6, 37.3], [33, 36.9], [31.6, 37.3], [30.6, 38.2]] },
  { id: "tsd-3", etiket: [34, 36.6], bas: 1176, son: 1206, ad: "Türkiye Selçuklu", renk: "#5ad38b",
    halka: [[29.8, 38.4], [30.6, 39.8], [32.5, 40.3], [35, 40.5], [37.5, 40.3], [39, 39.6], [39, 38.2], [37, 37.6], [35, 37.2], [33, 37.1], [31, 37.4]] },
  { id: "tsd-4", etiket: [34.2, 35.6], bas: 1207, son: 1242, ad: "Türkiye Selçuklu (en geniş)", renk: "#5ad38b",
    halka: [[29.5, 38.5], [30.3, 39.7], [31.8, 40.6], [34.5, 41.2], [35.2, 42.0], [36.5, 41.4], [38.5, 40.6], [40.5, 40.6], [42.5, 40.2], [42.5, 38.9], [40, 38], [38, 37.5], [36.3, 36.9], [34.5, 36.3], [32.2, 36.2], [30.7, 36.6], [29.6, 37.2]] },
  { id: "tsd-5", etiket: [34.2, 35.6], bas: 1243, son: 1299, ad: "Türkiye Selçuklu (Moğol denetiminde)", renk: "#ff6b6b",
    halka: [[29.5, 38.5], [30.3, 39.7], [31.8, 40.6], [34.5, 41.2], [35.2, 42.0], [36.5, 41.4], [38.5, 40.6], [40.5, 40.6], [42.5, 40.2], [42.5, 38.9], [40, 38], [38, 37.5], [36.3, 36.9], [34.5, 36.3], [32.2, 36.2], [30.7, 36.6], [29.6, 37.2]] },
];

/** Göç ve sefer okları (temsilî): renk sarı = Türkmen göçü, mor = Haçlı, kırmızı = Moğol */
export const OKLAR = [
  { bas: 1040, son: 1299, renk: "sari", yol: [[64.42, 39.77], [62.6, 38.2]], ad: "Maveraünnehir'den Horasan'a" },
  { bas: 1045, son: 1299, renk: "sari", yol: [[61.5, 37.4], [47, 38.3]], ad: "Horasan'dan Azerbaycan'a" },
  { bas: 1071, son: 1299, renk: "sari", yol: [[45.6, 38.8], [36.2, 38.9]], ad: "Malazgirt sonrası Anadolu'ya" },
  { bas: 1075, son: 1299, renk: "sari", yol: [[35.2, 39.2], [30.4, 40.2]], ad: "Batı Anadolu'ya" },
  { bas: 1096, son: 1099, renk: "mor", yol: [[28.98, 41.01], [29.9, 40.2], [36.16, 36.2], [35.23, 31.9]], ad: "I. Haçlı Seferi" },
  { bas: 1243, son: 1299, renk: "kirmizi", yol: [[46.29, 38.08], [38.6, 39.95]], ad: "Moğol ilerleyişi" },
  { bas: 1243, son: 1299, renk: "sari", yol: [[34.5, 38.6], [30.6, 39.6]], ad: "Uç bölgelerine Türkmen göçü" },
];

/** 5. adım: savaşta ve fetihte merhamet — kaynakların özgün özetleri (alıntı değildir) */
export const KAYNAKLAR = [
  {
    id: "liparit", savas: "pasinler", baslik: "Esir komutana fidyesiz özgürlük (1048)",
    kunye: "Kaynak: Bizanslı tarihçi İoannes Skylitzes'in kroniği (11. yüzyılın sonu). Metin, kaynağın kısa ve özgün bir özetidir.",
    metin: "Pasinler'de esir düşen Gürcü komutan Liparit için Bizans imparatoru Tuğrul Bey'e fidye ve hediyeler gönderir. Tuğrul Bey fidyeyi geri çevirir, Liparit'i serbest bırakır ve ondan yalnızca bir daha Türklere karşı savaşmamasını ister.",
    tur: "birincil", turAciklama: "Yazar olayla aynı yüzyılda yaşamış bir Bizanslıdır: döneme ait (birincil) bir kaynaktır. Üstelik karşı tarafın kaynağıdır; Türk hükümdarını övmek için bir nedeni yoktur.",
    davranis: 0,
  },
  {
    id: "romen", savas: "malazgirt", baslik: "Esir imparatora saygı (1071)",
    kunye: "Kaynak: Malazgirt seferinde Bizans ordusuyla birlikte bulunan Mihail Attaleiates'in Tarih'i. Metin, kaynağın kısa ve özgün bir özetidir.",
    metin: "Esir düşen İmparator Romen Diyojen sultanın huzuruna getirilir. Alparslan onu ayağa kaldırır, çadırında ağırlar ve sofrasına oturtur. Bir antlaşma yapıldıktan sonra imparator, yanına muhafızlar verilerek ülkesine gönderilir.",
    tur: "birincil", turAciklama: "Yazar sefere bizzat katılmış bir görgü tanığıdır: birincil kaynak.",
    davranis: 1,
  },
  {
    id: "kudus", savas: "hittin", baslik: "Kudüs halkına can güvenliği (1187)",
    kunye: "Kaynak: Selahaddin'in katibi İmadüddin el-İsfahani'nin anlatımı; olay Haçlı kaynaklarında da geçer. Metin, kaynağın kısa ve özgün bir özetidir.",
    metin: "Kudüs teslim olunca şehirdeki Hristiyanların canına dokunulmaz. Belirlenen fidyeyi ödeyenler eşyalarıyla şehirden çıkar; ödeyemeyen yoksulların bir kısmı fidye alınmadan bırakılır. Oysa 1099'da Haçlılar şehri aldığında büyük bir katliam yapmıştı.",
    tur: "birincil", turAciklama: "Yazar olayların tanığıdır. Selahaddin'in yanında bulunduğu için taraflı olabilir; ama aynı olayın Haçlı kaynaklarında da anlatılması bilgiyi güçlendirir.",
    davranis: 2,
  },
  {
    id: "kitap", savas: null, baslik: "Bir ders kitabından",
    kunye: "Kaynak: Günümüzde yazılmış bir tarih ders kitabı.",
    metin: "Türk hükümdarlarının savaş sonrasında esirlere ve sivil halka merhametli davrandığına dair örnekler, hem Türk hem de Bizans ve Haçlı kaynaklarında yer alır.",
    tur: "ikincil", turAciklama: "Olaylardan yüzyıllar sonra, başka kaynaklara dayanılarak yazılmıştır: ikincil kaynak.",
    davranis: 3,
  },
];
export const DAVRANISLAR = [
  "Esir komutanı fidye almadan serbest bırakma",
  "Esir hükümdara saygıyla davranıp antlaşmayla serbest bırakma",
  "Fethedilen şehrin sivil halkına can güvenliği tanıma",
  "Birden çok kaynağa dayanarak genel bir değerlendirme yapma",
];

/** 6. adım: karşılaştırma tabloları (Venn) */
export const KARSILASTIRMALAR = [
  {
    a: "malazgirt", b: "miryokefalon",
    ifadeler: [
      { metin: "Bizans'a karşı yapıldı.", kutu: "ortak" },
      { metin: "Türk tarafının kazandığı bir zaferdir.", kutu: "ortak" },
      { metin: "Anadolu'nun Türkleşmesini hızlandırdı.", kutu: "ortak" },
      { metin: "Büyük Selçuklu Devleti döneminde yapıldı.", kutu: "a" },
      { metin: "Türkiye Selçuklu Devleti döneminde yapıldı.", kutu: "b" },
      { metin: "Anadolu'nun kapılarını Türklere açtı.", kutu: "a" },
      { metin: "Bizans'ın Anadolu'yu geri alma umudunu sona erdirdi.", kutu: "b" },
      { metin: "Bizans ordusundaki Uz ve Peçenek askerlerinin Türk tarafına geçmesi sonucu etkiledi.", kutu: "a" },
      { metin: "Bizans ordusu dar bir dağ geçidinde pusuya düşürüldü.", kutu: "b" },
    ],
  },
  {
    a: "malazgirt", b: "kosedag",
    ifadeler: [
      { metin: "Hükümdarın bizzat komuta ettiği bir meydan savaşıdır.", kutu: "ortak" },
      { metin: "Anadolu'ya yeni Türkmen göçlerine yol açtı.", kutu: "ortak", ipucu: "Kösedağ bir yenilgidir ama Moğol baskısından kaçan Türkmenler de Anadolu'nun batısına göç etti." },
      { metin: "Türk ordusunun yenildiği bir savaştır.", kutu: "b" },
      { metin: "Moğollara karşı yapıldı.", kutu: "b" },
      { metin: "Anadolu'nun kapılarını Türklere açtı.", kutu: "a" },
      { metin: "Sonucunda Türkiye Selçukluları başka bir devletin hâkimiyetine girdi.", kutu: "b" },
      { metin: "Anadolu'da siyasi birliğin bozulmasına ve beyliklerin ortaya çıkmasına zemin hazırladı.", kutu: "b" },
      { metin: "Bizans'a karşı kazanıldı.", kutu: "a" },
    ],
  },
];

/** 7. adım: devlet ve ordu teşkilatında değişim ve süreklilik */
export const TESKILAT = [
  { id: "kut", metin: "Hükümdarlık yetkisinin Tanrı tarafından verildiğine inanılması (kut anlayışı)", kutu: "sureklilik", alan: "hukumdarlik",
    aciklama: "İslamiyet'ten sonra da hükümdarın yetkisini Allah'tan aldığı düşüncesi sürdü." },
  { id: "ortakmal", metin: "Ülkenin hanedan üyelerinin ortak malı sayılması", kutu: "sureklilik", alan: "hukumdarlik",
    aciklama: "Bu eski veraset anlayışı sürdü; hükümdar ölünce şehzadeler arasında taht kavgaları yaşandı." },
  { id: "sultan", metin: "Hükümdarın kağan yerine sultan unvanını kullanması", kutu: "degisim", alan: "hukumdarlik",
    aciklama: "Sultan unvanı İslam dünyasında siyasi gücü gösterir; Tuğrul Bey'e Abbasi halifesi tarafından unvan verildi." },
  { id: "hutbe", metin: "Hutbe okutmanın ve sikke bastırmanın hükümdarlık alameti olması", kutu: "degisim", alan: "hukumdarlik",
    aciklama: "Bunlar İslam devlet geleneğinden gelen yeni alametlerdir." },
  { id: "semboller", metin: "Taht, otağ, tuğ ve davul (nevbet) gibi hükümdarlık sembollerinin sürmesi", kutu: "sureklilik", alan: "hukumdarlik",
    aciklama: "Bu semboller İslamiyet öncesi Türk devletlerinden beri kullanılıyordu." },
  { id: "divan", metin: "Devlet işlerinin Büyük Divan'da (Divan-ı Saltanat) görüşülmesi", kutu: "sureklilik", alan: "merkez",
    aciklama: "Büyük Divan, eski Türklerdeki kurultay geleneğinin devamıdır." },
  { id: "vezir", metin: "Vezirlik makamının ve yazılı divan bürokrasisinin güçlenmesi", kutu: "degisim", alan: "merkez",
    aciklama: "Yerleşik İran ve Irak topraklarını yönetmek için vezir ve katiplerden oluşan bir bürokrasi gelişti (ör. Nizamülmülk)." },
  { id: "ikta", metin: "Toprağın vergi gelirinin, hizmet karşılığında askerlere ve devlet görevlilerine verilmesi (ikta)", kutu: "degisim", alan: "ekonomi",
    aciklama: "İkta sistemi Büyük Selçuklularda yaygınlaştı; hem ordunun hem vergi düzeninin temeli oldu." },
  { id: "turan", metin: "Atlı okçulardan oluşan hafif süvari ve sahte geri çekilmeye dayanan hilal (Turan) taktiği", kutu: "sureklilik", alan: "ordu",
    aciklama: "Bu savaş tarzı Hunlardan beri sürüyordu; Malazgirt'te de kullanıldı." },
  { id: "gulam", metin: "Küçük yaşta alınıp eğitilen gulamlardan oluşan saray muhafızları", kutu: "degisim", alan: "ordu",
    aciklama: "Gulam sistemi Gazneli ve Selçuklu ordularında hükümdara bağlı, maaşlı bir çekirdek ordu oluşturdu." },
];
export const ALANLAR_TESKILAT = [
  { id: "hukumdarlik", ad: "Hükümdarlık ve veraset" },
  { id: "merkez", ad: "Merkez teşkilatı" },
  { id: "ordu", ad: "Ordu" },
  { id: "ekonomi", ad: "Toprak ve vergi düzeni" },
];

/** 9. adım: neden–sonuç zincirleri (doğru sırada) */
export const ZINCIRLER = [
  {
    baslik: "Veraset anlayışı ve parçalanma",
    halkalar: [
      "Ülke, hanedan üyelerinin ortak malı sayılır.",
      "Şehzadeler melik olarak farklı bölgelerin yönetimine gönderilir.",
      "Melikşah 1092'de ölünce şehzadeler taht için mücadeleye girişir.",
      "Merkezî otorite zayıflar; atabeyler ve yerel güçler bağımsızlaşır.",
      "Büyük Selçuklu Devleti parçalanır ve Sencer'in ölümüyle (1157) sona erer.",
    ],
  },
  {
    baslik: "Yerleşik topraklar ve bürokrasi",
    halkalar: [
      "Selçuklular İran ve Irak gibi kalabalık, yerleşik toprakları ele geçirir.",
      "Bu toprakları yönetmek için yazılı kayıt ve düzenli vergi toplama ihtiyacı doğar.",
      "Vezirlik ve divan teşkilatı güçlenir; Nizamülmülk devlet düzenini kurar.",
      "Devlete görevli yetiştirmek için Nizamiye medreseleri açılır (ilki 1067, Bağdat).",
      "Türk, İslam ve İran devlet gelenekleri birleşerek sonraki Türk devletlerine örnek olan bir yapı oluşur.",
    ],
  },
];
