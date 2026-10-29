// Ortak 3B dünya araçları (motor adayı): bakış noktaları, gökyüzü yansıması, arazi, su,
// hazır dokular, birleştirilmiş bina geometrisi, ağaç/kaya toplulukları, ilerleyen yol çizgisi.
// Felsefe, Din Kültürü ve Peygamberimizin Hayatı derslerinin dünyaları bunun üstüne kurulur.
import { sahne3dKur, malzeme, organiklestir, yuzeyDokusu, coklu, rastgele, fbm, THREE } from "../../../../engine/sahne3d.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export { THREE, malzeme, organiklestir, yuzeyDokusu, coklu, rastgele, fbm };

/**
 * sahne3dKur + adlandırılmış bakış noktaları + alttaki içerik kartına göre görüş kaydırma.
 * bakislar: { ad: { konum:[x,y,z], hedef:[x,y,z] } }
 */
export function dunyaKur(kap, { bakislar = {}, ...secenek } = {}) {
  const S = sahne3dKur(kap, secenek);
  let ekKayma = 0, ilk = true;
  // Motorun panel kaydırmasına, sahnenin altındaki içerik kartının yarı yüksekliğini ekler
  function kaydir() {
    const w = kap.clientWidth, h = kap.clientHeight;
    if (!w || !h) return;
    const st = getComputedStyle(kap);
    const px = (ad) => parseFloat(st.getPropertyValue(ad)) || 0;
    const x = (px("--sag-bosluk") - px("--sol-bosluk")) / 2;
    const y = (px("--alt-bosluk") - px("--ust-bosluk")) / 2 + ekKayma;
    if (x || y) S.camera.setViewOffset(w, h, x, y, w, h); else S.camera.clearViewOffset();
    S.camera.updateProjectionMatrix();
  }
  window.addEventListener("d-yerlesim", kaydir);
  new ResizeObserver(kaydir).observe(kap);
  window.addEventListener("ok-kart", (e) => { ekKayma = Math.max(0, (e.detail || 0) / 2); kaydir(); });
  S.bakislar = bakislar;
  /** Adlandırılmış ya da verilen bakış noktasına kamerayla geç */
  S.bak = (ad, { sure = 1.8 } = {}) => {
    const b = typeof ad === "string" ? S.bakislar[ad] : ad;
    if (!b) return Promise.resolve();
    if (ilk) { ilk = false; S.kameraKoy(b); return Promise.resolve(); }
    return S.kameraGit({ ...b, sure });
  };
  return S;
}

/** Açık hava yansıması: gök renkli bir küreden ortam haritası (su, cam, metal gökyüzünü yansıtır) */
export function gokOrtami(S, { ust = 0x5d8fd0, ufuk = 0xdfe8ef, alt = 0x6b5a46, gunes = null, guc = 0.6 } = {}) {
  const sahne = new THREE.Scene();
  const geo = new THREE.SphereGeometry(50, 32, 16);
  const renkler = [], cu = new THREE.Color(ust), cf = new THREE.Color(ufuk), ca = new THREE.Color(alt), c = new THREE.Color();
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / 50;
    if (t >= 0) c.copy(cf).lerp(cu, Math.pow(t, 0.6)); else c.copy(cf).lerp(ca, Math.min(1, -t * 3));
    renkler.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(renkler, 3));
  // Yalnızca yansıma haritası üretmek için çizilir, ekranda görünmez
  sahne.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  if (gunes) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(gunes.renk ?? 0xfff2d6).multiplyScalar(gunes.parlaklik ?? 6) }));
    g.position.set(...gunes.yon.map((v) => v * 45));
    sahne.add(g);
  }
  const pmrem = new THREE.PMREMGenerator(S.renderer);
  const eski = S.scene.environment;
  S.scene.environment = pmrem.fromScene(sahne, 0.02).texture;
  S.scene.environmentIntensity = guc;
  eski?.dispose?.();
  pmrem.dispose();
  geo.dispose();
}

