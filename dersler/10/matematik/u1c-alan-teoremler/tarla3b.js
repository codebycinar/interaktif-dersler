// 5. adım: Tarla sınırını düzelt — iki komşu tarla 3B sahnede; N kazığı alt kenarda sürüklenir.
// Tarlanın kuşbakışı planı yüzen panelde. 1 birim = 10 m (tarla 120 m × 80 m).
import { el, sayi } from "../../../../engine/ders.js";
import { sekilCiz, RENK } from "../ortak/tahta.js";
import { hud, gorevListesi, kisa } from "../ortak/yardim.js";
import { fark, topla, birimVektor } from "../ortak/geometri.js";
import { dunyaAc, yuzenPanel, dokuluMalzeme, agac, ev, serit, cubuk, halka, dokunmaAlani, THREE, malzeme, rastgele } from "../ortak/dunya3b.js";
import { IZGARA, yapistir, sinirla, TARLA, solParselKirik, solParselDuz, paralelN } from "./model.js";
import { gecis, durdurHepsi } from "../ortak/anlat.js";

const { A, M, B, gen, yuk, metre } = TARLA;
/** Harita (x, y) → sahne: tarla ortası başlangıçta, kuzey (y artışı) −z yönünde */
const W = (p, y = 0) => new THREE.Vector3((p.x - gen / 2) * metre, y, -(p.y - yuk / 2) * metre);
const yerde = (p) => { const v = W(p); return { x: v.x, z: v.z }; };
/** Haritadaki çokgen → yere yatırılmış şekil */
function parsel(liste, malz, y) {
  const sh = new THREE.Shape(liste.map((p) => new THREE.Vector2((p.x - gen / 2) * metre, (p.y - yuk / 2) * metre)));
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), malz);
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  m.receiveShadow = true;
  return m;
}
const yariSaydam = (renk) => {
  const m = malzeme.isik(renk, 0.6);
  m.transparent = true; m.opacity = 0.42; m.depthWrite = false;
  return m;
};
function acKapa(btn, acik) { btn.setAttribute("aria-pressed", String(acik)); }

function koyKur(S) {
  const { scene } = S;
  const r = rastgele(5);
  const cim = dokuluMalzeme({ taban: "#6a8a45", koyu: "#4e6d33", acik: "#8da85c", olcek: 12, benek: 0.35, tekrar: [40, 40] });
  const zemin = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), cim);
  zemin.rotation.x = -Math.PI / 2; zemin.receiveShadow = true;
  scene.add(zemin);
  // iki parsel: buğday ve yonca
  const bugday = dokuluMalzeme({ taban: "#c9a54a", koyu: "#a7832f", acik: "#e3c46e", olcek: 10, benek: 0.2, lif: 0.7, lifSiklik: 40, tekrar: [0.06, 0.06], tohum: 4 });
  const yonca = dokuluMalzeme({ taban: "#5f8f3c", koyu: "#46702a", acik: "#7da956", olcek: 10, benek: 0.25, lif: 0.6, lifSiklik: 40, tekrar: [0.06, 0.06], tohum: 6 });
  scene.add(parsel([{ x: 0, y: 0 }, B, M, A, { x: 0, y: yuk }], bugday, 0.05));
  scene.add(parsel([B, { x: gen, y: 0 }, { x: gen, y: yuk }, A, M], yonca, 0.05));
  // tarlanın çevresinde toprak yol
  const toprak = { renk: 0xa48660, genislik: 4, y: 0.04, isikli: false };
  const k = [{ x: -0.2, y: -0.2 }, { x: gen + 0.2, y: -0.2 }, { x: gen + 0.2, y: yuk + 0.2 }, { x: -0.2, y: yuk + 0.2 }];
  k.forEach((p, i) => scene.add(serit(yerde(p), yerde(k[(i + 1) % 4]), toprak)));
  // eski, kırık sınır: sürülmemiş toprak sırtı
  for (const [p, q] of [[A, M], [M, B]]) scene.add(serit(yerde(p), yerde(q), { renk: 0x7a5a3a, genislik: 1.4, y: 0.09, isikli: false }));
  // çevre: çiftlik evi, ağaçlar, traktör
  const e = ev({ gen: 10, der: 8, yuk: 6, duvar: 0xeee3cf });
  e.position.set(-92, 0, -20); e.rotation.y = Math.PI / 2;
  scene.add(e);
  const ahir = ev({ gen: 14, der: 9, yuk: 5, duvar: 0xb5653f, cati: 0x6d6a66 });
  ahir.position.set(-92, 0, 14); ahir.rotation.y = Math.PI / 2;
  scene.add(ahir);
  for (let i = 0; i < 26; i++) {
    const t = agac(r, 6 + r() * 4);
    const kenar = i % 2 ? -1 : 1;
    t.position.set(-70 + i * 6 + r() * 3, 0, kenar > 0 ? -50 - r() * 8 : -58 - r() * 30);
    scene.add(t);
  }
  for (let i = 0; i < 10; i++) {
    const t = agac(r, 6 + r() * 3);
    t.position.set(72 + r() * 10, 0, -40 + i * 9);
    scene.add(t);
  }
  const traktor = new THREE.Group();
  const kirmizi = malzeme.plastik(0xb8322a, { puruz: 0.4 });
  const govde = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 1.6), kirmizi);
  govde.position.set(0.3, 1.4, 0);
  const kabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), malzeme.cam({ renk: 0xbfd6e6 }));
  kabin.position.set(-0.7, 2.8, 0);
  traktor.add(govde, kabin);
  const lastik = malzeme.mat(0x1d1d1d, { puruz: 0.9 });
  for (const [x, rr, z] of [[-1, 1, 1], [-1, 1, -1], [1.4, 0.6, 0.9], [1.4, 0.6, -0.9]]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, 0.5, 18), lastik);
    t.rotation.x = Math.PI / 2; t.position.set(x, rr, z);
    traktor.add(t);
  }
  traktor.traverse((o) => { o.castShadow = true; });
  traktor.position.set(-68, 0, 46); traktor.rotation.y = 0.3;
  scene.add(traktor);

  // sınır taşları
  const tas = dokuluMalzeme({ taban: "#d8d2c6", koyu: "#ada597", acik: "#eeeae2", olcek: 5, benek: 0.15 });
  for (const [P, ad] of [[A, "A"], [M, "M"], [B, "B"]]) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.6), tas);
    t.position.copy(W(P, 0.5)); t.castShadow = true;
    scene.add(t);
    S.igne(W(P, 1.3), ad, { renk: "#e0a96a", yon: "ust" });
  }
}

