// Hücre içi istasyonlar: ATP molekülü (top-çubuk, CPK renkleri), kloroplast (kesitli), ¹⁸O izotop tezgâhı
import { THREE, rastgele, organiklestir, yaziEtiketi, vektorOku, coklu } from "../../../../engine/sahne3d.js";
import { renk, boya } from "./dogal.js";

/* ---------------- Atom ve bağ ---------------- */
const CPK = { C: "#5a606b", N: "#3f6fe0", O: "#e0342f", P: "#ff8a1c", H: "#eef0f3" };
const YARICAP = { C: 0.36, N: 0.36, O: 0.36, P: 0.5, H: 0.21 };
const atomMalz = {};
function atomMalzemesi(t) {
  return (atomMalz[t] ||= new THREE.MeshPhysicalMaterial({ color: CPK[t], roughness: 0.28, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.15 }));
}
const kureGeo = new THREE.SphereGeometry(1, 32, 20);
function atom(t, p) {
  const m = new THREE.Mesh(kureGeo, atomMalzemesi(t));
  m.scale.setScalar(YARICAP[t]); m.position.copy(p); m.castShadow = true;
  m.userData.tur = t;
  return m;
}
const bagMalz = new THREE.MeshPhysicalMaterial({ color: "#c9d1dc", roughness: 0.35, clearcoat: 0.6 });
const silindir = new THREE.CylinderGeometry(1, 1, 1, 14);
function bag(a, b, { r = 0.1, malz = bagMalz } = {}) {
  const m = new THREE.Mesh(silindir, malz);
  bagYerlestir(m, a, b, r);
  return m;
}
function bagYerlestir(m, a, b, r = 0.1) {
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.scale.set(r, a.distanceTo(b), r);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
}
const v = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const cokgen = (cx, cy, R, n, a0) => Array.from({ length: n }, (_, i) => v(cx + R * Math.cos(a0 + (i * 2 * Math.PI) / n), cy + R * Math.sin(a0 + (i * 2 * Math.PI) / n)));

