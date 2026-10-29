// node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import {
  zincirAdim, zincirDengesi, atpHavuzu, ISLER, yaprakSogurma, eylemSpektrumu, ISIK_RENKLERI, isikSiddeti, sicaklikEtkisi,
  fotosentezHizi, sinirlayiciFaktor, tepkimeAdim, BAG, izotopDeneyi, DENKLEM, mumYak, fanusGun, FANUS,
} from "../dersler/10/biyoloji/u1a-gunesten-besine/model.js";

const yakin = (gercek, beklenen, tol = 1e-6, mesaj = "") =>
  assert.ok(Math.abs(gercek - beklenen) <= tol, `${mesaj} beklenen ${beklenen}, gelen ${gercek}`);

test("besin zinciri: tam güneşte denge kararlıdır ve enerji piramidi daralır", () => {
  const d = zincirDengesi(1);
  let s = { ...d };
  for (let i = 0; i < 200; i++) s = zincirAdim(s, 1);
  for (const k of ["P", "H", "C"]) yakin(s[k], d[k], 1e-6, k);
  assert.ok(d.P > d.H && d.H > d.C, "üretici > otçul > etçil");
});

test("güneş kesilince önce üretici, sonra otçul, en son etçil yarıya iner", () => {
  const d = zincirDengesi(1);
  let s = { ...d };
  const yari = {};
  for (let g = 1; g < 400; g++) {
    s = zincirAdim(s, 0);
    for (const k of ["P", "H", "C"]) if (!yari[k] && s[k] < d[k] / 2) yari[k] = g;
  }
  assert.ok(yari.P < yari.H && yari.H < yari.C, JSON.stringify(yari));
  assert.ok(yari.C < 160, "etçiller dersin 160 günlük penceresinde yarıya iner");
  assert.equal(s.P + s.H + s.C, 0, "sonunda zincir tükenir");
});

test("güneş yarıya inince denge biyokütleleri de yarıya iner (doğrusal enerji akışı)", () => {
  const a = zincirDengesi(1), b = zincirDengesi(0.5);
  for (const k of ["P", "H", "C"]) yakin(b[k], a[k] / 2, 1e-9, k);
});

test("ATP pili: üç iş toplam 9 ATP ister, 5'lik pil en az bir kez doldurulmalı", () => {
  const toplam = ISLER.reduce((t, i) => t + i.atp, 0);
  assert.equal(toplam, 9);
  const h = atpHavuzu(5);
  assert.ok(h.kullan(3)); assert.ok(h.kullan(2));
  assert.equal(h.kullan(4), false, "yetersiz ATP");
  assert.equal(h.adp, 5);
  assert.equal(h.doldur(), 5);
  assert.ok(h.kullan(4));
});

test("pigmentler: yaprak mavi ve kırmızıyı çok, yeşili az soğurur", () => {
  for (const l of [430, 450, 660]) assert.ok(yaprakSogurma(l) > 0.8, `${l} nm`);
  for (const l of [530, 550, 560]) assert.ok(yaprakSogurma(l) < 0.1, `${l} nm`);
  // 5. adım görevi: %10'un altında bir dalga boyu kaydırıcıda (5 nm adım) bulunabilir
  const bulunan = []; for (let l = 400; l <= 700; l += 5) if (l < 650 && yaprakSogurma(l) < 0.1) bulunan.push(l);
  assert.ok(bulunan.length >= 5 && bulunan.every((l) => l > 500 && l < 600), String(bulunan));
});

test("etki spektrumu Engelmann sonucuyla uyumlu: mavi-mor ve kırmızı > yeşil", () => {
  const yesil = eylemSpektrumu(550);
  assert.ok(eylemSpektrumu(435) > 4 * yesil);
  assert.ok(eylemSpektrumu(665) > 4 * yesil);
  // iki tepe arasındaki en düşük değer yeşil bölgede
  let enAz = 400; for (let l = 450; l <= 650; l++) if (eylemSpektrumu(l) < eylemSpektrumu(enAz)) enAz = l;
  assert.ok(enAz >= 500 && enAz <= 600, `en düşük ${enAz} nm`);
});

test("ışık şiddeti ters kare yasasına uyar", () => {
  yakin(isikSiddeti(10), 100);
  yakin(isikSiddeti(20), 25);
  yakin(isikSiddeti(40), 6.25);
  yakin(isikSiddeti(20) / isikSiddeti(40), 4);
});

