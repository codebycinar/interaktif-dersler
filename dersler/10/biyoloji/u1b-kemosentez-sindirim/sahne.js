// u1b 3B dünyası: hidrotermal baca, bakteri örtüsü (büyütülmüş), laboratuvar masası (amip, küflü ekmek),
// sindirim sistemleri müzesi, açılmış ince bağırsak, bağırsak çeperi kesiti (doku dioraması)
import {
  dunyaKur, THREE, malzeme, organiklestir, yuzeyDokusu, coklu, rastgele, fbm, mergeGeometries,
  dokuluMalzeme, borudanGeo, donel, masa, molekulGeo, molekulMalz, nokta, huzme, koy, yoneDondur,
} from "../ortak/dunya3b.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const YER = { baca: [0, 0, 0], mikro: [-200, 0, 0], lab: [200, 0, 0], muze: [400, 0, 0], bagirsak: [600, 0, 0], doku: [800, 0, 0] };
const bakis = (yer, konum, hedef, ek = {}) => {
  const [x, y, z] = YER[yer];
  return { konum: [konum[0] + x, konum[1] + y, konum[2] + z], hedef: [hedef[0] + x, hedef[1] + y, hedef[2] + z], ...ek };
};
const grupAt = (yer) => { const g = new THREE.Group(); g.position.set(...YER[yer]); return g; };
const fizikMalz = (renk, o = {}) => new THREE.MeshPhysicalMaterial({ color: renk, roughness: 0.5, ...o });

export function biyoSahnesi(kap) {
  const S = dunyaKur(kap, { kameraKonum: [13, 7.5, 17], hedef: [0, 2.5, 0] });
  S.baca = bacaYeri(S);
  S.mikro = mikroYeri(S);
  S.lab = labYeri(S);
  S.muze = muzeYeri(S);
  S.bagirsak = bagirsakYeri(S);
  S.doku = dokuYeri(S);
  return S;
}

/* =====================================================================
 * 1) Hidrotermal baca: 2500 m derinlikte okyanus tabanı
 * ===================================================================== */
