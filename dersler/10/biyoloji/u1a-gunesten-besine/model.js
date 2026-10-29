// Dersin sayısal modelleri — sahneden bağımsız, tests/bio10-u1a-gunesten-besine.test.mjs ile doğrulanır.
// Değerler okul deneylerinde görülen büyüklüklere göre seçilmiş temsilî değerlerdir; eğilimler bilimsel modellerle uyumludur.

/* ------------------------------------------------------------------ */
/* 1. Besin zinciri: güneş ışığı → üretici → otçul → etçil              */
/* ------------------------------------------------------------------ */
export const ZINCIR = {
  U: 10, mP: 0.05,          // üretici: tam güneşte günlük fotosentez kazancı, solunum/ölüm kaybı (1/gün)
  fH: 0.05, eH: 0.1, mH: 0.02,  // otçul: üretici biyokütlesinden günlük tüketim oranı, aktarım verimi (~%10), solunum kaybı
  fC: 0.03, eC: 0.1, mC: 0.025, // etçil
};

/**
 * Bir günlük adım (enerji akışı, "bağışçı denetimli" doğrusal model: tüketim, besin kaynağının miktarıyla orantılı).
 * L: güneş ışığı (0–1). Biyokütleler enerji birimi cinsindendir.
 */
export function zincirAdim({ P, H, C }, L, z = ZINCIR) {
  const otlama = z.fH * P, avlanma = z.fC * H;
  const sinir = (v) => (v < 0.05 ? 0 : v);
  return {
    P: sinir(Math.max(0, P + L * z.U - z.mP * P - otlama)),
    H: sinir(Math.max(0, H + z.eH * otlama - z.mH * H - avlanma)),
    C: sinir(Math.max(0, C + z.eC * avlanma - z.mC * C)),
  };
}

/** L ışıktaki denge durumu (kapalı çözüm) */
export function zincirDengesi(L = 1, z = ZINCIR) {
  const P = (L * z.U) / (z.mP + z.fH);
  const H = (z.eH * z.fH * P) / (z.mH + z.fC);
  return { P, H, C: (z.eC * z.fC * H) / z.mC };
}

/* ------------------------------------------------------------------ */
/* 2. ATP: hücrenin şarj edilebilir pili                                */
/* ------------------------------------------------------------------ */
export const ATP_ENERJI_KJ = 30.5;   // ATP → ADP + Pi, standart koşullarda yaklaşık 30,5 kJ/mol (7,3 kcal/mol)
export const ISLER = [
  { ad: "kas", metin: "Kas kasılması", atp: 3 },
  { ad: "pompa", metin: "Aktif taşıma (zar pompası)", atp: 2 },
  { ad: "sentez", metin: "Protein sentezi", atp: 4 },
];
/** Hücrenin ATP havuzu: kullan() ATP'yi ADP + Pi'ye çevirir, doldur() solunumla yeniden ATP yapar */
export function atpHavuzu(kapasite = 5) {
  let atp = kapasite;
  return {
    get atp() { return atp; }, get adp() { return kapasite - atp; }, kapasite,
    kullan(n) { if (n > atp) return false; atp -= n; return true; },
    doldur() { const n = kapasite - atp; atp = kapasite; return n; },
  };
}

/* ------------------------------------------------------------------ */
/* 3. Pigmentler: soğurma ve etki (eylem) spektrumu                     */
/* ------------------------------------------------------------------ */
const g = (x, m, s, a = 1) => a * Math.exp(-0.5 * ((x - m) / s) ** 2);
/** Eğriyi 380–720 nm aralığındaki en yüksek değeri 1 olacak biçimde ölçekler */
function normal(f) {
  let m = 0;
  for (let l = 380; l <= 720; l += 0.5) m = Math.max(m, f(l));
  return (l) => f(l) / m;
}
/** Organik çözücüdeki soğurma spektrumlarının yaklaşık biçimleri (en yüksek değer = 1) */
export const PIGMENTLER = {
  klorofilA: { ad: "Klorofil a", renk: "#5ad38b", f: normal((l) => g(l, 430, 16, 1) + g(l, 662, 11, 0.78) + g(l, 615, 14, 0.13) + g(l, 380, 25, 0.35)) },
  klorofilB: { ad: "Klorofil b", renk: "#c6e86b", f: normal((l) => g(l, 455, 15, 1) + g(l, 642, 10, 0.62) + g(l, 595, 12, 0.08)) },
  karotenoit: { ad: "Karotenoitler (karoten, ksantofil)", renk: "#ffb547", f: normal((l) => g(l, 425, 12, 0.55) + g(l, 450, 15, 0.95) + g(l, 478, 13, 0.8)) },
};
/** Yaprağın toplam soğurduğu ışık oranı (0–1) */
export function yaprakSogurma(l) {
  const yogunluk = 2.2 * PIGMENTLER.klorofilA.f(l) + 1.0 * PIGMENTLER.klorofilB.f(l) + 0.9 * PIGMENTLER.karotenoit.f(l) + 0.06;
  return 1 - Math.exp(-yogunluk);
}
/** Etki (eylem) spektrumu: dalga boyuna göre göreli fotosentez hızı (0–1). Karotenoitlerin soğurduğu enerjinin bir kısmı aktarılır. */
export function eylemSpektrumu(l) {
  const etkin = 2.2 * PIGMENTLER.klorofilA.f(l) + 1.0 * PIGMENTLER.klorofilB.f(l) + 0.9 * 0.55 * PIGMENTLER.karotenoit.f(l) + 0.04;
  return 1 - Math.exp(-etkin);
}

