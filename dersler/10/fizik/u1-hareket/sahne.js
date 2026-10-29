// Yol sahnesi: iki şeritli düz yol, konum işaretleri, arabalar, zaman izleri, trafik ışığı, bayrak
import { sahne3dKur, yaziEtiketi, vektorOku, THREE } from "../../../../engine/sahne3d.js";

export const YOL = { bas: -250, son: 350, genislik: 10 };
export const SERIT = { A: -2.5, B: 2.5 };
const TEKER_R = 0.36;

function rastgele(tohum) {
  return () => {
    tohum |= 0; tohum = (tohum + 0x6d2b79f5) | 0;
    let t = Math.imul(tohum ^ (tohum >>> 15), 1 | tohum);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function arabaYap(renk) {
  const grup = new THREE.Group();
  const boya = new THREE.MeshStandardMaterial({ color: renk, metalness: 0.35, roughness: 0.45 });
  const cam = new THREE.MeshStandardMaterial({ color: 0x1b2633, metalness: 0.6, roughness: 0.15 });
  const lastik = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const jant = new THREE.MeshStandardMaterial({ color: 0xbfc6d0, metalness: 0.8, roughness: 0.3 });

  const govde = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.8, 1.9), boya);
  govde.position.y = 0.75;
  const kabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.7, 1.7), cam);
  kabin.position.set(-0.25, 1.5, 0);
  const tavan = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 1.72), boya);
  tavan.position.set(-0.3, 1.88, 0);
  for (const m of [govde, kabin, tavan]) { m.castShadow = true; grup.add(m); }

  const far = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xfff3c4, emissiveIntensity: 0.9 });
  const stop = new THREE.MeshStandardMaterial({ color: 0x7a0000, emissive: 0xff2020, emissiveIntensity: 0.2 });
  for (const z of [-0.65, 0.65]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.4), far);
    f.position.set(2.21, 0.85, z);
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.4), stop);
    s.position.set(-2.21, 0.85, z);
    grup.add(f, s);
  }

  const tekerler = [];
  const tekerGeo = new THREE.CylinderGeometry(TEKER_R, TEKER_R, 0.3, 20);
  const jantGeo = new THREE.BoxGeometry(0.5, 0.05, 0.32);
  for (const x of [-1.4, 1.4]) for (const z of [-0.95, 0.95]) {
    const t = new THREE.Group();
    const l = new THREE.Mesh(tekerGeo, lastik);
    l.rotation.x = Math.PI / 2;
    const j = new THREE.Mesh(jantGeo, jant); // dönüşü görünür kılan jant çubuğu
    j.rotation.x = Math.PI / 2;
    t.add(l, j);
    t.position.set(x, TEKER_R, z);
    l.castShadow = true;
    grup.add(t);
    tekerler.push(t);
  }

  const hizOku = vektorOku(0x5ad38b);
  hizOku.position.y = 3.0;
  const ivmeOku = vektorOku(0xff9f43);
  ivmeOku.position.y = 4.1;
  const vEt = yaziEtiketi("v", { boyut: 0.7, renk: "#5ad38b" });
  const aEt = yaziEtiketi("a", { boyut: 0.7, renk: "#ff9f43" });
  vEt.position.set(-0.9, 3.0, 0); aEt.position.set(-0.9, 4.1, 0);
  grup.add(hizOku, ivmeOku, vEt, aEt);

  const arac = {
    grup, x: 0,
    yerlestir(x) {
      const dx = x - arac.x;
      arac.x = x;
      grup.position.x = x;
      for (const t of tekerler) t.rotation.z -= dx / TEKER_R;
    },
    /** v ve a için okları ayarlar; null verilen ok gizlenir */
    oklar({ v = null, a = null } = {}) {
      hizOku.visible = vEt.visible = v !== null;
      ivmeOku.visible = aEt.visible = a !== null;
      if (v !== null) { hizOku.userData.ayarla(v * 0.35); hizOku.visible = Math.abs(v) > 0.05; }
      if (a !== null) { ivmeOku.userData.ayarla(a * 1.2); ivmeOku.visible = Math.abs(a) > 0.01; }
    },
    stopLambasi(acik) { stop.emissiveIntensity = acik ? 1.6 : 0.2; },
  };
  arac.oklar();
  return arac;
}