test("sıcaklık etkisi: optimumda 1, sınırlarda 0, optimumun üstünde hızlı düşüş", () => {
  yakin(sicaklikEtkisi(30), 1);
  assert.equal(sicaklikEtkisi(0), 0); assert.equal(sicaklikEtkisi(45), 0);
  assert.ok(sicaklikEtkisi(20) < 1 && sicaklikEtkisi(40) < sicaklikEtkisi(35));
  // optimumdan 10 °C yukarıdaki düşüş, 10 °C aşağıdakinden büyük (enzimlerin bozulması)
  assert.ok(sicaklikEtkisi(40) < sicaklikEtkisi(20));
});

test("fotosentez hızı: ışık, CO₂ ve sıcaklıkla beklenen yönde değişir", () => {
  const h = (k) => fotosentezHizi({ renk: "beyaz", co2: 0.5, T: 25, isik: 50, ...k }).brut;
  // ışıkla artar ve doyuma ulaşır
  assert.ok(h({ isik: 10 }) < h({ isik: 30 }) && h({ isik: 30 }) < h({ isik: 60 }));
  assert.ok(h({ isik: 100 }) - h({ isik: 80 }) < h({ isik: 30 }) - h({ isik: 10 }), "artış azalır");
  // CO₂ ile artar
  assert.ok(h({ co2: 0 }) < h({ co2: 0.2 }) && h({ co2: 0.2 }) < h({ co2: 1 }));
  // brüt hız hem ışığa bağımlı hızdan hem Calvin kapasitesinden küçüktür
  const r = fotosentezHizi({ isik: 60, renk: "beyaz", co2: 0.3, T: 25 });
  assert.ok(r.brut <= r.J + 1e-9 && r.brut <= r.Pc + 1e-9);
  // karanlıkta kabarcık yok, net hız negatif (solunum)
  const k = fotosentezHizi({ isik: 0, co2: 0.5, T: 25 });
  assert.equal(k.kabarcik, 0); assert.ok(k.net < 0);
});

test("düşük ışıkta sıcaklığın etkisi az, yüksek ışıkta büyüktür (Blackman)", () => {
  const h = (isik, T) => fotosentezHizi({ isik, renk: "beyaz", co2: 0.5, T }).brut;
  const dusuk = h(5, 30) / h(5, 15), yuksek = h(100, 30) / h(100, 15);
  assert.ok(dusuk < 1.15, `düşük ışıkta oran ${dusuk}`);
  assert.ok(yuksek > 1.5, `yüksek ışıkta oran ${yuksek}`);
});

test("ışık rengi: kırmızı > mavi > beyaz > sarı > yeşil (aynı şiddette)", () => {
  const h = (renk) => fotosentezHizi({ isik: 25, renk, co2: 0.5, T: 25 }).kabarcik;
  assert.ok(h("kirmizi") > h("mavi") && h("mavi") >= h("beyaz") && h("beyaz") > h("sari") && h("sari") > h("yesil"));
  assert.ok(h("yesil") > 0, "yeşilde de bir miktar fotosentez olur");
  for (const r of Object.values(ISIK_RENKLERI)) assert.ok(r.etkinlik > 0 && r.etkinlik <= 1);
});

test("kabarcık deneyi: okul deneyine uygun büyüklükler (10–40 kabarcık/dk yakın lambada)", () => {
  const k = (d) => fotosentezHizi({ isik: isikSiddeti(d), renk: "beyaz", co2: 0.3, T: 25 }).kabarcik;
  assert.ok(k(10) > 15 && k(10) < 45, `10 cm: ${k(10)}`);
  assert.ok(k(10) > k(20) && k(20) > k(30) && k(30) > k(40));
  // 5 farklı uzaklıkta ölçülebilir kabarcık çıkar (görev yapılabilir)
  assert.ok([10, 15, 20, 25, 30].every((d) => k(d) >= 2));
});

test("sınırlayıcı faktör: dört sera senaryosu", () => {
  assert.equal(sinirlayiciFaktor({ isik: 8, co2: 0.5, T: 25 }), "isik");
  assert.equal(sinirlayiciFaktor({ isik: 100, co2: 0, T: 28 }), "co2");
  assert.equal(sinirlayiciFaktor({ isik: 100, co2: 0.5, T: 8 }), "sicaklik");
  assert.equal(sinirlayiciFaktor({ isik: 100, co2: 0.5, T: 42 }), "sicaklik");
});

