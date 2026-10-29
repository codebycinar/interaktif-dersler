import { test } from "node:test";
import assert from "node:assert/strict";
import {
  soruEki, ozneZamiri, belirsizGecerli, belirsizAciklama, taslakDenetle, hedefBul, degisenKelime, ONERILER, kelimeSay,
} from "../dersler/10/ingilizce/u1b-clubs-stress-celebrations/dilbilgisi.js";
import { ETIKET_CUMLELERI, YARDIMCILAR, ZAMIR_LISTESI, BELIRSIZ_BOSLUK, ROL_TURLARI, DIYALOG, ZAMAN_BOSLUK, MODEL_YAZI, GUNLER } from "../dersler/10/ingilizce/u1b-clubs-stress-celebrations/icerik.js";

test("question tags: curriculum examples", () => {
  assert.equal(soruEki("The students practise martial arts after school.").etiket, "don't they?");
  assert.equal(soruEki("The canteen isn't serving lunch now.").etiket, "is it?");
  assert.equal(soruEki("She can't attend the Science club today.").etiket, "can she?");
});

test("question tags: auxiliaries, contractions, pronouns", () => {
  const ornek = {
    "Mert always arrives on time,": "doesn't he?",
    "The pupils never skip PE.": "do they?",
    "You're coming to the poetry evening,": "aren't you?",
    "My friends and I are preparing a presentation,": "aren't we?",
    "Elif and Zeynep are revising in the library.": "aren't they?",
    "I am late.": "aren't I?",
    "I'm not late.": "am I?",
    "You don't like rugby.": "do you?",
    "Jack lives at school.": "doesn't he?",
    "The teachers are having a meeting in the staffroom.": "aren't they?",
    "Zeynep is leading the volunteering club this year.": "isn't she?",
    "The children can swim.": "can't they?",
    "It's raining.": "isn't it?",
    "The class starts at nine.": "doesn't it?",
  };
  for (const [c, e] of Object.entries(ornek)) assert.equal(soruEki(c)?.etiket, e, c);
  assert.equal(soruEki("Our school often organises spelling bees.", "Our school").etiket, "doesn't it?");
  // a base-form verb after he/she/it is not a valid present simple sentence
  assert.equal(soruEki("Mert play chess."), null);
});

test("ozneZamiri", () => {
  assert.equal(ozneZamiri("My friends and I"), "we");
  assert.equal(ozneZamiri("The students"), "they");
  assert.equal(ozneZamiri("The canteen"), "it");
  assert.equal(ozneZamiri("The class"), "it");
  assert.equal(ozneZamiri("Zeynep"), "she");
  assert.equal(ozneZamiri("The counsellor"), "he/she");
});

test("every tag exercise can be built from the buttons", () => {
  for (const c of ETIKET_CUMLELERI) {
    const e = soruEki(c.cumle, c.ozne);
    assert.ok(e, c.cumle);
    assert.ok(YARDIMCILAR.includes(e.yardimci), `${c.cumle} → ${e.yardimci}`);
    assert.ok(ZAMIR_LISTESI.includes(e.zamir), `${c.cumle} → ${e.zamir}`);
  }
});

test("tags written in the role-play bank and the model dialogue are correct", () => {
  const satirlar = [
    ...ROL_TURLARI.flatMap((t) => [...(t.ortak || []), ...Object.values(t.sorun || {}).flat()]),
    ...DIYALOG.flatMap((d) => d.metin.split(/(?<=[.?!])\s+/)),
  ];
  const etiketli = satirlar.filter((s) => /, \w+n't \w+\?$|, (is|are|do|does|can) \w+\?$/.test(s));
  assert.ok(etiketli.length >= 8);
  for (const s of etiketli) {
    const [, cumle, tag] = s.match(/^(.*), (\w+'?\w* \w+\?)$/);
    assert.equal(soruEki(cumle)?.etiket, tag, s);
  }
});

test("something / anything / nothing", () => {
  for (const o of BELIRSIZ_BOSLUK) assert.ok(belirsizGecerli(o.cumle).includes(o.dogru), o.cumle);
  assert.deepEqual(belirsizGecerli("Is there ___ in the food technology room?"), ["anything"]);
  assert.deepEqual(belirsizGecerli("I didn't bring ___ for lunch."), ["anything"]);
  assert.deepEqual(belirsizGecerli("Would you like ___ to drink?"), ["something", "anything"]);
  // the negative is in another clause
  assert.deepEqual(belirsizGecerli("There is ___ bothering the pupil, but they won't talk about it."), ["something", "nothing"]);
  assert.match(belirsizAciklama("I didn't bring ___ for lunch.", "nothing"), /negative/);
  assert.match(belirsizAciklama("Is there ___ in the room?", "something"), /questions/);
  assert.equal(belirsizAciklama("Is there ___ in the room?", "anything"), "");
});

test("gap exercises have their answer among the options", () => {
  for (const o of ZAMAN_BOSLUK) assert.ok(o.secenekler.includes(o.dogru), o.id);
});

test("writing checklist", () => {
  const bos = taslakDenetle("");
  assert.equal(bos.tamam, false);
  const iyi = `Hi everyone at our partner school!

My name is Ali and I go to an Anatolian high school in Konya. Our school has a big courtyard and a new basketball court. Lessons usually start at 8:30. I always have lunch in the canteen with my friends.

On Tuesdays I go to the chess club. These days we are preparing for Republic Day, and I'm practising a poem for the ceremony.

Before exams I sometimes feel anxious, so I make a weekly plan. What is your school like? Do you have clubs too?

Write soon!
Ali`;
  const d = taslakDenetle(iyi);
  assert.equal(d.tamam, true, JSON.stringify(d.maddeler.filter((m) => !m.tamam)));
  assert.deepEqual(d.siklik.sort(), ["always", "sometimes", "usually"]);
  assert.ok(d.hedef.includes("courtyard") && d.hedef.includes("chess club"));
  // "morning" is not a progressive form
  assert.equal(taslakDenetle("Hi! Every morning I walk.").maddeler.find((m) => m.id === "surekli").tamam, false);
  // the model post is long enough and has the key features
  const model = taslakDenetle(MODEL_YAZI.map((m) => m.metin).join("\n"));
  for (const id of ["selam", "siklik", "surekli", "hedef", "soru", "kapanis"]) assert.ok(model.maddeler.find((m) => m.id === id).tamam, id);
});

test("feedback suggestions and revision distance", () => {
  const o = Object.fromEntries(ONERILER.map((x) => [x.id, x]));
  assert.equal(o.neden.kontrol("I like it because it's fun."), true);
  assert.equal(o.nesne.kontrol("Our teacher helps us."), true);
  assert.equal(o.gun.kontrol("We celebrate Republic Day."), true);
  assert.equal(o.etiket.kontrol("Your school is big, isn't it?"), true);
  assert.equal(o.hedef.kontrol("canteen courtyard locker room", "canteen"), true);
  assert.equal(o.hedef.kontrol("canteen courtyard", "canteen"), false);
  assert.equal(degisenKelime("a b c", "a b c"), 0);
  assert.equal(degisenKelime("I like chess", "I love chess club"), 3);
  assert.equal(kelimeSay("It's 8:30, isn't it?"), 4);
  assert.deepEqual(hedefBul("The locker rooms and the canteen"), ["canteen", "locker room"]);
});

test("national days data", () => {
  assert.equal(GUNLER.length, 7);
  assert.deepEqual(GUNLER.filter((g) => g.tarih).map((g) => g.tarih), ["29 October", "23 April", "19 May", "30 August", "15 July"]);
});