function bacaYeri(S) {
  const g = grupAt("baca"), r = rastgele(21);
  const BACALAR = [[-1.5, -1, 1.4, 7.2], [2.6, -2.8, 1.0, 4.8], [-4.6, 1.8, 0.8, 3.4]];
  const zeminY = (x, z) => {
    let h = fbm(x * 0.09, 0.3, z * 0.09, { oktav: 4, tohum: 5 }) * 1.8 + fbm(x * 0.55, 2, z * 0.55, { oktav: 2, tohum: 9 }) * 0.16;
    for (const [bx, bz, br] of BACALAR) h += 0.9 * br * Math.exp(-((x - bx) ** 2 + (z - bz) ** 2) / (br * br * 4));
    return h - 0.3;
  };
  // taban: bazalt, tortu
  const zg = new THREE.PlaneGeometry(110, 110, 180, 180); zg.rotateX(-Math.PI / 2);
  const zp = zg.attributes.position;
  for (let i = 0; i < zp.count; i++) zp.setY(i, zeminY(zp.getX(i), zp.getZ(i)));
  zg.computeVertexNormals();
  const zemin = new THREE.Mesh(zg, dokuluMalzeme("bazalt", { tekrar: [22, 22], puruz: 0.95, kabarti: 2.5 }));
  zemin.receiveShadow = true; g.add(zemin);
  // dağınık kayalar
  const kayaGeo = organiklestir(new THREE.IcosahedronGeometry(1, 3), { genlik: 0.35, olcek: 1.4, tohum: 4 });
  const kayalar = coklu(kayaGeo, dokuluMalzeme("bazalt", { tekrar: [1, 1], kabarti: 3 }), 70, { golge: true });
  for (let i = 0; i < 70; i++) {
    const a = r() * 6.28, d = 5 + r() * 26, x = Math.cos(a) * d, z = Math.sin(a) * d, s = (0.2 + r() ** 2 * 1.3) * Math.min(1, d / 14);
    koy(kayalar, i, x, zeminY(x, z) + s * 0.2, z, { rx: r() * 3, ry: r() * 6, s: [s * (0.8 + r() * 0.6), s * 0.6, s] });
  }
  kayalar.userData.bitir(); g.add(kayalar);

  // bacalar: düzensiz, katmanlı sülfür kuleleri
  const bacaMalz = dokuluMalzeme("sulfur", { tekrar: [2, 4], kabarti: 3.5, puruz: 0.92 });
  const tepeler = [];
  BACALAR.forEach(([x, z, r0, h], k) => {
    const prof = [];
    for (let i = 0; i <= 22; i++) {
      const t = i / 22;
      prof.push([r0 * (1 - 0.58 * t) * (1 + 0.16 * Math.sin(t * 17 + k * 2) + 0.08 * Math.sin(t * 41)), t * h]);
    }
    prof.push([r0 * 0.3, h + 0.05], [r0 * 0.22, h - 0.4]);
    const geo = organiklestir(donel(prof, 36), { genlik: r0 * 0.16, olcek: 1.5, tohum: 7 + k });
    const m = new THREE.Mesh(geo, bacaMalz);
    const y0 = zeminY(x, z) - 0.4;
    m.position.set(x, y0, z); m.castShadow = true; m.receiveShadow = true; g.add(m);
    // raf biçimli çıkıntılar (flanş)
    for (let j = 0; j < 2 + k % 2; j++) {
      const fh = h * (0.3 + 0.25 * j), fr = r0 * (1 - 0.5 * fh / h) * 1.5;
      const f = new THREE.Mesh(organiklestir(new THREE.CylinderGeometry(fr, fr * 0.8, 0.22, 20, 2), { genlik: 0.12, olcek: 2, tohum: j + k }), bacaMalz);
      f.position.set(x + (r() - 0.5) * 0.3, y0 + fh, z + (r() - 0.5) * 0.3); f.castShadow = true; g.add(f);
    }
    // ağızdaki kızgın mineral ve sıcak su ışıltısı
    const agiz = new THREE.Mesh(new THREE.CylinderGeometry(r0 * 0.26, r0 * 0.2, 0.12, 16), malzeme.isik(0xff6a1a, 1.2));
    agiz.position.set(x, y0 + h - 0.02, z); g.add(agiz);
    const isik = new THREE.PointLight(0xff7a30, 6, 9, 2); isik.position.set(x, y0 + h + 0.6, z); g.add(isik);
    tepeler.push(V(x, y0 + h + 0.05, z));
  });

  // siyah duman
  const N = 1500, poz = new Float32Array(N * 3), omur = new Float32Array(N);
  const yenile = (i) => {
    const t = tepeler[i % 3 === 0 ? 0 : i % 3];
    poz[i * 3] = t.x + (r() - 0.5) * 0.3; poz[i * 3 + 1] = t.y; poz[i * 3 + 2] = t.z + (r() - 0.5) * 0.3; omur[i] = 0;
  };
  for (let i = 0; i < N; i++) { yenile(i); omur[i] = r() * 7; poz[i * 3 + 1] += omur[i] * 1.3; poz[i * 3] += omur[i] * 0.25 + (r() - 0.5) * omur[i] * 0.3; poz[i * 3 + 2] += (r() - 0.5) * omur[i] * 0.3; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(poz, 3));
  const lekeDoku = (() => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 64;
    const c = cv.getContext("2d"), gr = c.createRadialGradient(32, 32, 2, 32, 32, 31);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cv);
  })();
  const duman = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0x24262c, size: 2.1, map: lekeDoku, transparent: true, opacity: 0.42, depthWrite: false }));
  g.add(duman);
  // deniz karı (organik parçacıklar)
  const NK = 700, kp = new Float32Array(NK * 3);
  for (let i = 0; i < NK; i++) { kp[i * 3] = (r() - 0.5) * 40; kp[i * 3 + 1] = r() * 16; kp[i * 3 + 2] = (r() - 0.5) * 40; }
  const kg = new THREE.BufferGeometry(); kg.setAttribute("position", new THREE.BufferAttribute(kp, 3));
  g.add(new THREE.Points(kg, new THREE.PointsMaterial({ color: 0xd8e6ee, size: 0.07, map: lekeDoku, transparent: true, opacity: 0.7, depthWrite: false })));

  // bakteri örtüleri: zemine yapışık beyaz-sarı keçe
  const ortuDoku = yuzeyDokusu({ taban: "#e6dfb0", koyu: "#a99c5a", acik: "#fffbe2", olcek: 10, benek: 0.45, tohum: 6 });
  const ortuMalz = new THREE.MeshStandardMaterial({ map: ortuDoku.renk, bumpMap: ortuDoku.puruz, bumpScale: 2, roughness: 1, transparent: true, opacity: 0.93 });
  const ORTU = [[0.9, 2.0, 1.7], [-3.1, -0.3, 1.3], [3.7, -0.4, 1.1], [-0.9, 3.6, 1.1], [-2.8, 3.0, 0.8]];
  for (const [cx, cz, rr] of ORTU) {
    const og = new THREE.CircleGeometry(rr, 40, 0, Math.PI * 2); og.rotateX(-Math.PI / 2);
    const p = og.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), k = 1 + 0.35 * fbm(x * 1.2 + cx, 0, z * 1.2 + cz, { tohum: 3 });
      p.setX(i, x * k); p.setZ(i, z * k);
      p.setY(i, zeminY(cx + x * k, cz + z * k) + 0.04);
    }
    og.computeVertexNormals();
    const o = new THREE.Mesh(og, ortuMalz); o.position.set(cx, 0, cz); o.receiveShadow = true; g.add(o);
  }

  // dev tüp solucanları (Riftia): halkalı beyaz tüp + kırmızı solungaç tüyü
  const halka = yuzeyDokusu({ taban: "#ece6d6", koyu: "#bdb197", acik: "#fffaf0", olcek: 3, uzama: [0.2, 6], lif: 0.6, lifSiklik: 34, benek: 0.05, tohum: 8 });
  for (const t of [halka.renk, halka.puruz]) { t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; t.repeat.set(1, 3); }
  const tupMalz = new THREE.MeshStandardMaterial({ map: halka.renk, bumpMap: halka.puruz, bumpScale: 1.5, roughness: 0.75 });
  const tuyGeo = organiklestir(new THREE.CylinderGeometry(0.11, 0.075, 0.34, 16, 6), { genlik: 0.025, olcek: 22, tohum: 2 });
  tuyGeo.translate(0, 0.17, 0);
  const tuyMalz = fizikMalz(0xc8102e, { roughness: 0.45, sheen: 1, sheenColor: new THREE.Color(0xff7080), clearcoat: 0.3 });
  const KUME = [[1.7, 1.5, 36], [-3.3, -0.1, 20], [-0.6, 3.4, 12]];
  const toplamTup = KUME.reduce((t, k) => t + k[2], 0);
  const tuyler = coklu(tuyGeo, tuyMalz, toplamTup, { golge: true });
  const tupler = [], tuyUc = [];
  let ti = 0;
  for (const [cx, cz, n] of KUME) for (let i = 0; i < n; i++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * 1.35, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    const h = 0.8 + r() * 1.9, y0 = zeminY(x, z) - 0.05, ex = (r() - 0.5) * 0.5, ez = (r() - 0.5) * 0.5;
    const yol = [V(x, y0, z), V(x + ex * 0.2, y0 + h * 0.35, z + ez * 0.2), V(x + ex * 0.6, y0 + h * 0.7, z + ez * 0.6), V(x + ex, y0 + h, z + ez)];
    tupler.push(borudanGeo(yol, 0.055 + r() * 0.025, { bolum: 14, cevre: 8 }));
    const uc = yol[3], yon = uc.clone().sub(yol[2]).normalize();
    tuyUc.push({ uc, q: yoneDondur(yon), faz: r() * 6 });
    koy(tuyler, ti++, uc.x, uc.y, uc.z, { q: tuyUc[tuyUc.length - 1].q });
  }
  const tupMesh = new THREE.Mesh(mergeGeometries(tupler), tupMalz); tupMesh.castShadow = true; g.add(tupMesh);
  tuyler.userData.bitir(); g.add(tuyler);

  // midyeler (Bathymodiolus) ve kabuklar
  const midyeGeo = organiklestir(new THREE.SphereGeometry(1, 18, 10).scale(0.17, 0.06, 0.075), { genlik: 0.012, olcek: 9, tohum: 3 });
  const midyeDoku = yuzeyDokusu({ taban: "#3b3226", koyu: "#1c1712", acik: "#6a5a3e", olcek: 4, lif: 0.4, lifSiklik: 20, benek: 0.1, tohum: 12 });
  const midyeler = coklu(midyeGeo, new THREE.MeshPhysicalMaterial({ map: midyeDoku.renk, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.25 }), 180, { golge: true });
  for (let i = 0; i < 180; i++) {
    const merk = i < 110 ? [3.6, 2.0, 1.3] : [-1.6, 1.0, 1.0];
    const a = r() * 6.28, d = Math.sqrt(r()) * merk[2], x = merk[0] + Math.cos(a) * d, z = merk[1] + Math.sin(a) * d;
    koy(midyeler, i, x, zeminY(x, z) + 0.04 + r() * 0.05, z, { rx: (r() - 0.5) * 0.8, ry: r() * 6.28, rz: (r() - 0.5) * 0.8 });
  }
  midyeler.userData.bitir(); g.add(midyeler);

  // kör, beyaz baca yengeçleri
  const yengecMalz = fizikMalz(0xf0ebdf, { roughness: 0.55, clearcoat: 0.3 });
  const yengecler = [];
  for (let k = 0; k < 5; k++) {
    const y = new THREE.Group();
    const kabuk = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.28, 24, 14).scale(1.25, 0.42, 1), { genlik: 0.02, olcek: 6, tohum: k }), yengecMalz);
    kabuk.castShadow = true; y.add(kabuk);
    const bacaklar = [];
    for (let s = -1; s <= 1; s += 2) for (let j = 0; j < 4; j++) {
      const z0 = (j - 1.5) * 0.13;
      const b = new THREE.Mesh(borudanGeo([[0, 0, 0], [0.32 * s, 0.12, z0 * 0.4], [0.5 * s, -0.12, z0 * 0.6]], 0.022, { bolum: 8, cevre: 5 }), yengecMalz);
      b.position.set(0.22 * s, -0.02, z0); y.add(b); bacaklar.push(b);
    }
    for (const s of [-1, 1]) {
      const kol = new THREE.Mesh(borudanGeo([[0.15 * s, 0, 0.25], [0.24 * s, 0.05, 0.42]], 0.03, { bolum: 4, cevre: 6 }), yengecMalz);
      const kiskac = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(1, 14, 10).scale(0.07, 0.05, 0.12), { genlik: 0.01, olcek: 9 }), yengecMalz);
      kiskac.position.set(0.26 * s, 0.05, 0.52); y.add(kol, kiskac);
    }
    y.userData = { a: r() * 6, rr: 0.8 + r() * 1.2, cx: -0.5 + r() * 4, cz: 2 + r() * 2.5, bacaklar };
    g.add(y); yengecler.push(y);
  }
  // baca karidesleri (Rimicaris): bacanın çevresinde sürü
  const karidesGeo = organiklestir(new THREE.CapsuleGeometry(0.045, 0.16, 4, 8), { genlik: 0.006, olcek: 20 });
  karidesGeo.rotateZ(Math.PI / 2);
  const karides = coklu(karidesGeo, fizikMalz(0xe8c9b6, { roughness: 0.5, sheen: 0.4 }), 70);
  const karidesV = Array.from({ length: 70 }, () => ({ a: r() * 6.28, y: 1 + r() * 4, rr: 1.15 + r() * 0.35, h: 0.3 + r() * 0.5 }));
  g.add(karides);

  // keşif denizaltısı (temsilî, Alvin benzeri)
  const dz = new THREE.Group();
  const govdeMalz = fizikMalz(0xf4f4f0, { roughness: 0.35, clearcoat: 0.8 });
  const govde = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 2.4, 10, 28), govdeMalz); govde.rotation.z = Math.PI / 2; govde.castShadow = true;
  const kule = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.7, 0.55, 4, 0.15), fizikMalz(0xd63a1f, { roughness: 0.4, clearcoat: 0.6 }));
  kule.position.set(0.2, 0.85, 0);
  const pencere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), new THREE.MeshPhysicalMaterial({ color: 0x0b1620, roughness: 0.05, metalness: 0.3, clearcoat: 1 }));
  pencere.position.set(-1.85, -0.15, 0.25);
  const kizak = new THREE.Mesh(borudanGeo([[1.4, -1.0, 0.55], [-1.4, -1.0, 0.55], [-1.7, -0.75, 0.55]], 0.06), malzeme.metal(0x8a929a));
  const kizak2 = kizak.clone(); kizak2.position.z = -1.1;
  const kol = new THREE.Mesh(borudanGeo([[-1.4, -0.6, -0.3], [-2.2, -0.9, -0.45], [-2.6, -1.4, -0.3]], 0.05), malzeme.metal(0xb0b8c0));
  const pervane = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 10, 24), malzeme.metal(0x5a6470)); pervane.position.x = 2.15; pervane.rotation.y = Math.PI / 2;
  dz.add(govde, kule, pencere, kizak, kizak2, kol, pervane);
  for (const zz of [0.45, -0.45]) {
    const lamba = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 12), malzeme.isik(0xfff3c8, 2)); lamba.rotation.z = Math.PI / 2; lamba.position.set(-1.9, -0.55, zz);
    const h = huzme(14, 2.6, 0xcfe8ff, 0.05); h.position.set(-1.9, -0.55, zz); h.rotation.z = -Math.PI / 2 - 0.55;
    dz.add(lamba, h);
  }
  dz.scale.setScalar(0.78); dz.position.set(6, 5.6, -5.5); dz.rotation.y = 0.55;
  g.add(dz);
  // derin deniz ışıkları: denizaltının projektörleri + kamera yönünden zayıf dolgu
  const projektor = new THREE.SpotLight(0xd9ecff, 320, 50, Math.PI / 6, 0.55, 1.5);
  projektor.position.set(4.5, 5, -3.5); projektor.target.position.set(-1, 1.5, 0.5); projektor.castShadow = S.kalite !== "dusuk";
  projektor.shadow.mapSize.set(1024, 1024);
  const dolgu = new THREE.SpotLight(0xbfd8ff, 160, 60, Math.PI / 5, 0.7, 1.6);
  dolgu.position.set(12, 11, 15); dolgu.target.position.set(0, 1.5, 0);
  g.add(projektor, projektor.target, dolgu, dolgu.target);

  S.yerEkle("baca", {
    grup: g, merkez: YER.baca, arkaPlan: [0x0b2a40, 0x02080f], sis: [16, 75],
    isik: { gok: 0.12, gunes: 0.18, golge: false, ortam: 0.12 },
    bakislar: {
      ana: bakis("baca", [13, 7.5, 17], [0, 2.5, 0], { min: 5, max: 40 }),
      genel: bakis("baca", [17, 11, 21], [0, 2.5, 0], { min: 5, max: 45 }),
    },
  });
  const t0 = performance.now();
  S.yerKare("baca", (dt) => {
    for (let i = 0; i < N; i++) {
      omur[i] += dt;
      poz[i * 3 + 1] += dt * (1.1 + omur[i] * 0.16);
      poz[i * 3] += dt * (0.22 + Math.sin(omur[i] * 1.7 + i) * 0.25 + Math.sin(i * 7.1) * omur[i] * 0.05);
      poz[i * 3 + 2] += dt * Math.cos(i * 3.3) * omur[i] * 0.05;
      if (omur[i] > 7) yenile(i);
    }
    dg.attributes.position.needsUpdate = true;
    for (let i = 0; i < NK; i++) { kp[i * 3 + 1] -= dt * 0.12; if (kp[i * 3 + 1] < 0) kp[i * 3 + 1] = 16; }
    kg.attributes.position.needsUpdate = true;
    const t = (performance.now() - t0) / 1000;
    tuyUc.forEach((u, i) => koy(tuyler, i, u.uc.x, u.uc.y, u.uc.z, { q: u.q, s: [1, 1 + 0.06 * Math.sin(t * 1.3 + u.faz), 1] }));
    tuyler.userData.bitir();
    karidesV.forEach((k, i) => {
      k.a += dt * 0.35 / k.rr;
      const m = tepeler[0], x = m.x + Math.cos(k.a) * k.rr, z = m.z + Math.sin(k.a) * k.rr, y = k.y + Math.sin(t + i) * k.h * 0.3;
      koy(karides, i, x, Math.min(m.y - 0.5, y), z, { ry: -k.a });
    });
    karides.userData.bitir();
    for (const y of yengecler) {
      const u = y.userData;
      u.a += dt * 0.18;
      const x = u.cx + Math.cos(u.a) * u.rr, z = u.cz + Math.sin(u.a) * u.rr;
      y.position.set(x, zeminY(x, z) + 0.16, z); y.rotation.y = -u.a;
      u.bacaklar.forEach((b, j) => (b.rotation.y = Math.sin(t * 9 + j * 1.3) * 0.25));
    }
    dz.position.y = 5.6 + Math.sin(t * 0.7) * 0.15;
  });
  return {
    noktalar: {
      baca: nokta(g, -1.5, zeminY(-1.5, -1) + 7.6, -1),
      bakteri: nokta(g, -0.9, zeminY(-0.9, 3.6) + 0.15, 3.6),
      solucan: nokta(g, 1.7, zeminY(1.7, 1.5) + 2.2, 1.5),
      midye: nokta(g, 3.6, zeminY(3.6, 2.0) + 0.25, 2.0),
      kesif: dz,
    },
  };
}

