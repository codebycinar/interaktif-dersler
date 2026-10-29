// Felsefenin Doğası — zaman çizelgesi ve harita verisi (tests/fel10-u1-felsefenin-dogasi.test.mjs denetler)
// Yıllar: MÖ negatif, MS pozitif. Doğum/ölüm tarihi tartışmalı olanlar "yaklasik: true".

export const GELENEKLER = [
  { id: "hint", ad: "Hint", renk: "#ff9f43" },
  { id: "cin", ad: "Çin", renk: "#ff6b6b" },
  { id: "yunan", ad: "Antik Yunan", renk: "#4fc3f7" },
  { id: "islam", ad: "Türk-İslam", renk: "#5ad38b" },
  { id: "fransiz", ad: "Fransız", renk: "#b89cff" },
  { id: "alman", ad: "Alman", renk: "#ffd166" },
  { id: "anglo", ad: "Anglosakson", renk: "#f78fb3" },
  { id: "amerikan", ad: "Amerikan", renk: "#7dd3c0" },
];

// tur: "kisi" (yaşam süresi) | "metin" (bir eser ya da metin geleneğinin yazıldığı dönem)
export const DUSUNURLER = [
  { id: "upanisad", ad: "Upanişadlar", gelenek: "hint", bas: -800, bit: -500, tur: "metin", yaklasik: true, fikir: "Bireysel benlik (atman) ile evrenin özü (brahman) arasındaki ilişkiyi soran metinler." },
  { id: "buda", ad: "Buda", gelenek: "hint", bas: -563, bit: -483, tur: "kisi", yaklasik: true, fikir: "Acının nedenini ve ondan kurtuluş yolunu sorguladı." },
  { id: "nagarjuna", ad: "Nāgārjuna", gelenek: "hint", bas: 150, bit: 250, tur: "kisi", yaklasik: true, fikir: "Hiçbir şeyin kendi başına, bağımsız bir özü olmadığını savundu." },
  { id: "laozi", ad: "Laozi", gelenek: "cin", bas: -571, bit: -471, tur: "kisi", yaklasik: true, fikir: "Doğanın akışına (Tao) uyumlu yaşamayı öğütledi; yaşadığı dönem tartışmalıdır." },
  { id: "konfucyus", ad: "Konfüçyüs", gelenek: "cin", bas: -551, bit: -479, tur: "kisi", fikir: "Erdemli birey ve uyumlu toplum için ahlaki ilişkileri sorguladı." },
  { id: "mengzi", ad: "Mencius", gelenek: "cin", bas: -372, bit: -289, tur: "kisi", yaklasik: true, fikir: "İnsan doğasının iyiye yatkın olduğunu savundu." },
  { id: "thales", ad: "Thales", gelenek: "yunan", bas: -624, bit: -546, tur: "kisi", yaklasik: true, fikir: "Milet'te “Her şeyin ana maddesi (arkhe) nedir?” diye sordu; cevabı: su." },
  { id: "herakleitos", ad: "Herakleitos", gelenek: "yunan", bas: -535, bit: -475, tur: "kisi", yaklasik: true, fikir: "Efesli düşünür: her şey değişir, aynı ırmakta iki kez yıkanılmaz." },
  { id: "sokrates", ad: "Sokrates", gelenek: "yunan", bas: -470, bit: -399, tur: "kisi", fikir: "Soru sorarak (diyalektik) kavramları sınadı: “Sorgulanmamış hayat yaşanmaya değmez.”" },
  { id: "platon", ad: "Platon", gelenek: "yunan", bas: -427, bit: -347, tur: "kisi", fikir: "Sokrates'in öğrencisi; idealar kuramı ve Akademia." },
  { id: "aristoteles", ad: "Aristoteles", gelenek: "yunan", bas: -384, bit: -322, tur: "kisi", fikir: "Platon'un öğrencisi; mantığı sistemleştirdi, varlığın ilk nedenlerini araştırdı." },
  { id: "kindi", ad: "Kindî", gelenek: "islam", bas: 801, bit: 873, tur: "kisi", yaklasik: true, fikir: "İslam dünyasının ilk büyük filozofu kabul edilir; felsefe ile din arasında uyum aradı." },
  { id: "farabi", ad: "Fârâbî", gelenek: "islam", bas: 870, bit: 950, tur: "kisi", yaklasik: true, fikir: "“Muallim-i Sânî” (ikinci öğretmen); erdemli şehir (el-Medînetü'l-fâzıla) üzerine yazdı." },
  { id: "ibnsina", ad: "İbn Sînâ", gelenek: "islam", bas: 980, bit: 1037, tur: "kisi", fikir: "Varlığı zorunlu ve mümkün diye ayırdı; tıp ve felsefede yüzyıllarca okutuldu." },
  { id: "kutadgu", ad: "Kutadgu Bilig", gelenek: "islam", bas: 1069, bit: 1070, tur: "metin", fikir: "Yusuf Has Hâcib'in eseri: mutluluğa götüren bilgi, adalet ve devlet yönetimi." },
  { id: "gazali", ad: "Gazâlî", gelenek: "islam", bas: 1058, bit: 1111, tur: "kisi", fikir: "Şüpheyi bir yöntem olarak kullandı; filozofların görüşlerini eleştirdi." },
  { id: "ibnrusd", ad: "İbn Rüşd", gelenek: "islam", bas: 1126, bit: 1198, tur: "kisi", fikir: "Aristoteles şerhleriyle Avrupa'da da tanındı; akıl ile vahyin çelişmediğini savundu." },
  { id: "kinalizade", ad: "Kınalızâde", gelenek: "islam", bas: 1510, bit: 1572, tur: "kisi", fikir: "Osmanlı ahlak felsefecisi; Ahlâk-ı Alâî adlı eseri yazdı." },
  { id: "descartes", ad: "Descartes", gelenek: "fransiz", bas: 1596, bit: 1650, tur: "kisi", fikir: "Her şeyden şüphe ederek kesin bir başlangıç aradı: “Düşünüyorum, öyleyse varım.”" },
  { id: "voltaire", ad: "Voltaire", gelenek: "fransiz", bas: 1694, bit: 1778, tur: "kisi", fikir: "Aydınlanma düşünürü; hoşgörü ve düşünce özgürlüğünü savundu." },
  { id: "sartre", ad: "Sartre", gelenek: "fransiz", bas: 1905, bit: 1980, tur: "kisi", fikir: "İnsanın özgür olmaya mahkûm olduğunu ve kendini seçimleriyle kurduğunu savundu." },
  { id: "leibniz", ad: "Leibniz", gelenek: "alman", bas: 1646, bit: 1716, tur: "kisi", fikir: "Evrenin yalın birimlerden (monadlar) oluştuğunu düşündü; matematikçi." },
  { id: "kant", ad: "Kant", gelenek: "alman", bas: 1724, bit: 1804, tur: "kisi", fikir: "Aklın sınırlarını araştırdı: “Ne bilebilirim? Ne yapmalıyım? Neyi umabilirim?”" },
  { id: "hegel", ad: "Hegel", gelenek: "alman", bas: 1770, bit: 1831, tur: "kisi", fikir: "Tarihi ve düşünceyi diyalektik bir gelişme olarak açıkladı." },
  { id: "nietzsche", ad: "Nietzsche", gelenek: "alman", bas: 1844, bit: 1900, tur: "kisi", fikir: "Geleneksel değerleri yeniden sorgulamaya çağırdı." },
  { id: "bacon", ad: "F. Bacon", gelenek: "anglo", bas: 1561, bit: 1626, tur: "kisi", fikir: "Bilginin gözlem ve deneyle kurulmasını savundu; zihnin yanılgılarını (idoller) sıraladı." },
  { id: "locke", ad: "Locke", gelenek: "anglo", bas: 1632, bit: 1704, tur: "kisi", fikir: "Zihnin doğuştan boş bir levha olduğunu, bilginin deneyimden geldiğini savundu." },
  { id: "hume", ad: "Hume", gelenek: "anglo", bas: 1711, bit: 1776, tur: "kisi", fikir: "Nedensellik bilgimizin alışkanlığa dayandığını öne sürdü." },
  { id: "russell", ad: "Russell", gelenek: "anglo", bas: 1872, bit: 1970, tur: "kisi", fikir: "Mantık ve dil çözümlemesiyle felsefi sorunları açıklığa kavuşturmaya çalıştı." },
  { id: "peirce", ad: "Peirce", gelenek: "amerikan", bas: 1839, bit: 1914, tur: "kisi", fikir: "Pragmatizmin kurucusu: bir kavramın anlamı, pratik sonuçlarındadır." },
  { id: "james", ad: "W. James", gelenek: "amerikan", bas: 1842, bit: 1910, tur: "kisi", fikir: "Doğruyu, yaşamda işe yarayan ve sınanan düşünce olarak ele aldı." },
  { id: "dewey", ad: "Dewey", gelenek: "amerikan", bas: 1859, bit: 1952, tur: "kisi", fikir: "Eğitimi ve demokrasiyi deneyim üzerinden düşündü: “Yaparak öğrenme.”" },
];