/* ---------------- ATP ---------------- */
function atpYap(S) {
  const grup = new THREE.Group();
  const D = 1.4; // bağ uzunluğu
  // Adenin: altıgen (N1 C2 N3 C4 C5 C6) + beşgen (C4 C5 N7 C8 N9)
  const ax = -6.6, ay = 1.2, Ra = D;
  const [C6, N1, C2, N3, C4, C5] = cokgen(ax, ay, Ra, 6, Math.PI / 2);
  // beşgen C4–C5 kenarına (sağ kenar) kaynaşık
  const kx = C4.x, Rp = D / (2 * Math.sin(Math.PI / 5)), ap = D / (2 * Math.tan(Math.PI / 5));
  const pc = v(kx + ap, ay);
  const pent = (deg) => v(pc.x + Rp * Math.cos((deg * Math.PI) / 180), pc.y + Rp * Math.sin((deg * Math.PI) / 180));
  const N7 = pent(72), C8 = pent(0), N9 = pent(-72);
  const N6 = v(C6.x, C6.y + 1.35);
  // Riboz: C1' N9'a bağlı, beşgen halka aşağı-sağda
  const rc = v(N9.x + 1.2, N9.y - 2.1, 0.3);
  const [C1, C2r, C3r, C4r, O4] = cokgen(rc.x, rc.y, Rp, 5, Math.PI * 0.62).map((p, i) => p.setZ(0.3 + (i === 4 ? -0.4 : i % 2 ? 0.35 : 0)));
  const C5r = v(C4r.x + 1.3, C4r.y + 0.6, -0.2);
  const O5 = v(C5r.x + 1.3, C5r.y - 0.2, 0);
  // Fosfat zinciri
  const fosfatlar = [], disO = [];
  let x = O5.x + 1.55;
  const P = [], kopru = [];
  for (let i = 0; i < 3; i++) {
    const p = v(x, O5.y - 0.1, 0); P.push(p);
    if (i < 2) kopru.push(v(x + 1.55, O5.y - 0.1, 0));
    x += 3.1;
  }
  const H = [];
  const ekleH = (a, dx, dy, dz = 0) => { const h = v(a.x + dx, a.y + dy, a.z + dz); H.push([a, h]); return h; };

  const atomlar = new THREE.Group();
  const bolum = (ad) => { const g = new THREE.Group(); g.userData.bolum = ad; atomlar.add(g); return g; };
  const adeninG = bolum("adenin"), ribozG = bolum("riboz");
  const ekle = (g, t, p) => { const a = atom(t, p); g.add(a); return a; };
  for (const [t, p] of [["C", C6], ["N", N1], ["C", C2], ["N", N3], ["C", C4], ["C", C5], ["N", N7], ["C", C8], ["N", N9], ["N", N6]]) ekle(adeninG, t, p);
  for (const h of [ekleH(N6, -0.8, 0.6), ekleH(N6, 0.8, 0.6), ekleH(C2, -0.95, -0.5), ekleH(C8, 1.0, 0.1)]) ekle(adeninG, "H", h);
  for (const [t, p] of [["C", C1], ["C", C2r], ["C", C3r], ["C", C4r], ["O", O4], ["C", C5r]]) ekle(ribozG, t, p);
  const O2r = v(C2r.x - 0.4, C2r.y - 1.3, 0.9), O3r = v(C3r.x + 0.3, C3r.y - 1.35, 0.8);
  ekle(ribozG, "O", O2r); ekle(ribozG, "O", O3r);
  for (const h of [ekleH(O2r, -0.6, -0.6), ekleH(O3r, 0.6, -0.6), ekleH(C1, -0.3, -0.2, -1.0), ekleH(C5r, 0.1, 0.9, 0.5)]) ekle(ribozG, "H", h);
  const fosfatGruplari = P.map((p, i) => {
    const g = bolum(`fosfat${i}`);
    ekle(g, "P", p);
    const o1 = v(p.x, p.y + 1.55, 0.1), o2 = v(p.x + 0.2, p.y - 0.75, 1.35);
    const os = [o1, o2];
    if (i === 2) os.push(v(p.x + 1.5, p.y - 0.3, -0.35));
    for (const o of os) ekle(g, "O", o);
    g.userData.oksijenler = os;
    return g;
  });
  const O5a = ekle(ribozG, "O", O5);
  const kopruA = kopru.map((k, i) => ekle(fosfatGruplari[i], "O", k));
  // Bağlar
  const baglar = new THREE.Group();
  const B = (a, b, o) => baglar.add(bag(a, b, o));
  [[C6, N1], [N1, C2], [C2, N3], [N3, C4], [C4, C5], [C5, C6], [C5, N7], [N7, C8], [C8, N9], [N9, C4], [C6, N6], [N9, C1],
    [C1, C2r], [C2r, C3r], [C3r, C4r], [C4r, O4], [O4, C1], [C4r, C5r], [C5r, O5], [C2r, O2r], [C3r, O3r], [O5, P[0]]].forEach(([a, b]) => B(a, b));
  for (const [a, h] of H) B(a, h, { r: 0.07 });
  fosfatGruplari.forEach((g, i) => { for (const o of g.userData.oksijenler) B(P[i], o); });
  B(P[0], kopru[0]); B(kopru[0], P[1]); B(P[1], kopru[1]);
  // Yüksek enerjili son bağ (β–γ fosfoanhidrit)
  const enerjiMalz = new THREE.MeshStandardMaterial({ color: 0xffd34d, emissive: 0xffb300, emissiveIntensity: 1.4, roughness: 0.4 });
  const sonBag = bag(kopru[1], P[2], { r: 0.14, malz: enerjiMalz });
  baglar.add(sonBag);
  // Son fosfatın bağları ona eşlik etsin
  const gamaBaglar = new THREE.Group();
  for (const o of fosfatGruplari[2].userData.oksijenler) gamaBaglar.add(bag(P[2], o));
  fosfatGruplari[2].add(gamaBaglar);
  grup.add(atomlar, baglar);
  // Merkezle
  const kutu = new THREE.Box3().setFromObject(grup), merkez = kutu.getCenter(new THREE.Vector3());
  grup.position.sub(merkez).setY(-merkez.y + 0.4);

  // Hidroliz için su molekülü ve enerji parlaması
  const su = new THREE.Group();
  su.add(atom("O", v(0, 0, 0)), atom("H", v(-0.75, 0.55, 0)), atom("H", v(0.75, 0.55, 0)));
  su.add(bag(v(0, 0, 0), v(-0.75, 0.55, 0), { r: 0.07 }), bag(v(0, 0, 0), v(0.75, 0.55, 0), { r: 0.07 }));
  su.visible = false;
  const parlama = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const kirilma = kopru[1].clone().add(P[2]).multiplyScalar(0.5);
  parlama.position.copy(kirilma);
  grup.add(su, parlama);
  const gama = fosfatGruplari[2];
  const AYRIK = v(2.6, 2.4, 0.6);
  let anim = null, durum = "ATP";
  const igneler = [];
  const yerler = {
    adenin: v(ax + 0.6, ay + 0.2, 0), riboz: rc.clone(), fosfat: P.map((p) => p.clone()),
    adenozin: v((ax + rc.x) / 2, ay + 3.0, 0),
  };
  const pinNokta = (p) => { const o = new THREE.Object3D(); o.position.copy(p); grup.add(o); return o; };
  const noktalar = {
    adenin: pinNokta(v(N7.x - 1.2, ay + 1.9, 0.4)), riboz: pinNokta(v(rc.x, rc.y - 1.6, 0.6)),
    fosfat: P.map((p, i) => (i === 2 ? (() => { const o = new THREE.Object3D(); o.position.set(p.x, p.y - 1.6, 0.6); gama.add(o); return o; })() : pinNokta(v(p.x, p.y - 1.6, 0.6)))),
    baslik: pinNokta(v(P[1].x - 1.5, P[1].y + 2.6, 0)),
    enerji: pinNokta(kirilma.clone().add(v(0, 0.6, 0))),
  };
  void yerler; void disO; void fosfatlar; void O5a; void kopruA;
  return {
    grup,
    get durum() { return durum; },
    igneleriKur() {
      igneler.push(
        S.igne(noktalar.baslik, "ATP<small>adenozin trifosfat</small>", { renk: "#ffd34d" }),
        S.igne(noktalar.adenin, "Adenin<small>azotlu organik baz</small>", { renk: "#6f9bff", yon: "ust" }),
        S.igne(noktalar.riboz, "Riboz<small>5 karbonlu şeker</small>", { renk: "#ffb36b", yon: "alt" }),
        ...noktalar.fosfat.map((n, i) => S.igne(n, `Fosfat ${["α", "β", "γ"][i]}`, { renk: "#ffc94d", yon: "alt" })),
      );
      const e = S.igne(noktalar.enerji, "⚡ enerji", { renk: "#ffb300" }); e.gizle(true); igneler.push(e);
      this.enerjiIgne = e;
    },
    igneleriKaldir() { igneler.splice(0).forEach((n) => n.kaldir()); },
    parcala(bitti) {
      if (durum !== "ATP" || anim) return false;
      anim = { tur: "parcala", t: 0, bitti };
      su.visible = true; su.position.copy(kirilma).add(v(0, 3, 1.6));
      return true;
    },
    doldur(bitti) {
      if (durum !== "ADP" || anim) return false;
      anim = { tur: "doldur", t: 0, bitti };
      return true;
    },
    aninda(d) {
      anim = null; durum = d;
      gama.position.copy(d === "ADP" ? AYRIK : v(0, 0, 0));
      sonBag.visible = d === "ATP"; su.visible = false; parlama.material.opacity = 0;
      this.enerjiIgne?.gizle(true);
      igneler[0]?.metin(d === "ATP" ? "ATP<small>adenozin trifosfat</small>" : "ADP + Pi<small>adenozin difosfat + fosfat</small>");
    },
    kare(dt, t) {
      atomlar.rotation.y = Math.sin(t * 0.3) * 0.12;
      baglar.rotation.y = atomlar.rotation.y;
      sonBag.material.emissiveIntensity = 1.1 + Math.sin(t * 4) * 0.4;
      if (!anim) return;
      anim.t += dt;
      const k = anim.t;
      if (anim.tur === "parcala") {
        if (k < 0.7) su.position.lerpVectors(kirilma.clone().add(v(0, 3, 1.6)), kirilma.clone().add(v(0, 0.5, 0.6)), k / 0.7);
        if (k >= 0.7 && sonBag.visible) {
          sonBag.visible = false; su.visible = false;
          igneler[0]?.metin("ADP + Pi<small>adenozin difosfat + fosfat</small>");
          this.enerjiIgne?.gizle(false);
        }
        if (k >= 0.7) {
          const s = Math.min(1, (k - 0.7) / 0.9);
          gama.position.copy(AYRIK).multiplyScalar(s * s * (3 - 2 * s));
          parlama.scale.setScalar(0.4 + 3 * s); parlama.material.opacity = 0.9 * (1 - s);
        }
        if (k > 1.9) { this.enerjiIgne?.gizle(true); durum = "ADP"; const b = anim.bitti; anim = null; b?.(); }
      } else {
        const s = Math.min(1, k / 1.1);
        gama.position.copy(AYRIK).multiplyScalar(1 - s * s * (3 - 2 * s));
        if (k >= 1.1 && !sonBag.visible) {
          sonBag.visible = true; igneler[0]?.metin("ATP<small>adenozin trifosfat</small>");
          parlama.scale.setScalar(1.6); parlama.material.opacity = 0.8;
        }
        if (k >= 1.1) parlama.material.opacity = Math.max(0, 0.8 - (k - 1.1) * 1.6);
        if (k > 1.7) { durum = "ATP"; parlama.material.opacity = 0; const b = anim.bitti; anim = null; b?.(); }
      }
    },
  };
}

