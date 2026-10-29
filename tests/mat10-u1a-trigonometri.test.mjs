// node --test tests/mat10-u1a-trigonometri.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  dikUcgenOranlari, trigOranlar, birimCemberNoktasi, yonluAciAc, OZEL_DEGERLER, IFADE_DEGERI, derece,
} from "../dersler/10/matematik/ortak/geometri.js";
import { AILELER, aileUcgeni, kYapistir, MINARE, bakisAcisi, yukseklikHesapla } from "../dersler/10/matematik/u1a-trigonometri/model.js";

const yakin = (gercek, beklenen, tol = 1e-9, mesaj = "") =>
  assert.ok(Math.abs(gercek - beklenen) <= tol, `${mesaj} beklenen ${beklenen}, gelen ${gercek}`);

test("1. adım: aileler gerçekten dik üçgen ve kenarları tam sayı (Pisagor üçlüleri)", () => {
  for (const a of AILELER) {
    assert.equal(a.komsu ** 2 + a.karsi ** 2, a.hip ** 2, a.ad);
    assert.ok(a.kMin < a.kMax);
    // en az üç farklı boyut seçilebilmeli (görev bunu istiyor)
    const sayi = Math.round((a.kMax - a.kMin) / a.kAdim) + 1;
    assert.ok(sayi >= 3, `${a.ad}: ${sayi} boyut`);
  }
});

test("1. adım: benzer üçgenlerde dört oran boyuttan bağımsızdır", () => {
  for (const a of AILELER) {
    const ilk = aileUcgeni(a, a.kMin);
    for (let k = a.kMin; k <= a.kMax + 1e-9; k += a.kAdim) {
      const u = aileUcgeni(a, kYapistir(a, k));
      for (const o of ["sin", "cos", "tan", "cot"]) yakin(u[o], ilk[o], 1e-12, `${a.ad} k=${k} ${o}`);
      yakin(u.hip, a.hip * kYapistir(a, k), 1e-9);
    }
    yakin(ilk.sin, a.karsi / a.hip, 1e-12);
  }
});

test("1. adım: k yapıştırma adımın katına ve sınırlar içine getirir", () => {
  const a = AILELER[0];
  assert.equal(kYapistir(a, 1.1), 1);
  assert.equal(kYapistir(a, 1.2), 1.25);
  assert.equal(kYapistir(a, 0), a.kMin);
  assert.equal(kYapistir(a, 99), a.kMax);
});

test("2. adım hedefleri: ızgarada tan = 1, sin = 0,6, cot = 2 kurulabilir", () => {
  // B ızgarası: x ∈ [1; 9,5], y ∈ [0,5; 7,5], 0,5 adım
  const bul = (kosul) => {
    for (let x = 1; x <= 9.5; x += 0.5) for (let y = 0.5; y <= 7.5; y += 0.5) if (kosul(dikUcgenOranlari(y, x))) return [x, y];
    return null;
  };
  assert.ok(bul((o) => Math.abs(o.tan - 1) < 1e-9));
  assert.ok(bul((o) => Math.abs(o.sin - 0.6) < 1e-9));
  assert.ok(bul((o) => Math.abs(o.cot - 2) < 1e-9));
  // başlangıç üçgeni (6; 2,5) hiçbir hedefi kendiliğinden sağlamaz
  const b = dikUcgenOranlari(2.5, 6);
  assert.ok(Math.abs(b.tan - 1) > 0.1 && Math.abs(b.sin - 0.6) > 0.1 && Math.abs(b.cot - 2) > 0.1);
});

test("3. adım: sin²+cos² = 1, tan = sin/cos, tan·cot = 1; sin+cos ≠ 1", () => {
  for (let a = 5; a <= 85; a++) {
    const t = trigOranlar(a);
    yakin(t.sin ** 2 + t.cos ** 2, 1, 1e-12, `${a}°`);
    yakin(t.tan, t.sin / t.cos, 1e-12);
    yakin(t.tan * t.cot, 1, 1e-12);
    assert.ok(t.sin + t.cos > 1, `${a}°: sin+cos > 1 (üçgen eşitsizliği)`);
  }
  yakin(trigOranlar(45).sin + trigOranlar(45).cos, Math.SQRT2, 1e-12);
});

