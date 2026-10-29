// İslam'da Varlık ve Bilgi — ayet künyeleri, kısa anlamlar ve haber modeli
// Anlamlar meal kopyası değildir; ayetin mesajı kısa ve sade biçimde ifade edilmiştir.
// tests/dkab10-u1-varlik-ve-bilgi.test.mjs künyeleri (sure adı–numarası, ayet sayısı) denetler.

// Kullanılan surelerin numarası ve toplam ayet sayısı (Diyanet İşleri Başkanlığı Kur'an-ı Kerim tertibi)
export const SURELER = {
  2: ["Bakara", 286], 3: ["Âl-i İmrân", 200], 6: ["En'âm", 165], 16: ["Nahl", 128], 17: ["İsrâ", 111],
  21: ["Enbiyâ", 112], 25: ["Furkân", 77], 31: ["Lokmân", 34], 33: ["Ahzâb", 73], 35: ["Fâtır", 45],
  36: ["Yâsîn", 83], 39: ["Zümer", 75], 42: ["Şûrâ", 53], 49: ["Hucurât", 18], 51: ["Zâriyât", 60],
  55: ["Rahmân", 78], 67: ["Mülk", 30], 96: ["Alak", 19], 112: ["İhlâs", 4],
};

/** "İsrâ 17/36" biçiminde künye */
export const kunye = (a) => `${SURELER[a.sure][0]} ${a.sure}/${a.ayet}`;

export const AYETLER = {
  alak: { sure: 96, ayet: "1-5", anlam: "İlk inen ayetler “Oku!” emriyle başlar; insana kalemle ve bilmediklerini öğreten Allah'tır." },
  zumer9: { sure: 39, ayet: "9", anlam: "Hiç bilenlerle bilmeyenler bir olur mu?" },
  hucurat6: { sure: 49, ayet: "6", anlam: "Güvenilmez biri size bir haber getirirse, bilmeden birine zarar vermemek için onu iyice araştırın." },
  nahl78: { sure: 16, ayet: "78", anlam: "Allah sizi hiçbir şey bilmezken dünyaya getirdi; şükredesiniz diye size işitme, görme ve gönüller verdi." },
  aliimran190: { sure: 3, ayet: "190-191", anlam: "Göklerin ve yerin yaratılışında, gece ile gündüzün birbiri ardınca gelişinde akıl sahipleri için işaretler vardır; onlar bunları düşünür (tefekkür eder)." },
  yasin82: { sure: 36, ayet: "82", anlam: "Allah bir şeyin olmasını dilediğinde ona “Ol!” demesi yeterlidir; o da oluverir." },
  furkan2: { sure: 25, ayet: "2", anlam: "Allah her şeyi yaratmış ve her birine bir ölçü vermiştir." },
  mulk3: { sure: 67, ayet: "3-4", anlam: "Rahmân'ın yaratışında hiçbir uyumsuzluk göremezsin; gözünü çevir, bir çatlak görebilir misin?" },
  rahman29: { sure: 55, ayet: "29", anlam: "Göklerde ve yerde olan herkes O'ndan ister; O her an yeni bir iştedir (yaratır, yönetir)." },
  enbiya22: { sure: 21, ayet: "22", anlam: "Yerde ve gökte Allah'tan başka ilahlar olsaydı, ikisinin de düzeni bozulurdu." },
  bakara30: { sure: 2, ayet: "30", anlam: "Allah meleklere, yeryüzünde bir halife (sorumlu bir temsilci) yaratacağını bildirdi." },
  isra70: { sure: 17, ayet: "70", anlam: "Biz Âdemoğlunu onurlu kıldık ve onu yarattıklarımızın çoğundan üstün kıldık." },
  zariyat56: { sure: 51, ayet: "56", anlam: "Cinleri ve insanları ancak bana kulluk etsinler diye yarattım." },
  ahzab72: { sure: 33, ayet: "72", anlam: "Göklerin, yerin ve dağların yüklenmekten çekindiği emaneti (sorumluluğu) insan yüklendi." },
  enam59: { sure: 6, ayet: "59", anlam: "Gaybın anahtarları Allah'ın katındadır; onları O'ndan başkası bilmez." },
  bakara3: { sure: 2, ayet: "3", anlam: "Takva sahipleri gayba inanır, namazı kılar ve verilen rızıktan infak eder." },
  lokman34: { sure: 31, ayet: "34", anlam: "Kıyametin ne zaman kopacağının bilgisi yalnızca Allah katındadır." },
  isra85: { sure: 17, ayet: "85", anlam: "Ruh, Rabbimin emrindendir; size ilimden ancak az bir şey verilmiştir." },
  sura11: { sure: 42, ayet: "11", anlam: "O'nun benzeri hiçbir şey yoktur; O işitendir, görendir." },
  fatir15: { sure: 35, ayet: "15", anlam: "Ey insanlar! Siz Allah'a muhtaçsınız; Allah ise hiçbir şeye muhtaç değildir, övgüye layıktır." },
  ihlas: { sure: 112, ayet: "1-4", anlam: "Allah birdir; her şey O'na muhtaçtır; doğurmamış ve doğurulmamıştır; hiçbir şey O'na denk değildir." },
  isra36: { sure: 17, ayet: "36", anlam: "Hakkında bilgin olmayan bir şeyin ardına düşme; çünkü kulak, göz ve gönül, bunların her biri yaptığından sorumludur." },
  mulk23: { sure: 67, ayet: "23", anlam: "De ki: Sizi var eden, size işitme, görme ve gönüller veren O'dur. Ne kadar da az şükrediyorsunuz!" },
};

// Hadis kaynakları (kitap ve bölüm adıyla)
export const HADISLER = {
  duydugunuAnlatma: { kaynak: "Müslim, Mukaddime, 5", anlam: "Duyduğu her şeyi (araştırmadan) anlatması, kişiye yalan olarak yeter." },
  ilimFarz: { kaynak: "İbn Mâce, Mukaddime, 17", anlam: "İlim öğrenmek her Müslümanın görevidir." },
};

/**
 * Temsilî haber modeli: her aktarıcının aynı yanlış ayrıntıyı uydurma olasılığı p olsun.
 * Aktarıcılar birbirinden bağımsızsa hepsinin aynı yanlışta birleşme olasılığı p^n;
 * hepsi tek bir kaynaktan kopyalıyorsa olasılık tek kaynağınkiyle (p) aynı kalır.
 */
export function yalanUzlasmaOlasiligi(n, p, bagimsiz) {
  if (n < 1) return 1;
  return bagimsiz ? p ** n : p;
}

/** Olasılığı “yaklaşık 1/N” biçiminde okunur hâle getirir */
export function olasilikYaz(o) {
  if (o >= 0.995) return "kesine yakın";
  if (o >= 0.01) return `%${Math.round(o * 100)}`;
  const n = 1 / o;
  const yuvarla = (x) => { const b = 10 ** Math.max(0, Math.floor(Math.log10(x)) - 1); return Math.round(x / b) * b; };
  return `yaklaşık 1 / ${yuvarla(n).toLocaleString("tr-TR")}`;
}

// Mütevatir sayılmak için (bu temsilî modelde) eşik: bağımsız aktarıcılarla 1/10.000'in altı
export const MUTEVATIR_ESIK = 1e-4;
