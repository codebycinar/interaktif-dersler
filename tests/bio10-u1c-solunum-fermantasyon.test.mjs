// node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import {
  BASAMAKLAR, toplamUrun, atpVerimi, karbonDurumu, calisanBasamaklar, KAPILAR, BESIN_GIRIS, KCAL_G,
  KAS, kasAdim, kasBaslangic, MAYA, CO2_ML_G, mayaSicaklik, mayaAdim, mayaDeney, tasarimDenetle,
  YIYECEKLER, besinEnerjisi, tabakOzeti, MET, gunlukHarcama, KARB_ARALIK, URUNLER, OLAYLAR, ATP_DAGILIM,
} from "../dersler/10/biyoloji/u1c-solunum-fermantasyon/model.js";

const yakin = (gercek, beklenen, tol = 1e-6, mesaj = "") =>
  assert.ok(Math.abs(gercek - beklenen) <= tol, `${mesaj} beklenen ${beklenen}, gelen ${gercek}`);

test("oksijenli solunum: bir glikozdan 6 CO₂, 10 NADH, 2 FADH₂, 4 ATP (substrat düzeyi)", () => {
  assert.deepEqual(toplamUrun(), { atp: 4, nadh: 10, fadh2: 2, co2: 6 });
  assert.deepEqual(toplamUrun(1), { atp: 2, nadh: 2, fadh2: 0, co2: 0 }); // glikoliz net
  assert.equal(BASAMAKLAR[0].yer, "Sitoplazma");
  assert.equal(BASAMAKLAR[0].o2, false);
});

test("ATP verimi: klasik hesap 38, güncel hesap 32 (en fazla)", () => {
  assert.equal(atpVerimi("klasik"), 38);
  assert.equal(atpVerimi("guncel"), 32);
});

test("karbon korunur: her basamakta organik C + CO₂ = 6", () => {
  for (let i = 0; i <= BASAMAKLAR.length; i++) {
    const k = karbonDurumu(i);
    assert.equal(k.organik + k.co2, 6, `basamak ${i}`);
  }
  assert.deepEqual(karbonDurumu(2), { organik: 4, co2: 2 });
  assert.deepEqual(karbonDurumu(3), { organik: 0, co2: 6 });
});

test("O₂ yokken yalnızca glikoliz çalışabilir", () => {
  assert.deepEqual(calisanBasamaklar(false), ["glikoliz"]);
  assert.deepEqual(calisanBasamaklar(true), BASAMAKLAR.map((b) => b.ad));
});

test("besin giriş kapıları geçerli; dört kapı da kullanılır; yağ en enerjili", () => {
  const ad = new Set(KAPILAR.map((k) => k.ad));
  for (const b of BESIN_GIRIS) assert.ok(ad.has(b.kapi), b.ad);
  assert.deepEqual(new Set(BESIN_GIRIS.map((b) => b.kapi)), ad);
  assert.equal(BESIN_GIRIS.find((b) => b.ad === "Yağ asidi").kapi, "asetil");
  assert.equal(BESIN_GIRIS.find((b) => b.ad === "Gliserol").kapi, "ara");
  assert.ok(KCAL_G.yag > 2 * KCAL_G.karbonhidrat && KCAL_G.protein === KCAL_G.karbonhidrat);
});

function kos(I, sure = 60, dt = 0.05) {
  let d = kasBaslangic(), atpO = 0, atpF = 0;
  while (d.t < sure - 1e-9) { d = kasAdim(d, I, dt); atpO += d.oksijenli * dt; atpF += d.fermantasyon * dt; }
  return { ...d, atpO, atpF, pay: atpF / (atpO + atpF) };
}

test("kas: ATP ihtiyacı her an karşılanır; düşük şiddette fermantasyon yalnızca başta olur", () => {
  let d = kasBaslangic();
  for (let i = 0; i < 1200; i++) { d = kasAdim(d, 0.8, 0.1); yakin(d.oksijenli + d.fermantasyon, 0.8, 1e-9); }
  assert.ok(d.fermantasyon < 0.01, "2 dakika sonra neredeyse tamamen oksijenli");
  const yavas = kos(0.6), hizli = kos(1.8);
  assert.ok(yavas.pay < 0.35, `düşük şiddette fermantasyon payı ${yavas.pay}`);
  assert.ok(hizli.pay > 0.5, `yüksek şiddette fermantasyon payı ${hizli.pay}`);
  assert.ok(hizli.laktat > 4 * yavas.laktat, `${hizli.laktat} / ${yavas.laktat}`);
});

