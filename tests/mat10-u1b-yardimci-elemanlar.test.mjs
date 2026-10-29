// node --test tests/mat10-u1b-yardimci-elemanlar.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  uzaklik, fark, icCarpim, dogruyaUzaklik, dikmeAyagi, icAciortayAyagi, disAciortayAyagi, icAciortayYonu, disAciortayYonu,
  icTegetCember, disTegetCember, agirlikMerkezi, cevrelCember, diklikMerkezi, ortaNokta, ucgenTuru, ucgenGore, nk, aci,
} from "../dersler/10/matematik/ortak/geometri.js";
import { IZGARA, yapistir, gecerliUcgen, MERKEZLER, SENARYOLAR, senaryoHedefi, HEDEF_TOLERANS } from "../dersler/10/matematik/u1b-yardimci-elemanlar/model.js";

const yakin = (gercek, beklenen, tol = 1e-9, mesaj = "") =>
  assert.ok(Math.abs(gercek - beklenen) <= tol, `${mesaj} beklenen ${beklenen}, gelen ${gercek}`);

// dar, dik ve geniş açılı örnek üçgenler
const UCGENLER = {
  dar: [nk(-1, 3.5), nk(-4, -2.5), nk(4, -2)],
  dik: [nk(-4, 3), nk(-4, -2), nk(4, -2)],
  genis: [nk(-6, 1), nk(-4, -2.5), nk(4, -2)],
  cesitkenar: [nk(1, 4), nk(-5, -1), nk(5, -1)],
};

test("1. adım: iç açıortay teoremi BD/DC = AB/AC ve D açıyı ikiye böler", () => {
  for (const [ad, [A, B, C]] of Object.entries(UCGENLER)) {
    const D = icAciortayAyagi(A, B, C);
    yakin(uzaklik(B, D) / uzaklik(D, C), uzaklik(A, B) / uzaklik(A, C), 1e-9, ad);
    yakin(aci(B, A, D), aci(D, A, C), 1e-9, `${ad} açılar`);
    yakin(uzaklik(B, D) + uzaklik(D, C), uzaklik(B, C), 1e-9, `${ad}: D kenar üzerinde`);
  }
});

test("3. adım: dış açıortay EB/EC = AB/AC, iç açıortaya dik; AB = AC ise paralel", () => {
  for (const [ad, [A, B, C]] of Object.entries(UCGENLER)) {
    const E = disAciortayAyagi(A, B, C);
    yakin(uzaklik(E, B) / uzaklik(E, C), uzaklik(A, B) / uzaklik(A, C), 1e-9, ad);
    yakin(icCarpim(icAciortayYonu(A, B, C), disAciortayYonu(A, B, C)), 0, 1e-12, `${ad}: diklik`);
  }
  assert.equal(disAciortayAyagi(nk(0, 3), nk(-2, 0), nk(2, 0)), null);
});

test("2–3. adım: I üç kenara, I_a üç kenar doğrusuna eşit uzaklıktadır", () => {
  for (const [ad, [A, B, C]] of Object.entries(UCGENLER)) {
    const { merkez: I, r } = icTegetCember(A, B, C);
    for (const [p, q] of [[A, B], [B, C], [C, A]]) yakin(dogruyaUzaklik(I, p, q), r, 1e-9, `${ad} I`);
    assert.equal(ucgenGore(I, A, B, C), "ic");
    const { merkez: Ia, r: ra } = disTegetCember(A, B, C);
    for (const [p, q] of [[A, B], [B, C], [C, A]]) yakin(dogruyaUzaklik(Ia, p, q), ra, 1e-9, `${ad} Ia`);
    assert.equal(ucgenGore(Ia, A, B, C), "dis");
  }
});

test("4. adım: G kenarortayları köşeden 2 : 1 böler; dik üçgende hipotenüse ait kenarortay = hipotenüs/2", () => {
  for (const [ad, [A, B, C]] of Object.entries(UCGENLER)) {
    const G = agirlikMerkezi(A, B, C);
    for (const [V, p, q] of [[A, B, C], [B, A, C], [C, A, B]]) {
      const M = ortaNokta(p, q);
      yakin(uzaklik(V, G) / uzaklik(G, M), 2, 1e-9, ad);
    }
  }
  const [A, B, C] = UCGENLER.dik; // dik açı B'de
  yakin(uzaklik(B, ortaNokta(A, C)), uzaklik(A, C) / 2, 1e-12);
});

test("5. adım: O köşelere eşit uzaklıkta; dar → içte, dik → hipotenüsün ortası, geniş → dışta", () => {
  for (const [ad, [A, B, C]] of Object.entries(UCGENLER)) {
    const { merkez: O, R } = cevrelCember(A, B, C);
    for (const K of [A, B, C]) yakin(uzaklik(O, K), R, 1e-9, ad);
  }
  const yer = (t) => ucgenGore(cevrelCember(...UCGENLER[t]).merkez, ...UCGENLER[t], 0.02);
  assert.equal(yer("dar"), "ic");
  assert.equal(yer("dik"), "kenar");
  assert.equal(yer("genis"), "dis");
  const [A, , C] = UCGENLER.dik;
  yakin(uzaklik(cevrelCember(...UCGENLER.dik).merkez, ortaNokta(A, C)), 0, 1e-9);
});

