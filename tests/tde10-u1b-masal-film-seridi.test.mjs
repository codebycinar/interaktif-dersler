// node --test tests/tde10-u1b-masal-film-seridi.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { yazimDenetle, gecisVarMi, sozVarligiBul } from "../dersler/10/turk-dili-edebiyat/u1b-masal-film-seridi/yazim.js";
import { BOLUMLER, OLAYLAR } from "../dersler/10/turk-dili-edebiyat/u1b-masal-film-seridi/masal.js";

const kurallar = (m) => yazimDenetle(m).map((b) => b.kural);

test("doğru cümlelerde bulgu yok", () => {
  for (const c of [
    "Keloğlan, kavalını beline soktu.",
    "Günlerden bir gün tellallar köy köy dolaştı.",
    "“Nereye gidiyorsun?” diye sordu anası.",
    "Keloğlan'ın kavalı ezgiyle doldu!",
    "Gülsüm Sultan pencereye geldi; gözleri doldu.",
    "Kara Dağ'daki dev uyudu…",
    "Ya gelirse ne yapacağız?",
  ]) assert.deepEqual(kurallar(c), [], c);
});

test("masal metninin tüm cümleleri denetimden geçer", () => {
  for (const b of BOLUMLER) for (const c of b.cumleler) assert.deepEqual(kurallar(c), [], c);
});

test("büyük harf ve cümle sonu", () => {
  assert.ok(kurallar("keloğlan yola düştü.").includes("buyuk-bas"));
  assert.ok(kurallar("Keloğlan yola düştü").includes("son-nokta"));
  assert.ok(kurallar("Keloğlan yola düştü. sonra dinlendi.").includes("cumle-basi"));
});

test("boşluk kuralları", () => {
  assert.ok(kurallar("Dev uyudu , Keloğlan geçti.").includes("once-bosluk"));
  assert.ok(kurallar("Dev uyudu,Keloğlan geçti.").includes("sonra-bosluk"));
  assert.ok(kurallar("Dev  uyudu.").includes("cift-bosluk"));
  assert.ok(kurallar("Keloğlan ve ve anası geldi.").includes("tekrar"));
  assert.deepEqual(kurallar("Yavaş yavaş yürüdü."), [], "ikileme hata sayılmaz");
});

test("sık yanlışlar, özel adlar, kesme, soru eki", () => {
  assert.ok(kurallar("Keloğlan herkeze selam verdi.").includes("sik-yanlis"));
  assert.ok(kurallar("Birgün yola çıktı.").includes("sik-yanlis"));
  assert.ok(kurallar("Sonra keloğlan geldi.").includes("ozel-ad"));
  assert.ok(kurallar("Keloğlanın kavalı vardı.").includes("kesme"));
  assert.ok(kurallar("Kara Dağdaki dev uyudu.").includes("kesme"));
  assert.ok(!kurallar("Gülsüm Sultan güldü.").includes("kesme"));
  assert.ok(kurallar("Sultan kız konuşacakmı?").includes("soru-eki"));
  assert.ok(!kurallar("Sultan kız konuşacak mı?").includes("soru-eki"));
});

test("geçiş ifadeleri ve söz varlığı", () => {
  assert.ok(gecisVarMi("Derken dev uyandı."));
  assert.ok(gecisVarMi("“Günlerden bir gün…"));
  assert.ok(!gecisVarMi("Dev uyandı."));
  assert.deepEqual(sozVarligiBul("Bülbül dile gelmiş. Tatlı dil yılanı deliğinden çıkarır."), ["dile gelmek", "Tatlı dil yılanı deliğinden çıkarır."]);
});

test("olay listesi altı sahne", () => {
  assert.equal(OLAYLAR.length, 6);
  assert.equal(BOLUMLER.length, 6);
});