/* ---------------- Dokular (önbellekli) ---------------- */
const DOKU_TANIM = {
  siva: { taban: "#e9e1d1", koyu: "#c8bca6", acik: "#f7f2e8", olcek: 5, benek: 0.2 },
  tas: { taban: "#c9bb9c", koyu: "#9a8b6e", acik: "#e0d5bb", olcek: 9, benek: 0.35 },
  mermer: { taban: "#ebe7df", koyu: "#cdc6b8", acik: "#faf8f3", olcek: 3, benek: 0.04, lif: 0.25, lifSiklik: 6 },
  kiremit: { taban: "#b05a3c", koyu: "#843a25", acik: "#cc7a55", olcek: 12, benek: 0.35 },
  kerpic: { taban: "#b8936a", koyu: "#8d6a47", acik: "#d3b28a", olcek: 7, benek: 0.3 },
  granit: { taban: "#6a5d52", koyu: "#40362f", acik: "#8a7c6f", olcek: 10, benek: 0.4 },
  kum: { taban: "#dcbc8c", koyu: "#bb986c", acik: "#efd7ad", olcek: 6, benek: 0.25 },
  yaprak: { taban: "#6f7d4c", koyu: "#46532e", acik: "#93a066", olcek: 14, benek: 0.4 },
  kabuk: { taban: "#6b5843", koyu: "#43352a", acik: "#8a7660", olcek: 8, benek: 0.2, lif: 0.5, lifSiklik: 30, uzama: [0.3, 3] },
  ahsap: { taban: "#a57a4c", koyu: "#7a5432", acik: "#c49a68", olcek: 4, benek: 0.08, lif: 0.55, lifSiklik: 18, uzama: [0.25, 2.5] },
  detay: { taban: "#efefef", koyu: "#b9b9b9", acik: "#ffffff", olcek: 10, benek: 0.35 },
};
const dokuOnbellek = new Map();
export function doku(ad, { boyut = 256, tohum = 3, ...ek } = {}) {
  const anahtar = `${ad}:${boyut}:${tohum}:${JSON.stringify(ek)}`;
  if (!dokuOnbellek.has(anahtar)) dokuOnbellek.set(anahtar, yuzeyDokusu({ ...DOKU_TANIM[ad], ...ek, boyut, tohum }));
  return dokuOnbellek.get(anahtar);
}
/** Dokulu doğal malzeme */
export function dokuluMalzeme(ad, { tekrar = [1, 1], puruz = 0.9, renk = 0xffffff, kabarti = 0.6, ...ek } = {}) {
  const d = doku(ad, ek);
  const harita = d.renk.clone(), ph = d.puruz.clone();
  for (const t of [harita, ph]) { t.repeat.set(...tekrar); t.needsUpdate = true; }
  return new THREE.MeshStandardMaterial({ color: renk, map: harita, roughnessMap: ph, bumpMap: ph, bumpScale: kabarti, roughness: puruz, metalness: 0 });
}

/* ---------------- Arazi ---------------- */
/**
 * Yükseklik fonksiyonundan arazi. renk(x, z, y, egim) → THREE.Color (egim: 0 düz, 1 dik)
 * Dönen { mesh, h(x,z) }
 */
