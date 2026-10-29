// u1c 3B dünyası: hücre içi (sitoplazma ve yarısı kesilmiş mitokondri), koşan bir kasın büyütülmüş dokusu,
// maya balon deneyi laboratuvarı, fermente ürünlerin ve günlük tabağın olduğu mutfak tezgâhı
import {
  dunyaKur, THREE, malzeme, organiklestir, coklu, rastgele, fbm, mergeGeometries,
  dokuluMalzeme, borudanGeo, donel, masa, molekulGeo, molekulMalz, nokta, koy,
} from "../ortak/dunya3b.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const YER = { hucre: [0, 0, 0], kas: [-200, 0, 0], lab: [200, 0, 0], mutfak: [400, 0, 0] };
const bakis = (yer, konum, hedef, ek = {}) => {
  const [x, y, z] = YER[yer];
  return { konum: [konum[0] + x, konum[1] + y, konum[2] + z], hedef: [hedef[0] + x, hedef[1] + y, hedef[2] + z], ...ek };
};
const grupAt = (yer) => { const g = new THREE.Group(); g.position.set(...YER[yer]); return g; };
const fizikMalz = (renk, o = {}) => new THREE.MeshPhysicalMaterial({ color: renk, roughness: 0.5, ...o });
/** Cam kap: içindekiler çizilsin diye transmission yok; parlaklık clearcoat ile */
const camMalz = (renk = 0xeaf4ff, opaklik = 0.16) => new THREE.MeshPhysicalMaterial({
  color: renk, roughness: 0.04, metalness: 0, transparent: true, opacity: opaklik, clearcoat: 1, clearcoatRoughness: 0.04,
  specularIntensity: 1, side: THREE.DoubleSide, depthWrite: false,
});
/** Kap içindeki sıvı (transmission yok) */
const siviMalz = (renk, opaklik = 0.7) => new THREE.MeshPhysicalMaterial({
  color: renk, roughness: 0.12, clearcoat: 0.8, clearcoatRoughness: 0.1, transparent: opaklik < 1, opacity: opaklik, depthWrite: opaklik >= 0.9, sheen: 0.3,
});
const simdi = () => performance.now() / 1000;
const yumusak = (u) => u * u * (3 - 2 * u);
const O_RENK = 0xe85a5a, C_RENK = 0x8f98a6, H_RENK = 0xf2f2f2;

export function solunumSahnesi(kap) {
  const S = dunyaKur(kap, { kameraKonum: [-1.3, 7.4, 18.3], hedef: [-1.2, 0, -0.4] });
  S.hucre = hucreYeri(S);
  S.kas = kasYeri(S);
  S.lab = labYeri(S);
  S.mutfak = mutfakYeri(S);
  return S;
}

/* ---------------- Ortak parçalar ---------------- */
/** Bir eğri boyunca akan parçacıklar (besin, ATP, iyon) */
function akis(grup, noktalar, renk, { n = 14, hiz = 0.22, boyut = 0.075, geo = null, malz = null } = {}) {
  const egri = new THREE.CatmullRomCurve3(noktalar.map((p) => (p.isVector3 ? p : V(...p))));
  const m = coklu(geo || new THREE.IcosahedronGeometry(boyut, 1), malz || malzeme.isik(renk, 0.9), n);
  const faz = Array.from({ length: n }, (_, i) => i / n);
  const p = new THREE.Vector3();
  m.visible = false; grup.add(m);
  return {
    m,
    ac(b = true) { m.visible = b; },
    kare(dt) {
      if (!m.visible) return;
      for (let i = 0; i < n; i++) {
        faz[i] = (faz[i] + dt * hiz) % 1;
        egri.getPointAt(faz[i], p);
        koy(m, i, p.x, p.y, p.z, { s: Math.max(0.01, Math.min(1, faz[i] * 8, (1 - faz[i]) * 8)), ry: faz[i] * 9, rx: i });
      }
      m.userData.bitir();
    },
  };
}
const yay = (a, b, h = 1.2, oneDogru = 0.6) => [a, V((a.x + b.x) / 2, Math.max(a.y, b.y) + h, (a.z + b.z) / 2 + oneDogru), b];
/** Üstü açık cam tank (su banyosu) */
function acikKutuGeo(w, h, d) {
  const p = [
    new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).translate(0, -h / 2, 0),
    new THREE.PlaneGeometry(w, h).translate(0, 0, d / 2),
    new THREE.PlaneGeometry(w, h).translate(0, 0, -d / 2),
    new THREE.PlaneGeometry(d, h).rotateY(Math.PI / 2).translate(-w / 2, 0, 0),
    new THREE.PlaneGeometry(d, h).rotateY(Math.PI / 2).translate(w / 2, 0, 0),
  ];
  return mergeGeometries(p);
}
/** Fayanslı arka duvar */
function fayans(g, { gen = 30, yuk = 9, z = -6.5, renk = 0xeef2f5, boy = 1 } = {}) {
  const derz = new THREE.Mesh(new THREE.PlaneGeometry(gen, yuk), malzeme.mat(0x8d949c, { puruz: 0.95 }));
  derz.position.set(0, yuk / 2 - 0.6, z); derz.receiveShadow = true; g.add(derz);
  const nx = Math.floor(gen / boy), ny = Math.floor(yuk / boy);
  const f = coklu(new RoundedBoxGeometry(boy * 0.95, boy * 0.95, 0.08, 2, 0.025), dokuluMalzeme("seramik", { renk, puruz: 0.22, kabarti: 0.15, fizik: { clearcoat: 0.9, clearcoatRoughness: 0.08 } }), nx * ny);
  let i = 0;
  for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) koy(f, i++, -gen / 2 + boy * (a + 0.5), -0.6 + boy * (b + 0.5), z + 0.04);
  f.userData.bitir(); f.receiveShadow = true; g.add(f);
}
const O2_GEO = () => molekulGeo([[-0.1, 0, 0, 0.11, O_RENK], [0.1, 0, 0, 0.11, O_RENK]]);
const SU_GEO = () => molekulGeo([[0, 0, 0, 0.12, O_RENK], [-0.12, 0.09, 0, 0.07, H_RENK], [0.12, 0.09, 0, 0.07, H_RENK]]);
const CO2_GEO = () => molekulGeo([[0, 0, 0, 0.13, C_RENK], [-0.23, 0, 0, 0.11, O_RENK], [0.23, 0, 0, 0.11, O_RENK]]);
/** Altıgen şeker halkası (5 C + 1 O), sarı */
const HEKZ_GEO = (k = 1) => molekulGeo(Array.from({ length: 6 }, (_, i) => [0.17 * k * Math.cos((i * Math.PI) / 3), 0, 0.17 * k * Math.sin((i * Math.PI) / 3), 0.085 * k, i === 5 ? O_RENK : 0xffd84a]));

/* =====================================================================
 * 1) Hücre içi: sitoplazma, glikoliz enzimleri, yarısı kesilmiş mitokondri
 * ===================================================================== */
