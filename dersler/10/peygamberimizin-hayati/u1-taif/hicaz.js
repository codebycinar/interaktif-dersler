// Peygamberimizin Hayatı dersinin kalıcı 3B dünyası: Mekke ile Taif arasındaki Hicaz arazisi.
// Mekke vadisi (~277 m), Serat dağlarının sarp yamacı ve Taif platosu (~1.880 m). Yükseklikler
// 5 kat abartılıdır; yerleşimler temsilî ölçektedir. Kişi tasviri yoktur: yalnızca yer, yol ve yapı.
import {
  dunyaKur, gokOrtami, arazi, dokuluMalzeme, birlestirici, evEkle, agaclar, kayalar, dagit,
  yolCizgisi, renkKat, yumusakAdim, fbm, rastgele, THREE,
} from "../../felsefe/_ortak/dunya.js";
import { YERLER, yer } from "./veri.js";

/* ---------- Coğrafi izdüşüm: 1 birim = 0,5 km; dikeyde 1 birim = 100 m (5 kat abartı) ---------- */
const LON0 = 40.12, LAT0 = 21.45;
export const xz = (lon, lat) => [(lon - LON0) * 207.2, (LAT0 - lat) * 221.4];
const MEKKE = xz(yer("mekke").lon, yer("mekke").lat), TAIF = xz(yer("taif").lon, yer("taif").lat);

/** Dünya koordinatında temsilî rakım (m) */
export function yukseklikMetre(x, z) {
  // Batıda alçak vadiler, doğuda Serat yamacı ve plato
  const xe = 33 + 0.1 * z;                                  // yamacın eteği (kuzeye doğru batıya kayar)
  const gen = 9 + Math.max(0, -z) * 0.55;                   // kuzeyde daha yumuşak geçit
  const e = yumusakAdim(xe - gen * 0.6, xe + gen * 0.4, x);
  const ova = 270 + Math.max(0, x - MEKKE[0]) * 3.6;
  const plato = 1820 - 13 * Math.max(0, 6 - z) + 140 * fbm(x * 0.05, 2, z * 0.05, { tohum: 4 });
  let m = ova + (plato - ova) * e;
  // Yamacın üstündeki doruklar
  m += 380 * Math.exp(-(((x - xe - 2) / 5) ** 2)) * Math.max(0, 0.4 + fbm(x * 0.09, 1, z * 0.09, { tohum: 6 })) * yumusakAdim(-30, 10, z);
  // Mekke çevresinin sarp, koyu granit sırtları (sırtlı gürültü: 1 - |fbm|)
  const sirt = 1 - Math.abs(fbm(x * 0.05, 0, z * 0.05, { oktav: 4, tohum: 2 }) * 1.5);
  const engebe = (1 - e * 0.85) * Math.max(0, sirt) * (0.55 + 0.45 * Math.max(0, fbm(x * 0.02, 4, z * 0.02, { tohum: 3 }) + 0.5));
  const vadi = yumusakAdim(2.5, 8, Math.hypot(x - MEKKE[0], z - MEKKE[1]));
  m += 600 * Math.pow(engebe, 2.2) * vadi * vadiMaskesi(x, z);
  m += 60 * fbm(x * 0.3, 5, z * 0.3, { tohum: 9 });
  // Taif'in düzlüğü
  m += (1879 - m) * (1 - yumusakAdim(2.5, 7, Math.hypot(x - TAIF[0], z - TAIF[1]))) * 0.85;
  return m;
}
// Yolların geçtiği vadiler (dere yatakları) daha alçak
let VADILER = [];
function vadiMaskesi(x, z) {
  let d = 99;
  for (const [a, b] of VADILER) {
    const vx = b[0] - a[0], vz = b[1] - a[1], L = vx * vx + vz * vz;
    const t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / L));
    d = Math.min(d, Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t));
  }
  return 0.15 + 0.85 * yumusakAdim(1.2, 6, d);
}
// Arazi kenarlarında yükseklik sabit bir düzeye iner; çevre zemini ile dikişsiz birleşir
const KENAR = { x0: -142, x1: 158, z0: -130, z1: 130, m: 900 };
const yukseklik = (x, z) => {
  const k = Math.min(yumusakAdim(0, 28, x - KENAR.x0), yumusakAdim(0, 28, KENAR.x1 - x), yumusakAdim(0, 28, z - KENAR.z0), yumusakAdim(0, 28, KENAR.z1 - z));
  return (KENAR.m + (yukseklikMetre(x, z) - KENAR.m) * k) / 100;
};