/* ---------------- Kloroplast ---------------- */
function kloroplastYap(S) {
  const grup = new THREE.Group();
  const A = 9, B = 4.3, C = 3.7;
  const r = rastgele(7);
  // Kesitli çift zar: ön çeyrek açık
  const kesit = (s, malz) => {
    const g = new THREE.SphereGeometry(1, 64, 32, Math.PI * 0.75, Math.PI * 1.5);
    g.scale(A * s, B * s, C * s);
    const m = new THREE.Mesh(g, malz);
    return m;
  };
  const disM = new THREE.MeshPhysicalMaterial({ color: "#8fd88a", roughness: 0.35, transparent: true, opacity: 0.55, side: THREE.DoubleSide, clearcoat: 0.8, sheen: 0.5, sheenColor: 0xe0ffd8, depthWrite: false });
  const icM = new THREE.MeshPhysicalMaterial({ color: "#5fb85c", roughness: 0.4, transparent: true, opacity: 0.6, side: THREE.DoubleSide, sheen: 0.4, depthWrite: false });
  const stromaM = new THREE.MeshStandardMaterial({ color: "#bfe6a8", roughness: 0.8, side: THREE.BackSide, transparent: true, opacity: 0.85 });
  const dis = kesit(1, disM), ic = kesit(0.94, icM), stroma = kesit(0.92, stromaM);
  dis.userData.bolum = "dis"; ic.userData.bolum = "ic"; stroma.userData.bolum = "stroma";
  dis.renderOrder = 3; ic.renderOrder = 2;
  grup.add(stroma, ic, dis);
  // Kesit kenarı (iki zar arası boşluk görünsün diye halka)
  // Grana: yuvarlak kenarlı tilakoit diskleri
  const prof = [];
  for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI; prof.push(new THREE.Vector2(0.72 + 0.09 * Math.cos(a), 0.09 * Math.sin(a))); }
  prof.unshift(new THREE.Vector2(0, -0.09)); prof.push(new THREE.Vector2(0, 0.09));
  const diskG = new THREE.LatheGeometry(prof, 36);
  const tilM = new THREE.MeshPhysicalMaterial({ color: "#2f8f3a", roughness: 0.45, clearcoat: 0.5, sheen: 0.6, sheenColor: 0x9cffa0 });
  const grana = [];
  const diskler = [];
  for (let i = 0; i < 13; i++) {
    let x, y, z, ok = false;
    for (let deneme = 0; deneme < 40 && !ok; deneme++) {
      x = (r() - 0.5) * 2 * (A - 2.2); y = (r() - 0.5) * 2 * (B - 2); z = (r() - 0.75) * 2 * (C - 1.6);
      ok = (x / (A - 1.2)) ** 2 + (y / (B - 1.2)) ** 2 + (z / (C - 1)) ** 2 < 1 && grana.every((g) => Math.hypot(g.x - x, g.z - z) > 1.9 || Math.abs(g.y - y) > 2.2);
    }
    const n = 5 + Math.floor(r() * 5);
    const p = v(x, y - n * 0.11, z);
    for (let k = 0; k < n; k++) diskler.push([p.x, p.y + k * 0.22, p.z, 0.9 + r() * 0.15]);
    grana.push(v(x, y, z));
  }
  const tilakoit = coklu(diskG, tilM, diskler.length, { golge: true });
  diskler.forEach(([x, y, z, s], i) => tilakoit.userData.yerlestir(i, x, y, z, [s, 1, s]));
  tilakoit.userData.bitir();
  tilakoit.userData.bolum = "tilakoit";
  grup.add(tilakoit);
  // Stroma lamelleri: granumları bağlayan ince yeşil şeritler
  const lamelM = new THREE.MeshPhysicalMaterial({ color: "#3fa04a", roughness: 0.5, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  for (let i = 0; i < grana.length; i++) {
    const a = grana[i];
    const enYakin = grana.map((b, j) => [j, a.distanceTo(b)]).filter(([j]) => j !== i).sort((p, q) => p[1] - q[1]).slice(0, 2);
    for (const [j] of enYakin) {
      if (j < i) continue;
      const b = grana[j];
      const yukseklik = (r() - 0.5) * 0.6;
      const egri = new THREE.QuadraticBezierCurve3(a.clone().setY(a.y + yukseklik), a.clone().add(b).multiplyScalar(0.5).add(v(0, (r() - 0.5) * 0.8, 0)), b.clone().setY(b.y + yukseklik));
      const m = new THREE.Mesh(new THREE.TubeGeometry(egri, 12, 0.12, 6), lamelM);
      m.scale.set(1, 0.35, 1); m.position.y = a.y * 0.65 * 0;
      m.userData.bolum = "tilakoit";
      grup.add(m);
    }
  }
  // Nişasta taneleri, yağ damlacıkları, ribozomlar
  const nisasta = coklu(organiklestir(new THREE.SphereGeometry(1, 20, 14).scale(0.55, 0.38, 0.4), { genlik: 0.05, olcek: 3 }), new THREE.MeshPhysicalMaterial({ color: "#f1eee2", roughness: 0.5, sheen: 0.6 }), 5);
  const yag = coklu(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshPhysicalMaterial({ color: "#f2c84b", roughness: 0.2, clearcoat: 1 }), 30);
  const ribozom = coklu(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: "#5b6f4a", roughness: 0.8 }), 400);
  const icNokta = () => { for (;;) { const p = v((r() - 0.5) * 2 * A, (r() - 0.5) * 2 * B, (r() - 0.5) * 2 * C); if ((p.x / (A - 1)) ** 2 + (p.y / (B - 0.8)) ** 2 + (p.z / (C - 0.8)) ** 2 < 1 && !(p.z > 0 && Math.abs(Math.atan2(p.z, p.x) - Math.PI / 2) < Math.PI / 4)) return p; } };
  for (let i = 0; i < 5; i++) { const p = icNokta(); nisasta.userData.yerlestir(i, p.x, p.y, p.z, 1, r() * 6); }
  for (let i = 0; i < 30; i++) { const p = icNokta(); yag.userData.yerlestir(i, p.x, p.y, p.z, 0.6 + r() * 0.8); }
  for (let i = 0; i < 400; i++) { const p = icNokta(); ribozom.userData.yerlestir(i, p.x, p.y, p.z, 0.7 + r() * 0.6); }
  [nisasta, yag, ribozom].forEach((m) => { m.userData.bitir(); m.userData.bolum = "stroma"; grup.add(m); });
  // Calvin döngüsü
  const calvinM = new THREE.MeshStandardMaterial({ color: 0xb89cff, emissive: 0x7a5cff, emissiveIntensity: 0.7, roughness: 0.4 });
  const calvin = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.12, 14, 64, Math.PI * 1.75), calvinM);
  calvin.position.set(1.2, 1.6, 1.8); calvin.userData.bolum = "stroma";
  const calvinOk = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 14), calvinM);
  calvinOk.position.set(0.95 * Math.cos(Math.PI * 1.75), 0.95 * Math.sin(Math.PI * 1.75), 0);
  calvinOk.rotation.z = Math.PI * 1.75; calvinOk.userData.bolum = "stroma";
  calvin.add(calvinOk);
  grup.add(calvin);

  // Parçacık akışları
  const akislar = [], havuz = [];
  const pGeo = new THREE.SphereGeometry(0.16, 12, 8);
  const TUR = { isik: { renk: 0xfff2a0, r: 1.3 }, su: { renk: 0x4fb3ff, r: 1.0 }, o2: { renk: 0xbfefff, r: 1.0 }, atp: { renk: 0xffa53d, r: 1.0 }, co2: { renk: 0x9aa4b2, r: 1.0 }, glikoz: { renk: 0xffffff, r: 1.4 } };
  function parcacik(t, bas, son, sure) {
    const m = havuz.pop() || new THREE.Mesh(pGeo, new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.3 }));
    m.material.color.set(TUR[t].renk); m.material.emissive.set(TUR[t].renk); m.material.emissiveIntensity = t === "isik" ? 1.6 : 0.5;
    m.material.opacity = 1; m.scale.setScalar(TUR[t].r); m.visible = true;
    grup.add(m);
    akislar.push({ m, bas, son, sure, t: 0, egri: v((Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2) });
  }
  const oran = { isik: 0, su: 0, o2: 0, atp: 0, co2: 0, glikoz: 0 }, birikim = { ...oran };
  const granum = () => grana[Math.floor(Math.random() * grana.length)].clone();
  const disari = (d) => d.clone().normalize().multiply(v(A + 2.5, B + 2.5, C + 2.5));
  function uret(dt) {
    for (const k of Object.keys(oran)) {
      birikim[k] += oran[k] * dt;
      while (birikim[k] >= 1) {
        birikim[k] -= 1;
        const g = granum();
        if (k === "isik") parcacik(k, g.clone().add(v(-6, 9, 6)), g, 0.9);
        else if (k === "su") parcacik(k, disari(v(Math.random() - 0.5, -1, Math.random() * 0.5 + 0.2)), g, 1.6);
        else if (k === "o2") parcacik(k, g, disari(v(Math.random() - 0.5, 0.6 + Math.random(), Math.random() * 0.5 + 0.3)), 1.8);
        else if (k === "atp") parcacik(k, g, calvin.position.clone(), 1.4);
        else if (k === "co2") parcacik(k, disari(v(Math.random() + 0.2, 0.8, Math.random() * 0.4 + 0.3)), calvin.position.clone(), 1.6);
        else parcacik(k, calvin.position.clone(), disari(v(1, 0.2 + Math.random() * 0.5, 0.6)), 2.0);
      }
    }
  }
  const pinNokta = (p) => { const o = new THREE.Object3D(); o.position.copy(p); grup.add(o); return o; };
  const ilkGranum = grana.reduce((a, b) => (b.z > a.z ? b : a));
  const noktalar = {
    dis: pinNokta(v(-A * 0.72, B * 0.72, 0)), ic: pinNokta(v(A * 0.62, -B * 0.72, 0.6)),
    tilakoit: pinNokta(ilkGranum.clone().add(v(0, 0.9, 0))), stroma: pinNokta(v(-A * 0.45, -B * 0.25, C * 0.4)), calvin: pinNokta(calvin.position.clone().add(v(0, 1.2, 0))),
  };
  const igneler = [];
  let tiklaFn = null;
  return {
    grup, calvinHizi: 0,
    akis(o) { Object.assign(oran, o); },
    temizle() { for (const a of akislar.splice(0)) { a.m.visible = false; grup.remove(a.m); havuz.push(a.m); } },
    igneleriKur(fn) {
      tiklaFn = fn;
      const t = (b) => (fn ? () => tiklaFn?.(b) : null);
      igneler.push(
        S.igne(noktalar.dis, "Dış zar", { renk: "#9be38f", tik: t("dis") }),
        S.igne(noktalar.ic, "İç zar", { renk: "#6fc96a", tik: t("ic"), yon: "alt" }),
        S.igne(noktalar.tilakoit, "Tilakoit (granum)", { renk: "#3fd060", tik: t("tilakoit") }),
        S.igne(noktalar.stroma, "Stroma", { renk: "#cfe3ff", tik: t("stroma"), yon: "alt" }),
        S.igne(noktalar.calvin, "Calvin döngüsü", { renk: "#b89cff", tik: t("stroma") }),
      );
    },
    igneleriKaldir() { igneler.splice(0).forEach((n) => n.kaldir()); tiklaFn = null; },
    kare(dt) {
      uret(dt);
      calvin.rotation.z -= dt * 2.2 * this.calvinHizi;
      for (let i = akislar.length - 1; i >= 0; i--) {
        const a = akislar[i];
        a.t += dt / a.sure;
        if (a.t >= 1) { a.m.visible = false; grup.remove(a.m); havuz.push(a.m); akislar.splice(i, 1); continue; }
        const k = a.t;
        a.m.position.lerpVectors(a.bas, a.son, k).addScaledVector(a.egri, Math.sin(Math.PI * k));
        a.m.material.opacity = Math.min(1, (1 - k) * 4);
      }
    },
  };
}

