// 9. istasyon: domates serası (1 birim = 1 m) — ışık, CO₂ ve sıcaklık bitkilerde görünür
import { THREE, rastgele, malzeme, yuzeyDokusu } from "../../../../engine/sahne3d.js";
import { agac, domatesFidesi, doku, boya, renk } from "./dogal.js";
import { camSaydam } from "./lab.js";

const v = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const UZUN = 10, EN = 6, DUVAR = 2.3, MAHYA = 3.5;

function zeminYap() {
  const g = new THREE.PlaneGeometry(160, 160, 80, 80).rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), d = Math.max(0, Math.hypot(x, z) - 16);
    p.setY(i, Math.sin(x * 0.05) * Math.cos(z * 0.04) * Math.min(1, d / 30) * 4 + Math.max(0, -z - 30) * 0.08);
  }
  g.computeVertexNormals();
  const a = renk("#557f2f"), b = renk("#7a9a40");
  boya(g, (x, y, z, r) => r.copy(a).lerp(b, 0.5 + 0.5 * Math.sin(x * 0.21 + z * 0.13) * Math.cos(z * 0.17)));
  const d = doku("cayir"); d.renk.repeat.set(40, 40);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, map: d.renk, roughness: 0.95 }));
  m.receiveShadow = true;
  return m;
}