function hucreYeri(S) {
  const g = grupAt("hucre"), r = rastgele(7), akislar = [];
  // taban: hücre zarının iç yüzü, sitoplazma
  const tg = new THREE.PlaneGeometry(44, 32, 110, 80); tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position;
  for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), z = tp.getZ(i); tp.setY(i, -2.6 + fbm(x * 0.14, 1, z * 0.14, { oktav: 3, tohum: 4 }) * 0.9 + 0.03 * Math.hypot(x, z)); }
  tg.computeVertexNormals();
  const taban = new THREE.Mesh(tg, dokuluMalzeme("sitoplazma", { tekrar: [7, 5], kabarti: 1.5, puruz: 0.55, fizik: { sheen: 0.6, sheenColor: new THREE.Color(0x7fb0e0), clearcoat: 0.25 } }));
  taban.receiveShadow = true; g.add(taban);

  // arkada hücre zarı (içten) ve zar proteinleri
  const ZR = 15, ZZ = 3.5;
  const zg = organiklestir(new THREE.CylinderGeometry(ZR, ZR, 12, 90, 10, true, Math.PI * 0.62, Math.PI * 0.76), { genlik: 0.25, olcek: 0.35, tohum: 2 });
  const zar = new THREE.Mesh(zg, dokuluMalzeme("sitoplazma", { taban: "#5d84ab", koyu: "#3d5c7d", acik: "#8db2d6", tekrar: [18, 4], kabarti: 3, puruz: 0.5, fizik: { side: THREE.DoubleSide, sheen: 0.8, sheenColor: new THREE.Color(0xcfe6ff) } }));
  zar.position.set(0, 2.4, ZZ); zar.receiveShadow = true; g.add(zar);
  const zarNokta = (t, y, ic = 0) => V((ZR - ic) * Math.sin(t), y, ZZ + (ZR - ic) * Math.cos(t));
  const zp = coklu(organiklestir(new THREE.SphereGeometry(0.3, 14, 10), { genlik: 0.07, olcek: 3 }), fizikMalz(0x7d86c8, { roughness: 0.45, clearcoat: 0.3 }), 30);
  for (let i = 0; i < 30; i++) { const t = Math.PI * (0.66 + 0.68 * r()), p = zarNokta(t, -1.6 + r() * 7.5, -0.05); koy(zp, i, p.x, p.y, p.z, { s: [1.2, 1, 0.55], ry: t }); }
  zp.userData.bitir(); g.add(zp);
  // Na⁺/K⁺ pompası (zarı boydan boya geçen iki alt birim)
  const PT = Math.PI + 0.36, pompa = new THREE.Group();
  pompa.position.copy(zarNokta(PT, 0.9)); pompa.lookAt(0, 0.9, 0); g.add(pompa);
  const pa = new THREE.Mesh(organiklestir(new THREE.CapsuleGeometry(0.42, 1.0, 6, 16).rotateX(Math.PI / 2), { genlik: 0.06, olcek: 3, tohum: 4 }), fizikMalz(0x9b6fd6, { clearcoat: 0.5, roughness: 0.35 }));
  const pb = new THREE.Mesh(organiklestir(new THREE.CapsuleGeometry(0.28, 0.8, 6, 14).rotateX(Math.PI / 2), { genlik: 0.05, olcek: 3, tohum: 5 }), fizikMalz(0x3fb6a8, { clearcoat: 0.5, roughness: 0.35 }));
  pa.position.x = -0.25; pb.position.set(0.42, -0.1, 0.1); pompa.add(pa, pb);
  const iyon = coklu(new THREE.IcosahedronGeometry(0.09, 1), fizikMalz(0xffffff, { roughness: 0.3, clearcoat: 0.6 }), 12);
  const iyonRenk = new THREE.Color();
  for (let i = 0; i < 12; i++) iyon.setColorAt(i, iyonRenk.set(i % 2 ? 0x5ad38b : 0xb89cff));
  iyon.visible = false; pompa.add(iyon);

  // mitokondri: yarısı kesilmiş kapsül (lathe yerel ekseni y, dünyada x boyunca uzanır)
  const ML = 8.4, MR = 1.9, IL = 7.7, IR = 1.6, M = V(1.6, 0.15, -0.9);
  const mito = new THREE.Group(); mito.position.copy(M); mito.rotation.z = Math.PI / 2; g.add(mito);
  const profil = (L, R, n = 14) => {
    const h = L / 2 - R, p = [];
    for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (Math.PI / 2) * (i / n); p.push([Math.max(1e-3, R * Math.cos(a)), -h + R * Math.sin(a)]); }
    for (let i = 1; i < 8; i++) p.push([R, -h + (2 * h * i) / 8]);
    for (let i = 0; i <= n; i++) { const a = (Math.PI / 2) * (i / n); p.push([Math.max(1e-3, R * Math.cos(a)), h + R * Math.sin(a)]); }
    return p;
  };
  const yarim = (L, R, t) => organiklestir(new THREE.LatheGeometry(profil(L, R).map(([a, b]) => new THREE.Vector2(a, b)), 56, Math.PI / 2, Math.PI), { genlik: 0.03, olcek: 1.2, tohum: t });
  const disZar = dokuluMalzeme("et", { renk: 0xffc4a8, tekrar: [3, 2], kabarti: 1, puruz: 0.45, fizik: { clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.5, sheenColor: new THREE.Color(0xffd8c0), side: THREE.DoubleSide } });
  const icZar = dokuluMalzeme("et", { renk: 0xffc09a, tekrar: [3, 2], kabarti: 1, puruz: 0.45, fizik: { clearcoat: 0.4, emissive: new THREE.Color(0xffc23a), emissiveIntensity: 0 } });
  const matriks = dokuluMalzeme("et", { renk: 0x9a4c4a, tekrar: [4, 3], kabarti: 2, puruz: 0.7, fizik: { side: THREE.BackSide, sheen: 0.4, sheenColor: new THREE.Color(0xff9a80) } });
  const dis = new THREE.Mesh(yarim(ML, MR, 3), disZar); dis.castShadow = true;
  const icGeo = yarim(IL, IR, 3);
  mito.add(dis, new THREE.Mesh(icGeo, icZar), new THREE.Mesh(icGeo, matriks));
  // kesit yüzünde iki zarın kalınlığı
  const kapsulYol = (L, R, ters = false) => {
    const p = profil(L, R), t = [...p.map(([a, b]) => new THREE.Vector2(a, b)), ...p.slice().reverse().map(([a, b]) => new THREE.Vector2(-a, b))];
    return ters ? t.reverse() : t;
  };
  const halka = (L1, R1, L2, R2) => { const s = new THREE.Shape(kapsulYol(L1, R1)); s.holes.push(new THREE.Path(kapsulYol(L2, R2, true))); return new THREE.ShapeGeometry(s, 4); };
  const kesitMalz = fizikMalz(0xffd9c2, { roughness: 0.4, clearcoat: 0.6, side: THREE.DoubleSide });
  const h1 = new THREE.Mesh(halka(ML + 0.04, MR + 0.02, ML - 0.16, MR - 0.08), kesitMalz);
  const h2 = new THREE.Mesh(halka(IL + 0.1, IR + 0.05, IL - 0.08, IR - 0.04), kesitMalz);
  h1.position.z = h2.position.z = 0.003; mito.add(h1, h2);
  // kristalar: iç zarın raf gibi içeri katlanmaları (dönüşümlü üstten ve alttan)
  const W = 0.58 * IR, KRISTA = [];
  const kristaGeo = (s, tohum) => {
    const sk = new THREE.Shape(), n = 12, d = 0.9 * IR;
    for (let k = 0; k <= n; k++) { const v = (-d * k) / n, x = Math.sqrt(IR * IR - v * v) - 0.03; if (k) sk.lineTo(s * x, v); else sk.moveTo(s * x, v); }
    for (let k = n; k >= 0; k--) { const v = (-d * k) / n, x = Math.sqrt(IR * IR - v * v) - W * (1 - 0.35 * (k / n) ** 2); sk.lineTo(s * x, v); }
    const geo = new THREE.ExtrudeGeometry(sk, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3, curveSegments: 4 });
    geo.rotateX(Math.PI / 2); geo.translate(0, 0.07, 0);
    return organiklestir(geo, { genlik: 0.025, olcek: 3, tohum });
  };
  const atpSentaz = coklu(new THREE.SphereGeometry(0.045, 8, 6), fizikMalz(0xffe9a8, { roughness: 0.4 }), 9 * 18);
  let ai = 0;
  for (let k = 0; k < 9; k++) {
    const yc = -2.2 + k * 0.55, s = k % 2 ? -1 : 1;
    const m = new THREE.Mesh(kristaGeo(s, k), icZar); m.position.y = yc; m.castShadow = true; mito.add(m);
    KRISTA.push(V(M.x - yc, M.y + s * (IR - W * 0.8), M.z - 0.15));
    for (let j = 0; j < 18; j++) {
      const v = -0.05 - r() * 0.9 * IR * 0.85, xo = Math.sqrt(IR * IR - v * v) - 0.05 - r() * W * 0.85;
      koy(atpSentaz, ai++, s * xo, yc + (j % 2 ? 0.11 : -0.11), v);
    }
  }
  atpSentaz.userData.bitir(); mito.add(atpSentaz);
  // matriks parçacıkları ve halkasal DNA
  const tanecik = coklu(new THREE.IcosahedronGeometry(0.05, 0), fizikMalz(0x5a2a2a, { roughness: 0.6 }), 70);
  for (let i = 0; i < 70; i++) koy(tanecik, i, (r() - 0.5) * 1.3, (r() - 0.5) * 6.0, -0.2 - r() * 1.1);
  tanecik.userData.bitir(); mito.add(tanecik);
  const dna = new THREE.Mesh(organiklestir(new THREE.TorusGeometry(0.26, 0.018, 6, 48), { genlik: 0.05, olcek: 5 }), fizikMalz(0x6fd3ff, { roughness: 0.3 }));
  dna.position.set(0.15, -2.95, -0.6); mito.add(dna);

  // glikoliz enzimleri (sitoplazmada)
  const yolE = new THREE.CatmullRomCurve3([V(-7.0, 0.5, 0.9), V(-5.9, 0.95, 1.3), V(-4.6, 0.85, 1.25), V(-3.4, 0.5, 0.9)]);
  const enzimMalz = fizikMalz(0xa58ad8, { roughness: 0.35, clearcoat: 0.5, emissive: new THREE.Color(0x6a4cc0), emissiveIntensity: 0 });
  const enzimler = coklu(organiklestir(new THREE.SphereGeometry(0.19, 20, 14), { genlik: 0.06, olcek: 5, tohum: 6 }), enzimMalz, 10, { golge: true });
  const ENZ = [];
  for (let i = 0; i < 10; i++) { const p = yolE.getPointAt((i + 0.5) / 10); ENZ.push(V(p.x, p.y - 0.5, p.z - 0.05)); koy(enzimler, i, p.x, p.y - 0.5, p.z - 0.05, { s: [0.9 + 0.3 * r(), 0.8 + 0.2 * r(), 1], ry: r() * 6, rx: r() }); }
  enzimler.userData.bitir(); g.add(enzimler);
  const G0 = yolE.getPointAt(0), P = yolE.getPointAt(1), ARA = yolE.getPointAt(0.5);
  const A = V(M.x - 2.85, M.y, M.z - 0.45), K = V(M.x + 0.4, M.y, M.z - 0.45);

  // Krebs döngüsü: matrikste dönen halka
  const krebs = new THREE.Group(); krebs.position.copy(K); krebs.visible = false; g.add(krebs);
  const krebsMalz = new THREE.MeshStandardMaterial({ color: 0xffb547, emissive: 0xff8a1a, emissiveIntensity: 0.6, roughness: 0.35 });
  krebs.add(new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.065, 14, 64), krebsMalz));
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3, uc = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 14), krebsMalz);
    uc.position.set(0.58 * Math.cos(a), 0.58 * Math.sin(a), 0); uc.rotation.z = a + Math.PI; krebs.add(uc);
  }

  // glikozun karbonları
  const karbonMalz = fizikMalz(0x2f3136, { roughness: 0.3, clearcoat: 0.8 });
  const karbonGeo = new THREE.SphereGeometry(0.17, 20, 14);
  const karbonlar = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(karbonGeo, karbonMalz); m.castShadow = true; m.visible = false; g.add(m); return m; });
  const D = 0.34;
  const KONUM = [
    (i) => V(G0.x - 0.85 + i * D, G0.y + 0.15, G0.z),
    (i) => (i < 3 ? V(P.x - D + i * D, P.y + 0.45, P.z) : V(P.x - D + (i - 3) * D, P.y - 0.2, P.z + 0.25)),
    (i) => (i === 2 || i === 5 ? null : V(A.x - D / 2 + (i % 3) * D, A.y + (i < 3 ? 0.38 : -0.38), A.z)),
    () => null, () => null,
  ];
  let kEvre = 4, kT0 = -10;
  const kBas = karbonlar.map(() => V(0, 0, 0)), kHed = karbonlar.map(() => null);
  const bekleyen = [];
  function karbonEvre(e, { anlik = false } = {}) {
    const onceki = kEvre; kEvre = e;
    karbonlar.forEach((m, i) => {
      const h = KONUM[Math.min(e, 4)](i);
      if (anlik || !m.visible) {
        kHed[i] = null; m.visible = !!h; m.scale.setScalar(1);
        if (h) m.position.copy(h);
        return;
      }
      kBas[i].copy(m.position);
      kHed[i] = h || (e === 2 ? A.clone() : K.clone());
    });
    kT0 = simdi();
    if (anlik) return;
    if (e === 2 && onceki === 1) bekleyen.push({ t: simdi() + 1.1, at: A, n: 2 });
    if (e === 3 && onceki === 2) bekleyen.push({ t: simdi() + 1.1, at: K, n: 4 });
  }
  const zincirA = nokta(g, 0, 0, 0), zincirB = nokta(g, 0, 0, 0);

  // CO₂ molekülleri
  const co2Geo = CO2_GEO(), co2Malz = molekulMalz();
  const CO2 = Array.from({ length: 12 }, () => { const m = new THREE.Mesh(co2Geo, co2Malz); m.visible = false; g.add(m); return { m, t0: 0, bas: V(0, 0, 0), hed: V(0, 0, 0) }; });
  let co2Sira = 0;
  function co2Sal(at, n) {
    for (let j = 0; j < n; j++) {
      const c = CO2[co2Sira++ % CO2.length];
      c.t0 = simdi() + j * 0.25; c.bas.copy(at); c.hed.set(at.x + (r() - 0.5) * 3, at.y + 3.2 + r(), at.z + 1.8 + r());
      c.m.visible = true; c.m.scale.setScalar(0.001);
    }
  }

  // O₂ → kristalar → H₂O; ATP parçacıkları
  const NO = 16, O2m = coklu(O2_GEO(), molekulMalz(), NO), SUm = coklu(SU_GEO(), molekulMalz(), NO);
  const O2p = Array.from({ length: NO }, (_, i) => ({ u: i / NO, bas: V(0, 0, 0), hed: V(0, 0, 0), su: 2, suBas: V(0, 0, 0) }));
  const o2Yeni = (q) => { q.bas.set(M.x + (r() - 0.5) * 7, M.y + 3.4 + r(), M.z + 1.6 + r()); q.hed.copy(KRISTA[Math.floor(r() * KRISTA.length)]); };
  O2p.forEach(o2Yeni);
  g.add(O2m, SUm);
  const NA = 40, ATPm = coklu(new THREE.IcosahedronGeometry(0.075, 1), malzeme.isik(0xfff0a0, 1.2), NA);
  const ATPp = Array.from({ length: NA }, (_, i) => ({ u: 1 + i / NA, bas: V(0, 0, 0), hed: V(0, 0, 0), aktif: false }));
  g.add(ATPm);

  // 3. adım: besin kaynakları
  const hekzGeo = HEKZ_GEO(), hekzMalz = molekulMalz();
  const Gk = V(-7.3, 0.1, 3.0), Ns = V(-5.6, -1.45, 4.5), Gj = V(-3.3, -1.35, 4.6), Ly = V(-0.4, -1.15, 4.2), Pr = V(2.8, -1.25, 4.1);
  const glikozlar = [];
  for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(hekzGeo, hekzMalz); m.position.set(Gk.x + (r() - 0.5) * 1.2, Gk.y + (r() - 0.5) * 0.8, Gk.z + (r() - 0.5) * 1.2); m.rotation.set(r() * 3, r() * 3, 0); g.add(m); glikozlar.push(m); }
  const nisasta = coklu(hekzGeo, hekzMalz, 10);
  for (let i = 0; i < 10; i++) koy(nisasta, i, Ns.x - 1.6 + i * 0.36, Ns.y + 0.05 * Math.sin(i), Ns.z + 0.25 * Math.sin(i * 0.9), { rx: 0.3, ry: i * 0.5 });
  nisasta.userData.bitir(); g.add(nisasta);
  const glikojen = coklu(new THREE.IcosahedronGeometry(0.075, 1), fizikMalz(0xfff1b0, { roughness: 0.35, clearcoat: 0.5 }), 130);
  { let j = 0; for (let b = 0; b < 10; b++) { const a = (b / 10) * Math.PI * 2, e = 0.2 + r() * 0.9; for (let k = 0; k < 13; k++) { const t = 0.12 + k * 0.07, sap = 0.15 * Math.sin(k * 0.8 + b); koy(glikojen, j++, Gj.x + Math.cos(a + sap) * Math.cos(e) * t * 1.4, Gj.y + 0.05 + Math.sin(e) * t, Gj.z + Math.sin(a + sap) * Math.cos(e) * t * 1.4); } } }
  glikojen.userData.bitir(); g.add(glikojen);
  const yag = new THREE.Mesh(new THREE.SphereGeometry(0.95, 48, 32), fizikMalz(0xf4c14a, { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.5, sheenColor: new THREE.Color(0xfff0b0) }));
  yag.position.copy(Ly); yag.castShadow = true; g.add(yag);
  const pYol = [Pr.clone()];
  for (let i = 0; i < 46; i++) { const o = pYol[i]; pYol.push(V(o.x + (r() - 0.5) * 0.42 - (o.x - Pr.x) * 0.12, o.y + (r() - 0.5) * 0.42 - (o.y - Pr.y) * 0.12, o.z + (r() - 0.5) * 0.42 - (o.z - Pr.z) * 0.12)); }
  const protein = new THREE.Mesh(borudanGeo(pYol, 0.075, { bolum: 320, cevre: 8 }), fizikMalz(0xff8a8a, { roughness: 0.35, clearcoat: 0.5 }));
  protein.castShadow = true; g.add(protein);
  const AK = {
    glikoz: [akis(g, yay(Gk, G0, 0.5), 0xffe066)],
    nisasta: [akis(g, yay(Ns, G0), 0xffe066)],
    glikojen: [akis(g, yay(Gj, G0), 0xffe066)],
    gliserol: [akis(g, yay(Ly, ARA, 1.0), 0xffb547)],
    yagAsidi: [akis(g, yay(Ly, A, 1.8), 0xffb547)],
    aminoAsit: [akis(g, yay(Pr, P, 1.4), 0xff8a8a), akis(g, yay(Pr, A, 1.2), 0xff8a8a), akis(g, yay(Pr, K, 1.6), 0xff8a8a), akis(g, [Pr, V(Pr.x + 1.6, Pr.y + 1.5, Pr.z + 0.6), V(Pr.x + 3.6, Pr.y + 0.9, Pr.z + 0.4)], 0x7fc8ff, { n: 8, hiz: 0.18 })],
  };
  for (const l of Object.values(AK)) akislar.push(...l);

  // 9. adım: ATP harcayan yapılar — kaba ER, serbest ribozom, Ca²⁺ pompası
  const er = new THREE.Group(); er.position.set(6.6, -0.95, 1.8); er.rotation.y = -0.45; g.add(er);
  const erMalz = fizikMalz(0x9fb4e8, { roughness: 0.35, clearcoat: 0.5, sheen: 0.5, sheenColor: new THREE.Color(0xd8e4ff) });
  const ribozomMalz = fizikMalz(0x5b3f8f, { roughness: 0.4 });
  const erRib = coklu(new THREE.IcosahedronGeometry(0.055, 1), ribozomMalz, 3 * 60);
  let ri = 0;
  for (let j = 0; j < 3; j++) {
    const b = new THREE.BoxGeometry(3.6, 0.16, 1.5, 36, 1, 10), bp = b.attributes.position;
    const dalga = (x) => 0.22 * Math.sin(x * 1.8 + j);
    for (let i = 0; i < bp.count; i++) bp.setY(i, bp.getY(i) + dalga(bp.getX(i)));
    const kese = new THREE.Mesh(organiklestir(b, { genlik: 0.04, olcek: 2, tohum: j }), erMalz);
    kese.position.y = j * 0.42; kese.castShadow = true; er.add(kese);
    for (let k = 0; k < 60; k++) { const x = (r() - 0.5) * 3.4, z = (r() - 0.5) * 1.4; koy(erRib, ri++, x, j * 0.42 + dalga(x) + (k % 2 ? 0.12 : -0.12), z); }
  }
  erRib.userData.bitir(); er.add(erRib);
  const caPompa = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.2, 16, 12), { genlik: 0.05, olcek: 4 }), fizikMalz(0x3fb6a8, { clearcoat: 0.5 }));
  caPompa.position.set(-0.6, 0.84 + 0.22 * Math.sin(-0.6 * 1.8 + 2) + 0.14, 0.2); er.add(caPompa);
  const caIyon = coklu(new THREE.IcosahedronGeometry(0.06, 1), fizikMalz(0xbfefff, { roughness: 0.3, clearcoat: 0.6 }), 8);
  caIyon.visible = false; er.add(caIyon);
  const R = V(4.6, 0.9, 2.7), rib = new THREE.Group(); rib.position.copy(R); g.add(rib);
  const buyuk = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.34, 20, 14).scale(1.25, 0.8, 1), { genlik: 0.05, olcek: 4, tohum: 8 }), ribozomMalz);
  const kucuk = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.24, 18, 12).scale(1.3, 0.6, 0.95), { genlik: 0.04, olcek: 4, tohum: 9 }), fizikMalz(0x7d63b5, { roughness: 0.4 }));
  kucuk.position.y = -0.36; rib.add(buyuk, kucuk);
  const mrna = new THREE.Mesh(borudanGeo([[-1.6, -0.42, 0.1], [-0.6, -0.36, 0], [0.6, -0.36, 0], [1.6, -0.48, 0.2]], 0.03), fizikMalz(0x9be37a, { roughness: 0.4 }));
  rib.add(mrna);
  const zincir = coklu(new THREE.IcosahedronGeometry(0.075, 1), fizikMalz(0xff8a8a, { roughness: 0.35, clearcoat: 0.5 }), 14);
  for (let i = 0; i < 14; i++) koy(zincir, i, 0, 0, 0, { s: 0.001 });
  zincir.userData.bitir(); rib.add(zincir);
  const MA = V(M.x, M.y + 2.0, M.z + 0.4);
  const tuketimAkis = [
    akis(g, yay(MA, R.clone().add(V(0, 0.4, 0)), 1.0), 0xfff0a0, { n: 12, hiz: 0.3 }),
    akis(g, yay(MA, V(6.2, -0.1, 2.0), 1.0), 0xfff0a0, { n: 12, hiz: 0.3 }),
    akis(g, yay(MA, zarNokta(PT, 0.9, 1.2), 1.5, -1), 0xfff0a0, { n: 16, hiz: 0.22 }),
  ];
  akislar.push(...tuketimAkis);

  // durum ve canlandırma
  const durum = { ets: 0, o2: false, glikoliz: false, krebs: false, krebsDon: true, co2Surekli: false, tuketim: false };
  let etsSimdi = 0, sonCo2 = 0;
  function ayarla(y) {
    Object.assign(durum, y);
    krebs.visible = durum.krebs;
    iyon.visible = caIyon.visible = durum.tuketim;
    for (const a of tuketimAkis) a.ac(durum.tuketim);
  }
  function sifirla() {
    ayarla({ ets: 0, o2: false, glikoliz: false, krebs: false, krebsDon: true, co2Surekli: false, tuketim: false });
    karbonEvre(4, { anlik: true });
    for (const a of akislar) a.ac(false);
    for (const c of CO2) c.m.visible = false;
    bekleyen.length = 0;
  }
  const _p = V(0, 0, 0);
  S.yerEkle("hucre", {
    grup: g, merkez: YER.hucre, arkaPlan: [0x16304a, 0x070d16], sis: [34, 80],
    isik: { gok: 0.7, gunes: 2.2, ortam: 0.9, yon: [-6, 18, 14] },
    bakislar: {
      ana: bakis("hucre", [-1.3, 7.4, 18.3], [-1.2, 0, -0.4], { min: 3, max: 36 }),
      besin: bakis("hucre", [-0.8, 8.6, 20.5], [-0.8, -0.4, 1.4], { min: 3, max: 38 }),
      tuketim: bakis("hucre", [0.8, 7.2, 19.5], [0.8, 0, 0.2], { min: 3, max: 38 }),
      genel: bakis("hucre", [11, 8.5, 15], [0, 0, -1], { min: 3, max: 40 }),
    },
  });
  S.yerKare("hucre", (dt) => {
    const t = simdi();
    // karbonlar
    const u = Math.min(1, (t - kT0) / 1.3), k = yumusak(u);
    karbonlar.forEach((m, i) => {
      if (!kHed[i]) return;
      m.position.lerpVectors(kBas[i], kHed[i], k);
      if (!KONUM[Math.min(kEvre, 4)](i)) { m.scale.setScalar(Math.max(0.001, 1 - k)); if (u >= 1) { m.visible = false; kHed[i] = null; } }
      else if (u >= 1) kHed[i] = null;
    });
    const merkez = (o, idx) => {
      const v = idx.filter((i) => karbonlar[i].visible);
      if (!v.length) return;
      o.position.set(0, 0, 0);
      for (const i of v) o.position.add(karbonlar[i].position);
      o.position.multiplyScalar(1 / v.length).y += 0.25;
    };
    merkez(zincirA, kEvre === 0 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2]); merkez(zincirB, [3, 4, 5]);
    for (let i = bekleyen.length - 1; i >= 0; i--) if (t >= bekleyen[i].t) { co2Sal(bekleyen[i].at, bekleyen[i].n); bekleyen.splice(i, 1); }
    if (durum.co2Surekli && durum.krebsDon && t - sonCo2 > 1.4) { sonCo2 = t; co2Sal(r() < 0.35 ? A : K, 1); }
    for (const c of CO2) {
      if (!c.m.visible) continue;
      const w = (t - c.t0) / 3.2;
      if (w < 0) continue;
      if (w >= 1) { c.m.visible = false; continue; }
      c.m.position.lerpVectors(c.bas, c.hed, yumusak(w));
      c.m.scale.setScalar(Math.max(0.001, Math.min(1, w * 5, (1 - w) * 4)));
      c.m.rotation.y += dt * 1.5;
    }
    // Krebs halkası ve ETS ışıltısı
    if (krebs.visible && durum.krebsDon) krebs.rotation.z -= dt * 1.4;
    krebsMalz.emissiveIntensity = durum.krebsDon ? 0.6 : 0.08;
    etsSimdi += (durum.ets - etsSimdi) * Math.min(1, dt * 3);
    icZar.emissiveIntensity = etsSimdi * (0.32 + 0.14 * Math.sin(t * 4));
    enzimMalz.emissiveIntensity = durum.glikoliz ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
    // O₂ ve su
    const calisir = durum.o2 && durum.ets > 0.5;
    O2p.forEach((q, i) => {
      if (calisir) {
        q.u += dt / 2.6;
        if (q.u >= 1) { q.su = 0; q.suBas.copy(q.hed); q.u = 0; o2Yeni(q); }
        _p.lerpVectors(q.bas, q.hed, q.u);
        koy(O2m, i, _p.x, _p.y, _p.z, { s: Math.min(1, q.u * 6, (1 - q.u) * 10), ry: t + i, rz: i });
      } else koy(O2m, i, 0, -50, 0, { s: 0.001 });
      if (q.su < 1) {
        q.su += dt / 2.2;
        koy(SUm, i, q.suBas.x, q.suBas.y - 0.5 * q.su, q.suBas.z + 1.2 * q.su, { s: Math.max(0.001, Math.min(1, q.su * 6, (1 - q.su) * 3)), ry: i + q.su * 3 });
      } else koy(SUm, i, 0, -50, 0, { s: 0.001 });
    });
    O2m.userData.bitir(); SUm.userData.bitir();
    // ATP
    ATPp.forEach((q, i) => {
      q.u += dt / 2.2;
      if (q.u >= 1) {
        q.u = r() * 0.1;
        const mitoAtp = calisir && r() < 0.85;
        q.aktif = mitoAtp || durum.glikoliz;
        if (q.aktif) {
          q.bas.copy(mitoAtp ? KRISTA[Math.floor(r() * KRISTA.length)] : ENZ[Math.floor(r() * ENZ.length)]);
          q.hed.set(q.bas.x + (r() - 0.5) * 2.4, q.bas.y + 0.6 + r() * 1.4, q.bas.z + 1.0 + r() * 1.4);
        }
      }
      if (!q.aktif) { koy(ATPm, i, 0, -50, 0, { s: 0.001 }); return; }
      _p.lerpVectors(q.bas, q.hed, yumusak(q.u));
      koy(ATPm, i, _p.x, _p.y, _p.z, { s: Math.max(0.001, Math.min(1, q.u * 6, (1 - q.u) * 4)) });
    });
    ATPm.userData.bitir();
    // besin akışları ve tüketim
    for (const a of akislar) a.kare(dt);
    glikozlar.forEach((m, i) => { m.rotation.y += dt * 0.3; m.position.y = Gk.y + 0.12 * Math.sin(t + i * 1.7); });
    if (durum.tuketim) {
      const n = Math.floor(((t * 3) % 15));
      for (let i = 0; i < 14; i++) koy(zincir, i, 0.05 * Math.sin(i * 1.3), 0.42 + i * 0.14, 0.06 * Math.cos(i), { s: i < n ? 1 : 0.001 });
      zincir.userData.bitir();
      for (let i = 0; i < 12; i++) {
        const w = (t * 0.45 + i / 12) % 1, ic = i % 2 === 0; // Na⁺ dışarı, K⁺ içeri
        const z = ic ? 1.4 - 2.8 * w : -1.4 + 2.8 * w;
        koy(iyon, i, (i % 3 - 1) * 0.12, (i % 4 - 1.5) * 0.12, z, { s: Math.min(1, w * 8, (1 - w) * 8) });
      }
      iyon.userData.bitir();
      for (let i = 0; i < 8; i++) { const w = (t * 0.5 + i / 8) % 1; koy(caIyon, i, caPompa.position.x + (i % 2 ? 0.1 : -0.1), caPompa.position.y + 0.9 - w * 0.9, caPompa.position.z + (i % 3) * 0.08, { s: Math.min(1, w * 6, (1 - w) * 6) }); }
      caIyon.userData.bitir();
    } else { for (let i = 0; i < 14; i++) koy(zincir, i, 0, 0, 0, { s: 0.001 }); zincir.userData.bitir(); }
  });

  sifirla();
  return {
    ayarla, sifirla, karbonEvre, AK,
    akisAc: (ad, b = true) => AK[ad].forEach((a) => a.ac(b)),
    noktalar: {
      zincirA, zincirB,
      sitoplazma: nokta(g, -6.2, 2.2, -0.6), mito: nokta(g, M.x + 3.0, M.y + MR - 0.1, M.z - 0.5), matriks: nokta(g, M.x - 1.2, M.y - 0.15, M.z - 0.9),
      iczar: nokta(g, KRISTA[5].x, KRISTA[5].y, KRISTA[5].z + 0.1), ets: nokta(g, KRISTA[2].x, KRISTA[2].y, KRISTA[2].z + 0.1),
      krebs: nokta(g, K.x, K.y - 0.66, K.z), dismZar: nokta(g, M.x - 2.4, M.y + MR - 0.1, M.z - 0.4),
      kGlikoliz: nokta(g, G0.x, G0.y + 0.3, G0.z), kAra: nokta(g, ARA.x, ARA.y + 0.2, ARA.z), kPiruvat: nokta(g, P.x, P.y + 0.2, P.z), kAsetil: nokta(g, A.x, A.y + 0.1, A.z),
      o2: nokta(g, M.x + 0.3, M.y + 3.4, M.z + 1.6),
      glikoz: nokta(g, Gk.x, Gk.y + 0.5, Gk.z), nisasta: nokta(g, Ns.x, Ns.y + 0.2, Ns.z), glikojen: nokta(g, Gj.x, Gj.y + 0.5, Gj.z),
      yag: nokta(g, Ly.x, Ly.y + 1.0, Ly.z), protein: nokta(g, Pr.x, Pr.y + 0.7, Pr.z), nh3: nokta(g, Pr.x + 3.6, Pr.y + 1.0, Pr.z + 0.4),
      ribozom: nokta(rib, 0, 0.35, 0), er: nokta(er, 1.2, 1.1, 0), ca: nokta(caPompa, 0, 0.2, 0), naK: nokta(pompa, 0, 0.5, 0.8), mitoAtp: nokta(g, MA.x, MA.y, MA.z),
    },
  };
}