export function arazi(S, { genislik = 200, derinlik = 200, bolum = 180, merkez = [0, 0], yukseklik, renk, detayTekrar = 40 }) {
  const geo = new THREE.PlaneGeometry(genislik, derinlik, bolum, Math.max(2, Math.round((bolum * derinlik) / genislik)));
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + merkez[0], z = p.getZ(i) + merkez[1];
    p.setXYZ(i, x, yukseklik(x, z), z);
  }
  geo.computeVertexNormals();
  const n = geo.attributes.normal, renkler = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const c = renk(p.getX(i), p.getZ(i), p.getY(i), 1 - n.getY(i));
    renkler[i * 3] = c.r; renkler[i * 3 + 1] = c.g; renkler[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(renkler, 3));
  const d = doku("detay", { tohum: 11 });
  const harita = d.renk.clone(), ph = d.puruz.clone();
  for (const t of [harita, ph]) { t.repeat.set(detayTekrar, detayTekrar * (derinlik / genislik)); t.needsUpdate = true; }
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, map: harita, roughnessMap: ph, bumpMap: ph, bumpScale: 1.2, roughness: 1, metalness: 0 }));
  mesh.receiveShadow = true;
  S.scene.add(mesh);
  return { mesh, h: yukseklik };
}

/** Renk karışımı yardımcısı: renkler listesi ve ağırlıklar */
export const renkKat = (() => {
  const c = new THREE.Color(), d = new THREE.Color();
  return (taban, ...katlar) => {
    c.set(taban);
    for (const [renk, w] of katlar) if (w > 0) c.lerp(d.set(renk), Math.min(1, w));
    return c;
  };
})();
export const yumusakAdim = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ---------------- Su ---------------- */
function dalgaHaritasi(boyut = 256, tohum = 5) {
  const r = rastgele(tohum);
  // Tamsayı frekanslı sinüsler: doku dikişsiz tekrarlanır
  const dalgalar = Array.from({ length: 14 }, () => ({ kx: Math.round((r() - 0.5) * 14), ky: Math.round((r() - 0.5) * 14), f: r() * 6.283, a: 0.3 + r() }));
  const yuk = (u, v) => dalgalar.reduce((t, w) => t + (w.a / (1 + Math.hypot(w.kx, w.ky) * 0.25)) * Math.sin(6.283 * (w.kx * u + w.ky * v) + w.f), 0);
  const tuval = document.createElement("canvas");
  tuval.width = tuval.height = boyut;
  const c = tuval.getContext("2d"), im = c.createImageData(boyut, boyut), e = 1 / boyut;
  for (let j = 0; j < boyut; j++) for (let i = 0; i < boyut; i++) {
    const u = i / boyut, v = j / boyut;
    const dx = (yuk(u + e, v) - yuk(u - e, v)) * 6, dy = (yuk(u, v + e) - yuk(u, v - e)) * 6;
    const L = Math.hypot(dx, dy, 1), k = (j * boyut + i) * 4;
    im.data[k] = (-dx / L * 0.5 + 0.5) * 255; im.data[k + 1] = (-dy / L * 0.5 + 0.5) * 255; im.data[k + 2] = (1 / L * 0.5 + 0.5) * 255; im.data[k + 3] = 255;
  }
  c.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(tuval);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
/** Hareketli su yüzeyi (deniz, havuz, kase) */
export function su(S, { genislik = 300, derinlik = 300, y = 0, renk = 0x1e5c74, merkez = [0, 0], tekrar = 30, hiz = 0.012, opaklik = 0.9, geo = null } = {}) {
  const n1 = dalgaHaritasi(256, 5), n2 = dalgaHaritasi(256, 9);
  n1.repeat.set(tekrar, tekrar * (derinlik / genislik)); n2.repeat.set(tekrar * 0.6, tekrar * 0.6 * (derinlik / genislik));
  const mat = new THREE.MeshPhysicalMaterial({
    color: renk, roughness: 0.12, metalness: 0, normalMap: n1, normalScale: new THREE.Vector2(0.18, 0.18),
    clearcoat: 1, clearcoatRoughness: 0.08, clearcoatNormalMap: n2, clearcoatNormalScale: new THREE.Vector2(0.22, 0.22),
    transparent: opaklik < 1, opacity: opaklik, specularIntensity: 1, envMapIntensity: 1.2,
  });
  const g = geo || new THREE.PlaneGeometry(genislik, derinlik, 1, 1).rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(g, mat);
  mesh.position.set(merkez[0], y, merkez[1]);
  mesh.receiveShadow = true;
  S.scene.add(mesh);
  S.herKare((dt) => { n1.offset.x += dt * hiz; n1.offset.y += dt * hiz * 0.4; n2.offset.x -= dt * hiz * 0.5; n2.offset.y += dt * hiz * 0.8; });
  return mesh;
}

/* ---------------- Birleştirici: çok sayıda statik parça → malzeme başına tek çizim ---------------- */
export function birlestirici() {
  const kume = new Map();
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), v = new THREE.Vector3();
  return {
    /** geo: geometri (kopyalanır), malz: Material, konum/dönüş/ölçek */
    ekle(geo, malz, { konum = [0, 0, 0], donus = [0, 0, 0], olcek = [1, 1, 1], matris = null } = {}) {
      const g = (geo.index ? geo.toNonIndexed() : geo.clone());
      for (const ad of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(ad)) g.deleteAttribute(ad);
      g.applyMatrix4(matris || m.compose(v.set(...konum), q.setFromEuler(e.set(...donus)), s.set(...(Array.isArray(olcek) ? olcek : [olcek, olcek, olcek]))));
      if (!kume.has(malz)) kume.set(malz, []);
      kume.get(malz).push(g);
    },
    bitir(hedef, { golge = true, alir = true } = {}) {
      const grup = new THREE.Group();
      for (const [malz, liste] of kume) {
        const mesh = new THREE.Mesh(mergeGeometries(liste), malz);
        mesh.castShadow = golge; mesh.receiveShadow = alir;
        grup.add(mesh);
        liste.forEach((g) => g.dispose());
      }
      hedef.add(grup);
      kume.clear();
      return grup;
    },
  };
}