function trafikIsigiYap() {
  const grup = new THREE.Group();
  const gri = new THREE.MeshStandardMaterial({ color: 0x30363f, roughness: 0.7 });
  const direk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6, 10), gri);
  direk.position.set(0, 3, -6);
  const kol = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 4), gri);
  kol.position.set(0, 5.9, -4);
  const kutu = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 0.8), gri);
  kutu.position.set(-0.3, 5.0, -2.5);
  const lamba = (renk, y) => {
    const m = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: renk, emissiveIntensity: 0 });
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), m);
    k.position.set(-0.62, y, -2.5);
    grup.add(k);
    return m;
  };
  const kirmizi = lamba(0xff2a2a, 5.6);
  const sari = lamba(0xffc400, 5.0);
  const yesil = lamba(0x2dff7a, 4.4);
  const cizgi = new THREE.Mesh(new THREE.PlaneGeometry(0.5, YOL.genislik), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  cizgi.rotation.x = -Math.PI / 2;
  cizgi.position.set(-0.5, 0.03, 0);
  const sayac = yaziEtiketi("—", { boyut: 1.1 });
  sayac.position.set(0, 7.4, -4);
  for (const m of [direk, kol, kutu]) { m.castShadow = true; grup.add(m); }
  grup.add(cizgi, sayac);
  grup.visible = false;
  return {
    grup,
    renk(r) {
      kirmizi.emissiveIntensity = r === "kirmizi" ? 2.2 : 0;
      sari.emissiveIntensity = r === "sari" ? 2.2 : 0;
      yesil.emissiveIntensity = r === "yesil" ? 2.2 : 0;
    },
    yazi(m) { sayac.userData.metniDegistir(m); },
  };
}

function bayrakYap() {
  const grup = new THREE.Group();
  const direk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 8), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
  direk.position.y = 2;
  const sekil = new THREE.Shape();
  sekil.moveTo(0, 0); sekil.lineTo(1.8, -0.55); sekil.lineTo(0, -1.1); sekil.closePath();
  const bez = new THREE.Mesh(new THREE.ShapeGeometry(sekil), new THREE.MeshStandardMaterial({ color: 0xffb547, side: THREE.DoubleSide, emissive: 0xffb547, emissiveIntensity: 0.3 }));
  bez.position.set(0.08, 4, 0);
  grup.add(direk, bez);
  grup.position.z = -5.6;
  grup.visible = false;
  return grup;
}

