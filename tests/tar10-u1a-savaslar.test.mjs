// node --test tests/tar10-u1a-savaslar.test.mjs
// Tarih verisinin tutarlılığı: kronoloji, bilinen tarihler, konumların bölge sınırları içinde olması, temsilî alanlar, ikta modeli
import test from "node:test";
import assert from "node:assert/strict";
import {
  DONEM, KUTU, SAVASLAR, OLAYLAR, SEHIRLER, ALANLAR, OKLAR, KAYNAKLAR, DAVRANISLAR,
  KARSILASTIRMALAR, TESKILAT, ALANLAR_TESKILAT, ZINCIRLER,
} from "../dersler/10/tarih/u1a-savaslar/veri.js";
import { iktaModeli, hedefSaglandi, parselIktaMi } from "../dersler/10/tarih/u1a-savaslar/model.js";
import { mesafe } from "../dersler/10/tarih/ortak/cografi.js";

const icinde = ([l, b], [[l0, b0], [l1, b1]]) => l >= l0 && l <= l1 && b >= b0 && b <= b1;
const ANADOLU = [[26, 36], [45, 42.2]];
const SEHIR = Object.fromEntries(SEHIRLER.map((s) => [s.ad, s.konum]));

test("savaşlar kronolojik sırada ve dönem içinde", () => {
  for (let i = 1; i < SAVASLAR.length; i++) assert.ok(SAVASLAR[i].yil > SAVASLAR[i - 1].yil, `${SAVASLAR[i].id} sırası`);
  for (const s of SAVASLAR) {
    assert.ok(s.yil >= DONEM.bas && s.yil <= DONEM.son, s.id);
    if (s.bitis) assert.ok(s.bitis > s.yil && s.bitis <= DONEM.son, `${s.id} bitiş`);
  }
});

test("programın saydığı savaşlar ve bilinen tarihleri", () => {
  const beklenen = { dandanakan: 1040, pasinler: 1048, malazgirt: 1071, hacli: 1096, miryokefalon: 1176, hittin: 1187, kosedag: 1243 };
  assert.deepEqual(Object.fromEntries(SAVASLAR.map((s) => [s.id, s.yil])), beklenen);
  assert.equal(SAVASLAR.find((s) => s.id === "hacli").bitis, 1099, "Kudüs 1099'da Haçlıların eline geçti");
  assert.match(SAVASLAR.find((s) => s.id === "malazgirt").tarih, /26 Ağustos 1071/);
});

test("tüm olaylar 1040–1299 arasında; bilinen olay tarihleri", () => {
  for (const o of OLAYLAR) assert.ok(o.yil >= DONEM.bas && o.yil <= DONEM.son, o.id);
  const y = Object.fromEntries(OLAYLAR.map((o) => [o.id, o.yil]));
  assert.equal(y.bagdat, 1055);
  assert.equal(y.meliksah, 1092);
  assert.equal(y.sencer, 1157);
  assert.equal(y.antalya, 1207);
  assert.equal(y.osmanli, 1299);
});

test("konumlar harita kutusunda; Anadolu savaşları Anadolu'da", () => {
  for (const s of [...SAVASLAR, ...OLAYLAR, ...SEHIRLER]) assert.ok(icinde(s.konum, KUTU), `${s.id || s.ad} kutuda değil`);
  for (const id of ["pasinler", "malazgirt", "hacli", "miryokefalon", "kosedag"]) {
    assert.ok(icinde(SAVASLAR.find((s) => s.id === id).konum, ANADOLU), `${id} Anadolu'da olmalı`);
  }
});

test("savaş yerleri bilinen şehirlere makul uzaklıkta", () => {
  const s = Object.fromEntries(SAVASLAR.map((x) => [x.id, x.konum]));
  assert.ok(mesafe(s.dandanakan, SEHIR.Merv) < 100, "Dandanakan Merv yakınında");
  assert.ok(mesafe(s.pasinler, SEHIR.Erzurum) < 50, "Pasinler Erzurum yakınında");
  assert.ok(mesafe(s.hittin, SEHIR.Kudüs) < 150, "Hıttin Kudüs'ün kuzeyinde, Celile'de");
  assert.ok(mesafe(s.hacli, SEHIR.İznik) < 5, "Haçlı işareti İznik'te");
  assert.ok(mesafe(s.kosedag, SEHIR.Sivas) < 150, "Kösedağ Sivas yakınında");
  assert.ok(mesafe(s.miryokefalon, SEHIR.Konya) < 250, "Miryokefalon Batı Anadolu'da");
  // Pasinler ve Malazgirt birbirine yakın ama ayırt edilebilir (dilsiz harita rozetleri ayrık)
  assert.ok(mesafe(s.pasinler, s.malazgirt) > 80);
});

