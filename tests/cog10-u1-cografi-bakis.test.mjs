// node --test tests/cog10-u1-cografi-bakis.test.mjs
// Coğrafi bakış dersi verisinin tutarlılığı: yönler, uzaklıklar, iklim değerleri, konumlar ve kutu kimlikleri
import test from "node:test";
import assert from "node:assert/strict";
import { TURKIYE_KUTU, TURKIYE_BOYLAM, YAKIN_SINIR, SORULAR, ORNEKLER, BARAJ, BOLUMLER, AYLAR } from "../dersler/10/cografya/u1-cografi-bakis/veri.js";
import { mesafe, yon, yonAdi, sinirPayi, cokgenIcinde, saatFarki } from "../dersler/10/tarih/ortak/cografi.js";

const icinde = ([l, b], [[l0, b0], [l1, b1]]) => l >= l0 && l <= l1 && b >= b0 && b <= b1;
const toplam = (d) => d.reduce((a, b) => a + b, 0);

test("her örnek yedi coğrafi sorunun hepsine cevap veriyor", () => {
  assert.equal(SORULAR.length, 7);
  for (const o of ORNEKLER) for (const s of SORULAR) assert.ok(o.cevaplar[s.id]?.length > 20, `${o.id}.${s.id}`);
  for (const o of ORNEKLER) assert.equal(new Set(SORULAR.map((s) => o.cevaplar[s.id])).size, 7, `${o.id}: cevaplar birbirinden farklı`);
});

test("örnekler Türkiye kutusunda ve kendi yerel kutularında", () => {
  for (const o of ORNEKLER) {
    assert.ok(icinde(o.konum, TURKIYE_KUTU), o.id);
    assert.ok(icinde(o.konum, o.yerel), `${o.id} yerel`);
    for (const s of o.goreceli) assert.ok(icinde(s.konum, TURKIYE_KUTU), s.sehir);
  }
  assert.ok(icinde(BARAJ.konum, BARAJ.kutu));
  for (const y of BARAJ.yerler) assert.ok(icinde(y.konum, BARAJ.kutu), y.ad);
});

test("göreceli yönler hesapla eşleşiyor ve sınıra yakın değil", () => {
  for (const o of ORNEKLER) {
    assert.equal(o.goreceli.length, 3);
    for (const s of o.goreceli) {
      const a = yon(s.konum, o.konum);
      assert.equal(yonAdi(a), s.yon, `${o.ad} / ${s.sehir}`);
      assert.ok(sinirPayi(a) >= 5, `${o.ad} / ${s.sehir}: yön sınıra çok yakın`);
    }
  }
});

test("yakın/uzak çevre ilişkileri ölçütten belirgin biçimde ayrışıyor", () => {
  for (const o of ORNEKLER) {
    const km = o.iliskiler.map((r) => mesafe(o.konum, r.konum));
    for (const d of km) assert.ok(d < YAKIN_SINIR - 20 || d > YAKIN_SINIR + 20, `${o.id}: ${Math.round(d)} km ölçüte çok yakın`);
    assert.ok(km.some((d) => d < YAKIN_SINIR) && km.some((d) => d > YAKIN_SINIR), `${o.id}: iki tür de var`);
  }
});

test("Tuz Gölü etiketi temsilî göl yüzeyinin içinde", () => {
  const tuz = ORNEKLER.find((o) => o.id === "tuz");
  assert.ok(cokgenIcinde(tuz.konum, tuz.gol));
});

test("iklim verileri 12 aylık ve makul", () => {
  assert.equal(AYLAR.length, 12);
  const yagis = {};
  for (const o of ORNEKLER) {
    assert.equal(o.iklim.sicaklik.length, 12);
    assert.equal(o.iklim.yagis.length, 12);
    for (const t of o.iklim.sicaklik) assert.ok(t > -10 && t < 30, `${o.id} sıcaklık ${t}`);
    for (const y of o.iklim.yagis) assert.ok(y >= 0 && y < 400, `${o.id} yağış ${y}`);
    // en sıcak ay yaz aylarında
    const enSicak = o.iklim.sicaklik.indexOf(Math.max(...o.iklim.sicaklik));
    assert.ok(enSicak >= 5 && enSicak <= 7, `${o.id} en sıcak ay`);
    yagis[o.id] = toplam(o.iklim.yagis);
  }
  assert.ok(yagis.tuz < 400, `Konya ${yagis.tuz}`);
  assert.ok(yagis.bogaz > 600 && yagis.bogaz < 1000, `İstanbul ${yagis.bogaz}`);
  assert.ok(yagis.rize > 2000, `Rize ${yagis.rize}`);
  // yağış sorusundaki şıklar birbirinden ayırt edilebilir
  assert.equal(new Set(Object.values(yagis).map((v) => Math.round(v / 10))).size, 3);
});

test("Türkiye'nin doğusu ile batısı arasında 76 dakika yerel saat farkı", () => {
  assert.equal(saatFarki(TURKIYE_BOYLAM.dogu - TURKIYE_BOYLAM.bati), 76);
});

test("deste kutu kimlikleri tanımlı ve her kutuda en az bir kart", () => {
  for (const o of ORNEKLER) {
    const k = new Set(o.kosullar.map((x) => x.kutu));
    assert.deepEqual([...k].sort(), ["beseri", "dogal"], o.id);
    const e = new Set(o.etki.ogeler.map((x) => x.kutu));
    assert.deepEqual([...e].sort(), ["artar", "azalir"], o.id);
    assert.equal(o.kosullar.length, 6);
    assert.equal(o.etki.ogeler.length, 5);
    assert.ok(o.etki.ornek.length > 30);
  }
  const b = new Set(BOLUMLER.map((x) => x.id));
  for (const id of b) assert.equal(BARAJ.ifadeler.filter((x) => x.kutu === id).length, 2, id);
  for (const x of BARAJ.ifadeler) assert.ok(b.has(x.kutu));
});