/* =====================================================================
 * 2) Bakteri örtüsünün büyütülmüş görünümü: kemosentez
 * ===================================================================== */
function mikroYeri(S) {
  const g = grupAt("mikro"), r = rastgele(31);
  const yH = (x, z) => fbm(x * 0.25, 0, z * 0.25, { oktav: 3, tohum: 2 }) * 0.9;
  const zg = new THREE.PlaneGeometry(36, 36, 120, 120); zg.rotateX(-Math.PI / 2);
  const p = zg.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, yH(p.getX(i), p.getZ(i)));
  zg.computeVertexNormals();
  const zm = new THREE.Mesh(zg, dokuluMalzeme("sulfur", { tekrar: [6, 6], kabarti: 3, acik: "#9a6a3a" }));
  zm.receiveShadow = true; g.add(zm);
  // çubuk bakteriler
  const NB = 2600;
  const bg = new THREE.CapsuleGeometry(0.11, 0.42, 4, 10); bg.rotateZ(Math.PI / 2);
  const bm = coklu(bg, fizikMalz(0xffffff, { roughness: 0.4, clearcoat: 0.5, sheen: 0.4 }), NB, { golge: true });
  const renk = new THREE.Color();
  for (let i = 0; i < NB; i++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * 9, x = Math.cos(a) * d, z = Math.sin(a) * d;
    koy(bm, i, x, yH(x, z) + 0.1 + r() * 0.12 * (1 - d / 9), z, { ry: r() * 6.28, rz: (r() - 0.5) * 0.4, s: 0.8 + r() * 0.5 });
    bm.setColorAt(i, renk.setHSL(0.12 + r() * 0.05, 0.35 + r() * 0.3, 0.72 + r() * 0.15));
  }
  bm.userData.bitir(); g.add(bm);
  // ipliksi kükürt bakterileri (Beggiatoa benzeri)
  const iplik = [];
  for (let i = 0; i < 26; i++) {
    let x = (r() - 0.5) * 14, z = (r() - 0.5) * 14, a = r() * 6.28;
    const yol = [];
    for (let k = 0; k < 9; k++) { yol.push(V(x, yH(x, z) + 0.15 + Math.max(0, Math.sin(k * 0.7)) * 0.4, z)); a += (r() - 0.5) * 0.9; x += Math.cos(a) * 0.8; z += Math.sin(a) * 0.8; }
    iplik.push(borudanGeo(yol, 0.09, { bolum: 40, cevre: 8 }));
  }
  const ipDoku = yuzeyDokusu({ taban: "#f2f0e6", koyu: "#c9c4ae", acik: "#ffffff", olcek: 18, benek: 0.6, tohum: 4 });
  const ip = new THREE.Mesh(mergeGeometries(iplik), new THREE.MeshPhysicalMaterial({ map: ipDoku.renk, roughness: 0.35, sheen: 0.8, clearcoat: 0.4 }));
  ip.castShadow = true; g.add(ip);
  // moleküller: H₂S (sarı S, beyaz H), CO₂ (koyu C, kırmızı O), üretilen besin (altıgen halka)
  const h2s = molekulGeo([[0, 0, 0, 0.24, 0xf2d24b], [0.22, 0.17, 0, 0.13, 0xf4f4f4], [-0.22, 0.17, 0, 0.13, 0xf4f4f4]]);
  const co2 = molekulGeo([[0, 0, 0, 0.2, 0x3a3a3a], [0.34, 0, 0, 0.18, 0xe04040], [-0.34, 0, 0, 0.18, 0xe04040]]);
  const besinGeo = new THREE.TorusGeometry(0.24, 0.07, 8, 6);
  const mH = coklu(h2s, molekulMalz(), 40), mC = coklu(co2, molekulMalz(), 40);
  const mB = coklu(besinGeo, fizikMalz(0x5ad38b, { roughness: 0.3, clearcoat: 0.6, emissive: 0x1d5a35, emissiveIntensity: 0.5 }), 30);
  g.add(mH, mC, mB);
  const parca = (n) => Array.from({ length: n }, () => ({ x: (r() - 0.5) * 12, y: 0.5 + r() * 4, z: (r() - 0.5) * 8, a: r() * 6, h: 0.35 + r() * 0.4 }));
  const PH = parca(40), PC = parca(40), PB = parca(30);
  S.yerEkle("mikro", {
    grup: g, merkez: YER.mikro, arkaPlan: [0x1a4058, 0x061019], sis: [14, 55],
    isik: { gok: 0.5, gunes: 1.8, ortam: 0.5, yon: [-6, 14, 8] },
    bakislar: { ana: bakis("mikro", [0, 8.2, 14], [0, 1.0, 0], { min: 3, max: 30 }) },
  });
  S.yerKare("mikro", (dt) => {
    const k = (m, L, yon) => {
      L.forEach((q, i) => {
        q.y += yon * dt * q.h; q.a += dt;
        if (yon < 0 && q.y < 0.45) { q.y = 4.6; q.x = (r() - 0.5) * 12; }
        if (yon > 0 && q.y > 4.6) { q.y = 0.4; q.x = (r() - 0.5) * 8; }
        koy(m, i, q.x + Math.sin(q.a * 0.7 + i) * 0.4, q.y, q.z, { rx: q.a * 0.6, ry: q.a, s: 0.55 });
      });
      m.userData.bitir();
    };
    k(mH, PH, -1); k(mC, PC, -1); k(mB, PB, 1);
  });
  return { noktalar: { bakteri: nokta(g, 2.2, 0.5, 2.8), iplik: nokta(g, -3, 0.9, -1.5), h2s: nokta(g, -4.2, 3.4, 1), co2: nokta(g, 4.2, 3.0, 1), besin: nokta(g, 0.6, 2.6, 2.5) }, PH, PC, PB };
}

