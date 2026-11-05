// Yazılı senaryoları için yol sahnesine eklenen nesneler: numaralı ağaç dizisi, dronlar,
// S/T/R işaret direkleri, düşüş kulesi, yola devrilmiş ağaç. Her biri kaldir() ile temizlenir.
import { THREE, yaziEtiketi, vektorOku } from "../../../../engine/sahne3d.js";
import { YOL } from "../u1-hareket/sahne.js";

const govdeMalz = new THREE.MeshStandardMaterial({ color: 0x5a3e2b, roughness: 0.9 });
const yaprakMalz = new THREE.MeshStandardMaterial({ color: 0x3f8f4a, roughness: 0.85 });

function agac(olcek = 1) {
  const g = new THREE.Group();
  const govde = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 2.2, 8), govdeMalz);
  govde.position.y = 1.1;
  const taç = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 10), yaprakMalz);
  taç.position.y = 3.2; taç.scale.set(1, 1.15, 1);
  govde.castShadow = taç.castShadow = true;
  g.add(govde, taç); g.scale.setScalar(olcek);
  return g;
}

/** Yol kenarına eşit aralıklı, numaralı ağaçlar: 1. ağaç x=bas'ta */
export function agacDizisi(S, { bas = 0, aralik = 10, sayi = 9, z = -YOL.genislik / 2 - 2.2 } = {}) {
  const grup = new THREE.Group();
  for (let i = 0; i < sayi; i++) {
    const a = agac(1);
    a.position.set(bas + i * aralik, 0, z);
    const et = yaziEtiketi(`${i + 1}. ağaç`, { boyut: 0.85, renk: "#d9f5dd" });
    et.position.set(bas + i * aralik, 5.4, z);
    grup.add(a, et);
  }
  S.scene.add(grup);
  return { grup, kaldir() { S.scene.remove(grup); } };
}

/** Küçük dron: gövde + dört pervane; yerlestir(x) ile x ekseninde uçar, hız oku gösterir */
export function dronYap(S, { renk = 0xff8a3d, z = -2.5, y = 7, ad = "K" } = {}) {
  const grup = new THREE.Group();
  const boya = new THREE.MeshStandardMaterial({ color: renk, metalness: 0.3, roughness: 0.5 });
  const koyu = new THREE.MeshStandardMaterial({ color: 0x222831, roughness: 0.6 });
  const govde = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), boya);
  govde.castShadow = true;
  grup.add(govde);
  const pervaneler = [];
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const kol = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.12), koyu);
    kol.position.set(dx * 0.75, 0.1, dz * 0.75); kol.rotation.y = Math.atan2(dz, dx);
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.14), koyu);
    p.position.set(dx * 1.3, 0.3, dz * 1.3);
    grup.add(kol, p); pervaneler.push(p);
  }
  const ok = vektorOku(0x5ad38b); ok.position.y = 1.4;
  const et = yaziEtiketi(ad, { boyut: 0.9, renk: "#ffffff" }); et.position.set(0, 2.6, 0);
  grup.add(ok, et);
  grup.position.set(0, y, z);
  S.scene.add(grup);
  let x = 0;
  const kaldirKare = S.herKare((dt) => { for (const p of pervaneler) p.rotation.y += dt * 40; });
  return {
    grup, get x() { return x; },
    yerlestir(xx) { x = xx; grup.position.x = xx; },
    hiz(v) { ok.visible = v != null && Math.abs(v) > 0.05; if (v != null) ok.userData.ayarla(v * 0.3); },
    kaldir() { kaldirKare(); S.scene.remove(grup); },
  };
}

/** Yol kenarında harfli işaret direği (S, T, R gibi) */
export function isaretDiregi(S, x, harf, { renk = "#ffd28a" } = {}) {
  const grup = new THREE.Group();
  const direk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
  direk.position.y = 1.6;
  const cizgi = new THREE.Mesh(new THREE.PlaneGeometry(0.2, YOL.genislik), new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0.7 }));
  cizgi.rotation.x = -Math.PI / 2; cizgi.position.set(0, 0.02, YOL.genislik / 2 + 1);
  const et = yaziEtiketi(harf, { boyut: 1.3, renk });
  et.position.y = 3.9;
  grup.add(direk, cizgi, et);
  grup.position.set(x, 0, -YOL.genislik / 2 - 1);
  S.scene.add(grup);
  return { grup, kaldir() { S.scene.remove(grup); } };
}

