// Taif ünitesi: kronolojik tutarlılık, takvim dönüşümü, coğrafya ve sayılar
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { OLAYLAR, SERITLER, YERLER, SAYILAR, olay, yer, hicridenMiladi, miladiOndalik, nubuvvettenMiladi, olayYili, uzaklik, tarihYaz } from "../dersler/10/peygamberimizin-hayati/u1-taif/veri.js";

const harita = JSON.parse(readFileSync(new URL("../dersler/10/peygamberimizin-hayati/u1-taif/harita-veri.json", import.meta.url), "utf8"));
const GUN = 1 / 365.25;

test("olaylar dizide kronolojik sırada ve kimlikler benzersiz", () => {
  const ids = new Set();
  for (let i = 0; i < OLAYLAR.length; i++) {
    const o = OLAYLAR[i];
    assert.ok(!ids.has(o.id), `${o.id} iki kez`); ids.add(o.id);
    assert.ok(SERITLER.some((s) => s.id === o.serit), `${o.id}: şerit`);
    if (i) assert.ok(olayYili(OLAYLAR[i - 1]) <= olayYili(o), `${OLAYLAR[i - 1].id} → ${o.id} sırası bozuk`);
  }
});

test("hicrî takvim: 1 Muharrem 1 = 16 Temmuz 622, bilinen tarihler tutuyor", () => {
  assert.ok(Math.abs(hicridenMiladi({ yil: 1, ay: 1, gun: 1 }) - (622 + 196 / 365.25)) < 1e-9);
  // Mekke'nin fethi 20 Ramazan 8 ≈ 11 Ocak 630; Hz. Peygamber'in vefatı 12 Rebiülevvel 11 ≈ 8 Haziran 632
  assert.ok(Math.abs(hicridenMiladi({ yil: 8, ay: 9, gun: 20 }) - (630 + 10 * GUN)) < 10 * GUN);
  assert.ok(Math.abs(hicridenMiladi({ yil: 11, ay: 3, gun: 12 }) - (632 + 159 * GUN)) < 10 * GUN);
});

test("hicrî tarihi olan her olayın milâdî ayı ±45 gün içinde", () => {
  for (const o of OLAYLAR.filter((q) => q.hicri)) {
    const h = hicridenMiladi(o.hicri), m = miladiOndalik(o.miladi);
    const tolerans = o.hicri.ay == null || o.miladi.ay == null ? 1 : 45 * GUN;
    assert.ok(Math.abs(h - m) <= tolerans, `${o.id}: hicrî ${h.toFixed(3)} / milâdî ${m.toFixed(3)}`);
  }
});

test("nübüvvet yılları milâdî yılla ±1 tutarlı, Mekke dönemi hicretten önce", () => {
  const hicret = olayYili(olay("hicret"));
  for (const o of OLAYLAR.filter((q) => q.nubuvvet)) {
    assert.ok(Math.abs(nubuvvettenMiladi(o.nubuvvet) - o.miladi.yil) <= 1, `${o.id}: nübüvvet ${o.nubuvvet} ↔ ${o.miladi.yil}`);
    assert.ok(olayYili(o) < hicret, `${o.id} hicretten önce olmalı`);
    assert.ok(!o.hicri, `${o.id}: Mekke olayına hicrî tarih verilmez`);
  }
  assert.ok(Math.abs(nubuvvettenMiladi(olay("boykot").nubuvvetBit) - olay("boykot").miladiBit.yil) <= 1);
});

test("ünitenin ana sırası: Hüzün yılı → Taif → Akabe → Hicret → Fetih → Huneyn → Kuşatma → Ci'râne → Heyet → Lât", () => {
  const sira = ["huzun", "taifYolculugu", "akabe1", "hicret", "fetih", "huneyn", "kusatma", "cirane", "urve", "tebuk", "heyet", "lat"];
  for (let i = 1; i < sira.length; i++) assert.ok(olayYili(olay(sira[i - 1])) <= olayYili(olay(sira[i])), `${sira[i - 1]} → ${sira[i]}`);
  // Taif yolculuğu ile Sakif'in Müslüman olması arasında yaklaşık 11 yıl var
  const fark = olayYili(olay("lat")) - olayYili(olay("taifYolculugu"));
  assert.ok(fark > 10 && fark < 12.5, `fark ${fark.toFixed(2)}`);
});

test("Mekke–Taif kuş uçuşu yaklaşık 63 km, Mekke–Medine yaklaşık 340 km; rakım farkı 1.600 m'nin üzerinde", () => {
  const mt = uzaklik(yer("mekke"), yer("taif")), mm = uzaklik(yer("mekke"), yer("medine"));
  assert.ok(mt > 60 && mt < 67, `Mekke–Taif ${mt.toFixed(1)} km`);
  assert.ok(mm > 330 && mm < 350, `Mekke–Medine ${mm.toFixed(1)} km`);
  assert.ok(yer("taif").rakim - yer("mekke").rakim > 1600);
  // yaklaşık konumlar Mekke ile Taif çevresinde (90 km yarıçap) kalmalı
  for (const y of YERLER.filter((q) => q.yaklasik)) assert.ok(uzaklik(y, yer("mekke")) < 90 && uzaklik(y, yer("taif")) < 90, y.id);
});

test("yerler harita verisindeki Suudi Arabistan sınırları içinde (sınırlayıcı kutu)", () => {
  const sa = harita.features.find((f) => f.properties.ad === "Saudi Arabia");
  assert.ok(sa, "Suudi Arabistan harita verisinde yok");
  const noktalar = sa.geometry.coordinates.flat(sa.geometry.type === "MultiPolygon" ? 2 : 1);
  const lon = noktalar.map((p) => p[0]), lat = noktalar.map((p) => p[1]);
  for (const y of YERLER) {
    assert.ok(y.lon > Math.min(...lon) && y.lon < Math.max(...lon) && y.lat > Math.min(...lat) && y.lat < Math.max(...lat), y.id);
  }
});

test("grafik sayıları zamanla artıyor ve yılları olaylarla uyumlu", () => {
  for (let i = 1; i < SAYILAR.length; i++) {
    assert.ok(SAYILAR[i].yil >= SAYILAR[i - 1].yil, SAYILAR[i].id);
    assert.ok(SAYILAR[i].sayi > SAYILAR[i - 1].sayi, SAYILAR[i].id);
  }
  for (const s of SAYILAR.filter((q) => olay(q.id === "taif" ? "taifYolculugu" : q.id))) {
    const o = olay(s.id === "taif" ? "taifYolculugu" : s.id);
    assert.equal(Math.floor(olayYili(o)), s.yil, s.id);
  }
});

test("tarih yazımı", () => {
  assert.equal(tarihYaz(olay("fetih")), "Ocak 630 · H. Ramazan 8");
  assert.equal(tarihYaz(olay("taifYolculugu")), "yaklaşık 619 · nübüvvetin 10. yılı");
});
