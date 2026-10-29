// Theseus'un gemisi: tek tek değiştirilebilen kaplama tahtaları olan antik Yunan ticaret gemisi.
// Gövde parametrik bir yüzeydir (u: kıçtan pruvaya, v: omurgadan küpeşteye); her tahta bu yüzeye
// oturan kalın bir şerittir. Eski tahtalar koyu ve yıpranmış, yeni tahtalar açık ve liflidir.
import { THREE, doku, rastgele, organiklestir } from "../_ortak/dunya.js";

export const TAHTA = 12;               // değiştirilebilen tahta (her yanda 6 sıra)
const SIRA = 6;
// Değiştirme sırası [yan, sıra]: önce kameraya bakan yanın görünen üst tahtaları
export const SIRA_DEGISIM = [[1, 5], [-1, 5], [1, 3], [-1, 4], [1, 4], [-1, 3], [1, 2], [-1, 2], [1, 1], [-1, 1], [1, 0], [-1, 0]];

const malzemeler = (() => {
  let m = null;
  return () => (m ||= {
    eskiDoku: doku("ahsap", { taban: "#74624d", koyu: "#4a3c2e", acik: "#968470", benek: 0.3, lif: 0.45, tohum: 22 }),
    yeniDoku: doku("ahsap", { taban: "#c99a60", koyu: "#9c6c3a", acik: "#e5bf88", benek: 0.06, lif: 0.6, tohum: 21 }),
    iskelet: new THREE.MeshStandardMaterial({ color: 0xffffff, map: doku("ahsap", { taban: "#6e5238", koyu: "#4a3624", acik: "#8a6a4a", tohum: 23 }).renk, roughness: 0.85 }),
    katran: new THREE.MeshStandardMaterial({ color: 0x1a120b, roughness: 0.6 }),
    keten: new THREE.MeshStandardMaterial({ color: 0xe3d6b8, map: doku("detay", { tohum: 31, olcek: 18 }).renk, roughness: 0.95, side: THREE.DoubleSide }),
    halat: new THREE.MeshStandardMaterial({ color: 0x8d7650, roughness: 0.9 }),
    boya: new THREE.MeshStandardMaterial({ color: 0xf1ede2, roughness: 0.5 }),
    koyuBoya: new THREE.MeshStandardMaterial({ color: 0x1d2730, roughness: 0.4 }),
    kirmizi: new THREE.MeshStandardMaterial({ color: 0x9a3b26, roughness: 0.6 }),
  });
})();

export function tahtaMalzemesi(yeni) {
  const M = malzemeler();
  const d = yeni ? M.yeniDoku : M.eskiDoku;
  const harita = d.renk.clone(), p = d.puruz.clone();
  for (const t of [harita, p]) { t.repeat.set(1, 1); t.needsUpdate = true; }
  return new THREE.MeshStandardMaterial({
    color: 0xffffff, map: harita, roughnessMap: p, bumpMap: p, bumpScale: yeni ? 0.8 : 2.2,
    roughness: yeni ? 0.72 : 1, metalness: 0, emissive: 0xffb547, emissiveIntensity: 0,
  });
}

/**
 * Gemi gövdesi biçimi. Ölçüler: boy L, yarı genişlik B, derinlik D.
 */
function govdeBicimi({ L = 15, B = 1.75, D = 1.9 } = {}) {
  const hb = (u) => B * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * u - 1), 1.7)), 0.72);
  const yk = (u) => 0.5 * Math.pow(Math.abs(2 * u - 1), 3);
  const ys = (u) => D + 1.25 * Math.pow(Math.abs(2 * u - 1), 2.4) + (u < 0.5 ? 0.7 * Math.pow(1 - 2 * u, 3) : 0);
  /** Yüzey noktası: yan σ (+1/-1) */
  const P = (u, v, s = 1, hedef = new THREE.Vector3()) => {
    const t = v * Math.PI / 2;
    return hedef.set((u - 0.5) * L, yk(u) + (ys(u) - yk(u)) * (1 - Math.cos(t)), s * hb(u) * Math.sin(t));
  };
  return { L, B, D, hb, yk, ys, P };
}

