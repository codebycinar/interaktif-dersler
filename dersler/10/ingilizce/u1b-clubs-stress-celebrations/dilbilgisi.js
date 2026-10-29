// Rule-based grammar and writing checks (tested in tests/ing10-u1b-clubs-stress-celebrations.test.mjs)
// Scope: the sentence types of this theme (simple present, present progressive, can) — not a general English parser.

const ZAMIRLER = ["I", "you", "he", "she", "it", "we", "they"];
const ADLAR = { mert: "he", zeynep: "she", elif: "she", jack: "he", ayşe: "she", ayse: "she", emre: "he", defne: "she", haruto: "he", aino: "she" };
const COGUL_DUZENSIZ = ["children", "people", "men", "women"];
const KISI_ADLARI = ["teacher", "counsellor", "headmaster", "headteacher", "student", "pupil", "friend", "coach", "classmate", "leader"];
const TEKIL_S = ["class", "bus", "boss", "chess", "glass", "physics", "maths", "news", "gymnastics", "canteen"];

/** Pronoun that refers back to the subject in a question tag */
export function ozneZamiri(ozne) {
  const o = ozne.trim().replace(/\s+/g, " ");
  const k = o.toLowerCase();
  if (/\band (i|me)\b/.test(k) || k === "we") return "we";
  if (/\band\b/.test(k)) return "they";
  const zamir = ZAMIRLER.find((z) => z.toLowerCase() === k);
  if (zamir) return zamir;
  if (k === "everyone" || k === "everybody" || k === "nobody" || k === "someone") return "they";
  const son = k.split(" ").at(-1);
  if (ADLAR[son] && k.split(" ").length === 1) return ADLAR[son];
  if (COGUL_DUZENSIZ.includes(son)) return "they";
  if (KISI_ADLARI.includes(son)) return "he/she";
  if (/s$/.test(son) && !/ss$/.test(son) && !TEKIL_S.includes(son)) return "they";
  return "it";
}