/* ---------------- Bina parçaları ---------------- */
/** Üçgen kesitli çatı (beşik çatı): en (x), derinlik (z), yükseklik */
export function besikCatiGeo(en, derin, yuk) {
  const sekil = new THREE.Shape();
  sekil.moveTo(-en / 2, 0); sekil.lineTo(en / 2, 0); sekil.lineTo(0, yuk); sekil.closePath();
  const g = new THREE.ExtrudeGeometry(sekil, { depth: derin, bevelEnabled: false });
  g.translate(0, 0, -derin / 2);
  return g;
}
/** Yivli antik sütun (kaide + gövde + başlık); taban y=0 */
export function sutunGeo(yuk = 4, r = 0.3, { yiv = 20, ayrinti = 20 } = {}) {
  const pts = [
    [0, 0], [r * 1.45, 0], [r * 1.45, r * 0.25], [r * 1.25, r * 0.4], [r * 1.12, r * 0.5],
    [r * 1.0, r * 0.7], [r * 0.86, yuk * 0.92], [r * 0.95, yuk * 0.94], [r * 1.35, yuk * 0.97], [r * 1.5, yuk * 0.985], [r * 1.5, yuk], [0, yuk],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, ayrinti * 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (y < r * 0.75 || y > yuk * 0.9) continue;
    const a = Math.atan2(z, x), k = 1 - 0.045 * Math.max(0, Math.cos(a * yiv));
    p.setXYZ(i, x * k, y, z * k);
  }
  g.computeVertexNormals();
  return g;
}
/**
 * Basit ev: duvar kutusu, çatı (beşik ya da düz + korkuluk), kapı ve pencere boşlukları.
 * b: birlestirici, M: { duvar, cati, bosluk, ahsap } malzemeleri
 */
