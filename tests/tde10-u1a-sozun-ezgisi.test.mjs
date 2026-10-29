// node --test tests/tde10-u1a-sozun-ezgisi.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { heceler, heceSayisi, dizeCoz, durakDenetle, durakBul, heceTipi, acikKapaliDizisi, kalibaUyar } from "../dersler/10/turk-dili-edebiyat/u1a-sozun-ezgisi/ahenk.js";
import { SIIRLER } from "../dersler/10/turk-dili-edebiyat/u1a-sozun-ezgisi/metinler.js";

test("heceleme: temel kelimeler", () => {
  assert.deepEqual(heceler("İncecikten"), ["İn", "ce", "cik", "ten"]);
  assert.deepEqual(heceler("Çanakkale"), ["Ça", "nak", "ka", "le"]);
  assert.deepEqual(heceler("Mahlede"), ["Mah", "le", "de"]);
  assert.deepEqual(heceler("kırk"), ["kırk"]);
  assert.deepEqual(heceler("Yemen'dir,"), ["Ye", "men'", "dir,"]);
  assert.deepEqual(heceler("İstanbul'u"), ["İs", "tan", "bu", "l'u"]);
  assert.deepEqual(heceler("Yalŋuk"), ["Yal", "ŋuk"]);
  assert.deepEqual(heceler("şiir"), ["şi", "ir"]);
  assert.deepEqual(heceler("türkü"), ["tür", "kü"]);
});

test("hece sayısı ünlü sayısına eşittir", () => {
  for (const k of ["İncecikten", "sevilelim", "dumandır", "âşinâ"]) assert.equal(heceler(k).length, heceSayisi(k));
});

test("derste sayılan şiirlerin her dizesi ölçüsüne uyar", () => {
  for (const ad of ["kosuk", "alp", "yunus", "karacaoglan", "yemen"]) {
    const s = SIIRLER[ad];
    for (const d of s.dizeler) assert.equal(heceSayisi(d), s.olcu, `${ad}: "${d}"`);
  }
});

test("serbest şiirde dizelerin hece sayısı farklıdır", () => {
  const sayilar = SIIRLER.orhan.dizeler.map(heceSayisi);
  assert.deepEqual(sayilar, [14, 11, 8, 7]);
});

test("durak denetimi: doğru ve yanlış yerleşimler", () => {
  // "İncecikten | bir kar yağar" → 4+4
  assert.deepEqual(durakDenetle("İncecikten bir kar yağar", [0], 8), { gruplar: [4, 4], uygun: true, genelUygun: true, toplam: 8 });
  // 5+3 sekizli ölçüde görülür ama bu şiirin düzeni 4+4'tür
  const r = durakDenetle("İncecikten bir kar yağar", [1], 8, [[4, 4]]);
  assert.equal(r.uygun, false);
  assert.equal(r.genelUygun, true);
  assert.equal(durakDenetle("İncecikten bir kar yağar", [2], 8).uygun, false);
  // 11'li: 6+5 ve 4+4+3 kabul
  assert.equal(durakDenetle("Havada bulut yok, bu ne dumandır", [2], 11).uygun, true);
  assert.deepEqual(durakDenetle("Havada bulut yok, bu ne dumandır", [2], 11).gruplar, [6, 5]);
  assert.equal(durakDenetle("Şu Yemen illeri ne de yamandır", [2], 11).uygun, true);
  assert.equal(durakDenetle("Şu Yemen illeri ne de yamandır", [1], 11).uygun, false);
  // durağı olmayan dize uygun değildir
  assert.equal(durakDenetle("Alp Er Tonga öldi mü", [], 7).uygun, false);
  assert.equal(durakDenetle("Alp Er Tonga öldi mü", [2], 7).uygun, true);
});

test("durak etkinliğindeki her dize için ölçüye uygun bir durak vardır", () => {
  for (const ad of ["alp", "karacaoglan", "yemen"]) {
    const s = SIIRLER[ad];
    for (const d of s.dizeler) assert.ok(durakBul(d, s.olcu, s.durak).length > 0, `${ad}: "${d}"`);
  }
});

test("açık / kapalı hece", () => {
  assert.equal(heceTipi("ma"), ".");
  assert.equal(heceTipi("kork"), "–");
  assert.equal(heceTipi("lâ"), "–");
  assert.equal(heceTipi("ma,"), ".");
  assert.deepEqual(acikKapaliDizisi("Korkma, sönmez").join(""), "–.––");
});

test("aruz örnekleri kalıplarına uyar", () => {
  assert.ok(kalibaUyar(SIIRLER.istiklal.dizeler[0], SIIRLER.istiklal.kalip));
  assert.ok(kalibaUyar(SIIRLER.hasim.dizeler[0], SIIRLER.hasim.kalip));
  assert.ok(!kalibaUyar(SIIRLER.yunus.dizeler[0], SIIRLER.istiklal.kalip));
});

test("kafiye çözümlemeleri son kelimeyle örtüşür", () => {
  for (const ad of ["alp", "yunus", "yemen"]) {
    const s = SIIRLER[ad];
    s.kafiye.forEach((k, i) => {
      if (!k) return;
      const birlesik = k.join("");
      assert.ok(s.dizeler[i].replace(/[,.;]/g, "").endsWith(birlesik), `${ad} ${i}: ${birlesik}`);
    });
  }
  assert.equal(dizeCoz("Alp Er Tonga öldi mü").length, 5);
});
