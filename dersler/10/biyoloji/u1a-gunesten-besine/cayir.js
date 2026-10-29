// 1. istasyon: çayır — Güneş → ot → tavşan → tilki enerji akışı (1 birim = 1 m)
import { THREE, rastgele } from "../../../../engine/sahne3d.js";
import { arazi, tutamGeo, cimenMalzemesi, agac, tavsan, tilki, renk } from "./dogal.js";

const aciFark = (a, b) => { const d = (a - b) % (Math.PI * 2); return d > Math.PI ? d - Math.PI * 2 : d < -Math.PI ? d + Math.PI * 2 : d; };
const GUNDUZ = [renk("#5d97d1"), renk("#d7e6f1")], GECE = [renk("#04060b"), renk("#111725")];

function parlamaDokusu() {
  const t = document.createElement("canvas"); t.width = t.height = 128;
  const c = t.getContext("2d"), g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,250,220,1)"); g.addColorStop(0.2, "rgba(255,230,150,.55)"); g.addColorStop(1, "rgba(255,200,90,0)");
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  const d = new THREE.CanvasTexture(t); d.colorSpace = THREE.SRGBColorSpace; return d;
}
function bulutDokusu(tohum) {
  const t = document.createElement("canvas"); t.width = 256; t.height = 128;
  const c = t.getContext("2d"), r = rastgele(tohum);
  for (let i = 0; i < 16; i++) {
    const x = 40 + r() * 176, y = 50 + r() * 40, rr = 20 + r() * 30;
    const g = c.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, "rgba(255,255,255,.75)"); g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g; c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill();
  }
  const d = new THREE.CanvasTexture(t); d.colorSpace = THREE.SRGBColorSpace; return d;
}