/** Dalga boyunu (nm) yaklaşık görünür renge çevirir */
export function dalgaRengi(l, parlaklik = 1) {
  let r = 0, gr = 0, b = 0;
  if (l < 440) { r = -(l - 440) / 60; b = 1; }
  else if (l < 490) { gr = (l - 440) / 50; b = 1; }
  else if (l < 510) { gr = 1; b = -(l - 510) / 20; }
  else if (l < 580) { r = (l - 510) / 70; gr = 1; }
  else if (l < 645) { r = 1; gr = -(l - 645) / 65; }
  else r = 1;
  const kenar = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 680 ? 0.3 + 0.7 * (750 - l) / 70 : 1;
  const k = Math.max(0, Math.min(1, kenar)) * parlaklik;
  const h = (v) => Math.round(255 * Math.pow(Math.max(0, v) * k, 0.8));
  return `rgb(${h(r)},${h(gr)},${h(b)})`;
}

/* ------------------------------------------------------------------ */
/* 4. Su bitkisi (Elodea) kabarcık deneyi                               */
/* ------------------------------------------------------------------ */
/** Renkli filtre: aynı ışık şiddetinde göreli etkinlik (eylem spektrumuyla uyumlu sıralama) */
export const ISIK_RENKLERI = {
  beyaz: { ad: "Beyaz", etkinlik: 0.75, renk: "#fff6d8", nm: null },
  kirmizi: { ad: "Kırmızı", etkinlik: 1.0, renk: "#ff5a4f", nm: 660 },
  turuncu: { ad: "Turuncu", etkinlik: 0.8, renk: "#ff9a3c", nm: 610 },
  sari: { ad: "Sarı", etkinlik: 0.55, renk: "#ffe14d", nm: 580 },
  yesil: { ad: "Yeşil", etkinlik: 0.35, renk: "#59e06b", nm: 530 },
  mavi: { ad: "Mavi", etkinlik: 0.8, renk: "#4f8dff", nm: 450 },
};
export const FOTO = { alfa: 0.6, Pmax: 50, Kc: 0.15, co2Hava: 0.02, teta: 0.9, R25: 1.2, Tmin: 0, Topt: 30, Tmax: 45 };

/** Lamba uzaklığından göreli ışık şiddeti (%): ters kare yasası, 10 cm'de %100 */
export const isikSiddeti = (uzaklikCm) => Math.min(100, 100 * (10 / uzaklikCm) ** 2);

/** Sıcaklığın Calvin döngüsü enzimlerine etkisi (0–1): optimumda 1, en düşük ve en yüksek sıcaklıkta 0 (Yan–Hunt biçimi) */
export function sicaklikEtkisi(T, f = FOTO) {
  if (T <= f.Tmin || T >= f.Tmax) return 0;
  const us = (f.Topt - f.Tmin) / (f.Tmax - f.Topt);
  return ((f.Tmax - T) / (f.Tmax - f.Topt)) * ((T - f.Tmin) / (f.Topt - f.Tmin)) ** us;
}

/**
 * Fotosentez hızı. isik: göreli ışık şiddeti (%), renk: ISIK_RENKLERI anahtarı,
 * co2: suya eklenen sodyum bikarbonat (%), T: su sıcaklığı (°C).
 * Işığa bağımlı hız (J) ile CO₂ ve sıcaklığa bağlı Calvin kapasitesi (Pc) yumuşak "en küçük" ile birleşir:
 * hangisi küçükse hızı o sınırlar (sınırlayıcı faktör).
 * @returns {{J:number, Pc:number, brut:number, solunum:number, net:number, kabarcik:number}} kabarcık/dk
 */