// Öğretmen–öğrenci zincirleri (test: öğretmen öğrencisinden önce doğmuş olmalı, yaşam süreleri kesişmeli)
export const HOCA_TALEBE = [["sokrates", "platon"], ["platon", "aristoteles"]];

// Felsefe tarihinde yaygın kabul gören sıralar (test edilir)
export const SIRALAR = [
  ["thales", "sokrates", "platon", "aristoteles"],
  ["kindi", "farabi", "ibnsina", "gazali", "ibnrusd"],
  ["bacon", "descartes", "locke", "hume", "kant", "hegel"],
];

// Ege kıyısı haritası için kentler (yaklaşık koordinatlar: antik kentlerin kalıntı yerleri)
export const KENTLER = [
  { id: "milet", ad: "Milet", alt: "Thales, Anaksimandros", lon: 27.28, lat: 37.53, renk: "#ffb547", r: 8, yon: "alt" },
  { id: "efes", ad: "Efes", alt: "Herakleitos", lon: 27.34, lat: 37.94, renk: "#4fc3f7", yon: "sag" },
  { id: "klazomenai", ad: "Klazomenai", alt: "Anaksagoras", lon: 26.77, lat: 38.36, renk: "#4fc3f7", yon: "ust" },
  { id: "samos", ad: "Samos", alt: "Pisagor", lon: 26.95, lat: 37.70, renk: "#4fc3f7", yon: "sol" },
  { id: "abdera", ad: "Abdera", alt: "Demokritos", lon: 24.98, lat: 40.95, renk: "#4fc3f7", yon: "ust" },
  { id: "atina", ad: "Atina", alt: "Sokrates, Platon", lon: 23.73, lat: 37.98, renk: "#4fc3f7", yon: "sol" },
];
