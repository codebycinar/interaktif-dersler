// Felsefe zaman çizelgesi verisinin kronolojik tutarlılığı
import test from "node:test";
import assert from "node:assert/strict";
import { GELENEKLER, DUSUNURLER, HOCA_TALEBE, SIRALAR, KENTLER } from "../dersler/10/felsefe/u1-felsefenin-dogasi/veri.js";

const bul = (id) => DUSUNURLER.find((d) => d.id === id);

test("her kaydın geleneği tanımlı, kimliği benzersiz", () => {
  const ids = new Set();
  for (const d of DUSUNURLER) {
    assert.ok(GELENEKLER.some((g) => g.id === d.gelenek), `${d.id}: bilinmeyen gelenek ${d.gelenek}`);
    assert.ok(!ids.has(d.id), `${d.id} iki kez`);
    ids.add(d.id);
  }
  for (const g of GELENEKLER) assert.ok(DUSUNURLER.some((d) => d.gelenek === g.id), `${g.ad} geleneğinde kayıt yok`);
});

test("başlangıç bitişten önce; kişilerin yaşam süresi 25–105 yıl", () => {
  for (const d of DUSUNURLER) {
    assert.ok(d.bas < d.bit, `${d.id}: ${d.bas} ≥ ${d.bit}`);
    if (d.tur === "kisi") {
      const omur = d.bit - d.bas;
      assert.ok(omur >= 25 && omur <= 105, `${d.id}: yaşam süresi ${omur}`);
    }
  }
});

test("bilinen tarihler", () => {
  assert.deepEqual([bul("sokrates").bit, bul("aristoteles").bas, bul("aristoteles").bit], [-399, -384, -322]);
  assert.deepEqual([bul("ibnsina").bas, bul("ibnsina").bit], [980, 1037]);
  assert.deepEqual([bul("kant").bas, bul("kant").bit], [1724, 1804]);
  assert.deepEqual([bul("descartes").bas, bul("descartes").bit], [1596, 1650]);
  assert.ok(bul("thales").bas < -600 && bul("thales").bit < -540, "Thales MÖ 6. yy");
});

test("hoca–talebe zincirinde öğretmen önce doğar ve yaşamları kesişir", () => {
  for (const [h, t] of HOCA_TALEBE) {
    const a = bul(h), b = bul(t);
    assert.ok(a.bas < b.bas, `${h} → ${t}`);
    assert.ok(a.bit > b.bas + 15, `${h} öğrencisi ${t} gençken hayatta olmalı`);
  }
});

test("felsefe tarihindeki yaygın sıralar korunur", () => {
  for (const sira of SIRALAR) {
    for (let i = 1; i < sira.length; i++) assert.ok(bul(sira[i - 1]).bas < bul(sira[i]).bas, `${sira[i - 1]} < ${sira[i]}`);
  }
});

test("harita kentleri Ege çevresinde", () => {
  for (const k of KENTLER) assert.ok(k.lon > 22 && k.lon < 30 && k.lat > 36 && k.lat < 42, k.id);
});