/** Düşüş kulesi: yolun yanında dikey ray ve kabin; kabin yukseklik(y) ile iner, hız/ivme oku gösterir */
export function kuleYap(S, { x = -40, z = -16, yukseklik = 42 } = {}) {
  const grup = new THREE.Group();
  const celik = new THREE.MeshStandardMaterial({ color: 0x8c96a3, metalness: 0.7, roughness: 0.35 });
  for (const dz of [-1.2, 1.2]) {
    const ray = new THREE.Mesh(new THREE.BoxGeometry(0.35, yukseklik, 0.35), celik);
    ray.position.set(0, yukseklik / 2, dz); ray.castShadow = true;
    grup.add(ray);
  }
  for (let y = 4; y < yukseklik; y += 6) {
    const kiris = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 2.6), celik);
    kiris.position.set(0, y, 0); grup.add(kiris);
  }
  const taban = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.4, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0x3a4250, roughness: 0.8 }));
  taban.position.y = 0.3; grup.add(taban);
  const kabin = new THREE.Group();
  const kutu = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 2.2), new THREE.MeshStandardMaterial({ color: 0xff8a3d, metalness: 0.3, roughness: 0.5 }));
  kutu.castShadow = true;
  const hizOku = vektorOku(0x5ad38b); hizOku.rotation.z = -Math.PI / 2; hizOku.position.set(2.2, 0, 0);
  const ivmeOku = vektorOku(0xff9f43); ivmeOku.rotation.z = -Math.PI / 2; ivmeOku.position.set(3.4, 0, 0);
  const vEt = yaziEtiketi("v", { boyut: 0.7, renk: "#5ad38b" }); vEt.position.set(2.2, 1.6, 0);
  const aEt = yaziEtiketi("a", { boyut: 0.7, renk: "#ff9f43" }); aEt.position.set(3.4, 1.6, 0);
  kabin.add(kutu, hizOku, ivmeOku, vEt, aEt);
  grup.add(kabin);
  // bölge etiketleri
  const bolgeler = [];
  grup.position.set(x, 0, z);
  S.scene.add(grup);
  const izler = new THREE.Group(); grup.add(izler);
  return {
    grup, x, z,
    yukseklik(y) { kabin.position.y = y; },
    /** v ve a: aşağı yön pozitif (soruda olduğu gibi) */
    oklar({ v = null, a = null } = {}) {
      hizOku.visible = vEt.visible = v != null && Math.abs(v) > 0.05;
      ivmeOku.visible = aEt.visible = a != null && Math.abs(a) > 0.01;
      if (v != null) hizOku.userData.ayarla(-v * 0.35);
      if (a != null) ivmeOku.userData.ayarla(-a * 0.8);
    },
    bolge(ad, yUst, yAlt, renk) {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.5, yUst - yAlt), new THREE.MeshBasicMaterial({ color: renk, transparent: true, opacity: 0.5 }));
      b.position.set(-1.9, (yUst + yAlt) / 2, 0); grup.add(b);
      const et = yaziEtiketi(ad, { boyut: 1.1, renk: "#ffffff" }); et.position.set(-3.2, (yUst + yAlt) / 2, 0); grup.add(et);
      bolgeler.push(b, et);
    },
    iz(y, metin) {
      const i = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 0.3), new THREE.MeshBasicMaterial({ color: 0xffd28a }));
      i.position.set(0, y, 1.3); izler.add(i);
      if (metin) { const et = yaziEtiketi(metin, { boyut: 0.7, renk: "#ffd28a" }); et.position.set(4.9, y, 1.3); izler.add(et); }
    },
    izleriTemizle() { izler.clear(); },
    kaldir() { S.scene.remove(grup); },
  };
}

/** Yola devrilmiş ağaç: x konumunda, yolu enine kapatır */
export function devrikAgac(S, x) {
  const grup = new THREE.Group();
  const govde = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, YOL.genislik + 3, 10), govdeMalz);
  govde.rotation.x = Math.PI / 2; govde.position.set(0, 0.45, 0); govde.castShadow = true;
  const tac = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 10), yaprakMalz);
  tac.position.set(0, 1.4, YOL.genislik / 2 + 2.5);
  grup.add(govde, tac);
  grup.position.x = x;
  S.scene.add(grup);
  return { grup, kaldir() { S.scene.remove(grup); } };
}
