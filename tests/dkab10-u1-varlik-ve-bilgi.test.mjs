// DKAB 1. ünite: ayet künyeleri ve temsilî haber modeli
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SURELER, AYETLER, HADISLER, kunye, yalanUzlasmaOlasiligi, olasilikYaz, MUTEVATIR_ESIK } from "../dersler/10/din-kulturu/u1-varlik-ve-bilgi/veri.js";

const anaKod = readFileSync(new URL("../dersler/10/din-kulturu/u1-varlik-ve-bilgi/main.js", import.meta.url), "utf8");

test("sure tablosu: 114 sure içinde, ayet sayıları bilinen değerlerle aynı", () => {
  // Diyanet tertibindeki ayet sayıları (bağımsız olarak elle yazılmış denetim listesi)
  const BILINEN = { 2: 286, 3: 200, 6: 165, 16: 128, 17: 111, 21: 112, 25: 77, 31: 34, 33: 73, 35: 45, 36: 83, 39: 75, 42: 53, 49: 18, 51: 60, 55: 78, 67: 30, 96: 19, 112: 4 };
  for (const [no, [ad, sayi]] of Object.entries(SURELER)) {
    assert.ok(+no >= 1 && +no <= 114, `${ad}: sure numarası ${no}`);
    assert.equal(sayi, BILINEN[no], `${ad} ${no}: ayet sayısı`);
  }
});

test("her ayet künyesi geçerli: sure var, ayet aralığı sure içinde ve artan", () => {
  for (const [id, a] of Object.entries(AYETLER)) {
    assert.ok(SURELER[a.sure], `${id}: sure ${a.sure} tabloda yok`);
    const [bas, bit = bas] = a.ayet.split("-").map(Number);
    assert.ok(Number.isInteger(bas) && Number.isInteger(bit), `${id}: ayet "${a.ayet}"`);
    assert.ok(bas >= 1 && bas <= bit && bit <= SURELER[a.sure][1], `${id}: ${a.ayet} > ${SURELER[a.sure][1]}`);
    assert.ok(a.anlam.length > 15 && a.anlam.length <= 200, `${id}: anlam kısa ve öz olmalı (${a.anlam.length})`);
  }
});

test("ünitenin iki ayeti doğru künyeyle", () => {
  assert.equal(kunye(AYETLER.isra36), "İsrâ 17/36");
  assert.equal(kunye(AYETLER.mulk23), "Mülk 67/23");
  assert.equal(kunye(AYETLER.alak), "Alak 96/1-5");
});

test("ders kodunda geçen her AYETLER anahtarı veri dosyasında var", () => {
  const kullanilan = new Set([...anaKod.matchAll(/AYETLER(?:\.(\w+)|\[\s*"(\w+)"\s*\])/g)].map((m) => m[1] || m[2]));
  for (const id of kullanilan) assert.ok(AYETLER[id], `main.js: AYETLER.${id} tanımsız`);
  // 6. adımdaki kaynak kartları (dizi içinde adla geçenler)
  for (const id of ["yasin82", "furkan2", "ihlas", "mulk3", "rahman29", "enbiya22", "bakara30", "isra70", "zariyat56", "enam59", "bakara3", "lokman34"]) {
    assert.ok(AYETLER[id], id);
    assert.ok(anaKod.includes(`"${id}"`), `${id} 6. adımda kullanılmıyor`);
  }
});

test("hadislerin kaynağı kitap ve bölüm adıyla verilmiş", () => {
  for (const [id, h] of Object.entries(HADISLER)) assert.match(h.kaynak, /^(Buhârî|Müslim|Ebû Dâvûd|Tirmizî|Nesâî|İbn Mâce), .+, \d+$/, id);
});

test("haber modeli: bağımsız tanıklarla olasılık azalır, tek kaynakta değişmez", () => {
  const p = 0.3;
  let once = 1;
  for (let n = 1; n <= 20; n++) {
    const o = yalanUzlasmaOlasiligi(n, p, true);
    assert.ok(o < once, `n=${n}`);
    once = o;
    assert.equal(yalanUzlasmaOlasiligi(n, p, false), p);
  }
  assert.ok(Math.abs(yalanUzlasmaOlasiligi(3, p, true) - 0.027) < 1e-12);
  // kaydırıcı (1–20) mütevatir eşiğine ulaşabilmeli, tek kaynakta asla ulaşamamalı
  const ilk = Array.from({ length: 20 }, (_, i) => i + 1).find((n) => yalanUzlasmaOlasiligi(n, p, true) < MUTEVATIR_ESIK);
  assert.equal(ilk, 8);
  assert.ok(yalanUzlasmaOlasiligi(20, p, false) > MUTEVATIR_ESIK);
});

test("olasılık okunur yazılıyor", () => {
  assert.equal(olasilikYaz(1), "kesine yakın");
  assert.equal(olasilikYaz(0.3), "%30");
  assert.match(olasilikYaz(0.3 ** 8), /^yaklaşık 1 \/ 15\.000$/);
});
