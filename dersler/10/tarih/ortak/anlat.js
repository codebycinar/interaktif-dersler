// Harita derslerinde adım adım anlatım kareleri (engine/anlatim.js) için yardımcılar.
// Her kare sahnede bir şey yapar: kamerayı bir bölgeye götürür, yerleri işaretler, ok ve alan çizer.
// Anlatım bitince harita adımın başladığı görünüme döner ve anlatım katmanları silinir.
import { isaret, etiket, cizgi, alan } from "./harita.js";

const baslangic = new WeakMap(); // ctx → adımın ilk kutusu

/**
 * Metin karesi.
 * o.kutu: kameranın gideceği [[batı, güney], [doğu, kuzey]] · o.yerler: [{ konum, ad, renk?, dy? }]
 * o.oklar: [{ yol, renk?, kesikli? }] · o.alanlar: [{ halka, renk? }] · o.maket(g, h): 3B ek nesneler
 */
export function kare(s, o = {}) {
  return {
    s, oku: o.oku,
    yap(api, ctx) {
      const h = ctx.sahne;
      // anlatım boyunca alıştırma kartları gizli (d-gosterimde): harita bütün görünür alanı kullanır
      if (!baslangic.has(ctx)) { baslangic.set(ctx, { kutu: h.kutu, pay: h.pay }); if (h.pay) h.zemin({ pay: null }); }
      if (o.kutu) h.kutuya(o.kutu, 700);
      h.katman("anlat", (g) => {
        for (const a of o.alanlar || []) alan(g, h, a.halka, { renk: a.renk || "#ffb547" });
        for (const k of o.oklar || []) cizgi(g, h, k.yol, { renk: k.renk || "sari", ok: true, kesikli: k.kesikli, kalinlik: 3 });
        // adımın kendi katmanında aynı ad zaten yazılıysa yalnız nabız işareti konur (çift etiket olmasın)
        const yazili = new Set([...(g.ownerSVGElement?.querySelectorAll("text") || [])].filter((t) => !g.contains(t)).map((t) => t.textContent.trim()));
        for (const y of o.yerler || []) {
          const p = h.xy(y.konum);
          isaret(g, p, { r: 7, renk: y.renk || "#ffb547", nabiz: true });
          if (y.ad && !yazili.has(y.ad)) etiket(g, p, y.ad, { dy: y.dy ?? -12, sinif: "vurgu" });
        }
      });
      if (o.maket) h.model("anlat", (g) => o.maket(g, h));
      else h.modelSil("anlat");
      o.yap?.(api, ctx);
    },
  };
}

/** Mini soru karesi */
export const soru = (metin, secenekler, dogru, aciklama, ipucu) => ({ soru: metin, secenekler, dogru, aciklama, ipucu });

/** Çözümlü örnek (satır satır açılır) */
export const cozum = (satirlar, baslik) => ({ cozum: satirlar, baslik });

/** Anlatım bitti: haritayı adımın ilk görünümüne döndürür */
export function anlatBitti(api, ctx) {
  const h = ctx.sahne;
  h.katmanSil("anlat");
  h.modelSil("anlat");
  const b = baslangic.get(ctx);
  if (b) { if (b.pay) h.zemin({ pay: b.pay }); h.kutuya(b.kutu, 700); baslangic.delete(ctx); }
}

/** Adımlara anlatım karelerini ekler: kareler[i] → adimlar[i].anlat */
export function anlatimEkle(adimlar, kareler) {
  adimlar.forEach((a, i) => {
    if (!kareler[i]?.length) return;
    a.anlat = kareler[i];
    const onceki = a.anlatBitti;
    a.anlatBitti = (api, ctx) => { anlatBitti(api, ctx); onceki?.(api, ctx); };
  });
  return adimlar;
}