/* =====================================================================
 * 2) Kas dokusu (büyütülmüş): kas lifleri, kesilmiş lif, kılcal damar
 * ===================================================================== */
function kasYeri(S) {
  const g = grupAt("kas"), r = rastgele(17);
  const tg = new THREE.PlaneGeometry(40, 30, 80, 60); tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position;
  for (let i = 0; i < tp.count; i++) tp.setY(i, -2.5 + fbm(tp.getX(i) * 0.2, 2, tp.getZ(i) * 0.2, { oktav: 3, tohum: 8 }) * 0.5);
  tg.computeVertexNormals();
  const taban = new THREE.Mesh(tg, dokuluMalzeme("mukoza", { renk: 0xe8c4b8, tekrar: [8, 6], kabarti: 2, puruz: 0.6, fizik: { sheen: 0.5, sheenColor: new THREE.Color(0xffe0d0) } }));
  taban.receiveShadow = true; g.add(taban);
  const LIF = 13;
  const kasMalz = dokuluMalzeme("kas", { tekrar: [1, 3], kabarti: 1.2, puruz: 0.45, fizik: { clearcoat: 0.35, clearcoatRoughness: 0.3, sheen: 0.5, sheenColor: new THREE.Color(0xff9a8a), side: THREE.DoubleSide } });
  const lifGeo = (R, kesik, tohum) => {
    const geo = new THREE.CylinderGeometry(R, R, LIF, 48, 26, kesik, kesik ? Math.PI / 2 : 0, kesik ? Math.PI : Math.PI * 2);
    geo.rotateZ(Math.PI / 2);
    return organiklestir(geo, { genlik: 0.06, olcek: 0.8, tohum });
  };
  // arkadaki sağlam lifler
  [[-1.4, -1.55, 0.95], [0.55, -1.85, 0.95], [2.4, -1.4, 0.9], [-0.6, -3.6, 1.0], [1.5, -3.8, 1.0], [3.3, -3.4, 0.9], [-2.6, -3.3, 0.9]].forEach(([y, z, R], i) => {
    const m = new THREE.Mesh(lifGeo(R, false, i + 2), kasMalz); m.position.set((r() - 0.5) * 0.6, y, z); m.castShadow = m.receiveShadow = true; g.add(m);
  });
  // önde boyuna yarıya kesilmiş lif: içinde miyofibriller ve mitokondriler
  const C = V(0, -0.4, 0.8), CR = 1.55;
  const kesik = new THREE.Mesh(lifGeo(CR, true, 1), kasMalz); kesik.position.copy(C); kesik.receiveShadow = true; g.add(kesik);
  const fibMalz = dokuluMalzeme("kas", { tekrar: [1, 8], kabarti: 0.8, puruz: 0.5, fizik: { clearcoat: 0.3 } });
  const fibGeo = new THREE.CylinderGeometry(0.075, 0.075, LIF - 0.3, 10, 1).rotateZ(Math.PI / 2);
  const FIB = [];
  for (let y = -CR + 0.12; y <= CR - 0.12; y += 0.16) {
    const zmax = Math.sqrt(Math.max(0, (CR - 0.1) ** 2 - y * y));
    for (let z = -0.06 - (Math.round(y / 0.16) % 2 ? 0.08 : 0); z > -zmax; z -= 0.17) FIB.push([y, z]);
  }
  const fib = coklu(fibGeo, fibMalz, FIB.length);
  FIB.forEach(([y, z], i) => koy(fib, i, C.x, C.y + y, C.z + z));
  fib.userData.bitir(); g.add(fib);
  const mitoMalz = fizikMalz(0x8a3a2c, { roughness: 0.45, clearcoat: 0.4, emissive: new THREE.Color(0xff8a3a), emissiveIntensity: 0 });
  const mitolar = coklu(organiklestir(new THREE.CapsuleGeometry(0.08, 0.42, 4, 10), { genlik: 0.015, olcek: 8 }).rotateZ(Math.PI / 2), mitoMalz, 44);
  const MP = [];
  for (let i = 0; i < 44; i++) { const y = (r() - 0.5) * 2 * (CR - 0.25), zmax = Math.sqrt((CR - 0.2) ** 2 - y * y); MP.push(V(C.x + (r() - 0.5) * (LIF - 2), C.y + y, C.z - 0.02 - r() * Math.min(0.5, zmax))); koy(mitolar, i, MP[i].x, MP[i].y, MP[i].z, { ry: (r() - 0.5) * 0.3 }); }
  mitolar.userData.bitir(); g.add(mitolar);
  const mpYakin = MP.reduce((b, p) => (Math.abs(p.x - 2.2) + Math.abs(p.y - C.y) < Math.abs(b.x - 2.2) + Math.abs(b.y - C.y) ? p : b), MP[0]);
  // laktik asit (kesit yüzünde birikir)
  const NL = 200, laktat = coklu(new THREE.IcosahedronGeometry(0.06, 1), fizikMalz(0xff9aa8, { roughness: 0.3, clearcoat: 0.7, emissive: new THREE.Color(0x601020), emissiveIntensity: 0.4 }), NL);
  const LP = Array.from({ length: NL }, () => { const y = (r() - 0.5) * 2 * (CR - 0.2); return V(C.x + (r() - 0.5) * (LIF - 1.5), C.y + y, C.z + 0.04 - r() * 0.3); });
  g.add(laktat);
  // kılcal damar ve alyuvarlar
  const kEgri = new THREE.CatmullRomCurve3([V(-7.5, 1.55, 0.3), V(-3.5, 1.35, 0.55), V(0.5, 1.6, 0.25), V(4.0, 1.38, 0.5), V(7.5, 1.6, 0.3)]);
  const kilcal = new THREE.Mesh(new THREE.TubeGeometry(kEgri, 160, 0.38, 24, false), fizikMalz(0xff8f8f, { transparent: true, opacity: 0.36, roughness: 0.25, clearcoat: 0.8, depthWrite: false, sheen: 0.5, sheenColor: new THREE.Color(0xffc0c0), side: THREE.DoubleSide }));
  kilcal.renderOrder = 3; g.add(kilcal);
  const ayGeo = donel([[0.001, -0.045], [0.08, -0.05], [0.16, -0.08], [0.22, -0.09], [0.26, -0.07], [0.28, 0], [0.26, 0.07], [0.22, 0.09], [0.16, 0.08], [0.08, 0.05], [0.001, 0.045]], 28);
  const NAY = 40, alyuvar = coklu(ayGeo, fizikMalz(0xc8262e, { roughness: 0.35, clearcoat: 0.6, sheen: 0.3 }), NAY);
  const AY = Array.from({ length: NAY }, (_, i) => ({ u: i / NAY, dy: (r() - 0.5) * 0.3, dz: (r() - 0.5) * 0.3, rx: r() * 3, ry: r() * 3 }));
  g.add(alyuvar);
  const NO = 30, o2m = coklu(O2_GEO(), molekulMalz(), NO), glm = coklu(HEKZ_GEO(0.7), molekulMalz(), 16);
  const O2p = Array.from({ length: NO }, (_, i) => ({ u: i / NO, bas: V(0, 0, 0), hed: V(0, 0, 0) }));
  const GLp = Array.from({ length: 16 }, (_, i) => ({ u: i / 16, bas: V(0, 0, 0), hed: V(0, 0, 0) }));
  const yeni = (q) => { kEgri.getPointAt(0.1 + r() * 0.8, q.bas); q.hed.copy(MP[Math.floor(r() * MP.length)]).add(V(0, 0, 0.15)); };
  O2p.forEach(yeni); GLp.forEach(yeni);
  g.add(o2m, glm);

  const durum = { oks: 0, ferm: 0, laktat: 0, kosuyor: false };
  const _p = V(0, 0, 0);
  S.yerEkle("kas", {
    grup: g, merkez: YER.kas, arkaPlan: [0x3a1c22, 0x12080a], sis: [24, 55],
    isik: { gok: 0.6, gunes: 2.4, ortam: 0.85, yon: [-5, 18, 14] },
    bakislar: { ana: bakis("kas", [1.0, 5.6, 15], [0.3, -1.0, 0.2], { min: 3, max: 32 }) },
  });
  S.yerKare("kas", (dt) => {
    const t = simdi(), hz = durum.kosuyor ? 1 + 1.5 * (durum.oks + durum.ferm) : 0.6;
    AY.forEach((q, i) => {
      q.u = (q.u + dt * 0.05 * hz) % 1;
      kEgri.getPointAt(q.u, _p);
      koy(alyuvar, i, _p.x, _p.y + q.dy, _p.z + q.dz, { rx: q.rx + t * 0.5, ry: q.ry });
    });
    alyuvar.userData.bitir();
    const oran = Math.min(1, durum.oks), gRate = Math.min(1, (durum.oks / 30 + durum.ferm / 2) * 2.2);
    O2p.forEach((q, i) => {
      q.u += dt / 1.7;
      if (q.u >= 1) { q.u = 0; yeni(q); q.aktif = r() < Math.max(0.12, oran); }
      if (!q.aktif) { koy(o2m, i, 0, -50, 0, { s: 0.001 }); return; }
      _p.lerpVectors(q.bas, q.hed, q.u);
      koy(o2m, i, _p.x, _p.y, _p.z, { s: 0.8 * Math.min(1, q.u * 6, (1 - q.u) * 8), ry: t + i });
    });
    o2m.userData.bitir();
    GLp.forEach((q, i) => {
      q.u += dt / 2.2;
      if (q.u >= 1) { q.u = 0; yeni(q); q.aktif = r() < Math.max(0.08, gRate); }
      if (!q.aktif) { koy(glm, i, 0, -50, 0, { s: 0.001 }); return; }
      _p.lerpVectors(q.bas, q.hed, q.u);
      koy(glm, i, _p.x, _p.y, _p.z, { s: Math.min(1, q.u * 6, (1 - q.u) * 8), rx: t + i, ry: i });
    });
    glm.userData.bitir();
    mitoMalz.emissiveIntensity = 0.1 + 0.9 * oran * (0.8 + 0.2 * Math.sin(t * 5));
    const n = Math.min(NL, Math.round(durum.laktat * 3.5));
    for (let i = 0; i < NL; i++) { const p = LP[i]; koy(laktat, i, p.x + 0.03 * Math.sin(t * 2 + i), p.y + 0.03 * Math.cos(t * 1.7 + i), p.z, { s: i < n ? 1 : 0.001 }); }
    laktat.userData.bitir();
  });
  return {
    ayarla: (y) => Object.assign(durum, y),
    noktalar: {
      lif: nokta(g, -2.4, C.y + CR + 0.05, C.z - 0.9), kesit: nokta(g, 3.4, C.y - 0.5, C.z), mito: nokta(g, mpYakin.x, mpYakin.y, mpYakin.z + 0.1),
      kilcal: nokta(g, -0.6, 2.0, 0.4), laktat: nokta(g, -2.2, C.y + 0.5, C.z + 0.05), lifArka: nokta(g, 4.5, 0.4, -3.3),
    },
  };
}

