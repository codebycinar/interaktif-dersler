// node --test tests/mat10-u1c-alan-teoremler.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  nk, alan, acilar, kenarlar, alanFormulleri, sinusluAlan, sinusOrani, kosinusKenar, kosinusAci, cevrelCember, dikmeAyagi,
  uzaklik, radyan,
} from "../dersler/10/matematik/ortak/geometri.js";
import {
  ortakOlmayan, bolmeCizgileri, TARLA, solParselKirik, solParselDuz, paralelN,
  BOGAZ, tabanAcisi, bakisYonu, acHesapla, cdHesapla, gercekUzaklik, tabanMetre,
} from "../dersler/10/matematik/u1c-alan-teoremler/model.js";

const yakin = (gercek, beklenen, tol = 1e-9, mesaj = "") =>
  assert.ok(Math.abs(gercek - beklenen) <= tol, `${mesaj} beklenen ${beklenen}, gelen ${gercek}`);

const UCGENLER = [
  [nk(-1, 3.5), nk(-4, -2.5), nk(4, -2)],
  [nk(-6, 1), nk(-5, -1), nk(4, -2)], // geniş açılı
  [nk(0, 0), nk(6, 0), nk(0, 5)], // dik
  [nk(-4, -2), nk(4.5, -2), nk(-5.5, 3)], // A geniş
];

test("1. adım: a sabitken alan h ile, h sabitken a ile doğru orantılı", () => {
  for (let h = 1; h <= 7.5; h += 0.5) yakin(alan(nk(2, h), nk(0, 0), nk(6, 0)), 3 * h, 1e-12);
  for (let a = 1; a <= 10; a += 0.5) yakin(alan(nk(2, 4), nk(0, 0), nk(a, 0)), 2 * a, 1e-12);
});

test("2. adım: paralel doğrular arasında ortak tabanlı üçgenler ve ortak olmayan bölgeler", () => {
  const B = nk(-3, 0), C = nk(3, 0);
  for (let x = -6.5; x <= 6.5; x += 0.25) yakin(alan(nk(x, 4), B, C), 12, 1e-12, `x=${x}`);
  for (const [ax, dx] of [[-4.5, 1.5], [0, 5.5], [5.5, -5], [-6.5, 6.5], [2, 2.25]]) {
    const o = ortakOlmayan(nk(ax, 4), nk(dx, 4), B, C);
    yakin(o.alanSol, o.alanSag, 1e-9, `${ax}, ${dx}`);
    // K iki köşegenin de üzerinde
    yakin(uzaklik(o.L, o.K) + uzaklik(o.K, C), uzaklik(o.L, C), 1e-9);
    yakin(uzaklik(o.R, o.K) + uzaklik(o.K, B), uzaklik(o.R, B), 1e-9);
  }
  assert.equal(ortakOlmayan(nk(1, 4), nk(1, 4), B, C), null);
});

test("3. adım: benzer üçgenlerde alan oranı k²; k tam sayıysa k² eş küçük üçgen", () => {
  const A = nk(0.8, 1.8), B = nk(0, 0), C = nk(2.4, 0);
  for (const k of [1, 1.5, 2, 2.5, 3, 3.5, 4]) {
    const b = (P) => nk(3.6 + P.x * k, P.y * k);
    yakin(alan(b(A), b(B), b(C)) / alan(A, B, C), k * k, 1e-9, `k=${k}`);
  }
  // k paralel çizgiyle bölünen üçgen: her yönde k − 1 çizgi
  assert.equal(bolmeCizgileri(A, B, C, 3).length, 6);
  // çizgilerin uçları kenarlar üzerinde ve karşı kenara paralel
  for (const [p, q] of bolmeCizgileri(A, B, C, 4)) {
    const v = nk(q.x - p.x, q.y - p.y);
    const paralel = [[B, C], [A, C], [A, B]].some(([u, w]) => Math.abs(v.x * (w.y - u.y) - v.y * (w.x - u.x)) < 1e-9);
    assert.ok(paralel);
  }
});

test("4. adım: altı alan formülü aynı sonucu verir (geniş açılılar dahil)", () => {
  for (const [A, B, C] of UCGENLER) {
    const S = alan(A, B, C);
    const f = alanFormulleri(A, B, C);
    for (const v of [...f.tabanYukseklik, ...f.sinuslu]) yakin(v, S, 1e-9);
  }
  // kollar 6 ve 5: en büyük alan 15 (A = 90°); 30° ve 150° eşit
  yakin(sinusluAlan(6, 5, 90), 15, 1e-12);
  yakin(sinusluAlan(6, 5, 30), sinusluAlan(6, 5, 150), 1e-12);
  for (let a = 1; a < 180; a++) assert.ok(sinusluAlan(6, 5, a) <= 15 + 1e-12);
});

test("5. adım: tarla — paralel inşa ile N = (7,5; 0) ve parsel alanı korunur", () => {
  yakin(solParselKirik(), 50, 1e-12);
  const N = paralelN();
  yakin(N.x, 7.5, 1e-12);
  yakin(solParselDuz(N.x), solParselKirik(), 1e-12);
  // ABM ve ABN üçgenlerinin alanları eşit
  yakin(alan(TARLA.A, TARLA.B, TARLA.M), alan(TARLA.A, TARLA.B, N), 1e-12);
  // ızgaraya (0,25) yapışan komşu konumlar toleransın dışında: görev gerçekten doğru noktayı ister
  for (const x of [7.25, 7.75]) assert.ok(Math.abs(solParselDuz(x) - 50) / 50 > TARLA.tolerans);
  // cevap: N, B'den 3,5 birim = 35 m uzakta; parsel 5000 m²
  yakin((N.x - TARLA.B.x) * TARLA.metre, 35, 1e-9);
  yakin(solParselKirik() * TARLA.metre ** 2, 5000, 1e-9);
});

