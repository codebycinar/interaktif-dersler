// Laboratuvar masası istasyonları (1 birim = 10 cm): Engelmann tayf deneyi, Priestley fanusu, Elodea kabarcık deneyi
import { THREE, rastgele, malzeme, yaziEtiketi, coklu, organiklestir } from "../../../../engine/sahne3d.js";
import { laboratuvar, beherGeo, fanusGeo, saksi, nane, elodea, doku, boya, birlestir } from "./dogal.js";
import { dalgaRengi, eylemSpektrumu, yaprakSogurma, ISIK_RENKLERI } from "./model.js";

const v = (x, y, z = 0) => new THREE.Vector3(x, y, z);
/** İçinde saydam nesne (su, alev, kabarcık) olan kaplar için cam: transmission yok, yansıma ve parlaklık var */
export function camSaydam({ opaklik = 0.16, renk = 0xffffff } = {}) {
  return new THREE.MeshPhysicalMaterial({ color: renk, roughness: 0.04, metalness: 0, transparent: true, opacity: opaklik, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, ior: 1.5, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.6 });
}
function parilti(renkH = "rgba(255,200,110,1)") {
  const t = document.createElement("canvas"); t.width = t.height = 64;
  const c = t.getContext("2d"), g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, renkH); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, 64, 64);
  const d = new THREE.CanvasTexture(t); d.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: d, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, transparent: true }));
}