/* =====================================================================
 * 3) Laboratuvar: su banyolarında dört maya şişesi, ağızlarında balon
 * ===================================================================== */
function labYeri(S) {
  const g = grupAt("lab"), r = rastgele(19);
  masa(g, { gen: 30, der: 14 });
  fayans(g, { gen: 30, yuk: 9, z: -6.5 });
  const X = [-5.4, -1.8, 1.8, 5.4], RENK = [0x4fc3f7, 0x5ad38b, 0xffb547, 0xb89cff];
  const siseGeo = donel([[0.001, 0], [0.46, 0], [0.54, 0.05], [0.57, 0.18], [0.57, 1.12], [0.52, 1.36], [0.34, 1.58], [0.2, 1.74], [0.17, 1.86], [0.17, 2.14], [0.21, 2.17], [0.21, 2.24], [0.15, 2.26]], 40);
  const SY = 0.9;
  const siviGeo = donel([[0.001, 0.03], [0.46, 0.03], [0.535, 0.08], [0.55, 0.18], [0.55, SY], [0.001, SY]], 40);
  const TW = 3.0, TH = 1.35, TD = 2.4, SX = -0.3;
  const NK = 36, kab = coklu(new THREE.SphereGeometry(0.03, 8, 6), fizikMalz(0xffffff, { roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.75 }), 4 * NK);
  kab.renderOrder = 2; g.add(kab);
  const KB = Array.from({ length: 4 * NK }, () => ({ u: r(), x: (r() - 0.5) * 0.8, z: (r() - 0.5) * 0.8 }));
  const soguk = new THREE.Color(0x9fd6ff), sicak = new THREE.Color(0xff9a6a), c = new THREE.Color();
  const balonProfil = (s) => {
    const p = [[0.215, 0], [0.215, 0.26]];
    for (const [rr, y] of [[0.24, 0.32], [0.32, 0.4], [0.42, 0.52], [0.48, 0.68], [0.5, 0.85], [0.47, 1.02], [0.38, 1.16], [0.24, 1.27], [0.001, 1.32]]) p.push([0.215 + (rr - 0.215) * s, 0.26 + (y - 0.26) * s]);
    return p;
  };
  const siseler = X.map((x, i) => {
    const grup = new THREE.Group(); grup.position.set(x, 0, 0.2); g.add(grup);
    const tank = new THREE.Mesh(acikKutuGeo(TW, TH, TD), camMalz(0xe0f0ff, 0.14)); tank.position.y = TH / 2; tank.renderOrder = 4; grup.add(tank);
    for (const [w, d, px, pz] of [[TW, 0.06, 0, TD / 2], [TW, 0.06, 0, -TD / 2], [0.06, TD, TW / 2, 0], [0.06, TD, -TW / 2, 0]]) {
      const kenar = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.06, d + 0.04), malzeme.metal(0xaab4be, { puruz: 0.3 })); kenar.position.set(px, TH, pz); grup.add(kenar);
    }
    const suMalz = siviMalz(0x8fc8ff, 0.3);
    const su = new THREE.Mesh(new THREE.BoxGeometry(TW - 0.06, TH * 0.78, TD - 0.06), suMalz); su.position.y = TH * 0.39 + 0.02; su.renderOrder = 1; grup.add(su);
    const siviM = siviMalz(0xe6c98a, 0.88);
    const sivi = new THREE.Mesh(siviGeo, siviM); sivi.position.set(SX, 0.03, 0); sivi.renderOrder = 2; grup.add(sivi);
    const sise = new THREE.Mesh(siseGeo, camMalz(0xf4fbff, 0.2)); sise.position.set(SX, 0.03, 0); sise.renderOrder = 5; sise.castShadow = true; grup.add(sise);
    const kopuk = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.54, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), { genlik: 0.05, olcek: 6, tohum: i }), fizikMalz(0xfff3dc, { roughness: 0.85, sheen: 0.6 }));
    kopuk.position.set(SX, 0.03 + SY - 0.02, 0); kopuk.scale.set(1, 0.05, 1); kopuk.renderOrder = 3; grup.add(kopuk);
    const balonK = new THREE.Group(); balonK.position.set(SX, 0.03 + 2.0, 0); grup.add(balonK);
    const balonMalz = malzeme.plastik(RENK[i], { puruz: 0.3, parlak: 0.8 });
    const balon = new THREE.Mesh(donel(balonProfil(0.4), 36), balonMalz); balon.castShadow = true; balonK.add(balon);
    const tepe = nokta(balonK, 0, 0.73, 0);
    // termometre
    const termo = new THREE.Group(); termo.position.set(1.0, 0.05, -0.7); grup.add(termo);
    const tup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.1, 16), camMalz(0xffffff, 0.3)); tup.position.y = 1.15; tup.renderOrder = 5; termo.add(tup);
    const hazne = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), fizikMalz(0xe02a2a, { roughness: 0.2, clearcoat: 1 })); hazne.position.y = 0.12; termo.add(hazne);
    const sutun = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 10).translate(0, 0.5, 0), fizikMalz(0xe02a2a, { roughness: 0.2, clearcoat: 1 })); sutun.position.y = 0.15; termo.add(sutun);
    // buz küpleri (soğuk banyo)
    const buz = coklu(new RoundedBoxGeometry(0.34, 0.28, 0.32, 2, 0.05), fizikMalz(0xeaf6ff, { roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.55, depthWrite: false }), 5);
    for (let k = 0; k < 5; k++) koy(buz, k, 0.55 + (k % 2) * 0.35 - (k > 2 ? 1.8 : 0), TH * 0.78 - 0.05, -0.8 + k * 0.4, { ry: k, rx: 0.2 * k });
    buz.userData.bitir(); buz.visible = false; buz.renderOrder = 3; grup.add(buz);
    const d = { T: 35, maya: 5, seker: 10, co2: 0, hiz: 0, s: 0.4 };
    return { grup, suMalz, siviM, kopuk, balon, balonK, tepe, sutun, buz, d, termoUst: nokta(termo, 0, 2.25, 0), termoAlt: nokta(termo, 0, 0.0, 0.9), siseNok: nokta(grup, SX, 1.3, 0.6) };
  });
  function ayarla(i, y) {
    const s = siseler[i];
    Object.assign(s.d, y);
    c.copy(soguk).lerp(sicak, Math.min(1, Math.max(0, (s.d.T - 15) / 50)));
    s.suMalz.color.copy(c);
    s.sutun.scale.y = 0.05 + 1.85 * Math.min(1, s.d.T / 75);
    s.buz.visible = s.d.T <= 5;
    s.siviM.color.set(s.d.maya ? 0xe6c98a : s.d.seker ? 0xf3ecd6 : 0xd8ecff);
    s.siviM.opacity = s.d.maya ? 0.9 : 0.55;
    const hedef = Math.max(0.4, 0.25 + 0.2 * Math.cbrt(s.d.co2));
    if (Math.abs(hedef - s.d.s) > 0.01) { s.d.s = hedef; s.balon.geometry.dispose(); s.balon.geometry = donel(balonProfil(hedef), 36); s.tepe.position.y = 0.26 + 1.06 * hedef + 0.05; }
    const sarkma = 1 - Math.min(1, (s.d.s - 0.4) / 0.5);
    s.balonK.rotation.z = 0.9 * sarkma; s.balonK.rotation.x = 0.25 * sarkma;
  }
  S.yerEkle("lab", {
    grup: g, merkez: YER.lab, arkaPlan: [0x2a3444, 0x0e131b],
    isik: { gok: 0.65, gunes: 2.5, ortam: 0.9, yon: [-6, 20, 14] },
    bakislar: { ana: bakis("lab", [0, 9.5, 19.8], [0, 0.1, 0], { min: 3, max: 36 }) },
  });
  S.yerKare("lab", (dt) => {
    const t = simdi();
    siseler.forEach((s, i) => {
      const k = Math.min(1, s.d.hiz / 14);
      s.kopuk.scale.y += (0.05 + 0.6 * k - s.kopuk.scale.y) * Math.min(1, dt * 2);
      for (let j = 0; j < NK; j++) {
        const q = KB[i * NK + j], aktif = j < Math.round(NK * k);
        q.u = (q.u + dt * (0.6 + 0.6 * k)) % 1;
        const x = X[i] + SX + q.x * (0.6 - 0.1 * q.u), z = 0.2 + q.z * 0.6, y = 0.12 + q.u * (SY - 0.12);
        koy(kab, i * NK + j, x + 0.02 * Math.sin(t * 6 + j), y, z, { s: aktif ? 0.6 + 0.6 * q.u : 0.001 });
      }
    });
    kab.userData.bitir();
  });
  siseler.forEach((_, i) => ayarla(i, {}));
  return { ayarla, noktalar: { balon: siseler.map((s) => s.tepe), termo: siseler.map((s) => s.termoUst), termoAlt: siseler.map((s) => s.termoAlt), sise: siseler.map((s) => s.siseNok) } };
}