/* ---------------- ¹⁸O izotop tezgâhı ---------------- */
function izotopYap() {
  const grup = new THREE.Group();
  // [tür, başlangıç x,y, bitiş x,y, kaynak] — 2B şemanın koordinatları (x: 100–640, y: 105–320)
  const AT = [
    ["O", 110, 120, 560, 120, "co2"], ["C", 150, 120, 600, 120, "co2"], ["O", 190, 120, 570, 300, "co2"],
    ["O", 130, 215, 560, 215, "su"], ["H", 105, 235, 640, 105, "su"], ["H", 155, 235, 640, 140, "su"],
    ["O", 130, 300, 600, 215, "su"], ["H", 105, 320, 535, 320, "su"], ["H", 155, 320, 605, 320, "su"],
  ];
  const X = (x) => (x - 370) / 34, Y = (y) => (215 - y) / 34;
  const isaretliM = new THREE.MeshPhysicalMaterial({ color: "#ff2a2a", emissive: "#ff2a2a", emissiveIntensity: 0.5, roughness: 0.25, clearcoat: 1 });
  const atomlar = AT.map(([t, x0, y0, x1, y1, kaynak]) => {
    const m = atom(t, v(X(x0), Y(y0), 0));
    m.scale.setScalar(t === "H" ? 0.3 : 0.48);
    m.userData = { tur: t, bas: v(X(x0), Y(y0), 0), son: v(X(x1), Y(y1), 0), kaynak };
    grup.add(m);
    return m;
  });
  const etiket = (m, x, y, renkH = "#dfe7f2") => { const e = yaziEtiketi(m, { boyut: 0.5, renk: renkH }); e.position.set(X(x), Y(y) + 0.75, 0); grup.add(e); return e; };
  const girenler = [etiket("CO₂", 150, 160), etiket("H₂O", 130, 265), etiket("H₂O", 130, 350)];
  const urunler = [etiket("(CH₂O)", 600, 160), etiket("O₂", 580, 255), etiket("H₂O", 570, 350)];
  const ok = vektorOku(0xffe066); ok.userData.ayarla(5); ok.position.set(X(275), Y(210), 0); ok.scale.setScalar(0.6);
  const okYazi = yaziEtiketi("ışık + klorofil", { boyut: 0.45, renk: "#ffe066" }); okYazi.position.set(X(370), Y(185) + 0.3, 0);
  const baslik1 = yaziEtiketi("Girenler", { boyut: 0.55 }); baslik1.position.set(X(140), Y(60), 0);
  const baslik2 = yaziEtiketi("Ürünler", { boyut: 0.55 }); baslik2.position.set(X(590), Y(60), 0);
  grup.add(ok, okYazi, baslik1, baslik2);
  let anim = 0, oynuyor = false, isaretli = null, bitti = null, basT = 0;
  return {
    grup,
    get oynuyor() { return oynuyor; },
    baslat(kaynak, cb) {
      isaretli = kaynak; anim = 0; oynuyor = true; bitti = cb; basT = performance.now();
      for (const m of atomlar) m.material = m.userData.tur === "O" && m.userData.kaynak === kaynak ? isaretliM : atomMalzemesi(m.userData.tur);
    },
    sifirla() { anim = 0; oynuyor = false; isaretli = null; for (const m of atomlar) { m.material = atomMalzemesi(m.userData.tur); m.position.copy(m.userData.bas); } },
    kare(dt, t) {
      // gerçek zamana bağlı: yavaş ekran kartlarında da 1,7 s sürer
      if (oynuyor) { anim = Math.min(1, (performance.now() - basT) / 1700); if (anim >= 1) { oynuyor = false; bitti?.(); } }
      const e = anim < 0.5 ? 2 * anim * anim : 1 - (-2 * anim + 2) ** 2 / 2;
      for (const m of atomlar) {
        m.position.lerpVectors(m.userData.bas, m.userData.son, e);
        m.position.z = Math.sin(Math.PI * e) * (m.userData.kaynak === "su" ? 1.2 : -1.2);
      }
      for (const g of girenler) g.material.opacity = anim > 0.5 ? 0.3 : 1;
      for (const u of urunler) u.material.opacity = anim > 0.5 ? 1 : 0.3;
      void t; void isaretli;
    },
  };
}