export const tarlaAdimi = {
  baslik: "Tarla sınırını düzelt",
  cikti: "MAT.10.1.3-d",
  anlatim: `
    <p>İki komşu tarlanın arasındaki sınır <b>A – M – B</b> diye kırılıyor; traktör sürmek zor. Komşular sınırı A'dan alt kenardaki bir <b>N</b> noktasına giden <b>düz</b> bir çizgiyle değiştirmek istiyor; ama kimsenin toprağı azalmamalı.</p>
    <p>Tarla 120 m × 80 m. <b>N kazığını</b> alt kenar boyunca sürükle. Önce AB'yi çiz; sonra M'den AB'ye bir <b>paralel</b> çizmenin neden işe yaradığını düşün.</p>`,
  gorev: "AB'yi ve M'den geçen paraleli çiz, N'yi doğru yere taşı ve soruyu yanıtla.",
  ogretmen: "Programda alan önermelerinin gerçek yaşam problemleri bağlamında değerlendirilmesi bekleniyor. ABM ve ABN üçgenleri AB tabanını paylaşır ve tepe noktaları AB'ye paralel bir doğru üzerindedir; alanları eşit olduğundan parsel alanları değişmez. Sınıfta kâğıt üzerinde cetvel ve gönye ile aynı inşayı yaptırın.",
  anlat: [
    { s: "İki komşu tarlanın arasındaki sınır kırık bir çizgi: <b>A – M – B</b>. Traktörle sürmek zor.", yap: (api) => api.n(2, 0.01) },
    { s: "Yeni sınır A'dan alt kenardaki bir <b>N</b> kazığına düz gidecek. Ama iki parselin alanı değişmemeli." },
    { s: "N kazığını biraz sağa taşıyalım ve üstteki göstergeleri izleyelim. İzle…", yap: (api) => api.n(5) },
    { soru: "N kayınca 1. parselin alanı değişiyor mu?", secenekler: ["Evet, değişiyor", "Hayır, hiç değişmiyor"], dogru: 0,
      aciklama: "N'nin yeri alanı değiştiriyor. Tahminle aramak yerine bir yöntem bulalım.", ipucu: "Göstergedeki “Fark” değerine bak." },
    { s: "Önceki adımda gördüğümüz fikri hatırla: <b>paralel doğrular arasında ortak taban</b>." },
    { soru: "Ortak tabanlı iki üçgenin alanları ne zaman eşittir?", secenekler: ["Tepe noktaları tabana paralel bir doğru üzerindeyse", "Tepe noktaları aynı kenardaysa", "Hiçbir zaman"], dogru: 0,
      aciklama: "Tepeler tabana paralel bir doğru üzerindeyse yükseklikler eşit olur, alanlar da.", ipucu: "Alan = ½ · taban · yükseklik." },
    { s: "Burada ortak taban <b>AB</b> olabilir: 1. parsel ABM üçgenini verip aynı alanlı bir ABN üçgeni almalı." },
    { s: "Bunun için N, M ile birlikte <b>AB'ye paralel</b> aynı doğru üzerinde olmalı." },
    { s: "Şimdi sen: AB'yi çiz, M'den AB'ye paralel çiz ve N kazığını doğru yere taşı." },
  ],
  anlatBitti: (api) => api.sifirla(),
  kur(ctx) {
    const D = dunyaAc(ctx, { kameraKonum: [0, 100, 165], hedef: [0, 0, 8], arkaPlan: [0x8bb8de, 0xe4ecf2], sis: [260, 700] });
    const { S } = D;
    if (D.kap.clientWidth < 600) S.kameraKoy({ konum: [0, 150, 170], hedef: [0, 0, -28] });
    koyKur(S);
    const h = hud(ctx, [{ ad: "eski", etiket: "1. parsel (eski sınır)" }, { ad: "yeni", etiket: "1. parsel (A–N sınırı)" }, { ad: "fark", etiket: "Fark" }]);
    const N = { x: 2, y: 0 };
    let ab = false, par = false;
    const eski = solParselKirik();

    // N kazığı (kırmızı bayraklı), A'ya gerilen ip
    const kazik = new THREE.Group();
    const sirik = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.2, 8), malzeme.mat(0x8a6440));
    sirik.position.y = 1.1;
    const bayrak = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.6), malzeme.plastik(0xd8342c));
    bayrak.material.side = THREE.DoubleSide;
    bayrak.position.set(0.5, 1.9, 0);
    kazik.add(sirik, bayrak, halka(2.2, 0x5ad38b), dokunmaAlani(3, 3));
    kazik.traverse((o) => { o.castShadow = true; });
    S.scene.add(kazik);
    const ip = cubuk([0, 0.4, 0], [1, 0.4, 0], { renk: 0xf5f1e6, kalinlik: 0.12 });
    S.scene.add(ip);
    const nUc = new THREE.Object3D();
    nUc.position.y = 2.6;
    kazik.add(nUc);
    S.igne(nUc, "N", { renk: "#5ad38b", yon: "ust" });
    // inşa çizgileri ve eşit alanlı üçgenler
    const abCizgi = serit(yerde(A), yerde(B), { renk: 0xb89cff, genislik: 0.7, y: 0.2 });
    const t0 = -M.y / (B.y - A.y), t1 = (yuk - M.y) / (B.y - A.y), d = fark(B, A);
    const parCizgi = serit(yerde(topla(M, { x: d.x * t0, y: d.y * t0 })), yerde(topla(M, { x: d.x * t1, y: d.y * t1 })), { renk: 0xff8fc7, genislik: 0.6, y: 0.22 });
    const abm = parsel([A, B, M], yariSaydam(0xb89cff), 0.14);
    let abn = parsel([A, B, N], yariSaydam(0xff8fc7), 0.16);
    S.scene.add(abCizgi, parCizgi, abm, abn);

    // yüzen panel: kuşbakışı plan
    const panel = yuzenPanel(ctx, "Tarlanın planı (1 kare = 10 m)", { konum: "sag-ust" });
    const plan = sekilCiz(panel, { alan: { xmin: -0.6, xmax: 12.6, ymin: -1, ymax: 8.6 }, izgara: 1 }, (c) => {
      c.cokgen([{ x: 0, y: 0 }, B, M, A, { x: 0, y: yuk }], { dolgu: "rgba(214,178,94,.3)", renk: null });
      c.cokgen([B, { x: gen, y: 0 }, { x: gen, y: yuk }, A, M], { dolgu: "rgba(90,180,100,.28)", renk: null });
      c.cokgen([{ x: 0, y: 0 }, { x: gen, y: 0 }, { x: gen, y: yuk }, { x: 0, y: yuk }], { renk: "#cfd8e6", kalinlik: 2 });
      c.yol([A, M, B], { renk: "#c9894a", kalinlik: 3.5 });
      if (ab) c.parca(A, B, { renk: RENK.mor, kalinlik: 1.8, kesikli: "6 4" });
      if (par) c.dogru(M, topla(M, d), { renk: RENK.pembe, kalinlik: 1.6, kesikli: "4 3" });
      c.parca(A, N, { renk: RENK.kenar, kalinlik: 2.2, kesikli: "8 5" });
      for (const [P, ad] of [[A, "A"], [M, "M"], [B, "B"]]) { c.nokta(P, { renk: "#c9894a", r: 3.5 }); c.yazi(P, ad, { dx: 9, dy: -7, renk: "#e0a96a", kalin: true, boyut: 12 }); }
      c.nokta(N, { renk: RENK.yesil, r: 4.5 });
      c.yazi(N, "N", { dy: 13, renk: RENK.yesil, kalin: true, boyut: 12 });
    });

    D.tutamak("N", {
      alan: kazik,
      kisit: (q) => ({ x: sinirla(yapistir(q.x / metre + gen / 2), 0, gen), z: 0 }),
      degisti: (q) => { if (q.x !== N.x) { N.x = q.x; guncelle(); } },
    });

    const [abBtn, pBtn] = ctx.dugmeler([
      { metin: "AB'yi çiz", tik: () => { ab = !ab; acKapa(abBtn, ab); if (ab) liste.isaretle(0); guncelle(); } },
      { metin: "M'den AB'ye paralel", tik: () => { par = !par; acKapa(pBtn, par); if (par) liste.isaretle(1); guncelle(); } },
    ]);
    acKapa(abBtn, false); acKapa(pBtn, false);
    const kay = ctx.kaydirici({ etiket: "N'nin sol köşeye uzaklığı", min: 0, max: gen * metre, adim: IZGARA * metre, deger: N.x * metre, birim: "m", degisti: (v) => { N.x = v / metre; guncelle(); } });
    const liste = gorevListesi(ctx, ["AB'yi çiz", "M'den AB'ye paralel çiz", "N'yi alanlar eşit olacak yere taşı (fark &lt; %0,5)", "Soruyu yanıtla"]);
    const sonuc = ctx.not("");
    const soruKap = el("div");
    ctx.kontroller.append(soruKap);
    let acildi = false;
    function guncelle() {
      kazik.position.copy(W(N));
      ip.userData.ayarla([W(N).x, 0.5, W(N).z], [W(A).x, 0.5, W(A).z]);
      kay.deger = N.x * metre;
      abCizgi.visible = ab; parCizgi.visible = par; abm.visible = abn.visible = ab && par;
      abn.geometry.dispose();
      abn.geometry = new THREE.ShapeGeometry(new THREE.Shape([A, B, N].map((p) => new THREE.Vector2((p.x - gen / 2) * metre, (p.y - yuk / 2) * metre))));
      plan.yenile();
      const yeni = solParselDuz(N.x), fk = Math.abs(yeni - eski) / eski;
      h.ayarla("eski", `${sayi(eski * metre * metre, 0)} m²`);
      h.ayarla("yeni", `${sayi(yeni * metre * metre, 0)} m²`);
      h.ayarla("fark", `%${kisa(fk * 100, 1)}`);
      if (fk < TARLA.tolerans) liste.isaretle(2);
      if (acildi || !liste.tamamMi(2)) return;
      acildi = true;
      const dogruN = paralelN();
      sonuc.innerHTML = `<p class="d-geri-bildirim dogru">Parseller korundu! N, M'den AB'ye çizilen paralelin alt kenarı kestiği nokta: N = (${kisa(dogruN.x)}; 0).</p>
        <p><b>Neden?</b> ABM ve ABN üçgenlerinin tabanı AB ortak, M ve N de AB'ye paralel aynı doğru üzerinde. Yükseklikleri eşit → alanları eşit. 1. parsel ABM'yi kaybedip ABN'yi kazanıyor.</p>`;
      soruKap.append(ctx.sayiSorusu({
        etiket: "Yeni sınır için N noktası <b>B'den kaç metre</b> uzakta olmalı?",
        birim: "m",
        kontrol: (v) => {
          if (Math.abs(v - 35) < 0.5) { liste.isaretle(3); ctx.gorevTamam(); return true; }
          if (Math.abs(v - 3.5) < 0.05) return "Birim kareleri metreye çevir: 1 kare = 10 m.";
          if (Math.abs(v - 75) < 0.5) return "Bu, N'nin sol köşeye uzaklığı. B'den uzaklığı soruluyor.";
          return "B'nin sol köşeye uzaklığı 40 m; N'ninkiyle karşılaştır.";
        },
        dogruMesaj: "Doğru! N sol köşeden 75 m, B 40 m uzakta: 75 − 40 = 35 m.",
      }).el);
    }
    guncelle();
    return {
      // anlatım: N kazığını kaydırır (sol köşeden birim cinsinden, 1 birim = 10 m)
      n(x, sure = 1.4) { const x0 = N.x; return gecis(N, sure, (k) => { N.x = yapistir(x0 + (x - x0) * k); guncelle(); }); },
      sifirla() { durdurHepsi(); N.x = 2; guncelle(); },
    };
  },
};
