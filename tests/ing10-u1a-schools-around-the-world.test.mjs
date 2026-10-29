import { test } from "node:test";
import assert from "node:assert/strict";
import { parcala, temizMetin, cumleBul, yansimaDenetle } from "../dersler/10/ingilizce/u1a-schools-around-the-world/okuma.js";
import { MAKALE, TARAMA, KELIMELER, PODCAST, SESLER, AYRINTILAR, KARSILASTIR, KISILER, TONLAMA } from "../dersler/10/ingilizce/u1a-schools-around-the-world/icerik.js";

test("parcala: marks scan answers and vocabulary, keeps the text", () => {
  const t = parcala("Lessons start at [[saat|8:40]]. A {{locker}} here.");
  assert.equal(t.map((x) => x.metin).join(""), "Lessons start at 8:40. A locker here.");
  assert.deepEqual(t.filter((x) => x.anahtar).map((x) => x.metin), ["8:40"]);
  assert.equal(t.find((x) => x.kelime)?.kelime, "locker");
  const iki = parcala("a [[sinav|chemistry quiz]] today");
  assert.deepEqual(iki.filter((x) => x.anahtar === "sinav" && !x.bosluk).map((x) => x.metin), ["chemistry", "quiz"]);
});

test("temizMetin removes the markup", () => {
  assert.equal(temizMetin("put on [[ayakkabi|indoor shoes]] in a {{locker}}"), "put on indoor shoes in a locker");
  for (const p of MAKALE) assert.doesNotMatch(temizMetin(p.metin), /[[\]{}|]/);
});

test("every scan question has exactly one answer span in the article", () => {
  for (const q of TARAMA) {
    const n = MAKALE.reduce((s, p) => s + (p.metin.match(new RegExp(`\\[\\[${q.anahtar}\\|`, "g")) || []).length, 0);
    assert.equal(n, 1, q.anahtar);
  }
});

test("every target word appears in the article and cumleBul finds its sentence", () => {
  for (const w of KELIMELER) {
    const p = MAKALE.find((x) => x.metin.includes(`{{${w.kelime}}}`));
    assert.ok(p, w.kelime);
    const c = cumleBul(p.metin, w.kelime);
    assert.match(c, new RegExp(`\\b${w.kelime}\\b`));
    assert.match(c, /[.!?]$/);
  }
});

test("yansimaDenetle checklist", () => {
  const bos = yansimaDenetle("");
  assert.equal(bos.tamam, false);
  assert.equal(bos.kelime, 0);
  const iyi = yansimaDenetle("My lessons start at 8:20 and I usually walk to school with my sister. Every Monday we have a flag ceremony in the courtyard, like Deniz. Unlike Haruto, I don't change my shoes, but we sometimes clean the board. My favourite part is the break because I play basketball.");
  assert.ok(iyi.kelime >= 40);
  assert.equal(iyi.tamam, true, JSON.stringify(iyi.maddeler.filter((m) => !m.tamam)));
  const saatsiz = yansimaDenetle("I usually go to school by bus but Aino ".repeat(6));
  assert.equal(saatsiz.maddeler.find((m) => m.id === "zaman").tamam, false);
  assert.equal(yansimaDenetle("Lessons begin at half past eight.").maddeler.find((m) => m.id === "zaman").tamam, true);
  assert.equal(yansimaDenetle("We start at nine o'clock.").maddeler.find((m) => m.id === "zaman").tamam, true);
});

test("content integrity", () => {
  for (const s of PODCAST) assert.ok(SESLER[s.kim], s.kim);
  assert.ok(AYRINTILAR.every((a) => ["elif", "jack", "ikisi"].includes(a.kova)));
  assert.ok(KARSILASTIR.every((a) => KISILER[a.kova]));
  assert.ok(TONLAMA.every((t) => ["dusen", "yukselen"].includes(t.ton)));
  // question tags in the intonation set really are tags
  for (const t of TONLAMA.filter((x) => /Question tag/.test(x.tur))) assert.match(t.metin, /, (is|isn't|can|can't|do|don't|are|aren't) \w+\?$/);
});