/* ---------------- Hücre ortamı (sitoplazma) ---------------- */
export function hucreKur(S) {
  const ortam = new THREE.Group();
  const r = rastgele(17);
  // uzakta mitokondriler (kristalı kapsül), hücre iskeleti lifleri, proteinler
  const mitoM = new THREE.MeshPhysicalMaterial({ color: "#e48f7a", roughness: 0.5, sheen: 0.8, sheenColor: 0xffd0c0, clearcoat: 0.3 });
  for (let i = 0; i < 6; i++) {
    const g = organiklestir(new THREE.CapsuleGeometry(1.4, 3.6, 8, 24), { genlik: 0.18, olcek: 0.7, tohum: i + 3 });
    const m = new THREE.Mesh(g, mitoM);
    m.position.set((r() - 0.5) * 70, (r() - 0.5) * 30, -22 - r() * 30);
    m.rotation.set(r() * 3, r() * 3, r() * 3);
    ortam.add(m);
  }
  const lifM = new THREE.MeshPhysicalMaterial({ color: "#9ec3e6", roughness: 0.4, transparent: true, opacity: 0.55, sheen: 0.5 });
  for (let i = 0; i < 26; i++) {
    const a = v((r() - 0.5) * 90, (r() - 0.5) * 50, -10 - r() * 40), b = v((r() - 0.5) * 90, (r() - 0.5) * 50, -10 - r() * 40);
    const egri = new THREE.CatmullRomCurve3([a, a.clone().lerp(b, 0.33).add(v((r() - 0.5) * 8, (r() - 0.5) * 8, 0)), a.clone().lerp(b, 0.66).add(v((r() - 0.5) * 8, (r() - 0.5) * 8, 0)), b]);
    ortam.add(new THREE.Mesh(new THREE.TubeGeometry(egri, 30, 0.12 + r() * 0.1, 6), lifM));
  }
  const prot = coklu(organiklestir(new THREE.IcosahedronGeometry(0.25, 1), { genlik: 0.05, olcek: 4 }), new THREE.MeshStandardMaterial({ color: "#8fa6c9", roughness: 0.6 }), 900);
  for (let i = 0; i < 900; i++) prot.userData.yerlestir(i, (r() - 0.5) * 80, (r() - 0.5) * 44, -4 - r() * 50, 0.4 + r() * 1.2, r() * 6, r() * 6);
  prot.userData.bitir();
  ortam.add(prot);
  const isik = new THREE.PointLight(0xbfd8ff, 60, 60); isik.position.set(8, 10, 12);
  ortam.add(isik);

  const atp = atpYap(S), kp = kloroplastYap(S), izotop = izotopYap();
  izotop.grup.position.set(0, 8.2, 1.5);
  ortam.add(atp.grup, kp.grup, izotop.grup);
  let goster = null, zaman = 0;
  return {
    grup: ortam, atp, kp, izotop,
    /** "atp" | "kloroplast" | "kanit" */
    sec(ad) {
      goster = ad;
      atp.grup.visible = ad === "atp";
      kp.grup.visible = ad === "kloroplast" || ad === "kanit";
      izotop.grup.visible = ad === "kanit";
      kp.temizle(); kp.akis({ isik: 0, su: 0, o2: 0, atp: 0, co2: 0, glikoz: 0 }); kp.calvinHizi = 0;
      atp.igneleriKaldir(); kp.igneleriKaldir();
      if (ad !== "kanit") izotop.sifirla();
    },
    kare(dt) {
      zaman += dt;
      prot.rotation.y = Math.sin(zaman * 0.05) * 0.05;
      if (goster === "atp") atp.kare(dt, zaman);
      if (goster === "kloroplast" || goster === "kanit") kp.kare(dt);
      if (goster === "kanit") izotop.kare(dt, zaman);
    },
  };
}
export { boya, renk };
