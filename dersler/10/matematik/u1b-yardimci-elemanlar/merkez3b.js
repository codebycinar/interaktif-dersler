// 7. adım: Hangi merkez? — üç gerçek yaşam problemi 3B sahnede (köyler ve su deposu, park ve çeşme, dengede levha).
// Problemin harita/çizim karşılığı yüzen panelde. Köşeler sabittir; öğrenci doğru merkezi seçip P'yi sahnede sürükler.
import { el } from "../../../../engine/ders.js";
import { sekilCiz, RENK } from "../ortak/tahta.js";
import { formulListesi, kisa } from "../ortak/yardim.js";
import { uzaklik, ortaNokta, topla, fark, dik, birimVektor, dikmeAyagi, dogruyaUzaklik, icAciortayAyagi, agirlikMerkezi } from "../ortak/geometri.js";
import { gecis, durdurHepsi } from "../ortak/anlat.js";
import { dunyaAc, yuzenPanel, dokuluMalzeme, agac, ev, insan, serit, halka, dokunmaAlani, THREE, malzeme, organiklestir, rastgele } from "../ortak/dunya3b.js";
import { MERKEZLER, SENARYOLAR, senaryoHedefi, HEDEF_TOLERANS } from "./model.js";

const RNK = ["#d8b46a", "#7fb0d8", "#c98fd8"];
/** Her problemin dünyadaki yeri, ölçeği (1 harita birimi kaç sahne birimi) ve kamerası */
const YER = {
  depo: { O: [0, 0], K: 25, kamera: [16, 350, 284], hedef: [16, 0, -6], darKamera: [6, 700, 260], darHedef: [6, 0, -95] },
  cesme: { O: [1000, 0], K: 6, kamera: [997, 58, 70], hedef: [997, 0, -1], darKamera: [997, 105, 60], darHedef: [997, 0, -14] },
  levha: { O: [-1000, 0], K: 0.4, kamera: [-999.6, 4.8, 7.4], hedef: [-999.8, 0.9, 0], darKamera: [-999.6, 10, 8], darHedef: [-999.8, 0.4, -1.2] },
};
const dunyada = (yer, p, y = 0) => new THREE.Vector3(yer.O[0] + p.x * yer.K, y, yer.O[1] - p.y * yer.K);
const haritada = (yer, x, z) => ({ x: (x - yer.O[0]) / yer.K, y: -(z - yer.O[1]) / yer.K });

/** Haritadaki üçgen (x, y) düzleminde → yatay şekil */
function ucgenSekli(yer, koseler) {
  const sh = new THREE.Shape(koseler.map((k) => new THREE.Vector2(k.x * yer.K, k.y * yer.K)));
  return sh;
}
const zeminBoya = (o) => { o.rotation.x = -Math.PI / 2; return o; };

