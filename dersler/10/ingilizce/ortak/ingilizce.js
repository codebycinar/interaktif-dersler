// 10th grade English: shared helpers (English labels for the shared language-lesson components, dialogue player, text checks)
// The interactive components live in ../../turk-dili-edebiyat/ortak/etkilesim.js and are reused here with English labels.
import { el } from "../../../../engine/ders.js";
import { sesliOku } from "../../turk-dili-edebiyat/ortak/etkilesim.js";

export * from "../../turk-dili-edebiyat/ortak/etkilesim.js";

const STIL = `
.eng-etiketli { display:flex; flex-direction:column; gap:4px; font-size:13.5px; color:var(--metin-2); }
.eng-etiketli textarea, .eng-etiketli select { background:var(--zemin); border:1px solid var(--cizgi); border-radius:8px; padding:8px 10px; color:var(--metin);
  font:inherit; font-size:15px; width:100%; resize:vertical; line-height:1.5; }
.eng-liste { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:4px; font-size:14px; color:var(--metin-2); }
.eng-liste li.tamam { color:var(--yesil); }
`;
let stilVar = false;
export function engStil() {
  if (stilVar) return;
  stilVar = true;
  document.head.append(el("style", {}, STIL));
}

/** English labels passed as `metinler` to the shared components */
export const EN = {
  siniflandir: {
    kontrol: "Check", havuz: "Tap a card, then tap a box (or drag the card).", bos: "All cards are placed.",
    eksik: (n) => `${n} card${n === 1 ? " is" : "s are"} not placed yet.`, sonuc: (d, n) => `${d}/${n} correct.`, tamam: "All correct!", ipucu: "Hint:",
  },
  eslestir: { yanlis: "These two don't match. Try again.", dogru: "Correct match!", tamam: "All matched!" },
  sirala: { kontrol: "Check the order", tamam: "The order is correct!", sonuc: (d, n) => `${d}/${n} cards are in the right place.`, yukari: "Move up", asagi: "Move down" },
  kaydedici: { kaydet: "● Record my voice", durdur: "■ Stop recording", yok: "Voice recording isn't available on this device.", izin: "Microphone permission was not given." },
};

/** Header chips: "ENG.10.1.L1" → "L1" (the full code stays in the tooltip and data-kod) */
export function kodlariKisalt() {
  document.querySelectorAll(".d-cip[data-kod]").forEach((c) => { c.textContent = c.dataset.kod.replace(/^ENG\.\d+\.\d+\./, ""); });
}

/** Word count (letters, digits and apostrophes) */
export const kelimeSay = (metin) => (String(metin).match(/[\p{L}\p{N}](?:[\p{L}\p{N}'’-]|[:.](?=\p{N}))*/gu) || []).length;

/**
 * Plays a dialogue line by line with a different voice setting per speaker.
 * @param {object} oku okuyucu(ctx) instance
 * @param {{kim:string, metin:string}[]} satirlar
 * @param {Record<string,{dil?:string, hiz?:number}>} sesler
 * @param {(i:number)=>void} adim called before each line (-1 at the end)
 */
export function diyalogCal(oku, satirlar, sesler, adim, { es = 380 } = {}) {
  return oku.oku(satirlar.map((s) => ({ metin: s.metin, dil: sesler[s.kim]?.dil || "en-GB", hiz: sesler[s.kim]?.hiz ?? 0.95 })), { es, adim });
}

/** Reads one sentence aloud (en-GB by default) */
export const soyle = (ctx, metin, o = {}) => sesliOku(ctx, metin, { dil: "en-GB", hiz: 0.9, ...o });

/** A small labelled textarea with English placeholder (the engine's yaziAlani has a Turkish placeholder) */
export function metinKutusu({ etiket, deger = "", satir = 5, yerTutucu = "Write in English…", degisti, ozellik = {} }) {
  engStil();
  const t = el("textarea", { "aria-label": etiket, rows: String(satir), placeholder: yerTutucu, ...ozellik });
  t.value = deger;
  t.addEventListener("input", () => degisti?.(t.value));
  return { el: el("label", { class: "eng-etiketli" }, el("span", {}, etiket), t), t };
}

/** Live checklist view: maddeler [{metin, tamam}] */
export function kontrolListesi(maddeler) {
  engStil();
  return el("ul", { class: "eng-liste" }, maddeler.map((m) => el("li", { class: m.tamam ? "tamam" : "" }, m.tamam ? "✓ " : "○ ", m.metin)));
}
