// node --test tests/tar10-u1b-medeniyet.test.mjs
// 2. ders verisinin tutarlılığı: bilinen tarihler, konumların bölgede olması, hanların güzergâha yakınlığı, kervan planının çözülebilirliği
import test from "node:test";
import assert from "node:assert/strict";
import {
  DONEM, ANADOLU, KAVRAMLAR, KONULAR, KAYNAK_DOSYASI, IDDIALAR, KARARLAR, KERVAN_YOLU, YOL_SEHIRLERI, GERCEK_HANLAR, GUNLUK_YOL,
  AHI_OLAYLARI, MEDENIYET, MERKEZLER, KANITLAR, YARGILAR, DOGRU_YARGI, KISILER,
} from "../dersler/10/tarih/u1b-medeniyet/veri.js";
import { mesafe, cizgiyeUzaklik, cizgiUzunlugu, enBuyukAralik } from "../dersler/10/tarih/ortak/cografi.js";

const icinde = ([l, b], [[l0, b0], [l1, b1]]) => l >= l0 && l <= l1 && b >= b0 && b <= b1;
const benzersiz = (dizi) => new Set(dizi).size === dizi.length;

test("kimlikler benzersiz, programdaki anahtar kavramlar var", () => {
  for (const d of [KAVRAMLAR, KONULAR, KAYNAK_DOSYASI, IDDIALAR, KANITLAR, KISILER]) assert.ok(benzersiz(d.map((x) => x.id)));
  for (const id of ["ahilik", "futuvvet", "medrese", "sifahane", "tekke"]) assert.ok(KAVRAMLAR.some((k) => k.id === id), id);
});

test("merak konularında hem bilgi hem araştırma soruları var", () => {
  for (const k of KONULAR) {
    assert.ok(k.sorular.every((s) => ["bilgi", "iliski"].includes(s.tur)));
    assert.ok(k.sorular.filter((s) => s.tur === "iliski").length >= 2, k.id);
    assert.ok(k.sorular.filter((s) => s.tur === "bilgi").length >= 2, k.id);
    for (const s of k.sorular) assert.ok(s.metin.endsWith("?"), s.metin);
  }
});

test("kaynak dosyası: türler geçerli, birincil kaynakların konumu Anadolu'da", () => {
  for (const k of KAYNAK_DOSYASI) {
    assert.ok(["birincil", "ikincil"].includes(k.tur), k.id);
    if (k.tur === "birincil") assert.ok(k.konum && icinde(k.konum, ANADOLU), k.id);
  }
  assert.ok(KAYNAK_DOSYASI.filter((k) => k.tur === "ikincil").length >= 2);
  const kararlar = new Set(KARARLAR.map((k) => k.id));
  for (const i of IDDIALAR) assert.ok(kararlar.has(i.karar), i.id);
  for (const k of kararlar) assert.ok(IDDIALAR.some((i) => i.karar === k), `${k} kutusu boş kalmamalı`);
});

test("bilinen tarihler", () => {
  const han = Object.fromEntries(GERCEK_HANLAR.map((h) => [h.ad, h.yil]));
  assert.equal(han["Sultanhanı"], "1229");
  assert.equal(han["Zazadin Han"], "1236");
  assert.equal(han["Sarıhan"], "1249");
  const y = Object.fromEntries(KANITLAR.map((k) => [k.id, k.yil]));
  assert.equal(y.gevher, 1206);
  assert.equal(y.karatay, 1251);
  assert.equal(y.cifte, 1271);
  assert.equal(y.latin, 1204);
  assert.equal(y.kosedag, 1243);
  for (const k of KANITLAR) assert.ok(k.yil >= 1200 && k.yil <= 1300 && k.yil <= DONEM.son + 1, k.id);
  assert.match(KAYNAK_DOSYASI.find((k) => k.id === "kitabe").ad, /1229/);
  assert.match(KISILER.find((k) => k.id === "mevlana").yasam, /1207–1273/);
  assert.match(KISILER.find((k) => k.id === "hayyam").yasam, /1048–1131/);
  assert.match(KISILER.find((k) => k.id === "ibnularabi").yasam, /1165–1240/);
  assert.match(MEDENIYET.find((m) => /Nizamiye/.test(m.metin)).metin, /1067/);
  assert.match(MEDENIYET.find((m) => /Cezeri/.test(m.metin)).metin, /1206/);
});