/* =====================================================================
 * 3) Laboratuvar masası: amip (hücre içi) ve küflü ekmek (hücre dışı)
 * ===================================================================== */
function labYeri(S) {
  const g = grupAt("lab"), r = rastgele(41);
  masa(g, { gen: 30, der: 16 });
  const kaide = (x) => {
    const k = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.7, 0.22, 56), malzeme.plastik(0x1f2733, { puruz: 0.35 }));
    k.position.set(x, 0.11, 0); k.receiveShadow = true; k.castShadow = true; g.add(k);
  };
  kaide(-3.6); kaide(3.6);
  // amip: lam üstünde; şekli her karede yalancı ayaklarla değişir
  const lam = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.06, 2.8), malzeme.cam({ kalinlik: 0.06 }));
  lam.position.set(-3.6, 0.27, 0); g.add(lam);
  const amip = new THREE.Group(); amip.position.set(-3.9, 0.82, 0); g.add(amip);
  const ag = new THREE.SphereGeometry(1, 56, 36);
  const ilk = ag.attributes.position.array.slice();
  const amipMalz = new THREE.MeshPhysicalMaterial({ color: 0xa9cfe0, roughness: 0.25, transparent: true, opacity: 0.5, clearcoat: 0.6, sheen: 0.6, sheenColor: new THREE.Color(0xe0f4ff), depthWrite: false });
  const amipMesh = new THREE.Mesh(ag, amipMalz); amipMesh.renderOrder = 3; amip.add(amipMesh);
  const cekirdek = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.3, 28, 20), { genlik: 0.03, olcek: 5 }), fizikMalz(0x6d5aa0, { roughness: 0.4, clearcoat: 0.4 }));
  cekirdek.position.set(-0.55, 0.02, -0.25); amip.add(cekirdek);
  const tanecik = coklu(new THREE.SphereGeometry(0.028, 6, 4), malzeme.mat(0xdfe8c8, { puruz: 0.5 }), 220);
  for (let i = 0; i < 220; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 0.95; koy(tanecik, i, Math.cos(a) * d * 1.3, (r() - 0.5) * 0.35, Math.sin(a) * d * 0.95); }
  tanecik.userData.bitir(); amip.add(tanecik);
  const koful = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 18), new THREE.MeshPhysicalMaterial({ color: 0xcfe9ff, transparent: true, opacity: 0.35, roughness: 0.1, depthWrite: false }));
  koful.renderOrder = 2; amip.add(koful);
  const bakteri = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.26, 4, 12), fizikMalz(0x6ccf7f, { roughness: 0.4, clearcoat: 0.5 }));
  bakteri.rotation.z = Math.PI / 2 + 0.3; amip.add(bakteri);
  const lizozomlar = [0, 1, 2].map((i) => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 10), fizikMalz(0xa98be8, { emissive: 0x3a2370, emissiveIntensity: 0.6, roughness: 0.3 })); amip.add(l); return l; });
  const kucuk = coklu(new THREE.SphereGeometry(0.035, 8, 6), malzeme.isik(0xffe066, 0.6), 16); amip.add(kucuk);
  // ekmek dilimi + küf (Rhizopus benzeri)
  const sekil = new THREE.Shape();
  sekil.moveTo(-1.3, -1.2); sekil.lineTo(1.3, -1.2); sekil.quadraticCurveTo(1.45, -1.2, 1.42, 0.4);
  sekil.bezierCurveTo(1.9, 0.7, 1.6, 1.45, 0.6, 1.35); sekil.quadraticCurveTo(0, 1.55, -0.6, 1.35);
  sekil.bezierCurveTo(-1.6, 1.45, -1.9, 0.7, -1.42, 0.4); sekil.quadraticCurveTo(-1.45, -1.2, -1.3, -1.2);
  const eg = new THREE.ExtrudeGeometry(sekil, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.07, bevelSegments: 3, curveSegments: 24 });
  eg.rotateX(-Math.PI / 2);
  const ekmek = new THREE.Mesh(eg, [dokuluMalzeme("ekmekIci", { tekrar: [0.5, 0.5], kabarti: 4, puruz: 0.95 }), dokuluMalzeme("kabuk", { tekrar: [1, 1], kabarti: 2 })]);
  ekmek.position.set(3.6, 0.3, 0); ekmek.castShadow = true; ekmek.receiveShadow = true; g.add(ekmek);
  const UST = 0.3 + 0.35 + 0.02;
  // küf lekeleri
  for (const [x, z, rr] of [[3.2, -0.3, 0.6], [4.2, 0.5, 0.45], [3.7, 0.9, 0.3]]) {
    const lg = new THREE.CircleGeometry(rr, 32); lg.rotateX(-Math.PI / 2);
    const lp = lg.attributes.position; for (let i = 0; i < lp.count; i++) { const k = 1 + 0.3 * fbm(lp.getX(i) * 3, 0, lp.getZ(i) * 3); lp.setX(i, lp.getX(i) * k); lp.setZ(i, lp.getZ(i) * k); }
    const l = new THREE.Mesh(lg, new THREE.MeshStandardMaterial({ color: 0x55604f, roughness: 1, transparent: true, opacity: 0.75 }));
    l.position.set(x, UST - 0.005, z); g.add(l);
  }
  // hifler (mantar iplikleri)
  const hifler = [], uclar = [];
  for (let i = 0; i < 70; i++) {
    const merk = [[3.2, -0.3], [4.2, 0.5], [3.7, 0.9]][i % 3];
    let x = merk[0] + (r() - 0.5) * 0.6, z = merk[1] + (r() - 0.5) * 0.6, a = r() * 6.28;
    const yol = [];
    for (let k = 0; k < 7; k++) { yol.push(V(x - 3.6, UST - 0.3 + 0.03 + Math.sin(k * 0.9) * 0.05 + k * 0.01, z)); a += (r() - 0.5) * 1.2; x += Math.cos(a) * 0.14; z += Math.sin(a) * 0.14; }
    hifler.push(borudanGeo(yol, 0.012, { bolum: 18, cevre: 5 }));
    if (i % 2 === 0) uclar.push(V(x, UST + 0.02, z));
  }
  const hifMalz = new THREE.MeshPhysicalMaterial({ color: 0xeef2f4, roughness: 0.8, sheen: 1, sheenColor: new THREE.Color(0xffffff) });
  const hif = new THREE.Mesh(mergeGeometries(hifler), hifMalz); hif.position.set(3.6, 0.3, 0); g.add(hif);
  const sap = coklu(new THREE.CylinderGeometry(0.008, 0.01, 0.34, 5).translate(0, 0.17, 0), hifMalz, uclar.length);
  const kese = coklu(new THREE.SphereGeometry(0.045, 10, 8), fizikMalz(0x2a2d2a, { roughness: 0.6 }), uclar.length);
  uclar.forEach((u, i) => { const h = 0.7 + r() * 0.6; koy(sap, i, u.x, u.y, u.z, { rx: (r() - 0.5) * 0.4, rz: (r() - 0.5) * 0.4, s: [1, h, 1] }); koy(kese, i, u.x, u.y + 0.34 * h, u.z); });
  sap.userData.bitir(); kese.userData.bitir(); g.add(sap, kese);
  const enzim = coklu(new THREE.SphereGeometry(0.028, 8, 6), malzeme.isik(0xff9a3c, 0.9), 50);
  const urun = coklu(new THREE.SphereGeometry(0.026, 8, 6), malzeme.isik(0xffe066, 0.8), 50);
  g.add(enzim, urun);
  const parc = Array.from({ length: 50 }, (_, i) => ({ k: r(), u: uclar[i % uclar.length] }));

  S.yerEkle("lab", {
    grup: g, merkez: YER.lab, arkaPlan: [0x3a4458, 0x151a24],
    isik: { gok: 0.6, gunes: 2.6, ortam: 0.8 },
    bakislar: { ana: bakis("lab", [0, 10, 15], [0, 0.4, 0.3], { min: 3, max: 30 }) },
  });
  // canlandırma: 12 saniyelik amip döngüsü + sürekli enzim akışı
  const tmp = V(0, 0, 0), yalanci = [V(1, 0, 0.35).normalize(), V(1, 0, -0.35).normalize()];
  let t = 0, evre = 0;
  S.yerKare("lab", (dt) => {
    t += dt;
    const p = (t % 12) / 12;
    evre = p < 0.25 ? 0 : p < 0.45 ? 1 : p < 0.55 ? 2 : 3;
    const uzan = p < 0.05 ? 0 : p < 0.22 ? (p - 0.05) / 0.17 : p < 0.3 ? 1 - (p - 0.22) / 0.08 : 0;
    const pos = ag.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      tmp.set(ilk[i * 3], ilk[i * 3 + 1], ilk[i * 3 + 2]);
      let k = 1 + 0.09 * fbm(tmp.x * 1.8 + t * 0.25, tmp.y * 1.8, tmp.z * 1.8 - t * 0.2, { oktav: 2, tohum: 4 });
      for (const y of yalanci) k += 0.75 * uzan * Math.max(0, tmp.dot(y)) ** 10;
      k += 0.25 * Math.max(0, tmp.dot(V(-0.6, 0, 0.8).normalize())) ** 6 * (0.6 + 0.4 * Math.sin(t * 0.5));
      pos.setXYZ(i, tmp.x * k * 1.45, tmp.y * k * 0.5, tmp.z * k * 1.1);
    }
    pos.needsUpdate = true; ag.computeVertexNormals();
    // besin (bakteri) yaklaşır, kofula alınır, lizozom birleşir, parçalanır
    const bx = p < 0.25 ? 2.6 - (p / 0.25) * 1.15 : 1.45 - Math.min(1, (p - 0.25) / 0.2) * 0.95;
    bakteri.position.set(bx, -0.36, 0);
    const kucul = p > 0.55 ? Math.max(0, 1 - (p - 0.55) / 0.3) : 1;
    bakteri.scale.setScalar(Math.max(0.001, kucul));
    koful.visible = p > 0.24 && p < 0.92; koful.position.copy(bakteri.position);
    koful.material.color.set(p > 0.45 ? 0xc9b4ff : 0xcfe9ff);
    lizozomlar.forEach((l, i) => {
      const a = i * 2.1 + 0.4, bas = V(-0.2 + Math.cos(a) * 0.5, -0.15, Math.sin(a) * 0.55);
      const u = p < 0.28 ? 0 : Math.min(1, (p - 0.28) / 0.17);
      l.visible = p < 0.5;
      l.position.lerpVectors(bas, bakteri.position, u);
    });
    for (let i = 0; i < 16; i++) {
      const k = p > 0.55 ? Math.min(1, (p - 0.55) / 0.35) : 0, a = i * 0.39;
      koy(kucuk, i, bakteri.position.x + Math.cos(a) * (0.1 + 0.7 * k), -0.3 + Math.sin(i * 1.7) * 0.12, Math.sin(a) * (0.1 + 0.6 * k), { s: p > 0.55 ? 1 : 0.001 });
    }
    kucuk.userData.bitir();
    parc.forEach((q, i) => {
      q.k += dt * 0.3; if (q.k > 1) q.k -= 1;
      const dis = q.k < 0.5, kk = dis ? q.k / 0.5 : (q.k - 0.5) / 0.5;
      const x = q.u.x + Math.sin(i * 3.1) * 0.12, z = q.u.z + Math.cos(i * 2.3) * 0.12;
      if (dis) { koy(enzim, i, x, UST + 0.05 - kk * 0.2, z); koy(urun, i, 0, -9, 0, { s: 0.001 }); }
      else { koy(urun, i, x, UST - 0.15 + kk * 0.3, z); koy(enzim, i, 0, -9, 0, { s: 0.001 }); }
    });
    enzim.userData.bitir(); urun.userData.bitir();
  });
  const EVRE = ["1. Yalancı ayaklar besini sarıyor", "2. Besin kofulu oluştu, lizozomlar yaklaşıyor", "3. Lizozom kofulla birleşti", "4. Besin hücre İÇİNDE parçalandı; küçük moleküller sitoplazmaya geçiyor"];
  return {
    evre: () => EVRE[evre],
    noktalar: {
      amip: nokta(amip, 0, 0.45, 0), cekirdek, koful: bakteri, lizozom: lizozomlar[0],
      ekmek: nokta(g, 3.6, UST - 0.1, -1.05), hif: nokta(g, 3.0, UST + 0.4, -0.4), enzim: nokta(g, 4.3, UST + 0.05, 0.5),
    },
  };
}