export function evEkle(b, M, { x, y, z, en = 3, derin = 3, yuk = 2.4, donus = 0, cati = "besik", catiYuk = 0.9, pencere = 2 }) {
  const mat = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, donus, 0)), new THREE.Vector3(1, 1, 1));
  const yer = (geo, malz, px, py, pz, ry = 0) => {
    const yerel = new THREE.Matrix4().compose(new THREE.Vector3(px, py, pz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(1, 1, 1));
    b.ekle(geo, malz, { matris: mat.clone().multiply(yerel) });
  };
  // Duvarlar zemine biraz gömülür ki eğimli arazide boşluk kalmasın
  yer(new THREE.BoxGeometry(en, yuk + 0.6, derin), M.duvar, 0, (yuk - 0.6) / 2, 0);
  if (cati === "besik") {
    yer(besikCatiGeo(en + 0.4, derin + 0.35, catiYuk), M.cati, 0, yuk, 0);
  } else {
    yer(new THREE.BoxGeometry(en + 0.08, 0.14, derin + 0.08), M.duvar, 0, yuk + 0.07, 0);
    yer(new THREE.BoxGeometry(en + 0.1, 0.32, 0.12), M.duvar, 0, yuk + 0.22, derin / 2);
    yer(new THREE.BoxGeometry(en + 0.1, 0.32, 0.12), M.duvar, 0, yuk + 0.22, -derin / 2);
    yer(new THREE.BoxGeometry(0.12, 0.32, derin), M.duvar, en / 2, yuk + 0.22, 0);
    yer(new THREE.BoxGeometry(0.12, 0.32, derin), M.duvar, -en / 2, yuk + 0.22, 0);
  }
  // Kapı (ahşap) ve küçük pencereler (karanlık boşluk)
  yer(new THREE.BoxGeometry(Math.min(0.9, en * 0.28), Math.min(1.7, yuk * 0.7), 0.08), M.ahsap, -en * 0.18, Math.min(1.7, yuk * 0.7) / 2, derin / 2 + 0.02);
  for (let i = 0; i < pencere; i++) {
    const px = en * (0.12 + 0.26 * i);
    yer(new THREE.BoxGeometry(0.42, 0.42, 0.06), M.bosluk, px, yuk * 0.66, derin / 2 + 0.02);
  }
  yer(new THREE.BoxGeometry(0.06, 0.4, 0.4), M.bosluk, en / 2 + 0.02, yuk * 0.66, 0);
}