export function seraKur(S) {
  const grup = new THREE.Group();
  const r = rastgele(31);
  grup.add(zeminYap());
  // çakıl yol ve beton taban
  const cakil = yuzeyDokusu({ boyut: 256, taban: "#a59d8c", koyu: "#7b7466", acik: "#c9c1ae", olcek: 22, benek: 0.5, tohum: 4 });
  cakil.renk.repeat.set(2, 6);
  const yol = new THREE.Mesh(new THREE.PlaneGeometry(2, 14).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: cakil.renk, roughness: 1 }));
  yol.position.set(-1.5, 0.01, EN / 2 + 7); yol.receiveShadow = true;
  const taban = new THREE.Mesh(new THREE.BoxGeometry(UZUN + 0.4, 0.2, EN + 0.4), new THREE.MeshStandardMaterial({ color: "#9a968e", roughness: 0.9 }));
  taban.position.y = 0.1; taban.receiveShadow = true;
  grup.add(yol, taban);

  /* Çelik iskelet */
  const celik = malzeme.metal("#cfd5dc", { puruz: 0.35 });
  const kiris = (a, b, k = 0.07) => {
    const L = a.distanceTo(b), m = new THREE.Mesh(new THREE.BoxGeometry(k, L, k), celik);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(v(0, 1, 0), b.clone().sub(a).normalize());
    m.castShadow = true; grup.add(m); return m;
  };
  const Y0 = 0.2, x0 = -UZUN / 2, z0 = -EN / 2;
  for (let i = 0; i <= 5; i++) {
    const x = x0 + (i / 5) * UZUN;
    kiris(v(x, Y0, z0), v(x, Y0 + DUVAR, z0)); kiris(v(x, Y0, -z0), v(x, Y0 + DUVAR, -z0));
    kiris(v(x, Y0 + DUVAR, z0), v(x, Y0 + MAHYA, 0)); kiris(v(x, Y0 + DUVAR, -z0), v(x, Y0 + MAHYA, 0));
  }
  for (const z of [z0, -z0]) { kiris(v(x0, Y0 + DUVAR, z), v(-x0, Y0 + DUVAR, z)); kiris(v(x0, Y0 + 0.9, z), v(-x0, Y0 + 0.9, z), 0.05); }
  kiris(v(x0, Y0 + MAHYA, 0), v(-x0, Y0 + MAHYA, 0));
  for (const x of [x0, -x0]) { kiris(v(x, Y0 + 0.9, z0), v(x, Y0 + 0.9, -z0), 0.05); kiris(v(x, Y0, 0.9), v(x, Y0 + DUVAR + 0.45, 0.9), 0.05); }
  /* Cam paneller (içi görünsün diye transmission yok) */
  const camM = camSaydam({ opaklik: 0.1, renk: 0xeef6ff });
  const panel = (w, h, pos, rotY = 0, rotX = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), camM);
    m.position.copy(pos); m.rotation.order = "YXZ"; m.rotation.y = rotY; m.rotation.x = rotX; m.renderOrder = 6;
    grup.add(m); return m;
  };
  const camlar = [
    panel(UZUN, DUVAR, v(0, Y0 + DUVAR / 2, z0)), panel(UZUN, DUVAR, v(0, Y0 + DUVAR / 2, -z0)),
    panel(EN, DUVAR, v(x0, Y0 + DUVAR / 2, 0), Math.PI / 2), panel(EN, DUVAR, v(-x0, Y0 + DUVAR / 2, 0), Math.PI / 2),
  ];
  const egik = Math.hypot(EN / 2, MAHYA - DUVAR), aci = Math.atan2(MAHYA - DUVAR, EN / 2);
  camlar.push(panel(UZUN, egik, v(0, Y0 + (DUVAR + MAHYA) / 2, z0 / 2), 0, -(Math.PI / 2 - aci)), panel(UZUN, egik, v(0, Y0 + (DUVAR + MAHYA) / 2, -z0 / 2), 0, Math.PI / 2 - aci));
  // alın üçgenleri
  const ucgen = new THREE.Shape([new THREE.Vector2(-EN / 2, 0), new THREE.Vector2(EN / 2, 0), new THREE.Vector2(0, MAHYA - DUVAR)]);
  for (const x of [x0, -x0]) { const m = new THREE.Mesh(new THREE.ShapeGeometry(ucgen), camM); m.rotation.y = Math.PI / 2; m.position.set(x, Y0 + DUVAR, 0); m.renderOrder = 6; grup.add(m); camlar.push(m); }

  /* Toprak yataklar ve domatesler */
  const toprak = doku("toprak");
  const yatakM = new THREE.MeshStandardMaterial({ map: toprak.renk, color: "#7a5a3e", roughness: 1 });
  const tahtaM = new THREE.MeshStandardMaterial({ color: "#8a6a48", roughness: 0.8 });
  const bitkiler = [];
  for (const z of [-1.5, 1.5]) {
    const yatak = new THREE.Mesh(new THREE.BoxGeometry(UZUN - 1.4, 0.32, 1.1), yatakM);
    yatak.position.set(0, Y0 + 0.16, z); yatak.receiveShadow = true;
    const kenar = new THREE.Mesh(new THREE.BoxGeometry(UZUN - 1.3, 0.36, 1.2), tahtaM);
    kenar.position.set(0, Y0 + 0.14, z); kenar.scale.set(1, 1, 1);
    grup.add(kenar, yatak);
    for (let i = 0; i < 7; i++) {
      const b = domatesFidesi({ boy: 1.25 + r() * 0.35, tohum: 40 + bitkiler.length });
      b.position.set(-3.6 + i * 1.2 + (r() - 0.5) * 0.15, Y0 + 0.32, z + (r() - 0.5) * 0.2);
      b.rotation.y = r() * 6.28;
      // destek çubuğu
      const cubuk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.7, 5), tahtaM);
      cubuk.position.set(0.06, 0.85, 0.02); b.add(cubuk);
      grup.add(b); bitkiler.push(b);
    }
  }
  // domates malzemeleri her bitkide ayrı; bitkilerin hepsini birlikte güncellemek için topla
  const yaprakMler = bitkiler.map((b) => b.userData.yaprakM), domatesMler = bitkiler.map((b) => b.userData.domatesM);

  /* CO₂ tüpü (manometreli) ve termometre direği */
  const tup = new THREE.Group();
  const govde = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 1.0, 8, 24), new THREE.MeshPhysicalMaterial({ color: "#5a6470", metalness: 0.5, roughness: 0.35, clearcoat: 0.6 }));
  govde.position.y = 0.68; govde.castShadow = true;
  const bant = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.18, 24), new THREE.MeshStandardMaterial({ color: "#d8dde3", roughness: 0.5 }));
  bant.position.y = 0.95;
  const vana = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12), malzeme.metal("#c8a24a"));
  vana.position.y = 1.4;
  const mano = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 24), new THREE.MeshStandardMaterial({ color: "#f2f2ee", roughness: 0.4 }));
  mano.rotation.x = Math.PI / 2; mano.position.set(0, 1.44, 0.07);
  const ibre = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.07, 0.006), new THREE.MeshBasicMaterial({ color: 0xd02020 }));
  ibre.geometry.translate(0, 0.03, 0); ibre.position.set(0, 1.44, 0.095);
  tup.add(govde, bant, vana, mano, ibre);
  tup.position.set(3.9, Y0, 2.55);
  const hortum = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([v(3.9, Y0 + 1.42, 2.55), v(3.6, Y0 + 1.9, 2.3), v(2.6, Y0 + 2.15, 2.4), v(-3.8, Y0 + 2.15, 2.4)]), 40, 0.018, 6), new THREE.MeshStandardMaterial({ color: "#2b2f35", roughness: 0.6 }));
  grup.add(tup, hortum);
  const termo = new THREE.Group();
  const levha = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.03), new THREE.MeshStandardMaterial({ color: "#f3f1ea", roughness: 0.6 }));
  const kilcal = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.56, 8), camSaydam({ opaklik: 0.4 }));
  kilcal.position.z = 0.025;
  const haznM = new THREE.MeshPhysicalMaterial({ color: "#e0342f", roughness: 0.2, clearcoat: 1 });
  const hazne = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), haznM); hazne.position.set(0, -0.29, 0.025);
  const sutun = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 6), haznM); sutun.position.z = 0.025;
  termo.add(levha, kilcal, hazne, sutun);
  termo.position.set(-3.95, Y0 + 1.55, 2.9);
  grup.add(termo);

  /* Çevre: güneş, ağaçlar */
  const gunesKure = new THREE.Mesh(new THREE.SphereGeometry(3.2, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff3c4, toneMapped: false, fog: false }));
  gunesKure.position.set(-40, 26, -80);
  grup.add(gunesKure);
  for (let i = 0; i < 18; i++) {
    const x = -60 + i * 7 + (r() - 0.5) * 4, z = -30 - r() * 14;
    const a = agac({ boy: 7 + r() * 5, tohum: 90 + i, ayrinti: 0 });
    a.position.set(x, 0, z); a.traverse((o) => (o.castShadow = false));
    grup.add(a);
  }
  for (let i = 0; i < 3; i++) { const a = agac({ boy: 6 + r() * 2, tohum: 120 + i }); a.position.set(-12 + i * 11, 0, -12 - r() * 4); grup.add(a); }

  const nokta = (p) => { const o = new THREE.Object3D(); o.position.copy(p); grup.add(o); return o; };
  const n = { baslik: nokta(v(0, Y0 + MAHYA + 0.4, 0)), bitki: nokta(v(-1.2, Y0 + 1.5, 1.5)), co2: nokta(v(3.9, Y0 + 1.6, 2.55)), termo: nokta(v(-3.95, Y0 + 2.0, 2.9)) };
  let igneler = [], k = { isik: 100, co2: 0.5, T: 25 }, h = 1;
  const yaprakAc = renk("#a5a53a"), yaprakKoyu = renk("#2f7a2a"), soluk = renk("#7b8a52");
  return {
    grup,
    gorunum: { konum: [-0.6, 3.3, 13.6], hedef: [0.6, 0.6, 0] },
    golgeKutusu: 12,
    gir() {
      S.gunes.position.set(-20, 26, 16); S.gunes.target.position.set(0, 0, 0);
      igneler = [
        S.igne(n.baslik, "", { renk: "#ffb547" }),
        S.igne(n.bitki, "", { renk: "#5ad38b", yon: "sol" }),
        S.igne(n.co2, "", { renk: "#c9d2de", yon: "sag" }),
        S.igne(n.termo, "", { renk: "#ff6b6b", yon: "sol" }),
      ];
      this.ayarla(k, h);
    },
    cik() { igneler.forEach((x) => x.kaldir()); igneler = []; },
    /** k: { isik (%), co2 (0–1), T (°C) }, hiz: göreli hız 0–1, ad: senaryo adı */
    ayarla(yeni, hiz, ad) {
      k = { ...yeni }; h = Math.max(0, Math.min(1, hiz));
      const I = k.isik / 100;
      S.gunes.intensity = 0.25 + 2.5 * I;
      S.gok.intensity = 0.25 + 0.4 * I;
      S.arkaPlan([renk("#31404f").lerp(renk("#5d97d1"), I), renk("#59616a").lerp(renk("#d7e6f1"), I)]);
      gunesKure.material.color.set(I > 0.3 ? 0xfff3c4 : 0xc9cfd6);
      const stres = Math.max(0, (k.T - 34) / 10);
      for (const m of yaprakMler) m.color.copy(yaprakAc).lerp(yaprakKoyu, h).lerp(soluk, Math.min(1, stres));
      for (const m of domatesMler) m.color.set(h > 0.45 ? "#c8281c" : h > 0.2 ? "#d9792a" : "#7da23a");
      bitkiler.forEach((b) => {
        b.userData.domatesler.forEach((d, i) => d.scale.setScalar(0.03 + 0.055 * h * (0.8 + 0.2 * ((i * 7) % 3))));
        b.rotation.z = stres * 0.12; // sıcakta sarkma
      });
      // soğukta camlar buğulanır
      camM.opacity = k.T < 12 ? 0.26 : 0.1; camM.color.set(k.T < 12 ? 0xf3f8ff : 0xeef6ff);
      ibre.rotation.z = 2.2 - 4.4 * Math.min(1, k.co2);
      const s = Math.max(0.02, (k.T / 50) * 0.5); sutun.scale.y = s; sutun.position.y = -0.27 + s / 2;
      haznM.color.set(k.T > 35 ? "#ff3b3b" : k.T < 15 ? "#3f8fe0" : "#e0342f");
      if (ad) igneler[0]?.metin(ad);
      igneler[1]?.metin(`Domates fideleri<small>fotosentez hızı %${Math.round(100 * h)}</small>`);
      igneler[2]?.metin(`CO₂ tüpü<small>düzey ${k.co2.toFixed(2).replace(".", ",")}</small>`);
      igneler[3]?.metin(`${k.T} °C`);
    },
    kare() {},
  };
}
