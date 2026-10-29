// node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import {
  INCE_BAGIRSAK, KATSAYI, boruAlani, yuzeyKatsayisi, toplamAlan, EMILIM_K, emilenOran, GECIS_SURESI,
  SUREC, hucreyeUlasan, VAKALAR, CANLILAR, SECENEK, HAYVANLAR, MADDELER,
} from "../dersler/10/biyoloji/u1b-kemosentez-sindirim/model.js";

const yakin = (gercek, beklenen, tol = 1e-6, mesaj = "") =>
  assert.ok(Math.abs(gercek - beklenen) <= tol, `${mesaj} beklenen ${beklenen}, gelen ${gercek}`);

test("düz boru: 6 m × 2,5 cm ince bağırsağın iç yüzeyi π·d·L ≈ 0,47 m²", () => {
  yakin(boruAlani(), Math.PI * INCE_BAGIRSAK.cap * INCE_BAGIRSAK.uzunluk);
  yakin(boruAlani(), 0.471, 0.001);
});

test("yüzey katsayıları çarpılır: hepsi açıkken 3 × 10 × 20 = 600", () => {
  assert.equal(yuzeyKatsayisi(), 1);
  assert.equal(yuzeyKatsayisi({ kivrim: true }), KATSAYI.kivrim);
  assert.equal(yuzeyKatsayisi({ villus: true, mikrovillus: true }), 200);
  assert.equal(yuzeyKatsayisi({ kivrim: true, villus: true, mikrovillus: true }), 600);
  // sıra önemli değil (çarpma değişmeli)
  assert.equal(yuzeyKatsayisi({ mikrovillus: true, kivrim: true }), yuzeyKatsayisi({ kivrim: true, mikrovillus: true }));
});

test("toplam yüzey ders kitaplarındaki 200–300 m² aralığına düşer", () => {
  const a = toplamAlan({ kivrim: true, villus: true, mikrovillus: true });
  assert.ok(a > 200 && a < 300, `alan ${a}`);
});

test("emilim: düz boruda 4 saatte %5, zaman ve yüzeyle tekdüze artar, %100'ü aşmaz", () => {
  yakin(emilenOran(1, GECIS_SURESI), 0.05, 1e-9);
  yakin(EMILIM_K, -Math.log(0.95) / 4);
  assert.equal(emilenOran(600, 0), 0);
  let once = 0;
  for (const k of [1, 3, 10, 30, 60, 200, 600]) {
    const e = emilenOran(k, GECIS_SURESI);
    assert.ok(e > once && e < 1, `k=${k}`);
    once = e;
  }
  for (let t = 0.5; t <= 4; t += 0.5) assert.ok(emilenOran(10, t) > emilenOran(10, t - 0.5));
});

test("emilim: %90'ı geçmek için en az iki yapının (biri mikrovillus) birlikte olması gerekir", () => {
  const birlesimler = [];
  for (const kivrim of [false, true]) for (const villus of [false, true]) for (const mikrovillus of [false, true]) {
    const e = emilenOran(yuzeyKatsayisi({ kivrim, villus, mikrovillus }), GECIS_SURESI);
    birlesimler.push({ kivrim, villus, mikrovillus, e });
  }
  for (const b of birlesimler) {
    const n = [b.kivrim, b.villus, b.mikrovillus].filter(Boolean).length;
    if (n < 2) assert.ok(b.e < 0.9, JSON.stringify(b));
    if (b.e >= 0.9) assert.ok(b.mikrovillus, "mikrovillus olmadan %90 aşılmaz");
  }
  assert.ok(birlesimler.some((b) => b.e >= 0.9));
  // kıvrım + villus (×30) yetmez
  assert.ok(emilenOran(30, GECIS_SURESI) < 0.9);
});