/* ---------------- Sahneler ---------------- */
function koylerKur(S, yer, s) {
  const r = rastgele(11), g = new THREE.Group();
  g.position.set(yer.O[0], 0, yer.O[1]);
  const cim = dokuluMalzeme({ taban: "#6a8a45", koyu: "#4e6d33", acik: "#8da85c", olcek: 12, benek: 0.35, tekrar: [30, 30] });
  const zemin = zeminBoya(new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), cim));
  zemin.receiveShadow = true;
  g.add(zemin);
  // ekin tarlaları (yamalar)
  const tarla = [0x9a8f4a, 0x7e8f3e, 0xa88d56, 0x6f8a3a];
  for (let i = 0; i < 26; i++) {
    const m = zeminBoya(new THREE.Mesh(new THREE.PlaneGeometry(30 + r() * 40, 20 + r() * 30), malzeme.mat(tarla[i % 4], { puruz: 0.95 })));
    m.position.set((r() - 0.5) * 420, 0.02 + i * 0.02, (r() - 0.5) * 320); // üst üste binen yamalar titreşmesin
    m.rotation.z = r() * Math.PI;
    g.add(m);
  }
  // köyleri bağlayan toprak yollar
  const [A, B, C] = s.koseler.map((k) => ({ x: k.x * yer.K, z: -k.y * yer.K }));
  for (const [p, q] of [[A, B], [B, C], [C, A]]) g.add(serit(p, q, { renk: 0xb89a6a, genislik: 5, y: 0.7, isikli: false }));
  // köyler: ev kümeleri, ağaçlar, cami/okul gibi büyükçe bir yapı
  const duvar = [0xefe4d2, 0xe2d0b3, 0xf3ece0, 0xd8c3a2];
  for (const [i, K] of [A, B, C].entries()) {
    for (let j = 0; j < 13; j++) {
      const a = r() * Math.PI * 2, u = 7 + r() * 17;
      const e = ev({ gen: 6 + r() * 3, der: 5.5 + r() * 2, yuk: 3 + Math.round(r()) * 3, duvar: duvar[(i + j) % 4] });
      e.position.set(K.x + Math.cos(a) * u, 0, K.z + Math.sin(a) * u);
      e.rotation.y = r() * Math.PI;
      g.add(e);
    }
    for (let j = 0; j < 8; j++) {
      const a = r() * Math.PI * 2, u = 18 + r() * 14;
      const t = agac(r, 6 + r() * 4);
      t.position.set(K.x + Math.cos(a) * u, 0, K.z + Math.sin(a) * u);
      g.add(t);
    }
  }
  // dağınık ağaçlar
  for (let i = 0; i < 40; i++) {
    const t = agac(r, 5 + r() * 4);
    t.position.set((r() - 0.5) * 520, 0, (r() - 0.5) * 420);
    if (Math.min(...[A, B, C].map((K) => Math.hypot(K.x - t.position.x, K.z - t.position.z))) < 34) continue;
    g.add(t);
  }
  S.scene.add(g);

  // su deposu (sürüklenen P)
  const depo = new THREE.Group();
  const celik = malzeme.metal(0xc9d1d8, { puruz: 0.35 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const ayak = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 18, 8), celik);
    ayak.position.set(Math.cos(a) * 3.6, 9, Math.sin(a) * 3.6);
    ayak.rotation.set(Math.sin(a) * 0.08, 0, -Math.cos(a) * 0.08);
    depo.add(ayak);
  }
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 7, 28), malzeme.plastik(0xe9eef2, { puruz: 0.4 }));
  tank.position.y = 21.5;
  const cati = new THREE.Mesh(new THREE.ConeGeometry(5.8, 2.6, 28), malzeme.metal(0x8fa2b3, { puruz: 0.45 }));
  cati.position.y = 26.3;
  const serit2 = new THREE.Mesh(new THREE.CylinderGeometry(5.56, 5.56, 1.2, 28, 1, true), malzeme.plastik(0x3c7fc0));
  serit2.position.y = 21.5;
  depo.add(tank, cati, serit2, halka(7, 0x5ad38b), dokunmaAlani(8, 28));
  depo.traverse((o) => { o.castShadow = true; });
  S.scene.add(depo);

  // P'den köylere boru hatları ve inşa çizgileri (kenar orta dikmeler)
  const borular = [0, 1, 2].map(() => { const b = serit({ x: 0, z: 0 }, { x: 1, z: 0 }, { renk: 0x5ad38b, genislik: 1.4, y: 0.9 }); S.scene.add(b); return b; });
  const insa = [A, B, C].map((p, i) => {
    const q = [A, B, C][(i + 1) % 3];
    const M = { x: (p.x + q.x) / 2, y: -(p.z + q.z) / 2 }, yon = birimVektor(dik(fark({ x: q.x, y: -q.z }, { x: p.x, y: -p.z })));
    const u1 = topla(M, { x: yon.x * 220, y: yon.y * 220 }), u2 = topla(M, { x: -yon.x * 220, y: -yon.y * 220 });
    const c = serit({ x: yer.O[0] + u1.x, z: yer.O[1] - u1.y }, { x: yer.O[0] + u2.x, z: yer.O[1] - u2.y }, { renk: 0xffe066, genislik: 1.6, y: 1 });
    S.scene.add(c);
    return c;
  });
  const igneler = s.koseler.map((k, i) => S.igne(dunyada(yer, k, 14), s.adlar[i], { renk: RNK[i], yon: k.y > 2 ? "sol" : "ust" }));
  return {
    nesne: depo, tutYuksekligi: 0, igneler, insa,
    yerlestir(P) {
      depo.position.copy(dunyada(yer, P));
      s.koseler.forEach((k, i) => borular[i].userData.ayarla({ x: depo.position.x, z: depo.position.z }, { x: yer.O[0] + k.x * yer.K, z: yer.O[1] - k.y * yer.K }));
    },
  };
}