test("kervan yolu: şehirler ve hanlar güzergâhın üzerinde, sıra Konya'dan Kayseri'ye", () => {
  const L = cizgiUzunlugu(KERVAN_YOLU);
  assert.ok(L > 250 && L < 320, `yol uzunluğu ${L}`);
  for (const s of YOL_SEHIRLERI) assert.ok(cizgiyeUzaklik(s.konum, KERVAN_YOLU).uzaklik < 1, s.ad);
  let once = -1;
  for (const h of GERCEK_HANLAR) {
    const r = cizgiyeUzaklik(h.konum, KERVAN_YOLU);
    assert.ok(r.uzaklik < 15, `${h.ad} güzergâha ${r.uzaklik} km`);
    assert.ok(r.konum > once, `${h.ad} sırası`);
    once = r.konum;
  }
  assert.ok(mesafe(GERCEK_HANLAR.find((h) => h.ad === "Ağzıkara Han").konum, YOL_SEHIRLERI[1].konum) < 25, "Ağzıkara Aksaray yakınında");
});

test("kervan planı: hansız yol çözülmez, ~7 hanla çözülür, sınavdaki gün hesabı", () => {
  const L = cizgiUzunlugu(KERVAN_YOLU);
  const sehirler = YOL_SEHIRLERI.map((s) => cizgiyeUzaklik(s.konum, KERVAN_YOLU).konum);
  assert.ok(enBuyukAralik(sehirler, L) > GUNLUK_YOL);
  // duman senaryosundaki plan: rota köşeleri ve iki ara nokta
  const kose = (i) => cizgiyeUzaklik(KERVAN_YOLU[i], KERVAN_YOLU).konum;
  const plan = [kose(1), kose(2), kose(3), (kose(3) + kose(4)) / 2, kose(5), kose(6), kose(7), (kose(7) + kose(8)) / 2];
  assert.ok(enBuyukAralik([...sehirler, ...plan], L) <= GUNLUK_YOL);
  assert.equal(Math.round(280 / 40), 7);
});

test("kanıt haritası: çeldiriciler açıklamalı, yeterli alan çeşitliliği var, yargı geçerli", () => {
  for (const k of KANITLAR) {
    assert.ok(icinde(k.konum, [[26, 36], [45, 42.2]]), k.id);
    assert.ok(k.tarih, k.id);
    if (!k.destekler) assert.ok(k.neden, k.id);
  }
  const alanlar = new Set(KANITLAR.filter((k) => k.destekler).map((k) => k.alan));
  assert.ok(alanlar.size >= 5);
  assert.ok(KANITLAR.filter((k) => k.destekler).length >= 8);
  assert.ok(DOGRU_YARGI >= 0 && DOGRU_YARGI < YARGILAR.length);
});

test("Ahilik olayları ve medeniyet kartları geçerli", () => {
  for (const o of AHI_OLAYLARI) assert.ok(o.dogru >= 0 && o.dogru < o.siklar.length);
  for (const m of MEDENIYET) {
    assert.ok(["turk", "bati", "ikisi"].includes(m.kutu), m.metin);
    for (const y of m.yerler || []) assert.ok(MERKEZLER[y], y);
  }
  for (const k of ["turk", "bati", "ikisi"]) assert.ok(MEDENIYET.some((m) => m.kutu === k), k);
});

test("programın saydığı dokuz düşünür; konumlar Türkistan–Anadolu kutusunda", () => {
  assert.deepEqual(KISILER.map((k) => k.id).sort(), ["bektas", "cezeri", "hayyam", "ibnibibi", "ibnularabi", "kasgarli", "mevlana", "yesevi", "yunus"]);
  for (const k of KISILER) assert.ok(icinde(k.konum, [[28, 30.5], [79, 45.5]]), k.id);
  assert.ok(mesafe(KISILER.find((k) => k.id === "yesevi").konum, [68.27, 43.3]) < 20, "Yesevi Yesi'de (Türkistan şehri)");
});