/* ---------------- Bitki ve kaya toplulukları ---------------- */
function govdeGeo({ yuk = 1.6, r = 0.12, burgu = 0.25, tohum = 1 }) {
  const g = new THREE.CylinderGeometry(r * 0.7, r * 1.25, yuk, 9, 8, true);
  g.translate(0, yuk / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / yuk;
    p.setX(i, p.getX(i) + Math.sin(y * 3 + tohum) * burgu * y);
    p.setZ(i, p.getZ(i) + Math.cos(y * 2.3 + tohum) * burgu * 0.7 * y);
  }
  return organiklestir(g, { genlik: r * 0.35, olcek: 6, tohum });
}
function tepeGeo(parcalar, { genlik = 0.18, olcek = 2.2, tohum = 2, ayrinti = [10, 8] } = {}) {
  const liste = parcalar.map(([x, y, z, sx, sy, sz]) => {
    const g = new THREE.SphereGeometry(1, ayrinti[0], ayrinti[1]);
    g.scale(sx, sy, sz); g.translate(x, y, z);
    return g;
  });
  const g = mergeGeometries(liste);
  liste.forEach((x) => x.dispose());
  return organiklestir(g, { genlik, olcek, tohum });
}
/** Hurma yaprağı tacı: kavisli, ince uzun yapraklar */
function hurmaTaciGeo() {
  const liste = [];
  for (let i = 0; i < 11; i++) {
    const g = new THREE.PlaneGeometry(2.4, 0.42, 10, 2);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k) + 1.2, yv = p.getY(k);
      p.setXYZ(k, x, -0.18 * x * x + 0.35 * x, yv * (1 - x / 2.6) + Math.abs(yv) * 0.5);
    }
    g.rotateY((i / 11) * Math.PI * 2 + (i % 2) * 0.2);
    liste.push(g);
  }
  const g = mergeGeometries(liste);
  g.computeVertexNormals();
  return g;
}
const AGAC = {
  zeytin: () => ({ govde: govdeGeo({ yuk: 1.5, r: 0.16, burgu: 0.35, tohum: 3 }), tepe: tepeGeo([[0, 1.9, 0, 1.25, 0.75, 1.1], [0.7, 1.7, 0.3, 0.8, 0.55, 0.8], [-0.6, 1.75, -0.2, 0.85, 0.6, 0.8], [0.1, 2.3, -0.3, 0.8, 0.5, 0.75]], { genlik: 0.28, olcek: 2.6 }), tepeRenk: 0x7c8758, govdeRenk: 0x5e5344 }),
  selvi: () => ({ govde: govdeGeo({ yuk: 0.8, r: 0.12, burgu: 0.05 }), tepe: tepeGeo([[0, 2.9, 0, 0.62, 2.6, 0.62]], { genlik: 0.12, olcek: 3, ayrinti: [10, 12] }), tepeRenk: 0x34502f, govdeRenk: 0x4a3c2e }),
  yuvarlak: () => ({ govde: govdeGeo({ yuk: 1.4, r: 0.13, burgu: 0.15, tohum: 5 }), tepe: tepeGeo([[0, 2.2, 0, 1.15, 1.0, 1.15], [0.5, 2.6, 0.2, 0.7, 0.6, 0.7], [-0.45, 2.45, -0.3, 0.75, 0.6, 0.7]], { genlik: 0.25, olcek: 2.4 }), tepeRenk: 0x587a3c, govdeRenk: 0x5a4632 }),
  akasya: () => ({ govde: govdeGeo({ yuk: 2.0, r: 0.13, burgu: 0.45, tohum: 7 }), tepe: tepeGeo([[0.6, 2.5, 0.2, 1.0, 0.3, 0.9], [-0.5, 2.35, 0.45, 0.9, 0.28, 0.8], [0.1, 2.62, -0.6, 0.95, 0.3, 0.85], [-0.35, 2.72, -0.1, 0.8, 0.26, 0.75], [1.25, 2.3, -0.35, 0.7, 0.24, 0.6], [-1.1, 2.25, -0.4, 0.6, 0.22, 0.55]], { genlik: 0.3, olcek: 3.2, ayrinti: [10, 6] }), tepeRenk: 0x8a8f58, govdeRenk: 0x4d3c2d }),
  hurma: () => ({ govde: govdeGeo({ yuk: 4.2, r: 0.16, burgu: 0.5, tohum: 2 }), tepe: hurmaTaciGeo().translate(0.42, 4.15, 0.1), tepeRenk: 0x5f7a35, govdeRenk: 0x7a6248, cift: true }),
  asma: () => ({ govde: govdeGeo({ yuk: 0.5, r: 0.06, burgu: 0.1 }), tepe: tepeGeo([[0, 0.65, 0, 0.55, 0.42, 0.5]], { genlik: 0.12, olcek: 4, ayrinti: [8, 6] }), tepeRenk: 0x5f8438, govdeRenk: 0x5a4632 }),
};
/**
 * Ağaç topluluğu: konumlar [[x,y,z,olcek?],...] → iki InstancedMesh (gövde + taç)
 */