function zeminRengi(x, z, y, egim) {
  const n = fbm(x * 0.12, 3, z * 0.12, { oktav: 3, tohum: 7 });
  const m = y * 100;
  const taif = 1 - yumusakAdim(3, 9, Math.hypot(x - TAIF[0], z - TAIF[1]));
  const yesil = taif * 0.8 + yumusakAdim(1500, 1850, m) * yumusakAdim(0.15, 0.5, n) * 0.3;
  return renkKat("#c8a675",
    ["#dcc49a", yumusakAdim(0.05, 0.4, n) * (1 - yumusakAdim(500, 900, m)) * 0.7],   // açık renkli dere yatakları
    ["#a48a66", yumusakAdim(800, 1400, m) * 0.6],                                      // yüksek kesimler
    ["#6d5646", yumusakAdim(0.1, 0.3, egim)],                                          // yamaç
    ["#3f332c", yumusakAdim(0.28, 0.6, egim) * 0.85],                                  // koyu granit
    ["#6f8243", yesil]);                                                               // Taif bağ ve bahçeleri
}

/* ---------- Yerleşimler ---------- */
function yerlesim(S, h, merkez, { sayi, yaricap, tohum, sur = false, bos = 0 }) {
  const b = birlestirici();
  const M = {
    duvar: dokuluMalzeme("siva", { tekrar: [1, 1], kabarti: 1, renk: 0xe2cfae }),
    duvar2: dokuluMalzeme("tas", { tekrar: [1, 1], kabarti: 1.4, renk: 0xd9c9ad }),
    bosluk: new THREE.MeshStandardMaterial({ color: 0x231a13, roughness: 1 }),
    ahsap: dokuluMalzeme("ahsap", { tekrar: [1, 1] }),
  };
  const r = rastgele(tohum);
  // Evler ölçeksizdir (görünür olsun diye büyütüldü): 1 ev ≈ 0,3 birim
  const O = 0.11;
  for (let i = 0; i < sayi; i++) {
    const a = r() * Math.PI * 2, d = bos + Math.sqrt(r()) * (yaricap - bos);
    const x = merkez[0] + Math.cos(a) * d, z = merkez[1] + Math.sin(a) * d;
    const en = (2.4 + r() * 2) * O, derin = (2.4 + r() * 2) * O;
    const y = Math.min(h(x - en / 2, z - derin / 2), h(x + en / 2, z + derin / 2), h(x, z));
    evEkle(b, { ...M, duvar: r() < 0.6 ? M.duvar : M.duvar2 }, { x, y, z, en, derin, yuk: (2 + r() * 2.2) * O, donus: Math.round(r() * 4) * Math.PI / 2 + (r() - 0.5) * 0.3, cati: "duz", pencere: 1 });
  }
  b.bitir(S.scene, { golge: true });
  if (!sur) return;
  // Taif'in surları ve kuleleri
  const s = birlestirici();
  const tas = dokuluMalzeme("tas", { tekrar: [4, 1], kabarti: 1.4, renk: 0xcdbb9c });
  const R = yaricap + 0.35, N = 44;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
    const p0 = [merkez[0] + Math.cos(a0) * R, merkez[1] + Math.sin(a0) * R * 0.85], p1 = [merkez[0] + Math.cos(a1) * R, merkez[1] + Math.sin(a1) * R * 0.85];
    const mx = (p0[0] + p1[0]) / 2, mz = (p0[1] + p1[1]) / 2, L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const y = h(mx, mz);
    s.ekle(new THREE.BoxGeometry(L + 0.02, 0.42, 0.09), tas, { konum: [mx, y + 0.12, mz], donus: [0, -Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), 0] });
    if (i % 4 === 0) s.ekle(new THREE.CylinderGeometry(0.12, 0.14, 0.62, 10), tas, { konum: [p0[0], h(...p0) + 0.2, p0[1]] });
  }
  s.bitir(S.scene, { golge: true });
}

