// Üçgenin yardımcı elemanları dersinin modelleri — tests/mat10-u1b-yardimci-elemanlar.test.mjs ile doğrulanır
import { agirlikMerkezi, icTegetCember, cevrelCember, diklikMerkezi, alan, kenarlar } from "../ortak/geometri.js";

/** Köşe ızgarası ve dejenere üçgen sınırı (sürüklemede uygulanır) */
export const IZGARA = 0.25;
export const yapistir = (p) => ({ x: Math.round(p.x / IZGARA) * IZGARA, y: Math.round(p.y / IZGARA) * IZGARA });
/** Üçgen sürüklemeye uygun mu? Çok ince ya da çok kısa kenarlı üçgenler reddedilir. */
export function gecerliUcgen(A, B, C) {
  const { a, b, c } = kenarlar(A, B, C);
  return alan(A, B, C) >= 1.2 && Math.min(a, b, c) >= 1.25;
}

/** Dört özel nokta: hangi yardımcı elemanların kesişimi olduğu ve ne işe yaradığı */
export const MERKEZLER = {
  agirlik: { ad: "Ağırlık merkezi", eleman: "kenarortaylar", bul: agirlikMerkezi },
  ic: { ad: "İç teğet çemberin merkezi", eleman: "iç açıortaylar", bul: (A, B, C) => icTegetCember(A, B, C).merkez },
  cevrel: { ad: "Çevrel çemberin merkezi", eleman: "kenar orta dikmeler", bul: (A, B, C) => cevrelCember(A, B, C).merkez },
  diklik: { ad: "Diklik merkezi", eleman: "yükseklikler", bul: diklikMerkezi },
};

/** 7. adım: gerçek yaşam problemleri. Köşeler sabittir; öğrenci doğru merkezi seçip P'yi oraya taşır. */
export const SENARYOLAR = [
  {
    ad: "depo", baslik: "Su deposu", dogru: "cevrel",
    metin: "Üç köy ortak bir <b>su deposu</b> yapacak. Depo, üç köyün meydanına <b>eşit uzaklıkta</b> olmalı ki boru masrafı adil paylaşılsın.",
    koseler: [{ x: -4.5, y: -2.5 }, { x: 4.5, y: -2 }, { x: 0.5, y: 4.25 }], adlar: ["Akçaköy", "Yeşilyurt", "Karapınar"],
    yanlis: {
      agirlik: "Ağırlık merkezi köylere eşit uzaklıkta olmak zorunda değil: PA, PB, PC değerlerine bak.",
      ic: "İç teğet çemberin merkezi kenarlara (yollara) eşit uzaklıktadır, köşelere (köylere) değil.",
      diklik: "Yüksekliklerin kesişim noktasının köşelere uzaklıkları genellikle eşit değildir.",
    },
  },
  {
    ad: "cesme", baslik: "Parktaki çeşme", dogru: "ic",
    metin: "Üçgen biçimli bir park üç yolla çevrili. Belediye, parkın içine <b>üç yola da eşit uzaklıkta</b> bir çeşme koyacak.",
    koseler: [{ x: -4.5, y: -2.5 }, { x: 4.5, y: -2.5 }, { x: -1.5, y: 4 }], adlar: ["", "", ""],
    yanlis: {
      agirlik: "Ağırlık merkezinin kenarlara uzaklıkları genellikle eşit değildir.",
      cevrel: "Çevrel çemberin merkezi köşelere eşit uzaklıktadır; bize yollara (kenarlara) eşit uzaklık gerekiyor.",
      diklik: "Yüksekliklerin kesişim noktası kenarlara eşit uzaklıkta değildir.",
    },
  },
  {
    ad: "levha", baslik: "Dengede duran levha", dogru: "agirlik",
    metin: "Bir heykeltıraş, türdeş (her yeri aynı kalınlıkta) üçgen bir metal levhayı <b>tek bir direğin ucunda dengede</b> tutmak istiyor.",
    koseler: [{ x: -4.5, y: -3 }, { x: 4, y: -2 }, { x: 2.5, y: 4 }], adlar: ["", "", ""],
    yanlis: {
      ic: "İç teğet çemberin merkezi kenarlara eşit uzaklıktadır ama levhanın kütlesini dengelemez.",
      cevrel: "Çevrel çemberin merkezi geniş açılı üçgenlerde levhanın dışına bile düşebilir; denge noktası olamaz.",
      diklik: "Yüksekliklerin kesişimi denge noktası değildir.",
    },
  },
];

export const senaryoHedefi = (s) => MERKEZLER[s.dogru].bul(...s.koseler);
/** P hedefe yeterince yakınsa çözüldü sayılır */
export const HEDEF_TOLERANS = 0.2;