export function agaclar(S, tur, konumlar, { tohum = 1, golge = true, renkSapma = 0.12 } = {}) {
  const t = AGAC[tur]();
  const kab = doku("kabuk", { tohum: 4 }), det = doku("detay", { tohum: 6, olcek: 16 }), yap = doku("yaprak", { tohum: 6 });
  const govdeM = new THREE.MeshStandardMaterial({ color: t.govdeRenk, map: det.renk, bumpMap: kab.puruz, bumpScale: 1, roughness: 0.95 });
  const tepeM = new THREE.MeshStandardMaterial({ color: t.tepeRenk, map: det.renk, bumpMap: yap.puruz, bumpScale: 2, roughness: 0.88, side: t.cift ? THREE.DoubleSide : THREE.FrontSide });
  const g = coklu(t.govde, govdeM, konumlar.length, { golge });
  const k = coklu(t.tepe, tepeM, konumlar.length, { golge });
  const r = rastgele(tohum), c = new THREE.Color();
  konumlar.forEach(([x, y, z, o = 1], i) => {
    const ol = o * (0.8 + r() * 0.4), d = r() * 6.28;
    g.userData.yerlestir(i, x, y - 0.05, z, ol, d);
    k.userData.yerlestir(i, x, y - 0.05, z, ol, d);
    k.setColorAt(i, c.setHSL(0, 0, 1 - renkSapma / 2 + r() * renkSapma));
  });
  g.userData.bitir(); k.userData.bitir();
  if (k.instanceColor) k.instanceColor.needsUpdate = true;
  g.receiveShadow = k.receiveShadow = true;
  S.scene.add(g, k);
  return { govde: g, tepe: k };
}
/** Kaya topluluğu: konumlar [[x,y,z,olcek],...] */
export function kayalar(S, konumlar, { ad = "tas", renk = 0xffffff, tohum = 3, basik = 0.6 } = {}) {
  const geo = organiklestir(new THREE.DodecahedronGeometry(1, 2), { genlik: 0.32, olcek: 1.3, tohum });
  geo.scale(1, basik, 1);
  const mat = dokuluMalzeme(ad, { renk, kabarti: 1.5 });
  const m = coklu(geo, mat, konumlar.length, { golge: true });
  const r = rastgele(tohum);
  konumlar.forEach(([x, y, z, o = 1], i) => m.userData.yerlestir(i, x, y, z, [o * (0.8 + r() * 0.5), o * (0.7 + r() * 0.5), o * (0.8 + r() * 0.5)], r() * 6.28, (r() - 0.5) * 0.4));
  m.userData.bitir();
  m.receiveShadow = true;
  S.scene.add(m);
  return m;
}
/** Yarıçap içinde rastgele noktalar; uygun(x,z) false dönerse nokta atlanır */
export function dagit(sayi, { merkez = [0, 0], yaricap = 10, ic = 0, tohum = 1, uygun = () => true, h = () => 0, olcek = [0.8, 1.2] } = {}) {
  const r = rastgele(tohum), cikti = [];
  for (let deneme = 0; cikti.length < sayi && deneme < sayi * 20; deneme++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(ic * ic + r() * (yaricap * yaricap - ic * ic));
    const x = merkez[0] + Math.cos(a) * d, z = merkez[1] + Math.sin(a) * d;
    if (!uygun(x, z)) continue;
    cikti.push([x, h(x, z), z, olcek[0] + r() * (olcek[1] - olcek[0])]);
  }
  return cikti;
}

/* ---------------- İlerleyen yol çizgisi ---------------- */
/** Noktalardan tüp; ilerleme(0..1) ile ucundan büyür */
export function yolCizgisi(S, noktalar, { renk = 0xffb547, kalinlik = 0.25, parca = 400, isik = 0.7 } = {}) {
  const egri = new THREE.CatmullRomCurve3(noktalar.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  const geo = new THREE.TubeGeometry(egri, parca, kalinlik, 6, false);
  const mat = new THREE.MeshStandardMaterial({ color: renk, emissive: renk, emissiveIntensity: isik, roughness: 0.5 });
  const mesh = new THREE.Mesh(geo, mat);
  S.scene.add(mesh);
  const ilerleme = (t) => { geo.setDrawRange(0, Math.round(Math.max(0, Math.min(1, t)) * parca) * 6 * 6); mesh.visible = t > 0.001; };
  ilerleme(0);
  return { mesh, egri, ilerleme, nokta: (t) => egri.getPointAt(Math.max(0, Math.min(1, t))) };
}