/* =====================================================================
 * 4) Sindirim sistemleri müzesi: güvercin, kurt, inek, insan
 * ===================================================================== */
const ENAMEL = () => new THREE.MeshPhysicalMaterial({ color: 0xf3ecd8, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.2 });
function disGeo(tur) {
  let g;
  if (tur === "K") { g = new THREE.BoxGeometry(0.1, 0.26, 0.05, 2, 6, 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 0.13; p.setX(i, p.getX(i) * (1 - 0.25 * (y / 0.26))); p.setZ(i, p.getZ(i) * (1 - 0.6 * (y / 0.26))); } g.translate(0, 0.13, 0); }
  else if (tur === "C") { g = new THREE.ConeGeometry(0.06, 0.44, 14, 8); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 0.22; p.setZ(i, p.getZ(i) - 0.08 * (y / 0.44) ** 2); } g.translate(0, 0.22, 0); }
  else if (tur === "S") { const s = new THREE.Shape(); s.moveTo(-0.11, 0); s.lineTo(-0.07, 0.2); s.lineTo(-0.02, 0.1); s.lineTo(0.04, 0.27); s.lineTo(0.11, 0); s.closePath(); g = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2 }); g.translate(0, 0, -0.035); g.rotateY(Math.PI / 2); }
  else if (tur === "G") { g = new THREE.BoxGeometry(0.2, 0.2, 0.18, 6, 3, 6); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0.09) p.setY(i, p.getY(i) + 0.025 * Math.sin(p.getX(i) * 70)); g.translate(0, 0.1, 0); }
  else { g = new THREE.BoxGeometry(0.16, 0.17, 0.16, 8, 3, 8); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0.08) p.setY(i, p.getY(i) + 0.035 * Math.cos(p.getX(i) * 38) * Math.cos(p.getZ(i) * 38)); g.translate(0, 0.085, 0); }
  return organiklestir(g, { genlik: 0.006, olcek: 25 });
}
/** Alt çene modeli: U biçimli diş dizisi (bir yarım çene dizisi iki yana aynalanır) */
function cene(dizi, olcek = 1) {
  const g = new THREE.Group(), malz = ENAMEL();
  const yol = (s) => { // s: önden arkaya yay uzunluğu
    const R = 0.42 * olcek, yayU = (Math.PI / 2) * R;
    if (s < yayU) { const a = s / R; return { x: Math.sin(a) * R, z: Math.cos(a) * R, yon: a }; }
    return { x: R, z: -(s - yayU), yon: Math.PI / 2 };
  };
  const GEN = { K: 0.11, C: 0.13, S: 0.22, G: 0.21, D: 0.17, _: 0.2 };
  const disler = {};
  for (const yan of [1, -1]) {
    let s = 0.05;
    for (const d of dizi) {
      const w = GEN[d] * olcek;
      if (d !== "_") {
        const { x, z, yon } = yol(s + w / 2);
        const m = new THREE.Mesh(disGeo(d), malz); m.scale.setScalar(olcek);
        m.position.set(x * yan, 0.12, z); m.rotation.y = yan * yon; m.castShadow = true; g.add(m);
        if (yan === 1 && !disler[d]) disler[d] = m;
      }
      s += w + 0.01;
    }
  }
  // dişeti ve çene kemiği
  const uz = (GEN.K + 0.01) * dizi.length + 0.3;
  const yolN = [];
  for (let i = 0; i <= 24; i++) { const s = (i / 24) * uz * olcek * 1.25; const y = yol(s); yolN.unshift(V(-y.x, 0, y.z)); }
  for (let i = 1; i <= 24; i++) { const s = (i / 24) * uz * olcek * 1.25; const y = yol(s); yolN.push(V(y.x, 0, y.z)); }
  const kemik = new THREE.Mesh(borudanGeo(yolN, 0.1 * olcek, { bolum: 80, cevre: 10 }), dokuluMalzeme("kemik", { kabarti: 0.5 }));
  kemik.scale.set(1, 1.2, 1); kemik.castShadow = true;
  const diseti = new THREE.Mesh(borudanGeo(yolN.map((v) => V(v.x, 0.1, v.z)), 0.065 * olcek, { bolum: 80, cevre: 8 }), fizikMalz(0xd98a8a, { roughness: 0.35, clearcoat: 0.6 }));
  g.add(kemik, diseti);
  return { g, disler };
}
function bagirsakGeo(uzunluk, gen = 2.3, ara = 0.2) {
  const n = [];
  let x = -gen / 2, z = 0, yon = 1, kalan = uzunluk, y = 0.07, sira = 0;
  n.push(V(x, y, z));
  while (kalan > 0) {
    const d = Math.min(kalan, gen);
    for (let k = 1; k <= 6; k++) n.push(V(x + yon * d * (k / 6), y + 0.02 * Math.sin(k + sira), z));
    x += yon * d; kalan -= d;
    if (kalan <= 0) break;
    const r0 = ara / 2;
    for (let k = 1; k <= 5; k++) { const a = (k / 6) * Math.PI; n.push(V(x + yon * Math.sin(a) * r0, y, z - r0 + Math.cos(a) * r0)); }
    z -= ara; kalan -= Math.PI * r0; yon = -yon; sira++;
    if (sira % 7 === 0) { y += 0.14; z += ara * 7; }
  }
  return borudanGeo(n, 0.07, { bolum: Math.max(60, n.length * 4), cevre: 10 });
}
function muzeYeri(S) {
  const g = grupAt("muze");
  masa(g, { gen: 30, der: 12, ad: "mermer", tekrar: [3, 1.2] });
  const etMalz = dokuluMalzeme("et", { fizik: { clearcoat: 0.6, clearcoatRoughness: 0.25 }, kabarti: 1.5, puruz: 0.4 });
  const bagMalz = dokuluMalzeme("mukoza", { fizik: { clearcoat: 0.5 }, kabarti: 1, puruz: 0.4, tekrar: [6, 1] });
  const X = [-6.15, -2.05, 2.05, 6.15];
  const kaide = (x) => {
    const k = new THREE.Mesh(new RoundedBoxGeometry(3.9, 0.45, 3.6, 4, 0.08), malzeme.plastik(0x26303e, { puruz: 0.5 }));
    k.position.set(x, 0.225, 0); k.castShadow = true; k.receiveShadow = true; g.add(k);
  };
  X.forEach(kaide);
  const Y = 0.45;
  const organ = (geo, x, y, z, malz = etMalz) => { const m = new THREE.Mesh(geo, malz); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  const kure = (r, sx, sy, sz, tohum = 1) => organiklestir(new THREE.SphereGeometry(r, 36, 24).scale(sx, sy, sz), { genlik: r * 0.06, olcek: 3 / r, tohum });
  const N = {};
  const BX = 0.95, BZ = -0.3, MX = -0.8, MZ = -0.75, CZ = 1.05;
  const bagir = (x, oran) => organ(bagirsakGeo(0.55 * oran, 1.5, 0.17), x + BX, Y, BZ, bagMalz);
  // --- güvercin: baş + gaga, kursak, bezli mide, taşlık
  {
    const x = X[0];
    const tuy = yuzeyDokusu({ taban: "#8a95a6", koyu: "#5d6878", acik: "#b7c0cc", olcek: 12, benek: 0.2, tohum: 5 });
    organ(kure(0.32, 1, 0.92, 1.12), x, Y + 0.36, 0.95, new THREE.MeshStandardMaterial({ map: tuy.renk, roughness: 0.9 }));
    const gaga = organ(new THREE.ConeGeometry(0.07, 0.34, 16).rotateX(Math.PI / 2), x, Y + 0.32, 1.42, fizikMalz(0x5b5450, { roughness: 0.35, clearcoat: 0.5 }));
    organ(kure(0.06, 1.5, 0.8, 1), x, Y + 0.4, 1.3, fizikMalz(0xeeeae2, { roughness: 0.6 }));
    for (const s of [-1, 1]) { organ(new THREE.SphereGeometry(0.05, 14, 10), x + 0.25 * s, Y + 0.42, 1.07, fizikMalz(0xff8a2a, { clearcoat: 1, roughness: 0.1 })); organ(new THREE.SphereGeometry(0.028, 10, 8), x + 0.29 * s, Y + 0.43, 1.08, fizikMalz(0x080808, { clearcoat: 1, roughness: 0.05 })); }
    organ(borudanGeo([[x, Y + 0.22, 0.7], [x - 0.3, Y + 0.16, 0.35], [x + MX + 0.1, Y + 0.18, 0.05]], 0.05), 0, 0, 0);
    const kursak = organ(kure(0.27, 1.1, 0.8, 1, 3), x + MX, Y + 0.22, -0.05, dokuluMalzeme("et", { renk: 0xffe2d6, fizik: { clearcoat: 0.5 } }));
    organ(borudanGeo([[x + MX, Y + 0.18, -0.25], [x + MX + 0.1, Y + 0.16, -0.45]], 0.045), 0, 0, 0);
    const bezli = organ(kure(0.13, 0.8, 0.8, 1.5, 4), x + MX + 0.12, Y + 0.17, -0.58);
    const taslik = organ(kure(0.32, 1, 0.75, 0.9, 5), x + MX + 0.05, Y + 0.25, -1.05, fizikMalz(0x7a2a2a, { roughness: 0.35, clearcoat: 0.6 }));
    organ(new THREE.CircleGeometry(0.15, 24), x + MX + 0.05, Y + 0.25, -0.765, fizikMalz(0xe9e2d2, { roughness: 0.4, side: THREE.DoubleSide }));
    organ(borudanGeo([[x + MX + 0.35, Y + 0.2, -1.0], [x + BX - 0.75, Y + 0.08, -0.3]], 0.06), 0, 0, 0, bagMalz);
    bagir(x, 4);
    N.Güvercin = { ad: nokta(g, x, Y + 0.05, 1.75), agiz: gaga, kursak, bezli, taslik, bag: nokta(g, x + BX, Y + 0.15, BZ) };
  }
  // --- kurt: köpek ve sivri azı dişleri, tek gözlü mide, kısa bağırsak
  {
    const x = X[1];
    const c = cene("KKKCSSSS", 1.05); c.g.position.set(x, Y, CZ); g.add(c.g);
    const mide = organ(kure(0.5, 1.3, 0.7, 0.85, 7), x + MX, Y + 0.32, MZ);
    organ(borudanGeo([[x + MX + 0.6, Y + 0.3, MZ + 0.1], [x + BX - 0.75, Y + 0.1, BZ]], 0.07, { bolum: 12 }), 0, 0, 0, bagMalz);
    bagir(x, 4);
    N.Kurt = { ad: nokta(g, x, Y + 0.05, 1.75), kopek: c.disler.C, azi: c.disler.S, mide, bag: nokta(g, x + BX, Y + 0.15, BZ) };
  }
  // --- inek: kesici dişler, diş boşluğu, geniş azılar; dört gözlü mide; çok uzun bağırsak
  {
    const x = X[2];
    const c = cene("KKKK__GGGG", 0.95); c.g.position.set(x, Y, CZ + 0.1); g.add(c.g);
    const odalar = [
      organ(kure(0.55, 1.1, 0.8, 0.95, 11), x - 1.1, Y + 0.42, -0.75),
      organ(kure(0.24, 1, 0.9, 1, 12), x - 0.3, Y + 0.32, -0.3, dokuluMalzeme("et", { renk: 0xf0c4b4, fizik: { clearcoat: 0.5 } })),
      organ(kure(0.25, 1, 0.85, 1, 13), x - 0.15, Y + 0.3, -0.85, dokuluMalzeme("et", { renk: 0xc78f7a, fizik: { clearcoat: 0.5 } })),
      organ(kure(0.2, 2, 0.8, 0.85, 14), x - 0.4, Y + 0.24, -1.4),
    ];
    bagir(x, 20);
    N.İnek = { ad: nokta(g, x, Y + 0.05, 1.75), kesici: c.disler.K, azi: c.disler.G, odalar, bag: nokta(g, x + BX, Y + 0.25, -0.9) };
  }
  // --- insan: dengeli dişler, J biçimli mide, orta uzunlukta bağırsak
  {
    const x = X[3];
    const c = cene("KKCDDDD", 1); c.g.position.set(x, Y, CZ); g.add(c.g);
    const mx = x + MX, mz = MZ;
    const mide = organ(borudanGeo([[mx - 0.25, Y + 0.32, mz + 0.5], [mx - 0.35, Y + 0.32, mz + 0.1], [mx - 0.05, Y + 0.32, mz - 0.25], [mx + 0.35, Y + 0.3, mz - 0.1], [mx + 0.45, Y + 0.28, mz + 0.15]], 0.23, { bolum: 40, cevre: 18 }), 0, 0, 0);
    organ(borudanGeo([[mx + 0.5, Y + 0.26, mz + 0.2], [x + BX - 0.75, Y + 0.08, BZ]], 0.07), 0, 0, 0, bagMalz);
    bagir(x, 6);
    N.İnsan = { ad: nokta(g, x, Y + 0.05, 1.75), kopek: c.disler.C, azi: c.disler.D, mide, bag: nokta(g, x + BX, Y + 0.15, BZ) };
  }
  S.yerEkle("muze", {
    grup: g, merkez: YER.muze, arkaPlan: [0x2b3546, 0x10151e],
    isik: { gok: 0.6, gunes: 2.4, ortam: 0.85, yon: [-6, 22, 16] },
    bakislar: {
      ana: bakis("muze", [0, 13, 19], [0, 0.3, -0.1], { min: 3, max: 34 }),
      yakin: bakis("muze", [0, 5.2, 6.6], [0, 0.3, 0], { min: 3, max: 30 }),
    },
  });
  return { N };
}

/* =====================================================================
 * 5) Açılmış ince bağırsak: kıvrım, villus, mikrovillus
 * ===================================================================== */
function bagirsakYeri(S) {
  const g = grupAt("bagirsak"), r = rastgele(51);
  masa(g, { gen: 30, der: 16, y: -0.02 });
  const L = 12, R = 2.5, M = 0.86 * Math.PI / 2, CY = 2.75;
  const kivrimF = (x) => 0.6 * Math.max(0, Math.sin((2 * Math.PI * x) / 1.15)) ** 1.6 * Math.min(1, (L / 2 - Math.abs(x)) / 0.6);
  const yuzey = (u, v, kat, hedef) => { // u: 0..1 boy, v: -1..1 çevre
    const x = (u - 0.5) * L, a = v * M, rr = R - (kat ? kivrimF(x) : 0);
    return hedef.set(x, CY - rr * Math.cos(a), rr * Math.sin(a));
  };
  const izgaraGeo = (kat, NU = 260, NV = 70, dis = false) => {
    const geo = new THREE.BufferGeometry(), p = [], uv = [], ind = [], v3 = V(0, 0, 0);
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
      const u = i / NU, v = (j / NV) * 2 - 1;
      if (dis) { const a = v * M, rr = R + 0.28; p.push((u - 0.5) * L, CY - rr * Math.cos(a), rr * Math.sin(a)); }
      else { yuzey(u, v, kat, v3); p.push(v3.x, v3.y, v3.z); }
      uv.push(u * 6, (j / NV) * 2);
    }
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
      if (dis) ind.push(a, b, c, b, d, c); else ind.push(a, c, b, b, c, d);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(ind); geo.computeVertexNormals();
    return geo;
  };
  const mukoza = dokuluMalzeme("mukoza", { tekrar: [1, 1], kabarti: 1.5, puruz: 0.55, fizik: { sheen: 0.7, sheenColor: new THREE.Color(0xffd6cc), clearcoat: 0.35, side: THREE.DoubleSide } });
  const duz = izgaraGeo(false), katli = izgaraGeo(true);
  const ic = new THREE.Mesh(duz, mukoza); ic.receiveShadow = true; ic.castShadow = true; g.add(ic);
  const dis = new THREE.Mesh(izgaraGeo(false, 80, 30, true), dokuluMalzeme("et", { renk: 0xe8b8a8, fizik: { clearcoat: 0.4, side: THREE.DoubleSide }, puruz: 0.5 }));
  g.add(dis);
  // kesit yüzleri (iki uç) ve kenar şeritleri
  for (const sx of [-1, 1]) {
    const s = new THREE.Shape();
    s.absarc(0, 0, R + 0.28, -Math.PI / 2 - M, -Math.PI / 2 + M, false);
    s.absarc(0, 0, R, -Math.PI / 2 + M, -Math.PI / 2 - M, true);
    const k = new THREE.Mesh(new THREE.ShapeGeometry(s, 40), dokuluMalzeme("et", { fizik: { clearcoat: 0.3, side: THREE.DoubleSide } }));
    k.rotation.y = Math.PI / 2; k.position.set((sx * L) / 2, CY, 0); g.add(k);
  }
  // villuslar: iç yüzeye dik, parmak biçimli çıkıntılar
  const NVL = 4200;
  const vg = new THREE.CapsuleGeometry(0.036, 0.2, 3, 7); vg.translate(0, 0.13, 0);
  const villus = coklu(vg, dokuluMalzeme("mukoza", { renk: 0xffd0c8, fizik: { sheen: 1, sheenColor: new THREE.Color(0xfff0ea) }, puruz: 0.5 }), NVL);
  const ornek = Array.from({ length: NVL }, () => [r(), r() * 1.9 - 0.95, 0.7 + r() * 0.6]);
  const matrisler = [false, true].map((kat) => {
    const m = [], a = V(0, 0, 0), b = V(0, 0, 0), q = new THREE.Quaternion(), kk = new THREE.Object3D();
    for (const [u, v, s] of ornek) {
      yuzey(u, v, kat, a); yuzey(u, v + 0.002, kat, b);
      const nrm = V(0, CY, 0).sub(V(0, a.y, a.z)).normalize();
      kk.position.copy(a); yoneDondur(nrm, q); kk.quaternion.copy(q); kk.scale.setScalar(s); kk.updateMatrix();
      m.push(kk.matrix.clone());
    }
    return m;
  });
  g.add(villus);
  // büyütülmüş hücreler: mikrovillus fırçası
  const ek = new THREE.Group(); ek.position.set(4.2, 2.3, -4.0); g.add(ek);
  const sutun = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 2.3, 20), malzeme.metal(0x8a929c, { puruz: 0.35 })); sutun.position.y = -1.15; sutun.castShadow = true; ek.add(sutun);
  const ayak = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.18, 48), malzeme.plastik(0x1f2733)); ayak.position.y = 0.09; ek.add(ayak);
  const hucreMalz = dokuluMalzeme("mukoza", { renk: 0xffe0d8, fizik: { clearcoat: 0.4, sheen: 0.5 }, puruz: 0.5 });
  for (let i = 0; i < 3; i++) {
    const h = new THREE.Mesh(organiklestir(new RoundedBoxGeometry(0.72, 1.7, 0.9, 3, 0.08), { genlik: 0.02, olcek: 4, tohum: i }), hucreMalz);
    h.position.set((i - 1) * 0.76, 1.05, 0); h.castShadow = true; ek.add(h);
    const ck = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14).scale(1, 1.4, 1), fizikMalz(0x7a5aa0, { roughness: 0.4 }));
    ck.position.set((i - 1) * 0.76, 0.7, 0.46); ek.add(ck);
  }
  const mv = coklu(new THREE.CylinderGeometry(0.016, 0.018, 0.22, 6).translate(0, 0.11, 0), hucreMalz, 3 * 14 * 16);
  let mi = 0;
  for (let i = 0; i < 3; i++) for (let a = 0; a < 14; a++) for (let b = 0; b < 16; b++) koy(mv, mi++, (i - 1) * 0.76 - 0.32 + a * 0.049, 1.9, -0.4 + b * 0.053);
  mv.userData.bitir(); ek.add(mv);
  // glikoz molekülleri (sarı) bağırsak boşluğunda
  const NG = 150;
  const gl = coklu(new THREE.IcosahedronGeometry(0.05, 1), malzeme.isik(0xffe066, 0.5), NG);
  const GL = Array.from({ length: NG }, () => ({ x: (r() - 0.5) * L * 0.92, y: 0.6 + r() * 1.5, z: (r() - 0.5) * 2.6, v: 0.25 + r() * 0.3 }));
  g.add(gl);
  const durum = { kivrim: false, villus: false, mikrovillus: false, hiz: 0.012 };
  function ayarla(y) {
    Object.assign(durum, y);
    ic.geometry = durum.kivrim ? katli : duz;
    villus.visible = durum.villus;
    const set = matrisler[durum.kivrim ? 1 : 0];
    for (let i = 0; i < NVL; i++) villus.setMatrixAt(i, set[i]);
    villus.instanceMatrix.needsUpdate = true;
    mv.visible = durum.mikrovillus;
  }
  ayarla({});
  S.yerEkle("bagirsak", {
    grup: g, merkez: YER.bagirsak, arkaPlan: [0x34303c, 0x120f16],
    isik: { gok: 0.55, gunes: 2.5, ortam: 0.8, yon: [-4, 20, 12] },
    bakislar: { ana: bakis("bagirsak", [1.6, 10.6, 14.2], [1.0, 1.2, 0.8], { min: 3, max: 34 }) },
  });
  S.yerKare("bagirsak", (dt) => {
    const hz = 0.35 + 3 * Math.min(1, durum.hiz);
    GL.forEach((q, i) => {
      q.y -= q.v * dt * hz;
      const rr = R - (durum.kivrim ? kivrimF(q.x) : 0);
      const taban = CY - Math.sqrt(Math.max(0, rr * rr - q.z * q.z)) + (durum.villus ? 0.25 : 0.05);
      if (q.y < taban) { q.x = (r() - 0.5) * L * 0.92; q.z = (r() - 0.5) * 2.6; q.y = Math.min(2.1, CY - Math.sqrt(Math.max(0, R * R - q.z * q.z)) + 0.9 + r() * 0.9); }
      koy(gl, i, q.x, q.y, q.z);
    });
    gl.userData.bitir();
  });
  return {
    ayarla, hiz: (k) => (durum.hiz = Math.min(1, 0.012 * k)),
    noktalar: { kivrim: nokta(g, -3.4, 0.9, -1.4), villus: nokta(g, -1.2, 0.55, 0.7), mikro: nokta(ek, 0, 2.2, 0), bosluk: nokta(g, 2, 3.2, 0), dis: nokta(g, -4.6, 2.9, -2.3) },
  };
}