export function cayirKur(S) {
  const grup = new THREE.Group();
  const r = rastgele(11);
  const { mesh: zemin, yukseklik } = arazi({ tohum: 3 });
  grup.add(zemin);

  /* Çimen: üç farklı tutam biçimi, rastgele sırada (sayı azalınca dağınık biçimde seyrelir) */
  const cimM = cimenMalzemesi();
  const YESILLER = ["#4c8a2a", "#5e9a33", "#6faa3c", "#7fb246", "#558f30"].map(renk), SAMAN = renk("#c9ac62"), KURU = renk("#8a7444");
  const cimler = [0, 1, 2].map((i) => {
    const N = 2600;
    const m = new THREE.InstancedMesh(tutamGeo({ yaprak: 7 + i, boy: 0.2 + i * 0.05, tohum: 5 + i }), cimM, N);
    const kukla = new THREE.Object3D(), taban = [];
    for (let k = 0; k < N; k++) {
      // yakında sık, uzakta seyrek
      const yaricap = 1.5 + Math.pow(r(), 1.6) * 16, a = r() * Math.PI * 2;
      const x = Math.cos(a) * yaricap * 1.3, z = Math.sin(a) * yaricap - 2;
      kukla.position.set(x, yukseklik(x, z) - 0.01, z);
      kukla.rotation.set(0, r() * 6.28, 0);
      kukla.scale.setScalar(0.8 + r() * 0.7);
      kukla.updateMatrix(); m.setMatrixAt(k, kukla.matrix);
      const t = YESILLER[Math.floor(r() * 5)].clone();
      taban.push(t); m.setColorAt(k, t);
    }
    m.userData.taban = taban;
    m.receiveShadow = true;
    grup.add(m);
    return m;
  });
  // Kır çiçekleri (papatya ve düğün çiçeği)
  const cicekG = new THREE.SphereGeometry(0.025, 8, 6).scale(1, 0.4, 1);
  const cicekler = new THREE.InstancedMesh(cicekG, new THREE.MeshStandardMaterial({ roughness: 0.6 }), 260);
  {
    const kukla = new THREE.Object3D(), c = new THREE.Color();
    for (let k = 0; k < 260; k++) {
      const yaricap = 1 + r() * 12, a = r() * Math.PI * 2, x = Math.cos(a) * yaricap * 1.3, z = Math.sin(a) * yaricap - 2;
      kukla.position.set(x, yukseklik(x, z) + 0.17 + r() * 0.08, z); kukla.updateMatrix(); cicekler.setMatrixAt(k, kukla.matrix);
      cicekler.setColorAt(k, c.set(r() < 0.6 ? "#f5f3ea" : "#f2c935"));
    }
  }
  grup.add(cicekler);

  /* Ağaçlar: önde birkaç ayrıntılı, uzakta orman şeridi; kameradan güneşe giden doğrultuda boşluk bırakılır */
  const GUNES_YERI = new THREE.Vector3(-30, 20, -95), KAMERA = [0.6, 10.2];
  const gunesIzi = (z) => KAMERA[0] + (GUNES_YERI.x - KAMERA[0]) * ((KAMERA[1] - z) / (KAMERA[1] - GUNES_YERI.z));
  for (let i = 0; i < 7; i++) {
    const x = -26 + i * 8.5 + (r() - 0.5) * 4, z = -16 - r() * 10, boy = 6 + r() * 4, don = r() * 6;
    if (Math.abs(x - gunesIzi(z)) < 4.5) continue; // güneşin önünü kapatmasın
    const a = agac({ boy, tohum: 20 + i });
    a.position.set(x, yukseklik(x, z) - 0.1, z); a.rotation.y = don;
    grup.add(a);
  }
  for (let i = 0; i < 26; i++) {
    const x = -70 + i * 5.5 + (r() - 0.5) * 3, z = -42 - r() * 12, boy = 8 + r() * 5;
    if (Math.abs(x - gunesIzi(z)) < 5.5) continue;
    const a = agac({ boy, tohum: 60 + i, ayrinti: 0 });
    a.position.set(x, yukseklik(x, z) - 0.2, z);
    a.traverse((o) => (o.castShadow = false));
    grup.add(a);
  }

  /* Güneş, parıltı ve bulutlar */
  const gunesKure = new THREE.Mesh(new THREE.SphereGeometry(3.2, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff3c4, toneMapped: false, fog: false }));
  gunesKure.position.copy(GUNES_YERI);
  const parilti = new THREE.Sprite(new THREE.SpriteMaterial({ map: parlamaDokusu(), blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
  parilti.scale.set(34, 34, 1); parilti.position.copy(GUNES_YERI);
  grup.add(gunesKure, parilti);
  const bulutlar = [];
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: bulutDokusu(i + 1), transparent: true, depthWrite: false, fog: false, opacity: 0.9 }));
    b.scale.set(28 + r() * 20, 12 + r() * 6, 1);
    b.position.set(-70 + i * 24 + r() * 10, 18 + r() * 10, -100 - r() * 20);
    grup.add(b); bulutlar.push(b);
  }

  /* Hayvanlar */
  const tavsanlar = Array.from({ length: 8 }, (_, i) => {
    const t = tavsan();
    const x = (r() - 0.5) * 9, z = -3.2 + (r() - 0.5) * 4;
    t.position.set(x, yukseklik(x, z), z);
    t.userData.durum = { yon: r() * 6.28, bekle: r() * 2, sicra: 0, hiz: 0 };
    t.rotation.y = t.userData.durum.yon;
    grup.add(t); return t;
  });
  const tilkiler = Array.from({ length: 3 }, (_, i) => {
    const f = tilki();
    const x = -4 + i * 4 + (r() - 0.5) * 2, z = -6.5 - r() * 1.5;
    f.position.set(x, yukseklik(x, z), z);
    f.userData.durum = { yon: r() < 0.5 ? 0 : Math.PI, adim: r() * 6, bekle: r() * 3 };
    f.rotation.y = f.userData.durum.yon;
    grup.add(f); return f;
  });

  /* Enerji akışı: bir basamaktan diğerine akan ışıltılı parçacıklar */
  const akisM = new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
  const akis = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), akisM, 3 * 14);
  akis.frustumCulled = false;
  grup.add(akis);
  const ot = new THREE.Vector3(1.2, yukseklik(1.2, 2.2) + 0.2, 2.2);
  const otNoktasi = new THREE.Object3D(); otNoktasi.position.copy(ot); grup.add(otNoktasi);

  let L = 1, oran = { P: 1, H: 1, C: 1 }, igneler = [], zaman = 0;
  const hedefRenk = [new THREE.Color(), new THREE.Color()];

  function gorunurIlk(liste) { return liste.find((o) => o.visible) || liste[0]; }

  function cimenGuncelle() {
    const p = Math.max(0, Math.min(1, oran.P)), c = new THREE.Color();
    for (const m of cimler) {
      m.count = Math.round(m.userData.taban.length * (0.06 + 0.94 * p));
      const kuru = 1 - p;
      for (let k = 0; k < m.count; k++) {
        c.copy(m.userData.taban[k]).lerp(k % 3 ? SAMAN : KURU, Math.min(1, kuru * 1.3));
        m.setColorAt(k, c);
      }
      m.instanceColor.needsUpdate = true;
    }
    cicekler.visible = p > 0.35;
    zemin.material.color.setRGB(1, 1, 1).lerp(new THREE.Color("#b59a6a"), (1 - p) * 0.8);
  }
  function isikGuncelle() {
    S.gunes.intensity = 2.8 * L + 0.02;
    S.gok.intensity = 0.12 + 0.5 * L;
    S.scene.environmentIntensity = 0.12 + 0.6 * L;
    hedefRenk[0].copy(GECE[0]).lerp(GUNDUZ[0], L); hedefRenk[1].copy(GECE[1]).lerp(GUNDUZ[1], L);
    S.arkaPlan([hedefRenk[0].getHex(), hedefRenk[1].getHex()]);
    gunesKure.material.color.set(L > 0.01 ? 0xfff3c4 : 0x2a2f3a).multiplyScalar(L > 0.01 ? 0.6 + 0.6 * L : 1);
    parilti.material.opacity = L;
    for (const b of bulutlar) b.material.opacity = 0.25 + 0.65 * L;
  }
  function iglerGuncelle() {
    if (!igneler.length) return;
    const yuzde = (v) => `${Math.round(100 * v)} %`;
    igneler[0].metin(`Güneş<small>ışık %${Math.round(L * 100)}</small>`);
    igneler[1].metin(`Üretici (ot)<small>${yuzde(oran.P)}</small>`);
    igneler[2].metin(`Otçul (tavşan)<small>${yuzde(oran.H)}</small>`);
    igneler[3].metin(`Etçil (tilki)<small>${yuzde(oran.C)}</small>`);
    igneler[2].el.style.opacity = tavsanlar.some((t) => t.visible) ? 1 : 0.55;
    igneler[3].el.style.opacity = tilkiler.some((t) => t.visible) ? 1 : 0.55;
  }

  /* Hareket */
  const kukla = new THREE.Object3D();
  const bez = (a, b, h, t, v) => { const u = 1 - t; v.set(u * u * a.x + 2 * u * t * (a.x + b.x) / 2 + t * t * b.x, u * u * a.y + 2 * u * t * ((a.y + b.y) / 2 + h) + t * t * b.y, u * u * a.z + 2 * u * t * (a.z + b.z) / 2 + t * t * b.z); return v; };
  const A = new THREE.Vector3(), B = new THREE.Vector3(), V = new THREE.Vector3();
  function kare(dt) {
    zaman += dt;
    cimM.userData.zaman.value = zaman;
    for (const t of tavsanlar) {
      if (!t.visible) continue;
      const d = t.userData.durum, g = t.userData.govde;
      if (d.sicra > 0) {
        d.sicra = Math.max(0, d.sicra - dt * 2.6);
        const k = 1 - d.sicra;
        t.position.x += Math.cos(d.yon) * dt * 1.1; t.position.z -= Math.sin(d.yon) * dt * 1.1;
        g.position.y = Math.sin(Math.PI * k) * 0.12;
        g.rotation.z = Math.sin(Math.PI * 2 * k) * 0.25;
      } else {
        g.position.y = 0; g.rotation.z = 0;
        g.scale.y = 1 + Math.sin(zaman * 9 + t.id) * 0.01; // nefes
        d.bekle -= dt;
        if (d.bekle <= 0) {
          // alanın dışına çıkmasın
          const disari = Math.abs(t.position.x) > 5 || t.position.z > -0.8 || t.position.z < -5.6;
          d.yon = disari ? Math.atan2(t.position.z + 3.2, -t.position.x) + (Math.random() - 0.5) : d.yon + (Math.random() - 0.5) * 1.6;
          d.sicra = 1; d.bekle = 0.6 + Math.random() * 2.2;
        }
      }
      t.rotation.y += aciFark(d.yon, t.rotation.y) * Math.min(1, dt * 8);
      t.position.y = yukseklik(t.position.x, t.position.z);
    }
    for (const f of tilkiler) {
      if (!f.visible) continue;
      const d = f.userData.durum, u = f.userData;
      d.bekle -= dt;
      const yuru = d.bekle < 0;
      if (yuru) {
        d.adim += dt * 6;
        f.position.x += Math.cos(d.yon) * dt * 0.55; f.position.z -= Math.sin(d.yon) * dt * 0.55;
        if (Math.abs(f.position.x) > 7) { d.yon = f.position.x > 0 ? Math.PI : 0; d.bekle = 1.5 + Math.random() * 3; }
        if (d.bekle < -6) d.bekle = 1 + Math.random() * 3;
      }
      u.bacaklar.forEach((b, i) => (b.rotation.z = yuru ? Math.sin(d.adim + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.45 : 0));
      u.govde.position.y = yuru ? Math.abs(Math.sin(d.adim)) * 0.015 : 0;
      f.rotation.y += aciFark(d.yon, f.rotation.y) * Math.min(1, dt * 4);
      f.position.y = yukseklik(f.position.x, f.position.z);
    }
    // enerji akışı
    const halkalar = [
      [gunesKure.position.clone().multiplyScalar(0.18).add(new THREE.Vector3(0, 0, 0)), ot, L, 4],
      [ot, gorunurIlk(tavsanlar).position.clone().add(new THREE.Vector3(0, 0.25, 0)), oran.P * (tavsanlar.some((t) => t.visible) ? 1 : 0), 1.2],
      [gorunurIlk(tavsanlar).position.clone().add(new THREE.Vector3(0, 0.25, 0)), gorunurIlk(tilkiler).position.clone().add(new THREE.Vector3(0, 0.5, 0)), oran.H * (tilkiler.some((t) => t.visible) ? 1 : 0), 1.4],
    ];
    halkalar.forEach(([a, b, v, h], j) => {
      A.copy(a); B.copy(b);
      for (let i = 0; i < 14; i++) {
        const t = ((zaman * 0.35 + i / 14) % 1);
        bez(A, B, h, t, V);
        const s = v > 0.02 ? (0.4 + 1.1 * Math.min(1, v)) * Math.sin(Math.PI * t) : 0;
        kukla.position.copy(V); kukla.scale.setScalar(s); kukla.updateMatrix();
        akis.setMatrixAt(j * 14 + i, kukla.matrix);
      }
    });
    akis.instanceMatrix.needsUpdate = true;
  }

  return {
    grup,
    gorunum: { konum: [0.6, 2.2, 10.2], hedef: [-0.6, 0.75, -2], sis: [30, 140] },
    golgeKutusu: 14,
    gir({ igne = true } = {}) {
      isikGuncelle(); cimenGuncelle();
      S.gunes.position.set(-18, 30, -8); S.gunes.target.position.set(0, 0, -1);
      if (!igne) return;
      igneler = [
        S.igne(gunesKure, "Güneş", { renk: "#ffc93c", no: 1, yon: "alt" }),
        S.igne(otNoktasi, "Üretici (ot)", { renk: "#5ad38b", no: 2 }),
        S.igne(tavsanlar[0], "Otçul (tavşan)", { renk: "#d9c4a3", no: 3 }),
        S.igne(tilkiler[0], "Etçil (tilki)", { renk: "#ff8a3d", no: 4 }),
      ];
      iglerGuncelle();
    },
    cik() { igneler.forEach((n) => n.kaldir()); igneler = []; L = 1; oran = { P: 1, H: 1, C: 1 }; tavsanlar.forEach((t) => (t.visible = true)); tilkiler.forEach((t) => (t.visible = true)); cimenGuncelle(); },
    kare,
    /** L: güneş ışığı (0–1); P, H, C: başlangıca göre biyokütle oranları */
    ayarla({ L: l = L, P = oran.P, H = oran.H, C = oran.C } = {}) {
      const isikDegisti = l !== L, otDegisti = Math.abs(P - oran.P) > 0.004 || P === 1;
      L = l; oran = { P, H, C };
      if (isikDegisti) isikGuncelle();
      if (otDegisti) cimenGuncelle();
      const nT = Math.round(8 * Math.min(1, H)), nF = C > 0.02 ? Math.max(1, Math.round(3 * Math.min(1, C))) : 0;
      tavsanlar.forEach((t, i) => (t.visible = i < nT));
      tilkiler.forEach((t, i) => (t.visible = i < nF));
      // iğneler görünür kalan ilk hayvanı izlesin
      if (igneler.length) {
        const t0 = gorunurIlk(tavsanlar), f0 = gorunurIlk(tilkiler);
        if (igneler[2].hedef !== t0) { igneler[2].kaldir(); igneler[2] = S.igne(t0, "", { renk: "#d9c4a3", no: 3 }); }
        if (igneler[3].hedef !== f0) { igneler[3].kaldir(); igneler[3] = S.igne(f0, "", { renk: "#ff8a3d", no: 4 }); }
        igneler[2].hedef = t0; igneler[3].hedef = f0;
      }
      iglerGuncelle();
    },
    yukseklik,
  };
}