test("6. adım: sinüs teoremi a/sinA = b/sinB = c/sinC = 2R", () => {
  for (const [A, B, C] of UCGENLER) {
    const { a, b, c } = kenarlar(A, B, C), ac = acilar(A, B, C), R = cevrelCember(A, B, C).R;
    yakin(sinusOrani(a, ac.A), 2 * R, 1e-9);
    yakin(sinusOrani(b, ac.B), 2 * R, 1e-9);
    yakin(sinusOrani(c, ac.C), 2 * R, 1e-9);
  }
});

test("7. adım: kosinüs teoremi ve ispattaki parçalar (A geniş açıyken de)", () => {
  for (const [A, B, C] of UCGENLER) {
    const { a, b, c } = kenarlar(A, B, C), ac = acilar(A, B, C);
    yakin(kosinusKenar(b, c, ac.A), a, 1e-9);
    yakin(kosinusAci(a, b, c), ac.A, 1e-9);
    const H = dikmeAyagi(C, A, B);
    const cosA = Math.cos(radyan(ac.A)), sinA = Math.sin(radyan(ac.A));
    yakin(uzaklik(C, H), b * sinA, 1e-9, "CH = b·sin A");
    yakin(uzaklik(A, H), b * Math.abs(cosA), 1e-9, "AH = b·|cos A|");
    yakin(uzaklik(H, B), Math.abs(c - b * cosA), 1e-9, "HB = c − b·cos A");
    yakin((b * sinA) ** 2 + (c - b * cosA) ** 2, a * a, 1e-9, "Pisagor adımı");
  }
  // A = 90° → Pisagor
  yakin(kosinusKenar(3, 4, 90), 5, 1e-12);
});

test("8. adım: Boğaz ölçümleri (temsilî sahne)", () => {
  yakin(tabanMetre(), 400, 1e-9);
  const aC = tabanAcisi("A", "C"), bC = tabanAcisi("B", "C"), aD = tabanAcisi("A", "D");
  yakin(aC, 71.97, 0.01); yakin(bC, 82.06, 0.01); yakin(aD, 96.95, 0.01);
  // bakış yönü gerçekten hedefi gösterir
  for (const [ist, hd] of [["A", "C"], ["B", "C"], ["A", "D"], ["B", "D"]]) {
    const d = bakisYonu(ist, tabanAcisi(ist, hd));
    const S = BOGAZ[ist], H = BOGAZ[hd];
    const L = Math.hypot(H.x - S.x, H.y - S.y);
    yakin(d.x, (H.x - S.x) / L, 1e-9, `${ist}→${hd}`);
    yakin(d.y, (H.y - S.y) / L, 1e-9);
  }
  // tam açılarla sinüs teoremi gerçek uzaklığı verir
  yakin(acHesapla(aC, bC), gercekUzaklik("A", "C"), 1e-6);
  yakin(gercekUzaklik("A", "C"), 904.4, 0.1);
  // ekrandaki 0,1° yuvarlanmış açılarla da sonuç %1,5 toleransın içinde
  const y = (v) => Math.round(v * 10) / 10;
  const ac = acHesapla(y(aC), y(bC));
  assert.ok(Math.abs(ac - gercekUzaklik("A", "C")) / gercekUzaklik("A", "C") < 0.015);
  // BC ile AC karışıklığı toleransın dışında kalır (ayrı geri bildirim alır)
  assert.ok(Math.abs(gercekUzaklik("B", "C") - gercekUzaklik("A", "C")) / gercekUzaklik("A", "C") > 0.03);
  // AD verisi sahneyle uyumlu; kosinüs teoremi CD'yi verir
  yakin(BOGAZ.AD_metre, gercekUzaklik("A", "D"), 0.5);
  yakin(cdHesapla(gercekUzaklik("A", "C"), gercekUzaklik("A", "D"), aD - aC), gercekUzaklik("C", "D"), 1e-6);
  const cd = cdHesapla(Math.round(ac), BOGAZ.AD_metre, y(y(aD) - y(aC)));
  assert.ok(Math.abs(cd - gercekUzaklik("C", "D")) / gercekUzaklik("C", "D") < 0.02, `CD ${cd}`);
  // teodolit kilidi iki hedefi karıştırmaz
  assert.ok(Math.abs(aD - aC) > 2 * BOGAZ.kilit);
});

test("9. adım sınav cevapları", () => {
  yakin(12 * (3 / 2) ** 2, 27, 1e-12);
  yakin(sinusluAlan(6, 8, 30), 12, 1e-12);
  yakin(sinusOrani(10, 30) * Math.sin(radyan(45)), 10 * Math.SQRT2, 1e-9);
  yakin(kosinusKenar(5, 8, 60), 7, 1e-12);
  yakin(sinusOrani(6, 30) / 2, 6, 1e-12);
});