/** Sığınılan bağ: alçak taş duvarla çevrili asma sıraları ve gölgelik ağaç */
function bag(S, h, [cx, cz]) {
  const b = birlestirici();
  const tas = dokuluMalzeme("tas", { tekrar: [3, 1], kabarti: 1.4, renk: 0xc9b89a });
  const en = 3.0, derin = 2.1;
  for (const [x, z, L, d] of [[cx, cz - derin / 2, en, 0], [cx, cz + derin / 2, en, 0], [cx - en / 2, cz, derin, Math.PI / 2], [cx + en / 2, cz + 0.45, derin - 0.8, Math.PI / 2]]) {
    s0(b, tas, x, z, L, d, h);
  }
  b.bitir(S.scene, { golge: true });
  const asma = [];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) {
    const x = cx - en / 2 + 0.3 + j * ((en - 0.6) / 8), z = cz - derin / 2 + 0.3 + i * ((derin - 0.6) / 5);
    asma.push([x, h(x, z), z, 0.22]);
  }
  agaclar(S, "asma", asma, { tohum: 31 });
  agaclar(S, "yuvarlak", [[cx + 0.75, h(cx + 0.75, cz - 0.3), cz - 0.3, 0.2]], { tohum: 33 });
}
function s0(b, tas, x, z, L, d, h) {
  b.ekle(new THREE.BoxGeometry(L, 0.12, 0.06), tas, { konum: [x, h(x, z) + 0.04, z], donus: [0, d, 0] });
}