/** Yüzeye oturan kalın şerit (tahta): [u0,u1] × [v0,v1], kalınlık t */
function seritGeo(G, s, u0, u1, v0, v1, { nu = 44, nv = 3, t = 0.07, uvOlcek = 1 / 3.2, uvKayma = 0, tek = false } = {}) {
  const dis = [], ic = [], uvs = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), du = new THREE.Vector3(), dv = new THREE.Vector3();
  for (let i = 0; i <= nu; i++) {
    const u = u0 + (u1 - u0) * (i / nu);
    for (let j = 0; j <= nv; j++) {
      const v = v0 + (v1 - v0) * (j / nv);
      G.P(u, v, s, a);
      du.subVectors(G.P(Math.min(0.999, u + 0.002), v, s, b), G.P(Math.max(0.001, u - 0.002), v, s, c));
      dv.subVectors(G.P(u, Math.min(1, v + 0.01), s, b), G.P(u, Math.max(0, v - 0.01), s, c));
      n.crossVectors(du, dv).normalize().multiplyScalar(s);
      if (tek) { a.addScaledVector(n, -t); dis.push(a.x, a.y, a.z); uvs.push(u, v); continue; }
      dis.push(a.x, a.y, a.z);
      ic.push(a.x - n.x * t, a.y - n.y * t, a.z - n.z * t);
      uvs.push(u * G.L * uvOlcek, uvKayma + (j / nv) * 0.16);
    }
  }
  const sutun = nv + 1, ust = (nu + 1) * sutun;
  if (tek) {
    const g = new THREE.BufferGeometry(), idx = [];
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const k = i * sutun + j;
      if (s > 0) idx.push(k, k + sutun, k + sutun + 1, k, k + sutun + 1, k + 1); else idx.push(k, k + sutun + 1, k + sutun, k, k + 1, k + sutun + 1);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(dis, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  const konum = [...dis, ...ic], uv = [...uvs, ...uvs], idx = [];
  const yuz = (p, q, r, w) => { if (s > 0) idx.push(p, q, r, p, r, w); else idx.push(p, r, q, p, w, r); };
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const k = i * sutun + j;
    yuz(k, k + sutun, k + sutun + 1, k + 1);                 // dış yüz
    yuz(ust + k, ust + k + 1, ust + k + sutun + 1, ust + k + sutun); // iç yüz
  }
  for (let i = 0; i < nu; i++) {
    const alt = i * sutun, ustK = i * sutun + nv;
    yuz(alt, ust + alt, ust + alt + sutun, alt + sutun);            // alt kenar
    yuz(ustK, ustK + sutun, ust + ustK + sutun, ust + ustK);         // üst kenar
  }
  for (const i of [0, nu]) for (let j = 0; j < nv; j++) {
    const k = i * sutun + j;
    if (i === 0) yuz(k, k + 1, ust + k + 1, ust + k); else yuz(k, ust + k, ust + k + 1, k + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(konum, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const tup = (noktalar, r, malz, { parca = 40, radyal = 8 } = {}) =>
  new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(noktalar.map((p) => new THREE.Vector3(...p))), parca, r, radyal, false), malz);

/**
 * Gemi kurar. yeniMi(i) → i. tahta yeni mi; direk: direk ve seren olsun mu; yelken: "sarili" | "acik"
 * Dönen grup.userData: { tahtalar: Mesh[] (SIRA_DEGISIM sırasıyla), G }
 */
export function gemiKur({ olcek = 1, direk = true, yelken = "sarili", hepsiEski = false, gozler = true, tohum = 1 } = {}) {
  const M = malzemeler();
  const G = govdeBicimi();
  const grup = new THREE.Group();
  const govde = new THREE.Group();
  grup.add(govde);

  // Tahtalar (kaplama): her yanda 6 sıra; aralarında katranlı derz
  const tahtalar = [];
  const eski = tahtaMalzemesi(false);
  for (const [s, k] of SIRA_DEGISIM) {
    const v0 = 0.02 + (k / SIRA) * 0.98, v1 = 0.02 + ((k + 1) / SIRA) * 0.98;
    const geo = seritGeo(G, s, 0.008, 0.992, v0 + 0.006, v1 - 0.006, { uvKayma: k * 0.17 + (s > 0 ? 0 : 0.5) });
    const m = new THREE.Mesh(geo, hepsiEski ? eski : tahtaMalzemesi(false));
    m.castShadow = true; m.receiveShadow = true;
    m.userData.yan = s; m.userData.sira = k;
    govde.add(m);
    tahtalar.push(m);
  }
  // Derzlerin ardındaki katranlı iç kabuk (yalnız dışa bakar; içeriden tahtaların iç yüzü görünür)
  for (const s of [1, -1]) {
    const g = seritGeo(G, s, 0.008, 0.992, 0.0, 1.0, { t: 0.06, nv: 12, tek: true });
    const kab = new THREE.Mesh(g, M.katran);
    govde.add(kab);
  }

  // Omurga, pruva ve kıç bodoslaması
  const omurga = [];
  for (let i = 0; i <= 20; i++) { const u = 0.01 + 0.98 * (i / 20); omurga.push([(u - 0.5) * G.L, G.yk(u) - 0.06, 0]); }
  govde.add(tup(omurga, 0.12, M.iskelet, { parca: 40 }));
  const pr = G.L / 2;
  govde.add(tup([[pr - 0.1, G.yk(1) - 0.05, 0], [pr + 0.15, 1.0, 0], [pr + 0.3, G.ys(1), 0], [pr + 0.55, G.ys(1) + 0.55, 0], [pr + 0.45, G.ys(1) + 0.95, 0]], 0.11, M.iskelet));
  govde.add(tup([[-pr + 0.1, G.yk(0) - 0.05, 0], [-pr - 0.15, 1.1, 0], [-pr - 0.35, G.ys(0), 0], [-pr - 0.4, G.ys(0) + 0.9, 0], [-pr - 0.05, G.ys(0) + 1.6, 0], [-pr + 0.3, G.ys(0) + 1.35, 0]], 0.1, M.iskelet));

  // Küpeşte (üst kenar) ve içerideki eğri postalar (kaburgalar)
  for (const s of [1, -1]) {
    const k = [];
    for (let i = 0; i <= 30; i++) { const u = 0.01 + 0.98 * (i / 30); const p = G.P(u, 1, s); k.push([p.x, p.y + 0.04, p.z]); }
    govde.add(tup(k, 0.075, M.iskelet, { parca: 60, radyal: 6 }));
  }
  for (let i = 1; i <= 11; i++) {
    const u = 0.12 + 0.76 * (i - 1) / 10, nok = [];
    for (let j = -8; j <= 8; j++) {
      const v = Math.abs(j) / 8, p = G.P(u, v, j < 0 ? -1 : 1);
      const ic = 1 - 0.12 / Math.max(0.3, G.hb(u));
      nok.push([p.x, p.y + 0.11 * (1 - v) + 0.05, p.z * ic]);
    }
    const r = tup(nok, 0.055, M.iskelet, { parca: 24, radyal: 5 });
    r.castShadow = true;
    govde.add(r);
  }
  // Oturaklar ve kıç güvertesi
  for (const u of [0.32, 0.45, 0.6, 0.72]) {
    const w = G.hb(u) * 2 - 0.2, b = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, w), M.iskelet);
    b.position.set((u - 0.5) * G.L, G.ys(u) - 0.45, 0); b.castShadow = true;
    govde.add(b);
  }
  for (const [u0, u1, y] of [[0.06, 0.2, G.ys(0.12) - 0.3], [0.84, 0.93, G.ys(0.88) - 0.3]]) {
    const uo = (u0 + u1) / 2, w = G.hb(uo) * 2 - 0.15;
    const d = new THREE.Mesh(new THREE.BoxGeometry((u1 - u0) * G.L, 0.08, w), M.iskelet);
    d.position.set((uo - 0.5) * G.L, y, 0); d.castShadow = true; d.receiveShadow = true;
    govde.add(d);
  }

  // Pruvadaki boyalı gözler (antik Yunan gemilerinin geleneksel süsü)
  if (gozler) for (const s of [1, -1]) {
    const u = 0.93, p = G.P(u, 0.8, s);
    const goz = new THREE.Group();
    const ak = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), M.boya); ak.scale.set(1.5, 1, 1);
    const bebek = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), M.koyuBoya); bebek.position.z = 0.005;
    const kas = new THREE.Mesh(new THREE.RingGeometry(0.27, 0.33, 20, 1, 0, Math.PI), M.kirmizi); kas.scale.set(1.4, 0.8, 1); kas.position.y = 0.02;
    goz.add(ak, bebek, kas);
    goz.position.set(p.x, p.y, p.z + s * 0.09);
    goz.rotation.y = s > 0 ? -0.45 : Math.PI + 0.45;
    govde.add(goz);
  }

  // Dümen kürekleri
  for (const s of [1, -1]) {
    const p = G.P(0.1, 1, s);
    const kurek = new THREE.Group();
    const sap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 4.2, 8), M.iskelet);
    const pala = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.3, 0.42), M.iskelet);
    pala.position.y = -2.2;
    kurek.add(sap, pala);
    kurek.position.set(p.x - 0.2, p.y - 1.0, p.z + s * 0.25);
    kurek.rotation.set(s * 0.25, 0, -0.55);
    kurek.traverse((o) => { o.castShadow = true; });
    govde.add(kurek);
  }

  if (direk) {
    const H = 8.5, dx = 0.6;
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, H, 12), M.iskelet);
    d.position.set(dx, G.yk(0.5) + H / 2, 0); d.castShadow = true;
    govde.add(d);
    const seren = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 8.4, 8), M.iskelet);
    seren.rotation.x = Math.PI / 2; seren.position.set(dx + 0.12, H - 0.9, 0); seren.castShadow = true;
    govde.add(seren);
    if (yelken === "sarili") {
      const sargi = organiklestir(new THREE.CylinderGeometry(0.2, 0.2, 7.6, 12, 16), { genlik: 0.08, olcek: 3, tohum });
      const y = new THREE.Mesh(sargi, M.keten);
      y.rotation.x = Math.PI / 2; y.position.set(dx + 0.12, H - 1.15, 0); y.castShadow = true;
      govde.add(y);
    } else {
      // Rüzgârla şişmiş kare yelken
      const g = new THREE.PlaneGeometry(7.8, 5.2, 16, 10);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i) / 3.9, y = (p.getY(i) + 2.6) / 5.2;
        p.setZ(i, 0.9 * (1 - x * x) * Math.sin(Math.PI * Math.min(1, y * 1.1)));
      }
      g.computeVertexNormals();
      const y = new THREE.Mesh(g, M.keten);
      y.rotation.y = Math.PI / 2; y.position.set(dx + 0.25, H - 3.6, 0); y.castShadow = true;
      govde.add(y);
    }
    // Halatlar: baş ve kıç ıstralyası, yan çarmıhlar
    const tepe = [dx, H - 0.3, 0];
    for (const hedef of [[G.L / 2 + 0.3, G.ys(1) + 0.4, 0], [-G.L / 2 + 0.2, G.ys(0) + 0.6, 0], ...[1, -1].flatMap((s) => [G.P(0.48, 1, s), G.P(0.58, 1, s)].map((p) => [p.x, p.y, p.z]))]) {
      govde.add(tup([tepe, hedef], 0.018, M.halat, { parca: 2, radyal: 4 }));
    }
  }

  grup.scale.setScalar(olcek);
  grup.userData = { tahtalar, G, govde };
  return grup;
}