test("temsilî alanlar: zaman aralıkları geçerli ve her hanedan için kesintisiz", () => {
  for (const a of ALANLAR) {
    assert.ok(a.bas <= a.son && a.bas >= DONEM.bas && a.son <= DONEM.son, a.id);
    assert.ok(a.halka.length >= 6, `${a.id} çokgen`);
    for (const p of a.halka) assert.ok(icinde(p, [[24, 24], [80, 46]]), `${a.id} noktası ${p}`);
  }
  for (const onek of ["bsd", "tsd"]) {
    const dizi = ALANLAR.filter((a) => a.id.startsWith(onek) || (onek === "bsd" && a.id === "sel-horasan")).sort((a, b) => a.bas - b.bas);
    for (let i = 1; i < dizi.length; i++) assert.equal(dizi[i].bas, dizi[i - 1].son + 1, `${dizi[i].id} bir öncekinin bittiği yıldan sonra başlamalı`);
  }
  assert.equal(ALANLAR.find((a) => a.id === "bsd-3").son, 1157, "Büyük Selçuklu 1157'de sona erdi");
  assert.equal(ALANLAR.find((a) => a.id === "tsd-5").bas, 1243, "Moğol denetimi Kösedağ'la başlar");
});

test("oklar dönem içinde", () => {
  for (const o of OKLAR) {
    assert.ok(o.bas <= o.son && o.bas >= DONEM.bas && o.son <= DONEM.son, o.ad);
    for (const p of o.yol) assert.ok(icinde(p, KUTU), o.ad);
  }
});

test("kaynak, karşılaştırma, teşkilat ve zincir verileri geçerli", () => {
  for (const k of KAYNAKLAR) {
    assert.ok(["birincil", "ikincil"].includes(k.tur));
    assert.ok(k.davranis >= 0 && k.davranis < DAVRANISLAR.length);
    if (k.savas) assert.ok(SAVASLAR.some((s) => s.id === k.savas));
  }
  for (const c of KARSILASTIRMALAR) {
    assert.ok(SAVASLAR.some((s) => s.id === c.a) && SAVASLAR.some((s) => s.id === c.b));
    for (const f of c.ifadeler) assert.ok(["a", "b", "ortak"].includes(f.kutu), f.metin);
    for (const k of ["a", "b", "ortak"]) assert.ok(c.ifadeler.some((f) => f.kutu === k), `${c.a}-${c.b}: ${k} kutusu boş kalmamalı`);
  }
  const alanlar = new Set(ALANLAR_TESKILAT.map((a) => a.id));
  for (const t of TESKILAT) {
    assert.ok(["sureklilik", "degisim"].includes(t.kutu), t.id);
    assert.ok(alanlar.has(t.alan), t.id);
  }
  for (const z of ZINCIRLER) {
    assert.equal(z.halkalar.length, 5);
    const yillar = z.halkalar.join(" ").match(/\b1\d{3}\b/g)?.map(Number) || [];
    for (let i = 1; i < yillar.length; i++) {
      if (z.baslik.startsWith("Veraset")) assert.ok(yillar[i] > yillar[i - 1], `${z.baslik}: tarihler zincirde ilerlemeli`);
    }
  }
});

test("sınavdaki hesap: Malazgirt ile Miryokefalon arası 105 yıl", () => {
  const y = (id) => SAVASLAR.find((s) => s.id === id).yil;
  assert.equal(y("miryokefalon") - y("malazgirt"), 105);
});

test("ikta modeli: göstergeler 0–100, yönler doğru, hedef yalnızca denetimle sağlanır", () => {
  for (const denetim of [true, false]) {
    let once = iktaModeli({ oran: 0, denetim });
    for (let p = 0.1; p <= 1.0001; p += 0.1) {
      const m = iktaModeli({ oran: p, denetim });
      for (const v of Object.values(m)) assert.ok(v >= 0 && v <= 100);
      assert.ok(m.maas < once.maas && m.asker > once.asker && m.uretim > once.uretim && m.otorite < once.otorite);
      once = m;
    }
  }
  const sağlanan = (denetim) => [...Array(11).keys()].some((i) => hedefSaglandi(iktaModeli({ oran: i / 10, denetim })));
  assert.equal(sağlanan(true), true, "denetimle denge bulunabilmeli");
  assert.equal(sağlanan(false), false, "denetimsiz ikta ile denge bulunamamalı");
  assert.ok(iktaModeli({ oran: 0.6, denetim: false }).otorite < iktaModeli({ oran: 0.6, denetim: true }).otorite);
  assert.equal(hedefSaglandi(iktaModeli({ oran: 60 / 100, denetim: true })), true, "kaydırıcı %60'ta eşik tam tutmalı");
  assert.equal(hedefSaglandi(iktaModeli({ oran: 50 / 100, denetim: true })), false);
});

test("ikta parselleri oranla düzgün dolar", () => {
  for (const n of [97, 119, 120, 126, 140]) {
    for (let p = 0; p <= 1.0001; p += 0.1) {
      const k = [...Array(n).keys()].filter((i) => parselIktaMi(i, n, p)).length;
      assert.equal(k, Math.round(p * n), `n=${n} p=${p}`);
    }
  }
});
