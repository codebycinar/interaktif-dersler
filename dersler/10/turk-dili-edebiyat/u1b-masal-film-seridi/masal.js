// Dinleme metni: “Keloğlan ile Konuşan Kaval” — ders için özgün olarak yazılmıştır.
// Döşeme ve bitiş formülleri (“Evvel zaman içinde…”, “Gökten üç elma düşmüş…”) anonim halk masalı kalıplarıdır.
// Her bölümde geçen unsurlar dinleme sırasında “duydum!” düğmeleriyle yakalanır.

export const MASAL_ADI = "Keloğlan ile Konuşan Kaval";

export const BOLUMLER = [
  {
    baslik: "Döşeme ve giriş",
    cumleler: [
      "Evvel zaman içinde, kalbur saman içinde, develer tellal iken, pireler berber iken, ben anamın beşiğini tıngır mıngır sallar iken…",
      "Uzak bir ülkenin dağ eteğindeki bir köyde Keloğlan ile anası yaşarmış.",
      "Evlerinde bir hasır, bir testi, bir de dededen kalma eski bir kaval varmış.",
      "Keloğlan kavalı ne zaman çalmaya kalksa ağzından yalnızca bir hırıltı çıkarmış.",
      "Anası gülümsermiş: “Oğul, kaval nefesle değil, gönülle çalınır.”",
    ],
    unsurlar: ["kalip"],
  },
  {
    baslik: "Padişahın duyurusu",
    cumleler: [
      "Günlerden bir gün padişahın tellalları köy köy dolaşıp bağırmış:",
      "“Duyduk duymadık demeyin! Padişahımızın kızı Gülsüm Sultan üç yıldır tek söz söylemez oldu. Onu kim konuşturursa padişah kızını ona verecek!”",
      "Nice beyler, nice hekimler saraya koşmuş.",
      "Kimi altın sunmuş, kimi şaka yapmış, kimi uzun uzun nasihat etmiş; ama sultan kız ağzını açmamış.",
    ],
    unsurlar: ["kalip", "tekrar"],
  },
  {
    baslik: "Yolda bir iyilik",
    cumleler: [
      "Keloğlan kavalını beline sokmuş, anasının elini öpüp yola düşmüş.",
      "Az gitmiş, uz gitmiş, dere tepe düz gitmiş; bir de dönüp bakmış ki bir arpa boyu yol gitmiş.",
      "Bir çeşme başında kanadı kırık bir bülbül görmüş. Ekmeğini ufalayıp bülbüle yedirmiş, kanadını bir bez parçasıyla sarmış.",
      "Bülbül dile gelmiş: “Keloğlan, iyiliğin yerde kalmasın. Kavalını çal, ben de sana sözün ezgisini öğreteyim.”",
      "Bülbül ötmüş, Keloğlan dinlemiş; bülbül susmuş, Keloğlan çalmış.",
      "Kavaldan bu kez hırıltı değil, su sesi gibi bir ezgi dökülmüş.",
    ],
    unsurlar: ["kalip", "olaganustu", "tekrar"],
  },
  {
    baslik: "Kara Dağ'ın devi",
    cumleler: [
      "Saraya giden yol, Kara Dağ'daki devin mağarasının önünden geçermiş.",
      "Dev, Keloğlan'ı görünce gürlemiş: “Hah! Ayağıma kendiliğinden gelen bir lokma!”",
      "Keloğlan korkusunu belli etmeden kavalını dudağına götürmüş.",
      "Öyle tatlı bir ezgi çalmış ki devin gözleri süzülmüş, koca başı göğsüne düşmüş, horultusu dağları inletmiş.",
      "Keloğlan da usulca yanından geçip gitmiş.",
    ],
    unsurlar: ["olaganustu"],
  },
  {
    baslik: "Sultan kızın sesi",
    cumleler: [
      "Saraya varınca padişahın huzuruna çıkmış: “Ben sultanımızı sözle değil, ezgiyle konuşturacağım.”",
      "Gülsüm Sultan'ın penceresinin altına oturup kavalını çalmış.",
      "Kaval önce bir ninni gibi yumuşak, sonra bir türkü gibi yanık, en sonunda bir düğün havası gibi coşkun çalmış.",
      "Sultan kız pencereye gelmiş, gözleri dolmuş ve üç yıl sonra ilk kez dile gelmiş:",
      "“Bu ezgide anamın bana söylediği ninniyi duydum!”",
    ],
    unsurlar: ["olaganustu", "tekrar"],
  },
  {
    baslik: "Sonuç ve bitiş",
    cumleler: [
      "Padişah sevinçten ne yapacağını bilememiş. Keloğlan ile Gülsüm Sultan'ı evlendirmiş; kırk gün kırk gece düğün yapılmış.",
      "Keloğlan anasını da saraya getirtmiş. O günden sonra sarayda her akşam ezgiler çalınmış, masallar anlatılmış.",
      "Onlar ermiş muradına, biz çıkalım kerevetine.",
      "Gökten üç elma düşmüş: biri anlatanın, biri dinleyenin, biri de kulak verenin başına.",
    ],
    unsurlar: ["kalip", "tekrar"],
  },
];

export const UNSURLAR = {
  kalip: { ad: "Tekerleme / kalıp söz", renk: "#ffb547" },
  olaganustu: { ad: "Olağanüstü olay", renk: "#b89cff" },
  tekrar: { ad: "Üçleme / tekrar", renk: "#4fc3f7" },
};

/** Olay sırası (film şeridinde sahne seçmek için de kullanılır) */
export const OLAYLAR = [
  { id: "o1", metin: "Keloğlan anasıyla köyde yoksul yaşar; kavalından yalnızca hırıltı çıkar.", arka: "koy", kisiler: ["kel", "ana"] },
  { id: "o2", metin: "Tellallar, konuşmayan Gülsüm Sultan'ı konuşturana padişahın kızını vereceğini duyurur.", arka: "koy", kisiler: ["tellal", "kel"] },
  { id: "o3", metin: "Keloğlan kanadı kırık bülbülü iyileştirir; bülbül ona sözün ezgisini öğretir.", arka: "cesme", kisiler: ["kel", "bulbul"] },
  { id: "o4", metin: "Kara Dağ'daki dev Keloğlan'ı yemek ister; Keloğlan kavalıyla devi uyutur.", arka: "dag", kisiler: ["dev", "kel"] },
  { id: "o5", metin: "Keloğlan pencere altında kaval çalar; sultan kız üç yıl sonra ilk kez konuşur.", arka: "saray", kisiler: ["kel", "sultan"] },
  { id: "o6", metin: "Kırk gün kırk gece düğün yapılır; Keloğlan anasını saraya getirir.", arka: "saray", kisiler: ["kel", "sultan", "ana", "padisah"] },
];

/** Bilgilendirici ara metin (özgün) */
export const BILGI_METNI = [
  "Masallar, kitle iletişim araçları yaygınlaşmadan önce uzun kış gecelerinde topluca dinlenirdi.",
  "Masal anlatıcıları aynı masalı her anlatışta biraz değiştirir; bu yüzden bir masalın birçok varyantı olur.",
  "Masalların başındaki ahenkli söz dizisine döşeme denir.",
  "Bugün masallar daha çok aile içinde anlatılsa da masal anlatma geleneği sürmektedir.",
];