/* =====================================================================
 * 4) Mutfak: fermente ürünler, 1 g'lık besin örnekleri, günlük tabak
 * ===================================================================== */
function mutfakYeri(S) {
  const g = grupAt("mutfak"), r = rastgele(23);
  masa(g, { gen: 30, der: 13, ad: "mermer", tekrar: [3, 1.3] });
  fayans(g, { gen: 30, yuk: 9, z: -6.5, renk: 0xf3ecdc });
  const seramik = dokuluMalzeme("seramik", { puruz: 0.25, kabarti: 0.2, fizik: { clearcoat: 0.9, clearcoatRoughness: 0.1 } });
  const kaseGeo = (rr = 0.8, h = 0.55) => donel([[0.001, 0], [rr * 0.45, 0], [rr * 0.5, 0.03], [rr * 0.62, 0.08], [rr * 0.85, h * 0.45], [rr, h], [rr * 0.95, h + 0.02], [rr * 0.82, h * 0.5], [rr * 0.42, 0.11], [0.001, 0.1]], 48);
  const tabakGeo = (rr = 1) => donel([[0.001, 0], [0.6 * rr, 0], [0.65 * rr, 0.03], [0.82 * rr, 0.06], [rr, 0.12], [rr * 1.02, 0.14], [rr * 0.98, 0.15], [rr * 0.8, 0.09], [rr * 0.62, 0.06], [0.001, 0.06]], 48);
  const bardakGeo = (rr = 0.4, h = 1.3) => donel([[0.001, 0], [rr * 0.9, 0], [rr, 0.05], [rr * 1.1, h], [rr * 1.05, h + 0.02], [rr * 0.95, 0.08], [0.001, 0.07]], 40);
  const doluSivi = (rr, h0, h1, renk, op = 0.95) => { const m = new THREE.Mesh(donel([[0.001, h0], [rr * 0.94, h0], [rr * (0.95 + 0.1 * (h1 / 1.3)), h1], [0.001, h1]], 40), siviMalz(renk, op)); m.renderOrder = 1; return m; };
  const camKap = (geo) => { const m = new THREE.Mesh(geo, camMalz(0xf4fbff, 0.18)); m.renderOrder = 4; return m; };
  const kabukMalz = (renk, ek = {}) => dokuluMalzeme("kabuk", { renk, kabarti: 2, puruz: 0.75, ...ek });
  const peynirMalz = dokuluMalzeme("ekmekIci", { taban: "#f5f1e4", koyu: "#ddd5bf", acik: "#fffdf5", benek: 0.25, olcek: 10, kabarti: 2.5, puruz: 0.6, fizik: { sheen: 0.3 } });
  const pirincMalz = dokuluMalzeme("ekmekIci", { taban: "#f6f3ea", koyu: "#ddd4bf", acik: "#ffffff", olcek: 30, benek: 0.6, kabarti: 3, puruz: 0.55 });
  const ekmekIci = dokuluMalzeme("ekmekIci", { tekrar: [0.6, 0.6], kabarti: 4, puruz: 0.95 });
  const sekilEkmek = (k) => {
    const s = new THREE.Shape();
    s.moveTo(-1.3 * k, -1.2 * k); s.lineTo(1.3 * k, -1.2 * k); s.quadraticCurveTo(1.45 * k, -1.2 * k, 1.42 * k, 0.4 * k);
    s.bezierCurveTo(1.9 * k, 0.7 * k, 1.6 * k, 1.45 * k, 0.6 * k, 1.35 * k); s.quadraticCurveTo(0, 1.55 * k, -0.6 * k, 1.35 * k);
    s.bezierCurveTo(-1.6 * k, 1.45 * k, -1.9 * k, 0.7 * k, -1.42 * k, 0.4 * k); s.quadraticCurveTo(-1.45 * k, -1.2 * k, -1.3 * k, -1.2 * k);
    return s;
  };
  const dilim = (k = 0.32, kal = 0.1) => {
    const geo = new THREE.ExtrudeGeometry(sekilEkmek(k), { depth: kal, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 2, curveSegments: 16 });
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, [ekmekIci, kabukMalz(0xffffff)]); m.castShadow = true; return m;
  };
  const yuzeyDisk = (rr, y, renk, o = {}) => { const geo = organiklestir(new THREE.CircleGeometry(rr, 40).rotateX(-Math.PI / 2), { genlik: 0.015, olcek: 6 }); const m = new THREE.Mesh(geo, fizikMalz(renk, { roughness: 0.35, clearcoat: 0.5, ...o })); m.position.y = y; return m; };
  const kaseIle = (rr, h, renk, o) => { const k = new THREE.Group(); const b = new THREE.Mesh(kaseGeo(rr, h), seramik); b.castShadow = true; k.add(b, yuzeyDisk(rr * 0.9, h * 0.82, renk, o)); return k; };
  const koyG = (m, x, y, z, ry = 0) => { m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };

  // ---- 7. adım: fermente ürünler (arka sıra)
  const UP = [[-5.1, -3.0], [-1.7, -3.0], [1.7, -3.0], [5.1, -3.0], [-3.4, -0.9], [0, -0.9], [3.4, -0.9]], U = {};
  koyG(kaseIle(0.85, 0.6, 0xfbf8f0, { sheen: 0.4 }), UP[0][0], 0, UP[0][1]); U.yogurt = nokta(g, UP[0][0], 0.75, UP[0][1]);
  {
    const t = koyG(new THREE.Mesh(tabakGeo(0.95), seramik), UP[1][0], 0, UP[1][1]);
    const p = new THREE.Mesh(organiklestir(new RoundedBoxGeometry(1.3, 0.55, 0.85, 3, 0.06), { genlik: 0.025, olcek: 4 }), peynirMalz); p.position.set(0, 0.34, 0); p.rotation.y = 0.3; p.castShadow = true; t.add(p);
    U.peynir = nokta(g, UP[1][0], 0.85, UP[1][1]);
  }
  {
    const k = new THREE.Group(); koyG(k, UP[2][0], 0, UP[2][1]);
    k.add(camKap(donel([[0.001, 0], [0.52, 0], [0.6, 0.08], [0.62, 0.2], [0.62, 1.4], [0.56, 1.55], [0.5, 1.6], [0.5, 1.72], [0.48, 1.72], [0.48, 1.6], [0.54, 1.53], [0.6, 1.4], [0.6, 0.2], [0.001, 0.06]], 40)));
    const sv = new THREE.Mesh(donel([[0.001, 0.07], [0.57, 0.07], [0.59, 0.2], [0.59, 1.42], [0.001, 1.42]], 40), siviMalz(0xd8e2a0, 0.42)); sv.renderOrder = 1; k.add(sv);
    const tursuMalz = dokuluMalzeme("kabuk", { taban: "#6b8a35", koyu: "#3d5a1c", acik: "#8aa850", olcek: 12, benek: 0.35, kabarti: 3, puruz: 0.5, fizik: { clearcoat: 0.4 } });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const s = new THREE.Mesh(organiklestir(new THREE.CapsuleGeometry(0.12, 0.85, 6, 12), { genlik: 0.025, olcek: 8, tohum: i }), i === 5 ? fizikMalz(0xd23a2a, { clearcoat: 0.7, roughness: 0.3 }) : tursuMalz); s.position.set(0.3 * Math.cos(a), 0.68, 0.3 * Math.sin(a)); s.rotation.set(0.15 * Math.sin(a), 0, 0.15 * Math.cos(a)); s.renderOrder = 0; k.add(s); }
    const kapak = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.16, 40), malzeme.metal(0xd8b04a, { puruz: 0.35 })); kapak.position.set(0.9, 0.08, 0.5); k.add(kapak);
    U.tursu = nokta(g, UP[2][0], 1.85, UP[2][1]);
  }
  {
    const k = new THREE.Group(); koyG(k, UP[3][0], 0, UP[3][1]);
    k.add(camKap(bardakGeo(0.4, 1.3)), doluSivi(0.4, 0.08, 1.05, 0x6e1233, 0.93));
    const havuc = new THREE.Mesh(organiklestir(new THREE.CylinderGeometry(0.05, 0.03, 1.2, 10), { genlik: 0.01, olcek: 10 }), fizikMalz(0x5a1a4a, { roughness: 0.5 })); havuc.position.set(0.12, 1.0, 0.05); havuc.rotation.z = -0.25; k.add(havuc);
    const sise = new THREE.Group(); sise.position.set(0.85, 0, -0.3); k.add(sise);
    sise.add(camKap(donel([[0.001, 0], [0.3, 0], [0.32, 0.05], [0.32, 1.1], [0.16, 1.4], [0.11, 1.75], [0.001, 1.75]], 32)), doluSivi(0.31, 0.06, 1.05, 0x6e1233, 0.93));
    U.salgam = nokta(g, UP[3][0], 1.55, UP[3][1]);
  }
  {
    const k = new THREE.Group(); koyG(k, UP[4][0], 0, UP[4][1]);
    const tahta = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.12, 1.4, 2, 0.04), dokuluMalzeme("ahsap", { tekrar: [1, 0.6], kabarti: 0.2, puruz: 0.6 })); tahta.position.y = 0.06; tahta.castShadow = true; k.add(tahta);
    const somun = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(1, 48, 32).scale(0.95, 0.5, 0.58), { genlik: 0.05, olcek: 2.5, tohum: 4 }), kabukMalz(0xffffff, { tekrar: [2, 2] })); somun.position.set(-0.15, 0.4, -0.1); somun.castShadow = true; k.add(somun);
    const d = dilim(0.3, 0.14); d.rotation.set(-Math.PI / 2 + 0.35, 0, 0.1); d.position.set(0.7, 0.42, 0.35); k.add(d);
    U.ekmek = nokta(g, UP[4][0], 1.05, UP[4][1]);
  }
  {
    const k = new THREE.Group(); koyG(k, UP[5][0], 0, UP[5][1]);
    k.add(camKap(donel([[0.001, 0], [0.38, 0], [0.42, 0.06], [0.42, 1.05], [0.34, 1.3], [0.2, 1.45], [0.2, 1.62], [0.001, 1.62]], 40)), doluSivi(0.4, 0.07, 1.12, 0xf8f6ef, 0.97));
    const kapak = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 24), malzeme.plastik(0x2f6fb5)); kapak.position.y = 1.66; k.add(kapak);
    U.kefir = nokta(g, UP[5][0], 1.8, UP[5][1]);
  }
  {
    const k = new THREE.Group(); koyG(k, UP[6][0], 0, UP[6][1]);
    k.add(camKap(bardakGeo(0.45, 1.1)), doluSivi(0.45, 0.08, 0.92, 0xe2c27a, 0.98));
    const tarcin = new THREE.Mesh(organiklestir(new THREE.CircleGeometry(0.46, 40).rotateX(-Math.PI / 2), { genlik: 0.01, olcek: 8 }), dokuluMalzeme("kabuk", { taban: "#e2c27a", koyu: "#8a4a20", acik: "#ecd090", benek: 0.5, olcek: 16, kabarti: 1, puruz: 0.7 }));
    tarcin.position.y = 0.925; tarcin.renderOrder = 2; k.add(tarcin);
    const leb = coklu(organiklestir(new THREE.SphereGeometry(0.075, 12, 9), { genlik: 0.012, olcek: 20 }), fizikMalz(0xe3c07a, { roughness: 0.7 }), 14);
    for (let i = 0; i < 14; i++) koy(leb, i, 0.85 + (r() - 0.5) * 0.4, 0.07 + (i > 9 ? 0.1 : 0), 0.3 + (r() - 0.5) * 0.4); leb.userData.bitir(); k.add(leb);
    U.boza = nokta(g, UP[6][0], 1.35, UP[6][1]);
  }

  // ---- 4. adım: 1 g'lık besin örnekleri (ön sol)
  const KX = [-9.4, -7.0, -4.6], KZ = 2.4, KAL = {};
  {
    const t = koyG(new THREE.Mesh(tabakGeo(0.8), seramik), KX[0], 0, KZ);
    const kup = coklu(new RoundedBoxGeometry(0.26, 0.26, 0.26, 2, 0.03), fizikMalz(0xffffff, { roughness: 0.75, sheen: 0.8, sheenColor: new THREE.Color(0xffffff) }), 7);
    [[0, 0, 0], [0.28, 0, 0.05], [-0.27, 0, 0.1], [0.05, 0, 0.3], [0.1, 0.27, 0.12], [-0.15, 0, -0.27], [0.25, 0, -0.25]].forEach(([x, y, z], i) => koy(kup, i, x, 0.2 + y, z, { ry: i * 0.4 }));
    kup.userData.bitir(); kup.castShadow = true; t.add(kup);
    KAL.karbonhidrat = nokta(g, KX[0], 0.8, KZ);
  }
  {
    const k = new THREE.Group(); koyG(k, KX[1], 0, KZ);
    k.add(camKap(kaseGeo(0.7, 0.4)), doluSivi(0.58, 0.11, 0.3, 0xd4a017, 0.8));
    const zeytin = coklu(organiklestir(new THREE.SphereGeometry(0.11, 14, 10).scale(1, 0.8, 0.8), { genlik: 0.01, olcek: 10 }), fizikMalz(0x3b4a1a, { roughness: 0.25, clearcoat: 1 }), 3);
    for (let i = 0; i < 3; i++) koy(zeytin, i, 0.85 + i * 0.22, 0.09, 0.25 - i * 0.15, { ry: i }); zeytin.userData.bitir(); k.add(zeytin);
    KAL.yag = nokta(g, KX[1], 0.75, KZ);
  }
  {
    const t = koyG(new THREE.Mesh(tabakGeo(0.8), seramik), KX[2], 0, KZ);
    const tv = new THREE.Mesh(organiklestir(new RoundedBoxGeometry(0.95, 0.28, 0.6, 3, 0.1), { genlik: 0.04, olcek: 3 }), kabukMalz(0xf3d6b8, { tekrar: [1, 1] })); tv.position.y = 0.2; tv.rotation.y = 0.4; tv.castShadow = true; t.add(tv);
    for (let i = -1; i <= 1; i++) { const iz = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.62), malzeme.mat(0x3a2210)); iz.position.set(i * 0.25, 0.145, 0); tv.add(iz); }
    KAL.protein = nokta(g, KX[2], 0.75, KZ);
  }

  // ---- 8. adım: günlük tabak, kaseler, içecekler; alınan / harcanan sütunları
  const PC = V(2.6, 0, 3.3);
  koyG(new THREE.Mesh(tabakGeo(2.0), seramik), PC.x, 0, PC.z).castShadow = true;
  const ust = 0.07;
  const SLOT = {
    0: [PC.x - 1.05, ust, PC.z - 0.55], 1: [PC.x + 0.15, ust, PC.z - 1.2], 2: [PC.x + 1.15, ust, PC.z - 0.6], 4: [PC.x, ust, PC.z + 0.05],
    6: [PC.x + 1.15, ust, PC.z + 0.55], 8: [PC.x - 0.2, ust, PC.z + 1.25], 9: [PC.x + 0.55, ust, PC.z + 1.1], 10: [PC.x - 1.15, ust, PC.z + 0.6], 12: [PC.x - 0.55, ust, PC.z - 1.25],
    3: [PC.x - 1.9, 0, PC.z - 2.4], 5: [PC.x, 0, PC.z - 2.55], 7: [PC.x + 1.9, 0, PC.z - 2.4],
    11: [PC.x + 3.0, 0, PC.z - 0.7], 13: [PC.x + 3.0, 0, PC.z + 0.7],
  };
  const yapimci = {
    0: () => { const k = new THREE.Group(); const d = dilim(0.3, 0.09); k.add(d); return k; },
    1: () => { const m = new THREE.Mesh(organiklestir(new RoundedBoxGeometry(0.5, 0.22, 0.36, 2, 0.04), { genlik: 0.012, olcek: 6 }), peynirMalz); m.position.y = 0.11; return m; },
    2: () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16).scale(1.3, 1, 1), fizikMalz(0xfffaf2, { roughness: 0.3, clearcoat: 0.6, sheen: 0.4 })); m.position.y = 0.16; return m; },
    3: () => kaseIle(0.55, 0.36, 0xe08a2e),
    4: () => { const m = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.48, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.55, 1), { genlik: 0.03, olcek: 10 }), pirincMalz); return m; },
    5: () => { const k = kaseIle(0.55, 0.36, 0x9a3f1c); const f = coklu(new THREE.SphereGeometry(0.05, 10, 8).scale(1.5, 0.9, 0.9), fizikMalz(0xf2e6cc, { roughness: 0.4, clearcoat: 0.5 }), 14); for (let i = 0; i < 14; i++) { const a = i * 2.4, rr = 0.1 + (i / 14) * 0.32; koy(f, i, rr * Math.cos(a), 0.31, rr * Math.sin(a), { ry: a }); } f.userData.bitir(); k.add(f); return k; },
    6: () => { const m = new THREE.Mesh(organiklestir(new RoundedBoxGeometry(0.62, 0.2, 0.42, 3, 0.07), { genlik: 0.03, olcek: 4 }), kabukMalz(0xf3d6b8)); m.position.y = 0.1; for (let i = -1; i <= 1; i++) { const iz = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.015, 0.44), malzeme.mat(0x3a2210)); iz.position.set(i * 0.17, 0.105, 0); iz.rotation.y = 0.4; m.add(iz); } return m; },
    7: () => kaseIle(0.55, 0.36, 0xfbf8f0, { sheen: 0.4 }),
    8: () => { const k = new THREE.Group(); const e = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.24, 32, 24).scale(1, 0.92, 1), { genlik: 0.012, olcek: 4 }), fizikMalz(0xb81e28, { roughness: 0.3, clearcoat: 0.9 })); e.position.y = 0.22; const sap = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.14, 6), malzeme.mat(0x5a3a1a)); sap.position.set(0.01, 0.48, 0); sap.rotation.z = 0.25; k.add(e, sap); return k; },
    9: () => { const k = new THREE.Group(); for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.11, 20, 14), { genlik: 0.03, olcek: 22, tohum: i }), kabukMalz(0xd8b080, { kabarti: 4 })); c.position.set((i - 1) * 0.2, 0.1, (i % 2) * 0.12); k.add(c); } return k; },
    10: () => { const k = new THREE.Group(), m = fizikMalz(0xe8b04a, { roughness: 0.6 }); for (let i = 0; i < 11; i++) { const p = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.07, 0.5, 1, 0.02), m); p.position.set((r() - 0.5) * 0.3, 0.04 + (i % 3) * 0.06, (r() - 0.5) * 0.2); p.rotation.y = (r() - 0.5) * 1.2; k.add(p); } return k; },
    11: () => { const k = new THREE.Group(); const kutu = new THREE.Mesh(donel([[0.001, 0], [0.17, 0], [0.2, 0.05], [0.2, 0.68], [0.16, 0.76], [0.001, 0.76]], 32), malzeme.metal(0xc8102e, { puruz: 0.25 })); const kap = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 24), malzeme.metal(0xc8ccd2, { puruz: 0.2 })); kap.position.y = 0.765; k.add(kutu, kap); return k; },
    12: () => { const k = new THREE.Group(), m = fizikMalz(0x4a2614, { roughness: 0.35, clearcoat: 0.5 }); for (let a = 0; a < 4; a++) for (let b = 0; b < 2; b++) { const p = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.07, 0.17, 2, 0.02), m); p.position.set((a - 1.5) * 0.18, 0.04, (b - 0.5) * 0.18); k.add(p); } return k; },
    13: () => { const k = new THREE.Group(); k.add(camKap(bardakGeo(0.3, 0.85)), doluSivi(0.3, 0.07, 0.7, 0xfbfaf4, 0.97)); const kp = yuzeyDisk(0.3, 0.72, 0xffffff, { roughness: 0.9 }); kp.renderOrder = 2; k.add(kp); return k; },
  };
  const modeller = {}, yiyecekNokta = {};
  for (const i of Object.keys(SLOT)) { modeller[i] = []; yiyecekNokta[i] = nokta(g, SLOT[i][0], SLOT[i][1] + 0.6, SLOT[i][2]); }
  const KAYMA = [[0, 0, 0], [0.12, 0.09, 0.1], [-0.1, 0.18, 0.08]];
  function tabakGoster(tabak) {
    for (const i of Object.keys(SLOT)) {
      const n = Math.min(3, tabak.get(+i) || 0);
      while (modeller[i].length < n) {
        const m = yapimci[i](), [x, y, z] = SLOT[i], [dx, dy, dz] = KAYMA[modeller[i].length];
        m.position.set(x + dx, y + dy + (m.position.y || 0), z + dz); m.rotation.y = r() * 6;
        m.traverse((o) => { if (o.isMesh) o.castShadow = true; });
        g.add(m); modeller[i].push(m);
      }
      modeller[i].forEach((m, j) => (m.visible = j < n));
    }
  }
  const SUT = [V(7.8, 0, 1.2), V(9.3, 0, 1.2)], SH = 5;
  const sutunlar = SUT.map((p, i) => {
    const k = new THREE.Group(); k.position.copy(p); g.add(k);
    const taban = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.14, 32), malzeme.plastik(0x2b3444)); taban.position.y = 0.07; k.add(taban);
    k.add(camKap(donel([[0.001, 0.14], [0.42, 0.14], [0.44, 0.2], [0.44, SH], [0.42, SH], [0.42, 0.2], [0.001, 0.16]], 32)));
    const sv = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1, 28).translate(0, 0.5, 0), siviMalz(i ? 0xffb547 : 0x5ad38b, 0.88)); sv.position.y = 0.16; sv.scale.y = 0.01; sv.renderOrder = 1; k.add(sv);
    return { sv, ust: nokta(k, 0, 0.3, 0) };
  });
  function sutunAyarla(alinan, harcanan, enFazla) {
    [alinan, harcanan].forEach((v, i) => { const h = Math.max(0.01, ((SH - 0.4) * v) / enFazla); sutunlar[i].sv.scale.y = h; sutunlar[i].ust.position.y = 0.16 + h + 0.12; });
  }
  S.yerEkle("mutfak", {
    grup: g, merkez: YER.mutfak, arkaPlan: [0x34404f, 0x141a22],
    isik: { gok: 0.7, gunes: 2.6, ortam: 0.95, yon: [-6, 20, 14] },
    bakislar: {
      urunler: bakis("mutfak", [0, 7.8, 14.2], [0, 0.7, -1.8], { min: 3, max: 34 }),
      kalori: bakis("mutfak", [-7.0, 4.8, 9.2], [-7.0, 0.35, 2.2], { min: 2, max: 30 }),
      tabak: bakis("mutfak", [5.0, 8.4, 14.8], [5.0, 0.6, 2.0], { min: 3, max: 34 }),
    },
  });
  return { tabakGoster, sutunAyarla, noktalar: { urun: U, kalori: KAL, yiyecek: yiyecekNokta, alinan: sutunlar[0].ust, harcanan: sutunlar[1].ust, tabak: nokta(g, PC.x, 0.4, PC.z + 1.9) } };
}
