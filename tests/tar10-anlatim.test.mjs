// node --test tests/tar10-anlatim.test.mjs
// Tarih ve coğrafya derslerinin adım adım anlatım kareleri (rehber 4·0): kare sayısı, mini soru sıklığı,
// soruların geçerliliği ve kare metinlerinin kısalığı. Dosyalar tarayıcı modülleri içerdiği için metin olarak okunur.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const DERSLER = {
  "tar10-u1a-savaslar": { yol: "dersler/10/tarih/u1a-savaslar/anlat.js", adim: 10 },
  "tar10-u1b-medeniyet": { yol: "dersler/10/tarih/u1b-medeniyet/anlat.js", adim: 10 },
  "cog10-u1-cografi-bakis": { yol: "dersler/10/cografya/u1-cografi-bakis/anlat.js", adim: 8 },
};

/** Dosyayı adım bloklarına (/* N · … *\/ yorumları) böler; her blokta kare/soru/cozum satırları */
function bloklar(yol) {
  const metin = readFileSync(new URL(`../${yol}`, import.meta.url), "utf8");
  const govde = metin.slice(metin.indexOf("export const ANLAT"));
  return govde.split(/\/\* \d+ ·[^*]*\*\//).slice(1).map((b) => b.split("\n").map((s) => s.trim()).filter((s) => /^(kare|soru|cozum)\(/.test(s)));
}
const ilkMetin = (satir) => JSON.parse(satir.match(/^\w+\(("(?:[^"\\]|\\.)*")/)[1]);
const duz = (html) => html.replace(/<[^>]+>/g, "");

for (const [slug, { yol, adim }] of Object.entries(DERSLER)) {
  const B = bloklar(yol);

  test(`${slug}: her adımın 6–12 karesi ve en az bir mini sorusu var`, () => {
    assert.equal(B.length, adim);
    B.forEach((b, i) => {
      assert.ok(b.length >= 6 && b.length <= 12, `${i + 1}. adım: ${b.length} kare`);
      assert.ok(b.some((s) => s.startsWith("soru(")), `${i + 1}. adım: mini soru yok`);
    });
  });

  test(`${slug}: mini soruların doğru şıkkı geçerli, açıklama ve ipucu dolu`, () => {
    const topla = [];
    const soru = (metin, secenekler, dogru, aciklama, ipucu) => topla.push({ metin, secenekler, dogru, aciklama, ipucu });
    for (const b of B) for (const s of b) if (s.startsWith("soru(")) new Function("soru", s.replace(/,\s*$/, ""))(soru);
    assert.ok(topla.length >= adim);
    for (const q of topla) {
      assert.ok(Number.isInteger(q.dogru) && q.dogru >= 0 && q.dogru < q.secenekler.length, q.metin);
      assert.ok(q.secenekler.length >= 2 && new Set(q.secenekler).size === q.secenekler.length, q.metin);
      assert.ok(q.aciklama?.length > 10 && q.ipucu?.length > 5, q.metin);
    }
  });

  test(`${slug}: bir kare en fazla iki kısa cümle`, () => {
    for (const b of B) for (const s of b) {
      if (!s.startsWith("kare(")) continue;
      const t = duz(ilkMetin(s));
      const cumle = t.split(/[.!?…](?=\s|$)/).filter((c) => c.trim().length > 3).length;
      const kelime = t.split(/\s+/).filter(Boolean).length;
      assert.ok(cumle <= 2, `${cumle} cümle: ${t}`);
      assert.ok(kelime <= 26, `${kelime} kelime: ${t}`);
    }
  });
}