function parkKur(S, yer, s) {
  const r = rastgele(23), g = new THREE.Group();
  g.position.set(yer.O[0], 0, yer.O[1]);
  const kaldirim = dokuluMalzeme({ taban: "#a9a49a", koyu: "#878177", acik: "#c4bfb4", olcek: 16, benek: 0.2, tekrar: [40, 40] });
  const zemin = zeminBoya(new THREE.Mesh(new THREE.PlaneGeometry(700, 700), kaldirim));
  zemin.receiveShadow = true;
  g.add(zemin);
  const [A, B, C] = s.koseler;
  // park: üçgen çim alan
  const cim = dokuluMalzeme({ taban: "#5f8f3f", koyu: "#46702d", acik: "#7fa957", olcek: 10, benek: 0.35, tekrar: [0.12, 0.12] });
  const park = zeminBoya(new THREE.Mesh(new THREE.ShapeGeometry(ucgenSekli(yer, s.koseler)), cim));
  park.position.y = 0.05; park.receiveShadow = true;
  g.add(park);
  // üç yol (uçlarından taşar), orta çizgiler
  const kenarlar = [[A, B], [B, C], [C, A]];
  for (const [p, q] of kenarlar) {
    const d = birimVektor(fark(q, p)), n = birimVektor(dik(fark(q, p)));
    // yol parkın dışında kalsın diye kenardan dışa doğru yarım genişlik kaydırılır
    const ic = agirlikMerkezi(A, B, C), disa = Math.sign((ic.x - p.x) * n.x + (ic.y - p.y) * n.y) * -1;
    const kay = { x: n.x * disa * 0.62, y: n.y * disa * 0.62 };
    const p2 = topla(topla(p, kay), { x: -d.x * 4, y: -d.y * 4 }), q2 = topla(topla(q, kay), { x: d.x * 4, y: d.y * 4 });
    const w = (P) => ({ x: P.x * yer.K, z: -P.y * yer.K });
    g.add(serit(w(p2), w(q2), { renk: 0x3d4148, genislik: 7, y: 0.07, isikli: false }));
    g.add(serit(w(p2), w(q2), { renk: 0xe8e2c8, genislik: 0.22, y: 0.09, isikli: false }));
  }
  // parktaki ağaçlar, banklar
  for (const [x, y] of [[-2.9, -1.5], [2.3, -1.9], [-2.4, 1.8], [0.8, -0.4], [-3.4, -0.6]]) {
    const t = agac(r, 5 + r() * 2);
    t.position.set(x * yer.K, 0, -y * yer.K);
    g.add(t);
  }
  for (const [x, y, a] of [[-1.5, -1.9, 0], [0.2, 0.9, 0.9]]) {
    const bank = new THREE.Mesh(new THREE.BoxGeometry(2, 0.45, 0.6), malzeme.mat(0x8a5a35));
    bank.position.set(x * yer.K, 0.45, -y * yer.K); bank.rotation.y = a; bank.castShadow = true;
    g.add(bank);
  }
  // çevredeki apartmanlar
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, u = 58 + r() * 14;
    const e = ev({ gen: 10 + r() * 6, der: 9, yuk: 9 + Math.round(r() * 3) * 3, duvar: [0xe8dcc8, 0xd6c9b5, 0xcfd6dc, 0xe9d5b8][i % 4], cati: 0x8b4a36 });
    e.position.set(Math.cos(a) * u, 0, Math.sin(a) * u * 0.8);
    e.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); // pencereli yüz parka baksın
    g.add(e);
  }
  S.scene.add(g);

  // çeşme (sürüklenen P)
  const tas = dokuluMalzeme({ taban: "#d2cbbd", koyu: "#a89f8e", acik: "#e8e3d8", olcek: 6, benek: 0.15, tekrar: [2, 1] });
  const cesme = new THREE.Group();
  const havuz = new THREE.Mesh(organiklestir(new THREE.CylinderGeometry(2.3, 2.5, 0.7, 20), { genlik: 0.03 }), tas);
  havuz.position.y = 0.35;
  const su = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 0.1, 20), malzeme.sivi(0x5fa8d8, { opaklik: 0.8 }));
  su.position.y = 0.62;
  const sutun = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.8, 10), tas);
  sutun.position.y = 1.2;
  const tas2 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.4, 0.35, 16), tas);
  tas2.position.y = 2.2;
  cesme.add(havuz, su, sutun, tas2, halka(3.2, 0x5ad38b), dokunmaAlani(3.4, 3));
  cesme.traverse((o) => { o.castShadow = true; });
  S.scene.add(cesme);
  const dikmeler = [0, 1, 2].map(() => { const b = serit({ x: 0, z: 0 }, { x: 1, z: 0 }, { renk: 0x5ad38b, genislik: 0.45, y: 0.2 }); S.scene.add(b); return b; });
  const k = [A, B, C];
  const insa = k.map((V, i) => {
    const F = icAciortayAyagi(V, k[(i + 1) % 3], k[(i + 2) % 3]), w = (P) => ({ x: yer.O[0] + P.x * yer.K, z: yer.O[1] - P.y * yer.K });
    const c = serit(w(V), w(F), { renk: 0xffe066, genislik: 0.5, y: 0.22 });
    S.scene.add(c);
    return c;
  });
  const igneler = kenarlar.map(([p, q], i) => S.igne(dunyada(yer, ortaNokta(p, q), 0.5), `${i + 1}. yol`, { renk: "#9fb0c4", yon: "alt" }));
  return {
    nesne: cesme, tutYuksekligi: 0, igneler, insa,
    yerlestir(P) {
      cesme.position.copy(dunyada(yer, P));
      kenarlar.forEach(([p, q], i) => {
        const F = dikmeAyagi(P, p, q);
        dikmeler[i].userData.ayarla({ x: cesme.position.x, z: cesme.position.z }, { x: yer.O[0] + F.x * yer.K, z: yer.O[1] - F.y * yer.K });
      });
    },
  };
}

