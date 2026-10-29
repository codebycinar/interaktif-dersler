// Rule-based helpers for the reading and reflection steps (tested in tests/ing10-u1a-schools-around-the-world.test.mjs)

const ISARET = /\[\[(\w+)\|([^\]]+)\]\]|\{\{([^}]+)\}\}/g;

/**
 * Splits a marked paragraph into tokens.
 * [[key|text]] → words with `anahtar` (scan answer); {{word}} → words with `kelime` (target vocabulary).
 * @returns {{metin:string, bosluk:boolean, anahtar:string|null, kelime:string|null}[]}
 */
export function parcala(paragraf) {
  const sonuc = [];
  const ekle = (metin, anahtar = null, kelime = null) => {
    for (const p of metin.split(/(\s+)/)) if (p) sonuc.push({ metin: p, bosluk: /^\s+$/.test(p), anahtar, kelime });
  };
  let son = 0;
  for (const m of paragraf.matchAll(ISARET)) {
    ekle(paragraf.slice(son, m.index));
    if (m[1]) ekle(m[2], m[1]);
    else ekle(m[3], null, m[3].toLowerCase());
    son = m.index + m[0].length;
  }
  ekle(paragraf.slice(son));
  return sonuc;
}

/** Paragraph without the markup */
export const temizMetin = (paragraf) => paragraf.replace(ISARET, (_, k, metin, kelime) => metin ?? kelime);

/** Sentence of the paragraph that contains the target word */
export function cumleBul(paragraf, kelime) {
  const cumleler = temizMetin(paragraf).match(/[^.!?]+[.!?]+/g) || [];
  return (cumleler.find((c) => new RegExp(`\\b${kelime}\\b`, "i").test(c)) || "").trim();
}

const SIKLIK = /\b(always|usually|often|sometimes|never|rarely|seldom|every (day|morning|week|monday|tuesday|wednesday|thursday|friday)|once a week|twice a week)\b/i;
const ZAMAN = /\b(\d{1,2}[:.]\d{2}|\d{1,2} ?(a\.?m\.?|p\.?m\.?)|(\w+ )?o'clock|half past \w+|quarter (past|to) \w+|(twenty|ten|five|twenty-five) (past|to) \w+)/i;
const KARSILASTIRMA = /\b(but|while|whereas|however|unlike|both|instead|on the other hand|similar|different|the same as|more \w+ than|\w+er than)\b/i;
const KISI = /\b(haruto|aino|deniz|elif|jack|japan|finland|scotland|kayseri|bursa|osaka|tampere)\b/i;

/**
 * Checks the "My school morning" paragraph.
 * @returns {{kelime:number, maddeler:{id:string, metin:string, tamam:boolean}[], tamam:boolean}}
 */
export function yansimaDenetle(metin, enAzKelime = 40) {
  const t = String(metin);
  const kelime = (t.match(/[\p{L}\p{N}](?:[\p{L}\p{N}'’-]|[:.](?=\p{N}))*/gu) || []).length;
  const maddeler = [
    { id: "uzunluk", metin: `At least ${enAzKelime} words (${kelime} now)`, tamam: kelime >= enAzKelime },
    { id: "zaman", metin: "A time (8:30, half past eight, nine o'clock…)", tamam: ZAMAN.test(t) },
    { id: "siklik", metin: "A frequency word (always, usually, often, every Monday…)", tamam: SIKLIK.test(t) },
    { id: "kisi", metin: "A student or country from the podcast or the article", tamam: KISI.test(t) },
    { id: "karsilastir", metin: "A comparison word (but, while, unlike, both, different…)", tamam: KARSILASTIRMA.test(t) },
  ];
  return { kelime, maddeler, tamam: maddeler.every((m) => m.tamam) };
}