/* ---------- Dünya ---------- */
export function hicazDunyasi(kap) {
  const S = dunyaKur(kap, {
    uzaklik: [2, 360],
    kameraKonum: [-20, 95, 150], hedef: [5, 5, 0], arkaPlan: [0x5f95d3, 0xeedfc4], sis: [240, 820], isik: "klasik", pozlama: 1.0,
    bakislar: {
      bolge: { konum: [-12, 150, 150], hedef: [2, 4, 0] },
      profil: { konum: [2, 58, 238], hedef: [2, 9, 20] },
      mekke: { konum: [-72, 19, 25], hedef: [-60.5, 3.2, 5.5] },
      taif: { konum: [73, 26, 55], hedef: [61, 18.6, 39.5] },
      bag: { konum: [53, 20.6, 43], hedef: [57.4, 18.7, 37.4] },
      karn: { konum: [74, 24, -22], hedef: [62, 13, -40] },
      nahle: { konum: [10, 14, -6], hedef: [-4, 5, -22] },
      huneyn: { konum: [-22, 120, 140], hedef: [-6, 4, 0] },
      kusatma: { konum: [67, 22.5, 47], hedef: [61, 18.9, 39.8] },
      medine: { konum: [30, 46, 78], hedef: [-12, 4, -66] },
    },
  });
  S.gunes.position.set(-60, 110, 70);
  S.gunes.color.set(0xfff1da);
  S.gunes.intensity = 2.7;
  S.gok.intensity = 0.95;
  S.gok.groundColor.set(0x8a6c4c);
  gokOrtami(S, { ust: 0x4a86cc, ufuk: 0xf0e4cc, alt: 0x8a6c4c, gunes: { yon: [-0.45, 0.8, 0.4] }, guc: 0.6 });
  const g = S.gunes.shadow.camera;
  g.left = -130; g.right = 130; g.top = 100; g.bottom = -100; g.far = 450; g.updateProjectionMatrix();

  // Yolculuk güzergâhları (temsilî): gidiş güneyden yamacı aşar, dönüş kuzeyden Karnü's-seâlib ve Nahle üzerinden
  const ll = (id) => xz(yer(id).lon, yer(id).lat);
  const gidis = [ll("mekke"), xz(39.98, 21.40), xz(40.12, 21.36), xz(40.27, 21.30), ll("taif")];
  const donus = [ll("taif"), xz(40.44, 21.45), ll("karn"), xz(40.25, 21.60), ll("nahle"), xz(39.95, 21.50), ll("mekke")];
  VADILER = [...gidis.slice(1).map((p, i) => [gidis[i], p]), ...donus.slice(1).map((p, i) => [donus[i], p])];

  const { h } = arazi(S, { genislik: 300, derinlik: 260, bolum: 260, merkez: [8, 0], yukseklik, renk: zeminRengi, detayTekrar: 110 });

  // Uzak çevre: aynı arazinin devamı gibi görünen alçak bir zemin (kenarlarda boşluk kalmasın)
  const cevre = new THREE.Mesh(new THREE.RingGeometry(125, 1200, 48, 1).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb99a70, roughness: 1 }));
  cevre.position.set(8, KENAR.m / 100 - 0.05, 0); cevre.scale.set(1.2, 1, 1);
  S.scene.add(cevre);

  yerlesim(S, h, MEKKE, { sayi: 46, yaricap: 2.3, tohum: 5, bos: 0.45 });
  yerlesim(S, h, TAIF, { sayi: 58, yaricap: 2.5, tohum: 9, sur: true });
  // Kâbe: Mekke'nin ortasında küçük, koyu taş yapı
  const kabe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.17), new THREE.MeshStandardMaterial({ color: 0x1c1a19, roughness: 0.7 }));
  kabe.position.set(MEKKE[0], h(...MEKKE) + 0.1, MEKKE[1]); kabe.castShadow = true;
  S.scene.add(kabe);

  // Dönüş yolunun başında, şehrin kuzeyindeki bağ (temsilî konum)
  const BAG = [TAIF[0] + 0.6, TAIF[1] - 5.2];
  bag(S, h, BAG);
  S.bakislar.bag = { konum: [BAG[0] - 5.2, h(...BAG) + 4.2, BAG[1] + 5.4], hedef: [BAG[0], h(...BAG) + 0.2, BAG[1]] };
  // Taif çevresinde bağlar ve meyve bahçeleri; vadilerde akasya, Mekke çevresinde seyrek hurma
  const asmalar = [];
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.3, d = 4 + (k % 3) * 0.9;
    const cx = TAIF[0] + Math.cos(a) * d, cz = TAIF[1] + Math.sin(a) * d * 0.85;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 8; j++) {
      const x = cx + (j - 3.5) * 0.24, z = cz + (i - 2) * 0.28;
      asmalar.push([x, h(x, z), z, 0.2]);
    }
  }
  agaclar(S, "asma", asmalar, { tohum: 41, golge: false });
  agaclar(S, "yuvarlak", dagit(70, { merkez: TAIF, yaricap: 8, ic: 2.6, tohum: 43, h, olcek: [0.12, 0.18], uygun: (x, z) => Math.hypot(x - TAIF[0] - 0.6, z - TAIF[1] + 5.2) > 2.2 }), { tohum: 43 });
  agaclar(S, "akasya", dagit(140, { merkez: [-10, 0], yaricap: 90, tohum: 45, h, olcek: [0.1, 0.15], uygun: (x, z) => h(x, z) < 9 && vadiMaskesi(x, z) < 0.5 && Math.hypot(x - MEKKE[0], z - MEKKE[1]) > 9 }), { tohum: 45, golge: false });
  agaclar(S, "hurma", dagit(36, { merkez: MEKKE, yaricap: 5, ic: 1.4, tohum: 47, h, olcek: [0.08, 0.12] }), { tohum: 47 });
  kayalar(S, dagit(300, { merkez: [0, 0], yaricap: 120, tohum: 49, h: (x, z) => h(x, z) - 0.05, olcek: [0.1, 0.35] }), { ad: "granit", tohum: 49 });

  // Güzergâh çizgileri arazinin üstünden geçer
  const ornekle = (liste) => {
    const cikti = [];
    for (let i = 0; i < liste.length - 1; i++) {
      const [a, b] = [liste[i], liste[i + 1]], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.8);
      for (let k = 0; k < n; k++) { const t = k / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; cikti.push([x, h(x, z) + 0.14, z]); }
    }
    const s = liste.at(-1);
    cikti.push([s[0], h(...s) + 0.14, s[1]]);
    return cikti;
  };
  const yolG = yolCizgisi(S, ornekle(gidis), { renk: 0xffb547, kalinlik: 0.16, parca: 600 });
  const yolD = yolCizgisi(S, ornekle(donus), { renk: 0xb89cff, kalinlik: 0.16, parca: 700 });
  let hedefG = 0, hedefD = 0, simdiG = 0, simdiD = 0;
  S.herKare((dt) => {
    const k = Math.min(1, dt * 1.6);
    if (Math.abs(simdiG - hedefG) > 1e-4) { simdiG += (hedefG - simdiG) * k; if (Math.abs(simdiG - hedefG) < 0.002) simdiG = hedefG; yolG.ilerleme(simdiG); }
    if (Math.abs(simdiD - hedefD) > 1e-4) { simdiD += (hedefD - simdiD) * k; if (Math.abs(simdiD - hedefD) < 0.002) simdiD = hedefD; yolD.ilerleme(simdiD); }
    // Yol bölge ölçeğinde çizilir (≈80 m genişlik); yakın çekimde soluklaşır ki bağı, evleri örtmesin
    const saydam = Math.max(0.12, Math.min(1, (S.camera.position.distanceTo(S.kontrol.target) - 10) / 30));
    for (const y of [yolG, yolD]) { y.mesh.material.opacity = saydam; y.mesh.material.transparent = saydam < 1; y.mesh.material.depthWrite = saydam >= 1; }
  });
  S.rota = {
    /** Güzergâhları ilerlet (0..1); ani: geçişsiz */
    ayarla(g = 0, d = 0, { ani = false } = {}) {
      hedefG = g; hedefD = d;
      if (ani) { simdiG = g; simdiD = d; yolG.ilerleme(g); yolD.ilerleme(d); }
    },
    gidisUcu: () => yolG.nokta(simdiG), donusUcu: () => yolD.nokta(simdiD),
  };

  const nokta = (p, ek = 1.2) => new THREE.Vector3(p[0], h(...p) + ek, p[1]);
  S.yerler = Object.fromEntries(YERLER.filter((y) => y.lon > 39.6 && y.lon < 40.7 && y.lat > 21.1 && y.lat < 21.8).map((y) => [y.id, nokta(xz(y.lon, y.lat), y.id === "taif" ? 1.4 : 1)]));
  S.yerler.bag = nokta(BAG, 0.9);
  S.yerler.yamac = nokta(xz(40.29, 21.30), 2);
  S.yerler.medine = new THREE.Vector3(-14, 9, -74);
  S.yerler.kabe = nokta(MEKKE, 0.3);
  S.yerler.mekke = nokta(MEKKE, 2.2);
  return S;
}

/** Adım için iğneler kurar; adım değişince kaldırılır. liste: [[yerAdı|nokta, html, ayar]] */
export function igneler(ctx, liste) {
  const S = ctx.sahne;
  const kurulan = liste.map(([y, html, ayar = {}]) => S.igne(typeof y === "string" ? S.yerler[y] : y, html, ayar));
  ctx.temizlik(() => kurulan.forEach((i) => i.kaldir()));
  return kurulan;
}
