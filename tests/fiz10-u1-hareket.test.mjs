// node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { parcali, surucuModeli } from "../dersler/10/fizik/u1-hareket/fizik.js";

const yakin = (gercek, beklenen, tol = 1e-6, mesaj) =>
  assert.ok(Math.abs(gercek - beklenen) <= tol, `${mesaj ?? ""} beklenen ${beklenen}, gelen ${gercek}`);

test("tek parça: x = x0 + v0·t + ½·a·t²", () => {
  const f = parcali(10, 4, [{ sure: Infinity, a: 2 }]);
  const d = f(3);
  yakin(d.x, 10 + 4 * 3 + 0.5 * 2 * 9);
  yakin(d.v, 4 + 2 * 3);
  yakin(d.a, 2);
});

test("parçalar arasında konum ve hız süreklidir", () => {
  const f = parcali(0, 0, [{ sure: 4, a: 3 }, { sure: 5, a: 0 }, { sure: 2, a: -6 }]);
  for (const t of [4, 9]) {
    const once = f(t - 1e-7), sonra = f(t + 1e-7);
    yakin(once.x, sonra.x, 1e-5, `t=${t} konum`);
    yakin(once.v, sonra.v, 1e-5, `t=${t} hız`);
  }
  yakin(f(11).v, 0, 1e-9, "fren sonunda durur");
});

test("son parça sonlu ise araç son hızıyla ivmesiz devam eder", () => {
  const f = parcali(0, 0, [{ sure: 2, a: 5 }]);
  yakin(f(3).v, 10);
  yakin(f(3).a, 0);
  yakin(f(3).x, 10 + 10);
});

test("5. adım senaryoları: sonda hız ve yön beklendiği gibi", () => {
  yakin(parcali(0, 15, [{ sure: 6, a: -2.5 }])(6).v, 0, 1e-9, "frende tam durma");
  yakin(parcali(60, -8, [{ sure: 4, a: 2 }])(4).v, 0, 1e-9, "geri giderken durma");
});

test("7. adım bulmacaları: doğru grafik ve çeldiriciler 8 s'de aynı konumda biter", () => {
  const x = ({ v0, a }) => v0 * 8 + 0.5 * a * 64;
  const B = [
    { v0: 0, a: 2, celdirici: [{ v0: 16, a: -2 }, { v0: 8, a: 0 }], dx: 64 },
    { v0: 12, a: -1.5, celdirici: [{ v0: 0, a: 1.5 }, { v0: 6, a: 0 }], dx: 48 },
    { v0: -6, a: 1.5, celdirici: [{ v0: 6, a: -1.5 }, { v0: 0, a: 0 }], dx: 0 },
  ];
  for (const b of B) {
    yakin(x(b), b.dx);
    for (const c of b.celdirici) yakin(x(c), b.dx);
  }
});

const ORTAK = { cizgi: 192, yesil: 30, kutle: 1200 };

test("sert sürücü: ışıkta durur, 30 s'de geçer, ~116 kJ frende kaybolur", () => {
  const s = surucuModeli({ a: 3, vmax: 50 / 3.6, b: 6, ...ORTAK });
  assert.equal(s.durdu, true);
  yakin(s.gecis, 30, 1e-9);
  assert.ok(s.bekleme > 12 && s.bekleme < 13, `bekleme ${s.bekleme}`);
  yakin(s.kayip / 1000, 0.5 * 1200 * (50 / 3.6) ** 2 / 1000, 1e-6);
  const f = parcali(0, 0, s.parcalar);
  yakin(f(25).x, 192, 1e-6, "beklerken çizgide");
  yakin(f(25).v, 0, 1e-9);
});

test("yeşil dalga çözülebilir: a=1 m/s², 25 km/h ile durmadan 30–34 s arasında geçilir", () => {
  const s = surucuModeli({ a: 1, vmax: 25 / 3.6, b: 4, ...ORTAK });
  assert.equal(s.durdu, false);
  assert.ok(s.gecis >= 30 && s.gecis <= 34, `geçiş ${s.gecis}`);
  yakin(parcali(0, 0, s.parcalar)(s.gecis).x, 192, 1e-6, "geçiş anında çizgide");
});

test("ışığa erken varan sürücü hiçbir zaman çizgiyi kırmızıda geçmez", () => {
  for (let a = 0.5; a <= 3; a += 0.25) {
    for (let kmh = 10; kmh <= 50; kmh++) {
      const s = surucuModeli({ a, vmax: kmh / 3.6, b: 4, ...ORTAK });
      const f = parcali(0, 0, s.parcalar);
      for (let t = 0; t < 30; t += 0.1) assert.ok(f(t).x <= 192 + 1e-6, `a=${a} v=${kmh} t=${t} x=${f(t).x}`);
      for (let t = 0; t < 60; t += 0.1) assert.ok(f(t).v >= -1e-9, `geri gitmemeli a=${a} v=${kmh}`);
    }
  }
});