/** Tahta değiştirme ve parıltı denetimi; S.herKare ile güncellenir */
export function tahtaDenetci(S, gemi) {
  const { tahtalar } = gemi.userData;
  const yeniM = tahtalar.map(() => tahtaMalzemesi(true));
  const eskiM = tahtalar.map((t) => t.material);
  const parilti = new Map();
  let simdiki = 0;
  S.herKare((dt) => {
    for (const [i, t] of parilti) {
      const k = Math.max(0, t - dt);
      yeniM[i].emissiveIntensity = 0.55 * k;
      if (k <= 0) parilti.delete(i); else parilti.set(i, k);
    }
  });
  return {
    get sayi() { return simdiki; },
    /** İlk n tahta yeni olsun */
    ayarla(n) {
      tahtalar.forEach((t, i) => {
        const yeni = i < n;
        const once = i < simdiki;
        t.material = yeni ? yeniM[i] : eskiM[i];
        if (yeni && !once) parilti.set(i, 1.2);
      });
      simdiki = n;
    },
  };
}

/** Sökülen eski tahta yığını: n tane uzun, yıpranmış kalas */
export function tahtaYigini(adet = TAHTA) {
  const grup = new THREE.Group();
  const m = tahtaMalzemesi(false);
  const r = rastgele(7);
  const kalaslar = [];
  for (let i = 0; i < adet; i++) {
    const g = new THREE.BoxGeometry(10.5 + r() * 1.2, 0.08, 0.38, 16, 1, 1);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k) / 5.5; p.setY(k, p.getY(k) + 0.06 * (1 - x * x)); }
    g.computeVertexNormals();
    const k = new THREE.Mesh(g, m);
    const kat = Math.floor(i / 3), sira = i % 3;
    k.position.set((r() - 0.5) * 0.5, 0.06 + kat * 0.1, (sira - 1) * 0.44 + (kat % 2) * 0.1);
    k.rotation.y = (r() - 0.5) * 0.06;
    k.castShadow = true; k.receiveShadow = true;
    grup.add(k);
    kalaslar.push(k);
  }
  // Altta iki takoz
  for (const x of [-3.5, 3.5]) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 1.6), malzemeler().iskelet);
    t.position.set(x, 0.0, 0); t.receiveShadow = true;
    grup.add(t);
  }
  grup.userData.goster = (n) => kalaslar.forEach((k, i) => { k.visible = i < n; });
  grup.userData.goster(0);
  return grup;
}

/** Karadaki kızak (ikinci gemiyi taşıyan destekler) */
export function kizak(G = govdeBicimi()) {
  const grup = new THREE.Group();
  const M = malzemeler();
  for (const u of [0.2, 0.38, 0.62, 0.8]) {
    const x = (u - 0.5) * G.L;
    const taban = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 3.6), M.iskelet);
    taban.position.set(x, 0.15, 0);
    grup.add(taban);
    for (const s of [1, -1]) {
      const p = G.P(u, 0.35, s);
      const dikme = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.4, 0.16), M.iskelet);
      dikme.position.set(x, 0.75, p.z + s * 0.25); dikme.rotation.x = -s * 0.35;
      grup.add(dikme);
    }
  }
  grup.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  return grup;
}