function atolyeKur(S, yer, s) {
  const g = new THREE.Group();
  g.position.set(yer.O[0], 0, yer.O[1]);
  const beton = dokuluMalzeme({ taban: "#9c9890", koyu: "#7d7971", acik: "#b5b1a9", olcek: 14, benek: 0.25, tekrar: [10, 10] });
  const zemin = zeminBoya(new THREE.Mesh(new THREE.PlaneGeometry(40, 40), beton));
  zemin.receiveShadow = true;
  g.add(zemin);
  const duvar = new THREE.Mesh(new THREE.BoxGeometry(40, 8, 0.3), malzeme.mat(0xd9d3c7));
  duvar.position.set(0, 4, -4); duvar.receiveShadow = true;
  g.add(duvar);
  // tezgâh ve heykeltıraş
  const tezgah = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.8), malzeme.mat(0x8a5a35, { puruz: 0.7 }));
  tezgah.position.set(2.8, 0.45, -2.6); tezgah.castShadow = tezgah.receiveShadow = true;
  const kisi = insan({ giysi: 0x4a6a8a });
  kisi.position.set(2.6, 0, -1.4); kisi.rotation.y = Math.PI * 0.8;
  g.add(tezgah, kisi);
  S.scene.add(g);

  // levha: direğin ucunda; P ağırlık merkezinden uzaksa ağırlık merkezi tarafına eğilir
  const DIREK = 1.25, KALIN = 0.025;
  const direk = new THREE.Group();
  const cubuk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03, DIREK, 10), malzeme.metal(0x5d636b, { puruz: 0.4 }));
  cubuk.position.y = DIREK / 2;
  const taban = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.05, 20), malzeme.metal(0x3d4249, { puruz: 0.5 }));
  taban.position.y = 0.025;
  direk.add(cubuk, taban, halka(0.3, 0x5ad38b), dokunmaAlani(0.3, DIREK + 0.1));
  direk.traverse((o) => { o.castShadow = true; });
  S.scene.add(direk);

  const egik = new THREE.Group();
  const levhaIc = new THREE.Group();
  const levha = (new THREE.Mesh(new THREE.ExtrudeGeometry(ucgenSekli(yer, s.koseler), { depth: KALIN, bevelEnabled: false }), malzeme.metal(0xaab3bd, { puruz: 0.32 })));
  levha.rotation.x = -Math.PI / 2;
  levha.castShadow = levha.receiveShadow = true;
  levhaIc.add(levha);
  const [A, B, C] = s.koseler, k = [A, B, C];
  const yerel = (P) => ({ x: P.x * yer.K, z: -P.y * yer.K });
  const insa = k.map((V, i) => {
    const c = serit(yerel(V), yerel(ortaNokta(k[(i + 1) % 3], k[(i + 2) % 3])), { renk: 0xffe066, genislik: 0.025, y: KALIN + 0.002 });
    levhaIc.add(c);
    return c;
  });
  egik.add(levhaIc);
  S.scene.add(egik);
  let aci = 0, hedefAci = 0, eksen = new THREE.Vector3(1, 0, 0);
  S.herKare((dt) => {
    aci += (hedefAci - aci) * Math.min(1, dt * 6);
    egik.quaternion.setFromAxisAngle(eksen, aci);
  });
  const G = agirlikMerkezi(A, B, C);
  return {
    nesne: direk, tutYuksekligi: 0, igneler: [], insa,
    yerlestir(P) {
      const w = dunyada(yer, P);
      direk.position.copy(w);
      egik.position.set(w.x, DIREK, w.z);
      levhaIc.position.set(yer.O[0] - w.x, 0, yer.O[1] - w.z);
      // ağırlık merkezi P'den uzaklaştıkça levha o yöne daha çok eğilir (en çok ≈ 20°)
      const yon = fark(G, P), d = Math.hypot(yon.x, yon.y);
      if (d < HEDEF_TOLERANS * 0.5) { hedefAci = 0; return; }
      const dx = yon.x / d, dz = -yon.y / d;
      eksen = new THREE.Vector3(dz, 0, -dx);
      hedefAci = Math.min(0.35, 0.12 + d * 0.12);
    },
  };
}