/* =====================================================================
 * 6) Bağırsak çeperi kesiti: boşluk → çeper hücreleri → kılcal damar → vücut hücresi
 * ===================================================================== */
function dokuYeri(S) {
  const g = grupAt("doku"), r = rastgele(61);
  masa(g, { gen: 30, der: 16, y: -1.3 });
  const X0 = -6.2, X1 = 3.4, NH = 11, HW = (X1 - X0) / NH;
  const DUVAR = 2.2;
  // bağ dokusu tabanı
  const bag = new THREE.Mesh(new RoundedBoxGeometry(X1 - X0 + 0.3, 1.3, 1.9, 3, 0.1), dokuluMalzeme("et", { renk: 0xf2c6bd, fizik: { clearcoat: 0.3 }, puruz: 0.6, tekrar: [3, 1] }));
  bag.position.set((X0 + X1) / 2, -0.65, -0.45); bag.receiveShadow = true; g.add(bag);
  // çeper hücreleri (tek sıra silindirik epitel)
  const hucreMalz = dokuluMalzeme("mukoza", { renk: 0xffd9d0, fizik: { clearcoat: 0.4, sheen: 0.6, sheenColor: new THREE.Color(0xfff) }, puruz: 0.5 });
  for (let i = 0; i < NH; i++) {
    const h = new THREE.Mesh(organiklestir(new RoundedBoxGeometry(HW * 0.96, DUVAR - 0.05, 2.4, 3, 0.1), { genlik: 0.025, olcek: 3, tohum: i }), hucreMalz);
    h.position.set(X0 + HW * (i + 0.5), DUVAR / 2, 0); h.castShadow = true; h.receiveShadow = true; g.add(h);
    const ck = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12).scale(1, 1.5, 1), fizikMalz(0x7a5aa0, { roughness: 0.4 }));
    ck.position.set(X0 + HW * (i + 0.5), 0.75, 1.21); ck.scale.z = 0.3; g.add(ck);
  }
  const fircaN = NH * 6 * 18;
  const firca = coklu(new THREE.CylinderGeometry(0.022, 0.025, 0.18, 6).translate(0, 0.09, 0), hucreMalz, fircaN);
  let fi = 0;
  for (let i = 0; i < NH; i++) for (let a = 0; a < 6; a++) for (let b = 0; b < 18; b++) koy(firca, fi++, X0 + HW * i + 0.1 + a * (HW - 0.2) / 5, DUVAR - 0.02, -1.1 + b * 0.13);
  firca.userData.bitir(); g.add(firca);
  // kılcal damar: çeperin altından çıkıp vücut hücresine gider
  const HUCRE = V(6.4, 2.0, 0);
  const egri = new THREE.CatmullRomCurve3([V(X0 - 0.5, -0.35, 0.9), V(-2, -0.35, 0.9), V(X1 - 0.4, -0.35, 0.9), V(X1 + 1.3, 0.1, 0.6), V(5.0, 1.4, 0.2), V(HUCRE.x - 1.2, HUCRE.y, 0)]);
  const damar = new THREE.Mesh(new THREE.TubeGeometry(egri, 120, 0.36, 18), new THREE.MeshPhysicalMaterial({ color: 0xd2364a, roughness: 0.25, transparent: true, opacity: 0.5, clearcoat: 0.8, depthWrite: false }));
  damar.renderOrder = 2; g.add(damar);
  const akProfil = [[0.0, 0.05], [0.18, 0.08], [0.26, 0.04], [0.27, 0], [0.26, -0.04], [0.18, -0.08], [0.0, -0.05]];
  const alyuvar = coklu(donel(akProfil, 20).rotateX(Math.PI / 2), fizikMalz(0xb3121f, { roughness: 0.35, clearcoat: 0.5 }), 44);
  const AY = Array.from({ length: 44 }, (_, i) => ({ t: i / 44, a: r() * 6, o: (r() - 0.5) * 0.3 }));
  g.add(alyuvar);
  // vücut hücresi: çekirdek ve mitokondriler; ATP üretince parlar
  const hucre = new THREE.Group(); hucre.position.copy(HUCRE); g.add(hucre);
  const zar = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(1.35, 48, 32), { genlik: 0.06, olcek: 1.5, tohum: 3 }), new THREE.MeshPhysicalMaterial({ color: 0x86e0a8, roughness: 0.3, transparent: true, opacity: 0.42, clearcoat: 0.6, depthWrite: false, emissive: 0xffb547, emissiveIntensity: 0 }));
  zar.renderOrder = 3; hucre.add(zar);
  const hc = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.42, 28, 20), { genlik: 0.03, olcek: 4 }), fizikMalz(0x6d5aa0, { roughness: 0.4 }));
  hc.position.set(-0.2, 0.1, -0.2); hucre.add(hc);
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(organiklestir(new THREE.CapsuleGeometry(0.12, 0.32, 4, 12), { genlik: 0.015, olcek: 8, tohum: i }), fizikMalz(0xc0603e, { roughness: 0.4, clearcoat: 0.3 }));
    const a = i * 1.26; m.position.set(Math.cos(a) * 0.8, Math.sin(i * 2.2) * 0.4, Math.sin(a) * 0.7); m.rotation.set(r() * 3, r() * 3, r() * 3); hucre.add(m);
  }
  // lokma ve parçaları
  const lokmaMalz = dokuluMalzeme("kabuk", { renk: 0xb58a62, kabarti: 2, puruz: 0.8 });
  const lokma = new THREE.Mesh(organiklestir(new THREE.SphereGeometry(0.95, 40, 28), { genlik: 0.12, olcek: 1.6, tohum: 4 }), lokmaMalz);
  lokma.position.set(-1.5, 4.3, 0); lokma.castShadow = true; g.add(lokma);
  // parçacıklar (moleküller): renk + konum dışarıdan verilir
  const NP = 260;
  const pm = coklu(new THREE.IcosahedronGeometry(1, 2), fizikMalz(0xffffff, { roughness: 0.3, clearcoat: 0.6 }), NP, { golge: true });
  for (let i = 0; i < NP; i++) { koy(pm, i, 0, -20, 0, { s: 0.001 }); pm.setColorAt(i, new THREE.Color(0xffffff)); }
  pm.userData.bitir(); g.add(pm);
  const renk = new THREE.Color();
  /** liste: [{x,y,z,r,renk}] (yerel koordinat) */
  function ciz(liste) {
    for (let i = 0; i < NP; i++) {
      const p = liste[i];
      if (!p) { koy(pm, i, 0, -20, 0, { s: 0.001 }); continue; }
      koy(pm, i, p.x, p.y, p.z ?? 0, { s: p.r ?? 0.12 });
      pm.setColorAt(i, renk.set(p.renk));
    }
    pm.userData.bitir(); pm.instanceColor.needsUpdate = true;
  }
  const ornekX = Array.from({ length: 400 }, (_, i) => egri.getPointAt(i / 399).x);
  const tBul = (x) => { let i = 0; while (i < 399 && ornekX[i] < x) i++; return i / 399; };
  let parla = 0;
  S.yerEkle("doku", {
    grup: g, merkez: YER.doku, arkaPlan: [0x2f2a36, 0x100d14],
    isik: { gok: 0.6, gunes: 2.4, ortam: 0.8, yon: [-6, 20, 14] },
    bakislar: { ana: bakis("doku", [0.4, 7.2, 17.5], [0.6, 1.7, 0], { min: 3, max: 34 }) },
  });
  S.yerKare("doku", (dt) => {
    AY.forEach((a, i) => {
      a.t = (a.t + dt * 0.07) % 1; a.a += dt * 2;
      const p = egri.getPointAt(a.t), tg = egri.getTangentAt(a.t);
      koy(alyuvar, i, p.x + a.o * 0.3, p.y + Math.sin(a.a) * 0.1, p.z + a.o, { q: yoneDondur(tg), s: 1 });
    });
    alyuvar.userData.bitir();
    parla = Math.max(0, parla - dt * 1.5);
    zar.material.emissiveIntensity = parla * 0.8;
  });
  return {
    X0, X1, DUVAR, KILCAL: -0.35, HUCRE, egri, ciz, lokma, tBul,
    dunya: (x, y, z) => V(x + YER.doku[0], y + YER.doku[1], z + YER.doku[2]),
    parla: () => (parla = 1),
    noktalar: { bosluk: nokta(g, -4.6, 4.9, 0), cep: nokta(g, -5.6, DUVAR + 0.2, 1.2), damar: nokta(g, -3.2, -0.2, 1.3), hucre: nokta(hucre, 0, 1.4, 0) },
  };
}