/* ======================= Engelmann (x = -10) ======================= */
function engelmannYap(S) {
  const g = new THREE.Group();
  g.position.x = -10;
  const r = rastgele(5);
  // Mikroskop tablası ve lam
  const tabla = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.3, 4.4), malzeme.plastik("#24282f", { puruz: 0.5 }));
  tabla.position.y = 0.15; tabla.castShadow = tabla.receiveShadow = true;
  const lam = new THREE.Mesh(new THREE.BoxGeometry(8, 0.08, 2.8), camSaydam({ opaklik: 0.3, renk: 0xe8f4ff }));
  lam.position.y = 0.34;
  const su = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.05, 2.4), new THREE.MeshPhysicalMaterial({ color: "#9fd0ff", transparent: true, opacity: 0.22, roughness: 0.05, clearcoat: 1, depthWrite: false }));
  su.position.y = 0.41;
  const lamel = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.02, 2.3), camSaydam({ opaklik: 0.12 }));
  lamel.position.y = 0.45;
  g.add(tabla, lam, su, lamel);
  // İpliksi alg (Spirogyra benzeri): yan yana silindir hücreler, içinde sarmal kloroplast şeridi
  const HUCRE = 22, L0 = -3.3, L1 = 3.3, boy = (L1 - L0) / HUCRE, R = 0.16, Y = 0.47;
  const duvarlar = [], sarmallar = [], cekirdek = [];
  for (let i = 0; i < HUCRE; i++) {
    const x = L0 + (i + 0.5) * boy;
    const c = new THREE.CapsuleGeometry(R, boy - R * 2 + 0.02, 6, 20); c.rotateZ(Math.PI / 2); c.translate(x, Y, 0);
    duvarlar.push(c);
    const pts = [];
    for (let k = 0; k <= 40; k++) { const t = k / 40, a = t * Math.PI * 2 * 1.6 + i; pts.push(v(x - boy / 2 + 0.03 + t * (boy - 0.06), Y + Math.cos(a) * R * 0.72, Math.sin(a) * R * 0.72)); }
    sarmallar.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.028, 5));
    const ck = new THREE.SphereGeometry(0.045, 10, 8); ck.translate(x, Y, 0); cekirdek.push(ck);
  }
  const duvar = new THREE.Mesh(birlestir(duvarlar), new THREE.MeshPhysicalMaterial({ color: "#bfe8b0", roughness: 0.2, transparent: true, opacity: 0.38, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }));
  const sarmal = new THREE.Mesh(birlestir(sarmallar), new THREE.MeshStandardMaterial({ color: "#2f9a3a", emissive: "#145a1c", emissiveIntensity: 0.4, roughness: 0.5 }));
  const ckM = new THREE.Mesh(birlestir(cekirdek), new THREE.MeshStandardMaterial({ color: "#c9d6a0", roughness: 0.6 }));
  duvar.renderOrder = 2;
  g.add(sarmal, ckM, duvar);
  // Tayf: prizmadan lama inen renkli ışık yelpazesi
  const PRIZMA = v(0, 3.9, 0);
  const yelpaze = new THREE.BufferGeometry();
  const N = 60, poz = [], renkler = [];
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const l0 = 400 + (i / N) * 300, l1 = 400 + ((i + 1) / N) * 300;
    const x0 = L0 + (i / N) * (L1 - L0), x1 = L0 + ((i + 1) / N) * (L1 - L0);
    const ust = (x) => v(PRIZMA.x + x * 0.05, PRIZMA.y - 0.35, 0);
    for (const [p, l] of [[ust(x0 - 0.0), l0], [v(x0, 0.42, -1.1), l0], [v(x1, 0.42, -1.1), l1], [ust(x0), l0], [v(x1, 0.42, -1.1), l1], [ust(x1), l1],
      [ust(x0), l0], [v(x1, 0.42, 1.1), l1], [v(x0, 0.42, 1.1), l0], [ust(x0), l0], [ust(x1), l1], [v(x1, 0.42, 1.1), l1]]) {
      poz.push(p.x, p.y, p.z); c.set(dalgaRengi(l)); renkler.push(c.r, c.g, c.b);
    }
  }
  yelpaze.setAttribute("position", new THREE.Float32BufferAttribute(poz, 3));
  yelpaze.setAttribute("color", new THREE.Float32BufferAttribute(renkler, 3));
  const yelpazeM = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  g.add(new THREE.Mesh(yelpaze, yelpazeM));
  // lamın üstüne düşen renk şeridi
  const serit = new THREE.Mesh(new THREE.PlaneGeometry(L1 - L0, 2.3, N, 1), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  serit.rotation.x = -Math.PI / 2; serit.position.y = 0.43;
  boya(serit.geometry, (x, y, z, col) => col.set(dalgaRengi(400 + ((x - L0) / (L1 - L0)) * 300)));
  g.add(serit);
  // Prizma ve ışık kaynağı
  const ucgen = new THREE.Shape(); ucgen.moveTo(-0.7, -0.4); ucgen.lineTo(0.7, -0.4); ucgen.lineTo(0, 0.8); ucgen.closePath();
  const prizmaG = new THREE.ExtrudeGeometry(ucgen, { depth: 1.4, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }); prizmaG.translate(0, 0, -0.7);
  const prizma = new THREE.Mesh(prizmaG, malzeme.cam({ kalinlik: 1.2 }));
  prizma.position.copy(PRIZMA);
  const tutucu = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.9, 10), malzeme.metal("#9aa3ad"));
  tutucu.position.set(4.2, 1.95, -1.6);
  const kol = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.4, 10), malzeme.metal("#9aa3ad"));
  kol.rotation.z = Math.PI / 2; kol.position.set(2, 3.9, -1.6);
  const kaynak = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.9), malzeme.plastik("#2b3038"));
  kaynak.position.set(-4.4, 4.4, 0); kaynak.rotation.z = -0.12; kaynak.castShadow = true;
  const mercek = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 24), malzeme.isik("#fff6dc", 2));
  mercek.rotation.z = Math.PI / 2; mercek.position.set(-3.66, 4.31, 0);
  const isin = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 3.3, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff6dc, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  isin.rotation.z = Math.PI / 2 - 0.12; isin.position.set(-1.95, 4.12, 0);
  g.add(prizma, tutucu, kol, kaynak, mercek, isin);
  // Bakteriler (oksijen arayan)
  const BN = 240;
  const bakteri = coklu(new THREE.CapsuleGeometry(0.03, 0.08, 3, 8).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#f2f3ee", roughness: 0.5 }), BN);
  bakteri.frustumCulled = false;
  const bk = Array.from({ length: BN }, () => ({ x: L0 + r() * (L1 - L0), z: (r() - 0.5) * 2.1, vx: 0, vz: 0 }));
  g.add(bakteri);
  // Dalga boyu ekseni ve seçili dalga boyu
  for (let l = 400; l <= 700; l += 50) {
    const e = yaziEtiketi(`${l}`, { boyut: 0.3, renk: "#e8eef7", zemin: "rgba(15,23,36,.75)" });
    e.position.set(L0 + ((l - 400) / 300) * (L1 - L0), 0.62, 1.75); g.add(e);
  }
  const nmYazi = yaziEtiketi("nm", { boyut: 0.3, renk: "#a9b6c9", zemin: null }); nmYazi.position.set(L1 + 0.55, 0.62, 1.75); g.add(nmYazi);
  const imlec = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.9, 2.4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }));
  imlec.position.y = 0.85; g.add(imlec);
  const imlecNokta = new THREE.Object3D(); imlecNokta.position.set(0, 1.35, 0); imlec.add(imlecNokta);
  let lambda = 550, calisiyor = false, igneler = [];
  const X = (l) => L0 + ((l - 400) / 300) * (L1 - L0), Lx = (x) => 400 + ((x - L0) / (L1 - L0)) * 300;
  const nokta = (p) => { const o = new THREE.Object3D(); o.position.copy(p); g.add(o); return o; };
  const n = { alg: nokta(v(2.4, 0.7, 0)), prizma: nokta(PRIZMA.clone().add(v(0, 0.9, 0))), kaynak: nokta(v(-4.4, 5.0, 0)), bakteri: nokta(v(-2.4, 0.6, 0.7)) };
  return {
    grup: g,
    gorunum: { konum: [-10, 4.7, 9.6], hedef: [-10, 1.25, 0] },
    /** deney başlayınca lama yaklaşan görünüm (bakteriler seçilebilsin) */
    yakin: { konum: [-10, 8.4, 3.4], hedef: [-10, 0.3, 1.0] },
    gir() {
      igneler = [
        S.igne(n.alg, "İpliksi alg<small>×200 büyütülmüş</small>", { renk: "#5ad38b" }),
        S.igne(n.prizma, "Prizma", { renk: "#cfe3ff" }),
        S.igne(n.kaynak, "Işık kaynağı", { renk: "#ffe066" }),
        S.igne(n.bakteri, "Aerobik bakteriler", { renk: "#e8eef7", yon: "alt" }),
        S.igne(imlecNokta, "", { renk: "#ffffff" }),
      ];
      this.dalga(lambda);
    },
    cik() { igneler.forEach((x) => x.kaldir()); igneler = []; calisiyor = false; },
    dalga(l) {
      lambda = l; imlec.position.x = X(l);
      igneler[4]?.metin(`${l} nm<small>yaprak soğurur %${Math.round(100 * yaprakSogurma(l))}</small>`);
      igneler[4]?.el.style.setProperty("--renk", dalgaRengi(l));
    },
    calistir(b) { calisiyor = b; },
    kare(dt) {
      for (let i = 0; i < BN; i++) {
        const b = bk[i];
        if (calisiyor) {
          const o = (x) => eylemSpektrumu(Lx(Math.max(L0, Math.min(L1, x))));
          const egim = (o(b.x + 0.06) - o(b.x - 0.06)) / 0.12;
          b.vx += (egim * 3.2 + (Math.random() - 0.5) * 1.6) * dt;
          b.vz += (-b.z * 2.4 * o(b.x) + (Math.random() - 0.5) * 1.6) * dt;
          b.vx *= 0.92; b.vz *= 0.92;
        } else { b.vx = (Math.random() - 0.5) * 0.25; b.vz = (Math.random() - 0.5) * 0.25; }
        b.x = Math.max(L0, Math.min(L1, b.x + b.vx * dt)); b.z = Math.max(-1.08, Math.min(1.08, b.z + b.vz * dt));
        bakteri.userData.yerlestir(i, b.x, 0.47 + (Math.abs(b.z) < R ? R + 0.02 : 0), b.z, 1, Math.atan2(-b.vz, b.vx));
      }
      bakteri.userData.bitir();
    },
  };
}

