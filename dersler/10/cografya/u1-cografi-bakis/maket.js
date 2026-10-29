// Yerel ölçekli görünümler: ayrıntılı kıyılar ve örnek mekânların 3B maketleri (adımlar ve anlatım kareleri ortak kullanır)
import { geoContains } from "d3-geo";
import { BOLGE, kenarlariHazirla } from "../../tarih/ortak/harita.js";
import { sehir, kopru, gemi, cayBahcesi, agaclar, tuzla, koy, yolNoktasi } from "../../tarih/ortak/nesneler.js";
import yerel from "./yerel.json";

// yerel görünümde ayrıntılı kıyı kırpım kutusunun içinde, bölge haritası dışında kalır
export const YEREL = { bogaz: [...BOLGE, ...kenarlariHazirla(yerel.bogaz)], rize: [...BOLGE, ...kenarlariHazirla(yerel.rize)], tuz: BOLGE };

/* ---------- 3B maketler ---------- */
const karadaMi = (o, ll) => YEREL[o.id].some((f) => geoContains(f, ll));
/** Örnek mekânın maketleri: tuzlalar ve şehirler, Boğaz köprüleri ve gemiler, Rize'de çay bahçeleri */
let gemiDongusu = null;
export function yerelMaket(h, o, ad = "yerel") {
  let gemiler = [];
  h.model(ad, (g) => {
    gemiler = [];
    const SEHIR = { Ankara: 60, Konya: 45, Aksaray: 30, Bursa: 45, İzmit: 35, Edirne: 30, Trabzon: 40, Artvin: 20, Erzurum: 35, Rize: 35 };
    for (const s of o.goreceli) if (h.kutu && s.konum[0] > h.kutu[0][0] && s.konum[0] < h.kutu[1][0] && s.konum[1] > h.kutu[0][1] && s.konum[1] < h.kutu[1][1]) koy(h, g, sehir({ ev: SEHIR[s.sehir] || 30, cami: true, tohum: s.sehir.length }), s.konum, { boy: 7 });
    if (o.id === "tuz") {
      koy(h, g, tuzla(), [33.62, 38.97], { boy: 6, yon: 30 });
      koy(h, g, sehir({ ev: 18, tohum: 4, yaricap: 0.4 }), [33.58, 39.03], { boy: 5 });
      koy(h, g, sehir({ ev: 18, tohum: 6, yaricap: 0.4 }), [32.93, 38.66], { boy: 5 });
    }
    if (o.id === "bogaz") {
      // İstanbul'un iki yakası, üç köprü ve Boğaz'dan geçen gemiler
      const r = rastgeleSayi(3), evler = [];
      for (let i = 0; i < 70 && evler.length < 26; i++) {
        const ll = [28.8 + r() * 0.42, 40.97 + r() * 0.2];
        if (karadaMi(o, ll) && !BOGAZ_YOLU.some((q) => Math.hypot(q[0] - ll[0], q[1] - ll[1]) < 0.025)) evler.push(ll);
      }
      evler.forEach((ll, i) => koy(h, g, sehir({ ev: 14, cami: i % 5 === 0, tohum: i + 1, yaricap: 0.5 }), ll, { boy: 2.4 }));
      for (const k of o.kopruler) {
        const p = h.yer(k.konum), i = BOGAZ_YOLU.findIndex((q) => q[1] < k.konum[1]);
        const a = h.yer(BOGAZ_YOLU[Math.max(0, i - 1)]), b = h.yer(BOGAZ_YOLU[Math.max(1, i)]);
        const aci = Math.atan2(-(b.z - a.z), b.x - a.x) + Math.PI / 2;
        const m = kopru({ boy: 1 });
        m.position.copy(p).setY(0); m.scale.setScalar(h.olcek * 2.2); m.rotation.y = aci; g.add(m);
      }
      const yol = yolNoktasi(h, BOGAZ_YOLU);
      ["#9c2f2a", "#2f5f8f", "#3b6b3a"].forEach((renk, i) => { const m = gemi({ renk }); m.scale.setScalar(h.olcek * 1.4); m.userData.u0 = i / 3; m.userData.yon = i % 2 ? 1 : -1; m.userData.yol = yol; g.add(m); gemiler.push(m); });
    }
    if (o.id === "rize") {
      // kıyıdan iç kesime doğru yamaçlarda çay bahçeleri, daha yüksekte orman
      const r = rastgeleSayi(7), cay = [], orman = [];
      for (let i = 0; i < 2600; i++) {
        const ll = [39.85 + r() * 1.55, 40.62 + r() * 0.5];
        if (!karadaMi(o, ll)) continue;
        const p = h.yer(ll), m = p.y / (h.olcek || 1);
        if (m < 1.4 && cay.length < 900) cay.push(Object.assign(p, { aci: r() * 3 }));
        else if (m >= 1.4 && orman.length < 500) orman.push(p);
      }
      if (cay.length) g.add(cayBahcesi(cay, { olcek: h.olcek * 6 }));
      if (orman.length) g.add(agaclar(orman, { olcek: h.olcek * 7, kozalakli: 0.6, renk: "#355f32" }));
    }
  });
  gemiDongusu?.();
  gemiDongusu = null;
  if (o.id !== "bogaz") return;
  gemiDongusu = h.herKare((sn) => {
    for (const m of gemiler) {
      const u = (m.userData.u0 + sn * 0.01) % 1, uu = m.userData.yon > 0 ? u : 1 - u;
      const p = m.userData.yol(uu), q = m.userData.yol(Math.min(1, Math.max(0, uu + 0.01 * m.userData.yon)));
      m.position.set(p.x, 0.02, p.z); m.rotation.y = Math.atan2(-(q.z - p.z), q.x - p.x);
    }
  });
}
// Boğaz'ın orta hattı (kuzeyden güneye, temsilî)
/** Boğaz'daki gemi döngüsünü durdurur (maket kaldırılınca boşuna çizim yapılmasın) */
export function gemileriDurdur() { gemiDongusu?.(); gemiDongusu = null; }
export const BOGAZ_YOLU = [[29.14, 41.25], [29.1, 41.2], [29.07, 41.15], [29.06, 41.11], [29.055, 41.08], [29.04, 41.06], [29.025, 41.04], [29.0, 41.01], [28.99, 40.98], [29.0, 40.94]];
export function rastgeleSayi(t) { let x = t * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); }