test("kas: fermantasyon aynı ATP için oksijenliden 15 kat fazla glikoz harcar", () => {
  const tamOksijenli = kasAdim({ ...kasBaslangic(), t: 1e6 }, 1, 1);
  yakin(tamOksijenli.glikoz, 1 / KAS.atpOksijenli, 1e-9);
  const ferm = kasAdim(kasBaslangic(), 1, 1e-9); // t ≈ 0: O₂ alımı henüz artmadı
  assert.ok(ferm.fermantasyon > 0.99);
  yakin(KAS.atpOksijenli / KAS.atpFermantasyon, 15);
});

test("maya: sıcaklık eğrisi 35 °C'de en yüksek, 4 °C ve 50 °C'de sıfır", () => {
  yakin(mayaSicaklik(MAYA.Topt), 1);
  assert.equal(mayaSicaklik(4), 0);
  assert.equal(mayaSicaklik(50), 0);
  assert.equal(mayaSicaklik(70), 0);
  for (const T of [10, 20, 30, 40, 45]) assert.ok(mayaSicaklik(T) > 0 && mayaSicaklik(T) < 1, `T=${T}`);
  let enIyi = 0, enIyiT = 0;
  for (let T = 0; T <= 60; T += 0.5) if (mayaSicaklik(T) > enIyi) { enIyi = mayaSicaklik(T); enIyiT = T; }
  assert.equal(enIyiT, 35);
});

test("maya: 1 g sakkarozdan en fazla ≈ 286 mL CO₂; şeker tükenince gaz durur; kütle korunur", () => {
  yakin(CO2_ML_G, (4 * 24.5 * 1000) / 342.3, 1e-9);
  assert.ok(CO2_ML_G > 280 && CO2_ML_G < 292);
  const { son } = mayaDeney({ T: 35, seker: 2, maya: 10 }, 5);
  assert.ok(son.seker < 1e-3);
  yakin(son.co2, 2 * CO2_ML_G, 0.5);
  // şekersiz ya da mayasız şişede gaz oluşmaz
  assert.equal(mayaDeney({ T: 35, seker: 0, maya: 5 }).son.co2, 0);
  assert.equal(mayaDeney({ T: 35, seker: 10, maya: 0 }).son.co2, 0);
  // her adımda harcanan şeker kadar CO₂
  const s0 = { T: 30, seker: 10, maya: 5, co2: 0 }, s1 = mayaAdim(s0, 0.1);
  yakin((s0.seker - s1.seker) * CO2_ML_G, s1.co2, 1e-9);
});

test("maya: 60 dakikada gaz hacmi şeker ve mayayla artar; 35 °C'de 5 g maya + 10 g şeker yüzlerce mL verir", () => {
  const co2 = (o) => mayaDeney({ T: 35, seker: 10, maya: 5, ...o }).son.co2;
  assert.ok(co2({}) > 300 && co2({}) < 700, `${co2({})}`);
  assert.ok(co2({ maya: 10 }) > co2({ maya: 5 }) && co2({ maya: 5 }) > co2({ maya: 2 }));
  assert.ok(co2({ seker: 20 }) > co2({ seker: 5 }));
  assert.ok(co2({ T: 35 }) > co2({ T: 20 }) && co2({ T: 20 }) > co2({ T: 5 }));
  const seri = mayaDeney({ T: 35, seker: 10, maya: 5 }).seri;
  for (let i = 1; i < seri.length; i++) assert.ok(seri[i][1] >= seri[i - 1][1]);
});