/* ======================= Priestley fanusu (x = 0) ======================= */
function fanusYap(S) {
  const g = new THREE.Group();
  const tahta = new THREE.Mesh(new THREE.CylinderGeometry(2.75, 2.85, 0.22, 64), new THREE.MeshPhysicalMaterial({ color: "#7a5434", roughness: 0.5, clearcoat: 0.4 }));
  tahta.position.y = 0.11; tahta.castShadow = tahta.receiveShadow = true;
  const fanus = new THREE.Mesh(fanusGeo(2.3, 3.7), camSaydam({ opaklik: 0.14 }));
  fanus.position.y = 0.22; fanus.renderOrder = 5;
  g.add(tahta, fanus);
  // Mum: mum gövdesi, eriyen tepe, fitil, alev
  const md = doku("mum");
  const mumG = new THREE.CylinderGeometry(0.28, 0.3, 1.5, 32, 4);
  organiklestir(mumG, { genlik: 0.008, olcek: 6 });
  const mum = new THREE.Mesh(mumG, new THREE.MeshPhysicalMaterial({ map: md.renk, roughness: 0.55, sheen: 0.8, sheenColor: 0xfff1d6, clearcoat: 0.2 }));
  mum.position.set(-0.9, 0.22 + 0.2 + 0.75, 0.3); mum.castShadow = true;
  const tabak = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.2, 32), malzeme.metal("#b08d57", { puruz: 0.35 }));
  tabak.position.set(-0.9, 0.32, 0.3);
  const fitilYol = new THREE.QuadraticBezierCurve3(v(0, 0, 0), v(0, 0.12, 0), v(0.04, 0.2, 0));
  const fitil = new THREE.Mesh(new THREE.TubeGeometry(fitilYol, 6, 0.018, 5), new THREE.MeshStandardMaterial({ color: "#1c1712", roughness: 0.9 }));
  fitil.position.set(-0.9, 1.92, 0.3);
  const alevProf = (en, boy) => { const p = []; for (let i = 0; i <= 16; i++) { const t = i / 16; p.push(new THREE.Vector2(en * Math.sin(Math.PI * t ** 0.65) * (1 - t * 0.4), t * boy)); } return new THREE.LatheGeometry(p, 24); };
  const alevDis = new THREE.Mesh(alevProf(0.11, 0.55), new THREE.MeshBasicMaterial({ color: 0xffa030, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const alevIc = new THREE.Mesh(alevProf(0.05, 0.28), new THREE.MeshBasicMaterial({ color: 0xfff6d0, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const alevMavi = new THREE.Mesh(alevProf(0.06, 0.1), new THREE.MeshBasicMaterial({ color: 0x4f8dff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const alev = new THREE.Group(); alev.add(alevDis, alevIc, alevMavi);
  alev.position.set(-0.86, 2.06, 0.3);
  const halo = parilti("rgba(255,180,80,1)"); halo.scale.set(1.6, 1.6, 1); halo.position.set(-0.86, 2.25, 0.3);
  const mumIsik = new THREE.PointLight(0xffa64d, 0, 12, 2); mumIsik.position.set(-0.86, 2.3, 0.3);
  const duman = coklu(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0x9aa0a8, transparent: true, opacity: 0.25, depthWrite: false }), 24);
  duman.frustumCulled = false;
  g.add(tabak, mum, fitil, alev, halo, mumIsik, duman);
  // Saksıda nane
  const s = saksi({ cap: 1.1, boy: 0.85 }); s.position.set(1.0, 0.22, -0.2);
  const bitki = nane({ boy: 2.1, dal: 4, tohum: 8 }); bitki.position.set(1.0, 0.22 + s.userData.ust, -0.2);
  g.add(s, bitki);
  const nokta = (p) => { const o = new THREE.Object3D(); o.position.copy(p); g.add(o); return o; };
  const n = { fanus: nokta(v(0, 4.6, 0)), mum: nokta(v(-0.9, 1.0, 0.6)), bitki: nokta(v(1.0, 2.4, 0.3)) };
  let alevG = 0, sonmeT = 0, igneler = [], bitkiVar = true;
  const dumanlar = Array.from({ length: 24 }, () => ({ t: Math.random(), x: 0, z: 0 }));
  const yaprakRenk = bitki.userData.yapraklar.material.color;
  return {
    grup: g,
    gorunum: { konum: [0.4, 4.2, 9.6], hedef: [0, 2.0, 0] },
    bitki, saksi: s,
    gir() {
      igneler = [
        S.igne(n.fanus, "Çan fanus", { renk: "#cfe3ff" }),
        S.igne(n.mum, "Mum", { renk: "#ffb547", yon: "sol" }),
        S.igne(n.bitki, "Nane", { renk: "#5ad38b", yon: "sag" }),
      ];
      igneler[2].gizle(!bitkiVar);
    },
    cik() { igneler.forEach((x) => x.kaldir()); igneler = []; },
    fanusIgne: () => igneler[0],
    set alev(a) { if (a < alevG - 0.05 && a < 0.05) sonmeT = 1.5; alevG = a; },
    get alev() { return alevG; },
    bitkiGoster(b) { bitkiVar = b; s.visible = bitki.visible = b; igneler[2]?.gizle(!b); },
    isik(b) { yaprakRenk.set(b ? "#4c9a42" : "#3a7a35"); },
    kare(dt, t) {
      const titre = 1 + Math.sin(t * 23) * 0.06 + Math.sin(t * 37) * 0.04;
      alev.visible = alevG > 0.02;
      alev.scale.set(0.6 + 0.4 * alevG, (0.3 + 0.7 * alevG) * titre, 0.6 + 0.4 * alevG);
      alev.rotation.z = Math.sin(t * 5) * 0.04;
      halo.material.opacity = alevG * (0.8 + 0.2 * titre);
      mumIsik.intensity = alevG * 7 * titre;
      // söndükten sonra fitilden duman yükselir
      sonmeT = Math.max(0, sonmeT - dt * 0.4);
      dumanlar.forEach((d, i) => {
        d.t += dt * 0.35;
        if (d.t > 1) { d.t = 0; d.x = (Math.random() - 0.5) * 0.05; d.z = (Math.random() - 0.5) * 0.05; }
        const vis = sonmeT > 0 && alevG < 0.05;
        const y = 2.1 + d.t * 1.6;
        duman.userData.yerlestir(i, -0.86 + d.x + Math.sin(d.t * 6 + i) * 0.08 * d.t, y, 0.3 + d.z, vis ? 0.5 + d.t * 2.5 : 0);
      });
      duman.material.opacity = 0.2 * sonmeT;
      duman.userData.bitir();
    },
  };
}

/* ======================= Elodea kabarcık deneyi (x = 10) ======================= */
function cetvelDokusu() {
  const t = document.createElement("canvas"); t.width = 1024; t.height = 64;
  const c = t.getContext("2d");
  c.fillStyle = "#e6c98f"; c.fillRect(0, 0, 1024, 64);
  c.fillStyle = "#2a1d10"; c.font = "bold 18px Segoe UI, sans-serif"; c.textAlign = "center";
  for (let mm = 0; mm <= 700; mm += 5) {
    const x = 12 + (mm / 700) * 1000, h = mm % 50 === 0 ? 26 : mm % 10 === 0 ? 16 : 9;
    c.fillRect(x - 1, 0, 2, h);
    if (mm % 100 === 0) c.fillText(String(mm / 10), x, 50);
  }
  const d = new THREE.CanvasTexture(t); d.colorSpace = THREE.SRGBColorSpace; d.anisotropy = 8;
  return d;
}
function kabarcikYap(S) {
  const g = new THREE.Group();
  const BX = 10;
  g.position.x = BX;
  // Beher ve su
  const beher = new THREE.Mesh(beherGeo(1.15, 2.6), camSaydam({ opaklik: 0.16 }));
  beher.renderOrder = 5;
  const suM = new THREE.MeshPhysicalMaterial({ color: "#a8d8ff", roughness: 0.05, transparent: true, opacity: 0.24, clearcoat: 1, depthWrite: false });
  const su = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 2.15, 48, 1, true), suM);
  su.position.y = 0.08 + 1.075;
  const yuzey = new THREE.Mesh(new THREE.CircleGeometry(1.08, 48).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: "#cfeaff", roughness: 0.02, transparent: true, opacity: 0.35, clearcoat: 1, depthWrite: false }));
  yuzey.position.y = 2.23;
  g.add(su, yuzey);
  // Ters huni ve deney tüpü
  const huniProf = [[0.85, 0], [0.8, 0.05], [0.14, 0.75], [0.12, 1.25], [0.1, 1.25], [0.12, 0.75], [0.78, 0.05]].map(([a, b]) => new THREE.Vector2(a, b));
  const huni = new THREE.Mesh(new THREE.LatheGeometry(huniProf, 40), camSaydam({ opaklik: 0.22 }));
  huni.position.y = 0.12;
  const tupBoy = 2.0, tupY = 1.32;
  const tupProf = [[0.15, 0], [0.15, tupBoy - 0.15]];
  for (let i = 1; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; tupProf.push([0.15 * Math.cos(a), tupBoy - 0.15 + 0.15 * Math.sin(a)]); }
  const tup = new THREE.Mesh(new THREE.LatheGeometry(tupProf.map(([a, b]) => new THREE.Vector2(a, b)), 24), camSaydam({ opaklik: 0.22 }));
  tup.position.y = tupY;
  const gaz = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 1, 20), new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: 0.18, roughness: 0.1, depthWrite: false }));
  const tupSu = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 1, 20), suM);
  const kiskac = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 20), malzeme.metal("#8c949e"));
  kiskac.rotation.x = Math.PI / 2; kiskac.position.y = tupY + tupBoy - 0.5;
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 10), malzeme.metal("#8c949e"));
  stand.position.set(1.6, 2.1, -0.9);
  const kol = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.9, 8), malzeme.metal("#8c949e"));
  kol.rotation.z = Math.PI / 2; kol.rotation.y = 0.5; kol.position.set(0.82, tupY + tupBoy - 0.5, -0.45);
  const standTaban = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.9), malzeme.metal("#5b6470", { puruz: 0.5 }));
  standTaban.position.set(1.6, 0.06, -0.9);
  g.add(huni, tup, gaz, tupSu, kiskac, stand, kol, standTaban);
  // Elodea dalları (kesik uç yukarıda, huninin boynunda)
  const dallar = [0, 1, 2].map((i) => {
    const e = elodea({ boy: 1.05 - i * 0.08, tohum: 7 + i });
    e.position.set((i - 1) * 0.18, 0.15, (i % 2 ? 0.12 : -0.1)); e.rotation.y = i * 2;
    g.add(e); return e;
  });
  const uc = v(0, 1.05, 0);
  // Termometre
  const termo = new THREE.Group();
  const cubuk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 16), camSaydam({ opaklik: 0.35 }));
  const hazne = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), new THREE.MeshPhysicalMaterial({ color: "#e0342f", roughness: 0.2, clearcoat: 1 }));
  hazne.position.y = -1.48;
  const sutun = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 10), hazne.material);
  termo.add(cubuk, hazne, sutun);
  termo.position.set(-0.7, 1.75, 0.35); termo.rotation.z = 0.22;
  g.add(termo);
  g.add(beher);
  // Kabarcıklar
  const KN = 140;
  const kabM = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.02, transparent: true, opacity: 0.8, clearcoat: 1, depthWrite: false, emissive: "#9fc6e0", emissiveIntensity: 0.25 });
  const kab = coklu(new THREE.SphereGeometry(1, 12, 8), kabM, KN);
  kab.frustumCulled = false;
  g.add(kab);
  const kabarciklar = [];
  // Lamba (masa lambası) ve ışık konisi
  const lamba = new THREE.Group();
  const taban = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.14, 32), malzeme.metal("#2d333b", { puruz: 0.4 }));
  taban.position.y = 0.07;
  const direk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 10), malzeme.metal("#c9cfd6", { puruz: 0.25 }));
  direk.position.y = 1.07;
  const sapka = new THREE.Mesh(new THREE.LatheGeometry([[0.08, 0], [0.18, 0.05], [0.55, 0.75], [0.6, 0.8]].map(([a, b]) => new THREE.Vector2(a, b)), 32), new THREE.MeshPhysicalMaterial({ color: "#3a5f8a", metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide, clearcoat: 0.6 }));
  sapka.rotation.z = -Math.PI / 2 - 0.08; sapka.position.set(-0.05, 2.03, 0);
  const ampulM = new THREE.MeshStandardMaterial({ color: "#fff6d8", emissive: "#fff6d8", emissiveIntensity: 2.5 });
  const ampul = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), ampulM);
  ampul.position.set(0.45, 2.0, 0);
  const spot = new THREE.SpotLight(0xfff6d8, 40, 14, 0.5, 0.6, 1.4);
  spot.position.set(0.5, 2.0, 0); spot.castShadow = true; spot.shadow.mapSize.set(512, 512);
  const koniM = new THREE.MeshBasicMaterial({ color: 0xfff6d8, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const koni = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.3, 1, 32, 1, true), koniM);
  koni.rotation.z = Math.PI / 2;
  lamba.add(taban, direk, sapka, ampul, spot, koni);
  for (const m of [taban, direk, sapka]) m.castShadow = true;
  const lambaNokta = new THREE.Object3D(); lambaNokta.position.set(-0.1, 2.75, 0); lamba.add(lambaNokta);
  g.add(lamba);
  // Cetvel
  const cetvel = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.05, 0.42), [0, 0, new THREE.MeshStandardMaterial({ map: cetvelDokusu(), roughness: 0.7 }), 0, 0, 0].map((m) => m || new THREE.MeshStandardMaterial({ color: "#d9b97a", roughness: 0.7 })));
  cetvel.position.set(-3.6 + 0.0, 0.025, 1.65); cetvel.receiveShadow = true;
  g.add(cetvel);
  const nokta = (p) => { const o = new THREE.Object3D(); o.position.copy(p); g.add(o); return o; };
  const n = { elodea: nokta(v(0.3, 0.6, 0.6)), tup: nokta(v(0, tupY + tupBoy + 0.1, 0)), termo: nokta(v(-0.95, 3.1, 0.4)) };
  let igneler = [], gazH = 0, son = null;
  return {
    grup: g,
    gorunum: { konum: [7.7, 3.7, 10.2], hedef: [7.7, 0.45, 0] },
    gir() {
      igneler = [
        S.igne(n.elodea, "Elodea<small>su veba otu</small>", { renk: "#5ad38b", yon: "sag" }),
        S.igne(n.tup, "O₂ toplanıyor", { renk: "#cfe3ff" }),
        S.igne(n.termo, "", { renk: "#ff6b6b", yon: "sol" }),
        S.igne(lambaNokta, "", { renk: "#ffe066", yon: "sol" }),
      ];
      if (son) this.ayarla(...son);
    },
    cik() { igneler.forEach((x) => x.kaldir()); igneler = []; },
    /** k: { uzaklik (cm), renk, co2, T }, I: ışık şiddeti (0–1) */
    ayarla(k, I) {
      son = [k, I];
      const uzak = k.uzaklik / 10;
      const x = -1.15 - uzak - 0.45;
      lamba.position.set(x, 0, 0);
      const r = ISIK_RENKLERI[k.renk].renk;
      ampulM.color.set(r); ampulM.emissive.set(r); spot.color.set(r); koniM.color.set(r);
      spot.intensity = 12 + 60 * I; koniM.opacity = 0.05 + 0.18 * I;
      koni.scale.set(1, uzak + 0.2, 1); koni.position.set(0.45 + (uzak + 0.2) / 2 + 0.1, 2.0 - (uzak + 0.2) * 0.04, 0);
      spot.target.position.set(1.15 + uzak + 0.45, 1.0, 0); lamba.add(spot.target);
      const sut = Math.max(0.05, (k.T / 50) * 2.4);
      sutun.scale.y = sut; sutun.position.y = -1.48 + sut / 2;
      suM.color.set(k.T > 35 ? "#b9d4f0" : k.T < 12 ? "#a8cfff" : "#a8d8ff");
      igneler[2]?.metin(`${k.T} °C`);
      igneler[3]?.metin(`Lamba · ${k.uzaklik} cm<small>ışık şiddeti %${Math.round(100 * I)}</small>`);
    },
    /** saniyede üretilecek kabarcık sayısı kadar kabarcık başlat */
    kabarcik(n) { for (let i = 0; i < n; i++) if (kabarciklar.length < KN) kabarciklar.push({ x: (Math.random() - 0.5) * 0.06, z: (Math.random() - 0.5) * 0.06, y: uc.y + Math.random() * 0.05, r: 0.06 + Math.random() * 0.04, v: 0.5 + Math.random() * 0.25 }); },
    gazSifirla() { gazH = 0; },
    kare(dt, t) {
      const ust = tupY + tupBoy - 0.17 - gazH;
      for (let i = kabarciklar.length - 1; i >= 0; i--) {
        const b = kabarciklar[i];
        b.y += b.v * dt;
        if (b.y > 1.2) { b.x *= 0.9; b.z *= 0.9; }
        b.x += Math.sin(t * 7 + i) * 0.002;
        if (b.y > ust) { kabarciklar.splice(i, 1); gazH = Math.min(1.3, gazH + 0.004); }
      }
      for (let i = 0; i < KN; i++) {
        const b = kabarciklar[i];
        if (b) kab.userData.yerlestir(i, b.x, b.y, b.z, b.r); else kab.userData.yerlestir(i, 0, -10, 0, 0);
      }
      kab.userData.bitir();
      const tepe = tupY + tupBoy - 0.15;
      gaz.scale.y = Math.max(0.001, gazH); gaz.position.y = tepe - gazH / 2;
      const suBoy = tepe - gazH - 2.23; tupSu.scale.y = Math.max(0.001, suBoy); tupSu.position.y = 2.23 + suBoy / 2;
      dallar.forEach((d, i) => (d.rotation.z = Math.sin(t * 0.7 + i) * 0.02));
    },
  };
}

/* ======================= Ortam ======================= */
export function labKur(S) {
  const grup = new THREE.Group();
  grup.add(laboratuvar({ en: 36, derin: 12 }));
  const engelmann = engelmannYap(S), fanus = fanusYap(S), kabarcik = kabarcikYap(S);
  grup.add(engelmann.grup, fanus.grup, kabarcik.grup);
  let zaman = 0, aktif = null;
  return {
    grup, engelmann, fanus, kabarcik,
    sec(ad) { aktif = ad; },
    kare(dt) {
      zaman += dt;
      if (aktif === "engelmann") engelmann.kare(dt, zaman);
      if (aktif === "fanus") fanus.kare(dt, zaman);
      if (aktif === "kabarcik") kabarcik.kare(dt, zaman);
    },
  };
}
