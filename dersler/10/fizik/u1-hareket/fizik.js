// Dersin fizik modelleri — sahneden bağımsız, tools/test ile doğrulanır

/**
 * Parçalı sabit ivmeli hareket: [{sure, a}] dizisini t → {x, v, a} fonksiyonuna çevirir.
 * Tek parça verilirse bilinen x = x0 + v0·t + ½·a·t² modelidir.
 * Son parça sonlu süreliyse, araç o parçanın sonundaki hızla ivmesiz devam eder.
 */
export function parcali(x0, v0, parcalar) {
  const baslar = [];
  let t = 0, x = x0, v = v0;
  for (const p of parcalar) {
    baslar.push({ t, x, v, a: p.a, sure: p.sure });
    if (!Number.isFinite(p.sure)) break;
    x += v * p.sure + 0.5 * p.a * p.sure * p.sure;
    v += p.a * p.sure;
    t += p.sure;
  }
  const son = { t, x, v };
  return (zaman) => {
    if (Number.isFinite(baslar[baslar.length - 1].sure) && zaman >= son.t) {
      return { x: son.x + son.v * (zaman - son.t), v: son.v, a: 0 };
    }
    let b = baslar[0];
    for (const p of baslar) if (zaman >= p.t) b = p;
    const dt = zaman - b.t;
    return { x: b.x + b.v * dt + 0.5 * b.a * dt * dt, v: b.v + b.a * dt, a: b.a };
  };
}

/**
 * Trafik ışığına yaklaşan sürücü modeli (8. adım).
 * Sürücü duruştan a ivmesiyle vmax'a çıkar ve sabit hızla gider. Işık hâlâ kırmızıysa
 * b yavaşlamasıyla tam durma çizgisinde durur, yeşili bekler, sonra yine a ile vmax'a çıkar.
 * @returns {{parcalar:Array<{sure:number,a:number}>, gecis:number, kayip:number, bekleme:number, durdu:boolean}}
 *   gecis: çizgiden geçiş anı (s), kayip: frende ısıya dönüşen kinetik enerji (J), bekleme: ışıkta duruş süresi (s)
 */
export function surucuModeli({ a, vmax, b, cizgi, yesil, kutle }) {
  const dAcc = (vmax * vmax) / (2 * a), tAcc = vmax / a;
  const serbest = dAcc >= cizgi ? Math.sqrt((2 * cizgi) / a) : tAcc + (cizgi - dAcc) / vmax;
  if (serbest >= yesil) {
    return { parcalar: [{ sure: tAcc, a }, { sure: Infinity, a: 0 }], gecis: serbest, kayip: 0, bekleme: 0, durdu: false };
  }
  let parcalar, vTepe;
  const dFren = (vmax * vmax) / (2 * b);
  if (dAcc + dFren <= cizgi) {
    vTepe = vmax;
    parcalar = [{ sure: tAcc, a }, { sure: (cizgi - dAcc - dFren) / vmax, a: 0 }, { sure: vmax / b, a: -b }];
  } else {
    // en yüksek hıza ulaşmadan frene geçmesi gerekir
    vTepe = Math.sqrt((2 * a * b * cizgi) / (a + b));
    parcalar = [{ sure: vTepe / a, a }, { sure: vTepe / b, a: -b }];
  }
  const durus = parcalar.reduce((s, p) => s + p.sure, 0);
  const bekle = Math.max(0, yesil - durus);
  parcalar.push({ sure: bekle, a: 0 }, { sure: vmax / a, a }, { sure: Infinity, a: 0 });
  return { parcalar, gecis: durus + bekle, kayip: 0.5 * kutle * vTepe * vTepe, bekleme: bekle, durdu: true };
}