test("ışık–Calvin bağı: ışık kapanınca glikoz yapımı birkaç saniyede durur", () => {
  let A = 0;
  for (let t = 0; t < 30; t += 0.05) A = tepkimeAdim(A, { isik: true, co2: true }, 0.05).A;
  yakin(A, BAG.kL / (BAG.kL + BAG.kC), 1e-3, "denge düzeyi");
  const basta = tepkimeAdim(A, { isik: false, co2: true }, 0.05).glikoz;
  assert.ok(basta > 0.2, "ışık kapandığı an Calvin hâlâ çalışıyor");
  let t = 0, r;
  do { r = tepkimeAdim(A, { isik: false, co2: true }, 0.05); A = r.A; t += 0.05; } while (r.glikoz / BAG.kC > 0.1 && t < 60);
  assert.ok(t > 1 && t < 10, `glikoz yapımı ${t.toFixed(1)} s'de durdu`);
});

test("ışık–Calvin bağı: CO₂ kesilince ATP+NADPH birikir, O₂ çıkışı yavaşlar", () => {
  let A = 0.6;
  const o2Once = tepkimeAdim(A, { isik: true, co2: true }, 0.05).o2;
  let r;
  for (let t = 0; t < 30; t += 0.05) { r = tepkimeAdim(A, { isik: true, co2: false }, 0.05); A = r.A; }
  assert.ok(A > 0.95);
  assert.ok(r.o2 < 0.2 * o2Once);
  assert.equal(r.glikoz, 0);
});

test("izotop deneyi ve denklem: O₂ sudan gelir, oksijen atomları korunur", () => {
  assert.deepEqual(izotopDeneyi("su"), { o2: true, glikoz: false, uretilenSu: false });
  assert.deepEqual(izotopDeneyi("co2"), { o2: false, glikoz: true, uretilenSu: true });
  const { sol, sag } = DENKLEM;
  const O = { sol: sol.CO2 * 2 + sol.H2O, sag: sag.C6H12O6 * 6 + sag.O2 * 2 + sag.H2O };
  const C = { sol: sol.CO2, sag: sag.C6H12O6 * 6 };
  const H = { sol: sol.H2O * 2, sag: sag.C6H12O6 * 12 + sag.H2O * 2 };
  assert.equal(O.sol, O.sag); assert.equal(C.sol, C.sag); assert.equal(H.sol, H.sag);
  // açığa çıkan O₂'deki 12 oksijen atomu, 12 sudaki 12 oksijenle aynı sayıda
  assert.equal(sag.O2 * 2, sol.H2O);
});

test("fanus: mum O₂ %16'da söner; bitki yalnızca ışıkta yeniden yakar", () => {
  let d = { o2: FANUS.o2Bas, co2: FANUS.co2Bas };
  const s = mumYak(d);
  assert.ok(s.yandi); yakin(s.o2, 16); assert.ok(s.co2 > 3);
  d = { o2: s.o2, co2: s.co2 };
  assert.equal(mumYak(d).yandi, false, "hemen yeniden yanmaz");
  const karanlik = fanusGun(d, { bitki: true, isik: false });
  assert.ok(karanlik.o2 < d.o2, "karanlıkta bitki O₂ harcar");
  assert.equal(mumYak(karanlik).yandi, false);
  const bos = fanusGun(d, { bitki: false, isik: true });
  assert.deepEqual(bos, d, "bitkisiz fanusta bir şey değişmez (kontrol)");
  const isik = fanusGun(d, { bitki: true, isik: true });
  assert.ok(isik.o2 > d.o2 && isik.co2 < d.co2, "ışıkta CO₂ kullanılır, O₂ üretilir");
  assert.ok(mumYak(isik).yandi, "bir gün ışıkta bekleyince mum yeniden yanar");
  // O₂ en fazla mumun harcadığı kadar geri kazanılır (CO₂ biter)
  let x = isik; for (let i = 0; i < 40; i++) x = fanusGun(x, { bitki: true, isik: true });
  assert.ok(x.o2 <= FANUS.o2Bas + 0.05 && x.co2 >= 0.029);
});
