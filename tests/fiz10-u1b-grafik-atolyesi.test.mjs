// node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import {
  sabitHizli, sinirlar, hareketTuru, xtSekli, vtSekli, atSeviye, isaretDegistirir,
  vtAlan, ornekle, degiskenIvme, taslardanParcalar, tepeYaparMi, parcali,
} from "../dersler/10/fizik/ortak/kinematik.js";

const yakin = (g, b, tol = 1e-6, m) => assert.ok(Math.abs(g - b) <= tol, `${m ?? ""} beklenen ${b}, gelen ${g}`);

test("sabitHizli: hızlı-yavaş-dur-geri parçaları", () => {
  const f = sabitHizli(0, [{ sure: 3, v: 10 }, { sure: 3, v: 4 }, { sure: 2, v: 0 }, { sure: 3, v: -8 }]);
  yakin(f(3).x, 30); yakin(f(6).x, 42); yakin(f(8).x, 42); yakin(f(11).x, 18);
  yakin(f(7).v, 0); yakin(f(10).v, -8);
  assert.deepEqual(sinirlar([{ sure: 3 }, { sure: 3 }, { sure: 2 }, { sure: 3 }]), [0, 3, 6, 8, 11]);
});

test("hareket türü: işaret kuralı", () => {
  assert.equal(hareketTuru(5, 2), "hizlaniyor");
  assert.equal(hareketTuru(5, -2), "yavasliyor");
  assert.equal(hareketTuru(-5, -2), "hizlaniyor");
  assert.equal(hareketTuru(-5, 2), "yavasliyor");
  assert.equal(hareketTuru(5, 0), "sabit");
  assert.equal(hareketTuru(0, 0), "duruyor");
  assert.equal(hareketTuru(0, 3), "hizlaniyor");
});

test("konum–zaman şekilleri", () => {
  assert.equal(xtSekli(0, 0), "yatay");
  assert.equal(xtSekli(6, 0), "artan-dogru");
  assert.equal(xtSekli(-6, 0), "azalan-dogru");
  assert.equal(xtSekli(0, 2), "artan-yukari");
  assert.equal(xtSekli(8, 2), "artan-yukari");
  assert.equal(xtSekli(8, -2), "artan-asagi");
  assert.equal(xtSekli(0, -2), "azalan-asagi");
  assert.equal(xtSekli(-8, -2), "azalan-asagi");
  assert.equal(xtSekli(-8, 2), "azalan-yukari");
  assert.equal(vtSekli(0), "yatay"); assert.equal(vtSekli(1), "artan"); assert.equal(vtSekli(-1), "azalan");
  assert.equal(atSeviye(0), "sifir"); assert.equal(atSeviye(2), "pozitif"); assert.equal(atSeviye(-2), "negatif");
  assert.equal(isaretDegistirir(8, -2, 4), false, "tam durur, işaret değiştirmez");
  assert.equal(isaretDegistirir(8, -2, 5), true);
});

test("hız–zaman alanı: yamuk, negatif alan ve sıfır geçişi", () => {
  // 4 → 12 (4 s), 12 sabit (3 s), 12 → 0 (3 s)
  const a1 = vtAlan(4, [{ sure: 4, a: 2 }, { sure: 3, a: 0 }, { sure: 3, a: -4 }]);
  yakin(a1.alan, 32 + 36 + 18); yakin(a1.yol, 86); yakin(a1.sonHiz, 0);
  // 6 m/s ile 2 s, sonra 1 s'de -6'ya (sıfırı keser), sonra -6 ile 2 s
  const a2 = vtAlan(6, [{ sure: 2, a: 0 }, { sure: 2, a: -6 }, { sure: 2, a: 0 }]);
  yakin(a2.alan, 12 + 0 - 12); yakin(a2.yol, 12 + 3 + 3 + 12);
  // alan = parcali ile hesaplanan yer değiştirme
  for (const [v0, p] of [[4, [{ sure: 4, a: 2 }, { sure: 3, a: 0 }]], [-5, [{ sure: 3, a: 1 }, { sure: 4, a: 2 }]]]) {
    const T = sinirlar(p).pop();
    yakin(vtAlan(v0, p).alan, parcali(0, v0, p)(T).x, 1e-6, "alan = Δx");
  }
});

test("ornekle: üç grafik aynı hareketten", () => {
  const o = ornekle(0, 2, [{ sure: 2, a: 3 }, { sure: 2, a: 0 }]);
  yakin(o.T, 4);
  const son = o.x[o.x.length - 1];
  yakin(son[0], 4); yakin(son[1], 2 * 2 + 0.5 * 3 * 4 + 8 * 2);
  assert.deepEqual(o.a, [[0, 3], [2, 3], [2, 0], [4, 0]]);
});

test("değişken ivme: sabit a için sayısal sonuç analitiğe yakın", () => {
  const d = degiskenIvme(0, 0, () => 2, 4, 0.001);
  const son = d.v[d.v.length - 1];
  yakin(son[1], 8, 0.01);
  yakin(d.x[d.x.length - 1][1], 16, 0.05);
  // artan ivmede hız–zaman eğrisi yukarı büküktür: ikinci yarıdaki hız artışı ilk yarıdan büyük
  const e = degiskenIvme(0, 0, (t) => t, 4, 0.001);
  const v = (t) => e.v[Math.round(t / 0.001)][1];
  assert.ok(v(4) - v(2) > v(2) - v(0));
});

test("yapı taşları: fren durana kadar sürer, tepe yapan hareket", () => {
  const p = taslardanParcalar(["hizlan", "fren"]);
  assert.deepEqual(p, [{ sure: 2, a: 2 }, { sure: 2, a: -2 }]);
  const q = taslardanParcalar(["hizlan", "hizlan", "fren"]);
  yakin(q[2].sure, 2); yakin(q[2].a, -2); // 8 m/s'den 2 s'de 4'e iner, durmaz
  const r = taslardanParcalar(["hizlan", "fren", "fren"]);
  assert.deepEqual(r[2], { sure: 2, a: 0 }); // hız sıfırken fren = bekleme
  assert.equal(tepeYaparMi(0, taslardanParcalar(["hizlan", "fren", "geri"])), true);
  assert.equal(tepeYaparMi(0, taslardanParcalar(["hizlan", "sabit", "fren"])), false);
  assert.equal(tepeYaparMi(0, taslardanParcalar(["geri", "hizlan"])), false, "geri gidip dönmek tepe değil çukurdur");
});
