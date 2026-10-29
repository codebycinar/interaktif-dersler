// İkta sistemi için TEMSİLÎ düşünce modeli (8. adım). Sayılar tarihî veri değildir;
// yalnızca nitel ilişkileri (yön ve eğilim) göstermek için 0–100 ölçeğinde göstergelerdir.
//   p: ordunun ikta ile beslenen bölümü (0–1)
//   denetim: ikta merkezden denetleniyor, gerekirse geri alınabiliyor mu (Nizamülmülk dönemi) yoksa
//            iktalar fiilen babadan oğula geçiyor mu (sonraki dönemler)
export function iktaModeli({ oran, denetim }) {
  const p = Math.max(0, Math.min(1, oran));
  const y = (v) => Math.round(v * 10) / 10; // kayan nokta artıklarını (40,000…01) eşik karşılaştırmasından temizle
  return {
    maas: y(100 * (1 - p)),            // hazineden nakit maaş yükü
    asker: y(50 + 45 * p),             // savaşa hazır asker
    uretim: y(45 + 45 * p),            // toprağın işlenmesi ve vergilerin düzenli toplanması
    otorite: y(denetim ? 85 - 15 * p : 85 - 75 * p), // merkezî otorite
  };
}

export const HEDEF = { maasEnCok: 40, askerEnAz: 70, otoriteEnAz: 60 };

export const hedefSaglandi = (m) => m.maas <= HEDEF.maasEnCok && m.asker >= HEDEF.askerEnAz && m.otorite >= HEDEF.otoriteEnAz;

/** Haritadaki temsilî ikta parselleri: i. parsel, oran p iken ikta mı? (sabit, dağınık bir sırayla dolar) */
const ebob = (a, b) => (b ? ebob(b, a % b) : a);
export function parselIktaMi(i, n, p) {
  let adim = 7;
  while (ebob(adim, n) !== 1) adim += 2; // n ile aralarında asal adım → her parsel tam bir kez sıralanır
  return (i * adim) % n < Math.round(p * n);
}
