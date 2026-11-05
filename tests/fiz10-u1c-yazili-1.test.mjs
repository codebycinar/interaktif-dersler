// node --test tests/ — MEB OGM "Yazılıya Hazırlanıyorum" 10. sınıf fizik 1. dönem 1. yazılı cevap anahtarıyla karşılaştırma
import test from "node:test";
import assert from "node:assert/strict";
import { ivme, sonHiz, yamukAlan, agacHizasi, yetisme, araliklar, deneme, bolgeIvmesi, duzgunDegisim, frenSenaryosu } from "../dersler/10/fizik/u1c-yazili-1/model.js";

const yakin = (g, b, tol = 1e-6, m) => assert.ok(Math.abs(g - b) <= tol, `${m ?? ""} beklenen ${b}, gelen ${g}`);

test("1. soru: 1 s'de 2. ağaç → 6 s'de 7. ağaç, ivme 0", () => {
  assert.equal(agacHizasi({ saniyedeAralik: 1, t: 6 }), 7);
  yakin(ivme(5, 5, 6), 0);
});

test("2. soru: dronlar 4 s sonra yetişir; 80 m ve 32 m yol", () => {
  const y = yetisme({ mesafe: 48, vHizli: 20, vYavas: 8 });
  yakin(y.t, 4); yakin(y.yolHizli, 80); yakin(y.yolYavas, 32);
  yakin(y.yolHizli - y.yolYavas, 48, 1e-9, "aradaki fark kapanır");
});

test("3. soru: S-T yavaşlar (18→12), T-R hızlanır (12→30)", () => {
  const [st, tr] = araliklar(18, [{ yon: -1, buyukluk: 2, sure: 3 }, { yon: +1, buyukluk: 3, sure: 6 }]);
  yakin(st.son, 12); assert.equal(st.degisim, "azalır"); assert.equal(st.tur, "yavasliyor"); assert.equal(st.ivmeYonu, "−x");
  yakin(tr.son, 30); assert.equal(tr.degisim, "artar"); assert.equal(tr.tur, "hizlaniyor"); assert.equal(tr.ivmeYonu, "+x");
});

test("4. soru: tramvay denemeleri K, L, M, N", () => {
  const K = deneme([[0, 2], [2, 6], [4, 10]]), L = deneme([[0, 2], [2, 4], [4, 6]]), M = deneme([[0, -10], [2, -6], [4, -2]]), N = deneme([[0, -2], [2, -6], [4, -10]]);
  assert.deepEqual([K.dv, K.a, K.hizYonu, K.ivmeYonu, K.hareket], [4, 2, "Doğu", "Doğu", "Hızlanır"]);
  assert.deepEqual([L.dv, L.a, L.hizYonu, L.ivmeYonu, L.hareket], [2, 1, "Doğu", "Doğu", "Hızlanır"]);
  assert.deepEqual([M.dv, M.a, M.hizYonu, M.ivmeYonu, M.hareket], [4, 2, "Batı", "Doğu", "Yavaşlar"]);
  assert.deepEqual([N.dv, N.a, N.hizYonu, N.ivmeYonu, N.hareket], [-4, -2, "Batı", "Batı", "Hızlanır"]);
  // 4.2: 0–4 s aralığında hız değişimi iki katı
  yakin(10 - 2, 8); yakin(-10 - -2, -8);
});

test("5. soru: düşüş kulesi P: +3 m/s² aşağı, R: −4 m/s² yukarı", () => {
  const P = bolgeIvmesi([2, 5, 8, 11]), R = bolgeIvmesi([11, 7, 3]);
  assert.deepEqual(P.degisimler, [3, 3, 3]); yakin(P.a, 3); assert.equal(P.yon, "aşağı");
  assert.deepEqual(R.degisimler, [-4, -4]); yakin(R.a, -4); assert.equal(R.yon, "yukarı");
});

test("6. soru: motosiklet +4 m/s², 50 m; otomobil −4 m/s², 90 m", () => {
  const m = duzgunDegisim(0, 20, 5), o = duzgunDegisim(28, 8, 5);
  yakin(m.a, 4); yakin(m.dx, 50); yakin(o.a, -4); yakin(o.dx, 90);
});

test("7. soru: ilk hız 40 m/s, yer değiştirme 160 m, en az 5 m/s² (8 s)", () => {
  const f = frenSenaryosu({ tepki: 1, a: 5, toplamSure: 5, carpmaHizi: 20 });
  yakin(f.v0, 40); yakin(f.dx, 160); yakin(f.aMin, 5); yakin(f.tMin, 8);
  yakin(sonHiz(40, -5, 4), 20); yakin(yamukAlan(40, 20, 4), 120);
});

test("alıştırma varyantları hesaplanabilir ve temiz", () => {
  yakin(yetisme({ mesafe: 60, vHizli: 18, vYavas: 6 }).t, 5);
  const [st, tr] = araliklar(24, [{ yon: -1, buyukluk: 3, sure: 2 }, { yon: +1, buyukluk: 2, sure: 5 }]);
  yakin(st.son, 18); yakin(tr.son, 28);
  const f = frenSenaryosu({ tepki: 1, a: 4, toplamSure: 5, carpmaHizi: 8 });
  yakin(f.v0, 24); yakin(f.dx, 88); yakin(f.aMin, 576 / 176);
  const m = duzgunDegisim(0, 24, 6), o = duzgunDegisim(30, 6, 6);
  yakin(m.dx, 72); yakin(o.dx, 108); yakin(o.a, -4);
});