test("4. adım: 30°, 45°, 60° tam değerleri", () => {
  for (const f of ["sin", "cos", "tan", "cot"]) {
    for (const a of [30, 45, 60]) yakin(IFADE_DEGERI[OZEL_DEGERLER[f][a]], trigOranlar(a)[f], 1e-12, `${f} ${a}°`);
  }
  // eşkenar üçgenin yarısı: kenar 2, yükseklik √3
  const o = dikUcgenOranlari(1, Math.sqrt(3));
  yakin(o.hip, 2, 1e-12);
  yakin(derece(Math.asin(o.sin)), 30, 1e-9);
  // tümler açılar
  yakin(trigOranlar(30).sin, trigOranlar(60).cos, 1e-12);
});

test("5. adım önermeleri: doğrular her dar açıda doğru, yanlışların karşı örneği var", () => {
  for (let a = 1; a < 90; a += 0.5) {
    const t = trigOranlar(a), b = trigOranlar(90 - a);
    yakin(t.sin, b.cos, 1e-12, `sin α = cos(90°−α), α=${a}`);
    assert.ok(t.sin > 0 && t.sin < 1);
    if (a > 1) assert.ok(t.cos < trigOranlar(a - 0.5).cos, "cos azalandır");
  }
  assert.ok(Math.abs(trigOranlar(45).sin + trigOranlar(45).cos - 1) > 0.4);
});

test("6. adım: birim çember noktaları ve yönlü açı", () => {
  const p120 = birimCemberNoktasi(120);
  yakin(p120.x, -0.5, 1e-12); yakin(p120.y, Math.sqrt(3) / 2, 1e-12);
  const p150 = birimCemberNoktasi(150);
  yakin(p150.y, trigOranlar(30).sin, 1e-12, "sin 150° = sin 30°");
  yakin(p150.x, -trigOranlar(30).cos, 1e-12, "cos 150° = −cos 30°");
  const p = birimCemberNoktasi(-90);
  yakin(p.x, 0, 1e-12); yakin(p.y, -1, 1e-12);
  assert.equal(trigOranlar(-90).tan, Infinity, "tan(−90°) tanımsız");
  assert.equal(trigOranlar(90).cot, 0);
  // sürüklemede açı sıçramaz: 359° → ham 1° ise 361 değil, 360'ı aşınca sarılır
  assert.equal(yonluAciAc(-170, 175), 190);
  assert.equal(yonluAciAc(170, -175), -190);
  assert.equal(yonluAciAc(-80, -10), -80);
  assert.equal(yonluAciAc(10, 355), 10);
});

test("7. adım: minare — her uzaklıktan aynı yükseklik bulunur", () => {
  for (let d = 10; d <= 60; d++) {
    const a = bakisAcisi(MINARE.h, d);
    yakin(yukseklikHesapla(d, a), MINARE.h, 1e-9, `d=${d}`);
    // ekranda gösterilen açı 0,1°'ye yuvarlanır; öğrencinin hesabı yine ±0,6 m içinde kalır
    const yuvarlak = Math.round(a * 10) / 10;
    const tanUc = Math.round(Math.tan(yuvarlak * Math.PI / 180) * 1000) / 1000;
    assert.ok(Math.abs(d * tanUc + MINARE.goz - MINARE.h) <= 0.6, `d=${d}: ${d * tanUc + MINARE.goz}`);
  }
  // göz yüksekliğini unutan cevap doğru cevaptan ayırt edilebilir (geri bildirim toleransından büyük fark)
  assert.ok(MINARE.goz > 0.6);
});

test("8. adım sınav cevapları", () => {
  yakin(dikUcgenOranlari(3, 4).sin, 0.6);
  yakin(Math.sqrt(1 - 0.8 ** 2), 0.6, 1e-12);
  yakin(trigOranlar(30).sin + trigOranlar(60).cos, 1, 1e-12);
  yakin(10 * trigOranlar(60).cos, 5, 1e-12);
  yakin(trigOranlar(50).sin, trigOranlar(40).cos, 1e-12);
});
