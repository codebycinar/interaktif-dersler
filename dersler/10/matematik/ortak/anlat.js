// Adım adım anlatım (engine/anlatim.js) için matematik yardımcıları.
// - gosterimde(): anlatım kareleri oynarken true. Bu sırada görev ve görev listesi işaretlenmez
//   (gösterim görevi tamamlatmaz; rehber 4·0).
// - anlatimliAdimlar(): adımların ctx.gorevTamam'ını gösterim süresince etkisiz kılar.
// - kaydir(), gecis(): tahtadaki noktaları ve sahne değerlerini yumuşakça hareket ettirir.

let sifirlaniyor = false;
/** Anlatım kareleri oynuyor mu? (anlatım bitmemişken, uygulama bölümü gizliyken ya da anlatBitti çalışırken) */
export const gosterimde = () => sifirlaniyor ||
  !!(document.querySelector(".d-panel .d-anlat:not(.bitti)") || document.querySelector(".d-panel .d-uygulama-blok[hidden]"));

/**
 * Anlatımı olan adımlarda, gösterim sırasında ctx.gorevTamam() çağrılarını yok sayar. anlatBitti de gösterim sayılır:
 * ↺ Baştan ile yeniden izlenince uygulama bölümü zaten açıktır, sahneyi sıfırlamak görev maddesi işaretlememeli.
 */
export function anlatimliAdimlar(adimlar) {
  return adimlar.map((a) => (a.anlat ? {
    ...a,
    anlatBitti: a.anlatBitti && ((api, ctx) => {
      sifirlaniyor = true;
      try { a.anlatBitti(api, ctx); } finally { sifirlaniyor = false; }
    }),
    kur(ctx) {
      durdurHepsi();
      ctx.temizlik?.(durdurHepsi);
      const tamam = ctx.gorevTamam;
      ctx.gorevTamam = (...x) => (gosterimde() ? undefined : tamam(...x));
      return a.kur(ctx);
    },
  } : a));
}

const yumusak = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const calisan = new Map();

/**
 * anahtar için 0 → 1 arası yumuşak geçiş; her karede adim(k) çağrılır. Aynı anahtarla yeni geçiş
 * başlarsa eskisi durur. Geçiş bitince true, yarıda durdurulursa false ile çözülen Promise döner.
 */
export function gecis(anahtar, sure, adim) {
  return new Promise((coz) => {
    const jeton = {};
    calisan.set(anahtar, jeton);
    const t0 = performance.now();
    const kare = (s) => {
      if (calisan.get(anahtar) !== jeton) return coz(false);
      const t = Math.min(1, (s - t0) / Math.max(1, sure * 1000));
      try { adim(yumusak(t)); } catch (e) { console.error(e); return coz(false); }
      if (t < 1) requestAnimationFrame(kare); else { calisan.delete(anahtar); coz(true); }
    };
    requestAnimationFrame(kare);
  });
}
/** Bekleyen geçişi anında sonlandırır (anlatBitti'de sahne sıfırlanırken) */
export const durdur = (anahtar) => calisan.delete(anahtar);
/** Bütün geçişleri durdurur (adım değişirken ve anlatım bitince) */
export const durdurHepsi = () => calisan.clear();

/** Tahtadaki noktayı (x, y)'ye kaydırır; noktanın kısıtı her karede uygulanır */
export function kaydir(n, x, y, sure = 0.9) {
  const x0 = n.x, y0 = n.y;
  return gecis(n, sure, (k) => n.ayarla(x0 + (x - x0) * k, y0 + (y - y0) * k));
}
/** Birden çok noktayı aynı anda kaydırır: [[n, x, y], …] */
export const hepsiniKaydir = (liste, sure = 0.9) =>
  Promise.all(liste.map(([n, x, y]) => kaydir(n, x, y, sure))).then((s) => s.every(Boolean));
/** Noktaları hemen yerleştirir; kısıt ara adımda (ör. geçersiz üçgen) reddedebileceği için birkaç tur dener */
export function hepsiniKoy(noktalar, hedef) {
  for (let tur = 0; tur < 3; tur++) noktalar.forEach((n, i) => n.ayarla(...hedef[i]));
}
/** Noktaları birlikte hedef konumlara ([[x, y], …]) kaydırır; geçiş yarıda kesilmezse tam yerine oturtur */
export async function hepsiniTasi(noktalar, hedef, sure = 1) {
  if (await hepsiniKaydir(noktalar.map((n, i) => [n, ...hedef[i]]), sure)) hepsiniKoy(noktalar, hedef);
}