test("zincir modeli: hücreye ulaşan = sindirim × emilim × taşıma", () => {
  assert.deepEqual(SUREC, ["sindirim", "emilim", "tasima"]);
  assert.equal(hucreyeUlasan(), 1);
  yakin(hucreyeUlasan({ sindirim: 0.8, emilim: 0.5, tasima: 1 }), 0.4); // 7. sınav sorusu
  yakin(hucreyeUlasan({ sindirim: 0.9, emilim: 0.9, tasima: 0.9 }), 0.729);
  assert.equal(hucreyeUlasan({ emilim: 0 }), 0);
  // aralık dışı değerler kırpılır
  assert.equal(hucreyeUlasan({ sindirim: 2, emilim: -1 }), 0);
  // tek halka bozulunca diğerleri telafi edemez: sonuç en zayıf halkayı aşamaz
  for (const v of [{ sindirim: 0.3, emilim: 1, tasima: 1 }, { sindirim: 0.9, emilim: 0.4, tasima: 0.95 }]) {
    assert.ok(hucreyeUlasan(v) <= Math.min(...Object.values(v)) + 1e-12);
  }
});

test("vakalar: her biri geçerli bir süreci bozar, verim 0–1 arasında, üç süreç de temsil edilir", () => {
  assert.equal(VAKALAR.length, 4);
  for (const v of VAKALAR) {
    assert.ok(SUREC.includes(v.bozuk), v.metin);
    assert.ok(v.verim > 0 && v.verim < 1);
  }
  assert.deepEqual(new Set(VAKALAR.map((v) => v.bozuk)), new Set(SUREC));
});

test("sindirim çeşitleri: üç kutu da dolu, her canlının açıklaması var", () => {
  const turler = new Set(CANLILAR.map((c) => c.tur));
  assert.deepEqual(turler, new Set(["ic", "ikisi", "dis"]));
  for (const c of CANLILAR) assert.ok(c.neden.length > 20, c.ad);
  assert.equal(CANLILAR.find((c) => c.ad === "Amip").tur, "ic");
  assert.equal(CANLILAR.find((c) => c.ad === "Hidra").tur, "ikisi");
  assert.equal(CANLILAR.find((c) => c.ad === "Küf mantarı").tur, "dis");
});

test("ızgara: dört hayvan, doğru cevap indeksleri seçenekler içinde; beslenme tipleri tutarlı", () => {
  const sutun = [SECENEK.dis, SECENEK.mide, SECENEK.bagirsak, SECENEK.beslenme];
  assert.deepEqual(HAYVANLAR.map((h) => h.ad), ["Güvercin", "Kurt", "İnek", "İnsan"]);
  for (const h of HAYVANLAR) {
    assert.equal(h.dogru.length, 4);
    h.dogru.forEach((d, i) => [].concat(d).forEach((x) => assert.ok(Number.isInteger(x) && x >= 0 && x < sutun[i].length, `${h.ad} sütun ${i}`)));
  }
  const bul = (ad) => HAYVANLAR.find((h) => h.ad === ad);
  assert.equal(SECENEK.beslenme[bul("Kurt").dogru[3]], "Etçil");
  assert.equal(SECENEK.beslenme[bul("İnek").dogru[3]], "Otçul");
  assert.equal(SECENEK.beslenme[bul("İnsan").dogru[3]], "Hepçil");
  assert.equal(SECENEK.mide[bul("İnek").dogru[1]], "Dört gözlü mide");
  assert.equal(SECENEK.bagirsak[bul("İnek").dogru[2]], "Çok uzun");
  // otçulun bağırsak oranı etçil ve hepçilden büyük
  assert.ok(bul("İnek").bagirsakOrani > bul("İnsan").bagirsakOrani && bul("İnsan").bagirsakOrani > bul("Kurt").bagirsakOrani);
});

test("maddeler: polimerler sindirilir, küçük moleküller doğrudan emilir", () => {
  const sindirilen = MADDELER.filter((m) => m.sindirim).map((m) => m.ad);
  for (const ad of ["Nişasta", "Protein", "Sakkaroz (çay şekeri)", "Yağ (trigliserit)"]) assert.ok(sindirilen.includes(ad), ad);
  for (const ad of ["Su", "Glikoz", "Vitaminler"]) assert.ok(!sindirilen.includes(ad), ad);
});