test("deney tasarımı: tek değişken ve en az üç düzey gerekir", () => {
  const s = (T, seker, maya) => ({ T, seker, maya });
  assert.equal(tasarimDenetle([s(35, 10, 5), s(35, 10, 5), s(35, 10, 5), s(35, 10, 5)]).neden, "hepsi-ayni");
  assert.equal(tasarimDenetle([s(20, 5, 5), s(35, 10, 5), s(35, 10, 5), s(35, 10, 5)]).neden, "cok-degisken");
  assert.equal(tasarimDenetle([s(20, 10, 5), s(35, 10, 5), s(35, 10, 5), s(20, 10, 5)]).neden, "az-duzey");
  assert.deepEqual(tasarimDenetle([s(5, 10, 5), s(20, 10, 5), s(35, 10, 5), s(50, 10, 5)]), { gecerli: true, degisken: "T" });
  assert.deepEqual(tasarimDenetle([s(35, 0, 5), s(35, 5, 5), s(35, 10, 5), s(35, 20, 5)]), { gecerli: true, degisken: "seker" });
});

test("enerji: besin enerjisi 4/4/9 kuralıyla; tabak payları toplamı 1", () => {
  yakin(besinEnerjisi({ k: 50, p: 0, y: 30 }), 470); // sınav sorusu
  yakin(besinEnerjisi(YIYECEKLER[0]), 25 * 4 + 4 * 4 + 1 * 9);
  const o = tabakOzeti(new Map([[0, 2], [6, 1], [9, 1]]));
  yakin(o.oran.k + o.oran.p + o.oran.y, 1, 1e-9);
  assert.equal(tabakOzeti(new Map()).kcal, 0);
  for (const f of YIYECEKLER) assert.ok(besinEnerjisi(f) > 50 && besinEnerjisi(f) < 400, f.ad);
});

test("enerji: günlük harcama makul aralıkta ve aktiviteyle artar", () => {
  const h = gunlukHarcama(55, { uyku: 8, yuruyus: 1, spor: 1 });
  yakin(h, 55 * (0.95 * 8 + 1.3 * 14 + 3.5 + 7), 1e-9);
  assert.ok(h > 1500 && h < 3000);
  assert.ok(gunlukHarcama(55, { spor: 2 }) > gunlukHarcama(55, { spor: 1 }));
  assert.ok(MET.uyku < MET.oturma && MET.oturma < MET.yuruyus && MET.yuruyus < MET.spor);
  assert.deepEqual(KARB_ARALIK, [0.45, 0.65]);
});

test("duman senaryosundaki dengeli menü görev ölçütünü sağlar", () => {
  const ad = (b) => YIYECEKLER.findIndex((f) => f.ad.startsWith(b));
  const tabak = new Map([[ad("Ekmek"), 4], [ad("Mercimek"), 1], [ad("Pilav"), 1], [ad("Kuru fasulye"), 1], [ad("Yoğurt"), 1], [ad("Izgara tavuk"), 1], [ad("Elma"), 2], [ad("Beyaz peynir"), 1], [ad("Haşlanmış"), 1], [ad("Ceviz"), 1]]);
  const o = tabakOzeti(tabak), h = gunlukHarcama(55, { uyku: 8, yuruyus: 1, spor: 1 });
  assert.ok(Math.abs(o.kcal - h) / h <= 0.1, `${o.kcal} / ${h}`);
  assert.ok(o.oran.k >= KARB_ARALIK[0] && o.oran.k <= KARB_ARALIK[1], `karb ${o.oran.k}`);
});

test("sınıflandırma verileri: fermantasyon türleri, ATP olayları, ATP dağılımı %100", () => {
  assert.deepEqual(new Set(URUNLER.map((u) => u.tur)), new Set(["laktik", "alkol", "ikisi"]));
  assert.equal(URUNLER.find((u) => u.ad === "Yoğurt").tur, "laktik");
  assert.ok(OLAYLAR.some((o) => o.atp) && OLAYLAR.some((o) => !o.atp));
  for (const o of OLAYLAR.filter((x) => /difüzyon|osmoz/i.test(x.neden))) assert.equal(o.atp, false, o.metin);
  assert.equal(ATP_DAGILIM.reduce((t, d) => t + d.pay, 0), 100);
});