export function yolSahnesi(kap) {
  const s = sahne3dKur(kap, { kameraKonum: [-6, 15, 30], hedef: [12, 0, 0], arkaPlan: 0x0e1726, sis: [110, 360] });
  const { scene, camera, kontrol } = s;
  const uzunluk = YOL.son - YOL.bas, orta = (YOL.son + YOL.bas) / 2;

  // Zemin ve yol
  const cim = new THREE.Mesh(new THREE.PlaneGeometry(uzunluk + 400, 400), new THREE.MeshStandardMaterial({ color: 0x1f3a26, roughness: 1 }));
  cim.rotation.x = -Math.PI / 2; cim.position.set(orta, -0.02, 0); cim.receiveShadow = true;
  const asfalt = new THREE.Mesh(new THREE.PlaneGeometry(uzunluk, YOL.genislik), new THREE.MeshStandardMaterial({ color: 0x2a2e35, roughness: 0.95 }));
  asfalt.rotation.x = -Math.PI / 2; asfalt.position.set(orta, 0, 0); asfalt.receiveShadow = true;
  scene.add(cim, asfalt);

  const beyaz = new THREE.MeshBasicMaterial({ color: 0xe9edf2 });
  for (const z of [-YOL.genislik / 2 + 0.3, YOL.genislik / 2 - 0.3]) {
    const kenar = new THREE.Mesh(new THREE.PlaneGeometry(uzunluk, 0.15), beyaz);
    kenar.rotation.x = -Math.PI / 2; kenar.position.set(orta, 0.01, z);
    scene.add(kenar);
  }
  const seritSayisi = Math.floor(uzunluk / 6);
  const serit = new THREE.InstancedMesh(new THREE.PlaneGeometry(3, 0.15), beyaz, seritSayisi);
  const m4 = new THREE.Matrix4(), dondur = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
  for (let i = 0; i < seritSayisi; i++) {
    m4.makeTranslation(YOL.bas + i * 6 + 1.5, 0.01, 0).multiply(dondur);
    serit.setMatrixAt(i, m4);
  }
  scene.add(serit);

  // Konum işaretleri: her 10 m'de çizgi + etiket
  const isaretMalz = new THREE.MeshBasicMaterial({ color: 0x9fb3cc, transparent: true, opacity: 0.55 });
  const sifirMalz = new THREE.MeshBasicMaterial({ color: 0xffb547 });
  for (let x = YOL.bas + 50; x <= YOL.son - 10; x += 10) {
    const buyuk = x % 50 === 0;
    const cizgi = new THREE.Mesh(new THREE.PlaneGeometry(buyuk ? 0.25 : 0.12, YOL.genislik - 0.8), x === 0 ? sifirMalz : isaretMalz);
    cizgi.rotation.x = -Math.PI / 2; cizgi.position.set(x, 0.012, 0);
    const et = yaziEtiketi(`${x} m`, { boyut: buyuk ? 1.3 : 0.9, renk: x === 0 ? "#ffb547" : "#dfe7f2" });
    et.position.set(x, buyuk ? 1.3 : 1.0, -YOL.genislik / 2 - 1.6);
    scene.add(cizgi, et);
  }

  // Ağaçlar
  const r = rastgele(7);
  const agacSay = 220;
  const govdeler = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.25, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x5a3e2b }), agacSay);
  const yapraklar = new THREE.InstancedMesh(new THREE.ConeGeometry(1.4, 3.6, 8), new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.9 }), agacSay);
  for (let i = 0; i < agacSay; i++) {
    const x = YOL.bas + r() * uzunluk;
    const z = (r() < 0.5 ? -1 : 1) * (13 + r() * 40);
    const k = 0.7 + r() * 0.8;
    m4.compose(new THREE.Vector3(x, 0.8 * k, z), new THREE.Quaternion(), new THREE.Vector3(k, k, k));
    govdeler.setMatrixAt(i, m4);
    m4.compose(new THREE.Vector3(x, (1.6 + 1.8) * k, z), new THREE.Quaternion(), new THREE.Vector3(k, k, k));
    yapraklar.setMatrixAt(i, m4);
  }
  govdeler.castShadow = yapraklar.castShadow = true;
  scene.add(govdeler, yapraklar);

  // Arabalar
  const A = arabaYap(0xff8a3d);
  A.grup.position.z = SERIT.A;
  const B = arabaYap(0x3d9bff);
  B.grup.position.z = SERIT.B;
  B.grup.visible = false;
  scene.add(A.grup, B.grup);

  const isik = trafikIsigiYap();
  scene.add(isik.grup);
  const bayrak = bayrakYap();
  scene.add(bayrak);

  // Yer değiştirme vektörü (başlangıçtan son konuma)
  const yerOku = vektorOku(0x4fc3f7);
  yerOku.position.set(0, 0.25, SERIT.A - 2.2);
  yerOku.scale.set(1, 0.6, 0.6);
  yerOku.visible = false;
  scene.add(yerOku);

  // Zaman izleri
  const izGrubu = new THREE.Group();
  scene.add(izGrubu);
  const izGeo = new THREE.CircleGeometry(0.42, 20);
  const izMalz = {
    A: new THREE.MeshBasicMaterial({ color: 0xff8a3d }),
    B: new THREE.MeshBasicMaterial({ color: 0x3d9bff }),
  };

  // Kamera takibi: kullanıcının seçtiği bakış açısını koruyarak hedefi kaydırır
  let takipX = null;
  s.herKare((dt) => {
    if (takipX !== null) {
      const fark = (takipX - kontrol.target.x) * Math.min(1, dt * 2.5);
      kontrol.target.x += fark;
      camera.position.x += fark;
    }
    s.gunes.position.x = kontrol.target.x - 40;
    s.gunes.target.position.x = kontrol.target.x;
  });

  const api = {
    ...s, A, B, isik, bayrak,
    takip(x) { takipX = x; },
    kameraya(x, { uzaklik = null } = {}) {
      const fark = x - kontrol.target.x;
      kontrol.target.x += fark; camera.position.x += fark;
      if (uzaklik) {
        const yon = camera.position.clone().sub(kontrol.target).normalize();
        camera.position.copy(kontrol.target).addScaledVector(yon, uzaklik);
      }
      takipX = x;
    },
    izBirak(hangi, x, etiket) {
      const iz = new THREE.Mesh(izGeo, izMalz[hangi]);
      iz.rotation.x = -Math.PI / 2;
      const z = (hangi === "A" ? SERIT.A : SERIT.B) + (hangi === "A" ? -1.55 : 1.55);
      iz.position.set(x, 0.02, z);
      izGrubu.add(iz);
      if (etiket) {
        const et = yaziEtiketi(etiket, { boyut: 0.65, renk: hangi === "A" ? "#ffc39a" : "#a9d2ff" });
        et.position.set(x, 0.55, z + (hangi === "A" ? -0.6 : 0.6));
        izGrubu.add(et);
      }
    },
    izleriTemizle() {
      for (const c of [...izGrubu.children]) {
        izGrubu.remove(c);
        if (c.isSprite) c.material.map.dispose(), c.material.dispose();
      }
    },
    yerDegistirme(x0, x1) {
      if (x0 === null) { yerOku.visible = false; return; }
      yerOku.position.x = x0;
      yerOku.userData.ayarla(x1 - x0);
      yerOku.visible = Math.abs(x1 - x0) > 0.3;
    },
    sifirla() {
      api.izleriTemizle();
      A.yerlestir(0); A.oklar(); A.stopLambasi(false); A.grup.visible = true;
      B.yerlestir(0); B.oklar(); B.stopLambasi(false); B.grup.visible = false;
      isik.grup.visible = false; bayrak.visible = false; yerOku.visible = false;
    },
  };
  return api;
}

/**
 * Simülasyon zamanını ilerletir; kare(t) her karede, saniye(n) her tam saniyede çağrılır.
 */
export function kosu(sahne, { sure, carpan = () => 1, kare, saniye, bitti }) {
  let t = 0, son = 0, aktif = true;
  kare?.(0); saniye?.(0);
  const kaldir = sahne.herKare((dt) => {
    if (!aktif) return;
    t = Math.min(sure, t + dt * carpan());
    while (son + 1 <= t + 1e-9) { son++; kare?.(son); saniye?.(son); }
    kare?.(t);
    if (t >= sure) { aktif = false; kaldir(); bitti?.(); }
  });
  return {
    get t() { return t; },
    get aktif() { return aktif; },
    durdur() { if (aktif) { aktif = false; kaldir(); } },
  };
}