export function fotosentezHizi({ isik, renk = "beyaz", co2 = 0.5, T = 25 }, f = FOTO) {
  const J = f.alfa * ISIK_RENKLERI[renk].etkinlik * Math.max(0, isik);
  const C = f.co2Hava + Math.max(0, co2);
  const Pc = f.Pmax * (C / (C + f.Kc)) * sicaklikEtkisi(T, f);
  const toplam = J + Pc;
  const brut = J > 0 && Pc > 0 ? (toplam - Math.sqrt(Math.max(0, toplam * toplam - 4 * f.teta * J * Pc))) / (2 * f.teta) : 0;
  const solunum = T >= 50 ? 0 : f.R25 * 2 ** ((T - 25) / 10);
  const net = brut - solunum;
  return { J, Pc, brut, solunum, net, kabarcik: Math.max(0, net) };
}

/** Hızı en çok artıran faktör: "isik" | "co2" | "sicaklik" */
export function sinirlayiciFaktor(k, f = FOTO) {
  const temel = fotosentezHizi(k, f).brut || 1e-9;
  const T2 = k.T < f.Topt ? Math.min(f.Topt, k.T + 5) : Math.max(f.Topt, k.T - 5);
  const artis = {
    isik: fotosentezHizi({ ...k, isik: Math.min(100, k.isik * 1.5 + 1) }, f).brut / temel,
    co2: fotosentezHizi({ ...k, co2: k.co2 * 1.5 + 0.05 }, f).brut / temel,
    sicaklik: fotosentezHizi({ ...k, T: T2 }, f).brut / temel,
  };
  return Object.entries(artis).sort((a, b) => b[1] - a[1])[0][0];
}

/* ------------------------------------------------------------------ */
/* 5. Işığa bağımlı ve ışıktan bağımsız tepkimelerin bağlantısı         */
/* ------------------------------------------------------------------ */
/**
 * A: tilakoitte üretilen ATP + NADPH havuzu (0–1). Işık havuzu doldurur (havuz doluysa ADP ve NADP⁺ azaldığı
 * için ışık tepkimeleri yavaşlar), Calvin döngüsü CO₂ varken havuzu boşaltır.
 */
export const BAG = { kL: 0.8, kC: 0.5 };
export function tepkimeAdim(A, { isik, co2 }, dt, b = BAG) {
  const isikHizi = b.kL * (isik ? 1 : 0) * (1 - A);   // fotoliz ve O₂ çıkışı
  const calvinHizi = b.kC * A * (co2 ? 1 : 0);        // CO₂ tutulması, glikoz yapımı
  const yeniA = Math.min(1, Math.max(0, A + (isikHizi - calvinHizi) * dt));
  return { A: yeniA, o2: isikHizi, glikoz: calvinHizi };
}

/** Ruben–Kamen (1941) yaklaşımı: ¹⁸O ile işaretlenen madde hangisiyse işaret nerede görülür? */
export function izotopDeneyi(isaretli) {
  // 6 CO₂ + 12 H₂O → C₆H₁₂O₆ + 6 O₂ + 6 H₂O : açığa çıkan O₂'nin tamamı sudan gelir
  return isaretli === "su"
    ? { o2: true, glikoz: false, uretilenSu: false }
    : { o2: false, glikoz: true, uretilenSu: true };
}
export const DENKLEM = { sol: { CO2: 6, H2O: 12 }, sag: { C6H12O6: 1, O2: 6, H2O: 6 } };

/* ------------------------------------------------------------------ */
/* 6. Çan fanus (Priestley – Ingenhousz)                                 */
/* ------------------------------------------------------------------ */
export const FANUS = { o2Bas: 21, co2Bas: 0.04, sonmeO2: 16, yanmaO2: 16.5, uretim: 0.6, solunum: 0.1 };
/** Mum, O₂ %16'ya düşünce söner. Yanma O₂ harcar, CO₂ üretir (mum mumunda oran ≈ 0,7). */
export function mumYak(d, f = FANUS) {
  if (d.o2 < f.yanmaO2) return { ...d, yandi: false };
  const harcanan = d.o2 - f.sonmeO2;
  return { o2: f.sonmeO2, co2: d.co2 + harcanan * 0.7, yandi: true, harcanan };
}
/** Bir gün bekleme. Işıkta bitki CO₂ varsa O₂ üretir; karanlıkta yalnızca solunum yapar. */
export function fanusGun(d, { bitki, isik }, f = FANUS) {
  if (!bitki) return { ...d };
  if (isik) {
    const fs = Math.max(0, Math.min(f.uretim, d.co2 - 0.03));
    return { o2: d.o2 + fs, co2: d.co2 - fs };
  }
  const s = Math.min(f.solunum, d.o2);
  return { o2: d.o2 - s, co2: d.co2 + s };
}