test("6. adım: H'den her köşeye giden doğru karşı kenara diktir; dik üçgende H dik köşededir", () => {
  for (const [ad, [A, B, C]] of Object.entries(UCGENLER)) {
    const H = diklikMerkezi(A, B, C);
    for (const [V, p, q] of [[A, B, C], [B, A, C], [C, A, B]]) {
      const v = fark(H, V);
      if (Math.hypot(v.x, v.y) > 1e-9) yakin(icCarpim(v, fark(q, p)), 0, 1e-8, `${ad} ${V.x},${V.y}`);
      // yükseklik ayağı H–V doğrusu üzerinde
      const F = dikmeAyagi(V, p, q);
      if (Math.hypot(v.x, v.y) > 1e-9) yakin(dogruyaUzaklik(F, V, H), 0, 1e-8);
    }
  }
  yakin(uzaklik(diklikMerkezi(...UCGENLER.dik), UCGENLER.dik[1]), 0, 1e-9);
  assert.equal(ucgenGore(diklikMerkezi(...UCGENLER.dar), ...UCGENLER.dar), "ic");
  assert.equal(ucgenGore(diklikMerkezi(...UCGENLER.genis), ...UCGENLER.genis), "dis");
});

test("ucgenTuru örnek üçgenleri doğru sınıflandırır", () => {
  assert.equal(ucgenTuru(...UCGENLER.dar, 0.3), "dar");
  assert.equal(ucgenTuru(...UCGENLER.dik, 0.3), "dik");
  assert.equal(ucgenTuru(...UCGENLER.genis, 0.3), "genis");
});

test("duman senaryosu ızgara noktaları dik üçgen kurar (5. ve 6. adım)", () => {
  // C (4; −2,5), A (−4; 3,5), B (−4; −2,5)
  assert.equal(ucgenTuru(nk(-4, 3.5), nk(-4, -2.5), nk(4, -2.5), 0.3), "dik");
  assert.deepEqual(yapistir({ x: 0.13, y: -0.37 }), { x: 0.25, y: -0.25 });
  assert.equal(IZGARA, 0.25);
  assert.ok(!gecerliUcgen(nk(0, 0), nk(1, 0), nk(2, 0.01)), "neredeyse doğrusal üçgen reddedilir");
  assert.ok(gecerliUcgen(...UCGENLER.dar));
});

test("7. adım senaryoları: hedef doğru merkezde ve üçgenin içinde", () => {
  for (const s of SENARYOLAR) {
    const [A, B, C] = s.koseler;
    assert.equal(ucgenTuru(A, B, C, 0.3), "dar", `${s.ad}: dar açılı (her merkez içeride)`);
    const H = senaryoHedefi(s);
    assert.equal(ucgenGore(H, A, B, C), "ic", s.ad);
    // yanlış merkezlerin her biri hedefe toleranstan uzak olmalı ki seçim gerçekten fark etsin
    for (const [ad, m] of Object.entries(MERKEZLER)) {
      if (ad === s.dogru) continue;
      assert.ok(uzaklik(m.bul(A, B, C), H) > HEDEF_TOLERANS, `${s.ad}: ${ad} hedefe çok yakın`);
      assert.ok(s.yanlis[ad], `${s.ad}: ${ad} için açıklama var`);
    }
  }
  const depo = SENARYOLAR.find((s) => s.ad === "depo");
  const O = senaryoHedefi(depo);
  const d = depo.koseler.map((k) => uzaklik(O, k));
  yakin(d[0], d[1], 1e-9); yakin(d[1], d[2], 1e-9);
});

test("8. adım sınav cevapları", () => {
  // AB = 6, AC = 9, BC = 10 → BD = 10·6/15 = 4
  yakin(10 * 6 / 15, 4, 1e-12);
  // G kenarortayı 2:1 böler: AD = 12 → AG = 8
  yakin(12 * 2 / 3, 8, 1e-12);
  // dik üçgende hipotenüs 10 → hipotenüse ait kenarortay 5 (çevrel çember yarıçapı)
  const R = cevrelCember(nk(0, 0), nk(6, 0), nk(0, 8)).R;
  yakin(R, 5, 1e-12);
  // AB = 6, AC = 4, BC = 5 → EB/EC = 3/2, EB = EC + 5 → EC = 10
  const A = nk(0, 0), B = nk(6, 0);
  // AC = 4 ve BC = 5 olacak biçimde C: x = (36 + 16 − 25)/12
  const x = (36 + 16 - 25) / 12, C = nk(x, Math.sqrt(16 - x * x));
  yakin(uzaklik(B, C), 5, 1e-12);
  yakin(uzaklik(disAciortayAyagi(A, B, C), C), 10, 1e-9);
  // iç açıortay ayağı BC'yi 6:4 böler (soru 1'in ikinci sürümü için kontrol)
  yakin(uzaklik(B, icAciortayAyagi(A, B, C)), 3, 1e-9);
});