export const merkezAdimi = {
  baslik: "Hangi merkez? Gerçek yaşam problemleri",
  cikti: "MAT.10.1.2-d",
  anlatim: `
    <p>Üçgenin dört özel noktası, gerçek hayatta farklı sorulara cevap verir. Her problemde önce <b>hangi noktanın</b> aranan yer olduğuna karar ver.</p>
    <p>Doğru seçince inşa çizgileri belirir. Sonra sahnedeki <b>su deposunu, çeşmeyi ya da direği</b> sürükleyip tam yerine yerleştir. Yüzen paneldeki harita ve göstergeler yardımcı olur.</p>`,
  gorev: "Üç problemin hepsini çöz.",
  ogretmen: "Programda yardımcı elemanlarla ilgili önermelerin farklı problem durumlarında kullanılarak değerlendirilmesi öneriliyor. Problemleri sınıfta önce tartıştırın: “köşelere eşit uzaklık” ile “kenarlara eşit uzaklık” arasındaki farkı vurgulayın. Su deposu problemi geniş açılı yerleşimlerde deponun üçgenin dışına düşebileceğini tartışmak için de kullanılabilir. Köy adları ve yerleşim kurgusaldır.",
  anlat: [
    { s: "Üçgenin dört özel noktasını tanıdın. Şimdi hangisinin hangi işe yaradığına karar vereceğiz.", yap: (api) => api.p(-1.5, -1, 0.01) },
    { s: "Üç köy ortak bir <b>su deposu</b> yapacak. Sağ üstteki haritada köyler üçgenin köşeleri." },
    { s: "Depoyu (P) başka bir yere taşıyalım. Yeşil kesikli çizgiler P'nin köylere uzaklıkları. İzle…", yap: (api) => api.p(2, 1.5) },
    { s: "Bu uzaklıklar çok farklı: Karapınar'a ≈ 3,1 km, Akçaköy'e ≈ 7,6 km. Boru masrafı adil olmaz." },
    { soru: "Kenar orta dikme üzerindeki bir nokta neye eşit uzaklıktadır?", secenekler: ["Kenarın iki ucuna", "İki kenara", "Karşı köşeye"], dogru: 0,
      aciklama: "Kenar orta dikme, kenarın iki ucuna eşit uzaklıktaki noktalardır.", ipucu: "Önceki adımda O'yu hatırla." },
    { soru: "Açıortay üzerindeki bir nokta neye eşit uzaklıktadır?", secenekler: ["Açının iki koluna", "Açının köşesine", "Karşı kenarın uçlarına"], dogru: 0,
      aciklama: "Açıortay, açının iki koluna (kenarlara) eşit uzaklık verir.", ipucu: "P'den kollara indirdiğimiz dikmeleri hatırla." },
    { s: "Kısacası her problemde şunu sor: <b>köşelere</b> mi eşit uzaklık, <b>kenarlara</b> mı, yoksa <b>denge</b> mi?" },
    { s: "Doğru noktayı seçince sarı inşa çizgileri belirir. Sonra nesneyi sürükleyip kesişime taşırsın." },
    { s: "Şimdi üç problemi sırayla çöz: su deposu, parktaki çeşme ve dengede duran levha." },
  ],
  anlatBitti: (api) => api.p(-1.5, -1, 0.01),
  kur(ctx) {
    const ilk = YER.depo;
    const D = dunyaAc(ctx, { kameraKonum: ilk.kamera, hedef: ilk.hedef, arkaPlan: [0x86b4dc, 0xe4ecf2], sis: [800, 1900], uzaklik: [5, 1200] });
    const { S } = D;
    const dar = D.kap.clientWidth < 600;
    const kameraNe = (yer) => ({ konum: dar ? yer.darKamera : yer.kamera, hedef: dar ? yer.darHedef : yer.hedef });
    S.kameraKoy(kameraNe(ilk));
    const sahneler = {
      depo: koylerKur(S, YER.depo, SENARYOLAR[0]),
      cesme: parkKur(S, YER.cesme, SENARYOLAR[1]),
      levha: atolyeKur(S, YER.levha, SENARYOLAR[2]),
    };
    const cozulen = new Set();
    let s = SENARYOLAR[0], secim = null, insa = false;
    const P = { x: -1.5, y: -1 };
    const pNokta = new THREE.Object3D();
    S.scene.add(pNokta);
    S.igne(pNokta, "P", { renk: "#5ad38b", yon: "ust" });
    // güneşin gölge kutusu etkin sahneye göre taşınır ve boyutlanır
    function gunesAyarla(ad) {
      const yer = YER[ad], b = { depo: 190, cesme: 80, levha: 5 }[ad], u = { depo: 1, cesme: 1, levha: 0.12 }[ad];
      S.gunes.target.position.set(yer.O[0], 0, yer.O[1]);
      S.gunes.position.set(yer.O[0] - 40 * u, 80 * u, yer.O[1] + 40 * u);
      const g = S.gunes.shadow.camera;
      g.left = -b; g.right = b; g.top = b; g.bottom = -b; g.far = 300 * u;
      g.updateProjectionMatrix();
    }
    gunesAyarla("depo");

    for (const [ad, sh] of Object.entries(sahneler)) {
      const yer = YER[ad];
      D.tutamak(ad, {
        alan: sh.nesne, y: sh.tutYuksekligi,
        etkin: () => s.ad === ad && !cozulen.has(ad),
        kisit: (q) => haritada(yer, q.x, q.z),
        degisti: (q) => { P.x = q.x; P.y = q.y; guncelle(); },
        birakti: () => kontrol(),
      });
    }
    // duman testi için: haritadaki noktanın dünya karşılığı
    D.kap.__dunyada = (x, y) => { const w = dunyada(YER[s.ad], { x, y }); return { x: w.x, z: w.z }; };

    // yüzen panel: kuşbakışı harita / çizim
    const panel = yuzenPanel(ctx, "", { konum: "sag-ust" });
    const baslik = el("div", { class: "mt-yuzen-baslik" });
    panel.parentElement.prepend(baslik);
    const cizim = sekilCiz(panel, { alan: { xmin: -5.6, xmax: 5.6, ymin: -3.4, ymax: 4.9 }, izgara: 0 }, (c) => {
      const [A, B, C] = s.koseler;
      if (s.ad === "cesme") c.cokgen([A, B, C], { dolgu: "rgba(90,180,100,.25)", renk: "#4a5468", kalinlik: 5 });
      else if (s.ad === "levha") c.cokgen([A, B, C], { dolgu: "rgba(170,182,200,.45)", renk: "#cfd8e6", kalinlik: 2 });
      else c.cokgen([A, B, C], { dolgu: "rgba(90,140,80,.15)", renk: "rgba(216,180,106,.8)", kalinlik: 3 });
      if (insa) {
        const k = [A, B, C];
        if (s.dogru === "cevrel") for (const [p, q] of [[A, B], [B, C], [C, A]]) { const M = ortaNokta(p, q); c.dogru(M, topla(M, dik(fark(q, p))), { renk: RENK.sari, kesikli: "6 4", kalinlik: 1.4 }); }
        if (s.dogru === "ic") k.forEach((V, i) => c.parca(V, icAciortayAyagi(V, k[(i + 1) % 3], k[(i + 2) % 3]), { renk: RENK.sari, kesikli: "6 4", kalinlik: 1.4 }));
        if (s.dogru === "agirlik") k.forEach((V, i) => c.parca(V, ortaNokta(k[(i + 1) % 3], k[(i + 2) % 3]), { renk: RENK.sari, kesikli: "6 4", kalinlik: 1.4 }));
      }
      if (s.ad === "depo") {
        for (const K of s.koseler) c.parca(P, K, { renk: RENK.yesil, kesikli: "3 4", kalinlik: 1.2 });
        s.koseler.forEach((K, i) => { c.nokta(K, { renk: RNK[i], r: 4 }); c.yazi(K, s.adlar[i], { dy: K.y > 2 ? -12 : 14, boyut: 11, renk: RNK[i], kalin: true }); });
      }
      if (s.ad === "cesme") for (const [p, q] of [[A, B], [B, C], [C, A]]) c.parca(P, dikmeAyagi(P, p, q), { renk: RENK.yesil, kesikli: "3 4", kalinlik: 1.2 });
      c.nokta(P, { renk: RENK.yesil, r: 5 });
      c.yazi(P, "P", { dx: 10, dy: -8, renk: RENK.yesil, kalin: true, boyut: 13 });
    });

    ctx.secenekler({
      etiket: "Problem", deger: 0,
      liste: SENARYOLAR.map((x, i) => ({ deger: i, metin: x.baslik })),
      degisti: (i) => {
        s = SENARYOLAR[i]; secim = null; insa = false; merkezSec.deger = null;
        if (!cozulen.has(s.ad)) { P.x = -1.5; P.y = -1; } else Object.assign(P, senaryoHedefi(s));
        S.kameraGit({ ...kameraNe(YER[s.ad]), sure: 1.2 });
        gunesAyarla(s.ad);
        yaz();
      },
    });
    const metin = ctx.not("");
    const merkezSec = ctx.secenekler({
      etiket: "Aranan yer hangi nokta?", deger: null,
      liste: Object.entries(MERKEZLER).map(([k, m]) => ({ deger: k, metin: `${m.ad} (${m.eleman})` })),
      degisti: (v) => {
        secim = v;
        insa = v === s.dogru || cozulen.has(s.ad);
        geri.className = `d-geri-bildirim ${v === s.dogru ? "dogru" : "yanlis"}`;
        geri.textContent = v === s.dogru ? `Doğru seçim! Sarı ${MERKEZLER[v].eleman} çizildi. Şimdi P'yi kesişim noktasına taşı.` : s.yanlis[v];
        guncelle(); kontrol();
      },
    });
    const geri = el("div", { class: "d-geri-bildirim" });
    ctx.kontroller.append(geri);
    // klavye ve dokunmatik için yedek: P'yi küçük adımlarla taşı
    const it = (dx, dy) => () => { if (cozulen.has(s.ad)) return; P.x += dx; P.y += dy; guncelle(); kontrol(); };
    ctx.dugmeler([
      { metin: "← P", tik: it(-0.1, 0) }, { metin: "P →", tik: it(0.1, 0) },
      { metin: "↑ P", tik: it(0, 0.1) }, { metin: "↓ P", tik: it(0, -0.1) },
    ]);
    const f = formulListesi(ctx, ["", "", ""]);
    const durum = ctx.not("");

    function guncelle() {
      const sh = sahneler[s.ad];
      sh.yerlestir(P);
      pNokta.position.copy(dunyada(YER[s.ad], P, s.ad === "levha" ? 0 : s.ad === "depo" ? 30 : 3.4));
      for (const [ad, x] of Object.entries(sahneler)) {
        for (const i of x.igneler) i.gizle(ad !== s.ad);
        for (const c of x.insa) c.visible = ad === s.ad && insa;
      }
      cizim.yenile();
      olc();
    }
    function yaz() {
      metin.innerHTML = `<p>${s.metin}</p>`;
      baslik.textContent = s.ad === "levha" ? "Levhanın üstten görünüşü" : "Kuşbakışı harita";
      geri.textContent = cozulen.has(s.ad) ? "Bu problemi çözdün ✓" : "";
      geri.className = `d-geri-bildirim ${cozulen.has(s.ad) ? "dogru" : ""}`;
      insa = cozulen.has(s.ad);
      const etiketler = s.ad === "depo" ? s.adlar.map((a) => `P – ${a}`) : s.ad === "cesme" ? ["P – 1. yol", "P – 2. yol", "P – 3. yol"] : ["Denge noktasından sapma", "", ""];
      const degerler = f.el.querySelectorAll(".mt-deger");
      f.el.querySelectorAll("span:not(.mt-deger)").forEach((sp, i) => {
        sp.textContent = etiketler[i];
        sp.hidden = degerler[i].hidden = !etiketler[i];
      });
      guncelle();
    }
    function olc() {
      const [A, B, C] = s.koseler;
      if (s.ad === "depo") [A, B, C].forEach((K, i) => f.ayarla(i, `${kisa(uzaklik(P, K), 2)} km`));
      else if (s.ad === "cesme") [[A, B], [B, C], [C, A]].forEach(([p, q], i) => f.ayarla(i, `${kisa(dogruyaUzaklik(P, p, q) * 10, 1)} m`));
      else { const d = uzaklik(P, agirlikMerkezi(A, B, C)); f.ayarla(0, d < HEDEF_TOLERANS ? "dengede ✓" : `levha eğiliyor (${kisa(d * 10, 0)} cm)`); f.ayarla(1, ""); f.ayarla(2, ""); }
      durum.innerHTML = `<p>Çözülen problem: ${cozulen.size}/3</p>`;
    }
    function kontrol() {
      const hedef = senaryoHedefi(s);
      if (secim === s.dogru && uzaklik(P, hedef) < HEDEF_TOLERANS && !cozulen.has(s.ad)) {
        cozulen.add(s.ad);
        Object.assign(P, hedef);
        guncelle();
        geri.className = "d-geri-bildirim dogru";
        geri.textContent = `Çözdün! ${MERKEZLER[s.dogru].ad} tam aranan yer.`;
        olc();
        if (cozulen.size === 3) ctx.gorevTamam();
      }
    }
    // açılışta her sahne bir kez yerleşsin (öbür sahnelerdeki nesneler de doğru yerde dursun)
    for (const [ad, sh] of Object.entries(sahneler)) sh.yerlestir(senaryoHedefi(SENARYOLAR.find((x) => x.ad === ad)));
    yaz();
    return {
      // anlatım: depoyu haritada (x, y)'ye kaydırır; kontrol() çağrılmaz, problem çözülmüş sayılmaz
      p(x, y, sure = 1.2) {
        durdurHepsi();
        const x0 = P.x, y0 = P.y;
        return gecis(P, sure, (k) => { P.x = x0 + (x - x0) * k; P.y = y0 + (y - y0) * k; guncelle(); });
      },
    };
  },
};