const OLUMSUZ = { is: "isn't", are: "aren't", can: "can't", do: "don't", does: "doesn't" };
const KOK = { "isn't": "is", "aren't": "are", "can't": "can", cannot: "can", "doesn't": "does", "don't": "do" };
const BELIRTEC = /^(the|our|my|your|his|her|their|this|that|these|those|every|a|an)$/i;
const SIKLIK_Z = /^(always|usually|often|sometimes|never|rarely|normally)$/i;
const etiket = (yardimci, zamir) => ({ yardimci, zamir, etiket: `${yardimci} ${zamir}?` });
/** "You're" → "You are", "She's" → "She is", "I'm" → "I am" (in this theme 's is always is) */
const acKisaltma = (c) => c.replace(/\b(I)'m\b/gi, "$1 am").replace(/\b(you|we|they)'re\b/gi, "$1 are").replace(/\b(he|she|it|that)'s\b/gi, "$1 is");

/**
 * Question tag for a simple present / present progressive / can sentence.
 * "The students practise martial arts after school." → "don't they?"
 * "The canteen isn't serving lunch now." → "is it?"
 * @param {string} cumle
 * @param {string} [ozne] subject, needed only when the sentence has no auxiliary and a long subject
 * @returns {{yardimci:string, zamir:string, etiket:string}|null}
 */
export function soruEki(cumle, ozne) {
  const c = acKisaltma(cumle.trim().replace(/[.!?,\s]+$/, ""));
  const m = c.match(/^(.+?)\s+(isn't|aren't|can't|cannot|doesn't|don't|is|are|am|can|does|do)(\s+not)?\s+(.+)$/i);
  if (m && (!ozne || m[1].toLowerCase() === ozne.toLowerCase())) {
    const ham = m[2].toLowerCase();
    const kok = KOK[ham] || ham;
    const olumsuz = ham !== kok || !!m[3];
    if (kok === "am") return olumsuz ? etiket("am", "I") : etiket("aren't", "I");
    return etiket(olumsuz ? kok : OLUMSUZ[kok], ozneZamiri(m[1]));
  }
  // no auxiliary: subject + (frequency adverb) + main verb
  const kelimeler = c.split(/\s+/);
  let n = ozne ? ozne.trim().split(/\s+/).length : BELIRTEC.test(kelimeler[0]) ? 2 : 1;
  if (!ozne && /\band\b/i.test(c)) n = kelimeler.findIndex((w, i) => i > 0 && kelimeler[i - 1].toLowerCase() === "and") + 1;
  const ozneMetni = kelimeler.slice(0, n).join(" ");
  let i = n;
  const olumsuz = SIKLIK_Z.test(kelimeler[i] || "") && /^never$/i.test(kelimeler[i]);
  if (SIKLIK_Z.test(kelimeler[i] || "")) i++;
  const fiil = (kelimeler[i] || "").toLowerCase();
  if (!fiil) return null;
  const zamir = ozneZamiri(ozneMetni);
  const ucuncu = ["he", "she", "it"].includes(zamir);
  if (ucuncu && !/s$/.test(fiil)) return null;
  const yardimci = ucuncu ? "does" : "do";
  return etiket(olumsuz ? yardimci : OLUMSUZ[yardimci], zamir);
}

/**
 * Which of something / anything / nothing fit the grammar of a gapped sentence ("___" marks the gap)?
 * Negative sentence → anything (nothing would make a double negative).
 * Question → anything (something only in offers/requests: "Would you like…", "Can I have…").
 * Positive statement → something or nothing (meaning decides).
 */
export function belirsizGecerli(cumle) {
  const c = cumle.toLowerCase();
  const soru = /\?\s*$/.test(c);
  const teklif = /^(would you like|can i have|could i have|can you give|shall i)/.test(c);
  // only the clause that contains the gap counts ("…there is ___ bothering the pupil, but they won't talk about it.")
  const yan = c.split(/,|;|\bbut\b|\bso\b|\bbecause\b|\band\b/).find((p) => p.includes("___")) || c;
  const olumsuz = /n't\b|\bnot\b|\bnever\b|\bno\b(?!body)/.test(yan.replace("___", ""));
  if (olumsuz) return ["anything"];
  if (soru) return teklif ? ["something", "anything"] : ["anything"];
  return ["something", "nothing"];
}

/** Explanation for a wrong choice */
export function belirsizAciklama(cumle, secim) {
  const gecerli = belirsizGecerli(cumle);
  if (gecerli.includes(secim)) return "";
  if (secim === "nothing" && gecerli.length === 1 && /\?\s*$/.test(cumle) === false) return "The sentence is already negative (not / n't). Two negatives don't go together: use anything.";
  if (secim === "something" && gecerli[0] === "anything" && /\?\s*$/.test(cumle)) return "In questions we usually use anything.";
  if (secim === "something") return "The sentence is negative: use anything.";
  if (secim === "nothing" && /\?\s*$/.test(cumle)) return "In questions we usually use anything.";
  return "In a positive statement use something (or nothing, if the meaning is negative).";
}

/* ---------------- Writing checklist ---------------- */
export const HEDEF_KELIMELER = [
  "boarding school", "state school", "private school", "primary school", "high school", "upper secondary", "nursery", "preschool",
  "extracurricular", "diploma", "qualification", "graduate", "succeed", "year group",
  "basketball court", "tennis court", "prayer room", "staffroom", "canteen", "courtyard", "locker room", "food technology room",
  "classwork", "quiz", "presentation", "laboratory", "literature", "pe", "volleyball", "gymnastics", "rugby", "badminton", "photography", "sculpture",
  "chess club", "literature club", "art club", "coding club", "volunteering club", "spelling bee",
  "anxiety", "anxious", "perfectionist", "time management", "counsellor",
];
const SIKLIK = /\b(always|usually|often|sometimes|never|rarely|seldom|normally)\b/gi;
const SUREKLI = /\b(am|is|are|'m|'re|'s)\s+(\w+ )?\w+ing\b/gi;
const SELAM = /^\s*(hi|hello|dear|hey|good (morning|afternoon|evening))\b/i;
const KAPANIS = /\b(see you|write soon|best wishes|take care|bye|love|cheers|best|regards|talk soon)\b[^\n]*\s*(\n.*)?$/i;

export const kelimeSay = (t) => (String(t).match(/[\p{L}\p{N}](?:[\p{L}\p{N}'’-]|[:.](?=\p{N}))*/gu) || []).length;

/** Target vocabulary found in the text (unique, in list order) */
export function hedefBul(metin) {
  const k = ` ${String(metin).toLowerCase().replace(/[^\p{L}\s'-]/gu, " ").replace(/\s+/g, " ")} `;
  return HEDEF_KELIMELER.filter((w) => k.includes(` ${w} `) || k.includes(` ${w}s `) || (w.length > 5 && k.includes(` ${w}`)));
}

/**
 * Blog post checklist.
 * @returns {{kelime:number, siklik:string[], surekli:string[], hedef:string[], maddeler:{id,metin,tamam}[], tamam:boolean}}
 */
export function taslakDenetle(metin, { enAz = 80, enCok = 180 } = {}) {
  const t = String(metin);
  const kelime = kelimeSay(t);
  const siklik = [...new Set((t.match(SIKLIK) || []).map((x) => x.toLowerCase()))];
  const surekli = (t.match(SUREKLI) || []).filter((x) => !/\b(morning|evening|thing|nothing|something|anything|building|spring|ring|king|ceiling)$/i.test(x));
  const hedef = hedefBul(t);
  const paragraf = t.split(/\n\s*\n|\n/).filter((p) => p.trim()).length;
  const maddeler = [
    { id: "uzunluk", metin: `${enAz}–${enCok} words (${kelime} now)`, tamam: kelime >= enAz && kelime <= enCok },
    { id: "selam", metin: "Starts with a greeting (Hi…, Hello…, Dear…)", tamam: SELAM.test(t) },
    { id: "siklik", metin: `Two different frequency adverbs (${siklik.join(", ") || "none yet"})`, tamam: siklik.length >= 2 },
    { id: "surekli", metin: "Something happening now or these days (am / is / are + -ing)", tamam: surekli.length >= 1 },
    { id: "hedef", metin: `Three theme words (${hedef.slice(0, 5).join(", ") || "none yet"})`, tamam: hedef.length >= 3 },
    { id: "soru", metin: "A question to your reader", tamam: /\?/.test(t) },
    { id: "paragraf", metin: "At least two paragraphs", tamam: paragraf >= 2 },
    { id: "kapanis", metin: "A friendly closing (See you, Write soon, Best wishes…)", tamam: KAPANIS.test(t.trim()) },
  ];
  return { kelime, siklik, surekli, hedef, maddeler, tamam: maddeler.every((m) => m.tamam) };
}

/** How many words changed between two versions (simple bag-of-words difference) */
export function degisenKelime(eski, yeni) {
  const say = (t) => {
    const m = new Map();
    for (const w of String(t).toLowerCase().match(/[\p{L}\p{N}'’-]+/gu) || []) m.set(w, (m.get(w) || 0) + 1);
    return m;
  };
  const a = say(eski), b = say(yeni);
  let fark = 0;
  for (const [w, n] of b) fark += Math.max(0, n - (a.get(w) || 0));
  for (const [w, n] of a) fark += Math.max(0, n - (b.get(w) || 0));
  return fark;
}

/* ---------------- Peer feedback suggestions (step 9) ---------------- */
const NESNE = /\b(me|him|her|us|them)\b/i;
const GUNLER = /\b(republic day|victory day|children's day|youth and sports day|democracy and national unity day|eid|ramadan feast|festival of sacrifice|29 october|23 april|19 may|30 august|15 july)\b/i;
export const ONERILER = [
  { id: "neden", metin: "Give a reason: add a sentence with because.", kontrol: (t) => /\bbecause\b/i.test(t) },
  { id: "nesne", metin: "Use an object pronoun (me, him, her, us, them) so you don't repeat names.", kontrol: (t) => NESNE.test(t) },
  { id: "gun", metin: "Tell your reader about a national day or a celebration at your school.", kontrol: (t) => GUNLER.test(t) },
  { id: "etiket", metin: "Add a question tag to sound friendly (…, don't you? / …, isn't it?).", kontrol: (t) => /,\s*(do|does|don't|doesn't|is|isn't|are|aren't|can|can't|am)\s+(i|you|he|she|it|we|they)\s*\?/i.test(t) },
  { id: "hedef", metin: "Use two more theme words (facilities, clubs, activities…).", kontrol: (t, ilk) => hedefBul(t).length >= hedefBul(ilk).length + 2 },
];
