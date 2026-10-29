// Derste kullanılan metinler: yalnızca anonim halk edebiyatı ve 1956'dan önce ölmüş şairler (telif: ölümden sonra 70 yıl)
// Kafiye/redif çözümlemesi: son kelime(ler) [kök, kafiye, redif] parçalarına ayrılmıştır.

export const SIIRLER = {
  kosuk: {
    ad: "Bahar Koşuğu", sair: "Anonim", kaynak: "Divanü Lugati't-Türk (Kaşgarlı Mahmud, 11. yy) · koşuk",
    tur: "Koşuk", olcu: 7,
    dizeler: ["Kızıl sarıg arkaşıp", "Yaşıl yaşın yörgeşip", "Bir bir üze ulaşıp", "Yalŋuk anı taŋlaşur"],
    gunumuz: "Kırmızılı sarılı çiçekler birbirine karışmış, yeşiller sarmaş dolaş olmuş, birbiri üstüne yükselmiş; insan bunu görünce hayran kalır.",
  },
  alp: {
    ad: "Alp Er Tunga Sagusu", sair: "Anonim", kaynak: "Divanü Lugati't-Türk (11. yy) · koşuk biçiminde sagu",
    tur: "Sagu", olcu: 7, durak: [[4, 3]],
    dizeler: ["Alp Er Tonga öldi mü", "Isız ajun kaldı mu", "Ödlek öçin aldı mu", "Emdi yürek yırtılur"],
    gunumuz: ["Alp Er Tunga öldü mü", "Kötü dünya kaldı mı", "Felek öcünü aldı mı", "Şimdi yürek yırtılır"],
    kafiye: [["ö", "l", "di mü"], ["ka", "l", "dı mu"], ["a", "l", "dı mu"], null],
    kafiyeTuru: "yarım", sema: "aaab",
  },
  yunus: {
    ad: "Gelin Tanış Olalım", sair: "Yunus Emre", olum: "ö. 1320 dolayı", tur: "İlahi", olcu: 7,
    dizeler: ["Gelin tanış olalım", "İşi kolay kılalım", "Sevelim sevilelim", "Dünya kimseye kalmaz"],
    kafiye: [["o", "l", "alım"], ["kı", "l", "alım"], ["sevi", "l", "elim"], null],
    kafiyeTuru: "yarım", sema: "aaab",
  },
  karacaoglan: {
    ad: "İncecikten Bir Kar Yağar", sair: "Karacaoğlan", olum: "17. yy", tur: "Koşma", olcu: 8, durak: [[4, 4]],
    dizeler: ["İncecikten bir kar yağar", "Tozar Elif Elif deyi", "Deli gönül abdal olmuş", "Gezer Elif Elif deyi"],
  },
  yemen: {
    ad: "Yemen Türküsü", sair: "Anonim", tur: "Türkü", olcu: 11, durak: [[6, 5]],
    dizeler: ["Havada bulut yok, bu ne dumandır", "Mahlede ölüm yok, bu ne figandır", "Şu Yemen illeri ne de yamandır"],
    kavustak: ["Ano Yemen'dir, gülü çemendir", "Giden gelmiyor, acep nedendir"],
    kafiye: [["dum", "an", "dır"], ["fig", "an", "dır"], ["yam", "an", "dır"]],
    kafiyeTuru: "tam", sema: "aaa",
  },
  ninni: {
    ad: "Dandini", sair: "Anonim", tur: "Ninni",
    dizeler: ["Dandini dandini dastana", "Danalar girmiş bostana", "Kov bostancı danayı", "Yemesin lahanayı"],
  },
  istiklal: {
    ad: "İstiklal Marşı", sair: "Mehmet Âkif Ersoy", olum: "ö. 1936", tur: "Aruz", kalip: "fâilâtün feilâtün feilâtün fa'lün",
    dizeler: ["Korkma, sönmez bu şafaklarda yüzen al sancak"],
  },
  hasim: {
    ad: "O Belde", sair: "Ahmet Haşim", olum: "ö. 1933", tur: "Aruz", kalip: "mefâilün feilâtün mefâilün feilün",
    dizeler: ["Melâli anlamayan nesle âşinâ değiliz"],
  },
  orhan: {
    ad: "İstanbul'u Dinliyorum", sair: "Orhan Veli Kanık", olum: "ö. 1950", tur: "Serbest",
    dizeler: ["İstanbul'u dinliyorum, gözlerim kapalı;", "Önce hafiften bir rüzgâr esiyor;", "Yavaş yavaş sallanıyor", "Yapraklar, ağaçlarda;"],
  },
};

/** Şiir dinletisi kütüphanesi: yalnızca adlar (tam metin değil) + tema etiketleri + yaklaşık okuma süresi (dk) */
export const KUTUPHANE = [
  { id: "istiklal", ad: "İstiklal Marşı (ilk iki kıta)", sair: "Mehmet Âkif Ersoy", temalar: ["vatan"], sure: 1.5 },
  { id: "canakkale", ad: "Çanakkale Şehitlerine (bir bölüm)", sair: "Mehmet Âkif Ersoy", temalar: ["vatan"], sure: 3 },
  { id: "cturku", ad: "Çanakkale Türküsü", sair: "Anonim", temalar: ["vatan", "gurbet"], sure: 2 },
  { id: "yemen", ad: "Yemen Türküsü", sair: "Anonim", temalar: ["gurbet", "vatan"], sure: 2 },
  { id: "vatanmersiye", ad: "Vatan Mersiyesi (bir bölüm)", sair: "Namık Kemal", temalar: ["vatan"], sure: 2 },
  { id: "yunus", ad: "Gelin Tanış Olalım", sair: "Yunus Emre", temalar: ["sevgi"], sure: 1 },
  { id: "dertlidolap", ad: "Dertli Dolap", sair: "Yunus Emre", temalar: ["sevgi", "doğa"], sure: 2 },
  { id: "karacaoglan", ad: "İncecikten Bir Kar Yağar", sair: "Karacaoğlan", temalar: ["sevgi", "doğa"], sure: 1.5 },
  { id: "kosuk", ad: "Bahar Koşuğu (DLT)", sair: "Anonim", temalar: ["doğa"], sure: 0.5 },
  { id: "merdiven", ad: "Merdiven", sair: "Ahmet Haşim", temalar: ["doğa"], sure: 1.5 },
  { id: "sis", ad: "Sis", sair: "Tevfik Fikret", temalar: ["istanbul"], sure: 3 },
  { id: "orhan", ad: "İstanbul'u Dinliyorum", sair: "Orhan Veli Kanık", temalar: ["istanbul", "doğa"], sure: 2 },
  { id: "sadabad", ad: "Sadabad şarkısı (“Bir safâ bahşedelim…”)", sair: "Nedim", temalar: ["istanbul", "sevgi"], sure: 2 },
  { id: "ninni", ad: "Dandini (ninni)", sair: "Anonim", temalar: ["sevgi"], sure: 0.5 },
  { id: "alp", ad: "Alp Er Tunga Sagusu", sair: "Anonim", temalar: ["vatan"], sure: 0.5 },
];

export const TEMALAR = [
  { deger: "vatan", metin: "Vatan ve kahramanlık" },
  { deger: "sevgi", metin: "Sevgi ve dostluk" },
  { deger: "doğa", metin: "Doğa ve mevsimler" },
  { deger: "gurbet", metin: "Gurbet ve özlem" },
  { deger: "istanbul", metin: "Şiirlerde İstanbul" },
];
